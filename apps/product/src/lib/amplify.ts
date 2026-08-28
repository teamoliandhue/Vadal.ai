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
};

export const companyPosts: CompanyPost[] = [
  {
    id: "p1", platform: "LinkedIn", posted: "2 days ago",
    text: "Our Plant Ops team just closed 200 days without a lost-time incident. That is not luck — it is a thousand small decisions made properly, every shift.",
    likes: 842, comments: 61, shares: 48, inAdvocacyQueue: true,
  },
  {
    id: "p2", platform: "LinkedIn", posted: "5 days ago",
    text: "We shipped a change that cuts new-joiner onboarding from nine days to four. Built by four people who were tired of watching new starters wait.",
    likes: 1204, comments: 88, shares: 96, inAdvocacyQueue: true,
  },
  {
    id: "p3", platform: "Instagram", posted: "1 week ago",
    text: "Night shift, 4am, Line 2. The people who keep everything running while the rest of us sleep.",
    likes: 2310, comments: 140, shares: 22,
  },
  {
    id: "p4", platform: "X", posted: "1 week ago",
    text: "We are hiring across engineering, ops and people. If you want work that reaches 12,000 colleagues on day one, come talk to us.",
    likes: 190, comments: 14, shares: 31,
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
