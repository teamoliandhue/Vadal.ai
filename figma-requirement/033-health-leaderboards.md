# 033 · Health leaderboards — walking, running, swimming

**Status:** built in code · iThrive (`/product/ithrive`), replacing the single *Your leaderboard group*
card · source: roadmap v2 · `docs/DECISIONS.md` §5

Three rules, all stated on the card:

1. **Opt-in.** Off by default, same consent pattern as the wellbeing check (only a literal *yes* counts).
2. **Role-aware.** Walking keeps the **fair cohorts** — a shift's steps never compete with a desk walk.
   Running and swimming aren't anyone's job, so one board each.
3. **Never points.** Ranked by the activity itself, in both points modes.

---

## 1 · The card

- Eyebrow **LEADERBOARDS** · a one-line basis that changes per activity
  (*Grouped with people whose work moves them about as much as yours does.* /
  *Everyone together — running isn't part of anyone's job.*).
- Segmented control with icons: **Walking · Running · Swimming** (44px on touch).

### Opt-in strip

- **Not opted in** — dashed border, lock icon · *You're not on the leaderboards* ·
  *You'd be 5th in running. Only you can see that.* · **Show me** switch.
- **Opted in** — soft fill · *You're on the leaderboards* · *Colleagues see your name and your numbers
  here. Turn it off any time — you disappear straight away.*

### Boards

- **Walking** — the existing cohort bars (steps a day, every bar on one global scale) with a *Desk* /
  *On site* chip for your group.
- **Running** (km this week) and **Swimming** (m this week) — rank · name + team · a bar on one scale ·
  value. Your row is tinted, with the bar in brand violet.
- People who haven't opted in show as **A colleague** with their team — their numbers still count.
  Your own row reads **You · only you see this** until you opt in.

Footer: *Ranked by the activity itself, never by points. People who haven't opted in appear as "a
colleague"; their numbers count, their names don't show.*

## 2 · Figma

The card for each activity, opted in and out, at 1440 and 375.
