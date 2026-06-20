"use client";
/* PULSE dashboard content (Notion spec "Pulse — People intelligence").
   Rows: hero+period · signal ticker · Health+Trend · Briefing+Voice+Actions ·
   Attrition+Recognition · Departments+Managers · Campaigns+Adoption+Knowledge ·
   Business impact. Neutral + violet, type floor, DS components, charts, AI-ask. */
import * as React from "react";
import { ArrowUpRight, Award, CalendarClock, Check, Gift, Heart, Sparkles, TriangleAlert } from "lucide-react";
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
function AskBtn({ q }: { q: string }) {
  return (
    <button onClick={() => ask(q)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5">
      <Sparkles className="h-3 w-3" /> Ask Vadal
    </button>
  );
}
function bandColor(score: number) { return score >= 80 ? TONE.good : score >= 70 ? TONE.warn : TONE.bad; }

/* ── 1 · Hero + period filter ── */
const PERIODS = ["7 days", "30 days", "Quarter"] as const;
function Hero() {
  const [period, setPeriod] = usePersistentState<string>("vadal:pulse-period", "30 days");
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <Eyebrow>{org.name} · {org.headcount.toLocaleString()} people</Eyebrow>
          <h1 className="mt-2.5 text-[clamp(26px,3.4vw,38px)] font-bold leading-[1.05] tracking-[-0.025em]">
            People intelligence
          </h1>
          <p className="mt-2.5 flex items-center gap-2 text-[16px] leading-relaxed text-muted">
            <span className="text-[22px] font-bold tracking-tight text-ink">{health.score}</span>
            <Trend direction="up" value={String(health.delta)} />
            <span>· +{health.benchmarkDelta} vs benchmark · {health.percentile} of GCC</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${period === p ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p}</button>
            ))}
          </div>
          <Button variant="brand" size="sm" leadingIcon={<Sparkles className="h-4 w-4" />} onClick={() => ask("Walk me through today's people intelligence")}>Ask Vadal</Button>
        </div>
      </div>
      <p className="relative mt-4 max-w-3xl border-t border-line pt-4 text-[14px] leading-relaxed text-muted">{health.narrative}</p>
    </header>
  );
}

/* ── 2 · Signal ticker ── */
function Ticker() {
  return (
    <div className="rise rise-1 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {signals.map((s) => {
        const tone = s.tone === "good" ? TONE.good : s.tone === "bad" ? TONE.bad : TONE.warn;
        return (
          <div key={s.title} className="card-lift flex min-w-[230px] flex-1 flex-col rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{s.title}</span>
              <span className="text-[12px] font-bold" style={{ color: tone }}>{s.delta}</span>
            </div>
            <div className="mt-1 text-[22px] font-bold tracking-tight">{s.value}</div>
            <Sparkline values={[...s.spark]} color={tone} id={`tk-${s.title}`} height={28} className="mt-1" />
            <div className="mt-1 text-[12px] text-faint">{s.note}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 3 · Workforce health ── */
function HealthCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div><Eyebrow>Workforce health</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Org health score</h2></div>
        <AskBtn q="Why is our workforce health score where it is?" />
      </div>
      <div className="mt-2 flex justify-center"><ArcGauge score={health.score} width={210} /></div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {health.drivers.map((d) => (
          <span key={d.label} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: `${d.tone === "good" ? TONE.good : d.tone === "bad" ? TONE.bad : "var(--faint)"}1a`, color: d.tone === "good" ? TONE.good : d.tone === "bad" ? TONE.bad : "var(--muted)" }}>{d.label}</span>
        ))}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">{health.narrative}</p>
    </Card>
  );
}

/* ── 4 · Engagement trend ── */
function TrendCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div><Eyebrow>Engagement</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Trend vs benchmark</h2></div>
        <div className="flex items-center gap-3 text-[12px] text-faint">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: TONE.purple }} /> Us</span>
          <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-dashed border-line" /> Benchmark</span>
        </div>
      </div>
      <TrendChart series={[...engagementTrend.series]} benchmark={[...engagementTrend.benchmark]} color={TONE.purple} height={190} id="eng" className="mt-4" />
      <div className="mt-1 flex justify-between text-[12px] text-faint">{engagementTrend.months.filter((_, i) => i % 2 === 0).map((m) => <span key={m}>{m}</span>)}</div>
      <p className="mt-3 rounded-2xl bg-soft p-3.5 text-[14px] leading-relaxed text-muted"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[var(--purple)]" />{engagementTrend.insight}</p>
    </Card>
  );
}

/* ── 5 · AI briefing ── */
function BriefingCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#f6b26b] to-[#e0708a]"><Sparkles className="h-4 w-4 text-white" /></span>
        <div><Eyebrow>Today’s intelligence</Eyebrow><h2 className="text-[18px] font-bold tracking-tight">{aiBriefing.length} insights</h2></div>
      </div>
      <ul className="mt-4 flex-1 space-y-1">
        {aiBriefing.map((b) => (
          <li key={b.text}>
            <button onClick={() => ask(b.text)} className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-soft">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.dot }} />
              <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold leading-snug">{b.text}</span><span className="mt-0.5 block text-[12px] text-faint">{b.sub}</span></span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 rounded-xl bg-soft px-3.5 py-2.5">
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{briefingImpact.label}</div>
        <div className="mt-0.5 text-[14px] font-bold" style={{ color: TONE.bad }}>{briefingImpact.value}</div>
      </div>
    </Card>
  );
}

/* ── 6 · Voice & sentiment ── */
function VoiceCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-end justify-between">
        <div><Eyebrow>Employee voice</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">{voice.comments.toLocaleString()} comments</h2></div>
        <AskBtn q="Summarise what employees are saying right now" />
      </div>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {voice.mood.map((m) => <span key={m.label} title={`${m.label} ${m.pct}%`} style={{ width: `${m.pct}%`, background: m.color }} />)}
      </div>
      <div className="mt-2 flex gap-4 text-[12px] text-faint">
        {voice.mood.map((m) => <span key={m.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.label} {m.pct}%</span>)}
      </div>
      <ul className="mt-4 space-y-2">
        {voice.themes.map((t) => (
          <li key={t.name} className="flex items-center justify-between text-[14px]">
            <span className="font-medium">{t.name}</span>
            <span className="flex items-center gap-2 text-[12px] text-faint"><span>{t.mentions}</span><span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${t.tone === "good" ? TONE.good : t.tone === "bad" ? TONE.bad : t.tone === "warn" ? TONE.warn : TONE.purple}1a`, color: t.tone === "good" ? TONE.good : t.tone === "bad" ? TONE.bad : t.tone === "warn" ? TONE.warn : TONE.purple }}>{t.tag}</span></span>
          </li>
        ))}
      </ul>
      <blockquote className="mt-auto rounded-2xl border-l-2 border-[var(--purple)] bg-soft p-3.5 pt-3 text-[14px] leading-relaxed text-muted">“{voice.quote.text}”<cite className="mt-1.5 block text-[12px] not-italic text-faint">{voice.quote.meta}</cite></blockquote>
    </Card>
  );
}

/* ── 7 · Action queue (persisted) ── */
function ActionQueueCard({ className = "" }: { className?: string }) {
  const [done, setDone] = usePersistentState<number[]>("vadal:pulse-actions", []);
  function complete(i: number) {
    if (done.includes(i)) return;
    setDone([...done, i]);
    toast("Action closed — routed to Cases ✓");
  }
  const TONE_MAP: Record<string, string> = { urgent: TONE.bad, warn: TONE.warn, normal: TONE.purple };
  const open = actionQueue.filter((_, i) => !done.includes(i));
  const closed = actionProgress.closed + done.length;
  return (
    <Card className={className}>
      <div className="flex items-end justify-between">
        <div><Eyebrow>Act now</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Action queue</h2></div>
        <span className="text-[12px] font-medium text-faint">{closed}/{actionProgress.total} closed</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--purple)] transition-[width] duration-500" style={{ width: `${(closed / actionProgress.total) * 100}%` }} /></div>
      {open.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center">
          <Check className="h-7 w-7 text-[var(--purple)]" /><p className="text-[14px] font-semibold">All caught up</p><p className="text-[14px] text-faint">No open actions right now.</p>
        </div>
      ) : (
        <ul className="mt-3 flex-1 space-y-2.5">
          {actionQueue.map((a, i) => done.includes(i) ? null : (
            <li key={a.title} className="flex items-start gap-3 rounded-2xl border border-line p-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE_MAP[a.tone] ?? TONE.purple }} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold leading-snug">{a.title}</div>
                <div className="mt-0.5 text-[12px] text-faint">{a.context} · due {a.due}</div>
              </div>
              <Button variant="tertiary" size="sm" onClick={() => complete(i)}>Close</Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ── 8 · Attrition & risk ── */
function AttritionCard({ className = "" }: { className?: string }) {
  const totalSeg = attrition.segmentation.reduce((s, x) => s + x.count, 0);
  const LEVEL: Record<string, BadgeTone> = { High: "danger", Med: "warning", Low: "neutral" };
  return (
    <Card className={className}>
      <div className="flex items-end justify-between">
        <div><Eyebrow>Attrition & risk</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Who might leave</h2></div>
        <span className="flex items-center gap-1.5 text-[14px]"><span className="text-[22px] font-bold tracking-tight">{attrition.predicted}</span><Trend direction="up" value={attrition.predictedDelta.replace("+", "")} /></span>
      </div>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {attrition.segmentation.map((s) => <span key={s.level} title={`${s.level} ${s.count}`} style={{ width: `${(s.count / totalSeg) * 100}%`, background: s.color }} />)}
      </div>
      <div className="mt-2 flex gap-4 text-[12px] text-faint">{attrition.segmentation.map((s) => <span key={s.level} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.level} {s.count}</span>)}</div>
      <ul className="mt-4 space-y-2">
        {flightRisks.map((r) => (
          <li key={r.name} className="flex items-center gap-3 rounded-2xl border border-line p-2.5">
            <Avatar src={r.img} name={r.name} size="sm" />
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-[14px] font-semibold">{r.name}</span><Badge tone={LEVEL[r.level] ?? "neutral"} variant="soft" size="sm">{r.level}</Badge></div><div className="truncate text-[12px] text-faint">{r.team} · {r.driver}</div></div>
            <span className="shrink-0 text-[14px] font-bold tabular-nums">{r.confidence}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => ask("Draft a retention plan for our high flight-risk employees")} className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-[14px] font-semibold text-[var(--purple)] transition hover:bg-soft"><Sparkles className="h-3.5 w-3.5" /> Draft a retention plan</button>
    </Card>
  );
}

/* ── 9 · Recognition & culture (+ participation) ── */
function RecognitionCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-end justify-between">
        <div><Eyebrow>Recognition & culture</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">{recognitionBoard.total.toLocaleString()} kudos</h2></div>
        <Heart className="h-4 w-4 text-[var(--purple)]" />
      </div>
      <div className="mt-3 grid grid-cols-3 divide-x divide-line">
        {[[`${recognitionBoard.coverage}%`, "Coverage"], [`${recognitionExtra.peer}/${recognitionExtra.manager}`, "Peer / mgr"], [gamification.streaks.toLocaleString(), "Streaks"]].map(([v, l]) => (
          <div key={l} className="px-2 text-center first:pl-0 last:pr-0"><div className="text-[18px] font-bold tracking-tight">{v}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>
        ))}
      </div>
      <Eyebrow>{`Top recognisers`}</Eyebrow>
      <ul className="mt-2 space-y-2">
        {recognitionBoard.leaders.map((p, i) => (
          <li key={p.name} className="flex items-center gap-3">
            <span className="w-4 text-[12px] font-bold text-faint">{i + 1}</span>
            <Avatar src={p.img} name={p.name} size="sm" />
            <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{p.name}</div><div className="truncate text-[12px] text-faint">{p.team}</div></div>
            <span className="text-[14px] font-bold tabular-nums">{p.given}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-soft p-3 text-[12px] text-muted"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: TONE.warn }} /><span>Cold zones: {recognitionExtra.lowZones.join(" · ")}</span></div>
    </Card>
  );
}

/* ── 10 · Departments ── */
function DepartmentsCard({ className = "" }: { className?: string }) {
  const sorted = [...departments].sort((a, b) => b.score - a.score);
  const max = Math.max(...departments.map((d) => d.score));
  return (
    <Card className={className}>
      <Eyebrow>By team</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Department health</h2>
      <ul className="mt-4 space-y-2.5">
        {sorted.map((d) => (
          <li key={d.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-[14px] font-medium">{d.name}</span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(d.score / max) * 100}%`, background: bandColor(d.score) }} /></span>
            <span className="w-7 shrink-0 text-right text-[14px] font-bold tabular-nums">{d.score}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ── 11 · Manager effectiveness ── */
function ManagersCard({ className = "" }: { className?: string }) {
  const GRADE: Record<string, string> = { A: TONE.good, B: TONE.good, C: TONE.warn, D: TONE.bad };
  return (
    <Card className={className}>
      <div className="flex items-end justify-between">
        <div><Eyebrow>Manager effectiveness</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Index {managerSummary.index}</h2></div>
        <span className="text-[12px] text-faint">{managerSummary.closureRate}% 1:1 closure · {managerSummary.withActions} need action</span>
      </div>
      <div className="mt-4 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Manager", "Grade", "Score", "1:1s", "At risk"].map((h) => <th key={h} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m.name} className="border-t border-line">
                <td className="px-2 py-2.5"><div className="flex items-center gap-2.5"><Avatar src={m.img} name={m.name} size="sm" /><div className="min-w-0"><div className="truncate text-[14px] font-semibold">{m.name}</div><div className="truncate text-[12px] text-faint">{m.team}</div></div></div></td>
                <td className="px-2 py-2.5"><span className="grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: GRADE[m.grade] ?? TONE.warn }}>{m.grade}</span></td>
                <td className="px-2 py-2.5 text-[14px] font-bold tabular-nums">{m.score}</td>
                <td className="px-2 py-2.5 text-[14px] tabular-nums text-muted">{m.closure}%</td>
                <td className="px-2 py-2.5 text-[14px] font-semibold tabular-nums" style={{ color: m.atRisk > 4 ? TONE.bad : "var(--muted)" }}>{m.atRisk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── 12 · Campaigns ── */
function CampaignsCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <Eyebrow>Campaigns</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Are they working</h2>
      <ul className="mt-4 flex-1 space-y-3">
        {campaigns.map((c) => (
          <li key={c.name} className="rounded-2xl border border-line p-3">
            <div className="flex items-center justify-between"><span className="text-[14px] font-semibold">{c.name}</span><span className="rounded-full px-2 py-0.5 text-[12px] font-bold" style={{ background: `${TONE.good}1a`, color: TONE.good }}>{c.lift} pts</span></div>
            <div className="mt-1 text-[12px] text-faint">{c.audience}</div>
            <div className="mt-2 flex items-center gap-2"><span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${c.participation}%` }} /></span><span className="text-[12px] font-medium text-muted">{c.participation}% joined</span></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ── 13 · Adoption ── */
function AdoptionCard({ className = "" }: { className?: string }) {
  const stats: [string, string][] = [[experience.dau, "Daily active"], [experience.wau, "Weekly active"], [experience.views, "Views"], [experience.reactions, "Reactions"]];
  return (
    <Card className={className}>
      <Eyebrow>Adoption</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Platform usage</h2>
      <div className="mt-1 flex items-center gap-2 text-[14px] text-muted"><span className="text-[22px] font-bold tracking-tight text-ink">{experience.dauPct}%</span> DAU / MAU</div>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
        {stats.map(([v, l]) => <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[18px] font-bold tracking-tight">{v}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
      </div>
    </Card>
  );
}

/* ── 14 · Knowledge & AI usage ── */
function KnowledgeCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <Eyebrow>Knowledge & AI</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What people ask</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[[aiUsage.questions, "AI questions"], [`${aiUsage.resolved}%`, "Self-resolved"]].map(([v, l]) => <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[18px] font-bold tracking-tight">{v}</div><div className="mt-0.5 text-[12px] text-faint">{l}</div></div>)}
      </div>
      <ul className="mt-3 space-y-1.5">
        {knowledge.topQueries.slice(0, 3).map((q) => <li key={q.q} className="flex items-center justify-between text-[14px]"><span className="truncate">{q.q}</span><span className="text-[12px] text-faint">{q.n}</span></li>)}
      </ul>
      <div className="mt-auto flex items-start gap-2 rounded-2xl bg-soft p-3 text-[12px] text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--purple)]" /><span>{aiUsage.signal}</span></div>
    </Card>
  );
}

/* ── 15 · Business impact (full-width close) ── */
function BusinessImpactCard() {
  const corr: [string, string][] = [[impact.attritionCorr, "↔ Attrition"], [impact.productivityCorr, "↔ Productivity"], [impact.revenueCorr, "↔ Revenue"]];
  return (
    <section className="rise relative overflow-hidden rounded-[26px] bg-[#141419] p-7 text-white shadow-[0_18px_44px_-22px_rgba(0,0,0,0.5)] sm:p-9 dark:ring-1 dark:ring-white/[0.08]">
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 70%, transparent 78%)" }} aria-hidden />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Business impact</p><h2 className="mt-1.5 text-[20px] font-bold tracking-tight">Engagement moves the business</h2></div>
        <div className="flex gap-2.5">
          <div className="rounded-2xl bg-white/[0.06] px-4 py-2 text-center ring-1 ring-white/[0.08]"><div className="text-[20px] font-bold">{impact.roi}</div><div className="text-[12px] text-zinc-400">ROI</div></div>
          <div className="rounded-2xl bg-white/[0.06] px-4 py-2 text-center ring-1 ring-white/[0.08]"><div className="text-[20px] font-bold">{impact.attritionCost}</div><div className="text-[12px] text-zinc-400">Attrition cost</div></div>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {corr.map(([v, l]) => (
          <div key={l} className="rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/[0.07]"><div className="text-[28px] font-bold tracking-tight" style={{ color: v.startsWith("-") || v.startsWith("−") ? "#5eead4" : "#a5b4fc" }}>{v}</div><div className="mt-0.5 text-[14px] text-zinc-300">{l}</div></div>
        ))}
      </div>
      <p className="relative mt-4 max-w-3xl text-[14px] leading-relaxed text-zinc-300"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#818cf8]" />{impact.insight}</p>
    </section>
  );
}

/* ════════════════════════ compose ════════════════════════ */
export function PulseDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <Hero />
      <Ticker />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <HealthCard className="xl:col-span-4" />
        <TrendCard className="xl:col-span-8" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-12 xl:items-start">
        <BriefingCard className="xl:col-span-4" />
        <VoiceCard className="xl:col-span-4" />
        <ActionQueueCard className="xl:col-span-4" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <AttritionCard className="xl:col-span-7" />
        <RecognitionCard className="xl:col-span-5" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <DepartmentsCard className="xl:col-span-5" />
        <ManagersCard className="xl:col-span-7" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-12 xl:items-start">
        <CampaignsCard className="xl:col-span-4" />
        <AdoptionCard className="xl:col-span-4" />
        <KnowledgeCard className="xl:col-span-4" />
      </div>
      <BusinessImpactCard />
    </div>
  );
}
