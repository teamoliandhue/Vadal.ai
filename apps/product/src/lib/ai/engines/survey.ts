/**
 * Survey engine — adaptive questioning and conversational check-ins.
 *
 * Implements, from the brief:
 *  · Pulse — "Adaptive survey length — the next question is chosen based on
 *            prior answers so nobody fills a 20-question form to say
 *            'everything's fine.'"
 *  · Pulse — "Conversational check-ins: instead of a static form, an employee
 *            can just tell the AI Copilot how their day or week went in their own
 *            words — the Copilot asks 1-2 natural follow-up questions, then
 *            converts the exchange into a structured Pulse entry (mood score +
 *            theme tags) for the person to confirm before it's logged."
 *
 * The "for the person to confirm before it's logged" clause is why this returns
 * a draft entry rather than writing one.
 */
import { analyseSentiment, extractThemes, type Theme } from "./text";

/* ── adaptive survey length ────────────────────────────────────── */

export type Question = {
  id: string;
  text: string;
  kind: "scale" | "mood" | "text" | "choice";
  /** Only asked when this holds. */
  when?: (answers: Answers) => boolean;
  choices?: string[];
};

export type Answers = Record<string, number | string>;

/**
 * The bank. Order matters: the opener is always asked, everything after is
 * conditional, so a happy respondent answers two questions and a struggling one
 * answers five — which is the entire point of the feature.
 */
export const QUESTION_BANK: Question[] = [
  { id: "mood", text: "How has this week been?", kind: "mood" },
  {
    id: "workload", text: "How manageable was your workload?", kind: "scale",
    when: (a) => num(a.mood) <= 3,
  },
  {
    id: "blocker", text: "What got in your way most?", kind: "choice",
    choices: ["Workload", "Equipment or tools", "Unclear priorities", "Support from my manager", "Something else"],
    when: (a) => num(a.mood) <= 3 || num(a.workload) <= 2,
  },
  {
    id: "detail", text: "Anything you'd want changed about that?", kind: "text",
    when: (a) => Boolean(a.blocker),
  },
  {
    id: "support", text: "Did you get the support you needed?", kind: "scale",
    when: (a) => num(a.mood) <= 2,
  },
  {
    id: "good", text: "Anything that went well worth sharing?", kind: "text",
    when: (a) => num(a.mood) >= 4,
  },
];

const num = (v: number | string | undefined): number => (typeof v === "number" ? v : 0);

/** The next question, or null when we have enough. */
export function nextQuestion(answers: Answers, bank: Question[] = QUESTION_BANK): Question | null {
  for (const q of bank) {
    if (q.id in answers) continue;
    if (q.when && !q.when(answers)) continue;
    return q;
  }
  return null;
}

/** How many questions this person will actually be asked, given where they are. */
export function remainingCount(answers: Answers, bank: Question[] = QUESTION_BANK): number {
  let n = 0;
  const sim: Answers = { ...answers };
  let q = nextQuestion(sim, bank);
  while (q && n < bank.length) {
    n++;
    // Assume a neutral answer to project the path.
    sim[q.id] = q.kind === "text" ? "" : 3;
    q = nextQuestion(sim, bank);
  }
  return n;
}

/* ── conversational check-in ───────────────────────────────────── */

export type CheckInDraft = {
  /** 1–5, derived from what they said. */
  mood: number;
  themes: Theme[];
  sentiment: number;
  /** What we heard, in their words — shown back before logging. */
  quote: string;
  /** The 1–2 follow-ups the brief asks for, if more is worth knowing. */
  followUps: string[];
  /** Never logged without this being true. */
  needsConfirmation: true;
};

const MOOD_WORDS: [RegExp, number][] = [
  [/\b(great|brilliant|amazing|excellent|fantastic)\b/i, 5],
  [/\b(good|fine|solid|decent|productive|ok|okay)\b/i, 4],
  [/\b(alright|average|mixed|so-so)\b/i, 3],
  [/\b(tough|hard|rough|tiring|busy|stretched)\b/i, 2],
  [/\b(awful|terrible|exhausted|burnt|burned out|overwhelmed|drowning)\b/i, 1],
];

/**
 * Turn "honestly it's been rough, we're two people down on the line" into a
 * structured Pulse entry — as a DRAFT the person confirms.
 */
export function draftCheckIn(said: string): CheckInDraft {
  const sentiment = analyseSentiment(said);
  let mood = 0;
  for (const [re, m] of MOOD_WORDS) if (re.test(said)) { mood = m; break; }
  if (!mood) mood = sentiment.score > 0.25 ? 4 : sentiment.score < -0.25 ? 2 : 3;

  const themes = extractThemes([said], 1);
  const followUps: string[] = [];
  if (mood <= 2 && !themes.length) followUps.push("What's been the hardest part?");
  if (themes.some((t) => t.key === "workload")) followUps.push("Is that this week only, or has it been building?");
  if (themes.some((t) => t.key === "equipment")) followUps.push("Is anything actually broken, or is it more that it's slow?");
  if (mood >= 4 && !themes.length) followUps.push("Anything worth sharing with the team?");

  return {
    mood,
    themes,
    sentiment: sentiment.score,
    quote: said.trim().slice(0, 240),
    followUps: followUps.slice(0, 2),
    needsConfirmation: true,
  };
}

/* ── question generation for a targeted micro-survey ───────────── */

/**
 * Two or three questions about a specific topic.
 * Used by the agentic pulse launch, and by the anomaly responder — which is why
 * it takes a reason as well as a topic.
 */
export function draftMicroSurvey(topic: string, reason?: "anomaly" | "request"): string[] {
  const base = [
    `How is ${topic} affecting your work right now?`,
    `Do you have what you need to do your job well this week?`,
  ];
  if (reason === "anomaly") {
    return [
      `Something seems to have changed recently — how has ${topic} been for you?`,
      `Is there anything getting in your way that we haven't noticed?`,
      `What would make the biggest difference this week?`,
    ];
  }
  return [...base, `Anything you'd want changed about ${topic}?`];
}
