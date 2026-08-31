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
import { Activity, ArrowRight, CalendarClock, GraduationCap, HeartPulse, Plus, Trophy, Wallet, Watch } from "lucide-react";
import { Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { activityNudges, buildCohorts, chooseFocus, contentFor, financialTips, moneyMoment, unusedBenefits, wellbeingCheck } from "@/lib/ai/engines/wellbeing";
import {
  myActivity, devices, challenges, participants, benefits, wealthArticles, points, mySignals,
  atWorkStepsPerDay, weekSteps, weekStepsFrontline, weekSleep, weekDays, moneyConfig,
} from "@/lib/thrive";
import { GoalRing, DayArea } from "@/components/charts";
import { Card, Eyebrow, HalfHeader } from "./parts";
import { Challenges } from "./Challenges";
import { Cohorts } from "./Cohorts";
import { useSession } from "../useSession";
import { toast } from "../Toaster";

export function ThriveHub() {
  const { session } = useSession();
  const surface = session?.profile === "frontline" ? "frontline" : "desk";

  /* `=== true` is deliberate — see the same guard in amplify/AmplifyHub. This
     one gates reading someone's wellbeing signals, so an unreadable stored
     value must mean "no consent", never "yes". */
  const [consentRaw, setConsent] = usePersistentState<boolean>("vadal:wellbeing-consent", false);
  const consent = consentRaw === true;
  const [joined, setJoined] = usePersistentState<string[]>("vadal:thrive-joined", ["monsoon"]);
  const [logged, setLogged] = usePersistentState<string[]>("vadal:thrive-log-today", []);
  const [askedMoney, setAskedMoney] = React.useState("");
  const [moneyAnswer, setMoneyAnswer] = React.useState<ReturnType<typeof financialTips> | null>(null);

  const focus = chooseFocus(surface, myActivity, surface === "frontline" ? atWorkStepsPerDay : 0);
  const isRecovery = focus.metric === "recovery";
  const series = isRecovery ? weekSleep : surface === "frontline" ? weekStepsFrontline : weekSteps;

  const nudges = activityNudges(myActivity);
  const cohorts = buildCohorts(participants);
  /* No `?? cohorts[0]` fallback. If we cannot find this person among the
     participants we do not know which group is theirs, and badging one "You"
     anyway tells them their effort is being compared against a set of people it
     is not. Undefined is the honest answer; Cohorts renders without the badge. */
  const myCohort = cohorts.find((c) => c.members.some((m) => m.email === session?.email));
  const check = wellbeingCheck({ ...mySignals, consented: consent });
  const benefitNudges = unusedBenefits(benefits);
  const band = surface === "frontline" ? "entry" : "mid";
  /* Read once per mount rather than per render — a Date created in render
     would differ between server and client and break hydration. */
  const [today] = React.useState(() => new Date());
  // See moneyConfig: the demo pay day is relative so the payday moment is
  // visible on any day someone opens this. A real tenant has a fixed date.
  const paydayDayOfMonth = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - moneyConfig.demoPaydayDaysAgo);
    return d.getDate();
  }, [today]);
  const moment = moneyMoment({ ...moneyConfig, today, band, region: "IN", paydayDayOfMonth });
  const shiftContent = contentFor(surface, session?.team ?? "");
  const [moved, setMoved] = React.useState(false);


  return (
    <div className="flex flex-col gap-6">

      {/* ══ HERO ══ the metric that is actually theirs, and why ══
          Depth here is deliberate: this is the one thing on the page that
          should feel like a made object rather than a container. An Aurora
          wash on the surface, the brand glow behind it, and a hairline of
          gradient at the top edge — the same signature the AI dock uses,
          because this number is chosen by the same engine. */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, var(--client-brand, var(--purple)) 9%, transparent), transparent 62%)" }}
          aria-hidden
        />

        <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[auto_1fr_1.05fr] lg:items-center">
          {/* the ratio, as a ratio */}
          <GoalRing
            id="thrive-goal"
            value={focus.value}
            goal={focus.goal ?? 1}
            size={132}
            label={isRecovery ? `of ${focus.goal}h` : `of ${(focus.goal ?? 0) / 1000}k`}
            format={(v) => (isRecovery ? `${v}h` : `${(v / 1000).toFixed(1)}k`)}
          />

          <div className="min-w-0">
            <Eyebrow>{isRecovery ? "Your recovery" : "Your week"}</Eyebrow>
            {/* weight contrast rather than size alone — the number is the
                subject, the unit is grammar. */}
            <h1 className="mt-2 text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.02] tracking-[-0.03em]">
              {isRecovery ? `${focus.value} hours` : focus.value.toLocaleString()}
              <span className="block text-[16px] font-normal leading-snug tracking-normal text-muted">
                {isRecovery ? `a night · aiming for ${focus.goal}` : `of ${focus.goal?.toLocaleString()} steps this week`}
              </span>
            </h1>

            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted">{focus.why}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-muted">
              {isRecovery && (
                <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-faint" />{atWorkStepsPerDay.toLocaleString()} on shift</span>
              )}
              <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-faint" />{points.balance.toLocaleString()} pts · #{points.rank}</span>
            </div>
          </div>

          {/* the week, as a week — a shape, not seven rectangles */}
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <Eyebrow>Last 7 days</Eyebrow>
              <span className="text-[12px] text-faint">{isRecovery ? "hours slept" : "steps"}</span>
            </div>
            <DayArea
              id="thrive-week"
              className="mt-2"
              values={series}
              labels={weekDays}
              unit={isRecovery ? "hours" : "steps"}
              goal={isRecovery ? focus.goal : focus.goal ? Math.round(focus.goal / 7) : undefined}
            />
          </div>
        </div>

        {/* one thing to do, on its own ground so it reads as the action */}
        <div className="relative flex flex-col gap-4 border-t border-line bg-soft/60 px-7 py-5 sm:flex-row sm:items-center sm:gap-3 sm:px-9">
          <span className="ai-grad ai-aura grid h-8 w-8 shrink-0 place-items-center rounded-full"><SparkMark size={16} tone="solid" /></span>
          {/* full width on a phone: sharing a row with the button squeezed this
              to one word per line. */}
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
          <p className="relative border-t border-line px-7 py-3 text-[12px] text-faint sm:px-9">
            {logged.length} logged today. Undo from the Copilot if that was a mistake.
          </p>
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
          <Switch checked={consent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setConsent(e.target.checked); toast(e.target.checked ? "Wellbeing checks on — private to you" : "Wellbeing checks off"); }} label="Turn on" />
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
            <Switch checked={consent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setConsent(e.target.checked); toast(e.target.checked ? "Wellbeing checks on" : "Wellbeing checks off"); }} label="Keep checks on" />
          </div>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-card px-5 py-4">
          <HeartPulse className="h-4 w-4 shrink-0 text-[var(--success)]" />
          <p className="min-w-0 flex-1 text-[14px] text-muted">Wellbeing checks are on. Nothing to raise right now.</p>
          <Switch checked={consent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setConsent(e.target.checked); toast(e.target.checked ? "Wellbeing checks on" : "Wellbeing checks off"); }} label="On" />
        </div>
      )}

      {/* ══ health and money, genuinely side by side ══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">

        {/* ── health ── */}
        <div className="flex flex-col gap-6">
          <HalfHeader
            hue="#5D63E1"
            icon={<HeartPulse className="h-[19px] w-[19px]" strokeWidth={1.9} />}
            title="Your body"
            state={isRecovery
              ? `${myActivity.sleepHoursAvg}h average sleep · ${challenges.filter((c) => joined.includes(c.id)).length} challenge running`
              : `${myActivity.activeMinutes} active minutes this week · ${challenges.filter((c) => joined.includes(c.id)).length} challenge running`}
          />
          {/* The metric already knew Ravi works nights; the content did not.
              The material for it exists one pillar over, so hand it over rather
              than writing a second copy of it here. */}
          {shiftContent && (
            <Card>
              <div className="flex items-center gap-2">
                <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
                <Eyebrow>Made for your shift</Eyebrow>
              </div>
              <h2 className="mt-2 text-[18px] font-bold leading-snug tracking-[-0.015em]">{shiftContent.headline}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{shiftContent.body}</p>
              {shiftContent.course && (
                <Link href="/product/grow" className="mt-4 flex min-h-[44px] items-center gap-3 rounded-2xl border border-line p-4 transition hover:bg-soft">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[var(--purple)]">
                    <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.85} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{shiftContent.course.title}</span>
                    <span className="block text-[12px] text-faint">{shiftContent.course.minutes} min · in Grow</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
                </Link>
              )}
            </Card>
          )}

          <Challenges joined={joined} setJoined={setJoined} />

          <Cohorts cohorts={cohorts} myCohort={myCohort} myEmail={session?.email} />
        </div>

        {/* ── money — equal billing, per the brief ── */}
        <div className="flex flex-col gap-6">
          <HalfHeader
            hue="#17a35e"
            icon={<Wallet className="h-[19px] w-[19px]" strokeWidth={1.9} />}
            title="Your money"
            state={`${benefitNudges.length} benefit${benefitNudges.length === 1 ? "" : "s"} you haven\u2019t claimed`}
          />
          {/* The money moment. An article is equally true on any day; this is
              the one that is true TODAY, and the reason the wealth half is
              worth opening rather than worth having. */}
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Money</Eyebrow>
              {moment.kind !== "steady" && (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{
                    background: moment.urgency === "now"
                      ? "color-mix(in srgb, var(--client-brand, var(--purple)) 14%, transparent)"
                      : "var(--soft)",
                    color: moment.urgency === "now" ? "var(--client-brand, var(--purple))" : "var(--muted)",
                  }}
                >
                  <CalendarClock className="h-3 w-3" /> {moment.when}
                </span>
              )}
            </div>

            <h2 className="mt-2 text-[20px] font-bold leading-snug tracking-[-0.015em]">{moment.title}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">{moment.body}</p>

            {moment.action && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  variant={moved ? "tertiary" : "brand"}
                  className="min-h-[44px]"
                  onClick={() => {
                    setMoved(true);
                    toast(moment.kind === "payday" ? "Standing instruction set — it'll move on payday from now on" : "Opening the details");
                  }}
                >
                  {moved ? "Done" : moment.action}
                </Button>
                {moment.kind === "payday" && !moved && (
                  <span className="text-[12px] text-faint">Sets it up once. You can stop it any time.</span>
                )}
              </div>
            )}

            <p className="mt-3 text-[12px] leading-snug text-faint">{moment.disclaimer} {moment.handoff}</p>

            <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
              <Eyebrow>Ask about money</Eyebrow>
              <form onSubmit={(e) => { e.preventDefault(); setMoneyAnswer(financialTips(band, "IN", askedMoney)); }} className="mt-2 flex items-center gap-2">
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

            {/* Four identical grey rows said nothing about what any of them
                were. The topic is the useful sort key — someone comes here with
                a question about pay or about cover, not for "an article". */}
            <ul className="mt-5 flex flex-col">
              {wealthArticles.slice(0, 4).map((a) => (
                <li key={a.id} className="border-t border-line first:border-t-0">
                  <button
                    onClick={() => toast(`Opening “${a.title}”`)}
                    className="group flex min-h-[52px] w-full items-center gap-3 py-2.5 text-left"
                  >
                    <span className="w-[74px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
                      {a.topic}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] font-medium leading-snug transition group-hover:text-[var(--purple)]">
                      {a.title}
                    </span>
                    <span className="shrink-0 text-[12px] tabular-nums text-faint">{a.minutes} min</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--purple)]" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Money already paid for on your behalf and going unclaimed. The
              worth was buried mid-sentence and the deadline read as trivia —
              they are the two things that decide whether anyone acts, so they
              carry the weight now. */}
          <Card>
            <Eyebrow>Benefits you haven&apos;t used</Eyebrow>
            <ul className="mt-3.5 flex flex-col gap-3">
              {benefitNudges.map(({ benefit }) => {
                const days = benefit.enrolmentClosesInDays ?? 0;
                const soon = days > 0 && days <= 30;
                return (
                  <li key={benefit.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-snug">{benefit.name}</p>
                      {benefit.worth && (
                        <p className="mt-1 text-[20px] font-bold leading-none tracking-tight tabular-nums text-[var(--success)]">
                          {benefit.worth}
                        </p>
                      )}
                      <p className="mt-1.5 flex items-center gap-1.5 text-[12px]">
                        <CalendarClock className="h-3 w-3 shrink-0" style={{ color: soon ? "var(--warning)" : "var(--faint)" }} />
                        <span style={soon ? { color: "var(--warning)", fontWeight: 600 } : { color: "var(--faint)" }}>
                          Enrolment closes in {days} days
                        </span>
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" className="min-h-[44px] lg:min-h-0" onClick={() => toast(`Call requested about ${benefit.name}`)}>
                      Book a call
                    </Button>
                  </li>
                );
              })}
              {benefitNudges.length === 0 && <li className="text-[14px] text-faint">Nothing closing soon.</li>}
            </ul>
            <p className="mt-3 text-[12px] leading-snug text-faint">
              You are already paying for these through your package. Unused, they are money left behind.
            </p>
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
