/**
 * Role-based access model — the single source of truth for who can reach what,
 * and how much of it they can see once they are there.
 *
 * Reconciled against §9 "Roles & Permissions Summary" of the AI Feature Product
 * Inputs brief. Where the brief and the build disagreed, the brief wins; where
 * the brief is silent or self-contradictory, the decision is recorded below so
 * it can be argued with rather than discovered.
 *
 * Sections are keyed by their sidebar label, which is also the `active` value
 * every product page passes to <Shell>. That one key drives four things at once,
 * so they can never disagree:
 *   1. which nav items render (Rail + MobileNav)
 *   2. which routes are reachable (SectionGuard)
 *   3. how much data the surface shows (scopeFor)
 *   4. how far "Viewing as" can be turned up (useViewAs)
 *
 * SCOPE OF ENFORCEMENT (be honest about this): the guard is client-side, because
 * there is no backend yet — the RSC payload for a page is still produced on the
 * server. It stops a person navigating into a surface they should not see, which
 * is the defect the audit found. Real enforcement is a server-side session check
 * and lands with the Phase 1 spine.
 */
import type { Role } from "./auth";

export const ROLE_RANK: Record<Role, number> = {
  employee: 0,
  manager: 1,
  admin: 2,
  superadmin: 3,
};

export const ALL_ROLES: Role[] = ["employee", "manager", "admin", "superadmin"];
const MANAGER_UP: Role[] = ["manager", "admin", "superadmin"];
const ADMIN_UP: Role[] = ["admin", "superadmin"];

/**
 * Which roles may reach each section.
 *
 * Mapped from the brief's capability table:
 *   Take surveys / quick pulse ............ everyone  → Home, Feed
 *   Post to Connect feed .................. everyone  → Feed, Recognition
 *   View team-level Pulse dashboard ....... manager (own team) / admin (all)
 *   Author Broadcast announcements ........ manager (team-only) / admin (all)
 *   Moderate content ...................... admin only
 *   Configure survey templates / integrations  admin only
 *
 * Three decisions the brief does not cover, recorded here:
 *
 * - SURVEYS is the template builder and integration surface, which the brief
 *   puts squarely at admin. A manager reads their team's results through Pulse
 *   and Sentiment, not by opening the builder.
 * - ANALYTICS is our free-slicing org-wide explorer and has no equivalent in the
 *   brief. It cannot be honestly team-scoped on the current data model, so it is
 *   admin-and-up rather than pretending to filter. Pulse is the manager's view.
 * - CASES holds grievance and harassment records and has no home in the brief at
 *   all. Admin-and-up, including for managers who raised the flag. If managers
 *   should see cases they opened, that is a separate scoping decision.
 */
export const SECTION_ACCESS: Record<string, Role[]> = {
  Home: ALL_ROLES,
  Feed: ALL_ROLES,
  Recognition: ALL_ROLES,
  Knowledge: ALL_ROLES,

  // The four pillars from the brief that had no screens. All are employee-facing
  // by design — Thrive is your own health and money, Grow is your own learning,
  // One-to-One Help must never be gated, and Amplify only works if employees can
  // actually reach it. Authoring inside them is gated separately, in the screen.
  Thrive: ALL_ROLES,
  Grow: ALL_ROLES,
  Amplify: ALL_ROLES,
  "One-to-One Help": ALL_ROLES,

  Pulse: MANAGER_UP,
  Sentiment: MANAGER_UP,
  "Manager hub": MANAGER_UP,
  Campaigns: MANAGER_UP, // brief: managers author team-only — scoped by scopeFor

  Analytics: ADMIN_UP,
  Surveys: ADMIN_UP,
  "Always-on listening": ADMIN_UP,
  Cases: ADMIN_UP,
  Settings: ADMIN_UP,
};

export function canAccess(role: Role | null | undefined, section: string): boolean {
  if (!role) return false;
  const allowed = SECTION_ACCESS[section];
  if (!allowed) return true; // unregistered section — not a protected surface
  return allowed.includes(role);
}

/** Lowest role that can reach a section — drives the restricted-access copy. */
export function minRoleFor(section: string): Role | null {
  const allowed = SECTION_ACCESS[section];
  if (!allowed || allowed.length === 0) return null;
  return allowed.reduce((lo, r) => (ROLE_RANK[r] < ROLE_RANK[lo] ? r : lo), allowed[0]);
}

/** Human phrasing for the restricted screen — "a manager", "an HR admin". */
export const ROLE_ARTICLE: Record<Role, string> = {
  employee: "an employee",
  manager: "a manager",
  admin: "an HR or workspace admin",
  superadmin: "a Vadal super admin",
};

/* ─────────────────────────── data scope ───────────────────────────
   Access answers "can you open it". Scope answers "how much of it do
   you see" — the brief's "Own team" column, which is a different rule
   and was previously not modelled at all. */

export type DataScope = "self" | "own-team" | "all";

/**
 * How much of a section this role sees.
 *
 * A manager reaching Pulse, Sentiment, Manager hub or Campaigns is limited to
 * their own team — per the brief, and because a manager reading another team's
 * sentiment is the same class of problem as an employee reading Cases.
 */
export function scopeFor(role: Role | null | undefined, section: string): DataScope {
  if (!role) return "self";
  if (role === "admin" || role === "superadmin") return "all";
  if (role === "manager") return canAccess("manager", section) && section !== "Home" && section !== "Feed"
    ? "own-team"
    : "self";
  return "self";
}

/* ───────────────────── presentation profile ─────────────────────
   The brief lists four roles, but its own permissions table lists three.
   The fourth — "Frontline employee (field/factory) — mobile-only,
   offline-first, larger touch targets, voice input, minimal typing" — has
   exactly the same PERMISSIONS as a desk employee. What differs is how the
   product is presented.

   Modelling it as a fifth permission tier would be wrong: it would imply
   frontline workers can see less, which is not what the brief says and not
   what we want. It is a presentation profile carried alongside the role, so
   permissions and presentation can vary independently — a frontline manager
   is a real person we will meet on a factory floor. */

export type Profile = "desk" | "frontline";

export const PROFILE_LABEL: Record<Profile, string> = {
  desk: "Desk-based",
  frontline: "Frontline · field/factory",
};

/**
 * The effective role that governs the UI.
 *
 * "Viewing as" is a real feature the founders asked for — an admin previewing
 * what an employee sees. It may only ever scope DOWN. Before this, the switch
 * wrote straight to localStorage with no ceiling, so an employee could set
 * themselves to admin and the whole product obeyed.
 */
export function effectiveRole(sessionRole: Role | null | undefined, viewAs: Role): Role {
  if (!sessionRole) return "employee";
  return ROLE_RANK[viewAs] < ROLE_RANK[sessionRole] ? viewAs : sessionRole;
}
