"use client";
/* SENTIMENT — org sentiment analytics (Notion "Listen" spec). The deep read on
   how people feel: split + net score, sentiment over time, theme breakdown,
   drivers, early-warning alerts, and representative (anonymity-safe) comments.
   Same Lumen shell + Aurora AI accents as Pulse. Seeded data (lib/listen). */
import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { ArcGauge, TrendChart } from "@/components/charts";
import { toast } from "../Toaster";
import { sentiment } from "@/lib/listen";

const TONE = { good: "#2f9e6e", bad: "#dc4a44", warn: "#d68a1e", purple: "#6d5df0", muted: "#8a8f98" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const sentTone = (s: string) => (s === "positive" ? TONE.good : s === "negative" ? TONE.bad : TONE.muted);
const trendGlyph = (t: string) => (t === "up" ? "▲" : t === "down" ? "▼" : "→");

const PERIODS = ["7 days", "30 days", "Quarter"] as const;
const WIN: Record<string, number> = { "7 days": 5, "30 days": 9, "Quarter": 12 };
const THEME_FILTERS = ["All", "Positive", "Negative", "Rising"] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

export function SentimentDashboard() {
  const [period, setPeriod] = React.useState<string>("30 days");
  const [themeFilter, setThemeFilter] = React.useState<(typeof THEME_FILTERS)[number]>("All");
  const n = WIN[period] ?? 12;
  const series = sentiment.netSeries.slice(-n);
  const months = sentiment.months.slice(-n);

  const split = [
    { label: "Positive", pct: sentiment.positive, color: TONE.good },
    { label: "Neutral", pct: sentiment.neutral, color: TONE.muted },
    { label: "Negative", pct: sentiment.negative, color: TONE.bad },
  ];
  const themes = sentiment.themes.filter((t) =>
    themeFilter === "All" ? true : themeFilter === "Rising" ? t.trend === "up" : t.sentiment === themeFilter.toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Listen</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Sentiment</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[14px] text-muted"><span className="text-[20px] font-bold tracking-tight text-ink">{sentiment.net}</span><span>net sentiment · +{sentiment.netDelta} vs last period · from {sentiment.comments.toLocaleString()} comments</span></p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${period === p ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* summary */}
        <Card className="xl:col-span-4">
          <Eyebrow>How people feel</Eyebrow>
          <div role="img" aria-label={`Net sentiment ${sentiment.net} of 100`} className="mt-2 flex justify-center"><ArcGauge score={sentiment.net} width={190} label="net sentiment" /></div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
            {split.map((s) => <span key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-faint">{split.map((s) => <span key={s.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label} {s.pct}%</span>)}</div>
        </Card>

        {/* over time */}
        <Card className="xl:col-span-8">
          <div className="flex items-start justify-between"><div><Eyebrow>Net sentiment · {period}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Trend</h2></div></div>
          <div role="img" aria-label={`Net sentiment trend over ${period}`}><TrendChart series={series} color={TONE.purple} height={170} id="sent" className="mt-4" /></div>
          <div className="mt-1 flex justify-between text-[12px] text-faint">{months.filter((_, i) => months.length <= 6 || i % 2 === 0).map((m) => <span key={m}>{m}</span>)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* themes */}
        <Card className="xl:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><Eyebrow>By theme</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What's driving it</h2></div>
            <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
              {THEME_FILTERS.map((f) => <button key={f} onClick={() => setThemeFilter(f)} className={`rounded-full px-2.5 py-1 text-[13px] font-semibold transition ${themeFilter === f ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{f}</button>)}
            </div>
          </div>
          <table className="mt-4 w-full border-collapse">
            <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Theme", "Sentiment", "Mentions", "Trend"].map((h) => <th key={h} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {themes.map((t) => (
                <tr key={t.name} className="border-t border-line">
                  <td className="px-2 py-2.5 text-[14px] font-medium">{t.name}</td>
                  <td className="px-2 py-2.5"><span className="rounded-full px-2 py-0.5 text-[12px] font-semibold capitalize" style={{ background: `${sentTone(t.sentiment)}1a`, color: sentTone(t.sentiment) }}>{t.sentiment}</span></td>
                  <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{t.occurrences}</td>
                  <td className="px-2 py-2.5 text-[14px]" style={{ color: t.trend === "up" ? TONE.bad : t.trend === "down" ? TONE.good : TONE.muted }}>{trendGlyph(t.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* drivers + alerts */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <Eyebrow>Drivers</Eyebrow>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[12px] font-semibold" style={{ color: TONE.good }}>Lifting</div>
                <ul className="mt-1.5 space-y-1.5">{sentiment.lifting.map((d) => <li key={d} className="text-[14px] text-muted">{d}</li>)}</ul>
              </div>
              <div>
                <div className="text-[12px] font-semibold" style={{ color: TONE.bad }}>Dragging</div>
                <ul className="mt-1.5 space-y-1.5">{sentiment.dragging.map((d) => <li key={d} className="text-[14px] text-muted">{d}</li>)}</ul>
              </div>
            </div>
          </Card>
          <Card>
            <Eyebrow>Early-warning alerts</Eyebrow>
            <ul className="mt-2 space-y-2">
              {sentiment.alerts.map((a) => (
                <li key={a.text} className="flex items-start gap-2 rounded-2xl bg-soft p-3 text-[14px] text-muted">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: a.tone === "bad" ? TONE.bad : TONE.warn }} />
                  <span className="flex-1">{a.text}</span>
                  <button onClick={() => toast("Routed to Pulse action queue ✓")} className="shrink-0 text-[12px] font-semibold text-[var(--purple)] hover:underline">Act</button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* representative comments */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><Eyebrow>Employee voice · anonymity-safe</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Representative comments</h2></div>
          <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Summarise employee sentiment themes and what to do about them.")}>Ask Vadal</Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {([["positive", sentiment.voices.positive], ["neutral", sentiment.voices.neutral], ["negative", sentiment.voices.negative]] as const).map(([k, quotes]) => (
            <div key={k} className="flex flex-col gap-2.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide capitalize" style={{ color: sentTone(k) }}>{k}</span>
              {quotes.map((q) => (
                <blockquote key={q.text} className="rounded-2xl border-l-2 bg-soft p-3.5 text-[14px] leading-relaxed text-muted" style={{ borderColor: sentTone(k) }}>“{q.text}”<cite className="mt-1.5 block text-[12px] not-italic text-faint">{q.meta}</cite></blockquote>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
