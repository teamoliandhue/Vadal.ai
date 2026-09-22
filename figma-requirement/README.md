# figma-requirement/ — design-handoff specs

Whenever a **new feature or design update ships in code**, a numbered `.md` spec is added
here for the product designer, so Figma stays in sync with the built product.

## Convention

- One file per feature/update: `NNN-short-name.md` (numbered in shipping order).
- Written **for the designer**: screens, states, flows, components used, tokens, copy —
  everything needed to reproduce the built experience in the Vadal Figma file
  (`b6Jb1ttGwnOOD3LYZ9kWJk`), no code required.
- The running app is the source of truth for look & behaviour — run `apps/product`
  (`npm run dev`, port 3001) or use the latest Vercel deploy to inspect any screen.
- Components referenced by their design-system names (Button, Badge, Avatar, Switch,
  Drawer, SparkMark…) — masters live in the Figma DS file with their uSpec docs.

## Index

| # | Spec | Status |
|---|------|--------|
| 001 | [Authentication & Onboarding](./001-authentication-onboarding.md) | Built · needs Figma |
| 002 | [Auth split-screen redesign (Fireflies pattern)](./002-auth-split-screen-redesign.md) | Built · needs Figma |
| 003 | [Auth imagery + motion layer](./003-auth-imagery-motion.md) | Built · needs Figma |
| 004 | [Role-based access, mobile nav & session identity](./004-role-access-mobile-nav-identity.md) | Built · needs Figma |
| 005 | [Permissions reconciled to the brief · team scope · frontline profile](./005-permissions-reconciled-team-scope.md) | Built · needs Figma |
| 006 | [AI runtime — citations, refusals, agentic confirmation](./006-ai-runtime-citations-agentic-confirmation.md) | Built · needs Figma |
| 007 | [Four pillar screens — Amplify · Thrive · Grow · One-to-One Help](./007-four-pillars-screens.md) | Built · needs Figma |
| 008 | [Feed photography — art direction and placement](./008-feed-photography.md) | Built · needs Figma |
| 009 | [Form-field rules — bare-field padding, 16px mobile floor](./009-form-field-rules.md) | Built · needs Figma |
| 010 | [Amplify redesign — hero, composer, share routes, decline](./010-amplify-redesign.md) | Built · needs Figma |
| 011 | [Thrive — the goal, content and timing adapt to the person](./011-thrive-redesign.md) | Built · needs Figma |
| 012 | [The scroll model — app shell, two-pane pages](./012-scroll-model.md) | Built · needs Figma |
| 013 | [Amplify — the other direction, and the programme behind it](./013-amplify-both-directions.md) | Built · needs Figma |
| 014 | [Thrive — everything below the hero](./014-thrive-below-the-hero.md) | Built · needs Figma |
| 015 | [One-to-One Help — ways in, and the person who isn't you](./015-help-ways-in-and-the-other-person.md) | Built · needs Figma |
| 016 | [Grow — where you are, and why you're here](./016-grow-where-you-are.md) | Built · needs Figma |
| 019 | [Vadal.ai › Get Started — a tour, one idea at a time](./019-get-started-tour.md) | Layout superseded by 021 |
| 020 | [Get Started — explored by doing, and how the tour is shown](./020-get-started-by-doing.md) | Built · needs Figma |
| 021 | [Get Started — a story, one screen per idea](./021-get-started-story.md) | Built · needs Figma |
| 022 | [Naming — the one-word module names](./022-naming.md) | Applied · needs Figma |
| 023 | [Home — the nine, under the greeting](./023-home-the-nine.md) | Built · needs Figma |
| 024 | [Sign in — the photos and the panel](./024-login.md) | Built · needs Figma |
| 025 | [Communities — groups under Social](./025-communities.md) | Built · needs Figma |
| 026 | [Feed — full view, Write with Nudge, translate in place](./026-feed-full-view-assist-translate.md) | Built · needs Figma |
| 027 | [Moderation & posting rights](./027-moderation-posting-rights.md) | Built · needs Figma |
| 028 | [Amplify — Results](./028-amplify-results.md) | Built · needs Figma |
| 029 | [Insight — adoption, counted without points](./029-insight-adoption.md) | Built · needs Figma |
| 030 | [Navigation, Nudge group and For you](./030-nav-and-for-you.md) | Built · needs Figma |
| 031 | [Points mode, the ledger and Wallet](./031-points-mode-and-wallet.md) | Built · needs Figma |
| 032 | [Rewards — the catalogue](./032-rewards.md) | Built · needs Figma |
| 033 | [Health leaderboards](./033-health-leaderboards.md) | Built · needs Figma |
| 034 | [Home — the digest, and widgets you arrange](./034-home-digest-and-widgets.md) | Built · needs Figma |
| 035 | [AI you can reach — feed ranking, topics, kudos-spotting, Home order](./035-ai-wiring-social-kudos-home.md) | Built · needs Figma |
| 036 | [Knowledge — the loop closed](./036-knowledge-loop.md) | Built · needs Figma |
| 037 | [Pulse programmes, smart send, and answering a pulse](./037-pulse-programmes-and-responding.md) | Built · needs Figma |
| 038 | [Campaigns — delivery preview](./038-campaign-delivery-preview.md) | Built · needs Figma |
| 039 | [Onboard and Alumni](./039-onboard-and-alumni.md) | Built · needs Figma |
| 040 | [Amplify — captions that sound like a person](./040-amplify-caption-copy.md) | Built · needs Figma |
| 041 | [Translation — the paid add-on](./041-translation-add-on.md) | Built · needs Figma |
| 042 | [Link · Trust · Launch — the platform surfaces](./042-link-trust-launch.md) | Built · needs Figma |
| 043 | [Mobile pass — Home a phone arranges, and bottom sheets](./043-mobile-pass.md) | Built · needs Figma |
| 044 | [Social v2 — a calmer feed, must reads, questions, saved](./044-social-v2.md) | Built · needs Figma |
| 045 | [Kudos v2 — role-fit recognition, boosts, thanks back, cards to sign](./045-kudos-v2.md) | Built · needs Figma |
| 046 | [Campaigns v2 — dated plans, the weekly send limit, honest results, run it again](./046-campaigns-v2.md) | Built · needs Figma |
| 047 | [Campaigns v3 — Overview, Planner, Results, and a four-step builder](./047-campaigns-v3.md) | Built · needs Figma |
| 048 | [Amplify v2 — the share studio with a live post preview (+ 048.1 polish)](./048-amplify-v2.md) | Built · needs Figma |
| 049 | [Pulse v2 — Overview, Surveys, Results with answer spreads, drivers, team heatmap, and follow-ups that post "You said, we did"](./049-pulse-v2.md) | Built · needs Figma |
| 050 | [Sentiment v2 — Nudge's read + worth a look, mood over time, themes getting better or worse, where it's felt, in their words](./050-sentiment-v2.md) | Built · needs Figma |
| 051 | [SmartWork becomes the HR desk — ask, resolve, escalate; the help pillar becomes iCare](./051-smartwork-hr-desk.md) | Built · needs Figma |
| 052 | [For you v2 — a lead card, suggestions grouped by what they cost you, and a rail that explains the list](./052-for-you-v2.md) | Built · needs Figma |
| 053 | [Listen — coverage (who we never hear from), signals with outcomes, and whose language they arrive in](./053-listen-v2.md) | Built · needs Figma |
| 054 | [Manager hub v2 — this week, your people (no private sentiment), and the team's own pulse results](./054-manager-hub-v2.md) | Built · needs Figma |
| 055 | [Flow v2 — tasks, automations that state their limits, and SLA with every breach explained](./055-flow-v2.md) | Built · needs Figma |
| 056 | [Onboard v2 — preboarding before day one, and the admin split into waiting-on-us and waiting-on-them](./056-onboard-v2.md) | Built · needs Figma |
| 057 | [Alumni v2 — exit documents with owners and lateness, roles matched to alumni, and referrals that stall in the open](./057-alumni-v2.md) | Built · needs Figma |
| 058 | [Link v2 — sync runs, records held with the fix, and the one workforce record with what each gap costs](./058-link-v2.md) | Built · needs Figma |
| 059 | [Trust v2 — the anonymity floor as a control, retention and residency, and a register of every AI use](./059-trust-v2.md) | Built · needs Figma |
| 060 | [Launch v2 — who is not on it yet with the next thing to try, and ROI against a baseline with what we will not claim](./060-launch-v2.md) | Built · needs Figma |
| 061 | [Insight v2 — team-level risk instead of named flight risks, succession, recommendations with falsifiers; Analytics becomes Explore](./061-insight-v2.md) | Built · needs Figma |
| 062 | [Home v2 — one clock and one streak, "Waiting on you" in place of nine product tiles, and a team snapshot that keeps the check-in promise](./062-home-v2.md) | Built · needs Figma |
| 063 | [Settings v2 — the anonymity floor cannot be lowered, retention and AI read the same source as Trust, and every control is reachable on a phone](./063-settings-v2.md) | Built · needs Figma |
| 064 | [Marketplace — orders with states and refunds, approvals that need a reason, stock and limits, and what points cost the company](./064-marketplace.md) | Built · needs Figma |
