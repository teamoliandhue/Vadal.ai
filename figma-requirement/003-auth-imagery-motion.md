# 003 · Auth & Onboarding — imagery + motion layer

**Status:** built in code · extends [002](./002-auth-split-screen-redesign.md) (layout unchanged;
this adds the photographic layer and the motion system).
**See it live:** `http://localhost:3001/auth` at ≥1024px. Walk any demo persona to feel the
step transitions and the final launch moment.

---

## 1 · Photography (new asset layer)

Two brand-generated editorial photographs live in `apps/product/public/auth/` — dark, cinematic,
lit with Vadal's periwinkle-violet + teal accents, no logos/readable text. They tell the two
sides of Vadal's audience story:

| File | Moment | Used on variants |
|---|---|---|
| `team-celebration.jpg` | Office team celebrating a teammate (recognition energy) | pulse · ai · recognition · branding |
| `nightshift-worker.jpg` | Warehouse night-shift colleague smiling at her phone (the deskless persona Vadal reaches) | manager · privacy |

**Placement:** a 300px-tall photo card (radius 22, `white @8%` border, deep shadow, **−2°
rotation**) sits behind the product-UI cards; the UI cards overlap it, pulled up ~96px. A
bottom gradient (`#101014 85% → transparent`) fades the photo into the panel so the cards
stay legible.

Art direction for future images: editorial candid, Indian workplaces (office + deskless),
near-black shadows, violet/teal practical lighting, genuine emotion, shallow DOF, no text.

## 2 · Motion system (all respect `prefers-reduced-motion`)

**Showcase panel (right)**
- Grid: slow diagonal pan (background-position 0,0 → 44,88px · 60s linear loop).
- Aurora blobs: two glows drifting/scaling in opposition (16s / 20s ease-in-out alternate).
- Photo card: Ken-Burns on the image (scale 1.02→1.13 with slight pan · 26s alternate) +
  entrance (fade, rise 22px, scale .97→1 · 0.7s spring-ish cubic-bezier(.22,.9,.3,1)).
- UI cards: staggered entrance (fade + rise 16px · 0.6s, delays 180ms / 320ms), then a
  gentle 8px float loop (7s alternate, phase-offset per card).
- Caption fades in at 500ms. **Everything re-plays when the step/variant changes** (the
  block remounts), so each onboarding step feels like a scene change.

**Form column (left)**
- Step content: slide-in on every step change (fade + rise 14px · 0.42s cubic-bezier(.22,.9,.3,1)).
- OTP boxes: on each digit, the box pops (scale 1→1.09→1 · 0.22s overshoot curve) and its
  border turns violet.
- Progress dots: active dot stretches to a 22px pill (existing 500ms transition).

**The launch moment (onboarding finish)**
- Full-screen overlay on `#101014`, fades in 0.45s: pulsing violet/teal radial glow
  (1.6s alternate), the SparkMark in a 64px Aurora-gradient circle springing in
  (scale .6→1, overshoot) with a 60px violet outer glow, headline
  "Launching «tenant»'s workspace…" (admin) / "Setting up your space, «name»…" (others),
  sub-line recapping what was set up. Holds ~1.4s, then lands on Home.

## 3 · Figma notes

- Add the two photos as fills on the `Auth/Showcase/*` components from 002 (photo card
  behind the UI cards, −2° rotation, bottom fade).
- Prototype: use Smart Animate for the step scene-change (photo + cards rise/stagger) and
  an After Delay 1400ms transition on the launch overlay → Home.
- The launch overlay is a new frame: `Auth/Launch moment` (dark bg, glow, SparkMark 64,
  the two text lines).
