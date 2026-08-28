"use client";
/* THRIVE — Pillar 4. "One wellness pillar: physical health and financial health,
   side by side."

   Four AI features from the brief are live here:
   · personalised nudges timed to when the person actually acts
   · smart challenge matching — the leaderboard is grouped by how much your job
     already moves you, so a picker and a designer aren't ranked on step count
   · the consented, anomaly-aware wellbeing check, which offers a warm handoff
     into Pillar 7 and is never visible to a manager
   · financial guidance that refuses to recommend a product, because that is
     regulated advice and needs someone licensed */
import * as React from "react";
import Link from "next/link";
import { Activity, ArrowRight, HeartPulse, Moon, Trophy, Wallet, Watch } from "lucide-react";
import { Badge, Button, SparkMark, Switch } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { activityNudges, buildCohorts, financialTips, unusedBenefits, wellbeingCheck } from "@/lib/ai/engines/wellbeing";
import { myActivity, devices, challenges, participants, benefits, wealthArticles, points, mySignals } from "@/lib/thrive";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

export function ThriveHub() {
  const [consent, setConsent] = usePersistentState<boolean>("vadal:wellbeing-consent", false);
  const [joined, setJoined] = usePersistentState<string[]>("vadal:thrive-joined", ["monsoon"]);
  const [askedMoney, setAskedMoney] = React.useState("");
  const [moneyAnswer, setMoneyAnswer] = React.useState<ReturnType<typeof financialTips> | null>(null);

  const nudges = activityNudges(myActivity);
  const cohorts = buildCohorts(participants);
  const myCohort = cohorts.find((c) => c.members.some((m) => m.email === "aarav@oliandhue.com")) ?? cohorts[0];
  const check = wellbeingCheck({ ...mySignals, consented: consent });
  const benefitNudges = unusedBenefits(benefits);
  const pct = Math.min(100, Math.round((myActivity.stepsThisWeek / myActivity.stepGoal) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* hero — activity ring + nudges */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <Eyebrow>Thrive</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">
              {myActivity.stepsThisWeek.toLocaleString()} <span className="text-muted">of {myActivity.stepGoal.toLocaleString()} steps</span>
            </h1>
            <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-line">
              <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: "var(--client-brand, var(--purple))" }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[14px] text-muted">
              <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-faint" />{myActivity.activeMinutes} active minutes</span>
              <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-faint" />{myActivity.sleepHoursAvg}h average sleep</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-faint" />#{points.rank} of {points.of}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {nudges.map((n) => (
              <div key={n.text} className="flex max-w-sm items-start gap-2.5 rounded-2xl bg-[var(--ai-surface)] px-4 py-3 ring-1 ring-[var(--ai-border)]">
                <SparkMark size={14} tone="solid" className="mt-[3px] shrink-0" />
                <div>
                  <p className="text-[14px] leading-snug">{n.text}</p>
                  <p className="mt-0.5 text-[12px] text-faint">Sent around {String(n.deliverAtHour).padStart(2, "0")}:00 — when you usually act.</p>
                </div>
              </div>
            ))}
            {nudges.length === 0 && <p className="text-[14px] text-faint">Nothing worth nudging you about today.</p>}
          </div>
        </div>
      </header>

      {/* the wellbeing check — consent-gated, never punitive, never seen by a manager */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Wellbeing check</Eyebrow>
            </div>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">
              If your activity or sleep drops sharply <i>and</i> your own check-ins dip at the same time, Vadal can offer
              you something gentle. Only ever you — never your manager, never HR, never a flag on a dashboard.
            </p>
          </div>
          <Switch checked={consent} onChange={(v: boolean) => { setConsent(v); toast(v ? "Wellbeing checks on — private to you" : "Wellbeing checks off"); }} label="Allow wellbeing checks" />
        </div>

        {consent && check.triggered && (
          <div className="mt-4 rounded-2xl border border-line bg-soft p-4">
            <p className="text-[16px] leading-relaxed">{check.message}</p>
            <p className="mt-2 text-[12px] text-faint">Noticed: {check.reason}. Not shared with anyone.</p>
            <Link href="/product/help" className="mt-3 inline-block">
              <Button variant="brand" size="sm">Talk to someone, privately</Button>
            </Link>
          </div>
        )}
        {consent && !check.triggered && <p className="mt-4 text-[14px] text-faint">Nothing to raise — {check.reason}</p>}
        {!consent && <p className="mt-4 text-[14px] text-faint">Off. Nothing about your activity or mood is being combined while this is off.</p>}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <div className="flex flex-col gap-6 xl:col-span-7">
          {/* challenges */}
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
                    <Button size="sm" variant={isIn ? "tertiary" : "brand"}
                      onClick={() => { setJoined((j) => (isIn ? j.filter((x) => x !== c.id) : [...j, c.id])); toast(isIn ? `Left ${c.name}` : `Joined ${c.name} 🎉`); }}>
                      {isIn ? "Joined" : "Join"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* fair cohorts */}
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
                        <span className="ml-auto shrink-0 text-[12px] font-semibold">{m.avgDailySteps.toLocaleString()}</span>
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

        <div className="flex flex-col gap-6 xl:col-span-5">
          {/* wealth */}
          <Card>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Wealth</Eyebrow>
            </div>
            <h3 className="mt-1.5 text-[16px] font-bold tracking-tight">Money, explained plainly</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {wealthArticles.map((a) => (
                <li key={a.id}>
                  <button onClick={() => toast(`Opening “${a.title}”`)} className="flex w-full items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 text-left transition hover:bg-soft">
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{a.title}</span>
                    <span className="shrink-0 text-[12px] text-faint">{a.minutes} min</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
              <Eyebrow>Ask about money</Eyebrow>
              <form onSubmit={(e) => { e.preventDefault(); setMoneyAnswer(financialTips("mid", "IN", askedMoney)); }} className="mt-2 flex items-center gap-2">
                <input value={askedMoney} onChange={(e) => setAskedMoney(e.target.value)} placeholder="e.g. how much should I save?"
                  className="min-h-[40px] min-w-0 flex-1 rounded-full border border-line bg-card px-3.5 text-[14px] outline-none focus:border-[var(--ai-accent)]" />
                <Button type="submit" size="sm" variant="brand">Ask</Button>
              </form>
              {moneyAnswer && ("refused" in moneyAnswer ? (
                <p className="mt-3 text-[14px] leading-relaxed">{moneyAnswer.refused}</p>
              ) : (
                <div className="mt-3">
                  <p className="text-[14px] font-semibold">{moneyAnswer[0].title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{moneyAnswer[0].body}</p>
                  <p className="mt-2 text-[12px] leading-snug text-faint">{moneyAnswer[0].disclaimer} {moneyAnswer[0].handoff}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* benefits */}
          <Card>
            <Eyebrow>Benefits you haven&apos;t used</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2.5">
              {benefitNudges.map(({ benefit, nudge }) => (
                <li key={benefit.id} className="rounded-2xl border border-line p-4">
                  <p className="text-[14px] font-semibold">{benefit.name}</p>
                  <p className="mt-1 text-[14px] leading-snug text-muted">{nudge.text}</p>
                  <Button size="sm" variant="tertiary" className="mt-2.5" onClick={() => toast(`Call requested about ${benefit.name}`)}>
                    Book a call
                  </Button>
                </li>
              ))}
              {benefitNudges.length === 0 && <li className="text-[14px] text-faint">Nothing closing soon.</li>}
            </ul>
          </Card>

          {/* devices */}
          <Card>
            <div className="flex items-center gap-2"><Watch className="h-4 w-4 text-faint" /><Eyebrow>Connected</Eyebrow></div>
            <ul className="mt-3 flex flex-col gap-2">
              {devices.map((d) => (
                <li key={d.name} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium">{d.name}</p>
                    <p className="truncate text-[12px] text-faint">{d.syncs}</p>
                  </div>
                  {d.connected
                    ? <Badge tone="success" variant="soft" size="sm">Connected</Badge>
                    : <button onClick={() => toast(`${d.name} — connect flow is a backend integration`)} className="shrink-0 text-[12px] font-semibold text-[var(--purple)]">Connect</button>}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <Eyebrow>Points</Eyebrow>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-[28px] font-bold tracking-tight">{points.balance.toLocaleString()}</span>
              <span className="pb-1.5 text-[14px] text-faint">+{points.thisMonth} this month</span>
            </div>
            <Link href="/product/recognition" className="mt-3 flex items-center gap-1 text-[14px] font-semibold text-[var(--purple)] transition hover:gap-1.5">
              Shared with Recognition <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
