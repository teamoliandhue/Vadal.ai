# 045 · Kudos v2 — recognition that fits your role, boosts, thanks back, cards to sign

**Status:** built in code · `/product/kudos` (Wallet and Rewards unchanged) · source: section-by-section
design pass · references: 15Five High Fives (filters above the wall, a personal given/received card),
Basecamp Boosts (short notes added to someone else's post), Duolingo (one-tap Celebrate)

---

## 1 · Who sees what

The old page showed every employee the org's coverage by team, and a sentence about night-shift flight
risk. Now:

| | Employee | Manager | HR admin |
|---|---|---|---|
| Stat tiles | You received · You gave · Cards to sign · Your top value | {Team} coverage · Not recognised yet · You gave · You received | Recognitions · 30 days · Coverage · Peer to manager · Most celebrated value |
| Rail | Cards to sign · Values · Top recognisers | + **Who's been seen** (their reports) | same as employee |
| Coverage by team + cold zones | — | — | full-width card at the bottom |

The page description changes with the role too (*Thank the people who make work better, and see who
thanked you* / *Recognition on your team…* / *Recognition across the company…*).

## 2 · Layout

1. Kudos · Wallet · Rewards tabs.
2. **Header**, with no hero card any more: eyebrow *MY SPACE* · H1 *Kudos* · the description · **Give
   recognition** (brand) on the right.
3. **Four stat tiles** (2×2 on a phone): label 13px muted · value 24px bold · note 12px faint.
4. **Nudge spotted** (unchanged, but it never suggests you recognise yourself).
5. Two columns from `xl`: the wall, and a 360px rail.

## 3 · The wall

- Eyebrow *THE WALL* · *Recent recognition*.
- **Whose kudos:** a row of pills — *Everyone · For me (2) · From me (1) · My team* (selected = `--ink`
  fill, 44px on touch).
- **Value:** a second row — *All values · 🎯 Ownership · 🤝 Collaboration · 💡 Innovation · ⭐ Customer
  focus*. Selected = 14% tint of that value's colour. The Values bars in the rail set the same filter.
- **Empty states:** *You haven't given kudos yet · The quickest one takes a minute — who helped you this
  week?* + **Give recognition**; *Nothing for you yet*; *No kudos match · Try another value, or Everyone.*

### The kudos card

- **Band** (12% tint of the card style, 10px vertical padding): big emoji · style label (*Thank you ·
  Above and beyond · Team win · Welcome aboard*) · the value chip on the right (card background, value
  colour).
- **People:** the recipients' avatars overlapped (the first is `lg`, up to two more `md`) · *Meera Pillai
  and Karan Joshi* (three or more: *… and 2 others*) with a *You* pill when it's you · *from [avatar] Anita
  Desai · Manager · 1h ago*.
- **Message:** 15px.
- **Thanks back** (when the recipient replied): a `--soft` bubble with a reply icon · *Aarav — Thank you —
  Karan's load testing is the reason it held.*
- **Boosts:** pill-shaped notes — avatar · **Neha** *The empty states alone 🤌*. Two are shown, then
  **+1 more**.
- **Action bar** (hairline above):
  - **🎉 Celebrate 24** (pressed = `--lav` + purple, label *Celebrated*);
  - **＋ Boost** — only for people who didn't give or receive it, once each. It opens an inline field
    (60 characters, with a countdown), *Add a short note — "Couldn't agree more"*, send and Cancel;
  - **↩ Say thanks** — only for the recipient, once. Same inline field, 140 characters;
  - *+25 pts* (*each* for a team kudos) on the right when points are on.

## 4 · Give recognition (drawer · bottom sheet on a phone)

- **To:** chips of chosen people (avatar · name · 44px remove on touch), then a search field
  *Search a teammate or a team…* / *Add someone else — recognise the whole crew*. Up to 8 people. You
  never appear in the results.
- **Kind of thanks:** a 2×2 grid of 52px tiles — emoji + label. Selected = style tint border + 12% fill.
  A crew suggested by Nudge starts on *Team win*.
- **The value it lives:** value pills + the value's one-liner.
- **Note** + **Help me word it** (Aurora): *Meera and Karan took full ownership of…*
- **Share to the company feed** switch: *It appears in Social under #wins, where everyone can celebrate
  it* / *Private — only Meera and Karan will see it*. It's real: the kudos appears in Social.
- Sticky footer: *You get +10 · each of them gets +25* · Cancel · **Send recognition**.

## 5 · Cards to sign (rail)

One card per birthday, work anniversary or first week, signed by everyone and delivered on the day.
You never see or sign your own.

- **List:** `--soft` rows — avatar with an occasion emoji badge · name · *Work anniversary · 4 signed* ·
  **✎ Sign** (secondary) / **✓ Signed** (tertiary).
- **Sheet:**
  - **The card:** radius 24, a purple-to-card gradient, a 44px emoji, a 22px headline (*Three years,
    Arjun*), and *[avatar] Engineering · delivered today at 5:00 pm*.
  - *4 SIGNED* · signature bubbles (avatar · **name** message; yours reads *You*).
  - *Add your message* (140 characters) + three suggestion pills for the occasion.
  - **Sign the card** / **Update signature**.
  - Toast: *Signed — Arjun gets the card today at 5:00 pm.*

## 6 · Who's been seen (managers)

A rail card: *YOUR TEAM · 30 DAYS · Who's been seen*. Up to five reports, least recognised first: avatar ·
name · *Not recognised in 30 days* (warning, semibold) or *3 kudos* · **Recognise** for anyone at zero
(opens the give drawer with them filled in).
