# 029 · Insight — adoption, counted without points

**Status:** built in code · `/product` (Insight) › Overview strip and **Adoption** tab ·
`/product/analytics` gains two metrics · source: the 16 Sep meeting ("points off is a product mode —
adoption needs a points-independent metric; DAU/WAU and check-in rate as first-class")

Points can be switched off per workspace, so adoption can't be read from anything points-shaped.
Every figure here counts something a person **did**.

| metric | definition |
|---|---|
| **Weekly active** | opened Vadal at least once this week, as a share of people in scope |
| **Checked in this week** | did the daily check-in at least once this week |
| **Daily / monthly** | people on a typical day ÷ people active this month (stickiness) |
| **Activated** | signed in at least once since launch |

All org figures are computed from per-team numbers (headcounts add up to 12,480), so the org view
and any team scope always agree. The old "Platform usage" card is removed — it labelled daily
active as "DAU/MAU" and had no check-in rate.

---

## 1 · Overview — the adoption strip

Directly under the KPI row, before *Action queue*. Adoption sits beside the other headline signals
rather than a tab away.

- Eyebrow **ADOPTION** · *Are people using it? Counted from what they did, not from points. Change is
  over the last 4 weeks.* · right: **See adoption →** (opens the tab).
- Four tiles (`grid-cols-2`, `xl:grid-cols-4`), each: label 13 `--muted` · change in points at the
  right (success up / danger down / faint flat) · value 24/700 · a 12-week sparkline in `--viz-1`
  (the first two tiles) · a one-line note 12 `--faint` with the real counts
  (*11,075 of 12,480 people opened Vadal this week*).

## 2 · The Adoption tab

Top to bottom:

1. **The same four tiles.**
2. **Weekly active and check-ins** (8 of 12 cols) · **Desk and frontline** (4 of 12).
3. **By team** (7 of 12) · **What brings people back** (5 of 12).
4. **Knowledge & AI** (unchanged).

### Weekly active and check-ins — line chart

- Eyebrow *ADOPTION · 30 DAYS* · title · a **Chart / Table** toggle.
- *Share of everyone, per week.* · a line-key legend: *Weekly active* (`--viz-1`), *Checked in* (`--viz-2`).
- Two **2px lines**, round joins; y-axis 40%–100% with hairline gridlines; week labels thinned to
  avoid collisions. End dots **r=4 with a 2px card-colour ring**; the latest values are labelled at
  the line ends (only when the two ends are ≥16px apart).
- **Crosshair** hover snaps to the nearest week; the chart is focusable and **← / →** step through
  weeks. The tooltip sits beside the crosshair: *Week of 31 Aug* · **87%** Weekly active · **67%**
  Checked in.
- The window follows the page period: 7 days → 6 weeks, 30 days → 8, Quarter → 12.
- A reading underneath, computed from the series (*Weekly active is up 9 points over 8 weeks,
  check-ins up 9 points. Check-ins still trail weekly active by 20 points — the check-in is the habit
  to build.*) · **Slice in Analytics ↗**.

### Desk and frontline

Two single-series bar groups — *Weekly active* and *Checked in this week* — rows **Desk** and
**Frontline**, 12px bars with a 4px rounded end, value at the tip, headcount beside the label. A
reading: *Frontline teams check in more than desk teams (71% vs 66%), though slightly fewer open
Vadal each week. The check-in works on the floor.* In a team scope it shows that team alone and the
title reads *Engineering is a desk team*.

### By team

A table, **lowest weekly active first**: Team · People · **Weekly active** · Change (▲ success / ▼
danger / *flat*) · Checked in · On a typical day. In a team scope the table stays org-wide (tagged
*Org-wide*) with that team's row tinted `--lav`. A reading: *Engineering is falling — down 4 points in
4 weeks, with the lowest check-in rate (52%). Night shift gained 9.*

### What brings people back

*Share of weekly-active people who used each part of Vadal* — one bar list, highest first: Daily
check-in 77% · Social 64% · Nudge 41% · Kudos 38% · Knowledge 29% · iLearn 26% · Pulse surveys 19%.
Shifts sensibly per team (frontline teams lean on the check-in and iLearn). **Explore →** asks Nudge.

## 3 · Analytics

Two new metric cards in the strip: **Weekly active** and **Check-in rate**, sliceable by team,
tenure, location and seniority, with the same team values as Insight.

## 4 · Also fixed

- Two KPI sparklines (*Employees at risk*, *Manager score*) rendered with a **solid black fill** —
  their gradient ids contained spaces. Ids are now made safe inside the chart primitives.
- *Explore* and *Slice in Analytics* links are 44px tall on touch.

## 5 · Figma

Overview with the strip · the Adoption tab at 1440 (org scope, and a team scope showing the tinted
row) and 375 · the line chart with the crosshair and tooltip · the table view · dark mode.
