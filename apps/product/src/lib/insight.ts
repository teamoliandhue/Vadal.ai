/* Insight — risk without naming people, succession, and recommendations
   (Decision intelligence, spec 061).

   Insight promises Workforce Analytics · Risk Intelligence · Succession
   Intelligence · Recommendations. Analytics and a version of risk existed.
   Two problems and two gaps:

   · THE RISK TABLE NAMED PEOPLE. "Who might leave", with a driver and a
     confidence score per person, is exactly what Trust says this product
     never does: it never scores, ranks or rates an individual. It also does
     not work — a manager who is told a name acts on the name, not on the rota
     that caused it. Risk is therefore a team and a driver, never a person.
   · SUCCESSION did not exist, and it is the question a CEO asks first: if this
     person left on Friday, what happens on Monday.
   · RECOMMENDATIONS were a four-item action queue. A recommendation is only
     worth the screen if it carries the numbers behind it, what it will take,
     and what would change our mind.

   Deterministic demo data. */

/* ── 1 · risk intelligence, at team level ────────────────────────── */
export type RiskLevel = "Watch" | "Under strain" | "Serious";

export type TeamRisk = {
  id: string;
  team: string;
  people: number;
  level: RiskLevel;
  /** what is visible to everyone on that team — never a private answer */
  drivers: string[];
  /** what moved, and by how much */
  changed: string;
  /** leavers in the last 6 months, as a share of the team */
  leftSix: number;
  action: string;
  owner: string;
};

export const teamRisk: TeamRisk[] = [
  {
    id: "r-night", team: "Night shift", people: 1650, level: "Serious",
    drivers: ["Rota published under a week ahead", "No hot food after 1am", "Two supervisor changes since May"],
    changed: "Engagement down 6 points this quarter; workload is the top theme in Listen.",
    leftSix: 9.4,
    action: "Fix the rota notice period first — it is the one every other complaint hangs off.",
    owner: "Plant leadership + People",
  },
  {
    id: "r-logi", team: "Logistics", people: 1500, level: "Under strain",
    drivers: ["Reachable only by SMS", "Pay band unchanged for two review cycles", "No manager 1:1 for 61% of drivers"],
    changed: "We hear from 16% of them. The score we have is built on too few answers to lean on.",
    leftSix: 7.1,
    action: "Coverage before conclusions: get the depot kiosk live, then ask.",
    owner: "Their HRBP",
  },
  {
    id: "r-eng", team: "Engineering", people: 1720, level: "Under strain",
    drivers: ["On-call every third weekend", "Appraisal window moved twice", "Deploy tooling logs people out mid-task"],
    changed: "Weekly use down 4 points in four weeks; workload comments up by half.",
    leftSix: 6.2,
    action: "Publish the appraisal dates. It costs nothing and it is half the noise.",
    owner: "Engineering leadership",
  },
  {
    id: "r-support", team: "Support", people: 1340, level: "Watch",
    drivers: ["Queue length up since the festive season", "Two team leads on long leave"],
    changed: "Score steady, but tone has slipped for three weeks running.",
    leftSix: 4.8,
    action: "Watching. Nothing to act on yet — a three-question pulse in a fortnight if tone keeps sliding.",
    owner: "Their HRBP",
  },
  {
    id: "r-finance", team: "Finance", people: 610, level: "Watch",
    drivers: ["Month-end crunch", "Use fell 2 points in four weeks"],
    changed: "People signed in and drifted away rather than complaining, which is the quieter problem.",
    leftSix: 3.2,
    action: "Ask them what fits month-end before changing anything.",
    owner: "Their HRBP",
  },
];

/** Said on the screen, because the old version of this table broke it. */
export const riskPromise = [
  "Risk is a team and a reason, never a person. Nobody here is scored, ranked or flagged.",
  "Every driver is something the whole team can see — a rota, a pay band, a tooling problem — not something someone told us in confidence.",
  "A team under the anonymity floor is not shown at all, rather than shown as calm.",
];

export const riskStats = {
  teams: teamRisk.length,
  serious: teamRisk.filter((t) => t.level === "Serious").length,
  people: teamRisk.reduce((n, t) => n + t.people, 0),
  /** predicted 12-month attrition, company-wide */
  predicted: 11.6,
  predictedDelta: -2.6,
};

/* ── 2 · succession intelligence ─────────────────────────────────── */
export type Readiness = "Ready now" | "1–2 years" | "No cover";

export type Successor = { name: string; img: string; readiness: Readiness; note: string };

export type CriticalRole = {
  id: string;
  role: string;
  holder: string;
  holderImg: string;
  team: string;
  /** why losing this role hurts */
  whyCritical: string;
  successors: Successor[];
  /** the honest sentence about the gap */
  gap: string;
};

export const criticalRoles: CriticalRole[] = [
  {
    id: "c1", role: "Plant Manager · Hosur", holder: "Vikram Joshi", holderImg: "/avatars/user-4.svg", team: "Plant Ops",
    whyCritical: "Signs off night-shift access, safety and the rota. Nothing on that site moves without it.",
    successors: [
      { name: "Ravi Prasad", img: "/avatars/user-2.svg", readiness: "1–2 years", note: "Runs A crew well; has not held a safety sign-off." },
    ],
    gap: "One name, not ready. This is the role that would hurt most on a Monday morning.",
  },
  {
    id: "c2", role: "Head of Engineering", holder: "Imran Shaikh", holderImg: "/avatars/user-2.svg", team: "Engineering",
    whyCritical: "Owns the platform roadmap and every vendor relationship in it.",
    successors: [
      { name: "Sneha Rao", img: "/avatars/user-5.svg", readiness: "Ready now", note: "Has covered twice, including a vendor renegotiation." },
      { name: "Arjun Nair", img: "/avatars/user-1.svg", readiness: "1–2 years", note: "Strong technically; no budget ownership yet." },
    ],
    gap: "Covered.",
  },
  {
    id: "c3", role: "Payroll Lead", holder: "Meera Pillai", holderImg: "/avatars/user-7.svg", team: "Payroll",
    whyCritical: "The only person who has run a full and final settlement end to end.",
    successors: [],
    gap: "No cover at all. One person, one process, twelve thousand salaries.",
  },
  {
    id: "c4", role: "People Partner · Frontline", holder: "Neha Rao", holderImg: "/avatars/user-5.svg", team: "People",
    whyCritical: "The only HRBP the night shift and logistics teams will actually talk to.",
    successors: [
      { name: "Farah Khan", img: "/avatars/user-8.svg", readiness: "1–2 years", note: "Knows the teams; has not handled a grievance alone." },
      { name: "Pradeep Kumar", img: "/avatars/user-6.svg", readiness: "1–2 years", note: "Strong on process, new to the plants." },
    ],
    gap: "Two people a year or two away, and a relationship that does not transfer with a handover note.",
  },
  {
    id: "c5", role: "Design Lead", holder: "Anita Desai", holderImg: "/avatars/user-5.svg", team: "Design",
    whyCritical: "Owns the design system every product team builds against.",
    successors: [
      { name: "Tanvi Joshi", img: "/avatars/user-7.svg", readiness: "Ready now", note: "A boomerang hire who came back to lead this work." },
    ],
    gap: "Covered.",
  },
];

/** Readiness is a judgement People record after a conversation. It is never computed. */
export const successionRule =
  "Readiness is set by the People team after a conversation with the person and their manager. Vadal never infers it from engagement, tenure or a performance score — and it never tells someone they are a successor.";

export const successionStats = {
  roles: criticalRoles.length,
  covered: criticalRoles.filter((r) => r.successors.some((s) => s.readiness === "Ready now")).length,
  noCover: criticalRoles.filter((r) => r.successors.length === 0).length,
  bench: criticalRoles.flatMap((r) => r.successors).length,
};

/* ── 3 · recommendations ─────────────────────────────────────────── */
export type Confidence = "High" | "Medium" | "Low";

export type Recommendation = {
  id: string;
  title: string;
  /** the numbers behind it */
  because: string[];
  expect: string;
  owner: string;
  effort: string;
  confidence: Confidence;
  /** why that confidence, honestly */
  basis: string;
  /** the falsifier — what would make us drop this */
  changeMind: string;
  /** where acting on it goes */
  action: { label: string; href: string };
};

export const recommendations: Recommendation[] = [
  {
    id: "rec-rota", title: "Publish the night-shift rota three weeks ahead, everywhere",
    because: [
      "Rota is the most-used word in Listen — 184 mentions, most of them negative.",
      "Where it already moved to three weeks, the same teams wrote thank-you notes.",
      "Night shift attrition is 9.4% over six months against a company 6.1%.",
    ],
    expect: "The single biggest complaint on the floor stops being a complaint. Expect the workload theme to fall before the score moves.",
    owner: "Plant leadership", effort: "A scheduling change, no system work",
    confidence: "High", basis: "We have seen it work on one site already, with the same crews.",
    changeMind: "If the three-week sites show no change in the next pulse, this is not the lever we think it is.",
    action: { label: "Open the rota case in Flow", href: "/product/flow" },
  },
  {
    id: "rec-appraisal", title: "Publish the appraisal window dates today",
    because: [
      "88 mentions of the appraisal window, all negative, all asking the same question.",
      "The desk cannot answer it — the policy document is two years old.",
      "It is the second theme in Engineering, behind on-call.",
    ],
    expect: "Removes a whole category of question from the desk and from 1:1s.",
    owner: "People team", effort: "An afternoon",
    confidence: "High", basis: "The question is explicit. People are asking for a date, not a change.",
    changeMind: "Nothing. Even if it changes no score, people are entitled to know the date.",
    action: { label: "Update the policy in Knowledge", href: "/product/knowledge" },
  },
  {
    id: "rec-payroll", title: "Put a second person through a full and final settlement",
    because: [
      "One person has ever run one end to end.",
      "Two settlements are late right now, both waiting on the same sign-off.",
      "Succession shows no cover at all for the role.",
    ],
    expect: "Removes a single point of failure that affects every leaver's last impression.",
    owner: "Finance + People", effort: "Two settlements, shadowed",
    confidence: "High", basis: "This is not a prediction. It is a count of one.",
    changeMind: "Nothing short of hiring a second lead.",
    action: { label: "See the exit packs", href: "/product/alumni" },
  },
  {
    id: "rec-logistics", title: "Get the depot kiosk live before drawing conclusions about Logistics",
    because: [
      "We hear from 16% of drivers — the lowest coverage anywhere.",
      "Their score sits on too few answers to act on, and the anonymity floor hides most cuts.",
      "SMS is the only channel reaching them, and it carries two questions at most.",
    ],
    expect: "A number worth trusting. Not an improvement — an honest reading.",
    owner: "Vadal + your IT", effort: "One QR kiosk per depot",
    confidence: "Medium", basis: "The kiosk worked on the plant floor; a depot gate is a different habit.",
    changeMind: "If depot kiosk use is under 20% after a month, ask at the handover instead.",
    action: { label: "See coverage in Listen", href: "/product/listen" },
  },
  {
    id: "rec-finance", title: "Ask Finance what fits month-end, before changing anything",
    because: [
      "84 of 610 signed in and stopped — quiet drift, not complaint.",
      "Use fell 2 points in four weeks while every other desk team rose.",
      "The one thing they have said is that the daily check-in lands mid-close.",
    ],
    expect: "Either a small timing change, or a reason to leave them alone.",
    owner: "Their HRBP", effort: "A three-question pulse",
    confidence: "Low", basis: "One comment and a use figure. That is a hypothesis, not a finding.",
    changeMind: "If the pulse says the check-in is fine, the drift is about something else and we look again.",
    action: { label: "Draft it in Pulse", href: "/product/pulse" },
  },
];

/** Things the data could support and we are deliberately not doing. */
export const notRecommending = [
  "Naming the people most likely to leave. It is a rating of a person, it leaks, and it makes managers manage the list instead of the cause.",
  "A manager league table. The grade tells a manager nothing they can act on, and it punishes whoever inherited the hardest team.",
  "Acting on Logistics' engagement score. We hear from too few of them for that number to mean anything yet.",
];

export const recStats = {
  open: recommendations.length,
  high: recommendations.filter((r) => r.confidence === "High").length,
};
