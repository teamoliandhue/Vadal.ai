# 044 · Social v2 — a calmer feed, must reads, questions, saved

**Status:** built in code · `/product/social` (plus the post drawer, full post view and community pages,
which share the post parts) · source: section-by-section design pass, started with Social · references:
Campsite (post types in the composer), Circle / Threads (a quiet one-row header), Whop (comment box under
the post)

---

## 1 · The page, top to bottom

1. **Social tabs** (unchanged): Feed · Communities · Review.
2. **Header:** *Social* (26px bold) · *What's happening across oliandhue.* The **Catch me up** Aurora pill
   sits on the right below `xl` (44px) — the rail holds it from `xl`.
3. **Views** — one row that scrolls sideways on a phone, never wraps: **For you · Latest · Popular ·
   Must read · Questions · Saved**. Pills are 36px (44px on touch). Selected = `--ink` fill with card-colour
   text. Counts sit in a small pill after the label:
   - Must read → the posts *you* haven't confirmed, warning tint;
   - Questions → unanswered questions;
   - Saved → your bookmarks.
   This replaces the For you / Trending / Recent segmented control (Trending is now *Popular*).
4. **Composer** (§4).
5. **Must-read prompt** (For you only, when you have any): a 52px warning-tinted row, badge-check icon ·
   *2 must-read posts need your confirmation* · arrow. It opens the Must read view.
6. **Your communities** (below `xl` only — the rail has them from `xl`): a sideways row of 44px chips, each
   a 32px emoji circle · name · faint *14 new*, then **Browse all**.
7. **Topics** — one line, scrolls sideways: spark · *Topics* (with an info icon on For you; its tooltip holds
   the ranking explanation that used to be a line of text) · *All topics* · the tags Nudge found. Unselected
   topics are plain text, selected ones `--lav`.
8. New posts pill, channel filter banner, the stream.

**Empty states per view:** Must read — *Nothing to confirm*; Questions — *No questions here · Ask one from
the box above — Nudge checks Knowledge before anyone has to answer*; Saved — *Nothing saved yet · Tap the
bookmark on any post to keep it here.* With a topic or channel filter on: *Nothing matches this filter —
clear it to see more.*

## 2 · The post card

- **Kicker line** (one row, 12px uppercase, icon + label): *Pinned* (purple) · *Must read* (warning, green
  once you've confirmed) or *Announcement* (muted) · *Question* (purple) / *Answered question* (green).
- **Long posts fold** after ~280 characters to four lines with **Read more** / **Show less** (purple text
  button). The full view and drawer never fold.
- **Translate moved into the action bar.** The row *Translate · हिन्दी · Language ⌄* under every post is
  gone. The action bar now reads: reactions · comments · Share · **🌐 हिन्दी** (the icon only on phones;
  Aurora colour when showing). When a translation is showing, a slim line under the Aurora block holds
  *Translated by Nudge · a reading aid* · language menu · *Always translate* · *Hide*. It only appears with
  the Translation add-on on (spec 041).
- **Comment box under every post** — 28px avatar · a `--soft` pill *Add a comment…* (44px on touch);
  a purple send button appears once there's text. On an unanswered question it says *Write an answer…*.
  Your new comment becomes the preview line under the post.
- The ··· menu button and its items are 44px on touch.

## 3 · Must read

A post that asks everyone to confirm they've read it.

- **Block under the text** — warning-tinted (9% fill, 24% inset ring), radius 16:
  - *Please confirm you've read this by Fri 25 Sep* · *7,904 of 12,480 have confirmed · 63%* ·
    **I've read this** (brand, badge-check icon);
  - a 6px progress bar in `--warning`.
  - Once confirmed it turns green: *You confirmed on 17 Sep* · green check *Read* · the bar goes green.
    Confirming can't be undone from the feed — it's a record.
- **Admins** also get **🔔 Remind the 4.6k who haven't** → toast *One reminder to 4,576 people — it goes
  out at 9:00, outside quiet hours* → *Reminder scheduled*.
- In For you, unconfirmed must-reads sit directly under pinned posts.
- **Composer:** when someone allowed to post announcements has #company selected, a `--soft` checkbox
  row appears: *Must read — ask everyone to confirm by Friday* · *It stays at the top of everyone's feed until
  they confirm. You'll see who has, and can send one reminder.*

Seeded: *Travel and expense policy — what changes on 1 October* (People Team) and *Dock 3 has new floor
markings from Monday* (Plant Safety). Both have Hindi translations.

## 4 · Questions

- **Composer mode Ask** (help-circle icon, after Kudos). Placeholder *What do you want to know? The people
  who know will see it.* It defaults to #people, and the button reads **Ask**. After 12 characters, if
  Knowledge has the answer, an Aurora box appears: *This might already be answered* · the answer · a link
  to the article · *Still want to ask? Post it — people can add what the article doesn't cover.*
- **Unanswered question block** (Aurora box under the text), which picks one of three:
  - *Knowledge already answers this* — the answer, the article link, and **Share as a reply** (posts it as
    your reply, credited *From Knowledge — {article}:*);
  - *People who might know* — colleagues who posted about the same thing: avatar · *Aarav S. posted about
    search 7h ago* · **Ask Aarav** (adds a reply that mentions them);
  - *Not in Knowledge yet* — *Nudge has added it to the questions the People team answers in Knowledge.*
  - A footer line: *2 replies · not answered yet* · **See replies** / **Answer**.
- **Answered question block** — green-tinted: *✓ Answer, chosen by Rahul* · the answer with the
  author's avatar, name and role.
- **In the thread**, the chosen answer comes first with a green ring and *✓ The answer*. The person who
  asked sees **Mark as the answer** under each reply (and *Answer · undo* on the chosen one). Nobody else
  can choose.

## 5 · Saved

Bookmarks finally have somewhere to go: the Saved view, newest first.
