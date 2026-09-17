# 030 · Navigation, Nudge group and For you

**Status:** built in code · every screen's rail, the mobile "More" sheet, ⌘K, breadcrumbs ·
`/product/for-you` · source: `docs/DECISIONS.md` §1 and §4

---

## 1 · The rail, in order

| group | items | who sees what |
|---|---|---|
| **Nudge** | Get Started · For you | everyone |
| **My space** | Home · Social · **Kudos** | everyone |
| **Engage** | Campaigns · Amplify | Campaigns: managers and up |
| **Listen** | Pulse · Sentiment · Always-on listening | Sentiment: managers up · Pulse, Listening: admins |
| **Learn** | iLearn · **Knowledge** | everyone |
| **Insight** | Insight · Analytics | Insight: managers up · Analytics: admins |
| **Wellbeing** | iThrive · SmartWork | everyone |
| **Operations** | Manager hub · Flow | Manager hub: managers up · Flow: admins |

Settings stays pinned at the foot. Groups that empty out for a role disappear.
The group *Vadal.ai* is now **Nudge**; the one-item *Knowledge* group is gone.

**Breadcrumb roots** follow the same groups (*My space › Kudos*, *Learn › Knowledge*, *Nudge › For you*).

## 2 · Get Started → Product tour

While the tour is unfinished: **Get Started** is first in Nudge with the count of parts left.
Once every part is explored **or** the tour is dismissed: it reads **Product tour**, loses the count,
and moves **below For you**. Same in the mobile "More" sheet.

## 3 · For you

A single column, 760px max.

- Eyebrow: spark + **NUDGE** · H1 **For you, Priya** (clamp 26–34px) · a line that counts honestly:
  *8 things worth your time today — 3 of them take a minute or two. None of it is urgent.*
- **Suggestion cards** (`rounded-[22px]`, `card-lift`, staggered `rise`): a 44px `--lav` icon tile ·
  title 16/700 with *1 min* in `--faint` when short · Nudge's reason with a still spark, 14 `--muted` ·
  **primary action** (violet pill, arrow) · **Not today** (quiet; hides it until tomorrow).
- **Empty:** dashed box, large spark, *You're all caught up* · *Nudge will add something here when
  there's a reason to. Hidden suggestions come back tomorrow.*

What can appear, in priority order, each only for people who can open it:

| suggestion | shows when |
|---|---|
| Check in for today | not checked in today |
| *n* posts are waiting for review | admins, queue not empty (mentions a hazard only if one is in the queue) |
| Two people haven't had a 1:1 in six weeks | managers and up |
| The September pulse closes Friday | admins |
| Thank Neha for the onboarding flow | everyone |
| Finish "Giving feedback" | learning not finished |
| Your onboarding win is worth sharing | everyone |
| Day 4 of the Monsoon 10K | everyone |
| Join Book circle | everyone |
| *n* parts of Vadal you haven't tried | tour unfinished and not dismissed |

## 4 · URLs match the names

| was | now |
|---|---|
| `/product/feed` | `/product/social` |
| `/product/recognition` | `/product/kudos` |
| `/product/surveys` | `/product/pulse` |
| `/product/thrive` | `/product/ithrive` |
| `/product/help` | `/product/smartwork` |
| `/product/grow` | `/product/ilearn` |
| `/product/cases` | `/product/flow` |

Every old URL — including deep links like `/product/feed/groups/runners` — **redirects permanently**.

## 5 · ⌘K

*Jump to* is built from the rail itself and filtered by role, plus Communities, Review (admins) and
Settings. The old hand-kept list sent most entries to Insight.

## 6 · Figma

Rail for employee, manager and admin (tour unfinished and finished) · the mobile More sheet ·
For you at 1440 and 375 with the full list, a short list, and the empty state.
