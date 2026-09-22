"use client";
/* Alumni — the four capabilities, on three views (Operations · People only).

   Alumni Network · Exit Documents · Boomerang Hiring · Employee Referrals.

   · NETWORK — what people leave for, who is still in touch, and a rehire
     decision People makes by hand. It is never inferred from exit answers:
     someone who named their manager as the reason is not a worse rehire for
     saying so. Only leavers who chose to join the network can be sent roles.
     The others can be invited once; there is no second nudge.
   · EXIT DOCUMENTS — the last thing we do for someone, and the place goodwill
     is lost. Every document says who owns it, whether it issued by itself, and
     whether it is late. Documents that do not apply are not counted against a
     person: gratuity needs five years.
   · COMING BACK — open roles matched to alumni who are eligible, in the network
     and said they would return, plus the referrals people made and what became
     of them. A referral nobody moved is why people stop referring, so the age
     of the silence is on the row. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Lock, Send, TriangleAlert, UserRoundPlus, Zap } from "lucide-react";
import { Avatar, Badge, SparkMark, type BadgeTone } from "@vadal/design-system";
import { BarList, ViewToggle } from "@/components/viz";
import { ALUMNI_STATS, BOOMERANGS, EXIT_THEMES, LEAVERS, type Leaver, type Rehire } from "@/lib/lifecycle";
import {
  DOC_LABEL, DOC_OWNER, STAGE_ORDER, docStats, exitPacks, matchesFor, openRoles, packDone,
  referralStats, referrals, settled,
  type DocKey, type DocState, type ExitDoc, type ExitPack, type Referral, type ReferralStage,
} from "@/lib/alumni";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";

const RETURN_TONE: Record<Leaver["wouldReturn"], BadgeTone> = { Yes: "success", Maybe: "info", No: "neutral", "Not answered": "neutral" };
const REHIRE: Rehire[] = ["Eligible", "Talk to People first", "Not eligible"];

const DOC_TONE: Record<DocState, BadgeTone> = { Issued: "success", Automatic: "brand", Waiting: "neutral", Late: "danger" };
const DOC_ICON: Record<DocState, typeof CheckCircle2> = { Issued: CheckCircle2, Automatic: Zap, Waiting: Clock3, Late: TriangleAlert };

const STAGE_TONE: Record<ReferralStage, BadgeTone> = {
  Applied: "neutral", "In interview": "info", Offer: "brand", Hired: "success", "Not this time": "neutral",
};

const first = (name: string) => name.split(" ")[0];
const leaverById = (id: string) => LEAVERS.find((l) => l.id === id);

type View = "network" | "docs" | "back";
const VIEWS: { id: View; label: string }[] = [
  { id: "network", label: "Network" }, { id: "docs", label: "Exit documents" }, { id: "back", label: "Coming back" },
];

export function AlumniHub() {
  const [view, setView] = React.useState<View>("network");
  const [rehire, setRehire] = usePersistentState<Record<string, Rehire>>("vadal:alumni-rehire", {});

  /* The rehire decision People made by hand wins over the seeded one, everywhere. */
  const leavers = React.useMemo(() => LEAVERS.map((l) => ({ ...l, rehire: rehire[l.id] ?? l.rehire })), [rehire]);

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Talent intelligence</p>
        <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Alumni</h1>
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
          <span><span className="font-semibold text-ink">{ALUMNI_STATS.network.toLocaleString("en-US")}</span> in the network</span>
          <span aria-hidden className="text-faint">·</span>
          <span><span className="font-semibold text-ink">{ALUMNI_STATS.wouldReturnPct}%</span> would come back</span>
          <span aria-hidden className="text-faint">·</span>
          <span><span className="font-semibold text-ink">{ALUMNI_STATS.boomerangsThisYear}</span> rejoined this year</span>
        </p>
        <p className="mt-3 flex items-start gap-2 text-[13px] text-faint">
          <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" /> Individual exit answers are visible to the People team only. Managers see themes, never a person&rsquo;s reason.
        </p>
      </header>

      <nav aria-label="Alumni views" className="flex items-center gap-1 border-b border-line">
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

      {view === "network" && <NetworkView leavers={leavers} setRehire={setRehire} />}
      {view === "docs" && <DocsView />}
      {view === "back" && <ComingBack leavers={leavers} />}
    </div>
  );
}

/* ── 1 · the network ──────────────────────────────────────────────── */
function NetworkView({ leavers, setRehire }: { leavers: Leaver[]; setRehire: (f: (r: Record<string, Rehire>) => Record<string, Rehire>) => void }) {
  const [invited, setInvited] = usePersistentState<string[]>("vadal:alumni-invited", []);
  const [shared, setShared] = usePersistentState<string[]>("vadal:alumni-shared", []);
  const [filter, setFilter] = React.useState<"all" | "return">("all");
  const [table, setTable] = React.useState(false);

  const rows = leavers.filter((l) => filter === "all" || l.wouldReturn === "Yes" || l.wouldReturn === "Maybe");
  const top = EXIT_THEMES[0];
  const inNetwork = leavers.filter((l) => l.inNetwork).length;

  const tiles: [string, string, string][] = [
    ["Alumni network", ALUMNI_STATS.network.toLocaleString("en-US"), `${ALUMNI_STATS.activeLast90}% active in the last 90 days`],
    ["Would come back", `${ALUMNI_STATS.wouldReturnPct}%`, "said yes or maybe when they left"],
    ["Boomerang hires", `${ALUMNI_STATS.boomerangsThisYear}`, "rejoined this year"],
    ["Hires from alumni referrals", `${ALUMNI_STATS.referralHires}`, `from ${ALUMNI_STATS.referrals} referrals this year`],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="card-lift relative flex flex-col overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="themes-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
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

        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="touch-h">
          <h2 id="touch-h" className="text-[18px] font-bold tracking-tight">Still in touch</h2>
          <p className="mt-1 text-[13px] text-faint">Of the {leavers.length} most recent leavers</p>
          <p className="mt-4 text-[34px] font-bold leading-none tabular-nums tracking-tight">{inNetwork}<span className="text-[18px] font-semibold text-faint"> of {leavers.length}</span></p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            chose to join the network on their way out. They get open roles and the quarterly note — nothing else, and they can leave in one tap.
          </p>
          <ul className="mt-5 flex flex-col gap-2.5 text-[13px] text-muted">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-[2px] h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden />Joining is a choice they make, not a default we set.</li>
            <li className="flex items-start gap-2"><Clock3 className="mt-[2px] h-4 w-4 shrink-0 text-faint" aria-hidden />Anyone who said no can be invited once. There is no second nudge.</li>
            <li className="flex items-start gap-2"><Lock className="mt-[2px] h-4 w-4 shrink-0 text-faint" aria-hidden />What they told us on the way out never travels with the invitation.</li>
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

        {rows.length === 0 ? (
          <Empty icon={UserRoundPlus} title="Nobody here" line="Nobody among the recent leavers said they would come back." />
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {rows.map((l) => {
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
                      onChange={(e) => { const v = e.target.value as Rehire; setRehire((r) => ({ ...r, [l.id]: v })); toast(`${first(l.name)}: ${v.toLowerCase()}`); }}
                      className="min-h-[44px] rounded-xl border border-line bg-card px-2.5 text-[13px] text-ink lg:min-h-[34px]"
                    >
                      {REHIRE.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-1 md:justify-end">
                    {l.inNetwork ? (
                      <button
                        disabled={!canShare || shared.includes(l.id)}
                        onClick={() => { setShared((s) => [...s, l.id]); toast(`Roles on ${l.team} will show in ${first(l.name)}'s alumni digest`); }}
                        title={canShare ? undefined : "Only for eligible alumni who said yes or maybe"}
                        className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-[var(--purple)] hover:bg-soft disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent lg:min-h-[34px]"
                      >
                        {shared.includes(l.id) ? "Roles shared" : "Share open roles"}
                      </button>
                    ) : (
                      <button
                        disabled={invited.includes(l.id)}
                        onClick={() => { setInvited((s) => [...s, l.id]); toast(`${first(l.name)} is invited once — there's no reminder`); }}
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
        )}
      </section>
    </div>
  );
}

/* ── 2 · exit documents ───────────────────────────────────────────── */
function DocsView() {
  const [released, setReleased] = usePersistentState<string[]>("vadal:alumni-docs-released", []);
  const [open, setOpen] = React.useState<string | null>(null);

  const packs: ExitPack[] = React.useMemo(
    () => exitPacks.map((p) => ({
      ...p,
      docs: p.docs.map((d) => released.includes(`${p.leaverId}:${d.key}`)
        ? { ...d, state: "Issued" as DocState, note: "Released from here. The leaver has been emailed the document." }
        : d),
    })),
    [released],
  );

  const late = packs.flatMap((p) => p.docs.filter((d) => d.state === "Late").map((d) => ({ pack: p, doc: d })));
  const complete = packs.filter(packDone).length;
  const openPack = packs.find((p) => p.leaverId === open) ?? null;

  const tiles: [string, string, string][] = [
    ["Packs complete", `${complete} of ${packs.length}`, "nothing outstanding, not even a tax form"],
    ["Issued without a person", `${docStats.automaticPct}%`, "the PF exit, and settlement when payroll has closed"],
    ["Last day to relieving letter", `${docStats.toRelievingDays} days`, `median, against a ${docStats.relievingTarget}-day promise`],
    ["Late right now", `${late.length}`, late.length === 0 ? "nothing is past its promise" : "someone is waiting on us"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, note]) => (
          <div key={label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{label}</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-0.5 text-[12px] text-faint">{note}</p>
          </div>
        ))}
      </div>

      <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="late-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <h2 id="late-h" className="text-[18px] font-bold tracking-tight">Past its promise</h2>
        <p className="mt-1 max-w-[680px] text-[13px] text-faint">
          A relieving letter that takes six weeks costs a boomerang hire. These are the ones a person has to move.
        </p>
        {late.length === 0 ? (
          <Empty icon={CheckCircle2} title="Nothing is late" line="Every leaver has what we owe them, or it is inside its window." />
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {late.map(({ pack, doc }) => {
              const l = leaverById(pack.leaverId);
              return (
                <li key={`${pack.leaverId}:${doc.key}`} className="flex flex-wrap items-start gap-3 py-4 first:pt-1 last:pb-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--soft)] text-[var(--danger)]">
                    <TriangleAlert className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">{DOC_OWNER[doc.key]} · late</p>
                    <p className="mt-0.5 text-[15px] font-semibold text-ink">{DOC_LABEL[doc.key]} — {l?.name ?? pack.leaverId}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted">{doc.note}</p>
                  </div>
                  <button
                    onClick={() => { setReleased((r) => [...r, `${pack.leaverId}:${doc.key}`]); toast(`${DOC_LABEL[doc.key]} issued to ${l ? first(l.name) : "the leaver"}`); }}
                    className="min-h-[44px] shrink-0 rounded-full border border-line px-4 text-[13px] font-semibold text-ink transition hover:bg-soft"
                  >
                    Issue it now
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="packs-h">
        <h2 id="packs-h" className="text-[18px] font-bold tracking-tight">Every leaver&rsquo;s pack</h2>
        <p className="mt-1 max-w-[680px] text-[13px] text-faint">
          Only what applies to the person — gratuity needs five years, so its absence is not a gap.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {packs.map((p) => {
            const l = leaverById(p.leaverId);
            const done = p.docs.filter(settled).length;
            return (
              <li key={p.leaverId}>
                <button
                  onClick={() => setOpen(p.leaverId)}
                  className="grid w-full gap-3 rounded-2xl py-4 text-left transition hover:bg-soft md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={l?.img ?? "/avatars/user-1.svg"} name={l?.name ?? ""} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-ink">{l?.name}</p>
                      <p className="truncate text-[13px] text-faint">{l?.team} · last day {p.lastDay} · {p.since} days ago</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {p.docs.map((d) => <DocChip key={d.key} doc={d} />)}
                  </div>
                  <span className="flex items-center gap-2 text-[13px] font-semibold md:justify-self-end">
                    <span className={packDone(p) ? "text-[var(--success)]" : "text-muted"}>{done} of {p.docs.length}</span>
                    <ArrowRight className="h-4 w-4 text-faint" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Drawer open={!!openPack} title={openPack ? `${leaverById(openPack.leaverId)?.name ?? "Leaver"} · exit pack` : undefined} onClose={() => setOpen(null)}>
        {openPack && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-faint">Last day {openPack.lastDay} · {openPack.since} days ago</p>
            <ul className="flex flex-col divide-y divide-[var(--line)]">
              {openPack.docs.map((d) => {
                const Icon = DOC_ICON[d.state];
                return (
                  <li key={d.key} className="flex items-start gap-3 py-3.5 first:pt-0">
                    <Icon className={`mt-[3px] h-4 w-4 shrink-0 ${d.state === "Late" ? "text-[var(--danger)]" : d.state === "Issued" ? "text-[var(--success)]" : "text-faint"}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink">{DOC_LABEL[d.key]}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-muted">{d.note}</p>
                      <p className="mt-1 text-[12px] text-faint">Owner: {DOC_OWNER[d.key]}</p>
                    </div>
                    <Badge tone={DOC_TONE[d.state]} size="sm">{d.state}</Badge>
                  </li>
                );
              })}
            </ul>
            <p className="flex items-start gap-2 rounded-2xl border border-line bg-soft p-4 text-[13px] leading-relaxed text-muted">
              <FileText className="mt-[2px] h-4 w-4 shrink-0" aria-hidden />
              Everything here is also in the leaver&rsquo;s own copy, on the personal address they gave us. They keep it after their account closes.
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function DocChip({ doc }: { doc: ExitDoc }) {
  const Icon = DOC_ICON[doc.state];
  const tone =
    doc.state === "Late" ? "border-[var(--danger)] text-[var(--danger)]"
      : doc.state === "Issued" ? "border-line text-muted"
        : doc.state === "Automatic" ? "border-[var(--ai-border)] text-[var(--purple)]"
          : "border-line text-faint";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[12px] ${tone}`} title={`${DOC_LABEL[doc.key]} — ${doc.state}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{SHORT[doc.key]}</span>
      <span className="sr-only">: {doc.state}</span>
    </span>
  );
}

const SHORT: Record<DocKey, string> = {
  relieving: "Relieving", experience: "Experience", fnf: "Settlement", form16: "Form 16",
  pf: "PF", gratuity: "Gratuity", property: "Property",
};

/* ── 3 · coming back: boomerangs and referrals ────────────────────── */
function ComingBack({ leavers }: { leavers: Leaver[] }) {
  const [sharedRoles, setSharedRoles] = usePersistentState<string[]>("vadal:alumni-role-shared", []);
  const [nudged, setNudged] = usePersistentState<string[]>("vadal:alumni-referral-nudged", []);
  const [stage, setStage] = React.useState<"open" | "all">("open");

  const rows: Referral[] = referrals.filter((r) => stage === "all" || (r.stage !== "Hired" && r.stage !== "Not this time"));
  const stalled = referrals.filter((r) => r.idle > 14 && r.stage !== "Hired" && r.stage !== "Not this time" && !nudged.includes(r.id));

  return (
    <div className="flex flex-col gap-6">
      <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="roles-h">
        <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
        <h2 id="roles-h" className="text-[18px] font-bold tracking-tight">Open roles, and the alumni they fit</h2>
        <p className="mt-1 max-w-[700px] text-[13px] text-faint">
          Matched on the team someone worked in, if they are eligible, in the network and said they would come back. Their reason for leaving plays no part in it.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {openRoles.map((r) => {
            const matches = matchesFor(r, leavers);
            const done = sharedRoles.includes(r.id);
            return (
              <li key={r.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{r.title}</p>
                  <p className="text-[13px] text-faint">{r.team} · posted {r.posted}</p>
                </div>
                {matches.length === 0 ? (
                  <p className="text-[13px] text-faint">No alumni we can offer this to.</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {matches.map((m) => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-2.5 text-[13px] text-ink">
                        <Avatar src={m.img} name={m.name} size="sm" />
                        {first(m.name)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="md:justify-self-end">
                  <button
                    disabled={matches.length === 0 || done}
                    onClick={() => { setSharedRoles((s) => [...s, r.id]); toast(`${r.title} is in the next alumni digest for ${matches.length} ${matches.length === 1 ? "person" : "people"}`); }}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-[var(--purple)] transition hover:bg-soft disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent lg:min-h-[36px]"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden />
                    {done ? "Shared" : matches.length === 0 ? "Nobody to share it with" : matches.length === 1 ? `Share with ${first(matches[0].name)}` : `Share with ${matches.length} alumni`}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="boom-h">
          <h2 id="boom-h" className="text-[18px] font-bold tracking-tight">Came back</h2>
          <p className="mt-1 text-[13px] text-faint">{ALUMNI_STATS.boomerangsThisYear} rejoined this year — the three most recent</p>
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

        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="ref-h">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="ref-h" className="text-[18px] font-bold tracking-tight">Referrals</h2>
              <p className="mt-1 text-[13px] text-faint">
                {referralStats.open} open · {ALUMNI_STATS.referralHires} hired this year · {referralStats.shareOfHires}% of last year&rsquo;s hires came this way
              </p>
            </div>
            <div className="flex rounded-full bg-soft p-1" role="group" aria-label="Filter referrals">
              {([["open", "Open"], ["all", "Everything"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setStage(k)} aria-pressed={stage === k} className={`min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[32px] ${stage === k ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{l}</button>
              ))}
            </div>
          </div>

          {stalled.length > 0 && (
            <div className="mt-4 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-4">
              <p className="flex items-start gap-2 text-[14px] leading-relaxed text-ink">
                <SparkMark size={14} tone="gradient" className="mt-[3px] shrink-0" />
                <span>
                  {stalled.length === 1 ? "One referral has" : `${stalled.length} referrals have`} sat untouched for more than a fortnight. People stop referring after this happens to them once.
                </span>
              </p>
            </div>
          )}

          {rows.length === 0 ? (
            <Empty icon={UserRoundPlus} title="No open referrals" line="Nothing is waiting on a hiring manager right now." />
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
              {rows.map((r) => (
                <li key={r.id} className="grid gap-2 py-4 first:pt-1 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink">{r.candidate}</p>
                    <p className="text-[13px] text-faint">{r.role} · {r.team}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
                      <Avatar src={r.by.img} name={r.by.name} size="sm" />
                      Referred by {r.by.name}
                      {r.by.alumni && <Badge tone="brand" size="sm">Alumni</Badge>}
                    </p>
                    {r.note && <p className="mt-1 text-[13px] leading-snug text-muted">{r.note}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <Badge tone={STAGE_TONE[r.stage]} size="sm">{r.stage}</Badge>
                    {r.stage !== "Hired" && r.stage !== "Not this time" && (
                      r.idle > 14 ? (
                        <button
                          disabled={nudged.includes(r.id)}
                          onClick={() => { setNudged((n) => [...n, r.id]); toast(`The hiring manager for ${r.role} has been asked to look`); }}
                          className="min-h-[44px] rounded-full border border-line px-3.5 text-[13px] font-semibold text-ink transition hover:bg-soft disabled:cursor-default disabled:border-transparent disabled:text-faint lg:min-h-[36px]"
                        >
                          {nudged.includes(r.id) ? "Asked" : `Nudge · ${r.idle}d quiet`}
                        </button>
                      ) : (
                        <span className="text-[12px] text-faint">moved {r.idle === 0 ? "today" : `${r.idle}d ago`}</span>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-[12px] text-faint">
            Stages: {STAGE_ORDER.join(" · ")}. {referralStats.fromAlumni} of the {referrals.length} here came from someone who has already left.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── shared ───────────────────────────────────────────────────────── */
function Empty({ icon: Icon, title, line }: { icon: typeof CheckCircle2; title: string; line: string }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-faint" aria-hidden />
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="max-w-[420px] text-[13px] leading-relaxed text-muted">{line}</p>
    </div>
  );
}
