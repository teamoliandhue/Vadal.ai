# 051 — SmartWork: the HR desk (and Support keeps the help pillar)

**Routes:** `/product/smartwork` (rebuilt) · `/product/support` (new home for the old content)
**Code:** `apps/product/src/app/product/smartwork/` (`SmartWorkHub`, `Ask`, `Requests`, `Desk`), `apps/product/src/app/product/support/` · **Data:** `apps/product/src/lib/smartwork.ts`
**Status:** Built · needs Figma

## Why
The platform taxonomy defines SmartWork as **HR Queries · Automated Resolution · Smart Escalation · Policy Answers**, in Digital Workplace. The product's SmartWork was something else entirely: the one-to-one wellbeing pillar — crisis lines, an AI companion that triages, counsellor booking, a resource library — sitting under Wellbeing. Two products, one name.

The wellbeing pillar keeps everything (route `/product/support`, brief and promises intact, never gated). SmartWork is now the HR desk.

## Navigation
- New group **Digital workplace**: SmartWork · iLearn · Knowledge (was "Learn").
- **Wellbeing**: iThrive · **Support** (the moved pillar, heart icon).
- Links that mean "talk to a human privately" (iThrive, Get Started, Knowledge's "who to ask") now point at Support.

## SmartWork — three views
Header: eyebrow **Digital workplace** · H1 **SmartWork** · "Your HR desk. Ask about pay, leave, insurance or policy and get an answer from the company's own documents — or have the whole thing done for you." Underline tabs: **Ask · My requests (N) · Desk** (Desk is People-team only).

### 1. Ask
- **The box** (Aurora top hairline): 52px pill input, "Ask anything — how many paid leaves do I have?", plus five common questions as chips that *fill* the box rather than sending it.
- **The answer**: the policy answer in 16px, then every source cited as a row — document name (links into Knowledge), "updated 2 weeks ago", and a warning pill **"Past its review date — check before you rely on it"** when the document is over a year old.
- **"I can do this part for you"** (Aurora box) when the answer has an action behind it — e.g. an answer about leave offers *Check my leave balance*.
- **"Did that answer it?"** → *Yes, done* (logged as answered) or *No — get me a person* (escalates).
- **No answer**: "No policy covers this one" — says plainly that guessing is worse, and offers the person. The answer becomes a document so the next person gets it instantly.
- **Things I can finish now** — six instant actions as cards: payslip, employment letter, leave balance, insurance e-card, address change, tax declaration. Each shows what you end up holding and how long it takes.
- Footer line: anything personal belongs in **Support**.

### 2. My requests
One row per request, in three kinds, each with its own colour and icon:
- **Answered** (violet) — the answer given.
- **Done for you** (green) — the artifact produced ("Employment letter · signed PDF · downloaded").
- **With a person** (amber) — pinned to the top under "Waiting on someone", with the owner's avatar and name, a due countdown ("Due tomorrow", red when overdue), the case reference, and the line that matters: *"Your conversation went with it — you will not be asked to explain it again."* Admins also get "Open in Flow".

### 3. Desk (People team)
- Headline card: **Resolved without a person — 77% of 1,840**, and **Went to a person — 424** (1.4 days to close). Nudge's read names the weak topic: "only 41% of appraisal & pay-band questions get answered here, so 144 came to you this month." Red line when escalations breach their date.
- **Where the desk copes, and where it doesn't** — one bar per topic split answered-here (viz-1) vs needed-a-person (viz-2), with a legend and a table view.
- **Questions no document answers** — the gaps, with how many asked and why, and "Write the answer".
- **Policies the desk is quoting** — the stale ones, with how old, linking into Knowledge. Note: readers see the same warning, so nothing is quoted as current when it isn't.

## Escalation is a real case
Escalating writes a case into Flow's own store (`vadal:cases-created`) — title, owner (HRBP), SLA of 1 day, and a timeline entry carrying the question. Flow gained a category for it: **HR request** (📮, info blue), because filing a service request as a people-risk case skews every risk report.

## Tokens / components
Aurora hairline + `--ai-surface`/`--ai-border` for AI blocks; `--viz-1`/`--viz-2` for the topic split; status colours only with an icon and a word; ViewToggle; 44px touch floor.

## Figma to build
1. Ask — empty state (box, chips, six action cards).
2. Ask — answered, with sources, a stale-policy warning and "I can do this part for you".
3. Ask — no policy covers this.
4. My requests — one escalation waiting, plus answered and done rows.
5. Desk 1440 — headline, topic split, gaps, stale policies.
6. Phone 375 of 1 and 4; dark mode of 5.
