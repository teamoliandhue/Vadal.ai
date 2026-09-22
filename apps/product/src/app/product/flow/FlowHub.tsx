"use client";
/* FLOW — cases, the work inside them, the rules that move it, and whether we
   kept our promise (Digital workplace, spec 055).

   The old screen was a case list and nothing else, so three of the module's
   four capabilities had no home. Each new view answers something the list
   could not:

   · Tasks       — the small jobs work actually consists of, most of which are
                   not cases at all: a joiner's laptop, a locker key, an
                   acknowledgement outstanding.
   · Automations — the rules that open, route and chase without anyone
                   remembering to, each stating what it is NEVER allowed to do.
                   A rule you cannot see the limits of is a rule nobody trusts.
   · SLA         — median against target by category, and every breach with its
                   reason, because "89% on time" without the 11% is marketing. */
import * as React from "react";
import { CheckCircle2, Clock3, ListChecks, Plus, ShieldCheck, TriangleAlert, Zap } from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import { ViewToggle } from "@/components/viz";
import { automations, breaches, sla, slaStats, tasks, type Automation, type Task, type TaskStatus } from "@/lib/flow";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";
import { CasesView } from "./CasesHub";

type View = "cases" | "tasks" | "automations" | "sla";
const VIEWS: { id: View; label: string }[] = [
  { id: "cases", label: "Cases" }, { id: "tasks", label: "Tasks" }, { id: "automations", label: "Automations" }, { id: "sla", label: "SLA" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children, labelledBy }: { className?: string; children: React.ReactNode; labelledBy?: string }) {
  return <section aria-labelledby={labelledBy} className={`rounded-[24px] border border-line bg-card p-5 sm:p-7 ${className}`}>{children}</section>;
}

export function FlowHub() {
  const [view, setView] = React.useState<View>("cases");
  const [taskState, setTaskState] = usePersistentState<Record<string, TaskStatus>>("vadal:flow-tasks", {});
  const [autoOff, setAutoOff] = usePersistentState<string[]>("vadal:flow-automations-off", []);

  const live = tasks.map((t) => ({ ...t, status: taskState[t.id] ?? t.status }));
  const openTasks = live.filter((t) => t.status !== "Done").length;
  const late = live.filter((t) => t.overdue && t.status !== "Done").length;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Digital workplace</Eyebrow>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Flow</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            <span><span className="font-semibold text-ink">{slaStats.openNow}</span> cases open</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{openTasks}</span> tasks{late ? `, ${late} late` : ""}</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{slaStats.onTime}%</span> closed on time</span>
          </p>
        </div>
        <Button variant="brand" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />}
          onClick={() => toast(view === "tasks" ? "New task (demo)" : "New case (demo)")}>
          {view === "tasks" ? "New task" : "New case"}
        </Button>
      </header>

      <nav aria-label="Flow views" className="flex items-center gap-1 border-b border-line">
        {VIEWS.map((v) => {
          const on = view === v.id;
          return (
            <button key={v.id} onClick={() => setView(v.id)} aria-current={on ? "page" : undefined}
              className={`-mb-px min-h-[44px] border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "cases" && <CasesView />}
      {view === "tasks" && <Tasks tasks={live} onSet={(id, s) => setTaskState((m) => ({ ...m, [id]: s }))} />}
      {view === "automations" && <Automations off={autoOff} onToggle={(id) => setAutoOff((all) => (all.includes(id) ? all.filter((x) => x !== id) : [...all, id]))} />}
      {view === "sla" && <Sla />}
    </div>
  );
}

/* ── tasks ───────────────────────────────────────────────────────── */
const COLUMNS: TaskStatus[] = ["To do", "Doing", "Done"];

function Tasks({ tasks: rows, onSet }: { tasks: Task[]; onSet: (id: string, s: TaskStatus) => void }) {
  const late = rows.filter((t) => t.overdue && t.status !== "Done");

  return (
    <div className="flex flex-col gap-6">
      {late.length > 0 && (
        <Card className="relative overflow-hidden" labelledBy="late-h">
          <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: "var(--danger)" }} />
          <h2 id="late-h" className="text-[18px] font-bold tracking-tight">Past their date</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {late.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
                <TriangleAlert className="h-4 w-4 shrink-0 text-[var(--danger)]" />
                <span className="font-semibold text-ink">{t.title}</span>
                <span className="text-[14px] text-muted">{t.who.name} · {t.due}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = rows.filter((t) => t.status === col);
          return (
            <section key={col} aria-labelledby={`c-${col}`} className="flex flex-col gap-3">
              <h2 id={`c-${col}`} className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
                {col}
                <span className="rounded-full bg-soft px-1.5 py-px text-[12px] tracking-normal tabular-nums text-muted">{items.length}</span>
              </h2>
              {items.map((t) => <TaskCard key={t.id} t={t} onSet={onSet} />)}
              {items.length === 0 && (
                <p className="rounded-[20px] border border-dashed border-line px-4 py-8 text-center text-[14px] text-faint">Nothing here.</p>
              )}
            </section>
          );
        })}
      </div>

      <p className="flex items-start gap-2 text-[13px] leading-snug text-faint">
        <ListChecks className="mt-[2px] h-4 w-4 shrink-0" />
        Tasks from a case carry its number, so closing the case is never a surprise to whoever was doing the work inside it.
      </p>
    </div>
  );
}

function TaskCard({ t, onSet }: { t: Task; onSet: (id: string, s: TaskStatus) => void }) {
  const next: Record<TaskStatus, TaskStatus> = { "To do": "Doing", Doing: "Done", Done: "To do" };
  const label: Record<TaskStatus, string> = { "To do": "Start", Doing: "Mark done", Done: "Reopen" };
  return (
    <article className="rounded-[20px] border border-line bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-muted">{t.source}</span>
        {t.caseId && <span className="text-[12px] text-faint">{t.caseId}</span>}
        <span className={`ml-auto inline-flex items-center gap-1 text-[13px] font-semibold ${t.overdue && t.status !== "Done" ? "text-[var(--danger)]" : "text-faint"}`}>
          <Clock3 className="h-3.5 w-3.5" />{t.due}
        </span>
      </div>
      <p className="mt-2 text-[15px] font-semibold leading-snug text-ink">{t.title}</p>
      {t.note && <p className="mt-1 text-[14px] leading-snug text-muted">{t.note}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Avatar src={t.who.img} name={t.who.name} size="sm" />
        <span className="min-w-0 flex-1 truncate text-[14px] text-muted">{t.who.name} · {t.team}</span>
        <Button variant="secondary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => { onSet(t.id, next[t.status]); toast(`${t.title} → ${next[t.status]}`); }}>
          {label[t.status]}
        </Button>
      </div>
    </article>
  );
}

/* ── automations ─────────────────────────────────────────────────── */
function Automations({ off, onToggle }: { off: string[]; onToggle: (id: string) => void }) {
  const live = automations.filter((a) => a.on && !off.includes(a.id));
  const runs = live.reduce((n, a) => n + a.runs30d, 0);
  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden" labelledBy="au-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="lg:border-r lg:border-line lg:pr-8">
            <p className="text-[14px] text-muted">Done without anyone asking</p>
            <div className="mt-1 text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{runs.toLocaleString("en-IN")}</div>
            <p className="mt-1.5 text-[13px] text-faint">actions in the last 30 days, from {live.length} rules</p>
          </div>
          <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
            <span id="au-h">
              Most of that is the HR desk opening requests with the conversation attached. Every rule says what it is never allowed to do — that sentence is the reason people let it run.
            </span>
          </p>
        </div>
      </Card>

      <ul className="flex flex-col gap-4">
        {automations.map((a) => <AutomationCard key={a.id} a={a} on={a.on && !off.includes(a.id)} onToggle={() => onToggle(a.id)} />)}
      </ul>
    </div>
  );
}

function AutomationCard({ a, on, onToggle }: { a: Automation; on: boolean; onToggle: () => void }) {
  return (
    <li className={`rounded-[22px] border bg-card p-5 transition ${on ? "border-line" : "border-dashed border-line opacity-75"}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: on ? "color-mix(in srgb, var(--purple) 12%, transparent)" : "var(--soft)", color: on ? "var(--purple)" : "var(--muted)" }}>
          <Zap className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-snug text-ink">
            <span className="font-semibold">When</span> {a.when} <span className="font-semibold">then</span> {a.then}.
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-faint">
            {on ? <><span>{a.runs30d.toLocaleString("en-IN")} times in 30 days</span><span aria-hidden>·</span><span>last {a.lastRun}</span></> : <span>Not running</span>}
          </p>
          <p className="mt-2 flex items-start gap-2 rounded-xl bg-soft/70 px-3 py-2 text-[13px] leading-snug text-muted">
            <ShieldCheck className="mt-[2px] h-3.5 w-3.5 shrink-0" />{a.never}
          </p>
        </div>
        <button onClick={onToggle} role="switch" aria-checked={on} aria-label={`${a.when} rule`}
          className="grid h-11 w-14 shrink-0 place-items-center rounded-xl transition hover:bg-soft">
          <span className={`relative block h-6 w-11 rounded-full transition ${on ? "bg-[var(--purple)]" : "bg-soft ring-1 ring-line"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </button>
      </div>
    </li>
  );
}

/* ── SLA ─────────────────────────────────────────────────────────── */
function Sla() {
  const [table, setTable] = React.useState(false);
  const worst = [...sla].sort((a, b) => a.onTime - b.onTime)[0];
  const maxDays = Math.max(...sla.map((r) => Math.max(r.median, r.target)));

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden" labelledBy="sla-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-r lg:border-line lg:pr-8">
            <div>
              <p className="text-[14px] text-muted">Closed on time</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{slaStats.onTime}%</span>
                <span className="text-[14px] font-semibold text-[var(--success)]">+{slaStats.onTimeDelta}</span>
              </div>
              <p className="mt-1.5 text-[13px] text-faint">last 30 days · median {slaStats.medianDays} days</p>
            </div>
            <div>
              <p className="text-[14px] text-muted">Due today</p>
              <div className="mt-1 text-[28px] font-bold leading-none tracking-tight tabular-nums">{slaStats.dueToday}</div>
              <p className="mt-1.5 text-[13px] text-faint">of {slaStats.openNow} open</p>
            </div>
          </div>
          <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
            <span id="sla-h">
              <span className="font-semibold">{worst.category}</span> is the one to fix: {worst.onTime}% on time against a {worst.target}-day promise, and a median of {worst.median} days. Every breach below says why it happened.
            </span>
          </p>
        </div>
      </Card>

      <Card labelledBy="cat-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="cat-h" className="text-[18px] font-bold tracking-tight">Against the promise</h2>
            <p className="mt-0.5 text-[14px] text-muted">Median days to close against the target we set when it opened.</p>
          </div>
          <ViewToggle table={table} onChange={setTable} label="SLA by category" />
        </div>

        {table ? (
          <table className="mt-5 w-full border-collapse text-[14px]">
            <caption className="sr-only">Median days to close against target, by category</caption>
            <thead><tr className="text-left text-[12px] text-faint"><th className="pb-2 font-semibold">Category</th><th className="pb-2 text-right font-semibold">Target</th><th className="pb-2 text-right font-semibold">Median</th><th className="pb-2 text-right font-semibold">On time</th><th className="pb-2 text-right font-semibold">Closed</th><th className="pb-2 text-right font-semibold">Breaches</th></tr></thead>
            <tbody>
              {sla.map((r) => (
                <tr key={r.category} className="border-t border-line">
                  <th scope="row" className="py-2.5 text-left font-medium text-ink">{r.category}</th>
                  <td className="py-2.5 text-right tabular-nums text-muted">{r.target}d</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{r.median}d</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums">{r.onTime}%</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{r.closed}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{r.breaches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {sla.map((r) => {
              const over = r.median > r.target;
              return (
                <li key={r.category}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-[15px] font-semibold text-ink">{r.category}</span>
                    <span className="text-[14px] tabular-nums text-muted">
                      <span className="font-semibold" style={{ color: over ? "var(--danger)" : "var(--ink)" }}>{r.median}d</span> against {r.target}d · {r.onTime}% on time
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 w-full rounded-full bg-soft">
                    <div className="h-full rounded-full" style={{ width: `${(r.median / maxDays) * 100}%`, background: over ? "var(--viz-2)" : "var(--viz-1)" }} />
                    <span aria-hidden className="absolute -inset-y-1 w-[2px] rounded-full bg-ink/60" style={{ left: `${(r.target / maxDays) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3" aria-label="Legend">
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--viz-1)" }} />Inside the target</li>
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--viz-2)" }} />Over it</li>
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-3 w-[2px] rounded-full bg-ink/60" />The promise</li>
        </ul>
      </Card>

      <Card labelledBy="br-h">
        <h2 id="br-h" className="text-[18px] font-bold tracking-tight">Every breach, and why</h2>
        <p className="mt-0.5 text-[14px] text-muted">89% on time is only honest if the other 11% has a name.</p>
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {breaches.map((b) => (
            <li key={b.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-start sm:gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
                <TriangleAlert className="h-[17px] w-[17px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug text-ink">{b.title}</p>
                <p className="mt-0.5 text-[13px] text-faint">{b.id} · {b.category} · {b.owner} · {b.over} {b.over === 1 ? "day" : "days"} over</p>
                <p className="mt-1 text-[14px] leading-snug text-muted">{b.why}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-snug text-faint">
          <CheckCircle2 className="mt-[2px] h-3.5 w-3.5 shrink-0" />
          Confidential and ER cases are counted here but never named — the reason is written without the detail.
        </p>
      </Card>
    </div>
  );
}
