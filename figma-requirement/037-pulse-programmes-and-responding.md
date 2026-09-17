# 037 · Pulse programmes, smart send, and answering a pulse

**Status:** built in code · Pulse (`/product/pulse`, admins) · `/product/survey/[id]` (everyone) ·
source: `docs/DECISIONS.md` §7 · roadmap carry-over ("survey-respondent view") · AI: adaptive survey
length, smart send-time

---

## 1 · Lifecycle programmes (Pulse, admins)

A section above *Launch from a template*: **LIFECYCLE PROGRAMMES** · *Surveys that run themselves on a
trigger. Every one is adaptive — people only get the questions their answers make worth asking.*

Four cards in two columns:

| programme | trigger | audience |
|---|---|---|
| 🧭 Onboarding check-ins | day 7, 30 and 90 after someone starts | new joiners — People sees answers, the manager a summary |
| 🪴 Stay interviews | every 6 months, and 30 days after a flight-risk flag | everyone after year one — a conversation guide for the manager |
| 🧑‍🏫 Manager effectiveness · **Anonymous** | quarterly, managers with 5+ reports | direct reports — results only at 5+ answers |
| 🚪 Exit interviews | at resignation, and 60 days after leaving | leavers |

Each card: 48px emoji tile · name (+ *Anonymous* badge) · clock + trigger · an **On/Off** switch ·
one line on why it exists · the audience in faint · three soft tiles (*sent this quarter · responded ·
questions at most*) · ✦ *Top theme last quarter: **Unclear first-week plan*** · a disclosure
*Questions, and when each is asked* (numbered; each marked *always* or *only if an earlier answer calls
for it*) · **👁 Preview as a respondent**. A paused card goes dashed and slightly faded.

## 2 · Smart send (Pulse, admins)

**SMART SEND** · *When each person gets it* · *Their own response history first, their shift second.
Quiet hours (21:00–07:00) and the limit of 3 sends a week are enforced, not suggested.* · a *2 held back*
warning badge.

A table — **Who** (role · team, and the shift) · **Arrives** (*12:00 · WhatsApp*, or amber *☾ Held — quiet
hours* / *🔕 Held — too many this week*) · **Why** (*They usually respond around 12:00 — sending on
WhatsApp.* / *Night shift, so 07:00 on WhatsApp lands on a break rather than mid-task.*).

## 3 · Answering (everyone)

`/product/survey/september-pulse` — linked from For you (*Answer the September pulse · 2 min*) and the
Home digest's week ahead.

- ← Home · eyebrow *SEPTEMBER PULSE · CLOSES FRIDAY 25 SEP* · 🔒 *Anonymous. Your manager sees team
  results only when 5 or more people answer.* (non-anonymous programmes say who sees what instead).
- **One question per card**, 620px column. Top line: *Question 2* on the left, and on the right an estimate
  recomputed after every answer — *About 3 more after this* / *Probably the last one*.
- Question 22–28px/700. Answers:
  - **mood** — five 88px tiles with an emoji and a word (*Rough … Great*);
  - **scale** — five 52px options (agree scale for statements, *Not at all … Completely* for questions);
  - **choice** — full-width 52px rows;
  - **text** — a textarea (*In your own words — optional*) · **Next** · **Skip**.
- **Done:** a success tick · *That's everything we needed* · *2 questions — we only asked what your
  answers made worth asking. +15 points, the same for every survey and every answer.* (no points line
  with points off) · *What happens next* (three lines) · **Back to Home**.

A great week is **2** questions; an okay week **4**; a rough week **5**.

## 4 · Engine fixes found while building this

- An **unanswered** question was being read as a low score, so a respondent who said *Great* was still
  asked *What got in your way most?* Unanswered now means unanswered.
- A **night-shift** worker with no response history could never be reached — the fallback time was
  inside quiet hours. It is now the first hour quiet hours allow.
- When someone's usual response times are all inside quiet hours, the reason no longer claims *they
  usually respond at 12:00*.

## 5 · Figma

Programme cards on/off with the questions open · Smart send table · the respondent flow (mood, scale,
choice, text, done) at 1440 and 375, anonymous and non-anonymous variants.
