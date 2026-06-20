"use client";
/* PULSE — people-intelligence cockpit (redesign v2, Notion spec + peer research).
   Model: BRIEFING (action-first, AI-led) → OUTCOME TABS (focused) → EXPLORE.
   Peers referenced via Mobbin: 15Five Outcomes (insight+CTA, insight selector),
   Deel (tabs+filters+view-dashboard), Charma (scorecard tables), 7shifts/Employment
   Hero (vs-previous KPIs, action items). Reuses the shell, charts, DS components,
   tokens, persistence + toasts. */
import * as React from "react";
import {
  ArrowUpRight, ArrowRight, Check, Heart, Sparkles, TriangleAlert,
} from "lucide-react";
import { Avatar, Badge, Button, Trend, type BadgeTone } from "@vadal/design-system";
import { ArcGauge, Sparkline, TrendChart } from "@/components/charts";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";
import {
  org, health, engagementTrend, aiBriefing, briefingImpact, voice, signals, actionQueue, actionProgress,
  attrition, flightRisks, recognitionBoard, recognitionExtra, departments, managerSummary, managers,
  campaigns, impact, experience, gamification, knowledge, aiUsage,
} from "@/lib/data";

const TONE = { good: "#2f9e6e", bad: "#dc4a44", warn: "#d68a1e", purple: "#6d5df0" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const toneOf = (t: string) => t === "good" ? TONE.good : t === "bad" ? TONE.bad : t === "warn" ? TONE.warn : TONE.purple;
const band = (s: number) => (s >= 80 ? TONE.good : s >= 70 ? TONE.warn : TONE.bad);

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
/* accessible chart wrapper — gives screen readers a text alternative for the aria-hidden svgs */
function Figure({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div role="img" aria-label={label} className={className}>{children}</div>;
}

/* ════════════════════════ Briefing (command bar + decisions) ════════════════════════ */
const PERIODS = ["7 days", "30 days", "Quarter"] as const;
function Briefing({ setTab, period, setPeriod }: { setTab: (t: string) => void; period: string; setPeriod: (p: string) => void }) {
  const acts = [
    { label: "Review risk", to: "Attrition & risk" },
    { label: "See engagement", to: "Engagement" },
    { label: "Review managers", to: "Managers" },
  ];
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
      {/* command row */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>{org.name} · {org.headcount.toLocaleString()} people</Eyebrow>
          <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">People intelligence</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-muted">
            <span className="text-[20px] font-bold tracking-tight text-ink">{health.score}</span>
            <Trend direction="up" value={String(health.delta)} />
            <span>· +{health.benchmarkDelta} vs benchmark · {health.percentile} of GCC</span>
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
            <Button variant="brand" size="sm" leadingIcon={<Sparkles className="h-4 w-4" />} onClick={() => ask("Give me today's people-intelligence report")}>AI report</Button>
          </div>
        </div>
      </div>
      {/* decisions */}
      <div className="relative mt-5 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <Eyebrow>Needs you today · {aiBriefing.length}</Eyebrow>
          <span className="text-[12px] font-medium" style={{ color: TONE.bad }}>{briefingImpact.value} if unaddressed</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {aiBriefing.map((b, i) => (
            <div key={b.text} className="flex flex-col rounded-2xl border border-line bg-soft p-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.dot }} />
                <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold leading-snug">{b.text}</div><div className="mt-0.5 text-[12px] text-faint">{b.sub}</div></div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="brand" size="sm" onClick={() => setTab(acts[i].to)}>{acts[i].label}</Button>
                <button onClick={() => ask(b.text)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] hover:underline"><Sparkles className="h-3 w-3" /> Why</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ════════════════════════ shared section cards ════════════════════════ */
function HealthCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Workforce health" title="Org health score" action={<Explore q="Break down our workforce health drivers" />} />
      <Figure label={`Workforce health ${health.score} of 100`} className="mt-2 flex justify-center"><ArcGauge score={health.score} width={200} /></Figure>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {health.drivers.map((d) => <span key={d.label} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: `${toneOf(d.tone)}1a`, color: d.tone === "neutral" ? "var(--muted)" : toneOf(d.tone) }}>{d.label}</span>)}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">{health.narrative}</p>
    </Card>
  );
}
const WIN_PTS: Record<string, number> = { "7 days": 5, "30 days": 9, "Quarter": engagementTrend.series.length };
const WIN_MO: Record<string, number> = { "7 days": 4, "30 days": 7, "Quarter": engagementTrend.months.length };
function TrendCard({ period, className = "" }: { period: string; className?: string }) {
  const n = WIN_PTS[period] ?? engagementTrend.series.length;
  const series = engagementTrend.series.slice(-n);
  const benchmark = engagementTrend.benchmark.slice(-n);
  const months = engagementTrend.months.slice(-(WIN_MO[period] ?? engagementTrend.months.length));
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div><Eyebrow>Engagement · {period}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Trend vs benchmark</h2></div>
        <div className="flex items-center gap-3 text-[12px] text-faint"><span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: TONE.purple }} /> Us</span><span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-line" /> Benchmark</span></div>
      </div>
      <Figure label={`Engagement trend vs benchmark over ${period}`}>
        <TrendChart series={series} benchmark={benchmark} color={TONE.purple} height={190} id="eng" className="mt-4" />
      </Figure>
      <div className="mt-1 flex justify-between text-[12px] text-faint">{months.filter((_, i) => months.length <= 6 || i % 2 === 0).map((m) => <span key={m}>{m}</span>)}</div>
      <p className="mt-3 rounded-2xl bg-soft p-3.5 text-[14px] leading-relaxed text-muted"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[var(--purple)]" />{engagementTrend.insight}</p>
    </Card>
  );
}
function KpiRow({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 xl:grid-cols-4 ${className}`}>
      {signals.map((s) => {
        const t = toneOf(s.tone);
        return (
          <div key={s.title} className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between"><span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{s.title}</span><span className="text-[12px] font-bold" style={{ color: t }}>{s.delta}</span></div>
            <div className="mt-1 text-[22px] font-bold tracking-tight">{s.value}</div>
            <Figure label={`${s.title} trend`}><Sparkline values={[...s.spark]} color={t} id={`kpi-${s.title}`} height={26} className="mt-1" /></Figure>
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
function BusinessImpactStrip() {
  const corr: [string, string][] = [[impact.attritionCorr, "↔ Attrition"], [impact.productivityCorr, "↔ Productivity"], [impact.revenueCorr, "↔ Revenue"]];
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[#141419] p-7 text-white shadow-[0_18px_44px_-22px_rgba(0,0,0,0.5)] sm:p-8 dark:ring-1 dark:ring-white/[0.08]">
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 70%, transparent 78%)" }} aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Business impact</p><h2 className="mt-1.5 text-[20px] font-bold tracking-tight">Engagement moves the business</h2></div>
        <div className="flex gap-2.5">
          {corr.map(([v, l]) => <div key={l} className="rounded-2xl bg-white/[0.06] px-4 py-2 text-center ring-1 ring-white/[0.08]"><div className="text-[20px] font-bold" style={{ color: v.startsWith("-") || v.startsWith("−") ? "#5eead4" : "#a5b4fc" }}>{v}</div><div className="text-[12px] text-zinc-400">{l}</div></div>)}
          <div className="rounded-2xl bg-white/[0.06] px-4 py-2 text-center ring-1 ring-white/[0.08]"><div className="text-[20px] font-bold">{impact.roi}</div><div className="text-[12px] text-zinc-400">ROI</div></div>
        </div>
      </div>
      <p className="relative mt-4 max-w-3xl text-[14px] leading-relaxed text-zinc-300"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#818cf8]" />{impact.insight} · saves {impact.attritionCost}/yr in attrition.</p>
    </section>
  );
}
function VoiceCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Employee voice" title={`${voice.comments.toLocaleString()} comments`} action={<Explore q="Summarise employee sentiment themes" />} />
      <Figure label={`Sentiment: ${voice.mood.map((m) => `${m.label} ${m.pct}%`).join(", ")}`} className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {voice.mood.map((m) => <span key={m.label} style={{ width: `${m.pct}%`, background: m.color }} />)}
      </Figure>
      <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-faint">{voice.mood.map((m) => <span key={m.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.label} {m.pct}%</span>)}</div>
      <ul className="mt-4 space-y-2">
        {voice.themes.map((t) => <li key={t.name} className="flex items-center justify-between text-[14px]"><span className="font-medium">{t.name}</span><span className="flex items-center gap-2 text-[12px] text-faint"><span>{t.mentions}</span><span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${toneOf(t.tone)}1a`, color: toneOf(t.tone) }}>{t.tag}</span></span></li>)}
      </ul>
      <blockquote className="mt-4 rounded-2xl border-l-2 border-[var(--purple)] bg-soft p-3.5 text-[14px] leading-relaxed text-muted">“{voice.quote.text}”<cite className="mt-1.5 block text-[12px] not-italic text-faint">{voice.quote.meta}</cite></blockquote>
    </Card>
  );
}
function CampaignsCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Campaigns" title="Are interventions working" action={<Explore q="Which campaigns drove the most engagement lift?" />} />
      <ul className="mt-4 flex-1 space-y-3">
        {campaigns.map((c) => <li key={c.name} className="rounded-2xl border border-line p-3"><div className="flex items-center justify-between"><span className="text-[14px] font-semibold">{c.name}</span><span className="rounded-full px-2 py-0.5 text-[12px] font-bold" style={{ background: `${TONE.good}1a`, color: TONE.good }}>{c.lift} pts</span></div><div className="mt-1 text-[12px] text-faint">{c.audience}</div><div className="mt-2 flex items-center gap-2"><span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${c.participation}%` }} /></span><span className="text-[12px] font-medium text-muted">{c.participation}% joined</span></div></li>)}
      </ul>
    </Card>
  );
}
function AttritionCard({ className = "" }: { className?: string }) {
  const totalSeg = attrition.segmentation.reduce((s, x) => s + x.count, 0);
  return (
    <Card className={className}>
      <CardHead eyebrow="Attrition & risk" title="Predicted attrition" action={<span className="flex items-center gap-1.5"><span className="text-[22px] font-bold tracking-tight">{attrition.predicted}</span><Trend direction="up" value={attrition.predictedDelta.replace("+", "")} /></span>} />
      <Figure label={`Risk segmentation: ${attrition.segmentation.map((s) => `${s.level} ${s.count}`).join(", ")}`} className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {attrition.segmentation.map((s) => <span key={s.level} style={{ width: `${(s.count / totalSeg) * 100}%`, background: s.color }} />)}
      </Figure>
      <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-faint">{attrition.segmentation.map((s) => <span key={s.level} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.level} {s.count}</span>)}</div>
      <Eyebrow>Top drivers</Eyebrow>
      <ul className="mt-2 space-y-1.5">
        {attrition.drivers.map((d) => <li key={d.label} className="flex items-center gap-3 text-[14px]"><span className="w-40 shrink-0 truncate">{d.label}</span><span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${d.pct * 2.5}%` }} /></span><span className="w-8 text-right text-[12px] text-faint">{d.pct}%</span></li>)}
      </ul>
    </Card>
  );
}
const RISK_TONE: Record<string, BadgeTone> = { High: "danger", Med: "warning", Low: "neutral" };
function FlightRiskScorecard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Flight risk" title="Who might leave" action={<button onClick={() => ask("Draft a retention plan for our high flight-risk employees")} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] hover:gap-1.5"><Sparkles className="h-3 w-3" /> Retention plan</button>} />
      <div className="mt-4 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Person", "Team", "Driver", "Risk", "Conf."].map((h) => <th key={h} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {flightRisks.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <td className="px-2 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={r.img} name={r.name} size="sm" /><span className="text-[14px] font-semibold">{r.name}</span></div></td>
                <td className="px-2 py-2.5 text-[14px] text-muted">{r.team}</td>
                <td className="px-2 py-2.5 text-[14px] text-muted">{r.driver}</td>
                <td className="px-2 py-2.5"><Badge tone={RISK_TONE[r.level] ?? "neutral"} variant="soft" size="sm">{r.level}</Badge></td>
                <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{r.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
function RecognitionCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Recognition & culture" title={`${recognitionBoard.total.toLocaleString()} kudos`} action={<Heart className="h-4 w-4 text-[var(--purple)]" />} />
      <div className="mt-3 grid grid-cols-3 divide-x divide-line">
        {[[`${recognitionBoard.coverage}%`, "Coverage"], [`${recognitionExtra.peer}/${recognitionExtra.manager}`, "Peer / mgr"], [gamification.streaks.toLocaleString(), "Streaks"]].map(([v, l]) => <div key={l} className="px-2 text-center first:pl-0 last:pr-0"><div className="text-[18px] font-bold tracking-tight">{v}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
      </div>
      <Eyebrow>Top recognisers</Eyebrow>
      <ul className="mt-2 space-y-2">
        {recognitionBoard.leaders.map((p, i) => <li key={p.name} className="flex items-center gap-3"><span className="w-4 text-[12px] font-bold text-faint">{i + 1}</span><Avatar src={p.img} name={p.name} size="sm" /><div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{p.name}</div><div className="truncate text-[12px] text-faint">{p.team}</div></div><span className="text-[14px] font-bold tabular-nums">{p.given}</span></li>)}
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
      <CardHead eyebrow="By team" title="Department health" action={<Explore q="Why is the lowest-scoring team struggling?" />} />
      <ul className="mt-4 space-y-2.5">
        {sorted.map((d) => {
          const dim = scope !== "All teams" && d.name !== scope;
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
function ManagersCard({ scope, className = "" }: { scope: string; className?: string }) {
  const rows = scope === "All teams" ? managers : managers.filter((m) => m.team === scope);
  return (
    <Card className={className}>
      <CardHead eyebrow="Manager effectiveness" title={`Index ${managerSummary.index}`} action={<span className="text-[12px] text-faint">{managerSummary.closureRate}% 1:1 closure · {managerSummary.withActions} need action</span>} />
      <div className="mt-4 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Manager", "Grade", "Score", "1:1s", "At risk"].map((h) => <th key={h} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.name} className="border-t border-line">
                <td className="px-2 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={m.img} name={m.name} size="sm" /><div className="min-w-0"><div className="truncate text-[14px] font-semibold">{m.name}</div><div className="truncate text-[12px] text-faint">{m.team}</div></div></div></td>
                <td className="px-2 py-2.5"><span className="grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: GRADE[m.grade] ?? TONE.warn }}>{m.grade}</span></td>
                <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{m.score}</td>
                <td className="px-2 py-2.5 text-[14px] tabular-nums text-muted">{m.closure}%</td>
                <td className="px-2 py-2.5 text-[14px] font-semibold tabular-nums" style={{ color: m.atRisk > 4 ? TONE.bad : "var(--muted)" }}>{m.atRisk}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-[14px] text-faint">No managers in {scope}.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
function AdoptionCard({ className = "" }: { className?: string }) {
  const stats: [string, string][] = [[experience.dau, "Daily active"], [experience.wau, "Weekly active"], [experience.views, "Views"], [experience.reactions, "Reactions"]];
  return (
    <Card className={className}>
      <CardHead eyebrow="Adoption" title="Platform usage" action={<span className="flex items-center gap-1.5 text-[14px] text-muted"><span className="text-[20px] font-bold tracking-tight text-ink">{experience.dauPct}%</span> DAU/MAU</span>} />
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3">{stats.map(([v, l]) => <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[18px] font-bold tracking-tight">{v}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}</div>
    </Card>
  );
}
function KnowledgeCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHead eyebrow="Knowledge & AI" title="What people ask" action={<Explore q="What knowledge gaps should we close first?" />} />
      <div className="mt-3 grid grid-cols-2 gap-3">{[[aiUsage.questions, "AI questions"], [`${aiUsage.resolved}%`, "Self-resolved"]].map(([v, l]) => <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[18px] font-bold tracking-tight">{v}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}</div>
      <ul className="mt-3 space-y-1.5">{knowledge.topQueries.slice(0, 3).map((q) => <li key={q.q} className="flex items-center justify-between text-[14px]"><span className="truncate">{q.q}</span><span className="text-[12px] text-faint">{q.n}</span></li>)}</ul>
      <div className="mt-auto flex items-start gap-2 rounded-2xl bg-soft p-3 text-[12px] text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--purple)]" /><span>{aiUsage.signal}</span></div>
    </Card>
  );
}

/* ════════════════════════ tabs + compose ════════════════════════ */
const TABS = ["Overview", "Engagement", "Attrition & risk", "Recognition", "Managers", "Adoption"] as const;
type Tab = (typeof TABS)[number];

export function PulseDashboard() {
  const [tab, setTab] = React.useState<Tab>("Overview");
  const [scope, setScope] = usePersistentState<string>("vadal:pulse-scope", "All teams");
  const [period, setPeriod] = usePersistentState<string>("vadal:pulse-period", "30 days");
  const scopes = ["All teams", ...departments.map((d) => d.name)];

  return (
    <div className="flex flex-col gap-6">
      <Briefing setTab={(t) => setTab(t as Tab)} period={period} setPeriod={setPeriod} />

      {/* tabs + scope */}
      <div className="sticky top-[57px] z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/85 px-2 py-2 backdrop-blur-md">
        <div role="tablist" aria-label="Pulse sections" className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition ${tab === t ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>{t}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-faint">Scope
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-full border border-line bg-card px-3 py-1.5 text-[14px] font-medium text-ink outline-none transition hover:border-faint/40">
            {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {tab === "Overview" && (<>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><HealthCard className="xl:col-span-4" /><TrendCard period={period} className="xl:col-span-8" /></div>
        <KpiRow />
        <ActionQueueCard />
        <BusinessImpactStrip />
      </>)}

      {tab === "Engagement" && (<>
        <TrendCard period={period} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><VoiceCard className="xl:col-span-7" /><CampaignsCard className="xl:col-span-5" /></div>
      </>)}

      {tab === "Attrition & risk" && (<>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><AttritionCard className="xl:col-span-5" /><FlightRiskScorecard className="xl:col-span-7" /></div>
        <ActionQueueCard />
      </>)}

      {tab === "Recognition" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start"><RecognitionCard className="xl:col-span-5" /><DepartmentsCard scope={scope} className="xl:col-span-7" /></div>
      )}

      {tab === "Managers" && (<>
        <ManagersCard scope={scope} />
        <DepartmentsCard scope={scope} />
      </>)}

      {tab === "Adoption" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:items-start"><AdoptionCard /><KnowledgeCard /></div>
      )}
    </div>
  );
}
