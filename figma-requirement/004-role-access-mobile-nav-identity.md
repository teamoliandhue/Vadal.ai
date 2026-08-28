# 004 · Role-based access, mobile navigation & session identity

**Status:** built in code · Phase 0 of the execution plan (the four criticals from the heuristic audit).
**See it live:** `apps/product` — sign in at `/auth` as any of the four demo personas and walk the
product as each. The four personas are the fastest way to see every state in this spec.

This is a **structural** change: it alters what each role sees on every screen, adds a whole
navigation surface that did not exist, and replaces the placeholder identity everywhere. Figma
needs new variants rather than edits to existing frames.

---

## 1 · Why (context for the design work)

The heuristic evaluation found four defects that this spec closes:

1. Role gated nothing — an employee reached Admin Settings by typing the URL.
2. Confidential HR cases, including a harassment report, were readable by anyone signed in, on a
   screen whose own copy promises restricted visibility.
3. There was **no navigation at all below 1024px**. On a phone you could reach Home and nothing else.
4. The signed-in person never reached the product — it greeted "Priya" whoever you were.

---

## 2 · The role model

Four roles: **Employee · Manager · HR/Workspace admin · Vadal super admin**.

| Section | Employee | Manager | Admin | Super admin |
|---|:--:|:--:|:--:|:--:|
| Home, Feed, Recognition, Knowledge | ● | ● | ● | ● |
| Pulse, Analytics, Sentiment, Surveys, Manager hub | — | ● | ● | ● |
| Always-on listening, Campaigns, Cases, Settings | — | — | ● | ● |

Two consequences the designer needs to draw for:

- **The sidebar is not one component.** Whole nav groups disappear per role. An employee sees
  three groups (My space · Engage · Knowledge) and **no Health card and no Settings item** — the
  rail is roughly a third of its admin height.
- **"Viewing as" only ever scopes down.** An admin can preview the Manager and Employee views;
  a manager can preview Employee; **an employee sees no switch at all** — the control is removed,
  not disabled, because offering a role you cannot have was itself the escalation bug.

### Sidebar variants needed

`Sidebar / Role = Employee | Manager | Admin` — same component, three nav compositions.
Employee and Manager variants omit the Health card. Only Admin has the Settings footer item and
the "Workspace settings / Invite people" block inside the workspace dropdown.

---

## 3 · New screen — Section restricted

When a role opens a section they cannot access, they get a **restricted state inside the normal
shell** (sidebar, top bar and AI dock all still present) rather than a redirect. A silent bounce to
Home reads as "I clicked wrong"; keeping the chrome means the way out is already on screen.

**Layout:** centred column, max-width 512px, 80px top padding.
- 56×56 rounded-2xl square, `bg-soft`, lock icon 24px `text-faint`
- H1 22px bold — "«Section» is restricted"
- Body 16px `text-muted`, max 2 lines
- Primary Button "Back to Home", 24px below

**Two copy variants** — the difference matters, because one is a permission problem and the other
is self-inflicted:

| Variant | When | Copy |
|---|---|---|
| **No access** | Your real role cannot open it | "«Section» holds information limited to «an HR or workspace admin» and above. If you need it for your work, your workspace admin can change your role." |
| **Previewing** | You scoped yourself down with "Viewing as" | "You're previewing the product as «an employee». «Section» is only available to «an HR or workspace admin» and above — switch "Viewing as" back on Home to return to your own access." |

Role phrasing is always the article form: *an employee · a manager · an HR or workspace admin ·
a Vadal super admin*.

Frame name: `Product / States / Section restricted` (2 variants).

---

## 4 · New surface — Mobile navigation (below 1024px)

This is the largest addition. Nothing existed here before.

### 4.1 Bottom tab bar

Fixed to the bottom, full width, `bg-card/95` + backdrop blur, 1px top border `border-line`.
Bottom padding uses `env(safe-area-inset-bottom)` so it clears the iOS home indicator.

- Five equal-width slots: **four destinations + More**
- Each slot is **56px tall minimum** (touch target), icon 22px above a 12px label, centred
- Active slot: icon stroke 2.1, label 600 weight, both in `--client-brand` (falls back to `--purple`)
- Inactive: stroke 1.75, label 500 weight, `text-faint`
- "Always-on listening" is labelled **"Listening"** here — the full label does not fit

**The four destinations are chosen per role**, because on a phone this bar *is* the navigation:

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 |
|---|---|---|---|---|
| Employee | Home | Feed | Recognition | Knowledge |
| Manager | Home | Pulse | Manager hub | Feed |
| Admin / Super admin | Home | Pulse | Cases | Feed |

Frame: `Product / Mobile / Tab bar` — variants `Role = Employee | Manager | Admin`.

### 4.2 "More" sheet

Full navigation, slides up from the bottom.

- Scrim `rgba(10,10,12,0.45)` + 2px blur, fades in 280ms
- Panel: rounded top corners 26px, `bg-card`, max height 88vh, scrolls internally,
  shadow `0 -18px 50px -12px rgba(10,10,12,0.35)`
- Slides up 340ms `cubic-bezier(0.22, 1, 0.36, 1)`. **Both animations are removed under
  `prefers-reduced-motion`** — the sheet simply appears.
- Page behind it does not scroll

**Sticky header** (stays while the list scrolls): 36px workspace logo · workspace name 14px/600 ·
`«Full name» · «Job title»` 12px `text-faint` · 44px close button on the right.

**Body:** the same nav groups as the sidebar, filtered by role. Group labels 12px/600 uppercase,
0.14em tracking, `text-faint`. Items 48px tall minimum, 20px icon + 16px label, active item on
`bg-soft` in the brand colour.

**Footer block:** divider, then the signed-in person's avatar + name + email, then Settings
(admin only), then **Sign out** in `#dc4a44`.

Frame: `Product / Mobile / Nav sheet` — variants `Role = Employee | Manager | Admin`.

### 4.3 Page padding

Every product page gains `104px + safe-area` bottom padding below 1024px so the tab bar never
covers content. The AI dock button also sits above the bar rather than behind it.

---

## 5 · Session identity replaces the placeholder

Everywhere the product previously showed the seeded "Priya Sharma", it now shows whoever is
signed in. Design implications:

- **Home greeting** — "Good morning, «First name» 👋". The name is the only part in the brand
  colour. Design a **loading state**: while identity resolves, the name is a 3.2em × 0.72em
  pill in `bg-line` with a gentle pulse. We do *not* paint a fallback name and swap it — a visible
  flash of the wrong person's name on the one personal line of the product is worse than a beat
  of nothing.
- **You card header** — avatar in the gradient ring, then name (16px bold) and `«Job title» · «Team»`
  (12px `text-faint`). Same skeleton treatment: two pulsing pills, 24×15 and 32×11.
- **Profile menu, feed composer, post drawer, recognition sender, mobile sheet** — all use the
  session avatar, name and email.

Job titles now exist per person and should appear wherever a role line is shown:
Aarav Sharma · Software Engineer · Engineering (employee) ·
Anita Desai · Design Lead · Design (manager) ·
Priya Sharma · People Partner · People (admin) ·
Pradeep Kumar · Head of People · Leadership (admin) ·
Vadal Ops · Platform Operations · Vadal (super admin).

Frame: `Product / States / Identity loading` — the two skeletons above.

---

## 6 · What to draw, in priority order

1. `Product / Mobile / Tab bar` — 3 role variants
2. `Product / Mobile / Nav sheet` — 3 role variants
3. `Sidebar / Role = Employee | Manager | Admin` — 3 nav compositions
4. `Product / States / Section restricted` — 2 copy variants
5. `Product / States / Identity loading` — 2 skeletons
6. Update the "Viewing as" switch to show 1, 2 or 3 options by role (hidden entirely for Employee)

## 7 · Notes

- Enforcement today is client-side; the server still renders the page. Real enforcement is a
  server-side session check and arrives with the Phase 1 spine. This does not change any of the
  designs above — it changes where the check runs.
- Cases is admin-and-up **entirely**, including for managers who raised a flag. If we want managers
  to see cases they opened, that is a separate scoping decision and a separate spec.
