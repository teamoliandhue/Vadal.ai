"use client";
/* Overview — what needs you today (Pulse v2, spec 049).

   Three questions, in the order a people team asks them on a Monday:
   is anything being missed, how are the live surveys doing, and what did we
   promise last time. Everything here is a decision with a button next to it. */
import * as React from "react";
import { ArrowRight, BellRing, CalendarClock, Check, Clock3, Plus, TriangleAlert } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { PROGRAMMES } from "@/lib/programmes";
import { daysBetween, favourable, fmtDate, resultFor, topicLabel, type FollowUp, type PulseSurvey } from "@/lib/pulse";
import { toast } from "../Toaster";
import { FollowUpList } from "./FollowUps";
import { ResponseBar, StatusPill, pct, type PulseState } from "./parts";

const BEHIND = 45;

export function Overview({ s, onResults, onOpen, onCommit, onDone, onSurveys }: {
  s: PulseState;
  onResults: (id: string) => void;
  onOpen: (id: string) => void;
  onCommit: () => void;
  onDone: (f: FollowUp) => void;
  onSurveys: () => void;
}) {
  const live = s.surveys.filter((x) => x.status === "live");
  const behind = live.flatMap((x) => (x.byTeam ?? [])
    .filter((t) => pct(t.responded, t.invited) < BEHIND && !s.reminded.includes(`${x.id}:${t.team}`))
    .map((t) => ({ survey: x, team: t })));
  const late = s.followUps.filter((f) => f.status !== "done" && f.due < s.today);
  const early = live.map((x) => ({ x, r: resultFor(x.id) })).filter((e) => e.r && !e.r.final).slice(0, 1);
  const coming = s.surveys.filter((x) => x.status === "scheduled");

  const remind = (x: PulseSurvey, team: string) => {
    s.remind(`${x.id}:${team}`);
    toast(`Reminder queued for ${team} — it lands at each person's own time and skips anyone at the weekly limit`);
  };

  const needs = behind.length + late.length + early.length;

  return (
    <div className="flex flex-col gap-8">
      {/* ── needs you ── */}
      {needs > 0 && (
        <section aria-labelledby="needs-h">
          <h2 id="needs-h" className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
            Needs you <span className="rounded-full bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] px-1.5 text-[11px] tracking-normal text-[var(--warning)]">{needs}</span>
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {behind.map(({ survey, team }) => (
              <Need key={`${survey.id}${team.team}`} icon={<BellRing className="h-4 w-4" />} tone="var(--warning)"
                title={`${team.team} is at ${pct(team.responded, team.invited)}%`}
                body={`On ${survey.name} — ${(team.invited - team.responded).toLocaleString("en-US")} people haven't answered, ${daysBetween(s.today, survey.closes!)} days to go.`}
                action={<Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => remind(survey, team.team)}>Send a reminder</Button>} />
            ))}
            {late.map((f) => (
              <Need key={f.id} icon={<Clock3 className="h-4 w-4" />} tone="var(--danger)"
                title={`${f.title}`}
                body={`${f.owner.name.split(" ")[0]}'s follow-up was due ${fmtDate(f.due, true)}. People who answered are waiting to hear.`}
                action={<Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={() => onDone(f)}>Mark done</Button>} />
            ))}
            {early.map(({ x, r }) => {
              const weakest = [...r!.questions].filter((q) => q.topic !== "outcome" && q.previous != null)
                .sort((a, b) => (favourable(a.spread) - a.previous!) - (favourable(b.spread) - b.previous!))[0];
              return (
                <Need key={x.id} icon={<SparkMark size={14} tone="gradient" />} tone="var(--ai-accent)"
                  title={`${x.name}: early read is in`}
                  body={weakest ? `${topicLabel(weakest.topic as never)} is down ${weakest.previous! - favourable(weakest.spread)} points since last round, from ${x.responses.toLocaleString("en-US")} answers so far.` : "Enough answers to read."}
                  action={<Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />} onClick={() => onResults(x.id)}>See results</Button>} />
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* ── live now ── */}
        <section aria-labelledby="live-h" className="flex flex-col gap-3">
          <h2 id="live-h" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">Live now</h2>
          {live.map((x) => <LiveCard key={x.id} x={x} s={s} onOpen={onOpen} onResults={onResults} onRemind={remind} />)}
        </section>

        <div className="flex flex-col gap-8">
          {/* ── follow-ups ── */}
          <section aria-labelledby="fu-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="fu-h" className="text-[18px] font-bold tracking-tight">What we promised</h2>
                <p className="mt-0.5 text-[14px] text-muted">Fixes from past results, and who owns them.</p>
              </div>
              <Button variant="tertiary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={onCommit}>Add</Button>
            </div>
            <div className="mt-4">
              <FollowUpList s={s} items={s.followUps} onDone={onDone} onCommit={onCommit} />
            </div>
          </section>

          {/* ── coming up ── */}
          <section aria-labelledby="up-h">
            <h2 id="up-h" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">Coming up</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {coming.map((x) => (
                <li key={x.id}>
                  <button onClick={() => onOpen(x.id)} className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-left transition hover:bg-soft">
                    <CalendarClock className="h-5 w-5 shrink-0 text-[var(--purple)]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{x.name}</span>
                      <span className="block text-[13px] text-muted">Opens {fmtDate(x.opens, true)} · {x.audience} · {x.sent.toLocaleString("en-US")} people</span>
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button onClick={onSurveys} className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-left transition hover:bg-soft">
                  <span className="grid h-5 w-5 shrink-0 place-items-center text-[16px]" aria-hidden>⚙️</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink">{PROGRAMMES.length} surveys run on their own</span>
                    <span className="block text-[13px] text-muted">Onboarding, stay, manager and exit — sent when something happens</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
                </button>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Need({ icon, tone, title, body, action }: { icon: React.ReactNode; tone: string; title: string; body: string; action: React.ReactNode }) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-card p-4" style={{ boxShadow: `inset 3px 0 0 ${tone}` }}>
      <p className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-ink">
        <span className="mt-0.5 shrink-0" style={{ color: tone }}>{icon}</span>{title}
      </p>
      <p className="mt-1 flex-1 pl-6 text-[13px] leading-snug text-muted">{body}</p>
      <div className="mt-3 pl-6">{action}</div>
    </article>
  );
}

function LiveCard({ x, s, onOpen, onResults, onRemind }: {
  x: PulseSurvey; s: PulseState; onOpen: (id: string) => void; onResults: (id: string) => void; onRemind: (x: PulseSurvey, team: string) => void;
}) {
  const rate = pct(x.responses, x.sent);
  const left = x.closes ? daysBetween(s.today, x.closes) : null;
  const hasResult = !!resultFor(x.id);
  const teams = [...(x.byTeam ?? [])].sort((a, b) => pct(a.responded, a.invited) - pct(b.responded, b.invited));
  return (
    <article className="rounded-[24px] border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button onClick={() => onOpen(x.id)} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-2"><StatusPill status={x.status} /><span className="text-[13px] text-faint">{x.kind} · {x.audience}</span></span>
          <span className="mt-2 block text-[18px] font-bold leading-snug tracking-tight text-ink hover:underline">{x.name}</span>
        </button>
        <div className="text-right">
          <div className="text-[28px] font-bold leading-none tracking-tight tabular-nums">{rate}%</div>
          <div className="mt-1 text-[13px] text-faint">answered</div>
        </div>
      </div>

      <div className="mt-4"><ResponseBar rate={rate} projected={x.projected} /></div>
      <p className="mt-2 flex flex-wrap gap-x-2 text-[13px] text-muted">
        <span><span className="font-semibold text-ink">{x.responses.toLocaleString("en-US")}</span> of {x.sent.toLocaleString("en-US")}</span>
        <span aria-hidden>·</span>
        <span>{left == null ? "Rolling — every leaver is asked" : left <= 0 ? "Closes today" : `Closes ${fmtDate(x.closes!, true)}, in ${left} day${left === 1 ? "" : "s"}`}</span>
        {x.projected != null && <><span aria-hidden>·</span><span>On pace for about {x.projected}%</span></>}
      </p>

      {teams.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[13px] font-semibold text-muted">By team, lowest first</p>
          <ul className="mt-2 flex flex-col">
            {teams.map((t) => {
              const r = pct(t.responded, t.invited);
              const low = r < BEHIND;
              const done = s.reminded.includes(`${x.id}:${t.team}`);
              return (
                <li key={t.team} className="grid min-h-[44px] grid-cols-[minmax(0,1fr)_88px_44px_auto] items-center gap-3 py-1">
                  <span className="truncate text-[14px] text-ink">{t.team}</span>
                  <span className="relative h-1.5 rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${r}%`, background: low ? "var(--warning)" : "var(--purple)" }} /></span>
                  <span className="flex items-center justify-end gap-1 text-[14px] font-semibold tabular-nums">
                    {low && <TriangleAlert className="h-3.5 w-3.5 text-[var(--warning)]" aria-label="Behind" />}{r}%
                  </span>
                  <span className="w-[84px] text-right">
                    {done ? <span className="text-[13px] text-faint">Reminded</span>
                      : low ? <button onClick={() => onRemind(x, t.team)} className="min-h-[44px] text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">Remind</button>
                      : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {hasResult && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onResults(x.id)}>Early read</Button>}
        <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onOpen(x.id)}>Details</Button>
      </div>
    </article>
  );
}
