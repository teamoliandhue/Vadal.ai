# 063 — Settings: the panel where Trust's promises are actually switched

**Route:** `/product/settings` · **Code:** `apps/product/src/app/product/settings/*` · **Data:** `apps/product/src/lib/governance.ts`, `lib/settings.ts`
**Status:** Built · needs Figma

## Why
Settings is where every promise the product makes is turned on or off, and it had never had a design pass. Two of its panels quietly contradicted what Trust (059) publishes in writing.

**The anonymity floor was a slider that went down to 3.** Trust states the floor is 5 and that *no role can drop below it, admins included*. An admin could move it to 3 and every screen that hides a thin cut would start lying.

**Data retention was a single number.** "24 months", next to a region — while Trust now carries a seven-row retention table with a different clock and a reason for each kind of data.

**AI guardrails were priced in tokens.** "Monthly token budget: 5M tokens" is a vendor's unit in an HR admin's screen, and the panel said nothing about the six places the AI actually acts or the things it can never do.

## What changed

### Data & privacy (rebuilt on `lib/governance`)
- **Anonymity floor** — the number large, with the sentence Trust uses ("A team of four never becomes a chart"). The slider runs **5 → 10**: it can be raised, never lowered, and the card says so with the reason. Raising it adds an honest consequence line: *at 8, teams of fewer than 8 are hidden everywhere — including from their own manager, and including in exports.* Underneath, the five places the floor is enforced.
- **How long each thing is kept** — the same seven rows Trust publishes, each with its clock and what happens next, and a link to the reasons. Stated plainly: *set in your contract, not from this screen — shortening a legal clock is not an admin toggle.*
- **Where the data sits** — India and the EU, with the note that a backup never crosses a border.
- The value the save bar claims to save now persists.

### AI & guardrails (rebuilt on the register)
- Two workspace switches (enable, scope to workspace), then **Where it acts**: one row per entry in Trust's register — Nudge, SmartWork, Sentiment, Listen, Social and Amplify, Onboard and Alumni — each showing what it does, *Decides: nothing — …*, and its own switch. An admin turns off the thing they just read about.
- **What it never does, however this is set** — four lines, locked, from the same source.
- **Usage** counted in requests against the plan allowance, with a bar and "74,300 of 120,000 · 62% used with a week to go", plus the per-person daily cap. Past the cap a request is declined and says so; nothing is billed beyond the plan without agreement.

### Roles & permissions
The table stays (it is about *actions*), with the boundary now stated: which **sections** a role can open is generated from what the product enforces, and lives in Trust where it cannot fall out of date.

### Touch and type
Every panel swept at 375: sub-nav items, Save bars, Manage plan, Invite people, the member role selects, the brand swatches (now 44px on a phone, 28px on desktop), Replace logo, and both translation sliders. Settings went from **four** compliant targets to every control compliant, and the last 11px text is gone.

## Rules the design must keep
1. A control that would break a promise the product publishes does not exist — the floor's minimum is the floor.
2. Where a setting mirrors something Trust publishes, both read the same source.
3. A save bar saves.

## Figma to build
1. Data & privacy 1440 — floor at 5 and at 8 (with the consequence line), retention list, residency.
2. AI & guardrails 1440 — the register rows with switches, the never-does card, usage.
3. Phone 375 of both; dark mode of AI & guardrails.
