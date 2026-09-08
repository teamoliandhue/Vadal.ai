# 020 · Get Started — explored by doing, and how the tour is shown

**Status:** built in code · extends [019](./019-get-started-tour.md) · `/product/get-started`, `/product/home`

---

## 1 · What the research said

Fifty screens on Mobbin (Hootsuite, HoneyBook, Vanta, Apollo, Slite, Front, Notion, Linear, Circle,
How We Feel, and others). Three findings shaped this update:

1. **Every checklist marks a step "Done" on the action, not on reading.** Hootsuite says
   *"4/6 Explored"*; HoneyBook, Stripe and Square tick when the thing is set up. Nobody trusts
   "Next".
2. **The tour lives in the sidebar and lands first.** Notion pins *"Explore Notion · 0% explored"*
   atop the rail and keeps the tour as a page; Linear intercepts the first run and ends on
   *"You're good to go"* with three next actions.
3. **Meaning-first modal carousels are the weak pattern** (Salesforce, Pinterest, Uxcel) —
   illustrations and a Skip button. Confirmed not doing this.

---

## 2 · Explored means *did*

Each step now names the action that explores it. The real feature announces the action
(`didAction()`), and the step is marked wherever it happened — on the tour, or anywhere in the
product.

| Step | Explored when you… | Fired by |
|---|---|---|
| Your daily ritual | log today's check-in | `MoodCheck` (Home, or the tour's live copy) |
| It listens | open Pulse | visiting the section |
| Recognition | recognise someone | `GiveRecognition` drawer — now openable from the tour |
| Their words | open Amplify | visiting |
| Wellbeing | open Thrive | visiting |
| A door | open One-to-One Help | visiting |
| Five minutes | open Grow | visiting |
| Answers | ask it something | the tour's own ask box, or Knowledge |
| One assistant | ask the assistant anything | `vadal:ask` (any surface) |
| What Vadal is · You're set | reading them | "Got it, next" · reaching the last step |

**Status row** under each action step's demo:
`○ Explored when you log today's check-in — here, or from the menu.` →
`✓ Explored — you logged today's check-in.` (`--success` tick, `aria-live`).

The primary button reads **Got it, next** only on the two idea steps; on action steps it is plain
**Next** and does *not* mark — clicking through leaves steps unexplored, and the rail pill keeps
counting, which is the point.

---

## 3 · How it is shown

**First visit lands on it.** Home checks once: never seen the tour and nothing explored → replaced
with Get Started. Seeing the page sets `vadal:tour-seen`; "Start over" never brings the redirect
back. The rail stays visible, so the product's shape and the tour are seen together.

**Resume row on Home**, directly under the greeting hero: SparkMark · *"Continue the tour · 5 of 11
explored"* (or *"Take the tour of what Vadal does"* at 0) · thin `ai-grad` progress bar ·
**Continue →** · ✕ *Hide the tour reminder*. Aurora surface (`--ai-surface` / `--ai-border`).
Gone when everything is explored or hidden.

**Rail pill** counts down live as things are done anywhere in the product.

---

## 4 · New demos

- **Answers** — an ask box with the four suggested questions as chips; the answer shows *"Cited
  from your own documents"* or *"Not in your documents — so it said so, rather than guessing"*.
- **Recognition** — a **Recognise someone** button opens the real drawer.
- **You're set** (Linear-style) — *Still to explore* chips that jump to the step; *Worth doing
  first*: Log today's check-in · Recognise someone · Ask Vadal; **Open Home** · Start over.

---

## 5 · Also in this change

The health score now counts completed campaigns' participation (a status typo had excluded
them): **74 → 70**. Pulse's department delta now compares against the computed org score rather
than a typed 74.

## 6 · Figma

Status row (two states), the resume row on Home (0 / partial), the Answers ask box (asked ·
cited · refused), the You're set panel.
