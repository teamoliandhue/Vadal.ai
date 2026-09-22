# 058 — Link: what moved last night, and the one record underneath

**Route:** `/product/link` · **Code:** `apps/product/src/app/product/link/LinkHub.tsx` · **Data:** `apps/product/src/lib/link.ts`, `lib/platform.ts`
**Status:** Built · needs Figma

## Why
Link is **HR Integrations · Data Sync · Open API · Unified Data**. The connections and the API were built; the two in the middle were not. "Connected" is a green badge that says nothing about whether last night's run worked, and "one workforce record" is only worth promising if somebody can look at the record.

## Four views
Header: eyebrow **Enterprise AI platform** · H1 **Link** · "7 systems connected · 12,480 people in one record · last sync today 07:10".
Tabs: **Connections · Sync · The record · API**.

### Connections (kept)
Tiles, "What needs a look", the integration grid by category, and the per-integration drawer with *what it shares* / *never touches*. Connecting something stays a request to the Vadal team, never a toggle that quietly starts syncing people data.

### Sync (new)
- Tiles: **Last run** (with the cadence under it) · **Records changed** · **Clean runs 94%** · **Held right now 3**.
- **Records we could not take in** — lead card, Aurora hairline, the inbox row pattern with an amber circle: `FIELD · HELD 6 DAYS`, the person and team, why it was held, then the fix in ink. The rule is on the card: *held, never guessed* — Vadal does not invent a manager or merge two people because the data looked close enough.
- **Recent runs** — per run: source, time, "4 added · 214 updated · 3 held", and a note. A tick when nothing was held, an amber warning when something was.
- **Who wins a disagreement** — one rule per kind of field, with the reason. Darwinbox wins employment; Entra wins access; *the person* wins their own name and language; Vadal wins consent, because it is consent for Vadal.

### The record (new)
- **One record, every module**: 15 fields × 12,480 people, filterable to **Where it costs**. Per field: the owning system and direction; who reads it; and what a blank one breaks ("They are in nobody's team view, and team-scoped pulses skip them").
- **Never round a gap away.** 38 people without a manager is shown as 99%, not 100% — the percentage floors whenever anything is missing.
- **An optional field is not a gap.** Preferred name and language read "2,640 have set one · theirs to choose", with no percentage and no red.
- **What Vadal writes back** — two things and then nothing, beside the list of what is never written back (pay, performance, anything said to Pulse, Listen or iThrive).
- **Reachable**: 11,994 of 12,480 have a manager, a team and one way to be reached; the rest are the people every survey misses, named in Listen rather than averaged away.

### API (kept)
Keys and webhooks, unchanged.

## Figma to build
1. Sync 1440 — tiles, held records, runs and conflict rules.
2. The record 1440 — both filter states, including an optional field and a costly gap.
3. Phone 375 of Sync; dark mode of The record.
