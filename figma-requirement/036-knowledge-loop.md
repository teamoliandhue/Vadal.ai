# 036 · Knowledge — the loop closed

**Status:** built in code · `/product/knowledge` · source: roadmap carry-over ("Knowledge screen
role-gating, thumbs-down → correction, unanswered → gap, staleness warnings")

A knowledge base is only as good as what happens when it's wrong. Four changes.

---

## 1 · Role-gated documents

Articles can be for **managers** or **admins**. People who can't read one never see it — not in the list,
the collection counts or an answer's sources. In the list, gated articles carry a **Managers** / **Admins**
badge for those who can see them. An employee who asks how to run an appraisal conversation gets the
general *Appraisal cycle* article; a manager gets *Running appraisal conversations*.

## 2 · Thumbs-down → a correction

*Was this helpful?* on an answer and on an article. **👍** says *Glad it helped*. **👎** opens, in place:
*What's wrong with it?* — four choice cards: *It's out of date* · *It didn't answer my question* · *It
contradicts what I was told* · *I couldn't follow it* — an optional line (*What were you told?* when
it contradicts) · **Send to the People team** · Cancel. After sending: ✓ *Sent to the People team.
You'll hear back when it's fixed.* Reports of the same thing for the same reason add to one count.

## 3 · Unanswered → a gap, and a person

When nothing matches: *I don't have a confident answer for that yet. I've added your question to the
gaps the People team works through — and here's who can answer it now.* Then **Who can answer this now**:
*Your manager* · *The People team* (people@oliandhue.com) · *One-to-One Help*, each a 48px row.

## 4 · Staleness where it's read

Any document over 12 months old:
- in the list: an **Out of date** warning badge;
- in the article drawer and under any answer that cites it: an amber note — ⚠ **Not updated in 2 years.**
  *Check with the People team before you act on it.*

## 5 · The right column, by role

- **Employees and managers:** *Can't find it?* · **Who to ask** (the three rows) · 🔒 *Some documents are
  for managers or the People team, and won't appear here.*
- **Admins:** **Corrections · from readers** (each: the article or question · reason · count · kind ·
  the note in quotes · **Mark fixed**) · **Knowledge gaps** (questions asked here first, marked **New**,
  then the seeded gaps; a line counts documents over a year old; **Draft** asks Nudge to draft one) ·
  **Usage · 30 days**.

## 6 · Also

The heading is now **Knowledge** under a *Learn* eyebrow. Ask field, suggestion chips, source chips and
feedback buttons are 44px on touch.

## 7 · Figma

Knowledge for an employee and an admin at 1440 and 375 · an answer with a stale source · the no-answer
state with Who can answer · the correction picker, and sent · the corrections and gaps cards.
