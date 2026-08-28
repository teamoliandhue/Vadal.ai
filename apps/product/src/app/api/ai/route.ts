/**
 * The AI endpoint — streams newline-delimited JSON chunks.
 *
 * It exists now, with no API key, on purpose: the client already talks to a
 * server for its AI, so the day a key is added nothing on the client changes and
 * no secret ever reaches the browser. (The brief's prototype calls the model
 * straight from the page; that is fine for a prototype and wrong for a product.)
 */
import { getProvider } from "@/lib/ai";
import type { AiRequest } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: AiRequest;
  try {
    body = (await request.json()) as AiRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages[] is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const provider = getProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of provider.stream(body)) {
          controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
        }
      } catch (err) {
        // Never leak a stack trace to the client; the person gets a sentence.
        console.error("[ai] stream failed", err);
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message: "Something went wrong answering that." }) + "\n"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-ai-provider": provider.name,
    },
  });
}
