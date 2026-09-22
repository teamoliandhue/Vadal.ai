"use client";
/* Orders — what happened after someone spent their points.

   The old store held a redemption: an id, a cost and one of three statuses. An
   order carries its state, when each state happened, and — when someone said no
   — why. Points come back on a decline or a cancellation, which is the part a
   balance has to agree with, so this is the single store the wallet reads.

   Old entries (rewardId/status) are migrated on read rather than dropped: a
   redemption made before this existed is still someone's order. */
import * as React from "react";
import { REFUNDED, itemById, type OrderState } from "@/lib/marketplace";

const KEY = "vadal:redemptions";

export type Order = {
  id: string;
  itemId: string;
  date: string;
  cost: number;
  state: OrderState;
  history: { state: OrderState; when: string }[];
  reason?: string;
};

type Legacy = { id: string; rewardId: string; date: string; cost: number; status: "issued" | "waiting" | "approved" };
const LEGACY_STATE: Record<Legacy["status"], OrderState> = { issued: "Issued", waiting: "Requested", approved: "Approved" };

let items: Order[] = [];
let loaded = false;
const subs = new Set<() => void>();

function migrate(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o) => {
    const rec = o as Partial<Order> & Partial<Legacy>;
    if (rec.itemId && rec.state) return rec as Order;
    const state = LEGACY_STATE[(rec.status ?? "issued") as Legacy["status"]];
    return {
      id: rec.id ?? `o-${Math.random().toString(36).slice(2)}`,
      itemId: rec.rewardId ?? "",
      date: rec.date ?? new Date().toISOString().slice(0, 10),
      cost: rec.cost ?? 0,
      state,
      history: [{ state, when: rec.date ?? "" }],
    };
  });
}

function read() {
  try { items = migrate(JSON.parse(window.localStorage.getItem(KEY) ?? "[]")); } catch { items = []; }
}
function save() {
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  subs.forEach((s) => s());
}
function subscribe(f: () => void) {
  if (!loaded && typeof window !== "undefined") {
    loaded = true; read();
    window.addEventListener("storage", (e) => { if (e.key === KEY) { read(); subs.forEach((s) => s()); } });
  }
  subs.add(f);
  return () => { subs.delete(f); };
}
const EMPTY: Order[] = [];

const today = () => new Date().toISOString().slice(0, 10);

/** Place an order. Anything a person has to approve starts as Requested. */
export function placeOrder(itemId: string): Order {
  const item = itemById(itemId)!;
  const state: OrderState = item.needsApproval ? "Requested" : "Issued";
  const order: Order = {
    id: `o-${Date.now()}`, itemId, date: today(), cost: item.cost, state,
    history: [{ state, when: "just now" }],
  };
  items = [order, ...items];
  save();
  return order;
}

export function setOrderState(id: string, state: OrderState, reason?: string) {
  items = items.map((o) => (o.id === id ? { ...o, state, reason, history: [...o.history, { state, when: "just now" }] } : o));
  save();
}

/** Only while nobody has acted on it — after that it is someone else's work. */
export const cancellable = (o: Order) => o.state === "Requested";

export function useOrders() {
  const orders = React.useSyncExternalStore(subscribe, () => items, () => EMPTY);
  return React.useMemo(() => ({
    orders,
    /** Points still spent: a declined or cancelled order gave them back. */
    spent: orders.filter((o) => !REFUNDED.includes(o.state)).reduce((s, o) => s + o.cost, 0),
    open: orders.filter((o) => o.state === "Requested" || o.state === "Approved").length,
    /** How many of an item this person has taken this year. */
    takenOf: (itemId: string) => orders.filter((o) => o.itemId === itemId && !REFUNDED.includes(o.state)).length,
  }), [orders]);
}
