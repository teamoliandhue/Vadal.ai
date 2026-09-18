# 046 · Campaigns v2 — dated plans, the weekly send limit, honest results, run it again

**Status:** built in code · `/product/campaigns` (managers see their own team's, admins see everything) ·
source: section-by-section design pass

What was wrong:
- The "live" campaigns were dated June, and it's September.
- Managers saw every team's campaigns.
- The channels (Feed, Email, Push, Pulse) didn't match how the frontline is actually reached (WhatsApp, SMS).
- The list was a 720px table that scrolled sideways on a phone.
- Nothing stopped one team getting five messages in a week.
- "Lift" was credited to the campaign in full.

---

## 1 · Page

1. **Header** — eyebrow *ENGAGE* · *Campaigns* · a description (*Plan what goes out and when, check no team
   is flooded, and see what actually worked* / for managers: *Campaigns that reach Design, and the ones you
   run for your team*) · **New campaign**.
2. **Four tiles:** Live now · Scheduled · Took part (average, running and finished) · Next send (*21 Sep*,
   note *Mon · Wellness Week*).
3. **Send-limit warning** (admins; warning tint 9% + 26% inset ring, radius 26):
   - *Plant Ops would get 5 messages the week of 28 Sep*;
   - *The limit is 3 a week. Past it, people start to ignore all of them. Safety sends don't count.*;
   - the sends in date order: date (88px, tabular) · channel icon · the send · *· campaign*;
   - **Start "Recognition push — cold zones" a week later** (brand, calendar icon) + *Everything still lands —
     just not all at once.* This moves the scheduled campaign that contributes most. The warning disappears
     once no team is over the limit.
4. **Nudge suggests · next campaign** (Aurora; admins only). Unchanged content, lighter padding.
5. From `xl` there are two columns:
   - **All campaigns** (or *Reaching Design*) + status pills *All 6 · Live 3 · Scheduled 2 · Completed 1*
     (paused campaigns count as Live). The list is now **cards** (2 columns from `lg`): objective tile ·
     name · audience with a people icon · status badge · window + *2 of 5 sent* over a progress bar in the
     objective colour · *Next: Refreshed benefits guide · Thu 24 Sep* with the channel icon · *76% took
     part* · *+5.2 pts* · for managers, *Run by People team*.
   - **Coming up · What goes out, and when** (360px rail): the next 8 sends grouped by day (uppercase date
     header, a hairline between days). Each row: channel icon in a 28px soft tile · the send (+ a red
     **Safety** pill) · *campaign · channel · audience*. Tapping one opens the campaign.
6. **Start from a template** — cards scroll sideways on a phone (260px wide), grid from `md`.
7. **What worked** — two cards:
   - **Which channel reached people** — the standard single-series bar list, average % who took part per
     channel (*WhatsApp 71% · Teams 72%…*), with a Chart/Table toggle.
   - **Honest results · Lift, after the comparison group** — each campaign's net figure (bold, right), then
     faint *+5.2 in the campaign · +0.6 for the same teams in the four weeks before*.

## 2 · Campaign drawer (bottom sheet on a phone)

- Status, objective, window · *To All org · run by People team*.
- Reached / Took part / Lift tiles, then a `--soft` sentence: *Day shift, same weeks moved +0.8 without the
  campaign — so about +0.3 is the campaign's own.*
- **Took part, by channel** bar list.
- **Plan:** numbered steps with a check once sent · the send (+ Safety pill) · *[channel icon] WhatsApp ·
  Mon 28 Sep*.
- Aurora readout.
- **What to change next time** (finished campaigns): bulleted lessons.
- **Actions**, for whoever can edit it:
  - Live: **Pause** / **End now**;
  - Paused: **Resume** / **End now**;
  - Scheduled: **Start a week later**;
  - Finished: **Run again with these changes**, which opens the builder with the same plan plus the lesson's
    step (*QR poster at every shift-change point*) and channel (*WhatsApp*).
  - Everyone gets **Ask Nudge**.
  - Managers looking at a company campaign see *Run by People team. You can see it because it reaches Design;
    changes are theirs to make.*

## 3 · Builder

- **Name · Objective** (pills, 44px on touch) · **Audience** (managers: their team only) · **Starts**
  (date, today or later, default next Monday) · **Runs for** · *Ends Sun 4 Oct*.
- **Channels** now include WhatsApp, SMS and Teams. For a frontline audience without WhatsApp or SMS, a
  warning line: *Most of Plant Ops is on shared phones — add WhatsApp or SMS, or many won't see it.*
- First message + delivery preview (spec 038).
- **Plan · 4 sends** + **Draft a plan**. Each send card: number · name · remove (44px on touch), then a
  second row: **Day [n]** · the computed date · a channel select. Draft a plan spreads sends across the
  campaign.
- **Send-limit check:** if the new plan would push a team over the limit, a warning box above the footer
  reads *With this plan, Plant Ops would get 5 messages the week of 28 Sep — the limit is 3. Start later, or
  spread the sends out.*
- Footer: *4 sends · starts Mon 21 Sep* · Cancel · **Schedule** (or **Launch now** when it starts today).

## 4 · Copy spacing fix (all pages)

In this build, a text run that follows an element and contains an entity (’ “ &) lost its leading space
(*+0.3is*, *9things*). Ten places across the product now have an explicit space. Worth checking in QA
wherever text follows a bold or linked word.
