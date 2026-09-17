# 040 · Amplify — captions that sound like a person

**Status:** built in code · Amplify composer (`/product/amplify`) · source: roadmap v2 "Amplify AI copy
improvements" · AI: personal caption in the employee's voice

The composer's first draft was the same sentence for everyone, cut the company's words off mid-sentence,
and joined them with a dash (*"Genuinely pleased to see this one go out — Our Plant Ops team…"*). Forty
people resharing the same post all opened the same way, which is what astroturf looks like. This changes
how drafts are written and adds one advisory box.

---

## 1 · How a reshare draft is written

- **The opener varies by person.** Each voice has two or three openers; which one you get depends on who
  you are and the post, so colleagues' reshares differ. Warm, for example: *Really glad this one is out.* ·
  *This one made my week.* · *Good news from the team, and worth a read.*
- **The company's words stay whole.** Whole sentences up to a per-platform budget (X 190 · Instagram 320 ·
  LinkedIn / Facebook 420 characters). A sentence is only cut when the first one alone is too long — and
  then at a word, with an ellipsis.
- **Press-release lead-ins are removed.** *"We are thrilled to announce that we shipped…"* becomes *"We
  shipped…"*.
- **Each platform gets its shape:**
  - **LinkedIn / Facebook** — the personal line on its own, a blank line, then the news and the closer.
  - **Instagram** — the news first (the feed cuts captions after a line), then the personal line.
  - **X** — one line: opener + news, short enough to leave room for the link.
- **Hiring posts** get invitation copy, not pride copy, and never repeat "we're hiring": *It's a good team to
  join.* … *Happy to tell you what it's like here.*

Example, Warm on LinkedIn:

> Really glad this one is out.
>
> Our Plant Ops team just closed 200 days without a lost-time incident. That is not luck — it is a thousand
> small decisions made properly, every shift. Well done, everyone involved.

The caption field is now **6 rows** (3 on X) so a two-paragraph draft is visible without scrolling.

## 2 · "Reads a little like a template"

Shown under the character count, above the policy box, only when the caption contains a phrase people
scroll past. Card background, 1px Aurora ring, radius 12.

- Title: small gradient spark · **Reads a little like a template** (14px semibold).
- One row per phrase: the phrase in quotes (muted) · a text button in `--ai-accent`: **Use "real change"**
  or **Remove it**. One tap edits the caption and fixes the capital letter if the phrase started a sentence.
- Footer, faint 12px: *Saying what happened, in your words, is what gets read.*

Phrases: thrilled / excited / delighted to announce or share · beyond excited · humbled · game-changer ·
synergy · leverage · world-class / best-in-class / cutting-edge · passionate about · exciting journey.

Advisory like the policy warnings — nothing is blocked.

## 3 · Moments never name the author

A moment shared "with" people used to list everyone, including the person posting — Aarav saw *"Aarav, Dev
and I just shipped…"*. The poster is now removed from the list: Aarav sees *"Dev and I just shipped…"*. The
opt-in preview card uses the same draft instead of a hard-coded sentence.
