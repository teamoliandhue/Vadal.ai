# 032 · Rewards — the catalogue

**Status:** built in code · `/product/kudos/rewards` · source: roadmap v2 marketplace · `docs/DECISIONS.md` §8

Four kinds, each fulfilled by whoever actually holds the stock — Vadal never ships a parcel.

| kind | fulfilled by | examples (points) |
|---|---|---|
| **oliandhue store** | the client's branded store | mug 100 · notebook 250 · tee 600 · hoodie 1,800 · backpack 3,500 |
| **Vouchers** | a rewards partner, by API — code to the work email | ₹500 food 2,500 · ₹1,000 shopping 5,000 · ₹2,500 travel 12,500 · ₹5,000 25,000 · **₹10,000 50,000** |
| **Experiences** | set up by the People team, **approved by a manager** | team lunch for four 1,500 · a late start 2,000 · an extra day off 8,000 · leadership offsite seat 20,000 · weekend stay for two 30,000 |
| **Giving** | donated in the person's name | 50 school meals 1,000 · 10 trees 2,500 |

Vouchers run at 5 points to a rupee, so the top of the ladder is 50,000 → ₹10,000. **Appraisal marks
and bonus can never be added** — the admin screen says so and why.

---

## 1 · Tiers

Bronze 0–999 · Silver 1,000–4,999 · Gold 5,000–19,999 · Platinum 20,000+, on **lifetime** points.
Tiers never go down and spending doesn't lower them. The eyebrow reads *GOLD · 4,180 POINTS TO SPEND*;
the sub-line says how far the next tier is.

## 2 · The page (points on)

- Header: eyebrow · **Rewards** · the tier line · admins: **Set up the catalogue** (secondary).
- **Waiting strip** (when something needs approval): clock · *Team lunch for four is waiting for your
  manager.* · *The points are held, not spent, until they decide.*
- **Filters**: All · **Within my points** · one per kind (only kinds switched on).
- **Grid** 1 / 2 / 3 columns, cheapest first. Each card: 56px `--lav` emoji tile · *Manager approves*
  chip on experiences · name 15/700 · one line · who fulfils it (12 faint) · a divider · cost
  (*1,800 pts*) with *₹500 value* / *You can have this* / *620 to go* · **Redeem** (brand) or **See details**
  (secondary) when you can't afford it yet.
- Empty filter: gift icon · *Nothing within your points yet* · *The mug is 100 — and a kudos received is 25.*

## 3 · Redeem drawer

80px emoji tile · name · line · two soft tiles **Costs** / **You'll have** (red if negative) ·
**What happens next** (the fulfilment line, the rupee value, and for experiences *Your points are held
until your manager decides. If they say no, you get them back.*) · primary **Redeem** / **Ask my
manager** / *620 more points needed* (disabled) · Close.

Redeeming updates the balance everywhere (Home, profile menu, iThrive, Wallet) and adds a line to
the ledger.

## 4 · Set up the catalogue (admins)

A drawer: four switches (one per kind, with who fulfils it) · **Experience prices** — each experience
with a number field (min 100, step 100) · a soft box **Can't be added**: *Appraisal marks — engagement
points can't buy a performance outcome* · *Bonus or salary — pay is compensation, set by HR policy* ·
**Done**.

## 5 · Points off → Experiences

H1 **Experiences** · *This workspace doesn't use points. These are the experiences a manager can give
someone, as a thank-you.* · only experience cards, no costs · managers and up: **Grant** → *Grant to
someone*; employees: *A manager can give you this as a thank-you.*

## 6 · Figma

Rewards at 1440 and 375 (all, within my points, a filtered kind) · a card affordable / not yet /
needs approval · the redeem drawer in each case · the waiting strip · Set up the catalogue ·
Experiences (points off) for a manager and an employee.
