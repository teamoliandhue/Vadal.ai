# 034 · Home — the digest, and widgets you arrange

**Status:** built in code · `/product/home` · source: `docs/DECISIONS.md` §3 · roadmap v1 *Home as
digest* + v2 *Widget library + drag-and-drop Home* + v3 *employees configure their own widgets*

Home keeps its greeting with the **daily check-in** (the one thing you do on Home) and the nine product
cards. Below them, **Home is a digest** — read-only, every line a way to somewhere else — built from
widgets people can rearrange.

---

## 1 · Default layout

| left (7/12) | right (5/12) |
|---|---|
| Team snapshot *(managers and up)* | Last week |
| Yesterday | What's new |
| Your week ahead | |

Below `xl` the columns stack, left first.

## 2 · The four digest widgets

All share the card: eyebrow (12 uppercase faint) · title 18/700 · content.

**Yesterday — *While you were away*.** Rows: 36px soft emoji tile · one sentence with the names and
the point in bold · arrow on hover. The whole row is the link (52px tall). Filtered by role and by what
you can open: admins see *4 posts are waiting for review*; managers see *Rohan's check-ins dipped
three days running*; everyone sees their kudos, community activity and milestones.

**Last week — *Your week, in short*.** A 2-column grid of soft tiles: *Checked in 5 of 5* · *Kudos 3
in · 2 out* · *Learning 34 min* · *Your team 83 · +2* · (admins) *Weekly active 89%* · (points on)
*Points +145*. Then one sentence on what changed, key phrase in bold.

**Your week ahead — *What's coming*.** Grouped by day: a 48px day column (*MON* / *21*) and a stack of
bordered rows (calendar icon · title · meta · arrow). Items without a destination — a calendar
meeting — are rows without an arrow. Role items appear only for their roles.

**What's new — *Around oliandhue*.** Same row style as Yesterday: policy changes, campaigns starting,
new communities, what's new in Vadal.

## 3 · Customise

A bar above the widgets: eyebrow **YOUR DIGEST** · **Customise** (tertiary, grid icon).

In customise mode:
- Each widget gets a dashed violet outline and a **toolbar pill** above it: drag grip (desktop) ·
  emoji + title · **↑ ↓** · **← →** between columns (desktop only) · **×** remove. Buttons 44px on
  touch, 32px at `lg`. The widget's own content is inert while editing.
- **Drag** (desktop): the dragged widget fades to 40%; a 4px violet bar shows where it will land; each
  column ends in a dashed drop zone (*Drop here to put it last*).
- Top bar becomes **Add widgets · n** · **Reset** · **Done**.
- Moves are announced to screen readers.

**Add widgets** drawer: every widget not on Home, each row with a 44px emoji tile, title, one line and
**Add** (goes to the bottom of the shorter column).

**Reset** returns to the default digest. Layouts are remembered per person.

## 4 · The library (14)

Yesterday · Your week ahead · Last week · What's new · Team snapshot (managers) · My day (to-dos) ·
Today's calendar · You (streak, badges, trend) · Daily hooks · Quick poll · Kudos · Communities ·
Ask Nudge · Social feed.

## 5 · Also fixed

The check-in's *Change* link and *Want to talk about it?*, and the *Up next* button, are 44px on touch.

## 6 · Figma

Default Home for employee, manager and admin at 1440 and 375 · customise mode with a drag in progress ·
the Add widgets drawer · each digest widget on its own.
