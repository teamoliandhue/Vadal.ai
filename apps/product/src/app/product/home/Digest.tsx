"use client";
/* The four digest widgets. Read-only: every line is a way to somewhere else. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { canAccess } from "@/lib/access";
import { LAST_WEEK, LAST_WEEK_LINE, WEEK_AHEAD, WHATS_NEW, YESTERDAY, forRole, type DigestLine } from "@/lib/digest";
import { dayFrom } from "@/lib/home";
import { useViewAs } from "../useViewAs";
import { usePoints } from "../usePointsMode";

function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>,
  );
}

export function WidgetCard({ eyebrow, title, children, className = "" }: { eyebrow: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{eyebrow}</p>
      <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Lines({ items }: { items: DigestLine[] }) {
  const [role] = useViewAs();
  const shown = forRole(items, role).filter((l) => !l.section || canAccess(role, l.section));
  return (
    <ul className="mt-3 divide-y divide-[var(--line)]">
      {shown.map((l) => {
        const body = (
          <>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[17px]" aria-hidden>{l.emoji}</span>
            <span className="min-w-0 flex-1 text-[14px] leading-snug text-muted">{rich(l.text)}</span>
            {l.href && <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--purple)]" />}
          </>
        );
        return (
          <li key={l.id}>
            {l.href
              ? <Link href={l.href} className="group -mx-2 flex min-h-[52px] items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-soft/60">{body}</Link>
              : <div className="flex items-center gap-3 py-2.5">{body}</div>}
          </li>
        );
      })}
    </ul>
  );
}

export function YesterdayWidget() {
  return <WidgetCard eyebrow="Yesterday" title="While you were away"><Lines items={YESTERDAY} /></WidgetCard>;
}

export function WhatsNewWidget() {
  return <WidgetCard eyebrow="What's new" title="Around oliandhue"><Lines items={WHATS_NEW} /></WidgetCard>;
}

export function LastWeekWidget() {
  const [role] = useViewAs();
  const points = usePoints();
  const tiles = forRole(LAST_WEEK, role);
  return (
    <WidgetCard eyebrow="Last week" title="Your week, in short">
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <li key={t.label} className="rounded-2xl bg-soft p-3.5">
            <div className="text-[12px] text-muted">{t.label}</div>
            <div className="mt-0.5 text-[18px] font-bold tracking-tight text-ink">{t.value}</div>
            <div className="mt-0.5 text-[12px] leading-snug text-faint">{t.note}</div>
          </li>
        ))}
        {points && (
          <li className="rounded-2xl bg-soft p-3.5">
            <div className="text-[12px] text-muted">Points</div>
            <div className="mt-0.5 text-[18px] font-bold tracking-tight text-ink">+145</div>
            <div className="mt-0.5 text-[12px] leading-snug text-faint">Most from kudos received</div>
          </li>
        )}
      </ul>
      <p className="mt-4 text-[14px] leading-relaxed text-muted">{rich(LAST_WEEK_LINE)}</p>
    </WidgetCard>
  );
}

export function WeekAheadWidget() {
  const [role] = useViewAs();
  const items = forRole(WEEK_AHEAD, role).filter((i) => !i.section || canAccess(role, i.section));
  const offsets = [...new Set(items.map((i) => i.inDays))].sort((a, b) => a - b);
  return (
    <WidgetCard eyebrow="Your week ahead" title="What's coming">
      <ol className="mt-3 flex flex-col gap-3">
        {offsets.map((n) => {
          const day = dayFrom(n);
          const today = items.filter((i) => i.inDays === n);
          return (
            <li key={day.key} className="flex gap-3">
              <span className="w-12 shrink-0 pt-2.5 text-center">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">{day.short}</span>
                <span className="block text-[12px] tabular-nums text-muted">{day.date}</span>
              </span>
              <ul className="min-w-0 flex-1 space-y-1.5">
                {today.map((i) => (
                  <li key={i.title}>
                    {React.createElement(
                      i.href ? Link : "div",
                      { href: i.href as string, className: `group flex min-h-[52px] items-center gap-3 rounded-2xl border border-line px-3.5 py-2.5 transition ${i.href ? "hover:border-[var(--purple)]/40 hover:bg-soft/50" : ""}` },
                      <CalendarDays className="h-4 w-4 shrink-0 text-faint" />,
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{i.title}</span>
                        <span className="block truncate text-[13px] text-faint">{i.meta}</span>
                      </span>,
                      i.href ? <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--purple)]" /> : null,
                    )}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </WidgetCard>
  );
}
