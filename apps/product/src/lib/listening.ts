/* Listen — always-on listening (Engagement & listening, spec 053).

   The module the platform means by Listen: Always-On Listening · Lifecycle
   Listening · Real-Time Signals · Voice Analytics.

   The old screen answered "what are people saying?" and stopped there. For a
   listening product the harder, more honest questions are:

   · WHO ARE WE NOT HEARING? A wall of signals from the people who already talk
     is not listening — it is an echo. Coverage is per team, and silence is
     named rather than left as an absence.
   · WHAT HAPPENED TO THIS SIGNAL? A stream nobody acts on trains people to stop
     writing. Every signal carries its outcome: it became a case, it fed a
     pulse, it is being watched, or nothing happened — said plainly.
   · IN WHOSE WORDS? Listening only in English, in a workforce that works in
     four languages, is a sampling error with a dashboard on top.

   Deterministic demo data. */

export const MIN_N = 5;

/* ── 1 · always-on: where the words come from ─────────────────────── */
export type Channel = {
  key: string;
  name: string;
  on: boolean;
  /** signals in the last 30 days */
  signals: number;
  /** who this channel can actually reach */
  reach: string;
  note: string;
};

export const channels: Channel[] = [
  { key: "feed", name: "Social feed", on: true, signals: 412, reach: "Everyone with the app", note: "Posts, replies and questions people write in the open." },
  { key: "chat", name: "Team chat", on: true, signals: 1840, reach: "Desk teams, opted-in channels only", note: "Only channels a team switched on, and never direct messages." },
  { key: "survey", name: "Survey open text", on: true, signals: 620, reach: "Everyone asked", note: "The comment box at the end of a pulse — the richest source we have." },
  { key: "whatsapp", name: "WhatsApp check-ins", on: true, signals: 286, reach: "Frontline and night shift", note: "Two questions on the phone people already carry. No app needed." },
  { key: "kiosk", name: "Floor kiosk · QR", on: true, signals: 94, reach: "Plant floor, shared devices", note: "A code by the line, answered without logging in." },
  { key: "notes", name: "1:1 notes", on: true, signals: 96, reach: "Anyone with a manager", note: "Only what the manager chose to share, and the person can see it." },
  { key: "exit", name: "Exit conversations", on: true, signals: 18, reach: "Leavers", note: "Read as themes only — never attributed to a leaver." },
  { key: "ideas", name: "Idea box", on: false, signals: 0, reach: "Everyone", note: "Not switched on. Ideas would arrive here instead of in someone's inbox." },
];

/* ── who we hear from, and who we don't ───────────────────────────── */
export type Coverage = { team: string; people: number; heard: number; channel: string; why?: string };

export const coverage: Coverage[] = [
  { team: "Design", people: 210, heard: 168, channel: "Feed, chat" },
  { team: "Engineering", people: 980, heard: 731, channel: "Chat, survey" },
  { team: "Sales", people: 1240, heard: 806, channel: "Feed, survey" },
  { team: "Support", people: 760, heard: 441, channel: "Chat, survey" },
  { team: "Plant Ops · day", people: 2500, heard: 900, channel: "WhatsApp, kiosk", why: "No desk, no company email — the app is on personal phones only." },
  { team: "Plant Ops · night", people: 900, heard: 189, channel: "WhatsApp", why: "Asked at 09:00, when the shift is asleep. Quiet hours hold the rest." },
  { team: "Logistics", people: 380, heard: 61, channel: "SMS", why: "On the road; SMS is the only channel that reaches them." },
];

export const TOTAL_PEOPLE = coverage.reduce((n, c) => n + c.people, 0);
export const TOTAL_HEARD = coverage.reduce((n, c) => n + c.heard, 0);
export const heardPct = Math.round((TOTAL_HEARD / TOTAL_PEOPLE) * 100);

/* ── 2 · lifecycle: the moments we ask at ─────────────────────────── */
export type Moment = {
  id: string; name: string; when: string; on: boolean;
  sent: number; answered: number; channel: string;
};

export const moments: Moment[] = [
  { id: "pre", name: "Before day one", when: "When the offer is signed", on: true, sent: 38, answered: 31, channel: "WhatsApp" },
  { id: "d7", name: "First week", when: "Day 7", on: true, sent: 96, answered: 71, channel: "App" },
  { id: "d30", name: "First month", when: "Day 30", on: true, sent: 88, answered: 54, channel: "App" },
  { id: "d90", name: "First 90 days", when: "Day 90", on: true, sent: 74, answered: 44, channel: "App, WhatsApp" },
  { id: "stay", name: "Stay conversation", when: "Every 6 months", on: true, sent: 1120, answered: 716, channel: "App" },
  { id: "mgr", name: "New manager", when: "When a manager changes", on: false, sent: 0, answered: 0, channel: "App" },
  { id: "exit", name: "Leaving", when: "When a resignation is recorded", on: true, sent: 18, answered: 15, channel: "App, email" },
  { id: "post", name: "Sixty days after", when: "60 days after the last day", on: true, sent: 16, answered: 9, channel: "Email" },
];

/* ── 3 · real-time signals, and what became of them ───────────────── */
export type Outcome =
  | { kind: "case"; ref: string; owner: string }
  | { kind: "pulse"; ref: string }
  | { kind: "watching"; note: string }
  | { kind: "none" };

export type Signal = {
  id: string; source: string; snippet: string; topicId: string;
  sentiment: "positive" | "neutral" | "negative";
  time: string; team: string; language?: string;
  outcome: Outcome;
};

export const signals: Signal[] = [
  { id: "s1", source: "WhatsApp", snippet: "Another weekend of on-call — we can't keep shipping like this.", topicId: "workload", sentiment: "negative", time: "12m", team: "Engineering", outcome: { kind: "case", ref: "CASE-204", owner: "Meera Pillai" } },
  { id: "s2", source: "Feed", snippet: "Huge shoutout to Design for the onboarding revamp 👏", topicId: "recognition", sentiment: "positive", time: "28m", team: "Sales", outcome: { kind: "none" } },
  { id: "s3", source: "Survey", snippet: "When does the appraisal window actually open this cycle?", topicId: "appraisal", sentiment: "negative", time: "1h", team: "Engineering", outcome: { kind: "pulse", ref: "Q3 Engagement Pulse" } },
  { id: "s4", source: "Kiosk", snippet: "रोस्टर देर से आता है, घर पर बताना मुश्किल है।", topicId: "workload", sentiment: "negative", time: "2h", team: "Plant Ops · day", language: "Hindi", outcome: { kind: "watching", note: "Fourth rota comment this week — watching for a pattern." } },
  { id: "s5", source: "1:1 notes", snippet: "Wants a clearer growth path to senior.", topicId: "growth", sentiment: "neutral", time: "3h", team: "Support", outcome: { kind: "none" } },
  { id: "s6", source: "WhatsApp", snippet: "Night canteen closes before our break. Nothing hot after 1am.", topicId: "workload", sentiment: "negative", time: "4h", team: "Plant Ops · night", outcome: { kind: "case", ref: "CASE-207", owner: "Ravi Prasad" } },
  { id: "s7", source: "Chat", snippet: "The new deploy tooling logs me out mid-task again.", topicId: "tooling", sentiment: "negative", time: "5h", team: "Engineering", outcome: { kind: "watching", note: "Tooling complaints are falling overall — not acting yet." } },
  { id: "s8", source: "Survey", snippet: "ரோட்டா மூன்று வாரம் முன்பே வருகிறது. நன்றி.", topicId: "workload", sentiment: "positive", time: "6h", team: "Plant Ops · day", language: "Tamil", outcome: { kind: "none" } },
];

/* ── 4 · voice: what they write, and in what language ─────────────── */
export const languages = [
  { name: "English", share: 58, note: "Desk teams, mostly" },
  { name: "Hindi", share: 21, note: "Plant Ops, Logistics" },
  { name: "Kannada", share: 11, note: "Bengaluru plant" },
  { name: "Tamil", share: 7, note: "Hosur plant" },
  { name: "Marathi", share: 3, note: "Pune warehouse" },
];

export const tone = { positive: 46, neutral: 32, negative: 22 };

/** Words that carry the meaning, sized by how often they appear. */
export const phrases = [
  { text: "rota", n: 184, tone: "negative" as const },
  { text: "on-call", n: 121, tone: "negative" as const },
  { text: "shout-out", n: 96, tone: "positive" as const },
  { text: "appraisal window", n: 88, tone: "negative" as const },
  { text: "canteen", n: 61, tone: "negative" as const },
  { text: "buddy", n: 54, tone: "positive" as const },
  { text: "three-week rota", n: 43, tone: "positive" as const },
  { text: "logged out", n: 38, tone: "negative" as const },
];

export const stats = {
  signalsToday: 38,
  signals30d: channels.reduce((n, c) => n + c.signals, 0),
  actedOn: 64,           // % of flagged signals that ended in a case or a pulse question
  risingTopics: 4,
};
