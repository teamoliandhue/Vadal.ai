/**
 * Points — the ledger, the earning rules, and badges (17 Sep decision §5).
 *
 * Points is a workspace MODE, on by default. With it off, nothing here shows a
 * number: recognition and badges carry the same story. Badges are deliberately
 * earned by actions, never by a points total, so they survive the switch.
 *
 * The rules are fixed and published to employees. Points are never given for
 * ratings, performance, attendance or anything a manager scores — engagement
 * currency must not become a second appraisal.
 */

export type EarnSource =
  | "kudos-given" | "kudos-received" | "post" | "survey" | "learning" | "assessment" | "health" | "one-to-one" | "redeemed" | "carried";

export type EarnRule = {
  source: Exclude<EarnSource, "redeemed" | "carried">;
  label: string;
  points: number;
  cap: string;
  note?: string;
  who?: "managers" | "opt-in";
};

export const EARN_RULES: EarnRule[] = [
  { source: "kudos-given", label: "Give kudos", points: 10, cap: "up to 5 a day" },
  { source: "kudos-received", label: "Receive kudos", points: 25, cap: "up to 10 a day" },
  { source: "post", label: "Post in Social or a community", points: 5, cap: "up to 3 a day" },
  { source: "survey", label: "Complete a survey", points: 15, cap: "once per survey", note: "Flat — never more for a longer or more positive answer." },
  { source: "learning", label: "Finish a learning module", points: 20, cap: "up to 3 a day" },
  { source: "assessment", label: "Pass an assessment", points: 40, cap: "once per assessment" },
  { source: "health", label: "Log a health challenge day", points: 5, cap: "once a day", who: "opt-in", note: "Only if you joined a challenge. Your job's steps don't count against you." },
  { source: "one-to-one", label: "Complete a 1:1", points: 15, cap: "up to 5 a week", who: "managers", note: "For holding the conversation — never for what was said in it." },
];

export const NEVER_FOR = [
  "Ratings, reviews or performance scores",
  "Attendance, hours or overtime",
  "Sales or delivery targets",
  "Anything a manager scores about you",
];

export type LedgerEntry = { id: string; date: string; source: EarnSource; text: string; points: number };

/* The signed-in person's last month, newest first, plus what came before as one
   carried-forward line. Balance = the sum; it matches the 4,180 used elsewhere. */
export const LEDGER: LedgerEntry[] = [
  { id: "l1", date: "2026-09-16", source: "kudos-received", text: "Kudos from Anita — Ownership", points: 25 },
  { id: "l2", date: "2026-09-16", source: "learning", text: "iLearn · Giving feedback, part 2", points: 20 },
  { id: "l3", date: "2026-09-15", source: "kudos-given", text: "Kudos to Dev Patel", points: 10 },
  { id: "l4", date: "2026-09-15", source: "post", text: "Posted in #wins", points: 5 },
  { id: "l5", date: "2026-09-14", source: "survey", text: "September pulse", points: 15 },
  { id: "l6", date: "2026-09-12", source: "health", text: "Monsoon 10K · day 3", points: 5 },
  { id: "l7", date: "2026-09-12", source: "kudos-received", text: "Kudos from Neha — Craft", points: 25 },
  { id: "l8", date: "2026-09-11", source: "assessment", text: "Passed · Compliance essentials", points: 40 },
  { id: "l9", date: "2026-09-10", source: "kudos-given", text: "Kudos to Meera Pillai", points: 10 },
  { id: "l10", date: "2026-09-10", source: "health", text: "Monsoon 10K · day 2", points: 5 },
  { id: "l11", date: "2026-09-09", source: "health", text: "Monsoon 10K · day 1", points: 5 },
  { id: "l12", date: "2026-09-08", source: "kudos-received", text: "Kudos from Rahul — Customer-first", points: 25 },
  { id: "l13", date: "2026-09-05", source: "learning", text: "iLearn · Giving feedback, part 1", points: 20 },
  { id: "l14", date: "2026-09-04", source: "post", text: "Posted in Search revamp", points: 5 },
  { id: "l15", date: "2026-09-03", source: "kudos-received", text: "Kudos from Aarav — Grit", points: 25 },
  { id: "l16", date: "2026-09-02", source: "kudos-given", text: "Kudos to the onboarding crew", points: 10 },
  { id: "l17", date: "2026-09-02", source: "survey", text: "Wellbeing check", points: 15 },
  { id: "l18", date: "2026-09-01", source: "learning", text: "iLearn · Running better 1:1s", points: 20 },
  { id: "l19", date: "2026-09-01", source: "kudos-received", text: "Kudos from Sara — Ownership", points: 25 },
  { id: "l20", date: "2026-08-24", source: "redeemed", text: "Redeemed · Team lunch for four", points: -1500 },
  { id: "l21", date: "2026-08-01", source: "carried", text: "Earned before August", points: 5370 },
];

export const balanceOf = (ledger: LedgerEntry[]) => ledger.reduce((s, e) => s + e.points, 0);
export const earnedSince = (ledger: LedgerEntry[], iso: string) => ledger.filter((e) => e.date >= iso && e.points > 0 && e.source !== "carried").reduce((s, e) => s + e.points, 0);

export const SOURCE_LABEL: Record<EarnSource, string> = {
  "kudos-given": "Kudos given", "kudos-received": "Kudos received", post: "Posts", survey: "Surveys",
  learning: "Learning", assessment: "Assessments", health: "Health challenges", "one-to-one": "1:1s",
  redeemed: "Redeemed", carried: "Carried forward",
};

export type BadgeState = { id: string; name: string; emoji: string; how: string; earned?: string; progress?: [number, number] };

/** Earned by doing, never by a points total — so badges mean the same with points off. */
export const BADGES: BadgeState[] = [
  { id: "streak", name: "Streak master", emoji: "🔥", how: "Check in 10 days in a row", earned: "3 Sep" },
  { id: "first-kudos", name: "First kudos", emoji: "💜", how: "Recognise a colleague for the first time", earned: "Mar 2025" },
  { id: "helper", name: "Team helper", emoji: "🤝", how: "Answer 5 questions in communities", earned: "12 Aug" },
  { id: "safety", name: "Safety first", emoji: "🦺", how: "Finish the safety course", earned: "11 Sep" },
  { id: "voice", name: "Voice champion", emoji: "📣", how: "Answer every pulse this quarter", progress: [4, 6] },
  { id: "recogniser", name: "Top recogniser", emoji: "🏅", how: "Give 20 kudos in a quarter", progress: [14, 20] },
  { id: "learner", name: "Lifelong learner", emoji: "📚", how: "Finish 10 learning modules", progress: [7, 10] },
  { id: "mentor", name: "Mentor", emoji: "🌱", how: "Buddy a new joiner through their first 30 days", progress: [0, 1] },
];

/** Recognition counts for the points-off state. */
export const MY_RECOGNITION = { received30d: 6, given30d: 4, topValue: "Ownership" };
