/* The product's navigation, defined once.

   Both the desktop Rail and the MobileNav read from here and filter it through
   lib/access, so a section can never appear in one navigation and not the other,
   and can never appear at all to someone who cannot open it.

   Section labels must match the `active` value pages pass to <Shell> and the
   keys in lib/access.SECTION_ACCESS — that shared key is what keeps nav,
   routing and permissions in agreement. */
import {
  BarChart3, BookOpen, ClipboardList, FolderKanban, Gauge, GraduationCap,
  HeartHandshake, HeartPulse, House, LifeBuoy, Megaphone, Newspaper, Radio,
  Share2, Smile, UsersRound, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth";
import { canAccess } from "@/lib/access";

export type NavLeaf = { label: string; icon: LucideIcon; href: string; soon?: boolean };
export type NavGroupModel = { label: string; items: NavLeaf[] };

export const NAV: NavGroupModel[] = [
  {
    label: "My space",
    items: [
      { label: "Home", icon: House, href: "/product/home" },
      { label: "Feed", icon: Newspaper, href: "/product/feed" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Pulse", icon: Gauge, href: "/product" },
      { label: "Analytics", icon: BarChart3, href: "/product/analytics" },
    ],
  },
  {
    label: "Listen",
    items: [
      { label: "Surveys", icon: ClipboardList, href: "/product/surveys" },
      { label: "Sentiment", icon: Smile, href: "/product/sentiment" },
      { label: "Always-on listening", icon: Radio, href: "/product/listening" },
    ],
  },
  {
    label: "Engage",
    items: [
      { label: "Recognition", icon: HeartHandshake, href: "/product/recognition" },
      { label: "Campaigns", icon: Megaphone, href: "/product/campaigns" },
      { label: "Amplify", icon: Share2, href: "/product/amplify" },
    ],
  },
  {
    label: "Wellbeing",
    items: [
      { label: "Thrive", icon: HeartPulse, href: "/product/thrive" },
      { label: "One-to-One Help", icon: LifeBuoy, href: "/product/help" },
    ],
  },
  {
    label: "Learn",
    items: [{ label: "Grow", icon: GraduationCap, href: "/product/grow" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Manager hub", icon: UsersRound, href: "/product/managers" },
      { label: "Cases", icon: FolderKanban, href: "/product/cases" },
    ],
  },
  {
    label: "Knowledge",
    items: [{ label: "Knowledge", icon: BookOpen, href: "/product/knowledge" }],
  },
];

/** The nav this role can actually use — groups that empty out are dropped. */
export function navFor(role: Role | null): NavGroupModel[] {
  if (!role) return [];
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => canAccess(role, i.label)) })).filter(
    (g) => g.items.length > 0,
  );
}

/**
 * The four destinations that earn a slot in the mobile bottom bar.
 *
 * Chosen per role rather than "first four in the sidebar", because the bottom
 * bar is the whole navigation on a phone and the frontline employee is the user
 * we are most at risk of failing. Everything else lives one tap away under More.
 */
const MOBILE_PRIORITY: Record<Role, string[]> = {
  // Grow over Knowledge for the employee: a five-minute course on a break is the
  // thing this product is asking a frontline worker to do, and Knowledge is
  // reachable from the Copilot on any screen.
  employee: ["Home", "Feed", "Grow", "Thrive"],
  manager: ["Home", "Pulse", "Manager hub", "Feed"],
  admin: ["Home", "Pulse", "Cases", "Feed"],
  superadmin: ["Home", "Pulse", "Cases", "Feed"],
};

const FLAT = NAV.flatMap((g) => g.items);

export function mobilePrimary(role: Role | null): NavLeaf[] {
  if (!role) return [];
  const wanted = MOBILE_PRIORITY[role] ?? MOBILE_PRIORITY.employee;
  const picked = wanted
    .map((label) => FLAT.find((i) => i.label === label))
    .filter((i): i is NavLeaf => Boolean(i) && canAccess(role, i!.label));
  // Backfill if a role's preferred set is ever trimmed by the access map.
  for (const item of FLAT) {
    if (picked.length >= 4) break;
    if (canAccess(role, item.label) && !picked.some((p) => p.label === item.label)) picked.push(item);
  }
  return picked.slice(0, 4);
}
