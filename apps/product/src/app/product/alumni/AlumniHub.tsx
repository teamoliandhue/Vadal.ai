"use client";
/* Alumni — what happens after the exit interview (Operations · People only).

   Three questions, in order:
   · what are we losing people to — exit themes from the exit programme, and
     how many leavers said something could have changed their mind;
   · who would come back — leavers, their answer, and a rehire decision that
     People makes by hand. It is never inferred from exit answers: someone who
     named their manager as the reason is not a worse rehire for saying so;
   · what the network is worth — boomerang hires and referrals.

   Only leavers who chose to join the network can be sent roles. The others can
   be invited once; there is no second nudge. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Avatar, Badge, SparkMark, type BadgeTone } from "@vadal/design-system";
import { BarList, ViewToggle } from "@/components/viz";
import { ALUMNI_STATS, BOOMERANGS, EXIT_THEMES, LEAVERS, type Leaver, type Rehire } from "@/lib/lifecycle";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";

const RETURN_TONE: Record<Leaver["wouldReturn"], BadgeTone> = { Yes: "success", Maybe: "info", No: "neutral", "Not answered": "neutral" };
const REHIRE: Rehire[] = ["Eligible", "Talk to People first", "Not eligible"];

export function AlumniHub() {
  const [rehire, setRehire] = usePersistentState<Record<string, Rehire>>("vadal:alumni-rehire", {});
  const [invited, setInvited] = usePersistentState<string[]>("vadal:alumni-invited", []);
  const [shared, setShared] = usePersistentState<string[]>("vadal:alumni-shared", []);
  const [filter, setFilter] = React.useState<"all" | "return">("all");
  const [table, setTable] = React.useState(false);

  const leavers = LEAVERS.map((l) => ({ ...l, rehire: rehire[l.id] ?? l.rehire }))
    .filter((l) => filter === "all" || l.wouldReturn === "Yes" || l.wouldReturn === "Maybe");
  const top = EXIT_THEMES[0];

  const tiles: [string, string, string][] = [
    ["Alumni network", ALUMNI_STATS.network.toLocaleString("en-US"), `${ALUMNI_STATS.activeLast90}% active in the last 90 days`],
    ["Would come back", `${ALUMNI_STATS.wouldReturnPct}%`, "said yes or maybe when they left"],
    ["Boomerang hires", `${ALUMNI_STATS.boomerangsThisYear}`, "rejoined this year"],
    ["Hires from alumni referrals", `${ALUMNI_STATS.referralHires}`, `from ${ALUMNI_STATS.referrals} referrals this year`],
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Operations</p>
        <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Alumni</h1>
        <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-muted">
          What people leave for, who would come back, and what staying in touch is worth.
        </p>
        <p className="mt-3 flex items-start gap-2 text-[13px] text-faint">
          <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" /> Individual exit answers are visible to the People team only. Managers see themes, never a person&rsquo;s reason.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="themes-h">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="themes-h" className="text-[18px] font-bold tracking-tight">Why people left</h2>
              <p className="mt-1 text-[13px] text-faint">Main reason · {ALUMNI_STATS.answered} exit interviews, last 12 months</p>
            </div>
            <ViewToggle table={table} onChange={setTable} label="Why people left" />
          </div>
          <div className="mt-4">
            {!table ? (
              <BarList rows={EXIT_THEMES} caption="Main reason for leaving, number of leavers" />
            ) : (
              <table className="w-full text-[13px]">
                <caption className="sr-only">Main reason for leaving</caption>
                <thead><tr className="text-left text-faint"><th className="pb-2 font-medium">Reason</th><th className="pb-2 text-right font-medium">Leavers</th><th className="pb-2 text-right font-medium">Share</th></tr></thead>
                <tbody>
                  {EXIT_THEMES.map((t) => (
                    <tr key={t.label} className="border-t border-line"><td className="py-2 text-ink">{t.label}</td><td className="py-2 text-right tabular-nums">{t.value}</td><td className="py-2 text-right tabular-nums">{Math.round((t.value / ALUMNI_STATS.answered) * 100)}%</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-5 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-4">
            <p className="flex items-start gap-2 text-[14px] leading-relaxed text-ink">
              <SparkMark size={14} tone="gradient" className="mt-[3px] shrink-0" />
              <span>
                {ALUMNI_STATS.preventablePct}% said something could have changed their mind. {top.label} leads at {Math.round((top.value / ALUMNI_STATS.answered) * 100)}%{top.note ? `, ${top.note}` : ""}. Stay interviews on those teams ask about it while there is still time to act.
              </span>
            </p>
            <Link href="/product/pulse" className="mt-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-1 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
              Stay interviews in Pulse <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="boom-h">
          <h2 id="boom-h" className="text-[18px] font-bold tracking-tight">Came back</h2>
          <p className="mt-1 text-[13px] text-faint">Boomerang hires this year — the three most recent</p>
          <ul className="mt-4 flex flex-col gap-4">
            {BOOMERANGS.map((b) => (
              <li key={b.name} className="flex items-start gap-3">
                <Avatar src={b.img} name={b.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{b.name}</p>
                  <p className="text-[12px] text-faint">{b.role} · away {b.away} · back {b.back}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{b.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="leavers-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="leavers-h" className="text-[18px] font-bold tracking-tight">Recent leavers</h2>
            <p className="mt-1 max-w-[620px] text-[13px] text-faint">Rehire is People&rsquo;s call, made by hand. It is never worked out from what someone said on the way out.</p>
          </div>
          <div className="flex rounded-full bg-soft p-1" role="group" aria-label="Filter leavers">
            {([["all", "Everyone"], ["return", "Would come back"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={`min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[32px] ${filter === k ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>
        </div>

        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {leavers.map((l) => {
            const canShare = l.inNetwork && l.rehire === "Eligible" && (l.wouldReturn === "Yes" || l.wouldReturn === "Maybe");
            return (
              <li key={l.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar src={l.img} name={l.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">{l.name}</p>
                    <p className="truncate text-[13px] text-faint">{l.title} · {l.team} · {l.tenure} · left {l.left}</p>
                  </div>
                </div>
                <div className="min-w-0 text-[13px]">
                  <p className="text-ink">Left for: {l.reason.charAt(0).toLowerCase() + l.reason.slice(1)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge tone={RETURN_TONE[l.wouldReturn]} size="sm">Would return: {l.wouldReturn}</Badge>
                    {l.inNetwork ? <Badge tone="brand" size="sm">In the network</Badge> : null}
                    {l.referrals > 0 && <span className="text-[12px] text-faint">{l.referrals} referral{l.referrals === 1 ? "" : "s"}</span>}
                  </div>
                </div>
                <label className="flex min-w-0 flex-col gap-1 text-[12px] text-faint">
                  Rehire
                  <select
                    value={l.rehire}
                    onChange={(e) => { setRehire((r) => ({ ...r, [l.id]: e.target.value as Rehire })); toast(`${l.name.split(" ")[0]}: ${e.target.value.toLowerCase()}`); }}
                    className="min-h-[44px] rounded-xl border border-line bg-card px-2.5 text-[13px] text-ink lg:min-h-[34px]"
                  >
                    {REHIRE.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </label>
                <div className="flex flex-wrap gap-1 md:justify-end">
                  {l.inNetwork ? (
                    <button
                      disabled={!canShare || shared.includes(l.id)}
                      onClick={() => { setShared((s) => [...s, l.id]); toast(`Roles on ${l.team} will show in ${l.name.split(" ")[0]}'s alumni digest`); }}
                      title={canShare ? undefined : "Only for eligible alumni who said yes or maybe"}
                      className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-[var(--purple)] hover:bg-soft disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent lg:min-h-[34px]"
                    >
                      {shared.includes(l.id) ? "Roles shared" : "Share open roles"}
                    </button>
                  ) : (
                    <button
                      disabled={invited.includes(l.id)}
                      onClick={() => { setInvited((s) => [...s, l.id]); toast(`${l.name.split(" ")[0]} is invited once — there's no reminder`); }}
                      className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-muted hover:bg-soft hover:text-ink disabled:cursor-default disabled:text-faint disabled:hover:bg-transparent lg:min-h-[34px]"
                    >
                      {invited.includes(l.id) ? "Invited" : "Invite to the network"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
