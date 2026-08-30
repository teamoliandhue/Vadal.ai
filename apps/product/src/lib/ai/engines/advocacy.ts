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

/* ════════════════════════════════════════════════════════════════════
   THE OTHER HALF — "and let employee moments go out"
   ════════════════════════════════════════════════════════════════════
   The brief's sentence for this pillar has two clauses. Everything above
   serves the first: the company says something, we ask an employee to carry
   it. Nothing served the second, and the asymmetry is the whole problem with
   corporate advocacy — a screen that only ever asks is a screen people opt
   out of.

   A moment is something that already happened to THIS person and is worth
   the outside seeing: kudos they received, a milestone they hit, a thing
   their team shipped. We do not manufacture these. We notice the ones that
   are already public internally and offer to carry them further. */

export type MomentKind = "kudos" | "milestone" | "shipped" | "certification";

export type Moment = {
  id: string;
  kind: MomentKind;
  /** What happened, in the third person — the raw material for a caption. */
  what: string;
  /** When, in words. */
  when: string;
  /** Who else was involved — they get tagged, and it keeps it from reading as a brag. */
  withPeople?: string[];
  image?: string;
  /** Why we think this one is worth the outside seeing. Shown to the person. */
  why: string;
};

/**
 * Rank a person's moments — the best one becomes the hero.
 *
 * Recency dominates deliberately. A three-week-old win posted today reads as
 * scraping the barrel; the thing that happened yesterday reads as news.
 */
const MOMENT_WEIGHT: Record<MomentKind, number> = { kudos: 4, shipped: 3, certification: 2, milestone: 2 };

export function rankMoments(moments: Moment[], sharedIds: string[] = []): Moment[] {
  return moments
    .filter((m) => !sharedIds.includes(m.id))
    .map((m, i) => ({ m, score: MOMENT_WEIGHT[m.kind] * 10 - i }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);
}

/**
 * Draft a caption for the person's OWN moment.
 *
 * This is a different writing problem from resharing a company post, and using
 * the same function for both is what makes advocacy tools sound like press
 * releases. Two rules:
 *
 *  · Never write the boast. "Thrilled to announce" is the tell that a tool
 *    wrote it. The draft states the thing and credits the people.
 *  · Name the others first where there are any. A win shared alone reads as a
 *    brag; the same win shared with the team reads as generous, and it is also
 *    the truth of how the work happened.
 */
export function draftFromMoment(moment: Moment, voice: Voice, platform: Platform, role?: string): CaptionDraft {
  const others = nameList(moment.withPeople);
  // "Aarav and Dev" + " and I" gives "Aarav and Dev and I", which nobody writes.
  // The pronoun has to join the list, not follow it.
  const withMe = nameList([...(moment.withPeople ?? []), "I"]);

  const openers: Record<Voice, string> = {
    plain: "",
    warm: others ? `${withMe} ` : "",
    proud: "",
    technical: "",
  };

  const body: Record<Voice, string> = {
    plain: moment.what,
    warm: others ? `just ${lowerFirst(moment.what)}` : moment.what,
    proud: moment.what,
    technical: moment.what,
  };

  /* The warm closer has to know what kind of moment this is. "Good week" after
     a shipped launch is right; after a three-year anniversary it is a shrug. */
  const WARM_CLOSE: Record<MomentKind, string> = {
    kudos: "Good week.",
    shipped: "Good week.",
    certification: "Worth the evenings.",
    milestone: "Still the same reason I stayed: the people.",
  };

  const closers: Record<Voice, string> = {
    plain: others ? `Done with ${others}.` : "",
    warm: WARM_CLOSE[moment.kind],
    proud: others ? `${others} did the hard parts.` : role ? `This is the part of ${role.toLowerCase()} I actually like.` : "",
    technical: "Happy to go into the detail if it's useful.",
  };

  // A moment is written as a phrase, not a sentence — "Shipped the onboarding
  // flow" has no full stop of its own. Terminate it before anything follows, or
  // the closer runs straight on: "...shortcuts on craft Good week."
  const opening = `${openers[voice]}${body[voice]}`.replace(/\s+/g, " ").trim();
  const sentence = /[.!?…]$/.test(opening) ? opening : `${opening}.`;
  const text = [sentence, closers[voice]].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  return { platform, text, voice, withinLimit: text.length <= LIMITS[platform], editableBeforePosting: true };
}

function lowerFirst(s: string) { return s.charAt(0).toLowerCase() + s.slice(1); }

/** "Aarav", "Aarav and Dev", "Aarav, Dev and I" — an Oxford-less serial list. */
function nameList(names?: string[]): string | null {
  if (!names?.length) return null;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/* ── the social policy check ───────────────────────────────────────
   The thing that decides whether this pillar ships at all in a company with a
   legal team. An employee posting a revenue figure or a customer name from an
   internal win is a real incident, and "we told them not to" is not a control.

   Deliberately advisory rather than blocking, except where it must not be:
   we flag, explain and let the person decide, because a tool that silently
   refuses to let you post your own words is one you stop using. */

export type PolicyIssue = {
  severity: "block" | "warn";
  what: string;
  why: string;
  /** The matched text, so the UI can point at it rather than describing it. */
  match: string;
};

const POLICY_RULES: { severity: "block" | "warn"; re: RegExp; what: string; why: string }[] = [
  {
    severity: "block",
    re: /\b(?:revenue|arr|mrr|ebitda|valuation|runway|burn rate)\b/i,
    what: "Financial figure",
    why: "Unreleased financials are market-sensitive. This needs Finance to clear it before it goes out.",
  },
  {
    severity: "block",
    re: /\b(?:attrition|headcount|layoff|redundanc\w*|resignation rate)\b/i,
    what: "People data",
    why: "Headcount and attrition are confidential to the company and identifying to individuals.",
  },
  {
    severity: "warn",
    re: /\b(?:we (?:will|expect to|are going to)|on track to|by (?:Q[1-4]|next (?:quarter|year)))\b/i,
    what: "Forward-looking statement",
    why: "A promise about the future in a personal post can be read as the company's commitment.",
  },
  {
    severity: "warn",
    re: /\b(?:client|customer|account) (?:name|called)\b|\b(?:Acme|Northwind|Contoso)\b/i,
    what: "Named customer",
    why: "Most customer contracts require written consent before we name them publicly.",
  },
  {
    severity: "warn",
    re: /\b(?:beta|unreleased|not (?:yet )?launched|internal only|confidential)\b/i,
    what: "Unreleased work",
    why: "This sounds like something that has not shipped publicly yet.",
  },
];

export function checkPolicy(text: string): { ok: boolean; issues: PolicyIssue[] } {
  const issues: PolicyIssue[] = [];
  for (const rule of POLICY_RULES) {
    const m = rule.re.exec(text);
    if (m) issues.push({ severity: rule.severity, what: rule.what, why: rule.why, match: m[0] });
  }
  return { ok: !issues.some((i) => i.severity === "block"), issues };
}

/* ── hashtags ──────────────────────────────────────────────────────
   Few and real. A caption ending in nine tags is the single clearest signal
   that a person did not write it, which defeats the entire point of the
   pillar. Two or three, drawn from what the post is actually about. */

const TAG_MAP: { re: RegExp; tag: string }[] = [
  { re: /\bsafet\w*|incident|lost-time\b/i, tag: "WorkplaceSafety" },
  { re: /\bonboard\w*|new (?:joiner|starter)\b/i, tag: "EmployeeExperience" },
  { re: /\bhiring|we are hiring|roles?\b/i, tag: "Hiring" },
  { re: /\bdesign|product\b/i, tag: "ProductDesign" },
  { re: /\bengineer\w*|shipped|built\b/i, tag: "Engineering" },
  { re: /\bmanufactur\w*|plant|shift|factory\b/i, tag: "Manufacturing" },
  { re: /\banniversar\w*|years?\b/i, tag: "LifeAtWork" },
];

export function hashtagsFor(text: string, platform: Platform): string[] {
  const hits = TAG_MAP.filter((t) => t.re.test(text)).map((t) => t.tag);
  // X charges for tags out of a 280-character budget, so it gets fewer.
  return [...new Set(hits)].slice(0, platform === "X" ? 1 : 3);
}

/* ── per-platform imagery ──────────────────────────────────────────
   A LinkedIn image posted to Instagram is visibly wrong, and "wrong" here
   reads as low-effort corporate, which is exactly the impression the pillar
   cannot afford. The company supplies one photo; we say which shape each
   platform needs so the crop is deliberate rather than automatic. */

export const PLATFORM_ASPECT: Record<Platform, { ratio: string; px: string; note: string }> = {
  LinkedIn:  { ratio: "1.91 / 1", px: "1200 × 627", note: "Wide. Faces sit low — the top of a 16:9 crop gets clipped in the feed." },
  Instagram: { ratio: "4 / 5",    px: "1080 × 1350", note: "Tall. The only ratio that takes the full column width in-feed." },
  X:         { ratio: "16 / 9",   px: "1200 × 675", note: "Wide, and cropped to 2:1 in the timeline until it is tapped." },
  Facebook:  { ratio: "1.91 / 1", px: "1200 × 630", note: "Same as LinkedIn. One asset covers both." },
};

/* ── referral attribution ──────────────────────────────────────────
   The one thing that makes advocacy defensible on a P&L. A hiring post shared
   by an employee is a referral; without a code on the link it is an
   unattributable impression, and the programme gets cut in the first budget
   review that asks what it returned. */

export function referralLinkFor(postUrl: string | undefined, employeeCode: string): string | null {
  if (!postUrl) return null;
  const u = new URL(postUrl);
  u.searchParams.set("ref", employeeCode);
  return u.toString();
}

export function isHiringPost(text: string): boolean {
  return /\b(?:we(?:'re| are) hiring|join (?:us|our team)|open roles?|apply now|careers?)\b/i.test(text);
}

/* ── forecasting, before anything is published ─────────────────────
   Comms currently pick what to push into advocacy on instinct and find out
   afterwards. This is the same model as scoreAdvocacy() run forwards: given
   how many people take part and how they have behaved, what would this post
   reach if we queued it? */

export type ReachForecast = {
  likelySharers: number;
  estimatedReach: number;
  low: number;
  high: number;
  /** Share rate we are assuming, so the number can be argued with. */
  assumedShareRate: number;
  caveat: string;
};

export function forecastReach(
  participants: number,
  avgFollowers: number,
  platform: Platform,
  historicalShareRate = 0.21,
): ReachForecast {
  const likelySharers = Math.round(participants * historicalShareRate);
  const estimatedReach = Math.round(likelySharers * avgFollowers * ORGANIC_REACH[platform]);
  return {
    likelySharers,
    estimatedReach,
    // A single number invites false precision. The band is the honest answer.
    low: Math.round(estimatedReach * 0.55),
    high: Math.round(estimatedReach * 1.6),
    assumedShareRate: historicalShareRate,
    caveat: "Modelled from how this audience has behaved before, not measured. The band is wide because organic reach is.",
  };
}

/* ── reading the declines ──────────────────────────────────────────
   We already collect why people pass and show it as four bars, which is data,
   not insight. This says what it means and what to do, because "reads too
   corporate" on a fifth of the audience is a writing problem with a fix. */

export type DeclineVerdict = { headline: string; detail: string; tone: "bad" | "warn" | "ok" };

export function declineInsight(signal: { reason: string; count: number }[], sharedCount: number): DeclineVerdict {
  const total = signal.reduce((n, s) => n + s.count, 0);
  if (total === 0) return { headline: "Nobody has passed yet", detail: "Too early to read anything into it.", tone: "ok" };

  const top = [...signal].sort((a, b) => b.count - a.count)[0];
  const share = Math.round((top.count / total) * 100);
  const passRate = total / Math.max(1, total + sharedCount);

  if (/corporate/i.test(top.reason) && share >= 40) {
    return {
      tone: "bad",
      headline: "This is a writing problem, not an audience problem",
      detail: `${share}% of the people who passed said it reads too corporate. They are willing to post — they are not willing to post this. Rewriting it is cheaper than asking more people.`,
    };
  }
  if (/not my area/i.test(top.reason) && share >= 40) {
    return {
      tone: "warn",
      headline: "It is reaching the wrong people",
      detail: `${share}% passed because it is not their area. The post is probably fine; the targeting is not. Queue it to the teams it actually concerns.`,
    };
  }
  if (passRate > 0.7) {
    return {
      tone: "bad",
      headline: "More people passed than shared",
      detail: `${total} passed against ${sharedCount} shares. Worth pulling this one before it runs again.`,
    };
  }
  return {
    tone: "ok",
    headline: "Healthy — people are choosing, not ignoring",
    detail: `${sharedCount} shared and ${total} passed. A decline rate in this range means the ask is landing and people feel free to say no.`,
  };
}

/* ── the streak ────────────────────────────────────────────────────
   Kept deliberately quiet. A streak on an OPTIONAL, public-facing action is a
   pressure device if it is loud about it — nobody should feel they owe their
   own social account to their employer. So it counts up and never warns you
   that you are about to lose it. */

export function advocacyStreak(weeksActive: boolean[]): { current: number; best: number } {
  let current = 0;
  for (let i = weeksActive.length - 1; i >= 0 && weeksActive[i]; i--) current++;
  let best = 0, run = 0;
  for (const w of weeksActive) { run = w ? run + 1 : 0; best = Math.max(best, run); }
  return { current, best };
}
