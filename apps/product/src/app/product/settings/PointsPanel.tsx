"use client";
/* Recognition & points — the workspace's points mode (17 Sep decision §5).
   Points is a mode, not a flag: switching it off gives every surface a
   designed no-points state, which this panel shows before you choose. */
import * as React from "react";
import Link from "next/link";
import { Check, ShieldOff } from "lucide-react";
import { Switch } from "@vadal/design-system";
import { EARN_RULES, NEVER_FOR } from "@/lib/points";
import { setPointsMode, usePoints } from "../usePointsMode";
import { toast } from "../Toaster";

const CHANGES: [string, string, string][] = [
  ["Home", "Points · Day streak · Badges", "Kudos received · Day streak · Badges"],
  ["Kudos wall", "+25 pts on each kudos", "The kudos, no number"],
  ["Wallet", "Balance, ledger, rules", "Badges — recognition and badges only"],
  ["Rewards", "Catalogue you spend points on", "Experiences a manager can grant"],
  ["iThrive", "Points balance", "Badges earned"],
  ["Leaderboards", "Recognition counts", "Recognition counts (never points)"],
  ["Insight adoption", "Counted from actions", "Unchanged — never used points"],
];

export function PointsPanel() {
  const on = usePoints();
  const eyebrow = "text-[12px] font-semibold uppercase tracking-[0.14em] text-faint";
  return (
    <div className="flex flex-col gap-7">
      <div className="border-b border-line pb-4">
        <h2 className="text-[18px] font-bold tracking-tight">Recognition & points</h2>
        <p className="mt-1 text-[14px] text-muted">Whether this workspace uses points. Recognition and badges work either way.</p>
      </div>

      <div className="rounded-2xl border border-line p-4">
        <Switch
          checked={on}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPointsMode(e.target.checked); toast(e.target.checked ? "Points are on for everyone" : "Points are off — everyone sees recognition and badges instead"); }}
          label="Use points"
          description={on ? "People earn points for the actions below and can spend them on rewards." : "No balances, no numbers. Recognition and badges carry it."}
        />
      </div>

      <section className="flex flex-col gap-3">
        <p className={eyebrow}>What people see</p>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-faint">
                <th scope="col" className="px-1 pb-2 font-semibold">Where</th>
                <th scope="col" className={`px-1 pb-2 font-semibold ${on ? "text-ink" : ""}`}>Points on</th>
                <th scope="col" className={`px-1 pb-2 font-semibold ${!on ? "text-ink" : ""}`}>Points off</th>
              </tr>
            </thead>
            <tbody>
              {CHANGES.map(([w, a, b]) => (
                <tr key={w} className="border-t border-line">
                  <th scope="row" className="px-1 py-2.5 text-left font-medium text-ink">{w}</th>
                  <td className={`px-1 py-2.5 ${on ? "text-ink" : "text-faint"}`}>{on && <Check className="mr-1 inline h-3.5 w-3.5 text-[var(--success)]" />}{a}</td>
                  <td className={`px-1 py-2.5 ${!on ? "text-ink" : "text-faint"}`}>{!on && <Check className="mr-1 inline h-3.5 w-3.5 text-[var(--success)]" />}{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`flex flex-col gap-3 transition ${on ? "" : "opacity-50"}`}>
        <p className={eyebrow}>Earning rules</p>
        <p className="text-[13px] text-muted">Fixed and published to everyone on their wallet. The same for every value and every team.</p>
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {EARN_RULES.map((r) => (
                <tr key={r.source} className="border-t border-line first:border-0 align-top">
                  <td className="px-4 py-2.5">
                    <span className="block font-medium text-ink">{r.label}</span>
                    <span className="block text-[12px] text-faint">{r.cap}{r.who === "managers" ? " · managers" : r.who === "opt-in" ? " · opt-in" : ""}{r.note ? ` — ${r.note}` : ""}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">+{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-soft p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><ShieldOff className="h-4 w-4 text-muted" /> Points are never given for</p>
          <ul className="mt-1.5 grid gap-x-6 gap-y-0.5 text-[13px] text-muted sm:grid-cols-2">{NEVER_FOR.map((n) => <li key={n}>· {n}</li>)}</ul>
        </div>
      </section>

      <p className="text-[13px] text-muted">
        What is on the shelf and what it costs are set in <Link href="/product/marketplace" className="font-semibold text-[var(--purple)] hover:underline">Marketplace › Supply</Link>.
      </p>
    </div>
  );
}
