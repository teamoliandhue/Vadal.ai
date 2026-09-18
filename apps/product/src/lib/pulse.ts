/* Pulse v2 (spec 049) — surveys with real dates, results you can act on, and
   the follow-ups that close the loop.

   A survey result is only worth the trouble if it ends in something changing,
   and people hearing that it did. So the model carries three things the first
   build did not:
   · the whole answer spread per question, the last round, and a benchmark —
     "62% agree" means nothing without "up from 54" and "most companies: 58";
   · the same answers by team, with small teams locked rather than guessed;
   · follow-ups: a fix, an owner, a date, and the note that tells people it
     happened ("You said, we did").
   Deterministic demo data; today is read locally by the page. */

export const MIN_N = 5;

export type Topic = "recognition" | "growth" | "workload" | "manager" | "belonging" | "tools";
export const TOPICS: { key: Topic; label: string }[] = [
  { key: "recognition", label: "Recognition" },
  { key: "growth", label: "Growth" },
  { key: "workload", label: "Workload" },
  { key: "manager", label: "Manager support" },
  { key: "belonging", label: "Belonging" },
  { key: "tools", label: "Tools" },
];
export const topicLabel = (t: Topic) => TOPICS.find((x) => x.key === t)!.label;

/* ── dates, by hand ─────────────────────────────────────────────── */
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parse = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (iso: string, withDay = false) => { const d = parse(iso); return `${withDay ? `${DAY[d.getDay()]} ` : ""}${d.getDate()} ${MON[d.getMonth()]}`; };
export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);
export const addDays = (iso: string, n: number) => { const d = parse(iso); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ── surveys ─────────────────────────────────────────────────────── */
export type PulseStatus = "live" | "scheduled" | "closed";
export type TeamProgress = { team: string; invited: number; responded: number };
export type PulseSurvey = {
  id: string;
  name: string;
  kind: string;              // Pulse · Lifecycle · 360 · DEI · Custom
  audience: string;
  status: PulseStatus;
  opens: string;             // ISO
  closes?: string;           // ISO; none = rolling
  sent: number;
  responses: number;
  /** Where a live survey is likely to finish, at its current pace. */
  projected?: number;
  /** Live response by team, for chasing the ones behind. */
  byTeam?: TeamProgress[];
  /** The round this one is compared with. */
  previous?: string;
  mine?: boolean;
};

export const pulseSurveys: PulseSurvey[] = [
  {
    id: "q3", name: "Q3 Engagement Pulse", kind: "Pulse", audience: "Everyone", status: "live",
    opens: "2026-09-08", closes: "2026-09-25", sent: 12480, responses: 7110, projected: 71, previous: "q2",
    byTeam: [
      { team: "Plant Ops · night shift", invited: 900, responded: 306 },
      { team: "Plant Ops · day shift", invited: 2500, responded: 1474 },
      { team: "Sales", invited: 1240, responded: 690 },
      { team: "Support", invited: 760, responded: 430 },
      { team: "Engineering", invited: 980, responded: 640 },
      { team: "Design", invited: 210, responded: 150 },
    ],
  },
  {
    id: "onb", name: "Onboarding · September joiners", kind: "Lifecycle", audience: "New joiners", status: "live",
    opens: "2026-09-04", closes: "2026-09-22", sent: 96, responses: 52, projected: 68,
  },
  { id: "exit", name: "Exit interviews", kind: "Lifecycle", audience: "Leavers", status: "live", opens: "2026-07-01", sent: 18, responses: 15 },
  { id: "mgr", name: "Manager effectiveness 360", kind: "360", audience: "People managers", status: "scheduled", opens: "2026-10-05", closes: "2026-10-19", sent: 240, responses: 0 },
  { id: "q2", name: "Q2 Engagement Pulse", kind: "Pulse", audience: "Everyone", status: "closed", opens: "2026-06-12", closes: "2026-06-26", sent: 12100, responses: 8954 },
  { id: "dei", name: "DEI climate", kind: "DEI", audience: "Everyone", status: "closed", opens: "2026-05-15", closes: "2026-05-29", sent: 12100, responses: 7986 },
];

/* ── results ─────────────────────────────────────────────────────── */
/** Strongly disagree · Disagree · Neutral · Agree · Strongly agree — sums to 100. */
export type Spread = [number, number, number, number, number];
export type Question = {
  id: string; text: string; topic: Topic | "outcome";
  spread: Spread; previous?: number; benchmark: number;
  /** How strongly this topic moves the outcome question, 0–1. */
  impact?: number;
};
export const favourable = (s: Spread) => s[3] + s[4];
export const unfavourable = (s: Spread) => s[0] + s[1];

export type Theme = { name: string; mentions: number; tone: "good" | "bad" | "warn"; rising?: boolean };
export type PulseResult = {
  surveyId: string;
  final: boolean;
  summary: string;
  questions: Question[];
  themes: Theme[];
  /** Respondents per team — for the heatmap and its anonymity floor. */
  teams?: { team: string; n: number }[];
};

export const results: PulseResult[] = [
  {
    surveyId: "q3", final: false,
    summary: "Growth is now the weak spot: 48% favourable, down 6 since Q2, and it matters more to engagement than anything else asked. Workload is still low but finally moving the right way — Plant Ops' three-week rotas are showing up.",
    questions: [
      { id: "q3-out", text: "I'd recommend oliandhue as a place to work", topic: "outcome", spread: [5, 9, 20, 40, 26], previous: 64, benchmark: 63 },
      { id: "q3-rec", text: "I get recognised for good work", topic: "recognition", spread: [4, 9, 19, 44, 24], previous: 62, benchmark: 66, impact: 0.42 },
      { id: "q3-gro", text: "I can see a path to grow here", topic: "growth", spread: [9, 20, 23, 35, 13], previous: 54, benchmark: 58, impact: 0.71 },
      { id: "q3-wor", text: "My workload is sustainable", topic: "workload", spread: [12, 24, 20, 32, 12], previous: 41, benchmark: 55, impact: 0.58 },
      { id: "q3-man", text: "My manager supports me", topic: "manager", spread: [3, 8, 17, 45, 27], previous: 70, benchmark: 69, impact: 0.51 },
      { id: "q3-bel", text: "I feel I belong on my team", topic: "belonging", spread: [3, 6, 16, 46, 29], previous: 74, benchmark: 71, impact: 0.36 },
      { id: "q3-too", text: "I have the tools to do my job well", topic: "tools", spread: [6, 14, 22, 42, 16], previous: 57, benchmark: 63, impact: 0.29 },
    ],
    themes: [
      { name: "Rotas and shift changes", mentions: 412, tone: "bad" },
      { name: "Promotion paths", mentions: 288, tone: "bad", rising: true },
      { name: "Recognition from managers", mentions: 240, tone: "good" },
      { name: "Logins and slow tools", mentions: 131, tone: "warn" },
    ],
    teams: [
      { team: "Plant Ops", n: 1780 }, { team: "Sales", n: 690 }, { team: "Engineering", n: 640 },
      { team: "Support", n: 430 }, { team: "Design", n: 150 }, { team: "People", n: 41 }, { team: "Legal", n: 4 },
    ],
  },
  {
    surveyId: "q2", final: true,
    summary: "Recognition and manager support read strongly, but workload is the clear drag — 41% favourable, lowest in Plant Ops and Engineering. Growth slipped for the first time in a year.",
    questions: [
      { id: "q2-out", text: "I'd recommend oliandhue as a place to work", topic: "outcome", spread: [5, 10, 21, 40, 24], previous: 63, benchmark: 63 },
      { id: "q2-rec", text: "I get recognised for good work", topic: "recognition", spread: [5, 11, 22, 42, 20], previous: 60, benchmark: 66, impact: 0.44 },
      { id: "q2-gro", text: "I can see a path to grow here", topic: "growth", spread: [7, 17, 22, 39, 15], previous: 55, benchmark: 58, impact: 0.64 },
      { id: "q2-wor", text: "My workload is sustainable", topic: "workload", spread: [13, 26, 20, 30, 11], previous: 43, benchmark: 55, impact: 0.62 },
      { id: "q2-man", text: "My manager supports me", topic: "manager", spread: [3, 9, 18, 45, 25], previous: 68, benchmark: 69, impact: 0.49 },
      { id: "q2-bel", text: "I feel I belong on my team", topic: "belonging", spread: [3, 7, 16, 46, 28], previous: 73, benchmark: 71, impact: 0.33 },
      { id: "q2-too", text: "I have the tools to do my job well", topic: "tools", spread: [6, 15, 22, 41, 16], previous: 55, benchmark: 63, impact: 0.31 },
    ],
    themes: [
      { name: "Workload and burnout", mentions: 312, tone: "bad" },
      { name: "Recognition", mentions: 268, tone: "good" },
      { name: "Career growth", mentions: 188, tone: "warn", rising: true },
      { name: "Manager support", mentions: 142, tone: "good" },
    ],
    teams: [
      { team: "Plant Ops", n: 2410 }, { team: "Sales", n: 880 }, { team: "Engineering", n: 760 },
      { team: "Support", n: 560 }, { team: "Design", n: 170 }, { team: "People", n: 48 }, { team: "Legal", n: 3 },
    ],
  },
  {
    surveyId: "dei", final: true,
    summary: "Most people feel they can be themselves at work, and that is up on last year. Fairness of promotions is where it breaks down — and it is lowest among the people it is about.",
    questions: [
      { id: "dei-out", text: "I'd recommend oliandhue as a place to work", topic: "outcome", spread: [6, 10, 21, 39, 24], previous: 61, benchmark: 63 },
      { id: "dei-bel", text: "I can be myself at work", topic: "belonging", spread: [3, 7, 19, 44, 27], previous: 68, benchmark: 70, impact: 0.46 },
      { id: "dei-man", text: "Decisions about me are made fairly", topic: "manager", spread: [6, 12, 24, 40, 18], previous: 55, benchmark: 60, impact: 0.55 },
      { id: "dei-gro", text: "People like me get promoted here", topic: "growth", spread: [8, 16, 27, 34, 15], previous: 50, benchmark: 55, impact: 0.61 },
      { id: "dei-rec", text: "My contributions are valued", topic: "recognition", spread: [4, 10, 21, 43, 22], previous: 63, benchmark: 65, impact: 0.38 },
    ],
    themes: [
      { name: "Promotion fairness", mentions: 190, tone: "bad" },
      { name: "Belonging on teams", mentions: 160, tone: "good" },
      { name: "Flexible hours", mentions: 96, tone: "warn" },
    ],
    teams: [
      { team: "Plant Ops", n: 2150 }, { team: "Sales", n: 800 }, { team: "Engineering", n: 700 },
      { team: "Support", n: 520 }, { team: "Design", n: 160 }, { team: "People", n: 46 }, { team: "Legal", n: 4 },
    ],
  },
  {
    surveyId: "onb", final: false,
    summary: "New joiners love their managers and are glad they came — but a third didn't have what they needed on day one, and half aren't sure what's expected by day 90.",
    questions: [
      { id: "onb-out", text: "I'm glad I joined", topic: "outcome", spread: [2, 4, 12, 44, 38], previous: 79, benchmark: 76 },
      { id: "onb-too", text: "I had what I needed on day one", topic: "tools", spread: [8, 21, 19, 36, 16], previous: 49, benchmark: 60 },
      { id: "onb-man", text: "My manager made time for me", topic: "manager", spread: [2, 7, 14, 47, 30], previous: 74, benchmark: 72 },
      { id: "onb-gro", text: "I know what's expected of me by day 90", topic: "growth", spread: [10, 22, 20, 34, 14], previous: 40, benchmark: 62 },
    ],
    themes: [
      { name: "Laptop not ready on day one", mentions: 14, tone: "bad" },
      { name: "Buddy system", mentions: 11, tone: "good" },
    ],
  },
];
export const resultFor = (surveyId: string) => results.find((r) => r.surveyId === surveyId) ?? null;

/* ── the same answers, by team ──────────────────────────────────── */
const BIAS: Record<string, Partial<Record<Topic | "outcome", number>>> = {
  "Plant Ops": { recognition: -4, growth: -12, workload: -15, manager: -3, belonging: 2, tools: -9, outcome: -6 },
  Engineering: { recognition: 3, growth: -2, workload: -11, manager: 4, belonging: 1, tools: 6, outcome: 1 },
  Sales: { recognition: 6, growth: 4, workload: -4, manager: -6, belonging: -3, tools: -2, outcome: 2 },
  Support: { recognition: -7, growth: -5, workload: -6, manager: 1, belonging: -4, tools: -8, outcome: -4 },
  Design: { recognition: 9, growth: 6, workload: 3, manager: 7, belonging: 8, tools: 4, outcome: 8 },
  People: { recognition: 5, growth: 2, workload: 1, manager: 5, belonging: 6, tools: 3, outcome: 6 },
  Legal: {},
};
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Favourable % for one team on one topic, or null below the anonymity floor. */
export function teamScore(r: PulseResult, team: string, topic: Topic | "outcome"): number | null {
  const n = r.teams?.find((t) => t.team === team)?.n ?? 0;
  if (n < MIN_N) return null;
  const q = r.questions.find((x) => x.topic === topic);
  if (!q) return null;
  const jitter = (hash(`${r.surveyId}${team}${topic}`) % 5) - 2;
  return Math.max(5, Math.min(95, favourable(q.spread) + (BIAS[team]?.[topic] ?? 0) + jitter));
}

/* ── follow-ups ─────────────────────────────────────────────────── */
export type Owner = { name: string; img: string };
export type FollowUpStatus = "planned" | "doing" | "done";
export type FollowUp = {
  id: string; surveyId: string; topic: Topic;
  title: string; owner: Owner; due: string; audience: string;
  status: FollowUpStatus;
  /** What people are told when it's done. */
  update?: string;
  shared?: boolean;
};

export const OWNERS: Owner[] = [
  { name: "Priya Sharma", img: "/avatars/user-8.svg" },
  { name: "Meera Pillai", img: "/avatars/user-7.svg" },
  { name: "Ravi Prasad", img: "/avatars/user-2.svg" },
  { name: "Anita Desai", img: "/avatars/user-5.svg" },
  { name: "Rahul Verma", img: "/avatars/user-1.svg" },
];

export const seedFollowUps: FollowUp[] = [
  {
    id: "fu-rota", surveyId: "q2", topic: "workload", title: "Publish Plant Ops rotas three weeks ahead",
    owner: OWNERS[1], due: "2026-09-12", audience: "Plant Ops", status: "done", shared: true,
    update: "You told us rotas landed too late to plan around. From this month they're published three weeks ahead, and swaps happen in the app.",
  },
  { id: "fu-promo", surveyId: "q2", topic: "growth", title: "Publish promotion criteria for every level", owner: OWNERS[0], due: "2026-09-30", audience: "Everyone", status: "doing" },
  { id: "fu-shout", surveyId: "q2", topic: "recognition", title: "Shout-outs in every Support huddle", owner: OWNERS[2], due: "2026-09-15", audience: "Support", status: "doing" },
  { id: "fu-laptop", surveyId: "onb", topic: "tools", title: "Laptops set up before day one", owner: OWNERS[4], due: "2026-10-01", audience: "New joiners", status: "planned" },
];

/** A first draft of the "You said, we did" note — the owner edits it. */
export function draftUpdate(f: FollowUp) {
  const where = f.audience === "Everyone" ? "" : ` in ${f.audience}`;
  return `You told us ${topicLabel(f.topic).toLowerCase()} needed work${where}. What we did: ${f.title}. Tell us in the next pulse whether it made a difference.`;
}
