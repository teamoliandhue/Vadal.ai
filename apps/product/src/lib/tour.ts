/**
 * Get Started — the tour, as a model.
 *
 * Lives under the "Vadal.ai" nav group: the assistant's own space, where it
 * surfaces things it has tailored for the person. Get Started is the first of
 * those and the only permanent one — a walkthrough of what the product is and
 * what each part does, for someone seeing it for the first time.
 *
 * The shape is the product brief's shape. "Vadal.ai — Product Specification &
 * AI Feature Brief" defines the product as seven pillars and one AI layer:
 * Pulse · Connect · Amplify · Thrive · Broadcast · Grow · One-to-One Help, with
 * the Copilot running through all of them. The tour walks those, by name and
 * in that order, and each scene lists the sections of the app that make the
 * pillar up — so what the product *is* and where it *lives* are the same list.
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
  | "thrive" | "broadcast" | "grow" | "help" | "copilot" | "done";

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
  /** The brief's pillar this scene is: number, name, and its one-line tag. */
  pillar?: { n: number; name: string; tag: string };
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
    meaning:
      "A company stays human when every employee has a daily ritual worth keeping, and the people who run it can hear what that ritual produces. Vadal is both halves in one product: seven pillars, with one assistant running through all of them.",
  },
  {
    id: "ritual",
    title: "Your daily ritual",
    meaning:
      "Five seconds, once a day: how are you feeling? It is private to you, it builds a streak, and it is the only thing the product asks of you every day. Everything else follows from it — it is the front door to Pulse.",
    section: "Home", href: "/product/home",
    parts: [{ label: "Home", href: "/product/home" }],
    completesOn: "checkin", actionLabel: "log today's check-in", doneLabel: "logged today's check-in",
  },
  {
    id: "pulse",
    title: "Listening, structured and ambient, across the whole employee lifecycle.",
    meaning:
      "Onboarding, day 30/60/90, the biannual and annual cycles — and the check-ins in between. Free text becomes themes, a dip in a team's mood is flagged before it becomes resignations, and everything reconciles into one health score you can argue with rather than trust.",
    pillar: { n: 1, name: "Pulse", tag: "Listening & Feedback" },
    parts: [
      { label: "Pulse", href: "/product" },
      { label: "Surveys", href: "/product/surveys" },
      { label: "Sentiment", href: "/product/sentiment" },
      { label: "Always-on listening", href: "/product/listening" },
      { label: "Analytics", href: "/product/analytics" },
    ],
    section: "Pulse", href: "/product",
    lockedNote: "You don't see this view — it is the people team's, and your own check-ins reach it only as an anonymous part of the whole. That is by design.",
    completesOn: "open:Pulse", actionLabel: "open Pulse", doneLabel: "opened Pulse",
  },
  {
    id: "connect",
    title: "An internal feed where people share wins, not just HR pushes updates.",
    meaning:
      "Every employee — including the field and factory workers who never get a LinkedIn moment for their work — gets a place to post, celebrate and be recognised. Kudos are tied to the company's own values, visible where colleagues see them, and counted toward the health score.",
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
    title: "Bring the company's voice in, and let employee moments go out.",
    meaning:
      "Most advocacy tools only ask employees to carry the company's posts. Vadal notices moments that are yours — a launch you shipped, kudos you received — and drafts them in your voice, with a policy check that stops a revenue figure going public by accident. Every share is opt-in, by name.",
    pillar: { n: 3, name: "Amplify", tag: "Company Social Media Integration" },
    parts: [{ label: "Amplify", href: "/product/amplify" }],
    section: "Amplify", href: "/product/amplify",
    completesOn: "open:Amplify", actionLabel: "open Amplify", doneLabel: "opened Amplify",
  },
  {
    id: "thrive",
    title: "One wellness pillar: physical health and financial health, side by side.",
    meaning:
      "A line operator already walks 17,000 steps doing their job; a step target would be scoring them on their work. So the goal changes with the person — recovery for one, movement for another — and money sits beside health, because it is the other half of wellbeing.",
    pillar: { n: 4, name: "Thrive", tag: "Health & Wealth" },
    parts: [{ label: "Thrive", href: "/product/thrive" }],
    section: "Thrive", href: "/product/thrive",
    completesOn: "open:Thrive", actionLabel: "open Thrive", doneLabel: "opened Thrive",
  },
  {
    id: "broadcast",
    title: "One trusted channel for everything the company needs employees to know.",
    meaning:
      "Announcements that are targeted, scheduled and — for the ones that matter — acknowledged, not just sent. Campaigns that report reach and lift, not opens. And a policy library you can ask questions of: the answer comes from the company's own approved documents with the sentence cited, and it refuses rather than guesses.",
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
    title: "Learning that fits into a five-minute break, not a training day.",
    meaning:
      "Courses generated from a document, lessons that fit a break, and spaced repetition that brings back what you keep missing. Learning that happens between things, not instead of them — and suggested because of what your team flagged, not from a generic role template.",
    pillar: { n: 6, name: "Grow", tag: "Bite-Sized Learning" },
    parts: [{ label: "Grow", href: "/product/grow" }],
    section: "Grow", href: "/product/grow",
    completesOn: "open:Grow", actionLabel: "open Grow", doneLabel: "opened Grow",
  },
  {
    id: "help",
    title: "A private first door to support, with a real person always one step away.",
    meaning:
      "A confidential first conversation about stress, conflict, workload or something personal — one that listens well, never pretends to be a clinician, and hands off to a real counsellor whenever you want one. Crisis lines sit above the assistant and never depend on anything the AI decides.",
    pillar: { n: 7, name: "One-to-One Help", tag: "AI Companion" },
    parts: [{ label: "One-to-One Help", href: "/product/help" }],
    section: "One-to-One Help", href: "/product/help",
    completesOn: "open:One-to-One Help", actionLabel: "open One-to-One Help", doneLabel: "opened One-to-One Help",
  },
  {
    id: "copilot",
    title: "One AI layer, not seven integrations — and it can act.",
    meaning:
      "One profile ranks the feed, orders Home and picks what to learn next. One sentiment engine reads surveys, posts and acknowledgements into one score. And one Copilot on every screen answers, drafts, and proposes actions — launch a pulse, chase a survey, give kudos — confirming before anything reaches a real person, enforced in code, not left to the prompt.",
    pillar: { n: 8, name: "The AI layer", tag: "Personalisation · Sentiment · Copilot · Guardrails" },
    completesOn: "ask", actionLabel: "ask the assistant anything", doneLabel: "asked the assistant",
  },
  {
    id: "done",
    title: "You're set",
    meaning:
      "That is the whole product: seven pillars and the layer that runs through them, every one live on your workspace's data. From here, the assistant will use this space to surface what it thinks you should look at next.",
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
