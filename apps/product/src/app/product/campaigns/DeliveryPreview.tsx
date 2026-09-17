"use client";
/* Delivery preview (Broadcast · AI) — before anything is sent.

   How it reads: the same message for desk teams, simplified for the floor
   (engines/text.localise — reading grade shown before and after), and in Hindi
   (translation provider; seeded demo says so rather than faking it).

   When it lands: the timing engine plans the whole audience (planSegment) —
   the send windows it will use, who it holds back for quiet hours or fatigue,
   and the expected acknowledgement lift over "everyone, 09:00, in the app".
   A safety or critical message overrides fatigue and quiet hours; that switch
   is here so the choice is deliberate. */
import * as React from "react";
import { AlertTriangle, BellOff, Moon } from "lucide-react";
import { SparkMark, Switch } from "@vadal/design-system";
import { localise, readability } from "@/lib/ai/engines/text";
import { planSegment } from "@/lib/ai/engines/timing";
import { recipientsFor } from "@/lib/campaigns";

type View = "desk" | "frontline" | "hindi";
const CHANNEL: Record<string, string> = { app: "App", push: "Push", sms: "SMS", whatsapp: "WhatsApp", email: "Email", teams: "Teams" };
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function DeliveryPreview({ message, audience }: { message: string; audience: string }) {
  const [view, setView] = React.useState<View>("frontline");
  const [critical, setCritical] = React.useState(false);

  const desk = readability(message);
  const floor = localise(message, "English", "simple");
  const plan = React.useMemo(() => planSegment(recipientsFor(audience), undefined, critical ? "critical" : "normal"), [audience, critical]);
  const total = plan.windows.reduce((n, w) => n + w.count, 0) + plan.blocked.reduce((n, b) => n + b.count, 0);

  const seg = (on: boolean) => `min-h-[44px] rounded-full px-3 text-[12px] font-semibold transition lg:min-h-[30px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;

  return (
    <section className="mt-4 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-4">
      <div className="flex items-center gap-2">
        <SparkMark size={16} tone="gradient" state="idle" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ai-accent)]">Delivery preview</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink">How it reads</p>
        <div role="group" aria-label="Reader" className="flex rounded-full bg-soft p-0.5">
          <button className={seg(view === "desk")} aria-pressed={view === "desk"} onClick={() => setView("desk")}>Desk</button>
          <button className={seg(view === "frontline")} aria-pressed={view === "frontline"} onClick={() => setView("frontline")}>Frontline</button>
          <button className={seg(view === "hindi")} aria-pressed={view === "hindi"} onClick={() => setView("hindi")}>हिन्दी</button>
        </div>
      </div>
      <div className="mt-2 rounded-xl bg-card p-3.5 ring-1 ring-[var(--ai-border)]">
        {view === "hindi" ? (
          <p className="text-[13px] leading-relaxed text-muted">A new message is translated when the translation provider is connected. Seeded posts are translated in this demo — see Social.</p>
        ) : (
          <p className="text-[14px] leading-relaxed text-ink">{view === "desk" ? message : floor.text}</p>
        )}
        {view !== "hindi" && (
          <p className="mt-2 text-[12px] text-faint">
            {view === "desk"
              ? `Reads at grade ${Math.round(desk.grade)}.`
              : floor.text === message
                ? `Already plain — grade ${Math.round(floor.grade)}.`
                : `Grade ${Math.round(desk.grade)} → ${Math.round(floor.grade)}. Plainer words and shorter sentences; the meaning is unchanged.`}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink">When it lands · {audience}</p>
        <Switch checked={critical} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCritical(e.target.checked)} label="Safety-critical" />
      </div>
      {critical && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-[var(--warning)]"><AlertTriangle className="mt-[1px] h-3.5 w-3.5 shrink-0" /> Critical sends ignore quiet hours and the weekly limit. Use it for safety, not for reminders.</p>
      )}
      <ul className="mt-2 flex flex-col gap-1.5">
        {plan.windows.map((w) => (
          <li key={`${w.hour}-${w.channel}`} className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 ring-1 ring-[var(--ai-border)]">
            <span className="w-12 text-[14px] font-semibold tabular-nums text-ink">{hh(w.hour)}</span>
            <span className="min-w-0 flex-1 text-[13px] text-muted">{CHANNEL[w.channel]}</span>
            <span className="relative h-2 w-20 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-r-full bg-[var(--viz-1)]" style={{ width: `${(w.count / Math.max(1, total)) * 100}%` }} /></span>
            <span className="w-16 text-right text-[12px] tabular-nums text-muted">{w.count} {w.count === 1 ? "person" : "people"}</span>
          </li>
        ))}
        {plan.blocked.map((b) => (
          <li key={b.reason} className="flex items-center gap-2 px-1 text-[12px] text-[var(--warning)]">
            {b.reason === "quiet-hours" ? <Moon className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
            {b.count} held back — {b.reason === "quiet-hours" ? "quiet hours" : b.reason === "fatigue" ? "already had 3 sends this week" : "no channel on file"}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] leading-snug text-muted">{plan.summary}</p>
    </section>
  );
}
