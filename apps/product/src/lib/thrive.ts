/**
 * Thrive — Pillar 4 (route /product/ithrive).
 *
 * "One wellness pillar: physical health and financial health, side by side."
 * Wearable-fed activity, fair-cohort leaderboards, challenges, and a wealth hub.
 * Seeded; the AI (nudges, financial guidance, the consented wellbeing check,
 * cohort matching) comes from lib/ai/engines/wellbeing.
 */
import type { Participant, Benefit, ActivityState } from "./ai/engines/wellbeing";

export const myActivity: ActivityState = {
  stepsThisWeek: 41200,
  stepGoal: 45000,
  activeMinutes: 214,
  sleepHoursAvg: 5.8,
  activeHours: [7, 12, 13, 18, 19, 19, 20],
};

/**
 * Steps the shift itself puts on you, per day.
 *
 * The number that makes a step goal meaningless for a Line Operator — and the
 * one the screen never used to know about.
 */
export const atWorkStepsPerDay = 17400;

/** Seven days, oldest first. A wellbeing product with no history is a snapshot. */
export const weekSteps = [7400, 6100, 8300, 5200, 6900, 4100, 3200];
/** The plant's week, for anyone whose job does the walking. */
export const weekStepsFrontline = [16800, 18200, 17100, 19400, 16200, 8600, 5900];
export const weekSleep = [5.4, 6.1, 5.2, 5.8, 4.9, 7.2, 6.4];
export const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

export const devices = [
  { name: "Google Fit", connected: true, syncs: "steps · active minutes · sleep" },
  { name: "Apple Health", connected: false, syncs: "steps · workouts · sleep" },
  { name: "Fitbit", connected: false, syncs: "steps · sleep · heart rate" },
  { name: "Garmin", connected: false, syncs: "runs · rides · swims" },
];

export type Challenge = {
  id: string; name: string; kind: "steps" | "active-minutes" | "distance";
  endsIn: number; joined: boolean; participants: number; blurb: string;
};

export const challenges: Challenge[] = [
  { id: "monsoon", name: "Monsoon 10K", kind: "steps", endsIn: 9, joined: true, participants: 1840,
    blurb: "10,000 steps a day, any way you get them." },
  { id: "stairs", name: "Take the stairs", kind: "active-minutes", endsIn: 4, joined: false, participants: 620,
    blurb: "Fifteen active minutes, five days a week." },
  { id: "ride", name: "Ride to work", kind: "distance", endsIn: 21, joined: false, participants: 310,
    blurb: "Log any distance you cover under your own power." },
];

/** Mixed roles on purpose — the cohort matcher has to make this fair. */
export const participants: Participant[] = [
  { email: "ravi@oliandhue.com", role: "Line Operator", surface: "frontline", avgDailySteps: 17400, activityType: "steps" },
  { email: "sunita@oliandhue.com", role: "Shift Supervisor", surface: "frontline", avgDailySteps: 14100, activityType: "steps" },
  { email: "kiran@oliandhue.com", role: "Picker", surface: "frontline", avgDailySteps: 19200, activityType: "steps" },
  { email: "anita@oliandhue.com", role: "Design Lead", surface: "desk", avgDailySteps: 5400, activityType: "active-minutes" },
  { email: "aarav@oliandhue.com", role: "Software Engineer", surface: "desk", avgDailySteps: 4100, activityType: "active-minutes" },
  { email: "priya@oliandhue.com", role: "People Partner", surface: "desk", avgDailySteps: 7600, activityType: "steps" },
  { email: "meera@oliandhue.com", role: "HRBP", surface: "desk", avgDailySteps: 6900, activityType: "steps" },
  { email: "vikram@oliandhue.com", role: "Driver", surface: "frontline", avgDailySteps: 8800, activityType: "distance" },
];

export const benefits: Benefit[] = [
  { id: "dental", name: "Dental add-on", used: false, enrolmentClosesInDays: 21, worth: "₹18,000 cover" },
  { id: "eyecare", name: "Annual eye test", used: false, enrolmentClosesInDays: 120 },
  { id: "mediclaim", name: "Family floater — ₹5L", used: true },
  { id: "gym", name: "Gym reimbursement", used: false, enrolmentClosesInDays: 34, worth: "₹2,000/month" },
];

export const wealthArticles = [
  { id: "emergency", title: "An emergency fund, explained in four minutes", minutes: 4, topic: "Saving" },
  { id: "epf", title: "EPF, PPF and NPS — what each is actually for", minutes: 6, topic: "Retirement" },
  { id: "payslip", title: "Reading your payslip properly", minutes: 3, topic: "Pay" },
  { id: "insurance", title: "How much cover is enough?", minutes: 5, topic: "Insurance" },
  { id: "debt", title: "Paying down debt without going without", minutes: 5, topic: "Debt" },
];

/**
 * The three fields a money moment needs. Not a payroll integration —
 * a pay day, a deadline and a regional window.
 */
export const moneyConfig = {
  /**
   * DEMO ONLY. A real workspace stores a fixed pay day (the 1st, the last
   * working day). Seeding it as "two days ago" means the payday moment — the
   * strongest thing this pillar does — is actually visible whenever someone
   * opens the demo, instead of only in the first week of the month.
   * Replace with the tenant's real pay day at integration.
   */
  demoPaydayDaysAgo: 2,
  paydayDayOfMonth: 1,
  /** What the person told us they would set aside, and whether it has moved. */
  commitment: { amount: "₹3,000", movedThisCycle: false },
  /** Mirrors the dental add-on in `benefits`. */
  enrolmentClosesInDays: 21,
  /** A real, recurring financial event that no competitor's product notices. */
  festival: { name: "Diwali", opensInDays: 38 },
};

/* Points live in lib/points (one ledger, shared with Kudos). */

/** Consent for the wellbeing check — off until the person turns it on. */
export const wellbeingConsentDefault = false;

export const mySignals = {
  activityChangePct: -34,
  sleepChangeHours: -1.2,
  moodTrend: -0.31,
};

/**
 * Where you actually are in the challenge you joined.
 *
 * The list showed three challenges and a Join button, and for the one you were
 * already in it said "Joined" and nothing else. A challenge with no progress on
 * it is a signup form — the whole substance of joining is the daily result, and
 * that was the one thing missing.
 *
 * The numbers run above this person's baseline week (see weekSteps, which
 * averages ~6,000) on purpose: they joined, and joining changed the behaviour.
 * That is the point of a challenge and it is what the card should show.
 */
export const challengeProgress = {
  id: "monsoon",
  /** The daily bar to clear. */
  target: 10000,
  totalDays: 15,
  /** Steps logged each day since it started, oldest first. */
  days: [10400, 8900, 11200, 6100, 9700, 12300],
  /** Their usual day before joining — the comparison that makes this worth it. */
  baselineDaily: 6000,
  rank: 412,
};

/** Colour and icon identity per challenge kind, so three cards are not one card
 *  three times. Hues are drawn from the Signal palette, not invented. */
export const CHALLENGE_TONE: Record<Challenge["kind"], { hue: string; label: string }> = {
  steps:            { hue: "#5D63E1", label: "Steps" },
  "active-minutes": { hue: "#17a35e", label: "Active minutes" },
  distance:         { hue: "#E0803A", label: "Distance" },
};

/* ── health leaderboards (roadmap v2) ──────────────────────────────
   Ranked by the activity itself — never by points (17 Sep decision §5).
   Walking uses the fair cohorts above, so a picker's on-shift steps are never
   compared with a designer's evening walk. Running and swimming are not part of
   anyone's job, so one board each.

   Nobody appears by name unless they opted in. Everyone else is "a colleague
   in <team>" — the board stays meaningful without exposing anyone. */
export type BoardEntry = { email: string; name: string; team: string; value: number; optedIn: boolean };

export const leaderboardOptIn: Record<string, boolean> = {
  "ravi@oliandhue.com": true, "sunita@oliandhue.com": false, "kiran@oliandhue.com": true,
  "anita@oliandhue.com": true, "aarav@oliandhue.com": false, "meera@oliandhue.com": true, "vikram@oliandhue.com": true,
};

export const runningBoard: BoardEntry[] = [
  { email: "rahul@oliandhue.com", name: "Rahul Verma", team: "Sales", value: 38.5, optedIn: true },
  { email: "anita@oliandhue.com", name: "Anita Desai", team: "Design", value: 31.2, optedIn: true },
  { email: "kiran@oliandhue.com", name: "Kiran M.", team: "Plant Ops", value: 26.8, optedIn: true },
  { email: "dev@oliandhue.com", name: "Dev Patel", team: "Design", value: 22.4, optedIn: false },
  { email: "priya@oliandhue.com", name: "Priya Sharma", team: "People", value: 18.0, optedIn: false },
  { email: "meera@oliandhue.com", name: "Meera Pillai", team: "Support", value: 12.6, optedIn: true },
  { email: "sunita@oliandhue.com", name: "Sunita Rao", team: "Night shift", value: 9.4, optedIn: false },
  { email: "aarav@oliandhue.com", name: "Aarav Sharma", team: "Engineering", value: 6.1, optedIn: false },
];

export const swimmingBoard: BoardEntry[] = [
  { email: "ishaan@oliandhue.com", name: "Ishaan B.", team: "Finance", value: 4800, optedIn: true },
  { email: "sara@oliandhue.com", name: "Sara Mehta", team: "Support", value: 3600, optedIn: true },
  { email: "priya@oliandhue.com", name: "Priya Sharma", team: "People", value: 2400, optedIn: false },
  { email: "vikram@oliandhue.com", name: "Vikram S.", team: "Logistics", value: 2000, optedIn: true },
  { email: "neha@oliandhue.com", name: "Neha R.", team: "Design", value: 1500, optedIn: false },
  { email: "arjun@oliandhue.com", name: "Arjun K.", team: "Operations", value: 900, optedIn: true },
];
