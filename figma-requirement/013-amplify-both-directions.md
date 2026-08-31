# 013 · Amplify — the other direction, and the programme behind it

**Status:** built in code · `/product/amplify`
**Supersedes nothing in [010](./010-amplify-redesign.md) — extends it.**

---

## 1 · Half the brief was missing

The brief's sentence for this pillar has two clauses:

> "Bring the company's external voice in, **and let employee moments go out**."

Five features were built and **all five served the first clause.** Every one pointed the same
way: the company publishes, we ask an employee to carry it.

That asymmetry is not a gap in coverage — it is the reason corporate advocacy programmes die.
A screen that only ever *asks you for something* is a screen you opt out of. The same screen,
when it also carries **your** wins outward, is one you open.

So the second clause is built, and **it outranks the first.**

### The hero has four states now, in priority order

| | When | What it shows |
|---|---|---|
| 1 | Opted out | The case, with the switch in it |
| 2 | **You have a moment** | **Your win, drafted, one button** ← the inversion |
| 3 | No moment of your own | Today's company pick |
| 4 | Nothing at all | "You're all caught up" — finished, not empty |

If Neha recognised you yesterday, that is the most shareable thing on this page. More
shareable than anything marketing published, because it is true, recent and yours.

**Nothing is invented.** A moment is something the product already knows happened: kudos from
the Recognition wall, a launch from `#wins`, a certification from Grow, an anniversary from the
directory. Amplify only *notices* them.

When a moment takes the hero, the company's pick does not vanish — it drops into the browse
list, still marked "Picked by HR". Yours first; theirs still there.

`Amplify / Hero / Moment` · `Amplify / Moment card` — four kind variants (Recognition, Shipped,
Certification, Milestone), each with its own icon and colour treatment. Milestone gets a
**Coming up** badge and its button reads "Draft it" rather than "Share it".

---

## 2 · Two audiences, split rather than stacked

Comms running the programme has a genuinely different job from the person sharing. The first
build mixed them: admin-only cards sat in the **employee's** right rail, so an employee's screen
was half somebody else's dashboard, and comms' most important numbers were a footnote on it.

**Admins get a tab. Employees never see one** — no empty state, no locked door, no evidence
another view exists.

`Amplify / Tabs` — only ever rendered for Campaigns-level access.

---

## 3 · The composer does four new jobs

Each of these was a real reason the pillar would have failed.

### 3.1 Policy check — the one that decides whether this ships at all

An employee putting a revenue figure or a customer name into a public post is an actual
incident, and *"the policy said not to"* is not a control.

- **Block** — financial figures (`revenue`, `ARR`, `runway`…), people data (`attrition`,
  `headcount`, `layoffs`). Share buttons disable with the reason.
- **Warn** — forward-looking statements, named customers, unreleased work. Advisory only:
  *"it is your post and your call."*

Deliberately advisory wherever it can be. A tool that silently refuses to let you post your own
words is one you stop using.

`Amplify / Composer / Policy` — two variants, **Blocking** (danger) and **Advisory** (warning).
Each issue names the matched phrase in quotes and says why, rather than describing the category.

### 3.2 Imagery — one photo does not fit four platforms

| Platform | Ratio | Pixels |
|---|---|---|
| LinkedIn · Facebook | 1.91:1 | 1200 × 627 |
| Instagram | 4:5 | 1080 × 1350 |
| X | 16:9 | 1200 × 675 |

A LinkedIn crop posted to Instagram reads as low-effort corporate — the exact impression this
pillar cannot afford. The crop spec changes live when the platform changes.

### 3.3 Timing — it now schedules

`bestTimeToPost()` already existed and its answer was printed as a sentence nobody could act on.
It sets a reminder. **A nudge, not a scheduled post** — nothing goes out without the person.

### 3.4 Attribution — the P&L defence

A hiring post shared without a referral code is an impression nobody can trace, and the
programme dies in the first budget review that asks what it returned. Hiring posts get the
employee's code appended to the share URL.

### Plus: the character budget

`withinLimit` was computed and never shown. On X that is the difference between a post and a
truncated one. It now shows `300 / 280` and disables the actions.

`Amplify / Composer` — one component, two subjects (company post · personal moment). A moment
adds a **platform picker**; a company post already knows where it came from.

---

## 4 · The programme view

Four jobs, in the order the work actually happens.

1. **Campaign** — a goal, a window and an end. A steady drip of asks is what advocacy usually
   is, and it is why it fades. Uses `Chart / GoalRing` from [012](./012-scroll-model.md).
2. **Queue** — approve or reject, **with the reach forecast attached to the decision.** Comms
   previously picked on instinct and found out afterwards. The forecast is a **band**
   (1,214–3,531), never a single number — false precision on a modelled figure is how marketing
   dashboards lose their credibility.
3. **Declines, read** — we already collected why people passed and drew four bars, which is
   data, not insight. It now returns a verdict: *"This is a writing problem, not an audience
   problem — 58% said it reads too corporate. They are willing to post; they are not willing to
   post this."*
4. **Referrals** — counted, not modelled.

### The one layout rule that matters here

**Counted numbers are set apart from modelled ones.** Applications and hires sit in the hero
behind a divider; modelled reach lives in a separate card in the rail with its caveat attached.
Reach is an estimate and always will be. An application is a fact. A design that mixes them is
one that gets a number quoted in a board deck that cannot survive being questioned.

---

## 5 · Two bugs worth encoding as rules

**A truncating cell still needs `min-w-0`.** `truncate` sets `white-space: nowrap`, so the
element's *min-content* width is the full string — it only ellipsises once something gives it a
narrower width. A two-tag suggestion ("#EmployeeExperience #Engineering") set the width of the
entire hero card and pushed it off a 375px screen. **Any truncating cell in a flex or grid row
needs an explicit min-width of 0**, and the row's other children need `shrink-0`.

**The top bar overflowed on a phone** — on every page, not just this one. Five controls could
not fit at 375px, and because none were marked unshrinkable, flex crushed them instead: the
theme toggle rendered **0px wide** and search at 16px. Fixed by making the breadcrumb the thing
that yields (it truncates; the domain drops below sm), the Intelligence pill icon-only below sm,
every control `shrink-0`, and tighter gutters. The theme toggle is the app's *only* theme
control, so hiding it on mobile would have stranded the setting.

`Component / TopBar` needs a **Mobile** variant: breadcrumb truncates to the leaf, Intelligence
is the mark alone, 16px gutters, 6px gaps.

---

## 6 · What to draw

1. `Amplify / Hero / Moment` — four kind variants, with and without a photo
2. `Amplify / Moment card` — collapsed and expanded, plus the **Coming up** state
3. `Amplify / Composer` — company-post and moment subjects; the three detail rows collapsed and
   open; **Blocking** and **Advisory** policy states; over-limit state
4. `Amplify / Programme` — campaign hero, queue card with forecast, decline verdict (three tones)
5. `Component / TopBar` — the Mobile variant
6. Note the `min-w-0` rule in the description of every truncating component

---

# 013b · The context rail

## 7 · A third of the screen was blank

The rail held three cards — **709px against a 2,245px column** — and one of the three was a
disclaimer. Filling it was not the point. Each card that went in was something the pillar
already owed the person.

### 7.1 Your voice — the promise with nothing behind it

**The opt-out control disappeared the moment you opted in.** It only ever existed inside the
opted-out hero, so the copy *"Opt out any time"* pointed at a control that was no longer on the
page. For a consent feature, that is the defect, not a gap.

It also fixes a second thing: **consent was all-or-nothing.** Someone happy to share their own
wins but not marketing's posts had no way to say so — and that is exactly the person we lose.
**58% of declines are "reads too corporate."** A narrowed opt-in beats a churned one.

| Setting | Options | What it does |
|---|---|---|
| What should we ask you about? | Both · Only my own · Only the company's | **A real filter.** "Only my own" removes the company section and the company hero entirely |
| Start drafts in | Plain · Warm · Proud · Technical | Seeds every composer, and updates a draft you have not edited |
| Default platform | The four marks | Seeds the platform picker on your own moments |

These are not decorative settings. `scope` decides what the screen is allowed to put in front of
you at all — the hero itself changes.

`Amplify / Rail / Voice` — collapsed (one summary line: `Both · Warm · LinkedIn`) and expanded.
The opt-out sits below a divider, full width, and goes danger-coloured on hover.

### 7.2 What you've sent

We ask *"Did you post it?"*, count it, and then never mention it again.

**Note what is deliberately absent: engagement counts.** We have no platform APIs and are not
getting them before the feasibility spike, so likes and comments on a personal post are genuinely
invisible to us. Estimating them and setting them beside a real date would be inventing a
number — and every other figure on this screen is already modelled and labelled as such.

What we honestly know: that you said it went out, when, where, what you wrote, and — only on a
hiring post carrying your code — **the clicks our own redirect counted.** The card says the rest
out loud rather than filling the gap.

### 7.3 What good looks like

Three captions colleagues actually sent, one at a time, each with a line on *why* it works
("Eleven words. Length is not what makes a post land."). Nobody knows what to write, and showing
what doesn't read as corporate beats any amount of instruction.

The old **Sharing this week** card is folded in as this card's header — two thin cards saying
adjacent things is worse than one that says both.

`Amplify / Rail / Exemplar` — quote block, attribution row, rationale line, dot pagination. **The
dot is 6px; the tap target is 44px.**

### 7.4 Before you decide

The five questions people actually ask, none of which the product answered: *Can my employer see
my account? Can Vadal post as me? Where does the reach number come from? What if I share
something and regret it? Does declining count against me?*

## 8 · The rail's job changes with state

**Opted out, it is reassurance — not statistics.** The questions come first and none of the
personal numbers appear at all. Quoting somebody's reach at them before they have agreed to
anything is the wrong kind of persuasion.

| | Opted out | Opted in |
|---|---|---|
| 1 | **Before you decide** | Your reach |
| 2 | What good looks like | What you've sent |
| 3 | Posting for you | What good looks like |
| 4 | — | **Your voice** |
| 5 | — | Before you decide |
| 6 | — | Posting for you |

Result: rail **709 → 1,868px**; dead space **1,536 → 377px**.

## 9 · One more JSX rule, because it bit twice

`{" "}` after an expression is load-bearing. **When a JSX text node spans lines, every line is
trimmed — including the first** — so a space sitting immediately after an expression is eaten:
`148colleagues`. It is the same defect as [009](./009-form-field-rules.md)'s clipped Q — invisible
until the exact content that exposes it appears.

## 10 · What to draw

1. `Amplify / Rail / Voice` — collapsed and expanded; scope options as selected/unselected cards
2. `Amplify / Rail / Sent` — with and without the referral-clicks line
3. `Amplify / Rail / Exemplar` — three states via the dots
4. `Amplify / Rail / FAQ` — closed and one-open
5. The **two rail orders** above, as separate frames — this is the point, not a detail
