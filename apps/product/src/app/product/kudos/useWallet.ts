"use client";
/* The person's wallet: the seeded ledger plus anything redeemed in this browser.
   One source for the balance everywhere it is shown (Home, profile menu,
   iThrive, Wallet, Rewards), so a redemption is reflected in all of them. */
import * as React from "react";
import { LEDGER, balanceOf, type LedgerEntry } from "@/lib/points";
import { REWARDS } from "@/lib/rewards";

const KEY = "vadal:redemptions";
export type Redemption = { id: string; rewardId: string; date: string; cost: number; status: "issued" | "waiting" | "approved" };

let items: Redemption[] = [];
let loaded = false;
const subs = new Set<() => void>();
function read() { try { items = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Redemption[]; } catch { items = []; } }
function subscribe(f: () => void) {
  if (!loaded && typeof window !== "undefined") {
    loaded = true; read();
    window.addEventListener("storage", (e) => { if (e.key === KEY) { read(); subs.forEach((s) => s()); } });
  }
  subs.add(f);
  return () => { subs.delete(f); };
}
const EMPTY: Redemption[] = [];

export function redeem(rewardId: string): Redemption {
  const r = REWARDS.find((x) => x.id === rewardId)!;
  const entry: Redemption = { id: `r-${Date.now()}`, rewardId, date: new Date().toISOString().slice(0, 10), cost: r.cost, status: r.needsApproval ? "waiting" : "issued" };
  items = [entry, ...items];
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  subs.forEach((s) => s());
  return entry;
}

export function useWallet() {
  const redemptions = React.useSyncExternalStore(subscribe, () => items, () => EMPTY);
  return React.useMemo(() => {
    const extra: LedgerEntry[] = redemptions.map((r) => ({
      id: r.id, date: r.date, source: "redeemed",
      text: `Redeemed · ${REWARDS.find((x) => x.id === r.rewardId)?.name ?? "Reward"}${r.status === "waiting" ? " (waiting for approval)" : ""}`,
      points: -r.cost,
    }));
    const ledger = [...extra, ...LEDGER];
    const lifetime = ledger.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0);
    return { ledger, balance: balanceOf(ledger), lifetime, redemptions };
  }, [redemptions]);
}
