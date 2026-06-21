"use client";
/* SENTIMENT — org sentiment analytics (Notion "Listen" spec). How people feel:
   split + net score, positive/negative trend, theme breakdown (click a theme to
   drill into anonymity-safe comments), drivers, alerts, an AI comment summary,
   and a team scope that re-scopes the read — gated by a min-N anonymity threshold.
   Same Lumen shell + Aurora AI accents. Seeded data (lib/listen). */
import * as React from "react";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { ArcGauge, TrendChart } from "@/components/charts";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import { sentiment, sentimentScopes, MIN_N } from "@/lib/listen";

const TONE = { good: "#2f9e6e", bad: "#dc4a44", warn: "#d68a1e", purple: "#6d5df0", muted: "#8a8f98" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const sentTone = (s: string) => (s === "positive" ? TONE.good : s === "negative" ? TONE.bad : TONE.muted);
const trendGlyph = (t: string) => (t === "up" ? "▲" : t === "down" ? "▼" : "→");

// The trend is a monthly series — windows are in months so labels match the data.
const PERIODS = ["3 months", "6 months", "12 months"] as const;
const WIN: Record<string, number> = { "3 months": 3, "6 months": 6, "12 months": 12 };
const THEME_FILTERS = ["All", "Positive", "Negative", "Rising"] as const;

type Theme = (typeof sentiment.themes)[number];

/* re-scope the read by team, gated by the anonymity threshold */
function deriveSentiment(scope: string) {
  const sc = sentimentScopes.find((s) => s.name === scope);
  const respondents = sc?.respondents ?? sentiment.comments;
  if (respondents < MIN_N) return { hidden: true as const, respondents };
  if (scope === "All teams") return { hidden: false as const, respondents, ...sentiment };
  const shift = (hash(scope) % 16) - 8;
  const positive = clamp(sentiment.positive + shift, 25, 85);
  const negative = clamp(sentiment.negative - Math.round(shift * 0.6), 4, 45);
  const frac = respondents / sentiment.comments;
  return {
    hidden: false as const,
    respondents,
    net: clamp(sentiment.net + shift, 20, 86),
    netDelta: sentiment.netDelta,
    positive,
    negative,
    neutral: clamp(100 - positive - negative, 6, 50),
    posSeries: sentiment.posSeries.map((v) => clamp(v + shift, 20, 92)),
    negSeries: sentiment.negSeries.map((v) => clamp(v - Math.round(shift * 0.6), 3, 45)),
    months: sentiment.months,
    themes: sentiment.themes.map((t) => ({ ...t, occurrences: Math.max(4, Math.round(t.occurrences * frac * 3)) })),
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

export function SentimentDashboard() {
  const [period, setPeriod] = React.useState<string>("6 months");
  const [themeFilter, setThemeFilter] = React.useState<(typeof THEME_FILTERS)[number]>("All");
  const [scope, setScope] = React.useState<string>("All teams");
  const [openTheme, setOpenTheme] = React.useState<Theme | null>(null);
  const v = deriveSentiment(scope);
  const scopes = sentimentScopes.map((s) => s.name);

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Listen</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Sentiment</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[14px] text-muted">{v.hidden ? <span>Pick a larger group to view sentiment.</span> : <><span className="text-[20px] font-bold tracking-tight text-ink">{v.net}</span><span>net sentiment · +{v.netDelta} vs last period · {v.respondents.toLocaleString()} responses</span></>}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] text-faint">Scope
              <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-full border border-line bg-card px-3 py-1.5 text-[14px] font-medium text-ink outline-none transition hover:border-faint/40">
                {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
              {PERIODS.map((p) => <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${period === p ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p}</button>)}
            </div>
          </div>
        </div>
      </header>

      {v.hidden ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-soft text-[var(--warn,#d68a1e)]"><ShieldAlert className="h-6 w-6" /></span>
            <p className="mt-1 text-[16px] font-semibold">Hidden to protect anonymity</p>
            <p className="max-w-sm text-[14px] text-muted">{scope} has {v.respondents} responses — fewer than the {MIN_N} needed to show a cut without identifying individuals. Choose a larger group.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
            {/* summary */}
            <Card className="xl:col-span-4">
              <Eyebrow>How people feel{scope !== "All teams" ? ` · ${scope}` : ""}</Eyebrow>
              <div role="img" aria-label={`Net sentiment ${v.net} of 100`} className="mt-2 flex justify-center"><ArcGauge score={v.net} width={190} label="net sentiment" /></div>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
                {[["Positive", v.positive, TONE.good], ["Neutral", v.neutral, TONE.muted], ["Negative", v.negative, TONE.bad]].map(([l, p, c]) => <span key={l as string} style={{ width: `${p}%`, background: c as string }} />)}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-faint">
                {[["Positive", v.positive, TONE.good], ["Neutral", v.neutral, TONE.muted], ["Negative", v.negative, TONE.bad]].map(([l, p, c]) => <span key={l as string} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c as string }} />{l} {p}%</span>)}
              </div>
            </Card>

            {/* over time */}
            <Card className="xl:col-span-8">
              <div className="flex items-start justify-between">
                <div><Eyebrow>Over time · {period}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Positive vs negative</h2></div>
                <div className="flex items-center gap-3 text-[12px] text-faint"><span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: TONE.good }} /> Positive</span><span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: TONE.bad }} /> Negative</span></div>
              </div>
              <TrendChart series={v.posSeries.slice(-(WIN[period] ?? 12))} benchmark={v.negSeries.slice(-(WIN[period] ?? 12))} labels={v.months.slice(-(WIN[period] ?? 12))} seriesLabel="Positive %" benchLabel="Negative %" caption={`Positive vs negative sentiment, last ${WIN[period] ?? 12} months`} color={TONE.good} benchColor={TONE.bad} height={170} id="sent" className="mt-4" />
              <div className="mt-1 flex justify-between text-[12px] text-faint">{v.months.slice(-(WIN[period] ?? 12)).filter((_, i, a) => a.length <= 6 || i % 2 === 0).map((m) => <span key={m}>{m}</span>)}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
            {/* themes */}
            <Card className="xl:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><Eyebrow>By theme · tap to drill in</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What's driving it</h2></div>
                <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
                  {THEME_FILTERS.map((f) => <button key={f} onClick={() => setThemeFilter(f)} className={`rounded-full px-2.5 py-1 text-[13px] font-semibold transition ${themeFilter === f ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{f}</button>)}
                </div>
              </div>
              <table className="mt-4 w-full border-collapse">
                <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Theme", "Sentiment", "Mentions", "Trend", ""].map((h, i) => <th key={i} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {v.themes.filter((t) => themeFilter === "All" ? true : themeFilter === "Rising" ? t.trend === "up" : t.sentiment === themeFilter.toLowerCase()).map((t) => (
                    <tr key={t.name} tabIndex={0} onClick={() => setOpenTheme(t)} onKeyDown={(e) => { if (e.key === "Enter") setOpenTheme(t); }} className="cursor-pointer border-t border-line outline-none transition hover:bg-soft focus-visible:bg-soft">
                      <td className="px-2 py-2.5 text-[14px] font-medium">{t.name}</td>
                      <td className="px-2 py-2.5"><span className="rounded-full px-2 py-0.5 text-[12px] font-semibold capitalize" style={{ background: `${sentTone(t.sentiment)}1a`, color: sentTone(t.sentiment) }}>{t.sentiment}</span></td>
                      <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{t.occurrences}</td>
                      <td className="px-2 py-2.5 text-[14px]" style={{ color: t.trend === "up" ? TONE.bad : t.trend === "down" ? TONE.good : TONE.muted }}>{trendGlyph(t.trend)}</td>
                      <td className="px-2 py-2.5 text-right text-[12px] text-faint">→</td>
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
                  <div><div className="text-[12px] font-semibold" style={{ color: TONE.good }}>Lifting</div><ul className="mt-1.5 space-y-1.5">{sentiment.lifting.map((d) => <li key={d} className="text-[14px] text-muted">{d}</li>)}</ul></div>
                  <div><div className="text-[12px] font-semibold" style={{ color: TONE.bad }}>Dragging</div><ul className="mt-1.5 space-y-1.5">{sentiment.dragging.map((d) => <li key={d} className="text-[14px] text-muted">{d}</li>)}</ul></div>
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

          {/* AI comment summary */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><Eyebrow>AI comment summary</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What people are saying</h2></div>
              <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Summarise employee sentiment themes and what to do about them.")}>Ask Vadal</Button>
            </div>
            <ul className="mt-3 space-y-2">
              {sentiment.summary.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-muted"><SparkMark size={13} className="mt-0.5 shrink-0" /><span>{s}</span></li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {/* theme drill-down */}
      <Drawer open={!!openTheme} title={openTheme?.name} onClose={() => setOpenTheme(null)}>
        {openTheme && (() => {
          const comments = sentiment.themeComments[openTheme.name] ?? [];
          const safe = openTheme.occurrences >= MIN_N;
          return (
            <>
              <Eyebrow>Theme</Eyebrow>
              <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">{openTheme.name}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[12px] font-semibold capitalize" style={{ background: `${sentTone(openTheme.sentiment)}1a`, color: sentTone(openTheme.sentiment) }}>{openTheme.sentiment}</span>
                <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted">{openTheme.occurrences} mentions</span>
                <span className="text-[12px]" style={{ color: openTheme.trend === "up" ? TONE.bad : openTheme.trend === "down" ? TONE.good : TONE.muted }}>{trendGlyph(openTheme.trend)} {openTheme.trend}</span>
              </div>
              <h3 className="mt-5 text-[14px] font-bold">Representative comments</h3>
              {safe && comments.length ? (
                <div className="mt-2 flex flex-col gap-2.5">
                  {comments.map((c) => <blockquote key={c.text} className="rounded-2xl border-l-2 bg-soft p-3.5 text-[14px] leading-relaxed text-muted" style={{ borderColor: sentTone(openTheme.sentiment) }}>“{c.text}”<cite className="mt-1.5 block text-[12px] not-italic text-faint">{c.meta}</cite></blockquote>)}
                </div>
              ) : (
                <div className="mt-2 flex items-start gap-2 rounded-2xl bg-soft p-3.5 text-[14px] text-muted"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: TONE.warn }} /><span>Too few mentions in this cut to show individual comments safely (anonymity threshold {MIN_N}).</span></div>
              )}
              <Button variant="brand" className="mt-5" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`What's driving the “${openTheme.name}” theme and how do we improve it?`)}>Ask Vadal about this</Button>
            </>
          );
        })()}
      </Drawer>
    </div>
  );
}
