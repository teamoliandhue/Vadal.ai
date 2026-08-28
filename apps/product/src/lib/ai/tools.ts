/**
 * The tool registry — every "AGENTIC" bullet in the brief, as its own tool.
 *
 * The brief's closing instruction: treat "every 'Agentic' bullet as a distinct
 * ticket requiring an explicit human-confirmation step in its design — so AI
 * scope, and the guardrails around it, don't get silently dropped once core CRUD
 * functionality is working."
 *
 * All 16 are here. Confirmation and undo are properties of the REGISTRY, not of
 * each feature: `assertRegistryIsSafe()` throws at import if a tool reaches other
 * people without confirmation, or requires confirmation without an undo path.
 * A missing guardrail fails the build, not a demo.
 *
 * Definitions live here (shared with the server, which proposes calls).
 * Execution lives client-side in app/product/ai-exec.ts — the model proposes,
 * the confirmed client acts.
 */
import type { Role } from "@/lib/auth";
import { canAccess } from "@/lib/access";

export type ToolDef = {
  name: string;
  title: string;
  /** Which pillar of the brief this comes from. */
  pillar: string;
  /** Which product section governs it — the person must be able to reach it. */
  section: string;
  /** True when the action reaches another person or leaves the app. */
  reachesOthers: boolean;
  requiresConfirmation: boolean;
  undoable: boolean;
  /** Set when the brief blocks this from shipping — surfaced, never silent. */
  blockedReason?: string;
  summarise: (args: Record<string, unknown>) => string;
  preview: (args: Record<string, unknown>) => { label: string; value: string }[];
};

const s = (v: unknown, fallback = "—") => (v === undefined || v === null || v === "" ? fallback : String(v));
const list = (v: unknown) => (Array.isArray(v) ? v.map((x, i) => `${i + 1}. ${x}`).join("\n") : s(v));

export const TOOLS: Record<string, ToolDef> = {
  /* ── Pillar 1 · Pulse ─────────────────────────────────────── */

  launch_pulse_survey: {
    name: "launch_pulse_survey",
    title: "Launch a quick pulse",
    pillar: "Pulse",
    // Pulse, not Surveys: the brief's example is a MANAGER launching a pulse,
    // while "configure survey templates" is admin-only. Different capabilities.
    section: "Pulse",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Send a ${(a.questions as string[])?.length ?? 3}-question pulse to ${s(a.audience)}, open for ${s(a.duration, "3 days")}.`,
    preview: (a) => [
      { label: "Audience", value: s(a.audience) },
      { label: "Topic", value: s(a.topic) },
      { label: "Questions", value: list(a.questions) },
      { label: "Open for", value: s(a.duration, "3 days") },
    ],
  },

  diagnose_anomaly: {
    name: "diagnose_anomaly",
    title: "Diagnose a sentiment dip",
    pillar: "Pulse",
    section: "Pulse",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Send a diagnostic micro-survey to ${s(a.team)} to find out why ${s(a.metric, "sentiment")} dropped.`,
    preview: (a) => [
      { label: "Team", value: s(a.team) },
      { label: "Detected", value: s(a.explanation) },
      { label: "Questions", value: list(a.questions) },
      { label: "Anonymous", value: "Yes — a silent team rarely stays silent about the reason" },
    ],
  },

  log_mood_entry: {
    name: "log_mood_entry",
    title: "Log your check-in",
    pillar: "Pulse",
    section: "Home",
    // Private to the person — but the brief still requires confirmation: the
    // Copilot "converts the exchange into a structured Pulse entry ... for the
    // person to confirm before it's logged". A mislogged mood is a wrong data
    // point in someone's own record.
    reachesOthers: false, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Log this week as ${s(a.mood)} in your private check-in history.`,
    preview: (a) => [
      { label: "Mood", value: s(a.mood) },
      { label: "Themes", value: s(a.themes) },
      { label: "You said", value: s(a.quote) },
      { label: "Private", value: "Only you see the words. Your manager sees team-level trends only." },
    ],
  },

  chase_survey: {
    name: "chase_survey",
    title: "Chase non-responders",
    pillar: "Pulse",
    section: "Pulse",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Remind the ${s(a.count, "0")} people who haven't completed “${s(a.survey)}”.`,
    preview: (a) => [
      { label: "Survey", value: s(a.survey) },
      { label: "Reminding", value: `${s(a.count, "0")} people who haven't responded` },
      { label: "Channel", value: s(a.channel, "their most-read channel") },
      { label: "Respects", value: "Quiet hours and the survey-fatigue limit" },
    ],
  },

  /* ── Pillar 2 · Connect ───────────────────────────────────── */

  give_recognition: {
    name: "give_recognition",
    title: "Send recognition",
    pillar: "Connect",
    section: "Recognition",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Post recognition for ${s(a.to)} to the team feed.`,
    preview: (a) => [
      { label: "To", value: s(a.to) },
      { label: "Value", value: s(a.value) },
      { label: "Message", value: s(a.message) },
    ],
  },

  write_post: {
    name: "write_post",
    title: "Write it up as a post",
    pillar: "Connect",
    section: "Feed",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Publish a post to ${s(a.channel, "the company feed")} drawn from ${s(a.source, "your workspace data")}.`,
    preview: (a) => [
      { label: "Channel", value: s(a.channel, "Company feed") },
      { label: "Drawn from", value: s(a.source) },
      { label: "Post", value: s(a.text) },
      { label: "Moderation", value: s(a.moderation, "Passed") },
    ],
  },

  schedule_milestone_post: {
    name: "schedule_milestone_post",
    title: "Schedule a milestone post",
    pillar: "Connect",
    section: "Feed",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Schedule a recognition post for ${s(a.person)}'s ${s(a.milestone)} on ${s(a.when)}.`,
    preview: (a) => [
      { label: "Person", value: s(a.person) },
      { label: "Milestone", value: s(a.milestone) },
      { label: "Goes live", value: s(a.when) },
      { label: "Post", value: s(a.text) },
    ],
  },

  /* ── Pillar 3 · Amplify ───────────────────────────────────── */

  share_to_social: {
    name: "share_to_social",
    title: "Share to your profile",
    pillar: "Amplify",
    section: "Feed",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    // The brief requires a per-platform feasibility spike before this is
    // committed to. Surfaced on the card rather than failing after confirmation.
    blockedReason:
      "Posting to personal social profiles needs a per-platform feasibility spike and your own OAuth grant, neither of which exists yet. The draft is ready to copy.",
    summarise: (a) => `Post to your ${s(a.platform)} profile with your own caption.`,
    preview: (a) => [
      { label: "Platform", value: s(a.platform) },
      { label: "Caption", value: s(a.caption) },
      { label: "Best time", value: s(a.bestTime) },
      { label: "Opt-in", value: "Required per employee — nothing posts under your name without it" },
    ],
  },

  queue_for_advocacy: {
    name: "queue_for_advocacy",
    title: "Queue for advocacy",
    pillar: "Amplify",
    section: "Campaigns",
    reachesOthers: false, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Build an advocacy card for “${s(a.title)}” with ${s(a.captionCount, "2")} caption options.`,
    preview: (a) => [
      { label: "Post", value: s(a.title) },
      { label: "Platforms", value: s(a.platforms) },
      { label: "Captions", value: list(a.captions) },
      { label: "Suggested time", value: s(a.bestTime) },
    ],
  },

  /* ── Pillar 4 · Thrive ────────────────────────────────────── */

  log_activity: {
    name: "log_activity",
    title: "Log your activity",
    pillar: "Thrive",
    section: "Home",
    reachesOthers: false, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Log ${s(a.activity)} to your Thrive record.`,
    preview: (a) => [
      { label: "Activity", value: s(a.activity) },
      { label: "When", value: s(a.when, "Today") },
      { label: "Counts toward", value: s(a.challenge, "Your weekly goal") },
    ],
  },

  adjust_goal: {
    name: "adjust_goal",
    title: "Adjust your goal",
    pillar: "Thrive",
    section: "Home",
    reachesOthers: false, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Change your ${s(a.metric)} goal from ${s(a.from)} to ${s(a.to)}.`,
    preview: (a) => [
      { label: "Goal", value: s(a.metric) },
      { label: "Now", value: s(a.from) },
      { label: "New", value: s(a.to) },
      { label: "Why", value: s(a.reason) },
    ],
  },

  book_benefit_call: {
    name: "book_benefit_call",
    title: "Book a benefits call",
    pillar: "Thrive",
    section: "Home",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Book a call with benefits support about ${s(a.benefit)}.`,
    preview: (a) => [
      { label: "About", value: s(a.benefit) },
      { label: "Because", value: s(a.reason) },
      { label: "Shared", value: "Only that you asked about this benefit" },
    ],
  },

  /* ── Pillar 5 · Broadcast ─────────────────────────────────── */

  draft_announcement: {
    name: "draft_announcement",
    title: "Draft an announcement",
    pillar: "Broadcast",
    section: "Campaigns",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Queue an announcement to ${s(a.audience)} for approval — it will not send itself.`,
    preview: (a) => [
      { label: "Audience", value: s(a.audience) },
      { label: "Priority", value: s(a.priority, "Normal") },
      { label: "Message", value: s(a.text) },
      { label: "Reading level", value: s(a.readingLevel) },
      { label: "Status", value: "Pending human approval — AI-assisted drafts cannot send themselves" },
    ],
  },

  chase_acknowledgement: {
    name: "chase_acknowledgement",
    title: "Chase acknowledgement",
    pillar: "Broadcast",
    section: "Campaigns",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Remind the ${s(a.count, "0")} people who haven't acknowledged “${s(a.message)}”.`,
    preview: (a) => [
      { label: "Message", value: s(a.message) },
      { label: "Reminding", value: `${s(a.count, "0")} who haven't confirmed` },
      { label: "Channel", value: s(a.channel, "Most-read channel per person") },
      { label: "Critical", value: s(a.critical, "No") },
    ],
  },

  /* ── Pillar 6 · Grow ──────────────────────────────────────── */

  make_course: {
    name: "make_course",
    title: "Turn this into a course",
    pillar: "Grow",
    section: "Knowledge",
    reachesOthers: false, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Generate a ${s(a.modules, "0")}-module micro-course with ${s(a.questions, "0")} draft quiz questions, as a draft for review.`,
    preview: (a) => [
      { label: "Course", value: s(a.title) },
      { label: "Modules", value: s(a.modules) },
      { label: "Quiz", value: `${s(a.questions)} draft questions` },
      { label: "Length", value: `${s(a.minutes)} min total` },
      { label: "Status", value: s(a.reviewNote, "Draft — needs human review before publishing") },
    ],
  },

  assign_learning: {
    name: "assign_learning",
    title: "Assign a learning path",
    pillar: "Grow",
    section: "Pulse",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    summarise: (a) => `Assign “${s(a.path)}” to ${s(a.audience)}, with a note explaining why.`,
    preview: (a) => [
      { label: "Path", value: s(a.path) },
      { label: "To", value: s(a.audience) },
      { label: "Because", value: s(a.because) },
      { label: "Note to them", value: s(a.note) },
    ],
  },

  /* ── Pillar 7 · One-to-One Help ───────────────────────────── */

  book_counsellor: {
    name: "book_counsellor",
    title: "Book a session with a counsellor",
    pillar: "One-to-One Help",
    section: "Home",
    reachesOthers: true, requiresConfirmation: true, undoable: true,
    // The brief treats clinical/legal sign-off as a hard blocker on launch.
    blockedReason:
      "This pillar needs clinical, legal and HR sign-off on its triage thresholds and data-access rules before it reaches a real employee. The brief calls that a hard blocker on launch, not a fast-follow.",
    summarise: (a) => `Book a confidential session with ${s(a.provider, "the EAP")}${a.shareSummary ? ", sharing your handoff summary" : ""}.`,
    preview: (a) => [
      { label: "With", value: s(a.provider, "EAP counsellor") },
      { label: "When", value: s(a.when, "Next available") },
      { label: "Shared", value: a.shareSummary ? s(a.summary) : "Nothing — you can go in cold if you'd rather" },
      { label: "Seen by", value: "The counsellor only. Never your manager or HR." },
    ],
  },
};

/**
 * Which tools this person may be offered.
 *
 * Re-checked here as well as in the UI: the Copilot must never propose an action
 * the person could not perform themselves, or confirmation becomes a way around
 * the permission model rather than a check on it.
 */
export function toolsFor(role: Role | null | undefined): ToolDef[] {
  if (!role) return [];
  return Object.values(TOOLS).filter((t) => canAccess(role, t.section));
}

export function toolFor(role: Role | null | undefined, name: string): ToolDef | null {
  const t = TOOLS[name];
  if (!t || !role || !canAccess(role, t.section)) return null;
  return t;
}

/** Invariants the registry must satisfy. Throws at import time if violated. */
export function assertRegistryIsSafe(): void {
  for (const t of Object.values(TOOLS)) {
    if (t.reachesOthers && !t.requiresConfirmation) {
      throw new Error(`Tool "${t.name}" reaches other people but does not require confirmation.`);
    }
    if (t.requiresConfirmation && !t.undoable) {
      throw new Error(`Tool "${t.name}" requires confirmation but offers no undo.`);
    }
  }
}

assertRegistryIsSafe();
