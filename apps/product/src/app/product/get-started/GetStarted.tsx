"use client";
/* ═══════════════════ Get Started — the story ═══════════════════
   Under the Vadal.ai group: the assistant's space, where it surfaces what it
   has tailored for the person. This is the first thing there, for anyone seeing
   the product cold — a new joiner, or an investor.

   A story, not a wizard. The earlier version was a step list beside a card,
   and it read like setup. This one is scroll-driven: every idea gets a whole
   screen, the headline is the idea, and the live feature — real component,
   real data, inside a window that says which part of the product it is — is
   the picture. You move by scrolling, arrow keys, or not at all: Present mode
   turns the pages itself, for a demo where the hands are busy talking.

   What carries over unchanged: explored means *did* (see useTourProgress),
   progress persists, the role shapes which sections a step can open, and a
   step the person cannot open is kept and says so. */
import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, Circle, Lock, Pause, Play, RotateCcw } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { tourFor, TOUR_SEEN_KEY, type TourStepView } from "@/lib/tour";
import { org } from "@/lib/data";
import { useViewAs } from "../useViewAs";
import { useTourProgress } from "../useTourProgress";
import { Demo, Done } from "./Demos";

/* scene height: the pane below the 65px bar at lg; the viewport between the
   bar and the 56px tab bar below it */
const SCENE_H = "min-h-[calc(100dvh-121px)] lg:min-h-[calc(100dvh-65px)]";
/** seconds a scene stays on screen in Present mode */
const PRESENT_SECONDS = 9;

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function GetStarted() {
  const [role] = useViewAs();
  const steps = React.useMemo(() => tourFor(role), [role]);
  const { explored, mark, reset } = useTourProgress();
  const [stepIdx, setStepIdx, stepHydrated] = usePersistentState<number>("vadal:tour-step", 0);
  const [current, setCurrent] = React.useState(0);
  const [presenting, setPresenting] = React.useState(false);
  const scenes = React.useRef<(HTMLElement | null)[]>([]);
  const restored = React.useRef(false);
  const done = steps.filter((s) => explored.includes(s.id)).length;
  const last = steps.length - 1;

  /* Home lands here once, for anyone who has never seen it. Now they have. */
  React.useEffect(() => {
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "true");
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  /* Which scene is on screen, measured from scroll position rather than an
     IntersectionObserver: the answer is the same, but this one can never
     stall — and a scene that is on screen must never sit invisible waiting
     for a callback. Each scene also learns how far it is from centre (--p),
     which its picture uses to drift a little slower than the page. */
  const measure = React.useCallback(() => {
    const vh = window.innerHeight;
    let best = 0, bestOverlap = -1;
    scenes.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (overlap > vh * 0.2) el.dataset.in = "true";
      el.style.setProperty("--p", Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)).toFixed(3));
      if (overlap > bestOverlap) { bestOverlap = overlap; best = i; }
    });
    setCurrent(best);
  }, []);

  React.useEffect(() => {
    const pane = scenes.current[0]?.closest(".pane");
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
    scenes.current[Math.min(Math.max(0, i), last)]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [last]);
  const restart = () => { setPresenting(false); reset(); go(0); };

  /* keys: the story reads like slides, so it turns like slides */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const next = ["ArrowRight", "ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const prev = ["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if (next) { e.preventDefault(); setPresenting(false); go(current + 1); }
      else if (prev) { e.preventDefault(); setPresenting(false); go(current - 1); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(last); }
      else if (e.key === "Escape" && presenting) setPresenting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go, last, presenting]);

  /* Present: the pages turn themselves; any hand on the wheel stops it */
  React.useEffect(() => {
    if (!presenting) return;
    const t = window.setTimeout(() => {
      go(current + 1);
      if (current + 1 >= last) setPresenting(false);
    }, PRESENT_SECONDS * 1000);
    const stop = () => setPresenting(false);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, [presenting, current, last, go]);

  return (
    <div className="relative">
      {/* ── progress: a spine on the right at lg, a hairline under the bar below ── */}
      <nav aria-label="Tour scenes" className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-1 lg:flex">
        <button
          onClick={() => { if (!presenting && current >= last) go(0); setPresenting((p) => !p); }}
          aria-pressed={presenting}
          className={`mb-3 flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition ${presenting ? "border-transparent ai-grad text-white shadow-md" : "border-line bg-card text-muted hover:text-ink"}`}
        >
          {presenting ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {presenting ? "Pause" : "Present"}
        </button>
        <p className="mb-1 mr-1 text-[11px] font-semibold tabular-nums text-faint">{done}/{steps.length}</p>
        {steps.map((s) => {
          const isCurrent = s.index === current;
          const isDone = explored.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => { setPresenting(false); go(s.index); }}
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
      {presenting && (
        <p role="status" className="fixed bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-card/90 px-3.5 py-2 text-[12px] font-medium text-muted shadow-lg backdrop-blur lg:flex">
          <span className="ai-grad h-2 w-2 animate-pulse rounded-full" /> Presenting · {PRESENT_SECONDS}s per idea · scroll or press any key to stop
        </p>
      )}

      {/* ── the scenes ── */}
      {steps.map((s) => (
        <Scene
          key={s.id}
          ref={(el) => { scenes.current[s.index] = el; }}
          step={s}
          total={steps.length}
          isExplored={explored.includes(s.id)}
          onNext={() => { setPresenting(false); go(s.index + 1); }}
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
      className={`relative flex items-center overflow-hidden lg:snap-start ${SCENE_H}`}
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
              …and the people who run it can hear what that ritual produces. Vadal is both halves in one product: seven pillars — Pulse, Connect, Amplify, Thrive, Broadcast, Grow, One-to-One Help — with one AI layer running through all of them. Each shown live on your own workspace.
            </p>
            <div className="story-in story-in-4 mx-auto mt-10 max-w-[640px]">{children}</div>
            <div className="story-in story-in-4 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button variant="brand" className="min-h-[48px] px-6" trailingIcon={<ArrowDown className="h-4 w-4" />} onClick={onNext}>Start the tour</Button>
              <Link href="/product/home" className="flex min-h-[48px] items-center px-3 text-[14px] font-semibold text-muted transition hover:text-ink">Skip for now</Link>
            </div>
            <p className="story-in story-in-4 mt-8 hidden flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint lg:flex" aria-hidden>
              Scroll, or use the arrow keys <ArrowDown className="story-cue mt-1 h-4 w-4" />
            </p>
          </div>
        ) : last ? (
          /* ── the close ── */
          <div className="relative mx-auto w-full max-w-[820px]">
            <span aria-hidden className="story-num">{n}</span>
            <div className="relative">
              <p className="story-in text-[13px] font-semibold uppercase tracking-[0.18em] text-faint">{n} — the end</p>
              <h2 id={`scene-${step.id}-title`} className="story-in story-in-2 mt-4 text-[clamp(34px,4.6vw,60px)] font-bold leading-[1.02] tracking-[-0.032em]">{step.title}</h2>
              <p className="story-in story-in-3 mt-5 max-w-[52ch] text-[clamp(16px,1.3vw,19px)] leading-relaxed text-muted">{step.meaning}</p>
              <div className="story-in story-in-4 mt-10">{children}</div>
            </div>
          </div>
        ) : (
          <>
            {/* ── the idea ── */}
            <div className="relative min-w-0">
              <span aria-hidden className="story-num">{n}</span>
              <div className="relative">
                <p className="story-in flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold uppercase tracking-[0.18em] text-faint">
                  <span className="ai-text-grad text-[15px] tabular-nums">{n}</span>
                  {step.pillar ? (
                    <>
                      <span className="text-ink">{step.pillar.n <= 7 ? `Pillar ${step.pillar.n} · ` : ""}{step.pillar.name}</span>
                      <span className="normal-case tracking-normal">{step.pillar.tag}</span>
                    </>
                  ) : (
                    step.section ?? "Everywhere"
                  )}
                  {step.locked && <Lock className="h-3.5 w-3.5" aria-label="Not available to your role" />}
                </p>
                <h2 id={`scene-${step.id}-title`} className="story-in story-in-2 mt-4 text-[clamp(34px,4.6vw,60px)] font-bold leading-[1.02] tracking-[-0.032em]">{step.title}</h2>
                <p className="story-in story-in-3 mt-5 max-w-[46ch] text-[clamp(16px,1.3vw,19px)] leading-relaxed text-muted">{step.meaning}</p>

                {step.partsView.length > 0 && (
                  <ul className="story-in story-in-3 mt-5 flex flex-wrap gap-1.5" aria-label="Sections in this pillar">
                    {step.partsView.map((p) => (
                      <li key={p.label}>
                        {p.locked ? (
                          <span className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-dashed border-line px-3 text-[12.5px] text-faint" title="Not available to your role"><Lock className="h-3 w-3" /> {p.label}</span>
                        ) : (
                          <Link href={p.href} onClick={onOpen} className="flex min-h-[44px] items-center rounded-full border border-line bg-card/80 px-3 text-[12.5px] font-medium transition hover:border-[var(--client-brand,var(--purple))] hover:text-ink lg:min-h-[36px]">{p.label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

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
            </div>

            {/* ── the evidence: a window into the real product, lit ── */}
            <div className="story-parallax relative min-w-0 lg:w-full lg:max-w-[600px] lg:justify-self-end">
              <div className="story-in story-in-3 relative">
                <span aria-hidden className="ai-grad absolute -inset-1 rounded-[32px] opacity-25 blur-2xl" />
                <div className="relative overflow-hidden rounded-[28px] border border-line bg-card/85 shadow-[0_1px_2px_rgba(20,20,40,0.05),0_48px_100px_-44px_rgba(20,20,40,0.5)] backdrop-blur-md">
                  <div className="flex items-center gap-2 border-b border-line/70 px-4 py-2.5 text-[12px]">
                    <span className="ai-grad grid h-5 w-5 place-items-center rounded-full"><SparkMark size={11} tone="solid" /></span>
                    <span className="font-semibold">Vadal</span>
                    <span className="text-faint">· {step.pillar?.name ?? step.section ?? "Assistant"}</span>
                    <span className="ml-auto flex items-center gap-1.5 text-faint"><span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Live · {org.name}</span>
                  </div>
                  <div className="flex min-h-[220px] flex-col justify-center p-3 sm:p-4">{children}</div>
                </div>
                <p className="mt-3 text-[12px] leading-snug text-faint">The real component on real data — what you would see in {step.pillar?.name ?? step.section ?? "the product"} right now, not a picture of it.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
});
