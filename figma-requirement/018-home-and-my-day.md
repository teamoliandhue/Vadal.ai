# 018 · Home and My day — one day, drawn as a pulse

**Status:** built in code · `/product/home` and `/product/myday`

---

## 1 · Home was doing two jobs badly at once

It was the personal morning ritual **and** the only screen anyone saw first. So a product with
seventeen sections was represented by one person's to-do list, a calendar and a kudos card.

The ritual was buried under eight stacked cards, and everything else — the listening stack, the
wellbeing engine, the advocacy programme, the crisis-safe support door — was real, built, and
invisible unless you already knew to click into it.

## 2 · The split

| | |
|---|---|
| **Home** | The ritual hero, then **one day with Vadal** — the product as a picture |
| **My day** | Everything that was below the hero, unchanged: what needs you, calendar, kudos, communities, feed, Ask Vadal |

**Not "Dashboard."** Pulse *is* the dashboard and Analytics sits beside it. "My day" is warm,
matches the voice, and is already the name of the card inside it: *My space → Home · My day · Feed.*

## 3 · Two designs failed first, for the same reason

A **grid of sixteen tiles** reads as a sitemap. A **stack of preview cards** reads as a dashboard.
Both are containers — they hold content without saying anything. An investor arriving cold does
not need a list of features; they need the *idea*, with the features as evidence of it.

The idea is already in the positioning: **human pulse × daily ritual.** And that is a picture — a
day.

## 4 · The day-line

A heartbeat runs from morning to night. **Above the line, the employee's day.** Below it, **what
the people team hears.** Every beat is a real section, one click away. **The assistant is the
line itself**, because it is the thing that runs through all of it — its label sits on the line
at the centre and opens the dock.

| Your day | The people team's day |
|---|---|
| 07:40 Home — check in, five seconds, private | 08:00 Pulse — one score from every surface, recomputed |
| 08:10 Feed | 09:00 Sentiment — clustered, anonymised |
| 09:15 Recognition — someone noticed | 10:00 Listening — signals between surveys |
| 10:30 Knowledge — answered, with the source | 11:00 Surveys — adapt as answers come in |
| 12:30 Grow — four minutes on the break | 13:00 Manager hub — who needs attention, before the 1:1 |
| 14:00 Amplify — a moment of yours, in your voice | 14:30 Campaigns — what it actually moved |
| 16:30 Thrive — pay landed, move the ₹3,000 | 15:30 Analytics — slice by team, tenure, shift |
| 21:00 One-to-One Help — a door that is always open | 17:00 Cases — confidential, with an audit trail |

**Every chip is live** from that section's own data: `Health 74`, `12-day streak`, `3 due for
review`, `Tele-MANAS · 14416`, `6 open`. The day *is* the product, not a story about it.

### The layout decisions that made it fit

- **One row per lane, eight beats.** Five parts-of-day columns with stacked cards put the lower
  lane 76px below a 900px fold. Eight compact beats per row brings both lanes, the line and the
  claim into one screen. *The whole picture at a glance is the point; nothing else about the
  layout matters as much.*
- **Section names get a short form** where they clip at eight-across: `1:1 Help`, `Listening`.
- **The moment sentence shows only on a phone**, where the card has the width. At 135px it
  truncated to twenty characters, which is noise. It is in the tooltip everywhere.
- **The pulse is one stretched SVG** with non-scaling stroke; the label on it is HTML positioned
  at 50% — a circle inside a stretched SVG becomes an ellipse (same lesson as `DayArea`).
- **The day is role-shaped.** Beats pass through the same gate as the sidebar. A manager sees
  four in the lower lane, in four columns; an employee sees the lower lane replaced by one line
  saying what is there and that they do not have it — *by design*. The footnote under the day
  makes this claim, and for a while the component did not keep it.

## 5 · What to draw

1. `Home / DayLine` — admin (8+8), manager (8+4), employee (8 + the note)
2. `Home / Beat` — you-lane and team-lane variants, with and without a live chip; hover
3. `Home / Pulse` — the line with eight blips and the assistant label on it
4. The page at **1440×900 with the fold marked** — the fold is the spec
5. Mobile at 375: lanes stack, the moment sentence appears, the line runs between them
