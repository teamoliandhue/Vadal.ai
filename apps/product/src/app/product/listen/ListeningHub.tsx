"use client";
/* LISTEN — always-on listening (Engagement & listening, spec 053).

   Three views, because a listening product has three jobs and the old screen
   only did the first:

   · Now      — what came in, and what became of each signal. A stream nobody
                acts on teaches people to stop writing, so every signal here
                carries its outcome: a case, a pulse question, watched, or
                nothing — said plainly.
   · Coverage — who we hear from and who we don't, by team, with the reason.
                The silent 38% is the finding; the wall of comments from the
                people who already talk is not.
   · Voice    — what the words are about, the tone behind them, and which
                language they arrived in. Listening only in English, in a
                workforce that works in four, is a sampling error.

   Themes and comments live in Sentiment; this page stops at the signal and
   hands over. Small cuts stay hidden — the anonymity floor is the same five. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, BellOff, CheckCircle2, ClipboardList, Eye, Languages, Lock, MessageSquare, Radio, TriangleAlert, Users,
} from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { ViewToggle } from "@/components/viz";
import { listeningTopicById } from "@/lib/listen";
import {
  MIN_N, TOTAL_HEARD, TOTAL_PEOPLE, channels, coverage, heardPct, languages, moments, phrases,
  signals, stats, tone, type Channel, type Outcome, type Signal,
} from "@/lib/listening";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";

type View = "now" | "coverage" | "voice";
const VIEWS: { id: View; label: string }[] = [
  { id: "now", label: "Now" }, { id: "coverage", label: "Coverage" }, { id: "voice", label: "Voice" },
];

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const TONE = { positive: "var(--success)", neutral: "var(--muted)", negative: "var(--danger)" } as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children, labelledBy }: { className?: string; children: React.ReactNode; labelledBy?: string }) {
  return <section aria-labelledby={labelledBy} className={`rounded-[24px] border border-line bg-card p-5 sm:p-7 ${className}`}>{children}</section>;
}

export function ListeningHub() {
  const [view, setView] = React.useState<View>("now");
  const [off, setOff] = usePersistentState<string[]>("vadal:listen-off", []);
  const [momentsOff, setMomentsOff] = usePersistentState<string[]>("vadal:listen-moments-off", []);

  const live = channels.filter((c) => c.on && !off.includes(c.key));
  const quietest = [...coverage].sort((a, b) => a.heard / a.people - b.heard / b.people)[0];

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Engagement &amp; listening</Eyebrow>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Listen</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            <span><span className="font-semibold text-ink">{stats.signalsToday}</span> signals today</span>
            <span aria-hidden className="text-faint">·</span>
            <span>we heard from <span className="font-semibold text-ink">{heardPct}%</span> of people this month</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{live.length}</span> channels open</span>
          </p>
        </div>
        <Button variant="secondary" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />}
          onClick={() => ask("Who are we not hearing from, and how do we reach them?")}>Ask Nudge who we&rsquo;re missing</Button>
      </header>

      <nav aria-label="Listen views" className="flex items-center gap-1 border-b border-line">
        {VIEWS.map((v) => {
          const on = view === v.id;
          return (
            <button key={v.id} onClick={() => setView(v.id)} aria-current={on ? "page" : undefined}
              className={`-mb-px min-h-[44px] border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "now" && <Now quietest={quietest.team} />}
      {view === "coverage" && (
        <Coverage
          off={off} onToggle={(k) => setOff((all) => (all.includes(k) ? all.filter((x) => x !== k) : [...all, k]))}
          momentsOff={momentsOff}
          onMoment={(id) => setMomentsOff((all) => (all.includes(id) ? all.filter((x) => x !== id) : [...all, id]))}
        />
      )}
      {view === "voice" && <Voice />}
    </div>
  );
}

/* ── now ─────────────────────────────────────────────────────────── */
function outcomeChip(o: Outcome) {
  if (o.kind === "case") return { label: `Became ${o.ref}`, sub: `${o.owner} owns it`, color: "var(--success)", Icon: CheckCircle2 };
  if (o.kind === "pulse") return { label: "Asked in a pulse", sub: o.ref, color: "var(--purple)", Icon: ClipboardList };
  if (o.kind === "watching") return { label: "Watching", sub: o.note, color: "var(--warning)", Icon: Eye };
  return { label: "Nothing yet", sub: "No one has picked this up", color: "var(--muted)", Icon: BellOff };
}

function Now({ quietest }: { quietest: string }) {
  const [only, setOnly] = React.useState<"all" | "acted" | "waiting">("all");
  const rows = signals.filter((s) =>
    only === "all" ? true : only === "acted" ? s.outcome.kind === "case" || s.outcome.kind === "pulse" : s.outcome.kind === "none");
  const waiting = signals.filter((s) => s.outcome.kind === "none").length;

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden" labelledBy="brief-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <h2 id="brief-h" className="sr-only">What came in</h2>
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-r lg:border-line lg:pr-8">
            <div>
              <p className="text-[14px] text-muted">Acted on</p>
              <div className="mt-1 text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{stats.actedOn}%</div>
              <p className="mt-1.5 text-[13px] text-faint">of flagged signals became a case or a question</p>
            </div>
            <div>
              <p className="text-[14px] text-muted">Waiting</p>
              <div className="mt-1 text-[28px] font-bold leading-none tracking-tight tabular-nums">{waiting}</div>
              <p className="mt-1.5 text-[13px] text-faint">nobody has picked these up</p>
            </div>
          </div>
          <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
            <span>
              Rota and canteen complaints from <span className="font-semibold">{quietest}</span> are the only thing rising this week, and they arrive on WhatsApp — the one channel that reaches that shift.
              Two became cases. The rest are being watched.
            </span>
          </p>
        </div>
      </Card>

      <Card labelledBy="sig-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="sig-h" className="text-[18px] font-bold tracking-tight">Signals, and what became of them</h2>
            <p className="mt-0.5 text-[14px] text-muted">A stream nobody acts on teaches people to stop writing.</p>
          </div>
          <div role="group" aria-label="Filter signals" className="flex rounded-full border border-line bg-soft p-1">
            {([["all", "All"], ["acted", "Acted on"], ["waiting", `Waiting · ${waiting}`]] as const).map(([k, label]) => (
              <button key={k} onClick={() => setOnly(k)} aria-pressed={only === k}
                className={`min-h-[44px] rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[34px] ${only === k ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{label}</button>
            ))}
          </div>
        </div>

        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {rows.map((s) => <SignalRow key={s.id} s={s} />)}
          {rows.length === 0 && <li className="py-8 text-center text-[15px] text-faint">Nothing in this cut.</li>}
        </ul>

        <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-snug text-faint">
          <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" />
          Signals are shown with a team, never a name. A cut carrying fewer than {MIN_N} people is not shown at all — including to the People team.
        </p>
      </Card>
    </div>
  );
}

function SignalRow({ s }: { s: Signal }) {
  const o = outcomeChip(s.outcome);
  const topic = listeningTopicById[s.topicId]?.name ?? s.topicId;
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:gap-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: soft(TONE[s.sentiment], 12), color: TONE[s.sentiment] }}>
        <MessageSquare className="h-[17px] w-[17px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-relaxed text-ink">&ldquo;{s.snippet}&rdquo;</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-faint">
          <span>{s.source}</span><span aria-hidden>·</span><span>{s.team}</span><span aria-hidden>·</span><span>{topic}</span>
          {s.language && <><span aria-hidden>·</span><span className="inline-flex items-center gap-1"><Languages className="h-3.5 w-3.5" />{s.language}</span></>}
          <span aria-hidden>·</span><span>{s.time} ago</span>
        </p>
      </div>
      <div className="shrink-0 sm:w-[240px]">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: o.color }}>
          <o.Icon className="h-4 w-4" />{o.label}
        </span>
        <p className="mt-0.5 text-[13px] leading-snug text-faint">{o.sub}</p>
      </div>
    </li>
  );
}

/* ── coverage ────────────────────────────────────────────────────── */
function Coverage({ off, onToggle, momentsOff, onMoment }: {
  off: string[]; onToggle: (k: string) => void; momentsOff: string[]; onMoment: (id: string) => void;
}) {
  const [table, setTable] = React.useState(false);
  const rows = [...coverage].sort((a, b) => a.heard / a.people - b.heard / b.people);

  return (
    <div className="flex flex-col gap-6">
      <Card labelledBy="cov-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[640px]">
            <h2 id="cov-h" className="text-[18px] font-bold tracking-tight">Who we heard from this month</h2>
            <p className="mt-0.5 text-[14px] leading-relaxed text-muted">
              {TOTAL_HEARD.toLocaleString("en-IN")} of {TOTAL_PEOPLE.toLocaleString("en-IN")} people left at least one signal. The rest are not quiet — we are not reaching them.
            </p>
          </div>
          <ViewToggle table={table} onChange={setTable} label="Coverage" />
        </div>

        {table ? (
          <table className="mt-5 w-full border-collapse text-[14px]">
            <caption className="sr-only">People heard from, by team</caption>
            <thead><tr className="text-left text-[12px] text-faint"><th className="pb-2 font-semibold">Team</th><th className="pb-2 text-right font-semibold">People</th><th className="pb-2 text-right font-semibold">Heard from</th><th className="pb-2 text-right font-semibold">Share</th><th className="pb-2 pl-3 font-semibold">Reached on</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.team} className="border-t border-line">
                  <th scope="row" className="py-2.5 text-left font-medium text-ink">{c.team}</th>
                  <td className="py-2.5 text-right tabular-nums text-muted">{c.people.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{c.heard.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums">{Math.round((c.heard / c.people) * 100)}%</td>
                  <td className="py-2.5 pl-3 text-muted">{c.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {rows.map((c) => {
              const pct = Math.round((c.heard / c.people) * 100);
              const thin = pct < 40;
              return (
                <li key={c.team}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-[15px] font-semibold text-ink">{c.team}</span>
                    <span className="text-[14px] tabular-nums text-muted">
                      <span className="font-semibold text-ink">{pct}%</span> · {c.heard.toLocaleString("en-IN")} of {c.people.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full rounded-full bg-soft">
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: thin ? "var(--warning)" : "var(--purple)" }} />
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-faint">
                    <span>Reached on {c.channel}</span>
                    {c.why && <><span aria-hidden>·</span><span className="inline-flex items-center gap-1" style={{ color: "var(--warning)" }}><TriangleAlert className="h-3.5 w-3.5" />{c.why}</span></>}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => toast("Night shift will be asked at 21:00, on WhatsApp — inside their waking hours")}>
            Ask night shift at their hour
          </Button>
          <Link href="/product/pulse" className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
            See who hasn&rsquo;t answered the pulse <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card labelledBy="ch-h">
          <h2 id="ch-h" className="text-[18px] font-bold tracking-tight">Where we listen</h2>
          <p className="mt-0.5 text-[14px] text-muted">Each channel says who it can actually reach — and who it can&rsquo;t.</p>
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {channels.map((c) => <ChannelRow key={c.key} c={c} on={c.on && !off.includes(c.key)} onToggle={() => onToggle(c.key)} />)}
          </ul>
        </Card>

        <Card labelledBy="mo-h">
          <h2 id="mo-h" className="text-[18px] font-bold tracking-tight">The moments we ask at</h2>
          <p className="mt-0.5 text-[14px] text-muted">Listening tied to what happened to a person, not to a calendar.</p>
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {moments.map((m) => {
              const on = m.on && !momentsOff.includes(m.id);
              const rate = m.sent ? Math.round((m.answered / m.sent) * 100) : 0;
              return (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug text-ink">{m.name}</p>
                    <p className="mt-0.5 text-[13px] text-faint">{m.when} · {m.channel}{m.sent > 0 ? ` · ${rate}% answered` : ""}</p>
                  </div>
                  <Toggle on={on} label={`${m.name} listening`} onClick={() => onMoment(m.id)} />
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}


/* The track is 24px because that is what reads well; the target around it is
   44, because that is what a thumb needs. */
function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick} role="switch" aria-checked={on} aria-label={label}
      className="grid h-11 w-14 shrink-0 place-items-center rounded-xl transition hover:bg-soft"
    >
      <span className={`relative block h-6 w-11 rounded-full transition ${on ? "bg-[var(--purple)]" : "bg-soft ring-1 ring-line"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function ChannelRow({ c, on, onToggle }: { c: Channel; on: boolean; onToggle: () => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[var(--purple)]"><Radio className="h-[17px] w-[17px]" /></span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[15px] font-semibold leading-snug text-ink">
          {c.name}
          {on && c.signals > 0 && <span className="text-[13px] font-normal text-faint">{c.signals.toLocaleString("en-IN")} in 30 days</span>}
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{c.note}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[13px] text-faint"><Users className="h-3.5 w-3.5" />{c.reach}</p>
      </div>
      <Toggle on={on} label={`${c.name} channel`} onClick={onToggle} />
    </li>
  );
}

/* ── voice ───────────────────────────────────────────────────────── */
function Voice() {
  const [table, setTable] = React.useState(false);
  const max = Math.max(...phrases.map((p) => p.n));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card labelledBy="ph-h">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="ph-h" className="text-[18px] font-bold tracking-tight">The words people use</h2>
              <p className="mt-0.5 text-[14px] text-muted">Their phrases, not our categories.</p>
            </div>
            <ViewToggle table={table} onChange={setTable} label="Phrases" />
          </div>
          {table ? (
            <table className="mt-4 w-full border-collapse text-[14px]">
              <caption className="sr-only">Phrases by number of mentions</caption>
              <thead><tr className="text-left text-[12px] text-faint"><th className="pb-2 font-semibold">Phrase</th><th className="pb-2 text-right font-semibold">Mentions</th><th className="pb-2 pl-3 font-semibold">Tone</th></tr></thead>
              <tbody>
                {phrases.map((p) => (
                  <tr key={p.text} className="border-t border-line">
                    <th scope="row" className="py-2 text-left font-medium text-ink">&ldquo;{p.text}&rdquo;</th>
                    <td className="py-2 text-right tabular-nums text-muted">{p.n}</td>
                    <td className="py-2 pl-3 capitalize text-muted">{p.tone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="mt-5 flex flex-col gap-3">
              {phrases.map((p) => (
                <li key={p.text}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="font-medium text-ink">&ldquo;{p.text}&rdquo;</span>
                    <span className="tabular-nums text-faint">{p.n}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-soft">
                    <div className="h-full rounded-full" style={{ width: `${(p.n / max) * 100}%`, background: p.tone === "positive" ? "var(--viz-1)" : "var(--viz-2)" }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3" aria-label="Legend">
            <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--viz-1)" }} />Said warmly</li>
            <li className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--viz-2)" }} />Said as a complaint</li>
          </ul>
        </Card>

        <div className="flex flex-col gap-6">
          <Card labelledBy="lang-h">
            <h2 id="lang-h" className="text-[18px] font-bold tracking-tight">In whose words</h2>
            <p className="mt-0.5 text-[14px] leading-relaxed text-muted">
              {100 - languages[0].share}% of what people write is not in English. Listening only in one language would miss all of it.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {languages.map((l) => (
                <li key={l.name} className="grid grid-cols-[92px_minmax(0,1fr)_44px] items-center gap-3 text-[14px]">
                  <span className="truncate text-ink">{l.name}</span>
                  <span className="h-2 rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--viz-1)]" style={{ width: `${l.share}%` }} /></span>
                  <span className="text-right tabular-nums text-muted">{l.share}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] leading-snug text-faint">Every signal is read in the language it was written in, and translated only for the person reading it.</p>
          </Card>

          <Card labelledBy="tone-h">
            <h2 id="tone-h" className="text-[18px] font-bold tracking-tight">The tone of it</h2>
            <div className="mt-4 flex h-3 w-full gap-[2px]" role="img" aria-label={`${tone.positive}% positive, ${tone.neutral}% neutral, ${tone.negative}% negative`}>
              <span className="rounded-l-[4px]" style={{ width: `${tone.negative}%`, background: "var(--viz-2)" }} />
              <span style={{ width: `${tone.neutral}%`, background: "color-mix(in srgb, var(--muted) 30%, var(--card))" }} />
              <span className="rounded-r-[4px]" style={{ width: `${tone.positive}%`, background: "var(--viz-1)" }} />
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--viz-2)" }} />Negative <span className="font-semibold tabular-nums text-ink">{tone.negative}%</span></li>
              <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "color-mix(in srgb, var(--muted) 30%, var(--card))" }} />Neutral <span className="font-semibold tabular-nums text-ink">{tone.neutral}%</span></li>
              <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--viz-1)" }} />Positive <span className="font-semibold tabular-nums text-ink">{tone.positive}%</span></li>
            </ul>
            <Link href="/product/sentiment" className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
              Read the themes in Sentiment <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
