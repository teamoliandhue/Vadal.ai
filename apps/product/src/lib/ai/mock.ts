/**
 * The deterministic provider — what answers today, with no API key.
 *
 * It is not a stub around the real thing; it runs the *same* pipeline the real
 * provider will: it retrieves from the org's documents, emits real citations
 * drawn from those documents, refuses when retrieval is weak, and proposes tool
 * calls that the client must confirm. Only the language generation is canned.
 *
 * That is the point of building it this way — everything that makes the feature
 * correct and safe is exercised now, so swapping in a model changes the prose
 * and nothing else.
 */
import { retrieve, toCitations, isGrounded, matchesKeyword } from "./retrieve";
import { TOOLS, toolsFor } from "./tools";
import { departments } from "@/lib/data";
import type { AiChunk, AiProvider, AiRequest } from "./types";
import type { Role } from "@/lib/auth";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fake-stream a finished string so the client's rendering path is the real one. */
async function* streamText(text: string): AsyncGenerator<AiChunk> {
  const tokens = text.split(/(\s+)/);
  for (let i = 0; i < tokens.length; i += 2) {
    yield { type: "text", delta: tokens.slice(i, i + 2).join("") };
    await sleep(14);
  }
}

/* ── intent detection ──────────────────────────────────────────────
   A real model does this implicitly. Keeping it explicit and small here
   means the routing logic is inspectable and testable, and the same
   surface contract holds when the model takes over. */

type Intent =
  | { kind: "launch_pulse"; audience: string; topic: string }
  | { kind: "recognise"; to: string }
  | { kind: "policy" }
  | { kind: "smalltalk" };

function detect(q: string): Intent {
  const low = q.toLowerCase();

  const wantsPulse = /(launch|run|send|start).*(pulse|survey|poll)|quick pulse/.test(low);
  if (wantsPulse) {
    const dept = departments.find((d) => low.includes(d.name.toLowerCase()));
    const lineMatch = low.match(/line\s*\d+|night shift|plant ops/);
    const audience = dept?.name ?? (lineMatch ? titleCase(lineMatch[0]) : "All teams");
    const topicMatch = low.match(/about (?:the )?([a-z0-9 ’'-]{3,40})/);
    return { kind: "launch_pulse", audience, topic: topicMatch ? topicMatch[1].trim() : "how the team is doing" };
  }

  const kudos = low.match(/(?:kudos|recognise|recognize|thank|shout ?out).*?(?:to|for)\s+([a-z]+)/);
  if (kudos) return { kind: "recognise", to: titleCase(kudos[1]) };

  if (/^(hi|hey|hello|thanks|thank you|ok|okay)\b/.test(low.trim())) return { kind: "smalltalk" };
  return { kind: "policy" };
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/* ── question generation for the agentic pulse ──────────────────── */
function pulseQuestions(topic: string): string[] {
  return [
    `How is ${topic} affecting your work right now?`,
    `Do you have what you need to do your job well this week?`,
    `Anything you'd want changed about ${topic}?`,
  ];
}

export const mockProvider: AiProvider = {
  name: "mock",
  available: true,

  async *stream(req: AiRequest): AsyncGenerator<AiChunk> {
    const last = [...req.messages].reverse().find((m) => m.role === "user");
    const q = last?.content ?? "";
    const role = (req.role ?? "employee") as Role;
    const intent = detect(q);

    /* ── agentic: launch a pulse survey ── */
    if (intent.kind === "launch_pulse" && toolsFor(role).some((t) => t.name === "launch_pulse_survey")) {
      // A team-scoped manager can only ever survey their own team. Capped before
      // the trace is written, so the visible reasoning matches what will happen.
      const audience = req.team ?? intent.audience;
      const redirected = Boolean(req.team) && intent.audience !== req.team && intent.audience !== "All teams";

      yield { type: "step", text: "Reading the request" };
      await sleep(320);
      yield { type: "step", text: `Scoping the audience — ${audience}` };
      await sleep(360);
      yield { type: "step", text: "Drafting questions" };
      await sleep(420);

      const args = {
        audience,
        topic: intent.topic,
        questions: pulseQuestions(intent.topic),
        duration: "3 days",
      };
      const def = TOOLS.launch_pulse_survey;

      yield* streamText(
        redirected
          ? `You can only survey **${audience}**, so I've scoped it there rather than ${intent.audience} — ask an HR admin if you need a wider send. Here's a 3-question pulse on ${intent.topic}, open for 3 days. Nothing sends until you confirm.`
          : `Here's a 3-question pulse for **${audience}** on ${intent.topic}. It stays open for 3 days and respects your workspace's quiet hours and survey-fatigue rules. Check it over — nothing sends until you confirm.`,
      );
      yield {
        type: "tool",
        call: {
          id: `tc_${q.length}_${audience.length}`,
          tool: def.name,
          title: def.title,
          summary: def.summarise(args),
          preview: def.preview(args),
          args,
          requiresConfirmation: def.requiresConfirmation,
          undoable: def.undoable,
          state: "proposed",
        },
      };
      yield { type: "followups", items: ["Make it 2 questions", "Send it tomorrow morning instead"] };
      yield { type: "done", grounding: "data" };
      return;
    }

    /* ── agentic: recognition ── */
    if (intent.kind === "recognise" && toolsFor(role).some((t) => t.name === "give_recognition")) {
      yield { type: "step", text: "Finding who you mean" };
      await sleep(300);
      yield { type: "step", text: "Drafting the note" };
      await sleep(360);

      const args = {
        to: intent.to,
        value: "Ownership",
        message: `${intent.to} — thank you for the way you handled this. It made a real difference to the team.`,
      };
      const def = TOOLS.give_recognition;

      yield* streamText(`I've drafted recognition for **${intent.to}**. Edit anything you'd like, then confirm to post it.`);
      yield {
        type: "tool",
        call: {
          id: `tc_kudos_${intent.to}`,
          tool: def.name,
          title: def.title,
          summary: def.summarise(args),
          preview: def.preview(args),
          args,
          requiresConfirmation: def.requiresConfirmation,
          undoable: def.undoable,
          state: "proposed",
        },
      };
      yield { type: "done", grounding: "data" };
      return;
    }

    // Asked for an action this role cannot take — say why. Falling through to a
    // document search would answer "I couldn't find that in your documents",
    // which is true and completely beside the point.
    if (intent.kind === "launch_pulse" || intent.kind === "recognise") {
      yield* streamText(
        intent.kind === "launch_pulse"
          ? "Launching a pulse survey is a manager and HR admin action, so I can't do that from your account. If there's something your team should be asked, tell your manager or the People team — or I can help you word it."
          : "I can't post recognition from your account. Open Recognition and I'll help you word it there.",
      );
      yield { type: "done", grounding: "none" };
      return;
    }

    if (intent.kind === "smalltalk") {
      yield* streamText("I'm here — ask me about a policy, or tell me what you'd like done.");
      yield { type: "followups", items: ["How many paid leaves do I get?", "What's our WFH policy?"] };
      yield { type: "done", grounding: "none" };
      return;
    }

    /* ── grounded policy answer ── */
    yield { type: "step", text: "Searching your company's documents" };
    await sleep(340);

    const passages = retrieve(q);
    if (!isGrounded(passages)) {
      // Refusing is the correct behaviour, not a gap. See retrieve.ts.
      yield { type: "step", text: "No confident match" };
      await sleep(240);
      yield* streamText(
        "I couldn't find that in your company's approved documents, so I'd rather not guess — policy answers are only as good as their source. I've logged the question for the People team. Ask me something else, or raise it with HR directly.",
      );
      if (passages.length) yield { type: "citations", citations: toCitations(passages.slice(0, 2)) };
      yield { type: "done", grounding: "none" };
      return;
    }

    yield { type: "step", text: `Reading ${passages.length} document${passages.length > 1 ? "s" : ""}` };
    await sleep(300);

    const { answers: curated } = await import("@/lib/knowledge");
    const hit = curated.find((a) => a.keywords.some((k) => matchesKeyword(q, k)));
    const text = hit
      ? hit.answer
      : `From ${passages[0].article.title}: ${passages[0].snippet}`;

    yield* streamText(text);
    yield { type: "citations", citations: toCitations(passages) };
    yield {
      type: "followups",
      items: hit ? ["Where is this written down?", "Who approves it?"] : ["Show me the full policy"],
    };
    yield { type: "done", grounding: "grounded" };
  },
};
