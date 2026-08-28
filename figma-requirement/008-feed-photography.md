# 008 · Feed photography — art direction and placement

**Status:** built in code · replaces the placeholder gradient SVGs entirely.
**See it live:** `/product/feed`, and the composer's photo attachment.

The feed's media posts used pastel gradient SVGs — obviously placeholder art in a product whose
whole pitch is that people open it every day. Five photographs now carry it.

---

## 1 · Art direction

The same direction as the auth imagery in [003](./003-auth-imagery-motion.md), adapted for a
card that renders in **both light and dark mode** rather than on a fixed dark panel.

| | |
|---|---|
| **Register** | Editorial candid documentary. Unposed, mid-motion, nobody looking at the lens. |
| **Subjects** | Indian workplaces — office *and* deskless. At least one image per set must be frontline; the plant floor is not a token inclusion, it is the workforce this product is bought to reach. |
| **Light** | Naturally exposed so it reads on a white card and a near-black one. Warm daylight or a warm practical against cool ambient. Not the near-black cinematic grade the auth photos use. |
| **Lens** | 28–50mm, shallow depth of field, film-like grain. 85mm macro for detail shots. |
| **Emotion** | Genuine. Relief, laughter mid-sentence, quiet pride. Not stock-photo delight. |
| **Forbidden** | Text, logos, signage, watermarks, readable screen content. |

**Generated, not licensed stock.** Stock licensing is a real liability in a client product, and
generating keeps the direction consistent with `public/auth/`. Model: `soul_2`, 16:9, 2k.

**Delivery spec:** 1600×900 JPEG, quality 78, roughly 250–420 KB each. Rendered at 588×235 in the
card, so 1600 covers retina with headroom.

---

## 2 · The five images

Stored in `apps/product/public/feed/`.

| File | Subject | Post it carries |
|---|---|---|
| `wellbeing.jpg` | Four colleagues on floor cushions with chai, mid-laugh, laptops closed | Pradeep's wellbeing-campaign announcement |
| `ship.jpg` | Two engineers at a monitor, evening, one pointing, one grinning | Aarav's "shipped the new search" |
| `plant.jpg` | Three workers in hi-vis at shift handover on the plant floor | **New** — Sunita Rao's 200-days-no-incident post |
| `milestone.jpg` | Colleagues clapping around a man at his desk, cake on the table | Arjun's three-year anniversary |
| `coldbrew.jpg` | Cold brew pouring into a glass, macro, warm side light | Dev's cold-brew-tap post |

### The new post is deliberate

`plant.jpg` carries a post that did not exist before:

> **Sunita Rao · Shift Supervisor · Night shift**
> *"**200 days on Line 2 with no lost-time incident.** That is not luck — it is the pre-start
> checks, every shift, by everyone. Proud of this crew. 🦺"*

Two reasons it earns its place. It is the post the Copilot's own example refers to — ask Vadal
to *"write up the Line 2 safety streak as a post"* and the feature and the feed now point at the
same thing. And it is the **only post authored by someone who never sits at a desk**, in a feed
that was otherwise entirely office workers.

---

## 3 · Placement rules

**Media renders** as a full-width block inside the post card: `rounded` container, `aspect
5/2`-ish (588×235 at desktop), `object-cover`, with a `scale(1.03)` hover over 500ms.

**Not every post takes an image.** Roughly half is right — a feed where everything has a banner
reads as a marketing page, not a place colleagues talk.

**Event posts get no banner.** The offsite post previously carried one; it now has none, because
the event block (title, date, location, going-count, attendee avatars) already carries the visual
weight. A banner above it competes rather than helps.

> One image is outstanding: a coastal offsite shot, which hit the generation service's daily
> limit. Nothing is broken without it. If it is made later it goes on the offsite post **only if**
> the event block is redesigned to sit alongside rather than beneath it.

---

## 4 · Composer

The photo-attachment tray offers the same five real images instead of the four gradients. The
shuffle control stays as-is: a `bg-black/55` pill, bottom-right of the preview, 12px/600 white,
label **Shuffle art**.

---

## 5 · Known artifacts

Invisible at the 588px the feed renders, visible if a founder zooms in on the source file:

- `wellbeing.jpg` and `milestone.jpg` — a laptop logo, and slightly garbled micro-text on a
  t-shirt and some stickers
- `plant.jpg` — garbled text on helmet stickers and a wall panel

Regenerate those two if the images will ever be shown at full size. Not worth doing for the feed.

---

## 6 · What to draw

1. Update `Component / Feed / Post` — replace the gradient placeholder fill with the real images
2. Add the **Sunita Rao / Plant Ops** post to the feed frame — it changes who the feed represents
3. Remove the banner from the event-post variant
4. Update the composer's attachment tray to the five photographs
