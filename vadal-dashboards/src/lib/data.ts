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
