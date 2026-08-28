# 009 · Form-field rules — two design-system rules, not two bug fixes

**Status:** built in code · applies to every input, textarea and select in the product.
**See it live:** `/product/feed` → the composer, and any field on a phone-width viewport.

Both of these started as single reported defects. Both turned out to be rules the design system
was missing, so they belong here rather than in a changelog.

---

## Rule 1 · A bare field needs horizontal padding, or it clips its own first letter

### What went wrong

The feed composer's textarea had **zero horizontal padding**. Text began exactly at the element's
edge, so any glyph with a left side-bearing was clipped by it. A capital **Q** lost its curve.
`J`, `y` and italics do the same.

It survived because it only appears when someone happens to type the wrong first letter. The
placeholder starts with a `W`, which has no overhang.

### The rule

> Any text field with a transparent or card-coloured background — one designed to look like bare
> text rather than a boxed input — needs **at least 4px of horizontal padding**, offset by an
> equal negative margin so the text still lines up optically with everything around it.

In Figma terms: the field's text layer aligns to the container's content edge, but the field's own
bounding box extends 4px further out on each side. Do not simply indent the text — that breaks
alignment with the avatar and the elements below.

Boxed fields with visible padding (`px-3` and up) were never at risk. Two fields were: the feed
composer and the Home inline composer — both "write a post" fields, which is exactly where someone
types a sentence starting with a capital.

`Component / Field / Bare` — draw the box edge and the text edge as separate, 4px apart.

---

## Rule 2 · No field below 16px on mobile

### What went wrong

**29 form controls across the product were under 16px.** iOS Safari zooms the entire page whenever
a focused input is smaller than 16px. On a product built for people on phones, the layout was
jumping on every single tap — and it would have been reported as *"the app jumps around on my
iPhone"*, which is very hard to trace back to a font size.

### The rule

> Below 1024px, every `input`, `textarea` and `select` renders at **16px minimum**, regardless of
> what the component's desktop size is.

Enforced once in `globals.css` rather than at 29 call sites, and scoped to small screens so the
denser desktop field sizes are untouched — the zoom behaviour does not exist there anyway.

**For Figma this means every field component needs two sizes**, and the mobile one is not a
proportional scale-down:

| | Desktop | Mobile (< 1024px) |
|---|---|---|
| Field text | 14px (or the component's own size) | **16px** |
| Min height | 40px | **44px** |
| Labels, helper text, badges | unchanged | unchanged |

Only the *field's own text* changes. Labels and helper text keep their desktop sizes — they are
not focusable and do not trigger the zoom.

Checkboxes, radios, range and colour inputs are exempt.

`Component / Field / *` — add a `Viewport = Desktop | Mobile` property to every field variant.

---

## Why these are here rather than in a changelog

A designer reproducing the current screens in Figma will draw the fields at their desktop sizes
and the bug comes straight back the next time a component is built from those frames. Both rules
need to live in the field components themselves.

## What to draw

1. `Component / Field / Bare` — box edge and text edge 4px apart, both marked
2. Add `Viewport = Desktop | Mobile` to every existing field component, with 16px text and a 44px
   minimum height on the mobile variant
3. Note the exemption for checkbox, radio, range and colour in the component description
