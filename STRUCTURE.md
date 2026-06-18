# Vadal.ai — repository map

Folders are organized **by function**, not by stage. "Stages" exist only as a narrative in
the hub dashboard timeline; the code and content live in durable, function-based homes so
shared things (brand source, design system, assets) have exactly one place to live.

```
vadal.ai/
├─ apps/                 Everything that RUNS (each app has its own node_modules)
│  ├─ hub/               Project dashboard — static Node server          → http://localhost:3002
│  ├─ deck/              Stage 1: the design-foundation deck (FROZEN)    → http://localhost:3000
│  └─ product/           Stage 2: the real product front-end (active)    → http://localhost:3001
│
├─ brand/                Canonical identity SOURCE — the CHOSEN identity only
│  ├─ logo/              Signal masters: signal-lockup.svg, signal-icon.svg
│  └─ avatars/           Demo user images
│
├─ archive/              HISTORY — read ONLY to tell the story; not used by active build
│  ├─ explorations/      Rejected identity logos + all pre-final mockups
│  └─ notes/             Deck build-history write-ups (retired from memory)
│
├─ design-system/        Design-system docs + tokens (see note in its README)
├─ deliverables/         Founder-facing downloads (logo packs, deck export, guidelines)
│
├─ docs/                 Reference reading
│  ├─ positioning/       Brand-positioning PDF
│  └─ strategy/          Strategy & product-priority docs
│
├─ scripts/              Tooling (one-off + future sync scripts)
└─ .claude/launch.json   Dev-server configs: hub (3002), deck (3000), product (3001)
```

## Where new content goes

| It... | Goes in |
|---|---|
| runs / is deployable code | `apps/<name>/` |
| is an editable brand/design master | `brand/` |
| documents the design system | `design-system/` (or a route in `apps/product`) |
| is a file founders download | `deliverables/` |
| is reference reading (strategy, positioning) | `docs/` |
| is build/automation tooling | `scripts/` |
| is "how we got here" — superseded experiments, old explorations, build notes | `archive/` |

Rule of thumb: **does it run → `apps/`. Editable master → `brand/`. Founder download →
`deliverables/`. Reference → `docs/`. History/process → `archive/`.**

**The archive rule:** anything kept only to show the journey lives under `archive/` and is read
ONLY when explicitly recounting how we got here — never for active build work. Keeping it out
of the active path is deliberate (smaller search surface, fewer tokens, no stale-info confusion).
The frozen deck (`apps/deck`) is the *presentable* version of that journey; `archive/` is the raw
source + notes behind it.

## Running locally

Dev servers are launched from `.claude/launch.json` (names: `hub`, `deck`, `product`).
The hub is the front door; it links out to the deck and product apps.
