"use client";
/* ═══════════════ what Vadal does, shown rather than listed ═══════════════
   Home used to be one person's to-do list, which meant a product with
   seventeen sections was represented by a calendar and a kudos card. Everything
   else — the listening stack, the wellbeing engine, the advocacy programme, the
   crisis-safe support door — was real, built, and invisible unless you knew to
   click into it.

   The obvious fix is a grid of tiles naming each section. That was tried and it
   reads as a sitemap: a menu of sixteen boxes says "here are some links", not
   "here is a product". The difference matters most to the person who has never
   seen it before.

   So every block below is a working slice of the real thing, on the real data,
   with the real components. The health score is the number the engine computed
   this morning; the review queue is what spaced repetition actually surfaced;
   the crisis numbers are the ones the support engine returns for this region.
   Nothing here is a mock of a feature — it IS the feature, at a smaller size,
   and one click from the whole of it. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, RotateCcw } from "lucide-react";
import { Avatar, Badge, SparkMark } from "@vadal/design-system";
import { experienceScore, SCORE_SOURCES } from "@/lib/experience";
import { sentiment } from "@/lib/listen";
import { myRecognition } from "@/lib/data";
import { myMoments } from "@/lib/amplify";
import { myActivity, atWorkStepsPerDay } from "@/lib/thrive";
import { chooseFocus } from "@/lib/ai/engines/wellbeing";
import { growStats, learningDays, retention } from "@/lib/grow";
import { reviewQueue } from "@/lib/ai/engines/learning";
import { crisisResources } from "@/lib/ai/engines/support";
import { findAnswer } from "@/lib/knowledge";
import { FEATURES } from "@/lib/ai/features";
import { GoalRing } from "@/components/charts";
import { useSession } from "../useSession";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

const LIVE_AI = FEATURES.filter((f) => f.wiredTo && !f.blocked).length;

/* ── block furniture ─────────────────────────────────────────────── */
function BlockHead({
  eyebrow, title, href, cta,
}: { eyebrow: string; title: string; href: string; cta: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{eyebrow}</p>
        <h2 className="mt-1.5 text-[19px] font-bold leading-snug tracking-[-0.018em]">{title}</h2>
      </div>
      {/* 44px on touch. These are the only way into each section from Home, so
          a 20px text link was the wrong control on the screen most likely to be
          opened on a phone. */}
      <Link href={href} className="flex min-h-[44px] shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--purple)] transition hover:gap-1.5 lg:min-h-0">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

/* ═══ 1 · the flagship — one number, from every listening surface ═══ */
function HealthBlock() {
  const ex = experienceScore();
  const top = [...ex.contributions].sort((a, b) => b.points - a.points)[0];

  return (
    <section className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, var(--client-brand, var(--purple)) 9%, transparent), transparent 62%)" }}
      />
      <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">People intelligence</p>
          <h2 className="mt-2 text-[clamp(24px,2.9vw,32px)] font-bold leading-[1.06] tracking-[-0.025em]">
            One score, from everything<br className="hidden sm:block" /> you listen to.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            Surveys, the feed, campaign reach and recognition — reconciled into a single number
            instead of four dashboards that disagree. Every input is shown, so it can be argued
            with rather than trusted.
          </p>
          <div className="mt-5 flex flex-wrap items-end gap-6">
            <div>
              <div className="text-[46px] font-bold leading-none tracking-[-0.03em] tabular-nums">{ex.score}</div>
              <div className="mt-1.5 text-[12px] text-faint">workforce health</div>
            </div>
            <Link href="/product" className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-line px-4 text-[14px] font-semibold transition hover:bg-soft">
              Open Pulse <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* the actual contributions the engine returned */}
        <div className="min-w-0 rounded-2xl bg-soft/60 p-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">What it&apos;s made of</p>
            <span className="text-[12px] text-faint">weighted, out of 100</span>
          </div>
          <ul className="mt-3 flex flex-col gap-2.5">
            {ex.contributions.map((c) => {
              const weakest = c.label === ex.weakest;
              return (
                <li key={c.label}>
                  <div className="flex items-baseline gap-2 text-[13px]">
                    <span className={weakest ? "font-semibold" : ""}>{c.label}</span>
                    {weakest && <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--danger)]">weakest</span>}
                    <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-muted">+{c.points}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-card">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${(c.points / top.points) * 100}%`,
                        background: weakest ? "var(--danger)" : "var(--client-brand, var(--purple))",
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-faint">{SCORE_SOURCES[c.label]}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ═══ 2 · listening ═══ */
function ListeningBlock() {
  const themes = sentiment.themes.slice(0, 4);
  const split: [string, number, string][] = [
    ["Positive", sentiment.positive, "var(--success)"],
    ["Neutral", sentiment.neutral, "var(--muted)"],
    ["Negative", sentiment.negative, "var(--danger)"],
  ];
  return (
    <Card>
      <BlockHead eyebrow="Listen" title="What people are actually saying" href="/product/sentiment" cta="Sentiment" />
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {split.map(([l, p, c]) => <span key={l} style={{ width: `${p}%`, background: c }} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-faint">
        {split.map(([l, p, c]) => (
          <span key={l} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l} {p}%</span>
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {themes.map((t) => (
          <li key={t.name} className="flex items-center gap-2 text-[14px]">
            <span className="truncate">{t.name}</span>
            <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-faint">{t.occurrences}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] leading-snug text-faint">
        Clustered from open text, with an anonymity floor — a theme too thin to name without
        identifying someone is withheld, not padded.
      </p>
    </Card>
  );
}

/* ═══ 3 · engage — recognition and advocacy ═══ */
function RecognitionBlock() {
  const r = myRecognition[0];
  return (
    <Card>
      <BlockHead eyebrow="Engage" title="Recognition people actually feel" href="/product/recognition" cta="Recognition" />
      {r && (
        <figure className="mt-4 rounded-2xl bg-soft p-4">
          <blockquote className="text-[15px] leading-relaxed">{r.text}</blockquote>
          <figcaption className="mt-3 flex items-center gap-2">
            <Avatar src={r.img} name={r.from} size="sm" />
            <span className="text-[13px] font-semibold">{r.from}</span>
            <Badge tone="brand" variant="soft" size="sm">{r.value}</Badge>
            <span className="ml-auto text-[12px] text-faint">{r.time}</span>
          </figcaption>
        </figure>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Tied to the company&apos;s own values, visible on the feed, and counted toward the health
        score above — recognition coverage is one of its five inputs.
      </p>
    </Card>
  );
}

function AmplifyBlock() {
  const m = myMoments[0];
  return (
    <Card>
      <BlockHead eyebrow="Engage" title="Their words, going out" href="/product/amplify" cta="Amplify" />
      <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
        <div className="flex items-center gap-2">
          <SparkMark size={13} tone="solid" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Yours to share</span>
        </div>
        <p className="mt-2 text-[15px] font-semibold leading-snug">{m.what}</p>
        <p className="mt-1.5 text-[13px] leading-snug text-muted">{m.why}</p>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Most advocacy tools only ask employees to carry the company&apos;s posts. This carries
        theirs — and a policy check stops a revenue figure going public by accident.
      </p>
    </Card>
  );
}

/* ═══ 4 · wellbeing and learning ═══ */
function ThriveBlock() {
  const { session } = useSession();
  const surface = session?.profile === "frontline" ? "frontline" : "desk";
  const focus = chooseFocus(surface, myActivity, surface === "frontline" ? atWorkStepsPerDay : 0);
  const isRecovery = focus.metric === "recovery";
  return (
    <Card>
      <BlockHead eyebrow="Wellbeing" title="A goal that fits the job" href="/product/thrive" cta="Thrive" />
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <GoalRing
          id="home-thrive"
          value={focus.value}
          goal={focus.goal ?? 1}
          size={104}
          stroke={9}
          label={isRecovery ? `of ${focus.goal}h` : `of ${(focus.goal ?? 0) / 1000}k`}
          format={(v) => (isRecovery ? `${v}h` : `${(v / 1000).toFixed(1)}k`)}
        />
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">{focus.why}</p>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        A line operator already walks 17,400 steps doing their job — setting them a step target
        would be scoring them on their work. So the metric changes with the person.
      </p>
    </Card>
  );
}

function GrowBlock() {
  const queue = reviewQueue(retention, 2);
  const max = Math.max(...learningDays.map((d) => d.minutes), 1);
  return (
    <Card>
      <BlockHead eyebrow="Learn" title="Five minutes is enough" href="/product/grow" cta="Grow" />
      <div className="mt-4 flex items-end gap-5">
        <div>
          <div className="flex items-end gap-[3px]" style={{ height: 36 }}>
            {learningDays.map((d, i) => (
              <span key={i} className="flex h-full w-[9px] flex-col justify-end" title={`${d.day} · ${d.minutes} min`}>
                <span
                  className="block w-full rounded-[2px]"
                  style={{
                    height: d.minutes > 0 ? `${Math.max(0.28, d.minutes / max) * 100}%` : "16%",
                    background: d.minutes > 0 ? "var(--client-brand, var(--purple))" : "var(--line)",
                  }}
                />
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-faint"><b className="font-semibold text-ink tabular-nums">{growStats.streak}</b> day streak</p>
        </div>
        <ul className="min-w-0 flex-1 flex-col gap-1.5">
          {queue.map(({ item, reason }) => (
            <li key={item.questionId} className="flex items-start gap-2 text-[13px] leading-snug">
              {reason === "shaky"
                ? <RotateCcw className="mt-0.5 h-3 w-3 shrink-0 text-[var(--danger)]" />
                : <Clock className="mt-0.5 h-3 w-3 shrink-0 text-faint" />}
              <span className="min-w-0 truncate">{item.prompt}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Courses generated from a document, and spaced repetition that brings back what you keep
        missing — at lesson length, not course length.
      </p>
    </Card>
  );
}

/* ═══ 5 · support and knowledge ═══ */
function HelpBlock() {
  const crisis = crisisResources("IN");
  return (
    <Card>
      <BlockHead eyebrow="Wellbeing" title="A door that never routes through AI" href="/product/help" cta="One-to-One Help" />
      <div
        className="mt-4 rounded-2xl p-4"
        style={{
          background: "color-mix(in srgb, var(--danger) 6%, transparent)",
          boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--danger) 24%, transparent)",
        }}
      >
        <p className="text-[13px] font-semibold">If you need help right now</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {crisis.map((c) => (
            <span key={c.number} className="rounded-full bg-card px-3 py-1 text-[13px] font-semibold">
              {c.label.split("(")[0].trim()} · {c.number}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Crisis resources sit above the assistant on every screen of the pillar, taking no
        conversation and no risk score as input. Twenty-five phrasing cases run on every deploy.
      </p>
    </Card>
  );
}

function KnowledgeBlock() {
  const q = "How many paid leaves do I have?";
  const a = findAnswer(q);
  return (
    <Card>
      <BlockHead eyebrow="Workspace" title="Answers with the source attached" href="/product/knowledge" cta="Knowledge" />
      <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
        <p className="text-[13px] font-semibold">“{q}”</p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">{a.answer.replace(/\*\*/g, "")}</p>
        {a.sources.length > 0 && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-faint">
            <BookOpen className="h-3 w-3" /> Cited from your own documents
          </p>
        )}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Grounded in the company&apos;s approved documents, and it refuses rather than guesses when
        the answer is not in them.
      </p>
    </Card>
  );
}

/* ═══ 6 · the assistant, everywhere ═══ */
function CopilotBlock() {
  const TRY = [
    "Why did Sales sentiment drop?",
    "Launch a quick pulse to Design",
    "Give kudos to Meera",
    "What did I miss while I was on leave?",
  ];
  return (
    <section className="rise relative overflow-hidden rounded-[28px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-7 sm:p-9">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <div className="grid gap-7 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">The assistant</p>
          </div>
          <h2 className="mt-2.5 text-[clamp(21px,2.4vw,27px)] font-bold leading-[1.08] tracking-[-0.02em]">
            One Copilot, on every screen — and it can act.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            <b className="font-semibold text-ink">{LIVE_AI} AI features</b> are live across the
            product. The ones that reach real people confirm before they run and can be undone —
            enforced in code, not left to the prompt.
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Try asking</p>
          <div className="mt-2.5 flex flex-col gap-2">
            {TRY.map((t) => (
              <button
                key={t}
                onClick={() => ask(t)}
                className="flex min-h-[44px] items-center gap-2.5 rounded-full bg-card px-4 text-left text-[14px] transition hover:ring-1 hover:ring-[var(--ai-border)]"
              >
                <SparkMark size={12} tone="solid" className="shrink-0" />
                <span className="min-w-0 truncate">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ the showcase ═══ */
export function Showcase() {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-faint">What Vadal does</h2>
        <p className="text-[13px] text-muted">Everything below is live and on your workspace&apos;s own data.</p>
      </div>

      <HealthBlock />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListeningBlock />
        <RecognitionBlock />
        <AmplifyBlock />
        <ThriveBlock />
        <GrowBlock />
        <HelpBlock />
      </div>

      <KnowledgeBlock />
      <CopilotBlock />
    </div>
  );
}
