"use client";
/* ═══════════════════ one day, drawn as a pulse ═══════════════════
   The positioning is "human pulse × daily ritual" and this is that, rendered:
   a heartbeat running from morning to night, the employee's day above it and
   the people team's day below. Every beat is a real section, one click away.
   The assistant is the line — it is the thing that runs through all of it.

   Built this way after a tile grid and a card stack both failed for the same
   reason. Both held content without saying anything. A day says something: it
   is the product's own claim, that this is something people open every day
   rather than once a quarter, made into a picture the eye reads in a glance.

   Layout is five parts of the day as columns so sixteen beats stay legible on
   one screen; on a phone the columns stack and the line turns vertical. The
   line is one SVG stretched to the width with non-scaling stroke, and the beat
   markers are HTML positioned by percentage — the same lesson as DayArea,
   because a circle inside a stretched SVG becomes an ellipse. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { DAY, type Beat, type Lane } from "@/lib/dayline";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

/* A heartbeat across the width: flat, a blip at each column centre, flat.
   Five columns → five blips at 10%, 30%, 50%, 70%, 90%. */
function pulsePath(cols: number, w = 1000, h = 80): string {
  // Blip geometry scaled to the column pitch so eight fit without touching.
  const mid = h / 2;
  let d = `M 0 ${mid}`;
  for (let i = 0; i < cols; i++) {
    const cx = ((i + 0.5) / cols) * w;
    d += ` L ${cx - 30} ${mid}`;
    d += ` L ${cx - 18} ${mid} L ${cx - 12} ${mid - 7} L ${cx - 6} ${mid + 24} L ${cx} ${mid - 28} L ${cx + 5} ${mid + 12} L ${cx + 10} ${mid} L ${cx + 30} ${mid}`;
  }
  d += ` L ${w} ${mid}`;
  return d;
}

function BeatCard({ b, lane }: { b: Beat; lane: Lane }) {
  const Icon = b.icon;
  const you = lane === "you";
  return (
    <Link
      href={b.href}
      title={b.moment}
      className={`group flex min-h-[44px] flex-col rounded-2xl border p-3 transition ${
        you
          ? "border-line bg-card hover:border-[var(--client-brand,var(--purple))]"
          : "border-transparent bg-card/70 hover:bg-card hover:ring-1 hover:ring-line"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={
            you
              ? { background: "color-mix(in srgb, var(--client-brand, var(--purple)) 12%, transparent)", color: "var(--client-brand, var(--purple))" }
              : { background: "var(--soft)", color: "var(--muted)" }
          }
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className="text-[11px] font-semibold tabular-nums tracking-[0.06em] text-faint">{b.time}</span>
        <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <span className="mt-2 truncate text-[13.5px] font-semibold leading-tight transition group-hover:text-[var(--client-brand,var(--purple))]">
        <span className="lg:hidden">{b.section}</span>
        <span className="hidden lg:inline">{b.short ?? b.section}</span>
      </span>
      {/* Only where the card has the width to say it. At eight-across the
          sentence truncated to twenty characters, which is noise, and the line
          cost the row 16px it needed to bring the lower lane above the fold.
          The title attribute carries it on hover everywhere. */}
      <p className="mt-1 text-[12px] leading-snug text-muted lg:hidden">{b.moment}</p>
      {b.live && (
        <span className="mt-2 inline-flex w-fit max-w-full truncate rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink">
          {b.live}
        </span>
      )}
    </Link>
  );
}

export function DayLine() {
  const cols = 8;
  const path = React.useMemo(() => pulsePath(cols), [cols]);

  return (
    <section className="rise rise-1 mt-8" aria-labelledby="dayline-title">
      {/* ── the claim ── */}
      {/* Kept to ~100px on purpose. The first version spent 200px on a two-line
          claim and a paragraph, which pushed the pulse and the whole people-team
          lane below a 900px fold — the picture was there and nobody arriving
          could see it. */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-1">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">One day with Vadal</p>
          <h2 id="dayline-title" className="mt-1.5 text-[clamp(18px,1.9vw,22px)] font-bold leading-[1.15] tracking-[-0.018em]">
            A daily ritual for every employee — and the pulse it gives the people who run the company.
          </h2>
        </div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] border border-line bg-card" /> Your day, above the line</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-soft ring-1 ring-line" /> What the people team hears, below</span>
          <span className="text-faint">Tap any beat to open it.</span>
        </p>
      </div>

      {/* ── the day ── */}
      <div className="mt-4 overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
        {/* ── lane: you ── */}
        <LaneRow lane="you" />

        {/* ── the pulse — the assistant, running through the whole day ── */}
        <div className="relative">
          <svg
            className="block h-[56px] w-full lg:h-[64px]"
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="pulse-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="var(--client-brand, var(--purple))" stopOpacity="0.35" />
                <stop offset="0.5" stopColor="var(--ai-accent)" stopOpacity="1" />
                <stop offset="1" stopColor="var(--client-brand, var(--purple))" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path d={path} fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path
              d={path}
              fill="none"
              stroke="url(#pulse-grad)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="draw-animate"
              pathLength={1600}
            />
          </svg>

          {/* the label sits ON the line, at its centre — this is what the line is */}
          <button
            onClick={() => ask("What can you do for me today?")}
            className="absolute left-1/2 top-1/2 flex min-h-[44px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-[var(--ai-border)] bg-[var(--ai-surface)] px-3.5 text-[12.5px] font-semibold text-[var(--ai-accent)] shadow-sm transition hover:shadow-md lg:min-h-[36px]"
          >
            <SparkMark size={13} tone="solid" />
            <span className="whitespace-nowrap">Vadal, all day — ask it anything</span>
          </button>
        </div>

        {/* ── lane: the people team ── */}
        <LaneRow lane="team" />
      </div>

      <p className="mt-3 px-1 text-[12px] leading-snug text-faint">
        Numbers in the chips are live from each section&apos;s own data. Role decides what exists — a
        line operator does not see the lower lane at all, which is the point.
      </p>
    </section>
  );
}

function LaneRow({ lane }: { lane: Lane }) {
  const you = lane === "you";
  const [role] = useViewAs();
  /* Filtered through the same gate as the sidebar. The footnote under this
     component says a line operator does not see the lower lane, and for a
     while that was a claim the component did not keep: every beat rendered
     for every role and the gate only bit after the click. Now the day itself
     is role-shaped, which is the more convincing demonstration anyway. */
  const beats = DAY
    .flatMap((p) => p.beats.filter((b) => b.lane === lane && canAccess(role, b.section)))
    .sort((a, b) => a.time.localeCompare(b.time));

  if (beats.length === 0) {
    return (
      <div className="bg-soft/40 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">The people team&apos;s day</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          Below the line is what the people team hears — Pulse, sentiment, cases. Your role
          doesn&apos;t have those sections, and that is by design: nothing here reaches a manager
          or HR without your say-so.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${you ? "bg-card" : "bg-soft/40"}`}>
      <div className="flex items-center gap-2 px-5 pt-3.5">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${you ? "text-[var(--client-brand,var(--purple))]" : "text-faint"}`}>
          {you ? "Your day" : "The people team's day"}
        </span>
        <span className="hidden text-[11px] text-faint lg:inline">· {beats[0].time} → {beats[beats.length - 1].time}</span>
      </div>
      <div
        className="grid gap-2.5 px-5 pb-4 pt-2.5 sm:grid-cols-2 lg:gap-2"
        style={{ ["--cols" as string]: beats.length }}
        data-cols={beats.length}
      >
        {beats.map((b) => <BeatCard key={b.section} b={b} lane={lane} />)}
      </div>
    </div>
  );
}
