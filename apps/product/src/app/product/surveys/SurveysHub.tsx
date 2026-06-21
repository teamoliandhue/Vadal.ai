"use client";
/* SURVEYS — admin hub (Notion "Listen" spec): manage + track + results.
   Active/scheduled/closed list with a status filter, launch-from-template, live
   response tracking, and a results view with AI theme detection. Same Lumen
   shell + Aurora AI accents as Pulse. Seeded data (lib/listen). */
import * as React from "react";
import { Plus } from "lucide-react";
import { Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import { usePersistentState } from "@/lib/usePersistentState";
import { surveyStats, surveys, surveyTemplates, surveyResult, type Survey, type SurveyStatus } from "@/lib/listen";
import { SurveyBuilder, type BuilderSeed } from "./SurveyBuilder";

const TONE = { good: "var(--success)", bad: "var(--danger)", warn: "var(--warning)", purple: "var(--purple)" } as const;
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const toneOf = (t: string) => (t === "good" ? TONE.good : t === "bad" ? TONE.bad : t === "warn" ? TONE.warn : TONE.purple);
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const STATUS_TONE: Record<SurveyStatus, BadgeTone> = { live: "success", scheduled: "info", closed: "neutral" };
const STATUS_LABEL: Record<SurveyStatus, string> = { live: "Live", scheduled: "Scheduled", closed: "Closed" };
const FILTERS = ["All", "Live", "Scheduled", "Closed"] as const;

/* per-survey results — varies the standard question set by a stable name hash */
function resultsFor(s: Survey) {
  if (s.status === "scheduled" || s.responses === 0) return null;
  const off = (hash(s.name) % 15) - 7;
  return {
    questions: surveyResult.questions.map((q) => ({ ...q, topPct: Math.max(22, Math.min(92, q.topPct + off)) })),
    themes: surveyResult.themes,
    summary: surveyResult.aiSummary,
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

export function SurveysHub() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = React.useState<Survey | null>(null);
  const [mine, setMine] = usePersistentState<Survey[]>("vadal:surveys-mine", []);
  const [builder, setBuilder] = React.useState<BuilderSeed>(null);
  const all = [...mine, ...surveys];
  const rows = all.filter((s) => filter === "All" || STATUS_LABEL[s.status] === filter);
  const detail = open ? resultsFor(open) : null;

  const kpis: [string, string, string?][] = [
    ["Active surveys", String(surveyStats.active + mine.filter((s) => s.status === "live").length)],
    ["Avg response rate", `${surveyStats.avgResponse}%`],
    ["Responses · 30d", surveyStats.responses],
    ["eNPS", String(surveyStats.enps), `+${surveyStats.enpsDelta}`],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Listen</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Surveys</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Ask deliberately — launch, track, and read surveys. The listening that feeds Pulse.</p>
          </div>
          <Button variant="brand" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setBuilder({ name: "", cadence: "One-time" })}>Launch survey</Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 lg:grid-cols-4">
          {kpis.map(([label, val, delta]) => (
            <div key={label}>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</div>
              <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[22px] font-bold tracking-tight">{val}</span>{delta && <span className="text-[12px] font-bold" style={{ color: TONE.good }}>▲ {delta.replace("+", "")}</span>}</div>
            </div>
          ))}
        </div>
      </header>

      {/* surveys list */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Eyebrow>Programs</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Active & scheduled</h2></div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${filter === f ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 -mx-2 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Survey", "Audience", "Status", "Response rate", "When", ""].map((h, i) => <th key={i} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.name} className="border-t border-line">
                  <td className="px-2 py-3"><div className="text-[14px] font-semibold">{s.name}</div><div className="mt-0.5 text-[12px] text-faint">{s.type}</div></td>
                  <td className="px-2 py-3 text-[14px] text-muted">{s.audience}</td>
                  <td className="px-2 py-3"><Badge tone={STATUS_TONE[s.status]} variant="soft" size="sm">{STATUS_LABEL[s.status]}</Badge></td>
                  <td className="px-2 py-3">
                    {s.status === "scheduled" ? <span className="text-[12px] text-faint">—</span> : (
                      <div className="flex items-center gap-2">
                        <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.responseRate}%`, background: s.responseRate >= 60 ? TONE.good : s.responseRate >= 40 ? TONE.warn : TONE.bad }} /></span>
                        <span className="text-[14px] font-bold tabular-nums">{s.responseRate}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3 text-[14px] text-muted">{s.when}</td>
                  <td className="px-2 py-3 text-right">
                    <button onClick={() => setOpen(s)} className="text-[12px] font-semibold text-[var(--purple)] hover:underline">{s.status === "scheduled" ? "Details" : "View results"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* templates */}
      <div className="flex flex-col gap-3">
        <Eyebrow>Launch from a template</Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {surveyTemplates.map((t) => (
            <div key={t.key} className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4">
              <div className="flex items-center justify-between"><span className="text-[14px] font-semibold">{t.name}</span><span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-medium text-faint">{t.cadence}</span></div>
              <p className="mt-1 flex-1 text-[14px] leading-relaxed text-muted">{t.desc}</p>
              <Button variant="secondary" size="sm" className="mt-3 self-start" onClick={() => setBuilder({ name: t.name, cadence: t.cadence, key: t.key })}>Use template</Button>
            </div>
          ))}
        </div>
      </div>

      {/* latest results */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><Eyebrow>Latest results · {surveyResult.responses.toLocaleString()} responses</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">{surveyResult.survey}</h2></div>
          <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`Summarise the results of the ${surveyResult.survey}.`)}>Ask Vadal</Button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col gap-4 xl:col-span-7">
            {surveyResult.questions.map((q) => (
              <div key={q.q}>
                <div className="flex items-center justify-between text-[14px]"><span className="font-medium">{q.q}</span><span className="text-[12px] text-faint">{q.top} · {q.topPct}%</span></div>
                <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full" style={{ width: `${q.topPct}%`, background: toneOf(q.tone) }} /></span>
              </div>
            ))}
          </div>
          <div className="xl:col-span-5">
            <Eyebrow>AI themes · open text</Eyebrow>
            <ul className="mt-2 space-y-2">
              {surveyResult.themes.map((t) => (
                <li key={t.name} className="flex items-center justify-between text-[14px]"><span className="font-medium">{t.name}</span><span className="rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(toneOf(t.tone)), color: toneOf(t.tone) }}>{t.mentions}</span></li>
              ))}
            </ul>
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[var(--ai-surface)] p-3 text-[14px] leading-relaxed text-muted ring-1 ring-[var(--ai-border)]"><SparkMark size={14} className="mt-0.5 shrink-0" /><span>{surveyResult.aiSummary}</span></div>
          </div>
        </div>
      </Card>

      <Drawer open={!!open} title={open?.name} onClose={() => setOpen(null)}>
        {open && (
          <>
            <Eyebrow>Survey · {open.type}</Eyebrow>
            <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">{open.name}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[open.status]} variant="soft" size="sm">{STATUS_LABEL[open.status]}</Badge>
              <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted">{open.audience}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">Response rate</div><div className="mt-1 text-[18px] font-bold tabular-nums">{open.responseRate}%</div></div>
              <div className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">Responses</div><div className="mt-1 text-[18px] font-bold tabular-nums">{open.responses.toLocaleString()}</div></div>
            </div>
            {detail ? (
              <>
                <h3 className="mt-5 text-[14px] font-bold">Top answers</h3>
                <div className="mt-2 flex flex-col gap-3">
                  {detail.questions.map((q) => (
                    <div key={q.q}>
                      <div className="flex items-center justify-between text-[14px]"><span className="font-medium">{q.q}</span><span className="text-[12px] text-faint">{q.top} · {q.topPct}%</span></div>
                      <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full" style={{ width: `${q.topPct}%`, background: toneOf(q.tone) }} /></span>
                    </div>
                  ))}
                </div>
                <h3 className="mt-5 text-[14px] font-bold">AI themes · open text</h3>
                <ul className="mt-2 space-y-2">
                  {detail.themes.map((t) => <li key={t.name} className="flex items-center justify-between text-[14px]"><span className="font-medium">{t.name}</span><span className="rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(toneOf(t.tone)), color: toneOf(t.tone) }}>{t.mentions}</span></li>)}
                </ul>
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[var(--ai-surface)] p-3 text-[14px] leading-relaxed text-muted ring-1 ring-[var(--ai-border)]"><SparkMark size={14} className="mt-0.5 shrink-0" /><span>{detail.summary}</span></div>
                <Button variant="brand" className="mt-5" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`Summarise the results of the ${open.name} and suggest actions.`)}>Ask Vadal about this</Button>
              </>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
                <p className="text-[14px] font-semibold">{open.status === "live" ? "Collecting responses" : "Not started yet"}</p>
                <p className="text-[14px] text-faint">{open.status === "live" ? `Sent to ${open.audience} · results appear here as responses come in.` : `Opens ${open.when}. Results appear here once responses come in.`}</p>
              </div>
            )}
          </>
        )}
      </Drawer>

      <SurveyBuilder seed={builder} onClose={() => setBuilder(null)} onLaunch={(s) => setMine((m) => [s, ...m])} />
    </div>
  );
}
