# 023 · Home — the nine, under the greeting

**Status:** built in code · `/product/home`

---

## 1 · What

The nine product cards from Get Started ([021 §10](./021-get-started-story.md)) now also sit on
Home, directly under the greeting hero and above the tour-resume row. Same component
(`ProductGrid`), two modes:

| | Get Started (`mode="tour"`) | Home (`mode="nav"`) |
|---|---|---|
| A card is | a button that jumps to that product's scene | a **link to the product** (`/product/recognition` for Kudos, and so on) |
| Locked for the role | shown with the lock; still jumps, the scene explains | shown with the lock at 70%, `aria-disabled`, goes nowhere |
| Entrance | rises with the scene (`story-in`) | rises on mount like the rest of Home (`rise`, 40ms stagger) |

Everything else is identical — the live fragments (sparklines, reactions, bars, the SLA ring),
the ghost index at 2.5%, the hover lift and violet edge, three across from `sm`, one-up below.

## 2 · Why

Home is where every employee lands every day; the nine were only visible to someone who opened
the tour. Now the whole product is one tap away from the greeting, and each card shows a live
fragment of what is behind it before you go.

## 3 · Figma

The Home frame at 1440 and 375 with the grid between the hero and the resume row; the locked
card state (70%, lock glyph, no hover lift).
