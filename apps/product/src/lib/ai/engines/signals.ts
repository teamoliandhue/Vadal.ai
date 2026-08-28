/**
 * Signals engine — baselines, anomaly detection, and the single employee-
 * experience score.
 *
 * Implements, from the brief:
 *  · Pulse — "Anomaly detection that flags a sudden dip in a team's sentiment
 *            or response rate before it becomes a resignation wave, and drafts
 *            a suggested manager action"
 *  · §8    — "Sentiment & signal engine — shared sentiment/theme extraction used
 *            by Pulse (surveys), Connect (posts) and Broadcast (acknowledgement
 *            tone), feeding one 'employee experience score' view for HR"
 *
 * And the instruction that shaped the data model:
 *  · "Sentiment scoring and anomaly detection need a rolling baseline per team
 *     from day one — design the data model to store historical scores per
 *     team/segment, not just per survey wave, or trend detection won't be
 *     possible later."
 *
 * So the unit here is a per-team time series, not a survey result. Everything
 * else derives from it.
 */

export type Point = { at: string; value: number };

/** The stored shape the brief asks for: history per team, per metric. */
export type Baseline = {
  team: string;
  metric: "sentiment" | "responseRate" | "engagement" | "recognition";
  series: Point[];
};

export type Anomaly = {
  team: string;
  metric: Baseline["metric"];
  severity: "watch" | "concern" | "urgent";
  /** How far below the rolling mean, in standard deviations. */
  z: number;
  current: number;
  expected: number;
  delta: number;
  /** Plain-language explanation, not a statistic. */
  explanation: string;
  /** The brief requires a drafted action, not just a flag. */
  suggestedAction: { title: string; detail: string; tool?: string };
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/**
 * Detect a dip against the team's own rolling history.
 *
 * Deliberately compares a team to *itself*, not to the org. A warehouse team
 * that always scores lower than engineering is not an anomaly; the same team
 * dropping six points in a fortnight is.
 */
export function detectAnomaly(baseline: Baseline, window = 6): Anomaly | null {
  const values = baseline.series.map((p) => p.value);
  if (values.length < 4) return null;

  const history = values.slice(-window - 1, -1);
  const current = values[values.length - 1];
  const expected = mean(history);
  const sd = stdev(history);
  if (sd === 0) return null;

  const z = (current - expected) / sd;
  if (z > -1.3) return null; // only dips, and only meaningful ones

  const severity: Anomaly["severity"] = z <= -2.5 ? "urgent" : z <= -1.9 ? "concern" : "watch";
  const delta = Math.round((current - expected) * 10) / 10;

  return {
    team: baseline.team,
    metric: baseline.metric,
    severity,
    z: Math.round(z * 100) / 100,
    current,
    expected: Math.round(expected * 10) / 10,
    delta,
    explanation: explain(baseline.metric, baseline.team, delta, severity),
    suggestedAction: draftAction(baseline.metric, baseline.team, severity),
  };
}

function explain(metric: Baseline["metric"], team: string, delta: number, severity: Anomaly["severity"]): string {
  const size = Math.abs(delta);
  const word = severity === "urgent" ? "sharply" : severity === "concern" ? "clearly" : "slightly";
  switch (metric) {
    case "sentiment":
      return `${team} sentiment is ${word} down — ${size} points below its own recent average. That is a change in this team, not a comparison with others.`;
    case "responseRate":
      return `${team} response rate has fallen ${size} points below its own norm. People going quiet is usually the first signal, not the last.`;
    case "recognition":
      return `Recognition in ${team} is ${size} points below its usual level — the cheapest signal to fix, and one that moves retention.`;
    default:
      return `${team} engagement is ${word} down, ${size} points below its own recent average.`;
  }
}

/**
 * The drafted action the brief asks for.
 *
 * A flag without a next step just moves the work to a manager who was already
 * not looking at the dashboard, which is the failure both competitor teardowns
 * found. Where a tool can do it, the action names the tool.
 */
function draftAction(metric: Baseline["metric"], team: string, severity: Anomaly["severity"]) {
  if (metric === "responseRate") {
    return {
      title: `Ask ${team} what changed`,
      detail: `Run a 2-question micro-survey to ${team} on why participation dropped. Keep it anonymous — a silent team is rarely silent about the reason.`,
      tool: "launch_pulse_survey",
    };
  }
  if (metric === "recognition") {
    return {
      title: `Recognise someone in ${team} this week`,
      detail: `Recognition coverage is the fastest lever here. Pick one person whose work landed recently and say why it mattered.`,
      tool: "give_recognition",
    };
  }
  if (severity === "urgent") {
    return {
      title: `Talk to ${team} before the next cycle`,
      detail: `Bring the 1:1s forward rather than waiting for the next survey. Launch a short diagnostic pulse first so the conversation starts from what they actually said.`,
      tool: "launch_pulse_survey",
    };
  }
  return {
    title: `Run a diagnostic pulse for ${team}`,
    detail: `Three questions on workload, support and blockers will tell you whether this is a blip or a trend.`,
    tool: "launch_pulse_survey",
  };
}

/** Scan every team at once — what the Copilot and the briefing card call. */
export function scanAnomalies(baselines: Baseline[]): Anomaly[] {
  return baselines
    .map((b) => detectAnomaly(b))
    .filter((a): a is Anomaly => a !== null)
    .sort((a, b) => a.z - b.z);
}

/* ── the one employee-experience score (§8) ───────────────────── */

export type ExInputs = {
  /** Survey sentiment, −1..1 */
  surveySentiment: number;
  /** Connect post sentiment, −1..1 */
  postSentiment: number;
  /** Broadcast acknowledgement rate, 0..1 */
  acknowledgement: number;
  /** Survey participation, 0..1 */
  participation: number;
  /** Share of people recognised in the period, 0..1 */
  recognitionCoverage: number;
};

export type ExScore = {
  score: number; // 0–100
  contributions: { label: string; points: number }[];
  /** The weakest contributor — where to act first. */
  weakest: string;
};

/**
 * One score, from all three listening surfaces.
 *
 * The brief's point is that these must not be three separate AI integrations
 * producing three numbers nobody reconciles. Weights are explicit and visible so
 * the score can be argued with rather than trusted blindly.
 */
export function employeeExperienceScore(i: ExInputs): ExScore {
  const norm = (x: number) => (x + 1) / 2; // −1..1 → 0..1
  const parts = [
    { label: "Survey sentiment", value: norm(i.surveySentiment), weight: 0.3 },
    { label: "Feed sentiment", value: norm(i.postSentiment), weight: 0.15 },
    { label: "Acknowledgement", value: i.acknowledgement, weight: 0.15 },
    { label: "Participation", value: i.participation, weight: 0.2 },
    { label: "Recognition coverage", value: i.recognitionCoverage, weight: 0.2 },
  ];
  const contributions = parts.map((p) => ({
    label: p.label,
    points: Math.round(p.value * p.weight * 100),
  }));
  const score = contributions.reduce((n, c) => n + c.points, 0);
  const weakest = [...parts].sort((a, b) => a.value - b.value)[0].label;
  return { score, contributions, weakest };
}

/* ── build baselines from the workspace's own history ─────────── */

/**
 * Deterministic per-team history, so anomaly detection has something real to run
 * against before a warehouse exists. Same team + metric always yields the same
 * series, which makes the behaviour testable.
 */
export function seedBaseline(team: string, metric: Baseline["metric"], points = 10): Baseline {
  let h = 7;
  for (const c of `${team}:${metric}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const base = metric === "sentiment" ? 62 : metric === "responseRate" ? 68 : 72;
  const series: Point[] = [];
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const jitter = ((h >>> 16) % 700) / 100 - 3.5; // ±3.5
    series.push({ at: `w${points - i}`, value: Math.round((base + jitter) * 10) / 10 });
  }
  return { team, metric, series };
}
