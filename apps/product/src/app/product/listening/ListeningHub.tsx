"use client";
/* ALWAYS-ON LISTENING — admin hub (Notion "Listen" spec). Catch the signal
   between survey cycles: configure listening channels, watch tracked topics +
   risk, and a live conversational signal stream that routes into Pulse's action
   queue. Same Lumen shell + Aurora AI accents. Seeded data (lib/listen). */
import * as React from "react";
import { ClipboardList, LogOut, MessageSquare, Newspaper, NotebookPen, Radio, TriangleAlert } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { toast } from "../Toaster";
import { listening } from "@/lib/listen";

const TONE = { good: "#2f9e6e", bad: "#dc4a44", warn: "#d68a1e", purple: "#6d5df0", muted: "#8a8f98" } as const;
const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const sentTone = (s: string) => (s === "positive" ? TONE.good : s === "negative" ? TONE.bad : TONE.muted);
const trendGlyph = (t: string) => (t === "up" ? "▲" : t === "down" ? "▼" : "→");
const SOURCE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Chat: MessageSquare, Feed: Newspaper, Survey: ClipboardList, "1:1 notes": NotebookPen, Exit: LogOut,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

export function ListeningHub() {
  const [channels, setChannels] = React.useState(listening.channels);
  function toggle(key: string) {
    setChannels((cs) => cs.map((c) => (c.key === key ? { ...c, on: !c.on } : c)));
    const c = channels.find((x) => x.key === key);
    toast(c?.on ? `Paused listening on ${c?.name}` : `Now listening on ${c?.name} ✓`);
  }
  const kpis: [string, number, string][] = [
    ["Signals today", listening.stats.signalsToday, TONE.purple],
    ["Topics rising", listening.stats.topicsRising, TONE.warn],
    ["Risks flagged", listening.stats.risksFlagged, TONE.bad],
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Listen</Eyebrow>
            <h1 className="mt-2 flex items-center gap-2.5 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Always-on listening <span className="ai-aura grid h-3 w-3 place-items-center"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TONE.good }} /></span></h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Catch the signal between surveys — continuous listening with topic & risk detection that routes into Pulse.</p>
          </div>
          <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask("What's emerging in always-on listening right now?")}>What's emerging</Button>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {kpis.map(([label, val, color]) => (
            <div key={label}><div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</div><div className="mt-1 text-[22px] font-bold tracking-tight" style={{ color }}>{val}</div></div>
          ))}
        </div>
      </header>

      {/* channels */}
      <div className="flex flex-col gap-3">
        <Eyebrow>Listening channels</Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((c) => (
            <div key={c.key} className="card-lift flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-muted"><Radio className="h-[18px] w-[18px]" strokeWidth={1.85} /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{c.name}</div>
                <div className="text-[12px] text-faint">{c.on ? `${c.signals.toLocaleString()} signals · 30d` : "Paused"}</div>
              </div>
              <button onClick={() => toggle(c.key)} role="switch" aria-checked={c.on} aria-label={`Toggle ${c.name}`} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${c.on ? "bg-[var(--purple)]" : "bg-soft ring-1 ring-line"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${c.on ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* tracked topics */}
        <Card className="xl:col-span-5">
          <CardHead title="Tracked topics" eyebrow="Trending now" />
          <ul className="mt-4 space-y-2.5">
            {listening.topics.map((t) => (
              <li key={t.name} className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: sentTone(t.sentiment) }} />
                <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5 truncate text-[14px] font-medium">{t.name}{t.risk && <TriangleAlert className="h-3.5 w-3.5 shrink-0" style={{ color: TONE.bad }} />}</div></div>
                <span className="text-[12px] text-faint tabular-nums">{t.volume}</span>
                <span className="w-4 text-right text-[14px]" style={{ color: t.trend === "up" ? TONE.bad : t.trend === "down" ? TONE.good : TONE.muted }}>{trendGlyph(t.trend)}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* live stream */}
        <Card className="xl:col-span-7">
          <div className="flex items-center justify-between">
            <CardHead title="Live signal stream" eyebrow="As it happens" />
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-faint"><span className="h-2 w-2 rounded-full" style={{ background: TONE.good }} /> Live</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {listening.stream.map((s, i) => {
              const Icon = SOURCE_ICON[s.source] ?? Radio;
              return (
                <li key={i} className="flex items-start gap-3 rounded-2xl border border-line p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-soft text-muted"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-snug">{s.snippet}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-faint">
                      <span>{s.source}</span><span>·</span>
                      <span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${sentTone(s.sentiment)}1a`, color: sentTone(s.sentiment) }}>{s.topic}</span>
                      <span>·</span><span>{s.time}</span>
                    </div>
                  </div>
                  <button onClick={() => toast(`Routed “${s.topic}” signal to Pulse ✓`)} className="shrink-0 self-center text-[12px] font-semibold text-[var(--purple)] hover:underline">Route</button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function CardHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">{title}</h2></div>;
}
