/**
 * Advocacy engine — Pillar 3, Amplify.
 *
 * Implements, from the brief:
 *  · "AI-suggested personal caption when an employee reshares a company post,
 *     in their own voice/tone, editable before posting"
 *  · "Best-time-to-post recommendation per platform" (see engines/timing)
 *  · "Advocacy impact scoring — AI estimates reach/engagement uplift from
 *     employee shares to show HR/marketing ROI, and to make advocacy visible as
 *     a recognised contribution (feeding Connect kudos)"
 *
 * The brief's own risk note governs the design:
 *  · "This pillar carries the most external-API and compliance risk in the whole
 *     platform — scope a platform-by-platform feasibility spike ... before
 *     committing to the 'auto-mirror engagement' feature as written. Every
 *     agentic action here must still end in an explicit human tap before
 *     anything posts publicly."
 *
 * So: nothing here posts. It drafts, scores and prepares. Publishing requires a
 * per-employee OAuth grant this build does not have, and a feasibility spike
 * that has not happened — `canAutoMirror()` returns false and says why.
 */
import { bestTimeToPost, type Platform } from "./timing";

export type Voice = "plain" | "warm" | "proud" | "technical";

export type CaptionDraft = {
  platform: Platform;
  text: string;
  voice: Voice;
  /** Under each platform's practical limit. */
  withinLimit: boolean;
  /** Always true — the brief requires an explicit human tap. */
  editableBeforePosting: true;
};

const LIMITS: Record<Platform, number> = { LinkedIn: 3000, X: 280, Instagram: 2200, Facebook: 63206 };

/**
 * Draft a personal caption in the employee's own voice.
 *
 * "In their own voice/tone" is the requirement that makes this worth doing — a
 * feed of identical corporate reshares is transparently astroturfed and does the
 * company more harm than no advocacy at all.
 */
export function draftCaption(companyPost: string, voice: Voice, platform: Platform, role?: string): CaptionDraft {
  const gist = companyPost.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s/)[0] ?? companyPost;
  const short = gist.length > 120 ? `${gist.slice(0, 117).trimEnd()}…` : gist;

  const openers: Record<Voice, string> = {
    plain: "Sharing this from our team:",
    warm: "Genuinely pleased to see this one go out —",
    proud: "This is the kind of thing I joined for.",
    technical: "Worth reading if you work in this space —",
  };

  const closers: Record<Voice, string> = {
    plain: "",
    warm: " Proud of the people behind it.",
    proud: role ? ` Glad to be part of it as ${role}.` : " Glad to be part of it.",
    technical: " Happy to answer questions on the approach.",
  };

  const body =
    platform === "X"
      ? `${openers[voice]} ${short}`
      : `${openers[voice]} ${short}${closers[voice]}`;

  const text = body.trim();
  return { platform, text, voice, withinLimit: text.length <= LIMITS[platform], editableBeforePosting: true };
}

/* ── impact scoring ────────────────────────────────────────────── */

export type ShareRecord = {
  employee: string;
  platform: Platform;
  followers: number;
  /** Engagements the share itself earned. */
  engagements: number;
};

export type AdvocacyImpact = {
  estimatedReach: number;
  estimatedUplift: number;
  /** Multiple vs the company account's own reach for the same post. */
  multiplier: number;
  /** Recognition-worthy contributors, feeding Connect kudos per the brief. */
  topContributors: { employee: string; reach: number }[];
  caveat: string;
};

/** Typical share of followers who actually see an organic post, by platform. */
const ORGANIC_REACH: Record<Platform, number> = { LinkedIn: 0.08, X: 0.05, Instagram: 0.12, Facebook: 0.06 };

export function scoreAdvocacy(shares: ShareRecord[], companyPostReach: number): AdvocacyImpact {
  const perEmployee = new Map<string, number>();
  let estimatedReach = 0;
  let engagements = 0;

  for (const s of shares) {
    const reach = Math.round(s.followers * ORGANIC_REACH[s.platform]);
    estimatedReach += reach;
    engagements += s.engagements;
    perEmployee.set(s.employee, (perEmployee.get(s.employee) ?? 0) + reach);
  }

  const topContributors = [...perEmployee.entries()]
    .map(([employee, reach]) => ({ employee, reach }))
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5);

  return {
    estimatedReach,
    estimatedUplift: engagements,
    multiplier: companyPostReach > 0 ? Math.round((estimatedReach / companyPostReach) * 10) / 10 : 0,
    topContributors,
    // Say this out loud wherever the number is shown. An ROI figure presented as
    // measured, when it is modelled, is how marketing dashboards lose their credibility.
    caveat: "Reach is modelled from follower counts and typical organic reach per platform, not measured. Treat it as an order of magnitude.",
  };
}

/* ── the advocacy queue ────────────────────────────────────────── */

export type AdvocacyCard = {
  postId: string;
  summary: string;
  captions: CaptionDraft[];
  suggestedHour: number;
  platforms: Platform[];
  /** Per the brief: "Per-employee opt-in control". */
  requiresOptIn: true;
};

/** Build the curated card HR/Marketing pushes for employees to reshare. */
export function buildAdvocacyCard(postId: string, companyPost: string, platforms: Platform[]): AdvocacyCard {
  const captions = platforms.flatMap((p) => [draftCaption(companyPost, "warm", p), draftCaption(companyPost, "plain", p)]);
  const primary = platforms[0] ?? "LinkedIn";
  return {
    postId,
    summary: companyPost.slice(0, 160),
    captions,
    suggestedHour: bestTimeToPost(primary).hour,
    platforms,
    requiresOptIn: true,
  };
}

/* ── the feasibility gate ──────────────────────────────────────── */

export type PlatformFeasibility = { platform: Platform; spikeCompleted: boolean; allowsThirdPartyEngagement: boolean | null; note: string };

/**
 * The brief asks for a platform-by-platform feasibility spike BEFORE committing
 * to auto-mirrored engagement. It has not happened, so this records the unknown
 * honestly rather than shipping something that will be blocked at review.
 */
export const FEASIBILITY: PlatformFeasibility[] = [
  { platform: "LinkedIn", spikeCompleted: false, allowsThirdPartyEngagement: null, note: "Spike not run. Third-party posting to personal profiles requires a partner-tier permission." },
  { platform: "X", spikeCompleted: false, allowsThirdPartyEngagement: null, note: "Spike not run. Write access is a paid tier and rate-limited." },
  { platform: "Instagram", spikeCompleted: false, allowsThirdPartyEngagement: null, note: "Spike not run. Personal-profile posting is heavily restricted." },
  { platform: "Facebook", spikeCompleted: false, allowsThirdPartyEngagement: null, note: "Spike not run." },
];

export function canAutoMirror(platform: Platform): { allowed: false; reason: string } {
  const f = FEASIBILITY.find((x) => x.platform === platform)!;
  return {
    allowed: false,
    reason: `Auto-mirroring to ${platform} is not enabled: ${f.note} The brief requires this feasibility spike before the feature is committed to, and every action still ends in an explicit human tap.`,
  };
}
