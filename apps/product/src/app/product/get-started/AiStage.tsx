"use client";
/* ═══════════════════ the stage: Vadal.ai, working ═══════════════════
   The right half of the opening frame. "One AI that acts" is the claim on the
   left; this is where it is seen. The assistant does one thing, then the next,
   until the viewer has watched all nine — one capability per product, each
   with its own live artifact drawn from the workspace's real data. A living
   mark at the top, a phrase that turns like a page, an artifact that builds
   itself, and a track of nine underneath with a timer on the current one.
   Hover holds it. Any pip, phrase or artifact is a door to that product. */
import * as React from "react";
import { BookOpen, ShieldCheck } from "lucide-react";
import { Avatar, SparkMark } from "@vadal/design-system";
import { surveys, sentiment } from "@/lib/listen";
import { cases } from "@/lib/cases";
import { myMoments, PLATFORM_MARK } from "@/lib/amplify";
import { findAnswer } from "@/lib/knowledge";
import { managerActions, coachingNudges, reports } from "@/lib/manager";
import { courses } from "@/lib/grow";
import { counsellors } from "@/lib/help";
import type { ProductTile } from "@/lib/tour";

const STEP_MS = 3600;

/** Types `text` from the moment it mounts; remounting is the reset. */
function Typed({ text, cps = 60 }: { text: string; cps?: number }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setN((k) => (k >= text.length ? k : k + 1)), 1000 / cps);
    return () => window.clearInterval(t);
  }, [text, cps]);
  return <>{text.slice(0, n)}{n < text.length && <span className="ai-caret" />}</>;
}

/* ── the nine artifacts ─────────────────────────────────────────────────── */
function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`ai-card-in rounded-2xl border border-line bg-card/80 p-3.5 backdrop-blur ${className}`}>{children}</div>;
}
function Tiny({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[11.5px] text-faint">{children}</p>;
}
function Initials({ name }: { name: string }) {
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-soft text-[11px] font-bold text-muted">{name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2)}</span>;
}

function Listening() {
  const rows = [
    { l: "Positive", v: sentiment.positive, c: "var(--success)" },
    { l: "Neutral", v: sentiment.neutral, c: "color-mix(in srgb, var(--muted) 45%, transparent)" },
    { l: "Negative", v: sentiment.negative, c: "var(--danger)" },
  ];
  return (
    <Frame>
      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={r.l} className="flex items-center gap-3 text-[12.5px]">
            <span className="w-14 shrink-0 text-muted">{r.l}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-soft"><span className="ai-bar block h-full rounded-full" style={{ width: `${r.v}%`, background: r.c, animationDelay: `${i * 120}ms` }} /></span>
            <span className="w-8 shrink-0 text-right font-semibold tabular-nums">{r.v}%</span>
          </li>
        ))}
      </ul>
      <Tiny>{surveys[0].responses.toLocaleString()} responses · {sentiment.comments.toLocaleString()} comments read · net +{sentiment.net}</Tiny>
    </Frame>
  );
}

function Predicting() {
  const c = cases[0];
  const r = 17, circ = 2 * Math.PI * r, pct = 92;
  return (
    <Frame>
      <div className="flex items-center gap-3">
        <Initials name={c.subject} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[13.5px] font-semibold">{c.subject} <span className="font-normal text-faint">· {c.team}</span></p>
          <p className="text-[12px] text-muted">No 1:1 in six weeks · sentiment down 14 pts</p>
        </div>
        <span className="relative grid h-12 w-12 shrink-0 place-items-center">
          <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="22" cy="22" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
            <circle cx="22" cy="22" r={r} fill="none" stroke="var(--danger)" strokeWidth="4" strokeLinecap="round" className="ai-ring" style={{ "--c": circ, "--o": circ * (1 - pct / 100) } as React.CSSProperties} />
          </svg>
          <span className="text-[11px] font-bold tabular-nums">{pct}%</span>
        </span>
      </div>
      <Tiny>Flight risk, from the pattern — weeks before a resignation letter.</Tiny>
    </Frame>
  );
}

function Drafting() {
  const m = myMoments[0];
  const mark = PLATFORM_MARK.LinkedIn;
  return (
    <Frame>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-bold text-white" style={{ background: mark.color }}>{mark.label}</span>
        <span className="text-[12.5px] font-semibold">You <span className="font-normal text-faint">· drafted by Vadal</span></span>
        <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[var(--success)]"><ShieldCheck className="h-3 w-3" /> Policy check</span>
      </div>
      <p className="mt-2 min-h-[42px] text-[13.5px] font-medium leading-snug"><Typed text={`${m.what}.`} /></p>
      <Tiny>Your words, your name, your tap. Nothing posts on its own.</Tiny>
    </Frame>
  );
}

function Launching() {
  const qs = ["How is the new equipment working out?", "Anything slowing the line down?", "One thing we should fix first"];
  return (
    <Frame>
      <ul className="flex flex-col gap-1.5">
        {qs.map((q, i) => (
          <li key={q} className="ai-card-in flex items-center gap-2 rounded-xl bg-soft px-3 py-1.5 text-[12.5px]" style={{ animationDelay: `${200 + i * 260}ms` }}>
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-card text-[9px] font-bold text-muted">{i + 1}</span>{q}
          </li>
        ))}
      </ul>
      <Tiny>Three questions · sent to Line 2 by push at 06:10, when they actually answer.</Tiny>
    </Frame>
  );
}

function Answering() {
  const q = "How many paid leaves do I have?";
  const a = findAnswer(q);
  return (
    <Frame>
      <p className="text-[12.5px] font-semibold">“{q}”</p>
      <p className="mt-1.5 min-h-[40px] text-[13px] leading-snug text-muted"><Typed text={a.answer.replace(/\*\*/g, "").split(". ")[0] + "."} cps={70} /></p>
      <Tiny><BookOpen className="mr-1 inline h-3 w-3" />Cited from your own leave policy — it refuses rather than guesses.</Tiny>
    </Frame>
  );
}

function Opening() {
  const c = cases[0];
  return (
    <Frame>
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold tabular-nums text-faint">{c.id}</span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{c.title}</span>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--danger)]">{c.priority}</span>
      </div>
      <div className="mt-2.5 flex items-center gap-2 text-[12.5px] text-muted">
        <Avatar src={c.owner.img} name={c.owner.name} size="xs" /> Assigned to <span className="font-semibold text-ink">{c.owner.name}</span> <span className="text-faint">· SLA {c.slaDays}d</span>
      </div>
      <Tiny>Opened from the risk signal — owned, timed, and never lost.</Tiny>
    </Frame>
  );
}

function Coaching() {
  const a = managerActions[0];
  const r = reports[0];
  return (
    <Frame>
      <div className="flex items-center gap-2.5">
        <Avatar src={r.img} name={r.name} size="sm" />
        <div className="min-w-0 leading-tight">
          <p className="text-[13.5px] font-semibold">{a.title}</p>
          <p className="text-[12px] text-faint">{a.context} · {a.due}</p>
        </div>
      </div>
      <p className="mt-2 text-[12.5px] leading-snug text-muted">{coachingNudges[0].split(" — ")[1] ?? coachingNudges[0]}</p>
    </Frame>
  );
}

function Teaching() {
  const c = courses[0];
  return (
    <Frame>
      <p className="text-[13px] font-semibold">{c.title} <span className="font-normal text-faint">· {c.minutes} min</span></p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {c.lessons.slice(0, 3).map((l, i) => (
          <li key={l.id} className="ai-card-in rounded-full bg-soft px-2.5 py-1 text-[12px]" style={{ animationDelay: `${200 + i * 220}ms` }}>{l.title} · {l.minutes}m</li>
        ))}
      </ul>
      <Tiny>Built from the policy document — lessons that fit a break, not a training day.</Tiny>
    </Frame>
  );
}

function HandingOff() {
  const c = counsellors[0];
  return (
    <Frame>
      <div className="flex items-center gap-2.5">
        <Avatar src={c.img} name={c.name} size="sm" />
        <div className="min-w-0 leading-tight">
          <p className="text-[13.5px] font-semibold">{c.name}</p>
          <p className="text-[12px] text-faint">{c.credentials.split(" · ")[0]} · next {c.nextAvailable}</p>
        </div>
      </div>
      <Tiny>A real person, one tap away. Context carried, so nobody repeats their story.</Tiny>
    </Frame>
  );
}

/* ── the sequence: one capability per product, in the products' order ───── */
type Act = { verb: string; phrase: string; product: string; artifact: React.ReactNode };
const ACTS: Act[] = [
  { verb: "Listening", phrase: "reading 8,486 survey responses", product: "Pulse", artifact: <Listening /> },
  { verb: "Predicting", phrase: "spotting a flight risk before it becomes a resignation", product: "Cases", artifact: <Predicting /> },
  { verb: "Drafting", phrase: "drafting a post in your voice", product: "Amplify", artifact: <Drafting /> },
  { verb: "Launching", phrase: "launching a three-question pulse to Line 2", product: "Pulse", artifact: <Launching /> },
  { verb: "Answering", phrase: "answering from your policy documents, source attached", product: "Broadcast", artifact: <Answering /> },
  { verb: "Opening", phrase: "opening a case and assigning its owner", product: "Cases", artifact: <Opening /> },
  { verb: "Coaching", phrase: "telling a manager the one thing to do this week", product: "Managers", artifact: <Coaching /> },
  { verb: "Teaching", phrase: "turning a document into an eight-minute course", product: "Grow", artifact: <Teaching /> },
  { verb: "Handing off", phrase: "handing off to a counsellor, context carried", product: "Help", artifact: <HandingOff /> },
];

export function AiStage({ onGo, tiles }: { onGo?: (i: number) => void; tiles: ProductTile[] }) {
  /* [leaving, current] — both rendered during the turn, so the old phrase can
     leave while the new one arrives; no state is set from inside an effect */
  const [seq, setSeq] = React.useState<[number | null, number]>([null, 0]);
  const [paused, setPaused] = React.useState(false);
  const cur = seq[1];
  const go = React.useCallback((n: number) => setSeq(([, c]) => [c, ((n % ACTS.length) + ACTS.length) % ACTS.length]), []);

  React.useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => go(cur + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [cur, paused, go]);

  const act = ACTS[cur];
  const jump = () => onGo?.(tiles.find((t) => t.name === act.product)?.index ?? 0);

  return (
    <div
      className={`ai-stage ai-glow-border is-busy w-full rounded-[26px] p-[1.5px] ${paused ? "is-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-[24.5px] bg-card text-left">
        <span aria-hidden className="ai-stage-glow" />

        {/* ── the mark, alive, and the phrase that turns ── */}
        <div className="relative flex items-start gap-4 px-5 pt-5">
          <span className="relative mt-0.5 grid h-12 w-12 shrink-0 place-items-center">
            <span aria-hidden className="ai-orbit" />
            <span aria-hidden className="ai-orbit ai-orbit-2" />
            <span className="ai-aura ai-grad grid h-12 w-12 place-items-center rounded-full"><SparkMark size={22} tone="solid" state="thinking" /></span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
              Vadal.ai is <span className="inline-flex gap-1 align-middle"><span className="ai-dot" /><span className="ai-dot [animation-delay:0.15s]" /><span className="ai-dot [animation-delay:0.3s]" /></span>
            </p>
            <button type="button" onClick={jump} className="relative mt-1 block h-[60px] w-full overflow-hidden text-left sm:h-[64px]">
              {seq[0] !== null && (
                <span key={`out-${seq[0]}`} className="ai-phrase-out ai-text-grad absolute inset-x-0 top-0 text-[clamp(17px,1.7vw,24px)] leading-[1.15] tracking-[-0.02em]">{ACTS[seq[0]].phrase}</span>
              )}
              <span key={`in-${cur}`} className="ai-phrase-in ai-text-grad absolute inset-x-0 top-0 text-[clamp(17px,1.7vw,24px)] leading-[1.15] tracking-[-0.02em]">{act.phrase}</span>
            </button>
          </div>
        </div>

        {/* ── the artifact: the thing it made, building itself ── */}
        <button type="button" onClick={jump} className="relative block w-full px-5 pt-3 text-left" aria-label={`Open ${act.product}`}>
          <div key={cur} className="min-h-[124px]">{act.artifact}</div>
        </button>

        {/* ── nine, in order; the current one carries the clock ── */}
        <div className="relative px-5 pb-4 pt-3">
          <ol className="flex items-center gap-1.5" aria-label="What Vadal.ai does">
            {ACTS.map((a, i) => {
              const on = i === cur;
              return (
                <li key={a.verb} className="min-w-0 flex-1">
                  <button type="button" onClick={() => go(i)} aria-current={on ? "step" : undefined} aria-label={a.verb} className="flex min-h-[44px] w-full items-center lg:min-h-0 lg:py-2">
                    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-line">
                      {on && <span key={`t-${cur}`} className="ai-timer ai-grad block h-full w-full" style={{ "--dur": `${STEP_MS}ms` } as React.CSSProperties} />}
                      {i < cur && <span className="block h-full w-full bg-[var(--ai-accent)] opacity-40" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-tight text-faint" aria-hidden>
            {ACTS.map((a, i) => (
              <React.Fragment key={a.verb}>
                {i > 0 && <span className="opacity-60">·</span>}
                <button type="button" tabIndex={-1} onClick={() => go(i)} className={`transition-colors ${i === cur ? "font-semibold text-ink" : "hover:text-muted"}`}>{a.verb}</button>
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
