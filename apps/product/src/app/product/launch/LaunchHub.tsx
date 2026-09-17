"use client";
/* Launch — implementation and customer success (Platform · admins).

   A workspace is never "launched" once. This one went live in August 2025 and
   is now bringing night shift and logistics on, in Hindi, on WhatsApp. So the
   page leads with the phase in flight — what is blocked and who owns it — and
   keeps the earlier phases as the record. Readiness is read from the product
   where it can be (is the translation add-on on, is the onboarding programme
   running), so it is not a checklist someone forgot to tick. */
import * as React from "react";
import { AlertTriangle, CalendarDays, Check, Circle, CircleDot } from "lucide-react";
import { Avatar, Badge, Button, type BadgeTone } from "@vadal/design-system";
import { Legend, LineChart, ViewToggle } from "@/components/viz";
import { MONTHLY } from "@/lib/adoption";
import { LAUNCH_MONTHS, LAUNCH_PHASES, SUCCESS, type StepStatus } from "@/lib/platform";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";
import { useTranslationAddon } from "../useTranslationAddon";

const STEP: Record<StepStatus, { label: string; tone: BadgeTone }> = {
  done: { label: "Done", tone: "success" }, doing: { label: "In progress", tone: "info" },
  next: { label: "Next", tone: "neutral" }, blocked: { label: "Blocked", tone: "warning" },
};
const StepIcon = ({ s }: { s: StepStatus }) =>
  s === "done" ? <Check className="h-4 w-4 text-[var(--success)]" />
    : s === "blocked" ? <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
    : s === "doing" ? <CircleDot className="h-4 w-4 text-[var(--purple)]" />
    : <Circle className="h-4 w-4 text-faint" />;

export function LaunchHub() {
  const addon = useTranslationAddon();
  const [programmes] = usePersistentState<Record<string, boolean>>("vadal:programmes-on", { onboarding: true, stay: true, manager: true, exit: true });
  const [booked, setBooked] = usePersistentState<string[]>("vadal:launch-booked", []);
  const [table, setTable] = React.useState(false);

  const current = LAUNCH_PHASES.find((p) => p.steps.some((s) => s.status !== "done")) ?? LAUNCH_PHASES[LAUNCH_PHASES.length - 1];
  const past = LAUNCH_PHASES.filter((p) => p !== current);
  const readiness = [
    { label: "Translation add-on on, for Hindi", ok: addon.enabled === true, where: "Settings → Translation" },
    { label: "Onboarding check-ins running", ok: programmes.onboarding !== false, where: "Pulse → Programmes" },
    { label: "Hindi WhatsApp templates approved", ok: false, where: "Link → WhatsApp Business" },
    { label: "Every night shift manager trained", ok: false, where: "9 of 14 so far" },
  ];
  const series = [
    { key: "active", label: "Weekly active", color: "var(--viz-1)", values: MONTHLY.weeklyActive },
    { key: "checkin", label: "Checked in that week", color: "var(--viz-2)", values: MONTHLY.checkedIn },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Platform</p>
        <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Launch</h1>
        <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-muted">
          Live since August 2025. What&rsquo;s in flight now, who owns each part, and how use has grown since day one.
        </p>
      </header>

      {/* The five phases, as a strip — the current one stands out. */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Rollout phases">
        {LAUNCH_PHASES.map((p, i) => {
          const done = p.steps.filter((s) => s.status === "done").length;
          const isCurrent = p === current;
          return (
            <li key={p.id} className={`rounded-2xl border p-3.5 ${isCurrent ? "col-span-2 border-[var(--purple)] bg-[var(--lav)] sm:col-span-1" : "border-line bg-card"}`} aria-current={isCurrent ? "step" : undefined}>
              <p className="text-[12px] text-faint">{i + 1} · {p.when}</p>
              <p className="mt-0.5 text-[15px] font-semibold text-ink">{p.name}</p>
              <p className="text-[12px] text-muted">{done === p.steps.length ? "Done" : `${done} of ${p.steps.length} done`}</p>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="now-h">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="now-h" className="text-[18px] font-bold tracking-tight">Now: {current.name}</h2>
            <Badge tone="brand" size="sm">{current.when}</Badge>
          </div>
          <p className="mt-1 text-[14px] text-muted">{current.goal}.</p>
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {current.steps.map((s) => (
              <li key={s.title} className="flex items-start gap-3 py-3">
                <span className="mt-[2px]"><StepIcon s={s.status} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{s.title}</p>
                  <p className="text-[13px] text-faint">{s.owner}{s.note ? ` · ${s.note}` : ""}</p>
                </div>
                <Badge tone={STEP[s.status].tone} size="sm">{STEP[s.status].label}</Badge>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-2xl bg-soft p-4">
            <p className="text-[14px] font-semibold text-ink">Ready for night shift to go live?</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-[13px]">
              {readiness.map((r) => (
                <li key={r.label} className="flex items-start gap-2">
                  {r.ok ? <Check className="mt-[2px] h-4 w-4 shrink-0 text-[var(--success)]" /> : <Circle className="mt-[2px] h-4 w-4 shrink-0 text-faint" />}
                  <span><span className="text-ink">{r.label}</span> <span className="text-faint">· {r.where}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] text-faint">{readiness.filter((r) => r.ok).length} of {readiness.length} ready — the first two are read live from your settings.</p>
          </div>

          <details className="group mt-4">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[13px] font-semibold text-[var(--purple)] lg:min-h-0">Earlier phases</summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {past.map((p) => (
                <div key={p.id} className="rounded-2xl border border-line p-3.5">
                  <p className="text-[14px] font-semibold text-ink">{p.name} <span className="font-normal text-faint">· {p.when}</span></p>
                  <p className="text-[12px] text-muted">{p.goal}</p>
                  <ul className="mt-2 space-y-1 text-[13px] text-muted">
                    {p.steps.map((s) => <li key={s.title} className="flex gap-2"><span className="mt-[2px]"><StepIcon s={s.status} /></span>{s.title}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </section>

        <div className="flex flex-col gap-6">
          <section className="card-lift rounded-[26px] border border-line bg-card p-6" aria-labelledby="csm-h">
            <h2 id="csm-h" className="text-[16px] font-bold tracking-tight">Your success team</h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={SUCCESS.manager.img} name={SUCCESS.manager.name} size="md" />
              <div>
                <p className="text-[14px] font-semibold text-ink">{SUCCESS.manager.name}</p>
                <p className="text-[12px] text-faint">{SUCCESS.manager.role}</p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink"><CalendarDays className="h-4 w-4 text-faint" /> {SUCCESS.nextReview}</p>
            <p className="mt-4 text-[13px] font-semibold text-ink">Open requests</p>
            <ul className="mt-1.5 flex flex-col gap-2">
              {SUCCESS.requests.map((r) => (
                <li key={r.title} className="flex items-start justify-between gap-2 text-[13px]">
                  <span className="min-w-0"><span className="text-ink">{r.title}</span> <span className="text-faint">· opened {r.opened}</span></span>
                  <Badge tone={r.status === "Done" ? "success" : "neutral"} size="sm">{r.status}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-lift rounded-[26px] border border-line bg-card p-6" aria-labelledby="train-h">
            <h2 id="train-h" className="text-[16px] font-bold tracking-tight">Training</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {SUCCESS.sessions.map((s) => {
                const mine = booked.includes(s.title);
                return (
                  <li key={s.title} className="rounded-2xl bg-soft p-3.5 text-[13px]">
                    <p className="font-semibold text-ink">{s.title}</p>
                    <p className="text-faint">{s.when} · {s.seats}</p>
                    <Button variant={mine ? "tertiary" : "secondary"} size="sm" className="mt-2 min-h-[44px] lg:min-h-0" disabled={mine} onClick={() => { setBooked((b) => [...b, s.title]); toast("Booked — it's in your calendar"); }}>
                      {mine ? "Booked" : "Book a seat"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="use-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="use-h" className="text-[18px] font-bold tracking-tight">Use since launch</h2>
            <p className="mt-1 text-[13px] text-faint">Share of the people invited at the time, by month · Aug 2025 – Sep 2026</p>
          </div>
          <ViewToggle table={table} onChange={setTable} label="Use since launch" />
        </div>
        <div className="mt-4"><Legend series={series} shape="line" /></div>
        <div className="mt-3">
          <LineChart labels={LAUNCH_MONTHS} series={series} unit="%" domain={[0, 100]} height={230} table={table} caption="Weekly active and checked-in share of the people invited at the time, by month since launch" />
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Weekly use went from {MONTHLY.weeklyActive[0]}% in the pilot month to {MONTHLY.weeklyActive[MONTHLY.weeklyActive.length - 1]}% now. Check-ins took longer to catch on and are still climbing — from {MONTHLY.checkedIn[0]}% to {MONTHLY.checkedIn[MONTHLY.checkedIn.length - 1]}%.
        </p>
      </section>
    </div>
  );
}
