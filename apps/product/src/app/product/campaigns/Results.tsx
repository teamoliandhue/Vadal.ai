"use client";
/* Results — what worked, measured honestly (Campaigns v3, spec 047).

   · Lift is split into the campaign's own share and what moved anyway (the
     comparison group), stacked on one bar per campaign. The headline number
     is the campaign's own.
   · Which channel got people to take part, across every campaign.
   · What the finished ones taught, with a way to run them again, improved.
   Every chart has a legend where it has two series, and a table view. */
import * as React from "react";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { BarList, ViewToggle } from "@/components/viz";
import type { Campaign } from "@/lib/campaigns";
import { ObjTile, ask, chLabel, type CampaignsState } from "./parts";

const OWN = "var(--viz-1)";
const ANYWAY = "color-mix(in srgb, var(--muted) 38%, transparent)";

export function Results({ s, onOpen, onRerun }: { s: CampaignsState; onOpen: (id: string) => void; onRerun: (c: Campaign) => void }) {
  const [liftTable, setLiftTable] = React.useState(false);
  const [chTable, setChTable] = React.useState(false);
  const [hover, setHover] = React.useState<string | null>(null);

  const compared = s.visible.filter((c) => c.lift > 0 && c.comparison)
    .map((c) => ({ c, own: Math.round((c.lift - c.comparison!.lift) * 10) / 10, anyway: c.comparison!.lift }))
    .sort((a, b) => b.own - a.own);
  const max = Math.max(1, ...compared.map((x) => x.own + x.anyway));

  const byChannel = Object.entries(
    s.visible.flatMap((c) => c.byChannel ?? []).reduce<Record<string, number[]>>((m, r) => ({ ...m, [r.channel]: [...(m[r.channel] ?? []), r.participation] }), {}),
  ).map(([channel, xs]) => ({ label: chLabel(channel), value: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), note: `${xs.length} campaign${xs.length === 1 ? "" : "s"}` }))
    .sort((a, b) => b.value - a.value);

  const learned = s.visible.filter((c) => c.status === "completed" && c.lessons?.length);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[24px] border border-line bg-card p-5 sm:p-7" aria-labelledby="lift-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[620px]">
            <h2 id="lift-h" className="text-[18px] font-bold tracking-tight">How much each campaign really moved</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">Engagement points during the campaign, split into its own effect and what moved anyway for a comparison group. Only the first part is the campaign&rsquo;s.</p>
          </div>
          <ViewToggle table={liftTable} onChange={setLiftTable} label="Lift" />
        </div>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Legend">
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-3 w-3 rounded-[3px]" style={{ background: OWN }} /> The campaign&rsquo;s own</li>
          <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-3 w-3 rounded-[3px]" style={{ background: ANYWAY }} /> Would have moved anyway</li>
        </ul>

        {liftTable ? (
          <table className="mt-4 w-full text-[13px]">
            <caption className="sr-only">Engagement lift by campaign, split into the campaign’s own effect and the comparison group</caption>
            <thead><tr className="text-left text-faint"><th className="pb-2 font-medium">Campaign</th><th className="pb-2 text-right font-medium">Its own</th><th className="pb-2 text-right font-medium">Anyway</th><th className="pb-2 text-right font-medium">Total</th><th className="pb-2 pl-3 font-medium">Compared with</th></tr></thead>
            <tbody>
              {compared.map(({ c, own, anyway }) => (
                <tr key={c.id} className="border-t border-line"><td className="py-2 text-ink">{c.name}</td><td className="py-2 text-right font-semibold tabular-nums">+{own}</td><td className="py-2 text-right tabular-nums">+{anyway}</td><td className="py-2 text-right tabular-nums">+{c.lift}</td><td className="py-2 pl-3 text-muted">{c.comparison!.group}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {compared.map(({ c, own, anyway }) => (
              <li key={c.id}>
                <button onClick={() => onOpen(c.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 text-left">
                  <span className="truncate text-[14px] font-semibold text-ink">{c.name}</span>
                  <span className="text-[16px] font-bold tabular-nums text-ink">+{own} <span className="text-[12px] font-normal text-faint">of +{c.lift}</span></span>
                </button>
                <div className="relative mt-1.5 flex h-4 gap-[2px]" onMouseLeave={() => setHover(null)}>
                  <span
                    className="h-full rounded-l-[4px]" style={{ width: `${(own / max) * 100}%`, background: OWN, opacity: hover && hover !== `${c.id}-own` ? 0.5 : 1 }}
                    onMouseEnter={() => setHover(`${c.id}-own`)} tabIndex={0} onFocus={() => setHover(`${c.id}-own`)} onBlur={() => setHover(null)}
                    aria-label={`${c.name}: the campaign's own effect, +${own} points`}
                  />
                  <span
                    className="h-full rounded-r-[4px]" style={{ width: `${(anyway / max) * 100}%`, background: ANYWAY, opacity: hover && hover !== `${c.id}-any` ? 0.5 : 1 }}
                    onMouseEnter={() => setHover(`${c.id}-any`)} tabIndex={0} onFocus={() => setHover(`${c.id}-any`)} onBlur={() => setHover(null)}
                    aria-label={`${c.name}: would have moved anyway, +${anyway} points`}
                  />
                  {hover?.startsWith(c.id) && (
                    <span className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[12px] font-semibold text-[var(--card)] shadow-lg" style={{ left: hover.endsWith("own") ? 0 : `${(own / max) * 100}%` }}>
                      {hover.endsWith("own") ? `Its own · +${own}` : `Anyway · +${anyway} (${c.comparison!.group.toLowerCase()})`}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] text-faint">Compared with {c.comparison!.group.toLowerCase()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-[24px] border border-line bg-card p-5 sm:p-7" aria-labelledby="ch-h">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="ch-h" className="text-[18px] font-bold tracking-tight">Which channel reached people</h2>
              <p className="mt-1 text-[13px] text-muted">Average share who took part, by channel</p>
            </div>
            <ViewToggle table={chTable} onChange={setChTable} label="Which channel reached people" />
          </div>
          <div className="mt-5">
            {chTable ? (
              <table className="w-full text-[13px]">
                <caption className="sr-only">Average participation by channel</caption>
                <thead><tr className="text-left text-faint"><th className="pb-2 font-medium">Channel</th><th className="pb-2 text-right font-medium">Took part</th><th className="pb-2 text-right font-medium">Campaigns</th></tr></thead>
                <tbody>{byChannel.map((r) => <tr key={r.label} className="border-t border-line"><td className="py-2 text-ink">{r.label}</td><td className="py-2 text-right tabular-nums">{r.value}%</td><td className="py-2 text-right tabular-nums">{r.note.split(" ")[0]}</td></tr>)}</tbody>
              </table>
            ) : (
              <BarList rows={byChannel} max={100} unit="%" caption="Average participation by channel" />
            )}
          </div>
          <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-muted"><SparkMark size={14} tone="gradient" className="mt-[3px] shrink-0" /> {byChannel.length > 1 ? `${byChannel[0].label} and ${byChannel[1].label} reach the most people. ${byChannel.at(-1)!.label} reaches the fewest — ${byChannel.at(-1)!.label === "Push" ? "on shared phones it rarely gets to the person it's meant for." : "worth pairing with another channel."}` : "More channels appear here as campaigns report."}</p>
        </section>

        <section className="rounded-[24px] border border-line bg-card p-5 sm:p-7" aria-labelledby="learn-h">
          <h2 id="learn-h" className="text-[18px] font-bold tracking-tight">What the finished ones taught</h2>
          {learned.length === 0 ? (
            <p className="mt-3 text-[14px] text-faint">Lessons appear here when a campaign finishes.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {learned.map((c) => (
                <li key={c.id} className="rounded-2xl bg-soft/70 p-4">
                  <div className="flex items-center gap-2.5">
                    <ObjTile objective={c.objective} size={32} />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">{c.name}</span>
                  </div>
                  <ul className="mt-3 flex flex-col gap-2">
                    {c.lessons!.map((l) => <li key={l.note} className="flex gap-2 text-[14px] leading-snug text-ink"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />{l.note}</li>)}
                  </ul>
                  <Button variant="secondary" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" leadingIcon={<RotateCcw className="h-4 w-4" />} onClick={() => onRerun(c)}>Run again with these changes</Button>
                </li>
              ))}
            </ul>
          )}
          <Button variant="tertiary" size="sm" className="mt-4 min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Which campaigns drove real engagement lift after the comparison group, and what should I run next?")}>Ask Nudge what to run next</Button>
        </section>
      </div>
    </div>
  );
}
