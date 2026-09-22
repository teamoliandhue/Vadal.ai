# 056 — Onboard: before day one, and the admin nobody owns

**Route:** `/product/onboard` · **Code:** `apps/product/src/app/product/onboard/OnboardHub.tsx` · **Data:** `apps/product/src/lib/onboard.ts`, `lib/lifecycle.ts`
**Status:** Built · needs Figma

## Why
Onboard is **Preboarding · Personalized Onboarding · Automated Admin · Manager Visibility**. The screen had the middle two — a cohort view of the first 90 days — and nothing at all for the fortnight where onboarding actually fails: between the signature and the first morning, when the person has no company email, no laptop, and no way to ask whether they should bring a passport.

## Three views
Header: eyebrow **Talent intelligence** · H1 **Onboard** · "4 starting soon · 8 in their first 90 days · 78% ready on day one".

### Starting soon (new)
- Lead card: **Ready on day one 78% (+12)** and **Offer to full access 3.4 days**, with Nudge naming how many joiners still have something outstanding.
- One row per pre-starter: avatar, role · team · start date; a row of readiness chips — **Laptop · Accounts · Buddy · Welcome note · Documents** — green with a tick when ready, grey with a clock when not; then "In 6 days · WhatsApp · opened the welcome pack".
- **Readiness is per role**: a line operator's row shows Buddy, Welcome note and Documents only. Marking a floor worker "not ready" because he has no laptop is the kind of false alarm that teaches people to ignore the screen.
- Anything they still owe us shows in amber ("Signed contract, ID proof"), and the action is **Nudge them** — a drafted message on the channel they can actually receive, or **Say hello** when nothing is missing.
- Closing line: none of this is a report card to a manager; it exists so somebody notices before the person's first morning.

### First 90 days (kept)
The existing cohort view — worth-a-look list, buddy matching, joiner rows with progress and day-7 answers, and the People-only journey template. Manager scope and the day-7 privacy rule are unchanged.

### Admin (new)
- Lead: **61% handled without a person**, and the split that matters: *N waiting on us* versus *N waiting on the joiner* — different failures with different fixes.
- Two side-by-side lists for exactly that split, the second noting "Asked at most twice, never after hours".
- **Everything, and who owns it**: each item with a state icon — **Done** (green), **Automatic** (violet lightning), **Waiting** (grey), **Late** (red) — the joiner, the team, the owner (IT, People, Facilities, Payroll, The joiner) and a plain note: "Created from the signed offer, the hour it was signed"; "Sent to a personal email that has not been opened. Worth a call."

## Figma to build
1. Starting soon 1440 — lead card and four rows, including a role with fewer chips.
2. Admin 1440 — lead, the two lists, the full table.
3. First 90 days 1440 (existing, new header and tabs).
4. Phone 375 of Starting soon; dark mode of Admin.
