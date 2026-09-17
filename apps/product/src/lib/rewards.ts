/**
 * Rewards — the catalogue points are spent on (roadmap v2 · 17 Sep decision §8).
 *
 * Four kinds, each fulfilled by whoever actually holds the stock — Vadal never
 * ships a parcel:
 *   merch       — the client's own branded store
 *   voucher     — a rewards partner, bridged by API (issued to the work email)
 *   experience  — configured by the workspace, approved by a manager
 *   giving      — a donation made in the person's name
 *
 * Experiences can be granted by a manager even with points off.
 * Appraisal marks and bonus are never catalogue items: engagement currency must
 * not buy compensation. The admin screen says so rather than hiding the option.
 */
export type RewardKind = "merch" | "voucher" | "experience" | "giving";

export type Reward = {
  id: string;
  kind: RewardKind;
  name: string;
  emoji: string;
  /** Points. */
  cost: number;
  /** What it is worth in rupees, when that is meaningful. */
  value?: number;
  blurb: string;
  fulfilment: string;
  needsApproval?: boolean;
};

export const KIND_LABEL: Record<RewardKind, string> = {
  merch: "oliandhue store", voucher: "Vouchers", experience: "Experiences", giving: "Giving",
};

export const KIND_SOURCE: Record<RewardKind, string> = {
  merch: "Made and shipped by the oliandhue store",
  voucher: "Issued by our rewards partner",
  experience: "Set up by oliandhue People team",
  giving: "Donated in your name",
};

/** 5 points to a rupee on vouchers — the top of the ladder is 50,000 → ₹10,000. */
export const REWARDS: Reward[] = [
  { id: "mug", kind: "merch", name: "oliandhue mug", emoji: "☕", cost: 100, blurb: "The one everyone steals from the kitchen.", fulfilment: "Delivered to your desk or site in 5–7 days" },
  { id: "notebook", kind: "merch", name: "Dot-grid notebook", emoji: "📓", cost: 250, blurb: "A5, lay-flat, logo debossed.", fulfilment: "Delivered to your desk or site in 5–7 days" },
  { id: "tee", kind: "merch", name: "Crew tee", emoji: "👕", cost: 600, blurb: "Organic cotton, in your size.", fulfilment: "Delivered in 7–10 days" },
  { id: "hoodie", kind: "merch", name: "Night-shift hoodie", emoji: "🧥", cost: 1800, blurb: "The warm one. Designed with Plant Ops.", fulfilment: "Delivered in 7–10 days" },
  { id: "backpack", kind: "merch", name: "Commuter backpack", emoji: "🎒", cost: 3500, blurb: "Laptop sleeve, rain cover, reflective strip.", fulfilment: "Delivered in 7–10 days" },

  { id: "v-food-500", kind: "voucher", name: "Food delivery voucher", emoji: "🍱", cost: 2500, value: 500, blurb: "₹500 on the food app you already use.", fulfilment: "Code sent to your work email within 24 hours" },
  { id: "v-shop-1000", kind: "voucher", name: "Shopping voucher", emoji: "🛍️", cost: 5000, value: 1000, blurb: "₹1,000 across 40+ online stores.", fulfilment: "Code sent to your work email within 24 hours" },
  { id: "v-travel-2500", kind: "voucher", name: "Travel voucher", emoji: "🚆", cost: 12500, value: 2500, blurb: "₹2,500 on trains, buses and flights.", fulfilment: "Code sent to your work email within 24 hours" },
  { id: "v-shop-5000", kind: "voucher", name: "Shopping voucher", emoji: "🎁", cost: 25000, value: 5000, blurb: "₹5,000 across 40+ online stores.", fulfilment: "Code sent to your work email within 24 hours" },
  { id: "v-any-10000", kind: "voucher", name: "Choose-anything voucher", emoji: "✨", cost: 50000, value: 10000, blurb: "₹10,000 — the top of the ladder.", fulfilment: "Code sent to your work email within 24 hours" },

  { id: "lunch", kind: "experience", name: "Team lunch for four", emoji: "🍽️", cost: 1500, blurb: "You pick the place and the three people.", fulfilment: "Your manager approves; People team books it", needsApproval: true },
  { id: "late-start", kind: "experience", name: "A late start", emoji: "🌅", cost: 2000, blurb: "Start at 11 one morning of your choice.", fulfilment: "Your manager approves the day", needsApproval: true },
  { id: "day-off", kind: "experience", name: "An extra day off", emoji: "🏖️", cost: 8000, blurb: "One day, on top of your leave.", fulfilment: "Your manager approves the date", needsApproval: true },
  { id: "offsite-seat", kind: "experience", name: "A seat at the leadership offsite", emoji: "🧭", cost: 20000, blurb: "Two days in the room where next year is planned.", fulfilment: "People team confirms the dates", needsApproval: true },
  { id: "stay", kind: "experience", name: "A weekend stay for two", emoji: "🏨", cost: 30000, blurb: "Two nights, within 300 km of your site.", fulfilment: "People team books it", needsApproval: true },

  { id: "meals", kind: "giving", name: "50 school meals", emoji: "🍛", cost: 1000, value: 200, blurb: "Funds 50 mid-day meals through a school-meals charity.", fulfilment: "Donation receipt sent to you" },
  { id: "trees", kind: "giving", name: "10 trees planted", emoji: "🌳", cost: 2500, value: 500, blurb: "Planted and tracked near the Pune plant.", fulfilment: "Planting photo sent in 30 days" },
];

export type Tier = { name: string; from: number; to: number };
export const TIERS: Tier[] = [
  { name: "Bronze", from: 0, to: 999 },
  { name: "Silver", from: 1000, to: 4999 },
  { name: "Gold", from: 5000, to: 19999 },
  { name: "Platinum", from: 20000, to: Infinity },
];
export const tierOf = (lifetime: number) => TIERS.find((t) => lifetime >= t.from && lifetime <= t.to) ?? TIERS[0];

/** Things an admin might try to add, and why they can't. */
export const NOT_ALLOWED = [
  { name: "Appraisal marks", why: "Engagement points can't buy a performance outcome." },
  { name: "Bonus or salary", why: "Pay is compensation, set by HR policy — not a catalogue item." },
];
