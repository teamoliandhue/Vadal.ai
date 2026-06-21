"use client";
/* ANALYTICS — the free-slicing companion to Pulse. Pulse curates "what needs
   attention"; Analytics lets you ask any metric, any cut, your way.
   Sections: executive KPI strip · saved views · explorer (breakdown + trend vs
   benchmark + AI read) · two-way heatmap (metric × team × a second cut).
   Deterministic seeded data (same inputs → same numbers) so it behaves like a
   real warehouse cut without one. Notion spec: "📈 Analytics". */
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Grid3x3 } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { Sparkline, TrendChart } from "@/components/charts";
import { engagementTrend, departments } from "@/lib/data";
import { toast } from "../Toaster";

const TONE = { good: "#2f9e6e", bad: "#dc4a44", warn: "#d68a1e", purple: "#6d5df0" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const METRICS = {
  engagement: { label: "Engagement", unit: "", goodHigh: true, range: [58, 88] as const },
  participation: { label: "Participation", unit: "%", goodHigh: true, range: [60, 94] as const },
  recognition: { label: "Recognition coverage", unit: "%", goodHigh: true, range: [42, 86] as const },
  manager: { label: "Manager score", unit: "", goodHigh: true, range: [60, 90] as const },
  attrition: { label: "Attrition risk", unit: "%", goodHigh: false, range: [2, 9] as const },
} as const;
type MetricKey = keyof typeof METRICS;
const METRIC_KEYS = Object.keys(METRICS) as MetricKey[];

const DIMS = {
  team: { label: "Team", cats: departments.map((d) => d.name) },
  tenure: { label: "Tenure", cats: ["< 1 yr", "1–2 yrs", "3–5 yrs", "5–10 yrs", "10+ yrs"] },
  location: { label: "Location", cats: ["Bengaluru", "Mumbai", "Delhi NCR", "Pune", "Remote"] },
  seniority: { label: "Seniority", cats: ["IC 1–2", "IC 3–4", "IC 5+", "Manager", "Director+"] },
} as const;
type DimKey = keyof typeof DIMS;
const DIM_KEYS = Object.keys(DIMS) as DimKey[];

const PERIODS = ["7 days", "30 days", "Quarter"] as const;
const WIN: Record<string, number> = { "7 days": 5, "30 days": 9, "Quarter": 14 };

const VIEWS: { label: string; metric: MetricKey; dim: DimKey }[] = [
  { label: "Engagement by team", metric: "engagement", dim: "team" },
  { label: "Attrition by tenure", metric: "attrition", dim: "tenure" },
  { label: "Recognition by location", metric: "recognition", dim: "location" },
  { label: "Manager score by seniority", metric: "manager", dim: "seniority" },
];

function value(metric: MetricKey, cat: string): number {
  if (metric === "engagement") {
    const dept = departments.find((d) => d.name === cat);
    if (dept) return dept.score;
  }
  const [lo, hi] = METRICS[metric].range;
  const v = lo + (hash(metric + "|" + cat) % ((hi - lo) * 10)) / 10;
  return metric === "attrition" ? Math.round(v * 10) / 10 : Math.round(v);
}
/* a second cut: a team's value nudged per column, so rows stay coherent */
function cellValue(metric: MetricKey, row: string, col: string): number {
  const [lo, hi] = METRICS[metric].range;
  const base = value(metric, row);
  const spread = (hi - lo) * 0.16;
  const delta = ((hash(metric + "|" + row + "|" + col) % 201) / 100 - 1) * spread;
  const v = clamp(base + delta, lo, hi);
  return metric === "attrition" ? Math.round(v * 10) / 10 : Math.round(v);
}
function toneFor(metric: MetricKey, v: number): string {
  const { range, goodHigh } = METRICS[metric];
  const pct = (v - range[0]) / (range[1] - range[0]);
  const s = goodHigh ? pct : 1 - pct;
  return s >= 0.66 ? TONE.good : s >= 0.33 ? TONE.warn : TONE.bad;
}
function trendFor(metric: MetricKey): number[] {
  if (metric === "engagement") return engagementTrend.series;
  const [lo, hi] = METRICS[metric].range;
  const mid = (lo + hi) / 2, amp = (hi - lo) * 0.32, h = hash(metric);
  return Array.from({ length: 14 }, (_, i) =>
    Math.round((clamp(mid + Math.sin(i / 2.4 + (h % 6)) * amp * 0.5 + (i - 7) * (amp / 14) * ((h % 3) - 1), lo, hi)) * 10) / 10,
  );
}
function benchmarkFor(metric: MetricKey): number[] {
  if (metric === "engagement") return engagementTrend.benchmark;
  const [lo, hi] = METRICS[metric].range;
  const b = Math.round(((lo + hi) / 2) * (METRICS[metric].goodHigh ? 0.96 : 1.04) * 10) / 10;
  return Array.from({ length: 14 }, () => b);
}

export function AnalyticsExplorer({ initialMetric, initialDim }: { initialMetric?: string; initialDim?: string }) {
  const startMetric = (initialMetric && initialMetric in METRICS ? initialMetric : "engagement") as MetricKey;
  const startDim = (initialDim && initialDim in DIMS ? initialDim : "team") as DimKey;
  const [metric, setMetric] = React.useState<MetricKey>(startMetric);
  const [dim, setDim] = React.useState<DimKey>(startDim);
  const [period, setPeriod] = React.useState<string>("30 days");

  const M = METRICS[metric];
  const fmt = React.useCallback((v: number) => `${v}${M.unit}`, [M.unit]);

  const rows = React.useMemo(
    () => DIMS[dim].cats.map((c) => ({ cat: c, v: value(metric, c) })).sort((a, b) => (M.goodHigh ? b.v - a.v : a.v - b.v)),
    [metric, dim, M.goodHigh],
  );
  const max = Math.max(...rows.map((r) => r.v));
  const avg = Math.round((rows.reduce((s, r) => s + r.v, 0) / rows.length) * 10) / 10;
  const best = rows[0], worst = rows[rows.length - 1];
  const n = WIN[period] ?? 14;
  const series = trendFor(metric).slice(-n);
  const bench = benchmarkFor(metric).slice(-n);

  // heatmap: team (rows) × a second cut (cols). If the chosen dim is team, cross with tenure.
  const colDim: DimKey = dim === "team" ? "tenure" : dim;
  const heatCols = DIMS[colDim].cats;
  const heatRows = departments.map((d) => d.name);

  const insight = M.goodHigh
    ? `${best.cat} leads on ${M.label.toLowerCase()} (${fmt(best.v)}); ${worst.cat} trails at ${fmt(worst.v)} — a ${Math.round((best.v - worst.v) * 10) / 10}${M.unit} spread worth closing.`
    : `${worst.cat} carries the most ${M.label.toLowerCase()} (${fmt(worst.v)}) vs ${best.cat} at ${fmt(best.v)} — focus mitigation there first.`;

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/product" className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5"><ArrowLeft className="h-3 w-3" /> Back to Pulse</Link>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Analytics</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Slice any metric across any cut. Pulse tells you what needs attention — Analytics lets you ask why, your way.</p>
          </div>
          <Button variant="secondary" size="sm" leadingIcon={<Download className="h-4 w-4" />} onClick={() => toast("Report exported ✓")}>Export</Button>
        </div>
        {/* controls */}
        <div className="relative mt-6 flex flex-col gap-3 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Metric</span>
            {METRIC_KEYS.map((k) => (
              <button key={k} onClick={() => setMetric(k)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${metric === k ? "bg-ink text-[var(--card)]" : "border border-line text-muted hover:bg-soft hover:text-ink"}`}>{METRICS[k].label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">By
              <select value={dim} onChange={(e) => setDim(e.target.value as DimKey)} className="rounded-full border border-line bg-card px-3 py-1.5 text-[14px] font-medium normal-case tracking-normal text-ink outline-none transition hover:border-faint/40">
                {DIM_KEYS.map((k) => <option key={k} value={k}>{DIMS[k].label}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${period === p ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* executive KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {METRIC_KEYS.map((k) => {
          const t = trendFor(k);
          const w = t.slice(-7);
          const cur = Math.round(w[w.length - 1]);
          const delta = Math.round((w[w.length - 1] - w[0]) * 10) / 10;
          const good = METRICS[k].goodHigh ? delta >= 0 : delta <= 0;
          const c = toneFor(k, w[w.length - 1]);
          const activeK = k === metric;
          return (
            <button key={k} onClick={() => setMetric(k)} className={`card-lift flex flex-col rounded-2xl border bg-card p-4 text-left transition ${activeK ? "border-[var(--purple)] ring-1 ring-[var(--purple)]" : "border-line"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{METRICS[k].label}</span>
                <span className="text-[12px] font-bold" style={{ color: good ? TONE.good : TONE.bad }}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}{METRICS[k].unit}</span>
              </div>
              <div className="mt-1 text-[22px] font-bold tracking-tight">{cur}{METRICS[k].unit}</div>
              <div role="img" aria-label={`${METRICS[k].label} trend`}><Sparkline values={w} color={c} id={`kpi-${k}`} height={26} className="mt-1" /></div>
            </button>
          );
        })}
      </div>

      {/* saved views */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Saved views</span>
        {VIEWS.map((v) => {
          const active = v.metric === metric && v.dim === dim;
          return (
            <button key={v.label} onClick={() => { setMetric(v.metric); setDim(v.dim); }} className={`rounded-full px-3 py-1 text-[14px] font-medium transition ${active ? "bg-[var(--lav)] text-[var(--purple)] ring-1 ring-[var(--purple)]/30" : "bg-soft text-muted hover:text-ink"}`}>{v.label}</button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* breakdown */}
        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 xl:col-span-7">
          <div className="flex items-start justify-between">
            <div><p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{M.label} by {DIMS[dim].label}</p><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Breakdown</h2></div>
            <div className="text-right text-[12px] text-faint">avg <span className="text-[16px] font-bold text-ink">{fmt(avg)}</span></div>
          </div>
          <ul className="mt-5 space-y-3">
            {rows.map((r) => {
              const c = toneFor(metric, r.v);
              return (
                <li key={r.cat} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-[14px] font-medium">{r.cat}</span>
                  <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500" style={{ width: `${(r.v / max) * 100}%`, background: c }} /></span>
                  <span className="w-12 shrink-0 text-right text-[14px] font-bold tabular-nums">{fmt(r.v)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* trend + read */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7">
            <div className="flex items-start justify-between">
              <div><p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{M.label} · {period}</p><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Trend vs benchmark</h2></div>
              <div className="flex items-center gap-3 text-[12px] text-faint"><span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: TONE.purple }} /> Us</span><span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-line" /> Bench</span></div>
            </div>
            <div role="img" aria-label={`${M.label} trend vs benchmark over ${period}`}>
              <TrendChart series={series} benchmark={bench} color={TONE.purple} height={150} id="ax" className="mt-4" />
            </div>
            <div className="mt-3 grid grid-cols-3 divide-x divide-line">
              {[[fmt(best.v), "Top"], [fmt(avg), "Average"], [fmt(worst.v), "Bottom"]].map(([val, l]) => <div key={l} className="px-2 text-center first:pl-0 last:pr-0"><div className="text-[16px] font-bold tracking-tight">{val}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
            </div>
          </section>
          <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">AI read</p>
            <p className="mt-2 flex items-start gap-2 text-[14px] leading-relaxed text-muted"><SparkMark size={14} className="mt-0.5 shrink-0" /><span>{insight}</span></p>
            <div className="mt-4 flex items-center gap-2.5">
              <Button variant="brand" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`In Analytics, explain ${M.label} by ${DIMS[dim].label}.`)}>Ask Vadal</Button>
              <Link href="/product" className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5">Act in Pulse <ArrowUpRight className="h-3 w-3" /></Link>
            </div>
          </section>
        </div>
      </div>

      {/* two-way heatmap */}
      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--lav)] text-[var(--purple)]"><Grid3x3 className="h-[18px] w-[18px]" strokeWidth={1.9} /></span>
            <div><p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{M.label} · Team × {DIMS[colDim].label}</p><h2 className="mt-0.5 text-[18px] font-bold tracking-tight">Heatmap</h2></div>
          </div>
          <button onClick={() => ask(`In Analytics, where are the ${M.label.toLowerCase()} hotspots by team and ${DIMS[colDim].label.toLowerCase()}?`)} className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5"><SparkMark size={12} /> Spot hotspots</button>
        </div>
        <div className="mt-4 -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[560px] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-24" />
                {heatCols.map((c) => <th key={c} className="px-1 pb-1 text-[12px] font-semibold text-faint">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatRows.map((row) => (
                <tr key={row}>
                  <td className="pr-2 text-right text-[14px] font-medium text-muted">{row}</td>
                  {heatCols.map((col) => {
                    const v = cellValue(metric, row, col);
                    const c = toneFor(metric, v);
                    return (
                      <td key={col} className="rounded-lg p-0">
                        <div className="grid h-9 place-items-center rounded-lg text-[13px] font-bold tabular-nums" style={{ background: `${c}24`, color: c }}>{v}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[12px] text-faint">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: `${TONE.good}33` }} /> Strong</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: `${TONE.warn}33` }} /> Watch</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: `${TONE.bad}33` }} /> {M.goodHigh ? "Weak" : "High risk"}</span>
        </div>
      </section>
    </div>
  );
}
