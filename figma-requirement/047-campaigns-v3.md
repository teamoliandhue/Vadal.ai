# 047 · Campaigns v3 — Overview, Planner, Results, and a four-step builder

**Status:** built in code · `/product/campaigns` · supersedes the page layout in 046 (its data model, the
weekly send limit and honest results carry over) · references: Klaviyo and Mailchimp (List/Calendar views
of the same campaigns), Airtable, Plane and Qatalog timelines (weeks across, today line)

**Why:** v2 was a stack of seven equally weighted blocks. Campaigns are planned in time, but time was only
visible as lists of dates. The alert pushed the campaigns below the fold, the progress bars used objective
colours (red onboarding looked like an error), templates sat at the very bottom, and the builder was one
long form. v3 separates the three jobs — **see**, **plan**, **learn** — and makes time the visual
backbone.

---

## 1 · Header

- Eyebrow *ENGAGE* · H1 *Campaigns* (28–38px, −0.03em).
- A one-line summary instead of four stat tiles: **3** running · **4** sends in the next 7 days · **1 thing
  needs you** (warning colour, semibold; admins only). It reads *nothing needs you* when that's true.
- **New campaign** (brand).
- **View tabs**, underline style: **Overview · Planner · Results** (44px on touch).

## 2 · Overview

Top to bottom it answers: is anything wrong → what's going out → what starts soon → what to run next →
what finished.

- **Needs you:** one slim row per issue, radius 16.
  - Send limit (warning 10% fill, 28% inset ring): *⚠ **Plant Ops would get 5 messages** the week of 28 Sep —
    the limit is 3.* · **See the week** (text button; opens the Planner on that week with the team's cell
    already open) · **Start "Recognition push" a week later** (brand). On a phone both buttons are full
    width, the fix first.
  - Paused campaign: pause icon · *Wellness Week is paused — nothing goes out until you resume it.* ·
    **Resume**.
  - When nothing's wrong, one calm line: *✓ Nothing needs you — every team is within 3 messages a week.*
- **Group headings:** 13px uppercase faint + count (*RUNNING NOW 3*, *STARTING SOON 2*, *FINISHED 1*).
- **Campaign row** (radius 22; hover border tints purple with a soft lift; from `lg`, 4 columns):
  1. **Identity:** a 44px neutral objective tile (emoji on `--soft`, 1px line — no objective colours) ·
     name (16px semibold) + **status pill** · *Reduce burnout · All org* · a *Next · Mid-week pulse check ·
     Mon 21 Sep* line with the channel icon. Scheduled campaigns say *Starts in 10 days · …*.
  2. **Mini timeline:** a 3px track spanning first→last send; an `--ink` 70% progress fill up to today; a
     20px dot per send (filled `--ink` with a white channel icon once sent, a ring until then, red ring for
     safety); a 2px `--purple` today line; start and end dates under the ends, with *Today* in purple.
  3. **Metrics:** *76%* took part · *+5.2* pts lift (success), or *0/4 sent* before results exist. 18px bold
     tabular, 12px faint labels.
  4. Chevron.
- **Status pill:** Live = green dot with a soft ping (off under reduced motion) · Scheduled = calendar ·
  Paused = pause · Finished = check. Each is a 12% tint of its colour.
- **Nudge suggests** (admins): Aurora card with a soft gradient bloom top-right. Left: eyebrow, 22px
  title, reason, **Plan this campaign** · *Why this?* Right: *THE PLAN · 2 WEEKS* with *Predicted +3.4 pts*
  (success) and numbered steps.
- **Finished rows:** tile · name · *audience · dates* · *41% took part* · *+0.3 its own lift* · **Run
  again, improved** when there are lessons.

## 3 · Planner

- **Toolbar:** ‹ › (44px on touch) · **Today** · *7 Sep – 18 Oct* · a legend: Sent (filled) · Planned
  (ring) · Safety (red ring) · Scheduled (dashed bar) · Today (purple line).
- **Timeline** (radius 24; scrolls sideways under 880px; the name column is sticky and 140px on a phone,
  232px from `sm`; on a narrow screen it opens scrolled to today):
  - Header: one column per week — *14 Sep* + M T W T F S S — and a purple date bubble on today.
  - One lane per campaign (64px): name + audience, then a 36px pill-shaped bar across its span.
    Live = 14% purple fill · Scheduled = dashed purple outline · Paused = warning stripes · Finished =
    `--soft`.
  - A 24px marker on each send's day, same states as the mini timeline; hover or focus scales it and
    shows date · send · channel. Tapping it opens the campaign.
  - The today line runs through every lane. A flagged week is tinted warning 7–10% down the column.
  - Footer notes: *Swipe sideways to see all six weeks* (phone) · *1 campaign is outside these weeks — use
    the arrows to see it.*
- **Messages per team, per week** (radius 24): a table with teams as rows and weeks as columns, 44px
  cells, 4px gaps.
  - Cell fill steps up with the count on one purple ramp (8/17/26/35%). The number is always printed.
  - Over the limit = warning 22% fill **+ ⚠ icon**. It never relies on colour alone.
  - Empty cells are a faint dot.
  - Legend: 1 · 2 · 3 · ⚠ Over the limit.
  - Selecting a cell opens a detail panel below: *Plant Ops · week of 28 Sep · 5 messages · over the limit
    by 2*, the sends in date order, and **Start "…" a week later**.

## 4 · Results

- **How much each campaign really moved:** one stacked bar per campaign, 16px tall, with a 2px gap
  between segments and 4px rounded outer ends.
  - Segments: `--viz-1` = the campaign's own; muted grey = would have moved anyway.
  - The headline number is its own (*+4.6* of +5.2).
  - A legend is always shown; hover or focus gives a tooltip for each segment; there's a Chart/Table
    toggle; *Compared with …* sits under each bar.
- **Which channel reached people:** the standard bar list + table, plus a computed Nudge line (*WhatsApp
  and Email reach the most people. Push reaches the fewest — on shared phones it rarely gets to the person
  it's meant for.*).
- **What the finished ones taught:** soft cards with lightbulb lessons and **Run again with these
  changes**, then **Ask Nudge what to run next**.

## 5 · Campaign drawer

Header (48px tile, 20px name, status pill, objective, *To … · run by …*) → mini timeline → Reached / Took
part / **Its own lift** tiles → a plain sentence on the comparison group → participation by channel → **the
plan as a vertical timeline** (28px nodes: a check once sent, the channel icon until then, red for safety;
the connector is ink once sent, line after) → Aurora readout → lessons → actions (Pause / Resume / End now
/ Start a week later / Run again / Ask Nudge).

## 6 · New campaign — four steps

- The drawer title changes with each step: *What's it for, and who's it for?* / *What goes out, and when?* /
  *What does it say?* / *Ready to go?*
- **Stepper:** four 4px bars with *1 · Goal* labels. Done = purple 55%, current = purple, later = line.
  You can jump back.
1. **Goal:** *Start from* — Nudge's suggestion (Aurora, full width), six template tiles (2 columns;
   selected = purple border + `--lav`), *Start blank* (dashed). Then Name · Objective pills · Audience ·
   Starts / Runs for · *Mon 21 Sep → Sun 4 Oct*.
2. **Sends:** channel pills.
   - Warning box: *Most of Plant Ops is on shared phones. None of these sends go by WhatsApp or SMS, so many
     won't see them.* · **Send them on WhatsApp** (sets every send). The check is judged on what the sends
     use, not on which channels are ticked.
   - *YOUR PLAN* mini timeline, live.
   - Send cards: number · name · remove, then *Day [n]* · date · channel.
   - **Draft the sends** (Aurora) · **Add a send**.
3. **Message:** a 6-row textarea + *Draft for this objective* + the delivery preview (spec 038).
4. **Review:** a summary card (tile, name, objective · audience, mini timeline, Starts · Sends · Channels),
   then either *✓ Every team stays within 3 messages a week* or the warning with **Start a week later**.
- **Footer**, pinned under the scroll: Cancel / **Back** on the left; **Next: Sends →** or **Schedule for 28
  Sep** / **Launch now** on the right.

## 7 · Drawer footer (all drawers)

`Drawer` now has a `footer` slot rendered under the scrolling area, so actions always sit on the bottom
edge (above the home indicator on phones). Before this, sticky footers floated 28px up with form fields
showing beneath them. New campaign, Give recognition, New survey and the post comment box now use it.
