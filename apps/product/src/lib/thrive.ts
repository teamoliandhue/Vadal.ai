/**
 * Thrive — Pillar 4 (route /product/thrive).
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

export const points = { balance: 4180, thisMonth: 340, rank: 7, of: 240 };

/** Consent for the wellbeing check — off until the person turns it on. */
export const wellbeingConsentDefault = false;

export const mySignals = {
  activityChangePct: -34,
  sleepChangeHours: -1.2,
  moodTrend: -0.31,
};
