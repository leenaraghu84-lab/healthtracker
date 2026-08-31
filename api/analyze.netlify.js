/**
 * Netlify Functions wrapper.
 *
 * Netlify passes (event, context) and expects { statusCode, body }, whereas
 * Vercel passes (req, res). This adapts the same logic to Netlify's shape.
 *
 * Only needed if deploying to Netlify. Vercel uses api/analyze.js directly.
 * To use: rename this file to api/analyze.js, replacing the Vercel version.
 */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Use POST." })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server is missing ANTHROPIC_API_KEY. Add it in Site settings → Environment variables."
      })
    };
  }

  try {
    const { messages, max_tokens } = JSON.parse(event.body || "{}");

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Request must include a non-empty 'messages' array." })
      };
    }

    for (const message of messages) {
      if (!Array.isArray(message.content)) continue;
      for (const block of message.content) {
        if (block?.type === "image" && block.source?.data) {
          const bytes = (block.source.data.length * 3) / 4;
          if (bytes > MAX_IMAGE_BYTES) {
            return {
              statusCode: 413,
              body: JSON.stringify({ error: "Image is too large. Please use an image under 5 MB." })
            };
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
      return {
        statusCode: upstream.status,
        body: JSON.stringify({
          error: data?.error?.message || "The nutrition service returned an error."
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: data.content })
    };
  } catch (err) {
    console.error("analyze handler failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Analysis failed. Please try again." })
    };
  }
}
