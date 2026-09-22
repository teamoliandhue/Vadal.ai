/* Trust — privacy controls and responsible AI (Enterprise AI platform, spec 059).

   Trust promises Data Security · Privacy Controls · Compliance · Responsible
   AI. Security and compliance had cards. The other two were a sentence each,
   which is exactly the wrong way round: they are the two a works council asks
   about, and the two an employee has to be able to believe.

   · PRIVACY CONTROLS — the anonymity floor as a control you can see rather
     than a promise in a footnote; how long each kind of data is kept and what
     happens then; where it physically sits; and what leaves the country.
   · RESPONSIBLE AI — a register: every place the AI acts, what it reads, what
     it is allowed to decide (nothing, in every row), whether a person is in
     the loop, and whether it shows its reasoning. Plus what it may never do,
     and what a person can switch off for themselves.

   Deterministic demo data, but the floor matches the one the product enforces
   (MIN_N in lib/listening, lib/pulse and Sentiment). */

export const MIN_N = 5;

export const anonymity = {
  floor: MIN_N,
  /** Places the floor is applied — each one is a real gate in the product. */
  where: [
    "Pulse results, for every question and every cut",
    "Sentiment, for a team or a site",
    "Listen, for coverage and for phrases",
    "Manager hub, before a manager sees their own team's results",
    "Insight and every export, including the CSV",
  ],
  /** The part that makes it true rather than decorative. */
  holds: [
    "It applies to admins too. There is no role that can drop below it.",
    "A cut that would fall under the floor is not shown as zero — it says who is missing and why.",
    "Two cuts that overlap cannot be combined to get under it.",
  ],
  note: "Under five answers, results are hidden rather than rounded. A team of four never becomes a chart.",
};

/* ── retention ────────────────────────────────────────────────────── */
export type Retention = { what: string; keptFor: string; then: string; why: string };

export const retention: Retention[] = [
  { what: "Survey answers (open text)", keptFor: "24 months", then: "Deleted; only the aggregate remains", why: "Long enough to see a trend across two cycles, short enough that a sentence cannot follow someone around." },
  { what: "Survey answers (scores)", keptFor: "5 years", then: "Kept as team aggregates only", why: "Year-on-year comparison is the point of a pulse." },
  { what: "Chat and check-in messages", keptFor: "12 months", then: "Deleted", why: "They are a conversation, not a record." },
  { what: "Wellbeing and iThrive activity", keptFor: "6 months", then: "Deleted", why: "The shortest we can make it and still show someone their own streak." },
  { what: "Cases and HR requests", keptFor: "7 years", then: "Archived, never deleted", why: "Employment records have their own legal clock, and a grievance file has to outlive the argument about it." },
  { what: "Audit log", keptFor: "12 months", then: "Exported, then rolled off", why: "It exists to answer 'who saw what' — and it cannot be edited or deleted from the product." },
  { what: "A leaver's account", keptFor: "30 days after the last day", then: "Closed; the alumni record keeps name, dates and role only", why: "Enough to finish the paperwork, not enough to keep reading their messages." },
];

/* ── where the data sits ──────────────────────────────────────────── */
export type Residency = { what: string; where: string; note: string };

export const residency: Residency[] = [
  { what: "Everything about employees in India", where: "Mumbai (ap-south-1)", note: "Primary and backup both stay in India." },
  { what: "Employees in the EU", where: "Frankfurt (eu-central-1)", note: "A separate store, not a copy of the Indian one." },
  { what: "Backups", where: "Same region as the data", note: "A backup never crosses a border, which is where most residency claims quietly fail." },
  { what: "Support access", where: "From India, with your approval", note: "A named Vadal engineer, time-boxed, and every session lands in your audit log." },
];

/** What never leaves your tenancy, whatever else happens. */
export const neverLeaves = [
  "Employee data is never used to train a model — ours or anyone else's.",
  "No customer's data is ever mixed with another's, including for benchmarks.",
  "Open text is never sent to a third-party model with names attached.",
];

/* ── responsible AI: the register ─────────────────────────────────── */
export type AiUse = {
  id: string;
  where: string;
  does: string;
  reads: string;
  /** what it may decide on its own — the honest answer is always "nothing" */
  decides: string;
  /** who acts on it */
  human: string;
  /** can the person it affects see why */
  shows: boolean;
  /** can it be switched off, and by whom */
  off: string;
};

export const aiUses: AiUse[] = [
  {
    id: "nudge", where: "Nudge", does: "Reads the week and says what changed, in a sentence",
    reads: "Aggregates only — never an individual's answers", decides: "Nothing. It writes a sentence and a link.",
    human: "the admin or manager reading it", shows: true, off: "An admin, for the whole workspace",
  },
  {
    id: "desk", where: "SmartWork", does: "Answers an HR question from your own policies",
    reads: "Published policy documents and the question asked", decides: "Nothing. It cannot approve, refuse or close anything.",
    human: "a person, on every escalation", shows: true, off: "An admin — the desk falls back to a person",
  },
  {
    id: "sentiment", where: "Sentiment", does: "Groups what people wrote into themes, and reads the mood",
    reads: "Open text, with names stripped before it is read", decides: "Nothing. A theme is not an action.",
    human: "the People team", shows: true, off: "An admin, per channel",
  },
  {
    id: "listen", where: "Listen", does: "Flags a signal worth a look, and translates it",
    reads: "Signals from channels that are switched on", decides: "Nothing. It cannot open a case by itself.",
    human: "the HRBP who owns the team", shows: true, off: "An admin, per channel",
  },
  {
    id: "compose", where: "Social and Amplify", does: "Drafts a post, and suggests when to send it",
    reads: "The draft you wrote and the audience you chose", decides: "Nothing. Nothing is published without a person pressing send.",
    human: "the author", shows: true, off: "Anyone, for themselves",
  },
  {
    id: "match", where: "Onboard and Alumni", does: "Suggests a buddy, or an alumnus a role would suit",
    reads: "Team, tenure and role — never an exit answer or a survey answer", decides: "Nothing. Every match is a suggestion a person accepts.",
    human: "the People team", shows: true, off: "An admin",
  },
];

/** Lines the AI does not cross. Each one is enforced in the product, not a policy. */
export const aiNever = [
  "It never names the people behind a signal, a theme or a score.",
  "It never scores, ranks or rates an individual person.",
  "It never sees an individual's pulse, check-in or iThrive answers — not for admins, not for anyone.",
  "It never makes a decision about pay, promotion, discipline or exit.",
  "It never acts without a person: it drafts, suggests and explains.",
  "It never learns from your data. Nothing you write here trains a model.",
];

/** What a person can turn off for themselves, without asking anyone. */
export type OptOut = { what: string; who: string; effect: string };

export const optOuts: OptOut[] = [
  { what: "Suggestions on For you", who: "Anyone, in Settings", effect: "The day list stays, the AI ordering stops." },
  { what: "Writing help in Social and Amplify", who: "Anyone, in Settings", effect: "The composer becomes a plain box." },
  { what: "Being included in sentiment themes", who: "Anyone, in Settings", effect: "Their open text is excluded from theme reading. It still reaches a person if they asked for help." },
  { what: "WhatsApp and SMS check-ins", who: "Anyone, by replying STOP", effect: "No further messages on that channel. Nothing else changes." },
];

export const govStats = {
  aiUses: aiUses.length,
  /** uses where the AI decides something on its own */
  autonomous: 0,
  floor: MIN_N,
  longestRetention: "7 years",
  regions: 2,
};
