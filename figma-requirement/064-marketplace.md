# 064 — Marketplace: a shop, not a catalogue

**Route:** `/product/kudos/rewards` (Kudos › Marketplace) · **Code:** `apps/product/src/app/product/kudos/rewards/Marketplace.tsx`, `kudos/useOrders.ts`, `kudos/useWallet.ts` · **Data:** `apps/product/src/lib/marketplace.ts`, `lib/rewards.ts`
**Status:** Built · needs Figma

## What existed
A rewards catalogue: 17 items in four kinds, a points wallet, tiers, a Redeem button, and an admin panel for switching kinds on and pricing experiences. Enough to demo, not enough to use. What it did not have:

- no search, no sort, and one flat grid;
- no stock and no limits — a shelf that never empties and a voucher anyone could take fifty of;
- **no orders**: redeeming ended at a toast and a ledger line, so nobody could see where their thing had got to;
- no approvals screen for the manager the experiences said would approve them;
- nothing about who can actually afford any of it, and nothing about what unspent points cost the company.

## What it is now
Four views behind the Kudos tab, renamed **Marketplace**.

### Shop
- Search, sort (fewest points · most taken · newest) and categories — including **At your site**.
- Every card tells the truth before the click: points and rupee value, who fulfils it, how many are left when there is a shelf, whether it is limited to your site, and the single reason you cannot have it yet — *1,900 points to go* / *out of stock* / *you have had your 1 for this year* / *only at Hosur plant*.
- The detail drawer adds the lead time, the yearly limit against how many you have taken, and — for anything needing approval — that the points are **held, not spent**.

### Your orders (new)
Every order with its state (**Requested · Approved · Declined · Issued · Delivered · Cancelled**), a history line (`Requested just now → Cancelled just now`), and what happened to the points: a refunded order shows its cost struck through and the word *returned*. Cancel is available only while nobody has acted on it — after that it is someone else's work. An order on its way says the item's own promise ("Delivered to your desk or site in 5–7 days"), not a generic one.

### Approvals (managers)
The team's experience requests, with what they asked for, what it costs and what they wrote. **Approve** is one tap. **Decline requires a reason** — the button stays disabled until there is one, because "a decline without a reason is not a no, it is being ignored" — and the points go back the same minute.

### Supply (admins)
- **What points are costing you** — ₹8,36,000 of unspent points at the voucher rate, the 62% that eventually gets spent, and the line that matters: *points never expire here; expiring them would cut this number and teach people the currency is not real.*
- **Who can reach what** — median points earned per quarter by desk teams, Plant Ops, night shift and Logistics, each with how many of the 22 items that opens. The five site items exist because the first catalogue's first useful thing cost a driver a year of earning.
- **The shelf** — every item's price (editable), stock, yearly limit and how many were taken in 90 days.
- **What can never be listed** — appraisal marks, bonus or salary, and anything that buys back someone's own time, since leave and breaks are terms of employment. Plus: Nudge never recommends a purchase.

## Rules the design must keep
1. A price is in points, and in rupees wherever that is meaningful.
2. A thing you cannot have says which one reason stops you, before you tap.
3. Points held for an approval are not spent; a decline or a cancellation returns them, visibly, in the same balance everywhere.
4. Vadal holds no stock and takes no margin — every item names who really fulfils it.
5. The catalogue is judged by what the lowest earner can reach, not by how many items it has.

## Also
`useWallet` now reads the order store rather than keeping its own copy, so the balance in the header, Home, iThrive and the profile menu can never disagree with the order list. Old redemptions (`rewardId`/`status`) are migrated on read, not dropped.

## Figma to build
1. Shop 1440 — cards in all four blocked states, plus a new item and a low-stock one.
2. Item drawer 480 — an approval item, with the held-points line.
3. Your orders 1440 — Issued, Requested with Cancel, and a refunded Cancelled row.
4. Approvals 1440 — the decline-with-reason state.
5. Supply 1440 — liability, reachability, the shelf table.
6. Phone 375 of Shop and Your orders; dark mode of Your orders.
