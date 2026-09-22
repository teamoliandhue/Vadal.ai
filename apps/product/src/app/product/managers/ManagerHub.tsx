"use client";
/* MANAGER HUB — the people-leader's week (Operations, spec 054).

   Two things were wrong with the first build, one of them serious.

   THE SERIOUS ONE. It printed a sentiment score and a six-point trend line for
   each named report — "Rohan Mehta · 58 · down". Everywhere else the product
   promises the opposite: For you says "your check-ins stay yours, nothing here
   is sent to your manager", iThrive says the same, and Pulse hides any cut
   under five people. A manager screen that quietly breaks that promise makes
   every one of those lines a lie, and the first employee who notices stops
   answering honestly. So individual feeling is gone. What a manager sees now
   is what the person can see too: when we last spoke, whether anyone has
   recognised them, what their workload actually looks like, and their own
   learning. A flag here is built from those facts and says which ones.

   THE OTHER. It was one long column with no sense of "today". It is three
   views now — this week, your team, and (finally, the thing spec 049 owed)
   the team's own pulse results, scoped to the people you actually manage. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, CalendarClock, Check, HeartHandshake, Lock, MessageSquare, TriangleAlert, Users,
} from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import { coachingNudges, managerActions, reports, team, type Report } from "@/lib/manager";
import { favourable, resultFor, teamScore, topicLabel, type Topic } from "@/lib/pulse";
import { teamMoods } from "@/lib/sentiment";
import { usePersistentState } from "@/lib/usePersistentState";
import { useViewAs } from "../useViewAs";
import { useMe } from "../useSession";
import { toast } from "../Toaster";
import { Drawer } from "../Drawer";

type View = "week" | "team" | "results";
const VIEWS: { id: View; label: string }[] = [
  { id: "week", label: "This week" }, { id: "team", label: "Your team" }, { id: "results", label: "Team results" },
];

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const TONE = { urgent: "var(--danger)", warn: "var(--warning)", normal: "var(--purple)" } as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children, labelledBy }: { className?: string; children: React.ReactNode; labelledBy?: string }) {
  return <section aria-labelledby={labelledBy} className={`rounded-[24px] border border-line bg-card p-5 sm:p-7 ${className}`}>{children}</section>;
}

/* What a manager may act on, built only from things the person can see too. */
function watchFor(r: Report): string[] {
  const out: string[] = [];
  if (r.overdue || /week/.test(r.lastOneOnOne)) out.push(`No 1:1 in ${r.lastOneOnOne.replace(" ago", "")}`);
  if (r.recognition30d === 0) out.push("No recognition in 30 days");
  return out;
}

export function ManagerHub() {
  const [role] = useViewAs();
  const me = useMe();
  const [view, setView] = React.useState<View>("week");
  const [done, setDone] = usePersistentState<string[]>("vadal:mgr-actions-done", []);
  const [open, setOpen] = React.useState<Report | null>(null);

  const open_ = managerActions.filter((a) => !done.includes(a.id));
  const myTeam = me.team ?? team.name;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Operations</Eyebrow>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Your team</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            <span><span className="font-semibold text-ink">{reports.length}</span> people</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{open_.length}</span> {open_.length === 1 ? "thing needs" : "things need"} you this week</span>
            <span aria-hidden className="text-faint">·</span>
            <span>{myTeam}</span>
          </p>
        </div>
        <Button variant="secondary" className="min-h-[44px] lg:min-h-0" leadingIcon={<SparkMark size={14} tone="solid" />}
          onClick={() => ask("What should I do for my team this week?")}>Ask Nudge about your team</Button>
      </header>

      <nav aria-label="Manager views" className="flex items-center gap-1 border-b border-line">
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

      {view === "week" && <Week done={done} setDone={setDone} onOpen={setOpen} />}
      {view === "team" && <Team onOpen={setOpen} />}
      {view === "results" && <Results team={myTeam} canSeePulse={canAccess(role, "Pulse") || role === "manager"} canOpenPulse={canAccess(role, "Pulse")} />}

      <PrepDrawer r={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/* ── this week ───────────────────────────────────────────────────── */
function Week({ done, setDone, onOpen }: {
  done: string[]; setDone: (f: (d: string[]) => string[]) => void; onOpen: (r: Report) => void;
}) {
  const open = managerActions.filter((a) => !done.includes(a.id));
  const finish = (id: string, label: string) => { setDone((d) => [...d, id]); toast(label); };

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden" labelledBy="brief-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <h2 id="brief-h" className="sr-only">Nudge&rsquo;s read</h2>
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-r lg:border-line lg:pr-8">
            <div>
              <p className="text-[14px] text-muted">1:1s on time</p>
              <div className="mt-1 text-[40px] font-bold leading-none tracking-[-0.03em] tabular-nums">{team.oneOnOneCompletion}%</div>
              <p className="mt-1.5 text-[13px] text-faint">across your team this quarter</p>
            </div>
            <div>
              <p className="text-[14px] text-muted">Recognised in 30 days</p>
              <div className="mt-1 text-[28px] font-bold leading-none tracking-tight tabular-nums">{team.recognitionCoverage}%</div>
              <p className="mt-1.5 text-[13px] text-faint">company is at {team.orgHealth - 21}%</p>
            </div>
          </div>
          <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
            <span>{coachingNudges[1]}</span>
          </p>
        </div>
      </Card>

      <section aria-labelledby="needs-h">
        <h2 id="needs-h" className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
          Needs you
          <span className="rounded-full bg-soft px-1.5 py-px text-[11px] tracking-normal tabular-nums text-muted">{open.length}</span>
        </h2>
        {open.length === 0 ? (
          <div className="mt-3 rounded-[24px] border border-dashed border-line px-6 py-12 text-center">
            <p className="text-[17px] font-semibold text-ink">Nothing outstanding</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[15px] leading-relaxed text-faint">Your 1:1s are current and everyone has been recognised this month. Nudge will put something here when that changes.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-[24px] border border-line bg-card">
            {open.map((a) => {
              const r = reports.find((x) => x.id === a.reportId);
              const c = TONE[a.tone];
              return (
                <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: soft(c, 12), color: c }}>
                    {a.kind === "recognition" ? <HeartHandshake className="h-[18px] w-[18px]" />
                      : a.kind === "survey" ? <MessageSquare className="h-[18px] w-[18px]" />
                      : <CalendarClock className="h-[18px] w-[18px]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: c }}>{a.due}</p>
                    <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{a.title}</p>
                    <p className="mt-0.5 text-[14px] leading-snug text-muted">{a.context}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[54px] sm:pl-0">
                    {r && <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => onOpen(r)}>Prep</Button>}
                    <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Check className="h-3.5 w-3.5" />}
                      onClick={() => finish(a.id, "Marked done")}>Done</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── your team ───────────────────────────────────────────────────── */
function Team({ onOpen }: { onOpen: (r: Report) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <Card labelledBy="ros-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[620px]">
            <h2 id="ros-h" className="text-[18px] font-bold tracking-tight">Your people</h2>
            <p className="mt-0.5 text-[14px] leading-relaxed text-muted">
              When you last spoke, whether anyone has recognised them, and what their week looks like. Everything here is something they can see too.
            </p>
          </div>
        </div>

        <ul className="mt-5 flex flex-col divide-y divide-[var(--line)]">
          {reports.map((r) => {
            const watch = watchFor(r);
            return (
              <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
                <Avatar src={r.img} name={r.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug text-ink">{r.name}</p>
                  <p className="mt-0.5 text-[14px] text-muted">{r.role} · {r.tenure}</p>
                  {watch.length > 0 && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] font-semibold" style={{ color: "var(--warning)" }}>
                      <TriangleAlert className="h-3.5 w-3.5" />{watch.join(" · ")}
                    </p>
                  )}
                </div>
                <dl className="grid shrink-0 grid-cols-3 gap-4 text-center sm:w-[300px]">
                  <div>
                    <dt className="text-[12px] text-faint">Last 1:1</dt>
                    <dd className={`mt-0.5 text-[14px] font-semibold ${r.overdue ? "text-[var(--danger)]" : "text-ink"}`}>{r.lastOneOnOne}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-faint">Next</dt>
                    <dd className="mt-0.5 text-[14px] font-semibold text-ink">{r.nextOneOnOne}</dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-faint">Kudos · 30d</dt>
                    <dd className={`mt-0.5 text-[14px] font-semibold tabular-nums ${r.recognition30d === 0 ? "text-[var(--warning)]" : "text-ink"}`}>{r.recognition30d}</dd>
                  </div>
                </dl>
                <Button variant="secondary" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => onOpen(r)}>Prep a 1:1</Button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-relaxed text-faint">
          <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" />
          You are not shown anyone&rsquo;s check-ins, survey answers or what they wrote in a comment — not as a score, not as a trend. That is the promise the product makes them, and it is the reason they answer honestly.
        </p>
      </Card>
    </div>
  );
}

/* ── team results — the manager's own cut of Pulse ───────────────── */
function Results({ team: myTeam, canSeePulse, canOpenPulse }: { team: string; canSeePulse: boolean; canOpenPulse: boolean }) {
  const r = resultFor("q3");
  const mood = teamMoods.find((t) => t.team === myTeam);
  const n = r?.teams?.find((t) => t.team === myTeam)?.n ?? 0;

  if (!r || !canSeePulse) {
    return <Card><p className="text-[15px] text-muted">Results are shared with people leaders once a round closes.</p></Card>;
  }
  if (n < 5) {
    return (
      <Card>
        <h2 className="text-[18px] font-bold tracking-tight">Hidden to protect anonymity</h2>
        <p className="mt-1.5 max-w-lg text-[15px] leading-relaxed text-muted">
          {n} of your team answered. Below five, showing the result would point at someone — so it stays hidden, including from you.
        </p>
      </Card>
    );
  }

  const rows = r.questions.filter((q) => q.topic !== "outcome").map((q) => {
    const company = favourable(q.spread);
    const mine = teamScore(r, myTeam, q.topic) ?? company;
    return { topic: q.topic as Topic, text: q.text, mine, company, gap: mine - company };
  }).sort((a, b) => a.mine - b.mine);

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden" labelledBy="res-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="lg:border-r lg:border-line lg:pr-8">
            <p className="text-[14px] text-muted">Your team&rsquo;s mood</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{mood?.net ?? "—"}</span>
              {mood && <span className="text-[14px] font-semibold" style={{ color: mood.change < 0 ? "var(--danger)" : "var(--success)" }}>{mood.change > 0 ? "+" : ""}{mood.change} this month</span>}
            </div>
            <p className="mt-1.5 text-[13px] text-faint">Company is at 52 · {n} of your team answered</p>
          </div>
          <div className="min-w-0">
            <h2 id="res-h" className="text-[18px] font-bold tracking-tight">Q3 Engagement Pulse — {myTeam}</h2>
            <p className="mt-2 flex items-start gap-2.5 text-[15px] leading-relaxed text-ink">
              <SparkMark size={15} tone="gradient" className="mt-[4px] shrink-0" />
              <span>
                {rows[0] ? (
                  <>
                    Your weakest answer is <span className="font-semibold">{topicLabel(rows[0].topic).toLowerCase()}</span>, at {rows[0].mine}%
                    {rows[0].gap < 0
                      ? <> — {Math.abs(rows[0].gap)} below the company.</>
                      : rows[0].gap > 0
                        ? <>, though that is still {rows[0].gap} above the company.</>
                        : <>, level with the company.</>}{" "}
                    Nobody can see who said what.
                  </>
                ) : "Not enough answers to read yet."}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {canOpenPulse && (
                <Link href="/product/pulse"><Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" trailingIcon={<ArrowRight className="h-4 w-4" />}>Open Pulse</Button></Link>
              )}
              <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => toast("Draft shared with your team in Social — yours to edit before it posts")}>Share this with the team</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card labelledBy="q-h">
        <h2 id="q-h" className="text-[18px] font-bold tracking-tight">Your team, against the company</h2>
        <p className="mt-0.5 text-[14px] text-muted">Favourable answers, weakest first. The line marks the company.</p>
        <ul className="mt-5 flex flex-col gap-4">
          {rows.map((q) => (
            <li key={q.topic}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[15px] font-semibold text-ink">{topicLabel(q.topic)}</span>
                <span className="text-[14px] tabular-nums text-muted">
                  <span className="font-semibold text-ink">{q.mine}%</span> · {q.gap === 0 ? "level with" : `${Math.abs(q.gap)} ${q.gap > 0 ? "above" : "below"}`} the company
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 w-full rounded-full bg-soft">
                <div className="h-full rounded-full" style={{ width: `${q.mine}%`, background: q.gap <= -5 ? "var(--viz-2)" : "var(--viz-1)" }} />
                <span aria-hidden className="absolute -inset-y-1 w-[2px] rounded-full bg-ink/60" style={{ left: `${q.company}%` }} />
              </div>
              <p className="mt-1 text-[13px] text-faint">&ldquo;{q.text}&rdquo;</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-snug text-faint">
          <Users className="mt-[2px] h-3.5 w-3.5 shrink-0" />
          Your team&rsquo;s answers only, never an individual&rsquo;s. Teams under five answers are not shown at all.
        </p>
      </Card>
    </div>
  );
}

/* ── 1:1 prep ────────────────────────────────────────────────────── */
function PrepDrawer({ r, onClose }: { r: Report | null; onClose: () => void }) {
  return (
    <Drawer open={!!r} title={r ? `1:1 with ${r.name}` : undefined} onClose={onClose} footer={r ? (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => { toast("Kudos drafted — review it in Kudos"); onClose(); }}>Recognise them</Button>
        <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => { toast("1:1 put in both calendars for Thursday"); onClose(); }}>Book the 1:1</Button>
      </div>
    ) : undefined}>
      {r && (
        <>
          <div className="flex items-center gap-3 pr-12">
            <Avatar src={r.img} name={r.name} size="md" />
            <div>
              <h2 className="text-[20px] font-bold leading-tight tracking-tight">{r.name}</h2>
              <p className="text-[14px] text-muted">{r.role} · {r.tenure}</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            {[["Last 1:1", r.lastOneOnOne], ["Next", r.nextOneOnOne], ["Kudos · 30 days", String(r.recognition30d)], ["With you", r.tenure]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line p-3">
                <dt className="text-[13px] text-faint">{k}</dt>
                <dd className="mt-0.5 text-[16px] font-bold">{v}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-6 flex items-center gap-2 text-[14px] font-bold"><SparkMark size={14} tone="gradient" /> What to open with</h3>
          <ul className="mt-2 flex flex-col gap-2.5">
            {r.aiPrep.map((p) => (
              <li key={p} className="rounded-2xl bg-soft p-4 text-[15px] leading-relaxed text-ink">{p}</li>
            ))}
          </ul>

          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-line p-4 text-[13px] leading-relaxed text-faint">
            <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" />
            Drafted from things you can both see — 1:1 history, recognition, and what they shipped. Never from their check-ins or survey answers.
          </p>
        </>
      )}
    </Drawer>
  );
}
