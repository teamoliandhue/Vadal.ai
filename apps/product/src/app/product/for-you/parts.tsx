"use client";
/* The furniture For you is built from (spec 052).

   A suggestion card comes in two sizes. `lead` is the one Nudge would do
   first if it were you — bigger, with the Aurora hairline the rest of the
   product uses for "this came from the assistant". Everything else is a row:
   the same information, a third of the height, because a list of eight equally
   loud cards is a list nobody reads. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock3, EyeOff, type LucideIcon } from "lucide-react";
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

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function SuggestionCard({ s, lead = false, onLater, onNever }: {
  s: Suggestion; lead?: boolean; onLater: (s: Suggestion) => void; onNever: (s: Suggestion) => void;
}) {
  if (lead) {
    return (
      <article className="relative overflow-hidden rounded-[28px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-36px_rgba(20,20,40,0.3)] sm:p-8">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>Start here</Eyebrow>
          <span className="rounded-full bg-soft px-2.5 py-0.5 text-[12px] font-semibold text-muted">{s.section}</span>
          {s.minutes && <span className="inline-flex items-center gap-1 text-[13px] text-faint"><Clock3 className="h-3.5 w-3.5" />{s.minutes} min</span>}
        </div>
        <h2 className="mt-3 text-[clamp(20px,2.2vw,26px)] font-bold leading-[1.2] tracking-[-0.02em] text-ink">{s.title}</h2>
        <p className="mt-2.5 flex gap-2.5 text-[16px] leading-relaxed text-muted">
          <SparkMark size={15} tone="gradient" state="still" className="mt-[4px] shrink-0" />
          <span>{s.why}</span>
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href={s.href} className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full bg-[var(--purple)] px-5 text-[15px] font-semibold text-white transition hover:opacity-90">
            {s.cta} <ArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={() => onLater(s)} className="min-h-[46px] rounded-full px-3.5 text-[14px] font-semibold text-muted transition hover:bg-soft hover:text-ink">Not today</button>
          <button onClick={() => onNever(s)} className="inline-flex min-h-[46px] items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-faint transition hover:text-ink">
            <EyeOff className="h-4 w-4" /> Not useful
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--lav)] text-[var(--purple)]">
          <s.icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[16px] font-bold leading-snug tracking-tight text-ink">{s.title}</h3>
            <span className="text-[13px] text-faint">{s.section}{s.minutes ? ` · ${s.minutes} min` : ""}</span>
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{s.why}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <Link href={s.href} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-line px-3.5 text-[14px] font-semibold text-ink transition hover:border-[var(--purple)] lg:min-h-[38px]">
              {s.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={() => onLater(s)} className="min-h-[44px] rounded-full px-3 text-[14px] font-medium text-muted transition hover:bg-soft hover:text-ink lg:min-h-[38px]">Not today</button>
            <button onClick={() => onNever(s)} aria-label={`Never suggest: ${s.title}`} className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink lg:min-h-[38px] lg:min-w-[38px]">
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function RailCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border border-line bg-card p-5">
      <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
      {hint && <p className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}
