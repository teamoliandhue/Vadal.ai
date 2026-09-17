# 039 · Onboard and Alumni

**Status:** built in code · `/product/onboard/me` (everyone, under For you) · `/product/onboard`
(Operations · managers own team, People everyone) · `/product/alumni` (Operations · People only) ·
source: 17 Sep decision §7 (missing P1s) · AI: conversational onboarding assistant, progressive profiling

The two ends of the lifecycle. **Onboard** is a joiner's first 90 days. **Alumni** is what happens after
the exit interview. Both build on the Pulse programmes in 037 (onboarding check-ins, stay interviews,
exit interviews).

New demo persona on sign-in: **New joiner** — Dev Patel, Junior Designer on Design, day 4. A joiner who
hasn't been onboarded goes straight to their journey, not the static onboarding form.

---

## 1 · Your first 90 days (`/product/onboard/me`)

Rail highlights **For you**. Breadcrumb *Your first 90 days*. Max width 1120. On `lg`, two columns:
content + a 340px aside.

Anyone who isn't a joiner sees Dev's journey with a dashed notice on top: *Preview — this is Dev Patel's
journey, as they see it on day 4. Anything you answer here isn't saved.*

### Header

- Eyebrow: spark · **YOUR FIRST 90 DAYS**
- H1: *Day 4, Dev. You're in week one.*
- Body: *Junior Designer on Design · started Mon 14 Sep. 5 of 9 things for this stretch are done — most of
  what's left in week one is yours, and none of it is a test.*
- **90-day track** (max 720): an 8px `--soft` rail with a `--purple` fill to today, and 14px dots at day 7,
  30 and 90 (filled once passed, `--line` otherwise, 2px card-coloured ring). Labels below: *Day 1*,
  *Day 7* (from `md` up only — it collides with Day 1 on a phone), *Day 30*, *Day 90*.

### Set Vadal up your way (Aurora card)

`--ai-surface` / `--ai-border`, radius 26. Title with a spark · counter on the right *2 of 6*.

1. **What it already knows** — pill chips on card background: title, team, *Manager · Anita Desai*,
   *Buddy · Neha Rao*, *Desk-based* — then faint text *from the org chart — not asked*.
2. **Conversation** — assistant bubbles (card background, bottom-left corner 6px) and answer bubbles
   (`--purple`, white text, right-aligned, bottom-right corner 6px).
   - Opening: *Hi Dev — welcome. You're a Junior Designer on Design. I've set things up around that, so
     you shouldn't have to fill anything in. Two quick questions and we're done.* → *Which language would
     you like Vadal in?*
   - Then: *One more thing, then I'll leave you to it.* + the next question.
   - Under the current question, faint: *Why it helps: {what it unlocks}*.
3. **Answers** — choice pills (44px on touch, 38px desktop), or a text field + **Send** when there are
   no choices. Language pills show a small translate icon. Under them: **Skip — don't ask me this**
   (not on the opening question).

| Question | Choices |
|---|---|
| Language | English · हिन्दी · मराठी · தமிழ் · తెలుగు · ಕನ್ನಡ · বাংলা · ગુજરાતી |
| When do you start your day | Before 8am · 8–10am · After 10am · Nights |
| What to hear more about | Safety · Learning · Wellbeing · Team news |
| Getting better at | Leading projects · Presenting · A new skill · Not sure yet |
| Own or shared phone | My own phone · A shared phone · Mostly a laptop |
| Wellbeing check-ins | Yes, switch them on · Not now |

**Two questions per visit.** After the second, a card-background result box:
- The summary, e.g. *Set up: your home starts with your check-in, your day and learning. Everything is in
  English. You can change any of this later, and I'll ask the odd question over the next couple of weeks
  rather than all at once.* (When all six are answered: *…later. That's everything — I won't ask again.*)
- *Home starts with* + four numbered chips (*1. Check-in 2. My day 3. Learning 4. Calendar*).
- **See my Home** (brand pill) · **Ask me the next one now** (ghost; hidden when all are answered).
- Faint: *That's enough for today. I'll ask the next question another day.*

Rules the design must keep:
- Picking a non-English language also turns on **always translate** to that language in Social.
- Telling it an interest (e.g. Learning) moves that up Home — **Daily hooks** joins the Home board
  second. A guessed interest never rearranges anyone's Home.
- **Wellbeing consent is only a clear yes.** "Not now" records that we asked, nothing more.

### Your journey (card)

Four collapsible stretches, divided by hairlines. Summary row (44px): a 28px circle — green with a
check when complete, `--purple` with the count for the current stretch, `--soft` otherwise — then the
label (+ a **Now** badge) and *Days 1–7 · 3 of 6 done*, chevron right.

| Stretch | Items (owner · due) |
|---|---|
| Before day one | Laptop and accounts ready (IT) · Welcome note (manager) · A buddy assigned (People) |
| Week one | First 1:1 (manager · day 2) · Coffee with your buddy (buddy · 3) · Set Vadal up your way (you · 5) · Read "Your first week" (you · 5) · Join your team's community (you · 7) · Day 7 check-in (you · 7) |
| First 30 days | Agree 30-60-90 goals (manager · 14) · Finish "Welcome to Oli&Hue" (you · 21) · Meet three people outside your team (you · 30) · Day 30 check-in (you · 30) |
| Days 31–90 | Give your first kudos (you · 45) · Ship your first piece of work (you · 60) · Day 90 check-in (you · 90) · 90-day conversation (manager · 90) |

Item row: a 44px hit area (32px desktop) holding a 20px **checkbox** for the joiner's own items, or a
20px status circle for everyone else's (dashed when pending, green tint + check when done). Title (done =
muted + strikethrough) and a faint line: *Your manager is on it · by day 14*, *· a little behind — no
rush* when overdue, *· ticked automatically* for items Vadal completes itself (setup, the day 7 check-in).
Items that happen in Vadal get a right-aligned link: **Open**, **Preview** (a check-in that isn't open
yet) or **Answer**.

### Aside

- **Your people** — manager, buddy, People partner. 40px avatar · name · role (faint) · one line on what
  to go to them for · a purple text button: *Ask for time* / *Say hi* / *Ask a question*.
- **Coming up** — Day 7 check-in · Monday (*Two questions if all's well, five if it isn't. People reads
  it; Anita sees a summary, not your words.*), goals by day 14, "Welcome to Oli&Hue" · 25 min.

### For you

A joiner's For you leads with **Day 4 of your first 90** → *Open your journey*, adds **Start "Welcome to
Oli&Hue"**, and drops suggestions that assume tenure (a learning streak, a win to share, a running
challenge). ⌘K has a **Your first 90 days** destination.

---

## 2 · Onboard (`/product/onboard`) — managers and People

Rail: **Operations → Onboard** (sprout icon), after Manager hub.

- Header: eyebrow *OPERATIONS* · H1 *Onboard* · *Everyone in their first 90 days — where they are, what's
  done, and who is having a harder start than they should.*
- Managers get the standard scope notice: *Showing Design only — onboarding progress across other teams is
  limited to HR admins.*
- **Four tiles** (2×2 on phone): In their first 90 days (*on Design* / *across the company*) · On track
  (*8 in 10 due items done, or better*) · Settled at day 7 (*3.3 / 5*, *6 of 8 have answered*) · Could use
  a hand (*a flag, a low check-in, or behind*).
- **Worth a look this week** (Aurora card) — one white row per joiner: avatar · *Kavya Reddy · Support ·
  day 9* · a sentence built from the facts, e.g. *Answered "finding my feet" at day 7, has no buddy yet, has
  5 due items still open, said what's missing is "knowing who to ask".* Managers never see that last clause
  — the day 7 words are People's.
  - If anyone has no buddy: **Suggest 2 buddies** (brand, user-plus icon) + *Someone on the same team, a
    year or more in. Joiners with a buddy answer day 7 2 points higher here.* (computed from the cohort).
    Toast: *Suggested 2 buddies — each manager confirms before anyone is told.*
- **Joiners** (card) — one row each; on `md` four columns: person · stage (*Day 16 · First 30 days*, a 6px
  progress bar green when on track, amber when behind, *6 of 10 due items · buddy not matched*) · day 7
  (*Day 7: Finding my feet* or faint *Day 7 check-in opens soon*) + amber flag badges · actions **Their
  view** (eye; opens the preview) and **Check in**. For a manager, a day 7 flag reads *Day 7: asked for
  support*.
- **The journey every joiner gets** (People only) — four `--soft` tiles, one per stretch: label · *Days
  8–30 · 4 items* · owner counts (*Manager · 1*, *The joiner · 3*). Link **Check-ins in Pulse →**.
- Empty (a manager with no joiners): dashed box — *No one on your team is in their first 90 days* · *When
  someone joins, their journey appears here the week before they start.*

---

## 3 · Alumni (`/product/alumni`) — People only

Rail: **Operations → Alumni** (handshake icon).

- Header: *Alumni* · *What people leave for, who would come back, and what staying in touch is worth.*
  Then a faint lock line: *Individual exit answers are visible to the People team only. Managers see
  themes, never a person's reason.*
- **Four tiles:** Alumni network *1,240* (*38% active in the last 90 days*) · Would come back *61%* ·
  Boomerang hires *9* · Hires from alumni referrals *6* (*from 21 referrals this year*).
- Two cards side by side on `lg`:
  - **Why people left** — *Main reason · 52 exit interviews, last 12 months* · Chart/Table toggle. Chart is
    the standard single-series bar list in `--viz-1` (label + faint note above each bar, value right):
    Workload 15 (*mostly Plant Ops and Night shift*) · Growth 12 (*desk teams, 2+ years in*) · A better
    offer elsewhere 9 · Pay 7 · My manager 5 · Personal reasons 4. Table adds a Share column. Below, an
    Aurora note: *58% said something could have changed their mind. Workload leads at 29%, mostly Plant Ops
    and Night shift. Stay interviews on those teams ask about it while there is still time to act.* +
    **Stay interviews in Pulse →**.
  - **Came back** — the three most recent boomerang hires: avatar · name · *Design Lead · Design · away 14
    months · back Jul 2026* · one line on why they came back.
- **Recent leavers** — subtitle *Rehire is People's call, made by hand. It is never worked out from what
  someone said on the way out.* Segmented filter **Everyone · Would come back**. Rows (four columns on
  `md`): person (*Senior Engineer · Engineering · 3 yrs · left Sep 2026*) · *Left for: growth* + badges
  *Would return: Yes* (success) / *Maybe* (info) / *No* / *Not answered* (neutral), *In the network*
  (brand), *2 referrals* · a **Rehire** select (Eligible · Talk to People first · Not eligible; 44px on
  touch) · action:
  - In the network → **Share open roles** — enabled only when eligible and they said yes or maybe; tooltip
    otherwise. Becomes *Roles shared*.
  - Not in the network → **Invite to the network** → *Invited*. Toast: *Manish is invited once — there's
    no reminder.*

---

## States to design

Journey: first visit (opening question) · mid-conversation · two-answered result · all-six result ·
preview banner · a stretch fully complete · an overdue item. Onboard: manager (own team) · People (all) ·
after buddies are suggested · empty team. Alumni: chart / table · "Would come back" filter · disabled
Share open roles · Invited.

Dark mode uses the existing tokens throughout; no new colours.
