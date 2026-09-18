# 050 — Sentiment v2: how people feel, what about, and where

**Route:** `/product/sentiment` (admins; managers pinned to their own team) · **Code:** `apps/product/src/app/product/sentiment/SentimentDashboard.tsx` · **Data:** `apps/product/src/lib/sentiment.ts`
**Status:** Built · needs Figma

## Why
- Theme arrows showed "more mentions" in red, so Recognition (rising, 78% positive) looked like bad news.
- A theme had one label (positive / negative) when every theme is a mix.
- Months ended in June; it's September.
- No answer to "where is it worst?".
- A developer-facing "Read from the comments / extractor" box sat in the middle of the page.
- Alerts ended in an "Act" link that only showed a toast.
- Nudge's summary was at the bottom.

## Layout, top to bottom
1. **Header** (same pattern as Pulse / Campaigns): eyebrow **Listen**, H1 **Sentiment**, line "Net 52 ↗ +5 since Mar · 4,120 comments". Right: team picker (pill select, 44px) and period switch (3 / 6 / 12 months). Managers see a fixed team pill instead of the picker, plus the existing scope notice.
2. **The month card** (Aurora top hairline), two halves:
   - **Nudge's read · this month**: three short bullets (16px), and "Ask Nudge what to do".
   - **Worth a look**: inbox rows (same row pattern as Pulse "Needs you"): 40px tinted icon circle, coloured uppercase label, title, one line, one action on the right.
     - *Mood falling* (danger): "Plant Ops is down 9 points this month" → **See Plant Ops** (re-scopes the page).
     - *New and rising* (warning, spark): "Appraisal timeline: 3× the mentions of last month" → **Open theme**.
     - *Needs a fix* (danger, wrench): "Workload & burnout is 70% negative and growing" → **Commit to a fix** (opens the Pulse follow-up sheet; it appears in Pulse → What we promised).
3. **How people feel now** (left, narrower): net number 52px + change since the period start; the split bar (negative · neutral · positive, 2px gaps) with a % legend; **Where the comments come from**: survey comments, Social, team chat (opted-in channels), always-on check-ins, as thin bars with %. Note: "Nothing is ever shown with a name."
4. **Over time** (right, wider): line chart of positive % (viz-1) and negative % (viz-2) per month, ending in the current month; legend, hover/keyboard crosshair, end labels, Chart / Table toggle.
5. **What people talk about**: filter chips (All · Getting worse · Getting better · Mostly negative) and a legend. One row per theme:
   - left: name + "70% negative" / "78% positive" / "Mixed";
   - middle: the split bar;
   - count + "+38% mentions";
   - mood tag with icon + label: **Getting better** (success, trend-up), **Getting worse** (danger, trend-down), **Steady** (muted, minus);
   - chevron.
   
   Row opens the theme sheet. Themes under 5 comments at a scope are hidden, with a lock note.
6. **Where it's felt** (admins only): teams, lowest first. Each row: name, a 0–100 bar (orange when more than 5 below the company, violet otherwise) with a thin ink tick at the company score, the net, and the change this month. Rows are buttons that re-scope the page. Teams under 5 people: lock + "Fewer than 5 people — hidden". Legend under it.
7. **In their words**: one comment per theme (only from themes of 5+), as soft quote cards: quote 15px, then theme · team · when.

## Theme sheet
Mood tag, name (24px), "312 mentions · +38% on last month", Nudge's read in an Aurora box, **The mix** (split bar + %s), **Mentions, last six months** (small line chart), **Where it comes from** (team share bars, admins only), **In their words** (quotes, or an anonymity note). Footer: **Ask Nudge** · **Commit to a fix** (brand).

## Colour
Positive = viz-1 (violet), negative = viz-2 (orange), neutral = grey — the same as Pulse's answer spread. Status colours (success / danger) appear only on the better/worse tags and changes, always with an icon and a word.

## Figma to build
1. Sentiment 1440, all teams (month card, now + over time, themes, teams + voices).
2. Same at team scope (Engineering), including the hidden-theme note.
3. Theme sheet (Workload & burnout).
4. Manager view (pinned team, no team list).
5. Hidden state (team under 5 people).
6. Phone 375: header controls stacked, month card stacked, theme rows (name → bar → count → tag), team rows.
7. Dark mode of 1.
