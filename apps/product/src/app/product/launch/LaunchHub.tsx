"use client";
/* Launch — implementation and customer success (Platform · admins).

   A workspace is never "launched" once. This one went live in August 2025 and
   is now bringing night shift and logistics on, in Hindi, on WhatsApp. So the
   page leads with the phase in flight — what is blocked and who owns it — and
   keeps the earlier phases as the record. Readiness is read from the product
   where it can be (is the translation add-on on, is the onboarding programme
   running), so it is not a checklist someone forgot to tick. */
import * as React from "react";
import { AlertTriangle, ArrowDown, ArrowUp, CalendarDays, Check, Circle, CircleDot, UserRoundPlus } from "lucide-react";
import { Avatar, Badge, Button, type BadgeTone } from "@vadal/design-system";
import { Legend, LineChart, ViewToggle } from "@/components/viz";
import { MONTHLY } from "@/lib/adoption";
import { LAUNCH_MONTHS, LAUNCH_PHASES, SUCCESS, type StepStatus } from "@/lib/platform";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  CLAIM_LABEL, baseline, champions, comms, notClaiming, notYet, outcomes, trainingProgress, valueStats,
  type Claim, type Outcome,
} from "@/lib/value";
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

type View = "rollout" | "adoption" | "value";
const VIEWS: { id: View; label: string }[] = [
  { id: "rollout", label: "Rollout" }, { id: "adoption", label: "Adoption" }, { id: "value", label: "Value" },
];

export function LaunchHub() {
  const [view, setView] = React.useState<View>("rollout");
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
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Enterprise AI platform</p>
        <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Launch</h1>
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
          <span>live since <span className="font-semibold text-ink">August 2025</span></span>
          <span aria-hidden className="text-faint">·</span>
          <span>now: <span className="font-semibold text-ink">{current.name.toLowerCase()}</span></span>
          <span aria-hidden className="text-faint">·</span>
          <span><span className="font-semibold text-ink">{valueStats.ours} of {valueStats.total}</span> baseline measures ours to claim</span>
        </p>
        <p className="mt-2 max-w-[660px] text-[15px] leading-relaxed text-muted">
          What&rsquo;s in flight now, who owns each part, who is still not on it, and what has changed since the baseline.
        </p>
      </header>

      <nav aria-label="Launch views" className="flex items-center gap-1 overflow-x-auto border-b border-line">
        {VIEWS.map((v) => {
          const on = view === v.id;
          return (
            <button key={v.id} onClick={() => setView(v.id)} aria-current={on ? "page" : undefined}
              className={`-mb-px min-h-[44px] shrink-0 border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "value" && <ValueView />}

      {view === "rollout" && (
      <>
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

      </>
      )}

      {view === "adoption" && (
      <>
      <NotOnItYet />

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

      <Champions />
      </>
      )}
    </div>
  );
}

/* ── Change management: the people the curve leaves out ──────────── */
function NotOnItYet() {
  const people = notYet.filter((s) => !s.stopped).reduce((n, s) => n + s.people, 0);
  const never = notYet.filter((s) => !s.stopped).reduce((n, s) => n + s.never, 0);
  const groups = notYet.filter((s) => !s.stopped).length;
  return (
    <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="notyet-h">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <h2 id="notyet-h" className="text-[18px] font-bold tracking-tight">Who is not on it yet</h2>
      <p className="mt-1 max-w-[700px] text-[13px] text-faint">
        {never.toLocaleString("en-US")} people across {groups} groups have never signed in, out of {people.toLocaleString("en-US")} — and one group signed in and drifted away. An adoption average hides them, so they get their own list — with the reason and the next thing to try, not a reminder.
      </p>
      <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
        {notYet.map((s) => (
          <li key={s.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-start">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{s.who}</p>
              <p className="mt-0.5 text-[13px] text-faint">
                {s.stopped
                  ? `${s.stopped} of ${s.people.toLocaleString("en-US")} signed in, then stopped`
                  : s.never === 0
                    ? "everyone has signed in at least once"
                    : `${s.never} of ${s.people.toLocaleString("en-US")} have never signed in`}
              </p>
            </div>
            <div className="min-w-0 text-[13px]">
              <p className="leading-snug text-muted">{s.why}</p>
              <p className="mt-1.5 flex items-start gap-1.5 leading-snug text-ink">
                <UserRoundPlus className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[var(--purple)]" aria-hidden />
                <span>{s.next} <span className="text-faint">· {s.owner}</span></span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Champions() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="champ-h">
        <h2 id="champ-h" className="text-[18px] font-bold tracking-tight">Champions</h2>
        <p className="mt-1 text-[13px] text-faint">The people doing the actual change management, named.</p>
        <ul className="mt-4 flex flex-col gap-4">
          {champions.map((c) => (
            <li key={c.name} className="flex items-start gap-3">
              <Avatar src={c.img} name={c.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink">
                  {c.name}
                  <Badge tone={c.trained ? "success" : "neutral"} size="sm">{c.trained ? "Trained" : "Training booked"}</Badge>
                </p>
                <p className="text-[12px] text-faint">{c.team}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{c.note}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[13px] font-semibold text-ink">Training</p>
          <ul className="mt-2 flex flex-col gap-2">
            {trainingProgress.map((t) => (
              <li key={t.group} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="min-w-0 text-muted">{t.group}</span>
                <span className={`shrink-0 font-semibold tabular-nums ${t.done === t.of ? "text-[var(--success)]" : "text-ink"}`}>{t.done} of {t.of}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="comms-h">
        <h2 id="comms-h" className="text-[18px] font-bold tracking-tight">What has actually been said</h2>
        <p className="mt-1 text-[13px] text-faint">Reach is who it could get to; opened is who read it.</p>
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {comms.map((c) => {
            const pct = Math.round((c.opened / c.reach) * 100);
            return (
              <li key={c.what} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 text-[14px] font-semibold text-ink">{c.what}</p>
                  <p className="shrink-0 text-[14px] font-semibold tabular-nums text-ink">{pct}%<span className="text-[13px] font-normal text-faint"> read</span></p>
                </div>
                <p className="text-[13px] text-faint">{c.when} · {c.channel} · {c.opened.toLocaleString("en-US")} of {c.reach.toLocaleString("en-US")}</p>
                {c.note && <p className="mt-0.5 text-[13px] leading-snug text-muted">{c.note}</p>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ── Value: against the baseline, and what we do not claim ───────── */
const CLAIM_TONE: Record<Claim, BadgeTone> = { ours: "success", shared: "info", context: "neutral" };

function ValueView() {
  const [filter, setFilter] = React.useState<"all" | "ours">("all");
  const rows: Outcome[] = outcomes.filter((o) => filter === "all" || o.claim === "ours");

  const fmt = (n: number, unit: Outcome["unit"]) => (unit === "%" ? `${n}%` : unit === "days" ? `${n} days` : `${n} hrs`);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          ["Baseline taken", baseline.taken, "before go-live, with the People team"],
          ["Measures better", `${valueStats.improved} of ${valueStats.total}`, "against that baseline"],
          ["Ours to claim", `${valueStats.ours}`, "the rest say who else moved them"],
          ["People-team hours back", `${valueStats.hoursSaved}/week`, "stated as hours, never as money"],
        ] as [string, string, string][]).map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[22px] font-bold leading-tight tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="out-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="out-h" className="text-[18px] font-bold tracking-tight">Against the baseline</h2>
            <p className="mt-1 max-w-[680px] text-[13px] text-faint">{baseline.how}</p>
          </div>
          <div className="flex rounded-full bg-soft p-1" role="group" aria-label="Filter measures">
            {([["all", "Everything"], ["ours", "Ours to claim"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
                className={`min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[32px] ${filter === k ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>
        </div>

        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {rows.map((o) => {
            const good = o.better === "up" ? o.now > o.before : o.now < o.before;
            const Arrow = o.now > o.before ? ArrowUp : ArrowDown;
            return (
              <li key={o.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] lg:items-start">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-ink">{o.metric}</p>
                  <Badge tone={CLAIM_TONE[o.claim]} size="sm" className="mt-1">{CLAIM_LABEL[o.claim]}</Badge>
                </div>
                <p className="flex items-center gap-2 text-[15px] tabular-nums lg:px-4">
                  <span className="text-faint">{fmt(o.before, o.unit)}</span>
                  <Arrow className={`h-4 w-4 ${good ? "text-[var(--success)]" : "text-[var(--warning)]"}`} aria-hidden />
                  <span className="font-bold text-ink">{fmt(o.now, o.unit)}</span>
                  <span className="sr-only">{good ? "better than" : "worse than"} the baseline</span>
                </p>
                <p className="min-w-0 text-[13px] leading-snug text-muted">{o.note}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="notclaim-h">
        <h2 id="notclaim-h" className="text-[18px] font-bold tracking-tight">What we are not claiming</h2>
        <p className="mt-1 max-w-[680px] text-[13px] text-faint">A value page without this section is a brochure.</p>
        <ul className="mt-4 flex flex-col gap-3 text-[14px] text-muted">
          {notClaiming.map((n) => (
            <li key={n} className="flex items-start gap-2"><Circle className="mt-[4px] h-3 w-3 shrink-0 text-faint" aria-hidden />{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
