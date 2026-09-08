"use client";
/* ═══════════════════ Get Started — the tour ═══════════════════
   Under the Vadal.ai group: the assistant's space, where it surfaces what it
   has tailored for the person. This is the first thing there, for anyone seeing
   the product cold — a new joiner, or an investor.

   A tour, not a layout. Three earlier attempts put everything on one screen at
   once — a tile grid, preview cards, a timeline — and each read as a container
   rather than an explanation. A tour is sequential: one idea at a time, the
   real feature demonstrated beneath it, a way into the whole thing, and a map
   on the left so the breadth is visible in a glance without being the content.

   Progress persists, and the tour is role-shaped: a step the person cannot
   open is kept and says so, because "you will never see this — by design" is
   one of the product's strongest claims and belongs in the walkthrough. */
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lock, RotateCcw } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { tourFor } from "@/lib/tour";
import { useViewAs } from "../useViewAs";
import { useTourProgress } from "../useTourProgress";
import { Demo } from "./Demos";

export function GetStarted() {
  const [role] = useViewAs();
  const steps = React.useMemo(() => tourFor(role), [role]);
  const { explored, mark, reset } = useTourProgress();
  const [stepIdx, setStepIdx] = usePersistentState<number>("vadal:tour-step", 0);

  const i = Math.min(Math.max(0, stepIdx), steps.length - 1);
  const step = steps[i];
  const done = steps.filter((s) => explored.includes(s.id)).length;
  const isLast = i === steps.length - 1;

  function go(n: number) {
    setStepIdx(Math.min(Math.max(0, n), steps.length - 1));
  }
  function next() {
    mark(step.id);
    if (!isLast) go(i + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── head: what this is, and how far you are ── */}
      <header className="rise flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-grad grid h-6 w-6 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Vadal.ai · Get started</p>
          </div>
          <h1 className="mt-2 text-[clamp(24px,3vw,32px)] font-bold leading-[1.06] tracking-[-0.025em]">
            A tour of what Vadal does, one idea at a time.
          </h1>
          <p className="mt-2 max-w-[56ch] text-[14.5px] leading-relaxed text-muted">
            Every step shows the real feature on your workspace&apos;s own data, and opens it. Takes
            about four minutes. Your place is saved.
          </p>
        </div>
        <div className="min-w-[200px]">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="font-semibold">{done} of {steps.length} explored</span>
            {done > 0 && (
              <button onClick={() => { reset(); go(0); }} className="flex items-center gap-1 text-faint transition hover:text-ink">
                <RotateCcw className="h-3 w-3" /> Start over
              </button>
            )}
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <span className="ai-grad block h-full rounded-full transition-[width] duration-500" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        {/* ── the map: every step, in a glance ── */}
        <nav aria-label="Tour steps" className="rise rise-1 lg:sticky lg:top-6">
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {steps.map((s) => {
              const isCurrent = s.index === i;
              const isDone = explored.includes(s.id);
              return (
                <li key={s.id} className="shrink-0 lg:shrink">
                  <button
                    onClick={() => go(s.index)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-2xl px-3 text-left transition lg:min-h-[42px] ${
                      isCurrent ? "bg-card shadow-sm ring-1 ring-line" : "hover:bg-soft"
                    }`}
                  >
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums"
                      style={
                        isDone
                          ? { background: "color-mix(in srgb, var(--success) 16%, transparent)", color: "var(--success)" }
                          : isCurrent
                            ? { background: "var(--client-brand, var(--purple))", color: "#fff" }
                            : { background: "var(--soft)", color: "var(--faint)" }
                      }
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : s.index + 1}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[13.5px] ${isCurrent ? "font-semibold" : "text-muted"}`}>{s.title}</span>
                    {s.locked && <Lock className="h-3 w-3 shrink-0 text-faint" aria-label="Not available to your role" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ── the step ── */}
        <article key={step.id} className="rise rise-2 relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
          <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
          <div className="p-6 sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">
              Step {step.index + 1} of {steps.length}{step.section ? ` · ${step.section}` : ""}
            </p>
            <h2 className="mt-2 text-[clamp(22px,2.6vw,30px)] font-bold leading-[1.08] tracking-[-0.022em]">{step.title}</h2>
            <p className="mt-3 max-w-[62ch] text-[15.5px] leading-relaxed text-muted">{step.meaning}</p>

            <div className="mt-6">
              {step.id === "done" ? (
                <div className="rounded-2xl bg-soft p-5">
                  <p className="text-[15px] font-semibold">{done} of {steps.length} steps explored.</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
                    Come back to this space — Vadal.ai will use it to put in front of you what it thinks you should see next.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/product/home"><Button variant="brand" className="min-h-[44px]" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>Go to Home</Button></Link>
                    <Button variant="tertiary" className="min-h-[44px]" leadingIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => { reset(); go(0); }}>Start over</Button>
                  </div>
                </div>
              ) : (
                <Demo id={step.id} />
              )}
            </div>

            {step.locked && step.lockedNote && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-soft px-4 py-3 text-[13px] leading-snug text-muted">
                <Lock className="mt-[3px] h-3.5 w-3.5 shrink-0 text-faint" /> {step.lockedNote}
              </p>
            )}
          </div>

          {/* ── actions ── */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line bg-soft/60 px-6 py-4 sm:px-8">
            <Button variant="tertiary" className="min-h-[44px]" leadingIcon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => go(i - 1)} disabled={i === 0}>
              Back
            </Button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {step.href && !step.locked && (
                <Link href={step.href} onClick={() => mark(step.id)}>
                  <Button variant="secondary" className="min-h-[44px]" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Open {step.section}
                  </Button>
                </Link>
              )}
              {!isLast && (
                <Button variant="brand" className="min-h-[44px]" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />} onClick={next}>
                  {explored.includes(step.id) ? "Next" : "Got it, next"}
                </Button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
