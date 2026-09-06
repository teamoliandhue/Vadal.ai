/**
 * The product, described once, for the front door.
 *
 * An investor landing on the app got a sign-in screen: zero features in the
 * first five seconds, then one persona's daily workspace, which surfaces about
 * three of sixty-eight. The breadth was real and completely invisible.
 *
 * Everything here is a one-line description keyed to a section that actually
 * exists in NAV, so a section cannot appear on the front door and be missing
 * from the product, or vice versa — the same failure mode the AI registry had.
 * The AI counts come from FEATURES, and the role gates from SECTION_ACCESS.
 */
import { FEATURES } from "./ai/features";
import { SECTION_ACCESS } from "./access";
import { NAV } from "@/app/product/nav-model";

/** What each section is for, in the words someone outside the company would use. */
export const SECTION_BLURB: Record<string, string> = {
  Home: "The daily ritual — what needs you today, in ninety seconds.",
  Feed: "The company's own social layer, with recognition built in.",
  Pulse: "One health score, computed from every listening surface.",
  Analytics: "Slice engagement by team, tenure, site or shift.",
  Surveys: "Micro-surveys that adapt to the answers given.",
  Sentiment: "What people are actually saying, clustered and anonymised.",
  "Always-on listening": "Signals between surveys, not once a quarter.",
  Recognition: "Peer-to-peer kudos tied to the company's values.",
  Campaigns: "Run an engagement programme and see what it moved.",
  Amplify: "Employee advocacy — their words, their moments, going out.",
  Thrive: "Physical and financial wellbeing, side by side.",
  "One-to-One Help": "A private first door to support, a human one tap away.",
  Grow: "Learning that fits a five-minute break, not a training day.",
  "Manager hub": "The cockpit for a people leader — their team, their actions.",
  Cases: "Confidential HR cases, handled with an audit trail.",
  Knowledge: "The company brain: ask anything, get the source.",
  Settings: "Roles, branding, AI controls and data residency.",
};

/** Which brief pillar a section belongs to, where the mapping is exact.
 *  Left out entirely where it is not — a rough count is worse than none. */
const SECTION_PILLAR: Record<string, string> = {
  Pulse: "Pulse",
  Feed: "Connect",
  Recognition: "Connect",
  Amplify: "Amplify",
  Thrive: "Thrive",
  Campaigns: "Broadcast",
  Grow: "Grow",
  "One-to-One Help": "One-to-One Help",
};

/** How many AI features from the brief live in this section. */
export function aiCountFor(section: string): number {
  const pillar = SECTION_PILLAR[section];
  if (!pillar) return 0;
  return FEATURES.filter((f) => f.pillar === pillar).length;
}

/** The lowest role that can open this section — the honest gate, from access.ts. */
export function opensFor(section: string): string {
  const roles = SECTION_ACCESS[section];
  if (!roles) return "Everyone";
  if (roles.includes("employee")) return "Everyone";
  if (roles.includes("manager")) return "Managers and up";
  return "Admins";
}

/** The four numbers worth leading with. Counted, never typed. */
export function headlineStats() {
  const reachable = FEATURES.filter((f) => f.wiredTo && !f.blocked).length;
  return {
    aiFeatures: FEATURES.length,
    reachable,
    /* Counted from NAV, which is what the grid renders. SECTION_BLURB also
       carries Settings, which lives in the rail footer rather than the nav — so
       counting the blurbs claimed one more section than the page shows. */
    sections: NAV.reduce((n, g) => n + g.items.length, 0),
    pillars: new Set(FEATURES.map((f) => f.pillar)).size,
  };
}
