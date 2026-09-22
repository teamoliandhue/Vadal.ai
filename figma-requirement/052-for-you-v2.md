# 052 — For you: a lead, groups, and a rail that explains itself

**Route:** `/product/for-you` · **Code:** `apps/product/src/app/product/for-you/` (`ForYou.tsx`, `parts.tsx`)
**Status:** Built · needs Figma

## Why
It was a 760px column of eight identical cards, every one the same size and the same loudness, on a page whose whole job is to say *what to do first*. It also left three questions unanswered: what should I do first, why am I being shown this, and where did the thing I dismissed go?

## Layout
The 1180px shell every other section uses: header, then a two-column grid — suggestions at 1.55fr, a sticky rail at 1fr. Below 1280px the rail drops under the list.

### Header
Eyebrow **Nudge** (gradient spark) · H1 **For you, {first name}** · a summary line of counts: "6 things worth your time · 4 take a minute or two · none of it is urgent". Right: an order switch — **What matters** / **Quickest first** (remembered).

### Start here (the lead)
The first suggestion, set apart: Aurora top hairline, "START HERE" eyebrow, the section chip, the minutes, a 20–26px title, the reason in 16px beside a gradient spark, then **{action}** (brand pill), **Not today**, **Not useful**.

### The rest, grouped by what it costs you
- **Takes a minute** — two minutes or less, start to finish
- **A few minutes** — worth sitting down for
- **When you have time** — no hurry, and no reminder

Each group has a count pill and a hint line. Rows are compact: 40px tinted icon tile, title + "section · N min", the reason, then a bordered action pill, "Not today", and an eye-off icon button for "Not useful".

### The rail
1. **Your week** — check-in streak, September pulse, learning streak, tour left. Hint: "Yours only — none of this is a score anyone else sees."
2. **Why these, today** — up to five plain-language signals the list was built from ("You checked in today", "13 days of check-ins in a row", "4 parts of the tour untouched"), closed by a lock line: "Nudge only uses what you can already see… nothing here is sent to your manager."
3. **Not today** — what you hid, with **Bring back**. Previously an item vanished with a toast and no way back until tomorrow.
4. **Muted** — count of "Not useful" suggestions, with **Unmute all**.
5. A closing card: "Nothing here is a task list — Vadal never counts what you skipped."

### Empty state
Unchanged in spirit: gradient spark, "You're all caught up", and a line that changes depending on whether anything is sleeping until tomorrow.

## Behaviour
- **Not today** hides until tomorrow (dated key) and the item appears in the rail.
- **Not useful** mutes permanently, in its own store, reversible from the rail.
- Order switch re-sorts by minutes; the lead is always the first item of the current order.
- Every suggestion is still access-gated by section, so nobody is offered a screen they cannot open.

## The craft layer
- **A colour system by module.** Each suggestion's section has an accent — violet (Home, For you), amber (Kudos), orange (iLearn, Get Started), green (iThrive, Social), blue-violet (Pulse, Manager hub, Amplify). It tints the icon medallion and its inner ring, and paints a 3px bar that slides in on hover. Colour says *where this belongs*, never how urgent it is.
- **Medallions, not flat tiles.** 44px (60px on the lead) rounded squares, tinted 13% with a 22% inner ring.
- **The lead card** carries the Aurora hairline, a radial wash of its own accent bleeding from the top-right, a 30px radius, a deeper shadow, and a brand button with a coloured drop shadow.
- **Group heads** are a label, a count pill and a hairline that runs to the edge — the page's only divider.
- **Motion**: cards rise in with a 45ms stagger, rows lift 2px on hover, and the "not useful" control only appears on hover or focus, so the resting state stays quiet.
- **The week strip** in the rail: seven blocks, Monday-first — solid for a day you checked in, grey for a day you missed, an outline for a day that has not happened yet, and a ring on today. A streak is a shape before it is a number.
- **Meters** for learning streak (orange) and tour progress (green), so the rail has rhythm rather than four identical rows.
- **Picked up today**: opening a suggestion keeps it, moves it to its own group at the bottom at 70% opacity with a green "Opened today" check, and adds a count chip to the header. The day adds up instead of emptying out.
- **Header**: eyebrow reads "Nudge · Tuesday 22 September"; the counts are chips rather than a sentence.

## Figma to build
1. For you 1440 — lead + three groups + full rail.
2. The same with something hidden (the "Not today" rail card) and one muted.
3. Empty state.
4. Phone 375 — header, order switch, lead, one group, rail stacked underneath.
5. Dark mode of 1.
