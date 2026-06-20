/* PULSE derivation — turns the org-level seed data into a coherent VIEW for a
   given scope (All teams | a department) and period (7 days | 30 days | Quarter).

   Deterministic: same (scope, period) → same numbers, so the board re-scopes
   consistently when you change either control. The model distinguishes:
     · stocks (rates, scores, headcounts at risk) — move with SCOPE only
     · flows  (recognitions, comments, questions)  — move with SCOPE × WINDOW
     · deltas (movement vs last period)             — grow with the WINDOW
   This is seeded demo data, not a live warehouse — but every figure is derived,
   internally consistent, and changes the way a real cut would. */
import {
  health, engagementTrend, attrition, voice, recognitionBoard,
  experience, flightRisks, managers, departments,
} from "@/lib/data";

export const ALL_TEAMS = "All teams";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const teamRoot = (t: string) => t.split("·")[0].trim();               // "Sales · West" → "Sales"
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const weight = (name: string) => 0.07 + (hash(name) % 8) / 100;       // team's ~share of org (0.07–0.14)
const fmt = (n: number) => n.toLocaleString("en-US");
const K = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`);
const rescale = (arr: readonly number[], target: number) => {
  const last = arr[arr.length - 1] || 1;
  return arr.map((v) => Math.max(0, Math.round((v * target) / last)));
};

const FLOW: Record<string, number> = { "7 days": 0.25, "30 days": 1, "Quarter": 3.1 };
const MOVE: Record<string, number> = { "7 days": 0.4, "30 days": 1, "Quarter": 2.3 };

export function derivePulse(scope: string, period: string) {
  const isTeam = scope !== ALL_TEAMS;
  const d = isTeam ? departments.find((x) => x.name === scope) : undefined;
  const w = isTeam ? weight(scope) : 1;
  const flow = FLOW[period] ?? 1;
  const move = MOVE[period] ?? 1;
  const score = d ? d.score : health.score;
  const headcount = isTeam ? Math.round(12480 * w) : 12480;

  /* ── headline / health ── */
  const delta = d ? Math.round((d.score - 74) / 3) : health.delta;
  const benchmarkDelta = score - 75;
  const percentile =
    score >= 82 ? "top 25%" : score >= 76 ? "top 40%" : score >= 68 ? "median band" : "bottom 30%";
  const narrative = d
    ? `${scope} sits at ${score} — ${percentile} of internal teams. ${
        score >= 78
          ? "Recognition and a steady 1:1 cadence are holding it up."
          : score >= 68
            ? "Engagement is holding, but workload and growth clarity need watching."
            : "Workload pressure and thin manager coverage are dragging the score — act this week."
      }`
    : health.narrative;
  const drivers = d
    ? [
        { label: `Recognition ${score >= 75 ? "+" : "−"}${4 + (hash(scope) % 12)}%`, tone: score >= 75 ? "good" : "bad" },
        { label: `1:1s ${clamp(score + 6, 40, 96)}%`, tone: score >= 72 ? "good" : "warn" },
        { label: score < 72 ? "Workload pressure" : "Growth clarity", tone: score < 72 ? "bad" : "neutral" },
      ]
    : health.drivers.map((x) => ({ label: x.label, tone: x.tone as string }));

  /* ── engagement trend — level-shift the org curve toward the team's score ── */
  const shift = score - engagementTrend.series[engagementTrend.series.length - 1];
  const series = engagementTrend.series.map((v) => clamp(Math.round(v + shift), 38, 99));
  const insight = d
    ? score >= 78
      ? `${scope} tracks above the benchmark — recognition is the strongest correlated driver.`
      : `${scope} trails the benchmark by ${Math.abs(benchmarkDelta)} pts — workload is the top correlated driver.`
    : engagementTrend.insight;

  /* ── KPI signals (participation·rate, recognitions·flow, at-risk·stock, manager·rate) ── */
  const part = isTeam ? clamp(score - 7, 42, 95) : 74;
  const partDelta = isTeam ? (score >= 74 ? Math.round(2 * move) : -Math.round(3 * move)) : -3;
  const rec = Math.round((isTeam ? 2840 * w : 2840) * flow);
  const riskRate = clamp((100 - score) / 100 * 0.22, 0.02, 0.18);
  const risk = isTeam ? Math.max(4, Math.round(headcount * riskRate)) : 312;
  const mgrForTeam = managers.find((m) => teamRoot(m.team) === scope);
  const mgrScore = isTeam ? (mgrForTeam ? mgrForTeam.score : clamp(score + 2, 40, 96)) : 78;

  const signals = [
    {
      title: "Participation", value: `${part}%`,
      delta: `${partDelta >= 0 ? "▲" : "▼"} ${Math.abs(partDelta)}`, tone: partDelta >= 0 ? "good" : "bad",
      spark: rescale([82, 80, 79, 78, 76, 75, 74], part),
      note: isTeam ? `${scope} · vs 74% org avg` : "Lower in Plant Ops & Night shift",
    },
    {
      title: "Recognitions", value: fmt(rec),
      delta: `▲ ${Math.round(12 * move)}%`, tone: "good",
      spark: [12, 16, 18, 22, 26, 31, 38],
      note: isTeam ? `${scope} · last ${period.toLowerCase()}` : "61% coverage · Ownership leads",
    },
    {
      title: "Employees at risk", value: fmt(risk),
      delta: `▲ ${Math.max(1, Math.round(risk * 0.05))}`, tone: "bad",
      spark: rescale([262, 270, 280, 288, 298, 306, 312], risk),
      note: isTeam ? `${Math.round(riskRate * 100)}% of ${scope}` : "2.5% of workforce · 3 new today",
    },
    {
      title: "Manager score", value: `${mgrScore}`,
      delta: `${mgrScore >= 76 ? "▲" : "▼"} ${Math.abs(mgrScore - 76) || 1}`, tone: mgrScore >= 72 ? "good" : "warn",
      spark: rescale([71, 72, 73, 74, 75, 76, 78], mgrScore),
      note: isTeam ? (mgrForTeam ? mgrForTeam.name : `${scope} lead`) : "1:1 completion 88%",
    },
  ];

  /* ── attrition ── */
  const predicted = isTeam ? `${clamp((100 - score) * 0.16, 1.4, 9).toFixed(1)}%` : attrition.predicted;
  const predictedDelta = isTeam
    ? `${score < 72 ? "+" : "−"}${(Math.abs((82 - score) * 0.04) * move).toFixed(1)}`
    : attrition.predictedDelta;
  let segmentation: { level: string; count: number; color: string }[];
  if (isTeam) {
    const total = Math.max(8, Math.round(risk + headcount * 0.06));
    const highPct = clamp(0.1 + (82 - score) * 0.012, 0.04, 0.5);
    const lowPct = clamp(0.5 - (82 - score) * 0.012, 0.12, 0.62);
    const high = Math.round(total * highPct);
    const low = Math.round(total * lowPct);
    segmentation = [
      { level: "High", count: high, color: "#f26b66" },
      { level: "Medium", count: Math.max(0, total - high - low), color: "#fccc4d" },
      { level: "Low", count: low, color: "#22b873" },
    ];
  } else segmentation = attrition.segmentation.map((s) => ({ ...s }));

  /* ── voice ── */
  const comments = Math.round((isTeam ? voice.comments * w : voice.comments) * flow);
  const posShift = isTeam ? Math.round((score - 82) * 0.9) : 0;
  const positive = clamp(68 + posShift, 28, 86);
  const negative = clamp(10 - Math.round(posShift * 0.7), 3, 46);
  const mood = [
    { label: "Positive", pct: positive, color: "#22b873" },
    { label: "Neutral", pct: clamp(100 - positive - negative, 6, 50), color: "#fccc4d" },
    { label: "Negative", pct: negative, color: "#f26b66" },
  ];

  /* ── recognition ── */
  const recoTotal = rec;
  const coverage = isTeam ? clamp(score - 6, 30, 92) : recognitionBoard.coverage;

  /* ── adoption (dau/wau·stock, views/reactions·flow) ── */
  const dauPct = isTeam ? clamp(score - 8, 35, 92) : experience.dauPct;
  const adoption = {
    dau: isTeam ? K(Math.round(8100 * w)) : experience.dau,
    wau: isTeam ? K(Math.round(11200 * w)) : experience.wau,
    views: K(Math.round((isTeam ? 42000 * w : 42000) * flow)),
    reactions: K(Math.round((isTeam ? 9300 * w : 9300) * flow)),
    dauPct,
  };

  /* ── filtered rosters ── */
  const fr = isTeam ? flightRisks.filter((r) => teamRoot(r.team) === scope) : flightRisks.map((r) => ({ ...r }));
  const mgr = isTeam ? managers.filter((m) => teamRoot(m.team) === scope) : managers.map((m) => ({ ...m }));

  return {
    scope, period, isTeam,
    health: { score, delta, benchmarkDelta, percentile, narrative, drivers },
    trend: { series, benchmark: engagementTrend.benchmark, months: engagementTrend.months, insight },
    signals,
    attrition: { predicted, predictedDelta, segmentation },
    voice: { comments, mood },
    recognition: { total: recoTotal, coverage },
    adoption,
    managerIndex: isTeam ? mgrScore : 78,
    flightRisks: fr,
    managers: mgr,
  };
}

export type PulseView = ReturnType<typeof derivePulse>;
