# 031 · Points mode, the ledger and Wallet

**Status:** built in code · `/product/kudos/wallet` · Settings › Recognition & points · Home, Kudos,
iThrive, profile menu · source: `docs/DECISIONS.md` §5

Points is a **workspace mode, on by default**. With it off, every surface has a designed state with
no numbers — recognition and badges carry the story. Badges are earned by **actions**, never by a
points total, so they mean the same in both modes.

---

## 1 · Earning rules (fixed, published)

| action | points | cap |
|---|---|---|
| Give kudos | +10 | 5 a day |
| Receive kudos | +25 | 10 a day |
| Post in Social or a community | +5 | 3 a day |
| Complete a survey | +15 | once — flat, never more for a longer or kinder answer |
| Finish a learning module | +20 | 3 a day |
| Pass an assessment | +40 | once |
| Log a health challenge day | +5 | once a day · only if you joined |
| Complete a 1:1 (managers) | +15 | 5 a week · for holding it, never for what was said |

**Never for:** ratings or performance scores · attendance, hours, overtime · sales or delivery targets ·
anything a manager scores about you. Kudos are worth the same for every value.

## 2 · Kudos gets tabs

**Kudos · Wallet · Rewards** (Wallet reads **Badges** when points are off). Same strip style as Social.
The Kudos header eyebrow now reads *My space*.

## 3 · Wallet (points on)

- **Header card** — eyebrow *YOUR WALLET* · the balance as the one hero figure (56px) + *points* ·
  *+310 this month · 4 badges · 1 reward redeemed* · **Browse rewards →** (violet pill).
- **How you earned it** (7 cols) — every entry, newest first: date · what · source · signed amount
  (redemptions shown as −, in `--muted`; the pre-August total as one *Carried forward* line).
- **This month, by source** (5 cols) — one bar list, highest first.
- **How points work** — the rules table, then a soft box *Never for* with the four items. Managers see
  the 1:1 rule; employees don't.
- **Badges** — a 4-column grid. Earned: `--lav` disc with the emoji, name, how, ✓ date in success.
  In progress: dashed card, grey emoji, a progress bar and *4 of 6*. A line names the closest next badge.

## 4 · Badges (points off)

H1 **Badges** · *Earned by what you do. This workspace doesn't use points, so there's no balance to
keep — just the recognition itself.* · four tiles: Kudos received · Kudos given · Badges earned · Most
recognised for · the badge grid.

## 5 · Where points appear, on and off

| surface | on | off |
|---|---|---|
| Home — You card | Points · Day streak · Badges; *Your wallet* | Kudos · 30d · Day streak · Badges; *Your badges* |
| Home — My day | *5 min · +20 pts · Learning* | *5 min · Learning* |
| Kudos wall | *+25 pts* on each kudos | nothing |
| Give kudos drawer | *You get +10 · Aarav gets +25* | *Counts toward their Top recogniser badge* |
| iThrive | *4,180 pts*; *Your 4,180 points, in your wallet →* | *4 badges*; *Your badges →* |
| Profile menu | *4,180 pts · 12-day streak*; *Points & badges* | *4 badges · 12-day streak*; *Badges* |
| Rewards | the catalogue (spec 032) | experiences a manager can grant |

The *Team rank* stat on Home is removed in both modes — a rank by points would be the only thing on
Home that turned engagement into a competition.

## 6 · Settings › Recognition & points (admins)

**Use points** switch · **What people see** — a Where / Points on / Points off table, with the current
mode's column in ink and ticked · **Earning rules** (dimmed when off) · **Points are never given for** ·
a link to Kudos › Rewards. Switching shows a toast and applies everywhere at once.

## 7 · Also fixed

Every Kudos hub button and the like control are 44px on touch.

## 8 · Figma

Wallet at 1440 and 375 · Badges (points off) · the settings panel in both states · each row of §5 as
an on/off pair.
