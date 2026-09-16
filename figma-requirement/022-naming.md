# 022 · Naming — the one-word module names

**Status:** applied in code · display names only, routes unchanged · source: *Vadal Module Name
Replacement Table* (16 Sep 2026)

---

## 1 · The map

The founders' table renames sixteen *modules* to one word each. Our product is organised as
sections and pillars, so each row was mapped to the surface it describes. Where a new name
collided with an existing one, the dashboard moved rather than the survey product.

| Section (old) | **Section (new)** | Route (unchanged) | From the table |
|---|---|---|---|
| Home | **Home** (Journey was applied, then reverted on the founders' call — the home screen is the shell, not a product) | `/product/home` | Employee Experience |
| Feed | **Social** | `/product/feed` | Employee Communication |
| Pulse — the health-score dashboard | **Insight** | `/product` | Decision Intelligence Copilot |
| Surveys | **Pulse** | `/product/surveys` | Engagement Surveys |
| Recognition | **Kudos** | `/product/recognition` | Recognition & Rewards |
| Thrive | **iThrive** | `/product/thrive` | Employee Wellbeing & Culture |
| One-to-One Help | **SmartWork** | `/product/help` | AI Employee Chat |
| Grow | **iLearn** | `/product/grow` | Mobile & E-Learning |
| Cases | **Flow** | `/product/cases` | Case Management, Tasks & Workflow |
| the assistant (Copilot) | **Nudge** | the dock, on every screen | AI Workforce Assistant |

**Unchanged:** Amplify, Campaigns, Knowledge, Manager hub, Analytics, Sentiment, Always-on
listening, Settings — the table has no row for them. The **Listen** group already *is* the
Continuous Employee Listening module, so its name stands; the nav group *Intelligence* became
**Insight** to match its dashboard.

**No screen yet:** Onboard (Pre- & Onboarding), Alumni, Link (Integrations), Trust (Security &
Compliance), Launch (Implementation). Listed here so the names are reserved, not invented into pages.

## 2 · Where it changed

Nav rail and mobile sheet · command palette · access keys (`SECTION_ACCESS`, `scopeFor`) · every
page's `active` and breadcrumb · the top-bar domain roots (*People intelligence* → *Insight*,
*Listening* → *Listen*) · hub headings (Flow, Social, Pulse, Kudos, Insight) · in-product copy that
names a section (*Back to Insight*, *review them in Kudos*, *in iLearn*, *Apply from Home*) ·
the Get Started tour — pillar names, section chips, "Done when you open …" rows, the nine tiles and
the stage's replies · the assistant's own name in the dock and the chat window.

## 3 · The tour's nine, renamed

01 **Listen** · 02 **Social** · 03 Amplify · 04 **iThrive** · 05 Broadcast · 06 **iLearn** ·
07 **SmartWork** · 08 Managers · 09 **Flow** — and the layer through them all, **Nudge**.

## 4 · Routes

URLs keep their old slugs (`/product/recognition` still opens Kudos). Renaming them is a
separate pass with redirects from every old path, once the names have settled.

## 5 · Figma

Every text layer that names a section, in the rail, the tour and the page headers; the assistant's
name wherever *Vadal AI* appears as a product name (the brand mark itself is unchanged).
