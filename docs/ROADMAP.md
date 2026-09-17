# Vadal — build roadmap

Working list, in execution order. Tick items as they ship. Sources: the 16 Sep meeting transcript,
the naming doc, the product brief, the strategy/benchmark sheet, and what is already built.

Tags · 🔒 blocked on Pradeep · ❓ needs a decision · S/M/L rough size

---

## 0 · Decisions — answered 17 Sep (see `DECISIONS.md`)

- [x] **Nav taxonomy** — Nudge · My space (Home, Social, Kudos) · Engage · Listen · Learn · Insight · Wellbeing · Operations
- [x] **Health** — iThrive is the module; Health stays the rail badge
- [x] **Home** — digest, read-only except the daily check-in, which stays
- [x] **Get Started** — rail group renamed Nudge; becomes *Product tour* once done
- [x] **Points** — a workspace mode, on by default, with a designed "off" state; fixed earning rules, never for performance
- [x] **Naming leftovers** — keep the client's names; no further renames
- [x] **Missing P1s** — Pulse programmes (onboarding, stay interview, manager effectiveness, exit) + Onboard and Alumni screens
- [x] **Redemption** — experiences yes; appraisal marks and bonus never

---

## 1 · v1 — lock the web

Unblocked now (no dependency on the decisions above):

- [x] **Login page redesign** · S — photo + rounded panel (Swiftt pattern); spec 024
- [x] **Groups & Communities** under Social · M (spec 025) — a group object (channels exist, groups don't); project communities (create, publish, join) and interest communities; group feed; join/leave. Not a Jira.
- [x] **Feed** · M (spec 026) — full-view post state; AI writing assist in the composer; inline translate on a post (UI now, provider later).
- [x] **Moderation + posting rights** · M (spec 027) — AI pre-publish check for images and language with a soft rejection; per-tenant config for who may post and share (everyone / leadership only).
- [x] **Amplify analytics screen** · S (spec 028) — posts out, by platform, who approved, reach. Data mostly exists.
- [x] **Insight: points-independent adoption** · S (spec 029) — DAU/WAU and check-in rate as first-class metrics.
- [x] Broadcast card on Home → opens Campaigns for roles that can (managers and up); Knowledge for everyone else · XS

Unblocked by the decisions:

- [x] **Nav restructure** (spec 030) into the agreed domains and order; surface Kudos properly.
- [ ] **Home as digest** · M — *last week · yesterday · my actions next week · what's new*, built as widgets with a fixed default layout (drag-and-drop is v2). Check-in stays. The nine cards stay under the greeting.
- [x] **Get Started after first visit** (spec 030) · S — moves under Nudge (or Help); rail group renamed.
- [ ] **Points ledger + plan toggle** · L — sources: kudos given/received, posts, survey participation (small, flat), learning/assessment completion, health activity (opt-in), manager actions (completing 1:1s, never ratings). Wallet view separate from the feed: balance, badges, value redeemed. No-points mode across Kudos, leaderboards, cards.
- [x] **Naming leftovers** — decided: no further renames.

---

## 2 · v2

- [ ] **Marketplace + redemption catalogue** · L — partner integration (Advantage Club–type) bridged by API, not in-house fulfilment; tiered ladder (100 → mug … 50,000 → ₹10k voucher); client-branded merch; configurable non-marketplace options (offsites, lunches, travel; appraisal/bonus only with HR sign-off). Managers earn too.
- [ ] **Health leaderboards** · M — walking/running/swimming points; opt-in via the existing consent pattern; role-aware so the frontline isn't scored on its job.
- [ ] **Widget library + drag-and-drop Home** · L — 10–15 widgets, user-arranged.
- [ ] **Amplify AI copy** improvements · S
- [ ] **Onboard** and **Alumni** screens · M each
- [ ] **Pulse programmes** · M — onboarding (day 7/30/90), stay interview, manager effectiveness, exit
- [ ] Carry-over from earlier: wire `tagPost` → Social, `scanAnomalies` → Kudos; PersonProfile batch (`emptyProfile` / `inferFromContext` / `orderHome` / `rankFeed`); delivery previews in the Campaign builder; survey-respondent view; Knowledge screen role-gating, thumbs-down → correction, unanswered → gap, staleness warnings.

---

## 3 · v3

- [ ] **Translation across feed, surveys and learning** — evaluate cost first (Google business tier vs Sarvam for Indian languages); billed as a paid add-on; Indian-language summaries ship first. "100+ languages" on the site only once the provider is chosen.
- [ ] **Mobile** — a separate design pass, not a responsive squeeze; employees configure their own widgets.
- [ ] **Link · Trust · Launch** surfaces (integrations, security & compliance, implementation).

---

## Housekeeping

- [x] `/product/<unknown>` now returns 404 (`dynamicParams = false` on the catch-all).
- [x] Stale Vercel links — root (`vadal`) and `apps/hub` point at live projects and stay; `apps/deck` pointed at a team this account can't reach and was removed (local, gitignored).
- [ ] Home tap targets — folded into the Home digest rebuild (the hero they belonged to is replaced).
- [x] Route slugs renamed to match product names, old paths redirect (spec 030).

---

## Done this cycle

- [x] Amplify Results (who approved, shares by platform, modelled reach) and Insight adoption (weekly active, check-ins, stickiness, desk vs frontline) — both on validated chart colours
- [x] Moderation — pre-publish check with soft rejection (nudge or hold), Report, a Review queue for admins, per-workspace posting and sharing rights in Settings
- [x] Feed — a page per post, Write with Nudge (proposes, never overwrites), translate in place (Hindi live, six languages waiting on the provider)
- [x] Communities — hub, create/draft/publish, join / ask to join / leave, community page, community posts in the company feed
- [x] Mobile bottom bar labels repaired after the renaming (it had fallen back to the first four nav items)
- [x] Sign-in slideshow — seven graded team photographs
- [x] Get Started — the tour: Nudge chat window, the nine as live cards, first-visit landing, resume row, explored-by-doing, Present mode
- [x] Naming — Journey/Social/Insight/Pulse/Kudos/iThrive/SmartWork/iLearn/Flow/Nudge applied (Journey reverted to Home)
- [x] The nine cards on Home under the greeting
- [x] Health score computed from live inputs (70); AI features registry + generated `docs/AI-FEATURES.md`
- [x] Both links sent with the same naming
