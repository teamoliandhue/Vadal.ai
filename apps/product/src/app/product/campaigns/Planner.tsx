"use client";
/* Planner — six weeks of campaigns on one timeline (Campaigns v3, spec 047).

   Two questions, one screen:
   · When does each campaign send? One lane per campaign: its span as a bar,
     each send as a marker on the day it goes out, today as a line.
   · Is any team getting too much? Underneath, a grid of messages per team per
     week. A cell over the weekly limit is flagged with an icon and a label, not
     colour alone, and opens the sends behind it with the fix. */
import * as React from "react";
import { AlertTriangle, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@vadal/design-system";
import { FATIGUE_LIMIT_PER_WEEK } from "@/lib/ai/engines/timing";
import { addDays, covers, daysBetween, fmtDate, loadGrid, spanOf, weekOf, type Campaign, type CampaignStatus } from "@/lib/campaigns";
import { toast } from "../Toaster";
import { CH_ICON, ObjTile, TODAY, chLabel, shortDate, soft, type CampaignsState } from "./parts";

const WEEKS = 6;
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export function Planner({ s, focus, onOpen }: { s: CampaignsState; focus?: { week: string; team: string }; onOpen: (id: string) => void }) {
  const focusWeek = focus?.week;
  const [from, setFrom] = React.useState(() => addDays(weekOf(focusWeek ?? TODAY), focusWeek ? -14 : -7));
  /* Arriving from "See the week" opens that team's week, already explained. */
  const [picked, setPicked] = React.useState<{ team: string; week: string } | null>(focus ?? null);
  const weeks = Array.from({ length: WEEKS }, (_, i) => addDays(from, i * 7));
  const to = addDays(from, WEEKS * 7);
  const span = WEEKS * 7;
  const pct = (iso: string) => (Math.min(span, Math.max(0, daysBetween(from, iso))) / span) * 100;

  const lanes = s.visible
    .map((c) => ({ c, sp: spanOf(c) }))
    .filter(({ sp }) => sp && sp.end >= from && sp.start < to)
    .sort((a, b) => a.sp!.start.localeCompare(b.sp!.start));
  const hidden = s.visible.length - lanes.length;
  const todayIn = TODAY >= from && TODAY < to;

  const grid = loadGrid(s.visible, weeks).filter((r) => !s.teamScoped || r.team === s.team || covers(r.team, s.team!));
  const sendsFor = (team: string, week: string) => s.visible
    .filter((c) => (c.status === "live" || c.status === "scheduled") && covers(c.audience, team))
    .flatMap((c) => c.steps.filter((x) => x.date && !x.done && !x.critical && weekOf(x.date) === week).map((x) => ({ c, x })))
    .sort((a, b) => a.x.date!.localeCompare(b.x.date!));

  /* On a narrow screen the timeline scrolls — open it on today, not on the first week. */
  const scroller = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const inner = el.firstElementChild as HTMLElement;
    const label = window.innerWidth < 640 ? 140 : 232;
    const x = label + ((inner.clientWidth - label) * (focusWeek ? pct(focusWeek) : pct(TODAY))) / 100;
    el.scrollLeft = Math.max(0, x - label - 24);
  }, [from, focusWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickedSends = picked ? sendsFor(picked.team, picked.week) : [];
  const movable = picked
    ? [...new Set(pickedSends.map((p) => p.c))].filter((c) => c.status === "scheduled" && s.canEdit(c))
      .sort((a, b) => pickedSends.filter((p) => p.c.id === b.id).length - pickedSends.filter((p) => p.c.id === a.id).length)[0]
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => setFrom((f) => addDays(f, -7))} aria-label="Earlier" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-muted hover:text-ink lg:h-9 lg:w-9"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setFrom((f) => addDays(f, 7))} aria-label="Later" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-muted hover:text-ink lg:h-9 lg:w-9"><ChevronRight className="h-4 w-4" /></button>
          <button onClick={() => setFrom(addDays(weekOf(TODAY), -7))} className="ml-1 min-h-[44px] rounded-full border border-line bg-card px-3.5 text-[13px] font-semibold text-ink lg:min-h-[36px]">Today</button>
          <span className="ml-3 text-[15px] font-semibold text-ink">{shortDate(from)} – {shortDate(addDays(to, -1))}</span>
        </div>
        <Legend />
      </div>

      {/* timeline */}
      <section className="overflow-hidden rounded-[24px] border border-line bg-card" aria-label="Campaign timeline">
        <div ref={scroller} className="overflow-x-auto">
          <div className="relative min-w-[820px] sm:min-w-[880px]">
            {/* header */}
            <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[232px_1fr] border-b border-line">
              <div className="flex items-end px-4 pb-2 pt-3 text-[12px] font-semibold uppercase tracking-wide text-faint">Campaign</div>
              <div className="relative grid" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
                {weeks.map((w) => (
                  <div key={w} className={`border-l border-line px-2 pb-2 pt-3 ${focusWeek === w ? "bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]" : ""}`}>
                    <p className="text-[12px] font-semibold text-ink">{shortDate(w)}</p>
                    <div className="mt-1 grid grid-cols-7 text-center text-[10px] text-faint">{DAY_LETTERS.map((d, i) => <span key={i}>{d}</span>)}</div>
                  </div>
                ))}
                {todayIn && (
                  <span className="absolute bottom-1 -translate-x-1/2 rounded-full bg-[var(--purple)] px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ left: `${pct(TODAY) + 100 / span / 2}%` }}>
                    {new Date(`${TODAY}T00:00:00`).getDate()}
                  </span>
                )}
              </div>
            </div>

            {/* lanes */}
            <ul>
              {lanes.map(({ c, sp }) => (
                <li key={c.id} className="grid grid-cols-[140px_1fr] sm:grid-cols-[232px_1fr] border-b border-line last:border-b-0">
                  <button onClick={() => onOpen(c.id)} className="sticky left-0 z-10 flex min-h-[64px] items-center gap-2.5 bg-card px-4 text-left hover:bg-soft">
                    <span className="max-sm:hidden"><ObjTile objective={c.objective} size={32} /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">{c.name}</span>
                      <span className="block truncate text-[12px] text-faint">{c.audience}</span>
                    </span>
                  </button>
                  <div className="relative">
                    {/* week lines */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }} aria-hidden>
                      {weeks.map((w) => <span key={w} className={`border-l border-line ${focusWeek === w ? "bg-[color-mix(in_srgb,var(--warning)_7%,transparent)]" : ""}`} />)}
                    </div>
                    <Bar c={c} left={pct(sp!.start)} right={pct(addDays(sp!.end, 1))} />
                    {todayIn && <span className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-[var(--purple)]" style={{ left: `${pct(TODAY) + 100 / span / 2}%` }} aria-hidden />}
                    {c.steps.filter((x) => x.date && x.date >= from && x.date < to).map((x, i) => {
                      const Icon = CH_ICON[x.channel ?? "feed"];
                      return (
                        <button
                          key={i}
                          onClick={() => onOpen(c.id)}
                          aria-label={`${c.name}: ${x.label}, ${fmtDate(x.date!)}, ${chLabel(x.channel ?? "feed")}${x.done ? ", sent" : ""}${x.critical ? ", safety" : ""}`}
                          title={`${fmtDate(x.date!)} · ${x.label} · ${chLabel(x.channel ?? "feed")}`}
                          className="absolute top-1/2 z-[1] grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 shadow-sm transition hover:z-[2] hover:scale-125 focus-visible:z-[2] focus-visible:scale-125"
                          style={{
                            left: `${pct(x.date!) + 100 / span / 2}%`,
                            background: x.done ? "var(--ink)" : "var(--card)",
                            borderColor: x.critical ? "var(--danger)" : x.done ? "var(--ink)" : "color-mix(in srgb, var(--ink) 45%, transparent)",
                            color: x.done ? "var(--card)" : x.critical ? "var(--danger)" : "var(--muted)",
                          }}
                        >
                          <Icon className="h-3 w-3" strokeWidth={2.2} />
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>

          </div>
        </div>
        <p className="border-t border-line px-4 py-2 text-[12px] text-faint sm:hidden">Swipe sideways to see all six weeks.</p>
        {hidden > 0 && <p className="border-t border-line px-4 py-2.5 text-[12px] text-faint">{hidden} campaign{hidden === 1 ? " is" : "s are"} outside these weeks — use the arrows to see {hidden === 1 ? "it" : "them"}.</p>}
      </section>

      {/* load */}
      <section className="rounded-[24px] border border-line bg-card p-5 sm:p-6" aria-labelledby="load-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="load-h" className="text-[18px] font-bold tracking-tight">Messages per team, per week</h2>
            <p className="mt-1 text-[13px] text-muted">The limit is {FATIGUE_LIMIT_PER_WEEK} a week. Safety sends don&rsquo;t count. Select a number to see what&rsquo;s behind it.</p>
          </div>
          <LoadLegend />
        </div>
        {grid.length === 0 ? (
          <p className="mt-4 text-[14px] text-faint">Nothing goes out to any team in these weeks.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1 text-[13px]">
              <caption className="sr-only">Messages each team would receive, by week</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[150px] pb-1 text-left text-[12px] font-semibold text-faint">Team</th>
                  {weeks.map((w) => <th key={w} scope="col" className="pb-1 text-center text-[12px] font-semibold text-faint">{shortDate(w)}</th>)}
                </tr>
              </thead>
              <tbody>
                {grid.map((r) => (
                  <tr key={r.team}>
                    <th scope="row" className="pr-2 text-left font-medium text-ink">{r.team}</th>
                    {r.counts.map((n, i) => {
                      const over = n > FATIGUE_LIMIT_PER_WEEK;
                      const on = picked?.team === r.team && picked.week === weeks[i];
                      const bg = over ? soft("var(--warning)", 22) : n === 0 ? "transparent" : soft("var(--purple)", 8 + n * 9);
                      return (
                        <td key={i} className="p-0">
                          {n === 0 ? (
                            <span className="grid h-11 place-items-center rounded-xl bg-soft/60 text-faint" aria-label="none">·</span>
                          ) : (
                            <button
                              onClick={() => setPicked(on ? null : { team: r.team, week: weeks[i] })}
                              aria-pressed={on}
                              aria-label={`${r.team}, week of ${shortDate(weeks[i])}: ${n} messages${over ? ", over the limit" : ""}`}
                              className={`flex h-11 w-full items-center justify-center gap-1 rounded-xl font-semibold tabular-nums text-ink transition ${on ? "ring-2 ring-[var(--ink)]" : "hover:ring-2 hover:ring-[var(--line)]"}`}
                              style={{ background: bg }}
                            >
                              {over && <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)]" />}
                              {n}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {picked && (
          <div className="mt-4 rounded-2xl border border-line bg-soft/60 p-4">
            <p className="text-[14px] font-semibold text-ink">
              {picked.team} · week of {shortDate(picked.week)} · {pickedSends.length} message{pickedSends.length === 1 ? "" : "s"}
              {pickedSends.length > FATIGUE_LIMIT_PER_WEEK && <span className="ml-2 text-[var(--warning)]">over the limit by {pickedSends.length - FATIGUE_LIMIT_PER_WEEK}</span>}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {pickedSends.map(({ c, x }, i) => {
                const Icon = CH_ICON[x.channel ?? "feed"];
                return (
                  <li key={i} className="flex flex-wrap items-center gap-x-2 text-[13px]">
                    <span className="w-[84px] shrink-0 tabular-nums text-faint">{fmtDate(x.date!)}</span>
                    <Icon className="h-3.5 w-3.5 text-faint" />
                    <span className="text-ink">{x.label}</span>
                    <span className="text-faint">· {c.name}</span>
                  </li>
                );
              })}
            </ul>
            {pickedSends.length > FATIGUE_LIMIT_PER_WEEK && movable && (
              <Button variant="brand" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" leadingIcon={<CalendarClock className="h-4 w-4" />}
                onClick={() => { s.shift(movable.id, 7); setPicked(null); toast(`“${movable.name}” now starts a week later — every send still goes out`); }}>
                Start “{movable.name}” a week later
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* A campaign's span. Live is filled, scheduled is outlined, paused is striped, finished is grey. */
function Bar({ c, left, right }: { c: Campaign; left: number; right: number }) {
  const st: Record<CampaignStatus, React.CSSProperties> = {
    live: { background: soft("var(--purple)", 14), borderColor: soft("var(--purple)", 40) },
    scheduled: { background: "transparent", borderColor: soft("var(--purple)", 45), borderStyle: "dashed" },
    paused: { background: `repeating-linear-gradient(135deg, ${soft("var(--warning)", 16)} 0 6px, transparent 6px 12px)`, borderColor: soft("var(--warning)", 45) },
    completed: { background: "var(--soft)", borderColor: "var(--line)" },
    draft: { background: "transparent", borderColor: "var(--line)", borderStyle: "dashed" },
  };
  return (
    <span
      className="absolute top-1/2 h-9 -translate-y-1/2 rounded-full border"
      style={{ left: `${left}%`, width: `${Math.max(1.5, right - left)}%`, ...st[c.status] }}
      aria-hidden
    />
  );
}

function Legend() {
  const item = "flex items-center gap-1.5 text-[12px] text-muted";
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Legend">
      <li className={item}><span className="h-3 w-3 rounded-full bg-ink" /> Sent</li>
      <li className={item}><span className="h-3 w-3 rounded-full border-2 border-ink/45 bg-card" /> Planned</li>
      <li className={item}><span className="h-3 w-3 rounded-full border-2 border-[var(--danger)] bg-card" /> Safety</li>
      <li className={item}><span className="h-3 w-5 rounded-full border border-dashed" style={{ borderColor: soft("var(--purple)", 45) }} /> Scheduled</li>
      <li className={item}><span className="h-3 w-[2px] rounded-full bg-[var(--purple)]" /> Today</li>
    </ul>
  );
}

function LoadLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted" aria-label="Legend">
      {[1, 2, 3].map((n) => <li key={n} className="grid h-6 w-7 place-items-center rounded-lg font-semibold tabular-nums text-ink" style={{ background: soft("var(--purple)", 8 + n * 9) }}>{n}</li>)}
      <li className="flex h-6 items-center gap-1 rounded-lg px-2 font-semibold text-ink" style={{ background: soft("var(--warning)", 22) }}><AlertTriangle className="h-3 w-3 text-[var(--warning)]" /> Over the limit</li>
    </ul>
  );
}
