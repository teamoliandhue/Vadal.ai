"use client";
/* Wallet — separate from the feed (17 Sep decision): your balance, how you
   earned it, what you've redeemed, and your badges. Every rule is shown, and
   so is what points are never given for.

   With points off in this workspace the page becomes "Badges": the same
   recognition story with no numbers — what you received and gave, and the
   badges you have earned by doing things. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldOff } from "lucide-react";
import { BarList } from "@/components/viz";
import {
  BADGES, EARN_RULES, MY_RECOGNITION, NEVER_FOR, SOURCE_LABEL, earnedSince, type BadgeState,
} from "@/lib/points";
import { KudosTabs } from "../KudosTabs";
import { useWallet } from "../useWallet";
import { usePoints } from "../../usePointsMode";
import { useViewAs } from "../../useViewAs";

const day = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

function Badges({ items }: { items: BadgeState[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((b) => {
        const done = Boolean(b.earned);
        const pct = b.progress ? Math.round((b.progress[0] / b.progress[1]) * 100) : 100;
        return (
          <li key={b.id} className={`flex flex-col items-center rounded-2xl border p-4 text-center ${done ? "border-line bg-card" : "border-dashed border-line bg-soft/40"}`}>
            <span className={`grid h-14 w-14 place-items-center rounded-full text-[28px] ${done ? "bg-[var(--lav)]" : "bg-soft grayscale"}`} aria-hidden>{b.emoji}</span>
            <span className="mt-2.5 text-[14px] font-semibold leading-tight text-ink">{b.name}</span>
            <span className="mt-1 text-[12px] leading-snug text-faint">{b.how}</span>
            {done ? (
              <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--success)]"><Check className="h-3.5 w-3.5" /> {b.earned}</span>
            ) : (
              <span className="mt-2 w-full">
                <span className="block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: `${pct}%` }} /></span>
                <span className="mt-1 block text-[12px] tabular-nums text-muted">{b.progress![0]} of {b.progress![1]}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Wallet() {
  const points = usePoints();
  const [role] = useViewAs();
  const { ledger, balance } = useWallet();
  const thisMonth = earnedSince(ledger, "2026-09-01");
  const redeemed = ledger.filter((e) => e.source === "redeemed");
  const earned = BADGES.filter((b) => b.earned);
  const next = BADGES.filter((b) => !b.earned && b.progress).sort((a, b) => b.progress![0] / b.progress![1] - a.progress![0] / a.progress![1])[0];

  const bySource = Object.entries(
    ledger.filter((e) => e.date >= "2026-09-01" && e.points > 0).reduce<Record<string, number>>((m, e) => ({ ...m, [e.source]: (m[e.source] ?? 0) + e.points }), {}),
  ).map(([k, v]) => ({ label: SOURCE_LABEL[k as keyof typeof SOURCE_LABEL], value: v })).sort((a, b) => b.value - a.value);

  const rules = EARN_RULES.filter((r) => r.who !== "managers" || role !== "employee");

  if (!points) {
    return (
      <div className="flex flex-col gap-6">
        <KudosTabs active="wallet" />
        <header className="rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Your recognition</Eyebrow>
            <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Badges</h1>
            <p className="mt-2 max-w-xl text-[14px] text-muted">Earned by what you do. This workspace doesn&apos;t use points, so there&apos;s no balance to keep — just the recognition itself.</p>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            [`${MY_RECOGNITION.received30d}`, "Kudos received", "last 30 days"],
            [`${MY_RECOGNITION.given30d}`, "Kudos given", "last 30 days"],
            [`${earned.length}`, "Badges earned", `of ${BADGES.length}`],
            [MY_RECOGNITION.topValue, "Most recognised for", "your top value"],
          ].map(([v, l, n]) => (
            <div key={l} className="card-lift rounded-2xl border border-line bg-card p-4">
              <div className="text-[13px] text-muted">{l}</div>
              <div className="mt-1 text-[24px] font-bold tracking-tight">{v}</div>
              <div className="text-[12px] text-faint">{n}</div>
            </div>
          ))}
        </div>
        <Card>
          <Eyebrow>Badges</Eyebrow>
          <p className="mt-1 text-[14px] text-muted">{next ? `Closest next: ${next.name} — ${next.progress![1] - next.progress![0]} to go.` : "Every badge earned."}</p>
          <div className="mt-4"><Badges items={BADGES} /></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <KudosTabs active="wallet" />

      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow>Your wallet</Eyebrow>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[56px] font-bold leading-none tracking-[-0.03em]">{balance.toLocaleString("en-US")}</span>
              <span className="text-[16px] font-semibold text-muted">points</span>
            </div>
            <p className="mt-2 text-[14px] text-muted">
              <span className="font-semibold text-[var(--success)]">+{thisMonth}</span> this month · {earned.length} badges ·{" "}
              {redeemed.length} {redeemed.length === 1 ? "reward" : "rewards"} redeemed
            </p>
          </div>
          <Link href="/product/marketplace" className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[var(--purple)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90">
            Spend them <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <Card className="xl:col-span-7">
          <Eyebrow>How you earned it</Eyebrow>
          <p className="mt-1 text-[14px] text-muted">Every point, newest first.</p>
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {ledger.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="w-14 shrink-0 text-[12px] tabular-nums text-faint">{e.source === "carried" ? "Before" : day(e.date)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-ink">{e.text}</span>
                  <span className="block text-[12px] text-faint">{SOURCE_LABEL[e.source]}</span>
                </span>
                <span className={`shrink-0 text-[14px] font-semibold tabular-nums ${e.points < 0 ? "text-muted" : "text-ink"}`}>
                  {e.points > 0 ? "+" : "−"}{Math.abs(e.points).toLocaleString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-5">
          <Card>
            <Eyebrow>This month, by source</Eyebrow>
            <div className="mt-4"><BarList caption="Points earned this month by source" rows={bySource} /></div>
          </Card>

          <Card>
            <Eyebrow>How points work</Eyebrow>
            <table className="mt-3 w-full text-[13px]">
              <tbody>
                {rules.map((r) => (
                  <tr key={r.source} className="border-t border-line first:border-0 align-top">
                    <td className="py-2 pr-2">
                      <span className="block text-ink">{r.label}</span>
                      <span className="block text-[12px] text-faint">{r.cap}{r.who === "opt-in" ? " · only if you joined" : ""}</span>
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums text-ink">+{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 rounded-2xl bg-soft p-3.5">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><ShieldOff className="h-4 w-4 text-muted" /> Never for</p>
              <ul className="mt-1.5 space-y-0.5 text-[13px] text-muted">{NEVER_FOR.map((n) => <li key={n}>· {n}</li>)}</ul>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <Eyebrow>Badges</Eyebrow>
        <p className="mt-1 text-[14px] text-muted">Earned by what you do, not by points — so they mean the same everywhere.{next ? ` Closest next: ${next.name}, ${next.progress![1] - next.progress![0]} to go.` : ""}</p>
        <div className="mt-4"><Badges items={BADGES} /></div>
      </Card>
    </div>
  );
}
