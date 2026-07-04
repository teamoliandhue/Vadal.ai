/**
 * Manager hub data (route /product/managers · "Operations" group).
 * A single people-leader's team cockpit: team health, a prioritised action queue,
 * the direct-report roster (sentiment, 1:1 cadence, recognition, risk), and AI
 * coaching nudges + per-report 1:1 prep. Seeded/demo data, kept consistent with
 * the org figures in lib/data.ts (org health 82, recognition coverage ~61%).
 */

export type Risk = "High" | "Med" | "Low";
export type Trend = "up" | "down" | "flat";

export type Report = {
  id: string;
  name: string;
  role: string;
  img: string;
  tenure: string;
  sentiment: number; // 0–100
  spark: number[]; // last 6 sentiment points
  trend: Trend;
  risk: Risk;
  lastOneOnOne: string;
  nextOneOnOne: string; // "Overdue" | "Today · 3:00 PM" | "Thu"
  overdue?: boolean;
  recognition30d: number;
  note: string;
  /** AI-generated talking points for the manager's next 1:1. */
  aiPrep: string[];
};

export const team = {
  name: "Design pod",
  size: 6,
  health: 74,
  healthDelta: 2,
  orgHealth: 82,
  oneOnOneCompletion: 67,
  recognitionCoverage: 58,
  atRisk: 3,
  atRiskHigh: 1,
  drivers: [
    { label: "Recognition gap", tone: "bad" },
    { label: "1:1 cadence slipping", tone: "warn" },
    { label: "Craft & delivery", tone: "good" },
  ] as const,
};

export const reports: Report[] = [
  {
    id: "r1", name: "Rohan Mehta", role: "Senior Designer", img: "/avatars/user-1.svg", tenure: "3 yrs",
    sentiment: 58, spark: [72, 70, 66, 63, 60, 58], trend: "down", risk: "High",
    lastOneOnOne: "6 weeks ago", nextOneOnOne: "Overdue", overdue: true, recognition30d: 0,
    note: "Flagged workload twice in pulse; no 1:1 in 6 weeks.",
    aiPrep: [
      "Open on workload — he's raised it twice; acknowledge before problem-solving.",
      "No recognition in 30 days despite shipping the design-system refactor — call it out.",
      "Ask what would make the next quarter feel sustainable, not just deliverable.",
    ],
  },
  {
    id: "r2", name: "Neha Rao", role: "Product Designer", img: "/avatars/user-5.svg", tenure: "2 yrs",
    sentiment: 88, spark: [80, 82, 84, 85, 87, 88], trend: "up", risk: "Low",
    lastOneOnOne: "1 week ago", nextOneOnOne: "Thu", recognition30d: 5,
    note: "Top recogniser on the team; ready for more scope.",
    aiPrep: [
      "She's your highest-sentiment report — explore a stretch project or mentoring role.",
      "Recognise her onboarding-flow work publicly; she models the values you want.",
    ],
  },
  {
    id: "r3", name: "Dev Patel", role: "Junior Designer", img: "/avatars/user-3.svg", tenure: "3 weeks",
    sentiment: 76, spark: [68, 70, 72, 74, 75, 76], trend: "up", risk: "Low",
    lastOneOnOne: "3 days ago", nextOneOnOne: "Mon", recognition30d: 2,
    note: "New joiner — week 3, onboarding on track.",
    aiPrep: [
      "Check buddy-matching is working — it's the strongest onboarding driver.",
      "Confirm he has a clear first project and knows who to ask for help.",
    ],
  },
  {
    id: "r4", name: "Sara Menon", role: "Designer", img: "/avatars/user-7.svg", tenure: "1 yr",
    sentiment: 71, spark: [74, 73, 72, 71, 71, 71], trend: "flat", risk: "Med",
    lastOneOnOne: "3 weeks ago", nextOneOnOne: "Overdue", overdue: true, recognition30d: 0,
    note: "Quiet in the last two pulses — worth a check-in.",
    aiPrep: [
      "She's gone quiet in pulses — ask open questions, don't fill the silence.",
      "No recognition in 30 days — find something specific to appreciate.",
    ],
  },
  {
    id: "r5", name: "Kabir Rao", role: "UX Researcher", img: "/avatars/user-2.svg", tenure: "2 yrs",
    sentiment: 80, spark: [76, 77, 78, 79, 80, 80], trend: "up", risk: "Low",
    lastOneOnOne: "1 week ago", nextOneOnOne: "Fri", recognition30d: 3,
    note: "Strong quarter; recognise the research readout.",
    aiPrep: [
      "Great research quarter — recognise the readout that reshaped the roadmap.",
      "Ask if he wants to present findings to leadership for visibility.",
    ],
  },
  {
    id: "r6", name: "Aisha Khan", role: "Content Designer", img: "/avatars/user-4.svg", tenure: "1.5 yrs",
    sentiment: 66, spark: [72, 71, 70, 68, 67, 66], trend: "down", risk: "Med",
    lastOneOnOne: "2 weeks ago", nextOneOnOne: "Wed", recognition30d: 1,
    note: "Raised a growth-path question in the last 1:1.",
    aiPrep: [
      "Follow up on the growth-path question — come with a concrete next step.",
      "Sentiment is drifting down slowly; get ahead of it now.",
    ],
  },
];

export type ManagerAction = {
  id: string;
  title: string;
  context: string;
  due: string;
  tone: "urgent" | "warn" | "normal";
  kind: "oneonone" | "recognition" | "workload" | "survey";
  reportId?: string;
};

export const managerActions: ManagerAction[] = [
  { id: "a1", title: "Schedule 1:1 with Rohan Mehta", context: "Flight-risk · no 1:1 in 6 weeks", due: "Today", tone: "urgent", kind: "oneonone", reportId: "r1" },
  { id: "a2", title: "Recognise Sara Menon", context: "0 recognitions in 30 days", due: "Tomorrow", tone: "warn", kind: "recognition", reportId: "r4" },
  { id: "a3", title: "Follow up on Rohan's workload", context: "Flagged twice in the last two pulses", due: "This week", tone: "warn", kind: "workload", reportId: "r1" },
  { id: "a4", title: "Prep 1:1 with Aisha Khan", context: "Growth-path question raised last time", due: "Wed", tone: "normal", kind: "oneonone", reportId: "r6" },
  { id: "a5", title: "Share pulse results with the team", context: "Results are in · action not communicated", due: "This week", tone: "normal", kind: "survey" },
];

export const coachingNudges = [
  "Rohan hasn't had a 1:1 in 6 weeks and his sentiment is down 14 pts — a 20-minute check-in this week is your single highest-impact action.",
  "Your recognition coverage (58%) trails the org (61%). Rohan and Sara have had none in 30 days — two quick shout-outs would close most of the gap.",
  "Neha is your highest-sentiment report and top recogniser — a natural fit for a stretch project or mentoring a new joiner.",
];
