# 010 · Amplify — redesign

**Status:** built in code · supersedes the Amplify section of [007](./007-four-pillars-screens.md).
**See it live:** `/product/amplify`, signed in as **Aarav Sharma**. Toggle advocacy off and on —
the hero is a different component in each state.

---

## 1 · What was wrong

Worth writing down, because the same trap is easy to fall into on Thrive and Grow.

**The payoff was five interactions deep.** For an employee this pillar is an *ask*, not something
they arrived wanting to do. The first version made them read a consent card, flip a switch, find
a post, open a disclosure and pick a voice before they saw the one genuinely good thing here — a
caption written the way they write.

**A pillar about social media had no images.** Social posts are the most visual medium there is
and every one was a grey text block. The single biggest failure.

**Every platform looked identical.** A LinkedIn post and an Instagram post read the same. They do
not, anywhere else in the world.

**Two full-width bands before any content.** A hero that restated its own title, then a consent
card. Roughly 290px of preamble before a single post.

**The impact number read as failure.** `0.1×` looked like underperformance when it only ever meant
"five people versus the company account".

---

## 2 · The hero is now two different components

This is the structural change. Draw both.

### 2.1 Opted out — `Component / Amplify / Hero · Pitch`

Two columns (`1.15fr / 0.85fr`), collapsing to one below 1024px.

**Left:** eyebrow, title, and a paragraph that explains the *deal* rather than the feature —
*"Vadal writes you a caption in your own voice. You read it, change what you want, and post it —
or don't."*

Then three proof elements in a row: **148** colleagues take part · **1,249** people their shares
reached · five overlapping avatars of who shared recently. Numbers at 26px/700, labels 12px
`text-faint`.

Then the Switch, with a shield icon and *"Opt out any time. Nothing posts without your tap."*

**Right (≥1024px only):** a non-interactive **preview of the payoff** — a small `bg-soft` card
showing a real drafted caption and a dummy Copy button, captioned *"Written for you, in four
tones. Yours to edit."* Show the thing rather than describing it. `pointer-events-none`,
`select-none`, 90% opacity so it reads as a sample.

### 2.2 Opted in — `Component / Amplify / Hero · Today's pick`

**The hero becomes the action.** Two columns (`0.9fr / 1.1fr`), image left, content right,
stacking image-first below 1024px.

- Full-bleed photograph, `object-cover`, min 220px tall on mobile, full height on desktop
- Eyebrow **WORTH SHARING TODAY** + `· 23 colleagues already have` in 12px `text-faint` —
  social proof does more work here than any amount of copy
- The post text at 18px/600, `-0.01em`
- Platform line
- **The caption composer, already open.** No disclosure, no click.

One post, one caption, one button. Ten seconds and the person is done — everything else on the
page is browsing, and browsing belongs below the fold.

---

## 3 · `Component / Amplify / Composer`

Used by the hero and by any expanded post. `bg-[--ai-surface]`, `ring-1 ring-[--ai-border]`,
`rounded-2xl`, padding 16px.

- Aurora circle + eyebrow **YOUR CAPTION**
- **Voice switcher**, right-aligned: Plain · Warm · Proud · Technical, in a `bg-card` track with
  1px `border-line`. Selected is `bg-soft` + `text-ink`; the rest `text-muted`.
  **Two sizes.** 44px minimum height and 14px text on touch; 30px and 12px from 1024px up. At
  26px it was the primary control on the screen and not reliably tappable.
- Editable textarea, 3 rows, 16px, `bg-card`, focus ring in `--ai-accent`. Changing voice discards
  manual edits and redrafts.
- **Copy caption** — brand, with a copy icon. On press it becomes tertiary with a check and the
  label **Copied** for 2.2s. The button says Copy, never Post: the product does not post.
- Best-time line beside it, 12px `text-faint`
- The gate, last, 12px: *"**We can't post this for you yet.** Auto-mirroring to LinkedIn is not
  enabled: spike not run…"* Stated before anyone tries, not discovered after a click.

---

## 4 · Platform marks — `Component / Amplify / Mark`

A rounded square, `rounded-[7px]`, white bold text at half the tile size. Sizes 16 / 18 / 22.

| Platform | Colour | Glyph |
|---|---|---|
| LinkedIn | `#0A66C2` | `in` |
| Instagram | `#D6249F` | `ig` |
| X | `#101014` | `X` |
| Facebook | `#1877F2` | `f` |

Deliberately a small mark rather than reproducing anyone's chrome — imitating another company's
UI inside a product is both tacky and a trademark problem. `aria-hidden`; the platform name is
always written next to it.

---

## 5 · Post card

`rounded-[26px]`, image at `aspect-[16/7]` full-bleed at the top, then 24px padding.

Platform line · **Picked by HR** badge where queued · post text 16px · engagement row with
`· 41 colleagues shared this` appended. The action is a **Write my caption** button, right-aligned
— a labelled button rather than the old small text link, and 44px on touch.

Not every post carries an image; text-only posts are normal in a real feed.

---

## 6 · Right rail

Three cards, replacing the old duplicate queue list and the wall of warning badges.

**Your reach** *(opted in only)* — the motivation loop, and personal rather than corporate:
`412` people, from 3 shares. Then *"You're 26th of 148 colleagues taking part. Advocacy counts as
a contribution — it shows up in Recognition, not just marketing's dashboard."* Then the modelled
caveat at 12px.

**Sharing this week** — avatar stack plus the count. Social proof again, because it is the single
strongest driver for advocacy.

**Advocacy impact** *(admin only)* — now **additive**: `+1,249 people beyond the company account`,
with *"The post itself reached 18,400"* beneath it. Same figure, told truthfully. Keep the
"modelled, not measured" caveat wherever the number goes.

**Posting for you** — collapsed to a single line with a chevron: *"Not enabled on any platform yet
— the brief asks for a feasibility spike first."* Four permanent warning badges made a working
feature look broken. The per-platform detail is one tap away for whoever needs it.

---

## 7 · A rule this surfaced

The voice switcher was 26px, and `size="sm"` buttons render at 32px. Our Definition of Done says
touch targets are ≥44px; nothing enforces it.

> Any control that is the **primary interaction of a screen** needs a 44px minimum on touch, even
> where the desktop design is deliberately compact. Express it as two sizes on the component, not
> one size that compromises both.

This belongs alongside the field rules in [009](./009-form-field-rules.md). It is not yet audited
across the rest of the product — worth a pass.

## 8 · What to draw

1. `Hero · Pitch` and `Hero · Today's pick` — the two states are the redesign
2. `Composer` — four voices, default and Copied, desktop and touch sizes
3. `Mark` — four platforms, three sizes
4. Post card with image, and the text-only variant
5. The three rail cards, including the collapsed platform-status line

---

# 010b · Finishing the job — share routes and the decline

Added after the redesign. Two changes that move Amplify from a caption generator
to something that actually completes the task and treats the person as a volunteer.

## 9 · The share step — `Component / Amplify / ShareActions`

Previously the screen wrote the caption and handed over a clipboard: copy, switch
app, find the post, paste, publish. Four steps in someone else's product, which is
where advocacy programmes die.

**The route differs per platform, because the platforms differ.** Designing one
"Copy caption" button for all four pretended otherwise.

| Route | When | Primary button | Explanation shown |
|---|---|---|---|
| **Share sheet** | `navigator.share` exists — i.e. almost any phone | **Share** + share icon | "Opens your phone's share sheet with the caption already in it. You still press post." |
| **Intent** | X on desktop | **Post on X** + arrow icon | none needed — the caption really is pre-filled |
| **Copy then open** | LinkedIn, Facebook on desktop | **Copy & open LinkedIn** | "LinkedIn doesn't accept a pre-written caption from another site, so it's on your clipboard — paste it when the composer opens." |
| **Copy only** | Instagram | **Copy caption** | "Instagram can't be posted to from a browser…" |

A secondary plain **Copy** sits beside every route except copy-only. All buttons
44px on touch, compact from 1024px.

The mobile route is the important one — this product is built for people on
phones, and the share sheet collapses four steps into one tap.

### 9.1 "Did you post it?"

Immediately after any share route fires, the button row is replaced by a `bg-soft`
row: **"Did you post it?"** with **Yes** / **Not yet**.

- **Yes** → a confirmed row: green check, *"Counted. Thank you — that one reaches
  people we never could."*
- **Not yet** → returns silently to the buttons. No nagging.

Every number on this screen is modelled. One honest self-report is worth more than
a better estimate, and it is what lets advocacy count as a contribution in
Recognition rather than as a marketing statistic.

`ShareActions` states: `Ready · Asked · Confirmed`.

## 10 · Declining — `Component / Amplify / Decline`

A one-way stream of asks with no way to say no is corrosive, and the decline is the
single most useful signal HR could collect.

**Trigger:** a quiet **Not for me** button with a thumbs-down, top-right of the
hero's eyebrow row, 36px, `text-faint`.

**Panel:** `bg-soft`, `rounded-2xl`. *"No problem. Anything we should know?"* with
*"Optional, and never attributed to you."* beneath. Four reason pills, 40px, plus a
plain **Just skip it** link so answering is never required:

- Not my area · Reads too corporate · Not right now · I'd rather not share work posts at all

Declines persist. Being shown a post you already passed on is the fastest way to
make an optional feature feel like nagging.

### 10.1 Caught up — the empty state

When nothing is left: centred card, 48px `bg-soft` tile with a check in `--purple`,
**"You're all caught up"**, and *"Nothing else is queued for sharing. We'll put
something here when there is — and never more than one thing at a time."*

A **Show the ones I passed on** button appears only if they have declined something.
The "From the company" section hides entirely rather than leaving a heading over an
empty list.

### 10.2 Admin — `Why people passed`

New rail card, admin only. Reason, count, and a `--purple` bar. Closing line:
*"Declines are never attributed. The hiring post was passed on by 19 people and
shared by 3 — worth knowing before it runs again."*

This is the half of the picture nobody collects, and on the current data it is more
interesting than the reach figure.

## 11 · What to draw

1. `ShareActions` — four routes × three states (Ready, Asked, Confirmed)
2. `Decline` — trigger, panel, and the caught-up empty state
3. `Why people passed` rail card
4. Post rows now read `· 41 shared · 2 passed`
