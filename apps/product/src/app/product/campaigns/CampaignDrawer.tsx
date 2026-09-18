"use client";
/* One campaign, in full (Campaigns v3, spec 047) — where it's up to, what it
   achieved on its own, the plan as a timeline, and the next thing to do. */
import * as React from "react";
import { CalendarClock, Check, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { BarList } from "@/components/viz";
import { fmtDate, type Campaign } from "@/lib/campaigns";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { CH_ICON, ObjTile, SendProgress, StatusPill, ask, chLabel, objOf, type CampaignsState } from "./parts";

export function CampaignDrawer({ c, s, onClose, onRerun }: { c: Campaign | null; s: CampaignsState; onClose: () => void; onRerun: (c: Campaign) => void }) {
  return (
    <Drawer open={!!c} title={c?.name} onClose={onClose}>
      {c && <Body c={c} s={s} onRerun={onRerun} />}
    </Drawer>
  );
}

function Body({ c, s, onRerun }: { c: Campaign; s: CampaignsState; onRerun: (c: Campaign) => void }) {
  const edit = s.canEdit(c);
  const own = c.comparison ? Math.round((c.lift - c.comparison.lift) * 10) / 10 : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-3 pr-10">
        <ObjTile objective={c.objective} size={48} />
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-tight tracking-tight">{c.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill status={c.status} />
            <span className="text-[13px] text-faint">{objOf(c.objective).label}</span>
          </div>
          <p className="mt-2 text-[13px] text-muted">To <span className="font-medium text-ink">{c.audience}</span>{c.owner ? <> · run by <span className="font-medium text-ink">{c.owner}</span></> : null}</p>
        </div>
      </header>

      <SendProgress c={c} />

      {c.participation > 0 && (
        <section aria-label="Results" className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[["Reached", `${c.reach}%`], ["Took part", `${c.participation}%`], ["Its own lift", own !== null ? `+${own}` : `+${c.lift}`]].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">{l}</div><div className="mt-1 text-[20px] font-bold tabular-nums">{v}</div></div>
            ))}
          </div>
          {c.comparison && (
            <p className="text-[13px] leading-relaxed text-muted">
              Engagement rose <span className="font-semibold text-ink">+{c.lift}</span>. {c.comparison.group} rose <span className="font-semibold text-ink">+{c.comparison.lift}</span> without it, so the campaign&rsquo;s own share is about <span className="font-semibold text-ink">+{own}</span>.
            </p>
          )}
          {c.byChannel && (
            <div className="rounded-2xl border border-line p-4">
              <p className="mb-3 text-[13px] font-semibold text-ink">Took part, by channel</p>
              <BarList rows={c.byChannel.map((r) => ({ label: chLabel(r.channel), value: r.participation }))} max={100} unit="%" caption="Participation by channel" />
            </div>
          )}
        </section>
      )}

      {/* the plan as a vertical timeline */}
      <section aria-labelledby="plan-h">
        <h3 id="plan-h" className="text-[14px] font-bold">The plan · {c.steps.length} sends</h3>
        <ol className="relative mt-3">
          {c.steps.map((x, i) => {
            const Icon = CH_ICON[x.channel ?? "feed"];
            const last = i === c.steps.length - 1;
            return (
              <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {!last && <span className="absolute left-[13px] top-7 bottom-0 w-[2px] rounded-full" style={{ background: x.done ? "var(--ink)" : "var(--line)", opacity: x.done ? 0.6 : 1 }} aria-hidden />}
                <span
                  className="relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full border-2"
                  style={{
                    background: x.done ? "var(--ink)" : "var(--card)",
                    borderColor: x.critical ? "var(--danger)" : x.done ? "var(--ink)" : "var(--line)",
                    color: x.done ? "var(--card)" : x.critical ? "var(--danger)" : "var(--muted)",
                  }}
                >
                  {x.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className={`block text-[14px] ${x.done ? "text-muted" : "font-medium text-ink"}`}>
                    {x.label}
                    {x.critical && <span className="ml-1.5 rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-1.5 py-0.5 align-middle text-[11px] font-semibold text-[var(--danger)]">Safety</span>}
                  </span>
                  <span className="text-[12px] text-faint">{x.date ? fmtDate(x.date) : x.when} · {chLabel(x.channel ?? "feed")}{x.done ? " · sent" : ""}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex items-start gap-2.5 rounded-2xl bg-[var(--ai-surface)] p-4 text-[14px] leading-relaxed text-muted ring-1 ring-[var(--ai-border)]"><SparkMark size={14} className="mt-1 shrink-0" /><span>{c.aiReadout}</span></div>

      {c.lessons && c.lessons.length > 0 && (
        <section>
          <h3 className="text-[14px] font-bold">What to change next time</h3>
          <ul className="mt-2 space-y-1.5 text-[14px] text-muted">{c.lessons.map((l) => <li key={l.note} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--purple)]" aria-hidden />{l.note}</li>)}</ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {edit && c.status === "live" && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Pause className="h-4 w-4" />} onClick={() => { s.setStatus(c.id, "paused"); toast("Paused — nothing more goes out until you resume"); }}>Pause</Button>}
        {edit && c.status === "paused" && <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Play className="h-4 w-4" />} onClick={() => { s.setStatus(c.id, "live"); toast("Resumed"); }}>Resume</Button>}
        {edit && (c.status === "live" || c.status === "paused") && <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Square className="h-4 w-4" />} onClick={() => { s.setStatus(c.id, "completed"); toast("Ended — results stay here"); }}>End now</Button>}
        {edit && c.status === "scheduled" && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<CalendarClock className="h-4 w-4" />} onClick={() => { s.shift(c.id, 7); toast("Moved a week later"); }}>Start a week later</Button>}
        {c.status === "completed" && <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<RotateCcw className="h-4 w-4" />} onClick={() => onRerun(c)}>{c.lessons?.length ? "Run again with these changes" : "Run again"}</Button>}
        <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`How is the "${c.name}" campaign performing, and what should I do next?`)}>Ask Nudge</Button>
      </div>
      {!edit && <p className="-mt-3 text-[12px] text-faint">Run by {c.owner}. You see it because it reaches {s.team}; changes are theirs to make.</p>}
    </div>
  );
}
