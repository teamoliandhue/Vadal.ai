/**
 * The one employee-experience score, computed.
 *
 * `health.score` was the number 82, typed into data.ts. It is the figure the
 * sidebar shows on every screen and the one the Pulse dashboard opens with — the
 * single most prominent number in the product — and nothing produced it.
 *
 * employeeExperienceScore() has existed the whole time and was called by nothing.
 * The brief's point about it is not the arithmetic: it is that the three
 * listening surfaces "must not be three separate AI integrations producing three
 * numbers nobody reconciles". A constant cannot reconcile anything.
 *
 * So this assembles the five real inputs from the workspace's own data and hands
 * them over. Every input below traces to something visible elsewhere in the
 * product, which is what makes the score arguable rather than magic:
 *
 *   survey sentiment      ← the Voice mood split (Pulse)
 *   feed sentiment        ← analyseSentiment() over the actual posts (Feed)
 *   acknowledgement       ← mean reach of live campaigns (Campaigns)
 *   participation         ← mean participation of live campaigns (Campaigns)
 *   recognition coverage  ← the recognition board's own coverage (Recognition)
 *
 * The number this returns is NOT 82. That is the point — 82 was never derived
 * from anything, so there was nothing for it to be right about.
 */
import { analyseSentiment } from "./ai/engines/text";
import { employeeExperienceScore, type ExScore } from "./ai/engines/signals";
import { voice, recognitionBoard, feed } from "./data";
import { campaigns } from "./campaigns";

/** Weighted −1..1 from the mood split people actually gave. */
function surveySentiment(): number {
  const total = voice.mood.reduce((n, m) => n + m.pct, 0) || 1;
  const weight = { Positive: 1, Neutral: 0, Negative: -1 } as Record<string, number>;
  return voice.mood.reduce((n, m) => n + (weight[m.label] ?? 0) * m.pct, 0) / total;
}

/** −1..1 across the real feed, using the same analyser the moderation path uses. */
function postSentiment(): number {
  const posts = feed.filter((p) => p.text?.trim());
  if (!posts.length) return 0;
  return posts.reduce((n, p) => n + analyseSentiment(p.text).score, 0) / posts.length;
}

/** Live campaigns only — a campaign that has not started has no reach to average. */
function liveCampaigns() {
  return campaigns.filter((c) => c.status === "live" || c.status === "complete");
}

function meanOf(pick: (c: ReturnType<typeof liveCampaigns>[number]) => number): number {
  const live = liveCampaigns();
  if (!live.length) return 0;
  return live.reduce((n, c) => n + pick(c), 0) / live.length / 100;
}

export function experienceScore(): ExScore {
  return employeeExperienceScore({
    surveySentiment: surveySentiment(),
    postSentiment: postSentiment(),
    acknowledgement: meanOf((c) => c.reach),
    participation: meanOf((c) => c.participation),
    recognitionCoverage: recognitionBoard.coverage / 100,
  });
}

/** Where each input came from, so the score can be audited on screen. */
export const SCORE_SOURCES: Record<string, string> = {
  "Survey sentiment": "The mood split on your Pulse comments",
  "Feed sentiment": "Read from the posts themselves, not asked",
  Acknowledgement: "Mean reach across live campaigns",
  Participation: "Mean participation across live campaigns",
  "Recognition coverage": "Share of people recognised this period",
};
