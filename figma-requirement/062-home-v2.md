# 062 — Home: one clock, and the work instead of a product directory

**Route:** `/product/home` · **Code:** `apps/product/src/app/product/home/*` · **Data:** `apps/product/src/lib/home.ts`, `lib/digest.ts`
**Status:** Built · needs Figma

## Why
Home is the screen everyone lands on and the only one still on its first version. Three things were wrong with it, and none of them were "it needs more".

**It could not agree with itself about the day.** The hero printed a hard-coded *Tuesday, 9 June* while the week-ahead widget listed dates in September — and the greeting claimed a 12-day streak beside a check-in card claiming 13. A daily ritual screen that contradicts itself twice above the fold is not a ritual.

**It opened with a product directory.** Nine marketing tiles sat under the greeting, each with a number nobody acts on (82, 312, 204, 91%), using pillar names the product no longer uses — *Broadcast*, *Managers*. The sidebar already lists every module; Get Started already runs the tour.

**It leaked a private answer.** For a manager, the digest read *"Rohan's check-ins dipped three days running"*, and the team snapshot showed **At-risk 3 · 1 high** with faces. That is the individual-level inference we removed from Manager hub (054) and Insight (061), and it contradicts what iThrive and the check-in promise the person making it.

## What Home is now
Hero · **Waiting on you** · tour resume (only if mid-tour) · the digest board, unchanged.

### One clock
`lib/home.ts` owns the date. `todayLong()` writes *Tuesday, 22 September* by hand — never ICU, which is what produced "Sept" elsewhere. The week-ahead items carry `inDays` offsets instead of fixed dates and render as **TODAY 22 · TOMORROW 23 · THU 24**, so the strip is correct on any day rather than only on the day it was seeded.

### One streak
The streak appears in the check-in card only, and `me.streak` counts today once logged — the same number the You widget shows. The hero no longer competes with it.

### Waiting on you (new, replaces the nine tiles)
- Lead card with the Aurora hairline: **"5 to finish"**, or **"Nothing is waiting"**.
- Per row: what it is, why it is here, how long it takes when we honestly know ("2 min", "12 min"), an **Overdue** badge where true, the action button, and **Not now**.
- Role-filtered and access-checked: an employee sees three, a manager gains the 1:1s they owe, an admin gains the posts awaiting review.
- **One count, one list.** The hero and the card read the same rows and the same dismissals — the state is lifted, because two copies of the hook disagreed the moment anyone pressed "Not now".
- **A joiner owes nobody a compliance refresher**, so the first-run Home (`?view=new`) shows the empty state: *Things you need to finish will land here as your first week starts.*
- Empty state for everyone else: *Nothing is yours to finish today. The rest of Home is news, not work.*

### Team snapshot (fixed)
Team score · 1:1s held · Kudos given — then *"2 1:1s overdue — Rohan and Sara"*, because a 1:1 that has not happened is a fact both people know. No risk count, no "people need attention", no faces of people flagged by a model. It closes with the promise in one line: **your team's score, not anyone's answers. Individual check-ins stay private, including from you.**

The digest's manager line changed the same way: *"Rohan has not had a 1:1 in six weeks. The next one is still unbooked."*

### Names come from one place
The 1:1 item is built from the same manager rows the snapshot and Manager hub read, so the three can never name different people. The week-ahead line stopped repeating names altogether.

## Also
Touch targets: the "Viewing as" pills go to 44px on a phone. Type: the last 11px text on Home (the Vadal badge, the calendar source label, the "Now" chip) moved to 12px.

## Not touched
The widget board and its Customise/arrange machinery, the digest widgets themselves, Feed, Quick poll, Ask Nudge and the phone board. `ProductGrid` stays where it belongs — in Get Started.

## Figma to build
1. Home 1440, employee — hero, Waiting on you with three rows, digest board.
2. Home 1440, manager — the extra row, and the rebuilt team snapshot.
3. Waiting on you: both empty states (all clear, and first run).
4. Phone 375 of the hero and Waiting on you; dark mode of Home.
