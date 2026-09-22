"use client";
/* The furniture For you is built from (spec 052).

   A suggestion card comes in two sizes. `lead` is the one Nudge would do
   first if it were you — an Aurora-washed card with a medallion, because the
   answer to "what first?" should be visible from the doorway. Everything else
   is a row: the same information at a third of the height, since eight cards
   shouting at the same volume is a list nobody reads.

   Colour does one job here: it says which part of the product a suggestion
   belongs to. The same accent tints the icon, its ring and the bar that
   appears on hover, so the eye can group the list by module without reading a
   single label. It is never used to rank or to alarm. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock3, EyeOff, type LucideIcon } from "lucide-react";
import { SparkMark } from "@vadal/design-system";

export type Suggestion = {
  id: string;
  section: string;
  icon: LucideIcon;
  title: string;
  why: string;
  cta: string;
  href: string;
  /** Minutes it takes — shown so "later" is a real choice. */
  minutes?: number;
};

/** Section → its accent. Four hues, reused, so the page stays calm. */
const ACCENT: Record<string, string> = {
  Home: "var(--purple)", "For you": "var(--purple)", "Get Started": "var(--viz-2)",
  Kudos: "var(--viz-4)", iLearn: "var(--viz-2)", iThrive: "var(--viz-3)", Social: "var(--viz-3)",
  Pulse: "var(--viz-1)", "Manager hub": "var(--viz-1)", Settings: "var(--viz-1)", Amplify: "var(--viz-1)",
};
export const accentFor = (section: string) => ACCENT[section] ?? "var(--purple)";
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

/** The medallion: the section's icon in its own tint, inside a soft ring. */
function Medallion({ s, size = 44 }: { s: Suggestion; size?: number }) {
  const c = accentFor(s.section);
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-2xl"
      style={{ width: size, height: size, background: tint(c, 13), color: c, boxShadow: `inset 0 0 0 1px ${tint(c, 22)}` }}
    >
      <s.icon style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={1.9} />
    </span>
  );
}

export function SuggestionCard({ s, lead = false, opened = false, delay = 0, onOpen, onLater, onNever }: {
  s: Suggestion; lead?: boolean; opened?: boolean; delay?: number;
  onOpen: (s: Suggestion) => void; onLater: (s: Suggestion) => void; onNever: (s: Suggestion) => void;
}) {
  const c = accentFor(s.section);

  if (lead) {
    return (
      <article
        className="rise relative overflow-hidden rounded-[30px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_30px_70px_-42px_rgba(20,20,40,0.42)] sm:p-8"
        style={{ animationDelay: `${delay}ms` }}
      >
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-80" />
        <span
          aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${tint(c, 26)}, transparent 68%)` }}
        />
        <div className="relative flex items-start gap-5">
          <Medallion s={s} size={60} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>Start here</Eyebrow>
              <span className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: tint(c, 13), color: c }}>{s.section}</span>
              {s.minutes && <span className="inline-flex items-center gap-1 text-[13px] text-faint"><Clock3 className="h-3.5 w-3.5" />{s.minutes} min</span>}
            </div>
            <h2 className="mt-2.5 text-[clamp(21px,2.3vw,27px)] font-bold leading-[1.18] tracking-[-0.022em] text-ink">{s.title}</h2>
            <p className="mt-2.5 flex gap-2.5 text-[16px] leading-relaxed text-muted">
              <SparkMark size={15} tone="gradient" state="still" className="mt-[4px] shrink-0" />
              <span>{s.why}</span>
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link href={s.href} onClick={() => onOpen(s)} className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full bg-[var(--purple)] px-5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_var(--purple)] transition hover:opacity-90">
                {s.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={() => onLater(s)} className="min-h-[46px] rounded-full px-3.5 text-[14px] font-semibold text-muted transition hover:bg-soft hover:text-ink">Not today</button>
              <button onClick={() => onNever(s)} className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-faint transition hover:text-ink">
                <EyeOff className="h-4 w-4" /> Not useful
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rise group relative overflow-hidden rounded-[22px] border border-line bg-card transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_22px_44px_-32px_rgba(20,20,40,0.5)] ${opened ? "opacity-70" : ""}`}
      style={{ animationDelay: `${delay}ms`, borderColor: opened ? undefined : undefined }}
    >
      {/* the section's colour, only on hover — a hint, never a stripe on every row */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ background: c }} />
      <div className="flex items-start gap-3.5 p-4 sm:p-5">
        <Medallion s={s} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[16px] font-bold leading-snug tracking-[-0.01em] text-ink">{s.title}</h3>
            <span className="text-[13px] text-faint">{s.section}{s.minutes ? ` · ${s.minutes} min` : ""}</span>
            {opened && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: tint("var(--success)", 14), color: "var(--success)" }}>
                <Check className="h-3 w-3" /> Opened today
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{s.why}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <Link href={s.href} onClick={() => onOpen(s)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-line px-3.5 text-[14px] font-semibold text-ink transition hover:border-[var(--purple)] hover:bg-soft lg:min-h-[38px]">
              {s.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={() => onLater(s)} className="min-h-[44px] rounded-full px-3 text-[14px] font-medium text-muted transition hover:bg-soft hover:text-ink lg:min-h-[38px]">Not today</button>
            <button onClick={() => onNever(s)} aria-label={`Never suggest: ${s.title}`} className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full text-faint opacity-0 transition hover:bg-soft hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 lg:min-h-[38px] lg:min-w-[38px]">
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** A group heading with a rule that runs to the edge — the page's only divider. */
export function GroupHead({ label, hint, count }: { label: string; hint: string; count: number }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
          {label}
          <span className="rounded-full bg-soft px-1.5 py-px text-[11px] tracking-normal tabular-nums text-muted">{count}</span>
        </h2>
        <span aria-hidden className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <p className="mt-1 text-[13px] text-faint">{hint}</p>
    </div>
  );
}

export function RailCard({ title, hint, children, accent = false }: {
  title: string; hint?: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-line bg-card p-5">
      {accent && <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />}
      <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
      {hint && <p className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

/* The week as seven dots: filled for a day you checked in, ringed for today.
   A streak is a shape before it is a number — this is the shape. */
export function WeekStrip({ streak, checkedInToday }: { streak: number; checkedInToday: boolean }) {
  const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
  const idx = (new Date().getDay() + 6) % 7; // Monday-first
  return (
    <div className="flex items-end gap-1.5">
      {DAYS.map((d, i) => {
        const isToday = i === idx;
        const future = i > idx;
        const done = isToday ? checkedInToday : i < idx && idx - i <= streak;
        /* three states, three weights: a day you checked in is solid, a day you
           missed is filled grey, and a day that has not happened yet is an
           outline — so the week reads as a week, not as five failures. */
        const style = done
          ? { background: "var(--purple)" }
          : future
            ? { background: "transparent", boxShadow: "inset 0 0 0 1.5px var(--line)" }
            : { background: "var(--soft)" };
        return (
          <span key={`${d}${i}`} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={`h-7 w-full rounded-[7px] transition ${isToday ? "ring-2 ring-[var(--purple)] ring-offset-2 ring-offset-[var(--card)]" : ""}`}
              style={style}
              title={done ? "Checked in" : isToday ? "Not yet today" : future ? "Still to come" : "No check-in"}
            />
            <span className={`text-[11px] ${isToday ? "font-bold text-ink" : "text-faint"}`}>{d}</span>
          </span>
        );
      })}
    </div>
  );
}

/** A thin meter for the rail's counted things. */
export function Meter({ value, max, color = "var(--purple)" }: { value: number; max: number; color?: string }) {
  return (
    <span className="block h-1.5 w-full rounded-full bg-soft">
      <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%`, background: color }} />
    </span>
  );
}
