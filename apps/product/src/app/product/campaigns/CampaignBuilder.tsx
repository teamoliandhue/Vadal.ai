"use client";
/* Campaign builder — opens in the shared Drawer, blank or seeded from a
   template, the AI suggestion or "Run again" (Campaigns v2, spec 046).

   Every step has a day and a channel, so the plan is a schedule rather than a
   to-do list. Before launch the builder checks the new plan against what's
   already going out and says, in plain words, if any team would get more than
   the weekly limit. Starting today launches it; a later start schedules it. */
import * as React from "react";
import { AlertTriangle, Plus, Sparkles, X } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { FATIGUE_LIMIT_PER_WEEK } from "@/lib/ai/engines/timing";
import {
  addDays, audiences, channels, collisions, fmtDate, objectives, starterSteps, DRAFT_MESSAGE, type Campaign,
} from "@/lib/campaigns";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { useScope } from "../useViewAs";
import { DeliveryPreview } from "./DeliveryPreview";

export type CampaignSeed =
  | { name: string; objective: string; audience?: string; duration?: string; steps?: string[]; channels?: string[] }
  | null;

type DraftStep = { id: string; label: string; day: number; channel: string };
const DURATIONS = ["1 week", "2 weeks", "30 days", "1 month", "Quarter"] as const;
const DAYS: Record<string, number> = { "1 week": 7, "2 weeks": 14, "30 days": 30, "1 month": 30, Quarter: 90 };
const TODAY = new Date().toISOString().slice(0, 10);
const nextMonday = () => { const d = new Date(); const add = ((8 - d.getDay()) % 7) || 7; return addDays(TODAY, add); };
let sid = 0;
let cid = 0;

/* Spread steps across the campaign: first on day 1, last near the end. */
const spread = (labels: string[], span: number, chans: string[]): DraftStep[] =>
  labels.map((label, i) => ({
    id: `s${sid++}`, label,
    day: labels.length === 1 ? 1 : 1 + Math.round((i * (span - 2)) / (labels.length - 1)),
    channel: chans[i % Math.max(1, chans.length)] ?? "feed",
  }));

export function CampaignBuilder({ seed, existing, onClose, onLaunch }: { seed: CampaignSeed; existing: Campaign[]; onClose: () => void; onLaunch: (c: Campaign) => void }) {
  const [name, setName] = React.useState("");
  const [objective, setObjective] = React.useState(objectives[0].key);
  // Brief §9: managers author team-only. The audience list is narrowed rather
  // than the whole builder withheld — a supervisor running a campaign on their
  // own line is exactly the use case.
  const { scope: dataScope, team: myTeam } = useScope("Campaigns");
  const teamOnly = dataScope === "own-team" && !!myTeam;
  const options = React.useMemo<readonly string[]>(
    () => (teamOnly ? audiences.filter((a) => a === myTeam || a.includes(myTeam!)) : audiences),
    [teamOnly, myTeam],
  );
  const [audience, setAudience] = React.useState<string>(teamOnly ? myTeam! : audiences[0]);
  const [duration, setDuration] = React.useState<string>(DURATIONS[1]);
  const [start, setStart] = React.useState<string>(nextMonday());
  const [chans, setChans] = React.useState<string[]>(["feed"]);
  const [steps, setSteps] = React.useState<DraftStep[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (!seed) return;
    setName(seed.name);
    setObjective(seed.objective);
    const wanted = seed.audience ?? audiences[0];
    setAudience(teamOnly ? (options.includes(wanted) ? wanted : myTeam!) : wanted);
    const dur = DURATIONS.find((d) => d === seed.duration) ?? DURATIONS[1];
    setDuration(dur);
    setStart(nextMonday());
    const ch = seed.channels?.length ? seed.channels : ["feed"];
    setChans(ch);
    const s = seed.steps ?? starterSteps[seed.objective] ?? [];
    setSteps(s.length ? spread(s, DAYS[dur], ch) : spread([""], DAYS[dur], ch));
    setMessage(DRAFT_MESSAGE[seed.objective] ?? DRAFT_MESSAGE.engagement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const toggleChan = (k: string) => setChans((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  function draftPlan() {
    setThinking(true);
    window.setTimeout(() => {
      setSteps(spread(starterSteps[objective] ?? starterSteps.engagement, DAYS[duration], chans.length ? chans : ["feed"]));
      setThinking(false);
      toast("Nudge drafted a plan — every step has a day and a channel");
    }, 650);
  }

  const real = steps.filter((s) => s.label.trim());
  const valid = name.trim().length > 0 && chans.length > 0 && real.length > 0 && Boolean(start);
  const obj = objectives.find((o) => o.key === objective)!;
  const live = start <= TODAY;
  const end = addDays(start, DAYS[duration] - 1);

  const draft: Campaign = React.useMemo(() => ({
    id: "draft", name: name.trim() || "This campaign", objective, audience, status: live ? "live" : "scheduled",
    reach: 0, participation: 0, lift: 0, window: "", channels: chans, aiReadout: "", owner: "You",
    steps: real.map((s) => { const date = addDays(start, s.day - 1); return { label: s.label.trim(), date, when: fmtDate(date), done: false, channel: s.channel }; }),
  }), [name, objective, audience, live, chans, real, start]);

  const clash = React.useMemo(
    () => collisions([...existing, draft], FATIGUE_LIMIT_PER_WEEK).find((c) => c.sends.some((s) => s.campaign.id === "draft")),
    [existing, draft],
  );

  function launch() {
    if (!valid) return;
    const c: Campaign = {
      ...draft, id: `c-${start}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cid++}`,
      window: live ? `${fmtDate(start).replace(/^\w+ /, "")} – ${fmtDate(end).replace(/^\w+ /, "")}` : `Starts ${fmtDate(start).replace(/^\w+ /, "")}`,
      aiReadout: live ? "Just launched — results appear here as the campaign runs." : "Scheduled — the first send goes out on the start date.",
    };
    onLaunch(c);
    toast(live ? `“${c.name}” is live for ${audience} 🚀` : `“${c.name}” is scheduled for ${fmtDate(start)}`);
    onClose();
  }

  const field = "mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-card px-3 text-[16px] outline-none transition focus:border-[var(--purple)] lg:text-[14px]";

  return (
    <Drawer open={!!seed} title="New campaign" onClose={onClose}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">New campaign</p>
      <h2 className="mt-1.5 pr-10 text-[20px] font-bold tracking-tight">Plan what goes out, and when</h2>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-ink">Name</span>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Burnout reset — Engineering" className={field} />
      </label>

      <div className="mt-5">
        <span className="text-[13px] font-semibold text-ink">Objective</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {objectives.map((o) => {
            const on = o.key === objective;
            return (
              <button key={o.key} onClick={() => setObjective(o.key)} aria-pressed={on}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "text-ink" : "border-line text-muted hover:text-ink"}`}
                style={on ? { borderColor: o.color, background: `color-mix(in srgb, ${o.color} 14%, transparent)` } : undefined}>
                <span aria-hidden>{o.emoji}</span> {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-3">
          <span className="text-[13px] font-semibold text-ink">Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={field}>
            {(options.length ? options : [myTeam!]).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {teamOnly && <p className="mt-1.5 text-[12px] text-faint">You can run campaigns for {myTeam}. Company-wide sends are an HR admin action.</p>}
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-ink">Starts</span>
          <input type="date" value={start} min={TODAY} onChange={(e) => setStart(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-[13px] font-semibold text-ink">Runs for</span>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className={field}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <p className="self-end pb-3 text-[13px] text-muted">Ends {fmtDate(end)}</p>
      </div>

      <div className="mt-4">
        <span className="text-[13px] font-semibold text-ink">Channels</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {channels.map((c) => {
            const on = chans.includes(c.key);
            return (
              <button key={c.key} onClick={() => toggleChan(c.key)} aria-pressed={on}
                className={`min-h-[44px] rounded-full border px-3 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "border-[var(--purple)] bg-[color-mix(in_srgb,var(--purple)_14%,transparent)] text-ink" : "border-line text-muted hover:text-ink"}`}>
                {c.label}
              </button>
            );
          })}
        </div>
        {/Plant Ops|Night shift|Logistics/.test(audience) && !chans.includes("whatsapp") && !chans.includes("sms") && (
          <p className="mt-2 text-[12px] text-[var(--warning)]">Most of {audience}{" "}is on shared phones — add WhatsApp or SMS, or many won&rsquo;t see it.</p>
        )}
      </div>

      <label className="mt-5 block">
        <span className="flex items-center justify-between text-[13px] font-semibold text-ink">
          First message
          <button type="button" onClick={() => setMessage(DRAFT_MESSAGE[objective] ?? DRAFT_MESSAGE.engagement)} className="min-h-[44px] text-[12px] font-semibold text-[var(--ai-accent)] hover:opacity-80 lg:min-h-0">Draft for this objective</button>
        </span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-[16px] leading-relaxed outline-none transition focus:border-[var(--purple)] lg:text-[14px]" />
      </label>
      {message.trim() && <DeliveryPreview message={message} audience={audience} />}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[14px] font-bold">Plan <span className="font-normal text-faint">· {real.length} sends</span></span>
        <button onClick={draftPlan} disabled={thinking} className="flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80 disabled:opacity-60 lg:min-h-0">
          <Sparkles className={`h-3.5 w-3.5 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Draft a plan"}
        </button>
      </div>
      <ol className="mt-2 space-y-2">
        {steps.map((s, i) => (
          <li key={s.id} className="rounded-xl border border-line p-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold" style={{ background: `color-mix(in srgb, ${obj.color} 16%, transparent)`, color: obj.color }}>{i + 1}</span>
              <input value={s.label} onChange={(e) => setSteps((xs) => xs.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} placeholder={`Send ${i + 1}`} aria-label={`Send ${i + 1}`}
                className="min-h-[44px] min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-faint lg:min-h-[32px] lg:text-[14px]" />
              <button onClick={() => setSteps((xs) => xs.filter((x) => x.id !== s.id))} aria-label="Remove send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink lg:h-7 lg:w-7"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-8 text-[13px]">
              <label className="flex items-center gap-1.5 text-muted">Day
                <input type="number" min={1} max={DAYS[duration]} value={s.day} onChange={(e) => setSteps((xs) => xs.map((x) => (x.id === s.id ? { ...x, day: Math.max(1, Number(e.target.value) || 1) } : x)))}
                  className="min-h-[44px] w-16 rounded-lg border border-line bg-card px-2 text-[16px] tabular-nums outline-none focus:border-[var(--purple)] lg:min-h-[30px] lg:text-[13px]" />
              </label>
              <span className="text-faint">{fmtDate(addDays(start, s.day - 1))}</span>
              <select value={s.channel} onChange={(e) => setSteps((xs) => xs.map((x) => (x.id === s.id ? { ...x, channel: e.target.value } : x)))} aria-label={`Channel for send ${i + 1}`}
                className="min-h-[44px] rounded-lg border border-line bg-card px-2 text-[16px] outline-none focus:border-[var(--purple)] lg:min-h-[30px] lg:text-[13px]">
                {(chans.length ? chans : ["feed"]).map((k) => <option key={k} value={k}>{channels.find((c) => c.key === k)?.label ?? k}</option>)}
              </select>
            </div>
          </li>
        ))}
      </ol>
      <button onClick={() => setSteps((xs) => [...xs, { id: `s${sid++}`, label: "", day: Math.min(DAYS[duration], (xs.at(-1)?.day ?? 0) + 3), channel: chans[0] ?? "feed" }])} className="mt-2 flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
        <Plus className="h-3.5 w-3.5" /> Add a send
      </button>

      {clash && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3" style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--warning) 26%, transparent)" }}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
          <p className="text-[13px] leading-relaxed text-ink">
            With this plan, <span className="font-semibold">{clash.team}</span> would get {clash.count} messages the week of {fmtDate(clash.week).replace(/^\w+ /, "")} — the limit is {FATIGUE_LIMIT_PER_WEEK}. Start later, or spread the sends out.
          </p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 -mb-[calc(1.5rem+env(safe-area-inset-bottom))] mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line bg-card px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:-mx-7 md:-mb-7 md:px-7 md:pb-4">
        <span className="text-[12px] text-faint">{real.length} send{real.length === 1 ? "" : "s"} · {live ? "starts today" : `starts ${fmtDate(start)}`}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" disabled={!valid} leadingIcon={<SparkMark size={14} tone="solid" />} onClick={launch}>{live ? "Launch now" : "Schedule"}</Button>
        </div>
      </div>
    </Drawer>
  );
}
