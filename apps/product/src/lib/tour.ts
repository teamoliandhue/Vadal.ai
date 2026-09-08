/**
 * Get Started — the tour, as a model.
 *
 * Lives under the "Vadal.ai" nav group: the assistant's own space, where it
 * surfaces things it has tailored for the person. Get Started is the first of
 * those and the only permanent one — a walkthrough of what the product is and
 * what each part does, for someone seeing it for the first time.
 *
 * The shape is the product briefs' shape. "Vadal.ai — Product Specification &
 * AI Feature Brief" defines the product as seven pillars and one AI layer:
 * Pulse · Connect · Amplify · Thrive · Broadcast · Grow · One-to-One Help, with
 * the Copilot running through all of them. The strategy summary adds the two
 * pillars that close the loop on what was heard — Manager Enablement and Case
 * Management. The tour walks all nine, by name and in that order, and each
 * scene lists the sections of the app that make the pillar up — so what the
 * product *is* and where it *lives* are the same list.
 *
 * Two audiences, one need. A new joiner does not know what the product can do;
 * neither does an investor. Both need the meaning first and the features as
 * evidence of it, one at a time, with a way into the real thing from each step.
 *
 * Tailored by role, which is the honest first version of "Vadal.ai tailors it".
 * A step whose section the person cannot open is kept, not hidden — a new
 * employee should know the people team has Pulse, and that they will never see
 * it. Saying so is the point: nothing reaches a manager or HR without consent.
 */
import type { Role } from "./auth";
import { canAccess } from "./access";

export type DemoKey =
  | "welcome" | "ritual" | "pulse" | "connect" | "amplify"
  | "thrive" | "broadcast" | "grow" | "help" | "managers" | "cases" | "copilot" | "done";

/** Something a person actually does in the product. A step that names one is
    explored when the action happens — anywhere, not only on the tour page —
    because "explored" should mean you did the thing, not that you clicked Next. */
export type TourAction = "checkin" | "kudos" | "ask" | "answer" | `open:${string}`;

/** A section of the app that belongs to a pillar. */
export type TourPart = { label: string; href: string };

export type TourStep = {
  id: DemoKey;
  /** What it does for you — the step's title. */
  title: string;
  /** The idea behind it, in one short paragraph. Meaning before mechanism. */
  meaning: string;
  /** The brief's pillar this scene is: number (none for the layer that runs
      through them), name, and its one-line tag. */
  pillar?: { n?: number; name: string; tag: string };
  /** The sections of the app that make the pillar up. Gated per role. */
  parts?: TourPart[];
  /** The section this step opens, if any. Gated through access.ts. */
  section?: string;
  href?: string;
  /** Shown instead of the open button when the role cannot open the section. */
  lockedNote?: string;
  /** The action that explores this step, and how to name it. Steps without one
      are pure ideas and are explored by reading them. */
  completesOn?: TourAction;
  /** "Explored when you …" — imperative, lowercase. */
  actionLabel?: string;
  /** "Explored — you …" — past tense, lowercase. */
  doneLabel?: string;
};

export const TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "What Vadal is",
    meaning: "Employees get a daily ritual. Leaders hear what it produces. One product, nine pillars, one assistant.",
  },
  {
    id: "ritual",
    title: "Your daily ritual",
    meaning: "Five seconds a day: how are you feeling? Private to you. Everything else starts here.",
    section: "Home", href: "/product/home",
    parts: [{ label: "Home", href: "/product/home" }],
    completesOn: "checkin", actionLabel: "log today's check-in", doneLabel: "logged today's check-in",
  },
  {
    id: "pulse",
    title: "Hear how people really feel.",
    meaning: "Surveys, check-ins and comments become one health score — with every input shown.",
    pillar: { n: 1, name: "Pulse", tag: "Listening & Feedback" },
    parts: [
      { label: "Pulse", href: "/product" },
      { label: "Surveys", href: "/product/surveys" },
      { label: "Sentiment", href: "/product/sentiment" },
      { label: "Always-on listening", href: "/product/listening" },
      { label: "Analytics", href: "/product/analytics" },
    ],
    section: "Pulse", href: "/product",
    lockedNote: "The people team's view. Your check-ins reach it only anonymously.",
    completesOn: "open:Pulse", actionLabel: "open Pulse", doneLabel: "opened Pulse",
  },
  {
    id: "connect",
    title: "A feed where people share wins.",
    meaning: "Post, celebrate, recognise. Tied to your values, visible to everyone.",
    pillar: { n: 2, name: "Connect", tag: "Social & Showcase Feed" },
    parts: [
      { label: "Feed", href: "/product/feed" },
      { label: "Recognition", href: "/product/recognition" },
    ],
    section: "Feed", href: "/product/feed",
    completesOn: "kudos", actionLabel: "recognise someone", doneLabel: "recognised someone",
  },
  {
    id: "amplify",
    title: "Your moments, shared outside.",
    meaning: "Vadal drafts your wins in your voice. You choose what goes out.",
    pillar: { n: 3, name: "Amplify", tag: "Company Social Media Integration" },
    parts: [{ label: "Amplify", href: "/product/amplify" }],
    section: "Amplify", href: "/product/amplify",
    completesOn: "open:Amplify", actionLabel: "open Amplify", doneLabel: "opened Amplify",
  },
  {
    id: "thrive",
    title: "Health and wealth, side by side.",
    meaning: "A goal that fits your job, and money guidance right next to it.",
    pillar: { n: 4, name: "Thrive", tag: "Health & Wealth" },
    parts: [{ label: "Thrive", href: "/product/thrive" }],
    section: "Thrive", href: "/product/thrive",
    completesOn: "open:Thrive", actionLabel: "open Thrive", doneLabel: "opened Thrive",
  },
  {
    id: "broadcast",
    title: "One channel everyone trusts.",
    meaning: "Announcements that get acknowledged, campaigns that report reach, and a policy library you can ask.",
    pillar: { n: 5, name: "Broadcast", tag: "Communication Hub" },
    parts: [
      { label: "Campaigns", href: "/product/campaigns" },
      { label: "Knowledge", href: "/product/knowledge" },
    ],
    section: "Knowledge", href: "/product/knowledge",
    completesOn: "answer", actionLabel: "ask it something", doneLabel: "asked it something",
  },
  {
    id: "grow",
    title: "Learning in five minutes.",
    meaning: "Short lessons, quick quizzes, and reminders for what you keep missing.",
    pillar: { n: 6, name: "Grow", tag: "Bite-Sized Learning" },
    parts: [{ label: "Grow", href: "/product/grow" }],
    section: "Grow", href: "/product/grow",
    completesOn: "open:Grow", actionLabel: "open Grow", doneLabel: "opened Grow",
  },
  {
    id: "help",
    title: "A private door to support.",
    meaning: "Talk it through confidentially. A real person is always one tap away.",
    pillar: { n: 7, name: "One-to-One Help", tag: "AI Companion" },
    parts: [{ label: "One-to-One Help", href: "/product/help" }],
    section: "One-to-One Help", href: "/product/help",
    completesOn: "open:One-to-One Help", actionLabel: "open One-to-One Help", doneLabel: "opened One-to-One Help",
  },
  {
    id: "managers",
    title: "Insight managers act on.",
    meaning: "Team health, what is driving it, and the one action to take this week.",
    pillar: { n: 8, name: "Managers", tag: "Manager Enablement" },
    parts: [{ label: "Manager hub", href: "/product/managers" }],
    section: "Manager hub", href: "/product/managers",
    lockedNote: "Your manager's view of the team as a whole — never your words with your name on them.",
    completesOn: "open:Manager hub", actionLabel: "open the Manager hub", doneLabel: "opened the Manager hub",
  },
  {
    id: "cases",
    title: "Nothing raised gets lost.",
    meaning: "Concerns become cases — owned, timed, and resolved.",
    pillar: { n: 9, name: "Cases", tag: "Case Management & Issue Resolution" },
    parts: [{ label: "Cases", href: "/product/cases" }],
    section: "Cases", href: "/product/cases",
    lockedNote: "The people team's queue. If you raised something, you hear from its owner.",
    completesOn: "open:Cases", actionLabel: "open Cases", doneLabel: "opened Cases",
  },
  {
    id: "copilot",
    title: "One assistant. It can act.",
    meaning: "Ask, draft, launch a pulse, give kudos. It confirms before anything reaches a person.",
    pillar: { name: "The AI layer", tag: "Personalisation · Sentiment · Copilot · Guardrails" },
    completesOn: "ask", actionLabel: "ask the assistant anything", doneLabel: "asked the assistant",
  },
  {
    id: "done",
    title: "You're set",
    meaning: "Nine pillars, one assistant, all live on your own data.",
  },
];

export type TourPartView = TourPart & { locked: boolean };
export type TourStepView = TourStep & { locked: boolean; index: number; partsView: TourPartView[] };

/** The tour for this role — every step, with the ones they cannot open marked. */
export function tourFor(role: Role | null): TourStepView[] {
  return TOUR.map((s, index) => ({
    ...s,
    index,
    locked: Boolean(s.section) && !canAccess(role, s.section!),
    partsView: (s.parts ?? []).map((p) => ({ ...p, locked: !canAccess(role, p.label) })),
  }));
}

export const TOUR_STORAGE_KEY = "vadal:tour-explored";
/** Set once the person has seen the tour page; Home stops landing on it. */
export const TOUR_SEEN_KEY = "vadal:tour-seen";
/** Set when they hide the resume card on Home. */
export const TOUR_DISMISSED_KEY = "vadal:tour-dismissed";

export const TOUR_ACTION_EVENT = "vadal:did";

/** Announce that the person did something. Fired by the real features
    (check-in, recognition, knowledge, every section's shell) and read by
    the tour, which marks the matching step explored wherever it happened. */
export function didAction(action: TourAction) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOUR_ACTION_EVENT, { detail: { action } }));
}

export function stepForAction(action: TourAction): DemoKey | null {
  return TOUR.find((s) => s.completesOn === action)?.id ?? null;
}
