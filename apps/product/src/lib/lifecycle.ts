/**
 * Onboard and Alumni — the two ends of the employee lifecycle (17 Sep decision §7).
 *
 * Onboard is a joiner's first 90 days: a journey with owners (you, your manager,
 * your buddy, IT, People), the day 7 / 30 / 90 check-ins from the onboarding
 * programme, and the assistant that sets Vadal up by asking a couple of light
 * questions a session instead of a form.
 *
 * Alumni is what happens after the exit interview: who would come back, what the
 * business is losing people to, and the boomerang hires and referrals an alumni
 * network actually produces. Individual exit reasons are People-only; rehire
 * eligibility is a People decision and is never inferred from exit answers.
 */

export type Owner = "you" | "manager" | "buddy" | "IT" | "People";

export type JourneyItem = {
  id: string;
  title: string;
  owner: Owner;
  /** Where doing it happens, when it happens in Vadal. */
  href?: string;
  /** Day it is due by, counted from the start date. */
  due: number;
};

export type Phase = { id: string; label: string; from: number; to: number; items: JourneyItem[] };

export const JOURNEY: Phase[] = [
  {
    id: "before", label: "Before day one", from: -7, to: 0,
    items: [
      { id: "laptop", title: "Laptop and accounts ready", owner: "IT", due: 0 },
      { id: "welcome", title: "Welcome note from your manager", owner: "manager", due: 0 },
      { id: "buddy", title: "A buddy assigned", owner: "People", due: 0 },
    ],
  },
  {
    id: "week1", label: "Week one", from: 1, to: 7,
    items: [
      { id: "first-1on1", title: "First 1:1 with your manager", owner: "manager", due: 2 },
      { id: "coffee", title: "Coffee with your buddy", owner: "buddy", due: 3 },
      { id: "setup", title: "Set Vadal up your way", owner: "you", due: 5 },
      { id: "first-week-doc", title: "Read “Your first week at Oli&Hue”", owner: "you", href: "/product/knowledge", due: 5 },
      { id: "community", title: "Join your team’s community", owner: "you", href: "/product/social/groups", due: 7 },
      { id: "day7", title: "Day 7 check-in", owner: "you", href: "/product/survey/onboarding", due: 7 },
    ],
  },
  {
    id: "day30", label: "First 30 days", from: 8, to: 30,
    items: [
      { id: "goals", title: "Agree 30-60-90 goals with your manager", owner: "manager", due: 14 },
      { id: "welcome-course", title: "Finish “Welcome to Oli&Hue” in iLearn", owner: "you", href: "/product/ilearn", due: 21 },
      { id: "three-people", title: "Meet three people outside your team", owner: "you", due: 30 },
      { id: "day30-checkin", title: "Day 30 check-in", owner: "you", href: "/product/survey/onboarding", due: 30 },
    ],
  },
  {
    id: "day90", label: "Days 31–90", from: 31, to: 90,
    items: [
      { id: "first-kudos", title: "Give your first kudos", owner: "you", href: "/product/kudos", due: 45 },
      { id: "first-ship", title: "Ship your first piece of work", owner: "you", due: 60 },
      { id: "day90-checkin", title: "Day 90 check-in", owner: "you", href: "/product/survey/onboarding", due: 90 },
      { id: "review", title: "90-day conversation with your manager", owner: "manager", due: 90 },
    ],
  },
];

export const JOURNEY_ITEMS = JOURNEY.flatMap((p) => p.items);

export const OWNER_LABEL: Record<Owner, string> = { you: "You", manager: "Your manager", buddy: "Your buddy", IT: "IT", People: "People team" };

/** Where someone is in the journey. */
export const phaseFor = (day: number) => JOURNEY.find((p) => day >= p.from && day <= p.to) ?? JOURNEY[JOURNEY.length - 1];

/* ── the demo joiner ─────────────────────────────────────────── */

/** Signed-in people who are inside their first 90 days, and on which day. */
export const JOINED: Record<string, { day: number; startDate: string; manager: string; managerImg: string; buddy: string; buddyImg: string }> = {
  "dev@oliandhue.com": {
    day: 4, startDate: "Mon 14 Sep", manager: "Anita Desai", managerImg: "/avatars/user-5.svg", buddy: "Neha Rao", buddyImg: "/avatars/user-5.svg",
  },
};

/** What other owners have already done for the demo joiner — the journey is never all theirs. */
export const DONE_BY_OTHERS: string[] = ["laptop", "welcome", "buddy", "first-1on1", "coffee"];

/** The questions the assistant asks, with choices where the engine leaves a text box. */
export const ANSWER_CHOICES: Record<string, string[]> = {
  shift: ["Before 8am", "8–10am", "After 10am", "Nights"],
  device: ["My own phone", "A shared phone", "Mostly a laptop"],
  goals: ["Leading projects", "Presenting", "A new skill", "Not sure yet"],
  wellbeing: ["Yes, switch them on", "Not now"],
};

/* ── the joiner cohort (managers and People) ─────────────────── */

export type Joiner = {
  id: string;
  name: string;
  img: string;
  team: string;
  title: string;
  day: number;
  manager: string;
  buddy: string | null;
  /** Items done out of those due by today. */
  done: number;
  dueByNow: number;
  /** Day 7 "How settled do you feel" 1–5, null until answered. */
  settled: number | null;
  /** How much of the profile the assistant has learned (of 6). */
  profileKnown: number;
  flags: string[];
  /** Preview link to see the journey as they do. */
  preview?: string;
};

export const JOINERS: Joiner[] = [
  { id: "dev", name: "Dev Patel", img: "/avatars/user-3.svg", team: "Design", title: "Junior Designer", day: 4, manager: "Anita Desai", buddy: "Neha Rao", done: 5, dueByNow: 6, settled: null, profileKnown: 1, flags: [], preview: "/product/onboard/me" },
  { id: "meera", name: "Meera Iyer", img: "/avatars/user-7.svg", team: "Design", title: "UX Researcher", day: 38, manager: "Anita Desai", buddy: "Karan Mehta", done: 11, dueByNow: 13, settled: 4, profileKnown: 5, flags: ["Goals not agreed yet"] },
  { id: "arjun", name: "Arjun Nair", img: "/avatars/user-2.svg", team: "Engineering", title: "Backend Engineer", day: 12, manager: "Rahul Verma", buddy: "Aarav Sharma", done: 8, dueByNow: 9, settled: 4, profileKnown: 4, flags: [] },
  { id: "kavya", name: "Kavya Reddy", img: "/avatars/user-8.svg", team: "Support", title: "Support Specialist", day: 9, manager: "Farah Khan", buddy: null, done: 4, dueByNow: 9, settled: 2, profileKnown: 2, flags: ["No buddy", "Day 7: missing “knowing who to ask”"] },
  { id: "suresh", name: "Suresh Yadav", img: "/avatars/user-4.svg", team: "Night shift", title: "Picker", day: 6, manager: "Sunita Rao", buddy: "Manoj Patil", done: 4, dueByNow: 5, settled: null, profileKnown: 2, flags: [] },
  { id: "lakshmi", name: "Lakshmi Pillai", img: "/avatars/user-5.svg", team: "Night shift", title: "Forklift Operator", day: 21, manager: "Sunita Rao", buddy: "Manoj Patil", done: 10, dueByNow: 11, settled: 3, profileKnown: 4, flags: [] },
  { id: "imran", name: "Imran Sheikh", img: "/avatars/user-6.svg", team: "Plant Ops", title: "Line Operator", day: 16, manager: "Vikram Joshi", buddy: null, done: 6, dueByNow: 10, settled: 2, profileKnown: 1, flags: ["No buddy", "First 1:1 hasn’t happened"] },
  { id: "pooja", name: "Pooja Menon", img: "/avatars/user-3.svg", team: "Logistics", title: "Dispatch Coordinator", day: 64, manager: "Deepak Singh", buddy: "Ritu Das", done: 15, dueByNow: 16, settled: 5, profileKnown: 6, flags: [] },
];

export const SETTLED_LABEL = ["", "Not settled", "Finding my feet", "Okay", "Settling in well", "Right at home"];

/* ── alumni ──────────────────────────────────────────────────── */

export type Rehire = "Eligible" | "Talk to People first" | "Not eligible";
export type Leaver = {
  id: string;
  name: string;
  img: string;
  team: string;
  title: string;
  left: string;
  tenure: string;
  reason: string;
  wouldReturn: "Yes" | "Maybe" | "No" | "Not answered";
  rehire: Rehire;
  /** They chose to join the alumni network when they left. */
  inNetwork: boolean;
  referrals: number;
};

export const LEAVERS: Leaver[] = [
  { id: "l1", name: "Rohan Gupta", img: "/avatars/user-2.svg", team: "Engineering", title: "Senior Engineer", left: "Sep 2026", tenure: "3 yrs", reason: "Growth", wouldReturn: "Yes", rehire: "Eligible", inNetwork: true, referrals: 2 },
  { id: "l2", name: "Sneha Kulkarni", img: "/avatars/user-7.svg", team: "Design", title: "Visual Designer", left: "Aug 2026", tenure: "2 yrs", reason: "A better offer elsewhere", wouldReturn: "Maybe", rehire: "Eligible", inNetwork: true, referrals: 1 },
  { id: "l3", name: "Manish Tiwari", img: "/avatars/user-4.svg", team: "Plant Ops", title: "Shift Lead", left: "Aug 2026", tenure: "6 yrs", reason: "Workload", wouldReturn: "Maybe", rehire: "Eligible", inNetwork: false, referrals: 0 },
  { id: "l4", name: "Farhan Ali", img: "/avatars/user-6.svg", team: "Night shift", title: "Picker", left: "Jul 2026", tenure: "8 mo", reason: "Workload", wouldReturn: "No", rehire: "Eligible", inNetwork: false, referrals: 0 },
  { id: "l5", name: "Divya Menon", img: "/avatars/user-8.svg", team: "Support", title: "Support Lead", left: "Jul 2026", tenure: "4 yrs", reason: "My manager", wouldReturn: "Yes", rehire: "Eligible", inNetwork: true, referrals: 3 },
  { id: "l6", name: "Kunal Shah", img: "/avatars/user-3.svg", team: "Logistics", title: "Driver", left: "Jun 2026", tenure: "1 yr", reason: "Pay", wouldReturn: "Maybe", rehire: "Talk to People first", inNetwork: true, referrals: 0 },
  { id: "l7", name: "Ananya Bose", img: "/avatars/user-5.svg", team: "Engineering", title: "QA Engineer", left: "Jun 2026", tenure: "2 yrs", reason: "Personal reasons", wouldReturn: "Yes", rehire: "Eligible", inNetwork: true, referrals: 1 },
  { id: "l8", name: "Vivek Rao", img: "/avatars/user-2.svg", team: "Plant Ops", title: "Maintenance Tech", left: "May 2026", tenure: "5 yrs", reason: "Growth", wouldReturn: "Not answered", rehire: "Not eligible", inNetwork: false, referrals: 0 },
];

export const BOOMERANGS = [
  { name: "Tanvi Joshi", img: "/avatars/user-7.svg", role: "Design Lead · Design", away: "14 months", back: "Jul 2026", note: "Left for a startup; came back to lead the design system work." },
  { name: "Harish Kumar", img: "/avatars/user-4.svg", role: "Shift Supervisor · Plant Ops", away: "9 months", back: "Jun 2026", note: "Referred back by a former teammate after the night allowance changed." },
  { name: "Sara D’Souza", img: "/avatars/user-8.svg", role: "Engineering Manager · Engineering", away: "2 years", back: "Mar 2026", note: "Stayed in the alumni network and applied to a role shared there." },
];

/** Main reason for leaving, from exit interviews answered in the last 12 months. */
export const EXIT_THEMES = [
  { label: "Workload", value: 15, note: "mostly Plant Ops and Night shift" },
  { label: "Growth", value: 12, note: "desk teams, 2+ years in" },
  { label: "A better offer elsewhere", value: 9 },
  { label: "Pay", value: 7 },
  { label: "My manager", value: 5 },
  { label: "Personal reasons", value: 4 },
];

export const ALUMNI_STATS = {
  network: 1240,
  activeLast90: 38,
  wouldReturnPct: 61,
  boomerangsThisYear: 9,
  referralHires: 6,
  referrals: 21,
  preventablePct: 58,
  answered: EXIT_THEMES.reduce((s, t) => s + t.value, 0),
};
