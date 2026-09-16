# 024 · Sign in — the photos and the panel

**Status:** built in code · `/auth` · reference: the Swiftt sign-in shown in the 16 Sep meeting

---

## 1 · What changed

The old sign-in was a two-column split: a form column on the left, a dark showcase on the right
with a product card, an insight card and a testimonial. The meeting asked for the opposite —
*cleaner, minimal content, smaller card, rounded modern edges* — and pointed at Swiftt.

Now a **photo fills the screen** and a **white panel rides over its right edge** with 40px rounded
corners. The panel carries almost nothing.

## 2 · The photos, one after another

The single night-shift photo is gone. The photo block is now a **slideshow of the workforce** —
one person, one job, one part of the world per slide, so *for the whole workforce* is shown
rather than claimed. All are Soul Cinema portraits lit in the brand's own periwinkle on
near-black, 3:4, shipped as 1050 × 1400 JPEGs in `/auth/`:

| # | file | who |
|---|------|-----|
| 1 | `slide-1.jpg` | a warehouse worker, scanner in hand — West African man |
| 2 | `slide-2.jpg` | a nurse on a ward, tablet in hand — East Asian woman |
| 3 | `team-celebration.jpg` | the office team, together |

Three more are queued for the same set — a Latin American factory technician, a Middle Eastern
desk worker, a South Asian retail associate — and drop into the same list.

- Every slide is `object-cover`, focus `50% 35%` (people) / `50% 45%` (the team).
- **Advance every 6.5s.** The next slide fades in over 1.4s while the one leaving fades out
  underneath; each slide also settles from 1.06 → 1.0 scale over 7.5s (a slow Ken Burns push),
  so nothing is ever still.
- The wash and the headline (§below) sit *over* the slides and never move.
- **Top-right, over the photo:** the index as three dashes (the current one 18px white, the
  others 6px at 40%) and a round **Pause / Play** control — 44px on touch, 36px at `lg`,
  white on 30% ink with a 25% white ring and a backdrop blur. Paused holds the current slide.
- `prefers-reduced-motion`: no fade, no push — the current slide is simply shown.

The wash, the headline and the hairline are unchanged from the first cut:

- A vertical wash: 15% ink at the top, clear through the middle, 72% ink at the foot, so the
  headline reads on any crop.
- **Low-left, on the photo:** *Nine HR products.* ⏎ *One AI that acts.* — white,
  `clamp(26px, 3.4vw, 44px)`, −0.03em, a soft 24px shadow; under it *For the whole workforce —
  desk and frontline.* at 75% white; then a hairline at 25% white, 560px max. The three rise in
  0.7s with a 120ms stagger.

## 3 · The panel

`--card`, **42% wide at `lg`**, full height, `rounded-l-[40px]`, a −24px shadow cast leftward onto
the photo, entering from the right in 0.7s. The photo underneath is 60% wide, so the panel's
rounded corners sit *on* it (a 2% overlap) — that is the whole Swiftt move.

Inside, top to bottom: the wordmark · **Welcome back** (30px/700) · *Sign in with your company
email — it routes you to your workspace.* · one field (`Work email`, 12px violet focus ring) ·
**Continue →** · a hairline · `DEMO · SIGN IN AS` with the six roles as **pills** (34px at lg,
44px on touch; the email in the tooltip) · at the foot, the trust line and *Powered by ✦ Vadal*.

The method and code steps are unchanged in content and now live on the same panel.

## 4 · Below `lg`

The photo becomes a 46vh banner with the headline; the panel follows with `rounded-t-[32px]`,
pulled 32px up over the banner, and rises into place. Nothing on the panel under 44px.

## 5 · Figma

1440 × 900 and 375 frames, light and dark; the three steps (email · method · code); the pill
states; the three slides with the index and the Pause / Play control in both states.
