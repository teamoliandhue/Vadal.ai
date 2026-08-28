/**
 * Onboarding engine — §2 of the brief.
 *
 * Implements:
 *  · "Conversational onboarding assistant replaces static forms: it asks for
 *     role, team, work location and preferred language, then configures the
 *     person's home screen and default pillar order."
 *  · "Progressive profiling — the assistant asks 2–3 light questions per session
 *     over the first two weeks instead of one long form, and infers the rest
 *     (device type, shift pattern, likely language) from context."
 *  · "Automatic locale and reading-level adaptation, especially for frontline
 *     roles where English fluency and literacy vary widely."
 *
 * And the note that sets the bar:
 *  · "Onboarding is the first proof point of 'AI-native.' The assistant should
 *     feel like a person who already knows the org chart, not a chatbot bolted
 *     onto a form."
 *
 * That last line is why this opens with what it ALREADY knows and asks only what
 * it cannot infer.
 */
import { LANGUAGES, type Language, simplify } from "./text";
import { orderHome, nextProfileQuestions, inferFromContext, type PersonProfile, type HomeSection } from "./personalize";

export type OnboardingStep = {
  /** What the assistant says. */
  say: string;
  /** What it is asking, if anything. */
  ask?: { key: string; prompt: string; choices?: string[]; kind: "choice" | "text" | "language" };
  /** Why this question is worth answering — shown, not hidden. */
  unlocks?: string;
  /** Progress, so a two-week drip has a visible end. */
  progress: { answered: number; total: number };
};

const TOTAL_SIGNALS = 6;

/**
 * The opening turn — leads with what it knows.
 *
 * A form asks your name and team. An assistant that already has the org chart
 * should not: it should confirm and move on. That difference is the whole
 * "first proof point" the brief is describing.
 */
export function openingTurn(p: PersonProfile): OnboardingStep {
  const known = `You're ${p.title} on ${p.team}${p.surface === "frontline" ? ", mostly out on site" : ""}.`;
  const inferred = inferFromContext(p);
  const literacy = inferred.literacy ?? p.literacy;

  return {
    say: simplify(
      `Hi ${p.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — welcome. ${known} I've set things up around that, so you shouldn't have to fill anything in. Two quick questions and we're done.`,
      literacy === "simple" ? "simple" : "standard",
    ),
    ask: { key: "language", prompt: "Which language would you like Vadal in?", choices: [...LANGUAGES], kind: "language" },
    unlocks: "Everything you read, in your language",
    progress: { answered: p.known.length, total: TOTAL_SIGNALS },
  };
}

/** The next 1–2 questions of this session. Never the whole list. */
export function nextTurn(p: PersonProfile, perSession = 2): OnboardingStep | null {
  const pending = nextProfileQuestions(p, perSession);
  if (!pending.length) return null;
  const q = pending[0];
  return {
    say: p.known.length === 0 ? "" : "One more thing, then I'll leave you to it.",
    ask: {
      key: q.key,
      prompt: simplify(q.ask, p.literacy === "simple" ? "simple" : "standard"),
      kind: q.key === "language" ? "language" : q.key === "interests" ? "choice" : "text",
      choices: q.key === "interests" ? ["Safety", "Learning", "Wellbeing", "Team news"] : undefined,
    },
    unlocks: q.unlocks,
    progress: { answered: p.known.length, total: TOTAL_SIGNALS },
  };
}

/** Fold an answer in, and infer whatever else it implies. */
export function applyAnswer(p: PersonProfile, key: string, value: string): PersonProfile {
  const next: PersonProfile = { ...p, known: [...new Set([...p.known, key])] };
  switch (key) {
    case "language":
      next.language = (LANGUAGES as readonly string[]).includes(value) ? (value as Language) : "English";
      break;
    case "interests":
      next.interests = { ...next.interests, [value.toLowerCase()]: 0.9 };
      break;
    case "shift":
      // Inferring literacy from shift is wrong; inferring send-time is not.
      break;
    case "device":
      break;
    case "wellbeing":
      next.known = [...new Set([...next.known, "wellbeing-consent"])];
      break;
  }
  return { ...next, ...inferFromContext(next) };
}

/** What the assistant configured — shown at the end so it is not a black box. */
export type OnboardingOutcome = {
  homeOrder: HomeSection[];
  language: string;
  literacy: "simple" | "standard";
  summary: string;
};

export function completeOnboarding(p: PersonProfile): OnboardingOutcome {
  const homeOrder = orderHome(p);
  return {
    homeOrder,
    language: p.language,
    literacy: p.literacy,
    summary: simplify(
      `Set up: your home starts with ${homeOrder.slice(0, 3).join(", ")}. Everything is in ${p.language}${
        p.literacy === "simple" ? ", written plainly" : ""
      }. You can change any of this later, and I'll ask the odd question over the next couple of weeks rather than all at once.`,
      p.literacy === "simple" ? "simple" : "standard",
    ),
  };
}
