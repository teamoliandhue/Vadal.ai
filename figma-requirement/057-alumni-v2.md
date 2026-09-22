# 057 — Alumni: the paperwork we owe people, and the pipeline back

**Route:** `/product/alumni` · **Code:** `apps/product/src/app/product/alumni/AlumniHub.tsx` · **Data:** `apps/product/src/lib/alumni.ts`, `lib/lifecycle.ts`
**Status:** Built · needs Figma

## Why
Alumni is **Alumni Network · Exit Documents · Boomerang Hiring · Employee Referrals**. The screen had the network and one line each for the other three: a count of boomerangs, a count of referrals, and no exit documents at all.

Exit documents are where goodwill is actually lost. A relieving letter that takes six weeks costs a boomerang hire and buys a review nobody wanted. And "nine rejoined this year" is a number, not a pipeline — it says nothing about which open role a former colleague could take tomorrow.

## Three views
Header: eyebrow **Talent intelligence** · H1 **Alumni** · "1,240 in the network · 61% would come back · 9 rejoined this year", with the privacy line kept: individual exit answers are People-only; managers see themes, never a person's reason.

Tabs: **Network · Exit documents · Coming back**.

### Network (kept, plus one card)
- The four tiles and **Why people left** (bar list + table view + the Nudge read: "58% said something could have changed their mind… Stay interviews in Pulse").
- New **Still in touch** card beside it: *5 of 8* of the recent leavers chose to join, then the three rules in plain words — joining is a choice they make not a default we set; anyone who said no is invited once, never twice; what they told us on the way out never travels with the invitation.
- **Recent leavers** unchanged: rehire is a People decision made by hand from a select, never inferred from an exit answer. "Share open roles" only for eligible alumni in the network who said yes or maybe.

### Exit documents (new)
- Four tiles: **Packs complete 3 of 8** ("nothing outstanding, not even a tax form") · **Issued without a person 18%** · **Last day to relieving letter 2 days** ("against a 3-day promise") · **Late right now 3**.
- **Past its promise** — lead card with the Aurora hairline, the inbox row pattern: a red 40px warning circle, `OWNER · LATE` in small caps, "Full and final settlement — Sneha Kulkarni", the reason in one sentence ("Held for a laptop that was already returned. Twelve days over — nobody owned the release."), and **Issue it now** on the right. Empty state when nothing is late: *Nothing is late — every leaver has what we owe them, or it is inside its window.*
- **Every leaver's pack** — one row per leaver: avatar, team · last day · days ago; a row of document chips (Relieving · Experience · Settlement · Form 16 · PF · Gratuity · Property) each carrying an icon **and** a screen-reader state, never colour alone; then "5 of 6" and a chevron.
- Chip states: **Issued** (tick, quiet), **Automatic** (violet lightning), **Waiting** (grey clock), **Late** (red warning outline).
- **Only what applies to the person.** Gratuity appears for five years and up. Its absence is not a gap and is never counted as one — the same rule as the per-role readiness in 056.
- Row opens a **drawer**: every document with its note, its owner (People, Payroll, Finance, IT, The leaver) and its state badge, closing on the promise that the leaver holds the same copy on a personal address and keeps it after their account closes.

### Coming back (new; boomerangs moved here)
- **Open roles, and the alumni they fit** — lead card with the hairline. Per role: title, team · posted; the matched alumni as avatar chips; and **Share with Sneha** / **Share with 2 alumni** / **Nobody to share it with** (disabled). Stated on the card: matched on the team someone worked in, only if they are eligible, in the network and said they would come back — *their reason for leaving plays no part in it*.
- **Came back** — the three most recent boomerang hires, unchanged.
- **Referrals** — "4 open · 6 hired this year · 18% of last year's hires came this way", Open/Everything filter. Per row: candidate, role · team, "Referred by …" with an **Alumni** badge when the referrer has left, a stage badge (Applied · In interview · Offer · Hired · Not this time), and either "moved 2d ago" or, past a fortnight of silence, a **Nudge · 19d quiet** button.
- Nudge's read above the list when anything has stalled: *people stop referring after this happens to them once*.

## Rules the design must keep
1. A rehire decision is made by a person, from a control. Nothing on this screen infers it.
2. An exit answer never reaches a role match, a referral, or an invitation.
3. Documents that do not apply are absent, not failed.
4. A leaver is chased at most once for what they owe us.
5. Every state shows an icon and a word, never a colour on its own.

## Figma to build
1. Exit documents 1440 — tiles, Past its promise, the pack list with all four chip states.
2. Exit pack drawer 480 — six rows, one of each state.
3. Coming back 1440 — open roles with 2 / 1 / 0 matches, boomerangs, referrals including a stalled row.
4. Network 1440 with the new **Still in touch** card.
5. Phone 375 of Exit documents; dark mode of Coming back.
