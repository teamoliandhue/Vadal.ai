# 065 — Marketplace becomes its own section, and looks like a shop

**Route:** `/product/marketplace` (My space › Marketplace) · **Code:** `apps/product/src/app/product/marketplace/Marketplace.tsx` · **Reference:** [Fluz Marketplace](https://mobbin.com/sites/sections/860cd875-d9a5-4e5a-beeb-e61546fe0489), [PayPal gift cards](https://mobbin.com/sites/sections/eb683726-7669-4978-aaa5-846ac2a2563d), [Givingli](https://mobbin.com/sites/sections/598128df-2236-4d95-bd14-07b095a812ab), [Klarna stores](https://mobbin.com/screens/4a87949f-c654-4cac-8895-2af48995c58b)
**Status:** Built · needs Figma

## Why
Spec 064 built the marketplace, but left it as the third tab inside Kudos — so the one screen where recognition turns into something real was a sub-page of the screen where you give it. Earning and spending are two different errands, and the second one is the employee's own. It also still looked like an HR catalogue: a filter row and a grid.

## The move
- **My space → Marketplace**, its own item beside Home, Social and Kudos, at `/product/marketplace`. Access `ALL_ROLES`.
- Kudos keeps two rooms (Kudos, Wallet); the wallet's primary action becomes **Spend them →**.
- `/product/kudos/rewards` **redirects** rather than 404s — the digest, the tour, Get Started and the marketing site all link to it, and a working link is worth more than a tidy one.

## The storefront, in the shape shops actually use
Studied against Fluz, PayPal's gift-card store, Givingli and the Klarna/Shopee store tabs. What those share, and what this now has:

1. **A banner that carries the search.** Near-black card with the Aurora hairline, one line of positioning — *"Recognition, turned into something you actually wanted"* — and the search field inside the band, where a shop puts it. The balance stays in the page header, so the number is stated once.
2. **A bento of ways in.** One large tile for **Things that exist at your site**, wearing the three items it actually holds (🍛 🚌 🥾) rather than a stock photograph, and four small tiles — Vouchers, Experiences, Merch, Giving — each with its count and *Shop now →*.
3. **Numbered rails.** `01 / Within your points`, `02 / What people actually take`, `03 / New at your site`, each a snap-scrolling row of 290px cards with **See all** and ← → buttons. Rail 01 is cheapest-first and rail 02 is most-taken, because two rails sorted the same way are one rail printed twice.
4. **The grid, below.** The whole marketplace with a count and a sort. The moment you search or pick a category the merchandising collapses and it is just results — at that point you know what you want.

Rail 02's note says what it is ranked by: *the last 90 days, not by what we would like you to buy.* The banner says *no margin, no upsell, and nothing here expires.* Both are there because a shop inside an HR product has to answer the question its own existence raises.

## Unchanged from 064
Orders with states and refunds, approvals that need a reason, stock and limits, the supply panel with the liability and the reachability table. Points-off mode still turns the section into the experiences a manager can grant, with no tabs and no prices.

## Figma to build
1. Marketplace 1440 — banner, bento, three rails, grid.
2. Marketplace 1440 — searched state (banner, chips, results only).
3. Phone 375 — banner, bento stacked, a rail mid-scroll.
4. Dark mode of the storefront.
