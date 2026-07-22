# Vadal — product brief for the website build

> **Purpose of this file.** This folder will be moved into its own repo to build the
> **vadal.ai marketing website**. A fresh Claude Code session will start here with no memory
> of how Vadal was built. This document gives that session everything it needs to understand
> the product, the market, the brand, and the website requirements. Read this first, then
> [`design.md`](./design.md) for the visual system, then the requirement spreadsheets in
> [`Docs/`](./Docs).

---

## 1. What Vadal is

**Vadal (vadal.ai)** is an **employee engagement & experience platform** — an "engagement
operating system" for medium-to-large enterprises. It connects an entire workforce
(especially **deskless / non-desk / frontline employees**) through a **mobile-first employee
app** for communication, training, culture, onboarding and feedback — and gives leaders the
**analytics and AI intelligence** to act on what they learn.

The strategic spine of the product is one line:

> **Score → Insight → Action → Impact** — don't just *measure* engagement, *drive* it
> (through campaigns, recognition, and manager actions).

Two ways to say what it is, depending on audience:

- **To the buyer (HR / Comms / People leaders):** a complete engagement OS that replaces a
  stack of point tools (comms tool + survey tool + LMS + recognition + analytics).
- **To the employee:** one warm, human app they actually open every day — *"Human pulse ×
  Daily ritual."* Keep companies human at scale.

**Client / who's building it:** Oli&Hue (design + front-end). Product/founder lead:
**Pradeep**. Decision-maker/advisor: **Raghav**.

---

## 2. Who it's for

- **Buyers:** decision-makers in **HR, Internal Communications, L&D/Training, and Operations**
  at **medium-to-large organizations** (≈1,000–50,000 employees), including Indian enterprises
  and GCCs (Global Capability Centers), plus global enterprises.
- **End users:** the whole workforce, with a deliberate focus on the **non-desk / frontline
  workforce** — retail, facilities management, hospitality, manufacturing, logistics, finance —
  people who don't sit at a corporate email all day but always have a phone.
- **Industries called out in content:** retail, facilities management, finance, hospitality.

---

## 3. Positioning & the competitive frame

Vadal's bet: **competitors are narrow specialists; Vadal wins by going horizontal** (one
platform across the whole engagement lifecycle).

| Competitor | Their strength | Vadal's angle |
|---|---|---|
| **Actimo** (a Kahoot! company) | Activation / campaigns / mobile employee app | **The named primary competitor / content benchmark.** Vadal matches the mobile-first comms+training app, then goes further with analytics + AI. |
| **CultureMonkey** | Survey analytics / sentiment | Vadal folds listening in as one pillar, not the whole product. |
| **Amber** | Conversational AI / attrition ("why people leave") | Vadal has its own AI layer (see §6). |
| **Simpplr** | Content / knowledge intranet | Benchmark for the content/knowledge layer. |

> ⚠️ **Important context about the requirement docs in [`Docs/`](./Docs).** Pradeep's website
> content (Homepage, Solutions, Product Pages, Sitemap, Navigation) was **templated from
> Actimo's live website** as a structural starting point. That means the docs contain
> **Actimo's** real customers (Compass Group, HI3G, Max Hamburger, Lagkagehuset, BoConcept,
> HTH/Nobia, Skånes Djurpark, 1:1 Diet…), **Actimo's** office addresses (Copenhagen, Barcelona),
> **Actimo's** parent-company consent text ("Kahoot! and its Group Companies"), and **Actimo's**
> headline metrics (300% / 3X / 40% / 55%). **These are placeholders.** Use the *structure,
> section logic, and copy patterns*, but **replace all proof, names, addresses, and legal text
> with Vadal's own** (or clearly-marked sample data) before anything ships.

**Reference competitor to study:** **Actimo — https://www.actimo.com/**. Its homepage is the
closest analog to the site we're building (mobile-first employee app, deskless workforce,
solution-area cards, alternating feature blocks, metrics, video case studies, demo form).
Beat it on craft, warmth, and the intelligence story.

---

## 4. The product capabilities (the 7 pillars)

These are the real product pillars. The website's six "solution areas" (§7) are the
marketing-facing slice of them.

1. **Listening & Feedback** — pulse surveys, eNPS, always-on listening, sentiment.
2. **Engagement & Recognition** — recognition + rewards marketplace, campaigns, communities.
3. **Communication & Campaigns** — targeted internal comms, social wall/feed, push/SMS, chat.
4. **Analytics / Insights / Reporting** — *the intended primary differentiator*: dashboards,
   heatmaps, drill-downs, benchmarks, engagement↔performance correlation.
5. **Manager Enablement** — action planning, manager-level insight, coaching.
6. **Case Management** — feedback → tracked, SLA'd HR cases.
7. **Mobile & Platform Experience** — the branded employee app, SSO, HRMS integrations.

**Roadmap (3 phases):**
- **P1 (sellable GTM platform / Actimo parity):** core surveys, recognition + marketplace,
  dashboards + heatmaps, manager action planning, basic case mgmt, SSO + HRMS + mobile,
  campaign builder, push.
- **P2 (differentiation):** coaching, case analytics, benchmarks, advanced reporting.
- **P3 (culture intelligence):** predictive engagement, sentiment AI, attrition risk,
  engagement↔performance correlation.

---

## 5. What we've already designed & built (the product app)

There is a working **product front-end** (the in-app experience, separate from this marketing
site). It's a Next.js web app in the **Lumen** style with the **Aurora** AI language. **The
marketing website should showcase real screenshots of these screens** rather than generic
stock UI. Sections that exist, fully designed (also built as Figma screens):

- **Home** — the daily ritual: greeting + mood check, "My day / up next," quick poll,
  recognition, communities, an **Ask AI** card, and a feed widget.
- **Feed** — social wall: composer, rich post cards (updates, polls, recognition, events,
  media), reactions, comments, a right rail, and an AI "catch me up" digest.
- **Pulse** — engagement scores, drivers, period comparison, drill-down drawers
  (person/manager), org-wide vs team scope.
- **Analytics** — an explorer: save views, period compare, CSV export, drillable heatmap,
  deep-link-able slices.
- **Surveys** — survey builder + manage/track + results.
- **Sentiment** — org sentiment analytics with anonymity min-N gating.
- **Listening** — always-on listening hub by topic.

There is also a **design system** (`@vadal/design-system`) with real tokens and components —
see [`design.md`](./design.md). The website can and should reuse those tokens for 1:1 brand
fidelity.

**Demo tenant:** screenshots use **"oliandhue"** as the example customer org.

---

## 6. The AI layer — "Vadal AI" (Aurora)

AI is a first-class part of the product and a key differentiator to feature on the site.

- **Aurora** is the visual language for intelligence: a teal→blue→violet gradient + the
  **SparkMark** (a 4-point spark logo).
- **Core principle:** *brand violet = the user's actions (CTAs); the Aurora gradient = "this
  is intelligence."* Never mix the two meanings. (This holds for the website too — see
  `design.md`.)
- Capabilities already designed: an AI dock that streams answers, an "Ask Vadal" command bar,
  contextual follow-ups, select-text-to-ask, AI briefings, "explain this" on charts.
- Marketing angle: "real-time insights for everyone," "stop guessing, start knowing,"
  proactive nudges, an AI co-pilot for managers and employees.

---

## 7. Website requirements (from Pradeep's docs)

The source of truth for site structure/content is the five spreadsheets in [`Docs/`](./Docs):
`Master Sitemap.xlsx`, `Navigation Structure.xlsx`, `Homepage Content.xlsx`,
`Product Pages.xlsx`, `Solutions.xlsx`. Summary below.

### 7.1 The six solution areas (the marketing IA)
1. **Employee Communication** — connect the whole workforce; two-way comms; personalized news
   feed; Social Wall; SMS + push; "communication your people actually read."
2. **Mobile & E-learning** — mobile-first micro-learning, training, guides; gamification;
   blended learning; LMS; track compliance & progress.
3. **Culture & Employee Wellbeing** — initiatives/campaigns, bring values to life, community,
   pulse surveys & eNPS, "hear your employees out."
4. **Pre- & Onboarding** — customizable, automated onboarding flows; "right from the start";
   set up for success, make it automatic, include your team, sync to perfection.
5. **Employee Experience & Employee Journey** — 360° engagement across the whole journey
   (pre-board → offboard); customizable, all-in-one, on-brand.
6. **Productivity & Operations / Tasks** — task creation→completion, accountability,
   recurring tasks, health & safety procedures, analytics for ops.

### 7.2 Homepage section order (14 blocks in the doc)
1. **Hero** — H1 *"A better way to reach and engage employees"*, subhead about a mobile-first
   platform for non-desk employees, **Book demo** (primary) + **Watch video** (secondary),
   trust line ("Trusted by 200+ brands · 1M+ employees · 80+ countries"), customer logo strip.
2. **Key areas / solutions overview** — the six solution cards (§7.1).
3. **Communication feature** — alternating image/text block.
4. **Mobile learning feature** — alternating image/text block.
5. **Insights / productivity feature** — *"Stop guessing, start knowing"* (the analytics/AI hook).
6. **Employee app overview** — *"a next-level employee app,"* 360° engagement, custom look & feel.
7. **Business results** — metric band (replace Actimo's numbers).
8. **Customer stories teaser** — video case studies (replace with Vadal's).
9. **Enterprise services** — Secure · Personal · Tailored · Integrated.
10. **Chat feature** — secure on-the-go instant messaging.
11. **Footer + demo links** — solutions, resources, company, locations, legal (replace addresses).
12. **Campaign / event form** *(optional/conditional)*.
13. **Event signup form** *(optional/conditional)*.

### 7.3 Navigation
- **Header:** Logo · **Solutions** (mega-menu of the 6 areas) · **Platform** · **Customers** ·
  **Resources** (Blog, Guides/Downloads, Webinars, Integrations, Helpdesk) · **About** · **Login**
  · **Book demo** (primary CTA, persistent).
- **Primary CTA everywhere:** **Book demo** (a.k.a. "Book a free demo"). **Secondary:** *Learn
  more*, *Watch video*.
- **Footer:** Solutions list · Company (About, Careers, Contact, Partners, Security, Locations) ·
  Resources · Legal (Privacy, Terms, GDPR).

### 7.4 Full page inventory (~53 pages, see `Master Sitemap.xlsx`)
Home · Platform · 6 Solution pages · feature detail pages (Employee Communication, Employee
Productivity, Chat) · Customers hub + ~7 customer stories · Resources (Blog + posts, Downloads/
guides/ebooks, Webinars, Integrations) · Demo · About · Careers · Contact · Partners · Security ·
Locations · Legal (Privacy, Terms, GDPR) · campaign/landing pages · external Helpdesk.

> For P1 of the website, prioritize: **Home, the 6 Solution pages, Platform, Customers (hub +
> 1–2 stories), Demo, About, Contact, and the legal pages.** Resources/blog can be a lighter
> templated hub first.

### 7.5 Voice & tone (from the content)
Encouraging, benefit-led, human, confident-without-arrogance. Patterns: action verbs ("Stop
guessing, start knowing"), accessibility framing ("any time, any place"), collaborative framing
("connect your entire workforce," "let them be part of the conversation"). Outcomes over
features. See `design.md` §Voice for how this maps onto our brand.

---

## 8. Assets in this folder
- [`design.md`](./design.md) — the full brand & visual system (colors, type, components, motion,
  references). **Read it before designing anything.**
- [`assets/brand/`](./assets/brand) — canonical brand marks copied in so this folder is
  self-contained:
  - `signal-lockup.svg`, `signal-mark.svg`, `signal-icon.svg` — the Vadal "Signal" identity.
  - `lockup-light.svg`, `lockup-dark.svg` — light/dark lockups.
  - `oliandhue-*.svg` — the demo-tenant logo (only for product screenshots; not Vadal's brand).
- [`Docs/`](./Docs) — Pradeep's website requirement spreadsheets (the content source of truth).

## 9. Build notes for the new session
- **Stack suggestion:** Next.js (App Router) + Tailwind, reusing the **Vadal design tokens**
  in `design.md` (port them as CSS variables / a Tailwind theme). This keeps the marketing site
  pixel-consistent with the product.
- **Showcase the real product** (Home/Feed/Pulse/Analytics screenshots), not stock UI.
- **Replace all Actimo-derived proof/names/addresses/legal text** with Vadal's real or clearly
  sample content (see §3 warning).
- **Honor the type floor** (14px min content / 16px body) and the **violet=action /
  Aurora=intelligence** rule everywhere.
