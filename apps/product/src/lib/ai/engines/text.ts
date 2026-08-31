/**
 * Text engine — sentiment, themes, tagging, moderation, readability, summaries.
 *
 * Implements, from the brief:
 *  · Pulse    — "Sentiment and theme extraction from open-text responses,
 *               clustering comments into themes ... without exposing identity
 *               in anonymous mode"
 *  · Pulse    — "AI-generated plain-language summary of each survey wave ...
 *               with source quotes retained for traceability"
 *  · Connect  — "Auto-tagging of posts by team, topic and sentiment"
 *  · Connect  — "Toxicity/harassment detection ... routed to the moderation
 *               queue before publish where risk is high"
 *  · Connect  — "AI-assisted post creation — turns a rough voice note or a
 *               couple of phrases into a clean, well-formatted post"
 *  · Broadcast— "Automatic translation and reading-level simplification per
 *               recipient's preferred language and literacy profile"
 *  · §8       — the shared "Sentiment & signal engine" used by Pulse, Connect
 *               and Broadcast rather than three separate integrations
 *
 * Everything here is deterministic and inspectable. When a model is connected it
 * replaces the generation steps; the thresholds, the anonymity floor and the
 * moderation routing stay exactly where they are, because those are policy, not
 * language.
 */

/* ── sentiment ─────────────────────────────────────────────────── */

const POSITIVE = [
  "great", "good", "love", "loved", "excellent", "happy", "proud", "supportive", "helpful",
  "clear", "fair", "appreciated", "recognised", "recognized", "improving", "better", "smooth",
  "fast", "flexible", "respected", "safe", "trust", "brilliant", "excited", "grateful",
];
const NEGATIVE = [
  "bad", "poor", "hate", "awful", "terrible", "burnt", "burnout", "exhausted", "tired",
  "overworked", "stressed", "stress", "unclear", "confusing", "unfair", "ignored", "slow",
  "broken", "understaffed", "overtime", "frustrated", "frustrating", "worried", "leaving",
  "quit", "unsafe", "risky", "delayed", "blocked", "micromanaged", "toxic",
];
const INTENSIFIERS = ["very", "really", "extremely", "so", "totally", "completely"];
const NEGATORS = ["not", "no", "never", "isn't", "wasn't", "don't", "doesn't", "didn't", "can't"];

export type Sentiment = {
  /** −1 (worst) to +1 (best). */
  score: number;
  label: "positive" | "neutral" | "negative";
  /** Words that drove the score — so a person can audit the call. */
  drivers: string[];
};

export function analyseSentiment(text: string): Sentiment {
  const words = text.toLowerCase().split(/[^a-z']+/).filter(Boolean);
  let raw = 0;
  const drivers: string[] = [];

  words.forEach((w, i) => {
    const pos = POSITIVE.includes(w);
    const neg = NEGATIVE.includes(w);
    if (!pos && !neg) return;
    let weight = pos ? 1 : -1;
    const prev = words[i - 1] ?? "";
    if (INTENSIFIERS.includes(prev)) weight *= 1.6;
    if (NEGATORS.includes(prev) || NEGATORS.includes(words[i - 2] ?? "")) weight *= -0.85;
    raw += weight;
    drivers.push(w);
  });

  // Normalise by length so a long grumble does not outweigh a short one.
  const score = Math.max(-1, Math.min(1, raw / Math.max(4, Math.sqrt(words.length) * 1.6)));
  const label = score > 0.15 ? "positive" : score < -0.15 ? "negative" : "neutral";
  return { score: Math.round(score * 100) / 100, label, drivers: [...new Set(drivers)].slice(0, 6) };
}

/* ── themes ────────────────────────────────────────────────────── */

/** The themes HR actually acts on. Matched on stems so plurals work. */
const THEMES: { key: string; label: string; stems: string[] }[] = [
  { key: "workload", label: "Workload & burnout", stems: ["workload", "burnout", "overtime", "hours", "exhaust", "understaff", "capacity", "shift"] },
  /* "recogni", not "recognis"/"recogniz": those two cover the verb in both
     spellings and miss RECOGNITION, the noun — which is the form people
     overwhelmingly write, and the name of a whole pillar of this product. Found
     by running the extractor over the real comments and getting zero hits on a
     theme the dashboard lists as a top positive driver. */
  { key: "recognition", label: "Recognition", stems: ["recogni", "appreciat", "kudos", "thank", "credit", "praise"] },
  { key: "growth", label: "Career growth", stems: ["growth", "career", "promot", "learn", "training", "skill", "develop"] },
  { key: "manager", label: "Manager support", stems: ["manager", "supervisor", "lead", "1:1", "one-on-one", "feedback", "micromanag"] },
  { key: "pay", label: "Pay & benefits", stems: ["pay", "salary", "compensat", "bonus", "increment", "benefit", "insurance"] },
  { key: "equipment", label: "Tools & equipment", stems: ["equipment", "tool", "machine", "laptop", "device", "system", "software"] },
  { key: "safety", label: "Safety", stems: ["safe", "unsafe", "hazard", "injur", "accident", "ppe", "protective"] },
  { key: "scheduling", label: "Scheduling", stems: ["schedul", "roster", "shift", "timing", "leave", "holiday"] },
  { key: "communication", label: "Communication", stems: ["communicat", "inform", "told", "announce", "update", "clarity", "unclear"] },
];

export type Theme = { key: string; label: string; mentions: number; sentiment: number };

/**
 * Cluster free text into themes.
 *
 * `minN` is the anonymity threshold from the brief ("configurable anonymity
 * thresholds per team size to protect respondent privacy"). A theme carried by
 * fewer than minN comments is dropped entirely — with a handful of responses,
 * naming the theme identifies the person.
 */
export function extractThemes(texts: string[], minN = 1): Theme[] {
  const acc = new Map<string, { n: number; s: number }>();
  for (const t of texts) {
    const low = t.toLowerCase();
    const sent = analyseSentiment(t).score;
    for (const th of THEMES) {
      if (!th.stems.some((st) => low.includes(st))) continue;
      const cur = acc.get(th.key) ?? { n: 0, s: 0 };
      acc.set(th.key, { n: cur.n + 1, s: cur.s + sent });
    }
  }
  return [...acc.entries()]
    .filter(([, v]) => v.n >= minN)
    .map(([key, v]) => ({
      key,
      label: THEMES.find((t) => t.key === key)!.label,
      mentions: v.n,
      sentiment: Math.round((v.s / v.n) * 100) / 100,
    }))
    .sort((a, b) => b.mentions - a.mentions);
}

/* ── auto-tagging (Connect) ────────────────────────────────────── */

export type PostTags = { topics: string[]; sentiment: Sentiment["label"]; team?: string };

export function tagPost(text: string, team?: string): PostTags {
  const low = text.toLowerCase();
  const topics = THEMES.filter((t) => t.stems.some((s) => low.includes(s))).map((t) => t.key);
  if (/\b(shipped|launched|released|delivered|completed)\b/.test(low)) topics.push("milestone");
  if (/\b(welcome|joining|joined|first day)\b/.test(low)) topics.push("joiner");
  if (/\b(anniversary|years?|birthday)\b/.test(low)) topics.push("celebration");
  return { topics: [...new Set(topics)].slice(0, 4), sentiment: analyseSentiment(text).label, team };
}

/* ── moderation (Connect) ──────────────────────────────────────── */

const SLURS_AND_ABUSE = ["idiot", "stupid", "moron", "useless", "shut up", "loser", "trash", "pathetic"];
const HARASSMENT = ["threat", "kill you", "hurt you", "watch your back", "you'll regret"];
const TARGETED = ["women can't", "men can't", "these people", "go back to", "your kind"];

export type Moderation = {
  risk: "none" | "low" | "high";
  /** What tripped it — shown to the moderator, never to the author as an accusation. */
  reasons: string[];
  /** High risk never auto-publishes. */
  action: "publish" | "review";
};

export function moderate(text: string): Moderation {
  const low = text.toLowerCase();
  const reasons: string[] = [];
  if (HARASSMENT.some((h) => low.includes(h))) reasons.push("possible threat or intimidation");
  if (TARGETED.some((h) => low.includes(h))) reasons.push("possible targeting of a group");
  if (SLURS_AND_ABUSE.some((h) => low.includes(h))) reasons.push("abusive language");

  const high = reasons.some((r) => r.startsWith("possible"));
  const risk: Moderation["risk"] = reasons.length === 0 ? "none" : high ? "high" : "low";
  // The brief routes high risk to the queue "before publish" — this is the
  // guardrail, so it is decided here and not left to a caller to remember.
  return { risk, reasons, action: risk === "high" ? "review" : "publish" };
}

/* ── post composition (Connect) ────────────────────────────────── */

/**
 * Turn a rough voice note or a couple of phrases into a publishable post.
 * The brief's reason matters: frontline workers "won't type a paragraph on a
 * factory-floor phone", so the input this must handle is fragments, not prose.
 */
export function composePost(rough: string, author?: string): string {
  const cleaned = rough.trim().replace(/\s+/g, " ").replace(/\bum+\b|\buh+\b|\byeah\b/gi, "").trim();
  if (!cleaned) return "";
  const sentences = cleaned
    .split(/(?<=[.!?])\s+|\s*(?:,\s*)?(?:and then|then|also)\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`));

  const body = sentences.join(" ");
  const tags = tagPost(cleaned);
  const suffix = tags.topics.includes("milestone") ? " 🎉" : tags.sentiment === "positive" ? " 👏" : "";
  return author ? `${body}${suffix}` : `${body}${suffix}`;
}

/* ── readability & language (Broadcast, onboarding) ────────────── */

const SYLLABLE = /[aeiouy]+/g;

export type Readability = { grade: number; band: "simple" | "standard" | "complex" };

/** Flesch–Kincaid grade level — the standard measure, computed honestly. */
export function readability(text: string): Readability {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const words = text.split(/\s+/).filter(Boolean);
  const syllables = words.reduce((n, w) => n + Math.max(1, (w.toLowerCase().match(SYLLABLE) ?? []).length), 0);
  const grade = 0.39 * (words.length / sentences) + 11.8 * (syllables / Math.max(1, words.length)) - 15.59;
  const g = Math.max(1, Math.round(grade * 10) / 10);
  return { grade: g, band: g <= 6 ? "simple" : g <= 10 ? "standard" : "complex" };
}

const PLAIN: [RegExp, string][] = [
  [/\butilise|utilize\b/gi, "use"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bendeavour|endeavor\b/gi, "try"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bprior to\b/gi, "before"],
  [/\bin the event that\b/gi, "if"],
  [/\bat this point in time\b/gi, "now"],
  [/\bwith regard to\b/gi, "about"],
  [/\bis required to\b/gi, "must"],
  [/\bin order to\b/gi, "to"],
  [/\badditional\b/gi, "more"],
  [/\bapproximately\b/gi, "about"],
  [/\bnotwithstanding\b/gi, "even so"],
  [/\bfacilitate\b/gi, "help"],
];

/**
 * Simplify to a target reading level.
 *
 * The brief asks for this "especially for frontline roles where English fluency
 * and literacy vary widely — content is generated or simplified per person, not
 * just translated." So this is a per-recipient transform, not a one-off edit.
 */
export function simplify(text: string, target: "simple" | "standard" = "simple"): string {
  let out = text;
  for (const [re, plain] of PLAIN) out = out.replace(re, plain);
  if (target !== "simple") return out;
  // Split long sentences at conjunctions — the single biggest readability win.
  return out
    .split(/(?<=[.!?])\s+/)
    .flatMap((s) => (s.split(/\s+/).length > 22 ? s.split(/,\s+(?:and|but|which|while)\s+/i) : [s]))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`))
    .join(" ");
}

export const LANGUAGES = ["English", "हिन्दी", "मराठी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "বাংলা", "ગુજરાતી"] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Per-recipient delivery of one announcement.
 *
 * Translation itself needs the model (or a translation API) — what is real here
 * is the pipeline: every recipient gets the message at their reading level, in
 * their language, and we record which transform was applied so nothing is
 * silently altered.
 */
export type Localised = { text: string; language: Language; grade: number; simplified: boolean };

export function localise(text: string, language: Language, literacy: "simple" | "standard"): Localised {
  const simplified = literacy === "simple";
  const body = simplified ? simplify(text, "simple") : text;
  return { text: body, language, grade: readability(body).grade, simplified };
}

/* ── summarisation ─────────────────────────────────────────────── */

export type WaveSummary = {
  headline: string;
  themes: Theme[];
  /** Verbatim quotes kept for traceability, as the brief requires. */
  quotes: string[];
  sentiment: number;
};

/**
 * Plain-language summary of a survey wave.
 * The brief's condition — "with source quotes retained for traceability" — is
 * why quotes are part of the return type rather than an optional extra.
 */
export function summariseWave(comments: string[], minN = 3): WaveSummary {
  const themes = extractThemes(comments, minN);
  const sentiment =
    comments.length === 0
      ? 0
      : Math.round((comments.reduce((n, c) => n + analyseSentiment(c).score, 0) / comments.length) * 100) / 100;

  const worst = [...themes].sort((a, b) => a.sentiment - b.sentiment)[0];
  const best = [...themes].sort((a, b) => b.sentiment - a.sentiment)[0];

  const headline = themes.length
    ? `${comments.length} comments. ${best ? `${best.label} is the strongest signal` : "No clear positive"}${
        worst && worst.key !== best?.key ? `, and ${worst.label.toLowerCase()} is the one to act on` : ""
      }.`
    : `${comments.length} comments — no theme reached the anonymity threshold of ${minN}.`;

  // Quote the comment that best represents the theme most in need of action.
  const quotes = worst
    ? comments
        .filter((c) => THEMES.find((t) => t.key === worst.key)!.stems.some((s) => c.toLowerCase().includes(s)))
        .slice(0, 3)
    : comments.slice(0, 2);

  return { headline, themes, quotes, sentiment };
}

/** Weekly digest for anyone on leave or off-shift (Broadcast). */
export function weeklyDigest(items: { title: string; when: string; priority?: string }[]): string {
  if (!items.length) return "Nothing you missed this week.";
  const critical = items.filter((i) => i.priority === "critical");
  const rest = items.filter((i) => i.priority !== "critical");
  const lines = [
    `While you were away, ${items.length} thing${items.length > 1 ? "s" : ""} went out.`,
    ...(critical.length ? ["", "Needs your attention:", ...critical.map((i) => `• ${i.title} (${i.when})`)] : []),
    ...(rest.length ? ["", "Everything else:", ...rest.map((i) => `• ${i.title} (${i.when})`)] : []),
  ];
  return lines.join("\n");
}
