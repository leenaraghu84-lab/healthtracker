/**
 * Serverless proxy for the Anthropic Messages API.
 *
 * Runs on Vercel (and Netlify, via the redirect in netlify.toml).
 * The API key stays in the server environment and never reaches the browser.
 *
 * Required environment variable:
 *   ANTHROPIC_API_KEY
 */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB, matches Anthropic's limit

// Very small in-memory rate limiter. Serverless instances are ephemeral, so
// this only throttles bursts hitting the same warm instance. For real
// production traffic use Upstash Redis or your platform's rate limiting.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function rateLimited(ip) {
  const now = Date.now();
  const record = hits.get(ip) || { count: 0, start: now };
  if (now - record.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  record.count += 1;
  hits.set(ip, record);
  return record.count > MAX_PER_WINDOW;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Add it in your hosting provider's environment variables."
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

    // Guard against oversized image payloads before spending an API call.
    for (const message of messages) {
      if (!Array.isArray(message.content)) continue;
      for (const block of message.content) {
        if (block?.type === "image" && block.source?.data) {
          const bytes = (block.source.data.length * 3) / 4;
          if (bytes > MAX_IMAGE_BYTES) {
            return res.status(413).json({
              error: "Image is too large. Please use an image under 5 MB."
            });
          }
        }
      }
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(Number(max_tokens) || 1000, 2000),
        messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Pass through a useful message without leaking key or internals.
      return res.status(upstream.status).json({
        error: data?.error?.message || "The nutrition service returned an error."
      });
    }

    return res.status(200).json({ content: data.content });
  } catch (err) {
    console.error("analyze handler failed:", err);
    return res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}
