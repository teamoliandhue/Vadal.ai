/* The product's navigation, defined once.

   Both the desktop Rail and the MobileNav read from here and filter it through
   lib/access, so a section can never appear in one navigation and not the other,
   and can never appear at all to someone who cannot open it.

   Section labels must match the `active` value pages pass to <Shell> and the
   keys in lib/access.SECTION_ACCESS — that shared key is what keeps nav,
   routing and permissions in agreement. */
import {
  BarChart3, BookOpen, ClipboardList, Compass, FolderKanban, Gauge, GraduationCap,
  Handshake, HeartHandshake, HeartPulse, House, LifeBuoy, Megaphone, Newspaper, Radio,
  Share2, Smile, Sparkles, Sprout, UsersRound, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth";
import { canAccess } from "@/lib/access";

/** `label` is the access/active key; `display` is what the person reads when it differs. */
export type NavLeaf = { label: string; icon: LucideIcon; href: string; soon?: boolean; display?: string };
export type NavGroupModel = { label: string; items: NavLeaf[] };

export const NAV: NavGroupModel[] = [
  /* Nudge — the assistant's own group (17 Sep decision). It sits above the
     person's space because it is where Nudge surfaces what it has tailored for
     them. Get Started is the investor/new-joiner walkthrough; once it is done
     the Rail relabels it "Product tour" and puts it below For you. */
  {
    label: "Nudge",
    items: [
      { label: "Get Started", icon: Compass, href: "/product/get-started" },
      { label: "For you", icon: Sparkles, href: "/product/for-you" },
    ],
  },
  /* Kudos sits in My space: it is the one engagement action every employee
     takes, and it was buried under Engage beside two admin tools. */
  {
    label: "My space",
    items: [
      { label: "Home", icon: House, href: "/product/home" },
      { label: "Social", icon: Newspaper, href: "/product/social" },
      { label: "Kudos", icon: HeartHandshake, href: "/product/kudos" },
    ],
  },
  /* Then the meeting's order: Engage · Listen · Learn · Insight · Wellbeing, and
     Operations last because it is manager and HR work. */
  {
    label: "Engage",
    items: [
      { label: "Campaigns", icon: Megaphone, href: "/product/campaigns" },
      { label: "Amplify", icon: Share2, href: "/product/amplify" },
    ],
  },
  {
    label: "Listen",
    items: [
      { label: "Pulse", icon: ClipboardList, href: "/product/pulse" },
      { label: "Sentiment", icon: Smile, href: "/product/sentiment" },
      { label: "Always-on listening", icon: Radio, href: "/product/listening" },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "iLearn", icon: GraduationCap, href: "/product/ilearn" },
      { label: "Knowledge", icon: BookOpen, href: "/product/knowledge" },
    ],
  },
  {
    label: "Insight",
    items: [
      { label: "Insight", icon: Gauge, href: "/product" },
      { label: "Analytics", icon: BarChart3, href: "/product/analytics" },
    ],
  },
  {
    label: "Wellbeing",
    items: [
      { label: "iThrive", icon: HeartPulse, href: "/product/ithrive" },
      { label: "SmartWork", icon: LifeBuoy, href: "/product/smartwork" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Manager hub", icon: UsersRound, href: "/product/managers" },
      // The two ends of the lifecycle (17 Sep decision §7): joiners' first 90
      // days for managers and People, and the alumni network for People.
      { label: "Onboard", icon: Sprout, href: "/product/onboard" },
      { label: "Alumni", icon: Handshake, href: "/product/alumni" },
      { label: "Flow", icon: FolderKanban, href: "/product/flow" },
    ],
  },
];

/** The nav this role can actually use — groups that empty out are dropped.
 *  Once the tour is finished or dismissed, Get Started reads "Product tour" and
 *  moves below For you: it has stopped being the first thing to do. */
export function navFor(role: Role | null, opts: { tourDone?: boolean } = {}): NavGroupModel[] {
  if (!role) return [];
  return NAV.map((g) => {
    let items = g.items.filter((i) => canAccess(role, i.label));
    if (g.label === "Nudge" && opts.tourDone) {
      items = [...items.filter((i) => i.label !== "Get Started"), ...items.filter((i) => i.label === "Get Started").map((i) => ({ ...i, display: "Product tour" }))];
    }
    return { ...g, items };
  }).filter((g) => g.items.length > 0);
}

/**
 * The four destinations that earn a slot in the mobile bottom bar.
 *
 * Chosen per role rather than "first four in the sidebar", because the bottom
 * bar is the whole navigation on a phone and the frontline employee is the user
 * we are most at risk of failing. Everything else lives one tap away under More.
 */
const MOBILE_PRIORITY: Record<Role, string[]> = {
  // iLearn over Knowledge for the employee: a five-minute course on a break is the
  // thing this product is asking a frontline worker to do, and Knowledge is
  // reachable from Nudge on any screen.
  // These are nav labels and must match NAV exactly — after the renaming they
  // did not, and the bar quietly fell back to "first four in the sidebar".
  employee: ["Home", "Social", "iLearn", "iThrive"],
  manager: ["Home", "Insight", "Manager hub", "Social"],
  admin: ["Home", "Insight", "Flow", "Social"],
  superadmin: ["Home", "Insight", "Flow", "Social"],
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
