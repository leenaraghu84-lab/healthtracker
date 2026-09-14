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

// Gemini model IDs move fast — 2.0 Flash was shut down on 1 June 2026, and
// Google has shipped 3.5, 3.6 and 3.7 Flash since. Override with the
// GEMINI_MODEL environment variable when this default goes stale; you won't
// need a code change to do it.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
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

// Pull a JSON object out of a model reply that may carry fences or commentary.
function extractJson(raw) {
  let out = String(raw).replace(/```json/gi, "").replace(/```/g, "").trim();

  const first = out.indexOf("{");
  if (first === -1) return out;

  const last = out.lastIndexOf("}");
  if (last > first) {
    const candidate = out.slice(first, last + 1);
    try { JSON.parse(candidate); return candidate; } catch { /* fall through to repair */ }
  }

  // The reply was cut off. Salvage whatever complete items exist by
  // truncating at the last valid item and closing the structure — a partial
  // meal the user can edit beats an error and a lost photo.
  return repairTruncatedJson(out.slice(first));
}

function repairTruncatedJson(text) {
  // Walk the string tracking depth, ignoring braces inside string literals,
  // and remember the position after the last complete top-level array item.
  let depth = 0, inStr = false, esc = false, lastGoodItemEnd = -1;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;

    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") {
      depth--;
      // Depth 2 closing brace = an object inside the items array.
      if (c === "}" && depth === 2) lastGoodItemEnd = i;
    }
  }

  if (lastGoodItemEnd === -1) return text;

  let repaired = text.slice(0, lastGoodItemEnd + 1);

  // Close whatever remains open.
  depth = 0; inStr = false; esc = false;
  const stack = [];
  for (let i = 0; i < repaired.length; i++) {
    const c = repaired[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else if (c === "}" || c === "]") stack.pop();
  }
  while (stack.length) repaired += stack.pop();

  try { JSON.parse(repaired); return repaired; } catch { return text; }
}

async function callGemini(apiKey, messages, maxTokens) {
  // Auth via the x-goog-api-key header, which is what Google documents and
  // which works for both key formats: legacy Standard keys (AIza...) and the
  // newer Auth keys (AQ.Ab...). The ?key= query parameter is less reliable
  // with Auth keys. Send exactly one credential — passing both this header
  // and an Authorization header returns "Multiple authentication credentials".
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey
  };

  // Model families differ on which generationConfig fields they accept —
  // thinking controls in particular changed name and semantics between
  // Gemini 2.x and 3.x, and some models reject attempts to disable it.
  // Rather than guess, start with the richest config and drop optional
  // fields on INVALID_ARGUMENT until the request is accepted.
  const attempts = [
    // Gemini 3.x names the control thinkingLevel; 2.x used thinkingBudget.
    // Try to minimise thinking first — those tokens count against the output
    // budget and are what truncates the JSON mid-object.
    { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingLevel: "low" } },
    { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: 0 } },
    { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: maxTokens },
    { temperature: 0.2, maxOutputTokens: maxTokens },
    { maxOutputTokens: maxTokens }
  ];

  let res, data;
  for (let i = 0; i < attempts.length; i++) {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: toGemini(messages),
        generationConfig: attempts[i]
      })
    });
    data = await res.json();

    if (res.ok) break;

    const isConfigError =
      res.status === 400 &&
      /invalid argument|unknown name|not supported|unsupported/i.test(data?.error?.message || "");

    // Only a config problem is worth retrying; auth and quota errors are final.
    if (!isConfigError || i === attempts.length - 1) break;
  }

  if (!res.ok) {
    let msg = data?.error?.message || `Gemini request failed (${res.status})`;

    // Translate the common auth failures into something actionable.
    if (res.status === 401 || res.status === 403) {
      msg =
        "Gemini rejected the API key. Check it was copied in full, that the " +
        "Generative Language API is enabled for the project, and that the key " +
        "is not restricted away from it. Original message: " + msg;
    } else if (res.status === 429) {
      msg = "Gemini free-tier quota exceeded. Wait a minute and try again.";
    } else if (res.status === 404) {
      msg =
        `Model "${GEMINI_MODEL}" was not found. Set GEMINI_MODEL to a current ` +
        `model name in your environment variables.`;
    } else if (res.status === 400) {
      // Keep the provider's own wording — it names the offending field,
      // which a generic message would hide.
      msg = `Gemini rejected the request for model "${GEMINI_MODEL}": ${msg}`;
    }

    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  // Gemini 3.x models emit reasoning as separate parts flagged `thought`.
  // Concatenating everything glues that reasoning onto the JSON answer and
  // breaks parsing, so keep only the non-thought parts.
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text)
    .join("");

  const finish = data?.candidates?.[0]?.finishReason;

  if (!text) {
    const err = new Error(
      finish === "SAFETY"
        ? "The image or text was blocked by the provider's safety filters. Try a different photo."
        : `Gemini returned no usable response (${finish || "no content"}).`
    );
    err.status = 502;
    throw err;
  }

  // MAX_TOKENS is no longer fatal — extractJson salvages complete items
  // below, and only a total failure to parse surfaces as an error.

  // Strip markdown fences and isolate the JSON object, in case the model
  // ignores responseMimeType and wraps its answer in prose.
  const cleaned = extractJson(text);

  // Return in the shape the app already expects from Anthropic.
  return [{ type: "text", text: cleaned }];
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

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return res.status(500).json({
      error:
        "No API key configured on the server. Add GEMINI_API_KEY (free tier available) " +
        "or ANTHROPIC_API_KEY in your hosting provider's environment variables, then redeploy."
    });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { messages, max_tokens } = body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Request must include a non-empty 'messages' array." });
    }

    // Reject oversized images before spending a call.
    for (const message of messages) {
      if (!Array.isArray(message.content)) continue;
      for (const block of message.content) {
        if (block?.type === "image" && block.source?.data) {
          const bytes = (block.source.data.length * 3) / 4;
          if (bytes > MAX_IMAGE_BYTES) {
            return res.status(413).json({ error: "Image is too large. Please use an image under 5 MB." });
          }
        }
      }
    }

    // Headroom matters here: on thinking models the reasoning tokens are
    // charged against this budget, so a tight cap truncates the answer.
    const tokens = Math.min(Math.max(Number(max_tokens) || 2000, 2000), 8000);
    const preferGemini = (process.env.PROVIDER || "gemini").toLowerCase() === "gemini";

    let content;
    if (geminiKey && (preferGemini || !anthropicKey)) {
      content = await callGemini(geminiKey, messages, tokens);
    } else {
      content = await callAnthropic(anthropicKey, messages, tokens);
    }

    return res.status(200).json({ content });
  } catch (err) {
    console.error("analyze handler failed:", err);
    return res.status(err.status || 500).json({
      error: err.message || "Analysis failed. Please try again."
    });
  }
}
