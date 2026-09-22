"use client";
/* The person's wallet: the seeded ledger plus whatever they have spent in this
   browser. One source for the balance everywhere it is shown (Home, profile
   menu, iThrive, Wallet, Marketplace), so an order — or a decline that returns
   the points — is reflected in all of them.

   Orders live in useOrders; this reads them rather than keeping a second copy,
   which is how the balance and the order list can never disagree. */
import * as React from "react";
import { LEDGER, balanceOf, type LedgerEntry } from "@/lib/points";
import { REFUNDED, itemById } from "@/lib/marketplace";
import { useOrders } from "./useOrders";

export function useWallet() {
  const { orders } = useOrders();
  return React.useMemo(() => {
    const extra: LedgerEntry[] = orders
      .filter((o) => !REFUNDED.includes(o.state))
      .map((o) => ({
        id: o.id, date: o.date, source: "redeemed",
        text: `Spent · ${itemById(o.itemId)?.name ?? "Marketplace"}${o.state === "Requested" ? " (held until your manager decides)" : ""}`,
        points: -o.cost,
      }));
    const ledger = [...extra, ...LEDGER];
    const lifetime = ledger.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0);
    return { ledger, balance: balanceOf(ledger), lifetime, orders };
  }, [orders]);
}
