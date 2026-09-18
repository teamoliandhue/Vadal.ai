# 049 — Pulse v2: ask, read, and change something

**Route:** `/product/pulse` (admins) · **Code:** `apps/product/src/app/product/pulse/` (`SurveysHub`, `Overview`, `Surveys`, `Results`, `FollowUps`, `parts`) · **Data:** `apps/product/src/lib/pulse.ts`
**Status:** Built · needs Figma

## Why
Pulse was six admin tools stacked on one page (counts, a table, automatic surveys, a send plan, templates, one thin results card). Results showed one "top answer %" per question, with no change over time, no benchmark and no team breakdown. Nothing turned a result into a fix, and employees never heard what changed.

## Structure
Header: eyebrow **Listen** · H1 **Pulse** · summary line "3 live · 57% have answered Q3 Engagement Pulse · 3 follow-ups open, 1 due this week" · **New survey** (brand). Underline tabs **Overview · Surveys · Results** (same as Campaigns and Amplify).

## 1. Overview — what needs you
- **Needs you (N)** — cards with a 3px coloured left edge and a single action:
  - team behind on a live survey (warning, bell icon): "Plant Ops · night shift is at 34%" → **Send a reminder** (respects each person's own time and the weekly send limit).
  - late follow-up (danger, clock): "…was due Tue 15 Sep" → **Mark done**.
  - early read ready (AI spark): "Growth is down 6 points since last round" → **See results**.
- **Live now** — one card per live survey: status pill (breathing dot), kind · audience, big % answered, progress bar with a dashed tail to the projected finish, "7,110 of 12,480 · Closes Fri 25 Sep, in 7 days · On pace for about 71%". **By team, lowest first**: name, mini bar (warning colour + ⚠ when under 45%), %, **Remind** / "Reminded". Buttons: Early read · Details.
- **What we promised** — follow-ups grouped In progress / Planned / Done: status dot, title, topic · audience · due (late in red: "3 days late · was due 15 Sep"), owner avatar, **Start** / **Done**. "+ Add".
- **Coming up** — scheduled surveys ("Opens Mon 5 Oct · People managers · 240 people") and "4 surveys run on their own" → Surveys tab.

## 2. Surveys
- **All surveys**: status filter (All · Live · Scheduled · Closed with counts, 44px). A list card with a row per survey; the whole row is a button. Desktop columns: Survey (name + kind) · Audience · Status · Answered (mini bar + %) · When · chevron. Phone: name, kind · audience, status pill on the right, and the bar, % and when on the second line.
- **Run on their own**: the lifecycle programme cards (unchanged content, new heading).
- **Survey details** (side sheet / bottom sheet): status, kind · audience, name; 2×2 facts (Opens, Closes, Invited, Answered); progress + "On pace for about 71% by Fri 25 Sep"; **When each person gets it** (the send plan, now a list); footer **See results / See the early read**.
- **New survey** (builder): "Start from" chips (Blank + 7 templates, with the template's description under them), then name, audience, cadence and questions as before. 44px targets, 13px labels.

## 3. Results
- **Survey picker**: pill chips (live ones marked "Early read").
- **Headline card** (Aurora top hairline): left column **Engagement 66% ↗ +2 pts** ("I'd recommend…" · benchmark 63%) and **Answered 57%**; right column eyebrow "Early read · 7 days to go" / "Final · closed 26 Jun", survey name, Nudge's summary with the gradient spark, a caveat for early reads, **Commit to a fix** (brand) + **Ask Nudge what to do first**.
- **Every question**: diverging stacked bar centred on neutral (Strongly disagree = viz-2, Disagree = viz-2 50%, Neutral = grey, Agree = viz-1 50%, Strongly agree = viz-1; 2px gaps, 4px rounded ends), legend with all five, hover/focus tooltip per segment. Right: favourable % (20px bold) + change (arrow + "+6 pts", green/red) and "10 below benchmark" (red when ≥5 below). "Commit to a fix" link on weak rows. Chart / Table toggle (table lists all five %, favourable, last round, benchmark).
- **What moves engagement most**: scatter, x = effect on engagement ("Matters less → Matters more"), y = favourable %. The bottom-right "Fix first" quadrant is tinted warning; "Protect" / "Watch" corner labels. Points are 6px viz-1 with a 2px card ring and a direct label; hover/focus tooltip; click to commit a fix. Summary line: "Fix growth first. It moves engagement more than anything else we asked, and only 48% are positive about it. Workload is next." Table view.
- **What people wrote**: themes with count, tone as icon + label (Positive / Negative / Mixed) and a "Rising" chip, a thin bar, → "Read the comments in Sentiment".
- **By team**: heatmap table. Company row on soft grey; team rows coloured by distance from the company (orange below, neutral about the same, violet above; strength scales with the gap), with the % in ink. Legend with three swatches. Hover tooltip "−15 vs company · commit a fix"; cells ≥5 below are clickable and open Commit prefilled with team + topic. Teams under 5 answers: dashed row, lock icon, "Fewer than 5 answers — hidden so no one can be identified".
- **Follow-ups from this survey** + **Commit to a fix**.

## 4. Follow-ups
- **Commit to a fix** sheet: topic chips, "The fix" field with two Nudge ideas per topic (tap to fill), Owner, Due (date, not before today), Who it's for. Note: "They'll hear about it when it's done — not before."
- **Tell people what changed** sheet: a drafted "You said, we did" note ("You told us workload needed work in Plant Ops. What we did: … Tell us in the next pulse whether it made a difference."), editable; **Post it on Social** checkbox (on by default); **Mark done and share**. It posts to #company on Social as "You said, we did. …".

## Tokens / components
Drawer (side sheet / bottom sheet with footer slot), StatusPill, Delta, SpreadBar, SpreadLegend, ResponseBar, ViewToggle, Avatar, Button; --viz-1/--viz-2, --warning/--danger/--success, --ai-* for Nudge.

## Figma to build
1. Overview 1440 (needs-you row, live card with team list, promised list, coming up).
2. Results 1440 — headline, every question, driver chart + themes, heatmap.
3. Surveys 1440 list + details sheet; builder with Start-from chips.
4. Commit sheet and Done sheet.
5. Phone 375: Overview, Results (question rows stack: text → bar → % row), Surveys rows.
6. Dark mode of Results.

## Next (not in this spec)
Managers see their own team's results, heatmap row and follow-ups; employees see "Last time you said … here's what changed" on the respond page and Home.
