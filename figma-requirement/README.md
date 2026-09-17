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
