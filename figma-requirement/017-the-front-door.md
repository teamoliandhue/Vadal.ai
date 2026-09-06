# 017 · The front door

**Status:** built in code · `/` (and `/overview`)
**Built for a specific audience:** someone seeing the product for the first time, with about five seconds of patience.

---

## 1 · The first five seconds were a sign-in form

`/` redirected to `/product/home`. Home sits behind `AuthGuard`. So anyone arriving without a
session was bounced to **a login screen** — **zero of sixty-eight AI features visible**. After
picking a persona they landed on one employee's daily workspace, which surfaces about three.

The breadth was real and completely invisible. That is the worst version of the problem: not a
product that lacks depth, but one that hides all of it.

## 2 · What this deliberately is not

**Not a marketing page.** The visitor is about to use the actual product. A page of claims
followed by the real thing makes the real thing look smaller — and an investor who has just read
"AI-powered engagement platform" then sees a dashboard has learned nothing.

It is an **index**: every section that exists, one line on what it does, what it costs to open,
and one click into any of it. **The grid is the argument** — seventeen live sections read as depth
in a way no paragraph does.

## 3 · The one measurement that mattered

> **16 of 17 sections visible without scrolling** at 1512×950.

The first build put four above the fold, which defeats the entire purpose. Getting from four to
sixteen was one structural decision: eight stacked domain groups, each with its own header row,
became **one grid with the domain as a 10px label on the tile.** That costs a line of small type
and buys back ~180px of repeated headers.

`Overview / SectionTile` — domain label · lock (when gated) · name · AI count · two-line blurb.

## 4 · Nothing on it can drift

Every element derives from a real source, because a front door that advertises a section the
product does not have is the same failure the AI registry already had once:

| On screen | Comes from |
|---|---|
| Which sections exist | `NAV` — the same model the sidebar renders |
| Who can open each | `SECTION_ACCESS` |
| AI feature counts | `FEATURES` |
| Section count | Counted from `NAV` |

The count initially came from the blurb list, which claimed **17** while the grid drew **16** —
Settings lives in the rail footer, not the nav. Counted from `NAV` now.

AI counts appear only where a section maps **exactly** to a brief pillar. Where the mapping is
rough the badge is omitted: a wrong count is worse than no count on the page whose job is
credibility.

## 5 · Role is the entry choice

Four one-click personas, no password. This is not a convenience — **role decides what exists**,
and that is one of the strongest things to demonstrate. Entering as the frontline operator lands
on the same Home with **8 sections in the rail instead of 16**. The product argues its own case.

`Overview / EntryBand` — four roles, each with what they see.

## 6 · Two honest things on the page

**The top nav is hidden here.** It lists three unbuilt items as "Soon" — the last thing to put
above a product someone is evaluating.

**The footer says the model is not connected.** Retrieval, citations, refusals, role gating,
confirm-and-undo and the crisis tests are all real and enforced; the generated language is
scripted until an API key is set. Being asked about that after they find out is far worse than
saying it first.

## 7 · What to draw

1. `Overview / SectionTile` — with and without an AI badge, with and without the lock
2. `Overview / EntryBand` — four roles
3. The full grid at 1512×950 with the fold marked — **the fold line is the spec**
4. The mobile stack (single column, 375px)
