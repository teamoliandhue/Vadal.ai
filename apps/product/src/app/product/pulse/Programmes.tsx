"use client";
/* Lifecycle programmes + smart send (Pulse, admins).

   Programmes run on a trigger, not a launch button: onboarding at day 7/30/90,
   stay interviews every six months, manager effectiveness quarterly, exit at
   resignation and 60 days later. Each can be switched off, previewed exactly as
   a respondent sees it, and reports its last quarter.

   Smart send shows, per person, when and where a survey will arrive — their own
   response history first, their shift second — and who it will NOT reach
   because of quiet hours or the weekly fatigue limit. Those rules are enforced
   in the engine, not left to whoever presses send. */
import * as React from "react";
import Link from "next/link";
import { BellOff, Clock3, Eye, Lock, Moon } from "lucide-react";
import { Badge, SparkMark, Switch } from "@vadal/design-system";
import { DEFAULT_QUIET, FATIGUE_LIMIT_PER_WEEK, planSend } from "@/lib/ai/engines/timing";
import { PROGRAMMES, SAMPLE_RECIPIENTS } from "@/lib/programmes";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const CHANNEL: Record<string, string> = { app: "Vadal app", push: "Push", sms: "SMS", whatsapp: "WhatsApp", email: "Email", teams: "Teams" };

export function Programmes() {
  const [on, setOn] = usePersistentState<Record<string, boolean>>("vadal:programmes-on", { onboarding: true, stay: true, manager: true, exit: true });
  const plans = SAMPLE_RECIPIENTS.map((r) => ({ r, p: planSend(r) }));
  const blocked = plans.filter((x) => !x.p.allowed).length;

  return (
    <>
      <section className="flex flex-col gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Lifecycle programmes</p>
          <p className="mt-1 text-[14px] text-muted">Surveys that run themselves on a trigger. Every one is adaptive — people only get the questions their answers make worth asking.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PROGRAMMES.map((p) => {
            const enabled = on[p.id] !== false;
            return (
              <article key={p.id} className={`card-lift flex flex-col rounded-[26px] border bg-card p-6 transition ${enabled ? "border-line" : "border-dashed border-line opacity-75"}`}>
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--lav)] text-[24px]" aria-hidden>{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[16px] font-bold tracking-tight">{p.name}</h3>
                      {p.anonymous && <Badge tone="brand" size="sm"><Lock className="mr-1 inline h-3 w-3" />Anonymous</Badge>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted"><Clock3 className="h-3.5 w-3.5 shrink-0" /> {p.trigger}</p>
                  </div>
                  <Switch checked={enabled} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOn((s) => ({ ...s, [p.id]: e.target.checked })); toast(e.target.checked ? `${p.name} is running` : `${p.name} is paused — nothing more will be sent`); }} label={enabled ? "On" : "Off"} />
                </div>
                <p className="mt-3 text-[13px] leading-snug text-muted">{p.why}</p>
                <p className="mt-2 text-[12px] text-faint">{p.audience}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[[p.stats.sentThisQuarter.toLocaleString("en-US"), "sent this quarter"], [`${p.stats.responseRate}%`, "responded"], [`${p.questions.length}`, "questions at most"]].map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-soft py-2.5"><div className="text-[16px] font-bold tabular-nums">{v}</div><div className="text-[11px] text-faint">{l}</div></div>
                  ))}
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-[13px] text-ink"><SparkMark size={14} tone="gradient" className="mt-[2px] shrink-0" /> Top theme last quarter: <span className="font-semibold">{p.stats.topTheme}</span></p>

                <details className="group mt-3">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[13px] font-semibold text-[var(--purple)] lg:min-h-0">Questions, and when each is asked</summary>
                  <ol className="mt-2 space-y-1.5 text-[13px] text-muted">
                    {p.questions.map((q, i) => (
                      <li key={q.id} className="flex gap-2"><span className="w-4 shrink-0 tabular-nums text-faint">{i + 1}</span><span>{q.text}{q.when ? <span className="text-faint"> · only if an earlier answer calls for it</span> : <span className="text-faint"> · always</span>}</span></li>
                    ))}
                  </ol>
                </details>
                <Link href={`/product/survey/${p.id}`} className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-full px-1 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
                  <Eye className="h-4 w-4" /> Preview as a respondent
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Smart send</p>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">When each person gets it</h2>
            <p className="mt-1 max-w-2xl text-[14px] text-muted">Their own response history first, their shift second. Quiet hours ({hh(DEFAULT_QUIET.from)}–{hh(DEFAULT_QUIET.to)}) and the limit of {FATIGUE_LIMIT_PER_WEEK} sends a week are enforced, not suggested.</p>
          </div>
          {blocked > 0 && <Badge tone="warning" size="sm">{blocked} held back</Badge>}
        </div>
        <div className="-mx-1 mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-faint">
                <th scope="col" className="px-1 pb-2 font-semibold">Who (sample)</th>
                <th scope="col" className="px-1 pb-2 font-semibold">Arrives</th>
                <th scope="col" className="px-1 pb-2 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(({ r, p }) => (
                <tr key={r.email} className="border-t border-line align-top">
                  <th scope="row" className="px-1 py-2.5 text-left font-medium text-ink">{r.label}<span className="block text-[12px] font-normal text-faint">{r.shift === "desk" ? "Desk" : `${r.shift[0].toUpperCase()}${r.shift.slice(1)} shift`}</span></th>
                  <td className="whitespace-nowrap px-1 py-2.5">
                    {p.allowed
                      ? <span className="font-semibold tabular-nums text-ink">{hh(p.hour)} · {CHANNEL[p.channel]}</span>
                      : <span className="inline-flex items-center gap-1 font-semibold text-[var(--warning)]">{p.blockedBy === "quiet-hours" ? <Moon className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}{p.blockedBy === "quiet-hours" ? "Held — quiet hours" : "Held — too many this week"}</span>}
                  </td>
                  <td className="px-1 py-2.5 text-muted">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
