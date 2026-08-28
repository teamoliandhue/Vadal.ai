/**
 * Personalization engine — one profile, used everywhere.
 *
 * Implements, from the brief:
 *  · §8      — "Personalization engine — one profile of interests, role,
 *              activity and sentiment that ranks the Connect feed, orders the
 *              home screen, and chooses Grow recommendations"
 *  · Connect — "Personalised feed ranking that balances 'most relevant to me'
 *              with 'don't miss company-wide culture moments'"
 *  · Onboarding — the assistant "configures the person's home screen and default
 *              pillar order"
 *  · Onboarding — "Progressive profiling — 2–3 light questions per session over
 *              the first two weeks ... and infers the rest from context"
 *
 * One profile object drives all four. That is the whole design: not four
 * ranking implementations that disagree about who someone is.
 */
import type { Profile, Role } from "@/lib/auth";

export type PersonProfile = {
  email: string;
  role: Role;
  team: string;
  title: string;
  /** desk | frontline — decides density, typing load and offline behaviour. */
  surface: Profile;
  language: string;
  /** Reading level, inferred or asked. */
  literacy: "simple" | "standard";
  /** Topics the person engages with, weighted 0..1. */
  interests: Record<string, number>;
  /** Their own recent sentiment, −1..1. */
  mood: number;
  /** Answered onboarding questions, for progressive profiling. */
  known: string[];
};

export function emptyProfile(email: string, role: Role, team: string, title: string, surface: Profile): PersonProfile {
  return {
    email, role, team, title, surface,
    language: "English",
    literacy: surface === "frontline" ? "simple" : "standard",
    interests: {},
    mood: 0,
    known: [],
  };
}

/* ── progressive profiling (onboarding) ────────────────────────── */

/**
 * The questions the assistant may ask, in priority order, with what each unlocks.
 *
 * The brief's instruction is "2–3 light questions per session over the first two
 * weeks instead of one long form, and infers the rest from context". So this
 * returns the *next few*, never the whole list, and skips anything already known
 * or inferable.
 */
const PROFILE_QUESTIONS: { key: string; ask: string; unlocks: string; inferable?: boolean }[] = [
  { key: "language", ask: "Which language would you like Vadal in?", unlocks: "Everything you read, in your language" },
  { key: "shift", ask: "Roughly when do you start your day?", unlocks: "We'll stop pinging you off-shift", inferable: true },
  { key: "interests", ask: "What would you like to hear more about — safety, learning, wellbeing, or team news?", unlocks: "A feed that's actually yours" },
  { key: "goals", ask: "Anything you're hoping to get better at this year?", unlocks: "Learning suggestions that fit" },
  { key: "device", ask: "Is this your own phone, or a shared one?", unlocks: "We'll keep shared devices signed out", inferable: true },
  { key: "wellbeing", ask: "Would you like wellbeing check-ins switched on?", unlocks: "A private nudge when things get heavy" },
];

export function nextProfileQuestions(profile: PersonProfile, max = 3): { key: string; ask: string; unlocks: string }[] {
  return PROFILE_QUESTIONS.filter((q) => !profile.known.includes(q.key))
    .slice(0, max)
    .map(({ key, ask, unlocks }) => ({ key, ask, unlocks }));
}

/** What the brief calls inferring "the rest from context". */
export function inferFromContext(profile: PersonProfile): Partial<PersonProfile> {
  const inferred: Partial<PersonProfile> = {};
  if (profile.surface === "frontline") inferred.literacy = "simple";
  if (/plant|line|shift|logistics|warehouse/i.test(profile.team)) inferred.interests = { ...profile.interests, safety: 0.8 };
  if (profile.role === "manager") inferred.interests = { ...profile.interests, ...(inferred.interests ?? {}), manager: 0.7 };
  return inferred;
}

/* ── home screen ordering ──────────────────────────────────────── */

export type HomeSection =
  | "checkin" | "myday" | "calendar" | "recognition" | "feed"
  | "learning" | "wellbeing" | "team" | "announcements";

/**
 * Order the home screen for this person.
 *
 * The brief's frontline worker and its HR admin should not open the same Home.
 * A line operator on a shared phone between shifts wants check-in, safety
 * announcements and their day — not an engagement trend chart.
 */
export function orderHome(profile: PersonProfile): HomeSection[] {
  const base: HomeSection[] =
    profile.surface === "frontline"
      ? ["checkin", "announcements", "myday", "recognition", "learning", "feed", "wellbeing"]
      : ["checkin", "myday", "calendar", "feed", "recognition", "learning", "announcements", "wellbeing"];

  if (profile.role !== "employee") base.splice(1, 0, "team");
  // Someone having a hard week gets wellbeing earlier — gently, not as an alarm.
  if (profile.mood < -0.3) {
    const i = base.indexOf("wellbeing");
    if (i > 2) { base.splice(i, 1); base.splice(2, 0, "wellbeing"); }
  }
  return base;
}

/* ── feed ranking (Connect) ────────────────────────────────────── */

export type Rankable = {
  id: string;
  topics: string[];
  team?: string;
  /** Hours since posting. */
  ageHours: number;
  /** Company-wide culture moment that everyone should see. */
  companyWide?: boolean;
  engagement?: number;
};

/**
 * Rank the feed.
 *
 * The brief's balance is explicit: "most relevant to me" *and* "don't miss
 * company-wide culture moments". A pure relevance sort would bury the all-hands
 * announcement for everyone it wasn't about, which is how internal feeds die.
 */
export function rankFeed<T extends Rankable>(items: T[], profile: PersonProfile): T[] {
  const scored = items.map((it) => {
    let score = 0;
    for (const t of it.topics) score += (profile.interests[t] ?? 0) * 3;
    if (it.team && it.team === profile.team) score += 2.5;
    if (it.companyWide) score += 2; // the floor that keeps culture moments visible
    score += Math.min(1.5, (it.engagement ?? 0) / 20);
    score -= Math.min(3, it.ageHours / 24); // decay, capped so old-but-relevant survives
    return { it, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.it);
}

/** Learn from what someone actually opens — the profile is not static. */
export function reinforce(profile: PersonProfile, topics: string[], weight = 0.08): PersonProfile {
  const interests = { ...profile.interests };
  for (const t of topics) interests[t] = Math.min(1, (interests[t] ?? 0) + weight);
  return { ...profile, interests };
}
