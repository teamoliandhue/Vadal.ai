# 005 · Permissions reconciled to the product brief · team scope · frontline profile

**Status:** built in code · amends [004](./004-role-access-mobile-nav-identity.md).
**Source:** §2 "User Roles & Onboarding" and §9 "Roles & Permissions Summary" of
*Vadal.ai — AI Feature Product Inputs*.
**See it live:** sign in as any of the **six** demo personas at `/auth` — two of them are new.

004 built the access model from our own reading. This aligns it to the brief, adds the
**data-scope** rule the brief specifies but 004 did not model at all, and introduces the brief's
fourth role.

---

## 1 · What moved, and why

| Section | 004 | Now | Because |
|---|---|---|---|
| **Campaigns** | admin only | **manager +** | §9: managers author Broadcast announcements, *team-only* |
| **Surveys** | manager + | **admin only** | §9: "Configure survey templates / integrations — HR Admin only" |
| **Analytics** | manager + | **admin only** | Not in the brief. It is a free-slicing org-wide explorer that cannot be honestly team-scoped, so it is admin-only rather than pretending to filter. Pulse is the manager's view. |
| Pulse, Sentiment, Manager hub | manager + | manager + **own team** | §9: "View team-level Pulse dashboard — Manager: Own team" |
| Cases | admin + | admin + | Unchanged. Not in the brief at all; decision recorded in `lib/access.ts`. |

**Net effect on the manager sidebar:** loses Analytics and Surveys, gains Campaigns.
Employee and admin navigation are unchanged from 004.

---

## 2 · New concept — data scope

004 modelled *access* ("can you open this"). The brief also specifies *scope* ("how much of it do
you see"), which is a different rule and needs its own design language.

Three values: **self · own-team · all**. A manager on Pulse, Sentiment, Manager hub or Campaigns
is pinned to their own team.

### 2.1 The scope notice — new component

Access fails visibly (the restricted screen). **Scope fails invisibly** — the numbers just look
smaller, and a manager comparing notes with an admin could reasonably conclude the product is
broken. So it is stated, at the top of every scoped surface.

`Component / ScopeNotice`
- Full-width, rounded-2xl, `bg-soft`, 1px `border-line`, 16px × 12px padding
- 16px users icon, `text-faint`, top-aligned
- 14px `text-muted` copy: *"Showing **«Team»** only — «what» across other teams is limited to HR admins."*
- The team name is the only bold element
- `role="status"` — it is a state announcement, not a warning; no colour, no icon tint

Live copy today: *"Showing **Design** only — people intelligence across other teams is limited to
HR admins."* (Pulse) and *"…sentiment across other teams…"* (Sentiment).

### 2.2 Scope control — two states

Where an admin gets a dropdown, a scoped manager gets a **static pill**, not a disabled select
and not a one-option dropdown. A control that looks operable but does nothing is worse than no
control.

`Component / ScopeControl` — variants `Mode = Selectable | Pinned`
- **Selectable** (admin): existing rounded-full select, 11 options on Pulse
- **Pinned** (manager): same size and position, `bg-soft`, `border-line`, no chevron, no hover

### 2.3 Org-wide chip

Some cards inside a team-scoped page stay org-wide by nature (business impact, benchmarks).
`Component / OrgWideChip` — pill, `bg-soft`, 12px/600 `text-faint`, label "Org-wide", sits in the
card header action slot.

### 2.4 Campaign builder — restricted audience

A manager opening the campaign builder sees an audience select containing **only their own team**,
plus a helper line beneath it:

> You can run campaigns for **Design**. Company-wide sends are an HR admin action.

12px `text-faint`, 6px below the field. An AI-suggested campaign whose audience is broader than
the manager's team is silently narrowed to their team rather than offered and then rejected.

`Component / CampaignBuilder` — variant `Audience = Full | Team-only`.

---

## 3 · New role — the frontline employee

§2 of the brief defines four roles; §9's table lists three. The fourth is:

> **Frontline employee (field/factory)** — mobile-only, offline-first, larger touch targets,
> voice input, minimal typing.

Every one of those is a **presentation** difference. The permissions are identical to a desk
employee. So it is modelled as a `profile` (`desk` | `frontline`) carried alongside the role, not
as a fifth permission tier — which would have wrongly implied frontline workers see less.

This also means **a frontline *manager* is a real person** (a shift supervisor on a factory floor),
which a single combined enum could not have expressed.

### Two new demo personas — please design against these, not an abstraction

| Persona | Role | Profile | Team |
|---|---|---|---|
| **Ravi Prasad** · Line Operator | employee | frontline | Plant Ops |
| **Sunita Rao** · Shift Supervisor | manager | frontline | Night shift |

### What the frontline profile still needs (not yet built — this is the design ask)

The data model now carries the profile, and the sign-in screen offers both personas, but **the
product looks identical for both**. That is the gap. What the brief asks for:

1. **Larger touch targets** — the 44px floor becomes ~56px for primary actions
2. **Voice input as a first-class affordance** — a mic on every text input, not buried
3. **Minimal typing** — one-tap and choice-based alternatives wherever we currently ask for prose
4. **Offline-first** — every core flow completes with no connection and syncs later, which needs
   queued/pending/synced/failed states designed for each
5. **Mobile-only** — this profile never sees a desktop layout, so the tablet/desktop breakpoints
   need no frontline variant

`Product / Frontline / *` — a parallel set of the core flows at these rules. This is a genuine
design track, not a theme switch, and it is the single largest piece of unbuilt UX in the product.

---

## 4 · Two conflicts the brief needs to resolve

Flagging rather than deciding:

1. **§2 lists four roles, §9 lists three, and neither mentions a super admin.** We have one — the
   Vadal-internal operations role that manages tenants. It sits outside the customer's role model
   and is treated as such, but the brief should say so.
2. **§9's "Moderate content — HR Admin only"** implies a moderation queue, which the brief
   describes in Pillar 2 but which the product does not have yet. No design exists for it.

## 5 · What to draw, in priority order

1. `Component / ScopeNotice`
2. `Component / ScopeControl` — Selectable · Pinned
3. `Component / CampaignBuilder` — Audience Full · Team-only
4. `Component / OrgWideChip`
5. Update the manager Sidebar variant from 004 — remove Analytics and Surveys, add Campaigns
6. `Product / Frontline / *` — the parallel flow set described in §3
