# 001 · Authentication & Onboarding

**Status:** built in code (`apps/product` → `/auth`, `/auth/onboarding`) · needs Figma screens
**See it live:** run the product app and open `http://localhost:3001/auth` (sign out from the
profile menu if you land on Home). Demo personas on the sign-in card let you walk every track.

---

## 1 · Why it is the way it is (context for design decisions)

- **Multi-tenant, work-email-first.** Vadal is sold to companies (GCCs, 1k–50k employees).
  There is no personal signup: your **company email** routes you to your company's workspace.
  Personal providers (gmail, yahoo, outlook…) are **hard-blocked** with a friendly message.
- **Passwordless only.** Enterprise tenants sign in with their **company SSO** (Okta, Azure AD,
  Google Workspace). The universal fallback is a **6-digit email code** — chosen over magic
  links because deskless workers (Plant Ops, Night shift) often read mail on one device and
  sign in on another/shared one. There are **no passwords anywhere**.
- **Role decides everything.** The same product shows different data per actor (from the
  23 Jun client call): onboarding track, Home layout, nav scope and analytics visibility all
  branch on role.
- **Brand moment.** Sign-in is where Vadal's own brand appears "in a flash" (Signal mark +
  one-liner + "Powered by Vadal" footer). Inside the product the client's brand leads.

## 2 · The actors (user types)

| Role | Who | Sees | Onboarding track |
|---|---|---|---|
| **Employee** | Every person at the client | Own space only: Home (employee view), feed, own recognition/points, surveys, Knowledge. Never other people's data or org analytics. | You → Belong (communities) → Notifications → First check-in → Meet Vadal |
| **Manager** | People leads | Everything Employee + team scope: Manager hub, team analytics, approvals, launch surveys/campaigns to team | You → Your team (org-sync confirm) → 1:1 rhythm → Notifications → Meet Vadal |
| **HR / Workspace admin** | People team / founders at the client | Org-wide analytics + all configuration (branding, integrations, members, cases, guardrails) | You → Make it yours (branding) → Sign-in & domains → Bring your people → Privacy & AI |
| **Vadal super admin** | Vadal staff (internal) | Creates client workspaces, billing, white-label ops. Uses the admin surface; not part of client-facing onboarding. | (admin track) |

Provisioning: HRMS/SCIM sync or admin invite. Unknown emails on a **verified domain** are
JIT-provisioned as Employees ("New joiner") and go through employee onboarding.

## 3 · Screens to design

### 3.1 Sign-in (`/auth`) — one card, three steps

Centered 420px card on the canvas with two soft radial glows (violet top-left, teal
bottom-right). Above the card: **Signal mark** + tagline "The pulse of your company, daily."
Below: "🏢 Company workspaces only · SOC 2 · Data stays in your region" + "Powered by ✦ Vadal".
**No app chrome anywhere on auth screens** — no top nav, no sidebar; the page is a clean,
full-bleed canvas (sign-in and onboarding both).

**Step A — Work email**
- H1 "Sign in to your workspace", helper line emphasising **company email**.
- Email field (mail icon) + brand Button "Continue →".
- Error states (inline, soft red panel):
  1. invalid format — "That doesn't look like an email address."
  2. **personal domain** — "Vadal is for teams — personal addresses like @gmail.com can't
     sign in. Use your company email instead."
  3. **unknown domain** — "No workspace found for @acme.com." + link "talk to us" (marketing site).
- Demo block (divider): "DEMO · SIGN IN AS" + 4 persona chips (Employee / Manager / HR admin /
  Vadal super admin) — one-tap login for walkthroughs.

**Step B — Workspace & method** (after a verified domain)
- Back link. Tenant logo + name + the entered email.
- Buttons: brand **"Continue with Okta SSO"** (only if tenant has SSO) and secondary
  **"Email me a sign-in code"**.
- Footnote: "No passwords on Vadal — your company's single sign-on or a one-time code…"

**Step C — OTP**
- H1 "Check your inbox", sent-to line, six 48×52 code boxes (auto-advance, backspace moves
  back), error state for wrong code, "Verify & sign in" (disabled until 6 digits), "Resend code".
- Demo-only affordance: a soft panel showing the code (stand-in for the email).

### 3.2 Onboarding (`/auth/onboarding`) — role-branched wizard

Same centered card (520px). Above it: eyebrow "«Role» · setup" + "n / total" counter +
**segmented progress bar** (one segment per step; past = full violet, current = half).
Footer inside the card: Back (tertiary) · Continue (brand). Last step's CTA:
Employee/Manager **"Take me home →"**, Admin **"Launch workspace 🚀"**.
Below the card, a role-specific reassurance line (e.g. employee: "Your check-ins are private to you").

Steps (each is one card state to design):

**Shared**
- *You* — profile card pulled "from your company directory": avatar XL, name, email, team
  chip + role chip, Edit button; a line explaining what this role can see.
- *Stay in the loop* — 3 Switch rows (Recognition & mentions / Surveys & pulses / Weekly digest).
- *Meet Vadal* — AI surface panel (ai-surface bg + ai-border ring) with SparkMark and a
  role-appropriate sample message; "It lives in the bottom-right corner…"

**Employee only**
- *Belong* — 2-col grid of community cards (initial avatar, name, member count), multi-select
  with violet selected state.
- *First check-in* — the 4 mood buttons (Great/Good/Okay/Struggling) exactly as on Home;
  privacy line with lock icon.

**Manager only**
- *Your team* — synced report list (avatar, name, role, green check) + "+N more ·
  looks wrong? fix the mapping".
- *1:1 rhythm* — cadence pills (Weekly/Fortnightly/Monthly) + an AI heads-up panel
  ("one of your reports hasn't had a 1:1 in 6 weeks…").

**Admin only**
- *Make it yours* — logo row (Replace) + brand-colour swatch row (8 swatches) + live
  preview strip ("Good morning, Priya" tinted in the chosen colour).
- *Sign-in & domains* — 3 rows: Verified domains (✓), SSO provider (✓ Connected),
  Email-code fallback (Switch on).
- *Bring your people* — "Connect HRIS (recommended)" row + "Or invite by email" textarea;
  note "Everyone starts as an Employee — promote in Settings → Members."
- *Privacy & AI* — 3 green-check rows: Anonymity threshold · 5 / AI scoped to workspace /
  Usage guardrails on.

### 3.3 After finishing
- Session drives the product: role sets the Home view (the "Viewing as" logic), admin's chosen
  brand colour is applied to the workspace, sign-out lives in the profile menu → back to `/auth`.

## 4 · Components & tokens used

- DS components: **Button** (brand/secondary/tertiary, loading), **Avatar** (sm–xl),
  **Switch** (+label/description), **SparkMark**, Badge-style chips.
- Patterns reused from the product: card `rounded-[26px] border-line bg-card`, eyebrow style
  (12px, +0.16em, faint), soft error panel `danger @10%`, AI panel `--ai-surface`/`--ai-border`,
  mood buttons from Home, pill-selects from the builders.
- Type: existing ramp only (H1 20–22 bold tight · body 14 · helper 12/13). Light + dark.
- OTP boxes: 48×52, radius 12, 20px bold center, focus border `--purple`.

## 5 · Flows to prototype (Figma)

1. Happy path employee: email → OTP → 5-step employee onboarding → Home (employee view).
2. Personal-email block: gmail → inline error (no dead end — copy points to work email).
3. Unknown domain → "talk to us" exit to marketing site.
4. SSO path (admin persona): email → Continue with Okta → admin onboarding → Home.
5. Sign-out (profile menu) → back to sign-in.

## 6 · Copy (final, as built)

Use the exact strings from the built screens (they're written to be shipped): the headings,
error messages, privacy reassurances and button labels listed above are the approved copy.
