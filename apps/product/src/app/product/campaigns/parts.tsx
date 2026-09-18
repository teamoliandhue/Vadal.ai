"use client";
/* Shared pieces for Campaigns v3 (spec 047) — the data hook every view reads,
   and the small visual parts that make a campaign recognisable anywhere on
   the page: its status, its icon, and its mini timeline of sends. */
import * as React from "react";
import {
  Bell, CalendarClock, Check, ClipboardList, Mail, MessageCircle, MessageSquare, Newspaper, Pause, Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  campaigns, channels as CHANNELS, covers, daysBetween, fmtDate, objectives, shiftCampaign, spanOf,
  type Campaign, type CampaignStatus, type Step,
} from "@/lib/campaigns";
import { usePersistentState } from "@/lib/usePersistentState";
import { useScope } from "../useViewAs";

/* Today as a local date — toISOString would give yesterday before 05:30 in India. */
const now = new Date();
export const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
export const CH_ICON: Record<string, LucideIcon> = { feed: Newspaper, email: Mail, push: Bell, survey: ClipboardList, whatsapp: MessageCircle, sms: Smartphone, teams: MessageSquare };
export const chLabel = (k: string) => CHANNELS.find((c) => c.key === k)?.label ?? k;
export const objOf = (key: string) => objectives.find((o) => o.key === key) ?? objectives[0];
export const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
export const shortDate = (iso: string) => fmtDate(iso).replace(/^\w+ /, "");
export const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

type Override = { status?: CampaignStatus; shift?: number };

/** Every campaign with pauses and moved dates applied, scoped to what this person may see. */
export function useCampaigns() {
  const [mine, setMine] = usePersistentState<Campaign[]>("vadal:campaigns-mine", []);
  const [over, setOver] = usePersistentState<Record<string, Override>>("vadal:campaign-state", {});
  const { scope, team, role, ready } = useScope("Campaigns");
  const teamScoped = scope === "own-team" && Boolean(team);

  const all = React.useMemo(
    () => [...mine.map((c) => ({ ...c, owner: c.owner ?? "You" })), ...campaigns].map((c) => {
      const o = over[c.id];
      return { ...shiftCampaign(c, o?.shift ?? 0), status: o?.status ?? c.status };
    }),
    [mine, over],
  );
  /* A manager sees what reaches their team — and the manager sprint, which reaches them. */
  const visible = React.useMemo(
    () => all.filter((c) => !teamScoped || covers(c.audience, team!) || (role === "manager" && c.audience === "People managers")),
    [all, teamScoped, team, role],
  );

  return {
    all, visible, ready, team, teamScoped, isAdmin: scope === "all",
    canEdit: (c: Campaign) => !teamScoped || c.owner === "You",
    add: (c: Campaign) => setMine((m) => [c, ...m]),
    setStatus: (id: string, status: CampaignStatus) => setOver((o) => ({ ...o, [id]: { ...o[id], status } })),
    shift: (id: string, days: number) => setOver((o) => ({ ...o, [id]: { ...o[id], shift: (o[id]?.shift ?? 0) + days } })),
  };
}
export type CampaignsState = ReturnType<typeof useCampaigns>;

/* ── status ─────────────────────────────────────────────────────── */

const STATUS: Record<CampaignStatus, { label: string; color: string; icon?: LucideIcon }> = {
  live: { label: "Live", color: "var(--success)" },
  scheduled: { label: "Scheduled", color: "var(--info)", icon: CalendarClock },
  paused: { label: "Paused", color: "var(--warning)", icon: Pause },
  completed: { label: "Finished", color: "var(--muted)", icon: Check },
  draft: { label: "Draft", color: "var(--muted)" },
};
export const statusLabel = (s: CampaignStatus) => STATUS[s].label;

export function StatusPill({ status }: { status: CampaignStatus }) {
  const m = STATUS[status];
  const Icon = m.icon;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: soft(m.color, 12), color: m.color }}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : (
        <span className="relative flex h-2 w-2" aria-hidden>
          {status === "live" && <span className="absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden" style={{ background: m.color }} />}
          <span className="relative h-2 w-2 rounded-full" style={{ background: m.color }} />
        </span>
      )}
      {m.label}
    </span>
  );
}

/* ── the campaign's mark ────────────────────────────────────────── */

export function ObjTile({ objective, size = 44 }: { objective: string; size?: number }) {
  const o = objOf(objective);
  return (
    <span className="grid shrink-0 place-items-center rounded-2xl border border-line bg-soft" style={{ width: size, height: size, fontSize: size * 0.45 }} aria-hidden>
      {o.emoji}
    </span>
  );
}

/* ── mini timeline ──────────────────────────────────────────────────
   One line per campaign: the span of its sends, a dot per send (filled once
   sent, a ring until then, red-ringed when it's a safety send), and today. */
export function MiniTimeline({ c, className = "" }: { c: Campaign; className?: string }) {
  const span = spanOf(c);
  if (!span) return null;
  const total = Math.max(1, daysBetween(span.start, span.end));
  const pos = (d: string) => `${Math.min(100, Math.max(0, (daysBetween(span.start, d) / total) * 100))}%`;
  const showToday = TODAY >= span.start && TODAY <= span.end;
  const doneTo = c.steps.filter((s) => s.done && s.date).map((s) => s.date!).sort().at(-1);
  const progressTo = showToday ? TODAY : doneTo && c.status !== "scheduled" ? doneTo : null;

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-7" role="img" aria-label={`${c.steps.length} sends from ${fmtDate(span.start)} to ${fmtDate(span.end)}${showToday ? `, today is ${fmtDate(TODAY)}` : ""}`}>
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--line)]" />
        {progressTo && <span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/70" style={{ width: pos(progressTo) }} />}
        {c.steps.filter((s) => s.date).map((s, i) => <Dot key={i} step={s} left={pos(s.date!)} />)}
        {showToday && (
          <span className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center" style={{ left: pos(TODAY) }}>
            <span className="h-full w-[2px] rounded-full bg-[var(--purple)]" />
          </span>
        )}
      </div>
      <div className="mt-0.5 flex justify-between text-[11px] tabular-nums text-faint">
        <span>{shortDate(span.start)}</span>
        {showToday && <span className="font-semibold text-[var(--purple)]">Today</span>}
        <span>{shortDate(span.end)}</span>
      </div>
    </div>
  );
}

function Dot({ step, left }: { step: Step; left: string }) {
  const Icon = CH_ICON[step.channel ?? "feed"] ?? Newspaper;
  return (
    <span
      className="group/dot absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left }}
      title={`${fmtDate(step.date!)} · ${step.label} · ${chLabel(step.channel ?? "feed")}${step.critical ? " · safety" : ""}`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${step.done ? "border-ink bg-ink text-[var(--card)]" : "border-ink/40 bg-card text-muted"}`}
        style={step.critical ? { borderColor: "var(--danger)", color: step.done ? undefined : "var(--danger)" } : undefined}
      >
        <Icon className="h-2.5 w-2.5" strokeWidth={2.4} />
      </span>
    </span>
  );
}
