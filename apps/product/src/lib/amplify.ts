/**
 * Amplify — Pillar 3 (route /product/amplify).
 *
 * "Bring the company's external voice in, and let employee moments go out."
 * Inbound company social posts surfaced internally, plus a curated advocacy
 * queue employees can reshare with an AI-drafted caption in their own voice.
 *
 * Nothing here posts. The brief requires a per-platform feasibility spike before
 * auto-mirroring is committed to, and an explicit human tap on every action —
 * see lib/ai/engines/advocacy.canAutoMirror().
 */
import type { Platform, ShareRecord } from "./ai/engines/advocacy";

export type CompanyPost = {
  id: string;
  platform: Platform;
  posted: string;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  /** Pushed by HR/Marketing for employees to reshare. */
  inAdvocacyQueue?: boolean;
  /** The one post HR most wants amplified right now — becomes the hero. */
  featured?: boolean;
  /** How many colleagues have already shared it. Social proof does the work here. */
  sharedBy?: number;
  /** The public permalink. Needed by every share route that is not the OS sheet. */
  url?: string;
  /** How many people passed on it — the signal HR would never otherwise get. */
  passedBy?: number;
};

/**
 * Platform marks.
 *
 * Enough colour that a LinkedIn post does not look identical to an Instagram
 * one — social platforms are strongly branded and a post should feel like where
 * it came from. Deliberately a small mark rather than mimicking their chrome:
 * imitating another company's UI inside a product is both tacky and a
 * trademark problem.
 */
export const PLATFORM_MARK: Record<Platform, { color: string; label: string }> = {
  LinkedIn:  { color: "#0A66C2", label: "in" },
  Instagram: { color: "#D6249F", label: "ig" },
  X:         { color: "#101014", label: "X" },
  Facebook:  { color: "#1877F2", label: "f" },
};

export const companyPosts: CompanyPost[] = [
  {
    id: "p1", url: "https://www.linkedin.com/posts/oliandhue_plant-ops-200-days", platform: "LinkedIn", posted: "2 days ago",
    text: "Our Plant Ops team just closed 200 days without a lost-time incident. That is not luck — it is a thousand small decisions made properly, every shift.",
    image: "/feed/plant.jpg",
    likes: 842, comments: 61, shares: 48, inAdvocacyQueue: true, featured: true, sharedBy: 23, passedBy: 4,
  },
  {
    id: "p2", url: "https://www.linkedin.com/posts/oliandhue_onboarding-nine-to-four", platform: "LinkedIn", posted: "5 days ago",
    text: "We shipped a change that cuts new-joiner onboarding from nine days to four. Built by four people who were tired of watching new starters wait.",
    image: "/feed/ship.jpg",
    likes: 1204, comments: 88, shares: 96, inAdvocacyQueue: true, sharedBy: 41, passedBy: 2,
  },
  {
    id: "p3", url: "https://www.instagram.com/p/oliandhue-arjun-three-years", platform: "Instagram", posted: "1 week ago",
    text: "Three years of Arjun making Engineering calmer and faster. The people are the product.",
    image: "/feed/milestone.jpg",
    likes: 2310, comments: 140, shares: 22, sharedBy: 8, passedBy: 11,
  },
  {
    id: "p4", url: "https://x.com/oliandhue/status/hiring-eng-ops-people", platform: "X", posted: "1 week ago",
    text: "We are hiring across engineering, ops and people. If you want work that reaches 12,000 colleagues on day one, come talk to us.",
    likes: 190, comments: 14, shares: 31, sharedBy: 3, passedBy: 19,
  },
];

/** What employees have already reshared — feeds impact scoring. */
export const shares: ShareRecord[] = [
  { employee: "Anita Desai", platform: "LinkedIn", followers: 4200, engagements: 88 },
  { employee: "Aarav Sharma", platform: "LinkedIn", followers: 1800, engagements: 34 },
  { employee: "Priya Sharma", platform: "LinkedIn", followers: 6100, engagements: 142 },
  { employee: "Ravi Prasad", platform: "X", followers: 340, engagements: 9 },
  { employee: "Meera Pillai", platform: "Instagram", followers: 2200, engagements: 61 },
];

export const companyPostReach = 18400;

/** Per-employee opt-in, per the brief. Off by default — always. */
export const advocacyOptInDefault = false;

export const advocacyStats = { participants: 148, ofEmployees: 12480, postsQueued: 6, resharesThisMonth: 312 };

/** Colleagues who have shared recently — social proof carries this pillar. */
export const recentSharers = [
  { name: "Anita Desai", img: "/avatars/user-5.svg" },
  { name: "Priya Sharma", img: "/avatars/user-8.svg" },
  { name: "Meera Pillai", img: "/avatars/user-7.svg" },
  { name: "Rahul Verma", img: "/avatars/user-1.svg" },
  { name: "Karan Joshi", img: "/avatars/user-4.svg" },
];

/** The signed-in person's own record — the motivation loop, not a vanity metric. */
export const myAdvocacy = { shares: 3, estimatedReach: 412, rank: 26, of: 148 };

/**
 * What people said when they passed.
 *
 * The most useful thing on the admin side of this pillar and the one nobody
 * collects: 19 people declined the hiring post as "reads too corporate", which
 * is worth more than the 3 who shared it.
 */
export const declineSignal = [
  { reason: "Reads too corporate", count: 21 },
  { reason: "Not my area", count: 9 },
  { reason: "Not right now", count: 4 },
  { reason: "Rather not share work posts", count: 2 },
];
