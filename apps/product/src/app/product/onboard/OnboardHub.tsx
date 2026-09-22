"use client";
/* Onboard — the joiners in their first 90 days, for managers and People.

   The question this answers is "who is having a bad start, while it can still
   be fixed". So the page leads with the people who need a hand and why, then
   the whole cohort. A manager sees their own team's joiners (scopeFor →
   own-team) and a summary of the day 7 check-in, never the joiner's words —
   the onboarding programme promises that. People sees everyone and the detail.

   Buddy matching is the strongest onboarding driver we have, so a joiner
   without one is the first thing Nudge raises and the one thing it can fix
   from here: it suggests someone on the same team who has been there a year. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Eye, MessageCircle, TriangleAlert, UserRoundPlus, Zap } from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { JOINERS, JOURNEY, OWNER_LABEL, SETTLED_LABEL, phaseFor, type Joiner, type Owner } from "@/lib/lifecycle";
import { PROGRAMMES } from "@/lib/programmes";
import { READY_LABEL, adminItems, adminStats, preStarters, type AdminState, type PreStarter } from "@/lib/onboard";
import { usePersistentState } from "@/lib/usePersistentState";
import { ScopeNotice } from "../ScopeNotice";
import { toast } from "../Toaster";
import { useScope } from "../useViewAs";

/** Someone on the same team who has been there long enough to be a good buddy. */
const BUDDY_POOL: Record<string, string> = {
  Support: "Divya Rao · 3 yrs on Support",
  "Plant Ops": "Ravi Prasad · 4 yrs on Plant Ops",
  Design: "Neha Rao · 2 yrs on Design",
  Engineering: "Aarav Sharma · 2 yrs on Engineering",
  "Night shift": "Manoj Patil · 5 yrs on Night shift",
  Logistics: "Ritu Das · 3 yrs on Logistics",
};

const onTrack = (j: Joiner) => j.done / Math.max(1, j.dueByNow) >= 0.8;

/** Day 7 average with and without a buddy, across everyone who has answered. */
const avg = (xs: Joiner[]) => xs.reduce((s, j) => s + (j.settled ?? 0), 0) / Math.max(1, xs.length);
const answeredAll = JOINERS.filter((j) => j.settled !== null);
const BUDDY_GAP = avg(answeredAll.filter((j) => j.buddy)) - avg(answeredAll.filter((j) => !j.buddy));

type View = "soon" | "cohort" | "admin";
const VIEWS: { id: View; label: string }[] = [
  { id: "soon", label: "Starting soon" }, { id: "cohort", label: "First 90 days" }, { id: "admin", label: "Admin" },
];

export function OnboardHub() {
  const [view, setView] = React.useState<View>("soon");
  const { scope, team, role, ready } = useScope("Onboard");
  const [buddies, setBuddies] = usePersistentState<Record<string, string>>("vadal:onboard-buddies", {});
  if (!ready) return <div className="mx-auto w-full max-w-[1120px] py-10" aria-busy="true" />;

  const people = role === "admin" || role === "superadmin";
  const cohort = JOINERS
    .filter((j) => scope !== "own-team" || j.team === team)
    .map((j) => ({ ...j, buddy: j.buddy ?? (buddies[j.id] ? buddies[j.id].split(" · ")[0] : null), flags: buddies[j.id] ? j.flags.filter((f) => f !== "No buddy") : j.flags }))
    .sort((a, b) => a.day - b.day);
  const needHand = cohort.filter((j) => j.flags.length > 0 || (j.settled !== null && j.settled <= 2) || !onTrack(j));
  const answered = cohort.filter((j) => j.settled !== null);
  const settledAvg = answered.length ? answered.reduce((s, j) => s + (j.settled ?? 0), 0) / answered.length : null;
  const noBuddy = cohort.filter((j) => !j.buddy);
  const programme = PROGRAMMES.find((p) => p.id === "onboarding")!;

  const matchBuddies = () => {
    setBuddies((b) => ({ ...b, ...Object.fromEntries(noBuddy.map((j) => [j.id, BUDDY_POOL[j.team] ?? "A teammate · 1 yr+"])) }));
    toast(`Suggested ${noBuddy.length === 1 ? "a buddy" : `${noBuddy.length} buddies`} — each manager confirms before anyone is told`);
  };

  const tiles: [string, string, string][] = [
    ["In their first 90 days", `${cohort.length}`, scope === "own-team" ? `on ${team}` : "across the company"],
    ["On track", `${cohort.filter(onTrack).length}`, "8 in 10 due items done, or better"],
    ["Settled at day 7", settledAvg === null ? "—" : `${settledAvg.toFixed(1)} / 5`, `${answered.length} of ${cohort.length} have answered`],
    ["Could use a hand", `${needHand.length}`, "a flag, a low check-in, or behind"],
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Talent intelligence</p>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Onboard</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            <span><span className="font-semibold text-ink">{preStarters.length}</span> starting soon</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{cohort.length}</span> in their first 90 days</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{adminStats.readyDayOne}%</span> ready on day one</span>
          </p>
        </div>
      </header>

      <nav aria-label="Onboard views" className="flex items-center gap-1 border-b border-line">
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

      {view === "soon" && <StartingSoon />}
      {view === "admin" && <Admin />}

      {view === "cohort" && <>
      {scope === "own-team" && team && <ScopeNotice team={team} what="onboarding progress" />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      {cohort.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
          <p className="text-[16px] font-semibold text-ink">No one on your team is in their first 90 days</p>
          <p className="max-w-[380px] text-[14px] text-faint">When someone joins, their journey appears here the week before they start.</p>
        </div>
      ) : (
        <>
          {needHand.length > 0 && (
            <section className="rounded-[26px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-6 sm:p-7" aria-labelledby="hand-h">
              <h2 id="hand-h" className="flex items-center gap-2 text-[18px] font-bold tracking-tight">
                <SparkMark size={18} tone="gradient" state="idle" /> Worth a look this week
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {needHand.map((j) => (
                  <li key={j.id} className="flex items-start gap-3 rounded-2xl bg-card p-4">
                    <Avatar src={j.img} name={j.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink">{j.name} <span className="font-normal text-faint">· {j.team} · day {j.day}</span></p>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-muted">{why(j, people)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {noBuddy.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<UserRoundPlus className="h-4 w-4" />} onClick={matchBuddies}>
                    Suggest {noBuddy.length === 1 ? "a buddy" : `${noBuddy.length} buddies`}
                  </Button>
                  <p className="text-[13px] text-muted">Someone on the same team, a year or more in. {BUDDY_GAP >= 0.5 ? `Joiners with a buddy answer day 7 ${+BUDDY_GAP.toFixed(1)} points higher here.` : ""}</p>
                </div>
              )}
            </section>
          )}

          <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="cohort-h">
            <h2 id="cohort-h" className="text-[18px] font-bold tracking-tight">Joiners</h2>
            <ul className="mt-3 flex flex-col divide-y divide-[var(--line)]">
              {cohort.map((j) => (
                <li key={j.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={j.img} name={j.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-ink">{j.name}</p>
                      <p className="truncate text-[13px] text-faint">{j.title} · {j.team}</p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-ink">Day {j.day} · {phaseFor(j.day).label}</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-soft" role="img" aria-label={`${j.done} of ${j.dueByNow} due items done`}>
                      <div className="h-full rounded-full" style={{ width: `${(j.done / Math.max(1, j.dueByNow)) * 100}%`, background: onTrack(j) ? "var(--success)" : "var(--warning)" }} />
                    </div>
                    <p className="mt-1 text-[12px] text-faint">{j.done} of {j.dueByNow} due items · buddy {j.buddy ?? "not matched"}</p>
                  </div>
                  <div className="min-w-0 text-[13px]">
                    <p className="text-ink">{j.settled === null ? <span className="text-faint">{j.day < 7 ? "Day 7 check-in opens soon" : "Day 7 not answered yet"}</span> : <>Day 7: {SETTLED_LABEL[j.settled]}</>}</p>
                    {j.flags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {j.flags.map((f) => <Badge key={f} tone="warning" size="sm">{people || !f.startsWith("Day 7:") ? f : "Day 7: asked for support"}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 md:justify-end">
                    {j.preview && (
                      <Link href={j.preview} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[var(--purple)] hover:bg-soft lg:min-h-[34px]">
                        <Eye className="h-4 w-4" /> Their view
                      </Link>
                    )}
                    <button onClick={() => toast(`${j.name.split(" ")[0]} will see a note from you on their journey`)} className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-muted hover:bg-soft hover:text-ink lg:min-h-[34px]">
                      Check in
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      </>}

      {people && view === "cohort" && (
        <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="template-h">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="template-h" className="text-[18px] font-bold tracking-tight">The journey every joiner gets</h2>
              <p className="mt-1 max-w-[620px] text-[14px] text-muted">Seventeen items over four stretches, each with an owner. The check-ins on day 7, 30 and 90 come from the {programme.name.toLowerCase()} programme — {programme.stats.responseRate}% answer, and the top theme last quarter was &ldquo;{programme.stats.topTheme.toLowerCase()}&rdquo;.</p>
            </div>
            <Link href="/product/pulse" className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-1 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
              Check-ins in Pulse <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((p) => {
              const owners = p.items.reduce<Partial<Record<Owner, number>>>((m, i) => ({ ...m, [i.owner]: (m[i.owner] ?? 0) + 1 }), {});
              return (
                <div key={p.id} className="rounded-2xl bg-soft p-4">
                  <p className="text-[14px] font-semibold text-ink">{p.label}</p>
                  <p className="text-[12px] text-faint">{p.from <= 0 ? "The week before" : `Days ${p.from}–${p.to}`} · {p.items.length} items</p>
                  <ul className="mt-2 space-y-1 text-[13px] text-muted">
                    {Object.entries(owners).map(([o, n]) => <li key={o}>{o === "you" ? "The joiner" : OWNER_LABEL[o as Owner].replace(/^Your (\w)/, (_, c: string) => c.toUpperCase())} · {n}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/** One sentence on why this joiner is on the list. A manager gets the summary, People the detail. */
function why(j: Joiner, people: boolean): string {
  const parts: string[] = [];
  if (j.settled !== null && j.settled <= 2) parts.push(`answered “${SETTLED_LABEL[j.settled].toLowerCase()}” at day 7`);
  if (!j.buddy) parts.push("has no buddy yet");
  if (!onTrack(j)) parts.push(`has ${j.dueByNow - j.done} due items still open`);
  for (const f of j.flags) {
    if (f === "No buddy") continue;
    if (f.startsWith("Day 7:")) { if (people) parts.push(f.replace("Day 7: missing ", "said what's missing is ")); continue; }
    parts.push(f.charAt(0).toLowerCase() + f.slice(1));
  }
  const s = parts.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}


/* ── before day one ──────────────────────────────────────────────── */
function StartingSoon() {
  const missing = (p: PreStarter) => p.needs.filter((k) => !p.ready[k]);
  const notReady = preStarters.filter((p) => missing(p).length > 0 || p.outstanding.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[24px] border border-line bg-card p-5 sm:p-7" aria-labelledby="soon-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex gap-8 lg:flex-col lg:gap-5 lg:border-r lg:border-line lg:pr-8">
            <div>
              <p className="text-[14px] text-muted">Ready on day one</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{adminStats.readyDayOne}%</span>
                <span className="text-[14px] font-semibold text-[var(--success)]">+{adminStats.readyDelta}</span>
              </div>
              <p className="mt-1.5 text-[13px] text-faint">last quarter, everything in place before they arrived</p>
            </div>
            <div>
              <p className="text-[14px] text-muted">Offer to full access</p>
              <div className="mt-1 text-[28px] font-bold leading-none tracking-tight tabular-nums">{adminStats.toAccessDays}d</div>
              <p className="mt-1.5 text-[13px] text-faint">median, from signature</p>
            </div>
          </div>
          <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink" id="soon-h">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
            <span>
              The fortnight between signing and starting is the part nobody owns, and it is where onboarding usually goes wrong.
              {notReady.length > 0 ? <> {notReady.length} of {preStarters.length} joiners still have something outstanding.</> : " Everyone starting soon is ready."}
            </span>
          </p>
        </div>
      </section>

      <section aria-labelledby="pre-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
        <h2 id="pre-h" className="text-[18px] font-bold tracking-tight">Starting soon</h2>
        <p className="mt-0.5 text-[14px] text-muted">They have no company account yet, so everything reaches them on a channel they already use.</p>
        <ul className="mt-5 flex flex-col divide-y divide-[var(--line)]">
          {preStarters.map((p) => {
            const gaps = missing(p);
            return (
              <li key={p.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar src={p.img} name={p.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">{p.name}</p>
                    <p className="truncate text-[13px] text-faint">{p.title} · {p.team} · starts {p.starts}</p>
                  </div>
                </div>

                <div className="min-w-0 lg:w-[320px]">
                  <ul className="flex flex-wrap gap-1.5">
                    {p.needs.map((k) => (
                      <li key={k} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold"
                        style={{ background: p.ready[k] ? "color-mix(in srgb, var(--success) 12%, transparent)" : "var(--soft)", color: p.ready[k] ? "var(--success)" : "var(--muted)" }}>
                        {p.ready[k] ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{READY_LABEL[k]}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[13px] text-faint">
                    In {p.inDays} days · {p.channel}
                    {p.packOpened ? " · opened the welcome pack" : " · has not opened the welcome pack"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:w-[210px] lg:justify-end">
                  {p.outstanding.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--warning)" }}>
                      <TriangleAlert className="h-3.5 w-3.5" />{p.outstanding.join(", ")}
                    </span>
                  )}
                  <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<MessageCircle className="h-4 w-4" />}
                    onClick={() => toast(`Message drafted to ${p.name.split(" ")[0]} on ${p.channel} — yours to send`)}>
                    {gaps.length > 0 || p.outstanding.length > 0 ? "Nudge them" : "Say hello"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[13px] leading-snug text-faint">
          Nothing here is sent to a manager as a report card. It exists so somebody notices before the person&rsquo;s first morning.
        </p>
      </section>
    </div>
  );
}

/* ── the admin ───────────────────────────────────────────────────── */
const STATE_STYLE: Record<AdminState, { color: string; Icon: typeof CheckCircle2 }> = {
  Done: { color: "var(--success)", Icon: CheckCircle2 },
  Automatic: { color: "var(--purple)", Icon: Zap },
  Waiting: { color: "var(--muted)", Icon: Clock3 },
  Late: { color: "var(--danger)", Icon: TriangleAlert },
};

function Admin() {
  const auto = adminItems.filter((a) => a.state === "Automatic").length;
  const waitingOnThem = adminItems.filter((a) => a.owner === "The joiner" && a.state !== "Done");
  const waitingOnUs = adminItems.filter((a) => a.owner !== "The joiner" && (a.state === "Waiting" || a.state === "Late"));

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[24px] border border-line bg-card p-5 sm:p-7" aria-labelledby="admin-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="lg:border-r lg:border-line lg:pr-8">
            <p className="text-[14px] text-muted">Handled without a person</p>
            <div className="mt-1 text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">{adminStats.automatic}%</div>
            <p className="mt-1.5 text-[13px] text-faint">of onboarding admin, last quarter</p>
          </div>
          <p className="flex items-start gap-2.5 text-[16px] leading-relaxed text-ink" id="admin-h">
            <SparkMark size={16} tone="gradient" className="mt-[4px] shrink-0" />
            <span>
              {auto} steps completed by themselves this week. What is left splits two ways, and they are different problems:
              <span className="font-semibold"> {waitingOnUs.length} waiting on us</span>, {waitingOnThem.length} waiting on the joiner.
            </span>
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminList title="Waiting on us" hint="Ours to finish before their first morning." items={waitingOnUs} />
        <AdminList title="Waiting on the joiner" hint="Asked at most twice, never after hours." items={waitingOnThem} />
      </div>

      <section aria-labelledby="all-h" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
        <h2 id="all-h" className="text-[18px] font-bold tracking-tight">Everything, and who owns it</h2>
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {adminItems.map((a) => {
            const st = STATE_STYLE[a.state];
            return (
              <li key={a.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-start sm:gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${st.color} 12%, transparent)`, color: st.color }}>
                  <st.Icon className="h-[17px] w-[17px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug text-ink">{a.what}</p>
                  <p className="mt-0.5 text-[13px] text-faint">{a.who} · {a.team} · {a.owner}</p>
                  <p className="mt-1 text-[14px] leading-snug text-muted">{a.note}</p>
                </div>
                <span className="shrink-0 text-[13px] font-semibold" style={{ color: st.color }}>{a.state}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function AdminList({ title, hint, items }: { title: string; hint: string; items: typeof adminItems }) {
  return (
    <section className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
      <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-[14px] text-muted">{hint}</p>
      {items.length === 0 ? (
        <p className="mt-5 text-[15px] text-faint">Nothing outstanding.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {items.map((a) => (
            <li key={a.id} className="py-3">
              <p className="text-[15px] font-semibold leading-snug text-ink">{a.what}</p>
              <p className="mt-0.5 text-[13px] text-faint">{a.who} · {a.owner}{a.state === "Late" ? " · late" : ""}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
