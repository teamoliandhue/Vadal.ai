"use client";
/* New campaign — four short steps instead of one long form (Campaigns v3, spec 047).

   1 Goal     — start from a template, Nudge's suggestion or blank; the objective,
                the audience and the dates.
   2 Sends    — the channels and each send, with a live timeline of the plan.
   3 Message  — the first message, and how it reads for desk, floor and Hindi.
   4 Review   — the whole plan at a glance and the weekly-limit check, with the
                fix one tap away, before anything is scheduled.
   Opened from "Run again" or a suggestion it starts on step 1 already filled. */
import * as React from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Plus, Sparkles, X } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { FATIGUE_LIMIT_PER_WEEK } from "@/lib/ai/engines/timing";
import {
  addDays, audiences, channels, collisions, fmtDate, objectives, starterSteps, suggested, templates, DRAFT_MESSAGE, type Campaign,
} from "@/lib/campaigns";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { useScope } from "../useViewAs";
import { DeliveryPreview } from "./DeliveryPreview";
import { CH_ICON, ObjTile, TODAY, chLabel, shortDate, soft } from "./parts";

export type CampaignSeed =
  | { name: string; objective: string; audience?: string; duration?: string; steps?: string[]; channels?: string[]; fresh?: boolean }
  | null;

type DraftStep = { id: string; label: string; day: number; channel: string };
const DURATIONS = ["1 week", "2 weeks", "30 days", "1 month", "Quarter"] as const;
const DAYS: Record<string, number> = { "1 week": 7, "2 weeks": 14, "30 days": 30, "1 month": 30, Quarter: 90 };
const STEPS = ["Goal", "Sends", "Message", "Review"] as const;
const nextMonday = () => { const d = new Date(`${TODAY}T00:00:00`); return addDays(TODAY, ((8 - d.getDay()) % 7) || 7); };
let sid = 0;
let cid = 0;

/* Spread sends across the campaign: first on day 1, last near the end. */
const spread = (labels: string[], span: number, chans: string[]): DraftStep[] =>
  labels.map((label, i) => ({
    id: `s${sid++}`, label,
    day: labels.length === 1 ? 1 : 1 + Math.round((i * (span - 2)) / (labels.length - 1)),
    channel: chans[i % Math.max(1, chans.length)] ?? "feed",
  }));

export function CampaignBuilder({ seed, existing, onClose, onLaunch }: { seed: CampaignSeed; existing: Campaign[]; onClose: () => void; onLaunch: (c: Campaign) => void }) {
  const { scope: dataScope, team: myTeam } = useScope("Campaigns");
  // Brief §9: managers author team-only — the audience list is narrowed, not the builder withheld.
  const teamOnly = dataScope === "own-team" && !!myTeam;
  const options = React.useMemo<readonly string[]>(() => (teamOnly ? audiences.filter((a) => a === myTeam || a.includes(myTeam!)) : audiences), [teamOnly, myTeam]);

  const [step, setStep] = React.useState(0);
  const [fresh, setFresh] = React.useState(false);
  const [name, setName] = React.useState("");
  const [objective, setObjective] = React.useState(objectives[0].key);
  const [audience, setAudience] = React.useState<string>(teamOnly ? myTeam! : audiences[0]);
  const [duration, setDuration] = React.useState<string>(DURATIONS[1]);
  const [start, setStart] = React.useState<string>(nextMonday());
  const [chans, setChans] = React.useState<string[]>(["feed"]);
  const [sends, setSends] = React.useState<DraftStep[]>([]);
  const [message, setMessage] = React.useState("");
  const [thinking, setThinking] = React.useState(false);

  const apply = React.useCallback((o: { name: string; objective: string; audience?: string; duration?: string; steps?: string[]; channels?: string[] }) => {
    setName(o.name);
    setObjective(o.objective);
    const wanted = o.audience ?? (teamOnly ? myTeam! : audiences[0]);
    setAudience(teamOnly ? (options.includes(wanted) ? wanted : myTeam!) : wanted);
    const dur = DURATIONS.find((d) => d === o.duration) ?? DURATIONS[1];
    setDuration(dur);
    const ch = o.channels?.length ? o.channels : ["feed"];
    setChans(ch);
    const labels = o.steps ?? starterSteps[o.objective] ?? [];
    setSends(spread(labels.length ? labels : [""], DAYS[dur], ch));
    setMessage(DRAFT_MESSAGE[o.objective] ?? DRAFT_MESSAGE.engagement);
  }, [teamOnly, myTeam, options]);

  React.useEffect(() => {
    if (!seed) return;
    setStep(0);
    setStart(nextMonday());
    setFresh(Boolean(seed.fresh));
    apply(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const real = sends.filter((x) => x.label.trim());
  const live = start <= TODAY;
  const end = addDays(start, DAYS[duration] - 1);
  const draft: Campaign = React.useMemo(() => ({
    id: "draft", name: name.trim() || "This campaign", objective, audience, status: live ? "live" : "scheduled",
    reach: 0, participation: 0, lift: 0, window: "", channels: chans, aiReadout: "", owner: "You",
    steps: real.map((x) => { const date = addDays(start, x.day - 1); return { label: x.label.trim(), date, when: fmtDate(date), done: false, channel: x.channel }; }),
  }), [name, objective, audience, live, chans, real, start]);
  const clash = React.useMemo(
    () => collisions([...existing, draft], FATIGUE_LIMIT_PER_WEEK).find((c) => c.sends.some((x) => x.campaign.id === "draft")),
    [existing, draft],
  );

  const stepValid = [
    name.trim().length > 0 && Boolean(start),
    chans.length > 0 && real.length > 0,
    message.trim().length > 0,
    true,
  ];
  const canGo = stepValid.slice(0, step + 1).every(Boolean);

  function draftPlan() {
    setThinking(true);
    window.setTimeout(() => {
      setSends(spread(starterSteps[objective] ?? starterSteps.engagement, DAYS[duration], chans.length ? chans : ["feed"]));
      setThinking(false);
      toast("Nudge drafted the sends — each has a day and a channel");
    }, 600);
  }

  function launch() {
    if (!stepValid.every(Boolean)) return;
    const c: Campaign = {
      ...draft, id: `c-${start}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cid++}`,
      window: live ? `${shortDate(start)} – ${shortDate(end)}` : `Starts ${shortDate(start)}`,
      aiReadout: live ? "Just launched — results appear here as the campaign runs." : "Scheduled — the first send goes out on the start date.",
    };
    onLaunch(c);
    toast(live ? `“${c.name}” is live for ${audience} 🚀` : `“${c.name}” is scheduled for ${fmtDate(start)}`);
    onClose();
  }

  const field = "mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-card px-3 text-[16px] outline-none transition focus:border-[var(--purple)] lg:text-[14px]";
  const label = "text-[13px] font-semibold text-ink";
  const frontline = /Plant Ops|Night shift|Logistics/.test(audience);

  return (
    <Drawer open={!!seed} title="New campaign" onClose={onClose} footer={<div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep((x) => x - 1)}>Back</Button>
          ) : (
            <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onClose}>Cancel</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" disabled={!canGo} trailingIcon={<ArrowRight className="h-4 w-4" />} onClick={() => setStep((x) => x + 1)}>Next: {STEPS[step + 1]}</Button>
          ) : (
            <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={launch}>{live ? "Launch now" : `Schedule for ${shortDate(start)}`}</Button>
          )}
        </div>}>
      <div className="flex min-h-full flex-col">
        <div className="pr-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">New campaign</p>
          <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">{["What's it for, and who's it for?", "What goes out, and when?", "What does it say?", "Ready to go?"][step]}</h2>
        </div>

        {/* stepper */}
        <ol className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Steps">
          {STEPS.map((l, i) => {
            const done = i < step, on = i === step;
            return (
              <li key={l}>
                <button onClick={() => (i < step || stepValid.slice(0, i).every(Boolean)) && setStep(i)} aria-current={on ? "step" : undefined} className="flex w-full min-h-[44px] flex-col items-start gap-1.5 text-left lg:min-h-0">
                  <span className="h-1 w-full rounded-full" style={{ background: done || on ? "var(--purple)" : "var(--line)", opacity: done ? 0.55 : 1 }} />
                  <span className={`text-[12px] font-semibold ${on ? "text-ink" : done ? "text-muted" : "text-faint"}`}>{i + 1} · {l}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex-1">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              {fresh && (
                <section>
                  <p className={label}>Start from</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button onClick={() => apply({ name: suggested.name, objective: suggested.objective, audience: suggested.audience, duration: suggested.window, steps: suggested.steps })}
                      className={`col-span-2 flex min-h-[64px] items-center gap-3 rounded-2xl border p-3 text-left transition ${name === suggested.name ? "border-[var(--ai-accent)] bg-[var(--ai-surface)]" : "border-[var(--ai-border)] bg-[var(--ai-surface)]/60 hover:border-[var(--ai-accent)]"}`}>
                      <SparkMark size={20} tone="gradient" />
                      <span className="min-w-0"><span className="block text-[14px] font-semibold text-ink">{suggested.name}</span><span className="block text-[12px] text-muted">Nudge&rsquo;s suggestion · predicted {suggested.predictedLift} pts</span></span>
                    </button>
                    {templates.map((t) => {
                      const on = name === t.name;
                      return (
                        <button key={t.key} onClick={() => apply({ name: t.name, objective: t.objective, duration: t.duration })}
                          className={`flex min-h-[64px] items-start gap-2.5 rounded-2xl border p-3 text-left transition ${on ? "border-[var(--purple)] bg-[var(--lav)]" : "border-line hover:border-[var(--purple)]"}`}>
                          <span aria-hidden className="text-[18px] leading-none">{objectives.find((o) => o.key === t.objective)?.emoji}</span>
                          <span className="min-w-0"><span className="block text-[13px] font-semibold leading-snug text-ink">{t.name}</span><span className="block text-[12px] text-faint">{t.duration}</span></span>
                        </button>
                      );
                    })}
                    <button onClick={() => apply({ name: "", objective })} className={`col-span-2 min-h-[44px] rounded-2xl border border-dashed px-3 text-[13px] font-semibold transition ${!name ? "border-[var(--purple)] text-ink" : "border-line text-muted hover:text-ink"}`}>
                      Start blank
                    </button>
                  </div>
                </section>
              )}

              <label className="block"><span className={label}>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Burnout reset — Engineering" className={field} />
              </label>

              <div>
                <span className={label}>Objective</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {objectives.map((o) => {
                    const on = o.key === objective;
                    return (
                      <button key={o.key} onClick={() => setObjective(o.key)} aria-pressed={on}
                        className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "border-[var(--purple)] bg-[var(--lav)] text-ink" : "border-line text-muted hover:text-ink"}`}>
                        <span aria-hidden>{o.emoji}</span> {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block"><span className={label}>Audience</span>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} className={field}>
                  {(options.length ? options : [myTeam!]).map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                {teamOnly && <span className="mt-1.5 block text-[12px] text-faint">You can run campaigns for {myTeam}. Company-wide sends are an HR admin action.</span>}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className={label}>Starts</span>
                  <input type="date" value={start} min={TODAY} onChange={(e) => setStart(e.target.value)} className={field} />
                </label>
                <label className="block"><span className={label}>Runs for</span>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className={field}>
                    {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
              </div>
              <p className="-mt-2 text-[13px] text-muted">{live ? "Starts today" : `${fmtDate(start)}`} → {fmtDate(end)}</p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <span className={label}>Channels</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {channels.map((c) => {
                    const on = chans.includes(c.key);
                    return (
                      <button key={c.key} onClick={() => setChans((x) => (on ? x.filter((k) => k !== c.key) : [...x, c.key]))} aria-pressed={on}
                        className={`min-h-[44px] rounded-full border px-3 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "border-[var(--purple)] bg-[var(--lav)] text-ink" : "border-line text-muted hover:text-ink"}`}>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                {/* judged on what the sends use, not on which channels are ticked */}
                {frontline && real.length > 0 && !real.some((x) => x.channel === "whatsapp" || x.channel === "sms") && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-3.5 py-3" style={{ background: soft("var(--warning)", 10) }}>
                    <p className="flex min-w-0 flex-1 items-start gap-1.5 text-[13px] text-ink"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" /> Most of {audience} is on shared phones. None of these sends go by WhatsApp or SMS, so many won&rsquo;t see them.</p>
                    <button
                      onClick={() => { setChans((c) => (c.includes("whatsapp") ? c : [...c, "whatsapp"])); setSends((xs) => xs.map((y) => ({ ...y, channel: "whatsapp" }))); toast("Every send now goes by WhatsApp"); }}
                      className="min-h-[44px] shrink-0 rounded-full bg-card px-3.5 text-[13px] font-semibold text-ink ring-1 ring-line hover:ring-[var(--purple)] lg:min-h-[32px]"
                    >
                      Send them on WhatsApp
                    </button>
                  </div>
                )}
              </div>


              <div>
                <div className="flex items-center justify-between">
                  <span className={label}>Sends <span className="font-normal text-faint">· {real.length}</span></span>
                  <button onClick={draftPlan} disabled={thinking} className="flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] hover:opacity-80 disabled:opacity-60 lg:min-h-0">
                    <Sparkles className={`h-3.5 w-3.5 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Draft the sends"}
                  </button>
                </div>
                <ol className="mt-2 space-y-2">
                  {sends.map((x, i) => (
                    <li key={x.id} className="rounded-2xl border border-line bg-card p-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-soft text-[12px] font-bold text-muted">{i + 1}</span>
                        <input value={x.label} onChange={(e) => setSends((xs) => xs.map((y) => (y.id === x.id ? { ...y, label: e.target.value } : y)))} placeholder="What goes out" aria-label={`Send ${i + 1}`}
                          className="min-h-[44px] min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:text-faint lg:min-h-[32px] lg:text-[14px]" />
                        <button onClick={() => setSends((xs) => xs.filter((y) => y.id !== x.id))} aria-label={`Remove send ${i + 1}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-faint hover:bg-soft hover:text-ink lg:h-8 lg:w-8"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 pl-8 text-[13px]">
                        <label className="flex items-center gap-1.5 text-muted">Day
                          <input type="number" min={1} max={DAYS[duration]} value={x.day} onChange={(e) => setSends((xs) => xs.map((y) => (y.id === x.id ? { ...y, day: Math.max(1, Math.min(DAYS[duration], Number(e.target.value) || 1)) } : y)))}
                            className="min-h-[44px] w-16 rounded-lg border border-line bg-card px-2 text-[16px] tabular-nums outline-none focus:border-[var(--purple)] lg:min-h-[32px] lg:text-[13px]" />
                        </label>
                        <span className="text-faint">{fmtDate(addDays(start, x.day - 1))}</span>
                        <select value={x.channel} onChange={(e) => setSends((xs) => xs.map((y) => (y.id === x.id ? { ...y, channel: e.target.value } : y)))} aria-label={`Channel for send ${i + 1}`}
                          className="ml-auto min-h-[44px] rounded-lg border border-line bg-card px-2 text-[16px] outline-none focus:border-[var(--purple)] lg:min-h-[32px] lg:text-[13px]">
                          {(chans.length ? chans : ["feed"]).map((k) => <option key={k} value={k}>{chLabel(k)}</option>)}
                        </select>
                      </div>
                    </li>
                  ))}
                </ol>
                <button onClick={() => setSends((xs) => [...xs, { id: `s${sid++}`, label: "", day: Math.min(DAYS[duration], (xs.at(-1)?.day ?? 0) + 3), channel: chans[0] ?? "feed" }])}
                  className="mt-2 flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
                  <Plus className="h-3.5 w-3.5" /> Add a send
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="flex items-center justify-between"><span className={label}>First message</span>
                  <button type="button" onClick={() => setMessage(DRAFT_MESSAGE[objective] ?? DRAFT_MESSAGE.engagement)} className="min-h-[44px] text-[12px] font-semibold text-[var(--ai-accent)] hover:opacity-80 lg:min-h-0">Draft for this objective</button>
                </span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-card px-3.5 py-3 text-[16px] leading-relaxed outline-none transition focus:border-[var(--purple)] lg:text-[14px]" />
              </label>
              {message.trim() && <DeliveryPreview message={message} audience={audience} />}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-[22px] border border-line bg-card p-4">
                <div className="flex items-start gap-3">
                  <ObjTile objective={objective} size={44} />
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold leading-snug text-ink">{name}</p>
                    <p className="mt-0.5 text-[13px] text-faint">{objectives.find((o) => o.key === objective)?.label} · {audience}</p>
                  </div>
                </div>
                <ol className="mt-4 flex flex-col gap-2 border-t border-line pt-3">
                  {draft.steps.map((x, i) => {
                    const Icon = CH_ICON[x.channel ?? "feed"];
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-[13px]">
                        <span className="w-[84px] shrink-0 tabular-nums text-faint">{fmtDate(x.date!)}</span>
                        <Icon className="h-3.5 w-3.5 shrink-0 text-faint" />
                        <span className="min-w-0 truncate text-ink">{x.label}</span>
                      </li>
                    );
                  })}
                </ol>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-[13px]">
                  <div><dt className="text-faint">Starts</dt><dd className="font-semibold text-ink">{live ? "Today" : shortDate(start)}</dd></div>
                  <div><dt className="text-faint">Sends</dt><dd className="font-semibold text-ink">{real.length}</dd></div>
                  <div><dt className="text-faint">Channels</dt><dd className="truncate font-semibold text-ink">{[...new Set(real.map((x) => x.channel))].map(chLabel).join(", ")}</dd></div>
                </dl>
              </div>

              {clash ? (
                <div className="rounded-2xl p-4" style={{ background: soft("var(--warning)", 10), boxShadow: `inset 0 0 0 1px ${soft("var(--warning)", 28)}` }}>
                  <p className="flex items-start gap-2 text-[14px] leading-snug text-ink"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                    <span><span className="font-semibold">{clash.team} would get {clash.count} messages</span> the week of {shortDate(clash.week)} — the limit is {FATIGUE_LIMIT_PER_WEEK}.</span></p>
                  <Button variant="secondary" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" leadingIcon={<CalendarClock className="h-4 w-4" />} onClick={() => { setStart(addDays(start, 7)); toast("Moved a week later"); }}>Start a week later</Button>
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-[14px] text-muted"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" /> Every team stays within {FATIGUE_LIMIT_PER_WEEK} messages a week.</p>
              )}
            </div>
          )}
        </div>

      </div>
    </Drawer>
  );
}
