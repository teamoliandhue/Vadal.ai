/* Sentiment v2 (spec 050) — how people feel, what about, and where.

   What the first build got wrong, and what this data now carries instead:
   · a theme's arrow said "mentions went up" in red, so Recognition — rising
     and positive — read as bad news. A theme now says whether it's getting
     better or worse, which is the question anyone reading it is asking;
   · a theme had one label (positive / negative) when a theme is a mix. It now
     carries its split, and how that split is changing;
   · months ended in June. They end in the current month.
   · "where is it worst" had no answer. Each team has a net score, a change,
     and the themes it's driving — with small teams withheld, never estimated.
   Deterministic demo data. */
import type { Topic } from "./pulse";

export const MIN_N = 5;

export const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
/** Share of comments, per month. Neutral is the rest. */
export const positiveSeries = [55, 57, 58, 56, 59, 61, 60, 62, 63, 64, 62, 64];
export const negativeSeries = [18, 16, 16, 18, 15, 14, 15, 13, 13, 12, 14, 12];

export const TOTAL_COMMENTS = 4120;
export const sources = [
  { label: "Survey comments", value: 2560 },
  { label: "Social posts and replies", value: 860 },
  { label: "Team chat (opted-in channels)", value: 490 },
  { label: "Always-on check-ins", value: 210 },
];

export type Split = [number, number, number]; // positive · neutral · negative, sums to 100
export type Mood = "better" | "worse" | "steady";
export type Voice = { text: string; team: string; when: string };
export type SentimentTheme = {
  name: string;
  topic: Topic;
  mentions: number;
  previous: number;          // mentions last period
  split: Split;
  mood: Mood;
  /** Mentions over the last six months, oldest first. */
  trend: number[];
  /** Share of mentions by team, in % — the rest is spread thin. */
  teams: Record<string, number>;
  read: string;              // Nudge's one-line read
  voices: Voice[];
};

export const themes: SentimentTheme[] = [
  {
    name: "Workload & burnout", topic: "workload", mentions: 312, previous: 226, split: [8, 22, 70], mood: "worse",
    trend: [150, 170, 180, 226, 270, 312], teams: { "Plant Ops": 41, Engineering: 33, Support: 14 },
    read: "Up 38% since the reorg, and 70% of it negative. Plant Ops and Engineering carry three quarters of it — on-call and weekend shifts come up most.",
    voices: [
      { text: "Workload has doubled since the reorg — proud of the team, but we're running on fumes.", team: "Engineering", when: "2 days ago" },
      { text: "Another weekend of on-call. This isn't sustainable.", team: "Plant Ops", when: "yesterday" },
      { text: "The three-week rota helped. The overtime didn't go away.", team: "Plant Ops", when: "4 days ago" },
    ],
  },
  {
    name: "Recognition", topic: "recognition", mentions: 268, previous: 230, split: [78, 15, 7], mood: "better",
    trend: [180, 196, 205, 230, 251, 268], teams: { Design: 18, Sales: 24, Engineering: 20 },
    read: "Rising for three months and overwhelmingly positive — shout-outs in huddles and all-hands are what people mention.",
    voices: [
      { text: "The new recognition programme actually changed how the team feels day to day.", team: "Design", when: "2 days ago" },
      { text: "Getting a shout-out in the all-hands meant a lot.", team: "Sales", when: "4 days ago" },
    ],
  },
  {
    name: "Team & belonging", topic: "belonging", mentions: 214, previous: 205, split: [72, 20, 8], mood: "steady",
    trend: [198, 201, 204, 205, 210, 214], teams: { Design: 16, Sales: 22, Support: 18 },
    read: "Steady and warm. People talk about their own team far more kindly than about the company.",
    voices: [
      { text: "My team is the reason I stay.", team: "Support", when: "3 days ago" },
      { text: "Team lunches are small but they matter.", team: "Sales", when: "a week ago" },
    ],
  },
  {
    name: "Pay & growth", topic: "growth", mentions: 176, previous: 181, split: [12, 30, 58], mood: "steady",
    trend: [160, 172, 178, 181, 179, 176], teams: { Support: 22, Engineering: 26, Sales: 19 },
    read: "Not growing, but not easing either. The question is the same every month: how do pay bands map to the new levels?",
    voices: [
      { text: "Still unclear how pay bands map to the new levels.", team: "Sales", when: "4 days ago" },
      { text: "I'd like a clearer path to senior.", team: "Support", when: "3 days ago" },
    ],
  },
  {
    name: "Appraisal timeline", topic: "growth", mentions: 61, previous: 18, split: [5, 35, 60], mood: "worse",
    trend: [12, 14, 15, 18, 34, 61], teams: { Engineering: 64, Sales: 14 },
    read: "Tripled in a month, mostly Engineering, ahead of the review cycle. It's uncertainty more than anger — people want dates.",
    voices: [
      { text: "When does the appraisal window actually open this cycle?", team: "Engineering", when: "1 hour ago" },
      { text: "Nobody on my team knows when reviews start.", team: "Engineering", when: "yesterday" },
    ],
  },
  {
    name: "Tools & process", topic: "tools", mentions: 142, previous: 171, split: [18, 47, 35], mood: "better",
    trend: [190, 184, 176, 171, 158, 142], teams: { Engineering: 38, Support: 30 },
    read: "Complaints are falling since single sign-on was fixed. What's left is switching between too many systems.",
    voices: [
      { text: "Tooling is fine, but switching between systems still eats time.", team: "Support", when: "yesterday" },
      { text: "The deploy tool logged me out mid-task again.", team: "Engineering", when: "4 hours ago" },
    ],
  },
  {
    name: "Leadership clarity", topic: "manager", mentions: 98, previous: 64, split: [20, 45, 35], mood: "worse",
    trend: [58, 60, 61, 64, 80, 98], teams: { "Plant Ops": 30, Engineering: 28 },
    read: "Rising since the reorg announcement. Mostly questions, not complaints — people want to know what changes for them.",
    voices: [
      { text: "What does the new structure mean for my team?", team: "Plant Ops", when: "2 days ago" },
      { text: "We heard about the reorg on the news before the town hall.", team: "Engineering", when: "5 days ago" },
    ],
  },
];

export type TeamMood = { team: string; people: number; net: number; change: number; top?: string };
export const teamMoods: TeamMood[] = [
  { team: "Plant Ops", people: 1520, net: 38, change: -9, top: "Workload & burnout" },
  { team: "Engineering", people: 980, net: 44, change: -6, top: "Appraisal timeline" },
  { team: "Support", people: 760, net: 47, change: -1, top: "Pay & growth" },
  { team: "Sales", people: 1240, net: 58, change: 3, top: "Recognition" },
  { team: "Design", people: 210, net: 66, change: 5, top: "Recognition" },
  { team: "Leadership", people: 4, net: 0, change: 0 },
  { team: "DEI council", people: 3, net: 0, change: 0 },
];

export const nudgeRead = [
  "Mood is holding steady at net 52 — recognition and team belonging are still what lifts it.",
  "Workload is the drag and it's getting worse, concentrated in Plant Ops and Engineering.",
  "New this month: questions about the appraisal timeline tripled in Engineering. Dates would settle most of it.",
];

export const net = (i: number) => positiveSeries[i] - negativeSeries[i];
