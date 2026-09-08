"use client";
/* One live demonstration per tour step.

   Each is the real feature on the real data with the real components, at a
   smaller size — not a screenshot and not a mock. The step's text says what a
   thing is for; the demo proves it exists. That pairing is the whole reason a
   tour beats a feature list. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Heart, RotateCcw, Search, Smile } from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { NAV } from "../nav-model";
import { MoodCheck } from "../home/MoodCheck";
import { GiveRecognition } from "../recognition/GiveRecognition";
import { useSession } from "../useSession";
import { GoalRing } from "@/components/charts";
import { FEATURES } from "@/lib/ai/features";
import { org, myRecognition } from "@/lib/data";
import { experienceScore, SCORE_SOURCES } from "@/lib/experience";
import { myMoments } from "@/lib/amplify";
import { myActivity, atWorkStepsPerDay } from "@/lib/thrive";
import { chooseFocus } from "@/lib/ai/engines/wellbeing";
import { crisisResources } from "@/lib/ai/engines/support";
import { growStats, learningDays, retention } from "@/lib/grow";
import { reviewQueue } from "@/lib/ai/engines/learning";
import { findAnswer, suggestedQuestions } from "@/lib/knowledge";
import { didAction, type DemoKey, type TourStepView } from "@/lib/tour";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

function Frame({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "ai" | "soft" }) {
  const cls =
    tone === "ai" ? "bg-[var(--ai-surface)] ring-1 ring-[var(--ai-border)]"
    : tone === "soft" ? "bg-soft"
    : "border border-line bg-card";
  return <div className={`rounded-2xl p-4 sm:p-5 ${cls}`}>{children}</div>;
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{children}</p>;
}

function Welcome() {
  const live = FEATURES.filter((f) => f.wiredTo && !f.blocked).length;
  const sections = NAV.reduce((n, g) => n + g.items.length, 0);
  return (
    <Frame tone="ai">
      <div className="flex items-center gap-2">
        <span className="ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={16} tone="solid" /></span>
        <span className="text-[15px] font-bold tracking-tight">Vadal</span>
        <span className="text-[13px] text-faint">· {org.name} · {org.headcount.toLocaleString()} people</span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-4">
        {[[sections, "sections", "each role-gated"], [live, "AI features", "live, not just built"], ["1", "assistant", "on every screen"]].map(([v, l, sub]) => (
          <div key={l as string}>
            <dd className="text-[26px] font-bold leading-none tracking-tight tabular-nums">{v}</dd>
            <dt className="mt-1 text-[13px] font-semibold">{l}</dt>
            <dd className="text-[11.5px] text-faint">{sub}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[12.5px] leading-snug text-faint">
        Counted from the registry the product itself serves at <code className="rounded bg-card px-1 text-[11.5px]">/api/ai/features</code> — never typed.
      </p>
    </Frame>
  );
}

function Ritual() {
  return (
    <Frame>
      <MoodCheck firstTime={false} />
    </Frame>
  );
}

function Listen() {
  const ex = experienceScore();
  const top = Math.max(...ex.contributions.map((c) => c.points));
  return (
    <Frame>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <div className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{ex.score}</div>
          <div className="mt-1 text-[12px] text-faint">workforce health, this morning</div>
        </div>
        <ul className="min-w-0 flex-1 flex flex-col gap-2">
          {ex.contributions.map((c) => {
            const weakest = c.label === ex.weakest;
            return (
              <li key={c.label}>
                <div className="flex items-baseline gap-2 text-[12.5px]">
                  <span className={weakest ? "font-semibold" : ""}>{c.label}</span>
                  {weakest && <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--danger)]">weakest</span>}
                  <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-muted">+{c.points}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-soft">
                  <span className="block h-full rounded-full" style={{ width: `${(c.points / top) * 100}%`, background: weakest ? "var(--danger)" : "var(--client-brand, var(--purple))" }} />
                </div>
                <p className="mt-0.5 text-[11px] text-faint">{SCORE_SOURCES[c.label]}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </Frame>
  );
}

function Engage() {
  /* The real give-recognition drawer, so the step can be done from here. */
  const [giving, setGiving] = React.useState(false);
  const r = myRecognition[0];
  return (
    <Frame tone="soft">
      <blockquote className="text-[15px] leading-relaxed">{r.text}</blockquote>
      <div className="mt-3 flex items-center gap-2">
        <Avatar src={r.img} name={r.from} size="sm" />
        <span className="text-[13px] font-semibold">{r.from}</span>
        <Badge tone="brand" variant="soft" size="sm">{r.value}</Badge>
        <span className="ml-auto text-[12px] text-faint">{r.time}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="brand" className="min-h-[44px]" leadingIcon={<Heart className="h-3.5 w-3.5" />} onClick={() => setGiving(true)}>Recognise someone</Button>
        <span className="text-[12.5px] text-faint">Real drawer, real teammates — it reaches them today.</span>
      </div>
      <GiveRecognition open={giving} onClose={() => setGiving(false)} onGive={() => setGiving(false)} />
    </Frame>
  );
}

function Amplify() {
  const m = myMoments[0];
  return (
    <Frame tone="ai">
      <div className="flex items-center gap-2"><SparkMark size={13} tone="solid" /><Eyebrow>Yours to share</Eyebrow></div>
      <p className="mt-2 text-[15px] font-semibold leading-snug">{m.what}</p>
      <p className="mt-1.5 text-[13px] leading-snug text-muted">{m.why}</p>
    </Frame>
  );
}

function Wellbeing() {
  const { session } = useSession();
  const surface = session?.profile === "frontline" ? "frontline" : "desk";
  const focus = chooseFocus(surface, myActivity, surface === "frontline" ? atWorkStepsPerDay : 0);
  const recovery = focus.metric === "recovery";
  return (
    <Frame>
      <div className="flex flex-wrap items-center gap-5">
        <GoalRing id="tour-thrive" value={focus.value} goal={focus.goal ?? 1} size={104} stroke={9}
          label={recovery ? `of ${focus.goal}h` : `of ${(focus.goal ?? 0) / 1000}k`}
          format={(v) => (recovery ? `${v}h` : `${(v / 1000).toFixed(1)}k`)} />
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">{focus.why}</p>
      </div>
      <p className="mt-3 text-[12px] text-faint">Signed in as a {surface} worker, so the ring is measuring {recovery ? "recovery" : "movement"}. Switch roles and it changes.</p>
    </Frame>
  );
}

function Help() {
  const crisis = crisisResources("IN");
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: "color-mix(in srgb, var(--danger) 6%, var(--card))", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--danger) 24%, transparent)" }}>
      <p className="text-[14px] font-bold">If you need help right now</p>
      <p className="mt-0.5 text-[12.5px] text-muted">These sit above the assistant on every screen of the pillar. You never have to talk to anything first.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {crisis.map((c) => (
          <a key={c.number} href={`tel:${c.number.replace(/\s/g, "")}`} className="flex min-h-[44px] items-center rounded-full border border-line bg-card px-4 text-[14px] font-semibold">
            {c.label.split("(")[0].trim()} · {c.number}
          </a>
        ))}
      </div>
    </div>
  );
}

function Learn() {
  const queue = reviewQueue(retention, 3);
  const max = Math.max(...learningDays.map((d) => d.minutes), 1);
  return (
    <Frame>
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <div className="flex items-end gap-[3px]" style={{ height: 36 }}>
            {learningDays.map((d, i) => (
              <span key={i} className="flex h-full w-[9px] flex-col justify-end" title={`${d.day} · ${d.minutes} min`}>
                <span className="block w-full rounded-[2px]" style={{ height: d.minutes > 0 ? `${Math.max(0.28, d.minutes / max) * 100}%` : "16%", background: d.minutes > 0 ? "var(--client-brand, var(--purple))" : "var(--line)" }} />
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-faint"><b className="font-semibold text-ink tabular-nums">{growStats.streak}</b> day streak</p>
        </div>
        <ul className="min-w-0 flex-1 flex flex-col gap-1.5">
          <Eyebrow>Coming back to you</Eyebrow>
          {queue.map(({ item, reason }) => (
            <li key={item.questionId} className="flex items-start gap-2 text-[13px] leading-snug">
              {reason === "shaky" ? <RotateCcw className="mt-0.5 h-3 w-3 shrink-0 text-[var(--danger)]" /> : <Clock className="mt-0.5 h-3 w-3 shrink-0 text-faint" />}
              <span className="min-w-0 truncate">{item.prompt}</span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

function Knowledge() {
  /* Ask it yourself. The step is explored by asking, not by reading a canned
     answer — and the refusal is part of the demonstration. */
  const [q, setQ] = React.useState("");
  const [asked, setAsked] = React.useState<string | null>(null);
  const a = asked ? findAnswer(asked) : null;
  function ask(question: string) {
    const t = question.trim();
    if (!t) return;
    setAsked(t);
    setQ(t);
    didAction("answer");
  }
  return (
    <Frame tone="ai">
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex items-center gap-2 rounded-full bg-card p-1.5 pl-4 ring-1 ring-[var(--ai-border)] focus-within:ring-[var(--ai-accent)]">
        <Search className="h-4 w-4 shrink-0 text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about leave, pay, how anything works here…" aria-label="Ask the knowledge base" className="min-h-[40px] min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint" />
        <Button type="submit" variant="brand" size="sm" className="min-h-[40px] rounded-full">Ask</Button>
      </form>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {suggestedQuestions.map((sq) => (
          <button key={sq} type="button" onClick={() => ask(sq)} className="min-h-[44px] rounded-full bg-card px-3 text-[12.5px] text-muted transition hover:text-ink hover:ring-1 hover:ring-[var(--ai-border)] lg:min-h-[36px]">{sq}</button>
        ))}
      </div>
      {a && (
        <div className="mt-4 rounded-2xl bg-card p-4" aria-live="polite">
          <p className="text-[13px] font-semibold">“{asked}”</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{a.answer.replace(/\*\*/g, "")}</p>
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-faint">
            <BookOpen className="h-3 w-3" /> {a.sources.length > 0 ? "Cited from your own documents" : "Not in your documents — so it said so, rather than guessing"}
          </p>
        </div>
      )}
    </Frame>
  );
}

function Copilot() {
  const TRY = ["Why did Sales sentiment drop?", "Launch a quick pulse to Design", "Give kudos to Meera", "What did I miss while I was on leave?"];
  return (
    <Frame tone="ai">
      <Eyebrow>Try asking — it opens the real assistant</Eyebrow>
      <div className="mt-2.5 flex flex-col gap-2">
        {TRY.map((t) => (
          <button key={t} onClick={() => ask(t)} className="flex min-h-[44px] items-center gap-2.5 rounded-full bg-card px-4 text-left text-[14px] transition hover:ring-1 hover:ring-[var(--ai-border)]">
            <SparkMark size={12} tone="solid" className="shrink-0" /><span className="min-w-0 truncate">{t}</span>
          </button>
        ))}
      </div>
    </Frame>
  );
}

/* ── the last step: what is left, and three things worth doing first ── */
export function Done({ steps, explored, onRestart, onGo }: { steps: TourStepView[]; explored: DemoKey[]; onRestart: () => void; onGo: (i: number) => void }) {
  const left = steps.filter((s) => s.id !== "done" && !explored.includes(s.id) && !s.locked);
  const NEXT: { icon: React.ReactNode; label: string; sub: string; href?: string; onClick?: () => void }[] = [
    { icon: <Smile className="h-4 w-4" />, label: "Log today's check-in", sub: "Five seconds, private to you", href: "/product/home" },
    { icon: <Heart className="h-4 w-4" />, label: "Recognise someone", sub: "It reaches them today", href: "/product/recognition" },
    { icon: <SparkMark size={14} tone="solid" />, label: "Ask Vadal", sub: "“What should I look at first?”", onClick: () => ask("What should I look at first?") },
  ];
  return (
    <div className="flex flex-col gap-4">
      {left.length > 0 ? (
        <Frame tone="soft">
          <Eyebrow>Still to explore</Eyebrow>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {left.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => onGo(s.index)} className="min-h-[44px] rounded-full bg-card px-3 text-[12.5px] font-medium transition hover:ring-1 hover:ring-line lg:min-h-[36px]">{s.index + 1} · {s.title}</button>
              </li>
            ))}
          </ul>
        </Frame>
      ) : (
        <Frame tone="soft">
          <p className="text-[14px] font-semibold">Everything explored — by doing it, not reading about it.</p>
          <p className="mt-1 text-[13px] text-muted">Come back to this space: Vadal.ai will use it to put in front of you what it thinks you should see next.</p>
        </Frame>
      )}
      <div>
        <Eyebrow>Worth doing first</Eyebrow>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {NEXT.map((n) => {
            const inner = (
              <>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[var(--client-brand,var(--purple))]">{n.icon}</span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold leading-tight">{n.label}</span>
                  <span className="block truncate text-[12px] text-faint">{n.sub}</span>
                </span>
              </>
            );
            const cls = "flex min-h-[44px] w-full items-center gap-3 rounded-2xl border border-line bg-card p-3 text-left transition hover:bg-soft";
            return (
              <li key={n.label}>
                {n.href ? <Link href={n.href} className={cls}>{inner}</Link> : <button type="button" onClick={n.onClick} className={cls}>{inner}</button>}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/product/home"><Button variant="brand" className="min-h-[44px]" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>Open Home</Button></Link>
        <Button variant="tertiary" className="min-h-[44px]" leadingIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={onRestart}>Start over</Button>
      </div>
    </div>
  );
}

export function Demo({ id }: { id: DemoKey }) {
  switch (id) {
    case "welcome": return <Welcome />;
    case "ritual": return <Ritual />;
    case "listen": return <Listen />;
    case "engage": return <Engage />;
    case "amplify": return <Amplify />;
    case "wellbeing": return <Wellbeing />;
    case "help": return <Help />;
    case "learn": return <Learn />;
    case "knowledge": return <Knowledge />;
    case "copilot": return <Copilot />;
    default: return null;
  }
}
