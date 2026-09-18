# 048 — Amplify v2: the share studio

**Route:** `/product/amplify` · **Code:** `apps/product/src/app/product/amplify/` (`AmplifyHub.tsx`, `Studio.tsx`, `Composer.tsx`)
**Status:** Built · needs Figma

## Why
Amplify was a long scroll of stacked cards: a company hero, a moments carousel, a composer and side cards all asking for attention at once. Choosing what to share and writing it fought for the same space, and you couldn't see how the post would look until you'd left Vadal.

## What changed

### 1. Page header
- Eyebrow **Engage** · H1 **Amplify** · subtitle: "Your wins and the company's news, shared in your own words. Nothing ever posts without you."
- Right side (wraps under on phones): a chip **"412 people reached · 3 shares"** and a **Preferences** toggle (sliders icon) that opens the voice + platform defaults card inline.
- Admin: the subtitle changes with the tab — Programme: "Run the programme — what's queued for people to share, what's working, and why people pass." · Results: "What sharing did for the company — reach, applications and hires traced to a share."

### 2. Share studio (desktop ≥1024)
Two columns: a **300px sticky list** on the left, the **studio panel** (28px radius card) on the right.

**List — "Ready to share"**, two groups:
- **Yours N** — "Things that happened to you" (recognition, shipped, certification, milestone). Always first: your own moment outranks company news.
- **From the company N** — "Already public — reshare in your words". The featured post is first.
- Row: 48px thumb (image or kind icon on soft tile) · meta line 12px (kind · when, or platform mark · posted) · badges **Soon** (upcoming moment) and **Picked** (in the advocacy queue) · title 14px semibold, 2 lines max.
- Selected row: lavender fill + purple-tinted border.

**Panel**
- Header: kind chip (icon + "Recognition · yesterday" / "LinkedIn · 2 days ago") · "N colleagues shared it" (company posts) · right-aligned ghost button **Not this one** (moments) / **Not for me** (posts).
- **Not for me** expands a soft box: "No problem. Anything we should know?" · "Optional, and never attributed to you." · reason chips (from `DECLINE_REASONS`) · "Just skip it".
- Title: the moment (20–24px bold) or the post text (18–21px, 3 lines max) + note "The company's post is attached to yours — see it in the preview."
- Moments get a **why** line with the gradient SparkMark: why this is worth the outside seeing.
- **Written as you** composer (voice tabs Plain / Warm / Proud / Technical, platform picker, caption, character count, hashtags, image) beside a **How it will look** preview.

### 3. Live post preview (new)
Neutral chrome — never an imitation of the network's UI:
- Your avatar, name, title · "now" · the platform mark top-right.
- Caption as typed; anything past the platform limit is highlighted (`<mark>`, warning tint).
- Attachment: the quoted company post as a small card, or the moment image at the platform's aspect ratio.
- Reaction row Like · Comment · Share with a count.
- Caption under the preview: "A preview of the shape — {platform} shows it in its own layout. You press post there."
- Sticky beside the editor at ≥1280; stacks under it below that.

### 4. Phone and tablet (<1024)
- The list is the page. Tapping a row opens the panel as a **bottom sheet** (the shared Drawer: grab bar, 44px close), so choosing and writing never compete for 375px.
- All rows, voice tabs, platform picks, decline chips ≥44px tall.

### 5. Below the studio
- **Your record** — Reach card + Sent (what you shared, where, when).
- **Good to know** — Exemplars (posts colleagues wrote that landed), FAQ, and what's feasible on each platform.
- Caught up state replaces the studio when nothing is left to share.

### 6. Other states
- **Opted out:** tabs + the opt-in hero + a three-card band explaining what Amplify does and doesn't do.
- **Admin:** Programme / Results as **underline tabs** (`nav aria-label="Amplify"`), matching Campaigns. The old company hero is removed.

## Tokens / components
Card, soft, lav, purple, line, faint/muted/ink text; Badge (brand soft sm); SparkMark gradient; Drawer (bottom sheet); platform Mark; IconContainer for kind icons in Figma.

## Figma to build
1. Share studio — desktop 1440, moment selected (LinkedIn preview with image).
2. Share studio — company post selected (X, preview with quoted post, over-limit highlight).
3. Decline expanded ("Not for me").
4. Phone 375 — list; and the bottom-sheet panel.
5. Admin Programme and Results with underline tabs and tab-aware subtitle.
6. Dark mode of 1.
