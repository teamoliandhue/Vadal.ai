"use client";
/* ═══════════════════ the stage: Vadal AI, as a chat window ═══════════════════
   The right half of the opening frame, in the one form everyone already reads
   as "an AI": a small chat window — and in it, a conversation that plays.
   A prompt types itself into the composer and sends; the assistant thinks,
   then its answer streams in; a beat; the next one. Eight exchanges, each a
   real record from the workspace and each a door to the product it came
   from. Hover holds it; focusing the composer hands it over — it is a real
   input, and sending opens the real assistant. No taller than the story
   beside it. */
import * as React from "react";
import { ArrowRight, ArrowUp, Maximize2, Mic, Minus, X } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { sentiment } from "@/lib/listen";
import { cases } from "@/lib/cases";
import { findAnswer } from "@/lib/knowledge";
import { managerActions } from "@/lib/manager";
import { courses } from "@/lib/grow";
import { counsellors } from "@/lib/help";
import { suggested as suggestedCampaign } from "@/lib/campaigns";
import type { ProductTile } from "@/lib/tour";

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

/* ── the conversation: a prompt, and what the assistant did about it ────── */
type Exchange = { q: string; a: string; product: string };
const c0 = cases[0];
const leave = findAnswer("How many paid leaves do I have?").answer.replace(/\*\*/g, "").split(",")[0];
const SCRIPT: Exchange[] = [
  { q: "How is the team feeling?", a: `I read 8,486 responses. Net sentiment is +${sentiment.net}, up ${sentiment.netDelta} this quarter.`, product: "Pulse" },
  { q: "Who might leave?", a: `${c0.subject} — 92% flight risk, no 1:1 in six weeks. I opened ${c0.id}; ${c0.owner.name} owns it.`, product: "Cases" },
  { q: "Write up the onboarding win for LinkedIn.", a: "Drafted in your voice. Policy check passed — it's your tap to post.", product: "Amplify" },
  { q: "Ask Line 2 about the new equipment.", a: "Three questions, sent by push at 06:10 — the hour they actually answer.", product: "Pulse" },
  { q: "How many paid leaves do I have?", a: `${leave} — cited from your leave policy.`, product: "Broadcast" },
  { q: "What should I do this week?", a: `${managerActions[0].title}. His sentiment is down 14 pts.`, product: "Managers" },
  { q: "Any burnout signals?", a: `Engineering, down 6 pts. I proposed ${suggestedCampaign.name} — ${suggestedCampaign.predictedLift} predicted lift.`, product: "Broadcast" },
  { q: "Turn the POSH policy into a course.", a: `Done — ${courses[0].lessons.length} lessons, ${courses[0].minutes} minutes, built from the document.`, product: "Grow" },
  { q: "I'm not sleeping well.", a: `I hear you. ${counsellors[0].name} has ${counsellors[0].nextAvailable.toLowerCase()} — context carried, nothing repeated.`, product: "Help" },
];

type Phase = "typing" | "sent" | "thinking" | "answer" | "hold";
const CPS_Q = 34, CPS_A = 58;
const durationOf = (p: Phase, x: Exchange) =>
  p === "typing" ? (x.q.length / CPS_Q) * 1000 + 450
  : p === "sent" ? 420
  : p === "thinking" ? 800
  : p === "answer" ? (x.a.length / CPS_A) * 1000 + 500
  : 2200;
const NEXT: Record<Phase, Phase> = { typing: "sent", sent: "thinking", thinking: "answer", answer: "hold", hold: "typing" };

export function AiStage({ onGo, tiles }: { onGo?: (i: number) => void; tiles: ProductTile[] }) {
  const [i, setI] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("typing");
  const [held, setHeld] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const [q, setQ] = React.useState("");
  const x = SCRIPT[i];
  const paused = held || focused || !open;

  React.useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      if (phase === "hold") setI((k) => (k + 1) % SCRIPT.length);
      setPhase(NEXT[phase]);
    }, durationOf(phase, x));
    return () => window.clearTimeout(t);
  }, [phase, i, paused, x]);

  const jump = () => onGo?.(tiles.find((t) => t.name === x.product)?.index ?? 0);
  const showUser = phase !== "typing";
  const showAssistant = phase === "thinking" || phase === "answer" || phase === "hold";

  if (!open) {
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
        className="ai-stage flex h-[300px] w-full max-w-[400px] flex-col overflow-hidden rounded-[22px] border border-line bg-card text-left shadow-[0_1px_2px_rgba(20,20,40,0.05),0_40px_80px_-40px_rgba(20,20,40,0.45)]"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
      >
        {/* ── header ── */}
        <div className="flex items-center gap-2.5 border-b border-line px-3 py-2">
          <span className="relative grid h-8 w-8 shrink-0 place-items-center">
            <span className="ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={15} tone="solid" state={showAssistant && phase !== "hold" ? "thinking" : "idle"} /></span>
            <span className="absolute -bottom-0.5 -right-1 rounded-[4px] border border-line bg-card px-[3px] text-[8px] font-bold leading-[12px] text-muted">AI</span>
          </span>
          <span className="text-[14px] font-semibold">Vadal</span>
          <span className="ml-1.5 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint"><span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> online</span>
          <span className="ml-auto flex items-center gap-0.5">
            <button type="button" onClick={() => setOpen(false)} aria-label="Minimise" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><Minus className="h-4 w-4" strokeWidth={1.75} /></button>
            <button type="button" onClick={() => ask()} aria-label="Open the assistant" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><Maximize2 className="h-4 w-4" strokeWidth={1.75} /></button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><X className="h-4 w-4" strokeWidth={1.75} /></button>
          </span>
        </div>

        {/* ── the conversation ── */}
        <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden bg-[var(--ai-surface)] px-3.5 pb-1 pt-3 lg:pb-2" aria-live="polite">
          <span aria-hidden className="ai-stage-glow" />
          {showUser && (
            <div key={`u-${i}`} className="ai-card-in relative flex justify-end">
              <p className="max-w-[82%] rounded-2xl rounded-br-md bg-[var(--client-brand,var(--purple))] px-3.5 py-2 text-[13px] leading-snug text-white shadow-sm">{x.q}</p>
            </div>
          )}
          {showAssistant && (
            <div key={`a-${i}`} className="ai-card-in relative flex items-end gap-2">
              <span className="ai-grad mb-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={12} tone="solid" /></span>
              <button type="button" onClick={jump} className="max-w-[86%] rounded-2xl rounded-bl-md bg-card px-3.5 py-2 text-left text-[13px] leading-snug shadow-sm transition hover:shadow-md">
                {phase === "thinking" ? (
                  <span className="inline-flex gap-1 py-1 align-middle"><span className="ai-dot" /><span className="ai-dot [animation-delay:0.15s]" /><span className="ai-dot [animation-delay:0.3s]" /></span>
                ) : (
                  <>
                    <span className="block">{phase === "answer" ? <Typed text={x.a} cps={CPS_A} /> : x.a}</span>
                    {phase === "hold" && <span className="ai-card-in mt-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-[var(--ai-accent)]">Open {x.product} <ArrowRight className="h-3 w-3" /></span>}
                  </>
                )}
              </button>
            </div>
          )}
          <ol className="relative flex items-center justify-center gap-1 lg:mt-1" aria-label="Conversation">
            {SCRIPT.map((s, k) => (
              <li key={s.q}>
                <button type="button" onClick={() => { setI(k); setPhase("typing"); }} aria-label={s.q} aria-current={k === i ? "step" : undefined} className="grid h-11 w-5 place-items-center lg:h-6 lg:w-4">
                  <span className={`block h-[4px] rounded-full transition-all duration-300 ${k === i ? "w-4 bg-[var(--ai-accent)]" : "w-[4px] bg-line"}`} />
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* ── composer: the prompt types itself here, and it is a real input ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()); }}
          className="relative flex items-center gap-2 border-t border-line px-3 py-2"
        >
          <div className="relative min-w-0 flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused || q ? "How can I help you today?" : ""}
              aria-label="Ask Vadal AI"
              className="block h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-faint lg:h-9"
            />
            {!focused && !q && (
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[14px] text-ink">
                {phase === "typing" ? <Typed key={`t-${i}`} text={x.q} cps={CPS_Q} /> : <span className="text-faint">How can I help you today?</span>}
              </span>
            )}
          </div>
          <button type="button" onClick={() => ask()} aria-label="Voice input" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-muted transition hover:text-ink lg:h-9 lg:w-9"><Mic className="h-4 w-4" strokeWidth={1.75} /></button>
          <button type="submit" aria-label="Send" className={`btn-ai grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition lg:h-9 lg:w-9 ${phase === "sent" ? "ai-burst" : ""}`}><ArrowUp className="h-4 w-4" strokeWidth={2.2} /></button>
        </form>
      </div>
    </div>
  );
}
