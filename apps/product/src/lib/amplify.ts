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
import type { Moment, Platform, ShareRecord, Voice } from "./ai/engines/advocacy";

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

/* ════════════════════════════════════════════════════════════════════
   "...and let employee moments go out"
   ════════════════════════════════════════════════════════════════════ */

/**
 * Priya's own moments — things that already happened to her internally and are
 * worth the outside seeing.
 *
 * Every one of these is derived, not invented: the kudos come from the
 * Recognition wall, the shipped launch from the #wins feed, the certification
 * from Grow. Amplify does not create moments; it notices the ones the product
 * already knows about and offers to carry them further.
 */
export const myMoments: Moment[] = [
  {
    id: "m1", kind: "kudos",
    what: "Shipped the onboarding flow ahead of schedule — calm under pressure and zero shortcuts on craft",
    when: "yesterday",
    withPeople: ["Aarav", "Dev"],
    image: "/feed/ship.jpg",
    why: "Neha recognised you for this publicly yesterday. It is the most recent thing anyone said about your work — and it is about craft, which reads well outside.",
  },
  {
    id: "m2", kind: "shipped",
    what: "Cut new-joiner onboarding from nine days to four",
    when: "last week",
    withPeople: ["the Design team"],
    why: "The company posted about this publicly. You built it — a first-hand account will out-reach the company's own post.",
  },
  {
    id: "m3", kind: "certification",
    what: "Finished the accessibility certification",
    when: "2 weeks ago",
    why: "You completed this in Grow. Certifications are the single most-shared moment type on LinkedIn.",
  },
  {
    id: "m4", kind: "milestone",
    what: "Three years at oliandhue",
    when: "in 6 days",
    image: "/feed/milestone.jpg",
    why: "Coming up. We will remind you the morning it lands, which is when these get engagement.",
  },
];

/** Weeks she has shared in, oldest → newest. Feeds the quiet streak. */
export const myActiveWeeks = [false, true, true, false, true, true, true, true];

/** Her modelled reach, week by week — the same 8 weeks. */
export const myReachSeries = [0, 84, 130, 0, 96, 148, 171, 204];
export const reachWeekLabels = ["8w", "7w", "6w", "5w", "4w", "3w", "2w", "This"];

/** Her referral code — appended to any hiring post she shares. */
export const myReferralCode = "PS-4180";

/* ── admin: the programme side ─────────────────────────────────── */

/**
 * Posts waiting on a decision before they enter the advocacy queue.
 *
 * The current build has HR pushing posts with no review step, which is how a
 * post nobody wants their name on ends up in front of 12,000 people.
 */
export type QueueCandidate = {
  id: string;
  platform: Platform;
  text: string;
  image?: string;
  suggestedBy: string;
  /** Teams it is most relevant to — the fix for "not my area". */
  audience: string[];
  avgFollowers: number;
};

export const queueCandidates: QueueCandidate[] = [
  {
    id: "q1", platform: "LinkedIn",
    text: "Our apprenticeship intake doubled this year. Sixteen people started on the floor in March who had never worked in manufacturing.",
    image: "/feed/plant.jpg",
    suggestedBy: "Comms", audience: ["Plant Ops", "HR", "Logistics"], avgFollowers: 890,
  },
  {
    id: "q2", platform: "Instagram",
    text: "Diwali on the night shift. The canteen team cooked for 400 people at 2am so nobody missed it.",
    image: "/feed/milestone.jpg",
    suggestedBy: "Comms", audience: ["Night shift", "Plant Ops"], avgFollowers: 640,
  },
];

/** A coordinated burst tied to a moment, rather than a steady drip. */
export const advocacyCampaign = {
  name: "Apprenticeship intake",
  goal: "Fill 40 floor roles before the October intake closes",
  window: "12–26 Sept",
  targetShares: 120,
  shares: 47,
  /** Referral applications attributable to employee shares. */
  applications: 31,
  hires: 4,
  /** What one hire costs through an agency, for the comparison that matters. */
  agencyFeePerHire: 180000,
};

/** Referral attribution on the hiring post — the P&L defence. */
export const referrals = [
  { employee: "Anita Desai", clicks: 210, applications: 12, hired: 2 },
  { employee: "Ravi Prasad", clicks: 64, applications: 9, hired: 1 },
  { employee: "Meera Pillai", clicks: 118, applications: 7, hired: 1 },
  { employee: "Aarav Sharma", clicks: 41, applications: 3, hired: 0 },
];

/** The rules the policy check enforces, stated plainly for the person. */
export const socialPolicy = {
  updated: "March 2026",
  url: "/product/knowledge",
  summary: "Post as yourself, not as the company. Do not put unreleased numbers, customer names or people data in a public post.",
};

/* ── what fills the context rail ───────────────────────────────────
   The rail held three cards against a 2,245px column — a third of the screen
   was blank, and one of the three was a disclaimer. */

/**
 * Your own sending history.
 *
 * Note what is NOT here: engagement counts. We have no platform APIs and are not
 * getting them before the feasibility spike, so likes and comments on a personal
 * post are genuinely invisible to us. Estimating them and putting them next to
 * a real date would be inventing a number, which is the one thing this pillar
 * cannot afford — every other figure on this screen is already modelled and
 * labelled as such.
 *
 * What we honestly know: that you told us it went out, when, where, what you
 * said, and — only for a hiring post carrying your code — the clicks our own
 * redirect counted.
 */
export type SentShare = {
  id: string;
  platform: Platform;
  when: string;
  caption: string;
  /** Counted by our own redirect. Only exists on hiring posts. */
  referralClicks?: number;
  /** Whether this was your own moment or the company's post. */
  source: "moment" | "company";
};

export const mySentShares: SentShare[] = [
  { id: "s1", platform: "LinkedIn", when: "8 days ago", source: "moment",
    caption: "Aarav, Dev and I just cut new-joiner onboarding from nine days to four. Good week." },
  { id: "s2", platform: "LinkedIn", when: "3 weeks ago", source: "company", referralClicks: 34,
    caption: "We're hiring across engineering, ops and people — genuinely good team to land in." },
  { id: "s3", platform: "X", when: "5 weeks ago", source: "company",
    caption: "Sharing this from our team: 200 days without a lost-time incident on Plant Ops." },
];

/**
 * What good looks like.
 *
 * The most useful thing we can put in front of someone who has opted in and
 * then frozen: three captions colleagues actually sent. Nobody knows what to
 * write, and 58% of the people who passed on a post said it read too corporate
 * — showing what doesn't is a better fix than any amount of instruction.
 */
export const exemplarShares = [
  {
    name: "Anita Desai", img: "/avatars/user-5.svg", platform: "LinkedIn" as Platform, when: "last week",
    caption: "Spent Tuesday watching a new starter get set up in four days instead of nine. Small thing. Felt like the best day I've had here in a while.",
    why: "Specific and small. No adjectives about the company.",
  },
  {
    name: "Ravi Prasad", img: "/avatars/user-2.svg", platform: "X" as Platform, when: "2 weeks ago",
    caption: "200 days, no lost-time incidents on our line. That's a thousand small decisions made properly at 5am. Proud of this crew.",
    why: "First person, and it credits the people rather than the milestone.",
  },
  {
    name: "Meera Pillai", img: "/avatars/user-7.svg", platform: "Instagram" as Platform, when: "3 weeks ago",
    caption: "Three years today. Still the same reason I stayed.",
    why: "Eleven words. Length is not what makes a post land.",
  },
];

/**
 * The questions people actually ask before they opt in.
 *
 * These are the real objections and nothing in the product answered them. The
 * rail is emptiest in exactly the state where the job is reassurance rather
 * than statistics, which is where these belong.
 */
export const advocacyFaq: { q: string; a: string }[] = [
  {
    q: "Can my employer see my account?",
    a: "No. We never connect to your personal accounts and cannot read them. We do not know your handle, your follower count, or whether you posted — unless you tell us.",
  },
  {
    q: "Can Vadal post as me?",
    a: "No, and it is not a setting we can turn on. Every route ends with you pressing publish in the platform's own app. Posting on your behalf would need a permission you have not granted and a feasibility review that has not happened.",
  },
  {
    q: "Where does the reach number come from?",
    a: "It is modelled from typical follower counts and organic reach per platform — not measured. We show it as an order of magnitude and label it every time.",
  },
  {
    q: "What if I share something and regret it?",
    a: "It is your post on your account, so you delete it like any other. Nothing here can remove it for you, and nothing here keeps a copy of what you posted.",
  },
  {
    q: "Does declining count against me?",
    a: "No. Declines are never attributed to a person — comms only see the reasons in aggregate, so they can write better posts. Being able to say no is what keeps the yes worth having.",
  },
];

/** How the person wants to be asked. Defaults chosen so the first run is gentle. */
export type AdvocacyScope = "both" | "mine" | "company";
export const DEFAULT_PREFS: { scope: AdvocacyScope; voice: Voice; platform: Platform } = {
  scope: "both", voice: "warm", platform: "LinkedIn",
};
