/**
 * Pulse programmes — the lifecycle surveys (17 Sep decision §7).
 *
 * Onboarding, stay interviews, manager effectiveness and exit are not new
 * pillars: they are survey programmes with a trigger. Built on Pulse so they
 * inherit its anonymity threshold, fatigue rules and reporting.
 *
 * Every bank is ADAPTIVE (engines/survey.nextQuestion): the opener is always
 * asked and the rest only when an earlier answer makes it worth asking — a
 * happy new joiner answers two questions, a struggling one five.
 */
import { QUESTION_BANK, low, type Answers, type Question } from "./ai/engines/survey";
import type { Recipient } from "./ai/engines/timing";

const n = (v: Answers[string] | undefined) => (typeof v === "number" ? v : 0);

export type Programme = {
  id: string;
  name: string;
  emoji: string;
  trigger: string;
  audience: string;
  anonymous: boolean;
  questions: Question[];
  stats: { sentThisQuarter: number; responseRate: number; topTheme: string };
  /** One sentence on why the programme exists, for the admin. */
  why: string;
};

export const PROGRAMMES: Programme[] = [
  {
    id: "onboarding", name: "Onboarding check-ins", emoji: "🧭", anonymous: false,
    trigger: "Day 7, day 30 and day 90 after someone starts",
    audience: "New joiners · their answers go to People, and to the manager only as a summary",
    why: "The first 90 days decide whether someone stays. Asking at three points catches a bad start while it can still be fixed.",
    stats: { sentThisQuarter: 288, responseRate: 76, topTheme: "Unclear first-week plan" },
    questions: [
      { id: "settled", text: "How settled do you feel so far?", kind: "mood" },
      { id: "knowwhat", text: "Do you know what's expected of you in your first month?", kind: "scale", when: (a) => low(a.settled, 3) },
      { id: "missing", text: "What's been missing?", kind: "choice", choices: ["A clear plan", "Time with my manager", "Access or equipment", "Knowing who to ask", "Something else"], when: (a) => low(a.settled, 3) || low(a.knowwhat, 2) },
      { id: "missingdetail", text: "Tell us a bit more — People will follow up.", kind: "text", when: (a) => Boolean(a.missing) },
      { id: "buddy", text: "Anything your buddy or team did that made a difference?", kind: "text", when: (a) => n(a.settled) >= 4 },
    ],
  },
  {
    id: "stay", name: "Stay interviews", emoji: "🪴", anonymous: false,
    trigger: "Every 6 months, and 30 days after a flight-risk flag",
    audience: "Everyone after their first year · a conversation guide for the manager, not a form",
    why: "Asking why people stay is cheaper than an exit interview and still has time to act.",
    stats: { sentThisQuarter: 1120, responseRate: 64, topTheme: "Growth path unclear" },
    questions: [
      { id: "stayreason", text: "What keeps you here?", kind: "choice", choices: ["The people", "The work itself", "Learning and growth", "Pay and benefits", "Flexibility"] },
      { id: "likely", text: "How likely are you to be here in a year?", kind: "scale" },
      { id: "wouldleave", text: "What would make you think about leaving?", kind: "choice", choices: ["No growth path", "Workload", "My manager", "Pay", "Something else"], when: (a) => low(a.likely, 3) },
      { id: "onething", text: "If you could change one thing, what would it be?", kind: "text", when: (a) => low(a.likely, 3) },
    ],
  },
  {
    id: "manager", name: "Manager effectiveness", emoji: "🧑‍🏫", anonymous: true,
    trigger: "Quarterly, for every people manager with 5+ reports",
    audience: "Direct reports · anonymous; a manager sees results only when 5 or more answer",
    why: "Managers explain most of the difference between teams. This gives each one specific, safe feedback.",
    stats: { sentThisQuarter: 2140, responseRate: 71, topTheme: "Fewer 1:1s than people want" },
    questions: [
      { id: "support", text: "My manager helps me do my best work.", kind: "scale" },
      { id: "oneones", text: "How often do you have a 1:1 that's actually useful?", kind: "choice", choices: ["Weekly", "Every two weeks", "Monthly", "Rarely", "Never"] },
      { id: "improve", text: "What would help most?", kind: "choice", choices: ["More regular 1:1s", "Clearer priorities", "More recognition", "Help with my growth", "Less micromanagement"], when: (a) => low(a.support, 3) || a.oneones === "Rarely" || a.oneones === "Never" },
      { id: "strength", text: "What does your manager do that you'd want every manager to do?", kind: "text", when: (a) => n(a.support) >= 4 },
    ],
  },
  {
    id: "exit", name: "Exit interviews", emoji: "🚪", anonymous: false,
    trigger: "When a resignation is recorded, and again 60 days after they leave",
    audience: "Leavers · the 60-day follow-up is where the honest answers come",
    why: "Themes across leavers show what the business is losing people to, and whether a leaver would come back.",
    stats: { sentThisQuarter: 64, responseRate: 82, topTheme: "Workload" },
    questions: [
      { id: "mainreason", text: "What's the main reason you're leaving?", kind: "choice", choices: ["Pay", "Growth", "Workload", "My manager", "Personal reasons", "A better offer elsewhere"] },
      { id: "preventable", text: "Could anything have changed your mind?", kind: "scale" },
      { id: "what", text: "What would it have been?", kind: "text", when: (a) => n(a.preventable) >= 3 },
      { id: "return", text: "Would you consider coming back one day?", kind: "choice", choices: ["Yes", "Maybe", "No"] },
    ],
  },
];

export const SURVEYS: Record<string, { name: string; bank: Question[]; closes: string; anonymous: boolean; points: boolean }> = {
  "september-pulse": { name: "September pulse", bank: QUESTION_BANK, closes: "Friday 25 Sep", anonymous: true, points: true },
  ...Object.fromEntries(PROGRAMMES.map((p) => [p.id, { name: p.name, bank: p.questions, closes: "Preview", anonymous: p.anonymous, points: true }])),
};

/** A sample of who a send reaches — used to show smart send-time per person. */
export const SAMPLE_RECIPIENTS: (Recipient & { label: string })[] = [
  { label: "Line operator · Plant Ops", email: "r1", team: "Plant Ops", shift: "day", respondsAt: [12, 12, 13], reachableOn: ["whatsapp", "app"], recentSends: 1 },
  { label: "Picker · Night shift", email: "r2", team: "Night shift", shift: "night", respondsAt: [], reachableOn: ["whatsapp", "sms"], recentSends: 0 },
  { label: "Driver · Logistics", email: "r3", team: "Logistics", shift: "evening", respondsAt: [], reachableOn: ["sms"], recentSends: 2 },
  { label: "Engineer · Engineering", email: "r4", team: "Engineering", shift: "desk", respondsAt: [10, 11, 10], reachableOn: ["teams", "app"], recentSends: 1 },
  { label: "Designer · Design", email: "r5", team: "Design", shift: "desk", respondsAt: [16, 17], reachableOn: ["app", "email"], recentSends: 3 },
  { label: "Support lead · Support", email: "r6", team: "Support", shift: "day", respondsAt: [22, 23], reachableOn: ["app"], recentSends: 0 },
];
