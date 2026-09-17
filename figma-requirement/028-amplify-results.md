# 028 · Amplify — Results

**Status:** built in code · `/product/amplify` › **Results** (admins only; employees never see the tab)
· source: the 16 Sep meeting ("Amplify analytics — what went out, on which platform, who approved it, reach")

Programme is where comms decides. **Results** is where they answer for it. The screen sorts its
numbers by how true they are and labels each one.

| kind | what it is | label on screen |
|---|---|---|
| **Record** | who approved a post into the queue, and when | `RECORD` |
| **Reported** | shares people confirmed ("Did you post it?") — we have no platform APIs | `REPORTED` |
| **Modelled** | reach, from follower counts × typical organic reach per platform | `MODELLED` |
| Counted | referral clicks through our own link, hiring posts only | column header |

---

## 1 · Tabs

Amplify's admin switch becomes **Share · Programme · Results** (the existing pill control, 44px on
touch, 36px at `lg`).

## 2 · Header and the one filter

*Results* 22/700 · *What went out, who approved it, and what came back.* On the right, one
segmented control — **Last 4 weeks · Last 8 weeks** — which scopes every number, chart and row
below it. Remembered per person.

## 3 · Four stat tiles

`grid-cols-2`, `xl:grid-cols-4`; each a `card-lift` tile: label 13 `--muted` · a kind chip at the
right (11px uppercase, `--soft` pill) · value 26/700 · optional delta · a one-line note 12 `--faint`.

| tile | kind | value (4 weeks) | note |
|---|---|---|---|
| Posts approved | Record | 7 (+ anything approved today) | *by 3 people, since 18 Aug* |
| Shares | Reported | 312 · **+39% vs the 4 weeks before** (success) | *Company posts and people's own moments* |
| Share rate | Reported | 22% | *179 shares from 813 asks on company posts* |
| Reach | Modelled | 24K | *Beyond the company's own accounts* |

## 4 · Shares by platform (chart)

A card, 8 of 12 columns at `xl`. Eyebrow *SHARES BY PLATFORM* · *Per week, as people reported
them.* · a **Chart / Table** toggle at top-right.

**Stacked columns**, one per week:
- Columns **≤ 24px** wide, **4px rounded top**, square at the baseline, a **2px surface gap**
  between segments.
- Stack order bottom → top: LinkedIn, X, Instagram, Facebook.
- Hairline solid gridlines at clean ticks (0 / 25 / 50 / 75 / 100), axis text 11 `--faint`.
- One direct label only: the **latest week's total** on its cap, 12/600 `--ink`.
- Legend above the plot: 10px rounded squares + platform name in `--muted`.
- **Hover or keyboard focus** on a week: the other weeks fade to 45%; a tooltip sits **beside**
  the column (right if there's room, else left): *Week of 1 Sep*, then one row per platform — a
  short line-key, the **value first** (14/600), the name after (12 `--muted`) — and *78 in total*.
- **Table** swaps the plot for a real table: week · each platform · Total.

## 5 · By platform

A card, 4 of 12 columns. A small table — swatch + platform · **Shares** with its share of the
total in 12 `--faint` · **Reach** (modelled; — when nothing was approved on that platform) — then a
one-line reading: *LinkedIn carries most of it: 86% of modelled reach from 4 of 7 posts.*

## 6 · Every post that went out

A full-width card. *EVERY POST THAT WENT OUT* · *Newest first. Nothing enters an employee's feed
without a name against it.* · right: *148 people opted in*.

**At `lg` and up — a table**, `min-w-[860px]`, scrolls sideways if it must:
Post (44px thumb or platform mark · two lines of text · platform) · **Approved by** (avatar,
name, date or *Today*) · Asked · **Shared** (bold) · Passed · Share rate · Reach · modelled ·
Referral clicks (— when none).

A post approved in Programme today appears at the top straight away, with the approver's name and
*In the queue — goes out to people with the next digest* across the number columns.

**Below `lg` — one entry per post:** platform mark + two lines of text · *Approved by Priya
Sharma · 14 Sept* with a 24px avatar · four soft tiles: **Shared · Rate · Reach · Clicks**.

Foot of the card: a one-paragraph key — **Record** · **Reported** · **Modelled** · referral clicks.

## 7 · Programme change

**Queue it** now records who approved and when (toast: *Queued to Plant Ops, HR, Logistics — it's
in Results with your name on it*). Decisions persist across reloads.

## 8 · Chart colour

Four categorical slots, added as tokens and **validated** (CVD separation, normal-vision floor,
lightness band) against the card surface in both modes. Colour follows the platform everywhere —
never its rank.

| slot | light | dark | Amplify |
|---|---|---|---|
| `--viz-1` | `#6d5df0` | `#8b7cf6` | LinkedIn |
| `--viz-2` | `#eb6834` | `#d95926` | X |
| `--viz-3` | `#1baf7a` | `#199e70` | Instagram |
| `--viz-4` | `#eda100` | `#c98500` | Facebook |

Slots 3–4 sit under 3:1 on white, which is why every chart has a legend and a table view.

## 9 · Figma

Results at 1440 (4 weeks, chart and table views, a hovered week) and 375 · the post entry on mobile
· the *In the queue* row · dark mode · a `Viz / Categorical` colour set with the four slots.
