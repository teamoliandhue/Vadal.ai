# 014 · Thrive — everything below the hero

**Status:** built in code · `/product/thrive`
**Extends [011](./011-thrive-redesign.md).** The hero was rebuilt there; this is the rest of the page.

---

## 1 · One beautiful thing, then eight identical containers

The hero got a ring, a real chart and a composition. Below it the page collapsed back into eight
cards of the same shape, the same weight and the same grey — and the two most interesting ideas
in the whole pillar were the two rendered worst.

## 2 · A challenge with no progress on it is a signup form

Three bordered rectangles with a **Join** button. For the one you had **already joined** it said
*"Joined"* — and nothing else.

The substance of a challenge is the daily result. So the one you are in is pulled out and given
the room; the ones you are not in stay compact, because browsing is a smaller job than doing.

### 2.1 `Chart / StreakStrip` — a new primitive

A daily challenge is **not a trend and not a total.** It is a run of pass/fail days against a
fixed bar, and the only question anyone asks of it is *"which days did I get it?"* A line chart
answers the wrong question; a single percentage throws the pattern away.

- **One mark per day.** Height carries how far you got, fill carries whether you cleared it.
- **Days not yet played are drawn as empty slots**, not omitted. *"9 days left"* is the
  motivating half of the picture, and a strip that stops at today hides it.
- **The target is drawn as a dashed rule across the plot.** This is not decoration — without it
  the marks encode pass/fail in *fill alone*, and day 5 at 9,700 stands almost exactly as tall as
  day 1 at 10,400. The line is the whole question.
- Cleared = taller **and** solid. Missed = shorter **and** hollow with a 1.5px inset ring. The
  pattern survives being printed in grey.
- Hovering a day swaps the caption to that day's figure and how far short it fell.

### 2.2 The active challenge card

A 3px rule across the top in the challenge's own hue, then the strip, then the one number that
justifies staying in it: **+63% on your usual day since you joined**, at 26px in that hue, with
the comparison spelled out beneath (9,767 against 6,000). Rank and days-left sit beside it at
13px — deliberately not equal billing.

### 2.3 Three challenges were one challenge three times

Each kind now carries its own hue and mark: **Steps** periwinkle · **Active minutes** green ·
**Distance** amber. Drawn from the Signal palette, not invented.

`Thrive / Challenge / Active` and `Thrive / Challenge / Row` — three kind variants each.

## 3 · The leaderboard's argument is a shape, so draw the shape

The fair-cohort logic is the best thing on this page. It was four boxes of small grey numbers
with the argument written underneath in a footnote:

> A picker walks 18,000 steps doing their job. A designer walking 8,000 has tried much harder.

Writing that out while drawing something else is the wrong way round. Every person is a bar now —
and **the one decision that matters: every bar is scaled against the same maximum across all
groups, not within its own.**

So the on-site bars run long and the desk bars run short, and why you cannot put them in one
ranking is visible in half a second without reading anything. **Scaling per group would have
looked tidier and destroyed the entire point.** Do not "fix" this in Figma.

Your own cohort's bars carry the brand colour; every other group is muted. Your own row is
labelled **You**, sits on a soft ground, and is the only name replaced by a pronoun.

`Thrive / Cohorts` — note the global scale in the component description, or it will be rebuilt wrong.

## 4 · "Side by side" was a claim the layout did not make

The brief asks for *"physical health and financial health, side by side."* The page was making
that claim with a two-column grid of identical cards, which reads as eight things rather than two
halves.

Each half now opens with `Thrive / HalfHeader`: a 40px tinted icon tile, the half's name, its
current state in one line, and a hairline that fades out to the right. **Your body** in
periwinkle, **Your money** in green.

## 5 · Two money fixes

**The articles** were four identical grey rows that said nothing about what any of them were.
Someone arrives here with a question about *pay* or about *cover* — not looking for "an article".
The topic is now the leading column at 11px uppercase, the title carries the weight, reading time
and a chevron close the row, and hairline separators replace four boxes.

**The benefits** buried the two facts that decide whether anyone acts. The worth is now **20px
bold in the success colour** (`₹18,000 cover`), and the deadline goes amber and semibold inside
30 days. Closing line: *"You are already paying for these through your package. Unused, they are
money left behind."*

## 6 · One correctness fix worth encoding

`myCohort` fell back to `cohorts[0]` when it could not find the signed-in person — so a group was
badged **You** that was not theirs, telling someone their effort was being ranked against a set
of people it was not. There is no fallback now. Undefined is the honest answer, and the component
renders without the badge.

**Rule for the designer:** every "this one is yours" marker needs a *no-match* variant. It is
never correct to guess which one is theirs.

## 7 · What to draw

1. `Chart / StreakStrip` — cleared · missed · not-yet-played · hovered; **with the target rule**
2. `Thrive / Challenge / Active` — three kind hues
3. `Thrive / Challenge / Row` — three kind hues, joined and not
4. `Thrive / Cohorts` — with the global-scale rule in the description
5. `Thrive / HalfHeader` — both halves
6. `Thrive / Benefit` — inside 30 days (amber) and outside it
7. A **no-match** variant of the cohort card, with no You badge anywhere
