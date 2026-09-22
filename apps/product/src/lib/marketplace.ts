/* Marketplace — where points are actually spent (spec 064).

   A catalogue existed: eighteen things, four kinds, a Redeem button. What it
   did not have is everything that makes a marketplace work rather than look
   like one:

   · STOCK AND LIMITS. A shelf with nothing on it is a broken promise, and an
     unlimited shelf is a lie. Every item says how many are left and how often
     one person can have it.
   · WHO IT IS FOR. A catalogue full of desk-worker rewards is an equity
     problem wearing a gift icon. Items carry the sites they are available at,
     and the supply panel shows what a frontline earner can actually reach.
   · WHAT HAPPENED NEXT. Redeeming used to end at a toast. An order now has a
     state, a history and a person waiting on it — and a decline returns the
     points, visibly.
   · WHAT IT COSTS THE COMPANY. Unspent points are a real liability. The admin
     panel shows it, because the first question a CFO asks about a points
     scheme is the one HR products never answer.

   Deterministic demo data. The eighteen original rewards keep their ids, so a
   redemption made before this existed still resolves. */

import { REWARDS, type Reward, type RewardKind } from "./rewards";

export type Category = RewardKind | "local";

export const CATEGORY_LABEL: Record<Category, string> = {
  merch: "Merch", voucher: "Vouchers", experience: "Experiences", giving: "Giving", local: "At your site",
};

export type MarketItem = Reward & {
  category: Category;
  /** who fulfils it — never Vadal */
  seller: string;
  leadTime: string;
  /** null = made to order, no shelf to run out of */
  stock: number | null;
  /** how many one person may have in a year; null = no limit */
  limitPerYear: number | null;
  /** sites it can be delivered to; null = everyone */
  sites: string[] | null;
  /** redeemed in the last 90 days — the only "popular" we can honestly claim */
  taken90d: number;
  addedOn?: string;
  /** photograph in /public/market, named after the id (see market/CREDITS.md) */
  image: string;
};

/** Metadata for the eighteen that already existed, by id. */
const EXTRA: Record<string, Partial<MarketItem>> = {
  mug: { seller: "oliandhue store", leadTime: "5–7 days", stock: 240, limitPerYear: 2, taken90d: 186 },
  notebook: { seller: "oliandhue store", leadTime: "5–7 days", stock: 310, limitPerYear: 3, taken90d: 142 },
  tee: { seller: "oliandhue store", leadTime: "7–10 days", stock: 96, limitPerYear: 2, taken90d: 88 },
  hoodie: { seller: "oliandhue store", leadTime: "7–10 days", stock: 24, limitPerYear: 1, taken90d: 41 },
  backpack: { seller: "oliandhue store", leadTime: "7–10 days", stock: 8, limitPerYear: 1, taken90d: 12 },
  "v-food-500": { seller: "Rewards partner", leadTime: "within 24 hours", stock: null, limitPerYear: 12, taken90d: 604 },
  "v-shop-1000": { seller: "Rewards partner", leadTime: "within 24 hours", stock: null, limitPerYear: 6, taken90d: 318 },
  "v-travel-2500": { seller: "Rewards partner", leadTime: "within 24 hours", stock: null, limitPerYear: 4, taken90d: 74 },
  "v-shop-5000": { seller: "Rewards partner", leadTime: "within 24 hours", stock: null, limitPerYear: 2, taken90d: 26 },
  "v-any-10000": { seller: "Rewards partner", leadTime: "within 24 hours", stock: null, limitPerYear: 1, taken90d: 9 },
  lunch: { seller: "People team", leadTime: "booked within a week", stock: null, limitPerYear: 2, taken90d: 37 },
  "late-start": { seller: "Your manager", leadTime: "the day you pick", stock: null, limitPerYear: 4, taken90d: 51 },
  "day-off": { seller: "People team", leadTime: "the date you pick", stock: null, limitPerYear: 1, taken90d: 14 },
  "offsite-seat": { seller: "People team", leadTime: "next offsite", stock: 2, limitPerYear: 1, taken90d: 3 },
  stay: { seller: "People team", leadTime: "booked within three weeks", stock: 6, limitPerYear: 1, taken90d: 5 },
  meals: { seller: "School-meals charity", leadTime: "receipt same day", stock: null, limitPerYear: null, taken90d: 92 },
  trees: { seller: "Plantation partner", leadTime: "photo in 30 days", stock: null, limitPerYear: null, taken90d: 63 },
};

/* Things a person on the floor can actually reach, added because the first
   catalogue was built for people who sit at desks. */
const LOCAL: Omit<MarketItem, "image">[] = [
  {
    id: "canteen-200", kind: "voucher", category: "local", name: "Canteen top-up", emoji: "🍛", cost: 400, value: 200,
    blurb: "₹200 on your canteen card, at any site.", fulfilment: "On the card by the next shift",
    seller: "Site canteen", leadTime: "next shift", stock: null, limitPerYear: 24, sites: null, taken90d: 488, addedOn: "this month",
  },
  {
    id: "transport", kind: "voucher", category: "local", name: "Month's bus pass", emoji: "🚌", cost: 1200, value: 600,
    blurb: "The route between your town and the plant gate.", fulfilment: "Pass issued at the security desk",
    seller: "Transport desk", leadTime: "2 days", stock: 40, limitPerYear: 12, sites: ["Hosur plant", "Pune warehouse"], taken90d: 121, addedOn: "this month",
  },
  {
    id: "safety-boots", kind: "merch", category: "local", name: "Extra pair of safety boots", emoji: "🥾", cost: 900,
    blurb: "A second pair, in your size, kept in your locker.", fulfilment: "Fitted at the stores counter",
    seller: "Site stores", leadTime: "5 days", stock: 60, limitPerYear: 1, sites: ["Hosur plant", "Bengaluru plant"], taken90d: 57, addedOn: "this month",
  },
  {
    id: "night-meal", kind: "voucher", category: "local", name: "Hot meal on the night shift", emoji: "🌙", cost: 300, value: 150,
    blurb: "A hot meal after 1am, for the week.", fulfilment: "Added to your card for seven nights",
    seller: "Site canteen", leadTime: "same night", stock: null, limitPerYear: 26, sites: ["Hosur plant", "Bengaluru plant"], taken90d: 214, addedOn: "this month",
  },
  {
    id: "phone-data", kind: "voucher", category: "local", name: "Mobile data top-up", emoji: "📱", cost: 500, value: 249,
    blurb: "A month of data on the phone you read Vadal on.", fulfilment: "Recharged on the number in your record",
    seller: "Rewards partner", leadTime: "within an hour", stock: null, limitPerYear: 12, sites: null, taken90d: 396, addedOn: "this month",
  },
];

/* One photograph per item, named after its id. A shop where every tile is an
   emoji is a menu; people buy things they can see. */
const withImage = <T extends { id: string }>(i: T) => ({ ...i, image: `/market/${i.id}.webp` });

export const ITEMS: MarketItem[] = [
  ...REWARDS.map((r) => withImage({
    ...r,
    category: r.kind as Category,
    seller: "oliandhue store", leadTime: "5–7 days", stock: null, limitPerYear: null, sites: null, taken90d: 0,
    ...EXTRA[r.id],
  })),
  ...LOCAL.map(withImage),
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

/* ── what stops a purchase, said in words ────────────────────────── */
export type Blocker =
  | { kind: "points"; short: number }
  | { kind: "stock" }
  | { kind: "limit"; limit: number }
  | { kind: "site"; sites: string[] };

export function blockerFor(item: MarketItem, opts: { balance: number; takenThisYear: number; site?: string | null }): Blocker | null {
  if (item.stock !== null && item.stock <= 0) return { kind: "stock" };
  if (item.sites && opts.site && !item.sites.includes(opts.site)) return { kind: "site", sites: item.sites };
  if (item.limitPerYear !== null && opts.takenThisYear >= item.limitPerYear) return { kind: "limit", limit: item.limitPerYear };
  if (opts.balance < item.cost) return { kind: "points", short: item.cost - opts.balance };
  return null;
}

export function blockerText(b: Blocker): string {
  switch (b.kind) {
    case "points": return `${b.short.toLocaleString("en-US")} points to go`;
    case "stock": return "Out of stock — back next month";
    case "limit": return `You have had your ${b.limit} for this year`;
    case "site": return `Only at ${b.sites.join(" and ")}`;
  }
}

/* ── orders ──────────────────────────────────────────────────────── */
export type OrderState = "Requested" | "Approved" | "Declined" | "Issued" | "Delivered" | "Cancelled";

export const ORDER_NOTE: Record<OrderState, string> = {
  Requested: "Waiting on a person, not a queue.",
  Approved: "Approved — being arranged now.",
  Declined: "Declined. Your points are back in your balance.",
  Issued: "On its way.",
  Delivered: "Delivered.",
  Cancelled: "Cancelled by you. Your points are back.",
};

/** States where the points have come back to the person. */
export const REFUNDED: OrderState[] = ["Declined", "Cancelled"];

/* ── the supply side ─────────────────────────────────────────────── */

/** Points earned in a quarter by the median person in each kind of job. */
export const earnRates = [
  { who: "Desk teams", median: 1850, note: "Kudos, posts, surveys and learning all land in the app they have open." },
  { who: "Plant Ops", median: 940, note: "Fewer places to earn: no posts, and learning happens in a room." },
  { who: "Night shift", median: 720, note: "Quiet hours mean fewer surveys reach them at all." },
  { who: "Logistics", median: 610, note: "On the road; SMS carries two questions, not a feed." },
];

export const equityNote =
  "The first catalogue opened at a 100-point mug and its first genuinely useful thing was a 2,500-point food voucher — a full year of earning for a driver, six weeks for someone at a desk. The five items at your site were added for that reason, and the gap is still the number to watch.";

/** Unspent points across the workspace — a real liability, at the voucher rate. */
export const liability = {
  outstanding: 4_180_000,
  /** 5 points to a rupee on vouchers */
  rate: 5,
  get rupees() { return Math.round(this.outstanding / this.rate); },
  redeemedRate: 62,
  note: "62% of points earned are eventually spent. The rest sit on the books until they are.",
};

/* ── waiting on a manager ────────────────────────────────────────── */
export type TeamRequest = {
  id: string;
  who: { name: string; img: string; team: string };
  itemId: string;
  asked: string;
  /** what they wrote when they asked, when they wrote anything */
  note?: string;
};

export const teamRequests: TeamRequest[] = [
  { id: "tr1", who: { name: "Rohan Mehta", img: "/avatars/user-1.svg", team: "Design" }, itemId: "day-off", asked: "2 days ago", note: "The Friday before my sister's wedding." },
  { id: "tr2", who: { name: "Kavya Reddy", img: "/avatars/user-7.svg", team: "Design" }, itemId: "lunch", asked: "yesterday", note: "For the four of us who shipped the search revamp." },
  { id: "tr3", who: { name: "Ishaan Gupta", img: "/avatars/user-3.svg", team: "Design" }, itemId: "late-start", asked: "this morning" },
];
