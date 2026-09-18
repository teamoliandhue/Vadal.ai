"use client";
/* Overview — what's running, what needs you, what's next (Campaigns v3, spec 047).

   Read top to bottom it answers, in order: is anything wrong? what's going
   out? what starts soon? what should I run next? what did the last ones teach
   us? Each campaign is one row with its own timeline of sends, so "where is it
   up to" is something you see, not something you read. */
import * as React from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronRight, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { FATIGUE_LIMIT_PER_WEEK } from "@/lib/ai/engines/timing";
import { addDays, collisions, spanOf, suggested, type Campaign } from "@/lib/campaigns";
import { toast } from "../Toaster";
import {
  ObjTile, SendProgress, StatusPill, ask, objOf, shortDate, soft, type CampaignsState,
} from "./parts";
import type { CampaignSeed } from "./CampaignBuilder";

export function Overview({ s, onOpen, onBuild, onPlanner }: {
  s: CampaignsState;
  onOpen: (id: string) => void;
  onBuild: (seed: NonNullable<CampaignSeed>) => void;
  onPlanner: (week?: string) => void;
}) {
  const running = s.visible.filter((c) => c.status === "live" || c.status === "paused");
  const soon = s.visible.filter((c) => c.status === "scheduled").sort((a, b) => (spanOf(a)?.start ?? "").localeCompare(spanOf(b)?.start ?? ""));
  const finished = s.visible.filter((c) => c.status === "completed");

  const clash = s.isAdmin ? collisions(s.all, FATIGUE_LIMIT_PER_WEEK)[0] : undefined;
  const movable = clash
    ? [...new Set(clash.sends.map((x) => x.campaign.id))].map((id) => s.all.find((c) => c.id === id)!)
      .filter((c) => c.status === "scheduled" && s.canEdit(c))
      .sort((a, b) => clash.sends.filter((x) => x.campaign.id === b.id).length - clash.sends.filter((x) => x.campaign.id === a.id).length)[0]
    : undefined;
  const paused = running.filter((c) => c.status === "paused" && s.canEdit(c));

  return (
    <div className="flex flex-col gap-8">
      {/* needs you — short, and calm when there's nothing */}
      <section aria-labelledby="needs-h">
        <h2 id="needs-h" className="sr-only">Needs you</h2>
        {!clash && paused.length === 0 ? (
          <p className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-4 py-3 text-[14px] text-muted">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
            Nothing needs you — every team is within {FATIGUE_LIMIT_PER_WEEK} messages a week.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {clash && (
              <li className="flex flex-col gap-3 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center" style={{ background: soft("var(--warning)", 10), boxShadow: `inset 0 0 0 1px ${soft("var(--warning)", 28)}` }}>
                <span className="flex min-w-0 flex-1 items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                  <span className="text-[14px] leading-snug text-ink">
                    <span className="font-semibold">{clash.team} would get {clash.count} messages</span> the week of {shortDate(clash.week)} <span className="text-muted">— the limit is {FATIGUE_LIMIT_PER_WEEK}.</span>
                  </span>
                </span>
                <span className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:items-center">
                  <button onClick={() => onPlanner(clash.week)} className="order-2 min-h-[44px] rounded-full border border-line bg-card px-3.5 text-[13px] font-semibold text-ink sm:order-1 sm:border-0 sm:bg-transparent sm:hover:bg-card lg:min-h-[34px]">See the week</button>
                  {movable && (
                    <Button variant="brand" size="sm" className="order-1 min-h-[44px] w-full sm:order-2 sm:w-auto lg:min-h-0" leadingIcon={<CalendarClock className="h-4 w-4" />}
                      onClick={() => { s.shift(movable.id, 7); toast(`“${movable.name}” now starts ${shortDate(addDays(spanOf(movable)!.start, 7))} — every send still goes out`); }}>
                      Start {shortName(movable.name)} a week later
                    </Button>
                  )}
                </span>
              </li>
            )}
            {paused.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 sm:flex-row sm:items-center">
                <span className="flex min-w-0 flex-1 items-start gap-2.5">
                  <Pause className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                  <span className="text-[14px] leading-snug text-ink"><span className="font-semibold">{c.name} is paused</span> <span className="text-muted">— nothing goes out until you resume it.</span></span>
                </span>
                <Button variant="secondary" size="sm" className="min-h-[44px] self-start lg:min-h-0 sm:self-auto" leadingIcon={<Play className="h-4 w-4" />} onClick={() => { s.setStatus(c.id, "live"); toast(`${c.name} resumed`); }}>Resume</Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Group title="Running now" count={running.length} empty="Nothing is running right now.">
        {running.map((c) => <Row key={c.id} c={c} s={s} onOpen={onOpen} />)}
      </Group>

      <Group title="Starting soon" count={soon.length} empty="Nothing scheduled.">
        {soon.map((c) => <Row key={c.id} c={c} s={s} onOpen={onOpen} />)}
      </Group>

      {s.isAdmin && (
        <section className="relative overflow-hidden rounded-[26px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-6 sm:p-7" aria-labelledby="sugg-h">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl ai-grad" aria-hidden />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--ai-accent)]"><Sparkles className="h-3.5 w-3.5" /> Nudge suggests what to run next</p>
              <h2 id="sugg-h" className="mt-2 text-[22px] font-bold tracking-tight">{suggested.name}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{suggested.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => onBuild({ name: suggested.name, objective: suggested.objective, audience: suggested.audience, duration: suggested.window, steps: suggested.steps })}>Plan this campaign</Button>
                <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => ask(`Why are you suggesting the "${suggested.name}" campaign?`)}>Why this?</Button>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--ai-border)] bg-card/80 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">The plan · {suggested.window}</span>
                <span className="text-[13px] font-semibold text-[var(--success)]">Predicted {suggested.predictedLift} pts</span>
              </div>
              <ol className="mt-3 flex flex-col gap-2.5">
                {suggested.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5 text-[14px] text-ink">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line bg-soft text-[11px] font-bold text-muted">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <Group title="Finished" count={finished.length}>
          {finished.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center">
              <button onClick={() => onOpen(c.id)} className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left">
                <ObjTile objective={c.objective} size={40} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-ink">{c.name}</span>
                  <span className="block truncate text-[13px] text-faint">{c.audience} · {c.window}</span>
                </span>
              </button>
              <span className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-[52px] sm:pl-0">
                <Metric value={`${c.participation}%`} label="took part" />
                {c.comparison && <Metric value={`+${Math.round((c.lift - c.comparison.lift) * 10) / 10}`} label="its own lift" />}
                {c.lessons?.length ? (
                  <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<RotateCcw className="h-4 w-4" />} onClick={() => onOpen(c.id)}>Run again, improved</Button>
                ) : null}
              </span>
            </li>
          ))}
        </Group>
      )}
    </div>
  );
}

function Group({ title, count, empty, children }: { title: string; count: number; empty?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="flex items-baseline gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
        {title} <span className="tabular-nums">{count}</span>
      </h2>
      {count === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-6 text-center text-[14px] text-faint">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">{children}</ul>
      )}
    </section>
  );
}

function Metric({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-[18px] font-bold leading-none tabular-nums" style={tone ? { color: tone } : undefined}>{value}</span>
      <span className="mt-1 text-[12px] text-faint">{label}</span>
    </span>
  );
}

/* One campaign: who and what on the left, its sends across time in the middle, how it's doing on the right. */
function Row({ c, s, onOpen }: { c: Campaign; s: CampaignsState; onOpen: (id: string) => void }) {
  const sent = c.steps.filter((x) => x.done).length;
  const o = objOf(c.objective);

  return (
    <li>
      <button
        onClick={() => onOpen(c.id)}
        className="group grid w-full gap-4 rounded-[22px] border border-line bg-card p-4 text-left transition hover:border-[color-mix(in_srgb,var(--purple)_45%,var(--line))] hover:shadow-[0_18px_40px_-28px_rgba(20,20,40,0.35)] sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_auto_20px] lg:items-center lg:gap-6"
      >
        <span className="flex min-w-0 items-start gap-3">
          <ObjTile objective={c.objective} />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[16px] font-semibold leading-snug text-ink">{c.name}</span>
              <StatusPill status={c.status} />
            </span>
            <span className="mt-1 block truncate text-[13px] text-faint">{o.label} · {c.audience}{s.teamScoped && c.owner !== "You" ? ` · run by ${c.owner}` : ""}</span>
          </span>
        </span>

        <SendProgress c={c} />

        <span className="flex items-center gap-6 lg:justify-end">
          {c.participation > 0 ? (
            <>
              <Metric value={`${c.participation}%`} label="took part" />
              <Metric value={`+${c.lift}`} label="pts lift" tone="var(--success)" />
            </>
          ) : (
            <Metric value={`${sent}/${c.steps.length}`} label="sent" />
          )}
        </span>
        <ChevronRight className="hidden h-5 w-5 text-faint transition group-hover:translate-x-0.5 group-hover:text-ink lg:block" />
      </button>
    </li>
  );
}

/* The short name reads better on a button. */
function shortName(name: string) { return name.length > 28 ? `“${name.split(" — ")[0]}”` : `“${name}”`; }
