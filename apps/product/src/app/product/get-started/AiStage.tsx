"use client";
/* ═══════════════════ the stage: Vadal AI, as a chat window ═══════════════════
   The right half of the opening frame, in the one form everyone already reads
   as "an AI": a small chat window. Header with the mark, a calm body, a
   composer at the foot that really asks. In the
   body the assistant says what it is doing — one capability after another,
   nine for nine products, each with the real result under it — so the viewer
   learns what it can do without reading a list. Hover holds it. The composer
   opens the real assistant with whatever was typed. */
import * as React from "react";
import { ArrowUp, Maximize2, Mic, Minus, X } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { surveys, sentiment } from "@/lib/listen";
import { cases } from "@/lib/cases";
import { findAnswer } from "@/lib/knowledge";
import { managerActions } from "@/lib/manager";
import { courses } from "@/lib/grow";
import { counsellors } from "@/lib/help";
import type { ProductTile } from "@/lib/tour";

const STEP_MS = 3400;
const ask = (q?: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: q ? { q } : {} }));

/** Types `text` from the moment it mounts; remounting is the reset. */
function Typed({ text, cps = 60, caret = true }: { text: string; cps?: number; caret?: boolean }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setN((k) => (k >= text.length ? k : k + 1)), 1000 / cps);
    return () => window.clearInterval(t);
  }, [text, cps]);
  return <>{text.slice(0, n)}{caret && n < text.length && <span className="ai-caret" />}</>;
}

/* one capability per product, in the products' order — phrase, then the real result */
type Act = { verb: string; phrase: string; result: string; product: string };
const c0 = cases[0];
const leave = findAnswer("How many paid leaves do I have?").answer.replace(/\*\*/g, "").split(",")[0];
const ACTS: Act[] = [
  { verb: "Listening", phrase: "reading 8,486 survey responses", result: `Net sentiment +${sentiment.net} · ${sentiment.comments.toLocaleString()} comments read`, product: "Pulse" },
  { verb: "Predicting", phrase: "spotting a flight risk before it becomes a resignation", result: `${c0.subject} · 92% · no 1:1 in six weeks`, product: "Cases" },
  { verb: "Drafting", phrase: "drafting a post in your voice", result: "LinkedIn draft ready · policy check passed", product: "Amplify" },
  { verb: "Launching", phrase: "launching a three-question pulse to Line 2", result: "3 questions · sent by push at 06:10", product: "Pulse" },
  { verb: "Answering", phrase: "answering from your policy documents", result: `${leave} · cited: Leave policy`, product: "Broadcast" },
  { verb: "Opening", phrase: "opening a case and assigning its owner", result: `${c0.id} · ${c0.owner.name} · SLA ${c0.slaDays}d`, product: "Cases" },
  { verb: "Coaching", phrase: "telling a manager the one thing to do this week", result: `${managerActions[0].title} · ${managerActions[0].due.toLowerCase()}`, product: "Managers" },
  { verb: "Teaching", phrase: "turning a document into a short course", result: `${courses[0].title.split(" — ")[0]} · ${courses[0].lessons.length} lessons · ${courses[0].minutes} min`, product: "Grow" },
  { verb: "Handing off", phrase: "handing off to a counsellor, context carried", result: `${counsellors[0].name} · ${counsellors[0].nextAvailable}`, product: "Help" },
];

export function AiStage({ onGo, tiles }: { onGo?: (i: number) => void; tiles: ProductTile[] }) {
  const [seq, setSeq] = React.useState<[number | null, number]>([null, 0]);
  const [paused, setPaused] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const [q, setQ] = React.useState("");
  const cur = seq[1];
  const go = React.useCallback((n: number) => setSeq(([, c]) => [c, ((n % ACTS.length) + ACTS.length) % ACTS.length]), []);

  React.useEffect(() => {
    if (paused || !open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => go(cur + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [cur, paused, open, go]);

  const act = ACTS[cur];
  const jump = () => onGo?.(tiles.find((t) => t.name === act.product)?.index ?? 0);
  const surveysN = surveys[0].responses.toLocaleString();

  if (!open) {
    /* closed: the launcher pill a chat window collapses to */
    return (
      <div className="flex w-full justify-center lg:justify-end">
        <button type="button" onClick={() => setOpen(true)} className="ai-card-in flex min-h-[48px] items-center gap-2.5 rounded-full border border-line bg-card py-2 pl-2.5 pr-4 shadow-[0_10px_34px_rgba(20,20,25,0.16)] transition hover:-translate-y-0.5">
          <span className="ai-aura ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={16} tone="solid" state="idle" /></span>
          <span className="text-[14px] font-semibold">Vadal <span className="rounded-[4px] border border-line px-1 text-[11px] font-bold text-muted">AI</span></span>
          <span className="text-[13px] text-faint">Open</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center lg:justify-end">
      <div
        className={`ai-stage flex h-[400px] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] border border-line bg-card text-left shadow-[0_1px_2px_rgba(20,20,40,0.05),0_40px_80px_-40px_rgba(20,20,40,0.45)] ${paused ? "is-paused" : ""}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── header ── */}
        <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
          <span className="relative grid h-8 w-8 shrink-0 place-items-center">
            <span className="ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={15} tone="solid" state="idle" /></span>
            <span className="absolute -bottom-0.5 -right-1 rounded-[4px] border border-line bg-card px-[3px] text-[8px] font-bold leading-[12px] text-muted">AI</span>
          </span>
          <span className="text-[14px] font-semibold">Vadal</span>
          <span className="ml-auto flex items-center gap-0.5">
            <button type="button" onClick={() => setOpen(false)} aria-label="Minimise" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><Minus className="h-4 w-4" strokeWidth={1.75} /></button>
            <button type="button" onClick={() => ask()} aria-label="Open the assistant" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><Maximize2 className="h-4 w-4" strokeWidth={1.75} /></button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><X className="h-4 w-4" strokeWidth={1.75} /></button>
          </span>
        </div>

        {/* ── body: the mark, alive; then what it is doing ── */}
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden bg-[var(--ai-surface)] px-5 py-4" aria-live="polite">
          <span aria-hidden className="ai-stage-glow" />
          <button type="button" onClick={jump} className="relative w-full max-w-[320px] rounded-2xl rounded-tl-md bg-card px-3.5 py-2.5 text-left shadow-sm transition hover:shadow-md">
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
              Vadal AI is <span className="inline-flex gap-[3px] align-middle"><span className="ai-dot !h-[4px] !w-[4px]" /><span className="ai-dot !h-[4px] !w-[4px] [animation-delay:0.15s]" /><span className="ai-dot !h-[4px] !w-[4px] [animation-delay:0.3s]" /></span>
            </span>
            <span className="relative mt-0.5 block h-[42px] overflow-hidden">
              {seq[0] !== null && <span key={`out-${seq[0]}`} className="ai-phrase-out ai-text-grad absolute inset-x-0 top-0 text-[15px] leading-[1.35]">{ACTS[seq[0]].phrase}</span>}
              <span key={`in-${cur}`} className="ai-phrase-in ai-text-grad absolute inset-x-0 top-0 text-[15px] leading-[1.35]">{act.phrase}</span>
            </span>
            <span key={`r-${cur}`} className="ai-card-in mt-1 block truncate text-[12.5px] text-muted" style={{ animationDelay: "500ms" }}>
              <span className="text-[var(--ai-accent)]">→ </span><Typed text={act.result} cps={70} caret={false} />
            </span>
          </button>

          <ol className="flex items-center gap-0.5 lg:gap-1" aria-label="What Vadal AI does">
            {ACTS.map((a, i) => {
              const on = i === cur;
              return (
                <li key={a.verb}>
                  <button type="button" onClick={() => go(i)} aria-current={on ? "step" : undefined} aria-label={a.verb} title={a.verb} className="grid h-11 w-6 place-items-center lg:h-6 lg:w-auto lg:px-0.5">
                    <span className={`block h-[4px] overflow-hidden rounded-full transition-all duration-300 ${on ? "w-7 bg-line" : "w-[5px] bg-line"}`}>
                      {on && <span key={`t-${cur}`} className="ai-timer ai-grad block h-full w-full" style={{ "--dur": `${STEP_MS}ms` } as React.CSSProperties} />}
                      {i < cur && <span className="block h-full w-full bg-[var(--ai-accent)] opacity-40" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="sr-only">{surveysN} survey responses read</p>
        </div>

        {/* ── composer: real ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()); }}
          className="border-t border-line px-3.5 pb-3 pt-2.5"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="How can I help you today?"
            aria-label="Ask Vadal AI"
            className="block min-h-[40px] w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
          />
          <div className="mt-1 flex items-center justify-end gap-2">
            <button type="button" onClick={() => ask()} aria-label="Voice input" className="grid h-11 w-11 place-items-center rounded-full border border-line text-muted transition hover:text-ink lg:h-10 lg:w-10"><Mic className="h-4 w-4" strokeWidth={1.75} /></button>
            <button type="submit" aria-label="Send" className="btn-ai grid h-11 w-11 place-items-center rounded-full text-white lg:h-10 lg:w-10"><ArrowUp className="h-4 w-4" strokeWidth={2.2} /></button>
          </div>
        </form>
      </div>
    </div>
  );
}
