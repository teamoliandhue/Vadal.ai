/* Seed data for the Listen domain — Surveys · Sentiment · Always-on listening
   (admin/HR view). Deterministic demo data, in the spirit of data.ts. */

/* ── Surveys ───────────────────────────────────────────────────────── */
export const surveyStats = { active: 3, avgResponse: 71, responses: "4.8K", enps: 42, enpsDelta: 5 };

export type SurveyStatus = "live" | "scheduled" | "closed";
export type Survey = {
  name: string;
  type: string;
  audience: string;
  status: SurveyStatus;
  responseRate: number; // %
  responses: number;
  sent: number;
  when: string; // closes/sent/starts label
};

export const surveys: Survey[] = [
  { name: "Q2 Engagement Pulse", type: "Pulse", audience: "All org", status: "live", responseRate: 68, responses: 8486, sent: 12480, when: "Closes Fri" },
  { name: "Onboarding · June cohort", type: "Lifecycle", audience: "New joiners", status: "live", responseRate: 54, responses: 52, sent: 96, when: "Closes Mon" },
  { name: "Exit interview", type: "Lifecycle", audience: "Leavers", status: "live", responseRate: 82, responses: 15, sent: 18, when: "Rolling" },
  { name: "Manager effectiveness 360", type: "360", audience: "People managers", status: "scheduled", responseRate: 0, responses: 0, sent: 240, when: "Starts Jul 1" },
  { name: "Q1 Engagement Pulse", type: "Pulse", audience: "All org", status: "closed", responseRate: 74, responses: 8954, sent: 12100, when: "Closed Apr 4" },
  { name: "DEI climate", type: "DEI", audience: "All org", status: "closed", responseRate: 66, responses: 7986, sent: 12100, when: "Closed Mar 1" },
];

export const surveyTemplates: { key: string; name: string; desc: string; cadence: string }[] = [
  { key: "pulse", name: "Engagement pulse", desc: "6 quick questions on how the team feels.", cadence: "Monthly" },
  { key: "enps", name: "eNPS", desc: "One question: would they recommend us?", cadence: "Quarterly" },
  { key: "onboarding", name: "Onboarding", desc: "First-90-days experience for new joiners.", cadence: "Triggered" },
  { key: "exit", name: "Exit", desc: "Why people leave — themes & regret loss.", cadence: "Triggered" },
  { key: "dei", name: "DEI climate", desc: "Belonging & inclusion, anonymity-safe.", cadence: "Bi-annual" },
  { key: "manager", name: "Manager effectiveness", desc: "360 on manager behaviours.", cadence: "Quarterly" },
];

export const surveyResult = {
  survey: "Q2 Engagement Pulse",
  responses: 8486,
  questions: [
    { q: "I feel recognised for good work", top: "Agree", topPct: 62, tone: "good" },
    { q: "My manager supports my growth", top: "Agree", topPct: 58, tone: "good" },
    { q: "My workload is sustainable", top: "Disagree", topPct: 47, tone: "bad" },
    { q: "I'd recommend us as a place to work", top: "Likely", topPct: 71, tone: "good" },
  ],
  themes: [
    { name: "Workload & burnout", mentions: 312, tone: "bad" },
    { name: "Recognition", mentions: 268, tone: "good" },
    { name: "Career growth", mentions: 188, tone: "warn" },
    { name: "Manager support", mentions: 142, tone: "good" },
  ],
  aiSummary: "Recognition and manager support read strongly, but sustainable workload is the clear drag — 47% disagree, concentrated in Engineering and Plant Ops.",
};

/* ── Sentiment ─────────────────────────────────────────────────────── */
export const sentiment = {
  positive: 64,
  neutral: 24,
  negative: 12,
  net: 52,
  netDelta: 4,
  comments: 4120,
  months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  netSeries: [41, 43, 44, 42, 45, 47, 46, 49, 50, 51, 53, 52],
  themes: [
    { name: "Recognition", sentiment: "positive", occurrences: 268, trend: "up" },
    { name: "Team & belonging", sentiment: "positive", occurrences: 214, trend: "up" },
    { name: "Workload & burnout", sentiment: "negative", occurrences: 312, trend: "up" },
    { name: "Pay & growth", sentiment: "negative", occurrences: 176, trend: "flat" },
    { name: "Tooling & process", sentiment: "neutral", occurrences: 142, trend: "down" },
    { name: "Leadership clarity", sentiment: "neutral", occurrences: 98, trend: "up" },
  ],
  lifting: ["Recognition program", "1:1 cadence", "Onboarding revamp"],
  dragging: ["Workload after reorg", "Pay-band clarity", "Night-shift fatigue"],
  alerts: [
    { text: "Negative sentiment in Plant Ops up 9 pts this week", tone: "bad" },
    { text: "“Appraisal timeline” spiking in Engineering", tone: "warn" },
  ],
  voices: {
    positive: [
      { text: "The new recognition program actually changed how the team feels day to day.", meta: "Design · 2d ago" },
      { text: "My manager's weekly 1:1s have made a real difference.", meta: "Sales · 3d ago" },
    ],
    neutral: [
      { text: "Tooling is fine, but switching between systems still eats time.", meta: "Support · 1d ago" },
    ],
    negative: [
      { text: "Workload has doubled since the reorg — proud of the team, but we're running on fumes.", meta: "Engineering · 2d ago" },
      { text: "Still unclear how pay bands map to the new levels.", meta: "Finance · 4d ago" },
    ],
  },
};

/* ── Always-on listening ───────────────────────────────────────────── */
export const listening = {
  stats: { signalsToday: 38, topicsRising: 4, risksFlagged: 3 },
  channels: [
    { key: "feed", name: "Employee feed", on: true, signals: 412 },
    { key: "chat", name: "Chat · Slack", on: true, signals: 1840 },
    { key: "notes", name: "1:1 notes", on: true, signals: 96 },
    { key: "survey", name: "Survey open-text", on: true, signals: 620 },
    { key: "exit", name: "Exit interviews", on: true, signals: 18 },
    { key: "pulse", name: "Always-on pulse", on: false, signals: 0 },
  ],
  topics: [
    { name: "Workload & burnout", volume: 312, sentiment: "negative", trend: "up", risk: true },
    { name: "Return to office", volume: 154, sentiment: "negative", trend: "up", risk: true },
    { name: "Recognition", volume: 268, sentiment: "positive", trend: "up", risk: false },
    { name: "Career growth", volume: 142, sentiment: "neutral", trend: "flat", risk: false },
    { name: "Appraisal timeline", volume: 88, sentiment: "negative", trend: "up", risk: true },
    { name: "Tooling", volume: 74, sentiment: "neutral", trend: "down", risk: false },
  ],
  stream: [
    { source: "Chat", snippet: "Another weekend of on-call — we can't keep shipping like this.", topic: "Workload", sentiment: "negative", time: "12m" },
    { source: "Feed", snippet: "Huge shoutout to Design for the onboarding revamp 👏", topic: "Recognition", sentiment: "positive", time: "28m" },
    { source: "Survey", snippet: "When does the appraisal window actually open this cycle?", topic: "Appraisal timeline", sentiment: "negative", time: "1h" },
    { source: "Chat", snippet: "3 days in office is a lot with my commute.", topic: "Return to office", sentiment: "negative", time: "2h" },
    { source: "1:1 notes", snippet: "Wants a clearer growth path to senior.", topic: "Career growth", sentiment: "neutral", time: "3h" },
    { source: "Exit", snippet: "Leaving mainly for comp — loved the team though.", topic: "Pay & growth", sentiment: "negative", time: "5h" },
  ],
};
