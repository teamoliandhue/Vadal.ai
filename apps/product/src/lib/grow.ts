/**
 * Grow — Pillar 6 (route /product/grow).
 *
 * "Learning that fits into a five-minute break, not a training day."
 * Micro-courses grouped into paths, compliance tracking with due dates, quizzes
 * with streaks and badges. Seeded; the AI (course generation, recommendations,
 * adaptive quizzing, the tutor) comes from lib/ai/engines/learning.
 */
import type { LearningPath } from "./ai/engines/learning";

export type CourseStatus = "not-started" | "in-progress" | "complete" | "overdue";

export type Lesson = { id: string; title: string; minutes: number; kind: "video" | "read" | "quiz" };

export type Course = {
  id: string;
  title: string;
  path: string;
  blurb: string;
  minutes: number;
  lessons: Lesson[];
  status: CourseStatus;
  progress: number; // 0–100
  mandatory?: boolean;
  dueIn?: number; // days; negative = overdue
  safetyCritical?: boolean;
  enrolled: number;
  completion: number; // % of enrolled who finished
  /** Set when Pulse drove the assignment — the brief's listening→learning loop. */
  assignedBecause?: string;
  /** Why this is compulsory. Unexplained mandatory training reads as punishment,
   *  and the Pulse-driven suggestions on the same screen explain themselves. */
  mandatoryBecause?: string;
};

export const paths: LearningPath[] = [
  { id: "safety", title: "Shop-floor safety", forRoles: ["employee", "manager"], topics: ["safety", "equipment"], minutes: 34 },
  { id: "equipment", title: "Equipment handling refresher", forRoles: ["employee"], topics: ["equipment"], minutes: 12 },
  { id: "manager-basics", title: "First-time manager", forRoles: ["manager"], topics: ["manager", "growth"], minutes: 48 },
  { id: "compliance", title: "Compliance essentials", forRoles: ["employee", "manager", "admin"], topics: ["compliance", "safety"], minutes: 26 },
  { id: "wellbeing", title: "Looking after yourself on shift", forRoles: ["employee"], topics: ["workload", "wellbeing"], minutes: 18 },
  { id: "feedback", title: "Giving feedback that lands", forRoles: ["manager"], topics: ["manager", "recognition"], minutes: 22 },
];

export const courses: Course[] = [
  {
    id: "posh", title: "POSH — what it means day to day", path: "compliance",
    blurb: "Your rights, what counts, and exactly how to raise something.",
    minutes: 8, status: "overdue", progress: 40, mandatory: true, dueIn: -3,
    enrolled: 12480, completion: 71,
    mandatoryBecause: "Required of everyone at oliandhue, and renewed every 12 months. Yours lapsed on 28 August.",
    lessons: [
      { id: "l1", title: "What the law actually covers", minutes: 3, kind: "read" },
      { id: "l2", title: "Recognising it in practice", minutes: 3, kind: "video" },
      { id: "l3", title: "How to raise it", minutes: 2, kind: "quiz" },
    ],
  },
  {
    id: "lockout", title: "Lockout Tagout", path: "safety",
    blurb: "Isolating a machine safely, and the check that proves it.",
    minutes: 6, status: "not-started", progress: 0, mandatory: true, dueIn: 9,
    safetyCritical: true, enrolled: 3120, completion: 58,
    mandatoryBecause: "Required before anyone works unsupervised on a line. This one is safety-critical, so there is no grace period.",
    lessons: [
      { id: "l1", title: "Isolate every energy source", minutes: 2, kind: "read" },
      { id: "l2", title: "One person, one lock", minutes: 2, kind: "video" },
      { id: "l3", title: "Verify before you start", minutes: 2, kind: "quiz" },
    ],
  },
  {
    id: "itsec", title: "IT security in five minutes", path: "compliance",
    blurb: "Phishing, passwords, and the one habit that prevents most incidents.",
    minutes: 5, status: "complete", progress: 100, mandatory: true, dueIn: 40,
    mandatoryBecause: "Required of everyone with a company login. Renews annually.",
    enrolled: 12480, completion: 88,
    lessons: [
      { id: "l1", title: "Spotting a phish", minutes: 2, kind: "video" },
      { id: "l2", title: "Passwords and MFA", minutes: 2, kind: "read" },
      { id: "l3", title: "Quick check", minutes: 1, kind: "quiz" },
    ],
  },
  {
    id: "equip", title: "Equipment handling refresher", path: "equipment",
    blurb: "The short version, built after your team flagged it.",
    minutes: 12, status: "in-progress", progress: 33,
    enrolled: 320, completion: 44,
    assignedBecause: "Your team raised equipment training in the last Pulse check-in",
    lessons: [
      { id: "l1", title: "Pre-start checks", minutes: 4, kind: "read" },
      { id: "l2", title: "When to stop the line", minutes: 4, kind: "video" },
      { id: "l3", title: "Reporting a fault", minutes: 4, kind: "quiz" },
    ],
  },
  {
    id: "feedback", title: "Giving feedback that lands", path: "feedback",
    blurb: "Specific, timely, and about the work — not the person.",
    minutes: 10, status: "not-started", progress: 0,
    enrolled: 240, completion: 52,
    lessons: [
      { id: "l1", title: "Say what you saw", minutes: 4, kind: "read" },
      { id: "l2", title: "The bit people skip", minutes: 3, kind: "video" },
      { id: "l3", title: "Practice", minutes: 3, kind: "quiz" },
    ],
  },
  {
    id: "shift", title: "Looking after yourself on nights", path: "wellbeing",
    blurb: "Sleep, food and light when your week runs backwards.",
    minutes: 7, status: "not-started", progress: 0,
    enrolled: 1520, completion: 31,
    lessons: [
      { id: "l1", title: "Sleeping in daylight", minutes: 3, kind: "read" },
      { id: "l2", title: "Eating on nights", minutes: 2, kind: "read" },
      { id: "l3", title: "Getting back to a normal week", minutes: 2, kind: "video" },
    ],
  },
];

/** Sample questions, with the source sentence kept for review — as generated courses do. */
export const sampleQuiz = [
  {
    id: "q1", courseId: "equip",
    text: "Before starting a machine, how many checks are on the pre-start list?",
    options: ["3", "5", "7", "9"], answer: 1, difficulty: 1 as const,
    source: "The pre-start list has five checks and all five must be completed before the machine runs.",
  },
  {
    id: "q2", courseId: "equip",
    text: "True or false: any operator may clear a fault code themselves.",
    options: ["True", "False"], answer: 1, difficulty: 2 as const,
    source: "Fault codes must only be cleared by a qualified technician after the cause is recorded.",
  },
  {
    id: "q3", courseId: "equip",
    text: "You notice an unusual noise mid-run. What comes first?",
    options: ["Finish the batch", "Stop the line and report it", "Note it at shift end", "Increase speed to test it"],
    answer: 1, difficulty: 3 as const,
    source: "Stop the line immediately and report the fault; do not attempt to diagnose while running.",
  },
];

/**
 * Retention history driving spaced repetition.
 *
 * `prompt` and `course` are not decoration. The review queue was rendered
 * straight from `questionId`, so the screen said "lockout-2 — 0 right, 2 wrong,
 * last seen 4d ago": a debug line shipped as a feature, naming an internal key
 * to the one person who cannot act on it. Spaced repetition is the most
 * valuable mechanic in a learning product and it was presented as a log file.
 *
 * A record needs to carry what the question was ABOUT, in the words the learner
 * would use, or the queue can never be shown to them.
 */
export type RetentionRecord = {
  questionId: string;
  correct: number;
  wrong: number;
  lastSeenDaysAgo: number;
  /** What it tested, in plain words. Shown instead of the id. */
  prompt: string;
  /** Which course it came from, so the queue is traceable. */
  course: string;
};

export const retention: RetentionRecord[] = [
  { questionId: "posh-1", correct: 3, wrong: 0, lastSeenDaysAgo: 12,
    prompt: "Who you can raise a POSH complaint with", course: "POSH — what it means day to day" },
  { questionId: "lockout-2", correct: 0, wrong: 2, lastSeenDaysAgo: 4,
    prompt: "Why one lock means one person", course: "Lockout Tagout" },
  { questionId: "itsec-1", correct: 2, wrong: 1, lastSeenDaysAgo: 9,
    prompt: "The two things that make a phishing email obvious", course: "IT security in five minutes" },
  { questionId: "equip-3", correct: 1, wrong: 2, lastSeenDaysAgo: 6,
    prompt: "What comes first when you hear an unusual noise mid-run", course: "Equipment handling refresher" },
  { questionId: "posh-3", correct: 4, wrong: 0, lastSeenDaysAgo: 20,
    prompt: "How long you have to raise a complaint", course: "POSH — what it means day to day" },
];

/**
 * Which of the last seven days had any learning on them.
 *
 * growStats.streak was the number 5 printed on the page — the single most
 * motivating figure in a learning product, rendered as a digit. A streak is a
 * pattern; you cannot see a pattern in a number.
 */
export const learningDays: { day: string; minutes: number }[] = [
  { day: "M", minutes: 6 },
  { day: "T", minutes: 0 },
  { day: "W", minutes: 4 },
  { day: "T", minutes: 8 },
  { day: "F", minutes: 5 },
  { day: "S", minutes: 3 },
  { day: "S", minutes: 6 },
];

export const growStats = {
  completionRate: 74,
  medianMinutes: 6,
  overdueMandatory: 412,
  streak: 5,
  badges: ["Safety first", "Five-day streak", "Compliance clear"],
};

/** What Pulse flagged, feeding recommendPaths(). */
export const pulseThemes = ["equipment", "workload", "manager"];
export const incidents = ["Line 2 equipment fault — 12 Jun"];
