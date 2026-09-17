# 035 · AI you can reach — feed ranking, topics, kudos-spotting, a personal Home order

**Status:** built in code · Social, Kudos, Home · source: roadmap carry-over ("wire tagPost → Social,
scanAnomalies → Kudos; PersonProfile batch") · AI features registry

Five AI features that were built and tested but reachable from nothing are now on screens. The feature
registry (`docs/AI-FEATURES.md`) went from 12 unreachable to 7; the remaining seven land with Pulse
programmes, the campaign builder and Onboard.

---

## 1 · One profile

A single profile per person — role, team, desk or frontline, reading level, interests, today's mood —
built from the session, from context (frontline reads simpler; plant teams care about safety), from the
posts they react to, and the communities they join. It ranks Social and orders Home. Nothing is asked.

## 2 · Social — For you, and topics

- Sort becomes **For you · Trending · Recent**, default **For you**. Under it, when no filter is on:
  *Ranked for you — your team, what you react to and the rooms you're in. Company-wide moments always stay
  in.* Pinned posts stay on top.
- **Topics** row above the composer: a small spark + *Topics* · **All** · up to six topics Nudge found in
  the posts (*Recognition · Scheduling · Workload & burnout · Safety · Pay & benefits · Milestones*).
  Selected chip: `--lav` / violet. 44px on touch, 30px at `lg`.
- Posting: the toast adds what Nudge tagged — *Posted to the feed 🎉 · Nudge tagged it Safety, Milestones*.

## 3 · Kudos — Nudge spotted

An Aurora card between the header and the wall: spark · **NUDGE SPOTTED** · *Worth a thank-you*.

- **Wins nobody has recognised yet** — up to three rows (avatar · who · two lines of the post ·
  **Recognise**, which opens the give-kudos drawer addressed to them). Found by tagging work posts; a
  post about a crew credits the crew (*Night shift crew*). Anniversaries are left to the celebrations below.
- **Teams below their own usual level** (managers and up) — each: a trend-down icon coloured by severity
  · team · *34% · usually 50.9%* · the plain explanation · **Prompt their managers** · *Manager hub →*.
  A team is compared with its own last nine weeks, never with other teams.

## 4 · Home — a personal default order

With no saved layout, Home's widget order comes from the profile: a **frontline** worker gets *What's
new* first (announcements matter most on a shared phone), a **manager** gets *Team snapshot* first,
a desk employee gets *Your week ahead* first. The first widget always leads the left column, so it is
also first on a phone. A person's own arrangement always wins.

## 5 · Figma

Social header with For you and topics (and a topic selected) · the Nudge spotted card for an employee
(wins only) and a manager (wins + dips) · Home default for frontline, desk and manager.
