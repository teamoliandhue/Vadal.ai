# 053 — Listen: coverage, outcomes, and whose words

**Route:** `/product/listen` (was `/product/listening`) · **Code:** `apps/product/src/app/product/listen/ListeningHub.tsx` · **Data:** `apps/product/src/lib/listening.ts`
**Status:** Built · needs Figma

## Why
The oldest screen in the product (21 June): a channel-toggle list, a topic table and a live ticker. It answered "what are people saying?" and stopped, which leaves the three questions a listening product actually has to answer unanswered — who we never hear from, what happened to a signal, and in whose language it arrived.

It also carried the wrong name. The taxonomy calls this module **Listen** (Always-On Listening · Lifecycle Listening · Real-Time Signals · Voice Analytics), so the section, the route and the nav group are renamed: the group is now **Engagement & listening**, holding Pulse, Sentiment and Listen.

## Three views
Header: eyebrow **Engagement & listening** · H1 **Listen** · "38 signals today · we heard from 47% of people this month · 7 channels open", and **Ask Nudge who we're missing**.

### Now — real-time signals, with outcomes
- Lead card (Aurora hairline): **Acted on 64%** of flagged signals, **Waiting 3** that nobody picked up, and Nudge's read of what is rising and on which channel.
- **Signals, and what became of them.** Each row: a tinted speech icon by tone, the quote, then source · team · topic · language · time — and on the right, the outcome in words: *Became CASE-204 · Meera Pillai owns it*, *Asked in a pulse · Q3 Engagement Pulse*, *Watching · fourth rota comment this week*, or *Nothing yet · no one has picked this up*. Filter: All / Acted on / Waiting.
- Footer: signals carry a team, never a name; cuts under five people are not shown at all.

### Coverage — who we hear from, and who we don't
- **Who we heard from this month**: 3,296 of 6,970 people. One bar per team, sorted worst first, amber under 40%, each with the reason: "Asked at 09:00, when the shift is asleep", "On the road; SMS is the only channel that reaches them". Chart / Table toggle.
- Actions: **Ask night shift at their hour**, and a link into Pulse's response tracking.
- **Where we listen** — the eight channels, each stating who it can actually reach ("Desk teams, opted-in channels only", "Frontline and night shift") and its 30-day volume, with a switch.
- **The moments we ask at** — lifecycle listening: before day one, day 7, day 30, day 90, stay conversation, new manager (off), leaving, sixty days after. Each shows its trigger, channel and answer rate, with a switch.

### Voice — the words, the tone, the language
- **The words people use**: their phrases, not our categories, sized by mentions and coloured warm/complaint, with a table view and a legend.
- **In whose words**: 42% of what people write is not in English — English, Hindi, Kannada, Tamil, Marathi with shares. "Every signal is read in the language it was written in."
- **The tone of it**: one diverging bar, with a link into Sentiment for the themes.

## Craft notes
- Toggles keep a 24px track inside a 44px target — the old switches were 24px and failed on a phone.
- Colour: viz-1 for warm/positive, viz-2 for complaint/negative, amber only for coverage gaps. Status colours always carry an icon and a word.

## Figma to build
1. Now 1440 — lead card and six signal rows covering all four outcome types.
2. Coverage 1440 — the team bars with reasons, channels, moments.
3. Voice 1440 — phrases, languages, tone.
4. Phone 375 of each tab.
5. Dark mode of Now.
