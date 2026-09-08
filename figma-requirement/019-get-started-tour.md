# 019 · Vadal.ai › Get Started — a tour, one idea at a time

**Status:** built in code · `/product/get-started` · new nav group **Vadal.ai** above *My space*

---

## 1 · Why this exists

Two people arrive not knowing what the product does: a new employee on day one, and an investor
in a demo. Three earlier attempts to answer that with a landing page (a tile grid, a showcase, a
day-line) were rejected for the same reason — containers don't carry meaning. A list of feature
names tells you nothing about *why*.

The answer is the founders' plan: a **Vadal.ai** group in the nav — the assistant's own space,
where it surfaces things it has tailored for the person — whose first, permanent entry is
**Get Started**: a guided tour that gives the *idea* first and the live feature as evidence.

> Every step shows the real feature on your workspace's own data, and opens it.
> Takes about four minutes. Your place is saved.

---

## 2 · Nav

New group at the top of the rail, above *My space*:

| Group | Item | Icon | Pill |
|---|---|---|---|
| **Vadal.ai** | Get Started | `Compass` | steps left to explore (hidden at 0) |

The pill is live: it counts down as steps are explored on the page, and returns to 11 on
*Start over*. Breadcrumb domain reads **Vadal.ai › Get Started**. Reachable by every role; on
mobile it sits in *More*.

---

## 3 · Page anatomy (desktop, `lg:grid-cols-[280px_1fr]`)

**Header** — eyebrow `SparkMark · VADAL.AI · GET STARTED`, h1 *"A tour of what Vadal does, one
idea at a time."*, lede, then progress: `N of 11 explored` + `ai-grad` bar + **Start over**
(text button, `RotateCcw`).

**Left — the map** (`<nav aria-label="Tour steps">`, sticky at lg; a horizontal scroll strip on
mobile). One 44px-min button per step: numbered circle (`--purple` fill when current, ✓ when
explored), title, and a `Lock` icon (aria-label *"Not available to your role"*) when the role
cannot open that section.

**Right — the step** (`<article>`, re-keyed per step so the `rise` animation replays):
`STEP n OF 11 · SECTION` eyebrow → h2 title → *meaning* paragraph → **live demo** →
`lockedNote` (if locked) → footer: **Back** · **Open {section}** (link, only when allowed) ·
**Got it, next** (primary; *Finish* on the last).

Step index persists (`vadal:tour-step`); explored set persists (`vadal:tour-explored`).

---

## 4 · The eleven steps

| # | Title | Section opened | Live demo |
|---|---|---|---|
| 1 | What Vadal is | — | Org card: sections · AI features live · one assistant, counted from the registry |
| 2 | Your daily ritual | Home | The real `MoodCheck` |
| 3 | It listens, all the time | Pulse 🔒 employee | Health score (computed, 70 today) with every contribution bar (`SCORE_SOURCES`) |
| 4 | Recognition people actually feel | Recognition | A real recognition card |
| 5 | Their words, going out | Amplify | A real moment card |
| 6 | Wellbeing that fits the job | Thrive | `GoalRing` for *this* person's chosen focus |
| 7 | A door that is always open | One-to-One Help | Crisis resources (IN) as tel links, 44px |
| 8 | Five minutes is enough | Grow | Learning-day bars + the review queue |
| 9 | Answers, with the source attached | Knowledge | `findAnswer("How many paid leaves do I have?")` |
| 10 | One assistant — and it can act | — | Four prompts that dispatch `vadal:ask` |
| 11 | You're set | — | Done panel |

Locked steps are **kept, not hidden** — a new employee should learn the people team has Pulse and
that they will never see it. The note says so: *"…your own check-ins reach it only as an anonymous
part of the whole. That is by design."*

---

## 5 · Tokens & rules

Card `--card` on `--canvas`, `--line` borders, `ai-grad` for progress and the article's top rule,
`--purple` for the current-step circle, `--success` for explored ticks. Type floor 14/16/12. All
targets ≥44px on touch. Light + dark.

## 6 · Figma

Frames needed: rail with the Vadal.ai group (pill 11 / pill 0-hidden), page at 1440 and 375,
step states (current / explored / locked), the done panel, and one of each demo card.
