"use client";
/* One live demonstration per tour scene.

   Each is the real feature on the real data with the real components, composed
   as one card that can carry a screen on its own: a hero figure, one visual
   that explains it (ring, spark, composition bar, funnel, timeline), and one
   line the assistant would say. Not a screenshot, not a mock — the step's text
   says what a thing is for; the card proves it exists. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Bot, CheckCheck, Clock, FolderKanban, Heart, Layers, Megaphone,
  Phone, RotateCcw, Search, ShieldCheck, Smile, Sparkles, TrendingDown, TrendingUp, UsersRound, Wallet,
} from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { NAV } from "../nav-model";
import { MoodCheck } from "../home/MoodCheck";
import { GiveRecognition } from "../recognition/GiveRecognition";
import { useSession } from "../useSession";
import { DayArea, GoalRing, ScoreRing, Sparkline, StreakStrip } from "@/components/charts";
import { FEATURES } from "@/lib/ai/features";
import { org, myRecognition, me } from "@/lib/data";
import { feedItems } from "@/lib/feed";
import { campaigns } from "@/lib/campaigns";
import { team, reports, managerActions } from "@/lib/manager";
import { cases, caseStats } from "@/lib/cases";
import { experienceScore } from "@/lib/experience";
import { myMoments, myReachSeries, PLATFORM_MARK } from "@/lib/amplify";
import { myActivity, atWorkStepsPerDay, weekSteps, weekStepsFrontline, weekDays, moneyConfig, challengeProgress } from "@/lib/thrive";
import { chooseFocus } from "@/lib/ai/engines/wellbeing";
import { crisisResources } from "@/lib/ai/engines/support";
import { counsellors, eap, WAYS_IN } from "@/lib/help";
import { growStats, learningDays, retention } from "@/lib/grow";
import { reviewQueue } from "@/lib/ai/engines/learning";
import { findAnswer, suggestedQuestions } from "@/lib/knowledge";
import { didAction, type DemoKey, type TourStepView } from "@/lib/tour";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const BRAND = "var(--client-brand, var(--purple))";

/* ── small shared pieces ─────────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative overflow-hidden rounded-2xl border border-line bg-card ${className}`}>{children}</div>;
}
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-faint ${className}`}>{children}</p>;
}
/** The one line the assistant would say about this card. */
function AiLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border-t border-[var(--ai-border)] bg-[var(--ai-surface)] px-4 py-3">
      <span className="ai-grad mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full"><SparkMark size={11} tone="solid" /></span>
      <p className="text-[12.5px] leading-snug text-muted">{children}</p>
    </div>
  );
}
function Stat({ value, label, sub }: { value: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums">{value}</div>
      <div className="mt-1 text-[12.5px] font-semibold">{label}</div>
      {sub && <div className="text-[11.5px] text-faint">{sub}</div>}
    </div>
  );
}

/* ── 01 · the org, counted ───────────────────────────────────────────────── */
function Welcome() {
  const live = FEATURES.filter((f) => f.wiredTo && !f.blocked).length;
  const sections = NAV.reduce((n, g) => n + g.items.length, 0);
  return (
    <Card>
      <div className="ai-grad relative px-5 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur"><SparkMark size={18} tone="solid" /></span>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-tight">Vadal</p>
            <p className="text-[12px] leading-tight text-white/80">{org.name} · {org.headcount.toLocaleString()} people</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-white" /> Live</span>
        </div>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-line">
        {[
          { icon: <Layers className="h-4 w-4" />, v: sections, l: "sections", sub: "each role-gated" },
          { icon: <Sparkles className="h-4 w-4" />, v: live, l: "AI features", sub: "live, not just built" },
          { icon: <Bot className="h-4 w-4" />, v: 1, l: "assistant", sub: "on every screen" },
        ].map((s) => (
          <div key={s.l} className="px-4 py-4">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-soft text-[var(--client-brand,var(--purple))]">{s.icon}</span>
            <dd className="mt-2 text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums">{s.v}</dd>
            <dt className="mt-1 text-[12.5px] font-semibold">{s.l}</dt>
            <dd className="text-[11.5px] text-faint">{s.sub}</dd>
          </div>
        ))}
      </dl>
      <AiLine>Counted live from the product&apos;s own registry — never typed.</AiLine>
    </Card>
  );
}

/* ── 02 · the ritual, with its streak ────────────────────────────────────── */
function Ritual() {
  const week = [1, 1, 1, 1, 1, 0, 1]; // this week's check-ins, today last
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Eyebrow>Daily check-in</Eyebrow>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-faint">
          <span className="font-semibold text-ink tabular-nums">{me.streak}-day streak</span>
          <span className="ml-1 flex gap-1" aria-hidden>
            {week.map((d, i) => <span key={i} className="h-2 w-2 rounded-full" style={{ background: d ? BRAND : "var(--line)" }} />)}
          </span>
        </span>
      </div>
      <div className="px-5 py-4"><MoodCheck firstTime={false} /></div>
      <AiLine>Private to you. Your manager sees the team&apos;s mood, never yours.</AiLine>
    </Card>
  );
}

/* ── 03 · one score, and what it is made of ──────────────────────────────── */
function Pulse() {
  const ex = experienceScore();
  const total = ex.contributions.reduce((a, c) => a + c.points, 0);
  const shade = (i: number, weakest: boolean) =>
    weakest ? "var(--danger)" : `color-mix(in srgb, ${BRAND} ${100 - i * 16}%, var(--card))`;
  return (
    <Card>
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto">
          <ScoreRing score={ex.score} size={150} stroke={12} />
          <p className="mt-1 text-center text-[11.5px] text-faint">workforce health · this morning</p>
        </div>
        <div className="min-w-0">
          <Eyebrow>What the number is made of</Eyebrow>
          <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full" aria-hidden>
            {ex.contributions.map((c, i) => (
              <span key={c.label} style={{ width: `${(c.points / total) * 100}%`, background: shade(i, c.label === ex.weakest) }} className="h-full border-r border-card last:border-0" />
            ))}
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {ex.contributions.map((c, i) => {
              const weakest = c.label === ex.weakest;
              return (
                <li key={c.label} className="flex items-center gap-2 text-[12.5px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: shade(i, weakest) }} />
                  <span className={`min-w-0 truncate ${weakest ? "font-semibold" : ""}`}>{c.label}</span>
                  {weakest && <Badge tone="danger" variant="soft" size="sm">weakest</Badge>}
                  <span className="ml-auto shrink-0 font-semibold tabular-nums text-muted">+{c.points}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <AiLine>{ex.weakest} is the weakest input. Every input is shown, so the score can be questioned.</AiLine>
    </Card>
  );
}

/* ── 04 · a post, and a recognition ──────────────────────────────────────── */
function Connect() {
  const [giving, setGiving] = React.useState(false);
  const post = feedItems[0];
  const r = myRecognition[0];
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <div className="flex items-center gap-2.5 px-4 pt-4">
          <Avatar src={post.author.img} name={post.author.name} size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-semibold">{post.author.name} <span className="font-normal text-faint">· {post.author.role}</span></p>
            <p className="text-[11.5px] text-faint">#company · {post.time} · pinned</p>
          </div>
        </div>
        <p className="mt-2.5 line-clamp-2 px-4 text-[13.5px] leading-relaxed">{post.text.replace(/\*\*/g, "")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 px-4 pb-4">
          {Object.entries(post.reactions).map(([e, n]) => (
            <span key={e} className="flex items-center gap-1 rounded-full bg-soft px-2 py-1 text-[12px] tabular-nums"><span aria-hidden>{e}</span>{n}</span>
          ))}
          <span className="ml-auto flex items-center gap-1">
            <span className="flex -space-x-1.5">{post.reactedBy.slice(0, 3).map((src, i) => <Avatar key={i} src={src} name="" size="xs" />)}</span>
            <span className="text-[11.5px] text-faint">{post.comments.length} comments · {post.views.toLocaleString()} views</span>
          </span>
        </div>
      </Card>
      <Card className="border-[color-mix(in_srgb,var(--client-brand,var(--purple))_28%,var(--line))]">
        <div className="flex items-start gap-3 px-4 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: BRAND }}><Heart className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] leading-snug">“{r.text}”</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-faint">
              <Avatar src={r.img} name={r.from} size="xs" /> {r.from} · <Badge tone="brand" variant="soft" size="sm">{r.value}</Badge> · {r.time}
            </p>
          </div>
          <Button variant="brand" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => setGiving(true)}>Recognise someone</Button>
        </div>
      </Card>
      <GiveRecognition open={giving} onClose={() => setGiving(false)} onGive={() => setGiving(false)} />
    </div>
  );
}

/* ── 05 · a moment of yours, drafted for outside ─────────────────────────── */
function Amplify() {
  const m = myMoments[0];
  const mark = PLATFORM_MARK.LinkedIn;
  const reach = myReachSeries[myReachSeries.length - 1];
  return (
    <Card>
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-md text-[12px] font-bold text-white" style={{ background: mark.color }}>{mark.label}</span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold">You <span className="font-normal text-faint">· drafted by Vadal, in your voice</span></p>
          <p className="text-[11.5px] text-faint">Ready to share · your profile, your name, your choice</p>
        </div>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--success)]"><ShieldCheck className="h-3 w-3" /> Policy check passed</span>
      </div>
      <div className="px-4 py-4">
        <p className="text-[15px] font-semibold leading-snug tracking-tight">{m.what}.</p>
        <p className="mt-1.5 text-[12.5px] text-faint">{m.withPeople?.length ? `with ${m.withPeople.join(" and ")} · ` : ""}{m.when}</p>
        <div className="mt-4 flex items-end gap-4">
          <Stat value={reach} label="reach this week" sub="from your own shares" />
          <span className="min-w-0 flex-1"><Sparkline id="tour-reach" values={myReachSeries} color={mark.color} height={40} /></span>
        </div>
      </div>
      <AiLine>Recognised publicly yesterday — about craft, which reads well outside.</AiLine>
    </Card>
  );
}

/* ── 06 · a goal that fits the job, and the money beside it ──────────────── */
function Thrive() {
  const { session } = useSession();
  const surface = session?.profile === "frontline" ? "frontline" : "desk";
  const focus = chooseFocus(surface, myActivity, surface === "frontline" ? atWorkStepsPerDay : 0);
  const recovery = focus.metric === "recovery";
  const steps = surface === "frontline" ? weekStepsFrontline : weekSteps;
  return (
    <Card>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <GoalRing id="tour-thrive" value={focus.value} goal={focus.goal ?? 1} size={120} stroke={10}
          label={recovery ? `of ${focus.goal}h` : `of ${(focus.goal ?? 0) / 1000}k`}
          format={(v) => (recovery ? `${v}h` : `${(v / 1000).toFixed(1)}k`)} />
        <div className="min-w-0">
          <Eyebrow>{recovery ? "Recovery" : "Movement"} this week · {surface} worker</Eyebrow>
          <DayArea id="tour-steps" values={steps} goal={recovery ? undefined : challengeProgress.target} labels={weekDays} height={72} className="mt-2" />
          <p className="mt-2 text-[12.5px] leading-snug text-muted">{focus.why}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-line px-5 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-soft text-[var(--client-brand,var(--purple))]"><Wallet className="h-4 w-4" /></span>
        <p className="min-w-0 text-[12.5px] leading-snug"><span className="font-semibold">{moneyConfig.commitment.amount} to savings</span> <span className="text-faint">· payday was {moneyConfig.demoPaydayDaysAgo} days ago · not moved yet</span></p>
        <span className="ml-auto text-[11.5px] font-semibold text-[var(--client-brand,var(--purple))]">Wealth</span>
      </div>
      <AiLine>Measures {recovery ? "recovery — this job already does the walking" : "movement — this job doesn't"}. Switch roles and it changes.</AiLine>
    </Card>
  );
}

/* ── 07 · a campaign that reports reach, and a library you can ask ───────── */
function Broadcast() {
  const [q, setQ] = React.useState("");
  const [asked, setAsked] = React.useState<string | null>(null);
  const a = asked ? findAnswer(asked) : null;
  const c = campaigns[0];
  const doneSteps = c.steps.filter((st) => st.done).length;
  function askIt(question: string) {
    const t = question.trim();
    if (!t) return;
    setAsked(t); setQ(t);
    didAction("answer");
  }
  const funnel = [
    { v: c.reach, l: "reached", w: c.reach },
    { v: c.participation, l: "took part", w: c.participation },
  ];
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <div className="flex items-center gap-2.5 px-4 pt-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-[var(--client-brand,var(--purple))]"><Megaphone className="h-4 w-4" /></span>
          <div className="min-w-0 leading-tight">
            <p className="text-[13.5px] font-semibold">{c.name} <Badge tone="success" variant="soft" size="sm">Live</Badge></p>
            <p className="text-[11.5px] text-faint">{c.audience} · {c.window} · {c.channels.join(" · ")}</p>
          </div>
          <Stat value={`+${c.lift}`} label="lift" sub="vs baseline" />
        </div>
        <div className="mt-3 flex flex-col gap-1.5 px-4">
          {funnel.map((f) => (
            <div key={f.l} className="flex items-center gap-2 text-[12px]">
              <span className="w-16 shrink-0 text-faint">{f.l}</span>
              <span className="h-5 rounded-md" style={{ width: `${f.w}%`, background: `color-mix(in srgb, ${BRAND} ${f.l === "reached" ? 55 : 100}%, var(--card))` }} />
              <span className="font-semibold tabular-nums">{f.v}%</span>
            </div>
          ))}
        </div>
        <ol className="mt-3 flex items-center gap-1 px-4 pb-4" aria-label="Campaign steps">
          {c.steps.map((st, i) => (
            <li key={st.label} className="flex min-w-0 flex-1 items-center gap-1" title={`${st.label} · ${st.when}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${st.done ? "text-white" : "bg-soft text-faint"}`} style={st.done ? { background: BRAND } : undefined}>{st.done ? "✓" : i + 1}</span>
              {i < c.steps.length - 1 && <span className="h-[2px] min-w-0 flex-1 rounded-full" style={{ background: st.done ? BRAND : "var(--line)" }} />}
            </li>
          ))}
        </ol>
        <AiLine><CheckCheck className="mr-1 inline h-3.5 w-3.5" />{doneSteps} of {c.steps.length} steps sent and acknowledged. {c.aiReadout.split(". ")[0]}.</AiLine>
      </Card>
      <Card className="border-[var(--ai-border)] bg-[var(--ai-surface)]">
        <form onSubmit={(e) => { e.preventDefault(); askIt(q); }} className="m-3 flex items-center gap-2 rounded-full bg-card p-1.5 pl-4 ring-1 ring-[var(--ai-border)] focus-within:ring-[var(--ai-accent)]">
          <Search className="h-4 w-4 shrink-0 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask the policy library…" aria-label="Ask the knowledge base" className="min-h-[40px] min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint" />
          <Button type="submit" variant="brand" size="sm" className="min-h-[40px] rounded-full">Ask</Button>
        </form>
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {suggestedQuestions.slice(0, 3).map((sq) => (
            <button key={sq} type="button" onClick={() => askIt(sq)} className="min-h-[44px] rounded-full bg-card px-3 text-[12.5px] text-muted transition hover:text-ink hover:ring-1 hover:ring-[var(--ai-border)] lg:min-h-[32px]">{sq}</button>
          ))}
        </div>
        {a && (
          <div className="mx-3 mb-3 rounded-xl bg-card p-3.5" aria-live="polite">
            <p className="text-[13px] font-semibold">“{asked}”</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{a.answer.replace(/\*\*/g, "")}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-faint"><BookOpen className="h-3 w-3" /> {a.sources.length > 0 ? "Cited from your own documents" : "Not in your documents — so it said so, rather than guessing"}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── 08 · learning between things ────────────────────────────────────────── */
function Grow() {
  const queue = reviewQueue(retention, 3);
  return (
    <Card>
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center">
          <GoalRing id="tour-grow" value={growStats.completionRate} goal={100} size={110} stroke={9} label="completion" format={(v) => `${v}%`} />
          <p className="mt-1 text-[11.5px] text-faint">median lesson {growStats.medianMinutes} min</p>
        </div>
        <div className="min-w-0">
          <Eyebrow>Minutes this week · {growStats.streak}-day streak</Eyebrow>
          <StreakStrip values={learningDays.map((d) => d.minutes)} target={5} totalDays={7} height={52} className="mt-2" />
          <Eyebrow className="mt-4">Coming back to you</Eyebrow>
          <ul className="mt-1.5 flex flex-col gap-1">
            {queue.map(({ item, reason }) => (
              <li key={item.questionId} className="flex items-start gap-2 text-[12.5px] leading-snug">
                {reason === "shaky" ? <RotateCcw className="mt-0.5 h-3 w-3 shrink-0 text-[var(--danger)]" /> : <Clock className="mt-0.5 h-3 w-3 shrink-0 text-faint" />}
                <span className="min-w-0 truncate">{item.prompt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AiLine>Red: not right yet. Grey: fading. Both come back until they stick.</AiLine>
    </Card>
  );
}

/* ── 09 · a door that is always open ─────────────────────────────────────── */
function Help() {
  const crisis = crisisResources("IN");
  const c = counsellors[0];
  return (
    <Card>
      <div className="px-4 py-3" style={{ background: "color-mix(in srgb, var(--danger) 6%, var(--card))" }}>
        <p className="text-[12.5px] font-bold">If you need help right now</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {crisis.map((k) => (
            <a key={k.number} href={`tel:${k.number.replace(/\s/g, "")}`} className="flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-card px-4 text-[13.5px] font-semibold"><Phone className="h-3.5 w-3.5 text-[var(--danger)]" /> {k.label.split("(")[0].trim()} · {k.number}</a>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-line px-4 py-3.5">
        <Avatar src={c.img} name={c.name} size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13.5px] font-semibold">{c.name}</p>
          <p className="truncate text-[11.5px] text-faint">{c.credentials} · next {c.nextAvailable}</p>
        </div>
        <Link href="/product/help" className="flex min-h-[44px] items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-[var(--client-brand,var(--purple))] lg:min-h-[36px]">Talk to a person <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3">
        {WAYS_IN.slice(0, 3).map((w) => <span key={w} className="rounded-full bg-soft px-2.5 py-1 text-[12px] text-muted">“{w}”</span>)}
      </div>
      <AiLine>Crisis lines come first, always. EAP: {eap.helpline}, {eap.hours}.</AiLine>
    </Card>
  );
}

/* ── 10 · a manager's Friday ─────────────────────────────────────────────── */
function Managers() {
  const a = managerActions[0];
  const tone = (t: string) => t === "bad" ? "var(--danger)" : t === "warn" ? "var(--warning)" : "var(--success)";
  return (
    <Card>
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-[var(--client-brand,var(--purple))]"><UsersRound className="h-4 w-4" /></span>
        <div className="leading-tight"><p className="text-[13.5px] font-semibold">{team.name}</p><p className="text-[11.5px] text-faint">{team.size} people · {team.atRisk} at risk</p></div>
        <div className="ml-auto flex items-end gap-4">
          <Stat value={team.health} label="team" sub={`${team.healthDelta > 0 ? "+" : ""}${team.healthDelta} this month`} />
          <Stat value={<span className="text-faint">{team.orgHealth}</span>} label="org" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 px-4">
        {team.drivers.map((d) => <span key={d.label} className="flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[12px]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: tone(d.tone) }} /> {d.label}</span>)}
      </div>
      <ul className="mt-3 divide-y divide-line border-t border-line">
        {reports.slice(0, 3).map((r) => (
          <li key={r.id} className="flex items-center gap-2.5 px-4 py-2">
            <Avatar src={r.img} name={r.name} size="xs" />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{r.name} <span className="font-normal text-faint">· {r.role}</span></span>
            <span className="w-16 shrink-0"><Sparkline id={`tour-rep-${r.id}`} values={r.spark} color={r.trend === "down" ? "var(--danger)" : "var(--success)"} height={22} /></span>
            <span className="w-8 shrink-0 text-right text-[12.5px] font-semibold tabular-nums">{r.sentiment}</span>
            {r.trend === "down" ? <TrendingDown className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" /> : <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />}
          </li>
        ))}
      </ul>
      <AiLine><span className="font-semibold text-ink">{a.title} · {a.due}.</span> Your highest-impact action this week.</AiLine>
    </Card>
  );
}

/* ── 11 · nothing raised gets lost ───────────────────────────────────────── */
function Cases() {
  const c = cases[0];
  const slaPct = Math.max(0, Math.min(100, (c.slaDays / 3) * 100));
  return (
    <Card>
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-[var(--client-brand,var(--purple))]"><FolderKanban className="h-4 w-4" /></span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13.5px] font-semibold"><span className="mr-1.5 text-[11px] font-semibold tabular-nums text-faint">{c.id}</span>{c.title}</p>
          <p className="text-[11.5px] text-faint">{c.team} · owned by {c.owner.name} · from {c.source}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Badge tone="danger" variant="soft" size="sm">{c.priority}</Badge>
          <span className="relative grid h-11 w-11 place-items-center" title={`SLA in ${c.slaDays}d`}>
            <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--line)" strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--warning)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(slaPct / 100) * 113} 113`} />
            </svg>
            <span className="text-[11px] font-bold tabular-nums">{c.slaDays}d</span>
          </span>
        </div>
      </div>
      <ol className="mt-3 border-t border-line px-4 py-3">
        {c.timeline.map((t, i) => (
          <li key={i} className="relative flex gap-3 pb-2.5 last:pb-0">
            <span className="mt-1 flex flex-col items-center">
              <span className="h-2 w-2 rounded-full" style={{ background: i === c.timeline.length - 1 ? BRAND : "var(--line)" }} />
              {i < c.timeline.length - 1 && <span className="mt-0.5 w-px flex-1 bg-line" />}
            </span>
            <p className="min-w-0 text-[12.5px] leading-snug"><span className="text-faint">{t.when} · {t.who}</span><br />{t.text}</p>
          </li>
        ))}
      </ol>
      <AiLine>{c.aiSummary.split(". ")[0]}. Average resolution: {caseStats.avgResolutionDays} days.</AiLine>
    </Card>
  );
}

/* ── 12 · the assistant, as a conversation ───────────────────────────────── */
function Copilot() {
  const [q, setQ] = React.useState("");
  const TRY = ["Why did Sales sentiment drop?", "Launch a quick pulse to Design", "Give kudos to Meera", "What did I miss while I was on leave?"];
  return (
    <Card className="border-[var(--ai-border)] bg-[var(--ai-surface)]">
      <div className="flex items-start gap-2.5 px-4 pt-4">
        <span className="ai-grad grid h-8 w-8 shrink-0 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
        <div className="rounded-2xl rounded-tl-md bg-card px-3.5 py-2.5 text-[13.5px] leading-snug shadow-sm">
          Morning. Engineering dropped 6 pts this week. What do you need?
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 px-4">
        {TRY.map((t) => (
          <button key={t} onClick={() => ask(t)} className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-card px-3 text-left text-[12.5px] transition hover:ring-1 hover:ring-[var(--ai-border)] lg:min-h-[32px]">
            <SparkMark size={11} tone="solid" className="shrink-0" /><span className="min-w-0 truncate">{t}</span>
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()); }} className="m-4 flex items-center gap-2 rounded-full bg-card p-1.5 pl-4 ring-1 ring-[var(--ai-border)] focus-within:ring-[var(--ai-accent)]">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Vadal anything, or tell it to do something…" aria-label="Ask the assistant" className="min-h-[40px] min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint" />
        <Button type="submit" variant="brand" size="sm" className="min-h-[40px] rounded-full" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>Ask</Button>
      </form>
      <AiLine>Confirms before anything reaches a person. Always undoable.</AiLine>
    </Card>
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
        <Card className="bg-soft">
          <div className="px-4 py-3.5">
            <Eyebrow>Still to explore</Eyebrow>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {left.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => onGo(s.index)} className="min-h-[44px] rounded-full bg-card px-3 text-[12.5px] font-medium transition hover:ring-1 hover:ring-line lg:min-h-[36px]">{s.index + 1} · {s.pillar?.name ?? s.title}</button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
        <Card className="bg-soft">
          <div className="px-4 py-3.5">
            <p className="text-[14px] font-semibold">Everything explored — by doing it, not reading about it.</p>
            <p className="mt-1 text-[13px] text-muted">Come back to this space: Vadal.ai will use it to put in front of you what it thinks you should see next.</p>
          </div>
        </Card>
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
    case "pulse": return <Pulse />;
    case "connect": return <Connect />;
    case "amplify": return <Amplify />;
    case "thrive": return <Thrive />;
    case "broadcast": return <Broadcast />;
    case "grow": return <Grow />;
    case "help": return <Help />;
    case "managers": return <Managers />;
    case "cases": return <Cases />;
    case "copilot": return <Copilot />;
    default: return null;
  }
}
