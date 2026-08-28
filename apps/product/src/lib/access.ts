/**
 * Role-based access model — the single source of truth for who can reach what.
 *
 * Sections are keyed by their sidebar label, which is also the `active` value
 * every product page passes to <Shell>. That one key drives three things at
 * once, so they can never disagree:
 *   1. which nav items render (Rail + MobileNav)
 *   2. which routes are reachable (SectionGuard)
 *   3. how far "Viewing as" can be turned up (useViewAs)
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
 * The reasoning, so this is arguable rather than arbitrary:
 * - Everyone gets the daily-ritual surfaces (Home, Feed, Recognition, Knowledge).
 *   These are the reason a frontline employee opens the app at all.
 * - Org-wide intelligence (Pulse, Analytics, Sentiment, Surveys) is manager-and-up:
 *   a manager sees it to act on their team, an employee has no business reading
 *   aggregate sentiment about their colleagues.
 * - Configuration and confidential operations (Campaigns, Cases, Settings,
 *   Always-on listening) are admin-and-up. Cases especially — it holds grievance
 *   and harassment records, and the screen promises restricted visibility.
 */
export const SECTION_ACCESS: Record<string, Role[]> = {
  Home: ALL_ROLES,
  Feed: ALL_ROLES,
  Recognition: ALL_ROLES,
  Knowledge: ALL_ROLES,

  Pulse: MANAGER_UP,
  Analytics: MANAGER_UP,
  Sentiment: MANAGER_UP,
  Surveys: MANAGER_UP,
  "Manager hub": MANAGER_UP,

  "Always-on listening": ADMIN_UP,
  Campaigns: ADMIN_UP,
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

/**
 * The role that actually governs the UI.
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
