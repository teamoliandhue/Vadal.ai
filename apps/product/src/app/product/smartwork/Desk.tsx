"use client";
/* The desk, for the People team (SmartWork, spec 051).

   One number decides whether this module is worth its licence: the share of
   questions that never needed a person. Everything else on this screen exists
   to move that number — the topics where the desk keeps failing, the questions
   no document answers, and the policies it is quoting that nobody has reviewed
   in over a year. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileWarning, Plus, ShieldAlert } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { ViewToggle } from "@/components/viz";
import { desk, resolutionRate, stalePolicies } from "@/lib/smartwork";
import { toast } from "../Toaster";
import { Eyebrow } from "./parts";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const RESOLVED = "var(--viz-1)";
const HUMAN = "var(--viz-2)";

export function Desk() {
  const [table, setTable] = React.useState(false);
  const worst = [...desk.byTopic].sort((a, b) => a.resolved - b.resolved)[0];

  return (
    <div className="flex flex-col gap-6">
      {/* ── the headline ── */}
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-36px_rgba(20,20,40,0.3)] sm:p-8">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-r lg:border-line lg:pr-8">
            <div>
              <p className="text-[14px] text-muted">Resolved without a person</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{resolutionRate}%</span>
                <span className="text-[14px] text-faint">of {desk.asked30d.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-1.5 text-[13px] text-faint">Last 30 days · answered or done on the spot</p>
            </div>
            <div>
              <p className="text-[14px] text-muted">Went to a person</p>
              <div className="mt-1 text-[28px] font-bold leading-none tracking-tight tabular-nums">{desk.escalated}</div>
              <p className="mt-1.5 text-[13px] text-faint">{desk.medianEscalationDays} days to close, typically</p>
            </div>
          </div>
          <div className="min-w-0">
            <Eyebrow>What the desk is doing</Eyebrow>
            <p className="mt-2.5 flex items-start gap-2.5 text-[16px] leading-relaxed text-ink">
              <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
              <span>
                Answers land in {desk.medianAnswerSeconds} seconds, and {resolutionRate}% never reach your team.
                The weak spot is <span className="font-semibold">{worst.topic.toLowerCase()}</span> — only {worst.resolved}% of those get answered here,
                so {worst.escalated} came to you this month.
              </span>
            </p>
            {desk.breachedSla > 0 && (
              <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold" style={{ color: "var(--danger)" }}>
                <ShieldAlert className="h-4 w-4" /> {desk.breachedSla} escalations are past their promised date
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/product/flow"><Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" trailingIcon={<ArrowRight className="h-4 w-4" />}>Open the case queue</Button></Link>
              <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />}
                onClick={() => ask("Which HR questions should we write policy for first?")}>Ask Nudge what to write first</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── by topic ── */}
      <section aria-labelledby="topic-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="topic-h" className="text-[18px] font-bold tracking-tight">Where the desk copes, and where it doesn&rsquo;t</h2>
            <p className="mt-0.5 text-[14px] text-muted">Share of each topic answered here, against what reached your team.</p>
          </div>
          <ViewToggle table={table} onChange={setTable} label="By topic" />
        </div>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Legend">
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: RESOLVED }} />Answered by the desk</li>
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: HUMAN }} />Needed a person</li>
        </ul>

        {table ? (
          <table className="mt-4 w-full border-collapse text-[14px]">
            <caption className="sr-only">Questions by topic, and how many needed a person</caption>
            <thead><tr className="text-left text-[12px] text-faint"><th className="pb-2 font-semibold">Topic</th><th className="pb-2 text-right font-semibold">Asked</th><th className="pb-2 text-right font-semibold">Answered here</th><th className="pb-2 text-right font-semibold">To a person</th></tr></thead>
            <tbody>
              {desk.byTopic.map((t) => (
                <tr key={t.topic} className="border-t border-line">
                  <th scope="row" className="py-2.5 text-left font-medium text-ink">{t.topic}</th>
                  <td className="py-2.5 text-right tabular-nums text-muted">{t.asked}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums">{t.resolved}%</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{t.escalated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {desk.byTopic.map((t) => (
              <li key={t.topic} className="grid grid-cols-1 items-center gap-x-5 gap-y-2 py-3.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_150px]">
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-ink">{t.topic}</span>
                  <span className="mt-0.5 block text-[13px] text-faint">{t.asked} asked</span>
                </span>
                <span className="flex h-3 w-full gap-[2px] overflow-hidden rounded-[4px]">
                  <span style={{ width: `${t.resolved}%`, background: RESOLVED }} />
                  <span style={{ width: `${100 - t.resolved}%`, background: HUMAN }} />
                </span>
                <span className="flex items-baseline justify-between gap-2 lg:justify-end lg:gap-3">
                  <span className="text-[17px] font-bold tabular-nums">{t.resolved}%</span>
                  <span className="text-[13px] text-faint">{t.escalated} to a person</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ── gaps ── */}
        <section aria-labelledby="gap-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
          <h2 id="gap-h" className="text-[18px] font-bold tracking-tight">Questions no document answers</h2>
          <p className="mt-0.5 text-[14px] text-muted">Asked often enough to be worth writing once.</p>
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {desk.gaps.map((g) => (
              <li key={g.q} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug text-ink">{g.q}</span>
                  <span className="mt-0.5 block text-[13px] text-faint">{g.asks} people asked · {g.why}</span>
                </span>
                <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />}
                  onClick={() => toast(`Draft started — Nudge wrote a first answer for "${g.q}"`)}>Write the answer</Button>
              </li>
            ))}
          </ul>
        </section>

        {/* ── stale policy ── */}
        <section aria-labelledby="stale-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
          <h2 id="stale-h" className="text-[18px] font-bold tracking-tight">Policies the desk is quoting</h2>
          <p className="mt-0.5 text-[14px] text-muted">Past their review date, and being read by people today.</p>
          {stalePolicies.length === 0 ? (
            <p className="mt-6 text-[15px] text-faint">Everything the desk quotes was reviewed in the last year.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
              {stalePolicies.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3.5">
                  <FileWarning aria-hidden className="h-4 w-4 shrink-0 text-[var(--warning)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-snug text-ink">{p.title}</span>
                    <span className="mt-0.5 block text-[13px] text-faint">Updated {p.updated} · {p.months} months ago</span>
                  </span>
                  <Link href={`/product/knowledge?a=${p.id}`} className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
                    Review <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-line pt-3 text-[13px] leading-snug text-faint">
            Anyone reading an answer from one of these sees the same warning you do — it is never quoted as though it were current.
          </p>
        </section>
      </div>
    </div>
  );
}
