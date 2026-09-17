# 026 · Feed — full view, Write with Nudge, translate in place

**Status:** built in code · `/product/feed`, `/product/feed/post/[id]` · source: the 16 Sep meeting
("a full-view state for a post · AI help while writing · translate a post inline")

Three additions to Social. Each is Aurora where the assistant is speaking and violet where the
person acts — the house rule.

---

## 1 · A post has a page

A post now lives in three sizes: **in the stream**, a **quick look** (the 440px drawer), and the
**full view** — its own page, and what a shared link opens.

**Ways in** — the timestamp on any post (*2h ago*, underlines on hover) · **⤢ Open full view**, a
soft pill at the top of the drawer · **Share**, which now copies the post's real link.

**Layout** — two panes from `xl`: 680px main, 320px rail. One column below.

Main, top to bottom:
1. **← Feed** (or **← {community}** when the post was made in one).
2. **The post card** — same header, blocks and engagement bar as the stream, but the text is
   **17px / 1.65** (15px in the stream) and the card pads 28px. A pinned post keeps its violet ring.
3. **The thread, in short** — Aurora card, only with two or more replies: *3 people have replied —
   mostly positive. The reply most people agreed with is Neha's: "…"* and **Ask Nudge what needs
   an answer**. The mood and the quoted reply are computed from the comments.
4. **The conversation** — a card with the `N COMMENTS` eyebrow, every comment (soft bubble,
   `rounded-tl-md`), then a hairline and the comment box: avatar · field with **✦ Suggest a
   reply** · a round violet send button. *Comment* in the engagement bar focuses the box.

Rail:
- **The author** — 40px avatar, name, role · three soft stat tiles (*views · comments ·
  reactions*, 16/700 tabular) · **Copy link to this post** (ringed, violet text).
- **More from #company** (or the community) — up to four rows: avatar, name · time, two lines of text.

States: *This post is not here* (the spark, a line, *Back to the feed*) · *This post is for
members of {community}* (a lock) for a closed community you are not in.

## 2 · Write with Nudge (the composer)

The old one-tap "Draft with Vadal" overwrote your words. It is replaced by an assist that
**proposes and never overwrites**.

**The trigger** — *✦ Write with Nudge* in the composer's toolbar (Aurora text button; *Writing…*
with a breathing spark for ~½s). It opens a 256px menu **upward**, Aurora-bordered:

| draft is empty — *START ME OFF* | draft has words — *IMPROVE MY DRAFT* |
|---|---|
| Share a win · A reminder · Thank the team | Turn my notes into a post · Fix spelling & grammar · Make it shorter · Friendlier · More professional · Simpler words |

**The suggestion** — an Aurora card between the text and the toolbar (`--ai-surface`,
`--ai-border`, `rounded-2xl`, 14px pad, `ai-pop` in):
- Head: spark · **Nudge · Make it shorter** (13/700) · what changed, in 12 `--muted`
  (*51 words down to 29.* / *No emoji or slang, full forms, calmer punctuation.*)
- The proposed text, 15px.
- **Use this** (brand) · **Discard** (tertiary) · right: *Reads at grade 4*.
- A hairline, then *Try instead* and the other modes as small ringed pills — re-tone without
  going back to the menu.
- When nothing needed changing: the head line reads *This already reads that way — nothing to
  change.* with a single **OK**.

**After *Use this*** — the draft is replaced and *↶ Undo Nudge's edit* appears under the field
until the person types again.

Every rewrite is a named, repeatable edit — the same draft always gets the same suggestion.

## 3 · Translate in place

Under the text of **every post** (stream, drawer, full view):

- **文 Translate · हिन्दी** (Aurora text link) and **Language ⌄** (faint).
- On tap the translation appears **below the original, never instead of it**, in an Aurora block
  (`rounded-2xl`, same type size as the post, bold kept). Caption, 12 `--muted`: *Translated from
  English to Hindi by Nudge · a reading aid, the original is above*.
- The link becomes **Hide translation**, and a checkbox appears: **Always translate posts** — it
  applies to every post on screen at once and is remembered.
- **Language menu** (256px): each language in its own script with the English name beside it, a
  violet ✓ on the current one. Languages without a provider yet are listed, dimmed, marked
  **Soon**; a footnote: *More languages arrive with the translation provider.*
- A post that cannot be translated yet (one you just wrote) shows a dashed note saying so —
  never the original passed off as a translation.

Hindi is live for every seeded post; Marathi, Tamil, Telugu, Kannada, Bengali and Gujarati are
*Soon* (roadmap v3 picks the provider).

Taps on these controls never open the post.

## 4 · Touch

Everything new is 44px on touch and relaxes at `lg`. The engagement bar (react, comment, share,
bookmark) and the comment *Like* were brought up to the same floor in this pass.

## 5 · Figma

The full view at 1440 and 375 (with and without *The thread, in short*; the two locked/not-found
states) · the drawer with the *Open full view* pill · the composer with the menu open (both
columns), a suggestion, the "nothing to change" variant and the undo line · a post with the
translation open, the language menu, and the *not yet* note. Light and dark.
