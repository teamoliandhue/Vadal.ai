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
  // Reflexive, never the object pronoun: "the deadline is killing me" and "that
  // project is killing him" are ordinary work speech, and tripping on either
  // would make the whole pillar look broken. Nobody says "this is killing
  // himself", so the reflexive is the safe discriminator in every person.
  /\b(kill|kills|killing|hurt|hurts|hurting|harm|harms|harming)\s+(my|him|her|them|our|your)sel(f|ves)\b/i,
  /\b(end|ends|ending|ended)\s+(my|his|her|their|your|it)\s+(life|lives|all)\b/i,
  /\bend(s|ing|ed)?\s+it\s+all\b/i,
  // THIRD PERSON. Found by testing the "worried about a colleague" path: the
  // conjugation "wants" was missing, so "my colleague said he wants to die" was
  // banded self-serve and answered with "what would make the next few days a
  // little easier?". Every expression of intent below is person-agnostic now —
  // most people who report this are reporting somebody else.
  /\bwant(s|ed|ing)?\s+to\s+(die|disappear|not\s+wake\s+up)\b/i,
  /\b(don'?t|doesn'?t|didn'?t)\s+want\s+to\s+(be\s+here|live|wake\s+up|go\s+on)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\bself[\s-]?harm(ing|ed|s)?\b/i,
  /\bno\s+(reason|point)\s+(to\s+live|in\s+living|anymore|any\s+more)\b/i,
  /\bbetter\s+off\s+without\s+(me|him|her|them)\b/i,
  /\b(overdose|overdosing|overdosed)\b/i,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|do\s+this\s+any\s+more)\b/i,
  // Not "I want it to stop beeping" — a trailing gerund means they mean a thing.
  /\bwant(s|ed)?\s+(it|this|the\s+pain)(\s+all)?\s+to\s+stop\b(?!\s+\w+ing)/i,
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

/* ════════════════════════════════════════════════════════════════════
   "I'm worried about someone else"
   ════════════════════════════════════════════════════════════════════
   A large share of the people who open a support screen are not there for
   themselves. Nothing here served them, and worse, the page actively got it
   wrong: triage() reads the text it is given as a first-person account, so
   "my colleague said he wants to die" hit the acute band and answered the
   SPEAKER as though they were the one at risk.

   That is not a cosmetic gap. It fails the person who is actually in danger,
   because the one human who noticed gets told to look after themselves and is
   handed nothing to act on.

   So this is a separate intake. It still detects acuteness — more carefully, if
   anything — but everything it returns is about getting help to the third
   person: what to say, what not to say, who to call, and the one instruction
   that matters most, which is not to leave them alone. */

export type ConcernTurn = {
  reflection: string;
  /** Concrete things to do, in order. Never a script to read out. */
  steps: string[];
  /** What NOT to do — the part people get wrong with the best intentions. */
  avoid: string[];
  crisis: CrisisResource[];
  /** True when the description suggests immediate risk to the other person. */
  urgent: boolean;
  /** Always offered: the worried person may need support of their own. */
  alsoForYou: string;
};

export function concernIntake(said: string, region = "IN"): ConcernTurn {
  const t = triage(said);
  const crisis = crisisResources(region);

  if (t.acute) {
    return {
      urgent: true,
      reflection:
        "That sounds serious, and you were right to take it seriously. The most useful thing you can do now is stay with them and get a trained person on the line — you do not have to be the one with the answers.",
      steps: [
        "Stay with them, or stay on the call. Do not leave them on their own.",
        "Ask them directly and plainly whether they are thinking about ending their life. Asking does not put the idea there — it is the question that lets someone say yes.",
        `Call ${crisis[0]?.label.split("(")[0].trim() ?? "a crisis line"} on ${crisis[0]?.number ?? ""} — with them if they will let you, for advice if they will not.`,
        "If they are in immediate physical danger, call emergency services.",
        "Tell someone else you trust. Carrying this alone is not something you should have to do.",
      ],
      avoid: [
        "Do not promise to keep it secret. It is the one promise you may not be able to keep.",
        "Do not try to talk them out of how they feel, or argue the logic of it.",
        "Do not leave finding help until tomorrow because it feels awkward today.",
      ],
      crisis,
      alsoForYou: "When they are safe, come back. Hearing this from someone lands hard, and you are allowed support of your own.",
    };
  }

  return {
    urgent: false,
    reflection:
      "Noticing is the hard part, and you have already done it. You do not need to fix anything — most of what helps is asking properly and then listening without rushing to solve it.",
    steps: [
      "Pick a private moment with no clock on it. Not in front of the team, not on the way to something else.",
      "Say what you noticed, not what you concluded: “You've seemed quiet the last couple of weeks” lands better than “Are you depressed?”",
      "Ask twice. The first “I'm fine” is usually reflex — “I mean it, how are you actually doing?” is where people start talking.",
      "Let the silence sit. The urge to fill it is the thing that closes the conversation.",
      "Tell them this page exists, and that the counsellors are free and confidential. Offer to sit with them while they book.",
    ],
    avoid: [
      "Do not diagnose. You are not doing them a favour by naming a condition.",
      "Do not report it to HR on their behalf unless someone is at risk — being handled behind your back is how people learn not to tell anyone.",
      "Do not take on being their only support. Pointing at real help is more useful than becoming it.",
    ],
    crisis,
    alsoForYou: "You can also book a counsellor yourself, to talk through how to handle it. Supporting someone is work.",
  };
}

/* ── browsing the library without saying anything first ───────────
   matchResources() only ever fires off the back of a conversation, so six
   perfectly good resources were invisible to anyone who was not ready to type
   anything — which is precisely the person most likely to be here. */

export type ResourceBucket = "stress" | "sleep" | "conflict" | "money" | "workload" | "alone";

export const BUCKETS: { key: ResourceBucket; label: string; ids: string[] }[] = [
  { key: "stress", label: "Anxious or on edge", ids: ["breathe"] },
  { key: "sleep", label: "Not sleeping", ids: ["sleep"] },
  { key: "workload", label: "Burnt out", ids: ["workload"] },
  { key: "conflict", label: "Trouble with someone at work", ids: ["conflict"] },
  { key: "money", label: "Money worries", ids: ["money"] },
  { key: "alone", label: "Feeling alone", ids: ["lonely"] },
];

export function resourcesIn(bucket: ResourceBucket): Resource[] {
  const b = BUCKETS.find((x) => x.key === bucket);
  return b ? RESOURCES.filter((r) => b.ids.includes(r.id)) : [];
}

/* ── the crisis patterns, tested ───────────────────────────────────
   These cases are here rather than in a test file nobody runs because this is
   the one piece of matching in the product where a miss is not a bug report,
   it is a person who asked for help and was answered about their work-from-home
   policy. Two misses have already happened:

     · "thinking about ENDING my life" did not match the literal "end my life"
     · "my colleague said he WANTS to die" — the third-person conjugation was
       absent, so the sentence was banded self-serve and answered with "what
       would make the next few days a little easier?"

   Both were found by trying sentences, not by reading the list. Add to it
   whenever a new phrasing occurs to you; `checkTriage()` is exposed through
   /api/ai/features so it runs rather than sits here. */

export const MUST_BE_ACUTE = [
  "I want to die",
  "he wants to die",
  "my colleague said he wants to die",
  "she wants to kill herself",
  "he is going to hurt himself",
  "they want to end their life",
  "my friend doesn't want to be here anymore",
  "she would be better off without her",
  "I have been thinking about ending my life",
  "he talked about suicide",
  "she is self-harming",
  "he says there is no point in living",
  "my teammate wants it all to stop",
  "they overdosed last month",
  "he can't go on",
];

/** Ordinary speech that must never trip the crisis path. A product that cries
 *  wolf at "this deadline is killing me" is one people stop typing into. */
export const MUST_NOT_BE_ACUTE = [
  "this deadline is killing me",
  "my back is killing me",
  "that project is killing him",
  "the printer keeps dying",
  "I want it to stop beeping",
  "I could murder a coffee",
  "she wants to dye her hair",
  "my laptop battery died",
  "I am dead tired",
  "we killed the feature",
];

export type TriageCheck = { ok: boolean; missed: string[]; falseAlarms: string[] };

export function checkTriage(): TriageCheck {
  const missed = MUST_BE_ACUTE.filter((t) => !triage(t).acute);
  const falseAlarms = MUST_NOT_BE_ACUTE.filter((t) => triage(t).acute);
  return { ok: missed.length === 0 && falseAlarms.length === 0, missed, falseAlarms };
}
