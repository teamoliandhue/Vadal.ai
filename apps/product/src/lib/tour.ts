/**
 * Get Started — the tour, as a model.
 *
 * Lives under the "Vadal.ai" nav group: the assistant's own space, where it
 * surfaces things it has tailored for the person. Get Started is the first of
 * those and the only permanent one — a walkthrough of what the product is and
 * what each part does, for someone seeing it for the first time.
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
  | "welcome" | "ritual" | "listen" | "engage" | "amplify"
  | "wellbeing" | "help" | "learn" | "knowledge" | "copilot" | "done";

export type TourStep = {
  id: DemoKey;
  /** What it does for you — the step's title. */
  title: string;
  /** The idea behind it, in one short paragraph. Meaning before mechanism. */
  meaning: string;
  /** The section this step opens, if any. Gated through access.ts. */
  section?: string;
  href?: string;
  /** Shown instead of the open button when the role cannot open the section. */
  lockedNote?: string;
};

export const TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "What Vadal is",
    meaning:
      "A company stays human when every employee has a daily ritual worth keeping, and the people who run it can hear what that ritual produces. Vadal is both halves in one product, with an assistant running through all of it.",
  },
  {
    id: "ritual",
    title: "Your daily ritual",
    meaning:
      "Five seconds, once a day: how are you feeling? It is private to you, it builds a streak, and it is the only thing the product asks of you every day. Everything else follows from it.",
    section: "Home", href: "/product/home",
  },
  {
    id: "listen",
    title: "It listens, all the time",
    meaning:
      "Check-ins, surveys, the feed, campaign reach and recognition are reconciled into one health score — not four dashboards that disagree. Every input is shown, so the number can be argued with rather than trusted.",
    section: "Pulse", href: "/product",
    lockedNote: "You don't see this view — it is the people team's, and your own check-ins reach it only as an anonymous part of the whole. That is by design.",
  },
  {
    id: "engage",
    title: "Recognition people actually feel",
    meaning:
      "Kudos tied to the company's own values, visible where colleagues see it, and counted toward the health score. Most recognition programmes are a form; this one is a feed.",
    section: "Recognition", href: "/product/recognition",
  },
  {
    id: "amplify",
    title: "Their words, going out",
    meaning:
      "Most advocacy tools only ask employees to carry the company's posts. Vadal notices moments that are yours — a launch you shipped, kudos you received — and drafts them in your voice. A policy check stops a revenue figure going public by accident.",
    section: "Amplify", href: "/product/amplify",
  },
  {
    id: "wellbeing",
    title: "Wellbeing that fits the job",
    meaning:
      "A line operator already walks 17,000 steps doing their job; a step target would be scoring them on their work. So the goal changes with the person — recovery for one, movement for another — and money sits beside health, because it is the other half of wellbeing.",
    section: "Thrive", href: "/product/thrive",
  },
  {
    id: "help",
    title: "A door that is always open",
    meaning:
      "A private first step toward support, with a real person one tap away on every screen. Crisis lines sit above the assistant, take no conversation as input, and never depend on anything the AI decides.",
    section: "One-to-One Help", href: "/product/help",
  },
  {
    id: "learn",
    title: "Five minutes is enough",
    meaning:
      "Courses generated from a document, lessons that fit a break, and spaced repetition that brings back what you keep missing. Learning that happens between things, not instead of them.",
    section: "Grow", href: "/product/grow",
  },
  {
    id: "knowledge",
    title: "Answers, with the source attached",
    meaning:
      "Ask about leave, pay, or how anything works here. The answer comes from the company's own approved documents with the sentence cited — and it refuses rather than guesses when the answer is not in them.",
    section: "Knowledge", href: "/product/knowledge",
  },
  {
    id: "copilot",
    title: "One assistant — and it can act",
    meaning:
      "The Copilot is on every screen. It answers, drafts, and proposes actions: launch a pulse, chase a survey, give kudos. Anything that reaches a real person confirms before it runs and can be undone — enforced in code, not left to the prompt.",
  },
  {
    id: "done",
    title: "You're set",
    meaning:
      "That is the whole product. Everything you just saw is live on your workspace's data. From here, the assistant will use this space to surface what it thinks you should look at next.",
  },
];

export type TourStepView = TourStep & { locked: boolean; index: number };

/** The tour for this role — every step, with the ones they cannot open marked. */
export function tourFor(role: Role | null): TourStepView[] {
  return TOUR.map((s, index) => ({
    ...s,
    index,
    locked: Boolean(s.section) && !canAccess(role, s.section!),
  }));
}

export const TOUR_STORAGE_KEY = "vadal:tour-explored";
