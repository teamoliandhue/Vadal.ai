# Vadal — design system & website art direction

> Read [`vadal.md`](./vadal.md) first for product context. This file is the **visual source of
> truth** for the marketing website: brand, color, type, components, motion, voice, imagery, and
> the reference sites to model. It's written to be self-contained so it travels with this folder.

---

## 1. Brand identity — "Signal"

Vadal's chosen identity is **"Signal"**: *the V planted like a flag, with a lens aperture carved
through it, and a four-point spark held in reserve.* The story: a signal/flag you rally around,
a lens that brings clarity, and a spark of intelligence.

- **Product-design style = "Lumen"** — warm, human, light + dark. Not cold/corporate SaaS.
- **Positioning line = "Human pulse × Daily ritual"** — keep companies human at scale, in an
  app people open every day.
- **Logo files:** in [`assets/brand/`](./assets/brand) — `signal-lockup.svg` (full lockup),
  `signal-mark.svg` / `signal-icon.svg` (mark only), `lockup-light.svg` / `lockup-dark.svg`.
- **SparkMark** — a 4-point spark (from Signal's "spark held in reserve"), filled with the
  Aurora gradient. It's the **AI** logo; use it wherever intelligence appears.

---

## 2. Color system

Two layers: **Aurora** (the expressive brand/intelligence gradient) and **Lumen** (the warm,
calm neutral foundation everything sits on).

### 2.1 The golden rule
> **Brand violet `#7C5CF8` = the user's actions** (primary buttons, links, active states).
> **The Aurora gradient = "this is intelligence."** Never use the gradient for an ordinary CTA,
> and never use flat violet to mean "AI." This single rule keeps the brand legible.

### 2.2 Aurora — the brand gradient (locked: the "Clarity" variant)
Teal → blue → violet. Use for: the hero moment, AI/SparkMark, data-insight highlights, key
section accents. Keep it for *signature* moments — over-use cheapens it.

| Stop | Light | Dark |
|---|---|---|
| from (teal) | `#23D7BE` | `#3DEBD0` |
| via (blue) | `#3B9EFF` | `#52ACFF` |
| to (violet) | `#7C5CF8` | `#9270FF` |
| spark accent | `#FF8A5B` | `#FF9D6B` |

`linear-gradient(135deg, #23D7BE 0%, #3B9EFF 50%, #7C5CF8 100%)`

### 2.3 Brand solid + accents
| Role | Value | Use |
|---|---|---|
| **Brand / violet** | `#7C5CF8` | primary buttons, links, focus rings, active nav |
| Brand hover/active | derive ~8–12% darker | interactive states |
| **Signal red** | `#FB4B43` (dark `#FF5A50`) | energy/alert accent, sparing highlight |
| Spark apricot | `#FF8A5B` | warm secondary accent, illustration highlights |

### 2.4 Lumen neutrals — light (the website's default canvas)
| Token | Value |
|---|---|
| background | `#FFFFFF` |
| surface / subtle (sections, cards on white) | `#F6F7F9` |
| card | `#FFFFFF` |
| foreground / ink | `#1A1B1F` (deepest `#0D0B16`) |
| muted text | `#6B6E78` |
| line / border | `#ECECF1` |

### 2.5 Lumen neutrals — dark
| Token | Value |
|---|---|
| background | `#0D0D11` |
| card | `#17171D` |
| foreground | `#ECEDF1` |
| muted text | `#9D9FAB` |
| line / border | `#26262E` |

### 2.6 Status colors
| State | Light | Dark |
|---|---|---|
| success | `#00D579` | `#00E98D` |
| warning | `#F5B72E` | `#FFC24D` |
| danger | `#FB4B43` | `#FF5A50` |

> The product implements these as CSS variables (`--background`, `--foreground`, `--brand`,
> `--muted`, `--line`, `--ai-grad-*`, `--spark`, …) in a `.lumen` light/dark scope. **Port the
> same variable names** into the website so a future Code Connect / token sync stays trivial.

---

## 3. Typography

Use a clean, warm, humanist/grotesk sans (the product pairs a neutral grotesk for UI with
larger display weights for headings). Keep it friendly, not techy.

### 3.1 The accessibility floor (non-negotiable — the whole workforce reads this)
- **14px = floor** for all content/labels. Nothing readable renders below it.
- **16px = body** — primary reading prose (hero subline, paragraph copy, card ledes).
- **12px = decorative/incidental tier ONLY** — eyebrows/kickers (uppercase, tracked),
  timestamps, meta, counts, badge labels. Never body text.
- **Hierarchy via size + weight + color**, never by dropping content below 14px.

### 3.2 Scale
| Role | Size | Notes |
|---|---|---|
| Eyebrow / kicker | 12 | uppercase, letter-spaced, muted |
| Label / meta | 12–14 | |
| Body | 16 / line-height ~1.5 | |
| Lead / subhead | 18–20 | |
| Title (card/section) | 18–24 | |
| Section heading | 24–32 | |
| Display / hero | clamp ~36–64 | tighten line-height & tracking at large sizes |

---

## 4. Shape, space, elevation
- **Radius:** soft, generous — ~10–12px on inputs/buttons, ~16–20px on cards, ~24px+ on hero
  surfaces. (Contra-inspired roundness; never sharp corners.)
- **Spacing:** an 8px-based rhythm; lean roomy. Big section padding, generous gutters.
- **Elevation:** subtle, soft, low-spread shadows on a light canvas — float, don't pop. Borders
  are a faint `--line` hairline, not heavy outlines.
- **Layout:** centered max-width (~1200–1280px) content; alternating image/text feature rows;
  card grids for the 6 solution areas.

---

## 5. Components / patterns (marketing-site level)
- **Buttons:** Primary = solid **violet `#7C5CF8`**, white label, soft radius. Secondary =
  soft/tonal (violet-tint fill + violet text) or outline (hairline). AI button = Aurora gradient
  *only* when the action is literally "ask AI / see insight." Pill or ~10–12px radius.
- **Cards:** white, soft radius, hairline border + soft shadow; used for solution tiles, feature
  callouts, customer stories, resource items.
- **Nav:** clean top bar, logo left, mega-menu for Solutions, persistent **Book demo** primary
  on the right. Sticky, near-white/blur on scroll.
- **Trust strip:** monochrome customer logos under the hero; review badges (Capterra/G2-style)
  where relevant.
- **Metric band:** big numbers (display size) + 12px labels under — high contrast, restrained.
- **Footer:** multi-column link map + brand mark + locations/legal.

---

## 6. Motion (Aurora)
- The Aurora gradient can **slowly drift/breathe** on hero and AI surfaces (subtle, premium —
  not flashy).
- AI moments: a gentle "thinking" shimmer / streaming sheen on the SparkMark.
- Scroll: soft fade/rise reveals; respect **`prefers-reduced-motion`** (provide static
  fallbacks for every animation).
- Hover: small, springy, confident — never bouncy-cartoonish.

---

## 7. Voice & tone
Warm, human, benefit-led, confident without arrogance — matching "Human pulse × Daily ritual."
- **Do:** action verbs ("Stop guessing, start knowing"), plain language, outcomes over features,
  collaborative framing ("connect your entire workforce").
- **Don't:** jargon walls, hype, cold enterprise-speak.
- Lowercase **"vadal"** appears in the source copy as a stylistic choice — confirm with Pradeep
  whether the brand wordmark is lowercase "vadal" or "Vadal" before locking headlines.

---

## 8. Imagery & art direction
- **Lead with the real product.** Use actual screenshots of Home / Feed / Pulse / Analytics /
  the mobile employee app (demo tenant = "oliandhue"). Frame them in soft device/browser mockups
  on Aurora-tinted backdrops.
- **Human photography** for emotional sections (culture, wellbeing, customer stories) — warm,
  candid, diverse, real workplaces (frontline/retail/hospitality), not stiff stock.
- **Illustration/iconography:** Contra-inspired line icons (24px, ~1.5px stroke) for solution
  tiles; keep them light and friendly.
- Backgrounds: mostly warm white `#F6F7F9` / white, with Aurora gradient reserved for hero and
  intelligence moments.

---

## 9. Reference websites (from Mobbin) — the 3 to model

These were picked on Mobbin (web) against our criteria: premium + warm/human + product-led +
enterprise-credible + AI-forward. Open each and study layout, rhythm, and how they showcase the
product.

### ① Deel — the structural backbone & enterprise-people-platform credibility
[mobbin.com/screens/f6fae28c-…](https://mobbin.com/screens/f6fae28c-075b-4878-beb1-63c65c0a3038)
- **Why:** closest analog to what Vadal's site must *do* — a people/HR platform with a hero that
  pairs a tight headline + benefit subcopy + **dark primary "Book a demo" pill** + a **large
  product screenshot with a play/"2 min" affordance**, a thin **trust bar** ("Trusted by
  35,000+ companies"), a **monochrome logo strip**, and a mega-menu ("What we offer / Who we
  serve"). A "Just launched: …AI…" band shows how to feature intelligence.
- **Take:** the overall IA, the hero→trust→product→solutions flow, demo-led conversion, the
  warm periwinkle gradient backdrop.

### ② Dialpad — the Aurora-style hero & premium-but-warm AI feel on a light canvas
[mobbin.com/screens/846c9e64-…](https://mobbin.com/screens/846c9e64-dac8-465f-8dd5-87dd4a6cd0cc)
- **Why:** a **soft lilac/pink gradient** hero on light, a large confident headline, twin CTAs
  ("Request a demo" violet + "Explore platform" outline), and **floating product UI cards**
  drifting over the gradient. This is almost exactly how our **Aurora gradient on a Lumen-light
  background** should feel — premium, AI-forward, still warm.
- **Take:** the gradient-on-light hero treatment, floating product-card composition, the
  violet-primary/outline-secondary button pairing.

### ③ Sana AI — craft, humanity & restraint (so we don't look like generic SaaS)
[mobbin.com/screens/e4777f11-…](https://mobbin.com/screens/e4777f11-08af-46db-8c2f-76ad3d9b8f62)
- **Why:** a **cinematic human-photography** hero, warm tones, extreme restraint (tiny nav, huge
  breathing room). It's the "this feels human and intentional, not corporate-template" bar —
  exactly the *"Human pulse"* soul. Pull this into customer-story, culture/wellbeing, and About
  sections and into our photography direction.
- **Take:** editorial confidence, generous whitespace, real human warmth, minimal chrome.

### Honorable mentions / section-level references
- **Remote** — [screens/b6423c2e-…](https://mobbin.com/screens/b6423c2e-075b…) *(HR/payroll
  peer)*: clean card-hero + product collage + **review-badge trust row** + an **AI feature
  bento**. Great second opinion on Deel's template.
  (full id: `b6423c2e-0877-4e18-8c28-80fc2be490b6`)
- **Writer** — [screens/ae6c954c-…](https://mobbin.com/screens/ae6c954c-e003-49f8-993f-f56696f053cf)
  *(enterprise AI)*: dark, sophisticated; a **big-stat + executive-testimonial** hero. Model for
  our dark-mode + enterprise-trust sections.
- **Loom "Collections"** — [sites/sections/24f85579-…](https://mobbin.com/sites/sections/24f85579-1099-4710-9e36-9792294bda11):
  colorful illustrated **category tiles** that map almost 1:1 to our **six solution areas**.
- **Gorgias** — [screens/11ce8b13-…](https://mobbin.com/screens/11ce8b13-f136-4553-979e-695b5dded431):
  warm peach gradient + human photo + a conversational-AI UI overlay in the hero.

### How to combine them
**Deel's structure + Dialpad's Aurora hero aesthetic + Sana's human craft**, all rendered in
**Lumen warmth** with the **violet=action / Aurora=intelligence** rule. Deel keeps us credible
and conversion-focused; Dialpad makes the hero unmistakably *Vadal AI*; Sana keeps it human so we
beat Actimo on soul, not just features.

---

## 10. Quick checklist before shipping a page
- [ ] Violet only for actions; Aurora gradient only for intelligence/hero moments.
- [ ] No text below 14px except the 12px decorative tier; body is 16px.
- [ ] Real Vadal product screenshots, not stock UI.
- [ ] All Actimo-derived proof/names/addresses/legal text replaced (see `vadal.md` §3).
- [ ] Soft radii, hairline borders, warm white canvas, generous spacing.
- [ ] `prefers-reduced-motion` fallback for every animation.
- [ ] Light + dark both considered.
