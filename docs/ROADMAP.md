# Vadal — build roadmap

Working list, in execution order. Tick items as they ship. Sources: the 16 Sep meeting transcript,
the naming doc, the product brief, the strategy/benchmark sheet, and what is already built.

Tags · 🔒 blocked on Pradeep · ❓ needs a decision · S/M/L rough size

---

## 0 · Decisions to get first (each one gates work below)

- [ ] ❓ **Nav taxonomy** — six domains from the naming doc, or the meeting's *Engage · Listen · Learning · Intelligence · Health*? Recommendation: six domains, meeting's order. 🔒 Pradeep sends the final sequence.
- [ ] ❓ **Health** — confirm: iThrive stays the module, "Health" stays the rail badge (not a nav section).
- [ ] ❓ **Home** — digest is read-only *except* the daily check-in. Confirm the check-in stays on Home.
- [ ] ❓ **Get Started after first visit** — into Help in the top bar, or under the assistant's group (Vadal.ai → **Nudge**)? Recommendation: Nudge group; it keeps the investor landing and the tailored-sections idea.
- [ ] ❓ **Points mode** — "points off" is a product mode, not a flag. Every points surface needs a no-points variant; adoption needs a points-independent metric. Decide before any redemption screen is designed.
- [ ] ❓ **Naming leftovers** — Pradeep's reply on: drop the "i" (Thrive, Learn), SmartWork → **Ask** and point it at Knowledge, Amplify = outward voice, Social = inside.
- [ ] ❓ **Missing P1s** — Onboard / lifecycle surveys / stay interviews / manager-effectiveness survey: deprioritised, or just not discussed?
- [ ] ❓ **Redemption beyond the marketplace** — appraisal marks and bonus as catalogue items need HR sign-off before they are demoed.

---

## 1 · v1 — lock the web

Unblocked now (no dependency on the decisions above):

- [x] **Login page redesign** · S — photo + rounded panel (Swiftt pattern); spec 024
- [x] **Groups & Communities** under Social · M (spec 025) — a group object (channels exist, groups don't); project communities (create, publish, join) and interest communities; group feed; join/leave. Not a Jira.
- [x] **Feed** · M (spec 026) — full-view post state; AI writing assist in the composer; inline translate on a post (UI now, provider later).
- [ ] **Moderation + posting rights** · M — AI pre-publish check for images and language with a soft rejection; per-tenant config for who may post and share (everyone / leadership only).
- [ ] **Amplify analytics screen** · S — posts out, by platform, who approved, reach. Data mostly exists.
- [ ] **Insight: points-independent adoption** · S — DAU/WAU and check-in rate as first-class metrics.
- [x] Broadcast card on Home → opens Campaigns for roles that can (managers and up); Knowledge for everyone else · XS

Waiting on a decision:

- [ ] 🔒 **Nav restructure** into the agreed domains and order; surface Kudos properly.
- [ ] 🔒 **Home as digest** · M — *last week · yesterday · my actions next week · what's new*, built as widgets with a fixed default layout (drag-and-drop is v2). Check-in stays. The nine cards stay under the greeting.
- [ ] 🔒 **Get Started after first visit** · S — moves under Nudge (or Help); rail group renamed.
- [ ] 🔒 **Points ledger + plan toggle** · L — sources: kudos given/received, posts, survey participation (small, flat), learning/assessment completion, health activity (opt-in), manager actions (completing 1:1s, never ratings). Wallet view separate from the feed: balance, badges, value redeemed. No-points mode across Kudos, leaderboards, cards.
- [ ] 🔒 **Naming leftovers** once Pradeep replies.

---

## 2 · v2

- [ ] **Marketplace + redemption catalogue** · L — partner integration (Advantage Club–type) bridged by API, not in-house fulfilment; tiered ladder (100 → mug … 50,000 → ₹10k voucher); client-branded merch; configurable non-marketplace options (offsites, lunches, travel; appraisal/bonus only with HR sign-off). Managers earn too.
- [ ] **Health leaderboards** · M — walking/running/swimming points; opt-in via the existing consent pattern; role-aware so the frontline isn't scored on its job.
- [ ] **Widget library + drag-and-drop Home** · L — 10–15 widgets, user-arranged.
- [ ] **Amplify AI copy** improvements · S
- [ ] **Onboard** and **Alumni** screens · M each
- [ ] Carry-over from earlier: wire `tagPost` → Social, `scanAnomalies` → Kudos; PersonProfile batch (`emptyProfile` / `inferFromContext` / `orderHome` / `rankFeed`); delivery previews in the Campaign builder; survey-respondent view; Knowledge screen role-gating, thumbs-down → correction, unanswered → gap, staleness warnings.

---

## 3 · v3

- [ ] **Translation across feed, surveys and learning** — evaluate cost first (Google business tier vs Sarvam for Indian languages); billed as a paid add-on; Indian-language summaries ship first. "100+ languages" on the site only once the provider is chosen.
- [ ] **Mobile** — a separate design pass, not a responsive squeeze; employees configure their own widgets.
- [ ] **Link · Trust · Launch** surfaces (integrations, security & compliance, implementation).

---

## Housekeeping

- [ ] `/product/<unknown>` returns 200 (Suspense streaming before `notFound()`).
- [ ] Stale `.vercel/project.json` files in `vadal`, `apps/hub`, `apps/deck`.
- [ ] Re-apply the two Home hero tap-target fixes lost in the My-day revert.
- [ ] Route slugs still carry old names (`/product/recognition` = Kudos) — rename with redirects once names settle.

---

## Done this cycle

- [x] Feed — a page per post, Write with Nudge (proposes, never overwrites), translate in place (Hindi live, six languages waiting on the provider)
- [x] Communities — hub, create/draft/publish, join / ask to join / leave, community page, community posts in the company feed
- [x] Mobile bottom bar labels repaired after the renaming (it had fallen back to the first four nav items)
- [x] Sign-in slideshow — seven graded team photographs
- [x] Get Started — the tour: Nudge chat window, the nine as live cards, first-visit landing, resume row, explored-by-doing, Present mode
- [x] Naming — Journey/Social/Insight/Pulse/Kudos/iThrive/SmartWork/iLearn/Flow/Nudge applied (Journey reverted to Home)
- [x] The nine cards on Home under the greeting
- [x] Health score computed from live inputs (70); AI features registry + generated `docs/AI-FEATURES.md`
- [x] Both links sent with the same naming
