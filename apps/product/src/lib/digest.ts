/**
 * Home digest — Yesterday · Last week · Your week ahead · What's new
 * (17 Sep decision §3).
 *
 * Read-only by design: every line links to where the thing lives, and nothing
 * here asks the person to do anything on Home itself. The one exception — the
 * daily check-in — stays in the greeting above.
 *
 * Seeded per role. The section key on each item is checked against access, so a
 * line never links somewhere this person cannot open.
 */
import type { Role } from "./auth";

export type DigestLine = { id: string; emoji: string; text: string; href?: string; section?: string; roles?: Role[] };
export type WeekTile = { label: string; value: string; note: string; roles?: Role[] };
export type AheadItem = { inDays: number; title: string; meta: string; href?: string; section?: string; roles?: Role[] };

const MGR: Role[] = ["manager", "admin", "superadmin"];
const ADM: Role[] = ["admin", "superadmin"];

export const YESTERDAY: DigestLine[] = [
  { id: "y-kudos", emoji: "💜", text: "**Anita** recognised you for **Ownership** — “calm under pressure on the onboarding launch.”", href: "/product/kudos", section: "Kudos" },
  { id: "y-review", emoji: "🛡️", text: "**4 posts** are waiting for review — one names a hazard in bay 4.", href: "/product/social/review", section: "Settings", roles: ADM },
  /* A manager sees the 1:1 they owe — a fact both people already know. What
     Rohan told his check-in stays with Rohan, here as everywhere else. */
  { id: "y-rohan", emoji: "🗓️", text: "**Rohan** has not had a 1:1 in six weeks. The next one is still unbooked.", href: "/product/managers", section: "Manager hub", roles: MGR },
  { id: "y-rooms", emoji: "🏃", text: "**14 new posts** in your communities — Runners club set Saturday's route.", href: "/product/social/groups", section: "Social" },
  { id: "y-arjun", emoji: "🎉", text: "**Arjun** hit three years. 41 people have left him a note.", href: "/product/social/post/f6", section: "Social" },
  { id: "y-safety", emoji: "🦺", text: "**Line 2** reached 200 days without a lost-time incident.", href: "/product/social/post/f6b", section: "Social" },
];

export const LAST_WEEK: WeekTile[] = [
  { label: "Checked in", value: "5 of 5", note: "Your best week since July" },
  { label: "Kudos", value: "3 in · 2 out", note: "Ownership, twice" },
  { label: "Learning", value: "34 min", note: "Giving feedback, 2 of 3 parts" },
  { label: "Your team", value: "83 · +2", note: "Design's pulse score" },
  { label: "Weekly active", value: "89%", note: "Everyone · +1 point", roles: ADM },
];

export const LAST_WEEK_LINE = "A steady week. The thing people on your team mentioned most was **clearer priorities** — up from fourth to first.";

/* Offsets from today, not fixed dates — Home has one clock (lib/home). */
export const WEEK_AHEAD: AheadItem[] = [
  { inDays: 0, title: "1:1 with Anita", meta: "3:00 PM · 30 min · Google Calendar" },
  /* Names live in one place (lib/home reads the manager rows); this line does not repeat them. */
  { inDays: 0, title: "Plan the 1:1s you owe", meta: "Both overdue · suggested times ready", href: "/product/managers", section: "Manager hub", roles: MGR },
  { inDays: 1, title: "No-meeting Wednesday", meta: "All day · Wellbeing campaign", href: "/product/social/post/f1", section: "Social" },
  { inDays: 2, title: "Search revamp demo", meta: "4:00 PM · in the community", href: "/product/social/groups/search-revamp", section: "Social" },
  { inDays: 3, title: "September pulse closes", meta: "About 2 minutes · only the questions that matter to you", href: "/product/survey/september-pulse", section: "Home" },
  { inDays: 3, title: "Compliance refresher due", meta: "12 minutes left in iLearn", href: "/product/ilearn", section: "iLearn" },
  { inDays: 3, title: "Pulse wave closes — 71% have answered", meta: "Night shift is at 48%", href: "/product/pulse", section: "Pulse", roles: ADM },
  { inDays: 4, title: "Runners club · lake run", meta: "6:00 AM · Ulsoor Lake gate", href: "/product/social/groups/runners", section: "Social" },
];

export const WHATS_NEW: DigestLine[] = [
  { id: "n-leave", emoji: "📘", text: "**Parental leave** is now 26 weeks for everyone. The policy is in Knowledge.", href: "/product/knowledge", section: "Knowledge" },
  { id: "n-campaign", emoji: "🌿", text: "The **Wellbeing campaign** starts Monday — focus weeks and no-meeting Wednesdays.", href: "/product/social/post/f1", section: "Social" },
  { id: "n-translate", emoji: "🌐", text: "New in Vadal: **translate any post into Hindi**, right under the original.", href: "/product/social", section: "Social" },
  { id: "n-photo", emoji: "📷", text: "New community: **Photo walks** — one walk a month, best frame wins the wall.", href: "/product/social/groups/photo-walk", section: "Social" },
  { id: "n-rewards", emoji: "🎁", text: "**Rewards** is open — merch, vouchers, experiences and giving.", href: "/product/kudos/rewards", section: "Kudos" },
  { id: "n-results", emoji: "📊", text: "**Amplify Results** shows who approved each post and what it reached.", href: "/product/amplify", section: "Campaigns", roles: MGR },
];

export const forRole = <T extends { roles?: Role[] }>(items: T[], role: Role) => items.filter((i) => !i.roles || i.roles.includes(role));
