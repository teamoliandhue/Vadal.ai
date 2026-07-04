"use client";
/* Campaign builder — opens in the shared Drawer, blank or seeded from a template
   or the AI suggestion. Set an objective, audience, channel mix and duration,
   edit the step plan (or let Vadal draft it), and launch. Emits a Campaign the
   hub prepends to the list (demo-only; persisted to localStorage). */
import * as React from "react";
import { Bell, ClipboardList, Mail, Newspaper, Plus, Sparkles, X, type LucideIcon } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { objectives, channels, audiences, starterSteps, type Campaign, type Step } from "@/lib/campaigns";

export type CampaignSeed =
  | { name: string; objective: string; audience?: string; duration?: string; steps?: string[] }
  | null;

const CH_ICON: Record<string, LucideIcon> = { feed: Newspaper, email: Mail, push: Bell, survey: ClipboardList };
const DURATIONS = ["1 week", "2 weeks", "30 days", "1 month", "Quarter"] as const;
let cid = 100;
let sid = 0;
const newStep = (label = ""): Step & { id: string } => ({ id: `s${sid++}`, label, when: "", done: false });

export function CampaignBuilder({ seed, onClose, onLaunch }: { seed: CampaignSeed; onClose: () => void; onLaunch: (c: Campaign) => void }) {
  const [name, setName] = React.useState("");
  const [objective, setObjective] = React.useState(objectives[0].key);
  const [audience, setAudience] = React.useState<string>(audiences[0]);
  const [duration, setDuration] = React.useState<string>(DURATIONS[1]);
  const [chans, setChans] = React.useState<string[]>(["feed"]);
  const [steps, setSteps] = React.useState<(Step & { id: string })[]>([]);
  const [thinking, setThinking] = React.useState(false);

  React.useEffect(() => {
    if (!seed) return;
    setName(seed.name);
    setObjective(seed.objective);
    setAudience(seed.audience ?? audiences[0]);
    setDuration(seed.duration ?? DURATIONS[1]);
    setChans(["feed"]);
    const s = seed.steps ?? starterSteps[seed.objective] ?? [];
    setSteps(s.length ? s.map((l) => newStep(l)) : [newStep()]);
  }, [seed]);

  const toggleChan = (k: string) => setChans((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  function draftPlan() {
    setThinking(true);
    window.setTimeout(() => {
      const plan = starterSteps[objective] ?? starterSteps.engagement;
      setSteps(plan.map((l) => newStep(l)));
      setThinking(false);
      toast("Vadal drafted a step plan ✨");
    }, 650);
  }

  const valid = name.trim().length > 0 && chans.length > 0 && steps.some((s) => s.label.trim());
  const obj = objectives.find((o) => o.key === objective)!;

  function launch() {
    if (!valid) return;
    const c: Campaign = {
      id: `c${cid++}`,
      name: name.trim(),
      objective,
      audience,
      status: "live",
      reach: 0,
      participation: 0,
      lift: 0,
      window: "Just launched",
      channels: chans,
      steps: steps.filter((s) => s.label.trim()).map((s) => ({ label: s.label, when: s.when || "TBD", done: false })),
      aiReadout: "Just launched — results will appear here as the campaign runs.",
    };
    onLaunch(c);
    toast(`“${c.name}” is live — sent to ${audience} 🚀`);
    onClose();
  }

  return (
    <Drawer open={!!seed} title="New campaign" onClose={onClose}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">New campaign</p>
      <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">Design an intervention</h2>

      <label className="mt-5 block">
        <span className="text-[12px] font-semibold text-faint">Campaign name</span>
        <input
          autoFocus value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Burnout reset — Engineering"
          className="mt-1.5 w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14px] outline-none transition focus:border-[var(--purple)]"
        />
      </label>

      {/* objective */}
      <div className="mt-5">
        <span className="text-[12px] font-semibold text-faint">Objective</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {objectives.map((o) => {
            const on = o.key === objective;
            return (
              <button
                key={o.key} onClick={() => setObjective(o.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${on ? "text-ink" : "border-line text-muted hover:text-ink"}`}
                style={on ? { borderColor: o.color, background: `color-mix(in srgb, ${o.color} 14%, transparent)` } : undefined}
              >
                <span aria-hidden>{o.emoji}</span> {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* audience + duration */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[12px] font-semibold text-faint">Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[14px] outline-none focus:border-[var(--purple)]">
            {audiences.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-faint">Duration</span>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[14px] outline-none focus:border-[var(--purple)]">
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      {/* channels */}
      <div className="mt-4">
        <span className="text-[12px] font-semibold text-faint">Channels</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {channels.map((c) => {
            const Icon = CH_ICON[c.key];
            const on = chans.includes(c.key);
            return (
              <button
                key={c.key} onClick={() => toggleChan(c.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${on ? "border-[var(--purple)] bg-[color-mix(in_srgb,var(--purple)_14%,transparent)] text-ink" : "border-line text-muted hover:text-ink"}`}
              >
                <Icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* steps */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-[14px] font-bold">Plan <span className="font-normal text-faint">· {steps.length} steps</span></span>
        <button onClick={draftPlan} disabled={thinking} className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80 disabled:opacity-60">
          <Sparkles className={`h-3.5 w-3.5 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Draft a plan"}
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 rounded-xl border border-line p-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold" style={{ background: `color-mix(in srgb, ${obj.color} 16%, transparent)`, color: obj.color }}>{i + 1}</span>
            <input
              value={s.label}
              onChange={(e) => setSteps((xs) => xs.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))}
              placeholder={`Step ${i + 1}`}
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
            />
            <button onClick={() => setSteps((xs) => xs.filter((x) => x.id !== s.id))} aria-label="Remove step" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={() => setSteps((xs) => [...xs, newStep()])} className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] hover:underline">
        <Plus className="h-3.5 w-3.5" /> Add step
      </button>

      <div className="sticky bottom-0 -mx-7 -mb-7 mt-6 flex items-center justify-between gap-2 border-t border-line bg-card px-7 py-4">
        <span className="text-[12px] text-faint">{steps.filter((s) => s.label.trim()).length} step{steps.filter((s) => s.label.trim()).length === 1 ? "" : "s"} · {chans.length} channel{chans.length === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2">
          <Button variant="tertiary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" disabled={!valid} leadingIcon={<SparkMark size={14} tone="solid" />} onClick={launch}>Launch campaign</Button>
        </div>
      </div>
    </Drawer>
  );
}
