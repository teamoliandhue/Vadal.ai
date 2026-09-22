# 059 — Trust: the floor, the clock, the map, and the AI register

**Route:** `/product/trust` · **Code:** `apps/product/src/app/product/trust/TrustHub.tsx` · **Data:** `apps/product/src/lib/governance.ts`, `lib/platform.ts`, `lib/access.ts`
**Status:** Built · needs Figma

## Why
Trust is **Data Security · Privacy Controls · Compliance · Responsible AI**. Security and compliance had cards. Privacy controls were a footnote and responsible AI was a four-line list — which is the wrong way round, because those two are what a works council asks about and what an employee has to be able to believe.

## Four views
Header: eyebrow **Enterprise AI platform** · H1 **Trust** · "results hidden under 5 answers · 6 places the AI acts · 0 of them decide anything".
Tabs: **Posture · Privacy · Responsible AI · The record**.

### Posture (kept)
The four posture tiles and the compliance cards, still stating controls-built versus audit-planned rather than implying certificates we do not hold.

### Privacy (new)
- **The anonymity floor** — the number 5 at 44px, what it means in a sentence ("A team of four never becomes a chart"), and the three facts that make it real: it applies to admins too; a cut under the floor says who is missing rather than showing zero; two overlapping cuts cannot be combined to get under it. Beside it, the five places it is enforced.
- **How long each thing is kept** — seven rows, each with its own clock and the reason for it: open text 24 months, scores 5 years, chat 12 months, wellbeing 6 months, cases 7 years archived-never-deleted, audit log 12 months, a leaver's account 30 days.
- **Where the data sits** — India, EU, backups in-region, and support access from India with your approval and an audit-log entry. The backup line is the one that matters: *a backup never crosses a border, which is where most residency claims quietly fail.*
- **What never leaves** — three lines, in red X's: no training on employee data, no mixing between customers even for benchmarks, no names sent to a third-party model.

### Responsible AI (new)
- **Every place the AI acts** — a register of six: where, what it does, what it reads, what it **decides** (nothing, in every row), who acts on it, whether it shows why, and who can switch it off.
- **What it may never do** — six lines, each enforced in the product rather than promised in a policy.
- **What a person can switch off** — for themselves, without asking anyone, with the effect stated plainly.

### The record (kept)
Who-can-see-what generated from `lib/access`, the audit log with its filters and CSV, and the data requests queue.

## Figma to build
1. Privacy 1440 — floor card, retention list, residency and never-leaves.
2. Responsible AI 1440 — the register, three columns per row.
3. Phone 375 of the register; dark mode of Privacy.
