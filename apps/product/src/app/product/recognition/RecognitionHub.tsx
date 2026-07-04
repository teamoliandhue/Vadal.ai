"use client";
/* RECOGNITION — the "Engage" hub. A values-tagged kudos wall, giver/receiver
   leaderboards, a company-values breakdown, coverage + cold-zone insight (the
   meeting ask: "close cold zones"), and celebrations. Same Lumen shell + Aurora
   AI accents as Surveys/Pulse. Seeded data (lib/recognize). */
import * as React from "react";
import { HeartHandshake, Plus, Sparkles } from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import { toast } from "../Toaster";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  values, recognizeStats, wall, topGivers, topReceivers, coverage, coldInsight,
  celebrations, zoneOf, type Kudos, type Person,
} from "@/lib/recognize";
import { GiveRecognition } from "./GiveRecognition";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const colorOf = (name: string) => values.find((v) => v.name === name)?.color ?? "var(--purple)";
const emojiOf = (name: string) => values.find((v) => v.name === name)?.emoji ?? "🎯";
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const ZONE_TONE = { strong: "var(--success)", watch: "var(--warning)", cold: "var(--danger)" } as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
function ValueChip({ name }: { name: string }) {
  const c = colorOf(name);
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold" style={{ background: soft(c), color: c }}>
      <span aria-hidden>{emojiOf(name)}</span> {name}
    </span>
  );
}

export function RecognitionHub() {
  const [given, setGiven] = usePersistentState<Kudos[]>("vadal:recognition-given", []);
  const [reacted, setReacted] = usePersistentState<string[]>("vadal:recognition-reacted", []);
  const [composer, setComposer] = React.useState(false);
  const [seedTo, setSeedTo] = React.useState<Person | null>(null);

  const stream = [...given, ...wall];

  const openFor = (to?: Person) => { setSeedTo(to ?? null); setComposer(true); };
  const react = (id: string) => setReacted((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const kpis: [string, string, string?][] = [
    ["Recognitions · 30d", (recognizeStats.total30d + given.length).toLocaleString(), `+${recognizeStats.totalDelta}%`],
    ["Coverage", `${recognizeStats.coverage}%`, `+${recognizeStats.coverageDelta}`],
    ["Peer vs manager", `${recognizeStats.peerPct}/${recognizeStats.managerPct}`],
    ["Top value", recognizeStats.topValue],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Engage</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Recognition</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Make appreciation flow — give kudos, celebrate the wins, and close the cold zones before they cost you people.</p>
          </div>
          <Button variant="brand" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => openFor()}>Give recognition</Button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 lg:grid-cols-4">
          {kpis.map(([label, val, delta]) => (
            <div key={label}>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</div>
              <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[22px] font-bold tracking-tight">{val}</span>{delta && <span className="text-[12px] font-bold" style={{ color: "var(--success)" }}>▲ {delta.replace("+", "")}</span>}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* wall */}
        <div className="flex flex-col gap-4 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div><Eyebrow>The wall</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Recent recognition</h2></div>
            <Button variant="secondary" size="sm" leadingIcon={<HeartHandshake className="h-4 w-4" />} onClick={() => openFor()}>Give kudos</Button>
          </div>
          {stream.map((k) => {
            const on = reacted.includes(k.id);
            const count = k.reactions + (on ? 1 : 0);
            return (
              <Card key={k.id} className="!p-5">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Avatar src={k.to.img} name={k.to.name} size="lg" />
                    <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-card text-[13px] shadow-sm ring-1 ring-line" aria-hidden>{emojiOf(k.value)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px]">
                      <span className="font-semibold">{k.from.name.split(" ")[0]}</span>
                      <span className="text-faint">recognised</span>
                      <span className="font-semibold">{k.to.name}</span>
                      {k.manager && <span className="rounded-full bg-soft px-1.5 py-0.5 text-[11px] font-semibold text-muted">Manager</span>}
                    </div>
                    <div className="mt-1.5"><ValueChip name={k.value} /></div>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{k.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-[12px] text-faint">
                      <button onClick={() => react(k.id)} className={`flex items-center gap-1.5 font-semibold transition hover:text-ink ${on ? "text-[var(--danger)]" : ""}`}>
                        <span aria-hidden>{on ? "❤️" : "🤍"}</span> {count}
                      </button>
                      <span>·</span>
                      <span>+{k.points} pts</span>
                      <span className="ml-auto">{k.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* right rail */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          {/* values breakdown */}
          <Card>
            <div className="flex items-center justify-between">
              <div><Eyebrow>What we celebrate</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Values this month</h2></div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {values.map((v) => (
                <div key={v.name}>
                  <div className="flex items-center justify-between text-[14px]"><span className="font-medium"><span aria-hidden className="mr-1">{v.emoji}</span>{v.name}</span><span className="text-[12px] font-semibold tabular-nums text-faint">{v.pct}%</span></div>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full" style={{ width: `${v.pct}%`, background: v.color }} /></span>
                </div>
              ))}
            </div>
          </Card>

          {/* leaderboard */}
          <Card>
            <Eyebrow>Leaderboard · 30 days</Eyebrow>
            <div className="mt-4 grid grid-cols-1 gap-5">
              <div>
                <h3 className="text-[14px] font-bold">Top recognisers</h3>
                <ul className="mt-2 space-y-2.5">
                  {topGivers.slice(0, 5).map((p, i) => (
                    <li key={p.name} className="flex items-center gap-3">
                      <span className="w-4 text-[13px] font-bold tabular-nums text-faint">{i + 1}</span>
                      <Avatar src={p.img} name={p.name} size="sm" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{p.name}</span><span className="block text-[12px] text-faint">{p.team}</span></span>
                      <span className="text-[14px] font-bold tabular-nums">{p.given}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-line pt-4">
                <h3 className="text-[14px] font-bold">Most recognised</h3>
                <ul className="mt-2 space-y-2.5">
                  {topReceivers.slice(0, 5).map((p, i) => (
                    <li key={p.name} className="flex items-center gap-3">
                      <span className="w-4 text-[13px] font-bold tabular-nums text-faint">{i + 1}</span>
                      <Avatar src={p.img} name={p.name} size="sm" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{p.name}</span><span className="block text-[12px] text-faint">{p.team} · {p.topValue}</span></span>
                      <span className="text-[14px] font-bold tabular-nums">{p.got}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* coverage & cold zones */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><Eyebrow>Coverage · by team</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Who's getting seen — and who isn't</h2></div>
          <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("Which teams have recognition cold zones, and how do I fix them?")}>Ask Vadal</Button>
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
              <Button variant="brand" size="sm" onClick={() => toast("Nudge sent to 3 managers — Night shift, Plant Ops, Logistics 📣")}>Nudge their managers</Button>
              <Button variant="tertiary" size="sm" onClick={() => ask("Draft a recognition prompt for Night-shift managers.")}>Draft a prompt</Button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-faint">
          {(["strong", "watch", "cold"] as const).map((z) => (
            <span key={z} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ZONE_TONE[z] }} />{z === "strong" ? "Strong" : z === "watch" ? "Watch" : "Cold zone"}</span>
          ))}
        </div>
      </Card>

      {/* celebrations */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Eyebrow>Moments</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Worth a note today</h2></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {celebrations.map((c) => (
            <div key={c.name} className="card-lift flex flex-col items-start rounded-2xl border border-line bg-card p-4">
              <div className="flex w-full items-center gap-3">
                <Avatar src={c.img} name={c.name} size="md" />
                <span aria-hidden className="text-[20px]">{c.emoji}</span>
              </div>
              <div className="mt-3 text-[14px] font-semibold">{c.name}</div>
              <div className="text-[12px] text-faint">{c.type} · {c.detail}</div>
              <Button variant="secondary" size="sm" className="mt-3 self-stretch" onClick={() => openFor({ name: c.name, team: c.team, img: c.img })}>Send a note</Button>
            </div>
          ))}
        </div>
      </Card>

      <GiveRecognition
        open={composer}
        seedTo={seedTo}
        onClose={() => setComposer(false)}
        onGive={(k) => setGiven((g) => [k, ...g])}
      />
    </div>
  );
}
