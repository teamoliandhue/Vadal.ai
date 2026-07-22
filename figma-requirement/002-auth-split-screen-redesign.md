# 002 · Auth & Onboarding — split-screen redesign (Fireflies pattern)

**Status:** built in code · supersedes the *layout* sections of [001](./001-authentication-onboarding.md)
(the flows, actors, copy and error states in 001 are unchanged — only the frame changed).
**Reference:** Fireflies.ai web onboarding on Mobbin (flow `169d9ba8…`) — split screen with a
product showcase; adapted onto Vadal's Lumen + Aurora system.
**See it live:** `http://localhost:3001/auth` at ≥1024px (the showcase hides below `lg`).

---

## 1 · The layout (both /auth and /auth/onboarding)

Two columns, 50/50 at `lg+`:

**LEFT — form column** (theme-aware `bg-canvas`, violet radial glow top-left)
- Top row: **vadal.ai lockup** (Signal mark + wordmark), left-aligned.
  - On onboarding, the same row also carries **progress dots** right-aligned: one dot per
    step, active dot elongates to a 22px pill (violet), past dots violet, future dots `--line`.
- Middle (vertically centered, max-w 400/440): the step content — borderless, directly on
  the canvas (no card chrome anymore).
- Bottom: trust footer — "🏢 Company workspaces only · SOC 2 · Data stays in your region"
  + "Powered by ✦ Vadal" (auth) / role reassurance line (onboarding).

**RIGHT — showcase panel** (fixed dark `#141419`, like the Ask-Vadal surface; hidden < `lg`)
- Fine 44px grid lines (white @3.5%), Aurora glow top-right (indigo→teal) + violet glow
  bottom-left.
- Vertically centered: **two floating product-UI cards** (see §2) with a slow 7s float
  animation, then a one-line caption (13.5px, zinc-400, centered).
- Bottom: **customer testimonial** — oliandhue icon + name, quote (14px zinc-300),
  avatar + "Pradeep Kumar / CEO, oliandhue" (the Fireflies "Vercel quote" slot).

## 2 · Showcase variants (which product moment shows when)

Cards are **real product-UI recreations** (dark surface `#1b1b22`, radius 16,
`white @8%` border, deep shadow) — build them in Figma from the DS components:

| Variant | Cards | Shown on |
|---|---|---|
| `pulse` | Org-health 82 ▲4 + violet sparkline · "Vadal insight" card (+0.71 correlation) | Auth step 1 · onboarding *You* |
| `ai` | User bubble "How many paid leaves…" · Vadal AI answer with action chips | Auth step 2 · *Notifications* · *Meet Vadal* |
| `privacy` | "Confidential by design" checklist · region/SOC 2 note | Auth OTP · *First check-in* · *Sign-in & domains* · *Privacy & AI* |
| `recognition` | Kudos card (Anita → Priya, 🎯 Ownership, ❤️ 24 · +50 pts) · streak card (12 days 🔥) | *Belong* · *Bring your people* |
| `manager` | "Your team today" (Rohan 58 ↓, 1:1 overdue chip) · Coaching nudge card | *Your team* · *1:1 rhythm* |
| `branding` | oliandhue logo + swatches + tinted "Good morning, Priya" band · white-label note | *Make it yours* |

The variant swaps with the step — the panel always shows the surface being set up.

## 3 · Left-column changes vs 001

- Auth step 1 headline is now the brand promise: **"The pulse of your company, daily."**
  (28px bold, -0.02em), subline "Sign in with your **company email** — it routes you to the
  right workspace." Everything else (fields, errors, personas, OTP boxes) is unchanged from 001.
- Onboarding: the segmented progress bar is replaced by the **header dots**; a small eyebrow
  "«ROLE» · SETUP · n OF total" sits above the step heading. Step content unchanged.

## 4 · Responsive & themes

- `< lg`: right panel hidden; left column becomes the full screen (same as 001's single column).
- Left column follows light/dark theme; right panel is **always dark** (brand surface) — it
  reads identically in both themes.

## 5 · Figma build notes

- Frame at 1512×945 (matches the Mobbin reference crop) + a 390px mobile variant of the left column.
- Reuse DS components: Button, Avatar, SparkMark, Switch; the six showcase cards are new
  small components — name them `Auth/Showcase/«variant»`.
- Float animation: 8px vertical drift, 7s ease-in-out alternate (note for prototype only).
