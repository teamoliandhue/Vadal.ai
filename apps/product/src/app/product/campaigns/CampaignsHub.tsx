"use client";
/* CAMPAIGNS — interventions that move the needle (Engage · Campaigns v2, spec 046).

   What changed and why:
   · Managers see the campaigns that reach their team, and can change only
     their own. They used to see every team's, including the cold-zone push.
   · Sends have dates. The page checks what each team will receive in a week
     against the fatigue limit the timing engine already enforces per person,
     and offers the fix before anyone is over it.
   · Results are measured honestly: each campaign's lift sits next to the same
     measure for a comparison group, so "+5.2" is not all credited to the
     campaign when the weeks before were already rising.
   · A completed campaign can be run again with what it taught — the channel
     that reached people and the step that was missing. */
import * as React from "react";
import {
  AlertTriangle, Bell, CalendarClock, ClipboardList, Mail, MessageCircle, MessageSquare, Newspaper, Pause, Play,
  Plus, RotateCcw, Smartphone, Sparkles, Square, Users, type LucideIcon,
} from "lucide-react";
import { Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { BarList, ViewToggle } from "@/components/viz";
import { FATIGUE_LIMIT_PER_WEEK } from "@/lib/ai/engines/timing";
import {
  campaigns, channels as CHANNELS, collisions, covers, fmtDate, objectives, shiftCampaign, suggested, templates,
  type Campaign, type CampaignStatus,
} from "@/lib/campaigns";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { useScope } from "../useViewAs";
import { CampaignBuilder, type CampaignSeed } from "./CampaignBuilder";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const objOf = (key: string) => objectives.find((o) => o.key === key) ?? objectives[0];
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
export const CH_ICON: Record<string, LucideIcon> = { feed: Newspaper, email: Mail, push: Bell, survey: ClipboardList, whatsapp: MessageCircle, sms: Smartphone, teams: MessageSquare };
export const chLabel = (k: string) => CHANNELS.find((c) => c.key === k)?.label ?? k;
type Status = CampaignStatus;
const STATUS_TONE: Record<Status, BadgeTone> = { live: "success", scheduled: "info", completed: "neutral", draft: "warning", paused: "warning" };
const STATUS_LABEL: Record<Status, string> = { live: "Live", scheduled: "Scheduled", completed: "Completed", draft: "Draft", paused: "Paused" };
const FILTERS = ["All", "Live", "Scheduled", "Completed"] as const;
const TODAY = new Date().toISOString().slice(0, 10);

type Override = { status?: Status; shift?: number };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function ObjChip({ objective }: { objective: string }) {
  const o = objOf(objective);
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(o.color), color: o.color }}><span aria-hidden>{o.emoji}</span> {o.label}</span>;
}

export function CampaignsHub() {
  const [mine, setMine] = usePersistentState<Campaign[]>("vadal:campaigns-mine", []);
  const [over, setOver] = usePersistentState<Record<string, Override>>("vadal:campaign-state", {});
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [builder, setBuilder] = React.useState<CampaignSeed>(null);
  const [chTable, setChTable] = React.useState(false);
  const { scope, team, role, ready } = useScope("Campaigns");

  const teamScoped = scope === "own-team" && Boolean(team);
  /* Everything, with pauses and moved dates applied. */
  const all = React.useMemo(
    () => [...mine.map((c) => ({ ...c, owner: c.owner ?? "You" })), ...campaigns].map((c) => {
      const o = over[c.id];
      const moved = shiftCampaign(c, o?.shift ?? 0);
      return { ...moved, status: (o?.status ?? c.status) as Status };
    }),
    [mine, over],
  );
  /* A manager sees what reaches their team — and the manager sprint, which reaches them. */
  const visible = all.filter((c) => !teamScoped || covers(c.audience, team!) || (role === "manager" && c.audience === "People managers"));
  const canEdit = (c: Campaign) => !teamScoped || c.owner === "You";
  const rows = visible.filter((c) => filter === "All" || STATUS_LABEL[c.status as Status] === filter || (filter === "Live" && c.status === "paused"));
  const open = openId ? all.find((c) => c.id === openId) ?? null : null;

  const clash = scope === "all" ? collisions(all as Campaign[], FATIGUE_LIMIT_PER_WEEK)[0] : undefined;
  /* The fix: move the scheduled campaign contributing most to that week. */
  const movable = clash
    ? [...new Set(clash.sends.map((s) => s.campaign.id))]
      .map((id) => all.find((c) => c.id === id)!)
      .filter((c) => c.status === "scheduled")
      .sort((a, b) => clash.sends.filter((s) => s.campaign.id === b.id).length - clash.sends.filter((s) => s.campaign.id === a.id).length)[0]
    : undefined;

  const upcoming = visible
    .filter((c) => c.status === "live" || c.status === "scheduled")
    .flatMap((c) => c.steps.filter((s) => s.date && !s.done && s.date >= TODAY).map((s) => ({ c, s })))
    .sort((a, b) => a.s.date!.localeCompare(b.s.date!))
    .slice(0, 8);

  const live = visible.filter((c) => c.status === "live");
  const measured = visible.filter((c) => c.participation > 0);
  const avgPart = measured.length ? Math.round(measured.reduce((n, c) => n + c.participation, 0) / measured.length) : 0;
  const tiles: [string, string, string][] = [
    ["Live now", `${live.length}`, teamScoped ? `reaching ${team}` : "across the company"],
    ["Scheduled", `${visible.filter((c) => c.status === "scheduled").length}`, "not started yet"],
    ["Took part", measured.length ? `${avgPart}%` : "—", "average, running and finished"],
    ["Next send", upcoming[0] ? fmtDate(upcoming[0].s.date!).replace(/^\w+ /, "") : "—", upcoming[0] ? `${fmtDate(upcoming[0].s.date!).split(" ")[0]} · ${upcoming[0].c.name}` : "nothing planned"],
  ];

  /* Which channel reached people, across every campaign that reported it. */
  const byChannel = Object.entries(
    visible.flatMap((c) => c.byChannel ?? []).reduce<Record<string, number[]>>((m, r) => ({ ...m, [r.channel]: [...(m[r.channel] ?? []), r.participation] }), {}),
  ).map(([channel, xs]) => ({ label: chLabel(channel), value: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), note: `${xs.length} campaign${xs.length === 1 ? "" : "s"}` }))
    .sort((a, b) => b.value - a.value);
  const compared = visible.filter((c) => c.lift > 0 && c.comparison);

  const setStatus = (c: Campaign, status: Status, msg: string) => { setOver((o) => ({ ...o, [c.id]: { ...o[c.id], status } })); toast(msg); };
  const rerun = (c: Campaign) => {
    const lessons = c.lessons ?? [];
    setOpenId(null);
    setBuilder({
      name: `${c.name} — again`, objective: c.objective, audience: c.audience,
      steps: [...c.steps.map((s) => s.label), ...lessons.flatMap((l) => (l.addStep ? [l.addStep] : []))],
      channels: [...new Set([...c.channels, ...lessons.flatMap((l) => (l.addChannel ? [l.addChannel] : []))])],
    });
  };

  if (!ready) return <div className="py-10" aria-busy="true" />;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Engage</Eyebrow>
          <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Campaigns</h1>
          <p className="mt-2 max-w-xl text-[15px] text-muted">
            {teamScoped ? `Campaigns that reach ${team}, and the ones you run for your team.` : "Plan what goes out and when, check no team is flooded, and see what actually worked."}
          </p>
        </div>
        <Button variant="brand" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setBuilder({ name: "", objective: objectives[0].key })}>New campaign</Button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 truncate text-[24px] font-bold tracking-tight">{value}</p>
            <p className="mt-0.5 truncate text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      {/* too much for one team in one week — HR sees the whole picture */}
      {clash && (
        <section className="rounded-[26px] p-5 sm:p-6" style={{ background: soft("var(--warning)", 9), boxShadow: `inset 0 0 0 1px ${soft("var(--warning)", 26)}` }} aria-labelledby="clash-h">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
            <div className="min-w-0 flex-1">
              <h2 id="clash-h" className="text-[16px] font-bold text-ink">{clash.team} would get {clash.count} messages the week of {fmtDate(clash.week).replace(/^\w+ /, "")}</h2>
              <p className="mt-1 text-[14px] text-muted">The limit is {FATIGUE_LIMIT_PER_WEEK}{" "}a week. Past it, people start to ignore all of them. Safety sends don&rsquo;t count.</p>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
                {clash.sends.map(({ campaign, step }, i) => {
                  const Icon = CH_ICON[step.channel ?? "feed"] ?? Newspaper;
                  return (
                    <li key={i} className="flex flex-wrap items-center gap-x-2">
                      <span className="w-[88px] shrink-0 tabular-nums text-faint">{fmtDate(step.date!)}</span>
                      <Icon className="h-3.5 w-3.5 text-faint" />
                      <span className="text-ink">{step.label}</span>
                      <span className="text-faint">· {campaign.name}</span>
                    </li>
                  );
                })}
              </ul>
              {movable && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<CalendarClock className="h-4 w-4" />}
                    onClick={() => { setOver((o) => ({ ...o, [movable.id]: { ...o[movable.id], shift: (o[movable.id]?.shift ?? 0) + 7 } })); toast(`“${movable.name}” now starts a week later — every send still goes out`); }}>
                    Start “{movable.name}” a week later
                  </Button>
                  <span className="text-[13px] text-muted">Everything still lands — just not all at once.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AI suggested next campaign */}
      {!teamScoped && (
        <section className="rounded-[26px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-5 sm:p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--ai-accent)]" /><Eyebrow>Nudge suggests · next campaign</Eyebrow></div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-[18px] font-bold tracking-tight">{suggested.name}</h2>
            <ObjChip objective={suggested.objective} />
            <span className="rounded-full bg-card px-2 py-0.5 text-[12px] font-semibold text-muted">Predicted {suggested.predictedLift} pts</span>
          </div>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-muted">{suggested.reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => setBuilder({ name: suggested.name, objective: suggested.objective, audience: suggested.audience, duration: suggested.window, steps: suggested.steps })}>Build this campaign</Button>
            <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => ask(`Why are you suggesting the "${suggested.name}" campaign?`)}>Why this?</Button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* campaigns */}
        <section className="flex min-w-0 flex-col gap-4" aria-labelledby="list-h">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="list-h" className="text-[18px] font-bold tracking-tight">{teamScoped ? `Reaching ${team}` : "All campaigns"}</h2>
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]" role="group" aria-label="Status">
              {FILTERS.map((f) => {
                const n = f === "All" ? visible.length : visible.filter((c) => STATUS_LABEL[c.status as Status] === f || (f === "Live" && c.status === "paused")).length;
                return (
                  <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[36px] ${filter === f ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>
                    {f} <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${filter === f ? "bg-[var(--card)]/20" : "bg-soft"}`}>{n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-line px-6 py-14 text-center text-[14px] text-faint">No campaigns here.</div>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {rows.map((c) => {
                const o = objOf(c.objective);
                const done = c.steps.filter((s) => s.done).length;
                const next = c.steps.find((s) => !s.done);
                const NextIcon = CH_ICON[next?.channel ?? "feed"] ?? Newspaper;
                return (
                  <li key={c.id}>
                    <button onClick={() => setOpenId(c.id)} className="card-lift flex h-full w-full flex-col rounded-[22px] border border-line bg-card p-5 text-left transition hover:border-[var(--purple)]">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[20px]" style={{ background: soft(o.color, 16) }} aria-hidden>{o.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold leading-snug text-ink">{c.name}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-[13px] text-faint"><Users className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{c.audience}</span></span>
                        </span>
                        <Badge tone={STATUS_TONE[c.status as Status]} variant="soft" size="sm">{STATUS_LABEL[c.status as Status]}</Badge>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[12px] text-faint"><span>{c.window}</span><span className="tabular-nums">{done} of {c.steps.length} sent</span></div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full" style={{ width: `${(done / Math.max(1, c.steps.length)) * 100}%`, background: o.color }} /></div>
                      </div>
                      {next && c.status !== "completed" && (
                        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
                          <NextIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                          <span className="truncate">Next: <span className="text-ink">{next.label}</span>{next.date ? ` · ${fmtDate(next.date)}` : ""}</span>
                        </p>
                      )}
                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-[13px]">
                        {c.participation > 0 ? <span className="text-muted"><span className="font-semibold tabular-nums text-ink">{c.participation}%</span> took part</span> : <span className="text-faint">No results yet</span>}
                        {c.lift > 0 && <span className="font-semibold tabular-nums" style={{ color: o.color }}>+{c.lift} pts</span>}
                        {c.owner && c.owner !== "You" && teamScoped && <span className="text-faint">Run by {c.owner}</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* coming up */}
        <aside className="flex flex-col gap-6">
          <section className="card-lift rounded-[26px] border border-line bg-card p-6" aria-labelledby="up-h">
            <Eyebrow>Coming up</Eyebrow>
            <h2 id="up-h" className="mt-1.5 text-[18px] font-bold tracking-tight">What goes out, and when</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-[14px] text-faint">Nothing scheduled.</p>
            ) : (
              <ol className="mt-4 flex flex-col">
                {upcoming.map(({ c, s }, i) => {
                  const Icon = CH_ICON[s.channel ?? "feed"] ?? Newspaper;
                  const newDay = i === 0 || upcoming[i - 1].s.date !== s.date;
                  return (
                    <li key={`${c.id}-${i}`} className={newDay && i > 0 ? "mt-3 border-t border-line pt-3" : "mt-1.5"}>
                      {newDay && <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">{fmtDate(s.date!)}</p>}
                      <button onClick={() => setOpenId(c.id)} className="mt-1 flex min-h-[44px] w-full items-start gap-2.5 rounded-xl px-1 py-1 text-left hover:bg-soft lg:min-h-0">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-soft text-muted"><Icon className="h-3.5 w-3.5" /></span>
                        <span className="min-w-0">
                          <span className="block text-[14px] text-ink">{s.label}{s.critical && <span className="ml-1.5 rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--danger)]">Safety</span>}</span>
                          <span className="block truncate text-[12px] text-faint">{c.name} · {chLabel(s.channel ?? "feed")} · {c.audience}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </aside>
      </div>

      {/* templates */}
      <section className="flex flex-col gap-3" aria-labelledby="tpl-h">
        <h2 id="tpl-h" className="text-[18px] font-bold tracking-tight">Start from a template</h2>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
          {templates.map((t) => {
            const o = objOf(t.objective);
            return (
              <div key={t.key} className="card-lift flex w-[260px] shrink-0 flex-col rounded-2xl border border-line bg-card p-4 md:w-auto">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold"><span aria-hidden>{o.emoji}</span>{t.name}</span>
                  <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[12px] font-medium text-faint">{t.duration}</span>
                </div>
                <p className="mt-1 flex-1 text-[14px] leading-relaxed text-muted">{t.desc}</p>
                <Button variant="secondary" size="sm" className="mt-3 min-h-[44px] self-start lg:min-h-0" onClick={() => setBuilder({ name: t.name, objective: t.objective, duration: t.duration })}>Use template</Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* what worked */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6" aria-labelledby="ch-h">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow>What worked</Eyebrow>
              <h2 id="ch-h" className="mt-1.5 text-[18px] font-bold tracking-tight">Which channel reached people</h2>
              <p className="mt-1 text-[13px] text-faint">Average share who took part, by channel</p>
            </div>
            <ViewToggle table={chTable} onChange={setChTable} label="Which channel reached people" />
          </div>
          <div className="mt-4">
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
        </section>

        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6" aria-labelledby="lift-h">
          <Eyebrow>Honest results</Eyebrow>
          <h2 id="lift-h" className="mt-1.5 text-[18px] font-bold tracking-tight">Lift, after the comparison group</h2>
          <p className="mt-1 text-[13px] text-faint">Engagement points the campaign moved, minus what moved anyway</p>
          <ul className="mt-4 flex flex-col gap-3">
            {compared.map((c) => {
              const net = Math.round((c.lift - c.comparison!.lift) * 10) / 10;
              return (
                <li key={c.id}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="truncate font-medium text-ink">{c.name}</span>
                    <span className="shrink-0 font-bold tabular-nums text-ink">+{net}</span>
                  </div>
                  <p className="text-[12px] text-faint">+{c.lift} in the campaign · +{c.comparison!.lift} for {c.comparison!.group.toLowerCase()}</p>
                </li>
              );
            })}
          </ul>
          <Button variant="secondary" size="sm" className="mt-4 min-h-[44px] self-start lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Which campaigns drove real engagement lift after the comparison group, and what should I run next?")}>Ask Nudge</Button>
        </section>
      </div>

      {/* detail */}
      <Drawer open={!!open} title={open?.name} onClose={() => setOpenId(null)}>
        {open && (
          <div className="flex flex-col gap-5">
            <div className="pr-10">
              <Eyebrow>Campaign</Eyebrow>
              <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">{open.name}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[open.status as Status]} variant="soft" size="sm">{STATUS_LABEL[open.status as Status]}</Badge>
                <ObjChip objective={open.objective} />
                <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted">{open.window}</span>
              </div>
              <p className="mt-3 text-[14px] text-muted">To <span className="font-medium text-ink">{open.audience}</span>{open.owner ? <> · run by <span className="font-medium text-ink">{open.owner}</span></> : null}</p>
            </div>

            {open.participation > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[["Reached", `${open.reach}%`], ["Took part", `${open.participation}%`], ["Lift", `+${open.lift}`]].map(([l, v]) => (
                  <div key={l} className="rounded-2xl border border-line p-3"><div className="text-[12px] text-faint">{l}</div><div className="mt-1 text-[18px] font-bold tabular-nums">{v}</div></div>
                ))}
              </div>
            )}
            {open.comparison && (
              <p className="rounded-2xl bg-soft px-4 py-3 text-[13px] leading-relaxed text-muted">
                {open.comparison.group} moved <span className="font-semibold text-ink">+{open.comparison.lift}</span> without the campaign — so about <span className="font-semibold text-ink">+{Math.round((open.lift - open.comparison.lift) * 10) / 10}</span>{" "}is the campaign&rsquo;s own.
              </p>
            )}
            {open.byChannel && (
              <div>
                <p className="text-[13px] font-semibold text-ink">Took part, by channel</p>
                <div className="mt-2"><BarList rows={open.byChannel.map((r) => ({ label: chLabel(r.channel), value: r.participation }))} max={100} unit="%" caption="Participation by channel" /></div>
              </div>
            )}

            <div>
              <p className="text-[14px] font-bold">Plan</p>
              <ol className="mt-2 space-y-2.5">
                {open.steps.map((s, i) => {
                  const Icon = CH_ICON[s.channel ?? "feed"] ?? Newspaper;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${s.done ? "bg-[var(--success)] text-white" : "border border-line text-faint"}`}>{s.done ? "✓" : i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[14px] ${s.done ? "text-muted line-through decoration-[var(--line)]" : "font-medium text-ink"}`}>{s.label}{s.critical && <span className="ml-1.5 rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--danger)] no-underline">Safety</span>}</span>
                        <span className="flex items-center gap-1 text-[12px] text-faint"><Icon className="h-3 w-3" /> {chLabel(s.channel ?? "feed")} · {s.date ? fmtDate(s.date) : s.when}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex items-start gap-2 rounded-2xl bg-[var(--ai-surface)] p-3.5 text-[14px] leading-relaxed text-muted ring-1 ring-[var(--ai-border)]"><SparkMark size={14} className="mt-0.5 shrink-0" /><span>{open.aiReadout}</span></div>

            {open.lessons && open.lessons.length > 0 && (
              <div>
                <p className="text-[14px] font-bold">What to change next time</p>
                <ul className="mt-2 space-y-1.5 text-[14px] text-muted">{open.lessons.map((l) => <li key={l.note} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--purple)]" aria-hidden />{l.note}</li>)}</ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {canEdit(open) && open.status === "live" && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Pause className="h-4 w-4" />} onClick={() => setStatus(open, "paused", "Paused — nothing more goes out until you resume")}>Pause</Button>}
              {canEdit(open) && open.status === "paused" && <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Play className="h-4 w-4" />} onClick={() => setStatus(open, "live", "Resumed")}>Resume</Button>}
              {canEdit(open) && (open.status === "live" || open.status === "paused") && <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Square className="h-4 w-4" />} onClick={() => setStatus(open, "completed", "Ended — results stay here")}>End now</Button>}
              {canEdit(open) && open.status === "scheduled" && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<CalendarClock className="h-4 w-4" />} onClick={() => { setOver((o) => ({ ...o, [open.id]: { ...o[open.id], shift: (o[open.id]?.shift ?? 0) + 7 } })); toast("Moved a week later"); }}>Start a week later</Button>}
              {open.status === "completed" && <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<RotateCcw className="h-4 w-4" />} onClick={() => rerun(open)}>{open.lessons?.length ? "Run again with these changes" : "Run again"}</Button>}
              <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`How is the "${open.name}" campaign performing, and what should I do next?`)}>Ask Nudge</Button>
            </div>
            {!canEdit(open) && <p className="text-[12px] text-faint">Run by {open.owner}. You can see it because it reaches {team}; changes are theirs to make.</p>}
          </div>
        )}
      </Drawer>

      <CampaignBuilder seed={builder} existing={all as Campaign[]} onClose={() => setBuilder(null)} onLaunch={(c) => setMine((m) => [c, ...m])} />
    </div>
  );
}
