/**
 * Vadal.ai dashboard data — shared by every style variant.
 * Sourced from the product requirement docs (Dashboard Inputs):
 * Workforce Health, Attrition & Risk Intelligence, Employee Voice & Sentiment,
 * Recognition & Culture, Manager Effectiveness, Business Impact Correlation.
 */

export const org = {
  name: "oliandhue",
  workspace: "People workspace",
  headcount: 12480,
  user: "Priya",
  date: "Tuesday, 9 June",
  logo: "/brand/oliandhue-icon.svg",
  userImg: "/avatars/user-8.svg",
};

export const health = {
  score: 82,
  delta: 4,
  benchmarkDelta: 7,
  percentile: "top 25%",
  narrative:
    "Your organization ranks in the top 25% of GCC benchmarks. Recognition and 1:1 cadence are lifting the score — workload pressure in Plant Ops is holding it back.",
  drivers: [
    { label: "Recognition +19%", tone: "good" },
    { label: "1:1s 88%", tone: "good" },
    { label: "Workload · Plant Ops", tone: "bad" },
    { label: "Growth clarity", tone: "neutral" },
  ] as const,
};

export const aiBriefing = [
  {
    text: "3 employees at high flight-risk",
    sub: "Mehta, Iyer, Khan — act this week",
    dot: "#f87171",
  },
  {
    text: "Engineering engagement −6 pts",
    sub: "Burnout theme rising · workload",
    dot: "#fbbf24",
  },
  {
    text: "5 manager actions pending",
    sub: "2 overdue 1:1s in Sales",
    dot: "#a5b4fc",
  },
];

export const briefingImpact = {
  label: "Predicted impact if unaddressed",
  value: "−2.1 pts · ₹38L this quarter",
};

export const engagementTrend = {
  series: [64, 66, 65, 68, 67, 71, 70, 73, 72, 75, 78, 77, 80, 82],
  benchmark: [72, 72, 73, 73, 74, 74, 74, 75, 75, 75, 75, 76, 76, 75],
  months: [
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  ],
  insight:
    "Crossed the benchmark in March — recognition program launch is the strongest correlated driver (+0.71).",
};

export const voice = {
  comments: 4120,
  mood: [
    { label: "Positive", pct: 68, color: "#22b873" },
    { label: "Neutral", pct: 22, color: "#fccc4d" },
    { label: "Negative", pct: 10, color: "#f26b66" },
  ],
  themes: [
    { name: "Workload & burnout", mentions: 312, tag: "▲ rising", tone: "bad" },
    { name: "Recognition", mentions: 268, tag: "▲ positive", tone: "good" },
    { name: "Career growth", mentions: 188, tag: "stable", tone: "purple" },
    { name: "Manager support", mentions: 142, tag: "watch", tone: "warn" },
  ] as const,
  quote: {
    text: "Workload has doubled since the reorg — proud of the team, but we're running on fumes.",
    meta: "Engineering · anonymous · 2 days ago",
  },
};

export const actionProgress = {
  closed: 9,
  total: 14,
  pct: 64,
  avgDays: 2.3,
};

export const signals = [
  {
    title: "Participation",
    value: "74%",
    delta: "▼ 3",
    tone: "bad",
    spark: [82, 80, 79, 78, 76, 75, 74],
    note: "Lower in Plant Ops & Night shift",
  },
  {
    title: "Recognitions",
    value: "2,840",
    delta: "▲ 12%",
    tone: "good",
    spark: [12, 16, 18, 22, 26, 31, 38],
    note: "61% coverage · Ownership leads",
  },
  {
    title: "Employees at risk",
    value: "312",
    delta: "▲ 18",
    tone: "bad",
    spark: [262, 270, 280, 288, 298, 306, 312],
    note: "2.5% of workforce · 3 new today",
  },
  {
    title: "Manager score",
    value: "78",
    delta: "▲ 2",
    tone: "good",
    spark: [71, 72, 73, 74, 75, 76, 78],
    note: "1:1 completion 88%",
  },
] as const;

export const flightRisks = [
  {
    initials: "AM",
    name: "A. Mehta",
    team: "Sales · West",
    driver: "Manager — no 1:1 in 6 weeks",
    confidence: "92%",
    level: "High",
    hue: "#6d5df0",
    img: "/avatars/user-1.svg",
  },
  {
    initials: "RI",
    name: "R. Iyer",
    team: "Engineering",
    driver: "Workload — 12 weekend commits",
    confidence: "88%",
    level: "High",
    hue: "#f2884d",
    img: "/avatars/user-2.svg",
  },
  {
    initials: "SK",
    name: "S. Khan",
    team: "Support",
    driver: "Pay & growth — flagged twice",
    confidence: "81%",
    level: "High",
    hue: "#33b28a",
    img: "/avatars/user-3.svg",
  },
  {
    initials: "PN",
    name: "P. Nair",
    team: "Plant Ops",
    driver: "Role clarity — survey signal",
    confidence: "64%",
    level: "Med",
    hue: "#e0669a",
    img: "/avatars/user-4.svg",
  },
] as const;

export const businessImpact = {
  attritionCorr: "−0.74",
  productivityCorr: "+0.61",
  attritionCost: "₹4.2 Cr",
  insight: "Lifting the bottom quartile by 10 pts could save ~₹1.6 Cr / year.",
};

export const styleDeck = [
  {
    slug: "lumen",
    name: "Lumen",
    blurb:
      "Editorial & classy — charcoal rail, warm gradient accents, big display type, soft data viz.",
    status: "ready",
  },
  {
    slug: "glass",
    name: "Glassmorphism",
    blurb: "Frosted surfaces over a vibrant gradient mesh. Bold, Gen-Z energy.",
    status: "ready",
  },
  {
    slug: "minimal",
    name: "Minimal",
    blurb: "Monochrome, type-led, ruthless whitespace. Data does the talking.",
    status: "ready",
  },
  {
    slug: "fintech",
    name: "Fintech calm",
    blurb: "Banking-grade calm — periwinkle, superscript numbers, quiet polish.",
    status: "ready",
  },
  {
    slug: "genalpha",
    name: "GenAlpha",
    blurb: "Cal AI energy — bold black numbers, ring gauges, streaks & missions.",
    status: "ready",
  },
  {
    slug: "volt",
    name: "Volt",
    blurb: "Mission-control dark — volt-lime signals on near-black, red heat for risk.",
    status: "ready",
  },
  {
    slug: "ticker",
    name: "Ticker",
    blurb: "Markets-desk light — engagement traded like a stock; amber tape, dot-matrix heat.",
    status: "ready",
  },
] as const;

/* ── extended datasets (campaigns, actions, recognition, departments) ── */

export const campaigns = [
  {
    name: "Wellness Week",
    audience: "All org",
    reach: 91,
    participation: 76,
    lift: "+5.2",
  },
  {
    name: "Manager 1:1 sprint",
    audience: "People managers",
    reach: 88,
    participation: 84,
    lift: "+3.8",
  },
  {
    name: "Night-shift pulse",
    audience: "Plant Ops",
    reach: 64,
    participation: 41,
    lift: "+1.1",
  },
] as const;

export const actionQueue = [
  {
    title: "Schedule 1:1 with A. Mehta",
    context: "Flight-risk 92% · skipped 6 weeks",
    due: "Today",
    tone: "urgent",
  },
  {
    title: "Recognition overdue — Night shift",
    context: "Zero recognitions in 30 days",
    due: "Tomorrow",
    tone: "warn",
  },
  {
    title: "Workload review — Engineering",
    context: "Burnout theme ▲ · 12 weekend commits",
    due: "This week",
    tone: "normal",
  },
  {
    title: "Close pulse-survey loop — Sales",
    context: "Results in · action not communicated",
    due: "This week",
    tone: "normal",
  },
] as const;

export const recognitionBoard = {
  total: 2840,
  coverage: 61,
  topValue: "Ownership",
  leaders: [
    { initials: "NR", name: "Neha R.", team: "Design", given: 42, hue: "#f2884d", img: "/avatars/user-5.svg" },
    { initials: "PS", name: "Priya S.", team: "Sales", given: 38, hue: "#6d5df0", img: "/avatars/user-6.svg" },
    { initials: "SM", name: "Sara M.", team: "Support", given: 31, hue: "#33b28a", img: "/avatars/user-7.svg" },
  ],
};

export const departments = [
  { name: "Sales", score: 84 },
  { name: "Design", score: 83 },
  { name: "Marketing", score: 79 },
  { name: "Support", score: 79 },
  { name: "Finance", score: 74 },
  { name: "Engineering", score: 71 },
  { name: "HR", score: 77 },
  { name: "Plant Ops", score: 62 },
  { name: "Night shift", score: 58 },
  { name: "Logistics", score: 69 },
] as const;

/* ════════════════════════════════════════════════════════════════════
   Sections from the requirement doc not yet on the dashboard:
   Attrition detail, Manager Effectiveness, Gamification, Knowledge Hub,
   AI assistant usage, Business Impact, Employee Experience Feed.
   ════════════════════════════════════════════════════════════════════ */

/* 2 · Attrition & Risk Intelligence — detail */
export const attrition = {
  predicted: "4.8%",
  predictedDelta: "+0.9",
  segmentation: [
    { level: "High", count: 38, color: "#f26b66" },
    { level: "Medium", count: 124, color: "#fccc4d" },
    { level: "Low", count: 150, color: "#22b873" },
  ],
  drivers: [
    { label: "Manager relationship", pct: 34 },
    { label: "Workload & burnout", pct: 27 },
    { label: "Pay & growth", pct: 22 },
    { label: "Role clarity", pct: 17 },
  ],
  flightTrend: [262, 270, 280, 288, 298, 306, 312],
} as const;

/* 3 · Employee Voice — extras (top concerns, escalations, anon split) */
export const voiceExtra = {
  concerns: [
    "Workload after the reorg",
    "Slow appraisal feedback",
    "Limited growth paths",
    "Night-shift fatigue",
    "Tooling friction",
  ],
  escalations: 4,
  anon: 58,
  identified: 42,
} as const;

/* 4 · Recognition & Culture — extras */
export const recognitionExtra = {
  peer: 72,
  manager: 28,
  themes: [
    { name: "Ownership", pct: 34 },
    { name: "Collaboration", pct: 26 },
    { name: "Innovation", pct: 22 },
    { name: "Customer focus", pct: 18 },
  ],
  topTeams: ["Design", "Sales · West", "Support"],
  lowZones: ["Night shift", "Plant Ops", "Logistics"],
} as const;

/* 6 · Manager Effectiveness */
export const managerSummary = { index: 78, closureRate: 71, withActions: 5 };
export const managers = [
  { name: "Rahul Verma", team: "Sales · West", score: 86, grade: "A", closure: 92, atRisk: 2, recognition: 38, img: "/avatars/user-1.svg" },
  { name: "Anita Desai", team: "Design", score: 84, grade: "A", closure: 88, atRisk: 1, recognition: 42, img: "/avatars/user-5.svg" },
  { name: "Meera Pillai", team: "Support", score: 79, grade: "B", closure: 74, atRisk: 3, recognition: 24, img: "/avatars/user-7.svg" },
  { name: "Imran Shaikh", team: "Engineering", score: 71, grade: "C", closure: 61, atRisk: 6, recognition: 12, img: "/avatars/user-2.svg" },
  { name: "Karan Joshi", team: "Plant Ops", score: 62, grade: "D", closure: 48, atRisk: 9, recognition: 6, img: "/avatars/user-4.svg" },
] as const;

/* 7 · Employee Experience Feed (content layer — the biggest gap) */
export const experience = { dau: "8.1K", wau: "11.2K", dauPct: 65, views: "42K", reactions: "9.3K", comments: "2.1K" };

export type FeedPost = {
  kind: "Leadership" | "Recognition" | "Announcement" | "Team";
  author: string;
  role: string;
  img: string;
  text: string;
  time: string;
  likes: number;
  comments: number;
  pinned?: boolean;
  /** CSS gradient used as a media banner. */
  banner?: string;
  /** Avatar srcs of a few people who reacted. */
  likedBy?: string[];
};

export const feed: FeedPost[] = [
  {
    kind: "Leadership", author: "Pradeep K.", role: "CEO", img: "/avatars/user-6.svg",
    text: "Q2 wrapped strong — thank you all for the energy. Next week we kick off the Wellbeing campaign: focus weeks, no-meeting Wednesdays, and a refreshed benefits guide. 💜",
    time: "2h", likes: 312, comments: 48, pinned: true,
    banner: "linear-gradient(120deg,#c7d2fe,#ddd6fe 45%,#fbcfe8)",
    likedBy: ["/avatars/user-5.svg", "/avatars/user-1.svg", "/avatars/user-7.svg"],
  },
  {
    kind: "Recognition", author: "Neha R.", role: "Design", img: "/avatars/user-5.svg",
    text: "Shoutout to the team for shipping the onboarding flow ahead of schedule. Ownership at its best 👏",
    time: "5h", likes: 186, comments: 22, likedBy: ["/avatars/user-8.svg", "/avatars/user-2.svg"],
  },
  {
    kind: "Team", author: "Aarav S.", role: "Engineering", img: "/avatars/user-2.svg",
    text: "Shipped the new search — about 40% faster on large workspaces. Thanks to everyone who stress-tested it over the weekend.",
    time: "7h", likes: 64, comments: 9,
  },
  {
    kind: "Announcement", author: "People Team", role: "Company-wide", img: "/avatars/user-8.svg",
    text: "The annual engagement survey opens Monday. 10 minutes, fully confidential — your voice shapes next quarter.",
    time: "1d", likes: 94, comments: 12,
  },
  {
    kind: "Recognition", author: "Rahul Verma", role: "Sales · West", img: "/avatars/user-1.svg",
    text: "Huge thanks to the West team for closing the quarter 14% over target — relentless work. 🏆",
    time: "1d", likes: 142, comments: 18, likedBy: ["/avatars/user-5.svg", "/avatars/user-6.svg"],
  },
  {
    kind: "Team", author: "Meera Pillai", role: "Support", img: "/avatars/user-7.svg",
    text: "Kudos to the weekend on-call crew — you kept every SLA green through the release. 🙌",
    time: "2d", likes: 88, comments: 11,
  },
  {
    kind: "Announcement", author: "IT Helpdesk", role: "Company-wide", img: "/avatars/user-3.svg",
    text: "Scheduled maintenance this Saturday 10pm–12am IST. Vadal may be briefly unavailable.",
    time: "3d", likes: 21, comments: 4,
  },
];

export const celebrations = [
  { type: "Birthday", emoji: "🎂", name: "Sara Mehta", team: "Support", detail: "Today", img: "/avatars/user-7.svg" },
  { type: "Work anniversary", emoji: "🎉", name: "Arjun Rao", team: "Engineering", detail: "3 years", img: "/avatars/user-2.svg" },
  { type: "New joiner", emoji: "👋", name: "Dev Patel", team: "Design", detail: "Joined Mon", img: "/avatars/user-3.svg" },
] as const;

/* 9 · Gamification & Participation */
export const gamification = {
  points: "1.2M",
  streaks: 3840,
  leaders: [
    { name: "Neha R.", team: "Design", points: 4820, medal: "#f6b026" },
    { name: "Arjun T.", team: "Sales", points: 4510, medal: "#b8c0cc" },
    { name: "Sara M.", team: "Support", points: 4180, medal: "#cd7f4e" },
  ],
  badges: [
    { name: "Top recogniser", count: 142 },
    { name: "Streak master", count: 318 },
    { name: "Voice champion", count: 96 },
    { name: "Team helper", count: 254 },
  ],
  drop: "Night shift −14%",
} as const;

/* 10 · Knowledge & Communication Hub + AI assistant usage */
export const knowledge = {
  views: "18.4K",
  searchSuccess: 84,
  topQueries: [
    { q: "Leave policy", n: 412 },
    { q: "Reimbursement process", n: 286 },
    { q: "WFH guidelines", n: 224 },
    { q: "Appraisal cycle", n: 198 },
  ],
  gaps: ["Parental leave — no doc", "Relocation policy outdated"],
} as const;
export const aiUsage = {
  questions: "6,240",
  resolved: 78,
  topics: [
    { topic: "Leave & time-off", pct: 31 },
    { topic: "Payroll & benefits", pct: 24 },
    { topic: "Career & growth", pct: 19 },
    { topic: "Policies", pct: 16 },
    { topic: "Wellbeing", pct: 10 },
  ],
  signal: "Spike in “appraisal timeline” questions from Engineering — an anxiety signal ahead of the review cycle.",
} as const;

/* 11 · Business Impact Correlation (the strategic differentiator) */
export const impact = {
  attritionCorr: "−0.74",
  productivityCorr: "+0.61",
  revenueCorr: "+0.52",
  attritionCost: "₹4.2 Cr",
  roi: "3.4×",
  topVsBottom: { top: 91, bottom: 58 },
  insight: "Lifting the bottom-quartile teams by 10 pts could save ~₹1.6 Cr a year and add ~4% to delivery throughput.",
} as const;

/* ════════════════════════════════════════════════════════════════════
   HOME — the personalized employee daily workspace (route /product/home).
   Everything here is "me" (Priya's own view), not org analytics — the
   doc's "HR dashboard → employee daily workspace" shift.
   ════════════════════════════════════════════════════════════════════ */

export const me = {
  name: "Priya",
  fullName: "Priya Sharma",
  email: "priya@oliandhue.com",
  greeting: "Good morning",
  role: "Product Designer · Design",
  title: "Product Designer",
  team: "Design",
  img: "/avatars/user-8.svg",
  streak: 12,
  points: 4180,
  rank: 7,
  nextBadge: { name: "Voice champion", left: 2 },
};

export const moods = [
  { label: "Great", emoji: "😄", color: "#22b873" },
  { label: "Good", emoji: "🙂", color: "#8b7cf8" },
  { label: "Okay", emoji: "😐", color: "#e0a020" },
  { label: "Struggling", emoji: "😔", color: "#e0708a" },
] as const;

export const myDay = [
  { title: "Pulse survey · 6 quick questions", meta: "Closes Friday · 2 min", tag: "Survey", accent: "#8b7cf8", action: "Start" },
  { title: "1:1 with Anita", meta: "Today · 3:00 PM", tag: "Meeting", accent: "#33b28a", action: "Prep" },
  { title: "Recognise a teammate", meta: "You haven’t this week", tag: "Recognition", accent: "#f2884d", action: "Give" },
  { title: "Micro-learning · Giving feedback", meta: "5 min · earns 50 pts", tag: "Learning", accent: "#e0a3c8", action: "Resume" },
] as const;

export const myRecognition = [
  { from: "Anita Desai", text: "Brilliant work on the onboarding flow — clean and shipped on time.", value: "Ownership", time: "1d", img: "/avatars/user-5.svg" },
  { from: "Rahul Verma", text: "Thanks for jumping into the Sales dashboard review.", value: "Collaboration", time: "3d", img: "/avatars/user-1.svg" },
] as const;

export const communities = [
  { name: "Design Guild", members: 184, color: "#8b7cf8", fresh: 3 },
  { name: "Women in Tech", members: 412, color: "#ef7faf", fresh: 7 },
  { name: "Sales Floor", members: 268, color: "#33b28a", fresh: 0 },
  { name: "New Joiners", members: 96, color: "#f2884d", fresh: 2 },
] as const;

export const poll = {
  q: "Which wellbeing perk would you use most?",
  votes: 1820,
  options: [
    { label: "Flexible hours", pct: 44 },
    { label: "Mental-health days", pct: 33 },
    { label: "Gym / fitness", pct: 23 },
  ],
} as const;

/* Today's calendar — synced from Google Calendar (Home §4). `kind` drives the
   accent; `prep` marks events Vadal can prep for. */
export const myCalendar = [
  { time: "10:00", title: "Design standup", kind: "Team", mins: 15, with: "Design pod", now: false, prep: false },
  { time: "13:00", title: "Roadmap review", kind: "Review", mins: 45, with: "Product + Design", now: true, prep: true },
  { time: "15:00", title: "1:1 with Anita", kind: "Meeting", mins: 30, with: "Anita Desai", now: false, prep: true },
  { time: "16:30", title: "Design critique", kind: "Team", mins: 60, with: "Design pod", now: false, prep: false },
] as const;

/* Daily-adoption hooks (Home §6) — optional widgets that give people a reason to
   open the app every day. `connected` seeds which are already on. */
export const homeHooks = [
  { key: "health", label: "Health & steps", emoji: "⌚", desc: "Sync Fitbit — earn streak points for staying active.", connected: true, stat: "8,240 steps · 6-day streak" },
  { key: "learning", label: "Daily learning", emoji: "📚", desc: "A 5-minute micro-lesson, earns 50 points.", connected: true, stat: "Giving feedback · 2 min left" },
  { key: "visitor", label: "Visitor pass", emoji: "🚪", desc: "Pre-register guests and skip the front desk.", connected: false, stat: "" },
  { key: "commute", label: "Commute & parking", emoji: "🅿️", desc: "Reserve a desk or parking spot for office days.", connected: false, stat: "" },
] as const;

/* ════════════════════════════════════════════════════════════════════
   HEADER — global app chrome (TopBar): notifications, search index, people.
   ════════════════════════════════════════════════════════════════════ */

export type NotifKind = "recognition" | "mention" | "survey" | "manager" | "system" | "celebration";

export type Notif = {
  id: string;
  kind: NotifKind;
  /** Bold lead — usually a person or source. */
  actor: string;
  /** What happened. */
  body: string;
  time: string;
  read: boolean;
  /** Avatar src; system notifications fall back to a kind icon. */
  img?: string;
  href?: string;
};

export const notifications: Notif[] = [
  { id: "n1", kind: "recognition", actor: "Anita Desai", body: "recognised you for Ownership — “clean and shipped on time.”", time: "8m", read: false, img: "/avatars/user-5.svg", href: "/product/home" },
  { id: "n2", kind: "mention", actor: "Rahul Verma", body: "mentioned you in a comment on the Sales dashboard review.", time: "40m", read: false, img: "/avatars/user-1.svg", href: "/product/feed" },
  { id: "n3", kind: "manager", actor: "1:1 with Anita", body: "starts in 2 hours — your prep doc is pinned to Your day.", time: "1h", read: false, img: "/avatars/user-5.svg", href: "/product/home" },
  { id: "n4", kind: "survey", actor: "Pulse survey", body: "6 quick questions close Friday — 2 minutes left to add your voice.", time: "3h", read: true, href: "/product/home" },
  { id: "n5", kind: "celebration", actor: "Sara Mehta", body: "has a birthday today 🎂 — send a quick note.", time: "5h", read: true, img: "/avatars/user-7.svg", href: "/product/home" },
  { id: "n6", kind: "system", actor: "Vadal", body: "Your weekly engagement summary is ready to view.", time: "1d", read: true, href: "/product" },
];

export type Person = { name: string; role: string; team: string; img: string };

/** Directory used by header search. */
export const people: Person[] = [
  { name: "Anita Desai", role: "Design Lead", team: "Design", img: "/avatars/user-5.svg" },
  { name: "Rahul Verma", role: "Sales Manager", team: "Sales · West", img: "/avatars/user-1.svg" },
  { name: "Aarav Sharma", role: "Engineer", team: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Meera Pillai", role: "Support Lead", team: "Support", img: "/avatars/user-7.svg" },
  { name: "Neha Rao", role: "Product Designer", team: "Design", img: "/avatars/user-5.svg" },
  { name: "Imran Shaikh", role: "Eng Manager", team: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Pradeep Kumar", role: "CEO", team: "Leadership", img: "/avatars/user-6.svg" },
  { name: "Sara Mehta", role: "Support Specialist", team: "Support", img: "/avatars/user-7.svg" },
];

/** Quick-action commands surfaced in the command palette. */
export const quickActions = [
  { label: "Apply for leave", hint: "Request time off" },
  { label: "Give kudos", hint: "Recognise a teammate" },
  { label: "Start a pulse survey", hint: "Ask your team" },
  { label: "Search the knowledge base", hint: "Policies & how-tos" },
] as const;
