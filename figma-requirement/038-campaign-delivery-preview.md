# 038 · Campaigns — delivery preview

**Status:** built in code · Campaign builder drawer (`/product/campaigns`) · source: roadmap carry-over
("delivery previews in the Campaign builder") · AI: per-recipient localisation, delivery optimisation

Before anything is sent, the builder shows **how the message will read** for different people and
**when it will land** for the chosen audience.

---

## 1 · First message

A new field after Channels: **First message** (4-row textarea, 16px on touch) with **Draft for this
objective** on the right of its label (Aurora text). The builder opens with a first draft for the objective
— written the way first drafts usually are, so the preview has something to improve.

## 2 · Delivery preview

An Aurora box under the message (only when there is text): spark · **DELIVERY PREVIEW**.

### How it reads

A segmented control — **Desk · Frontline · हिन्दी** (default Frontline).
- **Desk:** the message as written · *Reads at grade 16.*
- **Frontline:** the plain-language version · *Grade 16 → 9. Plainer words and shorter sentences; the
  meaning is unchanged.* (or *Already plain — grade 7.*)
- **हिन्दी:** *A new message is translated when the translation provider is connected. Seeded posts are
  translated in this demo — see Social.*

Example — *"Commencing Monday, Wednesdays will be meeting-free across the organisation in order to
facilitate focused work. Prior to scheduling a meeting…"* becomes *"Starting Monday, Wednesdays will be
meeting-free across the company to help focused work. Before scheduling a meeting on a Wednesday, check
if it can be moved to Tuesday or Thursday. Managers will check in with their teams after the first week
to find out what more support is needed."*

### When it lands · {audience}

- A **Safety-critical** switch. On: an amber line — *Critical sends ignore quiet hours and the weekly
  limit. Use it for safety, not for reminders.*
- Send windows, largest first: `07:00` · *WhatsApp* · a small `--viz-1` bar · *12 people*.
- Held back, in amber with an icon: *5 held back — already had 3 sends this week* / *quiet hours*.
- The plan in one sentence: *Reaching 21 of 24 across 2 windows — biggest is 11 people at 10:00 via
  app. Expected acknowledgement lift ≈ 14%.*

Changing the audience re-plans immediately — *Engineering* lands at 10:00 in the app and Teams;
*Night shift* lands at 07:00 on WhatsApp and SMS.

## 3 · Engine improvements found while building this

The plain-language rewrite used to start sentences in lowercase (*"before scheduling…"*), missed
*commencing*, and only brought a long announcement from grade 16 to 12. It now keeps capitals, knows
more of the usual office phrases (*are required to → must*, *please consider whether → check if*,
*subsequent to → after*), splits long sentences sensibly, and reaches grade 9.

## 4 · Figma

The builder with the preview in each reader view · Engineering vs Night shift windows · the
safety-critical state · 375 width.
