# 012 · The scroll model — an app shell, and two-pane pages

**Status:** built in code · applies to the whole product shell.
**See it live:** `/product/feed` at 1280px and up — the stream and the rail move independently.

---

## 1 · The product was scrolling like a document

Everything on a page moved as one, and three separate mechanisms were each compensating
for that:

| Element | How it held still | What it was really working around |
|---|---|---|
| Top bar | `sticky top-0` | the page sliding out from under it |
| Sidebar | `h-screen` + `sticky` | the same |
| Pulse filter bar | `sticky top-[57px]` | a hand-measured offset around the top bar |
| Feed context rail | `sticky top-6` | the rail being dragged along by the stream |

Four hacks for one missing decision. And the last one was not merely inelegant — it was
**broken**. `sticky` looks right until the element is taller than the window: it pins, and
everything past the fold never arrives. On a 900px-tall screen the Feed rail is 1,571px
tall, so **736px of it — trending topics and the entire new-joiner list — could not be
reached at all.** Not by scrolling, not by any means.

## 2 · The shell holds still; the content scrolls inside it

From **lg (1024px) up**, the chrome is simply fixed — rail, top bar, AI dock — and the
content scrolls in a pane beneath it. One scroll region, and nothing needs an offset:
anything `sticky` inside a pane measures from the pane's own top edge, which begins
directly under the top bar.

Below lg the document scrolls exactly as it did. Fixed-height panes and mobile browser
chrome — a URL bar that grows and shrinks under your thumb — are a long-standing bad
marriage, and a phone shows one column anyway.

One visible consequence: **the ambient canvas glow no longer scrolls away.** It has moved
into the chrome, so it reads as a light source above the workspace rather than as a
decoration you scroll out of the room.

## 3 · Two panes, where a page has a main column and a rail

From **xl (1280px)**, a page laid out as a stream plus a context rail gets **a scroll
region each**. The rail keeps its own place while the stream moves, and it scrolls to its
own end.

Below xl the rail is hidden anyway, the columns stack, and the single pane scrolls them
together. So this is one behaviour with three tiers:

| Width | Document | Shell pane | Column panes |
|---|---|---|---|
| < 1024 | scrolls | — | — |
| 1024–1279 | fixed | scrolls | — |
| ≥ 1280 | fixed | fixed | **each scrolls** |

**Feed is the only page on this today.** See §6 for the rest.

## 4 · Drawing it

`Layout / App shell` — a frame at a fixed viewport height with three regions:

1. **Rail** — 264px, full height, its own scroll for the nav list
2. **Top bar** — 65px, full width of the remaining space, never moves
3. **Content** — everything below, and this is the scroll region

`Layout / Split` — the content region divided into two scroll columns:

- 24px gutter between them
- Each column carries its own **40px top** and **112px bottom** room. The bottom clears the
  AI dock, which floats over the lower-right corner; without it the last card in the rail
  sits under the dock.
- **The padding belongs to the pane, not to the page.** Content must scroll *under* the
  40px so the region reads as a window onto a longer thing. A frame with the padding on
  the outside will be built wrong.
- Feed's proportions: 640px stream · 320px rail, the pair centred within 1100px

## 5 · Two details that are easy to miss

**The scrollbar is quieted.** Two panes side by side means two gutters, so the thumb is a
hairline at 22% of `--muted`, firming to 40% when that pane is hovered. macOS ignores all
of it and shows nothing until you scroll, which is the target — but Windows and Linux
would otherwise show two heavy grey bars through the middle of the page.

**A scroll region has to be reachable by keyboard.** Once the document stops scrolling,
Page Down, Space and the arrow keys have nothing to act on, so every pane is focusable
(`tabindex="0"` with a label). Clicking anywhere in the content focuses its pane, so the
keys work the moment anyone reaches for them. The focus ring shows for keyboard focus only
— a ring drawn around the whole content area on every click would be absurd.

For Figma: the pane needs a **Focused** state — a 2px `--brand` ring inset 2px, on the
region itself.

## 6 · What this leaves open

Every other two-column page — Home, Amplify, Grow, Knowledge, Managers, Recognition — has a
**full-width hero or header above its two columns**, so it cannot simply be split: the
header would either pin (Home's ritual hero is far too tall for that, and would eat a third
of the window) or move into the left column (which narrows it from 1160px to roughly 660px
— a real change to the centrepiece, not a scroll fix).

That is a design decision per page, not a bug, and it is not made here. The primitive is
built and ready for whichever ones we decide to take.

## 7 · What to draw

1. `Layout / App shell` — fixed chrome, one scroll region, at three widths (390 · 1180 · 1512)
2. `Layout / Split` — two scroll columns, with the padding shown as belonging to the panes
3. A **Focused** state on the pane
4. Update the Pulse filter bar: it sticks to the **top of the pane**, not to an offset
