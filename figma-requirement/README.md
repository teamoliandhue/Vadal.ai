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
