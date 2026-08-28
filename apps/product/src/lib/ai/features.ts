/**
 * Every AI feature named in the product brief, mapped to what implements it.
 *
 * This exists so "are the AI features built?" has a checkable answer instead of
 * an opinion. Each entry names the pillar, quotes the brief, and points at the
 * module and exported function that implements it. `verifyFeatures()` asserts
 * that every implementation actually exists at runtime — a feature that is
 * listed but not wired fails the check.
 *
 * `surface` is deliberately separate from `implemented`, so "the logic exists"
 * is never confused with "a person can reach it". All seven pillars now have
 * screens; what remains `copilot` is reachable only by asking, and `engine-only`
 * runs underneath a surface without a control of its own.
 */

export type FeatureStatus = {
  id: string;
  pillar: string;
  /** The brief's own words. */
  brief: string;
  /** Module path under lib/ai. */
  module: string;
  /** Exported symbol that implements it. */
  entry: string;
  agentic: boolean;
  /** Where a person meets it today. */
  surface: "copilot" | "screen" | "engine-only";
  /** Set when the brief itself blocks shipping. */
  blocked?: string;
};

export const FEATURES: FeatureStatus[] = [
  /* ── Onboarding (§2) ─────────────────────────────────────── */
  { id: "onb-assistant", pillar: "Onboarding", brief: "Conversational onboarding assistant replaces static forms", module: "engines/onboarding", entry: "openingTurn", agentic: false, surface: "copilot" },
  { id: "onb-progressive", pillar: "Onboarding", brief: "Progressive profiling — 2–3 light questions per session over the first two weeks", module: "engines/onboarding", entry: "nextTurn", agentic: false, surface: "copilot" },
  { id: "onb-locale", pillar: "Onboarding", brief: "Automatic locale and reading-level adaptation", module: "engines/text", entry: "localise", agentic: false, surface: "engine-only" },

  /* ── Pillar 1 · Pulse ────────────────────────────────────── */
  { id: "pulse-checkin", pillar: "Pulse", brief: "Conversational check-ins converted into a structured Pulse entry to confirm", module: "engines/survey", entry: "draftCheckIn", agentic: false, surface: "copilot" },
  { id: "pulse-log", pillar: "Pulse", brief: "AGENTIC — converts the exchange into a structured Pulse entry for the person to confirm before it's logged", module: "tools", entry: "log_mood_entry", agentic: true, surface: "copilot" },
  { id: "pulse-sentiment", pillar: "Pulse", brief: "Sentiment and theme extraction, clustering comments into themes", module: "engines/text", entry: "extractThemes", agentic: false, surface: "screen" },
  { id: "pulse-anomaly", pillar: "Pulse", brief: "Anomaly detection ... and drafts a suggested manager action", module: "engines/signals", entry: "detectAnomaly", agentic: false, surface: "copilot" },
  { id: "pulse-adaptive", pillar: "Pulse", brief: "Adaptive survey length — the next question is chosen based on prior answers", module: "engines/survey", entry: "nextQuestion", agentic: false, surface: "engine-only" },
  { id: "pulse-summary", pillar: "Pulse", brief: "AI-generated plain-language summary of each wave, with source quotes retained", module: "engines/text", entry: "summariseWave", agentic: false, surface: "copilot" },
  { id: "pulse-sendtime", pillar: "Pulse", brief: "Smart send-time and channel selection per person", module: "engines/timing", entry: "planSend", agentic: false, surface: "engine-only" },
  { id: "pulse-launch", pillar: "Pulse", brief: "AGENTIC — launch a quick pulse to a segment on request", module: "tools", entry: "launch_pulse_survey", agentic: true, surface: "copilot" },
  { id: "pulse-diagnose", pillar: "Pulse", brief: "AGENTIC — proactively launch a targeted micro-survey when an anomaly is flagged", module: "tools", entry: "diagnose_anomaly", agentic: true, surface: "copilot" },
  { id: "pulse-chase", pillar: "Pulse", brief: "AGENTIC — chase incomplete mandatory surveys on its own initiative", module: "tools", entry: "chase_survey", agentic: true, surface: "copilot" },

  /* ── Pillar 2 · Connect ──────────────────────────────────── */
  { id: "connect-compose", pillar: "Connect", brief: "AI-assisted post creation from a rough voice note or a couple of phrases", module: "engines/text", entry: "composePost", agentic: false, surface: "copilot" },
  { id: "connect-tagging", pillar: "Connect", brief: "Auto-tagging of posts by team, topic and sentiment", module: "engines/text", entry: "tagPost", agentic: false, surface: "engine-only" },
  { id: "connect-moderation", pillar: "Connect", brief: "Toxicity/harassment detection routed to the moderation queue before publish", module: "engines/text", entry: "moderate", agentic: false, surface: "engine-only" },
  { id: "connect-ranking", pillar: "Connect", brief: "Personalised feed ranking balancing relevance with company-wide culture moments", module: "engines/personalize", entry: "rankFeed", agentic: false, surface: "engine-only" },
  { id: "connect-kudos-spot", pillar: "Connect", brief: "AI kudos-spotting — surfaces moments worth recognising and prompts the manager", module: "engines/signals", entry: "scanAnomalies", agentic: false, surface: "copilot" },
  { id: "connect-writeup", pillar: "Connect", brief: "AGENTIC — 'write up the Line 2 safety streak as a post'", module: "tools", entry: "write_post", agentic: true, surface: "copilot" },
  { id: "connect-milestone", pillar: "Connect", brief: "AGENTIC — auto-schedule a recognition post for a detected milestone", module: "tools", entry: "schedule_milestone_post", agentic: true, surface: "copilot" },
  { id: "connect-kudos", pillar: "Connect", brief: "Peer-to-peer recognition, drafted by the Copilot", module: "tools", entry: "give_recognition", agentic: true, surface: "copilot" },

  /* ── Pillar 3 · Amplify ──────────────────────────────────── */
  { id: "amp-caption", pillar: "Amplify", brief: "AI-suggested personal caption in the employee's own voice", module: "engines/advocacy", entry: "draftCaption", agentic: false, surface: "screen" },
  { id: "amp-timing", pillar: "Amplify", brief: "Best-time-to-post recommendation per platform", module: "engines/timing", entry: "bestTimeToPost", agentic: false, surface: "screen" },
  { id: "amp-impact", pillar: "Amplify", brief: "Advocacy impact scoring — estimated reach/engagement uplift", module: "engines/advocacy", entry: "scoreAdvocacy", agentic: false, surface: "screen" },
  { id: "amp-share", pillar: "Amplify", brief: "AGENTIC — 'share that last company post for me'", module: "tools", entry: "share_to_social", agentic: true, surface: "copilot", blocked: "Needs a per-platform feasibility spike and per-employee OAuth — the brief requires the spike before committing." },
  { id: "amp-queue", pillar: "Amplify", brief: "AGENTIC — 'queue this for advocacy' builds the curated card automatically", module: "tools", entry: "queue_for_advocacy", agentic: true, surface: "copilot" },

  /* ── Pillar 4 · Thrive ───────────────────────────────────── */
  { id: "thrive-nudge", pillar: "Thrive", brief: "Personalised nudges timed to when the person is likely to act", module: "engines/wellbeing", entry: "activityNudges", agentic: false, surface: "screen" },
  { id: "thrive-money", pillar: "Thrive", brief: "AI financial tips by income band, role and region — guidance only", module: "engines/wellbeing", entry: "financialTips", agentic: false, surface: "screen" },
  { id: "thrive-wellbeing", pillar: "Thrive", brief: "Anomaly-aware wellbeing check, with consent, offering a warm handoff", module: "engines/wellbeing", entry: "wellbeingCheck", agentic: false, surface: "screen" },
  { id: "thrive-cohorts", pillar: "Thrive", brief: "Smart challenge matching into fair leaderboard cohorts", module: "engines/wellbeing", entry: "buildCohorts", agentic: false, surface: "screen" },
  { id: "thrive-log", pillar: "Thrive", brief: "AGENTIC — log activity conversationally ('I ran 5k this morning')", module: "tools", entry: "log_activity", agentic: true, surface: "copilot" },
  { id: "thrive-goal", pillar: "Thrive", brief: "AGENTIC — renegotiate a goal on request and adjust it", module: "tools", entry: "adjust_goal", agentic: true, surface: "copilot" },
  { id: "thrive-benefit", pillar: "Thrive", brief: "AGENTIC — flag an unused benefit before open enrolment and offer to book a call", module: "tools", entry: "book_benefit_call", agentic: true, surface: "copilot" },

  /* ── Pillar 5 · Broadcast ────────────────────────────────── */
  { id: "bc-draft", pillar: "Broadcast", brief: "AI drafting assistant — bullet points into a clear announcement in company tone", module: "engines/text", entry: "composePost", agentic: false, surface: "copilot" },
  { id: "bc-translate", pillar: "Broadcast", brief: "Automatic translation and reading-level simplification per recipient", module: "engines/text", entry: "localise", agentic: false, surface: "engine-only" },
  { id: "bc-qa", pillar: "Broadcast", brief: "AI Q&A over the policy library — a sourced answer, not a PDF search", module: "retrieve", entry: "retrieve", agentic: false, surface: "copilot" },
  { id: "bc-delivery", pillar: "Broadcast", brief: "Delivery-optimisation — best channel/time per segment", module: "engines/timing", entry: "planSegment", agentic: false, surface: "engine-only" },
  { id: "bc-digest", pillar: "Broadcast", brief: "AI-generated weekly digest for anyone on leave or off-shift", module: "engines/text", entry: "weeklyDigest", agentic: false, surface: "copilot" },
  { id: "bc-draft-agentic", pillar: "Broadcast", brief: "AGENTIC — 'draft the PPE update for Plant 3', queued for human approval", module: "tools", entry: "draft_announcement", agentic: true, surface: "copilot" },
  { id: "bc-chase", pillar: "Broadcast", brief: "AGENTIC — auto-chase acknowledgement, reminding only non-confirmers", module: "tools", entry: "chase_acknowledgement", agentic: true, surface: "copilot" },

  /* ── Pillar 6 · Grow ─────────────────────────────────────── */
  { id: "grow-generate", pillar: "Grow", brief: "Course generation from a PDF/SOP/deck with quiz questions drafted for review", module: "engines/learning", entry: "generateCourse", agentic: false, surface: "screen" },
  { id: "grow-paths", pillar: "Grow", brief: "Personalised path recommendations from role, Pulse feedback and incident data", module: "engines/learning", entry: "recommendPaths", agentic: false, surface: "screen" },
  { id: "grow-adaptive", pillar: "Grow", brief: "Adaptive quizzing with spaced repetition", module: "engines/learning", entry: "nextReview", agentic: false, surface: "screen" },
  { id: "grow-tutor", pillar: "Grow", brief: "AI tutor answering only from that module's source content", module: "engines/learning", entry: "tutor", agentic: false, surface: "screen" },
  { id: "grow-make", pillar: "Grow", brief: "AGENTIC — 'make this a course' from pasted notes or an SOP", module: "tools", entry: "make_course", agentic: true, surface: "copilot" },
  { id: "grow-assign", pillar: "Grow", brief: "AGENTIC — auto-assign a matching path when Pulse flags a skills gap", module: "tools", entry: "assign_learning", agentic: true, surface: "copilot" },

  /* ── Pillar 7 · One-to-One Help ──────────────────────────── */
  { id: "help-intake", pillar: "One-to-One Help", brief: "Empathetic conversational intake in plain, warm language", module: "engines/support", entry: "intake", agentic: false, surface: "screen" },
  { id: "help-triage", pillar: "One-to-One Help", brief: "Need and urgency triage into a band — never a clinical diagnosis", module: "engines/support", entry: "triage", agentic: false, surface: "screen" },
  { id: "help-handoff", pillar: "One-to-One Help", brief: "Consent-based handoff summary, with explicit sign-off", module: "engines/support", entry: "buildHandoff", agentic: false, surface: "screen" },
  { id: "help-resources", pillar: "One-to-One Help", brief: "Self-serve resource matching for lower-stakes moments", module: "engines/support", entry: "matchResources", agentic: false, surface: "screen" },
  { id: "help-crisis", pillar: "One-to-One Help", brief: "Always-visible crisis resources, never gated behind a conversation", module: "engines/support", entry: "crisisResources", agentic: false, surface: "screen" },
  { id: "help-book", pillar: "One-to-One Help", brief: "AGENTIC — book a session and pass the handoff summary, with consent", module: "tools", entry: "book_counsellor", agentic: true, surface: "copilot", blocked: "Clinical, legal and HR sign-off on triage thresholds and data-access rules is a hard blocker on launch." },
  { id: "help-escalate", pillar: "One-to-One Help", brief: "AGENTIC — acute-risk escalation per the org's configured, human-reviewed policy", module: "engines/support", entry: "escalate", agentic: true, surface: "copilot", blocked: "Requires a signed escalation policy — assertLaunchable() throws without one." },

  /* ── §8 Cross-cutting AI layer ───────────────────────────── */
  { id: "x-personalize", pillar: "Cross-cutting", brief: "Personalization engine — one profile ranking feed, home order and Grow recommendations", module: "engines/personalize", entry: "orderHome", agentic: false, surface: "engine-only" },
  { id: "x-signal", pillar: "Cross-cutting", brief: "Sentiment & signal engine feeding one employee-experience score", module: "engines/signals", entry: "employeeExperienceScore", agentic: false, surface: "engine-only" },
  { id: "x-copilot", pillar: "Cross-cutting", brief: "A persistent Copilot on every pillar that answers, drafts and surfaces insight", module: "mock", entry: "mockProvider", agentic: false, surface: "copilot" },
  { id: "x-guardrails", pillar: "Cross-cutting", brief: "Every AI output labelled AI-assisted; safety-critical content requires human review", module: "tools", entry: "assertRegistryIsSafe", agentic: false, surface: "copilot" },
];

export const FEATURE_COUNT = FEATURES.length;
export const AGENTIC_COUNT = FEATURES.filter((f) => f.agentic).length;

export function byPillar(): Record<string, FeatureStatus[]> {
  return FEATURES.reduce<Record<string, FeatureStatus[]>>((acc, f) => {
    (acc[f.pillar] ??= []).push(f);
    return acc;
  }, {});
}

export function blockedFeatures(): FeatureStatus[] {
  return FEATURES.filter((f) => f.blocked);
}
