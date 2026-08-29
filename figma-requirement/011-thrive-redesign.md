# 011 · Thrive — redesign

**Status:** built in code · supersedes the Thrive section of [007](./007-four-pillars-screens.md).
**See it live:** `/product/thrive` as **Ravi Prasad** (frontline) and then as **Aarav Sharma**
(desk). The hero is a *different metric* for each — that is the point of the redesign.

---

## 1 · What was wrong

Ravi is a Line Operator. His shift puts **17,400 steps a day** on him — about 122,000 a week.
The hero told him he was **"3,800 steps from your weekly goal"** against a 45,000 target he
clears by Tuesday morning, doing his job.

Meanwhile the fair-cohort card three sections below said, in as many words, *"a warehouse picker
walks 18,000 steps doing their job"* — the insight was already in the product, applied only to
the leaderboard and never to the goal itself.

Four smaller failures alongside it:

- **No time dimension.** One number, no history. A wellbeing product with no history is a
  snapshot, not a habit.
- **Wealth was five links in a rail.** The brief says "physical health and financial health,
  **side by side**". For a Line Operator in India, financial resilience is plausibly the more
  urgent half.
- **The wellbeing check took ~130px to say "off".** Prime real estate for a null state.
- **Nothing was one tap.** Everything was read, join or connect.

---

## 2 · The hero adapts to the person — `Component / Thrive / Hero`

The structural change. `chooseFocus()` decides what is worth measuring, and the hero has **two
variants driven by the session's `profile`**, not two designs.

| | Frontline (Ravi) | Desk (Aarav) |
|---|---|---|
| Eyebrow | Your recovery | Your week |
| Headline | **5.8h** *a night · aiming for 7.5h* | **41,200** *of 45,000 steps* |
| Why line | "Your shift already puts 17,400 steps a day on you. Setting you a step target would be scoring you on your job." | "Desk work leaves the moving to you, so this is a goal worth having." |
| Metadata | 17,400 steps on shift · sleep · points | sleep · points |
| Action | **Log an early night** | **Log activity** |

**The "why" line is not decoration.** A goal that appears without explanation feels arbitrary, and
this one is unusual enough to need defending. Keep it at 14px `text-muted`, directly under the
progress bar.

### 2.1 Seven-day bars — `Component / Thrive / WeekBars`

Right half of the hero. Seven bars, 64px track, `rounded-[4px]`, gap 6px, day initial beneath.

| Bar | Fill |
|---|---|
| Today | `--client-brand` solid |
| Met the daily target | `--client-brand` at 48% |
| Below target | `--muted` at 34% |

**Below-target bars were originally `--line` and vanished** — six of seven days invisible against
the card. A day below the goal still happened and still needs to be seen.

**The bars are daily; the step goal is weekly.** Compare against `goal / 7`, not the weekly
figure — doing otherwise scaled every bar to about 15% and the chart read as flat. Sleep is
already a nightly target and passes through unchanged.

### 2.2 The action row

Full-width strip under the hero, above a `border-line` divider. Aurora circle + the single
suggestion at 16px + one brand button, 44px. One thing to do, as an action rather than a card to
read.

---

## 3 · The wellbeing check — three states, not one card

It only earns a full card when it has something to say.

| State | Treatment |
|---|---|
| **Off** | One line: `rounded-2xl`, `bg-card`, 16px vertical. Faint heart icon, copy, Switch. |
| **On, quiet** | Same one line, `--success` icon: "Wellbeing checks are on. Nothing to raise right now." |
| **Triggered** | Full card: the gentle message at 16px, what was noticed at 12px, and a brand button through to `/product/help`. |

The promise stays in the copy in every state — *"only ever you, never your manager"*.

---

## 4 · Health and money, genuinely side by side

Two equal columns from 1024px, stacking below. Health left (Challenges, Cohorts), money right.

**Money this week** is now a proper card, not a link list: a single headline tip at 20px/700, its
body, the regulatory disclaimer and handoff at 12px, then the ask box, then four article rows at
44px each. The income band follows the person — `entry` for frontline, `mid` for desk.

**Devices collapsed to one line.** Three rows saying "Connect" on a flow that does not exist were
three rows of nothing. Now: *"Google Fit is connected — steps, active minutes and sleep"* plus an
**Add another** link.

**Points** became a single link line to Recognition rather than an orphan card at the bottom of a
rail.

---

## 5 · Result

Page height 2,154px → 1,884px on desktop, with more information on it. Every control is 44px on
touch. The screen now answers, in order: *how am I doing · what is one thing I could do · is
anything wrong* — and answers the first differently depending on whether your job already moves
you.

## 6 · What to draw

1. `Hero` — **two variants**, `Profile = Frontline | Desk`. This is the redesign.
2. `WeekBars` — three bar states, and the daily-vs-weekly note
3. Wellbeing check — Off · On-quiet · Triggered
4. `Money this week` card
5. The collapsed devices line and the points link

---

# 011b · Money moments and shift-aware content

Added after the redesign. The first pass made the *metric* fit the person. These
two make the *content* fit the person, and the *timing* fit the week.

## 7 · Money moments — `Component / Thrive / MoneyMoment`

The brief asks for tips "tailored to income band, role and region". Band and
region still produce an article that is equally true on any day of any year.
What actually moves money is **timing**.

> "An emergency fund comes first" is a fact.
> "Your pay landed on Thursday and the ₹3,000 you said you'd move hasn't moved"
> is a product.

Four states, ranked by how time-sensitive they are. The card shows whichever is
highest — never more than one.

| State | When it wins | Timing chip | Action |
|---|---|---|---|
| **Payday** | Pay landed ≤ 4 days ago and a commitment hasn't moved | day name, brand tint | **Move ₹3,000 now** |
| **Enrolment** | Closes within 30 days | "in 21 days", soft | **Review what you're on** |
| **Festival** | India, advance window within 45 days | "in 38 days", soft | **How advances are repaid** |
| **Steady** | Nothing time-sensitive | *no chip* | none — it is a read |

**The timing chip is the component.** `CalendarClock` icon + the relative time,
`rounded-full`, brand-tinted at `now` urgency and `bg-soft` otherwise. Without it
the card is just another tip; with it, it is the reason to open the screen today
rather than in general.

Under the payday action, a reassurance line at 12px: *"Sets it up once. You can
stop it any time."* The action is a standing instruction, and people are right to
be wary of those.

The disclaimer and handoff stay on every state. Timing changes what we say, never
whether we are allowed to say it — `financialTips()` still refuses to name a
product, and this sits on top of it.

**Note for the build:** the demo seeds pay day as "two days ago" so the payday
state is visible whenever someone opens it. A real tenant has a fixed pay day and
will see the honest ranking.

## 8 · Made for your shift — `Component / Thrive / ShiftContent`

The metric knew Ravi works nights. The content did not — a night-shift Line
Operator and a desk engineer were offered the same four articles.

Card appears **only for frontline profiles**, at the top of the health column.

- Aurora circle + eyebrow **MADE FOR YOUR SHIFT**
- Headline 18px/700 — *"Working nights is a different problem"*
- Body naming the three real problems: sleeping in daylight, eating at 3am, the
  Monday reset — and *"None of them are willpower problems."* The tone matters:
  this is the difference between wellbeing content that lands on a factory floor
  and content that reads as a lecture.
- **A handoff row into Grow**, not a duplicate article: 36px `bg-soft` tile with a
  graduation-cap icon, course title, "7 min · in Grow", chevron. Links to
  `/product/grow`.

Two variants: `Team = Night shift` and `Profile = Frontline (other)`. A desk
worker sees no card — their default content is already the right content, and an
empty "made for you" card is worse than none.

**Why the handoff rather than the article:** the material already exists one pillar
over. Writing a second copy in Thrive would mean two things to keep current, and
it hides the fact that Grow is where learning lives.

## 9 · What to draw

1. `MoneyMoment` — four states, with and without the timing chip
2. `ShiftContent` — two variants, plus the Grow handoff row
3. The desk case, which has neither card — worth drawing to show the difference

---

# 011c · Visual pass — charts, depth and the hero as a composition

The logic was right and the craft was plain: eight identical cards, a linear
progress bar, and seven grey rectangles. This raises the visual quality, and the
two new chart primitives are for the whole product, not just Thrive.

## 10 · Form before colour

Two data jobs on this screen, and both had the wrong form.

| Job | Was | Is | Why |
|---|---|---|---|
| "Am I hitting my goal?" | Linear progress bar | **`GoalRing`** | It is a *ratio*, and a ring reads a ratio in one glance where a bar reads as a slot to fill |
| "How was my week?" | Seven two-tone bars | **`DayArea`** | It is *change over time with a target*. A week has a shape; seven rectangles hide it |

The two-tone bars encoded above/below target **in colour alone**. The area draws
the target as a dashed rule instead, so the same information is read from
position — legible without colour, and better looking.

### 10.1 `Component / Chart / GoalRing`

132px, 10px stroke. Track in `--line`; the arc a gradient from
`--client-brand` at 75% to `--brand-light`, `stroke-linecap: round`, starting at
12 o'clock. Value centred at 26px/700 `tabular-nums`, unit beneath at 12px
`--faint`. Sweeps in on mount via the existing `ring-animate`.

### 10.2 `Component / Chart / DayArea`

- Curve: 2.5px, `--client-brand`, `non-scaling-stroke`, Catmull–Rom smoothing
- Fill: vertical gradient, brand at 30% → 2%
- Target: 1px dashed `--faint` at 70%, spanning the plot only
- Endpoint: 11px ring, `--card` centre, 2.5px brand border
- Day labels beneath; the active one goes `--ink` and 600
- Caption reads the active value and the target
- Hover moves the marker and the caption; every day is a focusable hit target

**Two build rules that are not cosmetic.** The plot is **inset 2% each side** —
a series running to exactly 100% hangs half a marker outside the frame. And the
**endpoint marker is an HTML overlay, not an SVG circle**: the chart stretches to
fill its width, which is fine for a curve and turns a circle into a clipped
ellipse. Position it by percentage over the SVG.

## 11 · The hero as a composition

Three columns — ring · type · chart — instead of a number and a bar.

- **Aurora hairline** across the top edge at 2px, 70% opacity: the same signature
  the AI dock uses, because this number is chosen by the same engine
- **A brand wash** — `radial-gradient(120% 100% at 100% 0%, brand 9%, transparent 62%)`
  over the card, so the surface has direction rather than being flat white
- **Deeper elevation** than any other card: `0 24px 56px -32px`, against the standard
  `0 18px 42px -26px`. The hero should feel like a made object; the rest are containers.
- **Weight contrast in the type**: the value at 38px/700 `-0.03em`, the unit dropped
  to a 16px/400 `--muted` line beneath it. The number is the subject; the unit is grammar.
- **The action row sits on `bg-soft/60`** with its own top border, so it reads as a
  footer to the composition rather than another paragraph.

## 12 · What to draw

1. `Chart / GoalRing` and `Chart / DayArea` — as design-system primitives, not Thrive parts
2. `Thrive / Hero` — the three-column composition, both profile variants
3. The elevation ladder: hero → primary card → quiet row, as three shadow tokens
