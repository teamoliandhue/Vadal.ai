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
  ArrowUpRight, ArrowRight, Check, Heart, Sparkles, TriangleAlert,
} from "lucide-react";
import { Avatar, Badge, Button, SparkMark, Trend, type BadgeTone } from "@vadal/design-system";
import { ArcGauge, Sparkline, TrendChart } from "@/components/charts";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import {
  org, actionQueue, actionProgress,
  recognitionExtra, departments, managerSummary, gamification,
  campaigns, impact, knowledge, aiUsage,
} from "@/lib/data";
import { derivePulse, ALL_TEAMS, type PulseView } from "./derive";

const TONE = { good: "#2f9e6e", bad: "#dc4a44", warn: "#d68a1e", purple: "#6d5df0" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const toneOf = (t: string) => t === "good" ? TONE.good : t === "bad" ? TONE.bad : t === "warn" ? TONE.warn : TONE.purple;
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
  return <button onClick={() => ask(q)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5">Explore <ArrowRight className="h-3 w-3" /></button>;
}
function AnalyticsLink({ metric, dim = "team", label = "Slice in Analytics" }: { metric: string; dim?: string; label?: string }) {
  return <Link href={analyticsHref(metric, dim)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5">{label} <ArrowUpRight className="h-3 w-3" /></Link>;
}
/* Honest marker for cards that stay org-level even when a team scope is active. */
function OrgWideTag({ show }: { show: boolean }) {
  return show ? <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-faint">Org-wide</span> : null;
}
/* accessible chart wrapper — gives screen readers a text alternative for the aria-hidden svgs.
   When `explain`, a hover "Explain" pill asks Vadal about the chart in context. */
function Figure({ label, children, className = "", explain = false }: { label: string; children: React.ReactNode; className?: string; explain?: boolean }) {
  return (
    <div role="img" aria-label={label} className={`${explain ? "group relative" : ""} ${className}`}>
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
          <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">People intelligence</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
            <span className="text-[20px] font-bold tracking-tight text-ink">{h.score}</span>
            <Trend direction={h.delta >= 0 ? "up" : "down"} value={String(Math.abs(h.delta))} />
            <span>· {h.benchmarkDelta >= 0 ? "+" : ""}{h.benchmarkDelta} vs benchmark · {h.percentile} of GCC</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${period === p ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p}</button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] text-faint">Synced 9:12 AM</span>
            <Button variant="brand" size="sm" leadingIcon={<Sparkles className="h-4 w-4" />} onClick={() => ask(`Give me today's people-intelligence report for ${v.scope}`)}>AI report</Button>
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
                <Button variant="secondary" size="sm" onClick={() => setTab(b.to)}>{b.label}</Button>
                <button onClick={() => ask(b.text)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] hover:underline"><Sparkles className="h-3 w-3" /> Why</button>
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
        {h.drivers.map((d) => <span key={d.label} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: `${toneOf(d.tone)}1a`, color: d.tone === "neutral" ? "var(--muted)" : toneOf(d.tone) }}>{d.label}</span>)}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">{h.narrative}</p>
    </Card>
  );
}
const WIN_PTS: Record<string, number> = { "7 days": 5, "30 days": 9, "Quarter": 14 };
const WIN_MO: Record<string, number> = { "7 days": 4, "30 days": 7, "Quarter": 12 };
function TrendCard({ v, period, className = "" }: { v: PulseView; period: string; className?: string }) {
  const t = v.trend;
  const n = WIN_PTS[period] ?? t.series.length;
  const series = t.series.slice(-n);
  const benchmark = t.benchmark.slice(-n);
  const months = t.months.slice(-(WIN_MO[period] ?? t.months.length));
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div><Eyebrow>Engagement · {period}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Trend vs benchmark</h2></div>
        <div className="flex items-center gap-3 text-[12px] text-faint"><span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: TONE.purple }} /> Us</span><span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-line" /> Benchmark</span></div>
      </div>
      <Figure label={`Engagement trend vs benchmark over ${period}`} explain>
        <TrendChart series={series} benchmark={benchmark} color={TONE.purple} height={190} id="eng" className="mt-4" />
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
        {v.voice.themes.map((t) => <li key={t.name} className="flex items-center justify-between text-[14px]"><span className="font-medium">{t.name}</span><span className="flex items-center gap-2 text-[12px] text-faint"><span>{t.mentions}</span><span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${toneOf(t.tone)}1a`, color: toneOf(t.tone) }}>{t.tag}</span></span></li>)}
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
        {campaigns.map((c) => <li key={c.name} className="rounded-2xl border border-line p-3"><div className="flex items-center justify-between"><span className="text-[14px] font-semibold">{c.name}</span><span className="rounded-full px-2 py-0.5 text-[12px] font-bold" style={{ background: `${TONE.good}1a`, color: TONE.good }}>{c.lift} pts</span></div><div className="mt-1 text-[12px] text-faint">{c.audience}</div><div className="mt-2 flex items-center gap-2"><span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${c.participation}%` }} /></span><span className="text-[12px] font-medium text-muted">{c.participation}% joined</span></div></li>)}
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
const RISK_TONE: Record<string, BadgeTone> = { High: "danger", Med: "warning", Low: "neutral" };
function FlightRiskScorecard({ v, onOpen, className = "" }: { v: PulseView; onOpen: (p: PulseView["flightRisks"][number]) => void; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Flight risk" title="Who might leave" action={<button onClick={() => ask(`Draft a retention plan for high flight-risk employees in ${v.scope}`)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] hover:gap-1.5"><Sparkles className="h-3 w-3" /> Retention plan</button>} />
      {v.flightRisks.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center"><Check className="h-7 w-7" style={{ color: TONE.good }} /><p className="text-[14px] font-semibold">No flagged risk</p><p className="text-[14px] text-faint">No high flight-risk employees in {v.scope}.</p></div>
      ) : (
        <div className="mt-4 -mx-2 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse">
            <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Person", "Team", "Driver", "Risk", "Conf.", ""].map((h, i) => <th key={i} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {v.flightRisks.map((r) => (
                <tr key={r.name} tabIndex={0} onClick={() => onOpen(r)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(r); }} className="cursor-pointer border-t border-line outline-none transition hover:bg-soft focus-visible:bg-soft">
                  <td className="px-2 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={r.img} name={r.name} size="sm" /><span className="text-[14px] font-semibold">{r.name}</span></div></td>
                  <td className="px-2 py-2.5 text-[14px] text-muted">{r.team}</td>
                  <td className="px-2 py-2.5 text-[14px] text-muted">{r.driver}</td>
                  <td className="px-2 py-2.5"><Badge tone={RISK_TONE[r.level] ?? "neutral"} variant="soft" size="sm">{r.level}</Badge></td>
                  <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{r.confidence}</td>
                  <td className="px-2 py-2.5 text-right"><ArrowUpRight className="h-4 w-4 text-faint" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
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
      <CardHead eyebrow="By team" title="Department health" action={<AnalyticsLink metric="engagement" dim="team" label="Compare in Analytics" />} />
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
const GRADE: Record<string, string> = { A: TONE.good, B: TONE.good, C: TONE.warn, D: TONE.bad };
function ManagersCard({ v, onOpen, className = "" }: { v: PulseView; onOpen: (m: PulseView["managers"][number]) => void; className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Manager effectiveness" title={`Index ${v.managerIndex}`} action={<span className="text-[12px] text-faint">{managerSummary.closureRate}% 1:1 closure · {managerSummary.withActions} need action</span>} />
      <div className="mt-4 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Manager", "Grade", "Score", "1:1s", "At risk", ""].map((h, i) => <th key={i} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {v.managers.map((m) => (
              <tr key={m.name} tabIndex={0} onClick={() => onOpen(m)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(m); }} className="cursor-pointer border-t border-line outline-none transition hover:bg-soft focus-visible:bg-soft">
                <td className="px-2 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={m.img} name={m.name} size="sm" /><div className="min-w-0"><div className="truncate text-[14px] font-semibold">{m.name}</div><div className="truncate text-[12px] text-faint">{m.team}</div></div></div></td>
                <td className="px-2 py-2.5"><span className="grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: GRADE[m.grade] ?? TONE.warn }}>{m.grade}</span></td>
                <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{m.score}</td>
                <td className="px-2 py-2.5 text-[14px] tabular-nums text-muted">{m.closure}%</td>
                <td className="px-2 py-2.5 text-[14px] font-semibold tabular-nums" style={{ color: m.atRisk > 4 ? TONE.bad : "var(--muted)" }}>{m.atRisk}</td>
                <td className="px-2 py-2.5 text-right"><ArrowUpRight className="h-4 w-4 text-faint" /></td>
              </tr>
            ))}
            {v.managers.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-[14px] text-faint">No managers in {v.scope}.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
function AdoptionCard({ v, className = "" }: { v: PulseView; className?: string }) {
  const a = v.adoption;
  const stats: [string, string][] = [[a.dau, "Daily active"], [a.wau, "Weekly active"], [a.views, "Views"], [a.reactions, "Reactions"]];
  return (
    <Card className={className}>
      <CardHead eyebrow="Adoption" title="Platform usage" action={<span className="flex items-center gap-1.5 text-[14px] text-muted"><span className="text-[20px] font-bold tracking-tight text-ink">{a.dauPct}%</span> DAU/MAU</span>} />
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3">{stats.map(([val, l]) => <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[18px] font-bold tracking-tight">{val}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}</div>
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
type Detail =
  | { kind: "person"; data: PulseView["flightRisks"][number] }
  | { kind: "manager"; data: PulseView["managers"][number] };

function DetailDrawer({ detail, onClose }: { detail: Detail | null; onClose: () => void }) {
  return (
    <Drawer open={detail !== null} title="Details" onClose={onClose}>
      {detail && (detail.kind === "person"
        ? <PersonDetail p={detail.data} onClose={onClose} />
        : <ManagerDetail m={detail.data} onClose={onClose} />)}
    </Drawer>
  );
}
function personActions(driver: string): string[] {
  const d = driver.toLowerCase();
  if (d.includes("manager") || d.includes("1:1")) return ["Schedule a 1:1 this week", "Brief their manager on retention", "Add to the weekly check-in list"];
  if (d.includes("workload") || d.includes("burnout") || d.includes("commit")) return ["Run a workload review", "Rebalance the current sprint", "Offer recovery time"];
  if (d.includes("pay") || d.includes("growth")) return ["Open a growth conversation", "Review the compensation band", "Map a 6-month growth path"];
  if (d.includes("role") || d.includes("clarity")) return ["Clarify role & expectations", "Set clear quarterly goals", "Pair with a mentor"];
  return ["Schedule a 1:1 this week", "Review recent survey signals", "Loop in their manager"];
}
function DrawerActions({ actions }: { actions: string[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {actions.map((a) => <li key={a} className="flex items-start gap-2.5 rounded-2xl border border-line p-3 text-[14px]"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--lav)] text-[var(--purple)]"><ArrowRight className="h-2.5 w-2.5" strokeWidth={3} /></span>{a}</li>)}
    </ul>
  );
}
function PersonDetail({ p, onClose }: { p: PulseView["flightRisks"][number]; onClose: () => void }) {
  function createCase() { toast(`Case opened for ${p.name} — routed to Cases ✓`); onClose(); }
  return (
    <>
      <Eyebrow>Flight-risk detail</Eyebrow>
      <div className="mt-3 flex items-center gap-3.5">
        <Avatar src={p.img} name={p.name} size="lg" />
        <div className="min-w-0"><h2 className="text-[20px] font-bold tracking-tight">{p.name}</h2><p className="text-[14px] text-muted">{p.team}</p></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">Risk level</div><div className="mt-1"><Badge tone={RISK_TONE[p.level] ?? "neutral"} variant="soft" size="sm">{p.level}</Badge></div></div>
        <div className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">Model confidence</div><div className="mt-1 text-[18px] font-bold tabular-nums">{p.confidence}</div></div>
      </div>
      <h3 className="mt-5 text-[14px] font-bold">Why flagged</h3>
      <p className="mt-1.5 rounded-2xl bg-soft p-3.5 text-[14px] leading-relaxed text-muted"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[var(--purple)]" />Primary driver: <span className="font-semibold text-ink">{p.driver}</span>. The model also weighs recent sentiment dips and recognition gaps for this profile.</p>
      <h3 className="mt-5 text-[14px] font-bold">Recommended actions</h3>
      <DrawerActions actions={personActions(p.driver)} />
      <div className="mt-6 flex items-center gap-2.5">
        <Button variant="brand" onClick={createCase}>Create case</Button>
        <Button variant="secondary" leadingIcon={<Sparkles className="h-4 w-4" />} onClick={() => ask(`How do I retain ${p.name}? Their flight-risk driver is ${p.driver}.`)}>Ask Vadal</Button>
      </div>
    </>
  );
}
function ManagerDetail({ m, onClose }: { m: PulseView["managers"][number]; onClose: () => void }) {
  const actions: string[] = [];
  if (m.atRisk > 4) actions.push(`Review the ${m.atRisk} at-risk reports`);
  if (m.closure < 75) actions.push("Lift 1:1 completion above 80%");
  if (m.recognition < 20) actions.push("Increase recognition cadence");
  if (m.grade === "A") actions.push("Capture what's working as a team playbook");
  if (actions.length < 2) actions.push("Hold a team listening session");
  function createCase() { toast(`Coaching plan created for ${m.name} ✓`); onClose(); }
  return (
    <>
      <Eyebrow>Manager detail</Eyebrow>
      <div className="mt-3 flex items-center gap-3.5">
        <Avatar src={m.img} name={m.name} size="lg" />
        <div className="min-w-0"><h2 className="text-[20px] font-bold tracking-tight">{m.name}</h2><p className="text-[14px] text-muted">{m.team}</p></div>
        <span className="ml-auto grid h-9 w-9 place-items-center rounded-full text-[16px] font-bold text-white" style={{ background: GRADE[m.grade] ?? TONE.warn }}>{m.grade}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[[`${m.score}`, "Score"], [`${m.closure}%`, "1:1 closure"], [`${m.atRisk}`, "At-risk reports"]].map(([val, l]) => <div key={l} className="rounded-2xl border border-line p-3 text-center"><div className="text-[18px] font-bold tabular-nums">{val}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
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
const TABS = ["Overview", "Engagement", "Attrition & risk", "Recognition", "Managers", "Adoption"] as const;
type Tab = (typeof TABS)[number];

export function PulseDashboard() {
  const [tab, setTab] = React.useState<Tab>("Overview");
  const [scope, setScope] = usePersistentState<string>("vadal:pulse-scope", ALL_TEAMS);
  const [period, setPeriod] = usePersistentState<string>("vadal:pulse-period", "30 days");
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const view = React.useMemo(() => derivePulse(scope, period), [scope, period]);
  const scopes = [ALL_TEAMS, ...departments.map((d) => d.name)];

  return (
    <div className="flex flex-col gap-6">
      <Briefing v={view} setTab={(t) => setTab(t as Tab)} period={period} setPeriod={setPeriod} />

      {/* tabs + scope */}
      <div className="sticky top-[57px] z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/85 px-2 py-2 backdrop-blur-md">
        <div role="tablist" aria-label="Pulse sections" className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition ${tab === t ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href={analyticsHref("engagement")} className="hidden items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5 sm:flex">Slice in Analytics <ArrowUpRight className="h-3 w-3" /></Link>
          <label className="flex items-center gap-2 text-[12px] text-faint">Scope
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-full border border-line bg-card px-3 py-1.5 text-[14px] font-medium text-ink outline-none transition hover:border-faint/40">
              {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </div>

      {tab === "Overview" && (<>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><HealthCard v={view} className="xl:col-span-4" /><TrendCard v={view} period={period} className="xl:col-span-8" /></div>
        <KpiRow v={view} />
        <ActionQueueCard />
        <BusinessImpactStrip isTeam={view.isTeam} />
      </>)}

      {tab === "Engagement" && (<>
        <TrendCard v={view} period={period} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><VoiceCard v={view} className="xl:col-span-7" /><CampaignsCard isTeam={view.isTeam} className="xl:col-span-5" /></div>
      </>)}

      {tab === "Attrition & risk" && (<>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><AttritionCard v={view} className="xl:col-span-5" /><FlightRiskScorecard v={view} onOpen={(p) => setDetail({ kind: "person", data: p })} className="xl:col-span-7" /></div>
        <ActionQueueCard />
      </>)}

      {tab === "Recognition" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><RecognitionCard v={view} className="xl:col-span-5" /><DepartmentsCard scope={scope} className="xl:col-span-7" /></div>
      )}

      {tab === "Managers" && (<>
        <ManagersCard v={view} onOpen={(m) => setDetail({ kind: "manager", data: m })} />
        <DepartmentsCard scope={scope} />
      </>)}

      {tab === "Adoption" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:items-start"><AdoptionCard v={view} /><KnowledgeCard isTeam={view.isTeam} /></div>
      )}

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
