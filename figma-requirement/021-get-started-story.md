# 021 · Get Started — a story, one screen per idea

**Status:** built in code · supersedes the *page layout* of [019](./019-get-started-tour.md);
the mechanics of [020](./020-get-started-by-doing.md) (explored by doing · first visit lands here ·
resume row on Home · rail pill) are unchanged · `/product/get-started`

---

## 1 · Why it changed

The two-pane version — a step list beside a card — read as a setup wizard. The founders'
direction: **cinematic**. One idea per screen, the headline *is* the idea, and the live product
is the picture. You move by scrolling, the way you read anything worth reading.

The nearest references on Mobbin: mymind's scene-by-scene onboarding (full-bleed colour, one
line per screen) and Linear's first-run sequence ending on "You're good to go". Neither shows the
real product as evidence; that is our difference.

---

## 2 · The shell in story mode

`<Shell pane="story">` — no page padding, no 1240px column. At `lg` the scroll pane gets
`scroll-snap-type: y proximity`; every scene is `snap-start` and exactly the pane's height
(`100dvh − 65px` bar). Below `lg` the document scrolls as usual; scenes are
`min-h: 100dvh − 65px − 56px` (bar + tab bar) and grow with content.

---

## 3 · Scene anatomy

| Part | Spec |
|---|---|
| **Light** | Two blurred blobs (620 / 460px, blur 70px), hue `= (index × 34 + 250) mod 360`, alpha 0.16 / 0.12 — the room changes colour with the idea. Side alternates by parity. |
| **Number** | `01`–`11` in `ai-text-grad`, then the section in caps `0.18em` `--faint`; a `Lock` glyph when the role cannot open it. |
| **Headline** | `clamp(34px, 4.6vw, 60px)` · 700 · line-height 1.02 · tracking −0.032em. |
| **Meaning** | `clamp(16px, 1.3vw, 19px)` · `--muted` · max 46ch. |
| **Evidence** | Right column, max 600px: the live demo (real component, real data) inside a `--card`/85 frame, 28px radius, `backdrop-blur`, deep shadow, an `ai-grad` halo at 25% behind it. |
| **Actions** | `Open {section}` (secondary) · `Next ↓` (tertiary) · status row from 020. |
| **Entrance** | `.story-in` children rise 22px → 0 over 0.8s with 0.1s stagger when the scene is on screen; static under reduced motion. |

**Scene 01** is the opening: centred, `clamp(34px, 5.2vw, 68px)` headline — *"A company stays
human when every employee has a daily ritual worth keeping."* — the org card, **Start the tour ↓**
and *Skip for now*.
**Scene 11** is the close: number reads `11 — the end`, then the *You're set* panel from 020.

---

## 4 · Progress

- **Spine** (lg, fixed right, vertically centred): `done/11` above eleven 6px dots; the current
  dot stretches to 22px in the client brand, explored dots are `--success`; hover/focus shows
  `n · title` in a pill to the left; *Start over* beneath once anything is explored.
- **Hairline** (below lg): 3px `ai-grad` bar fixed under the 65px bar, width `(current+1)/11`.
- The scene on screen is remembered (`vadal:tour-step`) and restored on return, without
  animation. Idea scenes (01, 11) are explored by being on screen; action scenes only by doing.

Measured from scroll position, not an IntersectionObserver — a scene that is on screen must never
sit invisible waiting for a callback.

---

## 5 · Second pass — presence, and a demo that runs itself

| Addition | Spec |
|---|---|
| **Watermark number** | `01`–`11` behind the text column: `clamp(150px, 20vw, 280px)` · 800 · tracking −0.06em · `--ink` at 4.5%. Fills the room without competing. |
| **Product window** | The evidence sits in a window, not a card: a 40px chrome strip — SparkMark · **Vadal** · `· Pulse` · right-aligned green dot `Live · oliandhue` — over the demo (min-height 220px, centred). Caption beneath: *"The real component on real data — what you would see in Pulse right now, not a picture of it."* |
| **Parallax** | Each scene knows its distance from centre (`--p`, −1…1, set on scroll); the window drifts `−48px × --p`, a touch slower than the page. Off under reduced motion. |
| **Drifting light** | The two blobs travel 5–7% over 22s / 28s (reverse), so no scene is still. Off under reduced motion. |
| **Scroll cue** | Scene 01, lg only: *"Scroll, or use the arrow keys"* with a softly bouncing ↓. |
| **Keys** | → ↓ PageDown Space = next scene · ← ↑ PageUp Shift+Space = previous · Home / End. Ignored while typing (the ask box) or with a modifier held. |
| **Present** | Pill above the spine (Play ▸ *Present* / Pause ‖ in `ai-grad` while running). Turns the page every 9s until the end; a wheel, a touch, a key or Esc stops it. A status pill at the bottom centre says so: *"Presenting · 9s per idea · scroll or press any key to stop"*. For the investor demo where the hands are busy talking. |

## 6 · Figma

Scenes 01, 03 (locked variant for employee), 09 (ask box asked / cited / refused) and 11 at
1440 × 900 and 375; the spine in three dot states with the hover pill; the mobile hairline.
