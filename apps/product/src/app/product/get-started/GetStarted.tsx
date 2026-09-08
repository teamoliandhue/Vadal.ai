"use client";
/* ═══════════════════ Get Started — the story ═══════════════════
   Under the Vadal.ai group: the assistant's space, where it surfaces what it
   has tailored for the person. This is the first thing there, for anyone seeing
   the product cold — a new joiner, or an investor.

   A story, not a wizard. The earlier version was a step list beside a card,
   and it read like setup. This one is scroll-driven: every idea gets a whole
   screen, the headline is the idea, and the live feature — real component,
   real data — is the picture. You move by scrolling, the way you would read
   anything worth reading; the scenes snap so each one lands whole.

   What carries over unchanged: explored means *did* (see useTourProgress),
   progress persists, the role shapes which sections a step can open, and a
   step the person cannot open is kept and says so. */
import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, Circle, Lock, RotateCcw } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { tourFor, TOUR_SEEN_KEY, type TourStepView } from "@/lib/tour";
import { useViewAs } from "../useViewAs";
import { useTourProgress } from "../useTourProgress";
import { Demo, Done } from "./Demos";

/* scene height: the pane below the 65px bar at lg; the viewport between the
   bar and the 56px tab bar below it */
const SCENE_H = "min-h-[calc(100dvh-121px)] lg:min-h-[calc(100dvh-65px)]";

export function GetStarted() {
  const [role] = useViewAs();
  const steps = React.useMemo(() => tourFor(role), [role]);
  const { explored, mark, reset } = useTourProgress();
  const [stepIdx, setStepIdx, stepHydrated] = usePersistentState<number>("vadal:tour-step", 0);
  const [current, setCurrent] = React.useState(0);
  const scenes = React.useRef<(HTMLElement | null)[]>([]);
  const restored = React.useRef(false);
  const done = steps.filter((s) => explored.includes(s.id)).length;

  /* Home lands here once, for anyone who has never seen it. Now they have. */
  React.useEffect(() => {
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "true");
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  /* Which scene is on screen. Measured from scroll position rather than an
     IntersectionObserver: the answer is the same, but this one can never
     stall — and a scene that is on screen must never sit invisible waiting
     for a callback. The scroll container is the pane at lg and the document
     below it; listening to both costs nothing. */
  const measure = React.useCallback(() => {
    const vh = window.innerHeight;
    let best = 0, bestOverlap = -1;
    scenes.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (overlap > vh * 0.2) el.dataset.in = "true";
      if (overlap > bestOverlap) { bestOverlap = overlap; best = i; }
    });
    setCurrent(best);
  }, []);

  React.useEffect(() => {
    const pane = scenes.current[0]?.closest(".pane");
    /* eleven rects per scroll event is cheap; a frame-throttle would only add
       a place for the answer to lag behind the scroll */
    pane?.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      pane?.removeEventListener("scroll", measure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  /* pick up where they left off — once, without animation — then light
     whatever is on screen */
  React.useEffect(() => {
    if (!stepHydrated || restored.current) return;
    restored.current = true;
    if (stepIdx > 0) scenes.current[stepIdx]?.scrollIntoView({ block: "start" });
    measure();
  }, [stepHydrated, stepIdx, measure]);

  /* the scene on screen is remembered, and — if it is an idea rather than an
     action — explored by being read */
  React.useEffect(() => {
    if (!restored.current) return;
    setStepIdx(current);
    const s = steps[current];
    if (s && !s.completesOn) mark(s.id);
  }, [current, steps, setStepIdx, mark]);

  const go = React.useCallback((i: number) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scenes.current[Math.min(Math.max(0, i), steps.length - 1)]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [steps.length]);
  const restart = () => { reset(); go(0); };

  return (
    <div className="relative">
      {/* ── progress: a spine on the right at lg, a hairline under the bar below ── */}
      <nav aria-label="Tour scenes" className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-1 lg:flex">
        <p className="mb-2 mr-1 text-[11px] font-semibold tabular-nums text-faint">{done}/{steps.length}</p>
        {steps.map((s) => {
          const isCurrent = s.index === current;
          const isDone = explored.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => go(s.index)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${s.index + 1}. ${s.title}${isDone ? " (explored)" : ""}`}
              className="group relative grid h-7 w-7 place-items-center"
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: 6,
                  height: isCurrent ? 22 : 6,
                  background: isDone ? "var(--success)" : isCurrent ? "var(--client-brand, var(--purple))" : "color-mix(in srgb, var(--muted) 35%, transparent)",
                }}
              />
              <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-full border border-line bg-card px-2.5 py-1 text-[12px] font-medium opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {s.index + 1} · {s.title}
              </span>
            </button>
          );
        })}
        {done > 0 && (
          <button onClick={restart} className="mt-2 mr-1 flex items-center gap-1 text-[11px] text-faint transition hover:text-ink" aria-label="Start the tour over">
            <RotateCcw className="h-3 w-3" /> Start over
          </button>
        )}
      </nav>
      <div className="fixed inset-x-0 top-[65px] z-20 h-[3px] bg-line/60 lg:hidden" aria-hidden>
        <span className="ai-grad block h-full transition-[width] duration-500" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>

      {/* ── the scenes ── */}
      {steps.map((s) => (
        <Scene
          key={s.id}
          ref={(el) => { scenes.current[s.index] = el; }}
          step={s}
          total={steps.length}
          isExplored={explored.includes(s.id)}
          onNext={() => go(s.index + 1)}
          onOpen={() => mark(s.id)}
        >
          {s.id === "done" ? (
            <Done steps={steps} explored={explored} onRestart={restart} onGo={go} />
          ) : (
            <Demo id={s.id} />
          )}
        </Scene>
      ))}
    </div>
  );
}

/* ── one idea, one screen ─────────────────────────────────────────────────── */
const Scene = React.forwardRef<
  HTMLElement,
  {
    step: TourStepView;
    total: number;
    isExplored: boolean;
    onNext: () => void;
    onOpen: () => void;
    children: React.ReactNode;
  }
>(function Scene({ step, total, isExplored, onNext, onOpen, children }, ref) {
  const first = step.index === 0;
  const last = step.index === total - 1;
  const byDoing = Boolean(step.completesOn) && !step.locked;
  const hue = (step.index * 34 + 250) % 360;
  const n = String(step.index + 1).padStart(2, "0");

  return (
    <section
      ref={ref}
      id={`scene-${step.id}`}
      aria-labelledby={`scene-${step.id}-title`}
      className={`relative flex overflow-hidden lg:snap-start ${SCENE_H} ${first || last ? "items-center" : "items-center"}`}
    >
      {/* light, tinted per scene — the room changes colour as the idea does */}
      <span aria-hidden className="story-blob" style={{ width: 620, height: 620, left: step.index % 2 ? "auto" : "-12%", right: step.index % 2 ? "-10%" : "auto", top: "-18%", background: `hsl(${hue} 85% 62% / 0.16)` }} />
      <span aria-hidden className="story-blob" style={{ width: 460, height: 460, left: step.index % 2 ? "-8%" : "auto", right: step.index % 2 ? "auto" : "-6%", bottom: "-22%", background: `hsl(${(hue + 60) % 360} 85% 62% / 0.12)` }} />

      <div className={`relative mx-auto w-full max-w-[1320px] px-6 py-14 sm:px-10 lg:px-16 lg:py-16 ${first || last ? "" : "grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16"}`}>
        {first ? (
          /* ── the opening: the idea of the whole product ── */
          <div className="mx-auto max-w-[900px] text-center">
            <p className="story-in flex items-center justify-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-faint">
              <span className="ai-grad grid h-6 w-6 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span> Vadal.ai · Get started
            </p>
            <h1 id={`scene-${step.id}-title`} className="story-in story-in-2 mt-6 text-[clamp(34px,5.2vw,68px)] font-bold leading-[1.0] tracking-[-0.035em]">
              A company stays human when every employee has a daily ritual worth keeping.
            </h1>
            <p className="story-in story-in-3 mx-auto mt-6 max-w-[58ch] text-[clamp(16px,1.4vw,20px)] leading-relaxed text-muted">
              …and the people who run it can hear what that ritual produces. Vadal is both halves in one product, with an assistant running through all of it. Ten ideas, each shown live on your own workspace.
            </p>
            <div className="story-in story-in-4 mx-auto mt-10 max-w-[640px]">{children}</div>
            <div className="story-in story-in-4 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button variant="brand" className="min-h-[48px] px-6" trailingIcon={<ArrowDown className="h-4 w-4" />} onClick={onNext}>Start the tour</Button>
              <Link href="/product/home" className="flex min-h-[48px] items-center px-3 text-[14px] font-semibold text-muted transition hover:text-ink">Skip for now</Link>
            </div>
          </div>
        ) : last ? (
          /* ── the close ── */
          <div className="mx-auto w-full max-w-[820px]">
            <p className="story-in text-[13px] font-semibold uppercase tracking-[0.18em] text-faint">{n} — the end</p>
            <h2 id={`scene-${step.id}-title`} className="story-in story-in-2 mt-4 text-[clamp(34px,4.6vw,60px)] font-bold leading-[1.02] tracking-[-0.032em]">{step.title}</h2>
            <p className="story-in story-in-3 mt-5 max-w-[52ch] text-[clamp(16px,1.3vw,19px)] leading-relaxed text-muted">{step.meaning}</p>
            <div className="story-in story-in-4 mt-10">{children}</div>
          </div>
        ) : (
          <>
            {/* ── the idea ── */}
            <div className="min-w-0">
              <p className="story-in flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-faint">
                <span className="ai-text-grad text-[15px] tabular-nums">{n}</span>
                {step.section ?? "Everywhere"}
                {step.locked && <Lock className="h-3.5 w-3.5" aria-label="Not available to your role" />}
              </p>
              <h2 id={`scene-${step.id}-title`} className="story-in story-in-2 mt-4 text-[clamp(34px,4.6vw,60px)] font-bold leading-[1.02] tracking-[-0.032em]">{step.title}</h2>
              <p className="story-in story-in-3 mt-5 max-w-[46ch] text-[clamp(16px,1.3vw,19px)] leading-relaxed text-muted">{step.meaning}</p>

              {step.locked && step.lockedNote && (
                <p className="story-in story-in-3 mt-5 flex max-w-[52ch] items-start gap-2 rounded-2xl border border-line bg-card/70 px-4 py-3 text-[13.5px] leading-snug text-muted backdrop-blur">
                  <Lock className="mt-[3px] h-3.5 w-3.5 shrink-0 text-faint" /> {step.lockedNote}
                </p>
              )}

              <div className="story-in story-in-4 mt-8 flex flex-wrap items-center gap-3">
                {step.href && !step.locked && (
                  <Link href={step.href} onClick={onOpen}>
                    <Button variant="secondary" className="min-h-[46px]" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>Open {step.section}</Button>
                  </Link>
                )}
                <Button variant="tertiary" className="min-h-[46px]" trailingIcon={<ArrowDown className="h-3.5 w-3.5" />} onClick={onNext}>Next</Button>
              </div>
              {byDoing && (
                <p className="story-in story-in-4 mt-4 flex items-center gap-2 text-[13px] text-muted" aria-live="polite">
                  {isExplored ? (
                    <><Check className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" strokeWidth={2.5} /> Explored — you {step.doneLabel}.</>
                  ) : (
                    <><Circle className="h-3.5 w-3.5 shrink-0 text-faint" /> Explored when you {step.actionLabel}{step.href ? " — here, or from the menu" : ""}.</>
                  )}
                </p>
              )}
            </div>

            {/* ── the evidence: the real thing, lit ── */}
            <div className="story-in story-in-3 relative min-w-0 lg:justify-self-end lg:w-full lg:max-w-[600px]">
              <span aria-hidden className="ai-grad absolute -inset-px rounded-[30px] opacity-25 blur-xl" />
              <div className="relative rounded-[28px] border border-line bg-card/85 p-2 shadow-[0_1px_2px_rgba(20,20,40,0.05),0_48px_100px_-44px_rgba(20,20,40,0.5)] backdrop-blur-md sm:p-3">
                {children}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
});
