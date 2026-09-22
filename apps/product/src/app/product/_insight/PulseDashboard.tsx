"use client";
/* PULSE — people-intelligence cockpit (redesign v3).
   "What needs attention now" — curated + action-first. Deep, free-form slicing
   lives in Analytics; Pulse links across when you want to go wider.
   Model: BRIEFING (AI-led) → OUTCOME TABS → cards, all re-scoped by a GLOBAL
   scope (team) + period (window) via derivePulse(), with a real drill-down
   drawer on people + managers. Reuses the shell, charts, DS components, tokens,
   persistence + toasts. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight, ArrowRight, Check, Heart, Lock, Sparkles, TriangleAlert, X,
} from "lucide-react";
import { Avatar, Badge, Button, SparkMark, Trend, type BadgeTone } from "@vadal/design-system";
import { ArcGauge, Sparkline, TrendChart } from "@/components/charts";
import { BarList, Legend, LineChart, ViewToggle } from "@/components/viz";
import { deriveAdoption, type AdoptionView } from "@/lib/adoption";
import { usePersistentState } from "@/lib/usePersistentState";
import { useScope } from "../useViewAs";
import { ScopeNotice } from "../ScopeNotice";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import {
  criticalRoles, notRecommending, recStats, recommendations, riskPromise, riskStats, successionRule,
  successionStats, teamRisk, type Confidence, type Readiness, type RiskLevel,
} from "@/lib/insight";
import {
  org, actionQueue, actionProgress,
  recognitionExtra, departments, managerSummary, gamification,
  campaigns, impact, knowledge, aiUsage,
} from "@/lib/data";
import { derivePulse, ALL_TEAMS, type PulseView } from "./derive";
import { SCORE_SOURCES } from "@/lib/experience";

// Semantic tones as Lumen tokens so they adapt across light/dark.
const TONE = { good: "var(--success)", bad: "var(--danger)", warn: "var(--warning)", purple: "var(--purple)" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const toneOf = (t: string) => t === "good" ? TONE.good : t === "bad" ? TONE.bad : t === "warn" ? TONE.warn : TONE.purple;
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const band = (s: number) => (s >= 80 ? TONE.good : s >= 70 ? TONE.warn : TONE.bad);
const analyticsHref = (metric: string, dim = "team") => `/product/analytics?metric=${metric}&dim=${dim}`;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
function CardHead({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">{title}</h2></div>
      {action}
    </div>
  );
}
function Explore({ q }: { q: string }) {
  return <button onClick={() => ask(q)} className="flex min-h-[44px] items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5 lg:min-h-0">Explore <ArrowRight className="h-3 w-3" /></button>;
}
function AnalyticsLink({ metric, dim = "team", label = "Slice it in Explore" }: { metric: string; dim?: string; label?: string }) {
  return <Link href={analyticsHref(metric, dim)} className="flex min-h-[44px] items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5 lg:min-h-0">{label} <ArrowUpRight className="h-3 w-3" /></Link>;
}
/* Honest marker for cards that stay org-level even when a team scope is active. */
function OrgWideTag({ show }: { show: boolean }) {
  return show ? <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-faint">Org-wide</span> : null;
}
/* accessible chart wrapper — gives screen readers a text alternative for the aria-hidden svgs.
   When `explain`, a hover "Explain" pill asks Vadal about the chart in context. */
function Figure({ label, children, className = "", explain = false, group = false }: { label: string; children: React.ReactNode; className?: string; explain?: boolean; group?: boolean }) {
  return (
    <div role={group ? "group" : "img"} aria-label={label} className={`${explain ? "group relative" : ""} ${className}`}>
      {children}
      {explain && (
        <button
          onClick={() => ask(`Explain this chart: ${label}`)}
          className="ai-grad absolute right-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-[var(--ai-on-grad)] opacity-0 shadow-sm transition group-hover:opacity-100 focus-visible:opacity-100"
        >
          <SparkMark size={12} tone="solid" /> Explain
        </button>
      )}
    </div>
  );
}

/* ════════════════════════ Briefing (command bar + decisions) ════════════════════════ */
const PERIODS = ["7 days", "30 days", "Quarter"] as const;
function Briefing({ v, setTab, period, setPeriod }: { v: PulseView; setTab: (t: string) => void; period: string; setPeriod: (p: string) => void }) {
  const h = v.health;
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
      {/* command row */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>{org.name} · {v.isTeam ? v.scope : `${org.headcount.toLocaleString()} people`}</Eyebrow>
          <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Insight</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
            <span className="text-[20px] font-bold tracking-tight text-ink">{h.score}</span>
            <Trend direction={h.delta >= 0 ? "up" : "down"} value={String(Math.abs(h.delta))} />
            <span>· {h.benchmarkDelta >= 0 ? "+" : ""}{h.benchmarkDelta} vs benchmark · {h.percentile} of GCC</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p} className={`min-h-[44px] rounded-full px-3 py-1.5 text-[14px] font-semibold transition lg:min-h-0 ${period === p ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p}</button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] text-faint">Synced 9:12 AM</span>
            <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Sparkles className="h-4 w-4" />} onClick={() => ask(`Give me today's people-intelligence report for ${v.scope}`)}>AI report</Button>
          </div>
        </div>
      </div>
      {/* decisions */}
      <div className="relative mt-5 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <Eyebrow>Needs you today · {v.briefing.items.length}</Eyebrow>
          <span className="text-[12px] font-medium" style={{ color: TONE.bad }}>{v.briefing.impact} if unaddressed</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {v.briefing.items.map((b) => (
            <div key={b.text} className="flex flex-col rounded-2xl border border-line bg-soft p-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.dot }} />
                <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold leading-snug">{b.text}</div><div className="mt-0.5 text-[12px] text-faint">{b.sub}</div></div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => setTab(b.to)}>{b.label}</Button>
                <button onClick={() => ask(b.text)} className="flex min-h-[44px] items-center gap-1 px-1 text-[12px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0"><Sparkles className="h-3 w-3" /> Why</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ════════════════════════ section cards ════════════════════════ */
function HealthCard({ v, className = "" }: { v: PulseView; className?: string }) {
  const h = v.health;
  return (
    <Card className={className}>
      <CardHead eyebrow="Workforce health" title="Org health score" action={<Explore q={`Break down workforce health drivers for ${v.scope}`} />} />
      <Figure label={`Workforce health ${h.score} of 100`} explain className="mt-2 flex justify-center"><ArcGauge score={h.score} width={200} /></Figure>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {h.drivers.map((d) => <span key={d.label} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: soft(toneOf(d.tone)), color: d.tone === "neutral" ? "var(--muted)" : toneOf(d.tone) }}>{d.label}</span>)}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">{h.narrative}</p>

      {/* ══ what the number is made of ══
          The engine returns its weighted inputs precisely so the score can be
          argued with rather than trusted, and they were thrown away. A headline
          figure nobody can take apart is one nobody can act on: "engagement is
          76" leads nowhere; "participation is carrying it and recognition
          coverage is the weakest input" is a decision. */}
      {h.contributions && (
        <div className="mt-4 border-t border-line pt-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <Eyebrow>What it&apos;s made of</Eyebrow>
            <span className="text-[12px] text-faint">weighted, out of 100</span>
          </div>
          <ul className="mt-2.5 flex flex-col gap-2">
            {h.contributions.map((c) => {
              const isWeakest = c.label === h.weakest;
              return (
                <li key={c.label}>
                  <div className="flex items-baseline gap-2 text-[13px]">
                    <span className={isWeakest ? "font-semibold" : ""}>{c.label}</span>
                    {isWeakest && <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: TONE.bad }}>weakest</span>}
                    <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-muted">+{c.points}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-soft">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${(c.points / Math.max(...h.contributions!.map((x) => x.points))) * 100}%`,
                        background: isWeakest ? TONE.bad : TONE.purple,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[12px] text-faint">{SCORE_SOURCES[c.label]}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] leading-snug text-faint">
            Computed from your own Pulse, Feed, Campaigns and Recognition data — not a benchmark
            and not a constant. Change any of them and this moves.
          </p>
        </div>
      )}
    </Card>
  );
}
const WIN: Record<string, number> = { "7 days": 5, "30 days": 9, "Quarter": 12 };
function TrendCard({ v, period, className = "" }: { v: PulseView; period: string; className?: string }) {
  const t = v.trend;
  const n = WIN[period] ?? t.series.length;
  const series = t.series.slice(-n);
  const benchmark = t.benchmark.slice(-n);
  const months = t.months.slice(-n);
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div><Eyebrow>Engagement · {period}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Trend vs benchmark</h2></div>
        <div className="flex items-center gap-3 text-[12px] text-faint"><span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: TONE.purple }} /> Us</span><span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-line" /> Benchmark</span></div>
      </div>
      <Figure label={`Engagement trend vs benchmark over ${period}`} explain group>
        <TrendChart series={series} benchmark={benchmark} labels={months} seriesLabel={v.scope} benchLabel="Benchmark" caption={`Engagement vs benchmark, last ${n} months`} color={TONE.purple} height={190} id="eng" className="mt-4" />
      </Figure>
      <div className="mt-1 flex justify-between text-[12px] text-faint">{months.filter((_, i) => months.length <= 6 || i % 2 === 0).map((m) => <span key={m}>{m}</span>)}</div>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-soft p-3.5 text-[14px] leading-relaxed text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--purple)]" /><span className="flex-1">{t.insight}</span></div>
      <div className="mt-3 flex justify-end"><AnalyticsLink metric="engagement" /></div>
    </Card>
  );
}
function KpiRow({ v, className = "" }: { v: PulseView; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 xl:grid-cols-4 ${className}`}>
      {v.signals.map((s) => {
        const t = toneOf(s.tone);
        return (
          <div key={s.title} className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between"><span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{s.title}</span><span className="text-[12px] font-bold" style={{ color: t }}>{s.delta}</span></div>
            <div className="mt-1 text-[22px] font-bold tracking-tight">{s.value}</div>
            <Figure label={`${s.title} trend`}><Sparkline values={s.spark} color={t} id={`kpi-${s.title}`} height={26} className="mt-1" /></Figure>
            <div className="mt-1 text-[12px] text-faint">{s.note} · vs last period</div>
          </div>
        );
      })}
    </div>
  );
}
function ActionQueueCard({ className = "" }: { className?: string }) {
  const [done, setDone] = usePersistentState<number[]>("vadal:pulse-actions", []);
  const TONE_MAP: Record<string, string> = { urgent: TONE.bad, warn: TONE.warn, normal: TONE.purple };
  const closed = actionProgress.closed + done.length;
  const open = actionQueue.filter((_, i) => !done.includes(i));
  function close(i: number) { if (done.includes(i)) return; setDone([...done, i]); toast("Action closed — routed to Cases ✓"); }
  return (
    <Card className={className}>
      <div className="flex items-end justify-between"><div><Eyebrow>Act now</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Action queue</h2></div><span className="text-[12px] font-medium text-faint">{closed}/{actionProgress.total} closed</span></div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--purple)] transition-[width] duration-500" style={{ width: `${(closed / actionProgress.total) * 100}%` }} /></div>
      {open.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center"><Check className="h-7 w-7 text-[var(--purple)]" /><p className="text-[14px] font-semibold">All caught up</p><p className="text-[14px] text-faint">No open actions right now.</p></div>
      ) : (
        <ul className="mt-3 grid flex-1 gap-2.5 sm:grid-cols-2">
          {actionQueue.map((a, i) => done.includes(i) ? null : (
            <li key={a.title} className="flex items-start gap-3 rounded-2xl border border-line p-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE_MAP[a.tone] ?? TONE.purple }} />
              <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold leading-snug">{a.title}</div><div className="mt-0.5 text-[12px] text-faint">{a.context} · due {a.due}</div></div>
              <Button variant="tertiary" size="sm" onClick={() => close(i)}>Close</Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
function BusinessImpactStrip({ isTeam = false }: { isTeam?: boolean }) {
  const corr: [string, string][] = [[impact.attritionCorr, "↔ Attrition"], [impact.productivityCorr, "↔ Productivity"], [impact.revenueCorr, "↔ Revenue"]];
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[#141419] p-7 text-white shadow-[0_18px_44px_-22px_rgba(0,0,0,0.5)] sm:p-8 dark:ring-1 dark:ring-white/[0.08]">
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 70%, transparent 78%)" }} aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div><p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Business impact {isTeam && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[12px] font-semibold normal-case tracking-normal text-zinc-300">Org-wide</span>}</p><h2 className="mt-1.5 text-[20px] font-bold tracking-tight">Engagement moves the business</h2></div>
        <div className="flex gap-2.5">
          {corr.map(([val, l]) => <div key={l} className="rounded-2xl bg-white/[0.06] px-4 py-2 text-center ring-1 ring-white/[0.08]"><div className="text-[20px] font-bold" style={{ color: val.startsWith("-") || val.startsWith("−") ? "#5eead4" : "#a5b4fc" }}>{val}</div><div className="text-[12px] text-zinc-400">{l}</div></div>)}
          <div className="rounded-2xl bg-white/[0.06] px-4 py-2 text-center ring-1 ring-white/[0.08]"><div className="text-[20px] font-bold">{impact.roi}</div><div className="text-[12px] text-zinc-400">ROI</div></div>
        </div>
      </div>
      <p className="relative mt-4 max-w-3xl text-[14px] leading-relaxed text-zinc-300"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#818cf8]" />{impact.insight} · saves {impact.attritionCost}/yr in attrition.</p>
    </section>
  );
}
function VoiceCard({ v, className = "" }: { v: PulseView; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Employee voice" title={`${v.voice.comments.toLocaleString()} comments`} action={<Link href="/product/sentiment" className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5">Open Sentiment <ArrowUpRight className="h-3 w-3" /></Link>} />
      <Figure label={`Sentiment: ${v.voice.mood.map((m) => `${m.label} ${m.pct}%`).join(", ")}`} className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {v.voice.mood.map((m) => <span key={m.label} style={{ width: `${m.pct}%`, background: m.color }} />)}
      </Figure>
      <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-faint">{v.voice.mood.map((m) => <span key={m.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.label} {m.pct}%</span>)}</div>
      <ul className="mt-4 space-y-2">
        {v.voice.themes.map((t) => <li key={t.name} className="flex items-center justify-between text-[14px]"><span className="font-medium">{t.name}</span><span className="flex items-center gap-2 text-[12px] text-faint"><span>{t.mentions}</span><span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: soft(toneOf(t.tone)), color: toneOf(t.tone) }}>{t.tag}</span></span></li>)}
      </ul>
      <blockquote className="mt-4 rounded-2xl border-l-2 border-[var(--purple)] bg-soft p-3.5 text-[14px] leading-relaxed text-muted">“{v.voice.quote.text}”<cite className="mt-1.5 block text-[12px] not-italic text-faint">{v.voice.quote.meta}</cite></blockquote>
    </Card>
  );
}
function CampaignsCard({ isTeam = false, className = "" }: { isTeam?: boolean; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Campaigns" title="Are interventions working" action={<div className="flex items-center gap-2"><OrgWideTag show={isTeam} /><Explore q="Which campaigns drove the most engagement lift?" /></div>} />
      <ul className="mt-4 flex-1 space-y-3">
        {campaigns.map((c) => <li key={c.name} className="rounded-2xl border border-line p-3"><div className="flex items-center justify-between"><span className="text-[14px] font-semibold">{c.name}</span><span className="rounded-full px-2 py-0.5 text-[12px] font-bold" style={{ background: soft(TONE.good), color: TONE.good }}>{c.lift} pts</span></div><div className="mt-1 text-[12px] text-faint">{c.audience}</div><div className="mt-2 flex items-center gap-2"><span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${c.participation}%` }} /></span><span className="text-[12px] font-medium text-muted">{c.participation}% joined</span></div></li>)}
      </ul>
    </Card>
  );
}
function AttritionCard({ v, className = "" }: { v: PulseView; className?: string }) {
  const seg = v.attrition.segmentation;
  const totalSeg = seg.reduce((s, x) => s + x.count, 0) || 1;
  return (
    <Card className={className}>
      <CardHead eyebrow="Attrition & risk" title="Predicted attrition" action={<span className="flex items-center gap-1.5"><span className="text-[22px] font-bold tracking-tight">{v.attrition.predicted}</span><Trend direction={v.attrition.predictedDelta.startsWith("−") || v.attrition.predictedDelta.startsWith("-") ? "down" : "up"} value={v.attrition.predictedDelta.replace(/[+−-]/, "")} /></span>} />
      <Figure label={`Risk segmentation: ${seg.map((s) => `${s.level} ${s.count}`).join(", ")}`} className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {seg.map((s) => <span key={s.level} style={{ width: `${(s.count / totalSeg) * 100}%`, background: s.color }} />)}
      </Figure>
      <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-faint">{seg.map((s) => <span key={s.level} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.level} {s.count}</span>)}</div>
      <Eyebrow>Top drivers</Eyebrow>
      <ul className="mt-2 space-y-1.5">
        {v.attrition.drivers.map((d) => <li key={d.label} className="flex items-center gap-3 text-[14px]"><span className="w-40 shrink-0 truncate">{d.label}</span><span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${d.pct * 2.5}%` }} /></span><span className="w-8 text-right text-[12px] text-faint">{d.pct}%</span></li>)}
      </ul>
    </Card>
  );
}
const LEVEL_TONE: Record<RiskLevel, BadgeTone> = { Serious: "danger", "Under strain": "warning", Watch: "neutral" };

/* Risk, at the level it can honestly be read: a team and a reason. The old
   version of this card named people and gave each a confidence score, which is
   the one thing Trust promises this product never does — and it made managers
   manage the list instead of the rota underneath it. */
function TeamRiskCard({ v, className = "" }: { v: PulseView; className?: string }) {
  const rows = v.isTeam ? teamRisk.filter((t) => t.team.split("·")[0].trim() === v.scope) : teamRisk;
  return (
    <Card className={className}>
      <CardHead eyebrow="Risk intelligence" title="Where the risk is" action={<span className="text-[12px] font-medium text-faint">{riskStats.serious} serious · {rows.length} teams watched</span>} />
      {rows.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center">
          <Check className="h-7 w-7" style={{ color: TONE.good }} />
          <p className="text-[14px] font-semibold">Nothing under strain</p>
          <p className="text-[14px] text-faint">No team in {v.scope} is showing a pattern worth acting on.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {rows.map((t) => (
            <li key={t.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold text-ink">{t.team}</p>
                  <Badge tone={LEVEL_TONE[t.level]} variant="soft" size="sm">{t.level}</Badge>
                </div>
                <p className="mt-0.5 text-[13px] text-faint">{t.people.toLocaleString("en-US")} people · {t.leftSix}% left in six months</p>
                <p className="mt-1.5 text-[13px] leading-snug text-muted">{t.changed}</p>
              </div>
              <div className="min-w-0 text-[13px]">
                <ul className="flex flex-wrap gap-1.5">
                  {t.drivers.map((d) => <li key={d} className="rounded-full border border-line px-2.5 py-1 text-[13px] text-muted">{d}</li>)}
                </ul>
                <p className="mt-2 flex items-start gap-1.5 leading-snug text-ink">
                  <ArrowRight className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--purple)]" strokeWidth={2.5} />
                  <span>{t.action} <span className="text-faint">· {t.owner}</span></span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-[13px] text-faint">
        {riskPromise.map((r) => <li key={r} className="flex items-start gap-2"><Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" />{r}</li>)}
      </ul>
    </Card>
  );
}

/* ════════════════════════ succession ════════════════════════ */
const READY_TONE: Record<Readiness, BadgeTone> = { "Ready now": "success", "1–2 years": "info", "No cover": "danger" };

function SuccessionCards() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          ["Critical roles", `${successionStats.roles}`, "the ones that stop work if they empty"],
          ["Covered today", `${successionStats.covered}`, "someone ready now"],
          ["No cover at all", `${successionStats.noCover}`, successionStats.noCover ? "one person, one process" : "every role has a name"],
          ["People on the bench", `${successionStats.bench}`, "named by People, after a conversation"],
        ] as [string, string, string][]).map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHead eyebrow="Succession intelligence" title="If this person left on Friday" />
        <p className="mt-1 max-w-[700px] text-[13px] text-faint">{successionRule}</p>
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {criticalRoles.map((r) => {
            const covered = r.successors.some((s) => s.readiness === "Ready now");
            return (
              <li key={r.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.holderImg} name={r.holder} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">{r.role}</p>
                      <p className="truncate text-[13px] text-faint">{r.holder} · {r.team}</p>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-muted">{r.whyCritical}</p>
                </div>
                <div className="min-w-0">
                  {r.successors.length === 0 ? (
                    <p className="flex items-start gap-2 text-[13px] font-semibold text-ink">
                      <Badge tone="danger" variant="soft" size="sm">No cover</Badge>
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {r.successors.map((sx) => (
                        <li key={sx.name} className="flex items-start gap-2.5">
                          <Avatar src={sx.img} name={sx.name} size="sm" />
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink">
                              {sx.name} <Badge tone={READY_TONE[sx.readiness]} variant="soft" size="sm">{sx.readiness}</Badge>
                            </p>
                            <p className="text-[13px] leading-snug text-muted">{sx.note}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className={`mt-2 text-[13px] leading-snug ${covered ? "text-faint" : "text-ink"}`}>{r.gap}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

/* ════════════════════════ recommendations ════════════════════════ */
const CONF_TONE: Record<Confidence, BadgeTone> = { High: "success", Medium: "info", Low: "neutral" };

function RecommendationCards() {
  const [done, setDone] = usePersistentState<string[]>("vadal:insight-recs-done", []);
  const open = recommendations.filter((r) => !done.includes(r.id));
  return (
    <>
      <Card>
        <CardHead eyebrow="Recommendations" title="The next move, and the numbers behind it" action={<span className="text-[12px] font-medium text-faint">{open.length} open · {recStats.high} we would bet on</span>} />
        {open.length === 0 ? (
          <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center">
            <Check className="h-7 w-7" style={{ color: TONE.good }} />
            <p className="text-[14px] font-semibold">Nothing outstanding</p>
            <p className="text-[14px] text-faint">Every recommendation has been picked up. New ones appear as the data moves.</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {open.map((r) => (
              <li key={r.id} className="rounded-[22px] border border-line p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 text-[16px] font-bold tracking-tight text-ink">{r.title}</p>
                  <Badge tone={CONF_TONE[r.confidence]} variant="soft" size="sm">{r.confidence} confidence</Badge>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5 text-[14px] text-muted">
                  {r.because.map((b) => <li key={b} className="flex items-start gap-2"><span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--purple)]" />{b}</li>)}
                </ul>
                <div className="mt-3 grid gap-3 text-[13px] sm:grid-cols-2">
                  <p className="text-ink"><span className="text-faint">Expect: </span>{r.expect}</p>
                  <p className="text-ink"><span className="text-faint">Takes: </span>{r.effort} · {r.owner}</p>
                  <p className="text-muted"><span className="text-faint">Why that confidence: </span>{r.basis}</p>
                  <p className="text-muted"><span className="text-faint">What would change our mind: </span>{r.changeMind}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link href={r.action.href}><Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0">{r.action.label}</Button></Link>
                  <button onClick={() => { setDone((d) => [...d, r.id]); toast("Picked up — it comes back if the numbers do"); }} className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-ink lg:min-h-[36px]">
                    Mark as picked up
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHead eyebrow="Deliberately not" title="What we are not recommending" />
        <ul className="mt-3 flex flex-col gap-3 text-[14px] text-muted">
          {notRecommending.map((n) => (
            <li key={n} className="flex items-start gap-2"><X className="mt-[3px] h-4 w-4 shrink-0" style={{ color: TONE.bad }} />{n}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function RecognitionCard({ v, className = "" }: { v: PulseView; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Recognition & culture" title={`${v.recognition.total.toLocaleString()} kudos`} action={<Heart className="h-4 w-4 text-[var(--purple)]" />} />
      <div className="mt-3 grid grid-cols-3 divide-x divide-line">
        {[[`${v.recognition.coverage}%`, "Coverage"], [`${recognitionExtra.peer}/${recognitionExtra.manager}`, "Peer / mgr"], [gamification.streaks.toLocaleString(), "Streaks"]].map(([val, l]) => <div key={l} className="px-2 text-center first:pl-0 last:pr-0"><div className="text-[18px] font-bold tracking-tight">{val}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
      </div>
      <Eyebrow>Top recognisers</Eyebrow>
      <ul className="mt-2 space-y-2">
        {v.recognition.leaders.map((p, i) => <li key={p.name} className="flex items-center gap-3"><span className="w-4 text-[12px] font-bold text-faint">{i + 1}</span><Avatar src={p.img} name={p.name} size="sm" /><div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{p.name}</div><div className="truncate text-[12px] text-faint">{p.team}</div></div><span className="text-[14px] font-bold tabular-nums">{p.given}</span></li>)}
      </ul>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-soft p-3 text-[12px] text-muted"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: TONE.warn }} /><span>Cold zones: {recognitionExtra.lowZones.join(" · ")}</span></div>
    </Card>
  );
}
function DepartmentsCard({ scope, className = "" }: { scope: string; className?: string }) {
  const sorted = [...departments].sort((a, b) => b.score - a.score);
  const max = Math.max(...departments.map((d) => d.score));
  return (
    <Card className={className}>
      <CardHead eyebrow="By team" title="Department health" action={<AnalyticsLink metric="engagement" dim="team" label="Compare in Explore" />} />
      <ul className="mt-4 space-y-2.5">
        {sorted.map((d) => {
          const dim = scope !== ALL_TEAMS && d.name !== scope;
          return (
            <li key={d.name} className={`flex items-center gap-3 transition ${dim ? "opacity-40" : ""}`}>
              <span className="w-24 shrink-0 truncate text-[14px] font-medium">{d.name}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(d.score / max) * 100}%`, background: band(d.score) }} /></span>
              <span className="w-7 shrink-0 text-right text-[14px] font-bold tabular-nums">{d.score}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
function ManagersCard({ v, onOpen, className = "" }: { v: PulseView; onOpen: (m: PulseView["managers"][number]) => void; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Manager practice" title="What managers are doing" action={<span className="text-[12px] text-faint">{managerSummary.closureRate}% of 1:1s held</span>} />
      <p className="mt-1 text-[13px] text-faint">Practice, not a rating: 1:1s held, kudos given, and the team&rsquo;s own score — which belongs to the team, not to the person managing it.</p>
      <div className="mt-4 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Manager", "Team score", "1:1s held", "Kudos given", ""].map((h, i) => <th key={i} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {v.managers.map((m) => (
              <tr key={m.name} tabIndex={0} onClick={() => onOpen(m)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(m); }} className="cursor-pointer border-t border-line outline-none transition hover:bg-soft focus-visible:bg-soft">
                <td className="px-2 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={m.img} name={m.name} size="sm" /><div className="min-w-0"><div className="truncate text-[14px] font-semibold">{m.name}</div><div className="truncate text-[12px] text-faint">{m.team}</div></div></div></td>
                <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{m.score}</td>
                <td className="px-2 py-2.5 text-[14px] tabular-nums text-muted">{m.closure}%</td>
                <td className="px-2 py-2.5 text-[14px] tabular-nums text-muted">{m.recognition}</td>
                <td className="px-2 py-2.5 text-right"><ArrowUpRight className="h-4 w-4 text-faint" /></td>
              </tr>
            ))}
            {v.managers.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-[14px] text-faint">No managers in {v.scope}.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
/* ════════════════════════ Adoption — points-independent ════════════════════════
   Whether people use Vadal, counted from what they did — opened it, checked in,
   posted, asked — never from points, so it reads the same in a workspace with
   points switched off. First-class: a strip on Overview, a full tab here. */
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`);

function AdoptionTile({ label, value, note, change, spark, id }: { label: string; value: string; note: string; change?: number; spark?: number[]; id: string }) {
  return (
    <div className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted">{label}</span>
        {change !== undefined && (
          <span className="text-[12px] font-semibold tabular-nums" style={{ color: change > 0 ? TONE.good : change < 0 ? TONE.bad : "var(--faint)" }}>
            {change > 0 ? "+" : change < 0 ? "−" : ""}{Math.abs(change)} pts
          </span>
        )}
      </div>
      <div className="mt-1 text-[24px] font-bold tracking-tight">{value}</div>
      {spark && <Figure label={`${label} over the last 12 weeks`}><Sparkline values={spark} color="var(--viz-1)" id={`adopt-${id}`} height={26} className="mt-1" /></Figure>}
      <div className="mt-1 text-[12px] leading-snug text-faint">{note}</div>
    </div>
  );
}

function AdoptionTiles({ a, className = "" }: { a: AdoptionView; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 xl:grid-cols-4 ${className}`}>
      <AdoptionTile id="active" label="Weekly active" value={`${a.weeklyActive.pct}%`} change={a.weeklyActive.change4w} spark={a.series.activeFull} note={`${a.weeklyActive.count.toLocaleString("en-US")} of ${a.people.toLocaleString("en-US")} people opened Vadal this week`} />
      <AdoptionTile id="checkin" label="Checked in this week" value={`${a.checkedIn.pct}%`} change={a.checkedIn.change4w} spark={a.series.checkinFull} note={`${a.checkedIn.count.toLocaleString("en-US")} people did the daily check-in at least once`} />
      <AdoptionTile id="sticky" label="Daily / monthly" value={`${a.stickiness.pct}%`} note={`${fmtK(a.stickiness.daily)} on a typical day of ${fmtK(a.stickiness.monthly)} active this month`} />
      <AdoptionTile id="activated" label="Activated" value={`${a.activated.pct}%`} note={`${a.activated.count.toLocaleString("en-US")} have signed in at least once`} />
    </div>
  );
}

/** Overview: adoption sits beside the other headline signals, not a tab away. */
function AdoptionStrip({ a, onOpen }: { a: AdoptionView; onOpen: () => void }) {
  return (
    <section aria-label="Adoption" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Eyebrow>Adoption</Eyebrow>
          <p className="mt-1 text-[14px] text-muted">Are people using it? Counted from what they did, not from points. Change is over the last 4 weeks.</p>
        </div>
        <button onClick={onOpen} className="flex min-h-[44px] items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5 lg:min-h-0">See adoption <ArrowRight className="h-3 w-3" /></button>
      </div>
      <AdoptionTiles a={a} />
    </section>
  );
}

function AdoptionTrendCard({ a, period, className = "" }: { a: AdoptionView; period: string; className?: string }) {
  const [table, setTable] = React.useState(false);
  const series = [
    { key: "active", label: "Weekly active", color: "var(--viz-1)", values: a.series.active },
    { key: "checkin", label: "Checked in", color: "var(--viz-2)", values: a.series.checkin },
  ];
  return (
    <Card className={className}>
      <CardHead eyebrow={`Adoption · ${period}`} title="Weekly active and check-ins" action={<ViewToggle table={table} onChange={setTable} label="Weekly active and check-ins" />} />
      <p className="mt-1 text-[14px] text-muted">Share of {a.isTeam ? a.scope : "everyone"}, per week.</p>
      <div className="mt-4"><Legend series={series} shape="line" /></div>
      <div className="mt-3">
        <LineChart
          labels={a.series.labels} series={series} unit="%" domain={[Math.min(40, ...a.series.checkin), 100]} height={230} table={table}
          caption={`Weekly active and checked-in share of ${a.isTeam ? a.scope : "everyone"}, last ${a.weeks} weeks`}
          tooltipTitle={(l) => `Week of ${l}`}
        />
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-soft p-3.5 text-[14px] leading-relaxed text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--purple)]" /><span className="flex-1">{a.readings.trend}</span></div>
      <div className="mt-3 flex justify-end"><AnalyticsLink metric="weeklyActive" /></div>
    </Card>
  );
}

function ProfilesCard({ a, className = "" }: { a: AdoptionView; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Desk and frontline" title={a.profiles.length === 2 ? "Who is using it" : `${a.scope} is a ${a.profiles[0].label.toLowerCase()} team`} />
      <div className="mt-4 flex flex-col gap-5">
        <div>
          <p className="text-[13px] font-semibold text-ink">Weekly active</p>
          <div className="mt-2"><BarList caption="Weekly active by profile" max={100} unit="%" rows={a.profiles.map((p) => ({ label: p.label, value: p.weeklyActive, note: `${p.people.toLocaleString("en-US")} people` }))} /></div>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">Checked in this week</p>
          <div className="mt-2"><BarList caption="Checked in by profile" max={100} unit="%" rows={a.profiles.map((p) => ({ label: p.label, value: p.checkedIn }))} /></div>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">{a.readings.profile}</p>
    </Card>
  );
}

function TeamsAdoptionCard({ a, className = "" }: { a: AdoptionView; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="By team" title="Where it's landing" action={<OrgWideTag show={a.isTeam} />} />
      <p className="mt-1 text-[14px] text-muted">Lowest weekly active first. Change is over the last 4 weeks.</p>
      <div className="-mx-1 mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[12px] text-faint">
              <th scope="col" className="px-1 pb-2 font-semibold">Team</th>
              <th scope="col" className="px-1 pb-2 text-right font-semibold">People</th>
              <th scope="col" className="px-1 pb-2 text-right font-semibold">Weekly active</th>
              <th scope="col" className="px-1 pb-2 text-right font-semibold">Change</th>
              <th scope="col" className="px-1 pb-2 text-right font-semibold">Checked in</th>
              <th scope="col" className="px-1 pb-2 text-right font-semibold">On a typical day</th>
            </tr>
          </thead>
          <tbody>
            {a.byTeam.map((t) => {
              const mine = a.isTeam && t.team === a.scope;
              return (
                <tr key={t.team} className={`border-t border-line ${mine ? "bg-[var(--lav)]" : ""}`}>
                  <th scope="row" className="px-1 py-2.5 text-left font-medium text-ink">{t.team}</th>
                  <td className="px-1 py-2.5 text-right tabular-nums text-muted">{t.headcount.toLocaleString("en-US")}</td>
                  <td className="px-1 py-2.5 text-right font-semibold tabular-nums text-ink">{t.weeklyActive}%</td>
                  <td className="px-1 py-2.5 text-right font-semibold tabular-nums" style={{ color: t.change4w > 0 ? TONE.good : t.change4w < 0 ? TONE.bad : "var(--faint)" }}>
                    {t.change4w > 0 ? "▲ " : t.change4w < 0 ? "▼ " : ""}{t.change4w === 0 ? "flat" : `${Math.abs(t.change4w)} pts`}
                  </td>
                  <td className="px-1 py-2.5 text-right tabular-nums text-muted">{t.checkedIn}%</td>
                  <td className="px-1 py-2.5 text-right tabular-nums text-muted">{t.dailyActivePct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-soft p-3.5 text-[14px] leading-relaxed text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--purple)]" /><span className="flex-1">{a.readings.team}</span></div>
    </Card>
  );
}

function ComeBackCard({ a, className = "" }: { a: AdoptionView; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="What brings people back" title="Used this week" action={<Explore q={`What brings people back to Vadal${a.isTeam ? ` in ${a.scope}` : ""}, and what should we build on?`} />} />
      <p className="mt-1 text-[14px] text-muted">Share of weekly-active people who used each part of Vadal.</p>
      <div className="mt-4"><BarList caption="Share of weekly-active people who used each part" max={100} unit="%" rows={a.surfaces} /></div>
    </Card>
  );
}

function KnowledgeCard({ isTeam = false, className = "" }: { isTeam?: boolean; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Knowledge & AI" title="What people ask" action={<div className="flex items-center gap-2"><OrgWideTag show={isTeam} /><Explore q="What knowledge gaps should we close first?" /></div>} />
      <div className="mt-3 grid grid-cols-2 gap-3">{[[aiUsage.questions, "AI questions"], [`${aiUsage.resolved}%`, "Self-resolved"]].map(([val, l]) => <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[18px] font-bold tracking-tight">{val}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}</div>
      <ul className="mt-3 space-y-1.5">{knowledge.topQueries.slice(0, 3).map((q) => <li key={q.q} className="flex items-center justify-between text-[14px]"><span className="truncate">{q.q}</span><span className="text-[12px] text-faint">{q.n}</span></li>)}</ul>
      <div className="mt-auto flex items-start gap-2 rounded-2xl bg-soft p-3 text-[12px] text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--purple)]" /><span>{aiUsage.signal}</span></div>
    </Card>
  );
}

/* ════════════════════════ drill-down drawer ════════════════════════ */
type Detail = { kind: "manager"; data: PulseView["managers"][number] };

function DetailDrawer({ detail, onClose }: { detail: Detail | null; onClose: () => void }) {
  return (
    <Drawer open={detail !== null} title="Details" onClose={onClose}>
      {detail && <ManagerDetail m={detail.data} onClose={onClose} />}
    </Drawer>
  );
}
function DrawerActions({ actions }: { actions: string[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {actions.map((a) => <li key={a} className="flex items-start gap-2.5 rounded-2xl border border-line p-3 text-[14px]"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--lav)] text-[var(--purple)]"><ArrowRight className="h-2.5 w-2.5" strokeWidth={3} /></span>{a}</li>)}
    </ul>
  );
}
function ManagerDetail({ m, onClose }: { m: PulseView["managers"][number]; onClose: () => void }) {
  const actions: string[] = [];
  if (m.closure < 75) actions.push("Lift 1:1 completion above 80%");
  if (m.recognition < 20) actions.push("Increase recognition cadence");
  if (m.closure >= 85 && m.recognition >= 35) actions.push("Capture what's working as a team playbook");
  if (actions.length < 2) actions.push("Hold a team listening session");
  function createCase() { toast(`Coaching plan created for ${m.name} ✓`); onClose(); }
  return (
    <>
      <Eyebrow>Manager detail</Eyebrow>
      <div className="mt-3 flex items-center gap-3.5">
        <Avatar src={m.img} name={m.name} size="lg" />
        <div className="min-w-0"><h2 className="text-[20px] font-bold tracking-tight">{m.name}</h2><p className="text-[14px] text-muted">{m.team}</p></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[[`${m.score}`, "Team score"], [`${m.closure}%`, "1:1s held"], [`${m.recognition}`, "Kudos given"]].map(([val, l]) => <div key={l} className="rounded-2xl border border-line p-3 text-center"><div className="text-[18px] font-bold tabular-nums">{val}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
      </div>
      <h3 className="mt-5 text-[14px] font-bold">Coaching focus</h3>
      <DrawerActions actions={actions} />
      <div className="mt-6 flex items-center gap-2.5">
        <Button variant="brand" onClick={createCase}>Create coaching plan</Button>
        <Link href="/product/managers"><Button variant="secondary">Open Manager hub</Button></Link>
      </div>
    </>
  );
}

/* ════════════════════════ tabs + compose ════════════════════════ */
const TABS = ["Overview", "Engagement", "Risk", "Succession", "Recommendations", "Recognition", "Managers", "Adoption"] as const;
type Tab = (typeof TABS)[number];

export function PulseDashboard() {
  // A manager sees their own team only (brief §9: "View team-level Pulse
  // dashboard — Manager: Own team"). The scope control is replaced by a static
  // label rather than a select with one option, and the stored scope is ignored
  // so a value left over from an admin session cannot widen the view.
  const { scope: dataScope, team: myTeam, ready: scopeReady } = useScope("Insight");
  const [tab, setTab] = React.useState<Tab>("Overview");
  const [storedScope, setScope] = usePersistentState<string>("vadal:pulse-scope", ALL_TEAMS);
  const [period, setPeriod] = usePersistentState<string>("vadal:pulse-period", "30 days");
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const pinned = dataScope === "own-team" && myTeam ? myTeam : null;
  const scope = pinned ?? storedScope;
  const view = React.useMemo(() => derivePulse(scope, period), [scope, period]);
  const adoption = React.useMemo(() => deriveAdoption(scope, period), [scope, period]);
  const scopes = [ALL_TEAMS, ...departments.map((d) => d.name)];

  return (
    <div className="flex flex-col gap-6">
      {scopeReady && pinned && <ScopeNotice team={pinned} what="people intelligence" />}
      <Briefing v={view} setTab={(t) => setTab(t as Tab)} period={period} setPeriod={setPeriod} />

      {/* tabs + scope */}
      <div className="sticky top-[57px] z-10 -mx-2 flex flex-wrap lg:top-0 items-center justify-between gap-3 border-b border-line bg-canvas/85 px-2 py-2 backdrop-blur-md">
        <div role="tablist" aria-label="Insight sections" className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-[44px] rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition lg:min-h-0 ${tab === t ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href={analyticsHref("engagement")} className="hidden items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5 sm:flex">Slice it in Explore <ArrowUpRight className="h-3 w-3" /></Link>
          {pinned ? (
            <span className="flex items-center gap-2 text-[12px] text-faint">Scope
              <span className="rounded-full border border-line bg-soft px-3 py-1.5 text-[14px] font-medium text-ink">{pinned}</span>
            </span>
          ) : (
            <label className="flex items-center gap-2 text-[12px] text-faint">Scope
              <select value={scope} onChange={(e) => setScope(e.target.value)} className="min-h-[44px] rounded-full border border-line bg-card px-3 py-1.5 text-[14px] font-medium text-ink outline-none transition hover:border-faint/40 lg:min-h-[36px]">
                {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>

      {tab === "Overview" && (<>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><HealthCard v={view} className="xl:col-span-4" /><TrendCard v={view} period={period} className="xl:col-span-8" /></div>
        <KpiRow v={view} />
        <AdoptionStrip a={adoption} onOpen={() => setTab("Adoption")} />
        <ActionQueueCard />
        <BusinessImpactStrip isTeam={view.isTeam} />
      </>)}

      {tab === "Engagement" && (<>
        <TrendCard v={view} period={period} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><VoiceCard v={view} className="xl:col-span-7" /><CampaignsCard isTeam={view.isTeam} className="xl:col-span-5" /></div>
      </>)}

      {tab === "Risk" && (<>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><AttritionCard v={view} className="xl:col-span-5" /><TeamRiskCard v={view} className="xl:col-span-7" /></div>
      </>)}

      {tab === "Succession" && (<>
        <SuccessionCards />
      </>)}

      {tab === "Recommendations" && (<>
        <RecommendationCards />
      </>)}

      {tab === "Recognition" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><RecognitionCard v={view} className="xl:col-span-5" /><DepartmentsCard scope={scope} className="xl:col-span-7" /></div>
      )}

      {tab === "Managers" && (<>
        <ManagersCard v={view} onOpen={(m) => setDetail({ kind: "manager", data: m })} />
        <DepartmentsCard scope={scope} />
      </>)}

      {tab === "Adoption" && (<>
        <AdoptionTiles a={adoption} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><AdoptionTrendCard a={adoption} period={period} className="xl:col-span-8" /><ProfilesCard a={adoption} className="xl:col-span-4" /></div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><TeamsAdoptionCard a={adoption} className="xl:col-span-7" /><ComeBackCard a={adoption} className="xl:col-span-5" /></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:items-start"><KnowledgeCard isTeam={view.isTeam} /></div>
      </>)}

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
