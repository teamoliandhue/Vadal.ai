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
  /** The product this scene is: number (none for the layer that runs through
      them all), name, its one-line tag, plus the short forms the opening
      grid uses — because the first five seconds have to fit nine of them. */
  pillar?: { n?: number; name: string; tag: string; shortName?: string; short?: string };
  /** The sections of the app that make the pillar up. Gated per role. */
  parts?: TourPart[];
  /** The section this step opens, if any. Gated through access.ts. */
  section?: string;
  href?: string;
  /** Where the product card goes when it should differ from the tour step. */
  tile?: { section: string; href: string };
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
    meaning: "One AI platform, nine HR products, and an assistant running through all of them.",
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
    pillar: { n: 1, name: "Listen", tag: "Listening & Feedback" , shortName: "Listen", short: "Pulse surveys & sentiment" },
    parts: [
      { label: "Insight", href: "/product" },
      { label: "Pulse", href: "/product/pulse" },
      { label: "Sentiment", href: "/product/sentiment" },
      { label: "Listen", href: "/product/listen" },
      { label: "Explore", href: "/product/analytics" },
    ],
    section: "Insight", href: "/product",
    lockedNote: "The people team's view. Your check-ins reach it only anonymously.",
    completesOn: "open:Insight", actionLabel: "open Insight", doneLabel: "opened Insight",
  },
  {
    id: "connect",
    title: "A feed where people share wins.",
    meaning: "Post, celebrate, recognise. Tied to your values, visible to everyone.",
    pillar: { n: 2, name: "Social", tag: "Social & Showcase Feed" , shortName: "Social", short: "Feed & kudos" },
    parts: [
      { label: "Social", href: "/product/social" },
      { label: "Kudos", href: "/product/kudos" },
    ],
    section: "Social", href: "/product/social",
    completesOn: "kudos", actionLabel: "recognise someone", doneLabel: "recognised someone",
  },
  {
    id: "amplify",
    title: "Your moments, shared outside.",
    meaning: "Vadal drafts your wins in your voice. You choose what goes out.",
    pillar: { n: 3, name: "Amplify", tag: "Company Social Media Integration" , shortName: "Amplify", short: "Employee advocacy" },
    parts: [{ label: "Amplify", href: "/product/amplify" }],
    section: "Amplify", href: "/product/amplify",
    completesOn: "open:Amplify", actionLabel: "open Amplify", doneLabel: "opened Amplify",
  },
  {
    id: "thrive",
    title: "Health and wealth, side by side.",
    meaning: "A goal that fits your job, and money guidance right next to it.",
    pillar: { n: 4, name: "iThrive", tag: "Health & Wealth" , shortName: "iThrive", short: "Health & wealth" },
    parts: [{ label: "iThrive", href: "/product/ithrive" }],
    section: "iThrive", href: "/product/ithrive",
    completesOn: "open:iThrive", actionLabel: "open iThrive", doneLabel: "opened iThrive",
  },
  {
    id: "broadcast",
    title: "One channel everyone trusts.",
    meaning: "Announcements that get acknowledged, campaigns that report reach, and a policy library you can ask.",
    pillar: { n: 5, name: "Broadcast", tag: "Communication Hub" , shortName: "Broadcast", short: "Comms & policies" },
    parts: [
      { label: "Campaigns", href: "/product/campaigns" },
      { label: "Knowledge", href: "/product/knowledge" },
    ],
    section: "Knowledge", href: "/product/knowledge",
    tile: { section: "Campaigns", href: "/product/campaigns" },
    completesOn: "answer", actionLabel: "ask it something", doneLabel: "asked it something",
  },
  {
    id: "grow",
    title: "Learning in five minutes.",
    meaning: "Short lessons, quick quizzes, and reminders for what you keep missing.",
    pillar: { n: 6, name: "iLearn", tag: "Bite-Sized Learning" , shortName: "iLearn", short: "Micro-learning" },
    parts: [{ label: "iLearn", href: "/product/ilearn" }],
    section: "iLearn", href: "/product/ilearn",
    completesOn: "open:iLearn", actionLabel: "open iLearn", doneLabel: "opened iLearn",
  },
  {
    id: "help",
    title: "A private door to support.",
    meaning: "Talk it through confidentially. A real person is always one tap away.",
    pillar: { n: 7, name: "iCare", tag: "AI Companion" , shortName: "iCare", short: "Private support" },
    parts: [{ label: "iCare", href: "/product/icare" }],
    section: "iCare", href: "/product/icare",
    completesOn: "open:iCare", actionLabel: "open iCare", doneLabel: "opened iCare",
  },
  {
    id: "managers",
    title: "Insight managers act on.",
    meaning: "Team health, what is driving it, and the one action to take this week.",
    pillar: { n: 8, name: "Managers", tag: "Manager Enablement" , shortName: "Managers", short: "Manager tools" },
    parts: [{ label: "Manager hub", href: "/product/managers" }],
    section: "Manager hub", href: "/product/managers",
    lockedNote: "Your manager's view of the team as a whole — never your words with your name on them.",
    completesOn: "open:Manager hub", actionLabel: "open the Manager hub", doneLabel: "opened the Manager hub",
  },
  {
    id: "cases",
    title: "Nothing raised gets lost.",
    meaning: "Concerns become cases — owned, timed, and resolved.",
    pillar: { n: 9, name: "Flow", tag: "Case Management & Issue Resolution" , shortName: "Flow", short: "Issue resolution" },
    parts: [{ label: "Flow", href: "/product/flow" }],
    section: "Flow", href: "/product/flow",
    lockedNote: "The people team's queue. If you raised something, you hear from its owner.",
    completesOn: "open:Flow", actionLabel: "open Flow", doneLabel: "opened Flow",
  },
  {
    id: "copilot",
    title: "One assistant. It can act.",
    meaning: "Ask, draft, launch a pulse, give kudos. It confirms before anything reaches a person.",
    pillar: { name: "Nudge", tag: "The AI layer · Personalisation · Sentiment · Guardrails" },
    completesOn: "ask", actionLabel: "ask the assistant anything", doneLabel: "asked the assistant",
  },
  {
    id: "done",
    title: "You're set",
    meaning: "Nine products, one assistant, all live on your own data.",
  },
];

/** One of the nine, as the opening grid shows it. */
export type ProductTile = { n: number; name: string; short: string; index: number; locked: boolean; href: string };

/** The nine products. An investor who looks at the first screen for five
    seconds should be able to say "an HR AI company with nine products" — so
    the nine are named there, not counted. */
export function productTiles(role: Role | null): ProductTile[] {
  return tourFor(role)
    .filter((s) => s.pillar?.n)
    .map((s) => ({
      n: s.pillar!.n!,
      name: s.pillar!.shortName ?? s.pillar!.name,
      short: s.pillar!.short ?? s.pillar!.tag,
      index: s.index,
      locked: s.locked,
      /* A tile may prefer a different door from the tour step — Broadcast's
         card opens Campaigns — but only for a role that can walk through it. */
      href: (s.tile && canAccess(role, s.tile.section) ? s.tile.href : s.href) ?? "/product/home",
    }));
}

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
