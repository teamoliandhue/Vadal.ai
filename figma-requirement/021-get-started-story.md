# 021 · Get Started — a story, one screen per idea

**Status:** built in code · supersedes the *page layout* of [019](./019-get-started-tour.md);
the mechanics of [020](./020-get-started-by-doing.md) (explored by doing · first visit lands here ·
resume row on Home · rail pill) are unchanged · `/product/get-started`

---

## 1 · Why it changed

The two-pane version — a step list beside a card — read as a setup wizard. The founders'
direction: **cinematic**. One idea per screen, the headline *is* the idea, and the live product
is the picture. You move by scrolling, the way you read anything worth reading.

The nearest references on Mobbin: mymind's scene-by-scene onboarding (full-bleed colour, one
line per screen) and Linear's first-run sequence ending on "You're good to go". Neither shows the
real product as evidence; that is our difference.

---

## 2 · The shell in story mode

`<Shell pane="story">` — no page padding, no 1240px column. At `lg` the scroll pane gets
`scroll-snap-type: y proximity`; every scene is `snap-start` and exactly the pane's height
(`100dvh − 65px` bar). Below `lg` the document scrolls as usual; scenes are
`min-h: 100dvh − 65px − 56px` (bar + tab bar) and grow with content.

---

## 3 · Scene anatomy

| Part | Spec |
|---|---|
| **Light** | Two blurred blobs (620 / 460px, blur 70px), hue `= (index × 34 + 250) mod 360`, alpha 0.16 / 0.12 — the room changes colour with the idea. Side alternates by parity. |
| **Number** | `01`–`11` in `ai-text-grad`, then the section in caps `0.18em` `--faint`; a `Lock` glyph when the role cannot open it. |
| **Headline** | `clamp(34px, 4.6vw, 60px)` · 700 · line-height 1.02 · tracking −0.032em. |
| **Meaning** | `clamp(16px, 1.3vw, 19px)` · `--muted` · max 46ch. |
| **Evidence** | Right column, max 600px: the live demo (real component, real data) inside a `--card`/85 frame, 28px radius, `backdrop-blur`, deep shadow, an `ai-grad` halo at 25% behind it. |
| **Actions** | `Open {section}` (secondary) · `Next ↓` (tertiary) · status row from 020. |
| **Entrance** | `.story-in` children rise 22px → 0 over 0.8s with 0.1s stagger when the scene is on screen; static under reduced motion. |

**Scene 01** is the opening: centred, `clamp(34px, 5.2vw, 68px)` headline — *"A company stays
human when every employee has a daily ritual worth keeping."* — the org card, **Start the tour ↓**
and *Skip for now*.
**Scene 11** is the close: number reads `11 — the end`, then the *You're set* panel from 020.

---

## 4 · Progress

- **Spine** (lg, fixed right, vertically centred): `done/11` above eleven 6px dots; the current
  dot stretches to 22px in the client brand, explored dots are `--success`; hover/focus shows
  `n · title` in a pill to the left; *Start over* beneath once anything is explored.
- **Hairline** (below lg): 3px `ai-grad` bar fixed under the 65px bar, width `(current+1)/11`.
- The scene on screen is remembered (`vadal:tour-step`) and restored on return, without
  animation. Idea scenes (01, 11) are explored by being on screen; action scenes only by doing.

Measured from scroll position, not an IntersectionObserver — a scene that is on screen must never
sit invisible waiting for a callback.

---

## 5 · Second pass — presence, and a demo that runs itself

| Addition | Spec |
|---|---|
| **Watermark number** | `01`–`11` behind the text column: `clamp(150px, 20vw, 280px)` · 800 · tracking −0.06em · `--ink` at 4.5%. Fills the room without competing. |
| **Product window** | The evidence sits in a window, not a card: a 40px chrome strip — SparkMark · **Vadal** · `· Pulse` · right-aligned green dot `Live · oliandhue` — over the demo (min-height 220px, centred). Caption beneath: *"The real component on real data — what you would see in Pulse right now, not a picture of it."* |
| **Parallax** | Each scene knows its distance from centre (`--p`, −1…1, set on scroll); the window drifts `−48px × --p`, a touch slower than the page. Off under reduced motion. |
| **Drifting light** | The two blobs travel 5–7% over 22s / 28s (reverse), so no scene is still. Off under reduced motion. |
| **Scroll cue** | Scene 01, lg only: *"Scroll, or use the arrow keys"* with a softly bouncing ↓. |
| **Keys** | → ↓ PageDown Space = next scene · ← ↑ PageUp Shift+Space = previous · Home / End. Ignored while typing (the ask box) or with a modifier held. |
| **Present** | Pill above the spine (Play ▸ *Present* / Pause ‖ in `ai-grad` while running). Turns the page every 9s until the end; a wheel, a touch, a key or Esc stops it. A status pill at the bottom centre says so: *"Presenting · 9s per idea · scroll or press any key to stop"*. For the investor demo where the hands are busy talking. |

## 6 · Third pass — the scenes are the brief's pillars

The product brief (*Vadal.ai — Product Specification & AI Feature Brief*) defines the product
as **seven pillars and one AI layer**. The scenes now walk exactly that, by name and in that
order; the earlier sequence showed Connect only through Recognition and Broadcast only through
Knowledge, and named sections rather than pillars.

| # | Eyebrow | Headline (the brief's own line) | Sections in the pillar (chips) | Evidence |
|---|---|---|---|---|
| 02 | Home | Your daily ritual | Home | live MoodCheck |
| 03 | **Pillar 1 · Pulse** · Listening & Feedback | Listening, structured and ambient, across the whole employee lifecycle. | Pulse · Surveys · Sentiment · Always-on listening · Analytics | health score + contributions |
| 04 | **Pillar 2 · Connect** · Social & Showcase Feed | An internal feed where people share wins, not just HR pushes updates. | Feed · Recognition | a real post (reactions/comments/views) + a real recognition + *Recognise someone* |
| 05 | **Pillar 3 · Amplify** · Company Social Media Integration | Bring the company's voice in, and let employee moments go out. | Amplify | a moment that is yours |
| 06 | **Pillar 4 · Thrive** · Health & Wealth | One wellness pillar: physical health and financial health, side by side. | Thrive | the person's goal ring |
| 07 | **Pillar 5 · Broadcast** · Communication Hub | One trusted channel for everything the company needs employees to know. | Campaigns · Knowledge | live campaign (reach · took part · lift · steps acknowledged) + the ask box |
| 08 | **Pillar 6 · Grow** · Bite-Sized Learning | Learning that fits into a five-minute break, not a training day. | Grow | learning days + review queue |
| 09 | **Pillar 7 · One-to-One Help** · AI Companion | A private first door to support, with a real person always one step away. | One-to-One Help | crisis lines |
| 10 | **Pillar 8 · Managers** · Manager Enablement | Insight is only worth what a manager does with it by Friday. | Manager hub | team health beside the org's, the drivers, the highest-impact action + its coaching nudge |
| 11 | **Pillar 9 · Cases** · Case Management & Issue Resolution | Nothing an employee raises gets lost. | Cases | a live case: id · priority · status · SLA · owner · source (auto-opened from Pulse) · first timeline entry · avg days to resolution |
| 12 | **The AI layer** · Personalisation · Sentiment · Copilot · Guardrails | One AI layer, not seven integrations — and it can act. | — | four prompts into the real assistant |

Pillars 8 and 9 come from the second brief (*Product Strategy & Priority Summary* — Manager
Enablement and Case Management), which closes the loop the AI brief opens: what the company
does with what it heard. Both are manager/admin views, so the employee sees them locked with a
note that says what reaches them and what never does. The tour is now thirteen scenes.

**Chips** are the sections that make the pillar up: 36px pills (44px on touch), `--card`/80 on
`--line`, brand border on hover, each a link that also counts as exploring the step. A section
the role cannot open renders as a dashed pill with a lock — kept, not hidden. The window chrome
and the caption now name the pillar. The opening scene lists the seven by name.

## 7 · Fourth pass — the cards

Every demo is now one composed card that can carry a screen: a hero figure, one visual that
explains it, and one line the assistant would say (the `AiLine` footer — Aurora surface,
SparkMark, 12.5px `--muted`). Cards are `--card` on `--line`, 16px radius, sections divided by
hairlines; the hero figure is 24–28px/700 tabular; eyebrows 11px caps `0.14em`.

| Scene | Composition |
|---|---|
| 01 Welcome | `ai-grad` header band (SparkMark · Vadal · org · Live) over three icon-stat tiles divided by hairlines |
| 02 Ritual | header: *Daily check-in* · streak count · seven dots for the week; the real `MoodCheck` |
| 03 Pulse | `ScoreRing` (150, gradient) beside a **composition bar** — one segment per input, weakest in `--danger` — with a legend of `+points` |
| 04 Connect | social card: author row · two-line post · reaction pills (❤️ 214 · 🙌 76 · 🎉 22) · reactor avatar stack · comments/views; then a brand-bordered recognition card with the heart tile, the quote, value badge and **Recognise someone** |
| 05 Amplify | LinkedIn mark · *You · drafted by Vadal, in your voice* · **Policy check passed** pill · the moment as a post · reach stat + `Sparkline` |
| 06 Thrive | `GoalRing` beside a `DayArea` of the week's steps against the target; a Wealth row (₹3,000 commitment · payday) |
| 07 Broadcast | campaign header with lift stat · two-bar **funnel** (reached 91% → took part 76%) · five-step track with ticks; then the Aurora ask box with three suggested questions |
| 08 Grow | completion `GoalRing` beside a `StreakStrip` of minutes vs a 5-min bar; the review queue |
| 09 Help | danger-tinted crisis row with tel pills; the first counsellor (avatar · credentials · next available) with **Talk to a person**; three ways-in quotes |
| 10 Managers | team 74 vs org 82 · driver chips · three reports each with a `Sparkline`, sentiment and trend arrow; the highest-impact action as the AiLine |
| 11 Cases | id · title · priority badge · **SLA ring** (days left) · team / owner / source · three-entry timeline with a brand dot on the latest |
| 12 Copilot | assistant bubble · four prompt chips · a real composer that fires `vadal:ask` |

## 8 · Fifth pass — the words

Nobody reads a paragraph on a slide. Every scene is now a headline of three to six words and
a meaning of eight to fifteen, set one size larger (`clamp(17px, 1.4vw, 21px)`, 40ch):

| # | Headline | Meaning |
|---|---|---|
| 01 | Keep your company human, every day. | Employees get a daily ritual. Leaders hear what it produces. Nine pillars, one assistant — each shown live on your own workspace. |
| 02 | Your daily ritual | Five seconds a day: how are you feeling? Private to you. Everything else starts here. |
| 03 | Hear how people really feel. | Surveys, check-ins and comments become one health score — with every input shown. |
| 04 | A feed where people share wins. | Post, celebrate, recognise. Tied to your values, visible to everyone. |
| 05 | Your moments, shared outside. | Vadal drafts your wins in your voice. You choose what goes out. |
| 06 | Health and wealth, side by side. | A goal that fits your job, and money guidance right next to it. |
| 07 | One channel everyone trusts. | Announcements that get acknowledged, campaigns that report reach, and a policy library you can ask. |
| 08 | Learning in five minutes. | Short lessons, quick quizzes, and reminders for what you keep missing. |
| 09 | A private door to support. | Talk it through confidentially. A real person is always one tap away. |
| 10 | Insight managers act on. | Team health, what is driving it, and the one action to take this week. |
| 11 | Nothing raised gets lost. | Concerns become cases — owned, timed, and resolved. |
| 12 | One assistant. It can act. | Ask, draft, launch a pulse, give kudos. It confirms before anything reaches a person. |
| 13 | You're set | Nine pillars, one assistant, all live on your own data. |

Status rows read *Done when you open Pulse.* / *Done — you opened Pulse.*; the caption under the
window reads *Live from your workspace — the real Pulse, not a picture.*; the locked notes and every
card's assistant line are one sentence.

## 9 · Sixth pass — the first five seconds

Investor feedback, verbatim: interest forms in about fifteen seconds; people shown the product
for thirty seconds could not say what the company does. The target is that an unprompted viewer
answers **"an HR AI company with nine products."**

Scene 01 was failing that test. *"Keep your company human, every day"* is a brand promise — it
names no category, no AI, and no count. The card counted **17 sections · 52 AI features · 1
assistant**, and nobody can repeat "52" back.

| | Before | Now |
|---|---|---|
| Headline | Keep your company human, every day. | **Nine HR products. One AI that acts.** |
| Sub | Employees get a daily ritual. Leaders hear what it produces… | It listens to every employee — desk and frontline — then acts: launches the pulse, drafts the post, opens the case. One assistant, running through all nine. |
| Card | three counted stats | **the nine, named** |

**The hero is three layers, for a reader who gives it five seconds.** An earlier draft —
*"One AI platform. Nine HR products."* over *"Everything a company needs to hear its people"* —
passed the recall test but read like every HR suite: it named the shape and not the business.

| Layer | Reads | Answers |
|---|---|---|
| Eyebrow | `VADAL.AI · AI-NATIVE EMPLOYEE EXPERIENCE` | what category of company this is |
| Headline | **Nine HR products. One AI that acts.** | what we sell — and the differentiator in four words |
| Sub | It listens to every employee — desk and frontline — then acts: launches the pulse, drafts the post, opens the case. One assistant, running through all nine. | why it is not a survey tool |

Two deliberate choices. **"Desk and frontline"** carries the wedge from the product brief — the
frontline are the majority of the workforce and the last to get good software. **Three named
actions** (launches, drafts, opens) are the agentic claim made concrete; a competitor's hero can
say "AI-powered insights", it cannot say "opens the case". The card header no longer repeats the
count — it reads *"Your workspace, right now"*, which is the proof the numbers below are live.

**The product grid** is now the hero of scene 01: `ai-grad` band (*Nine products, one platform* ·
org · people · Live) over a 3×3 grid — hairlines via `gap-px` on `--line`, tiles `--card`, each
72px min. A tile is `01` / **Pulse** / *Surveys & sentiment*; a lock glyph appears beside the
number when the role cannot open it, and the tile still jumps to that product's scene. The nine
descriptors are deliberately plain HR words: Surveys & sentiment · Feed & recognition · Employee
advocacy · Health & wealth · Comms & policies · Micro-learning · Private support · Manager tools
· Issue resolution. The footer keeps the proof, now as a sentence: *52 AI features live across
all nine.*

Every scene eyebrow reads **Product n · Name** (was *Pillar n*) — "pillar" is internal language;
"nine products" is the sentence the viewer should leave with.

**The proactive nudge is suppressed on this route.** The dock stays — an assistant on every
screen is part of what the tour is showing — but an unprompted popup about Engineering's
sentiment landed on top of the product grid and answered a question nobody had asked yet.

## 9b · The first frame, as one frame

The test the founders set: an unknown company must explain itself before the visitor scrolls.
Against that, the previous pass still failed in eight ways — the nine tiles were cut at the fold,
the sub was a paragraph, "acts" was claimed and not shown, proof was buried, the CTA was below the
fold, the headline broke mid-sentence, the dock covered tile 09, and the eyebrow was jargon.

| Layer | Now | Why |
|---|---|---|
| Eyebrow | `VADAL.AI · HR SOFTWARE FOR THE WHOLE WORKFORCE` | the market wedge in plain words, not "AI-native employee experience" |
| Headline | **Nine HR products.** ⏎ **One AI that acts.** | a deliberate break; `clamp(32px, 4.4vw, 58px)` |
| Sub | Listens to every employee, desk and frontline. Then does the work itself. | one line at 1440 (`max-w 64ch`, 12 words) |
| **The chat window** — *Vadal AI* | the right half of the hero, in the one form everyone reads as "an AI" in half a second: a small chat window — and in it, **a conversation that plays**. A prompt types itself into the composer and sends; the assistant thinks, then its answer streams in; a beat; the next. Nine exchanges, each a real record and each a door to its product. The composer is real | the X, Y, Z of what the AI can do, watched as a chat rather than read as a list |
| Card header | `oliandhue · 12,480 people · 52 AI features live` · Live | the proof strip, 40px; the AI line under the grid is gone |
| Grid | nine tiles at 88px | all above the fold at 1440×900 — last tile ends at 742 of 835 |
| CTA | **Start the tour ↓** · Skip for now | in frame (bottom at 790) |
| Dock | collapses to its mark on this route | it sat on tile 09 |

**The hero is two columns at `lg`** — `minmax(0,1fr) minmax(0,420px)`, 48px gap, 1080px max —
story on the left (eyebrow, headline at `clamp(34px, 3.7vw, 56px)`, one-line sub at 38ch, the
CTAs), the chat window on the right, the nine-tile grid full-width beneath. At 1440×900 the last
tile ends at 807 of 835. The **Present** pill moves to the foot of the spine.

**The chat window, in detail.** 400 × 300 — no taller than the story beside it (286px) — 22px
radius, `--card` on a `--line` hairline with a deep soft shadow. Three parts:

| Part | Spec |
|---|---|
| **Header** (48px) | 32px `ai-grad` disc with the SparkMark (breathing; spinning while an answer streams) and a tiny **AI** tag on its corner; *Vadal* 14px/600; `● ONLINE` in `--success`; right: minimise · expand · close (32px, 44px on touch). Minimise/close collapse to a launcher pill; expand opens the real assistant |
| **Body** (flex, bottom-anchored) | `--ai-surface` wash with the breathing radial glow. The **user bubble** on the right: brand violet, white 13px, 16px radius with the bottom-right corner tightened, pops in (`ai-card-in`). The **assistant bubble** on the left with a 24px mark: `--card`, bottom-left tightened; three `ai-dot`s while thinking, then the answer typed at 58 cps with the system caret; when it settles, *Open Pulse →* in `--ai-accent` appears beneath. Nine **dots** at the foot (4px; the current stretched to 16px in accent). The bubble and every dot are doors |
| **Composer** (56px) | one row: the input, mic, `btn-ai` send. While the script plays, the prompt **types itself here** at 34 cps over the empty input; the send button bursts (`ai-burst`) as it goes. Focus the input and the script yields — it is a real input, and sending opens the real assistant with what you typed |

**Timing per exchange:** type (q ÷ 34 cps + 0.45s) → sent 0.42s → thinking 0.8s → answer (a ÷ 58 cps
+ 0.5s) → hold 2.2s → next. About 6s each, ~55s a lap, loops. **Hover holds it**; so does focusing
the composer. Reduced motion: one exchange, still.

**The nine exchanges** (prompt → answer → product): *How is the team feeling? → I read 8,486
responses. Net sentiment is +52, up 4 this quarter.* → Pulse · *Who might leave? → A. Mehta — 92%
flight risk, no 1:1 in six weeks. I opened CASE-118; Neha Rao owns it.* → Cases · *Write up the
onboarding win for LinkedIn. → Drafted in your voice. Policy check passed — it's your tap to post.*
→ Amplify · *Ask Line 2 about the new equipment. → Three questions, sent by push at 06:10 — the
hour they actually answer.* → Pulse · *How many paid leaves do I have? → 18 paid leaves a year —
cited from your leave policy.* → Broadcast · *What should I do this week? → Schedule 1:1 with Rohan
Mehta. His sentiment is down 14 pts.* → Managers · *Any burnout signals? → Engineering, down 6 pts.
I proposed Burnout reset — Engineering — +3.4 predicted lift.* → Broadcast · *Turn the POSH policy
into a course. → Done — 4 lessons, 8 minutes, built from the document.* → Grow · *I'm not sleeping
well. → I hear you. Dr. Anjali Menon has today, 6:00 PM — context carried, nothing repeated.* → Help.

On this route the global launcher pill is icon-only at `lg` and hidden below it — the window is
the launcher there, and the pill sat on its send button.

## 10 · The nine as windows

The grid is no longer a table under a gradient block. Nine **cards** in a 3×3 with 12px gaps, and
each carries a **live fragment of its product** at stamp size — the thing you would see inside it.
Monochrome and violet; colour only where it means something.

| Product | The fragment, right-aligned in the card |
|---|---|
| Pulse | engagement sparkline (14 points, brand) · **82** |
| Connect | three reactor avatars stacked · ♥ **312** |
| Amplify | reach sparkline in `--success` · **204** |
| Thrive | six day-bars of the challenge; days that cleared the target in brand, the rest muted |
| Broadcast | *reach* **91%** over a brand progress bar |
| Grow | seven minute-bars for the week; quiet days as hairlines |
| Help | the counsellor's avatar · *6:00 PM · today* |
| Managers | the at-risk report's sentiment sparkline in `--danger` · **58** |
| Cases | the SLA ring in `--warning` · **1d** |

**Card:** `--card` on `--line`, 16px radius, 86px min, a 1px shadow; left the 36px icon chip,
name (14.5/600) over descriptor (11.5 `--faint`), the lock glyph beside the name when gated; a ghost
index — `01` at 44px/800, `--ink` at 5% — sitting in the bottom-right corner behind the fragment.
**Hover / focus:** the card lifts 2px, its edge goes violet at 40%, a violet-tinted shadow deepens
beneath it, the chip fills lavender with a violet icon, and the arrow slides in beside the name.
Below `sm` the cards stack one-up and the fragments hide; they are for a glance, not a thumb.

**The label strip** replaces the gradient block: a pill on a hairline — a 2px Aurora rule across
its top — with the mark, *oliandhue · 12,480 people · 52 AI features live*, and `● LIVE` in
`--success`. The Aurora is a line, and the proof is the words.

**Present** is now a 36px round icon at the spine's foot with a hover label; as a pill it landed on
the Grow card once the grid grew to full width.

## 11 · Figma

Scenes 01, 03 (locked variant for employee), 09 (ask box asked / cited / refused) and 11 at
1440 × 900 and 375; the spine in three dot states with the hover pill; the mobile hairline.
