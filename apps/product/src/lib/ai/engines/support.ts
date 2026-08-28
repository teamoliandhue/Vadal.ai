/**
 * Support engine — Pillar 7, One-to-One Help.
 *
 * Implements, from the brief:
 *  · "Empathetic conversational intake — the companion listens, asks gentle
 *     clarifying questions, and reflects back what it's hearing, in plain, warm
 *     language rather than clinical phrasing"
 *  · "Need and urgency triage — the companion classifies a conversation into a
 *     rough band ... It never produces a clinical diagnosis or label."
 *  · "Consent-based handoff summary — with the employee's explicit sign-off"
 *  · "Self-serve resource matching"
 *  · "Always-visible crisis resources — regional emergency and crisis-line
 *     contact details are shown on every screen of this pillar, independent of
 *     anything the AI detects, never gated behind a conversation"
 *
 * THE HARD BLOCKER, from the brief's own AI-THROUGHOUT note:
 *   "Legal, HR and a clinical advisor should sign off on the triage thresholds,
 *    the crisis-escalation policy, and the data-access rules before this pillar
 *    goes anywhere near a real employee — treat that review as a hard blocker on
 *    launch, not a fast-follow."
 *
 * So this module will not operate against real users without a signed policy.
 * `assertLaunchable()` throws unless a policy carries a named clinical reviewer,
 * a named legal reviewer and a sign-off date. That makes the blocker structural
 * instead of a line in a document nobody re-reads.
 *
 * Design stance throughout: this AI's job is to LISTEN and HAND OFF. It does not
 * diagnose, does not treat, and never stands between a person and a human.
 */

/* ── the policy that must be signed before launch ──────────────── */

export type EscalationPolicy = {
  /** Who reviewed the triage thresholds clinically. */
  clinicalReviewer: string;
  legalReviewer: string;
  signedOn: string;
  /** Who is contacted on acute risk, configured by the org — never inferred. */
  crisisResponder: { name: string; contact: string } | null;
  /** Whether the org has opted into any third-party notification at all. */
  notifyResponderOnAcuteRisk: boolean;
  region: string;
};

export const UNSIGNED_POLICY: EscalationPolicy = {
  clinicalReviewer: "",
  legalReviewer: "",
  signedOn: "",
  crisisResponder: null,
  notifyResponderOnAcuteRisk: false,
  region: "IN",
};

export function isLaunchable(p: EscalationPolicy): boolean {
  return Boolean(p.clinicalReviewer && p.legalReviewer && p.signedOn);
}

/** Call before exposing this pillar to a real person. Throws by design. */
export function assertLaunchable(p: EscalationPolicy): void {
  if (!isLaunchable(p)) {
    throw new Error(
      "One-to-One Help cannot be enabled: the brief requires clinical, legal and HR sign-off on the triage thresholds and crisis-escalation policy before this pillar reaches a real employee.",
    );
  }
}

/* ── crisis resources — never gated, never AI-dependent ────────── */

export type CrisisResource = { label: string; number: string; hours: string };

/**
 * Shown on EVERY screen of this pillar, independent of anything the AI detects.
 * This function takes no conversation and no risk score on purpose: nothing the
 * model does can hide it, and nothing it fails to detect can withhold it.
 */
export function crisisResources(region: string): CrisisResource[] {
  const byRegion: Record<string, CrisisResource[]> = {
    IN: [
      { label: "Tele-MANAS (national mental health helpline)", number: "14416", hours: "24/7" },
      { label: "Emergency services", number: "112", hours: "24/7" },
    ],
    AE: [{ label: "Emergency services", number: "999", hours: "24/7" }],
    SG: [{ label: "Emergency services", number: "995", hours: "24/7" }],
    UK: [
      { label: "Samaritans", number: "116 123", hours: "24/7" },
      { label: "Emergency services", number: "999", hours: "24/7" },
    ],
    US: [
      { label: "988 Suicide & Crisis Lifeline", number: "988", hours: "24/7" },
      { label: "Emergency services", number: "911", hours: "24/7" },
    ],
  };
  return byRegion[region] ?? byRegion.IN;
}

/* ── triage ────────────────────────────────────────────────────── */

export type UrgencyBand = "self-serve" | "counsellor" | "urgent";

export type Triage = {
  band: UrgencyBand;
  /** What was heard, in ordinary words. Never a condition, never a label. */
  heard: string[];
  /** Plain reason for the band, shown to the person if they ask. */
  why: string;
  /** True only for the acute band. Drives the crisis path, not a diagnosis. */
  acute: boolean;
};

/* Deliberately conservative, and matched as PATTERNS rather than fixed strings.
 *
 * Found by testing: the literal "end my life" did not match "thinking about
 * ENDING my life", so a message expressing suicidal ideation fell through to a
 * document search and was answered with the work-from-home policy. Substring
 * lists cannot express how people actually write about this. Erring toward a
 * human is the cheap mistake here; missing one is not. */
const ACUTE: RegExp[] = [
  // "myself", not "me": "the deadline is killing me" is ordinary work speech and
  // tripping on it would make the whole pillar look broken. Nobody in genuine
  // distress writes "I want to kill me".
  /\b(kill|killing|hurt|hurting|harm|harming)\s+myself\b/i,
  /\b(end|ending|ended)\s+(my|it)\s+(life|all)\b/i,
  /\bend\s+it\s+all\b/i,
  /\bwant(ed|ing)?\s+to\s+(die|disappear|not\s+wake\s+up)\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+here|live|wake\s+up|go\s+on)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\bself[\s-]?harm(ing|ed)?\b/i,
  /\bno\s+(reason|point)\s+(to\s+live|in\s+living|anymore|any\s+more)\b/i,
  /\bbetter\s+off\s+without\s+me\b/i,
  /\b(overdose|overdosing)\b/i,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|do\s+this\s+any\s+more)\b/i,
  // Not "I want it to stop beeping" — a trailing gerund means they mean a thing.
  /\bwant\s+(it|this|the\s+pain)\s+to\s+stop\b(?!\s+\w+ing)/i,
];

const HIGH: RegExp[] = [
  /\bpanic\s+attack/i, /\bbreaking\s+down\b/i, /\bcan'?t\s+cope\b/i,
  /\bcan'?t\s+stop\s+crying\b/i, /\bhopeless(ness)?\b/i, /\bworthless\b/i,
  /\bterrified\b/i, /\babus(e|ed|ive)\b/i, /\bharass(ed|ing|ment)?\b/i,
  /\bthreaten(ed|ing)?\b/i, /\bviolent\b/i, /\bunsafe\s+at\s+home\b/i,
  /\bdrinking\s+too\s+much\b/i,
];

const MODERATE: RegExp[] = [
  /\banxious\b|\banxiety\b/i, /\bdepress(ed|ion|ing)?\b/i, /\bburn(t|ed)\s+out\b/i,
  /\bexhaust(ed|ion)\b/i, /\boverwhelmed\b/i, /\blonely\b|\bloneliness\b/i,
  /\bisolated\b/i, /\bconflict\b/i, /\bbullied\b|\bbullying\b/i,
  /\bmoney\s+worries\b|\bdebt\b/i, /\binsomnia\b|\bcan'?t\s+sleep\b/i,
  /\bstress(ed|ful)?\b/i, /\bstruggling\b/i,
];

const hits = (text: string, patterns: RegExp[]): string[] =>
  patterns.map((re) => text.match(re)?.[0]).filter((m): m is string => Boolean(m));

/**
 * Band a conversation. Never diagnoses.
 *
 * `heard` returns the person's own phrases, not clinical terms — the brief's
 * "reflects back what it's hearing, in plain, warm language rather than clinical
 * phrasing", and the reason there is no "condition" field anywhere in this type.
 */
export function triage(text: string): Triage {
  const acuteHit = hits(text, ACUTE);
  const highHit = hits(text, HIGH);
  const modHit = hits(text, MODERATE);
  const heard = [...acuteHit, ...highHit, ...modHit];

  if (acuteHit.length) {
    return {
      band: "urgent",
      heard,
      why: "You said something that makes me want to get a person to you now, rather than keep talking to me.",
      acute: true,
    };
  }
  if (highHit.length) {
    return {
      band: "counsellor",
      heard,
      why: "This sounds like more than a passing hard week, and talking to someone qualified would help more than anything I can offer.",
      acute: false,
    };
  }
  if (modHit.length >= 2) {
    return {
      band: "counsellor",
      heard,
      why: "A few things are stacking up at once. A conversation with a counsellor is worth having before it builds.",
      acute: false,
    };
  }
  return {
    band: "self-serve",
    heard,
    why: "This sounds like something that might ease with a bit of space or a practical step — but a real person is always one tap away.",
    acute: false,
  };
}

/* ── empathetic intake ─────────────────────────────────────────── */

export type IntakeTurn = {
  /** Reflects back what was heard, before anything else. */
  reflection: string;
  /** One gentle question, never an interrogation. */
  question?: string;
  /** Always present, always visible. */
  humanOption: string;
  crisis: CrisisResource[];
  triage: Triage;
};

export function intake(said: string, region = "IN"): IntakeTurn {
  const t = triage(said);
  const crisis = crisisResources(region);

  if (t.acute) {
    return {
      reflection:
        "Thank you for telling me that. I'm not the right kind of help for this, and I don't want to be the only thing between you and someone who is.",
      humanOption: "Talk to a person now",
      crisis,
      triage: t,
    };
  }

  const reflection =
    t.band === "counsellor"
      ? "That sounds genuinely heavy, and it makes sense that it's wearing on you. Thank you for saying it out loud."
      : "Thanks for telling me. That sounds like a lot to be carrying quietly.";

  const question =
    t.band === "counsellor"
      ? "How long has it been feeling like this?"
      : "What would make the next few days a little easier?";

  return { reflection, question, humanOption: "Talk to a real person", crisis, triage: t };
}

/* ── self-serve resources ──────────────────────────────────────── */

export type Resource = { id: string; title: string; minutes: number; topics: string[]; kind: "exercise" | "guide" | "script" };

export const RESOURCES: Resource[] = [
  { id: "breathe", title: "A 3-minute breathing reset", minutes: 3, topics: ["anxious", "panic", "stress", "overwhelmed"], kind: "exercise" },
  { id: "sleep", title: "Getting back to sleep when your head won't stop", minutes: 5, topics: ["sleep", "insomnia", "stress"], kind: "guide" },
  { id: "conflict", title: "How to open a hard conversation at work", minutes: 6, topics: ["conflict", "manager", "bullied", "harassment"], kind: "script" },
  { id: "money", title: "When money is the thing keeping you up", minutes: 6, topics: ["money worries", "debt", "financial"], kind: "guide" },
  { id: "workload", title: "Saying no when you're already at capacity", minutes: 5, topics: ["overwhelmed", "burnt out", "exhausted", "workload"], kind: "script" },
  { id: "lonely", title: "Feeling disconnected at work", minutes: 4, topics: ["lonely", "isolated"], kind: "guide" },
];

export function matchResources(t: Triage, take = 2): Resource[] {
  // Never offer a self-serve article instead of a human in the acute band.
  if (t.acute) return [];
  const scored = RESOURCES.map((r) => ({
    r,
    score: r.topics.filter((topic) => t.heard.some((h) => h.includes(topic) || topic.includes(h))).length,
  }));
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, take).map((s) => s.r);
}

/* ── consent-based handoff ─────────────────────────────────────── */

export type HandoffSummary = {
  /** What the counsellor sees. Factual, short, in the person's own framing. */
  text: string;
  band: UrgencyBand;
  sharedAt: string;
  /** Recorded for the consent ledger the brief requires. */
  consentGivenFor: string[];
};

/**
 * Build the summary — only with explicit sign-off.
 *
 * The brief's purpose: "so the employee doesn't have to re-explain everything in
 * session one." The constraint: "with the employee's explicit sign-off". So this
 * returns null without consent, rather than building something and hoping the
 * caller checks.
 */
export function buildHandoff(
  conversation: string[],
  t: Triage,
  consent: { granted: boolean; shareWith: string[]; at: string },
): HandoffSummary | null {
  if (!consent.granted || consent.shareWith.length === 0) return null;

  const themes = t.heard.slice(0, 5);
  const opening = conversation[0]?.slice(0, 200) ?? "";
  const text = [
    `In their words: “${opening}”`,
    themes.length ? `Came up: ${themes.join(", ")}.` : "",
    `Urgency band: ${t.band}. This is a routing band, not a diagnosis.`,
    `${conversation.length} message${conversation.length === 1 ? "" : "s"} exchanged before handoff.`,
  ]
    .filter(Boolean)
    .join("\n");

  return { text, band: t.band, sharedAt: consent.at, consentGivenFor: consent.shareWith };
}

/* ── acute escalation ──────────────────────────────────────────── */

export type Escalation = {
  /** Always true in the acute band — resources surface regardless of policy. */
  surfacedCrisisResources: true;
  /** Only when the org configured it AND policy is signed. */
  responderNotified: boolean;
  responder?: { name: string; contact: string };
  note: string;
};

/**
 * Escalate acute risk.
 *
 * The brief's wording is the specification: "per the org's configured policy,
 * can alert a designated emergency contact or crisis responder; this path is
 * human-reviewed policy, not a judgement call left to the model alone."
 *
 * So: crisis resources always surface. Notifying anyone else happens only when a
 * signed policy explicitly configured it. The model never decides who to call.
 */
export function escalate(t: Triage, policy: EscalationPolicy): Escalation {
  if (!t.acute) {
    return { surfacedCrisisResources: true, responderNotified: false, note: "Not an acute band — no escalation." };
  }
  if (!isLaunchable(policy)) {
    return {
      surfacedCrisisResources: true,
      responderNotified: false,
      note: "Crisis resources shown. No responder notified: the escalation policy has not been signed off clinically and legally.",
    };
  }
  if (!policy.notifyResponderOnAcuteRisk || !policy.crisisResponder) {
    return {
      surfacedCrisisResources: true,
      responderNotified: false,
      note: "Crisis resources shown. This workspace has chosen not to notify a third party, so nothing was sent.",
    };
  }
  return {
    surfacedCrisisResources: true,
    responderNotified: true,
    responder: policy.crisisResponder,
    note: `Crisis resources shown and ${policy.crisisResponder.name} alerted, per this workspace's signed escalation policy.`,
  };
}
