# 066 — Home: the nine return, under the work

**Status:** Built · needs Figma
**Supersedes part of:** [062 — Home v2](./062-home-v2.md), which removed the nine entirely
**Related:** [023 — Home, the nine under the greeting](./023-home-the-nine.md) (the original placement)

---

## What changed

Spec 062 took the nine product tiles off Home and put **Waiting on you** in their
place. The reasoning holds — nine vanity numbers under a greeting are a directory,
not work — but the directory itself turned out to be worth keeping. It is now back,
**below** the work rather than instead of it.

Home's running order is now:

1. **Ritual hero** — greeting, one clock, mood check, up next
2. **Waiting on you** — the three to five things that are yours to finish
3. **The nine** ← *new in this spec*
4. **Continue the tour** (if unfinished)
5. **The widget board** — the digest, arrangeable

The order is the whole argument: you see what you owe, then everything there is.
Never the other way round.

---

## The section

| Part | Content |
| --- | --- |
| Eyebrow | `EVERYTHING IN VADAL` — 12px, semibold, uppercase, tracking 0.16em, `text-faint` |
| Heading | **The nine** — 18px, bold, tracking-tight, `text-ink` |
| Right-aligned note | "Each card carries a live piece of its product." — 13px, `text-faint` |
| Grid | 3 columns ≥640px, 1 column below. Gap 12px. |

Top margin `mt-6`, matching the gap between every other Home section. The section
has **no card wrapper** — the nine cards carry their own surfaces, and a card
inside a card doubles the border.

---

## The cards

This is the **same grid Get Started uses**, in its `nav` mode — one component,
two placements. Nothing about the card itself was redrawn for Home.

- Each card: icon tile · pillar name · one-line description · a live fragment of
  that product at stamp size (a sparkline, a bar set, a progress bar, a count, a
  timer) · a large ghost number 01–09 bottom-right.
- **Monochrome and violet.** Colour only where it means something — Amplify's reach
  line is green because it is rising, Managers' is red because it is falling.
- Cards rise on mount, staggered 40ms apart (`rise`, delay `0.05 + i × 0.04s`).

### States

| State | Appearance | Behaviour |
| --- | --- | --- |
| Default | Full opacity, card surface | Link to that product |
| Locked | 70% opacity, padlock beside the name, `cursor: default` | Visible, goes nowhere |

**A locked card is never hidden.** Someone who cannot open Managers should still
know Managers exists — hiding it makes the product look smaller than it is and
makes the nav feel inconsistent between roles.

### Role-aware doors

Filtered by the role in the **Viewing as** switch, and a tile may prefer a
different door from the tour step — but only one the role can actually walk through:

| Pillar | Admin opens | Employee opens |
| --- | --- | --- |
| Listen | `/product` (Insight) | 🔒 locked |
| Social | `/product/social` | `/product/social` |
| Amplify | `/product/amplify` | `/product/amplify` |
| iThrive | `/product/ithrive` | `/product/ithrive` |
| Broadcast | `/product/campaigns` | `/product/knowledge` |
| iLearn | `/product/ilearn` | `/product/ilearn` |
| iCare | `/product/icare` | `/product/icare` |
| Managers | `/product/managers` | 🔒 locked |
| Flow | `/product/flow` | 🔒 locked |

---

## Naming — deliberate, not stale

The cards carry the client's original **nine pillar** names, which are not the
module names in the sidebar. This is intentional and should not be "corrected"
in Figma:

- **Broadcast** is the pillar holding Campaigns and Knowledge
- **Managers** is the pillar for Manager hub
- **Listen** is the pillar covering Insight, Pulse, Sentiment, Listen and Explore

---

## Responsive

- **≥640px** — three columns.
- **<640px** — one column, full width, 16px page gutter, no horizontal scroll.
- Card height is content-driven and identical across a row.

---

## For Figma

The Home screen frame needs a new section between **Waiting on you** and
**Continue the tour**. The nine cards already exist as a component in the
Get Started page — reuse that component set rather than redrawing it; only the
section header (eyebrow, heading, right-aligned note) is new.
