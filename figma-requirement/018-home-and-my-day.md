# 018 · Home and My day — splitting the ritual from the product

**Status:** built in code · `/product/home` and `/product/myday`

---

## 1 · Home was doing two jobs badly at once

It was the personal morning ritual **and** the only screen anyone saw first. So a product with
seventeen sections was represented by one person's to-do list, a calendar and a kudos card.

Neither job was served. The ritual was buried under eight stacked cards, and everything else —
the listening stack, the wellbeing engine, the advocacy programme, the crisis-safe support door —
was real, built, and invisible unless you already knew to click into it.

## 2 · The split

| | |
|---|---|
| **Home** | The ritual hero, then a live showcase of what the product does |
| **My day** | Everything that was below the hero, unchanged: what needs you, calendar, who you are here, kudos, communities, feed, Ask Vadal |

### On the name

**Not "Dashboard".** Pulse *is* the dashboard — the org intelligence view — and Analytics sits
beside it. A third thing called Dashboard that is actually a personal task list would collide
with both.

**"My day"** is warm, matches Vadal's voice, and is literally the name of the card already inside
it. It reads correctly in the rail: *My space → Home · My day · Feed*.

Registered in `NAV`, `SECTION_ACCESS` (`ALL_ROLES`), the shell's breadcrumb domain map, and
`MOBILE_PRIORITY` for all four roles — the daily workspace earns a phone slot, because it is the
thing a frontline worker actually opens.

## 3 · The showcase is shown, not listed

**A grid of tiles naming each section was tried first and rejected.** It reads as a sitemap: a
menu of sixteen boxes says *"here are some links"*, not *"here is a product"* — and the
difference matters most to the person who has never seen it.

So **every block is a working slice of the real thing**, on real data, with the real components:

| Block | What is live in it |
|---|---|
| **One score, from everything you listen to** | The number the engine computed this morning, plus its five weighted inputs and the weakest one flagged |
| What people are actually saying | The real sentiment split and top themes |
| Recognition people actually feel | An actual kudos off the wall |
| Their words, going out | The person's own top shareable moment |
| A goal that fits the job | `chooseFocus()` — the ring changes metric with the signed-in role |
| Five minutes is enough | The real streak, and what spaced repetition surfaced |
| A door that never routes through AI | The crisis numbers the support engine returns for this region |
| Answers with the source attached | A real grounded answer from the knowledge base |
| One Copilot, and it can act | The live count of reachable AI features; prompts fire the real dock |

Nothing is a mock of a feature — **it is the feature, at a smaller size**, one click from the whole
of it.

### The flagship earns the width

The health block is full-width with an Aurora hairline and the deepest elevation on the page. The
rest are a two-column pair grid. That ordering is deliberate: the reconciled score is the single
strongest proof the product makes, because it is the one number that could not exist without all
three listening surfaces agreeing.

`Home / ShowcaseBlock` — flagship (full width) and paired variants.

## 4 · Tap targets, on the screen most likely to be opened on a phone

The seven section CTAs rendered at **20px**, and the view-as switch and Up-next button at 32px —
the latter two pre-existing. All at 44px on touch, relaxed at `lg`. This is the landing screen; a
20px text link was the wrong control for the only route into each section.

## 5 · What to draw

1. `Home / ShowcaseBlock` — flagship and paired
2. The nine blocks at 1440 and 375
3. `Home / RitualHero` — unchanged, but now followed by the showcase rather than a card stack
4. `My day` — the previous Home body with no hero
5. Rail and mobile bar with **My day** in place
