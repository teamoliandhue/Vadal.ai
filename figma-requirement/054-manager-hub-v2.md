# 054 — Manager hub: the week, the people, and the team's own results

**Route:** `/product/managers` · **Code:** `apps/product/src/app/product/managers/ManagerHub.tsx`
**Status:** Built · needs Figma

## Why
Two problems, one of them a promise the product was breaking.

**The serious one.** The old screen printed a sentiment score and a six-point trend per named report — "Rohan Mehta · 58 · down". Everywhere else Vadal promises the opposite: For you says "your check-ins stay yours, and nothing here is sent to your manager"; iThrive says the same; Pulse hides any cut under five people. A manager screen that quietly breaks that makes all of those lines a lie, and the first employee who notices stops answering honestly.

**The other.** 220 lines, untouched since July: one column, no sense of what today needs, and no answer to the question every manager asks — *what did my team say in the pulse?* (the piece spec 049 deferred).

## Three views
Header: eyebrow **Operations** · H1 **Your team** · "6 people · 5 things need you this week · Design" · **Ask Nudge about your team**.

### This week
- Lead card (Aurora hairline): **1:1s on time 67%**, **Recognised in 30 days 58%** against the company's 61%, and Nudge's read naming the two people with no recognition.
- **Needs you (5)** — an inbox list, same row pattern as Pulse and For you: a tinted icon by kind (1:1, recognition, survey), the due label in colour, the title, the context, and two actions — **Prep** (opens the 1:1 sheet) and **Done**.
- Empty state: "Nothing outstanding — your 1:1s are current and everyone has been recognised this month."

### Your team
One row per person: avatar, name, role · tenure, then three facts — **Last 1:1** (red when overdue), **Next**, **Kudos · 30d** (amber at zero) — and **Prep a 1:1**. A person with a gap carries an amber line naming it: "No 1:1 in 6 weeks · No recognition in 30 days".

Closing line, in full: *"You are not shown anyone's check-ins, survey answers or what they wrote in a comment — not as a score, not as a trend. That is the promise the product makes them, and it is the reason they answer honestly."*

### Team results — the manager's own cut of Pulse
- Their team's mood with the month's change, against the company, and how many answered.
- Nudge's read of the weakest answer, phrased correctly when the team is *above* the company.
- **Your team, against the company**: favourable % per topic, weakest first, each bar with an ink tick marking the company, orange when 5+ below.
- Under five answers → the same anonymity card the rest of the product uses: hidden, including from the manager.
- "Open Pulse" appears only for roles that can actually open Pulse; managers get "Share this with the team" instead.

## 1:1 prep sheet
Avatar and role, four facts (last 1:1, next, kudos in 30 days, tenure), **What to open with** (three AI lines), and a lock note: drafted from things you can both see — 1:1 history, recognition, what they shipped — never from their check-ins or survey answers. Footer: **Recognise them** · **Book the 1:1**.

## Figma to build
1. This week 1440 — lead card and the needs-you list.
2. Your team 1440 — six rows including one flagged, and the privacy line.
3. Team results 1440, plus the under-five anonymity state.
4. The 1:1 prep sheet.
5. Phone 375 of each tab; dark mode of Team results.
