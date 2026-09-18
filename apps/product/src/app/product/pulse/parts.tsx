"use client";
/* Shared furniture for Pulse v2 (spec 049): the state every view reads, and
   the few marks they all draw. */
import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
import type { Survey } from "@/lib/listen";
import {
  addDays, localToday, pulseSurveys, seedFollowUps,
  type FollowUp, type PulseStatus, type PulseSurvey, type Spread,
} from "@/lib/pulse";

export const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
export const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

/* ── state ────────────────────────────────────────────────────────
   Surveys launched here were stored in the old shape (a "when" label, no
   dates). They're read as live, opened today, two weeks to run. */
function fromLegacy(s: Survey, i: number, today: string): PulseSurvey {
  return {
    id: `mine-${i}-${s.name}`, name: s.name, kind: s.type, audience: s.audience, status: "live",
    opens: today, closes: addDays(today, 14), sent: s.sent, responses: s.responses, mine: true,
  };
}

export function usePulse() {
  const today = localToday();
  const [mine, setMine, ready] = usePersistentState<Survey[]>("vadal:surveys-mine", []);
  const [created, setCreated] = usePersistentState<FollowUp[]>("vadal:pulse-followups", []);
  const [patch, setPatch] = usePersistentState<Record<string, Partial<FollowUp>>>("vadal:pulse-followup-state", {});
  const [reminded, setReminded] = usePersistentState<string[]>("vadal:pulse-reminded", []);

  const surveys = [...mine.map((s, i) => fromLegacy(s, i, today)), ...pulseSurveys];
  const followUps = [...created, ...seedFollowUps].map((f) => ({ ...f, ...patch[f.id] }));

  return {
    ready, today, surveys, followUps, reminded,
    launch: (s: Survey) => setMine((m) => [s, ...m]),
    addFollowUp: (f: FollowUp) => setCreated((c) => [f, ...c]),
    updateFollowUp: (id: string, p: Partial<FollowUp>) => setPatch((all) => ({ ...all, [id]: { ...all[id], ...p } })),
    remind: (key: string) => setReminded((r) => [...r, key]),
  };
}
export type PulseState = ReturnType<typeof usePulse>;

/* ── marks ──────────────────────────────────────────────────────── */
const STATUS: Record<PulseStatus, { label: string; color: string }> = {
  live: { label: "Live", color: "var(--success)" },
  scheduled: { label: "Scheduled", color: "var(--purple)" },
  closed: { label: "Closed", color: "var(--muted)" },
};
export function StatusPill({ status }: { status: PulseStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: soft(s.color, 12), color: status === "closed" ? "var(--muted)" : s.color }}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "live" ? "ai-breathe" : ""}`} style={{ background: s.color }} aria-hidden />
      {s.label}
    </span>
  );
}

/** Change since the last round, said in words as well as an arrow. */
export function Delta({ now, before, unit = " pts", quiet = false }: { now: number; before?: number; unit?: string; quiet?: boolean }) {
  if (before == null) return null;
  const d = now - before;
  const Icon = d > 0 ? ArrowUpRight : d < 0 ? ArrowDownRight : Minus;
  const color = quiet ? "var(--muted)" : d > 0 ? "var(--success)" : d < 0 ? "var(--danger)" : "var(--muted)";
  return (
    <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold tabular-nums" style={{ color }}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {d > 0 ? "+" : ""}{d}{unit}
      <span className="sr-only"> since last round</span>
    </span>
  );
}

/* The answer spread. Diverging, centred on neutral: disagree grows left in
   one hue, agree grows right in another, neutral is grey and sits across the
   middle — so a question tipping negative is visible before you read a number. */
export const SPREAD = [
  { key: "sd", label: "Strongly disagree", color: "var(--viz-2)" },
  { key: "d", label: "Disagree", color: "color-mix(in srgb, var(--viz-2) 50%, var(--card))" },
  { key: "n", label: "Neutral", color: "color-mix(in srgb, var(--muted) 30%, var(--card))" },
  { key: "a", label: "Agree", color: "color-mix(in srgb, var(--viz-1) 50%, var(--card))" },
  { key: "sa", label: "Strongly agree", color: "var(--viz-1)" },
] as const;

export function SpreadBar({ spread, label }: { spread: Spread; label: string }) {
  const [hover, setHover] = React.useState<number | null>(null);
  /* offset so the middle of neutral sits on the centre line */
  const left = spread[0] + spread[1] + spread[2] / 2;
  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <div className="relative h-3.5 w-full">
        <span aria-hidden className="absolute inset-y-[-3px] left-1/2 w-px bg-[var(--line)]" />
        <div className="absolute inset-y-0 flex gap-[2px]" style={{ left: `${50 - left / 2}%`, width: "50%" }}>
          {spread.map((v, i) => (
            <span
              key={SPREAD[i].key} tabIndex={0}
              onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              aria-label={`${label}: ${SPREAD[i].label} ${v}%`}
              className={`h-full outline-none transition-opacity ${i === 0 ? "rounded-l-[4px]" : ""} ${i === 4 ? "rounded-r-[4px]" : ""}`}
              style={{ width: `${v}%`, background: SPREAD[i].color, opacity: hover !== null && hover !== i ? 0.45 : 1 }}
            />
          ))}
        </div>
      </div>
      {hover !== null && (
        <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[12px] font-semibold text-[var(--card)] shadow-lg">
          {SPREAD[hover].label} · {spread[hover]}%
        </span>
      )}
    </div>
  );
}

export function SpreadLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Legend">
      {SPREAD.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5 text-[12px] text-muted">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} aria-hidden />{s.label}
        </li>
      ))}
    </ul>
  );
}

/** Response progress — filled to now, a tick where it's heading. */
export function ResponseBar({ rate, projected }: { rate: number; projected?: number }) {
  return (
    <div className="relative h-2 w-full rounded-full bg-soft">
      <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: `${rate}%` }} />
      {projected != null && projected > rate && (
        <span className="absolute inset-y-0 rounded-r-full border-y border-r border-dashed border-[color-mix(in_srgb,var(--purple)_55%,transparent)]" style={{ left: `${rate}%`, width: `${projected - rate}%` }} aria-hidden />
      )}
    </div>
  );
}

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
