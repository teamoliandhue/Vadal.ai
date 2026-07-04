"use client";
/* CASES — a confidential tracker for people issues (Operations group). Cases
   come from Pulse risks, surveys and manager flags; each has an owner, SLA and
   status pipeline. A list with priority + SLA + confidential locks, an AI banner
   for untracked Pulse risks, and a detail drawer with the timeline, AI summary
   and status actions. Same Lumen shell + Aurora AI accents. Seeded (lib/cases). */
import * as React from "react";
import { Lock, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { Avatar, Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  cases as seedCases, categories, caseStats, pulseSuggested, statusOrder,
  type Case, type CaseStatus, type Priority,
} from "@/lib/cases";

const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const catOf = (k: string) => categories[k] ?? categories.flight;
const STATUS_TONE: Record<CaseStatus, BadgeTone> = { Open: "info", "In progress": "warning", Escalated: "danger", Resolved: "success" };
const PRIORITY_COLOR: Record<Priority, string> = { Urgent: "var(--danger)", High: "var(--warning)", Medium: "var(--info)", Low: "var(--faint)" };
const FILTERS = ["All", "Open", "In progress", "Escalated", "Resolved"] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
function CatChip({ k }: { k: string }) {
  const c = catOf(k);
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(c.color), color: c.color }}><span aria-hidden>{c.emoji}</span> {c.label}</span>;
}
function Sla({ days, resolved }: { days: number; resolved: boolean }) {
  if (resolved) return <span className="text-[12px] font-semibold text-[var(--success)]">Closed</span>;
  if (days < 0) return <span className="text-[12px] font-bold text-[var(--danger)]">SLA breached</span>;
  if (days === 0) return <span className="text-[12px] font-bold text-[var(--danger)]">Due today</span>;
  const c = days <= 1 ? "var(--danger)" : days <= 3 ? "var(--warning)" : "var(--faint)";
  return <span className="text-[12px] font-semibold" style={{ color: c }}>SLA · {days}d</span>;
}

let seq = 200;

export function CasesHub() {
  const [created, setCreated] = usePersistentState<Case[]>("vadal:cases-created", []);
  const [status, setStatus] = usePersistentState<Record<string, CaseStatus>>("vadal:cases-status", {});
  const [bannerDismissed, setBannerDismissed] = usePersistentState<boolean>("vadal:cases-banner", false);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = React.useState<Case | null>(null);

  // apply any persisted status overrides on top of seed + created
  const all: Case[] = [...created, ...seedCases].map((c) => (status[c.id] ? { ...c, status: status[c.id] } : c));
  const rows = all.filter((c) => filter === "All" || c.status === filter);
  const openCount = all.filter((c) => c.status !== "Resolved").length;
  const breached = all.filter((c) => c.status !== "Resolved" && c.slaDays < 0).length;
  const detail = open ? all.find((c) => c.id === open.id) ?? open : null;

  function setCaseStatus(id: string, s: CaseStatus) {
    setStatus((m) => ({ ...m, [id]: s }));
    setOpen((o) => (o && o.id === id ? { ...o, status: s } : o));
    toast(s === "Resolved" ? "Case resolved ✓" : `Moved to ${s}`);
  }

  function openFromPulse() {
    const now: Case[] = pulseSuggested.map((p) => ({
      id: `CASE-${seq++}`, title: p.title, category: p.category, subject: p.subject, team: p.team,
      confidential: false, status: "Open", priority: p.priority, owner: { name: "Unassigned", role: "Needs an owner", img: "/avatars/user-3.svg" },
      source: "Pulse risk", opened: "Just now", slaDays: 3,
      timeline: [{ when: "now", text: "Opened from an untracked Pulse risk signal.", who: "Vadal AI" }],
      aiSummary: "Newly opened from Pulse. Assign an owner to start the SLA clock.",
    }));
    setCreated((c) => [...now, ...c]);
    setBannerDismissed(true);
    toast(`Opened ${now.length} cases from Pulse 🗂️`);
  }

  const kpis: [string, string, string?][] = [
    ["Open cases", String(openCount)],
    ["SLA breached", String(breached), breached > 0 ? "needs action" : undefined],
    ["Avg resolution", `${caseStats.avgResolutionDays}d`],
    ["Confidential", "Protected"],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Operations</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Cases</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Track and resolve people issues — from flight-risk follow-ups to ER cases. Owner, SLA and status on every one, confidential by design.</p>
          </div>
          <Button variant="brand" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => toast("New case form (demo)", "info")}>New case</Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 lg:grid-cols-4">
          {kpis.map(([label, val, note]) => (
            <div key={label}>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</div>
              <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[22px] font-bold tracking-tight">{val}</span>{note && <span className="text-[12px] font-bold text-[var(--danger)]">{note}</span>}</div>
            </div>
          ))}
        </div>
      </header>

      {/* AI banner — untracked Pulse risks */}
      {!bannerDismissed && (
        <section className="rise flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-5">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ai-accent)]" />
            <p className="text-[14px] leading-relaxed text-muted"><span className="font-semibold text-ink">{pulseSuggested.length} flight-risk & burnout signals from Pulse aren&rsquo;t tracked as cases yet.</span> Open them so they get an owner and an SLA.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="brand" size="sm" onClick={openFromPulse}>Open {pulseSuggested.length} cases</Button>
            <Button variant="tertiary" size="sm" onClick={() => setBannerDismissed(true)}>Dismiss</Button>
          </div>
        </section>
      )}

      {/* case list */}
      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-3 sm:px-7">
          <div><Eyebrow>Caseload</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">All cases</h2></div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${filter === f ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          {rows.length === 0 && <p className="px-6 pb-6 text-[14px] text-faint sm:px-7">No cases in this view.</p>}
          {rows.map((c) => {
            const resolved = c.status === "Resolved";
            return (
              <button key={c.id} onClick={() => setOpen(c)} className="group flex items-center gap-3 border-t border-line px-6 py-3.5 text-left transition hover:bg-soft/40 sm:px-7">
                <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: PRIORITY_COLOR[c.priority] }} aria-hidden title={c.priority} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[14px] font-semibold group-hover:text-[var(--purple)]">{c.title}</span>
                    <span className="text-[12px] text-faint">{c.id}</span>
                    {c.confidential && <Lock className="h-3.5 w-3.5 text-faint" aria-label="Confidential" />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <CatChip k={c.category} />
                    <span className="text-[12px] text-muted">{c.confidential ? "Confidential" : c.subject} · {c.team}</span>
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex" title={`Owner · ${c.owner.name}`}>
                  <Avatar src={c.owner.img} name={c.owner.name} size="sm" />
                </div>
                <div className="w-24 shrink-0 text-right"><Sla days={c.slaDays} resolved={resolved} /></div>
                <span className="w-24 shrink-0 text-right"><Badge tone={STATUS_TONE[c.status]} variant="soft" size="sm">{c.status}</Badge></span>
              </button>
            );
          })}
        </div>
      </Card>

      <p className="flex items-center gap-2 text-[13px] text-faint"><ShieldCheck className="h-4 w-4" /> Confidential and ER cases have restricted visibility and are excluded from analytics and AI training.</p>

      {/* detail drawer */}
      <Drawer open={!!open} title={detail?.title} onClose={() => setOpen(null)}>
        {detail && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Eyebrow>{detail.id}</Eyebrow>
                <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">{detail.title}</h2>
              </div>
              {detail.confidential && <span className="flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted"><Lock className="h-3.5 w-3.5" /> Confidential</span>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[detail.status]} variant="soft" size="sm">{detail.status}</Badge>
              <CatChip k={detail.category} />
              <span className="rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(PRIORITY_COLOR[detail.priority]), color: PRIORITY_COLOR[detail.priority] }}>{detail.priority}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">Subject</div><div className="mt-1 text-[14px] font-semibold">{detail.confidential ? "Confidential" : detail.subject}</div><div className="text-[12px] text-faint">{detail.team}</div></div>
              <div className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">SLA</div><div className="mt-1 text-[14px] font-semibold"><Sla days={detail.slaDays} resolved={detail.status === "Resolved"} /></div><div className="text-[12px] text-faint">Opened {detail.opened}</div></div>
            </div>
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-line p-3">
              <Avatar src={detail.owner.img} name={detail.owner.name} size="sm" />
              <div className="min-w-0"><div className="text-[14px] font-semibold">{detail.owner.name}</div><div className="text-[12px] text-faint">Owner · {detail.owner.role}</div></div>
              <span className="ml-auto rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted">{detail.source}</span>
            </div>

            {/* AI summary */}
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[var(--ai-surface)] p-3 text-[14px] leading-relaxed text-muted ring-1 ring-[var(--ai-border)]"><SparkMark size={14} className="mt-0.5 shrink-0" /><span>{detail.aiSummary}</span></div>

            {/* timeline */}
            <h3 className="mt-5 text-[14px] font-bold">Activity</h3>
            <ol className="mt-2 flex flex-col gap-3 border-l border-line pl-4">
              {detail.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-[var(--purple)]" aria-hidden />
                  <div className="text-[14px] text-muted">{t.text}</div>
                  <div className="mt-0.5 text-[12px] text-faint">{t.who} · {t.when}</div>
                </li>
              ))}
            </ol>

            {/* status actions */}
            {detail.status !== "Resolved" ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {statusOrder.filter((s) => s !== detail.status && s !== "Resolved").map((s) => (
                  <Button key={s} variant="secondary" size="sm" onClick={() => setCaseStatus(detail.id, s)}>Move to {s}</Button>
                ))}
                <Button variant="brand" size="sm" onClick={() => setCaseStatus(detail.id, "Resolved")}>Resolve</Button>
              </div>
            ) : (
              <div className="mt-6"><Button variant="secondary" size="sm" onClick={() => setCaseStatus(detail.id, "Open")}>Reopen</Button></div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
