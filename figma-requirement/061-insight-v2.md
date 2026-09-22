# 061 — Insight: risk without naming anyone, succession, and recommendations that can be wrong

**Route:** `/product` (Insight) and `/product/analytics` (Explore) · **Code:** `apps/product/src/app/product/_insight/PulseDashboard.tsx`, `_insight/derive.ts`, `analytics/AnalyticsExplorer.tsx` · **Data:** `apps/product/src/lib/insight.ts`
**Status:** Built · needs Figma

## Why
Insight is **Workforce Analytics · Risk Intelligence · Succession Intelligence · Recommendations**. Analytics existed and risk existed in a form we had to remove.

**The old risk table named people.** "Who might leave", one row per person, with a driver and a model confidence — 92%, 88%, 81%. That is a rating of an individual, which Trust (spec 059, shipped this week) states in writing this product never does. It also does not work: a manager who is handed a name manages the name, not the rota that produced it. The same problem sat on the Managers tab, where every manager carried a letter grade and a count of their "at-risk reports".

Two capabilities were missing outright. Succession — the first question a CEO asks — and recommendations beyond a four-item action queue.

## The nav duplication, resolved
**Insight** and **Analytics** sat side by side in the sidebar as if they were two modules. Analytics is not a module; it is the tool you enter from a number. It is now **Explore**, still at `/product/analytics`, still deep-linkable from any card ("Slice it in Explore"), with the same "Back to Insight" link. Renamed through the nav, breadcrumb, access key (`Explore`), page title and body copy, so Trust's generated access table follows automatically.

## Tabs
Overview · Engagement · **Risk** · **Succession** · **Recommendations** · Recognition · Managers · Adoption.

### Risk (rebuilt)
- Predicted attrition and the driver split stay.
- **Where the risk is** — one row per team: the level (Serious / Under strain / Watch), people, leavers over six months, what changed, the drivers as chips, and the action with an owner. Every driver is something the whole team can see: a rota published late, a pay band, tooling that logs people out.
- Under it, in a bordered footer with a lock icon, the three rules: risk is a team and a reason, never a person; every driver is visible to everyone, never something told in confidence; a team under the anonymity floor is hidden rather than shown as calm.
- The briefing at the top of the page was rewritten to match — "3 teams under strain · Night shift — rota published under a week ahead", where it used to print first names.

### Succession (new)
- Tiles: critical roles · covered today · **no cover at all** · people on the bench.
- **If this person left on Friday** — per role: the holder, why the role is critical, the successors with a readiness badge (Ready now / 1–2 years / No cover) and one line each, then the honest gap sentence. Payroll Lead reads: *No cover at all. One person, one process, twelve thousand salaries.*
- Stated above the list: readiness is set by People after a conversation with the person and their manager. Vadal never infers it from engagement, tenure or a performance score — **and it never tells someone they are a successor.**

### Recommendations (new)
- Per recommendation: the title, two or three numbered reasons, **Expect**, **Takes** (effort + owner), a confidence badge, **Why that confidence**, and **What would change our mind** — a stated falsifier, including one that reads "Nothing. Even if it changes no score, people are entitled to know the date."
- Confidence is honest: the Finance one is **Low**, because it rests on a single comment and a use figure.
- Each carries a real action into Flow, Knowledge, Listen, Alumni or Pulse, and "Mark as picked up" (which returns if the numbers do).
- **What we are not recommending** — naming likely leavers, a manager league table, and acting on Logistics' engagement score while we hear from 16% of them.

### Managers (fixed)
Grade and "at-risk reports" are gone. The table is **Manager practice**: team score, 1:1s held, kudos given — with the line "Practice, not a rating: ... the team's own score, which belongs to the team, not to the person managing it." The drawer lost its grade badge, and its coaching prompts now come from practice figures instead of a letter.

## Rules the design must keep
1. No screen in Insight rates, ranks or scores an individual person.
2. A risk driver is a fact the affected team can see for themselves.
3. Readiness is recorded by a human, never computed.
4. A recommendation shows its numbers, its confidence, and what would refute it.

## Figma to build
1. Risk 1440 — attrition card beside the team list, all three levels, with the rules footer.
2. Succession 1440 — tiles and the role list, including the no-cover role.
3. Recommendations 1440 — a High and a Low confidence card, plus "what we are not recommending".
4. Managers 1440 (rebuilt table); phone 375 of Risk; dark mode of Succession.
