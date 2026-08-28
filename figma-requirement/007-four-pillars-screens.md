# 007 · Amplify · Thrive · Grow · One-to-One Help — four new pillar screens

**Status:** built in code · the largest unspecced surface in the product.
**Source:** Pillars 3, 4, 6 and 7 of *Vadal.ai — AI Feature Product Inputs*.
**See it live:** `/product/amplify` · `/product/thrive` · `/product/grow` · `/product/help`.
Sign in as **Ravi Prasad** (frontline employee) for Thrive, Grow and Help; **Priya Sharma**
(HR admin) to see Amplify's impact panel and Grow's course generator.

Four pillars existed only as engines reachable through the Copilot. They now have screens.
Sixteen AI features moved from "runs" to "a person can find it".

---

## 0 · What is shared across all four

These four screens reuse one page skeleton. Build it once as a template; the four differ only
in what fills it.

| Element | Spec |
|---|---|
| **Hero** | `rounded-[28px]`, 1px `border-line`, `bg-card`, padding 28px (36px ≥640px). Shadow `0 1px 2px rgba(20,20,40,.04), 0 18px 42px -26px rgba(20,20,40,.22)`. A blurred radial glow in `--client-brand` sits top-right at 8% opacity, `-96px` inset, 256px, `blur(48px)` — decorative, `aria-hidden`. |
| **Card** | `rounded-[26px]`, 1px `border-line`, `bg-card`, padding 24px (28px ≥640px), `card-lift` hover. |
| **Eyebrow** | 12px, 600, uppercase, `0.16em` tracking, `text-faint`. Above every card title. |
| **Page title** | `clamp(24px, 3vw, 34px)`, 700, `-0.025em` tracking, line-height 1.05. |
| **Two-column body** | 12-col grid ≥1280px, `gap: 24px`, `items-start`. Left column 7, right 5 — except Grow's generator, which is 5 / 7 (the input is narrower than the output). Single column below. |

**Nav gains three groups.** The sidebar was six groups; it is now nine items across three new
or extended groups:

- **Engage** — Recognition · Campaigns · **Amplify**
- **Wellbeing** *(new)* — **Thrive** · **One-to-One Help**
- **Learn** *(new)* — **Grow**

Mobile bottom-bar priority for an employee changes to **Home · Feed · Grow · Thrive**. A
five-minute course on a break is the thing this product asks a frontline worker to do, and
Knowledge is reachable from the Copilot on any screen.

---

## 1 · One-to-One Help — `/product/help`

The highest-stakes screen in the product. Three rules from the brief are **structural**, not
styling choices, and the layout must not be rearranged in a way that breaks them.

### 1.1 Crisis banner — first element on the page, always

`Component / Help / Crisis banner`

- Full width, `rounded-[26px]`, padding 20px (24px ≥640px)
- Border `--danger` at **28%** opacity; background `--danger` at **7%** over `--card`
- 40×40 `rounded-xl` icon tile, background `--danger` at **14%**, shield-alert icon 20px
- Title 16px/700 · subtitle 14px `text-muted`: *"These are here whatever else is on this page.
  You do not have to talk to anything first."*
- One pill per regional line, right-aligned, wrapping below on narrow: **min-height 48px**,
  `rounded-full`, 1px `border-line`, `bg-card`, 16px/600 label, phone icon in `--danger`

**48px, not the 44px floor.** These are the most important tap targets in the product and
someone reaching for them is not steady-handed. They were 39px and that was a real defect.

This block takes **no conversation and no risk score as input**. Nothing the AI decides can
hide it and nothing it fails to detect can withhold it. It renders before the companion in
the DOM, not just visually.

### 1.2 Launch-blocker notice — admin only

Shown when the escalation policy is unsigned, which it currently is. `rounded-2xl`, `bg-soft`,
1px `border-line`, lock icon, 14px `text-muted`. Copy states plainly that clinical, legal and
HR sign-off is a hard blocker on launch and that no third party is notified until it is signed.

### 1.3 The companion — left column

`Component / Help / Companion`

- Card with eyebrow **PRIVATE**, title *"Talk it through"*
- **Empty state:** dashed `border-line`, centred, 40×40 Aurora gradient circle with SparkMark
  20px, *"Nothing here is stored anywhere you can't reach."* / *"Start wherever you want.
  There's no form."*
- **Person's turn:** right-aligned, `bg-[--purple]`, white, `rounded-2xl`, 16px, max-width 80%
- **Companion's turn:** left-aligned, 24px Aurora circle + `bg-[--ai-surface]` bubble with
  `ring-1 ring-[--ai-border]`, max-width 85%
- **Delete** button appears in the card header once a conversation exists — 12px, `text-faint`,
  trash icon. The person can erase everything, and must be able to see that they can.
- Input: `min-height 44px`, `rounded-full`, `bg-soft`, placeholder *"However you'd put it…"*

### 1.4 Urgency band — a routing decision, never a diagnosis

Appears under the conversation once the companion has heard something. `rounded-2xl`, `bg-soft`,
padding 16px.

| Band | Badge | Tone |
|---|---|---|
| self-serve | "Might be enough on its own" | info |
| counsellor | "Worth a counsellor" | warning |
| acute | "Speak to someone now" | danger |

Below the reason, always: *"This is a routing suggestion, not a diagnosis. I don't do those."*
12px `text-faint`. **This line is not optional** — it is the difference between a triage tool
and something pretending to be clinical.

### 1.5 Resource list

Only for non-acute bands. In the acute band the list is **empty by design** — never offer an
article instead of a person. Rows: `rounded-xl`, 1px `border-line`, title 14px/600, minutes
right-aligned 12px `text-faint`.

### 1.6 "Talk to a real person" — right column, always visible

Eyebrow **SKIP ME ENTIRELY**. Never gated behind triage; booking works whether or not the
person ever speaks to the companion.

Counsellor rows: avatar 32px + name 14px/600 + credentials 12px `text-faint`, languages on
their own line, then a **Book** button and next-available time. Button flips to a tertiary
"Requested" once pressed.

**Consent block** below: checkbox, `bg-soft`, `rounded-2xl`. Unchecked by default. Copy:
*"Share a short summary with the counsellor — so you don't have to explain it all again in
session one. Off unless you switch it on."* When checked, the generated summary renders below
in a mono block so the person sees exactly what would be shared.

### 1.7 Promises card

Four lines, each with a small lock icon. These are the only reason anyone would use this
feature, so they are stated rather than implied:

- Nothing you say here reaches your manager or HR.
- You can delete this conversation, and everything in it, at any time.
- A real person is one tap away on every screen — you never have to go through me first.
- I am not a clinician and will never pretend to be one.

**Frames:** `Product / Help / Default` · `Companion — counsellor band` · `Companion — acute
band` · `Consent given` · `Admin (launch blocker)`.

---

## 2 · Grow — `/product/grow`

### 2.1 Hero

Title *"Five minutes is enough"*. Three stats right-aligned: day streak · % completed ·
typical course length. Below, if anything is overdue, a `--danger`-tinted strip (6% fill,
25% border) naming the overdue courses and their total minutes.

### 2.2 Tabs

`Your learning` · `Library` · `Create a course`. Third tab is manager-and-up only. Pill tabs:
active is `bg-ink` with `--card` text; inactive `text-muted` on hover `bg-soft`.

### 2.3 Course row

`rounded-2xl`, 1px `border-line`, padding 16px. Title 16px/600, then badges — **Mandatory**
(brand soft), status (overdue = danger, in-progress = warning, complete = success), minutes
right-aligned with a clock icon.

**The listening→learning line.** When Pulse drove the assignment, a 12px `text-faint` line with
a 12px SparkMark: *"Your team raised equipment training in the last Pulse check-in."* This is
the loop the whole platform is built around — being enrolled with no explanation reads as a
punishment, so the reason is always visible.

Progress bar 6px, `bg-line` track, fill in `--client-brand`, 500ms transition. Then Start /
Resume / Done, lesson count, and a due-date chip that turns `--danger` when overdue.

### 2.4 Course generator — the highest-leverage AI feature in the pillar

`Component / Grow / Generator` — two panels.

**Left (5 cols)** — Aurora circle + eyebrow **COURSE FROM A DOCUMENT**, explanation, a title
field, a 10-row textarea for the source document, and a brand **Generate course** button with
a sparkles icon. Button label becomes *"Reading the document…"* while working; the SparkMark
switches to its `thinking` state.

**Right (7 cols)** — empty state is a dashed box with a graduation-cap icon: *"Your draft
course appears here / Nothing is published automatically."*

Once generated: title + **Draft** badge + **Safety-critical** badge where applicable + a
right-aligned summary (`N min · N modules · N questions`). Then warnings as `bg-soft` rows with
an amber triangle. Then module cards. Then draft questions — each showing its options with a ✓
on the answer, and beneath it *"Source: …"* in 12px `text-faint`.

**The review gate.** A bordered block at the bottom: reviewer-name field + **Publish** button.

> **Publish is disabled until a name is typed.** For safety-critical content this is a rule in
> the code — `publishCourse()` throws without a reviewer — not a reminder. Draw the disabled
> state; it is the point of the component.

After publishing, the badge flips to **Published** and a line reads *"Reviewed and published by
«name»."*

### 2.5 Adaptive practice

Eyebrow with Aurora circle, plus a **Difficulty N/3** info badge that reflects recent accuracy.
One question at a time; answered options turn green (correct) or red (picked and wrong) with the
rest at 50% opacity. The source sentence appears below in `bg-soft` once answered.

Under it, **Coming back to you** — the spaced-repetition queue, each row with a coloured dot
(danger when wrong > right, warning otherwise) and the retention record.

### 2.6 Module tutor

`bg-[--ai-surface]` block with `ring-1 ring-[--ai-border]`. Input + Ask. The answer is followed
by a 12px `text-faint` line stating either *"Answered from this module's source content only."*
or *"Not in this module — I don't answer from anything else."* Design both.

**Frames:** `Product / Grow / Your learning` · `Library` · `Generator — empty` · `Generator —
draft` · `Generator — published` · `Adaptive practice` · `Tutor — grounded / not found`.

---

## 3 · Thrive — `/product/thrive`

### 3.1 Hero

Title is the number: *"41,200 **of 45,000 steps**"* — the second half in `text-muted`. Progress
bar 8px, `--client-brand`, 700ms transition. Metadata row: active minutes · average sleep · rank.

**Nudges** sit at hero right, stacked. Each is `bg-[--ai-surface]` with `ring-1
ring-[--ai-border]`, `rounded-2xl`, a SparkMark, the nudge text, and — critically — a 12px
`text-faint` line: *"Sent around 18:00 — when you usually act."* The timing is the feature; show
it.

### 3.2 Wellbeing check — consent-gated

Full-width card with a Switch, **off by default**.

Copy while off: *"Off. Nothing about your activity or mood is being combined while this is off."*
Copy while on but not triggered: *"Nothing to raise — signals not combined."*
When triggered: `bg-soft` block, the gentle message, then 12px `text-faint` — *"Noticed: activity
down, less sleep, mood down. Not shared with anyone."* — and a brand button through to
`/product/help`.

The card body states the promise in the design, not the tooltip: *"Only ever you — never your
manager, never HR, never a flag on a dashboard."*

### 3.3 Fair cohorts — the most opinionated component here

`Component / Thrive / Cohort`

Each cohort is a `rounded-2xl` card; **your** cohort takes a `--purple` border and a **You**
badge. Rows are rank · name · role · average, with `tabular-nums` on the figure.

Beneath the set, 12px `text-faint`, the explanation — keep it, it is the whole argument for the
component: *"A warehouse picker walks 18,000 steps doing their job. A designer walking 8,000 has
tried much harder. Ranking them together makes the effort invisible, so we don't."*

### 3.4 Wealth

Article list, then an `--ai-surface` ask block. Two answer states to draw:

- **Guidance** — title, body, then 12px `text-faint` disclaimer + handoff line
- **Refusal** — when the question asks what to buy: *"I can explain how these things work, but I
  can't tell you what to buy or choose — that's regulated advice and needs someone licensed."*

### 3.5 Benefits, devices, points

Benefit rows carry the closing-soon nudge and a Book-a-call button. Device rows show a
**Connected** success badge or a Connect link. Points card shows balance, month delta, and a link
noting the ledger is shared with Recognition.

**Frames:** `Product / Thrive / Default` · `Wellbeing off / on / triggered` · `Wealth — guidance
/ refusal` · `Cohorts`.

---

## 4 · Amplify — `/product/amplify`

### 4.1 Hero and opt-in

Title *"Your company, in your words"*. Admin sees three stats; an employee sees none.

**Opt-in card**, full width, Switch **off by default**: *"Advocacy is opt-in per person. With it
off you can still read everything here — you just won't be offered captions or counted in the
numbers. Nothing is ever posted under your name automatically."*

With the switch off, the **Share this** affordance does not render at all.

### 4.2 Company post row

Platform badge (neutral) · relative time · **In advocacy queue** brand badge where applicable.
Post text 16px. Engagement row: likes · comments · shares, then a right-aligned **Share this**
link in `--purple` (opt-in only).

### 4.3 Caption composer

Expands inline. `bg-[--ai-surface]`, `ring-1 ring-[--ai-border]`.

- Aurora circle + eyebrow **YOUR CAPTION**
- Voice switcher, right-aligned: **Plain · Warm · Proud · Technical** — a segmented pill inside
  a `bg-card` track. Changing voice regenerates and discards manual edits.
- Editable 3-row textarea containing the drafted caption
- Best-time line, 12px `text-faint`
- **The gate**, `bg-soft`, 12px: *"**We can't post this for you yet.** Auto-mirroring to LinkedIn
  is not enabled: spike not run…"*
- A **Copy caption** button — not "Post". The product does not post.

### 4.4 Impact and platform status

Impact panel is admin-only: estimated reach, multiplier, top contributors, and a 12px `text-faint`
caveat that the number is **modelled, not measured**. Keep the caveat wherever the number goes;
an ROI figure presented as measured is how a marketing dashboard loses its credibility.

Platform status lists all four platforms, each with a **Spike not run** warning badge and its own
note.

**Frames:** `Product / Amplify / Opted out` · `Opted in` · `Caption composer — 4 voices` ·
`Admin — impact`.

---

## 5 · What to draw, in priority order

1. `Component / Help / Crisis banner` — including the 48px pills
2. `Component / Grow / Generator` — empty · draft · published, with the disabled Publish state
3. `Component / Help / Companion` — empty · three bands · consent given
4. `Component / Thrive / Cohort` — with the fairness note
5. `Component / Amplify / Caption composer` — four voices + the gate
6. The shared hero and card templates from §0, so the four screens stay one family
7. Sidebar update — three new groups, and the employee mobile bar
