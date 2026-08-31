# 016 · Grow — where you are, and why you're here

**Status:** built in code · `/product/grow`
**§2 is a shipped-defect fix, not a design preference.**

---

## 1 · What was already right

The Pulse→learning loop is the best thing on this screen and it stays untouched. Every suggestion
explains itself — *"Suggested because your team flagged equipment in a recent check-in, and a
recent incident on your line touched this"* — and closes with the line that makes it credible:
**"not from a generic role template."**

The adaptive quiz also already gave proper feedback (right/wrong, plus the source sentence it was
generated from). I assumed otherwise from a screenshot of the unanswered state and was wrong.

---

## 2 · The review queue was a log line

**Coming back to you** rendered straight from the retention record:

> `lockout-2 — 0 right, 2 wrong, last seen 4d ago`

An internal question key, two counters and an interval — shown to the one person who can do
nothing with any of them. Spaced repetition is the most valuable mechanic in a learning product
and it shipped as debug output.

The record had no human-readable content to show, so it gained some: **what the question was
about, in the learner's words**, and which course it came from.

`reviewQueue()` wraps the existing ranking with an explanation, because **ranking is not
explaining** — and the two reasons a thing comes back are genuinely different, so they must not
look alike:

| Reason | Reads | Treatment |
|---|---|---|
| **shaky** — wrong more than right | *"You haven't got this one right yet."* | Danger-tinted card, ↺ mark |
| **fading** — known once, going | *"You knew this 9 days ago. This is about when it starts to go."* | Plain card, clock mark |

A gap is not the same problem as fade. Closes with **Practise these 3** and one line on why these
three: *chosen by what you have actually retained, not by course order.*

`Grow / ReviewItem` — both reasons.

## 3 · "3 lessons" and a bar told you nothing

A percentage says a course is 33% done. It does not say **where you stopped or what the next four
minutes contains** — which is the only thing that decides whether anyone presses Resume.

- The bar is now **one segment per lesson**: done, current, not started.
- Beneath it: *"1 of 3 done · next: **Recognising it in practice**, 3 min"*

`Grow / CourseCard` — segmented progress, and the next-lesson line.

## 4 · Unexplained mandatory training reads as punishment

The Pulse suggestions on this same screen explain themselves beautifully. The **compulsory**
courses said nothing — just a badge and a due date. That asymmetry is what makes compliance
training feel like something being done *to* you.

Every mandatory course now carries its reason:

> *Required of everyone at oliandhue, and renewed every 12 months. Yours lapsed on 28 August.*
>
> *Required before anyone works unsupervised on a line. This one is safety-critical, so there is
> no grace period.*

And **overdue now looks overdue** — danger-tinted border and ground, plus a `Safety-critical`
badge where it applies. Previously an overdue mandatory course and a 7-minute optional read were
the same card with a different word in a pill.

## 5 · A streak is a pattern; you cannot see a pattern in a number

`growStats.streak` was printed as the digit **5** — the most motivating figure in a learning
product, rendered as one character.

Seven bars now, **height by minutes**, so a light day still reads as a day and a blank day is
visibly blank. The number stays beside it; the shape is what carries.

`Grow / StreakBars` — 7 days, with at least one zero day in the frame.

## 6 · "0 courses · 48 min total"

`LearningPath.minutes` is a **planning** figure entered when a path is created. It was printed
beside a **live** count of published courses, so an empty path claimed *"0 courses · 48 min
total"* — which cannot be true. Every populated path was wrong too: Shop-floor safety read 34 min
against 6 min of actual material.

Counted from what exists now. The planning figure moved to where it *is* true — the empty state,
which says the path is scoped and can be built from a document in one step.

## 7 · Tap targets

Pre-existing, on the page being worked: tabs at **33px**, the quiz answers — the primary
interaction on the screen — at **43px**, Enrol and Ask at **32px**. All at or above 44 now, and
the quiz answers at 48.

## 8 · What to draw

1. `Grow / ReviewItem` — **shaky** and **fading**
2. `Grow / CourseCard` — segmented lesson progress; the four statuses; **overdue** and
   **safety-critical**; with and without each of the two reason lines
3. `Grow / StreakBars` — seven days including a zero
4. `Grow / PathCard` — populated and the scoped-but-empty state
5. Every tab, chip and answer at 44px minimum; quiz answers 48
