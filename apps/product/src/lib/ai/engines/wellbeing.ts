/**
 * Wellbeing engine — Pillar 4, Thrive (health & wealth).
 *
 * Implements, from the brief:
 *  · "Personalised nudges — 'you're 800 steps from your weekly goal' or 'your
 *     savings rate dropped this month' — timed to when the person is actually
 *     likely to act"
 *  · "AI-generated, licensed-content-aware financial tips tailored to income
 *     band, role and region, with clear disclaimers and no personalised
 *     investment advice (guidance only, routed to licensed partners)"
 *  · "Anomaly-aware wellbeing check — a sharp drop in activity or sleep,
 *     combined with a dip in Pulse sentiment, can (with consent) prompt a gentle
 *     wellbeing resource, not a punitive alert, and can offer a warm handoff
 *     into the One-to-One Help pillar"
 *  · "Smart challenge matching — groups people into fair leaderboard cohorts by
 *     role/activity type so a desk worker and a warehouse picker aren't compared
 *     on step count alone"
 *
 * Two constraints are enforced in code, not left to copy:
 *  1. No personalised investment advice. Ever. `financialTips` returns education
 *     with a disclaimer and a handoff, and refuses product-specific questions.
 *  2. A wellbeing check requires prior consent and is never punitive — it cannot
 *     be routed to a manager.
 */

/* ── nudges ────────────────────────────────────────────────────── */

export type ActivityState = {
  stepsThisWeek: number;
  stepGoal: number;
  activeMinutes: number;
  sleepHoursAvg: number;
  /** Hours the person historically opens the app. */
  activeHours: number[];
};

export type Nudge = {
  text: string;
  /** Hour of day to deliver — "timed to when the person is actually likely to act". */
  deliverAtHour: number;
  kind: "activity" | "sleep" | "money" | "benefit";
  /** Never nag: a nudge that cannot be acted on today is not sent. */
  actionable: boolean;
};

export function activityNudges(a: ActivityState): Nudge[] {
  const hour = a.activeHours.length ? a.activeHours[Math.floor(a.activeHours.length / 2)] : 18;
  const out: Nudge[] = [];
  const remaining = a.stepGoal - a.stepsThisWeek;

  if (remaining > 0 && remaining <= a.stepGoal * 0.25) {
    out.push({
      text: `You're ${remaining.toLocaleString()} steps from your weekly goal — one walk would do it.`,
      deliverAtHour: hour,
      kind: "activity",
      actionable: true,
    });
  }
  if (a.sleepHoursAvg > 0 && a.sleepHoursAvg < 6) {
    out.push({
      text: `You've averaged ${a.sleepHoursAvg.toFixed(1)} hours of sleep this week. Worth protecting one early night.`,
      deliverAtHour: Math.min(21, hour + 2),
      kind: "sleep",
      actionable: true,
    });
  }
  return out;
}

/* ── what actually matters for this person ─────────────────────────
   The same reasoning that makes the leaderboard fair, applied to the goal
   itself. buildCohorts() already knows a picker walking 18,000 steps at
   work has not tried harder than a designer walking 8,000 — but the screen
   was still setting both of them a step target, and telling a Line Operator
   he was "3,800 steps short" of a number his job clears by Tuesday.

   A step goal is only a goal for someone whose job keeps them still. For
   everyone else the thing worth watching is recovery: sleep, and movement
   that is theirs rather than the shift's. */

export type Focus = {
  metric: "steps" | "recovery";
  /** Headline figure and its unit. */
  value: number;
  unit: string;
  /** The target, where one is meaningful. */
  goal?: number;
  /** Said on the screen, because an unexplained goal feels arbitrary. */
  why: string;
  /** The single next thing worth doing. */
  suggestion: string;
};

export function chooseFocus(
  surface: "desk" | "frontline",
  a: ActivityState,
  atWorkStepsPerDay = 0,
): Focus {
  // Their job already moves them more than any target we would set.
  if (surface === "frontline" || atWorkStepsPerDay > 12000) {
    const debt = Math.max(0, Math.round((7.5 - a.sleepHoursAvg) * 10) / 10);
    return {
      metric: "recovery",
      value: a.sleepHoursAvg,
      unit: "hours of sleep",
      goal: 7.5,
      why: `Your shift already puts ${atWorkStepsPerDay.toLocaleString()} steps a day on you. Setting you a step target would be scoring you on your job.`,
      suggestion: debt > 0.5
        ? `You're about ${debt}h short most nights. One earlier night this week is worth more than any step goal.`
        : "Sleep is holding up. Keep it there — it is the thing that makes the shift survivable.",
    };
  }

  const remaining = Math.max(0, a.stepGoal - a.stepsThisWeek);
  return {
    metric: "steps",
    value: a.stepsThisWeek,
    unit: "steps this week",
    goal: a.stepGoal,
    why: "Desk work leaves the moving to you, so this is a goal worth having.",
    suggestion: remaining > 0
      ? `${remaining.toLocaleString()} to go — one walk would do it.`
      : "Goal cleared. Anything else this week is a bonus.",
  };
}

/* ── financial guidance (regulated — read the constraint) ─────── */

export type IncomeBand = "entry" | "mid" | "senior";
export type Region = "IN" | "AE" | "SG" | "UK" | "US";

export type FinancialTip = {
  title: string;
  body: string;
  /** Always present. The brief requires clear disclaimers. */
  disclaimer: string;
  /** Where a real answer comes from. */
  handoff: string;
};

const ADVICE_REQUEST = /\b(which|what|should i)\b.*\b(fund|stock|share|crypto|scheme|policy|plan|invest|buy|sell)\b/i;

/**
 * Education only.
 *
 * The brief is explicit — "no personalised investment advice (guidance only,
 * routed to licensed partners for actual advice)" — and its AI-THROUGHOUT note
 * adds that this "needs a compliance review per market before AI generates it
 * directly". So anything that reads as a product recommendation is refused here,
 * before generation, rather than being caught by a prompt.
 */
export function financialTips(band: IncomeBand, region: Region, question?: string): FinancialTip[] | { refused: string } {
  if (question && ADVICE_REQUEST.test(question)) {
    return {
      refused:
        "I can explain how these things work, but I can't tell you what to buy or choose — that's regulated advice and needs someone licensed. I can book you a session with the benefits team, who can refer you properly.",
    };
  }

  const disclaimer = "General education, not financial advice. Rules vary by country and by your own circumstances.";
  const handoff = "For anything specific to you, the benefits team can refer you to a licensed advisor.";

  const byBand: Record<IncomeBand, FinancialTip[]> = {
    entry: [
      { title: "An emergency fund comes first", body: "Before anything else, aim to set aside one month of essential spending. It is what stops a small problem becoming a loan.", disclaimer, handoff },
      { title: "Know what your payslip already gives you", body: "Employer contributions and insurance cover are money you already have. Most people underuse them because nobody explained them.", disclaimer, handoff },
    ],
    mid: [
      { title: "Automate before you optimise", body: "A fixed amount moved on payday, every month, beats a clever plan you have to remember. Consistency does more than timing.", disclaimer, handoff },
      { title: "Check your cover matches your life", body: "Cover set when you joined often no longer matches a partner, a child, or a mortgage.", disclaimer, handoff },
    ],
    senior: [
      { title: "Concentration is the quiet risk", body: "When a large share of your savings sits in one place — including your employer — a single event can move more than you would choose.", disclaimer, handoff },
      { title: "Tax treatment differs by wrapper", body: "The same saving can be taxed differently depending on the account it sits in. Worth understanding before the year end.", disclaimer, handoff },
    ],
  };

  const regional: Record<Region, FinancialTip> = {
    IN: { title: "EPF, PPF and NPS do different jobs", body: "They differ in lock-in, liquidity and tax treatment. Knowing which is which matters more than picking a 'best' one.", disclaimer, handoff },
    AE: { title: "There's no automatic pension here", body: "End-of-service benefit is not a retirement plan. Anything beyond it is something you have to set up yourself.", disclaimer, handoff },
    SG: { title: "CPF has several accounts", body: "Ordinary, Special and MediSave behave differently and can't be used interchangeably.", disclaimer, handoff },
    UK: { title: "Workplace pension matching", body: "If your employer matches contributions, not taking the match is leaving pay behind.", disclaimer, handoff },
    US: { title: "401(k) match first", body: "An employer match is the highest-certainty return available to most people.", disclaimer, handoff },
  };

  return [...byBand[band], regional[region]];
}

/* ── anomaly-aware wellbeing check ─────────────────────────────── */

export type WellbeingSignals = {
  /** Percent change in activity vs their own baseline. */
  activityChangePct: number;
  sleepChangeHours: number;
  /** Their own Pulse sentiment, −1..1. */
  moodTrend: number;
  /** The brief: "(with consent)". Without it, nothing happens. */
  consented: boolean;
};

export type WellbeingCheck = {
  triggered: boolean;
  tone: "gentle";
  message?: string;
  /** A warm handoff into Pillar 7, offered — never automatic. */
  offerHandoff: boolean;
  /** Stated explicitly because it is the promise that makes this acceptable. */
  visibleToManager: false;
  reason?: string;
};

export function wellbeingCheck(s: WellbeingSignals): WellbeingCheck {
  const base: WellbeingCheck = { triggered: false, tone: "gentle", offerHandoff: false, visibleToManager: false };

  // Consent is a gate, not a preference. No consent, no check — not even silently logged.
  if (!s.consented) return { ...base, reason: "No consent on file for wellbeing checks." };

  const activityDrop = s.activityChangePct <= -30;
  const sleepDrop = s.sleepChangeHours <= -1;
  const moodDrop = s.moodTrend <= -0.25;

  // The brief requires the COMBINATION — activity alone is someone on holiday.
  const signals = [activityDrop, sleepDrop].filter(Boolean).length;
  if (!(signals >= 1 && moodDrop)) return { ...base, reason: "Signals not combined — no check raised." };

  return {
    triggered: true,
    tone: "gentle",
    message:
      "It looks like it's been a heavier stretch than usual. Nothing here is shared with anyone — but if it would help to talk to someone, that's one tap away.",
    offerHandoff: true,
    visibleToManager: false,
    reason: `${[activityDrop && "activity down", sleepDrop && "less sleep", moodDrop && "mood down"].filter(Boolean).join(", ")}`,
  };
}

/* ── smart challenge matching ──────────────────────────────────── */

export type Participant = { email: string; role: string; surface: "desk" | "frontline"; avgDailySteps: number; activityType: "steps" | "active-minutes" | "distance" };

export type Cohort = { name: string; basis: string; members: Participant[] };

/**
 * Group people into fair cohorts.
 *
 * The brief's example is the test: "a desk worker and a warehouse picker aren't
 * compared on step count alone". A picker walks 18,000 steps doing their job; a
 * designer walking 8,000 has tried much harder. Ranking them together makes the
 * leaderboard meaningless and the effort invisible.
 */
export function buildCohorts(participants: Participant[]): Cohort[] {
  const groups = new Map<string, Participant[]>();
  for (const p of participants) {
    // Bucket by baseline activity, not raw output — that is what makes it fair.
    const band = p.avgDailySteps > 12000 ? "high-movement" : p.avgDailySteps > 6000 ? "mixed" : "seated";
    const key = `${p.surface}:${band}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.entries()].map(([key, members]) => {
    const [surface, band] = key.split(":");
    return {
      name: `${surface === "frontline" ? "On-site" : "Desk"} · ${band.replace("-", " ")}`,
      basis: "Grouped by how much your job already moves you, so effort counts rather than job type.",
      members,
    };
  });
}

/* ── benefits ──────────────────────────────────────────────────── */

export type Benefit = { id: string; name: string; used: boolean; enrolmentClosesInDays?: number; worth?: string };

export function unusedBenefits(benefits: Benefit[], withinDays = 45): { benefit: Benefit; nudge: Nudge }[] {
  return benefits
    .filter((b) => !b.used && (b.enrolmentClosesInDays ?? 999) <= withinDays)
    .map((b) => ({
      benefit: b,
      nudge: {
        text: `You haven't used ${b.name}${b.worth ? ` (${b.worth})` : ""}, and enrolment closes in ${b.enrolmentClosesInDays} days.`,
        deliverAtHour: 11,
        kind: "benefit" as const,
        actionable: true,
      },
    }));
}
