"use client";
/* ═══════════════════ results (admin) ═══════════════════
   What went out, who approved it, and what came back.

   Programme is where comms decides; this is where they answer for it. The
   numbers are sorted by how true they are, and the screen says which is which:
   a decision is a record, a share is something a person told us, reach is a
   model. Mixing them into one "impressions" figure is how advocacy dashboards
   lose the room in a budget review. */
import * as React from "react";
import Image from "next/image";
import { Avatar } from "@vadal/design-system";
import { modelledReach } from "@/lib/ai/engines/advocacy";
import type { Platform } from "@/lib/ai/engines/timing";
import { advocacyStats, publishedPosts, queueCandidates, shareWeeks, type PublishedPost } from "@/lib/amplify";
import { usePersistentState } from "@/lib/usePersistentState";
import { StackedColumns, ViewToggle, Legend, type Series } from "@/components/viz";
import { Card, Eyebrow, Mark, localToday, shortDay } from "./parts";

/* colour follows the platform, never its rank or the window */
const PLATFORM_COLOR: Record<Platform, string> = { LinkedIn: "var(--viz-1)", X: "var(--viz-2)", Instagram: "var(--viz-3)", Facebook: "var(--viz-4)" };
const PLATFORMS: Platform[] = ["LinkedIn", "X", "Instagram", "Facebook"];
const WINDOWS = { 4: "Last 4 weeks", 8: "Last 8 weeks" } as const;
type Win = keyof typeof WINDOWS;

const WEEK_START: Record<Win, string> = { 4: "2026-08-18", 8: "2026-07-21" };
const day = shortDay;
const compact = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)}K` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`);
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export type Approval = { by: string; img: string; on: string };

function Kind({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">{children}</span>;
}

function Stat({ label, value, kind, note, delta }: { label: string; value: string; kind: string; note: string; delta?: { text: string; good: boolean } }) {
  return (
    <div className="card-lift flex flex-col rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted">{label}</span>
        <Kind>{kind}</Kind>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[26px] font-bold tracking-tight">{value}</span>
        {delta && <span className="text-[12px] font-semibold" style={{ color: delta.good ? "var(--success)" : "var(--danger)" }}>{delta.text}</span>}
      </div>
      <p className="mt-0.5 text-[12px] leading-snug text-faint">{note}</p>
    </div>
  );
}

type Row = PublishedPost & { reach: number; queuedOnly?: boolean };

export function Results() {
  const [win, setWin] = usePersistentState<Win>("vadal:amplify-results-window", 4);
  const [table, setTable] = React.useState(false);
  const TODAY = localToday();
  const [approvals] = usePersistentState<Record<string, Approval>>("vadal:advocacy-approvals", {});

  /* posts approved in Programme this session join the log straight away */
  const fresh: Row[] = queueCandidates
    .filter((q) => approvals[q.id])
    .map((q) => ({
      id: q.id, platform: q.platform, text: q.text, image: q.image,
      approvedBy: { name: approvals[q.id].by, img: approvals[q.id].img }, approvedOn: approvals[q.id].on,
      asked: 0, shared: 0, passed: 0, avgFollowers: q.avgFollowers, reach: 0, queuedOnly: true,
    }));
  const rows: Row[] = [
    ...fresh,
    ...publishedPosts.filter((p) => p.approvedOn >= WEEK_START[win]).map((p) => ({ ...p, reach: modelledReach(p.shared, p.avgFollowers, p.platform) })),
  ];

  const n = win;
  const labels = shareWeeks.labels.slice(-n);
  const series: Series[] = PLATFORMS.map((p) => ({ key: p, label: p, color: PLATFORM_COLOR[p], values: shareWeeks.byPlatform[p].slice(-n) }));
  const weekly = labels.map((_, i) => series.reduce((s, x) => s + x.values[i], 0));
  const sharesTotal = weekly.reduce((a, b) => a + b, 0);
  const prev = win === 4 ? PLATFORMS.reduce((s, p) => s + shareWeeks.byPlatform[p].slice(-8, -4).reduce((a, b) => a + b, 0), 0) : null;
  const delta = prev ? Math.round(((sharesTotal - prev) / prev) * 100) : null;

  const done = rows.filter((r) => !r.queuedOnly);
  const asked = done.reduce((s, r) => s + r.asked, 0);
  const sharedOnPosts = done.reduce((s, r) => s + r.shared, 0);
  const reach = done.reduce((s, r) => s + r.reach, 0);
  const approverCount = new Set(rows.map((r) => r.approvedBy.name)).size;

  const byPlatform = PLATFORMS.map((p) => {
    const shares = shareWeeks.byPlatform[p].slice(-n).reduce((a, b) => a + b, 0);
    const posts = done.filter((r) => r.platform === p);
    return { p, shares, posts: posts.length, reach: posts.reduce((s, r) => s + r.reach, 0) };
  });

  const seg = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;

  return (
    <div className="flex flex-col gap-6">
      {/* one filter row, above everything it scopes */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-muted">Showing posts approved since <span className="font-semibold text-ink">{day(WEEK_START[win])}</span></p>
        <div role="group" aria-label="Period" className="flex rounded-full border border-line bg-soft p-1">
          {([4, 8] as Win[]).map((w) => <button key={w} className={seg(win === w)} aria-pressed={win === w} onClick={() => setWin(w)}>{WINDOWS[w]}</button>)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Posts approved" value={`${rows.length}`} kind="Record" note={`by ${approverCount} ${approverCount === 1 ? "person" : "people"}, since ${day(WEEK_START[win])}`} />
        <Stat
          label="Shares" value={sharesTotal.toLocaleString("en-US")} kind="Reported"
          note="Company posts and people's own moments"
          delta={delta !== null ? { text: `${delta >= 0 ? "+" : ""}${delta}% vs the 4 weeks before`, good: delta >= 0 } : undefined}
        />
        <Stat label="Share rate" value={`${pct(sharedOnPosts, asked)}%`} kind="Reported" note={`${sharedOnPosts} shares from ${asked.toLocaleString("en-US")} asks on company posts`} />
        <Stat label="Reach" value={compact(reach)} kind="Modelled" note="Beyond the company's own accounts" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <Card className="xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Eyebrow>Shares by platform</Eyebrow>
              <p className="mt-1 text-[14px] text-muted">Per week, as people reported them.</p>
            </div>
            <ViewToggle table={table} onChange={setTable} label="Shares by platform" />
          </div>
          <div className="mt-4"><Legend series={series} /></div>
          <div className="mt-3">
            <StackedColumns
              labels={labels} series={series} table={table} height={240}
              caption={`Shares people reported per week by platform, ${WINDOWS[win].toLowerCase()}`}
              tooltipTitle={(l) => `Week of ${l}`}
            />
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <Eyebrow>By platform</Eyebrow>
          <table className="mt-3 w-full border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-faint">
                <th scope="col" className="pb-2 font-semibold">Platform</th>
                <th scope="col" className="pb-2 text-right font-semibold">Shares</th>
                <th scope="col" className="pb-2 text-right font-semibold">Reach</th>
              </tr>
            </thead>
            <tbody>
              {byPlatform.map((b) => (
                <tr key={b.p} className="border-t border-line">
                  <th scope="row" className="py-2.5 pr-2 text-left font-medium text-ink">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: PLATFORM_COLOR[b.p] }} aria-hidden />{b.p}</span>
                  </th>
                  <td className="py-2.5 text-right tabular-nums text-ink">
                    {b.shares}<span className="ml-1.5 text-[12px] text-faint">{pct(b.shares, sharesTotal)}%</span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{b.reach ? compact(b.reach) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[12px] leading-snug text-faint">
            Reach counts company posts approved in this window. LinkedIn carries most of it: {pct(byPlatform[0].reach, reach)}% of modelled reach from {byPlatform[0].posts} of {done.length} posts.
          </p>
        </Card>
      </div>

      {/* every post, and who let it out */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <Eyebrow>Every post that went out</Eyebrow>
            <p className="mt-1 text-[14px] text-muted">Newest first. Nothing enters an employee&apos;s feed without a name against it.</p>
          </div>
          <span className="text-[12px] text-faint">{advocacyStats.participants} people opted in</span>
        </div>

        {/* wide: a table */}
        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[860px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-faint">
                <th scope="col" className="pb-2 font-semibold">Post</th>
                <th scope="col" className="pb-2 font-semibold">Approved by</th>
                <th scope="col" className="pb-2 text-right font-semibold">Asked</th>
                <th scope="col" className="pb-2 text-right font-semibold">Shared</th>
                <th scope="col" className="pb-2 text-right font-semibold">Passed</th>
                <th scope="col" className="pb-2 text-right font-semibold">Share rate</th>
                <th scope="col" className="pb-2 text-right font-semibold">Reach <span className="font-normal">· modelled</span></th>
                <th scope="col" className="pb-2 text-right font-semibold">Referral clicks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="py-3 pr-4">
                    <div className="flex items-start gap-3">
                      {r.image
                        ? <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg"><Image src={r.image} alt="" fill sizes="44px" className="object-cover" /></span>
                        : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-soft"><Mark platform={r.platform} size={20} /></span>}
                      <div className="min-w-0 max-w-[320px]">
                        <p className="line-clamp-2 leading-snug text-ink">{r.text}</p>
                        <p className="mt-0.5 text-[12px] text-faint">{r.platform}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <Avatar src={r.approvedBy.img} name={r.approvedBy.name} size="sm" />
                      <span><span className="block whitespace-nowrap text-ink">{r.approvedBy.name}</span><span className="block text-[12px] text-faint">{r.approvedOn === TODAY ? "Today" : day(r.approvedOn)}</span></span>
                    </span>
                  </td>
                  {r.queuedOnly ? (
                    <td colSpan={6} className="py-3 text-right text-[13px] text-faint">In the queue — goes out to people with the next digest</td>
                  ) : (
                    <>
                      <td className="py-3 text-right tabular-nums text-muted">{r.asked}</td>
                      <td className="py-3 text-right tabular-nums font-semibold text-ink">{r.shared}</td>
                      <td className="py-3 text-right tabular-nums text-muted">{r.passed}</td>
                      <td className="py-3 text-right tabular-nums text-ink">{pct(r.shared, r.asked)}%</td>
                      <td className="py-3 text-right tabular-nums text-muted">{compact(r.reach)}</td>
                      <td className="py-3 text-right tabular-nums text-muted">{r.referralClicks ?? "—"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* narrow: one card per post */}
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)] lg:hidden">
          {rows.map((r) => (
            <li key={r.id} className="py-3.5">
              <div className="flex items-start gap-3">
                <Mark platform={r.platform} size={22} />
                <p className="line-clamp-2 flex-1 text-[14px] leading-snug text-ink">{r.text}</p>
              </div>
              <p className="mt-2 flex items-center gap-2 text-[12px] text-faint">
                <Avatar src={r.approvedBy.img} name={r.approvedBy.name} size="sm" />
                Approved by {r.approvedBy.name} · {r.approvedOn === TODAY ? "today" : day(r.approvedOn)}
              </p>
              {r.queuedOnly ? (
                <p className="mt-2 text-[13px] text-faint">In the queue — goes out with the next digest</p>
              ) : (
                <dl className="mt-2.5 grid grid-cols-4 gap-2 text-center">
                  {[["Shared", `${r.shared}`], ["Rate", `${pct(r.shared, r.asked)}%`], ["Reach", compact(r.reach)], ["Clicks", r.referralClicks ? `${r.referralClicks}` : "—"]].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-soft px-1 py-2">
                      <dd className="text-[15px] font-bold tabular-nums text-ink">{v}</dd>
                      <dt className="text-[11px] text-faint">{k}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
          <span className="font-semibold text-muted">Record</span> — who approved and when. ·{" "}
          <span className="font-semibold text-muted">Reported</span>{" "}— shares people confirmed; we can&apos;t see their accounts. ·{" "}
          <span className="font-semibold text-muted">Modelled</span> — reach from follower counts and typical organic reach; an order of magnitude. ·{" "}
          Referral clicks are counted by our own link, on hiring posts only.
        </p>
      </Card>
    </div>
  );
}
