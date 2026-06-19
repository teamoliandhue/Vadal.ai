# @vadal/design-system

The Vadal design system as code — **DTCG tokens → generated CSS/Tailwind/TS**, React components, and
**Figma ↔ code sync**. This package is the code counterpart of the Figma file (`b6Jb1ttGwnOOD3LYZ9kWJk`),
which holds the visual components + the 6-page uSpec docs.

## The principle: one source of truth per layer

There is no magic "edit anywhere, syncs everywhere." Instead, each layer has one source of truth and
tooling that makes drift impossible (tokens) or loudly caught (components).

| Layer | Source of truth | Sync mechanism |
|---|---|---|
| **Tokens** | `tokens/*.json` (W3C **DTCG**) | `build.mjs` (Style Dictionary) → code · `scripts/figma-sync.mjs` ↔ Figma variables. **Truly bidirectional** |
| **Components** | **React** (`src/components`) | **Figma Code Connect** (`*.figma.tsx`) maps Figma↔React; visual-regression catches drift |
| **Docs** | component + tokens | **Storybook** (code) mirrors the Figma uSpec; `addon-designs` embeds the Figma frames |

## Layout

```
tokens/            DTCG source of truth
  semantic.light.json / semantic.dark.json   # color tokens per mode (mirror Figma "Color" collection)
  base.json                                  # spacing, radius, sizing, type, motion
  component.json                             # button/* input/* badge/* avatar/* checkbox/* radio/* switch/* — alias semantics
build.mjs          tokens → dist/
dist/              GENERATED — do not edit
  tokens.css       :root (light) + html.dark (dark) custom properties
  theme.css        Tailwind v4 @theme bridge
  tokens.ts        token values (typed) for tooling/docs
scripts/figma-sync.mjs   pull/push tokens ↔ Figma variables
src/components/    React components (built on the tokens) + *.stories.tsx + *.figma.tsx
.storybook/        code-side docs (the uSpec mirror)
```

## Commands

```bash
npm install
npm run build:tokens     # tokens/*.json → dist/{tokens.css, theme.css, tokens.ts}
npm run figma:pull       # Figma variables → tokens/*.json   (see PLAN NOTE)
npm run figma:push       # tokens/*.json → Figma variables    (see PLAN NOTE)
npm run storybook        # code docs (Storybook)
```

**PLAN NOTE:** the `figma:*` scripts use Figma's Variables REST API, which is **Enterprise-only**.
On Pro/Org, do the same pull/push through a Figma plugin — **Tokens Studio**, or the **Figma MCP**
(`use_figma`, Plugin API, any plan). The token shape is identical; only the transport differs.

## The workflow loop

- **Token edit in Figma** → `figma:pull` (or MCP) updates `tokens/*.json` → PR → `build:tokens` → app + Storybook update.
- **Token edit in code** → edit `tokens/*.json` → `build:tokens` (code) + `figma:push` (Figma).
- **New component** → write React + story + `*.figma.tsx`; tokens already shared; build the Figma uSpec.
- **Component style change** → it's a token → flows both ways automatically.
- **Component structural change** → edit code + Figma; Code Connect + visual-regression fail the PR if they diverge.

## uSpec (Figma) ↔ Storybook (code) parity

Anatomy → MDX · API → Autodocs props · Properties → stories/controls · Color → token table ·
Structure → MDX measurements · Screen Reader → `addon-a11y`. `addon-designs` embeds the live Figma
uSpec frame in each Storybook page, so both docs are one click apart.

## Consuming from apps/product

Import the generated CSS once (Tailwind v4):

```css
/* apps/product/src/app/globals.css */
@import "tailwindcss";
@import "@vadal/design-system/tokens.css";   /* :root + html.dark custom properties */
@import "@vadal/design-system/theme.css";    /* Tailwind @theme bridge */
```

Then use components: `import { Button, Input } from "@vadal/design-system";`. Wire the workspace via
npm workspaces at the repo root (`"workspaces": ["apps/*","packages/*"]`) or a `file:` dependency.
