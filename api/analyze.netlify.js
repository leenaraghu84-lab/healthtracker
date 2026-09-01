/**
 * Serverless proxy for nutrition analysis.
 *
 * Supports two providers. Whichever key is present is used:
 *   GEMINI_API_KEY     → Google Gemini (has a free tier)
 *   ANTHROPIC_API_KEY  → Anthropic Claude (paid, ~$0.01–0.02 per photo)
 *
 * If both are set, GEMINI_PROVIDER_PRIORITY decides; default is Gemini,
 * since it's the one with a free quota.
 *
 * The key stays in the server environment and never reaches the browser.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Small in-memory limiter. Serverless instances are ephemeral and parallel,
// so this throttles bursts on a warm instance only — it is not real
// protection. Set a spend cap with your provider as well.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  rec.count += 1;
  hits.set(ip, rec);
  return rec.count > MAX_PER_WINDOW;
}

/**
 * Convert the app's Anthropic-shaped messages into Gemini's format.
 * The app sends: [{ role, content: string | [{type:'text'|'image', ...}] }]
 * Gemini wants:  { contents: [{ role, parts: [{text} | {inline_data}] }] }
 */
function toGemini(messages) {
  return messages.map((m) => {
    const parts = [];
    if (typeof m.content === "string") {
      parts.push({ text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const block of m.content) {
        if (block.type === "text") {
          parts.push({ text: block.text });
        } else if (block.type === "image" && block.source?.data) {
          parts.push({
            inline_data: {
              mime_type: block.source.media_type || "image/jpeg",
              data: block.source.data
            }
          });
        }
      }
    }
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });
}

async function callGemini(apiKey, messages, maxTokens) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: toGemini(messages),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.2,
        // Ask for JSON directly — the app parses the reply as JSON.
        responseMimeType: "application/json"
      }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Gemini request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

  if (!text) {
    // Usually a safety block or an empty candidate list.
    const reason = data?.candidates?.[0]?.finishReason || "no content returned";
    const err = new Error(`Gemini returned no usable response (${reason}).`);
    err.status = 502;
    throw err;
  }

  // Return in the shape the app already expects from Anthropic.
  return [{ type: "text", text }];
}

async function callAnthropic(apiKey, messages, maxTokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: maxTokens, messages })
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Anthropic request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data.content;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed. Use POST." }) };
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "No API key configured. Add GEMINI_API_KEY or ANTHROPIC_API_KEY in Site settings → Environment variables."
      })
    };
  }

  try {
    const { messages, max_tokens } = JSON.parse(event.body || "{}");

    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Request must include a non-empty 'messages' array." }) };
    }

    for (const message of messages) {
      if (!Array.isArray(message.content)) continue;
      for (const block of message.content) {
        if (block?.type === "image" && block.source?.data) {
          const bytes = (block.source.data.length * 3) / 4;
          if (bytes > MAX_IMAGE_BYTES) {
            return { statusCode: 413, body: JSON.stringify({ error: "Image is too large. Please use an image under 5 MB." }) };
          }
        }
      }
    }

    const tokens = Math.min(Number(max_tokens) || 1000, 2000);
    const preferGemini = (process.env.PROVIDER || "gemini").toLowerCase() === "gemini";

    const content = (geminiKey && (preferGemini || !anthropicKey))
      ? await callGemini(geminiKey, messages, tokens)
      : await callAnthropic(anthropicKey, messages, tokens);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    };
  } catch (err) {
    console.error("analyze handler failed:", err);
    return {
      statusCode: err.status || 500,
      body: JSON.stringify({ error: err.message || "Analysis failed. Please try again." })
    };
  }
}
