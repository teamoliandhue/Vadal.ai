# Vadal — product decisions (17 Sep 2026)

The eight questions that were waiting on Pradeep, answered by Oli&Hue so the build can finish.
Each answer says **why**, and **what changes if you overrule it** — every one of them is reversible,
and none has been built in a way that makes reversing it expensive.

---

## 1 · Navigation

**Decision.** Six domains after the person's own space, in the meeting's order:

| group | items |
|---|---|
| **Nudge** | Get Started (and, later, what Nudge tailors for you) |
| **My space** | Home · Social · **Kudos** |
| **Engage** | Campaigns · Amplify |
| **Listen** | Pulse · Sentiment · Always-on listening |
| **Learn** | iLearn · Knowledge |
| **Insight** | Insight · Analytics |
| **Wellbeing** | iThrive · SmartWork |
| **Operations** | Manager hub · Flow |

**Why.** The meeting's order (Engage → Listen → Learning → Intelligence → Health) is how the pitch
flows; the naming doc's domains are the words people will see. Kudos moves into *My space* because
it is the one engagement action every employee takes daily — it was buried under Engage beside two
admin tools. Knowledge joins Learn instead of being a group of one. Operations stays last: it is
manager and HR work.

**If overruled.** The order lives in one file (`nav-model.ts`); reordering is minutes.

## 2 · Health

**Decision.** iThrive stays the module. *Health* stays the score badge in the rail (it opens Insight). It is
not a nav section.

**Why.** Two things called Health in one rail — a module and a score — would collide.

## 3 · Home

**Decision.** Home becomes a **digest**: *Yesterday · Last week · Your week ahead · What's new* — read-only
except the **daily check-in**, which stays at the top. The nine product cards stay under the greeting.

**Why.** The check-in is the habit the whole adoption story rests on (69% weekly, and higher on the
floor). Taking it off Home would cut the one daily action.

## 4 · Get Started after the first visit

**Decision.** The rail group is renamed **Nudge**. Get Started lives there, first-visit landing unchanged.
Once the tour is finished or dismissed, the item reads **Product tour** and moves below whatever Nudge
has tailored (today: *For you* — a short list of next actions).

**Why.** It keeps the investor landing, and gives the assistant a home in the rail rather than only a
floating pill.

## 5 · Points

**Decision.** **Points is a workspace mode, on by default**, switched in *Settings › Recognition & points*.
With points **off**:
- Kudos, the feed and Home show recognition and badges — no numbers, no balance.
- Leaderboards rank by recognition received and challenges completed, never points.
- The wallet and marketplace are hidden; experiences an admin configured can still be *granted* by a manager.
- Adoption is already counted without points (spec 029).

**Earning rules** (points on): kudos given 10 · received 25 · a post 5 · survey completed 15 (flat — never
more for a longer or "better" answer) · a learning module 20 · an assessment passed 40 · a health
challenge day 5 (opt-in only) · manager: a 1:1 completed 15. **Never** for ratings, performance or
attendance. Daily caps stop farming.

**Why.** Some clients will refuse points on principle; a flag that leaves numbers scattered around
would look broken to them. A mode with a designed "off" state sells to both.

## 6 · Naming leftovers

**Decision.** **Keep the names the client's naming doc chose**: iThrive, iLearn, SmartWork, Amplify,
Social, Nudge. No further renames.

**Why.** Dropping the "i" or renaming SmartWork is a taste call the client already made in writing. A
second rename two weeks later costs more trust than it gains clarity. The one real overlap
(asking questions) is solved in the product: Nudge answers anywhere; Knowledge is where answers live;
SmartWork is one-to-one help with a person.

## 7 · The missing P1s

**Decision.** Not dropped — delivered **inside Pulse as ready-made programmes**, plus two lifecycle screens:
- Pulse templates: **Onboarding (day 7 / 30 / 90)**, **Stay interview**, **Manager effectiveness**, **Exit**.
- **Onboard** (a new joiner's first 90 days) and **Alumni** (people who left — boomerang hires, referrals).

**Why.** They are survey programmes and lifecycle moments, not new pillars. Building them as templates
reuses Pulse's anonymity, scheduling and reporting instead of duplicating them.

## 8 · Redemption beyond the marketplace

**Decision.** **Experiences yes, pay no.** Offsites, team lunches, travel and extra leave can be
configured as rewards. **Appraisal marks and bonus are not catalogue items** and are not demoed.

**Why.** Letting points buy appraisal marks or bonus ties engagement currency to compensation — a
legal, tax and fairness problem in most markets, and exactly what a CHRO will ask about first. If a
client insists, it is an HR policy they own, configured outside Vadal.

---

## What this unblocks

Nav restructure · Home digest · Get Started in Nudge · points ledger + mode · marketplace ·
health leaderboards · widget Home · Pulse lifecycle programmes · Onboard · Alumni. See `ROADMAP.md`.
