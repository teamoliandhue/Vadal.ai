"use client";
/* KUDOS — the recognition wall (Kudos v2, spec 045).

   Who sees what is the first design decision here:
   · everyone gets their own recognition — what they received and gave, the
     cards to sign, the wall with filters that find their own kudos;
   · a manager gets their team: who hasn't been recognised in 30 days, with a
     way to fix it today;
   · People admins get the org: coverage by team and the cold zones.
   The old page showed every employee the org's coverage and a sentence about
   flight risk on night shift. That was never theirs to read. */
import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import { reports } from "@/lib/manager";
import {
  values, recognizeStats, wall, topGivers, topReceivers, coverage, coldInsight, zoneOf, groupCards,
  type Person,
} from "@/lib/recognize";
import { toast } from "../Toaster";
import { usePoints } from "../usePointsMode";
import { useViewAs } from "../useViewAs";
import { GiveRecognition } from "./GiveRecognition";
import { GroupCards } from "./GroupCards";
import { KudosCard } from "./KudosCard";
import { KudosTabs } from "./KudosTabs";
import { Spotted } from "./Spotted";
import { recognises, useKudosState, type KudosView } from "./useKudosState";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const ZONE_TONE = { strong: "var(--success)", watch: "var(--warning)", cold: "var(--danger)" } as const;
type Filter = "all" | "forme" | "fromme" | "team";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 ${className}`}>{children}</section>;
}

export function RecognitionHub() {
  const points = usePoints();
  const [role, , meta] = useViewAs();
  const ks = useKudosState();
  const me = ks.me;
  const [composer, setComposer] = React.useState(false);
  const [seedTo, setSeedTo] = React.useState<Person | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [value, setValue] = React.useState<string | null>(null);

  const isAdmin = role === "admin" || role === "superadmin";
  const isManager = role === "manager";
  const openFor = (to?: Person) => { setSeedTo(to ?? null); setComposer(true); };

  const stream: KudosView[] = React.useMemo(() => [...ks.given, ...wall].map(ks.display), [ks.given, ks.display]);
  const forMe = stream.filter((k) => recognises(k, me.name));
  const fromMe = stream.filter((k) => k.from.name === me.name);
  const shown = stream
    .filter((k) => filter === "all" || (filter === "forme" ? recognises(k, me.name) : filter === "fromme" ? k.from.name === me.name : k.to.team === me.team || k.from.team === me.team))
    .filter((k) => !value || k.value === value);

  /* Personal numbers: the 30-day history where the seed has one, plus what happened here. */
  const received30 = (topReceivers.find((p) => p.name === me.name)?.got ?? 0) + ks.given.filter((k) => recognises(k, me.name)).length || forMe.length;
  const given30 = (topGivers.find((p) => p.name === me.name)?.given ?? 0) + ks.given.filter((k) => k.from.name === me.name).length;
  const valueCounts = forMe.reduce<Record<string, number>>((m, k) => ({ ...m, [k.value]: (m[k.value] ?? 0) + 1 }), {});
  const topValue = topReceivers.find((p) => p.name === me.name)?.topValue ?? Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const teamReports = [...reports].sort((a, b) => a.recognition30d - b.recognition30d);
  const unseen = teamReports.filter((r) => r.recognition30d === 0);

  const stats: { label: string; value: string; note: string }[] = isAdmin
    ? [
      { label: "Recognitions · 30 days", value: (recognizeStats.total30d + ks.given.length).toLocaleString("en-IN"), note: `▲ ${recognizeStats.totalDelta}% on the month before` },
      { label: "Coverage", value: `${recognizeStats.coverage}%`, note: "gave or received in 30 days" },
      { label: "Peer to manager", value: `${recognizeStats.peerPct} / ${recognizeStats.managerPct}`, note: "share of all kudos" },
      { label: "Most celebrated value", value: recognizeStats.topValue, note: "across the company" },
    ]
    : isManager
      ? [
        { label: `${me.team} coverage`, value: `${coverage.find((c) => c.team === me.team)?.pct ?? 0}%`, note: "gave or received in 30 days" },
        { label: "Not recognised yet", value: `${unseen.length}`, note: "of your reports, in 30 days" },
        { label: "You gave", value: `${given30}`, note: "in 30 days" },
        { label: "You received", value: `${received30}`, note: "in 30 days" },
      ]
      : [
        { label: "You received", value: `${received30}`, note: "in 30 days" },
        { label: "You gave", value: `${given30}`, note: "in 30 days" },
        { label: "Cards to sign", value: `${groupCards.filter((c) => c.for.name !== me.name && !ks.signed[c.id]).length}`, note: "birthdays, anniversaries, first weeks" },
        { label: "Your top value", value: topValue, note: "what people thank you for" },
      ];

  const filters: { id: Filter; label: string; n?: number }[] = [
    { id: "all", label: "Everyone" }, { id: "forme", label: "For me", n: forMe.length }, { id: "fromme", label: "From me", n: fromMe.length }, { id: "team", label: `My team` },
  ];

  if (!meta.ready) return <div className="py-10" aria-busy="true" />;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <KudosTabs active="kudos" />

      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>My space</Eyebrow>
          <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Kudos</h1>
          <p className="mt-2 max-w-xl text-[15px] text-muted">
            {isAdmin ? "Recognition across the company — who's being seen, and where it has gone quiet." : isManager ? "Recognition on your team, and anyone who hasn't been seen in a while." : "Thank the people who make work better, and see who thanked you."}
          </p>
        </div>
        <Button variant="brand" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => openFor()}>Give recognition</Button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={isAdmin ? "Company recognition" : isManager ? "Your team's recognition" : "Your recognition"}>
        {stats.map((s) => (
          <div key={s.label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 truncate text-[24px] font-bold tracking-tight">{s.value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{s.note}</p>
          </div>
        ))}
      </div>

      <Spotted onRecognise={(p) => openFor(p)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* the wall */}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <Eyebrow>The wall</Eyebrow>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Recent recognition</h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]" role="group" aria-label="Whose kudos">
              {filters.map((f) => {
                const on = filter === f.id;
                return (
                  <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={on} className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[36px] ${on ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>
                    {f.label}
                    {f.n ? <span className={`rounded-full px-1.5 text-[12px] tabular-nums ${on ? "bg-[var(--card)]/20" : "bg-soft"}`}>{f.n}</span> : null}
                  </button>
                );
              })}
            </div>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]" role="group" aria-label="Value">
              {[null, ...values.map((v) => v.name)].map((v) => {
                const on = value === v;
                const vm = values.find((x) => x.name === v);
                return (
                  <button key={v ?? "all"} onClick={() => setValue(v)} aria-pressed={on} className={`flex min-h-[44px] shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-semibold transition lg:min-h-[30px] ${on ? "text-ink" : "text-muted hover:text-ink"}`} style={on ? { background: `color-mix(in srgb, ${vm?.color ?? "var(--purple)"} 14%, transparent)` } : undefined}>
                    {vm && <span aria-hidden>{vm.emoji}</span>} {v ?? "All values"}
                  </button>
                );
              })}
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-14 text-center">
              <SparkMark size={28} tone="gradient" state="idle" />
              <p className="text-[15px] font-semibold text-ink">{filter === "fromme" ? "You haven't given kudos yet" : filter === "forme" ? "Nothing for you yet" : "No kudos match"}</p>
              <p className="max-w-[340px] text-[14px] text-faint">{filter === "fromme" ? "The quickest one takes a minute — who helped you this week?" : "Try another value, or Everyone."}</p>
              {filter === "fromme" && <Button variant="brand" size="sm" className="mt-2 min-h-[44px] lg:min-h-0" onClick={() => openFor()}>Give recognition</Button>}
            </div>
          ) : (
            shown.map((k) => (
              <KudosCard
                key={k.id} k={k} meName={me.name} points={points}
                onCelebrate={() => ks.celebrate(k.id)}
                onBoost={(t) => ks.boost(k.id, t)}
                onThanks={(t) => ks.sayThanks(k.id, t)}
              />
            ))
          )}
        </div>

        {/* rail */}
        <div className="flex flex-col gap-6">
          {isManager && (
            <Card>
              <Eyebrow>Your team · 30 days</Eyebrow>
              <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Who&rsquo;s been seen</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {teamReports.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center gap-3">
                    <Avatar src={r.img} name={r.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{r.name}</span>
                      <span className={`block text-[12px] ${r.recognition30d === 0 ? "font-semibold text-[var(--warning)]" : "text-faint"}`}>{r.recognition30d === 0 ? "Not recognised in 30 days" : `${r.recognition30d} kudos`}</span>
                    </span>
                    {r.recognition30d === 0 && (
                      <Button variant="secondary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => openFor({ name: r.name, team: me.team, img: r.img })}>Recognise</Button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <GroupCards meName={me.name} meImg={me.img} signed={ks.signed} onSign={ks.sign} />

          <Card>
            <Eyebrow>What we celebrate</Eyebrow>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Values this month</h2>
            <div className="mt-4 flex flex-col gap-3">
              {values.map((v) => (
                <button key={v.name} onClick={() => setValue(value === v.name ? null : v.name)} aria-pressed={value === v.name} className="min-h-[44px] text-left">
                  <span className="flex items-center justify-between text-[14px]"><span className="font-medium"><span aria-hidden className="mr-1">{v.emoji}</span>{v.name}</span><span className="text-[12px] font-semibold tabular-nums text-faint">{v.pct}%</span></span>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full" style={{ width: `${v.pct}%`, background: v.color }} /></span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <Eyebrow>30 days</Eyebrow>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Top recognisers</h2>
            <p className="mt-1 text-[13px] text-faint">The people thanking others most — the habit worth copying.</p>
            <ul className="mt-3 space-y-2.5">
              {topGivers.slice(0, 5).map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="w-4 text-[13px] font-bold tabular-nums text-faint">{i + 1}</span>
                  <Avatar src={p.img} name={p.name} size="sm" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{p.name === me.name ? "You" : p.name}</span><span className="block text-[12px] text-faint">{p.team}</span></span>
                  <span className="text-[14px] font-bold tabular-nums">{p.given}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* coverage & cold zones — People admins only */}
      {isAdmin && (
        <Card className="sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><Eyebrow>Coverage · by team</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Who&rsquo;s getting seen — and who isn&rsquo;t</h2></div>
            <Button className="min-h-[44px] lg:min-h-0" variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Which teams have recognition cold zones, and how do I fix them?")}>Ask Nudge</Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {coverage.map((c) => {
              const z = zoneOf(c.pct);
              const col = ZONE_TONE[z];
              return (
                <div key={c.team} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-[14px] font-medium">{c.team}</span>
                  <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-soft"><span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${c.pct}%`, background: col }} /></span>
                  <span className="w-9 shrink-0 text-right text-[13px] font-bold tabular-nums" style={{ color: col }}>{c.pct}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ai-accent)]" />
            <div className="min-w-0">
              <p className="text-[14px] leading-relaxed text-muted">{coldInsight}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button className="min-h-[44px] lg:min-h-0" variant="brand" size="sm" onClick={() => toast("Nudge sent to 3 managers — Night shift, Plant Ops, Logistics 📣")}>Nudge their managers</Button>
                <Button className="min-h-[44px] lg:min-h-0" variant="tertiary" size="sm" onClick={() => ask("Draft a recognition prompt for Night-shift managers.")}>Draft a prompt</Button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-faint">
            {(["strong", "watch", "cold"] as const).map((z) => (
              <span key={z} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ZONE_TONE[z] }} />{z === "strong" ? "Strong" : z === "watch" ? "Watch" : "Cold zone"}</span>
            ))}
          </div>
        </Card>
      )}

      <GiveRecognition open={composer} seedTo={seedTo} onClose={() => setComposer(false)} onGive={ks.give} />
    </div>
  );
}
