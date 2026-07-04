"use client";
/* CAMPAIGNS — the "Engage" interventions hub. An AI-suggested next campaign,
   an active/scheduled list with reach·participation·lift, launch-from-template,
   a lift-by-campaign impact view, and a detail drawer with the step timeline +
   AI readout. Same Lumen shell + Aurora AI accents as Recognition/Surveys.
   Seeded data (lib/campaigns). */
import * as React from "react";
import { Bell, ClipboardList, Mail, Newspaper, Plus, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  campaigns, campaignStats, objectives, suggested, templates, type Campaign, type CampaignStatus,
} from "@/lib/campaigns";
import { CampaignBuilder, type CampaignSeed } from "./CampaignBuilder";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const objOf = (key: string) => objectives.find((o) => o.key === key) ?? objectives[0];
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const CH_ICON: Record<string, LucideIcon> = { feed: Newspaper, email: Mail, push: Bell, survey: ClipboardList };
const STATUS_TONE: Record<CampaignStatus, BadgeTone> = { live: "success", scheduled: "info", completed: "neutral", draft: "warning" };
const STATUS_LABEL: Record<CampaignStatus, string> = { live: "Live", scheduled: "Scheduled", completed: "Completed", draft: "Draft" };
const FILTERS = ["All", "Live", "Scheduled", "Completed"] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
function ObjChip({ objective }: { objective: string }) {
  const o = objOf(objective);
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(o.color), color: o.color }}><span aria-hidden>{o.emoji}</span> {o.label}</span>;
}
function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value}%`, background: color }} /></span>
      <span className="text-[14px] font-bold tabular-nums">{value}%</span>
    </div>
  );
}

export function CampaignsHub() {
  const [mine, setMine] = usePersistentState<Campaign[]>("vadal:campaigns-mine", []);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = React.useState<Campaign | null>(null);
  const [builder, setBuilder] = React.useState<CampaignSeed>(null);

  const all = [...mine, ...campaigns];
  const rows = all.filter((c) => filter === "All" || STATUS_LABEL[c.status] === filter);
  const done = all.filter((c) => c.lift > 0).sort((a, b) => b.lift - a.lift);
  const maxLift = Math.max(...done.map((c) => c.lift), 1);

  const kpis: [string, string, string?][] = [
    ["Active campaigns", String(campaignStats.active + mine.filter((c) => c.status === "live").length)],
    ["Avg participation", `${campaignStats.avgParticipation}%`],
    ["Avg lift", `+${campaignStats.avgLift}`, "pts"],
    ["People reached", campaignStats.reached],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Engage</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Campaigns</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Launch interventions that move the needle — wellness weeks, 1:1 sprints, recognition pushes — and measure the lift.</p>
          </div>
          <Button variant="brand" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setBuilder({ name: "", objective: objectives[0].key })}>New campaign</Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 lg:grid-cols-4">
          {kpis.map(([label, val, unit]) => (
            <div key={label}>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</div>
              <div className="mt-1 flex items-baseline gap-1"><span className="text-[22px] font-bold tracking-tight">{val}</span>{unit && <span className="text-[12px] font-semibold text-faint">{unit}</span>}</div>
            </div>
          ))}
        </div>
      </header>

      {/* AI suggested next campaign */}
      <section className="rise relative overflow-hidden rounded-[26px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /><Eyebrow>Vadal suggests · next campaign</Eyebrow></div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-bold tracking-tight">{suggested.name}</h2>
              <ObjChip objective={suggested.objective} />
              <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-muted">Predicted {suggested.predictedLift} pts</span>
            </div>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">{suggested.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="brand" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => setBuilder({ name: suggested.name, objective: suggested.objective, audience: suggested.audience, duration: suggested.window, steps: suggested.steps })}>Build this campaign</Button>
              <Button variant="tertiary" size="sm" onClick={() => ask(`Why are you suggesting the "${suggested.name}" campaign?`)}>Why this?</Button>
            </div>
          </div>
        </div>
      </section>

      {/* active & scheduled */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Eyebrow>Programs</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Active &amp; scheduled</h2></div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-[14px] font-semibold transition ${filter === f ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 -mx-2 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint">{["Campaign", "Audience", "Status", "Participation", "Lift", ""].map((h, i) => <th key={i} className="px-2 pb-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((c) => {
                const o = objOf(c.objective);
                return (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2"><span aria-hidden>{o.emoji}</span><span className="text-[14px] font-semibold">{c.name}</span></div>
                      <div className="mt-0.5 text-[12px] text-faint">{c.window}</div>
                    </td>
                    <td className="px-2 py-3 text-[14px] text-muted">{c.audience}</td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[c.status]} variant="soft" size="sm">{STATUS_LABEL[c.status]}</Badge></td>
                    <td className="px-2 py-3">{c.status === "scheduled" || c.participation === 0 ? <span className="text-[12px] text-faint">—</span> : <Meter value={c.participation} color={c.participation >= 60 ? "var(--success)" : c.participation >= 40 ? "var(--warning)" : "var(--danger)"} />}</td>
                    <td className="px-2 py-3">{c.lift > 0 ? <span className="text-[14px] font-bold tabular-nums" style={{ color: o.color }}>+{c.lift}</span> : <span className="text-[12px] text-faint">—</span>}</td>
                    <td className="px-2 py-3 text-right"><button onClick={() => setOpen(c)} className="text-[12px] font-semibold text-[var(--purple)] hover:underline">View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* templates */}
      <div className="flex flex-col gap-3">
        <Eyebrow>Launch from a template</Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => {
            const o = objOf(t.objective);
            return (
              <div key={t.key} className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold"><span aria-hidden>{o.emoji}</span>{t.name}</span>
                  <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-medium text-faint">{t.duration}</span>
                </div>
                <p className="mt-1 flex-1 text-[14px] leading-relaxed text-muted">{t.desc}</p>
                <Button variant="secondary" size="sm" className="mt-3 self-start" onClick={() => setBuilder({ name: t.name, objective: t.objective, duration: t.duration })}>Use template</Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* impact */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><Eyebrow>Impact · engagement lift</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What actually moved the needle</h2></div>
          <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Which campaigns drove the most engagement lift, and what should I run next?")}>Ask Vadal</Button>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {done.map((c) => {
            const o = objOf(c.objective);
            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-[14px] font-medium">{c.name}</span>
                <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(c.lift / maxLift) * 100}%`, background: o.color }} /></span>
                <span className="w-12 shrink-0 text-right text-[14px] font-bold tabular-nums" style={{ color: o.color }}>+{c.lift}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[12px] text-faint">Lift = engagement-point change vs the audience baseline over the campaign window.</p>
      </Card>

      {/* detail drawer */}
      <Drawer open={!!open} title={open?.name} onClose={() => setOpen(null)}>
        {open && (
          <>
            <Eyebrow>Campaign</Eyebrow>
            <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">{open.name}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[open.status]} variant="soft" size="sm">{STATUS_LABEL[open.status]}</Badge>
              <ObjChip objective={open.objective} />
              <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted">{open.window}</span>
            </div>
            <p className="mt-3 text-[14px] text-muted">Audience · <span className="font-medium text-ink">{open.audience}</span></p>

            <div className="mt-3 flex flex-wrap gap-2">
              {open.channels.map((k) => { const Icon = CH_ICON[k]; return <span key={k} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold text-muted"><Icon className="h-3.5 w-3.5" /> {k[0].toUpperCase() + k.slice(1)}</span>; })}
            </div>

            {open.lift > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[["Reach", `${open.reach}%`], ["Participation", `${open.participation}%`], ["Lift", `+${open.lift}`]].map(([l, v]) => (
                  <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">{l}</div><div className="mt-1 text-[18px] font-bold tabular-nums">{v}</div></div>
                ))}
              </div>
            )}

            <h3 className="mt-5 text-[14px] font-bold">Plan</h3>
            <ol className="mt-2 space-y-2.5">
              {open.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${s.done ? "bg-[var(--success)] text-white" : "border border-line text-faint"}`}>{s.done ? "✓" : i + 1}</span>
                  <span className="min-w-0 flex-1"><span className={`block text-[14px] ${s.done ? "text-muted line-through decoration-line" : "font-medium"}`}>{s.label}</span><span className="block text-[12px] text-faint">{s.when}</span></span>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[var(--ai-surface)] p-3 text-[14px] leading-relaxed text-muted ring-1 ring-[var(--ai-border)]"><SparkMark size={14} className="mt-0.5 shrink-0" /><span>{open.aiReadout}</span></div>
            <Button variant="brand" className="mt-5" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`How is the "${open.name}" campaign performing, and what should I do next?`)}>Ask Vadal about this</Button>
          </>
        )}
      </Drawer>

      <CampaignBuilder seed={builder} onClose={() => setBuilder(null)} onLaunch={(c) => setMine((m) => [c, ...m])} />
    </div>
  );
}
