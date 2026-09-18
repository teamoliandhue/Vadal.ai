"use client";
/* Results — read it, then do something about it (Pulse v2, spec 049).

   · The headline is the outcome question, with the change since last round.
   · Every question shows its whole answer spread, centred on neutral, with
     the change and a benchmark beside it — never a lone "top answer %".
   · What moves engagement: how much each topic matters against how well we
     score. The corner that matters a lot and scores low is named.
   · The same answers by team, against the company. Teams under five answers
     are locked, not estimated.
   · Every weak spot has a "Commit to a fix" next to it, and the follow-ups
     for this survey sit at the bottom. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Lock, MessageSquareText, Plus, TrendingDown, TrendingUp, Wrench } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { ViewToggle } from "@/components/viz";
import {
  MIN_N, TOPICS, daysBetween, favourable, fmtDate, resultFor, teamScore, topicLabel, unfavourable,
  type FollowUp, type PulseResult, type PulseSurvey, type Question, type Topic,
} from "@/lib/pulse";
import type { CommitSeed } from "./FollowUps";
import { FollowUpList } from "./FollowUps";
import { Delta, Eyebrow, SpreadBar, SpreadLegend, ask, pct, soft, type PulseState } from "./parts";

export function Results({ s, surveyId, setSurveyId, onCommit, onDone }: {
  s: PulseState; surveyId: string; setSurveyId: (id: string) => void;
  onCommit: (seed: NonNullable<CommitSeed>) => void; onDone: (f: FollowUp) => void;
}) {
  const withResults = s.surveys.filter((x) => resultFor(x.id));
  const survey = withResults.find((x) => x.id === surveyId) ?? withResults[0];
  const r = resultFor(survey.id)!;
  const outcome = r.questions.find((q) => q.topic === "outcome")!;
  const drivers = r.questions.filter((q) => q.topic !== "outcome");
  const commit = (topic: Topic, audience?: string) => onCommit({ surveyId: survey.id, topic, audience });

  return (
    <div className="flex flex-col gap-6">
      {/* one picker, above everything it scopes */}
      <div role="group" aria-label="Survey" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {withResults.map((x) => {
          const on = x.id === survey.id;
          return (
            <button key={x.id} onClick={() => setSurveyId(x.id)} aria-pressed={on}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition lg:min-h-[38px] ${on ? "border-[var(--purple)] bg-[var(--lav)] text-ink" : "border-line bg-card text-muted hover:text-ink"}`}>
              {x.name}
              {x.status === "live" && <span className="rounded-full bg-card px-1.5 text-[11px] font-semibold text-[var(--success)]">Early read</span>}
            </button>
          );
        })}
      </div>

      <Headline survey={survey} r={r} outcome={outcome} today={s.today} onCommit={() => commit((drivers.slice().sort((a, b) => favourable(a.spread) - favourable(b.spread))[0].topic) as Topic)} />

      <QuestionsCard r={r} survey={survey} onFix={(t) => commit(t)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {drivers.filter((q) => q.impact != null).length >= 4
          ? <DriverChart questions={drivers} onFix={(t) => commit(t)} />
          : (
            <section className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
              <h2 className="text-[18px] font-bold tracking-tight">What moves engagement most</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">This survey asks too few questions to tell which ones move engagement. The quarterly pulse can.</p>
            </section>
          )}
        <Themes r={r} />
      </div>

      {r.teams && <Heatmap r={r} survey={survey} onFix={(t, team) => commit(t, team)} />}

      <section aria-labelledby="sfu-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="sfu-h" className="text-[18px] font-bold tracking-tight">Follow-ups from this survey</h2>
            <p className="mt-0.5 text-[14px] text-muted">When one&rsquo;s done, people hear what changed — that&rsquo;s what gets them to answer next time.</p>
          </div>
          <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => commit(drivers[0].topic as Topic)}>Commit to a fix</Button>
        </div>
        <div className="mt-4">
          <FollowUpList s={s} items={s.followUps.filter((f) => f.surveyId === survey.id)} onDone={onDone} empty="Nothing committed from this survey yet." />
        </div>
      </section>
    </div>
  );
}

/* ── headline ─────────────────────────────────────────────────── */
function Headline({ survey, r, outcome, today, onCommit }: { survey: PulseSurvey; r: PulseResult; outcome: Question; today: string; onCommit: () => void }) {
  const fav = favourable(outcome.spread);
  const rate = pct(survey.responses, survey.sent);
  const left = survey.closes ? daysBetween(today, survey.closes) : null;
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_56px_-36px_rgba(20,20,40,0.3)] sm:p-8">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
        <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-r lg:border-line lg:pr-8">
          <div>
            <p className="text-[13px] text-muted">Engagement</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{fav}%</span>
              <Delta now={fav} before={outcome.previous} />
            </div>
            <p className="mt-1.5 max-w-[220px] text-[13px] leading-snug text-faint">&ldquo;{outcome.text}&rdquo; · benchmark {outcome.benchmark}%</p>
          </div>
          <div>
            <p className="text-[13px] text-muted">Answered</p>
            <div className="mt-1 text-[28px] font-bold leading-none tracking-tight tabular-nums">{rate}%</div>
            <p className="mt-1.5 text-[13px] text-faint">{survey.responses.toLocaleString("en-US")} of {survey.sent.toLocaleString("en-US")}</p>
          </div>
        </div>
        <div className="min-w-0">
          <Eyebrow>{r.final ? `Final · closed ${fmtDate(survey.closes!)}` : `Early read · ${left != null && left > 0 ? `${left} days to go` : "closing"}`}</Eyebrow>
          <h2 className="mt-2 text-[clamp(22px,2.4vw,28px)] font-bold leading-[1.15] tracking-[-0.02em]">{survey.name}</h2>
          <p className="mt-3 flex items-start gap-2.5 text-[16px] leading-relaxed text-ink/90">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" /> {r.summary}
          </p>
          {!r.final && <p className="mt-2 pl-[26px] text-[13px] text-faint">Numbers will move a little until it closes — read the direction, not the decimals.</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Wrench className="h-4 w-4" />} onClick={onCommit}>Commit to a fix</Button>
            <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => ask(`What should we do first about the ${survey.name} results?`)}>Ask Nudge what to do first</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── every question ───────────────────────────────────────────── */
function QuestionsCard({ r, survey, onFix }: { r: PulseResult; survey: PulseSurvey; onFix: (t: Topic) => void }) {
  const [table, setTable] = React.useState(false);
  const rows = r.questions.filter((q) => q.topic !== "outcome");
  return (
    <section aria-labelledby="q-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="q-h" className="text-[18px] font-bold tracking-tight">Every question</h2>
          <p className="mt-0.5 text-[14px] text-muted">The whole spread of answers, centred on neutral — with the change since {survey.previous || r.questions[0].previous != null ? "last round" : "before"} and the benchmark.</p>
        </div>
        <ViewToggle table={table} onChange={setTable} label="Every question" />
      </div>

      {table ? (
        <div className="-mx-1 mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <caption className="sr-only">Answers to each question, in percent</caption>
            <thead>
              <tr className="text-left text-[12px] text-faint">
                <th scope="col" className="px-1 pb-2 font-semibold">Question</th>
                {["Str. disagree", "Disagree", "Neutral", "Agree", "Str. agree", "Favourable", "Last round", "Benchmark"].map((h) => <th key={h} scope="col" className="px-1 pb-2 text-right font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className="border-t border-line">
                  <th scope="row" className="px-1 py-2 text-left font-medium text-ink">{q.text}</th>
                  {q.spread.map((v, i) => <td key={i} className="px-1 py-2 text-right tabular-nums text-muted">{v}%</td>)}
                  <td className="px-1 py-2 text-right font-semibold tabular-nums">{favourable(q.spread)}%</td>
                  <td className="px-1 py-2 text-right tabular-nums text-muted">{q.previous ?? "—"}{q.previous != null && "%"}</td>
                  <td className="px-1 py-2 text-right tabular-nums text-muted">{q.benchmark}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mt-5"><SpreadLegend /></div>
          <div className="mt-2 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_150px] gap-6 text-[12px] font-semibold text-faint lg:grid">
            <span>Question</span>
            <span className="flex justify-between"><span>← Disagree</span><span>Agree →</span></span>
            <span className="text-right">Favourable</span>
          </div>
          <ul className="mt-1 flex flex-col divide-y divide-[var(--line)]">
            {rows.map((q) => {
              const fav = favourable(q.spread);
              const gap = fav - q.benchmark;
              const weak = gap <= -5 || (q.previous != null && fav - q.previous <= -4);
              return (
                <li key={q.id} className="grid grid-cols-1 items-center gap-x-6 gap-y-3 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_150px]">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold leading-snug text-ink">{q.text}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
                      <span>{topicLabel(q.topic as Topic)}</span>
                      <span aria-hidden>·</span>
                      <span>{unfavourable(q.spread)}% disagree</span>
                      {weak && (
                        <button onClick={() => onFix(q.topic as Topic)} className="inline-flex min-h-[44px] items-center gap-1 font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
                          <Wrench className="h-3.5 w-3.5" /> Commit to a fix
                        </button>
                      )}
                    </p>
                  </div>
                  <SpreadBar spread={q.spread} label={q.text} />
                  <div className="flex items-baseline justify-between gap-3 lg:flex-col lg:items-end lg:gap-0.5">
                    <span className="flex items-baseline gap-2">
                      <span className="text-[20px] font-bold tabular-nums">{fav}%</span>
                      <Delta now={fav} before={q.previous} />
                    </span>
                    <span className="text-[13px] tabular-nums" style={{ color: gap <= -5 ? "var(--danger)" : "var(--faint)" }}>
                      {gap === 0 ? "at" : `${Math.abs(gap)} ${gap > 0 ? "above" : "below"}`} benchmark
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

/* ── what moves engagement ────────────────────────────────────── */
function useWidth() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(520);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const read = () => { const n = Math.round(el.getBoundingClientRect().width); if (n) setW(n); };
    read();
    const ro = new ResizeObserver(read); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function DriverChart({ questions, onFix }: { questions: Question[]; onFix: (t: Topic) => void }) {
  const [ref, w] = useWidth();
  const [table, setTable] = React.useState(false);
  const [hover, setHover] = React.useState<string | null>(null);
  const pts = questions.filter((q) => q.impact != null).map((q) => ({ q, x: q.impact!, y: favourable(q.spread) }));
  const H = 300, PL = 44, PR = 16, PT = 12, PB = 36;
  const X0 = 0.2, X1 = 0.8, Y0 = 30, Y1 = 90;
  const sx = (v: number) => PL + ((v - X0) / (X1 - X0)) * (w - PL - PR);
  const sy = (v: number) => PT + (1 - (v - Y0) / (Y1 - Y0)) * (H - PT - PB);
  const XM = 0.5, YM = 60;
  const fixFirst = pts.filter((p) => p.x >= XM && p.y < YM).sort((a, b) => b.x - a.x);
  const top = fixFirst[0];

  return (
    <section aria-labelledby="drv-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="drv-h" className="text-[18px] font-bold tracking-tight">What moves engagement most</h2>
          <p className="mt-0.5 text-[14px] text-muted">How much each topic matters to engagement, against how well we score on it.</p>
        </div>
        <ViewToggle table={table} onChange={setTable} label="What moves engagement most" />
      </div>

      {table ? (
        <table className="mt-5 w-full border-collapse text-[13px]">
          <caption className="sr-only">Each topic’s effect on engagement and its score</caption>
          <thead><tr className="text-left text-[12px] text-faint"><th className="pb-2 font-semibold">Topic</th><th className="pb-2 text-right font-semibold">Effect on engagement</th><th className="pb-2 text-right font-semibold">Favourable</th><th className="pb-2 text-right font-semibold">Priority</th></tr></thead>
          <tbody>
            {[...pts].sort((a, b) => b.x - a.x).map((p) => (
              <tr key={p.q.id} className="border-t border-line">
                <th scope="row" className="py-2 text-left font-medium text-ink">{topicLabel(p.q.topic as Topic)}</th>
                <td className="py-2 text-right tabular-nums text-muted">{p.x >= 0.6 ? "Strong" : p.x >= 0.45 ? "Medium" : "Weak"} ({p.x.toFixed(2)})</td>
                <td className="py-2 text-right tabular-nums">{p.y}%</td>
                <td className="py-2 text-right text-muted">{p.x >= XM && p.y < YM ? "Fix first" : p.x >= XM ? "Protect" : p.y < YM ? "Watch" : "Fine"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div ref={ref} className="relative mt-4" onMouseLeave={() => setHover(null)}>
          <svg width={w} height={H} role="img" aria-label="Topics plotted by effect on engagement and favourable score">
            {/* the corner that matters */}
            <rect x={sx(XM)} y={sy(YM)} width={sx(X1) - sx(XM)} height={sy(Y0) - sy(YM)} rx={10} fill="color-mix(in srgb, var(--warning) 9%, transparent)" />
            <text x={sx(X1) - 8} y={sy(Y0) - 10} textAnchor="end" className="fill-[var(--warning)] text-[12px] font-semibold">Fix first</text>
            <text x={sx(X1) - 8} y={PT + 14} textAnchor="end" className="fill-[var(--faint)] text-[12px]">Protect</text>
            <text x={PL + 8} y={sy(Y0) - 10} className="fill-[var(--faint)] text-[12px]">Watch</text>
            {[30, 45, 60, 75, 90].map((v) => (
              <g key={v}>
                <line x1={PL} x2={w - PR} y1={sy(v)} y2={sy(v)} stroke="var(--viz-grid)" />
                <text x={PL - 8} y={sy(v) + 4} textAnchor="end" className="fill-[var(--faint)] text-[11px] tabular-nums">{v}%</text>
              </g>
            ))}
            <line x1={sx(XM)} x2={sx(XM)} y1={PT} y2={H - PB} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={PL} y={H - 10} className="fill-[var(--faint)] text-[12px]">Matters less</text>
            <text x={w - PR} y={H - 10} textAnchor="end" className="fill-[var(--faint)] text-[12px]">Matters more →</text>
            {pts.map((p) => {
              const cx = sx(p.x), cy = sy(p.y);
              const right = cx < w - 130;
              const on = hover === p.q.id;
              return (
                <g key={p.q.id} tabIndex={0} role="button" aria-label={`${topicLabel(p.q.topic as Topic)}: ${p.y}% favourable, effect ${p.x.toFixed(2)}`}
                  onMouseEnter={() => setHover(p.q.id)} onFocus={() => setHover(p.q.id)} onBlur={() => setHover(null)}
                  onClick={() => onFix(p.q.topic as Topic)} className="cursor-pointer outline-none">
                  <circle cx={cx} cy={cy} r={18} fill="transparent" />
                  <circle cx={cx} cy={cy} r={on ? 8 : 6} fill="var(--viz-1)" stroke="var(--card)" strokeWidth={2} />
                  <text x={right ? cx + 12 : cx - 12} y={cy + 4} textAnchor={right ? "start" : "end"} className="fill-[var(--ink)] text-[13px] font-semibold">{topicLabel(p.q.topic as Topic)}</text>
                </g>
              );
            })}
          </svg>
          {hover && (() => {
            const p = pts.find((x) => x.q.id === hover)!;
            const left = Math.min(Math.max(0, sx(p.x) - 90), w - 190);
            return (
              <div role="status" className="pointer-events-none absolute z-10 w-[190px] rounded-xl border border-line bg-card px-3 py-2.5 shadow-[0_12px_30px_-12px_rgba(20,20,40,0.35)]" style={{ left, top: Math.max(0, sy(p.y) - 88) }}>
                <p className="text-[12px] text-faint">{topicLabel(p.q.topic as Topic)}</p>
                <p className="text-[14px] font-semibold tabular-nums">{p.y}% favourable</p>
                <p className="text-[12px] text-muted">{p.x >= 0.6 ? "Strong" : p.x >= 0.45 ? "Medium" : "Weak"} effect on engagement · click to commit a fix</p>
              </div>
            );
          })()}
        </div>
      )}

      {top && (
        <p className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-ink">
          <SparkMark size={14} tone="gradient" className="mt-[4px] shrink-0" />
          <span>
            <span className="font-semibold">Fix {topicLabel(top.q.topic as Topic).toLowerCase()} first.</span>{" "}
            It moves engagement more than anything else we asked, and only {top.y}% are positive about it.
            {fixFirst[1] && ` ${topicLabel(fixFirst[1].q.topic as Topic)} is next.`}
          </span>
        </p>
      )}
    </section>
  );
}

/* ── what people wrote ───────────────────────────────────────── */
function Themes({ r }: { r: PulseResult }) {
  const max = Math.max(...r.themes.map((t) => t.mentions));
  const TONE = { good: { c: "var(--success)", l: "Positive", I: TrendingUp }, bad: { c: "var(--danger)", l: "Negative", I: TrendingDown }, warn: { c: "var(--warning)", l: "Mixed", I: MessageSquareText } } as const;
  return (
    <section aria-labelledby="th-h" className="flex flex-col rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <h2 id="th-h" className="text-[18px] font-bold tracking-tight">What people wrote</h2>
      <p className="mt-0.5 text-[14px] text-muted">Themes Nudge found in the comments. Only groups of {MIN_N}+ are shown.</p>
      <ul className="mt-5 flex flex-1 flex-col gap-3.5">
        {r.themes.map((t) => {
          const tone = TONE[t.tone];
          return (
            <li key={t.name}>
              <div className="flex items-center justify-between gap-3 text-[14px]">
                <span className="min-w-0 font-medium leading-snug text-ink">{t.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {t.rising && <span className="rounded-full bg-soft px-2 text-[12px] font-semibold text-muted">Rising</span>}
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: tone.c }}><tone.I className="h-3.5 w-3.5" />{tone.l}</span>
                  <span className="w-10 text-right text-[13px] font-semibold tabular-nums text-ink">{t.mentions}</span>
                </span>
              </div>
              <span className="mt-1.5 block h-1.5 rounded-full bg-soft"><span className="block h-full rounded-full" style={{ width: `${(t.mentions / max) * 100}%`, background: soft(tone.c, 70) }} /></span>
            </li>
          );
        })}
      </ul>
      <Link href="/product/sentiment" className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 self-start text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
        Read the comments in Sentiment <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

/* ── by team ─────────────────────────────────────────────────── */
function cellColor(d: number) {
  if (Math.abs(d) < 3) return "color-mix(in srgb, var(--muted) 10%, transparent)";
  const k = Math.min(60, 14 + Math.abs(d) * 3.2);
  return d < 0 ? `color-mix(in srgb, var(--viz-2) ${k}%, transparent)` : `color-mix(in srgb, var(--viz-1) ${k}%, transparent)`;
}

function Heatmap({ r, survey, onFix }: { r: PulseResult; survey: PulseSurvey; onFix: (t: Topic, team: string) => void }) {
  const cols = TOPICS.filter((t) => r.questions.some((q) => q.topic === t.key));
  const company = Object.fromEntries(r.questions.map((q) => [q.topic, favourable(q.spread)]));
  const [focus, setFocus] = React.useState<string | null>(null);
  return (
    <section aria-labelledby="hm-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="hm-h" className="text-[18px] font-bold tracking-tight">By team</h2>
          <p className="mt-0.5 text-[14px] text-muted">Favourable %, coloured by how far each team is from the company. Pick a cell to commit a fix for that team.</p>
        </div>
        <ul className="flex items-center gap-3 text-[12px] text-muted" aria-label="Legend">
          <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-[4px]" style={{ background: cellColor(-12) }} />Below company</li>
          <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-[4px]" style={{ background: cellColor(0) }} />About the same</li>
          <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-[4px]" style={{ background: cellColor(12) }} />Above</li>
        </ul>
      </div>

      <div className="-mx-1 mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-[3px] text-[13px]">
          <caption className="sr-only">Favourable percentage by team and topic, {survey.name}</caption>
          <thead>
            <tr className="text-[12px] text-faint">
              <th scope="col" className="px-2 pb-1 text-left font-semibold">Team</th>
              <th scope="col" className="px-2 pb-1 text-right font-semibold">Answers</th>
              <th scope="col" className="px-2 pb-1 text-center font-semibold">Engagement</th>
              {cols.map((c) => <th key={c.key} scope="col" className="px-2 pb-1 text-center font-semibold">{c.label}</th>)}
            </tr>
            <tr className="text-[13px]">
              <th scope="row" className="rounded-lg bg-soft px-2 py-2 text-left font-semibold text-ink">Company</th>
              <td className="px-2 py-2 text-right tabular-nums text-muted">{survey.responses.toLocaleString("en-US")}</td>
              <td className="rounded-lg bg-soft px-2 py-2 text-center font-semibold tabular-nums">{company.outcome}%</td>
              {cols.map((c) => <td key={c.key} className="rounded-lg bg-soft px-2 py-2 text-center font-semibold tabular-nums">{company[c.key]}%</td>)}
            </tr>
          </thead>
          <tbody>
            {r.teams!.map(({ team, n }) => {
              const locked = n < MIN_N;
              return (
                <tr key={team}>
                  <th scope="row" className="px-2 py-2 text-left font-medium text-ink">{team}</th>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">{n.toLocaleString("en-US")}</td>
                  {locked ? (
                    <td colSpan={cols.length + 1} className="rounded-lg border border-dashed border-line px-2 py-2 text-center text-[13px] text-faint">
                      <Lock className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />Fewer than {MIN_N} answers — hidden so no one can be identified
                    </td>
                  ) : (
                    [{ key: "outcome" as const, label: "Engagement" }, ...cols].map((c) => {
                      const v = teamScore(r, team, c.key)!;
                      const d = v - company[c.key];
                      const id = `${team}:${c.key}`;
                      const can = c.key !== "outcome" && d <= -5;
                      return (
                        <td key={c.key} className="p-0">
                          <button
                            onClick={() => can && onFix(c.key as Topic, team)}
                            onMouseEnter={() => setFocus(id)} onMouseLeave={() => setFocus(null)} onFocus={() => setFocus(id)} onBlur={() => setFocus(null)}
                            aria-label={`${team}, ${c.label}: ${v}%, ${d === 0 ? "same as" : `${Math.abs(d)} points ${d > 0 ? "above" : "below"}`} the company${can ? ". Commit a fix" : ""}`}
                            className={`relative flex min-h-[44px] w-full items-center justify-center rounded-lg text-[14px] font-semibold tabular-nums text-ink transition ${can ? "cursor-pointer hover:ring-2 hover:ring-[var(--purple)]" : "cursor-default"}`}
                            style={{ background: cellColor(d) }}
                          >
                            {v}%
                            {focus === id && (
                              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[12px] font-semibold text-[var(--card)] shadow-lg">
                                {d === 0 ? "Same as company" : `${d > 0 ? "+" : "−"}${Math.abs(d)} vs company`}{can ? " · commit a fix" : ""}
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
