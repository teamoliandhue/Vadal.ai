"use client";
/* ═══════════════════ running the programme (admin) ═══════════════════
   Comms and HR have a genuinely different job here from the person sharing,
   and the first build mixed the two: admin-only cards sat in the employee's
   right rail, so an employee's screen was half somebody else's dashboard and
   comms' most important numbers were a footnote on it.

   Four jobs, in the order the work actually happens:

   1. DECIDE what enters the queue — the first build had HR pushing posts with
      no review step, which is how a post nobody wants their name on ends up in
      front of 12,000 people.
   2. FORECAST before publishing, not after. Comms picked on instinct and found
      out afterwards.
   3. READ the declines. We already collected why people passed and drew it as
      four bars, which is data, not insight.
   4. DEFEND the programme. Reach is modelled and always will be; referral
      applications and hires are counted. That distinction is the difference
      between surviving a budget review and not. */
import * as React from "react";
import Image from "next/image";
import { ArrowRight, Check, Target, TrendingUp, Users, X } from "lucide-react";
import { Badge, Button, SparkMark } from "@vadal/design-system";
import { declineInsight, forecastReach, scoreAdvocacy } from "@/lib/ai/engines/advocacy";
import {
  advocacyCampaign, advocacyStats, companyPostReach, declineSignal, queueCandidates, referrals, shares,
} from "@/lib/amplify";
import { GoalRing } from "@/components/charts";
import { toast } from "../Toaster";
import { Card, Eyebrow, PlatformLine } from "./parts";

const inr = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

export function Programme() {
  const [decided, setDecided] = React.useState<Record<string, "in" | "out">>({});
  const impact = scoreAdvocacy(shares, companyPostReach);
  const verdict = declineInsight(declineSignal, advocacyStats.resharesThisMonth);
  const pending = queueCandidates.filter((q) => !decided[q.id]);

  const VERDICT_COLOR = { bad: "var(--danger)", warn: "var(--warning)", ok: "var(--success)" } as const;

  return (
    <div className="flex flex-col gap-6">

      {/* ══ THE CAMPAIGN ══ the burst, and what it actually returned ══
          A steady drip of asks is what advocacy usually is, and it is why it
          fades. A campaign has a goal, a window and an end. */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-32px_rgba(20,20,40,0.32)]">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, var(--client-brand, var(--purple)) 9%, transparent), transparent 62%)" }}
          aria-hidden
        />

        <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <GoalRing
            id="advocacy-campaign"
            value={advocacyCampaign.shares}
            goal={advocacyCampaign.targetShares}
            size={132}
            label={`of ${advocacyCampaign.targetShares}`}
            format={(v) => String(Math.round(v))}
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>Live campaign</Eyebrow>
              <Badge tone="brand" variant="soft" size="sm">{advocacyCampaign.window}</Badge>
            </div>
            <h1 className="mt-2 text-[clamp(24px,2.8vw,32px)] font-bold leading-[1.05] tracking-[-0.025em]">
              {advocacyCampaign.name}
              <span className="mt-1 block text-[16px] font-normal leading-snug tracking-normal text-muted">
                {advocacyCampaign.goal}
              </span>
            </h1>
          </div>

          {/* The numbers that are COUNTED, set apart from everything modelled.
              Reach is an estimate and always will be; an application is a fact. */}
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-l lg:border-line lg:pl-8">
            <div>
              <div className="text-[30px] font-bold leading-none tracking-tight tabular-nums">{advocacyCampaign.applications}</div>
              <div className="mt-1 text-[12px] text-faint">applications, traced to a share</div>
            </div>
            <div>
              <div className="text-[30px] font-bold leading-none tracking-tight tabular-nums">{advocacyCampaign.hires}</div>
              <div className="mt-1 text-[12px] text-faint">
                hired · {inr(advocacyCampaign.hires * advocacyCampaign.agencyFeePerHire)} of agency fees not spent
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <div className="flex flex-col gap-6 xl:col-span-7">

          {/* ══ THE QUEUE ══ a decision, with the forecast attached to it ══ */}
          <div>
            <div className="pb-3">
              <Eyebrow>Waiting on you</Eyebrow>
              <p className="mt-1 text-[14px] text-muted">
                Nothing reaches an employee&apos;s feed until it is approved here.
              </p>
            </div>

            {pending.length === 0 ? (
              <Card className="items-center py-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-[var(--purple)]">
                  <Check className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <p className="mt-4 text-[16px] font-semibold">Queue is clear</p>
                <p className="mt-1 text-[14px] text-muted">Nothing is waiting on a decision.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {pending.map((q) => {
                  const f = forecastReach(advocacyStats.participants, q.avgFollowers, q.platform);
                  return (
                    <article key={q.id} className="card-lift overflow-hidden rounded-[26px] border border-line bg-card">
                      <div className="flex flex-col sm:flex-row">
                        {q.image && (
                          <div className="relative min-h-[160px] shrink-0 sm:w-44">
                            <Image src={q.image} alt="" fill sizes="176px" className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 p-5 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <PlatformLine p={q.platform} posted={`suggested by ${q.suggestedBy}`} />
                          </div>
                          <p className="mt-2.5 text-[15px] leading-relaxed">{q.text}</p>

                          {/* The fix for "not my area" — target it before it runs. */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-[12px] text-faint">Best for</span>
                            {q.audience.map((a) => (
                              <span key={a} className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-medium text-muted">{a}</span>
                            ))}
                          </div>

                          {/* ── the forecast, before the decision ── */}
                          <div className="mt-4 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
                            <div className="flex items-center gap-2">
                              <SparkMark size={14} tone="gradient" />
                              <Eyebrow>If you queue this</Eyebrow>
                            </div>
                            <div className="mt-2.5 flex flex-wrap items-end gap-x-6 gap-y-2">
                              <div>
                                <div className="text-[24px] font-bold leading-none tracking-tight tabular-nums">
                                  {f.low.toLocaleString()}–{f.high.toLocaleString()}
                                </div>
                                <div className="mt-1 text-[12px] text-faint">people reached, beyond the company account</div>
                              </div>
                              <div>
                                <div className="text-[24px] font-bold leading-none tracking-tight tabular-nums">~{f.likelySharers}</div>
                                <div className="mt-1 text-[12px] text-faint">
                                  likely to share, at the usual {Math.round(f.assumedShareRate * 100)}%
                                </div>
                              </div>
                            </div>
                            <p className="mt-2.5 text-[12px] leading-snug text-faint">{f.caveat}</p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="brand" className="min-h-[44px] lg:min-h-0"
                              leadingIcon={<Check className="h-3.5 w-3.5" />}
                              onClick={() => { setDecided((d) => ({ ...d, [q.id]: "in" })); toast(`Queued to ${q.audience.join(", ")}`); }}>
                              Queue it
                            </Button>
                            <Button size="sm" variant="tertiary" className="min-h-[44px] lg:min-h-0"
                              leadingIcon={<X className="h-3.5 w-3.5" />}
                              onClick={() => { setDecided((d) => ({ ...d, [q.id]: "out" })); toast("Passed — it won't be shown to anyone"); }}>
                              Not this one
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ REFERRALS ══ the P&L defence ══ */}
          <Card>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Referrals from shares</Eyebrow>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
              Counted, not modelled. A hiring post shared without a code is an impression nobody can
              trace — this is what makes the programme arguable in a budget review.
            </p>
            <table className="mt-4 w-full text-[14px]">
              <thead>
                <tr className="text-[12px] uppercase tracking-[0.08em] text-faint">
                  <th className="pb-2 text-left font-semibold">Employee</th>
                  <th className="pb-2 text-right font-semibold">Clicks</th>
                  <th className="pb-2 text-right font-semibold">Applied</th>
                  <th className="pb-2 text-right font-semibold">Hired</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.employee} className="border-t border-line">
                    <td className="py-2.5 pr-3 font-medium">{r.employee}</td>
                    <td className="py-2.5 text-right tabular-nums text-muted">{r.clicks}</td>
                    <td className="py-2.5 text-right tabular-nums text-muted">{r.applications}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">{r.hired || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-5">

          {/* ══ WHY PEOPLE PASSED ══ read, not just charted ══ */}
          <Card>
            <Eyebrow>Why people passed</Eyebrow>

            <div
              className="mt-3 rounded-2xl p-4"
              style={{
                background: `color-mix(in srgb, ${VERDICT_COLOR[verdict.tone]} 9%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${VERDICT_COLOR[verdict.tone]} 24%, transparent)`,
              }}
            >
              <p className="text-[15px] font-bold leading-snug">{verdict.headline}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{verdict.detail}</p>
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {declineSignal.map((d) => {
                const total = declineSignal.reduce((n, x) => n + x.count, 0);
                const pct = (d.count / total) * 100;
                return (
                  <li key={d.reason}>
                    <div className="flex items-center gap-2 text-[14px]">
                      <span className="truncate">{d.reason}</span>
                      <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-faint">{d.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${pct}%`, background: pct > 40 ? VERDICT_COLOR[verdict.tone] : "color-mix(in srgb, var(--muted) 40%, transparent)" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[12px] leading-snug text-faint">
              Never attributed to anyone. Being able to say no is what keeps the yes worth having.
            </p>
          </Card>

          {/* ══ MODELLED REACH ══ kept away from the counted numbers ══ */}
          <Card>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Modelled reach</Eyebrow>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[30px] font-bold leading-none tracking-tight tabular-nums">+{impact.estimatedReach.toLocaleString()}</span>
              <span className="pb-1 text-[14px] text-faint">beyond the company account</span>
            </div>
            <p className="mt-1 text-[12px] text-faint">The post itself reached {companyPostReach.toLocaleString()}.</p>

            <div className="mt-4">
              <Eyebrow>Worth recognising</Eyebrow>
              <ul className="mt-2 flex flex-col gap-1.5">
                {impact.topContributors.map((c) => (
                  <li key={c.employee} className="flex items-center gap-2 text-[14px]">
                    <span className="truncate">{c.employee}</span>
                    <span className="ml-auto shrink-0 text-[12px] font-semibold tabular-nums text-faint">{c.reach.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="sm" variant="secondary" className="mt-3 min-h-[44px] lg:min-h-0"
                trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
                onClick={() => toast("Kudos drafted for 5 people — review them in Recognition")}
              >
                Recognise all five
              </Button>
            </div>
            <p className="mt-3 text-[12px] leading-snug text-faint">{impact.caveat}</p>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--purple)]" />
              <Eyebrow>Taking part</Eyebrow>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[30px] font-bold leading-none tracking-tight tabular-nums">{advocacyStats.participants}</span>
              <span className="pb-1 text-[14px] text-faint">
                of {advocacyStats.ofEmployees.toLocaleString()} — {((advocacyStats.participants / advocacyStats.ofEmployees) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
              Opt-in and off by default. A low number here is not a failure — it is the number of
              people who genuinely chose to lend you their name.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
