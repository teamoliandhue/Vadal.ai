# 025 · Communities — groups under Social

**Status:** built in code · `/product/feed/groups` and `/product/feed/groups/[id]` · source: the 16 Sep meeting ("groups, not just channels — project communities and interest communities; create, publish, join; not a Jira")

---

## 1 · What it is

Channels are topics the company defines. A **community** is a room people choose to be in.

| kind | what it is | cover | badge |
|------|------------|-------|-------|
| **Project** | a room around a piece of work; it wraps when the work does | `--lav` | `brand` · *Project* |
| **Interest** | a standing circle around something people share | `--ai-surface` | `info` · *Interest* |

It carries the **conversation about the work, never the tasks** — no boards, no assignees, no due
dates. The only time-shaped thing on a project room is one line: *Wraps in October*.

Lifecycle: **draft → published**. Open rooms are joined in one tap; closed rooms are *asked* to
join (🔒 beside the name). Members leave from a *Joined ▾* menu.

## 2 · Social gets two tabs

A strip at the top of both screens — **Feed · Communities `n`** — 44px tall on touch, 40px at `lg`,
a 2px violet underline on the current one, the count of rooms you are in as a soft pill.
The top-bar breadcrumb reads *My space › Communities*.

## 3 · The hub

Top to bottom, 1100px max:

1. **Header** — *Communities* (24/700) · *Project rooms and interest circles. Find your people.* ·
   **+ New community** (brand, right).
2. **Suggested for you** — an Aurora card (`--ai-surface`, `--ai-border`, the spark). Up to three
   rows: emoji tile · name · *why* in one line ("Three people on your team are members.") · Join.
   Only rooms you are not in; hidden while searching or on *Yours*. Stacks to one column below `md`.
3. **Controls** — two segmented pills, *Discover / Yours · n* and *All / Projects / Interests*,
   then a search field (260px, right; full width on a phone).
4. **Grid** — 1 / 2 / 3 columns (`sm` / `xl`), 16px gap.

### The card

`rounded-[22px]`, `--card`, 1px `--line`, `card-lift` on hover, a staggered `rise` on entry (40ms).

- A **76px tinted band** (kind colour). Top-right: the kind badge, and *Draft* (warning) when it is one.
- A **56px emoji tile** (`rounded-2xl`, `--card`, 1px line, soft shadow) sitting half over the band's
  lower edge.
- Name 16/700 (+ 🔒 when closed) · description 14 `--muted`, two lines, always two lines tall.
- Foot: a stack of four 24px faces · `29 · Active today` in 12 `--faint` · the **join control**.

**Join control states** — *Join* / *Ask to join* (violet, white) · *Joined ✓* (`--lav`, violet) ·
*Requested ⏱* (soft; tap withdraws) · *Owner* (soft, inert). 44px tall on touch, 34px at `lg`.

The whole card opens the room through a stretched link on the name; the join control is a real
button beside it, never inside the link.

### Empty states

Dashed `--line` box, the spark, one line and a way forward: *Nothing matches "…"* ·
*You are not in any communities yet* · *No communities of this kind yet* — each with *New community*.

## 4 · New community (drawer, 440px)

1. **What kind of room?** — two choice cards, *Project* / *Interest*, each with a one-line hint.
2. **Name** — the chosen emoji in a 46px tile beside the field; a row of 16 emoji below
   (44px targets on touch, 36px at `lg`).
3. **What is it for?** — a 4-row textarea; **✦ Draft with Nudge** (Aurora text button) writes it
   from the name and the kind.
4. **When does it wrap?** — project only, optional, free text.
5. **Who can join?** — *Anyone at the company* (globe) / *People ask to join* (lock), as rows.
6. Foot: **Save draft** (secondary) · **Publish** (brand). Both disabled until there is a name
   (3+) and a description (10+).

Saving lands you on *Yours* with the new card first.

## 5 · The community page

Two panes from `xl`: a 680px stream and a 320px rail. Below that, one column; the rail's content
is reachable through the tabs.

**The door** (header card) — a 92px tinted band · a 72px emoji tile riding its lower edge · to
its right the join control (or **Publish** for your own draft) · name 24/700 with the kind badge
(and *Draft · only you can see it*) · description 15 · a meta line: faces · *113 members* ·
*Active today* · *Wraps in October* · then the tabs **Posts · Members · n · About**.

**Posts**
- Member: the feed composer in community mode — a fixed violet pill with the room's emoji and
  name where the channel picker would be; placeholder *Post to {name}…*.
- Not a member of an open room: a `--lav` strip — *Join to post and to see this room in your
  feed.* + Join. The posts below stay readable.
- Not a member of a closed room: a dashed box with a lock — *Posts are for members*.
- Posts are the standard post card. A room's pinned post pins **inside the room only**.

**Rail** — *What's happening here* (Aurora: a one-line count + *Ask Nudge to catch me up*) ·
*About* (the paragraph, open/closed, members, wrap date, #tags, who started it) · *Members*
(one column in the rail, two on the Members tab).

**Not found** — a room made on another device: the spark, *This community is not here*, a link back.

## 6 · In the company feed

- A post made in a community shows a **violet chip with the room's emoji and name** where the
  channel chip sits; the chip opens the room.
- You only see community posts from rooms **you are in**. Leaving removes them from your stream.
- The rail gains **Your communities** directly under *Catch me up*: up to five rows — emoji tile,
  name, `14 new` (or *Draft*) — and *Browse all*.
- ⌘K gains *Communities*.

## 7 · Figma

Hub at 1440 and 375 (Discover, Yours, a search with no results) · the card in all four join
states × two kinds + draft · the drawer (empty, filled, project variant) · the community page
as member / visitor of an open room / visitor of a closed room / owner of a draft · the feed
post with a community chip · the rail block. Light and dark.
