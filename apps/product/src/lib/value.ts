/* Launch — change management and ROI (Enterprise AI platform, spec 060).

   Launch promises Guided Implementation · Change Management · Success Partner
   · ROI Tracking. The phases, the named partner and the training were built.
   The other two were a line and a chart:

   · CHANGE MANAGEMENT is not the adoption curve. It is the people who are not
     on it — who they are, why, and what the next thing to try is — plus the
     champions doing the work and what has actually been said to whom.
   · ROI TRACKING is only honest against a baseline that was written down
     before go-live, and only credible if it says which numbers Vadal can claim
     and which it cannot. A product that claims a fall in attrition as its own
     is lying, and everyone in the room knows it.

   Deterministic demo data; headcounts and adoption match lib/adoption. */

export const baseline = {
  taken: "July 2025",
  how: "Measured in the four weeks before go-live, with the People team, and written down then — not reconstructed afterwards.",
  people: 12480,
};

/** How much of a change Vadal can honestly claim. */
export type Claim = "ours" | "shared" | "context";

export const CLAIM_LABEL: Record<Claim, string> = {
  ours: "Vadal's doing",
  shared: "Partly ours",
  context: "Context, not a claim",
};

export type Outcome = {
  id: string;
  metric: string;
  before: number;
  now: number;
  unit: "%" | "days" | "hours" | "per week";
  /** which direction is good */
  better: "up" | "down";
  claim: Claim;
  note: string;
};

export const outcomes: Outcome[] = [
  {
    id: "deflect", metric: "HR questions answered without a person", before: 0, now: 61, unit: "%", better: "up", claim: "ours",
    note: "424 questions a month now end at the desk. Every escalation still reaches a person — the desk never closes anything itself.",
  },
  {
    id: "sla", metric: "Median days to close an HR request", before: 4.2, now: 1.8, unit: "days", better: "down", claim: "ours",
    note: "Measured on the same request types as the baseline. Role clarity is the one category still over its target.",
  },
  {
    id: "hours", metric: "People-team hours a week on repeat questions", before: 96, now: 37, unit: "hours", better: "down", claim: "ours",
    note: "Stated as hours, not money. What an hour is worth is your number, not ours.",
  },
  {
    id: "reach", metric: "Frontline people we can reach at all", before: 38, now: 87, unit: "%", better: "up", claim: "ours",
    note: "WhatsApp and the floor kiosk did this. The 13% still out of reach are named in Listen, not averaged away.",
  },
  {
    id: "exit", metric: "Exit conversations answered", before: 31, now: 68, unit: "%", better: "up", claim: "ours",
    note: "Asked on a personal channel after the last day, rather than in a meeting nobody wants.",
  },
  {
    id: "dayone", metric: "Joiners ready on day one", before: 54, now: 78, unit: "%", better: "up", claim: "shared",
    note: "IT changed its laptop process in the same quarter. Both things helped; neither can claim it alone.",
  },
  {
    id: "attrition", metric: "Regretted attrition", before: 14.2, now: 11.6, unit: "%", better: "down", claim: "shared",
    note: "The night allowance changed in March and the rota moved to three weeks. Vadal found both; it did not pay for either.",
  },
  {
    id: "engagement", metric: "Engagement score", before: 68, now: 74, unit: "%", better: "up", claim: "context",
    note: "A different question set to the one used before launch, so read the direction, not the six points.",
  },
];

export const valueStats = {
  /** outcomes moving the right way */
  improved: outcomes.filter((o) => (o.better === "up" ? o.now > o.before : o.now < o.before)).length,
  total: outcomes.length,
  ours: outcomes.filter((o) => o.claim === "ours").length,
  hoursSaved: 96 - 37,
};

/** Said out loud, because a value page without it is marketing. */
export const notClaiming = [
  "We do not claim a rupee figure. You know what an hour of your People team costs; we do not.",
  "We do not claim the fall in attrition as ours. Pay and the rota changed in the same year.",
  "We do not compare you to an industry benchmark built from other customers' data. That data is not ours to use.",
];

/* ── change management: who is not on it yet ──────────────────────── */
export type NotYet = {
  id: string;
  who: string;
  people: number;
  /** of those, how many have never signed in */
  never: number;
  /** signed in once and then stopped — a different problem to never arriving */
  stopped?: number;
  why: string;
  /** the next thing to try, and who owns it */
  next: string;
  owner: string;
};

export const notYet: NotYet[] = [
  {
    id: "n1", who: "Night shift · C crew", people: 310, never: 148,
    why: "Invited by email. Most of the crew has no work email, so the invitation went nowhere.",
    next: "Re-invite on WhatsApp at shift change, in Hindi. The templates are approved.", owner: "People team",
  },
  {
    id: "n2", who: "Logistics · long-haul drivers", people: 420, never: 96,
    why: "On the road for days. The app assumes a break long enough to set a password.",
    next: "One-time code by SMS, and the kiosk QR at the depot gate.", owner: "Vadal + your IT",
  },
  {
    id: "n3", who: "Plant Ops · contract staff", people: 260, never: 61,
    why: "Added to Darwinbox in batches, often after they start, so the welcome went out late or not at all.",
    next: "Trigger the welcome from the start date rather than the record date.", owner: "Vadal",
  },
  {
    id: "n4", who: "Finance", people: 610, never: 12, stopped: 84,
    why: "Signed in, then stopped. Use fell 2 points in four weeks — the team says the daily check-in does not fit month-end.",
    next: "Ask them. A three-question pulse to Finance before adding anything.", owner: "Their HRBP",
  },
];

export type Champion = { name: string; img: string; team: string; trained: boolean; note: string };

export const champions: Champion[] = [
  { name: "Ravi Prasad", img: "/avatars/user-2.svg", team: "Plant Ops", trained: true, note: "Runs the Monday kiosk walk-through. Night shift's use is up 9 points since." },
  { name: "Meera Pillai", img: "/avatars/user-7.svg", team: "Support", trained: true, note: "Answers desk questions in the team channel faster than the desk does." },
  { name: "Manoj Patil", img: "/avatars/user-4.svg", team: "Night shift", trained: true, note: "Translates the weekly note into Marathi before the C crew starts." },
  { name: "Ritu Das", img: "/avatars/user-7.svg", team: "Logistics", trained: false, note: "Volunteered last week. Training is on the 29th." },
];

export type Comms = { what: string; when: string; channel: string; reach: number; opened: number; note?: string };

export const comms: Comms[] = [
  { what: "Night shift go-live note", when: "Last Tuesday", channel: "WhatsApp · Hindi", reach: 1650, opened: 1204 },
  { what: "Three-week rota, what changed", when: "2 weeks ago", channel: "Feed + kiosk", reach: 3120, opened: 2410, note: "The most-read thing we have ever sent. People read what affects their week." },
  { what: "Quarterly all-hands recap", when: "3 weeks ago", channel: "Feed", reach: 12480, opened: 5140 },
  { what: "Manager training invitation", when: "Last month", channel: "Email", reach: 320, opened: 214, note: "9 of 14 night-shift managers trained — the gap blocking go-live." },
];

export const trainingProgress = [
  { group: "People team", done: 12, of: 12 },
  { group: "Managers · desk teams", done: 186, of: 198 },
  { group: "Managers · night shift", done: 9, of: 14 },
  { group: "Champions", done: 3, of: 4 },
];
