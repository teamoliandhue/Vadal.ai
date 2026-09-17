# 042 · Link · Trust · Launch — the platform surfaces

**Status:** built in code · new rail group **Platform** (HR admins and up) · `/product/link` ·
`/product/trust` · `/product/launch` · source: roadmap v3; names from the founders' table (spec 022):
Link = Enterprise Integrations, Trust = Security & Compliance, Launch = Implementation & Customer Success

All three pages share the Onboard/Alumni layout: max width 1120, eyebrow *PLATFORM*, a 26–34px H1, a
one-line description, and four stat tiles (2×2 on a phone).

---

## 1 · Link (cable icon)

*The systems Vadal reads from and sends to — and, for each one, exactly what it shares and what it never
touches.*

- **Tiles:** Connected *7* (*of 10 available*) · People synced *12,480* · Signing in with SSO *10,268*
  · Needs a look *2*.
- **What needs a look:** tinted rows (warning 8% or purple 8% for information) with an icon · title · a
  sentence on **what it breaks** · actions **Open {integration}** (opens its drawer) and **Hide**.
  - *38 people have no manager in Darwinbox* — they don't show up in any manager's team view.
  - *A Hindi WhatsApp template is waiting for approval* — night shift reminders go out in English until
    it's approved.
  - *212 frontline people have no work email* (info) — they sign in with a code, nothing to fix.
- **Integrations**, grouped (People data · Sign-in · Messaging · Calendar · Rewards · Data out) as 2-column
  cards: emoji tile · name + status badge (*Connected* success · *Needs attention* warning · *Available*
  neutral · *Requested*) · purpose · a direction icon (*Reads into Vadal* / *Sends from Vadal* / *Both ways*)
  · *Last sync Today 07:10*.
- **Drawer:** header with the same facts plus the schedule · warning strip if there's an issue ·
  two boxes, **What Vadal reads** (green checks) and **Never touches** (red crosses, e.g. *Salary or bank
  details · Performance ratings · Health or leave reasons · Government IDs*) · **Recent syncs** (check or
  warning · *Today 07:10 · 12,480 read · 14 changed · 2 joiners · 38 without a manager*).
  - An available integration gets **Request {name}** (brand). Connecting is a request to the Vadal team,
    never a toggle.
  - A connected one says: *To change what this shares or disconnect it, talk to your Vadal success manager —
    people data changes are made together, not from a toggle.*
- **API and webhooks:** keys with a masked suffix (*••••9f2c*), scope, created and last used · **Request a
  key** · webhooks shown in mono (`leaver.recorded → Exit interviews programme · Delivering`).

Settings → Integrations now just points here: *Integrations now live in Link…* **Open Link**.

## 2 · Trust (shield icon)

*How employee data is protected, who can see what, and a record of every sensitive action.*

- **Posture tiles:** Where data lives *India (Mumbai)* · Sign-in *SSO + one-time codes* · Anonymity
  threshold *5 people* · Retention *24 months*, each with a faint note.
- **Compliance:** *What the product does today, and what is planned — nothing here is a certificate we
  don't hold.* Four cards: *India DPDP Act, 2023* and *GDPR* → **Controls built** (success), *SOC 2 Type
  II* and *ISO/IEC 27001* → **Audit planned** (neutral), each with 2–3 faint check lines. Footnote on audit
  dates.
- **Who can see what:** a table of every rail section × Employee / Manager / HR admin — green check,
  *Own team* pill (only for Insight, Sentiment, Campaigns, Onboard, Manager hub), or a faint dash. It's
  generated from the real access rules. It scrolls horizontally on a phone (min width 480). Footnote: *fewer
  than 5 responses are hidden — for every role, including admins.*
- **Audit log** (wide column): *Kept 12 months · can't be edited or deleted from the product* · **Download
  CSV** (secondary, download icon — downloads the filtered rows) · filter chips *All · Access · Data ·
  Settings · AI · Moderation* (selected = purple fill) · rows *time · **who** — what · type*.
- **Data requests** (narrow column): *Answered within 30 days* · soft cards: type + badge (*25 days left*,
  warning at 7 or fewer, *Done* success) · who and when received · **Mark done**.
- **What the AI is held to:** five rules with where each one is enforced (e.g. *Nothing posts publicly
  without a person's tap — Amplify*).

## 3 · Launch (rocket icon)

*Live since August 2025. What's in flight now, who owns each part, and how use has grown since day one.*

- **Phase strip:** 5 cards on `sm`+. On a phone it's 2 columns, with the current phase spanning both.
  *1 · Jul 2025 · Set up · Done* … *5 · Jul – Oct 2026 · Expand · 1 of 5 done*. The current phase gets a
  `--purple` border and `--lav` fill.
- **Now: Expand** (wide card) + a brand date badge + goal. Steps: status icon (check / purple dot /
  amber warning / empty circle) · title · *owner · note* · badge (*Done · In progress · Blocked · Next*).
- **Ready for night shift to go live?** (soft box): four lines with check or empty circle and where each
  lives. The first two are read live from the product (Translation add-on, onboarding programme). *2 of 4
  ready — the first two are read live from your settings.*
- **Earlier phases** disclosure → one small card per phase with its steps.
- **Your success team:** avatar, name, *Customer success, Vadal* · calendar icon + next business review
  · open requests with a status badge each.
- **Training:** soft cards with the session, when, seats · **Book a seat** → *Booked*.
- **Use since launch:** a line chart of weekly active (`--viz-1`) and checked in (`--viz-2`) as a share of
  the people invited at the time, Aug 2025 – Sep 2026. It has a legend, a Chart/Table toggle, and one
  sentence reading the trend.
