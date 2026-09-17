# 027 · Moderation & posting rights

**Status:** built in code · composer on `/product/feed` and every community · `/product/feed/review` ·
Settings › Posting & moderation · source: the 16 Sep meeting ("AI checks images and language before
a post goes out, with a soft rejection · per-tenant rules for who may post and share — everyone or
leadership only")

Aurora (`--ai-surface`, `--ai-border`) is used wherever the check speaks. Warning amber marks
something that is waiting for a person. Violet stays for actions.

---

## 1 · The pre-publish check (author)

Pressing **Post** reads the post first. Most posts pass straight through, and nothing is shown.
When something is found, the post stays in the composer and a panel appears under the text.

**The panel** (`role="alert"`, `rounded-2xl`, 16px pad, `ai-pop` in) —
shield icon · **title** 14/700 · *Needs a person* amber badge when it will be held ·
the body, 14 `--muted` · a row *The words* / *Found* with each phrase in a mono chip ·
the actions.

| what was found | verdict (Standard) | title | primary action | also |
|---|---|---|---|---|
| Harsh words | **nudge** | This might read harsher than you mean | **Suggest a calmer version** | Edit post · Post anyway |
| Phone, email, Aadhaar, PAN | **nudge** | This includes personal details | **Take the details out** | Edit post · Post anyway |
| A threat, or a post that singles out a group | **hold** | This will be looked at before it goes out | — | Edit post · **Send for review** |
| A risky photo | **hold** | Check the photo first | **Use another photo** | Edit post · Send for review |

Copy rules: it describes **how the post might land**, never what the author is. It never says
"violation", "flagged" or "blocked".

**Safety route** — when a held post names a hazard beside the flagged phrase, a white inset
appears: *If this is about a hazard, you can also **raise it privately in Flow** — it goes
straight to the people who can fix it.*

**Suggest a calmer version** opens the standard Nudge suggestion card (spec 026) with the same
point minus the jab — *"This new rota is stupid and whoever made it is useless"* → *"This new rota
is frustrating."* **Take the details out** swaps contact details for *message me directly* and
removes ID numbers, with *Undo Nudge's edit*.

Typing clears the panel. Pressing Post again re-checks.

## 2 · Waiting and returned (author)

A held post appears at the top of wherever it was posted, **only to its author**:

- **Waiting for a person to look at it** — dashed `--line` card, clock in a soft disc, *Your post
  in #wins · only you can see this*, three lines of the post · **Edit instead** · **Withdraw**.
- **Returned with a note** — dashed amber card with a return-arrow disc, the post, then the
  moderator's note in a white inset (*Priya Sharma: …*) · **Edit and post again** (reopens the
  composer with the text) · **Dismiss**.

Approved posts simply appear in the feed.

## 3 · Report

*Report* in a post's ⋯ menu now sends it to Review. Toast: *Reported — a moderator will look. It
stays up until they decide.* Reporting twice says *You've already reported this one*. More people
reporting the same post adds to one card's count. **Moderators see how many people reported it,
never who.**

## 4 · Review (moderators)

A third Social tab, **Review** with an amber count, visible to admins only. Everyone else who
opens the URL sees *Review is for moderators*.

Two panes from `xl`. Main: *Review* 24/700 · *Posts held before they went out, and posts people
reported. You decide.* · a segmented **Needs a decision · n / Decided · n**.

**The item card** (`rounded-[22px]`):
1. Badge — *Held before posting* (warning) or *Reported* (danger) · where · when · *reported by 2 people*.
2. **The post as it would appear**, inside a bordered inset: avatar, name, role, text, photo.
3. **WHY IT'S HERE** — one row per finding: amber (held) or grey dot · plain reason · the phrase in a mono chip.
4. **Nudge's read** — Aurora inset with the spark: the context the word list can't see
   (*"Reads as a warning about blocked bays rather than a threat to a person…"*).
5. Actions, after a hairline:
   - held — **Approve and publish** (brand) · **Return with a note** (secondary)
   - reported — **Keep it up** (brand) · **Remove post** (secondary)
   - right-aligned when relevant — **Raise as a safety case** (violet link, Flow icon)

**Return / Remove** opens a note in place: a 3-row field **pre-written by Nudge for this post**, a
line *Written by Nudge for this post — edit it before it goes. The author sees it word for word.*,
then **Send it back** / **Remove and notify** · Cancel.

**Decided** cards replace the actions with the outcome in its colour — *Approved and published*,
*Returned to the author with a note*, *Kept up*, *Removed from the feed* — who decided, and the note
in quotes.

Rail: **So far** — four soft tiles (*waiting · approved or kept · returned · removed*) and
**Your rules** — the five settings as label/value rows and *Change in Settings*.

Empty: a green shield, *Nothing waiting*, *Held and reported posts land here. Everything else is
already live.*

## 5 · Settings › Posting & moderation (admins)

A new Settings tab between Members and Integrations. Changes apply the moment they're made, with
a toast.

**WHO CAN** — four rows, each a bordered card with title, hint and a three-way segmented control
(*Everyone · Managers & up · Admins only*):

| rule | default |
|---|---|
| Post in the company feed | Everyone |
| Post in #company | Admins only |
| Start a community | Everyone |
| Share posts outside the company | Everyone |

On a phone the control becomes three equal columns and labels wrap to two lines.

**CHECKED BEFORE POSTING** — three switches: *Check the wording* · *Check photos* · *Flag personal
details*.

**SENSITIVITY** — *Relaxed · Standard · Strict*, with its one-line meaning, then a table **When a
post has… / What happens** that updates live from the real check: *Held for a person* (amber) ·
*Author gets a nudge* (Aurora) · *Posts* (muted).

**TRY A POST** — an Aurora box with a field; the verdict and reasons appear under it as you type.

## 6 · Where the rules show

- **Composer, feed locked** — the composer becomes a dashed card with a lock: *Posting to the
  company feed is open to managers and admins here* · *You can still react and comment, and post in
  your communities.*
- **Channel picker** — a locked channel is dimmed with a lock and *Posting here is for admins*.
- **Communities hub** — without the right, *New community* is replaced by *Communities are started
  by admins in this workspace.*
- **Amplify** — the share buttons disable with *Sharing outside the company is open to admins in
  this workspace.* in the existing red reason line.

## 7 · Honest limits

The wording check runs on named word lists and patterns. The photo check reads labels attached to
the attachable image set; a vision model returns the same label-and-risk shape in production. The
demo queue lives in the browser, so a post held as an employee is there to review after signing in
as an admin on the same device.

## 8 · Figma

Composer with each panel (four cases + the safety inset) · the waiting and returned cards · Review
at 1440 and 375 with a held, a photo and a reported item, the note editor open, and a decided card ·
Settings panel at 1440 and 375 with Strict selected · the locked composer, locked channel, hub note
and Amplify reason. Light and dark.
