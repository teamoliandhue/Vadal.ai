/**
 * Recognition module data (route /product/recognition · "Engage" group).
 * Peer & manager appreciation: a values-tagged kudos wall, giver/receiver
 * leaderboards, a company-values breakdown, coverage + cold-zone insights,
 * and celebrations. Figures are kept consistent with the org-level recognition
 * numbers in lib/data.ts (recognitionBoard / recognitionExtra).
 */

/** Company values kudos are tagged with. `color` drives the chip + bar hue. */
export type Value = { name: string; emoji: string; color: string; pct: number; blurb: string };

export const values: Value[] = [
  { name: "Ownership", emoji: "🎯", color: "var(--purple)", pct: 34, blurb: "Sees it through, end to end." },
  { name: "Collaboration", emoji: "🤝", color: "var(--success)", pct: 26, blurb: "Lifts the people around them." },
  { name: "Innovation", emoji: "💡", color: "var(--info)", pct: 22, blurb: "Finds the better way." },
  { name: "Customer focus", emoji: "⭐", color: "var(--warning)", pct: 18, blurb: "Starts from the customer." },
];

export const recognizeStats = {
  total30d: 2840,
  totalDelta: 12, // % vs previous 30d
  coverage: 61, // % of people who gave OR received in 30d
  coverageDelta: 4,
  peerPct: 72,
  managerPct: 28,
  topValue: "Ownership",
  participation: 68,
};

export type Person = { name: string; team: string; img: string };

export type Kudos = {
  id: string;
  from: Person;
  to: Person;
  value: string; // value name
  message: string;
  time: string;
  reactions: number;
  points: number;
  /** manager-given kudos carry a little more weight in the wall */
  manager?: boolean;
};

export const wall: Kudos[] = [
  {
    id: "k1",
    from: { name: "Anita Desai", team: "Design", img: "/avatars/user-5.svg" },
    to: { name: "Priya Sharma", team: "Design", img: "/avatars/user-8.svg" },
    value: "Ownership", manager: true,
    message: "Brilliant work on the onboarding flow — clean, considered, and shipped a day early. Textbook ownership.",
    time: "1h", reactions: 24, points: 50,
  },
  {
    id: "k2",
    from: { name: "Rahul Verma", team: "Sales · West", img: "/avatars/user-1.svg" },
    to: { name: "Aarav Sharma", team: "Engineering", img: "/avatars/user-2.svg" },
    value: "Collaboration",
    message: "Jumped on the pricing-page bug at 9pm before the West demo. Saved the quarter-close. 🙏",
    time: "3h", reactions: 31, points: 40,
  },
  {
    id: "k3",
    from: { name: "Meera Pillai", team: "Support", img: "/avatars/user-7.svg" },
    to: { name: "Sara Mehta", team: "Support", img: "/avatars/user-7.svg" },
    value: "Customer focus",
    message: "Turned an angry escalation into a five-star review. That's the whole job, done beautifully.",
    time: "5h", reactions: 18, points: 40,
  },
  {
    id: "k4",
    from: { name: "Neha Rao", team: "Design", img: "/avatars/user-5.svg" },
    to: { name: "Dev Patel", team: "Design", img: "/avatars/user-3.svg" },
    value: "Innovation",
    message: "The auto-layout token idea shaved hours off the handoff. Welcome-week Dev is already shipping. 💡",
    time: "8h", reactions: 15, points: 40,
  },
  {
    id: "k5",
    from: { name: "Imran Shaikh", team: "Engineering", img: "/avatars/user-2.svg" },
    to: { name: "Aarav Sharma", team: "Engineering", img: "/avatars/user-2.svg" },
    value: "Ownership", manager: true,
    message: "Owned the search rewrite from spec to rollout — 40% faster and zero incidents. Proud of you.",
    time: "1d", reactions: 42, points: 50,
  },
  {
    id: "k6",
    from: { name: "Priya Sharma", team: "Design", img: "/avatars/user-8.svg" },
    to: { name: "Meera Pillai", team: "Support", img: "/avatars/user-7.svg" },
    value: "Collaboration",
    message: "Thanks for the research readout — reshaped how we're framing the whole feature. 🤝",
    time: "1d", reactions: 12, points: 40,
  },
];

/** Top givers ("recognisers") — matches recognitionBoard leaders in data.ts. */
export const topGivers: (Person & { given: number })[] = [
  { name: "Neha Rao", team: "Design", img: "/avatars/user-5.svg", given: 42 },
  { name: "Priya Sharma", team: "Sales", img: "/avatars/user-8.svg", given: 38 },
  { name: "Sara Mehta", team: "Support", img: "/avatars/user-7.svg", given: 31 },
  { name: "Rahul Verma", team: "Sales · West", img: "/avatars/user-1.svg", given: 28 },
  { name: "Anita Desai", team: "Design", img: "/avatars/user-5.svg", given: 24 },
];

/** Most recognised ("receivers"). */
export const topReceivers: (Person & { got: number; topValue: string })[] = [
  { name: "Aarav Sharma", team: "Engineering", img: "/avatars/user-2.svg", got: 36, topValue: "Ownership" },
  { name: "Dev Patel", team: "Design", img: "/avatars/user-3.svg", got: 29, topValue: "Innovation" },
  { name: "Meera Pillai", team: "Support", img: "/avatars/user-7.svg", got: 27, topValue: "Collaboration" },
  { name: "Priya Sharma", team: "Design", img: "/avatars/user-8.svg", got: 22, topValue: "Ownership" },
  { name: "Arjun Rao", team: "Engineering", img: "/avatars/user-2.svg", got: 19, topValue: "Customer focus" },
];

/** Recognition coverage by team → drives the cold-zone insight. */
export type Zone = "strong" | "watch" | "cold";
export const zoneOf = (coverage: number): Zone => (coverage >= 75 ? "strong" : coverage >= 55 ? "watch" : "cold");

export const coverage: { team: string; pct: number }[] = [
  { team: "Design", pct: 92 },
  { team: "Sales · West", pct: 88 },
  { team: "Support", pct: 79 },
  { team: "Marketing", pct: 74 },
  { team: "HR", pct: 71 },
  { team: "Finance", pct: 66 },
  { team: "Engineering", pct: 63 },
  { team: "Logistics", pct: 48 },
  { team: "Plant Ops", pct: 41 },
  { team: "Night shift", pct: 34 },
];

export const coldInsight =
  "Night shift, Plant Ops and Logistics have had near-zero recognition for 30 days — the same teams driving your flight-risk. A single manager shout-out lifts 30-day retention intent by ~8 pts. Nudge their managers to give one this week.";

/** Upcoming moments worth a note (mirrors celebrations in data.ts). */
export const celebrations = [
  { type: "Birthday", emoji: "🎂", name: "Sara Mehta", team: "Support", detail: "Today", img: "/avatars/user-7.svg" },
  { type: "Work anniversary", emoji: "🎉", name: "Arjun Rao", team: "Engineering", detail: "3 years today", img: "/avatars/user-2.svg" },
  { type: "New joiner", emoji: "👋", name: "Dev Patel", team: "Design", detail: "Joined Monday", img: "/avatars/user-3.svg" },
] as const;

/** Directory used by the "give recognition" recipient picker. */
export const teammates: Person[] = [
  { name: "Anita Desai", team: "Design", img: "/avatars/user-5.svg" },
  { name: "Rahul Verma", team: "Sales · West", img: "/avatars/user-1.svg" },
  { name: "Aarav Sharma", team: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Meera Pillai", team: "Support", img: "/avatars/user-7.svg" },
  { name: "Neha Rao", team: "Design", img: "/avatars/user-5.svg" },
  { name: "Imran Shaikh", team: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Sara Mehta", team: "Support", img: "/avatars/user-7.svg" },
  { name: "Dev Patel", team: "Design", img: "/avatars/user-3.svg" },
  { name: "Arjun Rao", team: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Karan Joshi", team: "Plant Ops", img: "/avatars/user-4.svg" },
];

/** AI-drafted kudos lines, keyed loosely by value, for the "help me word it" action. */
export const draftLines: Record<string, string[]> = {
  Ownership: [
    "took full ownership of {x} and carried it over the line without being asked — exactly the standard we want.",
    "owned {x} end to end: spotted the risk early, made the call, and shipped it clean.",
  ],
  Collaboration: [
    "dropped everything to help with {x} — the kind of teammate that makes the whole team better.",
    "made {x} a team win, pulling in the right people and sharing the credit generously.",
  ],
  Innovation: [
    "found a genuinely better way to do {x} — simpler, faster, and now the new default.",
    "turned {x} on its head with an idea none of us had considered. 💡",
  ],
  "Customer focus": [
    "put the customer first on {x} and it showed in the outcome — thank you.",
    "went out of their way on {x} to make the customer experience feel effortless.",
  ],
};
