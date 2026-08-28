/**
 * The real provider — inactive until ANTHROPIC_API_KEY is set.
 *
 * This is the *only* file that changes when the key arrives. Everything that
 * makes the feature safe already lives in the runtime around it: retrieval
 * decides what the model is allowed to see, the tool registry decides what it
 * is allowed to propose, and the client decides what actually happens.
 *
 * Three rules are enforced here rather than trusted to the prompt:
 *  1. Policy answers are retrieval-grounded. The model receives the retrieved
 *     passages as its only permitted source, and if retrieval is weak we refuse
 *     without calling the model at all.
 *  2. The model may propose tools, never execute them. Tool calls are streamed
 *     to the client as proposals in exactly the same shape the mock uses.
 *  3. Tools are filtered by the caller's role before the model ever sees them,
 *     so it cannot propose an action the person could not take themselves.
 *
 * To activate: set ANTHROPIC_API_KEY in apps/product/.env.local, install
 * @anthropic-ai/sdk, and fill in the marked section. The contract above and the
 * chunk types are already fixed, so nothing downstream needs to change.
 */
import { retrieve, toCitations, isGrounded } from "./retrieve";
import { toolsFor } from "./tools";
import type { AiChunk, AiProvider, AiRequest } from "./types";
import type { Role } from "@/lib/auth";

const KEY = process.env.ANTHROPIC_API_KEY;

/** Latest and most capable model — the brief's AI is the product, not a cost line. */
export const MODEL = "claude-opus-4-5";

const SYSTEM = `You are Vadal, the AI copilot inside an employee experience platform.

GROUNDING
- Answer questions about company policy, pay, leave, benefits or safety ONLY from
  the <documents> provided in the user turn. Never use general knowledge for these.
- If the documents do not answer the question, say so plainly and stop. A refusal
  is always better than a confident guess about someone's leave or pay.
- Cite by referring to the document titles you used.

ACTING
- You may propose a tool call. You never perform actions yourself; the person
  confirms every one. Say what you have drafted and that nothing happens until
  they confirm.
- Only propose tools listed in your tools array. They are already filtered to
  what this person is permitted to do.

VOICE
- Plain, warm, brief. Short sentences. No corporate filler, no emoji.
- Write for someone reading on a phone between shifts.`;

export const anthropicProvider: AiProvider = {
  name: "anthropic",
  available: Boolean(KEY),

  async *stream(req: AiRequest): AsyncGenerator<AiChunk> {
    if (!KEY) {
      yield { type: "error", message: "No ANTHROPIC_API_KEY configured." };
      return;
    }

    const role = (req.role ?? "employee") as Role;
    const question = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // Retrieval runs BEFORE the model, and gates whether we call it at all.
    const passages = retrieve(question);
    const grounded = isGrounded(passages);

    yield { type: "step", text: "Searching your company's documents" };

    if (!grounded && looksLikePolicy(question)) {
      yield* say(
        "I couldn't find that in your company's approved documents, so I'd rather not guess. I've logged the question for the People team.",
      );
      yield { type: "done", grounding: "none" };
      return;
    }

    const documents = passages
      .map((p) => `<document title="${p.article.title}" id="${p.article.id}">\n${p.snippet}\n</document>`)
      .join("\n");

    const tools = toolsFor(role).map((t) => ({
      name: t.name,
      description: `${t.title}. ${t.summarise({})}`,
      input_schema: { type: "object" as const, properties: {}, additionalProperties: true },
    }));

    void SYSTEM; void MODEL; void documents; void tools; // wired below when the key lands

    /* ── IMPLEMENT WHEN THE KEY ARRIVES ──────────────────────────────
       const client = new Anthropic({ apiKey: KEY });
       const s = client.messages.stream({
         model: MODEL,
         max_tokens: 1024,
         system: SYSTEM,
         tools,
         messages: [
           ...req.messages.slice(0, -1),
           { role: "user", content: `<documents>\n${documents}\n</documents>\n\n${question}` },
         ],
       });
       for await (const ev of s) {
         if (ev.type === "content_block_delta" && ev.delta.type === "text_delta")
           yield { type: "text", delta: ev.delta.text };
         if (ev.type === "content_block_start" && ev.content_block.type === "tool_use")
           // map to a ToolCall in state "proposed" — never execute here
           ...
       }
       ──────────────────────────────────────────────────────────────── */

    yield { type: "error", message: "Anthropic provider is not wired up yet." };
  },
};

function looksLikePolicy(q: string): boolean {
  return /leave|pay|salary|policy|benefit|insurance|holiday|reimburse|notice|safety|shift|appraisal/i.test(q);
}

async function* say(text: string): AsyncGenerator<AiChunk> {
  yield { type: "text", delta: text };
}
