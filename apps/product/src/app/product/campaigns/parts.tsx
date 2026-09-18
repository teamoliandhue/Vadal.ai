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
  type Campaign, type CampaignStatus,
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

/* ── send progress ──────────────────────────────────────────────────
   One segment per send — filled once it's gone out, outlined for the next
   one, empty for the rest — and the words that make it unambiguous: how many
   have gone, and what goes next, when. (It replaced a dot timeline whose
   "Today" label didn't sit under the today line and whose dots were
   unlabelled icons.) */
const inDays = (iso: string) => {
  const n = daysBetween(TODAY, iso);
  return n === 0 ? "today" : n === 1 ? "tomorrow" : n < 0 ? `${-n} days ago` : `in ${n} days`;
};

export function SendProgress({ c }: { c: Campaign }) {
  const sent = c.steps.filter((x) => x.done).length;
  const next = c.steps.find((x) => !x.done);
  const span = spanOf(c);
  const NextIcon = CH_ICON[next?.channel ?? "feed"] ?? Newspaper;

  const summary = c.status === "completed"
    ? `All ${c.steps.length} sent${span ? ` · ended ${fmtDate(span.end)}` : ""}`
    : c.status === "scheduled"
      ? `${c.steps.length} sends · starts ${span ? `${fmtDate(span.start)}, ${inDays(span.start)}` : "soon"}`
      : c.status === "paused"
        ? `Paused after ${sent} of ${c.steps.length}`
        : `${sent} of ${c.steps.length} sent${span ? ` · ends ${fmtDate(span.end)}` : ""}`;

  return (
    <div className="min-w-0">
      <ol className="flex h-2 gap-1" aria-label={summary}>
        {c.steps.map((x, i) => {
          const isNext = next === x && c.status !== "completed";
          return (
            <li
              key={i}
              title={`${x.label} · ${x.date ? fmtDate(x.date) : x.when} · ${chLabel(x.channel ?? "feed")}${x.done ? " · sent" : ""}`}
              className="h-full flex-1 rounded-full"
              style={
                x.done ? { background: "var(--purple)" }
                  : isNext ? { boxShadow: "inset 0 0 0 2px var(--purple)", background: soft("var(--purple)", 12) }
                  : { background: "var(--line)" }
              }
            />
          );
        })}
      </ol>
      <p className="mt-2 text-[13px] font-semibold text-ink">{summary}</p>
      {next && c.status !== "completed" && (
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
          <NextIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
          <span className="truncate">Next: <span className="text-ink">{next.label}</span>{next.date ? ` · ${fmtDate(next.date)}, ${inDays(next.date)}` : ""}</span>
        </p>
      )}
    </div>
  );
}
