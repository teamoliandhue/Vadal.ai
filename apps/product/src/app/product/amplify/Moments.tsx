"use client";
/* ══════════════════ "...and let employee moments go out" ══════════════════
   The brief's sentence for this pillar has two clauses, and until now every
   feature served the first: the company says something, we ask an employee to
   carry it. Nothing served the second.

   That asymmetry is the whole reason corporate advocacy programmes die. A
   screen that only ever asks you for something is a screen you opt out of. The
   same screen, when it also carries YOUR wins outward, is one you open.

   So a moment outranks the company's pick in the hero. If Neha recognised you
   yesterday, that is the most shareable thing on this page — more shareable
   than anything marketing published, because it is true, recent, and yours.

   Nothing here is invented. A moment is something the product already knows
   happened: kudos from the Recognition wall, a launch from #wins, a
   certification from Grow, an anniversary from the directory. Amplify only
   notices them and offers to carry them further. */
import * as React from "react";
import Image from "next/image";
import { Award, GraduationCap, PartyPopper, Rocket, Sparkles } from "lucide-react";
import { Badge, SparkMark } from "@vadal/design-system";
import type { Moment, MomentKind } from "@/lib/ai/engines/advocacy";
import { Composer } from "./Composer";
import { Eyebrow } from "./parts";

const KIND: Record<MomentKind, { icon: React.ElementType; label: string }> = {
  kudos:         { icon: Award,          label: "Recognition" },
  shipped:       { icon: Rocket,         label: "Shipped" },
  certification: { icon: GraduationCap,  label: "Certification" },
  milestone:     { icon: PartyPopper,    label: "Milestone" },
};

/* ── the hero, when the best thing on this page is the person's own ──
   Composed rather than stacked: image, then the moment, then the reason we
   think it is worth the outside seeing. The reason matters — an unexplained
   suggestion about someone's own public profile feels presumptuous, and one
   sentence of "because Neha said this about you yesterday" turns it into an
   offer. */
export function MomentHero({ moment, onPass }: { moment: Moment; onPass: () => void }) {
  const K = KIND[moment.kind];
  const Icon = K.icon;

  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
      {/* The Aurora hairline the AI dock uses — this pick came from the same engine. */}
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 z-10 h-[2px] opacity-70" />

      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        {moment.image ? (
          <div className="relative min-h-[220px] lg:min-h-full">
            <Image src={moment.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
            {/* A wash off the bottom edge so the badge holds against any photo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
            <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
              <Icon className="h-3.5 w-3.5" /> {K.label}
            </span>
          </div>
        ) : (
          <div
            className="relative hidden min-h-[220px] place-items-center lg:grid lg:min-h-full"
            style={{ background: "radial-gradient(120% 100% at 30% 20%, color-mix(in srgb, var(--client-brand, var(--purple)) 16%, transparent), transparent 68%)" }}
          >
            <Icon className="h-16 w-16 text-[var(--client-brand,var(--purple))] opacity-25" strokeWidth={1.25} />
          </div>
        )}

        <div className="min-w-0 p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="ai-grad grid h-6 w-6 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
            <Eyebrow>Yours to share</Eyebrow>
            <span className="text-[12px] text-faint">· {moment.when}</span>
            <button
              onClick={onPass}
              className="ml-auto flex min-h-[44px] items-center rounded-full px-2.5 text-[12px] font-semibold text-faint transition hover:bg-soft hover:text-ink lg:min-h-[36px]"
            >
              Not this one
            </button>
          </div>

          {/* Weight contrast rather than size alone — the moment is the subject. */}
          <h1 className="mt-3 text-[clamp(20px,2.2vw,26px)] font-bold leading-[1.15] tracking-[-0.02em]">
            {moment.what}
          </h1>

          <p className="mt-2.5 flex items-start gap-1.5 text-[14px] leading-relaxed text-muted">
            <Sparkles className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--ai-accent)]" />
            {moment.why}
          </p>

          <div className="mt-5">
            <Composer subject={{ kind: "moment", moment }} title="Written as you" />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── the rest of them ──────────────────────────────────────────────
   One at a time in the hero, the others in a quiet row. Showing four asks at
   once turns an offer into a backlog. */
export function MomentStrip({
  moments, openId, onOpen,
}: { moments: Moment[]; openId: string | null; onOpen: (id: string | null) => void }) {
  if (moments.length === 0) return null;

  return (
    <div>
      <div className="pb-3">
        <Eyebrow>Also yours</Eyebrow>
        <p className="mt-1 text-[14px] text-muted">
          Things that already happened to you. Nothing goes out unless you send it.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {moments.map((m) => {
          const K = KIND[m.kind];
          const Icon = K.icon;
          const isOpen = openId === m.id;
          const upcoming = /^in \d/.test(m.when);

          return (
            <article key={m.id} className="card-lift overflow-hidden rounded-[22px] border border-line bg-card">
              <button
                onClick={() => onOpen(isOpen ? null : m.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3.5 p-5 text-left"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: "color-mix(in srgb, var(--client-brand, var(--purple)) 11%, transparent)", color: "var(--client-brand, var(--purple))" }}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">{K.label}</span>
                    <span className="text-[12px] text-faint">· {m.when}</span>
                    {upcoming && <Badge tone="brand" variant="soft" size="sm">Coming up</Badge>}
                  </div>
                  <p className="mt-1 text-[15px] font-semibold leading-snug">{m.what}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{m.why}</p>
                </div>

                <span className="shrink-0 self-center text-[13px] font-semibold text-[var(--ai-accent)]">
                  {isOpen ? "Close" : upcoming ? "Draft it" : "Share it"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <Composer subject={{ kind: "moment", moment: m }} title="Written as you" />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
