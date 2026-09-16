# 024 · Sign in — the photo and the panel

**Status:** built in code · `/auth` · reference: the Swiftt sign-in shown in the 16 Sep meeting

---

## 1 · What changed

The old sign-in was a two-column split: a form column on the left, a dark showcase on the right
with a product card, an insight card and a testimonial. The meeting asked for the opposite —
*cleaner, minimal content, smaller card, rounded modern edges* — and pointed at Swiftt.

Now a **photo fills the screen** and a **white panel rides over its right edge** with 40px rounded
corners. The panel carries almost nothing.

## 2 · The photo

`/auth/nightshift-worker.jpg` — a frontline worker on a night shift, lit in the brand's own
periwinkle. Chosen over the office celebration shot on purpose: *for the whole workforce — desk
and frontline* is the wedge, and it should be the first thing an investor sees, before a word.

- `object-cover`, focus `50% 40%`; a 1.6s settle from 1.06 → 1.0 scale on load.
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
states.
