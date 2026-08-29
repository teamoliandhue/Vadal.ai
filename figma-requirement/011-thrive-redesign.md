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
