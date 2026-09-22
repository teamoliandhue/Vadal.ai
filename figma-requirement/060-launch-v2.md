# 060 — Launch: who is not on it yet, and what we will not claim

**Route:** `/product/launch` · **Code:** `apps/product/src/app/product/launch/LaunchHub.tsx` · **Data:** `apps/product/src/lib/value.ts`, `lib/platform.ts`, `lib/adoption.ts`
**Status:** Built · needs Figma

## Why
Launch is **Guided Implementation · Change Management · Success Partner · ROI Tracking**. The phases, the named partner and the training were built. Change management was an adoption curve — which is the opposite of change management, because a rising average is exactly where the people who never arrived go to hide. ROI was not there at all.

## Three views
Header: eyebrow **Enterprise AI platform** · H1 **Launch** · "live since August 2025 · now: expand · 5 of 8 baseline measures ours to claim".
Tabs: **Rollout · Adoption · Value**.

### Rollout (kept)
The five-phase strip, the phase in flight with owners and blockers, readiness read live from the product's own settings, the success team and training.

### Adoption (new lead, chart kept)
- **Who is not on it yet** — lead card with the Aurora hairline. 305 people across 3 groups have never signed in; one more group signed in and drifted away, which is a different problem and is labelled as one. Per group: the count, *why* ("Invited by email. Most of the crew has no work email, so the invitation went nowhere"), and the next thing to try with an owner — never "send a reminder".
- **Use since launch** — the existing line chart with its table view.
- **Champions** — the four people actually doing the work, named, with trained/booked, plus training completion by group (9 of 14 night-shift managers is the number blocking go-live).
- **What has actually been said** — each message with reach, opened and a read percentage. The rota note read best: *people read what affects their week.*

### Value (new)
- Tiles: **Baseline taken July 2025** · **Measures better 8 of 8** · **Ours to claim 5** · **People-team hours back 59/week**.
- **Against the baseline** — eight measures, each showing before → now with a direction arrow and a claim badge: **Vadal's doing** / **Partly ours** / **Context, not a claim**. Filterable to the ones we can claim.
- The badges carry the argument: day-one readiness is shared with IT's new laptop process; the attrition fall is shared with a pay and rota change — *Vadal found both; it did not pay for either*; the engagement score is context because the question set changed.
- **What we are not claiming** — no rupee figure (you know what an hour costs; we do not), not the attrition fall, and no benchmark built from other customers' data. *A value page without this section is a brochure.*

## Also in this pass
Chart axis labels moved from 11px to 12px in `components/viz.tsx` and `components/charts.tsx`, which clears the last sub-12px type in the five chart sections. Checked for collisions at 1440 and 375 on Launch, Pulse and Analytics.

## Figma to build
1. Adoption 1440 — not-on-it-yet, champions and comms.
2. Value 1440 — tiles, the eight measures with all three claim badges, and what we are not claiming.
3. Phone 375 of Value; dark mode of Adoption.
