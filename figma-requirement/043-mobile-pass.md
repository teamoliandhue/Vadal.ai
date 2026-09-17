# 043 · Mobile pass — Home a phone arranges, and bottom sheets

**Status:** built in code · Home (`/product/home`) below 768px · every drawer in the product ·
source: roadmap v3 "Mobile — a separate design pass, not a responsive squeeze; employees configure
their own widgets"

Two changes. Both are designs of their own for a phone, not the desktop layout squeezed down.

---

## 1 · Home on a phone

Below `md` (768px), Home's widget area isn't the two desktop columns stacked any more.

- **Its own arrangement.** The phone layout is saved separately from the desktop one. What someone
  wants first on a phone between shifts is not what they want on a laptop. The first time, it starts from
  the desktop default, left column first. Widgets the saved layout has never seen start hidden.
- **Header row:** *YOUR DIGEST* (eyebrow) · **Arrange** (tertiary, sliders icon, 44px) on the right.
- **Widgets fold.** Above each open widget, a right-aligned faint text button **Fold ⌃** (44px). The card
  already names itself, so there's no second title. A folded widget is one 52px row: card background,
  1px line, radius 16, emoji · title (15px semibold) · chevron down. Tap it to open. Folded stays folded.
  Rows sit 8px apart.
- **Empty state:** dashed box — *Your Home is empty. Tap Arrange to bring widgets back.*

### Arrange your Home (bottom sheet)

- Title *Arrange your Home* (22px) · *Drag the handle, or use the arrows. Switch off what you don't need on
  your phone — your laptop keeps its own layout.*
- **ON YOUR HOME · 4:** 64px rows divided by hairlines: a 44px **grip handle** (drag vertically; the
  row lifts with a shadow and rounded corners while the others step aside) · emoji · title (truncates) ·
  **↑** and **↓** (44px, disabled at the ends) · a small **Switch**, on.
- **HIDDEN · 9:** rows with emoji · title · a one-line description (12px muted) · a small Switch, off.
  Switching one on adds it to the bottom of *On your Home*. Hidden replaces the separate "Add widgets"
  library on a phone.
- Footer: **Reset** (tertiary, rotate icon) left · **Done** (brand) right. Moves are announced to screen
  readers (*Yesterday moved to position 3*).

Desktop keeps spec 034: two columns, Customise, drag, arrows, library.

## 2 · Drawers become bottom sheets on phones

Every `Drawer` (Link details, Knowledge articles, Onboard, Kudos, Social posts…), below `md`:

- It rises from the bottom. It's full width, at most 92% of the viewport height, with 28px top corners and
  a hairline top border. The backdrop is unchanged.
- A **grab bar** (40×6, `--line`, centred in a 24px strip). Pulling it down more than 60px closes the
  sheet.
- The **close button** is 44px on phones (it was 32px, under the touch floor) at top-right 12px. It stays
  32px from `md` up.
- Content padding is 24px at the sides, 8px at the top, and 24px plus the safe-area inset at the bottom.

From `md` up it's still the 440px right-side panel.
