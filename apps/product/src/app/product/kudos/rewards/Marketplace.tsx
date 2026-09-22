"use client";
/* Marketplace — where points are spent (Kudos › Marketplace, spec 064).

   What was here was a catalogue: eighteen cards and a Redeem button that ended
   at a toast. A marketplace needs four things that a catalogue does not, and
   each one is a view:

   · SHOP — search, categories, and the truth on every card: what is left, how
     often you may have it, and whether it exists at your site at all. The price
     is in points and, where it is meaningful, in rupees.
   · YOUR ORDERS — the part that was missing entirely. Every order carries its
     state and its history, can be cancelled while nobody has acted on it, and
     says plainly when the points came back.
   · APPROVALS — the manager side of "your manager approves". A decline needs a
     reason, and returns the points the same minute.
   · SUPPLY — the admin side: stock, price, who can see each item, what points
     are costing the company, and what a frontline earner can actually reach.

   With points switched off there is nothing to spend, so the page becomes the
   experiences a manager can grant — the same behaviour the catalogue had. */
import * as React from "react";
import { Ban, Check, Clock3, Gift, Package, Search, ShieldAlert, Sparkles, Truck, X } from "lucide-react";
import { Avatar, Badge, Button, Switch, type BadgeTone } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import {
  CATEGORY_LABEL, ITEMS, ORDER_NOTE, REFUNDED, blockerFor, blockerText, earnRates, equityNote,
  itemById, liability, teamRequests, type Category, type MarketItem, type OrderState,
} from "@/lib/marketplace";
import { KIND_LABEL, KIND_SOURCE, NOT_ALLOWED, TIERS, tierOf, type RewardKind } from "@/lib/rewards";
import { usePersistentState } from "@/lib/usePersistentState";
import { Drawer } from "../../Drawer";
import { KudosTabs } from "../KudosTabs";
import { useWallet } from "../useWallet";
import { cancellable, placeOrder, setOrderState, useOrders, type Order } from "../useOrders";
import { usePoints } from "../../usePointsMode";
import { useViewAs } from "../../useViewAs";
import { toast } from "../../Toaster";

const CATEGORIES: Category[] = ["local", "merch", "voucher", "experience", "giving"];
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const pts = (n: number) => n.toLocaleString("en-US");

/** The site this person works at — items can be local to one. */
const MY_SITE = "Hosur plant";

const STATE_TONE: Record<OrderState, BadgeTone> = {
  Requested: "warning", Approved: "info", Declined: "neutral",
  Issued: "brand", Delivered: "success", Cancelled: "neutral",
};

type View = "shop" | "orders" | "approvals" | "supply";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

function Empty({ icon: Icon, title, line }: { icon: typeof Gift; title: string; line: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-12 text-center">
      <Icon className="h-6 w-6 text-faint" aria-hidden />
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="max-w-[420px] text-[14px] leading-relaxed text-muted">{line}</p>
    </div>
  );
}

export function Marketplace() {
  const points = usePoints();
  const [role] = useViewAs();
  const { balance, lifetime } = useWallet();
  const { orders, open, takenOf } = useOrders();
  const isAdmin = canAccess(role, "Settings");
  const isManager = canAccess(role, "Manager hub");

  const [view, setView] = React.useState<View>("shop");
  const [pick, setPick] = React.useState<MarketItem | null>(null);
  const [prices, setPrices] = usePersistentState<Record<string, number>>("vadal:rewards-prices", {});
  const [kindsOn, setKindsOn] = usePersistentState<Record<RewardKind, boolean>>("vadal:rewards-kinds", { merch: true, voucher: true, experience: true, giving: true });
  const [handled, setHandled] = usePersistentState<Record<string, "approved" | "declined">>("vadal:market-approvals", {});

  const costOf = (i: MarketItem) => prices[i.id] ?? i.cost;
  const tier = tierOf(lifetime);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const waiting = teamRequests.filter((r) => !handled[r.id]).length;

  const VIEWS: { id: View; label: string }[] = [
    { id: "shop", label: "Shop" },
    { id: "orders", label: open ? `Your orders · ${open}` : "Your orders" },
    ...(isManager ? [{ id: "approvals" as const, label: waiting ? `Approvals · ${waiting}` : "Approvals" }] : []),
    ...(isAdmin ? [{ id: "supply" as const, label: "Supply" }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <KudosTabs active="rewards" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>{points ? `${tier.name} · ${pts(balance)} points to spend` : "Marketplace"}</Eyebrow>
          <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">{points ? "Marketplace" : "Experiences"}</h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">
            {points
              ? nextTier
                ? `${pts(nextTier.from - lifetime)} more lifetime points to ${nextTier.name}. Tiers never go down, and spending doesn't lower yours.`
                : "You're at the top tier."
              : "This workspace doesn't use points. These are the experiences a manager can give someone, as a thank-you."}
          </p>
        </div>
      </header>

      {points && (
        <nav aria-label="Marketplace views" className="flex items-center gap-1 overflow-x-auto border-b border-line">
          {VIEWS.map((v) => {
            const on = view === v.id;
            return (
              <button key={v.id} onClick={() => setView(v.id)} aria-current={on ? "page" : undefined}
                className={`-mb-px min-h-[44px] shrink-0 border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                {v.label}
              </button>
            );
          })}
        </nav>
      )}

      {(!points || view === "shop") && (
        <Shop
          points={points} balance={balance} costOf={costOf} kindsOn={kindsOn}
          takenOf={takenOf} onPick={setPick} isManager={isManager}
        />
      )}
      {points && view === "orders" && <Orders orders={orders} />}
      {points && view === "approvals" && <Approvals handled={handled} setHandled={setHandled} costOf={costOf} />}
      {points && view === "supply" && <Supply costOf={costOf} setPrices={setPrices} kindsOn={kindsOn} setKindsOn={setKindsOn} />}

      <Drawer open={!!pick} title={pick?.name ?? "Item"} onClose={() => setPick(null)}>
        {pick && (
          <ItemDetail
            item={pick} cost={costOf(pick)} balance={balance} points={points} isManager={isManager}
            taken={takenOf(pick.id)}
            onBuy={() => {
              const order = placeOrder(pick.id);
              toast(order.state === "Requested"
                ? `Asked for “${pick.name}” — your points are held until your manager decides`
                : `“${pick.name}” ordered — ${pick.leadTime}`);
              setPick(null);
              setView("orders");
            }}
            onClose={() => setPick(null)}
          />
        )}
      </Drawer>
    </div>
  );
}

/* ── 1 · the shop ────────────────────────────────────────────────── */
function Shop({
  points, balance, costOf, kindsOn, takenOf, onPick, isManager,
}: {
  points: boolean; balance: number; costOf: (i: MarketItem) => number;
  kindsOn: Record<RewardKind, boolean>; takenOf: (id: string) => number;
  onPick: (i: MarketItem) => void; isManager: boolean;
}) {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<Category | "all" | "affordable">("all");
  const [sort, setSort] = React.useState<"cheapest" | "popular" | "new">("cheapest");

  const catalogue = ITEMS.filter((i) => kindsOn[i.kind] !== false);
  const query = q.trim().toLowerCase();

  let list = points ? catalogue : catalogue.filter((i) => i.kind === "experience");
  if (query) list = list.filter((i) => `${i.name} ${i.blurb} ${i.seller}`.toLowerCase().includes(query));
  if (cat === "affordable") list = list.filter((i) => costOf(i) <= balance);
  else if (cat !== "all") list = list.filter((i) => i.category === cat);
  list = [...list].sort((a, b) =>
    sort === "cheapest" ? costOf(a) - costOf(b)
      : sort === "popular" ? b.taken90d - a.taken90d
        : Number(Boolean(b.addedOn)) - Number(Boolean(a.addedOn)) || costOf(a) - costOf(b));

  const seg = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;

  return (
    <div className="flex flex-col gap-5">
      {points && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-line bg-card px-4 focus-within:border-[var(--purple)]">
              <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
              <input
                value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the marketplace"
                aria-label="Search the marketplace"
                className="min-h-[44px] w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
              />
              {q && <button onClick={() => setQ("")} aria-label="Clear search" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-faint hover:bg-soft"><X className="h-4 w-4" /></button>}
            </label>
            <label className="flex items-center gap-2 text-[13px] text-faint">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="min-h-[44px] rounded-xl border border-line bg-card px-2.5 text-[13px] text-ink lg:min-h-[36px]">
                <option value="cheapest">Fewest points</option>
                <option value="popular">Most taken</option>
                <option value="new">Newest</option>
              </select>
            </label>
          </div>

          <div role="group" aria-label="Filter the marketplace" className="flex flex-wrap gap-1 rounded-full bg-soft p-1 lg:w-fit">
            <button className={seg(cat === "all")} aria-pressed={cat === "all"} onClick={() => setCat("all")}>Everything</button>
            <button className={seg(cat === "affordable")} aria-pressed={cat === "affordable"} onClick={() => setCat("affordable")}>Within my points</button>
            {CATEGORIES.map((c) => (
              <button key={c} className={seg(cat === c)} aria-pressed={cat === c} onClick={() => setCat(c)}>{CATEGORY_LABEL[c]}</button>
            ))}
          </div>
        </>
      )}

      {list.length === 0 ? (
        <Empty
          icon={Gift}
          title={cat === "affordable" ? "Nothing within your points yet" : query ? "Nothing matches that" : "Nothing in the marketplace"}
          line={cat === "affordable"
            ? "The hot meal on the night shift is 300 points — and a kudos received is 25."
            : query ? "Try a different word, or clear the search." : "An admin can switch categories on under Supply."}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => (
            <Card
              key={i.id} item={i} cost={costOf(i)} balance={balance} points={points}
              taken={takenOf(i.id)} onPick={() => onPick(i)}
              action={points ? "Get it" : isManager ? "Grant" : "Details"}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Card({
  item, cost, balance, points, taken, onPick, action,
}: {
  item: MarketItem; cost: number; balance: number; points: boolean; taken: number; onPick: () => void; action: string;
}) {
  const blocker = points ? blockerFor(item, { balance, takenThisYear: taken, site: MY_SITE }) : null;
  const low = item.stock !== null && item.stock > 0 && item.stock <= 25;
  return (
    <li className="card-lift flex flex-col rounded-[22px] border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--lav)] text-[28px]" aria-hidden>{item.emoji}</span>
        <div className="flex flex-col items-end gap-1">
          {item.addedOn && <Badge tone="brand" size="sm">New</Badge>}
          {item.needsApproval && <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-muted">Manager approves</span>}
        </div>
      </div>
      <h3 className="mt-3 text-[15px] font-bold leading-snug tracking-tight text-ink">{item.name}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-snug text-muted">{item.blurb}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-faint">
        <span>{item.seller}</span>
        {low && <><span aria-hidden>·</span><span className="font-semibold text-[var(--warning)]">{item.stock} left</span></>}
        {item.sites && <><span aria-hidden>·</span><span>{item.sites.includes(MY_SITE) ? "At your site" : item.sites.join(", ")}</span></>}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3.5">
        {points ? (
          <span className="min-w-0">
            <span className="block text-[16px] font-bold tabular-nums text-ink">{pts(cost)} <span className="text-[12px] font-semibold text-faint">pts</span></span>
            <span className="block truncate text-[12px] text-faint">
              {blocker ? blockerText(blocker) : item.value ? `${inr(item.value)} value` : "You can have this"}
            </span>
          </span>
        ) : (
          <span className="text-[12px] text-faint">{item.needsApproval ? "Granted by a manager" : ""}</span>
        )}
        <Button variant={blocker ? "secondary" : "brand"} size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={onPick}>
          {blocker ? "Details" : action}
        </Button>
      </div>
    </li>
  );
}

function ItemDetail({
  item, cost, balance, points, taken, isManager, onBuy, onClose,
}: {
  item: MarketItem; cost: number; balance: number; points: boolean; taken: number;
  isManager: boolean; onBuy: () => void; onClose: () => void;
}) {
  const blocker = points ? blockerFor(item, { balance, takenThisYear: taken, site: MY_SITE }) : null;
  return (
    <div className="flex flex-col gap-5">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-[var(--lav)] text-[40px]" aria-hidden>{item.emoji}</span>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">{item.name}</h2>
        <p className="mt-1 text-[14px] text-muted">{item.blurb}</p>
      </div>

      {points && (
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-soft p-3.5"><dt className="text-[12px] text-faint">Costs</dt><dd className="text-[20px] font-bold tabular-nums">{pts(cost)}</dd></div>
          <div className="rounded-2xl bg-soft p-3.5">
            <dt className="text-[12px] text-faint">You&rsquo;ll have</dt>
            <dd className={`text-[20px] font-bold tabular-nums ${balance - cost < 0 ? "text-[var(--danger)]" : ""}`}>{pts(balance - cost)}</dd>
          </div>
        </dl>
      )}

      <div className="rounded-2xl border border-line p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">What happens next</p>
        <p className="mt-1.5 text-[14px] text-ink">{item.fulfilment}.</p>
        <ul className="mt-2 flex flex-col gap-1 text-[13px] text-muted">
          <li>Fulfilled by {item.seller} — {item.leadTime}. Vadal never ships anything itself.</li>
          {item.value && <li>Worth {inr(item.value)}.</li>}
          {item.stock !== null && <li>{item.stock > 0 ? `${item.stock} left` : "None left this month"}.</li>}
          {item.limitPerYear !== null && <li>{item.limitPerYear} a year each — you have had {taken}.</li>}
          {item.sites && <li>Available at {item.sites.join(" and ")}.</li>}
          {item.needsApproval && points && <li>Your points are held, not spent, until your manager decides. If they say no, you get them back.</li>}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {points ? (
          <Button variant="brand" size="md" disabled={!!blocker} onClick={onBuy}>
            {blocker ? blockerText(blocker) : item.needsApproval ? "Ask my manager" : `Get it for ${pts(cost)} points`}
          </Button>
        ) : isManager ? (
          <Button variant="brand" size="md" onClick={() => { toast(`Opened a grant for “${item.name}” — pick who it's for in Kudos`); onClose(); }}>Grant to someone</Button>
        ) : (
          <p className="text-[14px] text-muted">A manager can give you this as a thank-you.</p>
        )}
        <Button variant="tertiary" size="md" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

/* ── 2 · your orders ─────────────────────────────────────────────── */
function Orders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <Empty icon={Package} title="No orders yet" line="Anything you get from the marketplace shows here, with where it has got to and who it is waiting on." />;
  }
  return (
    <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="orders-h">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <h2 id="orders-h" className="text-[18px] font-bold tracking-tight">Your orders</h2>
      <p className="mt-1 text-[13px] text-faint">Every one says where it has got to, and what happened to the points.</p>
      <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
        {orders.map((o) => {
          const item = itemById(o.itemId);
          const refunded = REFUNDED.includes(o.state);
          return (
            <li key={o.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--lav)] text-[22px]" aria-hidden>{item?.emoji ?? "🎁"}</span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-ink">{item?.name ?? "Reward"}</p>
                  <p className="text-[13px] text-faint">
                    {o.date} · <span className={refunded ? "line-through" : ""}>{pts(o.cost)} pts</span>{refunded ? " returned" : ""}
                  </p>
                </div>
              </div>
              <div className="min-w-0 text-[13px]">
                <p className="flex flex-wrap items-center gap-2">
                  <Badge tone={STATE_TONE[o.state]} size="sm">{o.state}</Badge>
                  {/* For a thing on its way, what happens next is the item's own
                      promise — a mug does not arrive by email. */}
                  <span className="text-muted">{o.state === "Issued" && item ? `${item.fulfilment}.` : ORDER_NOTE[o.state]}</span>
                </p>
                {o.reason && <p className="mt-1 leading-snug text-muted">&ldquo;{o.reason}&rdquo;</p>}
                <ol className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-faint">
                  {o.history.map((h, i) => (
                    <li key={`${h.state}-${i}`} className="flex items-center gap-2">
                      {i > 0 && <span aria-hidden>→</span>}
                      <span>{h.state} {h.when}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="md:justify-self-end">
                {cancellable(o) ? (
                  <button
                    onClick={() => { setOrderState(o.id, "Cancelled"); toast(`Cancelled — ${pts(o.cost)} points are back in your balance`); }}
                    className="min-h-[44px] rounded-full border border-line px-3.5 text-[13px] font-semibold text-ink transition hover:bg-soft lg:min-h-[36px]"
                  >
                    Cancel
                  </button>
                ) : o.state === "Issued" ? (
                  <span className="flex items-center gap-1.5 text-[13px] text-faint"><Truck className="h-4 w-4" aria-hidden /> {item?.leadTime}</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── 3 · approvals, the manager's side ───────────────────────────── */
function Approvals({
  handled, setHandled, costOf,
}: {
  handled: Record<string, "approved" | "declined">;
  setHandled: (f: (h: Record<string, "approved" | "declined">) => Record<string, "approved" | "declined">) => void;
  costOf: (i: MarketItem) => number;
}) {
  const [declining, setDeclining] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const waiting = teamRequests.filter((r) => !handled[r.id]);

  if (waiting.length === 0) {
    return <Empty icon={Check} title="Nothing waiting on you" line="When someone on your team asks for an experience, it lands here. Nothing is auto-approved, and nothing expires while you think about it." />;
  }

  return (
    <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="appr-h">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <h2 id="appr-h" className="text-[18px] font-bold tracking-tight">Waiting on you</h2>
      <p className="mt-1 max-w-[680px] text-[13px] text-faint">
        Their points are held until you decide. Say no and they come back the same minute — so a decline costs them nothing but the thing itself.
      </p>
      <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
        {waiting.map((r) => {
          const item = itemById(r.itemId)!;
          return (
            <li key={r.id} className="grid gap-3 py-4 first:pt-1 last:pb-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar src={r.who.img} name={r.who.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-ink">{r.who.name}</p>
                  <p className="text-[13px] text-faint">{r.who.team} · asked {r.asked}</p>
                </div>
              </div>
              <div className="min-w-0 text-[13px]">
                <p className="text-ink"><span aria-hidden>{item.emoji}</span> {item.name} <span className="text-faint">· {pts(costOf(item))} pts</span></p>
                {r.note && <p className="mt-0.5 leading-snug text-muted">&ldquo;{r.note}&rdquo;</p>}
                <p className="mt-0.5 text-faint">{item.fulfilment}.</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-self-end">
                <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-[36px]"
                  onClick={() => { setHandled((h) => ({ ...h, [r.id]: "approved" })); toast(`Approved — ${r.who.name.split(" ")[0]} has been told`); }}>
                  Approve
                </Button>
                <button
                  onClick={() => { setDeclining(r.id); setReason(""); }}
                  className="min-h-[44px] rounded-full border border-line px-3.5 text-[13px] font-semibold text-ink transition hover:bg-soft lg:min-h-[36px]"
                >
                  Decline
                </button>
              </div>

              {declining === r.id && (
                <div className="lg:col-span-3">
                  <label className="block text-[13px] text-faint" htmlFor={`why-${r.id}`}>Why — they will see this</label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <input
                      id={`why-${r.id}`} value={reason} onChange={(e) => setReason(e.target.value)}
                      placeholder="The week of the audit is the one week I can't spare you."
                      className="min-h-[44px] min-w-[240px] flex-1 rounded-xl border border-line bg-card px-3.5 text-[14px] outline-none focus:border-[var(--purple)]"
                    />
                    <Button
                      variant="secondary" size="sm" className="min-h-[44px] lg:min-h-[36px]" disabled={!reason.trim()}
                      onClick={() => {
                        setHandled((h) => ({ ...h, [r.id]: "declined" }));
                        setDeclining(null);
                        toast(`Declined — ${pts(costOf(item))} points are back with ${r.who.name.split(" ")[0]}`);
                      }}
                    >
                      Send the decline
                    </Button>
                    <button onClick={() => setDeclining(null)} className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-muted hover:text-ink lg:min-h-[36px]">Keep it open</button>
                  </div>
                  <p className="mt-1.5 text-[13px] text-faint">A decline without a reason is not allowed here. It is the difference between a no and being ignored.</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── 4 · supply, the admin's side ────────────────────────────────── */
function Supply({
  costOf, setPrices, kindsOn, setKindsOn,
}: {
  costOf: (i: MarketItem) => number;
  setPrices: (f: (p: Record<string, number>) => Record<string, number>) => void;
  kindsOn: Record<RewardKind, boolean>;
  setKindsOn: (f: (k: Record<RewardKind, boolean>) => Record<RewardKind, boolean>) => void;
}) {
  const reachable = (median: number) => ITEMS.filter((i) => costOf(i) <= median).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="liab-h">
          <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
          <h2 id="liab-h" className="text-[18px] font-bold tracking-tight">What points are costing you</h2>
          <p className="mt-4 text-[34px] font-bold leading-none tabular-nums tracking-tight">{inr(liability.rupees)}</p>
          <p className="mt-1 text-[13px] text-faint">{pts(liability.outstanding)} points unspent, at the voucher rate of {liability.rate} to the rupee</p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">{liability.note}</p>
          <p className="mt-3 flex items-start gap-2 text-[13px] text-faint">
            <ShieldAlert className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
            Points never expire in this workspace. Expiring them would cut this number and teach people the currency is not real.
          </p>
        </section>

        <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="equity-h">
          <h2 id="equity-h" className="text-[18px] font-bold tracking-tight">Who can reach what</h2>
          <p className="mt-1 text-[13px] text-faint">Points earned in a quarter by the median person, and how much of the marketplace that opens.</p>
          <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
            {earnRates.map((e) => (
              <li key={e.who} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold text-ink">{e.who}</p>
                  <p className="text-[13px] tabular-nums text-muted">
                    <span className="font-semibold text-ink">{pts(e.median)}</span> pts · {reachable(e.median)} of {ITEMS.length} items
                  </p>
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{e.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">{equityNote}</p>
        </section>
      </div>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="shelf-h">
        <h2 id="shelf-h" className="text-[18px] font-bold tracking-tight">The shelf</h2>
        <p className="mt-1 text-[13px] text-faint">Price, stock and how often one person may have it. Changes apply to everyone the next time they open the marketplace.</p>
        <div className="-mx-2 mt-4 overflow-x-auto px-2">
          <table className="w-full min-w-[620px] text-[14px]">
            <caption className="sr-only">Every item in the marketplace</caption>
            <thead>
              <tr className="text-left text-[13px] text-faint">
                <th scope="col" className="pb-2 font-medium">Item</th>
                <th scope="col" className="pb-2 font-medium">Fulfilled by</th>
                <th scope="col" className="pb-2 text-right font-medium">Points</th>
                <th scope="col" className="pb-2 text-right font-medium">Left</th>
                <th scope="col" className="pb-2 text-right font-medium">Each a year</th>
                <th scope="col" className="pb-2 text-right font-medium">Taken · 90d</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium text-ink">
                    <span aria-hidden className="mr-1.5">{i.emoji}</span>{i.name}
                    {i.sites && <span className="block text-[13px] font-normal text-faint">{i.sites.join(", ")}</span>}
                  </th>
                  <td className="py-2.5 pr-3 text-muted">{i.seller}</td>
                  <td className="py-2.5 text-right">
                    <input
                      type="number" min={100} step={100} value={costOf(i)} aria-label={`Points for ${i.name}`}
                      onChange={(e) => setPrices((p) => ({ ...p, [i.id]: Math.max(100, Number(e.target.value) || 100) }))}
                      className="min-h-[44px] w-24 rounded-xl border border-line bg-transparent px-2.5 text-right tabular-nums outline-none focus:border-[var(--purple)] lg:min-h-[36px]"
                    />
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{i.stock === null ? "—" : i.stock}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{i.limitPerYear === null ? "—" : i.limitPerYear}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted">{pts(i.taken90d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="cats-h">
          <h2 id="cats-h" className="text-[18px] font-bold tracking-tight">Categories</h2>
          <p className="mt-1 text-[13px] text-faint">Switch a kind off and it disappears for everyone — nothing in flight is cancelled.</p>
          <div className="mt-4 flex flex-col gap-2">
            {(["merch", "voucher", "experience", "giving"] as RewardKind[]).map((k) => (
              <div key={k} className="rounded-2xl border border-line p-3.5">
                <Switch
                  checked={kindsOn[k] !== false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKindsOn((s) => ({ ...s, [k]: e.target.checked }))}
                  label={KIND_LABEL[k]} description={KIND_SOURCE[k]}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="never-h">
          <h2 id="never-h" className="flex items-center gap-2 text-[18px] font-bold tracking-tight"><Ban className="h-5 w-5" aria-hidden /> What can never be listed</h2>
          <p className="mt-1 text-[13px] text-faint">Said here rather than hidden, so nobody has to discover it in a meeting.</p>
          <ul className="mt-4 flex flex-col gap-3 text-[14px] text-muted">
            {NOT_ALLOWED.map((n) => (
              <li key={n.name} className="flex items-start gap-2">
                <X className="mt-[3px] h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden />
                <span><span className="font-semibold text-ink">{n.name}</span> — {n.why}</span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <X className="mt-[3px] h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden />
              <span><span className="font-semibold text-ink">Anything that costs someone their time back</span> — leave, breaks and overtime are terms of employment, not things to be bought with points.</span>
            </li>
          </ul>
          <p className="mt-4 flex items-start gap-2 text-[13px] text-faint">
            <Sparkles className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
            Nudge never recommends a purchase. A marketplace that nudges people to spend is a shop, and this is not one.
          </p>
        </section>
      </div>

      <p className="flex items-center gap-2 text-[13px] text-faint">
        <Clock3 className="h-3.5 w-3.5" aria-hidden /> Stock and prices here are the workspace&rsquo;s own. Vadal holds no inventory and takes no margin.
      </p>
    </div>
  );
}
