/**
 * The pre-publish check (Connect · moderation).
 *
 * Every post is read before it goes out, and one of three things happens:
 *   publish — nothing to say;
 *   nudge   — a soft rejection: the author sees what might land badly and
 *             chooses to edit, take a suggestion, or post anyway;
 *   hold    — the post waits for a person. The author can still edit it
 *             instead of sending it.
 *
 * Two voices, on purpose. The author is never accused: they hear what a reader
 * might take from the post. The moderator gets the plain reason and the phrase
 * that tripped it, plus Nudge's read of the context — because the phrase that
 * trips a threat check on a factory floor is usually a safety warning.
 *
 * Wording checks run on the brief's word lists. Photos are checked against
 * labels on the attachable image set: a vision model does this in production,
 * and the contract here (a label, and a risk when there is one) is what it
 * will return.
 */
import type { PostingPolicy } from "../../posting";
import { MODERATION_TERMS, rewrite } from "./text";

export type FindingKind = "threat" | "targeting" | "abuse" | "personal-data" | "photo";

export type Finding = {
  kind: FindingKind;
  severity: "high" | "low";
  /** The exact phrase, masked when it is personal data. */
  match?: string;
  /** For the moderator — plain and specific. */
  reason: string;
};

export type PostCheck = {
  verdict: "publish" | "nudge" | "hold";
  findings: Finding[];
  /** For the author — what a reader might take from it, never an accusation. */
  title: string;
  body: string;
  /** The text with personal details taken out, when there were any. */
  redacted?: string;
  /** A calmer wording, when harsh words were the only problem. */
  calmer?: string;
  /** The post reads like a safety concern — offer the private route. */
  safety: boolean;
};

export type PhotoLabel = { label: string; risk?: string };

export const PHOTO_LABELS: Record<string, PhotoLabel> = {
  "/feed/wellbeing.jpg": { label: "colleagues relaxing together indoors" },
  "/feed/ship.jpg": { label: "a team celebrating at a desk" },
  "/feed/plant.jpg": { label: "a plant on a desk" },
  "/feed/milestone.jpg": { label: "a finish line" },
  "/feed/coldbrew.jpg": { label: "a coffee on a counter" },
  "/feed/screen.jpg": {
    label: "a laptop screen showing a document with a table of records",
    risk: "a screen with records on it — names or details may be readable",
  },
};

/* `contact` details become "message me directly"; ID numbers are simply taken
   out — there is no version of an Aadhaar number that belongs in a post. */
const PERSONAL: { re: RegExp; what: string; contact: boolean; mask: (m: string) => string }[] = [
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, what: "an email address", contact: true, mask: (m) => m.replace(/^(.).*(@.*)$/, "$1•••$2") },
  { re: /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g, what: "a phone number", contact: true, mask: (m) => `${m.slice(0, 3)}••• ••${m.slice(-2)}` },
  { re: /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g, what: "what looks like an Aadhaar number", contact: false, mask: (m) => `•••• •••• ${m.replace(/\s/g, "").slice(-4)}` },
  { re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, what: "what looks like a PAN", contact: false, mask: (m) => `•••••${m.slice(5, 7)}•••` },
];

const C = "\u0001"; // a contact detail was here
function redact(text: string): string {
  let out = text;
  for (const p of PERSONAL) out = out.replace(p.re, p.contact ? C : "");
  out = out
    .replace(new RegExp(`\\bmy\\s+(?:mobile|number|phone(?:\\s+number)?|e?-?mail(?:\\s+id)?)\\s+(?:is\\s+)?${C}`, "gi"), C)
    .replace(new RegExp(`\\b(?:please\\s+)?(?:call|ring|phone|text|whatsapp|e?-?mail|contact|reach|ping)(?:\\s+me)?(?:\\s+(?:on|at))?\\s*${C}`, "gi"), C)
    .replace(new RegExp(`\\s*\\b(?:on|at)\\s*${C}`, "gi"), ` ${C}`)
    .replace(new RegExp(`${C}(?:\\s*(?:,|or|and|/)\\s*${C})+`, "g"), C);
  out = out.trim().replace(new RegExp(`^${C}`), "Message me directly").replace(new RegExp(C, "g"), "message me directly");
  /* "Message me directly, text me if…" says it twice — keep the person's own ask */
  out = out.replace(/^Message me directly[,.]?\s+(?=.*\b(?:text|call|message|ping|dm|whatsapp)\s+me\b)/i, "");
  out = out.replace(/\s+([.,!?])/g, "$1").replace(/:\s*(?=[.,!?]|$)/g, "").replace(/\s{2,}/g, " ").trim();
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/* A harsh word aimed at a person is dropped with its clause; aimed at a thing,
   it is swapped for what the person probably meant. */
const AT_PERSON = /\b(you|your|whoever|he|she|they|them|management|manager|boss|hr)\b/i;

const SAFETY = /\b(hurt|injur|unsafe|safety|accident|hazard|fall|slip|blocked|fire|spill|forklift|pallet)/i;

/* Harsh words → what the person probably meant. Offered, never applied. */
const SOFTER: Record<string, string> = {
  idiot: "", moron: "", loser: "", stupid: "frustrating", useless: "not working", trash: "not good enough",
  pathetic: "disappointing", "shut up": "hold on",
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findTerms = (text: string, terms: readonly string[]) =>
  terms.filter((t) => new RegExp(`\\b${escape(t)}\\b`, "i").test(text));

export function checkPost(input: { text: string; media?: { src: string } }, policy: PostingPolicy): PostCheck {
  const text = input.text;
  const findings: Finding[] = [];

  if (policy.checkText) {
    for (const m of findTerms(text, MODERATION_TERMS.threat))
      findings.push({ kind: "threat", severity: "high", match: m, reason: "Possible threat or intimidation" });
    for (const m of findTerms(text, MODERATION_TERMS.targeting))
      findings.push({ kind: "targeting", severity: "high", match: m, reason: "Generalises about a group of people" });
    for (const m of findTerms(text, MODERATION_TERMS.abuse))
      findings.push({ kind: "abuse", severity: "low", match: m, reason: "Harsh or abusive word" });
  }

  let redacted: string | undefined;
  if (policy.personalData) {
    for (const p of PERSONAL) {
      const hits = text.match(p.re);
      if (!hits) continue;
      for (const h of new Set(hits)) findings.push({ kind: "personal-data", severity: "low", match: p.mask(h), reason: `Contains ${p.what}` });
    }
    if (findings.some((f) => f.kind === "personal-data")) redacted = redact(text);
  }

  if (policy.checkPhotos && input.media) {
    const l = PHOTO_LABELS[input.media.src];
    if (l?.risk) findings.push({ kind: "photo", severity: "high", reason: `Photo shows ${l.risk}` });
  }

  const high = findings.some((f) => f.severity === "high");
  const onlyPersonal = findings.length > 0 && findings.every((f) => f.kind === "personal-data");

  const verdict: PostCheck["verdict"] =
    findings.length === 0 ? "publish"
    : high ? "hold"
    : policy.sensitivity === "strict" ? "hold"
    : policy.sensitivity === "relaxed" && !onlyPersonal ? "publish"
    : "nudge";

  const safety = SAFETY.test(text) && findings.some((f) => f.kind === "threat");
  const kinds = new Set(findings.map((f) => f.kind));

  let calmer: string | undefined;
  if (kinds.has("abuse") && !kinds.has("threat") && !kinds.has("targeting")) {
    const harsh = new RegExp(`\\b(?:${MODERATION_TERMS.abuse.map(escape).join("|")})\\b`, "i");
    const clauses = text.split(/(?<=[.!?])\s+|\s*(?:,\s*|;\s*|\s+(?:and|but)\s+)/i).filter(Boolean);
    const jab = new RegExp(`\\b(?:you\\s+)?(?:${MODERATION_TERMS.abuse.map(escape).join("|")})(?:\\s+(?:lot|bunch|people|guys))?(?:\\s+(?:in|from|at|of))?\\s*`, "gi");
    const kept = clauses
      .map((c) => {
        if (!(harsh.test(c) && AT_PERSON.test(c))) return c;
        const without = c.replace(jab, "").replace(/[\s.!?]+$/, "").trim();
        /* nothing left but a dangling "…made it is" — the clause was only the jab */
        return /\b(?:is|are|was|were|be|so|a|an|the)$/i.test(without) || without.split(/\s+/).length < 3 ? "" : without;
      })
      .filter(Boolean);
    let t = (kept.length ? kept : clauses).map((c) => c.replace(/[.!?]+$/, "")).join(", ");
    for (const [w, soft] of Object.entries(SOFTER)) t = t.replace(new RegExp(`\\b${escape(w)}\\b`, "gi"), soft);
    t = t.replace(/\s{2,}/g, " ").replace(/\s+([.,!?])/g, "$1").trim();
    calmer = rewrite(`${t}.`, "professional").text;
  }

  const { title, body } = voice(verdict, kinds, policy);
  return { verdict, findings, title, body, redacted, calmer, safety };
}

/**
 * Nudge's read for the moderator — the context a word list cannot see. Written
 * from what the check found and what else the post says, so it is specific to
 * the post rather than a restatement of the rule.
 */
export function contextFor(findings: Finding[], text: string, safety: boolean): string {
  const kinds = new Set(findings.map((f) => f.kind));
  if (safety) return "It names a hazard next to the flagged phrase, so it most likely reads as a safety warning rather than a threat to a person. Worth raising as a safety case whatever you decide about the post.";
  if (kinds.has("threat")) return "No hazard or work problem is mentioned alongside the phrase. If it is aimed at a colleague, this belongs in Flow as a conduct case.";
  if (kinds.has("targeting")) return "It generalises about colleagues as a group. Return it with a note; if it comes back in the same form, raise it in Flow as a conduct case.";
  if (kinds.has("photo") && kinds.size === 1) return /\d|win|done|clear|ship|launch/i.test(text)
    ? "The post itself is a celebration; the photo is the problem. Returning it with a note to use a different photo is usually all it needs."
    : "The photo may show people's details. Returning it with a note to use a different photo is usually all it needs.";
  if (kinds.has("personal-data")) return "The details look like the author's own. Returning it with a note is enough — nothing here suggests it was shared to harm anyone.";
  return "Held because this workspace is on Strict. The wording is harsh but not aimed at anyone in particular; approving it is reasonable.";
}

function voice(verdict: PostCheck["verdict"], kinds: Set<FindingKind>, policy: PostingPolicy): { title: string; body: string } {
  if (verdict === "publish") return { title: "Ready to post", body: "" };
  if (verdict === "hold") {
    if (kinds.has("photo") && kinds.size === 1)
      return { title: "Check the photo first", body: "It looks like it shows a screen with records on it, and people's details may be readable. Pick another photo, or send it to be looked at before it goes out." };
    if (kinds.has("threat"))
      return { title: "This will be looked at before it goes out", body: "Some of the wording could read as a threat to someone, even if that isn't what you mean. A person from the People team will look at it first — usually within a few hours." };
    if (kinds.has("targeting"))
      return { title: "This will be looked at before it goes out", body: "Part of it talks about a whole group of colleagues at once, which can land hard on the people in it. A person from the People team will look at it first." };
    return {
      title: "This will be looked at before it goes out",
      body: policy.sensitivity === "strict"
        ? "Your workspace has a person look at any post that gets flagged. It usually takes a few hours."
        : "A person from the People team will look at it first.",
    };
  }
  if (kinds.has("personal-data") && kinds.size === 1)
    return { title: "This includes personal details", body: "Everyone at the company can read posts here. Take the details out, or share them in a direct message instead." };
  return { title: "This might read harsher than you mean", body: "People can't hear your tone in a post. A small change usually keeps the point and loses the sting." };
}
