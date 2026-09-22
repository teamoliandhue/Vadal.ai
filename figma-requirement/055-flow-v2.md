# 055 — Flow: cases, the work inside them, the rules that move it, and the promise

**Route:** `/product/flow` · **Code:** `apps/product/src/app/product/flow/` (`FlowHub`, `CasesHub` → `CasesView`) · **Data:** `apps/product/src/lib/flow.ts`, `lib/cases.ts`
**Status:** Built · needs Figma

## Why
Flow is **Case Management · Task Management · Workflow Automation · SLA Analytics** in the taxonomy. The screen was a case list and nothing else: three of the four capabilities had no home, and the whole section had zero 44px targets.

## Four views
Header: eyebrow **Digital workplace** · H1 **Flow** · "12 cases open · 5 tasks, 1 late · 89% closed on time". The primary button follows the tab (New case / New task).

### Cases (kept, tidied)
The existing list, the Pulse-risk banner and the detail drawer — with the page header and KPI strip lifted into the hub, filter pills at 44px, rows at 64px, and the drawer's actions at 44px.

### Tasks — the work a case is actually made of
- **Past their date** card (danger left edge) listing anything overdue.
- Three columns — **To do · Doing · Done** — with count pills. A card carries its source chip (Case, Onboarding, Policy, Automation), the case number when it has one, the due date (red when late), a note, the owner, and one button that moves it: Start → Mark done → Reopen.
- Closing line: tasks from a case carry its number, so closing the case is never a surprise to whoever was doing the work inside it.
- Most tasks are not cases at all — a joiner's laptop, a locker key, an acknowledgement outstanding.

### Automations — rules, and their limits
- Lead card: **517 actions in 30 days from 5 rules**, with the point said plainly: every rule states what it is never allowed to do, and that sentence is why people let it run.
- One card per rule, written as a sentence: *When Pulse flags a retention risk on a team, then open a case and assign the team's HRBP.* Underneath: how often it ran, when it last ran, and a soft-grey **never** line —
  - "Never names the people behind the signal."
  - "Never closes the request itself. A person answers, always."
  - "Never reassigns the case on its own."
  - "Never chases more than twice, and never after hours."
  - "Never deletes anything. Archiving is not deletion."
- Each has a switch (24px track inside a 44px target); an off rule goes dashed and dimmed.

### SLA — whether we kept the promise
- Lead: **89% closed on time (+4)**, median 1.8 days, 3 due today, and Nudge naming the worst category.
- **Against the promise**: median days per category as a bar with an ink tick at the target, orange when over, plus a legend and a table view.
- **Every breach, and why**: each breached case with its owner, how many days over, and the actual reason ("Payroll run had closed; the correction moves to next month's arrears"). Stated reason: 89% on time is only honest if the other 11% has a name. Confidential and ER cases are counted but never named.

## Figma to build
1. Tasks 1440 — overdue card and the three columns.
2. Automations 1440 — the lead card and three rule cards including one off.
3. SLA 1440 — lead, the category bars with target ticks, the breach list.
4. Cases 1440 (unchanged layout, new header).
5. Phone 375 of Tasks and SLA; dark mode of Automations.
