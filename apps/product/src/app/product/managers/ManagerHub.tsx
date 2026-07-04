"use client";
/* MANAGER HUB — a people-leader's team cockpit (Operations group). Team health,
   a prioritised "needs you now" action queue, the direct-report roster with
   sentiment + 1:1 cadence + risk, AI coaching nudges, and a per-report drawer
   with AI-drafted 1:1 prep. Same Lumen shell + Aurora AI accents as the rest.
   Seeded data (lib/manager). */
import * as React from "react";
import { CalendarClock, Check, HeartHandshake, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import { usePersistentState } from "@/lib/usePersistentState";
import { team, reports, managerActions, coachingNudges, type Report, type Risk } from "@/lib/manager";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const RISK_TONE: Record<Risk, BadgeTone> = { High: "danger", Med: "warning", Low: "success" };
const ACTION_COLOR = { urgent: "var(--danger)", warn: "var(--warning)", normal: "var(--purple)" } as const;
const sentColor = (v: number) => (v >= 75 ? "var(--success)" : v >= 60 ? "var(--warning)" : "var(--danger)");

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

/* tiny sentiment sparkline */
function Spark({ data, color, w = 72, h = 24 }: { data: number[]; color: string; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden className="overflow-visible">
      <polyline points={pts} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / span) * (h - 4) - 2} r={2.5} fill={color} />
    </svg>
  );
}
function TrendIcon({ trend }: { trend: Report["trend"] }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--success)" }} />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5" style={{ color: "var(--danger)" }} />;
  return <span className="text-faint">→</span>;
}

export function ManagerHub() {
  const [doneIds, setDoneIds] = usePersistentState<string[]>("vadal:mgr-actions-done", []);
  const [open, setOpen] = React.useState<Report | null>(null);

  const actions = managerActions.filter((a) => !doneIds.includes(a.id));
  const complete = (id: string) => { setDoneIds((d) => [...d, id]); toast("Marked done ✓"); };
  const openReport = (id?: string) => { const r = reports.find((x) => x.id === id); if (r) setOpen(r); };

  const kpis: [string, string, string?][] = [
    ["Team health", String(team.health), `▲ ${team.healthDelta}`],
    ["1:1 completion", `${team.oneOnOneCompletion}%`],
    ["Recognition coverage", `${team.recognitionCoverage}%`],
    ["At-risk", `${team.atRisk}`, `${team.atRiskHigh} high`],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Operations · your team</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Manager hub</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Everything you need to lift the {team.name} — what needs you now, how the team feels, and AI prep for every 1:1.</p>
          </div>
          <Button variant="brand" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`Give me a briefing on my team (${team.name}) and what to prioritise this week.`)}>Weekly briefing</Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 lg:grid-cols-4">
          {kpis.map(([label, val, delta]) => (
            <div key={label}>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</div>
              <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[22px] font-bold tracking-tight">{val}</span>{delta && <span className="text-[12px] font-bold text-faint">{delta}</span>}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* action queue */}
        <div className="xl:col-span-7">
          <Card className="!p-0">
            <div className="flex items-center justify-between p-6 pb-3 sm:px-7">
              <div><Eyebrow>Needs you now</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Action queue</h2></div>
              <span className="rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted">{actions.length} open</span>
            </div>
            <div className="flex flex-col">
              {actions.length === 0 && <p className="px-6 pb-6 text-[14px] text-faint sm:px-7">All clear — nothing needs you right now. 🎉</p>}
              {actions.map((a) => (
                <div key={a.id} className="group flex items-center gap-3 border-t border-line px-6 py-3.5 sm:px-7">
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: ACTION_COLOR[a.tone] }} aria-hidden />
                  <button onClick={() => openReport(a.reportId)} className="min-w-0 flex-1 text-left" disabled={!a.reportId}>
                    <div className="text-[14px] font-semibold group-hover:text-[var(--purple)]">{a.title}</div>
                    <div className="mt-0.5 text-[12px] text-faint">{a.context}</div>
                  </button>
                  <span className="shrink-0 text-[12px] font-semibold" style={{ color: a.tone === "urgent" ? "var(--danger)" : "var(--faint)" }}>{a.due}</span>
                  <button onClick={() => complete(a.id)} aria-label="Mark done" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-faint transition hover:border-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_14%,transparent)] hover:text-[var(--success)]"><Check className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* right rail: health + coaching */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <div className="flex items-start justify-between">
              <div><Eyebrow>Team health</Eyebrow><div className="mt-2 flex items-baseline gap-2"><span className="text-[40px] font-bold leading-none tracking-tight">{team.health}</span><span className="text-[13px] font-bold" style={{ color: "var(--success)" }}>▲ {team.healthDelta}</span></div></div>
              <span className="rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted">Org {team.orgHealth}</span>
            </div>
            <span className="mt-3 block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: `${team.health}%` }} /></span>
            <p className="mt-2 text-[12px] text-faint">{team.orgHealth - team.health} pts below the org average — recognition and 1:1 cadence are the gap.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {team.drivers.map((d) => {
                const c = d.tone === "good" ? "var(--success)" : d.tone === "warn" ? "var(--warning)" : "var(--danger)";
                return <span key={d.label} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: soft(c), color: c }}>{d.label}</span>;
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /><Eyebrow>Vadal coaching</Eyebrow></div>
            <ul className="mt-3 flex flex-col gap-3">
              {coachingNudges.map((n, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ai-accent)]" aria-hidden />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" className="mt-4 self-start" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Coach me — how do I lift my team's health this quarter?")}>Ask Vadal</Button>
          </Card>
        </div>
      </div>

      {/* roster */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between"><Eyebrow>Your team · {team.size}</Eyebrow><span className="text-[12px] text-faint">Tap a person for their 1:1 prep</span></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <button key={r.id} onClick={() => setOpen(r)} className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4 text-left transition">
              <div className="flex items-center gap-3">
                <Avatar src={r.img} name={r.name} size="md" />
                <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{r.name}</div><div className="truncate text-[12px] text-faint">{r.role}</div></div>
                <Badge tone={RISK_TONE[r.risk]} variant="soft" size="sm">{r.risk}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="text-[18px] font-bold tabular-nums" style={{ color: sentColor(r.sentiment) }}>{r.sentiment}</span><TrendIcon trend={r.trend} /></div>
                <Spark data={r.spark} color={sentColor(r.sentiment)} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[12px]">
                <span className={`flex items-center gap-1 font-semibold ${r.overdue ? "text-[var(--danger)]" : "text-muted"}`}><CalendarClock className="h-3.5 w-3.5" /> {r.nextOneOnOne === "Overdue" ? "1:1 overdue" : `1:1 ${r.nextOneOnOne}`}</span>
                <span className={r.recognition30d === 0 ? "font-semibold text-[var(--warning)]" : "text-faint"}>{r.recognition30d === 0 ? "No kudos · 30d" : `${r.recognition30d} kudos`}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* report drawer */}
      <Drawer open={!!open} title={open?.name} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-center gap-3">
              <Avatar src={open.img} name={open.name} size="lg" />
              <div className="min-w-0"><h2 className="text-[20px] font-bold tracking-tight">{open.name}</h2><p className="text-[13px] text-faint">{open.role} · {open.tenure}</p></div>
              <span className="ml-auto"><Badge tone={RISK_TONE[open.risk]} variant="soft" size="sm">{open.risk} risk</Badge></span>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-4">
              <div><div className="text-[12px] text-faint">Sentiment</div><div className="mt-0.5 flex items-baseline gap-1.5"><span className="text-[24px] font-bold tabular-nums" style={{ color: sentColor(open.sentiment) }}>{open.sentiment}</span><TrendIcon trend={open.trend} /></div></div>
              <div className="ml-auto"><Spark data={open.spark} color={sentColor(open.sentiment)} w={120} h={36} /></div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {[["Last 1:1", open.lastOneOnOne], ["Next 1:1", open.nextOneOnOne], ["Kudos · 30d", String(open.recognition30d)]].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">{l}</div><div className={`mt-1 text-[14px] font-bold ${v === "Overdue" || v === "0" ? "text-[var(--danger)]" : ""}`}>{v}</div></div>
              ))}
            </div>

            <p className="mt-4 text-[14px] text-muted">{open.note}</p>

            <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
              <div className="flex items-center gap-2"><SparkMark size={14} /><span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ai-accent)]">AI prep · your next 1:1</span></div>
              <ul className="mt-2.5 flex flex-col gap-2">
                {open.aiPrep.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] leading-relaxed text-muted"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ai-accent)]" aria-hidden /><span>{p}</span></li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="brand" size="sm" leadingIcon={<CalendarClock className="h-4 w-4" />} onClick={() => toast(`1:1 with ${open.name.split(" ")[0]} scheduled 📅`)}>Schedule 1:1</Button>
              <Button variant="secondary" size="sm" leadingIcon={<HeartHandshake className="h-4 w-4" />} onClick={() => toast(`Opening recognition for ${open.name.split(" ")[0]}…`, "info")}>Give recognition</Button>
              <Button variant="tertiary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`Help me prepare for my 1:1 with ${open.name} — draft an agenda.`)}>Draft agenda</Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
