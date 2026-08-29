"use client";
/* THRIVE — Pillar 4. "One wellness pillar: physical health and financial health,
   side by side."

   Rebuilt around a failure the first version made plainly, on the persona this
   product exists to reach. Ravi is a Line Operator: his shift puts 17,400 steps
   a day on him. The hero told him he was "3,800 steps from your weekly goal" —
   a target he clears by Tuesday morning, doing his job. Meanwhile the fair-cohort
   card three sections below explained exactly why that comparison is wrong, and
   applied the insight only to the leaderboard.

   So the goal itself now adapts. chooseFocus() decides what is worth measuring
   for this person: steps for someone whose job keeps them still, sleep and
   recovery for someone whose job already moves them — and it says why, because
   an unexplained goal feels arbitrary.

   Three other corrections:
   · a wellbeing product with no history is a snapshot. Seven days are now on
     screen, so a bad week is visible as a bad week.
   · "physical health and financial health, SIDE BY SIDE" — wealth was five links
     in a rail. It is a column now.
   · the wellbeing check took 130px of prime space to say "off". It is one line
     until it has something to say. */
import * as React from "react";
import Link from "next/link";
import { Activity, ArrowRight, HeartPulse, Moon, Plus, Trophy, Wallet, Watch } from "lucide-react";
import { Badge, Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { activityNudges, buildCohorts, chooseFocus, financialTips, unusedBenefits, wellbeingCheck } from "@/lib/ai/engines/wellbeing";
import {
  myActivity, devices, challenges, participants, benefits, wealthArticles, points, mySignals,
  atWorkStepsPerDay, weekSteps, weekStepsFrontline, weekSleep, weekDays,
} from "@/lib/thrive";
import { useSession } from "../useSession";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

/* ── seven days, so a bad week looks like a bad week ────────────── */
function WeekBars({ values, goal, unit }: { values: number[]; goal?: number; unit: string }) {
  const max = Math.max(...values, goal ?? 0) * 1.08;
  return (
    <div className="flex items-end gap-1.5" role="img" aria-label={`Last seven days, ${unit}`}>
      {values.map((v, i) => {
        const met = goal !== undefined && v >= goal;
        const today = i === values.length - 1;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex h-16 w-full items-end justify-center">
              <span
                className="w-full rounded-[4px] transition-[height] duration-500"
                style={{
                  height: `${Math.max(6, (v / max) * 100)}%`,
                  /* A day below the goal still happened — at --line it was
                     invisible against the card and six of seven bars vanished. */
                  background: today
                    ? "var(--client-brand, var(--purple))"
                    : met
                      ? "color-mix(in srgb, var(--client-brand, var(--purple)) 48%, transparent)"
                      : "color-mix(in srgb, var(--muted) 34%, transparent)",
                }}
                title={`${v} ${unit}`}
              />
            </div>
            <span className={`text-[11px] ${today ? "font-semibold text-ink" : "text-faint"}`}>{weekDays[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ThriveHub() {
  const { session } = useSession();
  const surface = session?.profile === "frontline" ? "frontline" : "desk";

  const [consent, setConsent] = usePersistentState<boolean>("vadal:wellbeing-consent", false);
  const [joined, setJoined] = usePersistentState<string[]>("vadal:thrive-joined", ["monsoon"]);
  const [logged, setLogged] = usePersistentState<string[]>("vadal:thrive-log-today", []);
  const [askedMoney, setAskedMoney] = React.useState("");
  const [moneyAnswer, setMoneyAnswer] = React.useState<ReturnType<typeof financialTips> | null>(null);

  const focus = chooseFocus(surface, myActivity, surface === "frontline" ? atWorkStepsPerDay : 0);
  const isRecovery = focus.metric === "recovery";
  const series = isRecovery ? weekSleep : surface === "frontline" ? weekStepsFrontline : weekSteps;

  const nudges = activityNudges(myActivity);
  const cohorts = buildCohorts(participants);
  const myCohort = cohorts.find((c) => c.members.some((m) => m.email === session?.email)) ?? cohorts[0];
  const check = wellbeingCheck({ ...mySignals, consented: consent });
  const benefitNudges = unusedBenefits(benefits);
  const money = financialTips(surface === "frontline" ? "entry" : "mid", "IN");
  const moneyOfWeek = Array.isArray(money) ? money[0] : null;

  const pct = focus.goal ? Math.min(100, Math.round((focus.value / focus.goal) * 100)) : 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ══ HERO ══ the metric that is actually theirs, and why ══ */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }} aria-hidden />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="min-w-0">
            <Eyebrow>{isRecovery ? "Your recovery" : "Your week"}</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">
              {isRecovery ? `${focus.value}h` : focus.value.toLocaleString()}{" "}
              <span className="text-muted">
                {isRecovery ? `a night · aiming for ${focus.goal}h` : `of ${focus.goal?.toLocaleString()} steps`}
              </span>
            </h1>

            {focus.goal !== undefined && (
              <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: "var(--client-brand, var(--purple))" }} />
              </div>
            )}

            {/* Why this is the number, not a step target. The screen used to
                measure a Line Operator on his own shift. */}
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">{focus.why}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-muted">
              {isRecovery && (
                <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-faint" />{atWorkStepsPerDay.toLocaleString()} steps on shift</span>
              )}
              <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-faint" />{myActivity.sleepHoursAvg}h average sleep</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-faint" />{points.balance.toLocaleString()} pts · #{points.rank}</span>
            </div>
          </div>

          {/* seven days — the dimension the screen was missing entirely */}
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <Eyebrow>Last 7 days</Eyebrow>
              <span className="text-[12px] text-faint">{isRecovery ? "hours slept" : "steps"}</span>
            </div>
            {/* The bars are DAILY; the step goal is weekly. Comparing the two
                scaled every bar to about 15% and the chart read as flat. Sleep
                is already a nightly target, so it passes through. */}
            <div className="mt-3">
              <WeekBars
                values={series}
                goal={isRecovery ? focus.goal : focus.goal ? Math.round(focus.goal / 7) : undefined}
                unit={isRecovery ? "hours" : "steps"}
              />
            </div>
          </div>
        </div>

        {/* one thing to do, as an action rather than a card to read */}
        <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <span className="ai-grad grid h-8 w-8 shrink-0 place-items-center rounded-full"><SparkMark size={16} tone="solid" /></span>
          <p className="min-w-0 flex-1 text-[16px] leading-snug">{focus.suggestion}</p>
          <Button
            variant="brand"
            className="min-h-[44px]"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setLogged((l) => [...l, new Date().toISOString()]);
              toast(isRecovery ? "Logged — protect that one" : "Logged to your week 🎉");
            }}
          >
            {isRecovery ? "Log an early night" : "Log activity"}
          </Button>
        </div>

        {logged.length > 0 && (
          <p className="relative mt-3 text-[12px] text-faint">{logged.length} logged today. Undo from the Copilot if that was a mistake.</p>
        )}
      </header>

      {/* ══ the wellbeing check ══ one line until it has something to say ══ */}
      {!consent ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-card px-5 py-4">
          <HeartPulse className="h-4 w-4 shrink-0 text-faint" />
          <p className="min-w-0 flex-1 text-[14px] leading-snug text-muted">
            <b className="font-semibold text-ink">Wellbeing checks are off.</b> If your sleep and your own check-ins
            dip together, Vadal can offer you something gentle — only ever you, never your manager.
          </p>
          <Switch checked={consent} onChange={(v: boolean) => { setConsent(v); toast("Wellbeing checks on — private to you"); }} label="Turn on" />
        </div>
      ) : check.triggered ? (
        <Card>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-[var(--purple)]" />
            <Eyebrow>Wellbeing check</Eyebrow>
          </div>
          <p className="mt-2 max-w-xl text-[16px] leading-relaxed">{check.message}</p>
          <p className="mt-2 text-[12px] text-faint">Noticed: {check.reason}. Not shared with anyone.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/product/help"><Button variant="brand" className="min-h-[44px]">Talk to someone, privately</Button></Link>
            <Switch checked={consent} onChange={(v: boolean) => { setConsent(v); toast("Wellbeing checks off"); }} label="Keep checks on" />
          </div>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-card px-5 py-4">
          <HeartPulse className="h-4 w-4 shrink-0 text-[var(--success)]" />
          <p className="min-w-0 flex-1 text-[14px] text-muted">Wellbeing checks are on. Nothing to raise right now.</p>
          <Switch checked={consent} onChange={(v: boolean) => { setConsent(v); toast("Wellbeing checks off"); }} label="On" />
        </div>
      )}

      {/* ══ health and money, genuinely side by side ══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">

        {/* ── health ── */}
        <div className="flex flex-col gap-6">
          <Card>
            <Eyebrow>Challenges</Eyebrow>
            <ul className="mt-4 flex flex-col gap-3">
              {challenges.map((c) => {
                const isIn = joined.includes(c.id);
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-semibold">{c.name}</p>
                      <p className="mt-0.5 text-[14px] text-muted">{c.blurb}</p>
                      <p className="mt-1 text-[12px] text-faint">{c.participants.toLocaleString()} taking part · ends in {c.endsIn} days</p>
                    </div>
                    <Button size="sm" variant={isIn ? "tertiary" : "brand"} className="min-h-[44px] lg:min-h-0"
                      onClick={() => { setJoined((j) => (isIn ? j.filter((x) => x !== c.id) : [...j, c.id])); toast(isIn ? `Left ${c.name}` : `Joined ${c.name} 🎉`); }}>
                      {isIn ? "Joined" : "Join"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
              <Eyebrow>Your leaderboard group</Eyebrow>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{myCohort?.basis}</p>
            <div className="mt-4 flex flex-col gap-4">
              {cohorts.map((co) => (
                <div key={co.name} className={`rounded-2xl border p-4 ${co === myCohort ? "border-[var(--purple)]" : "border-line"}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold">{co.name}</p>
                    {co === myCohort && <Badge tone="brand" variant="soft" size="sm">You</Badge>}
                    <span className="ml-auto text-[12px] text-faint">{co.members.length} people</span>
                  </div>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {[...co.members].sort((a, b) => b.avgDailySteps - a.avgDailySteps).map((m, i) => (
                      <li key={m.email} className="flex items-center gap-2 text-[14px]">
                        <span className="w-4 shrink-0 text-[12px] font-semibold text-faint">{i + 1}</span>
                        <span className="truncate">{m.email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                        <span className="truncate text-[12px] text-faint">· {m.role}</span>
                        <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums">{m.avgDailySteps.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] leading-snug text-faint">
              A warehouse picker walks 18,000 steps doing their job. A designer walking 8,000 has tried much harder.
              Ranking them together makes the effort invisible, so we don&apos;t.
            </p>
          </Card>
        </div>

        {/* ── money — equal billing, per the brief ── */}
        <div className="flex flex-col gap-6">
          {moneyOfWeek && (
            <Card>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[var(--purple)]" />
                <Eyebrow>Money this week</Eyebrow>
              </div>
              <h2 className="mt-2 text-[20px] font-bold leading-snug tracking-[-0.015em]">{moneyOfWeek.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{moneyOfWeek.body}</p>
              <p className="mt-3 text-[12px] leading-snug text-faint">{moneyOfWeek.disclaimer} {moneyOfWeek.handoff}</p>

              <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
                <Eyebrow>Ask about money</Eyebrow>
                <form onSubmit={(e) => { e.preventDefault(); setMoneyAnswer(financialTips(surface === "frontline" ? "entry" : "mid", "IN", askedMoney)); }} className="mt-2 flex items-center gap-2">
                  <input value={askedMoney} onChange={(e) => setAskedMoney(e.target.value)} placeholder="e.g. how much should I save?"
                    className="min-h-[44px] min-w-0 flex-1 rounded-full border border-line bg-card px-3.5 text-[16px] outline-none focus:border-[var(--ai-accent)]" />
                  <Button type="submit" size="sm" variant="brand" className="min-h-[44px]">Ask</Button>
                </form>
                {moneyAnswer && ("refused" in moneyAnswer ? (
                  <p className="mt-3 text-[14px] leading-relaxed">{moneyAnswer.refused}</p>
                ) : (
                  <div className="mt-3">
                    <p className="text-[14px] font-semibold">{moneyAnswer[0].title}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted">{moneyAnswer[0].body}</p>
                    <p className="mt-2 text-[12px] leading-snug text-faint">{moneyAnswer[0].disclaimer}</p>
                  </div>
                ))}
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {wealthArticles.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <button onClick={() => toast(`Opening “${a.title}”`)} className="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-line px-3.5 text-left transition hover:bg-soft">
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{a.title}</span>
                      <span className="shrink-0 text-[12px] text-faint">{a.minutes} min</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <Eyebrow>Benefits you haven&apos;t used</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2.5">
              {benefitNudges.map(({ benefit, nudge }) => (
                <li key={benefit.id} className="rounded-2xl border border-line p-4">
                  <p className="text-[14px] font-semibold">{benefit.name}</p>
                  <p className="mt-1 text-[14px] leading-snug text-muted">{nudge.text}</p>
                  <Button size="sm" variant="tertiary" className="mt-2.5 min-h-[44px] lg:min-h-0" onClick={() => toast(`Call requested about ${benefit.name}`)}>
                    Book a call
                  </Button>
                </li>
              ))}
              {benefitNudges.length === 0 && <li className="text-[14px] text-faint">Nothing closing soon.</li>}
            </ul>
          </Card>

          {/* Devices collapsed to one honest line — three rows saying "Connect"
              on a flow that does not exist yet was three rows of nothing. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-card px-5 py-4">
            <Watch className="h-4 w-4 shrink-0 text-faint" />
            <p className="min-w-0 flex-1 text-[14px] text-muted">
              <b className="font-semibold text-ink">{devices.find((d) => d.connected)?.name}</b> is connected —
              steps, active minutes and sleep.
            </p>
            <button onClick={() => toast("Connecting another device is a backend integration")} className="min-h-[44px] rounded-full px-3 text-[14px] font-semibold text-[var(--purple)] transition hover:bg-soft lg:min-h-0 lg:px-0 lg:hover:bg-transparent">
              Add another
            </button>
          </div>

          <Link href="/product/recognition" className="flex min-h-[44px] items-center gap-2 px-1 text-[14px] font-semibold text-[var(--purple)] transition hover:gap-2.5">
            Your {points.balance.toLocaleString()} points, shared with Recognition <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {nudges.length > 0 && (
        <p className="px-1 text-[12px] text-faint">
          Nudges are timed to around {String(nudges[0].deliverAtHour).padStart(2, "0")}:00 — when you usually act on them.
        </p>
      )}
    </div>
  );
}
