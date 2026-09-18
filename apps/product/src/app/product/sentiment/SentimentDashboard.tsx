"use client";
/* SENTIMENT — how people feel, what about, and where (Listen · Sentiment v2, spec 050).

   Read top to bottom, it answers the questions in the order they're asked:
   · What should I know? Nudge's read of the month, beside the few things
     worth a look — each with the action that fits it.
   · How do people feel, and which way is it going? One net number with its
     change, the positive / negative lines over time, and where the comments
     come from.
   · About what? Every theme with its mix of positive, neutral and negative,
     and whether it's getting better or worse. (The first build coloured
     "more mentions" red, so a rising positive theme read as bad news.)
   · Where? Each team against the company, worst first.
   · In their words — a few comments, only from themes big enough to stay
     anonymous.
   A theme can become a Pulse follow-up in one step, so reading ends in doing.
   Managers are pinned to their own team; any cut under five people is hidden. */
import * as React from "react";
import { ArrowRight, Lock, Minus, ShieldAlert, TrendingDown, TrendingUp, Wrench } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { Legend, LineChart, ViewToggle } from "@/components/viz";
import {
  MIN_N, TOTAL_COMMENTS, months, negativeSeries, nudgeRead, positiveSeries, sources, teamMoods, themes,
  type Mood, type SentimentTheme, type Split,
} from "@/lib/sentiment";
import { Drawer } from "../Drawer";
import { useScope } from "../useViewAs";
import { ScopeNotice } from "../ScopeNotice";
import { CommitDrawer, type CommitSeed } from "../pulse/FollowUps";
import { Delta, usePulse } from "../pulse/parts";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const PERIODS = [{ n: 3, label: "3 months" }, { n: 6, label: "6 months" }, { n: 12, label: "12 months" }] as const;
const POS = "var(--viz-1)";
const NEG = "var(--viz-2)";
const NEU = "color-mix(in srgb, var(--muted) 30%, var(--card))";

const MOOD: Record<Mood, { label: string; color: string; Icon: typeof TrendingUp }> = {
  better: { label: "Getting better", color: "var(--success)", Icon: TrendingUp },
  worse: { label: "Getting worse", color: "var(--danger)", Icon: TrendingDown },
  steady: { label: "Steady", color: "var(--muted)", Icon: Minus },
};
const FILTERS = [
  { key: "all", label: "All" }, { key: "worse", label: "Getting worse" }, { key: "better", label: "Getting better" }, { key: "neg", label: "Mostly negative" },
] as const;

/* ── the read, at a scope ─────────────────────────────────────── */
type Scoped = SentimentTheme & { scoped: number };
function readAt(scope: string) {
  const all = scope === "All teams";
  const team = teamMoods.find((t) => t.team === scope);
  const people = all ? TOTAL_COMMENTS : Math.round((team?.people ?? 0) * 0.33);
  if (!all && (!team || team.people < MIN_N)) return { hidden: true as const, people: team?.people ?? 0 };
  /* A team's lines follow the company's shape, but land where the team is:
     last month at (net − change), this month at net — so the header, the
     chart and "down 9 this month" all tell the same story. */
  const last = positiveSeries.length - 1;
  const companyNet = (i: number) => positiveSeries[i] - negativeSeries[i];
  const before = all ? 0 : Math.round(((team!.net - team!.change) - companyNet(last - 1)) / 2);
  const now = all ? 0 : Math.round((team!.net - companyNet(last)) / 2);
  const shiftAt = (i: number) => (i === last ? now : before);
  const pos = positiveSeries.map((v, i) => clamp(v + shiftAt(i), 10, 90));
  const neg = negativeSeries.map((v, i) => clamp(v - shiftAt(i), 3, 60));
  const scopedThemes: Scoped[] = themes.map((t) => ({ ...t, scoped: all ? t.mentions : Math.round((t.mentions * (t.teams[scope] ?? 4)) / 100) }));
  const shown = scopedThemes.filter((t) => t.scoped >= MIN_N);
  return { hidden: false as const, people, pos, neg, themes: shown, withheld: scopedThemes.length - shown.length };
}

export function SentimentDashboard() {
  const { scope: dataScope, team: myTeam, ready: scopeReady } = useScope("Sentiment");
  const pulse = usePulse();
  const [period, setPeriod] = React.useState<number>(6);
  const [storedScope, setScope] = React.useState("All teams");
  const [open, setOpen] = React.useState<Scoped | null>(null);
  const [commit, setCommit] = React.useState<CommitSeed>(null);
  const pinned = dataScope === "own-team" && myTeam ? myTeam : null;
  const scope = pinned ?? storedScope;
  const v = readAt(scope);
  const top = React.useRef<HTMLDivElement>(null);

  const fix = (t: SentimentTheme) => { setOpen(null); setCommit({ surveyId: "sentiment", topic: t.topic, audience: scope === "All teams" ? undefined : scope, title: "" }); };
  const pickTeam = (team: string) => { setScope(team); top.current?.scrollIntoView({ block: "start" }); };

  return (
    <div ref={top} className="mx-auto flex w-full max-w-[1180px] scroll-mt-6 flex-col gap-6">
      {scopeReady && pinned && <ScopeNotice team={pinned} what="sentiment" />}

      <Header v={v} scope={scope} setScope={setScope} pinned={pinned} period={period} setPeriod={setPeriod} />

      {v.hidden ? (
        <section className="flex flex-col items-center gap-2 rounded-[24px] border border-line bg-card px-6 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-soft text-[var(--warning)]"><ShieldAlert className="h-6 w-6" /></span>
          <h2 className="mt-1 text-[18px] font-bold">Hidden to protect anonymity</h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-muted">{scope} has {v.people} people — fewer than the {MIN_N} needed to show anything without pointing at someone. Pick a larger group.</p>
          {!pinned && <Button variant="secondary" size="sm" className="mt-3 min-h-[44px] lg:min-h-0" onClick={() => setScope("All teams")}>Back to all teams</Button>}
        </section>
      ) : (
        <>
          <Brief scope={scope} themes={v.themes} pinned={!!pinned} onTheme={setOpen} onTeam={pickTeam} onFix={fix} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
            <Now pos={v.pos} neg={v.neg} period={period} people={v.people} scope={scope} />
            <OverTime pos={v.pos} neg={v.neg} period={period} />
          </div>

          <Themes themes={v.themes} withheld={v.withheld} onOpen={setOpen} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {!pinned && <Teams current={scope} onPick={pickTeam} />}
            <Voices themes={v.themes} scope={scope} className={pinned ? "xl:col-span-2" : ""} />
          </div>
        </>
      )}

      <ThemeDrawer t={open} scope={scope} onClose={() => setOpen(null)} onFix={fix} />
      <CommitDrawer key={commit ? `${commit.topic}-${commit.audience ?? ""}` : "closed"} seed={commit} s={pulse} onClose={() => setCommit(null)} />
    </div>
  );
}

/* ── header ─────────────────────────────────────────────────── */
function Header({ v, scope, setScope, pinned, period, setPeriod }: {
  v: ReturnType<typeof readAt>; scope: string; setScope: (s: string) => void; pinned: string | null; period: number; setPeriod: (n: number) => void;
}) {
  const last = months.length - 1;
  const since = months[last - period];
  const netNow = v.hidden ? 0 : v.pos[last] - v.neg[last];
  const netThen = v.hidden ? 0 : v.pos[last - period] - v.neg[last - period];
  return (
    <header className="rise flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Listen</p>
        <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Sentiment</h1>
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
          {v.hidden ? <span>Nothing to show at this size of group.</span> : (
            <>
              <span>Net <span className="font-semibold text-ink">{netNow}</span></span>
              <Delta now={netNow} before={netThen} unit="" sr="" />
              <span>since {since}</span>
              <span aria-hidden className="text-faint">·</span>
              <span><span className="font-semibold text-ink">{v.people.toLocaleString("en-US")}</span> comments{scope !== "All teams" ? ` from ${scope}` : ""}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {pinned ? (
          <span className="flex min-h-[44px] items-center rounded-full border border-line bg-soft px-4 text-[14px] font-semibold text-ink lg:min-h-[38px]">{pinned}</span>
        ) : (
          <label className="relative">
            <span className="sr-only">Team</span>
            <select value={scope} onChange={(e) => setScope(e.target.value)}
              className="min-h-[44px] appearance-none rounded-full border border-line bg-card pl-4 pr-9 text-[14px] font-semibold text-ink outline-none transition hover:bg-soft focus:border-[var(--purple)] lg:min-h-[38px]">
              {["All teams", ...teamMoods.map((t) => t.team)].map((s) => <option key={s}>{s}</option>)}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-faint">▼</span>
          </label>
        )}
        <div role="group" aria-label="Period" className="flex rounded-full border border-line bg-soft p-1">
          {PERIODS.map((p) => (
            <button key={p.n} onClick={() => setPeriod(p.n)} aria-pressed={period === p.n}
              className={`min-h-[44px] rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[30px] ${period === p.n ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{p.label}</button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ── Nudge's read + what's worth a look ─────────────────────── */
function Brief({ scope, themes: shown, pinned, onTheme, onTeam, onFix }: {
  scope: string; themes: Scoped[]; pinned: boolean; onTheme: (t: Scoped) => void; onTeam: (t: string) => void; onFix: (t: SentimentTheme) => void;
}) {
  const all = scope === "All teams";
  const falling = all && !pinned ? teamMoods.filter((t) => t.people >= MIN_N && t.change <= -5).sort((a, b) => a.change - b.change) : [];
  const surging = shown.filter((t) => t.mood === "worse" && t.mentions >= t.previous * 2);
  const heavy = shown.filter((t) => t.mood === "worse" && t.mentions < t.previous * 2).sort((a, b) => b.scoped - a.scoped).slice(0, 1);
  const read = all ? nudgeRead : [
    `${scope} is ${teamMoods.find((t) => t.team === scope)!.net >= 52 ? "above" : "below"} the company on mood — net ${teamMoods.find((t) => t.team === scope)!.net} against 52.`,
    shown[0] ? `The most talked-about theme here is ${shown[0].name.toLowerCase()}.` : "Too few comments here to name themes safely.",
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-36px_rgba(20,20,40,0.3)]">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="p-6 sm:p-7">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint"><SparkMark size={14} tone="gradient" /> Nudge&rsquo;s read · this month</p>
          <ul className="mt-4 flex flex-col gap-3">
            {read.map((r) => <li key={r} className="flex gap-3 text-[16px] leading-relaxed text-ink"><span aria-hidden className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ai-accent)]" />{r}</li>)}
          </ul>
          <Button variant="secondary" size="sm" className="mt-5 min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />}
            onClick={() => ask(`What should we do about how ${all ? "people" : scope} feel right now?`)}>Ask Nudge what to do</Button>
        </div>

        <div className="border-t border-line lg:border-l lg:border-t-0">
          <p className="px-6 pt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-faint sm:px-7">Worth a look</p>
          <ul className="divide-y divide-[var(--line)]">
            {falling.map((t) => (
              <Row key={t.team} tone="var(--danger)" icon={<TrendingDown className="h-[18px] w-[18px]" />} kind="Mood falling"
                title={`${t.team} is down ${-t.change} points this month`} body={`Net ${t.net}, against 52 for the company. Most of it is ${t.top?.toLowerCase()}.`}
                action={<Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onTeam(t.team)}>See {t.team}</Button>} />
            ))}
            {surging.map((t) => (
              <Row key={t.name} tone="var(--warning)" icon={<SparkMark size={16} tone="gradient" />} kind="New and rising"
                title={`${t.name}: ${Math.round(t.mentions / t.previous)}× the mentions of last month`} body={t.read.split(". ")[0] + "."}
                action={<Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onTheme(t)}>Open theme</Button>} />
            ))}
            {heavy.map((t) => (
              <Row key={t.name} tone="var(--danger)" icon={<Wrench className="h-[18px] w-[18px]" />} kind="Needs a fix"
                title={`${t.name} is ${t.split[2]}% negative and growing`} body={`${t.scoped.toLocaleString("en-US")} mentions, up ${Math.round((t.mentions / t.previous - 1) * 100)}%. No one owns a fix for it yet.`}
                action={<Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onFix(t)}>Commit to a fix</Button>} />
            ))}
            {falling.length + surging.length + heavy.length === 0 && <li className="px-6 py-6 text-[14px] text-muted sm:px-7">Nothing unusual this month.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Row({ tone, icon, kind, title, body, action }: { tone: string; icon: React.ReactNode; kind: string; title: string; body: string; action: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-7">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: tone }}>{kind}</p>
          <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{title}</p>
          <p className="mt-0.5 text-[14px] leading-snug text-muted">{body}</p>
        </div>
      </div>
      <div className="shrink-0 pl-[54px] sm:pl-0">{action}</div>
    </li>
  );
}

/* ── how people feel now ─────────────────────────────────────── */
export function SplitBar({ split, height = "h-2.5", label }: { split: Split; height?: string; label: string }) {
  const parts = [{ v: split[2], c: NEG, l: "Negative" }, { v: split[1], c: NEU, l: "Neutral" }, { v: split[0], c: POS, l: "Positive" }];
  return (
    <div className={`flex ${height} w-full gap-[2px]`} role="img" aria-label={`${label}: ${split[0]}% positive, ${split[1]}% neutral, ${split[2]}% negative`}>
      {parts.filter((p) => p.v > 0).map((p, i, a) => (
        <span key={p.l} className={`${i === 0 ? "rounded-l-[4px]" : ""} ${i === a.length - 1 ? "rounded-r-[4px]" : ""}`} style={{ width: `${p.v}%`, background: p.c }} title={`${p.l} ${p.v}%`} />
      ))}
    </div>
  );
}

function Now({ pos, neg, period, people, scope }: { pos: number[]; neg: number[]; period: number; people: number; scope: string }) {
  const last = pos.length - 1;
  const split: Split = [pos[last], 100 - pos[last] - neg[last], neg[last]];
  const maxSrc = Math.max(...sources.map((s) => s.value));
  return (
    <section aria-labelledby="now-h" className="flex flex-col rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <h2 id="now-h" className="text-[18px] font-bold tracking-tight">How people feel now</h2>
      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="text-[52px] font-bold leading-none tracking-[-0.03em] tabular-nums">{pos[last] - neg[last]}</span>
        <span className="text-[14px] text-muted">net</span>
        <Delta now={pos[last] - neg[last]} before={pos[last - period] - neg[last - period]} unit="" sr="" />
      </div>
      <p className="mt-1 text-[13px] text-faint">Positive minus negative, out of 100 · change since {months[last - period]}</p>

      <div className="mt-5"><SplitBar split={split} height="h-3" label="Comments this month" /></div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
        {[["Positive", split[0], POS], ["Neutral", split[1], NEU], ["Negative", split[2], NEG]].map(([l, p, c]) => (
          <li key={l as string} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c as string }} />{l} <span className="font-semibold tabular-nums text-ink">{p}%</span></li>
        ))}
      </ul>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-[13px] font-semibold text-muted">Where the {people.toLocaleString("en-US")} comments come from</p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {sources.map((s) => (
            <li key={s.label} className="grid grid-cols-[minmax(0,1fr)_64px_36px] items-center gap-2 text-[13px]">
              <span className="truncate text-ink">{s.label}</span>
              <span className="h-1.5 rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--viz-1)]" style={{ width: `${(s.value / maxSrc) * 100}%` }} /></span>
              <span className="text-right tabular-nums text-muted">{Math.round((s.value / 4120) * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-[12px] leading-snug text-faint">{scope === "All teams" ? "Chat is read only in channels teams opted in to. Nothing is ever shown with a name." : "Same sources, this team only. Nothing is ever shown with a name."}</p>
      </div>
    </section>
  );
}

function OverTime({ pos, neg, period }: { pos: number[]; neg: number[]; period: number }) {
  const [table, setTable] = React.useState(false);
  const n = period + 1;
  const series = [
    { key: "pos", label: "Positive", color: POS, values: pos.slice(-n) },
    { key: "neg", label: "Negative", color: NEG, values: neg.slice(-n) },
  ];
  return (
    <section aria-labelledby="ot-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="ot-h" className="text-[18px] font-bold tracking-tight">Over time</h2>
          <p className="mt-0.5 text-[14px] text-muted">Share of comments that were positive and negative, each month.</p>
        </div>
        <ViewToggle table={table} onChange={setTable} label="Over time" />
      </div>
      <div className="mt-4"><Legend series={series} shape="line" /></div>
      <div className="mt-3">
        <LineChart labels={months.slice(-n)} series={series} table={table} height={250} domain={[0, 80]} unit="%" caption={`Positive and negative share of comments, last ${period} months`} />
      </div>
    </section>
  );
}

/* ── themes ─────────────────────────────────────────────────── */
function MoodTag({ mood }: { mood: Mood }) {
  const m = MOOD[mood];
  return <span className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold" style={{ color: m.color }}><m.Icon className="h-3.5 w-3.5" />{m.label}</span>;
}

function Themes({ themes: shown, withheld, onOpen }: { themes: Scoped[]; withheld: number; onOpen: (t: Scoped) => void }) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("all");
  const rows = shown.filter((t) => filter === "all" || (filter === "neg" ? t.split[2] >= 50 : t.mood === filter)).sort((a, b) => b.scoped - a.scoped);
  return (
    <section aria-labelledby="th-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="th-h" className="text-[18px] font-bold tracking-tight">What people talk about</h2>
          <p className="mt-0.5 text-[14px] text-muted">Each theme&rsquo;s mix of positive, neutral and negative — and which way it&rsquo;s going.</p>
        </div>
        <div role="group" aria-label="Filter themes" className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
              className={`min-h-[44px] shrink-0 rounded-full border px-3.5 text-[14px] font-semibold transition lg:min-h-[34px] ${filter === f.key ? "border-[var(--purple)] bg-[var(--lav)] text-ink" : "border-line text-muted hover:text-ink"}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legend">
        {[["Negative", NEG], ["Neutral", NEU], ["Positive", POS]].map(([l, c]) => <li key={l} className="flex items-center gap-1.5 text-[12px] text-muted"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} />{l}</li>)}
      </ul>

      <ul className="mt-3 flex flex-col divide-y divide-[var(--line)]">
        {rows.map((t) => {
          const change = Math.round((t.mentions / t.previous - 1) * 100);
          return (
            <li key={t.name}>
              <button onClick={() => onOpen(t)} className="grid w-full grid-cols-1 items-center gap-x-6 gap-y-2.5 py-4 text-left transition hover:bg-soft/60 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_120px_140px]">
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">{t.name}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{t.split[0] >= 50 ? `${t.split[0]}% positive` : t.split[2] >= 50 ? `${t.split[2]}% negative` : "Mixed"}</span>
                </span>
                <SplitBar split={t.split} label={t.name} />
                <span className="flex items-baseline gap-2 lg:block lg:text-right">
                  <span className="text-[16px] font-bold tabular-nums">{t.scoped.toLocaleString("en-US")}</span>
                  <span className="text-[13px] text-faint lg:block">{change >= 0 ? "+" : ""}{change}% mentions</span>
                </span>
                <span className="flex items-center justify-between gap-2 lg:justify-end">
                  <MoodTag mood={t.mood} />
                  <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
                </span>
              </button>
            </li>
          );
        })}
        {rows.length === 0 && <li className="py-8 text-center text-[14px] text-faint">No themes match.</li>}
      </ul>

      {withheld > 0 && (
        <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-snug text-faint">
          <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" />
          <span><b className="font-semibold text-muted">{withheld} theme{withheld === 1 ? "" : "s"} hidden.</b> Fewer than {MIN_N} comments carried {withheld === 1 ? "it" : "them"} here — naming a theme that small would point at whoever raised it.</span>
        </p>
      )}
    </section>
  );
}

/* ── by team ────────────────────────────────────────────────── */
function Teams({ current, onPick }: { current: string; onPick: (t: string) => void }) {
  const COMPANY = 52;
  const rows = [...teamMoods].sort((a, b) => (a.people < MIN_N ? 1 : 0) - (b.people < MIN_N ? 1 : 0) || a.net - b.net);
  return (
    <section aria-labelledby="tm-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <h2 id="tm-h" className="text-[18px] font-bold tracking-tight">Where it&rsquo;s felt</h2>
      <p className="mt-0.5 text-[14px] text-muted">Net mood by team, lowest first. The line marks the company ({COMPANY}). Pick a team to read it on its own.</p>
      <ul className="mt-4 flex flex-col">
        {rows.map((t) => {
          const locked = t.people < MIN_N;
          if (locked) {
            return (
              <li key={t.team} className="flex min-h-[48px] items-center gap-3 border-t border-line text-[14px] text-faint first:border-t-0">
                <span className="w-28 shrink-0 font-medium">{t.team}</span>
                <span className="flex items-center gap-1.5 text-[13px]"><Lock className="h-3.5 w-3.5" />Fewer than {MIN_N} people — hidden</span>
              </li>
            );
          }
          return (
            <li key={t.team} className="border-t border-line first:border-t-0">
              <button onClick={() => onPick(t.team)} aria-pressed={current === t.team}
                className={`grid min-h-[56px] w-full grid-cols-[112px_minmax(0,1fr)_76px] items-center gap-3 rounded-xl py-2 text-left transition hover:bg-soft/60 sm:grid-cols-[120px_minmax(0,1fr)_40px_64px] ${current === t.team ? "bg-[var(--lav)]" : ""}`}>
                <span className="truncate pl-1 text-[14px] font-medium text-ink">{t.team}</span>
                <span className="relative h-2.5 rounded-full bg-soft">
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${t.net}%`, background: t.net < COMPANY - 5 ? NEG : POS }} />
                  <span aria-hidden className="absolute -inset-y-1 w-[2px] rounded-full bg-ink/60" style={{ left: `${COMPANY}%` }} />
                </span>
                <span className="hidden text-right text-[15px] font-bold tabular-nums sm:block">{t.net}</span>
                <span className="flex items-center justify-end gap-1.5 pr-1">
                  <span className="text-[15px] font-bold tabular-nums sm:hidden">{t.net}</span>
                  <Delta now={t.net} before={t.net - t.change} unit="" sr=" this month" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted" aria-label="Legend">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: NEG }} />More than 5 below the company</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: POS }} />Around or above</li>
        <li className="flex items-center gap-1.5"><span className="h-3 w-[2px] rounded-full bg-ink/60" />Company</li>
      </ul>
    </section>
  );
}

/* ── in their words ─────────────────────────────────────────── */
function Voices({ themes: shown, scope, className = "" }: { themes: Scoped[]; scope: string; className?: string }) {
  const all = scope === "All teams";
  const picks = shown
    .flatMap((t) => t.voices.filter((v) => all || v.team === scope).slice(0, 1).map((v) => ({ v, t })))
    .slice(0, 4);
  return (
    <section aria-labelledby="vo-h" className={`rounded-[24px] border border-line bg-card p-5 sm:p-7 ${className}`}>
      <h2 id="vo-h" className="text-[18px] font-bold tracking-tight">In their words</h2>
      <p className="mt-0.5 text-[14px] text-muted">One comment per theme, only from themes big enough to stay anonymous.</p>
      {picks.length === 0 ? <p className="mt-6 text-[14px] text-faint">No comments can be shown here without pointing at someone.</p> : (
        <ul className="mt-4 flex flex-col gap-3">
          {picks.map(({ v, t }) => (
            <li key={v.text}>
              <figure className="rounded-2xl bg-soft/70 p-4">
                <blockquote className="text-[15px] leading-relaxed text-ink">&ldquo;{v.text}&rdquo;</blockquote>
                <figcaption className="mt-2 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
                  <span className="font-semibold">{t.name}</span><span aria-hidden>·</span>{all && <><span>{v.team}</span><span aria-hidden>·</span></>}<span>{v.when}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── a theme, opened ────────────────────────────────────────── */
function ThemeDrawer({ t, scope, onClose, onFix }: { t: Scoped | null; scope: string; onClose: () => void; onFix: (t: SentimentTheme) => void }) {
  const all = scope === "All teams";
  const last6 = months.slice(-6);
  return (
    <Drawer open={!!t} title={t?.name} onClose={onClose} footer={t ? (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`What's driving “${t.name}” and how do we improve it?`)}>Ask Nudge</Button>
        <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Wrench className="h-4 w-4" />} onClick={() => onFix(t)}>Commit to a fix</Button>
      </div>
    ) : undefined}>
      {t && (
        <>
          <div className="pr-12"><MoodTag mood={t.mood} /></div>
          <h2 className="mt-1.5 pr-12 text-[24px] font-bold leading-tight tracking-tight">{t.name}</h2>
          <p className="mt-1 text-[14px] text-muted">{t.scoped.toLocaleString("en-US")} mentions{all ? "" : ` in ${scope}`} · {Math.round((t.mentions / t.previous - 1) * 100) >= 0 ? "+" : ""}{Math.round((t.mentions / t.previous - 1) * 100)}% on last month</p>

          <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[var(--ai-surface)] p-4 text-[15px] leading-relaxed text-ink ring-1 ring-[var(--ai-border)]">
            <SparkMark size={15} tone="gradient" className="mt-[4px] shrink-0" />{t.read}
          </p>

          <h3 className="mt-6 text-[14px] font-bold">The mix</h3>
          <div className="mt-2"><SplitBar split={t.split} height="h-3" label={t.name} /></div>
          <p className="mt-1.5 text-[13px] text-muted">{t.split[0]}% positive · {t.split[1]}% neutral · {t.split[2]}% negative</p>

          <h3 className="mt-6 text-[14px] font-bold">Mentions, last six months</h3>
          <div className="mt-2"><LineChart labels={last6} series={[{ key: "m", label: "Mentions", color: "var(--viz-1)", values: t.trend }]} height={150} caption={`${t.name} mentions per month`} /></div>

          {all && (
            <>
              <h3 className="mt-6 text-[14px] font-bold">Where it comes from</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {Object.entries(t.teams).sort((a, b) => b[1] - a[1]).map(([team, share]) => (
                  <li key={team} className="grid grid-cols-[110px_minmax(0,1fr)_40px] items-center gap-3 text-[14px]">
                    <span className="truncate text-ink">{team}</span>
                    <span className="h-2 rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--viz-1)]" style={{ width: `${share}%` }} /></span>
                    <span className="text-right tabular-nums text-muted">{share}%</span>
                  </li>
                ))}
                <li className="text-[13px] text-faint">The rest is spread thinly across other teams.</li>
              </ul>
            </>
          )}

          <h3 className="mt-6 text-[14px] font-bold">In their words</h3>
          {t.scoped >= MIN_N ? (
            <ul className="mt-2 flex flex-col gap-2.5">
              {t.voices.filter((v) => all || v.team === scope).map((v) => (
                <li key={v.text} className="rounded-2xl bg-soft p-4">
                  <p className="text-[14px] leading-relaxed text-ink">&ldquo;{v.text}&rdquo;</p>
                  <p className="mt-1.5 text-[13px] text-faint">{all ? `${v.team} · ` : ""}{v.when}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 flex items-start gap-2 rounded-2xl bg-soft p-4 text-[14px] text-muted"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />Too few comments here to show any without identifying someone.</p>
          )}
        </>
      )}
    </Drawer>
  );
}
