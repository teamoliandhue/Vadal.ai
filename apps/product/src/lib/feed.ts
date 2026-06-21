/* ════════════════════════════════════════════════════════════════════
   FEED — the company feed content layer (route /product/feed).
   A richer model than the Home feed widget: post types (announcement,
   kudos, poll, event, milestone, plain post), multi-emoji reactions,
   threaded comments, channels, and an AI "Catch me up" digest.
   All seeds are static + deterministic so the demo is stable.
   ════════════════════════════════════════════════════════════════════ */
import type { BadgeTone } from "@vadal/design-system";

const AV = (n: number) => `/avatars/user-${n}.svg`;

export type Person = { name: string; role: string; img: string };

export const REACTION_SET = ["👏", "❤️", "🎉", "🙌", "🔥", "💡"] as const;
export type ReactionEmoji = (typeof REACTION_SET)[number];

export type Comment = {
  id: string;
  author: Person;
  text: string;
  time: string;
  likes: number;
};

export type PollOption = { id: string; label: string; votes: number };

export type FeedType = "announcement" | "post" | "kudos" | "poll" | "event" | "milestone";

export type FeedItem = {
  id: string;
  type: FeedType;
  author: Person;
  channel: string; // Channel.id
  time: string;
  text: string;
  pinned?: boolean;
  media?: { src: string; alt: string };
  kudos?: { to: Person[]; values: string[] };
  poll?: { options: PollOption[]; closesIn: string };
  event?: { title: string; when: string; where: string; goingCount: number; going: string[] };
  milestone?: { emoji: string; headline: string };
  reactions: Partial<Record<ReactionEmoji, number>>;
  reactedBy: string[];
  comments: Comment[];
  views: number;
  bookmarked?: boolean;
};

export type Channel = {
  id: string;
  name: string; // "#company"
  label: string; // human label
  emoji: string;
  desc: string;
  posts: number; // posts this week
  tone: BadgeTone;
};

export const channels: Channel[] = [
  { id: "company", name: "#company", label: "Company news", emoji: "📣", desc: "Leadership & org-wide updates", posts: 6, tone: "brand" },
  { id: "wins", name: "#wins", label: "Wins & kudos", emoji: "🏆", desc: "Recognition and shoutouts", posts: 23, tone: "success" },
  { id: "product", name: "#product", label: "Product & ship", emoji: "🚀", desc: "What we're building", posts: 14, tone: "info" },
  { id: "wellbeing", name: "#wellbeing", label: "Wellbeing", emoji: "🌿", desc: "Health, balance & benefits", posts: 9, tone: "info" },
  { id: "people", name: "#people", label: "People & culture", emoji: "👋", desc: "Joiners, milestones & events", posts: 11, tone: "warning" },
  { id: "random", name: "#random", label: "Watercooler", emoji: "☕", desc: "Off-topic & fun", posts: 31, tone: "neutral" },
];

export const channelMap: Record<string, Channel> = Object.fromEntries(channels.map((c) => [c.id, c]));

const c = (id: string, author: Person, text: string, time: string, likes: number): Comment => ({
  id, author, text, time, likes,
});

export const feedItems: FeedItem[] = [
  {
    id: "f1",
    type: "announcement",
    author: { name: "Pradeep K.", role: "CEO", img: AV(6) },
    channel: "company",
    time: "2h",
    pinned: true,
    text: "Q2 wrapped strong — thank you all for the energy. 💜 Next week we kick off the **Wellbeing campaign**: focus weeks, no-meeting Wednesdays, and a refreshed benefits guide. Take the time — you've earned it.",
    media: { src: "/feed/art-wellbeing.svg", alt: "Wellbeing campaign" },
    reactions: { "❤️": 214, "🙌": 76, "🎉": 22 },
    reactedBy: [AV(5), AV(1), AV(7), AV(2)],
    views: 8420,
    comments: [
      c("f1c1", { name: "Neha R.", role: "Design", img: AV(5) }, "No-meeting Wednesdays are going to be huge for deep work 🙏", "1h", 18),
      c("f1c2", { name: "Aarav S.", role: "Engineering", img: AV(2) }, "Thank you for prioritising this 💜", "1h", 9),
      c("f1c3", { name: "Meera Pillai", role: "Support", img: AV(7) }, "Can't wait for the refreshed benefits guide!", "42m", 4),
    ],
  },
  {
    id: "f2",
    type: "kudos",
    author: { name: "Neha R.", role: "Design Lead", img: AV(5) },
    channel: "wins",
    time: "5h",
    text: "Shoutout to the crew for shipping the onboarding flow **ahead of schedule** — calm under pressure and zero shortcuts on craft. 👏",
    kudos: { to: [{ name: "Aarav S.", role: "Engineering", img: AV(2) }, { name: "Dev Patel", role: "Design", img: AV(3) }], values: ["Ownership", "Craft"] },
    reactions: { "👏": 142, "🔥": 38, "❤️": 21 },
    reactedBy: [AV(8), AV(2), AV(3), AV(1)],
    views: 3110,
    comments: [
      c("f2c1", { name: "Priya", role: "Product Designer", img: AV(8) }, "So well deserved — the empty states alone 🤌", "4h", 12),
      c("f2c2", { name: "Aarav S.", role: "Engineering", img: AV(2) }, "Team effort all the way 🙌", "3h", 6),
    ],
  },
  {
    id: "f3",
    type: "post",
    author: { name: "Aarav S.", role: "Engineering", img: AV(2) },
    channel: "product",
    time: "7h",
    text: "Shipped the new search — about **40% faster** on large workspaces. Thanks to everyone who stress-tested it over the weekend. Try a search and tell me what feels off.",
    media: { src: "/feed/art-ship.svg", alt: "New search shipped" },
    reactions: { "🔥": 64, "🎉": 18, "👏": 11 },
    reactedBy: [AV(5), AV(6), AV(4)],
    views: 2240,
    comments: [
      c("f3c1", { name: "Karan Joshi", role: "Plant Ops", img: AV(4) }, "Noticeably snappier on my end 👌", "6h", 5),
    ],
  },
  {
    id: "f4",
    type: "poll",
    author: { name: "People Team", role: "Company-wide", img: AV(8) },
    channel: "wellbeing",
    time: "9h",
    text: "We're adding one new wellbeing perk this quarter. **Which would you use most?** Your vote shapes the rollout.",
    poll: {
      closesIn: "2 days",
      options: [
        { id: "p1", label: "Monthly wellness stipend", votes: 412 },
        { id: "p2", label: "Extra mental-health day", votes: 388 },
        { id: "p3", label: "On-site fitness classes", votes: 124 },
        { id: "p4", label: "Quiet focus rooms", votes: 201 },
      ],
    },
    reactions: { "💡": 44, "🙌": 19 },
    reactedBy: [AV(1), AV(7)],
    views: 1980,
    comments: [
      c("f4c1", { name: "Sara Mehta", role: "Support", img: AV(7) }, "Tough one — stipend vs MH day 😅", "7h", 3),
    ],
  },
  {
    id: "f5",
    type: "event",
    author: { name: "People Team", role: "Company-wide", img: AV(8) },
    channel: "people",
    time: "1d",
    text: "Save the date — the **Summer offsite** is back. Two days, one coast, zero standups. Sign up so we can plan rooms.",
    media: { src: "/feed/art-offsite.svg", alt: "Summer offsite" },
    event: { title: "Summer offsite 2026", when: "Aug 14–15", where: "Goa", goingCount: 184, going: [AV(5), AV(2), AV(3), AV(1), AV(6)] },
    reactions: { "🎉": 156, "🔥": 48, "❤️": 33 },
    reactedBy: [AV(5), AV(2), AV(3), AV(6)],
    views: 4120,
    comments: [
      c("f5c1", { name: "Rahul Verma", role: "Sales · West", img: AV(1) }, "Counting down already 🏖️", "20h", 14),
      c("f5c2", { name: "Meera Pillai", role: "Support", img: AV(7) }, "Is the kayaking back on??", "18h", 7),
    ],
  },
  {
    id: "f6",
    type: "milestone",
    author: { name: "Vadal", role: "Milestones", img: AV(9) },
    channel: "people",
    time: "1d",
    text: "Three years of making Engineering better, calmer, and faster. Drop a note for Arjun 👇",
    milestone: { emoji: "🎉", headline: "Arjun Rao · 3 years at oliandhue" },
    reactions: { "🎉": 88, "❤️": 41, "🙌": 12 },
    reactedBy: [AV(2), AV(5), AV(8)],
    views: 1540,
    comments: [
      c("f6c1", { name: "Aarav S.", role: "Engineering", img: AV(2) }, "Best mentor on the team. Here's to many more 🥂", "22h", 22),
    ],
  },
  {
    id: "f7",
    type: "kudos",
    author: { name: "Rahul Verma", role: "Sales · West", img: AV(1) },
    channel: "wins",
    time: "1d",
    text: "Huge thanks to the **West team** for closing the quarter 14% over target — relentless, classy work. 🏆",
    kudos: { to: [{ name: "Sara Mehta", role: "Support", img: AV(7) }, { name: "Karan Joshi", role: "Plant Ops", img: AV(4) }], values: ["Grit", "Customer-first"] },
    reactions: { "👏": 96, "🔥": 27, "🎉": 14 },
    reactedBy: [AV(5), AV(6), AV(7)],
    views: 1720,
    comments: [],
  },
  {
    id: "f8",
    type: "announcement",
    author: { name: "People Team", role: "Company-wide", img: AV(8) },
    channel: "company",
    time: "2d",
    text: "The annual **engagement survey** opens Monday. 10 minutes, fully confidential — your voice shapes next quarter. Watch this space for the link.",
    reactions: { "🙌": 52, "👏": 19 },
    reactedBy: [AV(1), AV(2)],
    views: 2010,
    comments: [],
  },
  {
    id: "f9",
    type: "post",
    author: { name: "Meera Pillai", role: "Support", img: AV(7) },
    channel: "product",
    time: "2d",
    text: "Kudos to the weekend on-call crew — you kept every SLA green through the release. 🙌 The new alerting dashboard paid for itself this weekend.",
    reactions: { "🙌": 88, "❤️": 24 },
    reactedBy: [AV(2), AV(4)],
    views: 1190,
    comments: [],
  },
  {
    id: "f10",
    type: "post",
    author: { name: "Dev Patel", role: "Design", img: AV(3) },
    channel: "random",
    time: "3d",
    text: "The new cold brew tap on floor 3 is dangerously good. That is all. ☕",
    reactions: { "🔥": 41, "🎉": 12 },
    reactedBy: [AV(5), AV(8)],
    views: 640,
    comments: [
      c("f10c1", { name: "Priya", role: "Product Designer", img: AV(8) }, "Confirmed. I have notes.", "2d", 9),
    ],
  },
];

/* AI "Catch me up" — a seeded digest of what happened since the last visit. */
export const feedDigest = {
  since: "yesterday",
  newPosts: 12,
  highlights: [
    "**Pradeep** kicked off the Wellbeing campaign — no-meeting Wednesdays start next week.",
    "The **Summer offsite** is back (Aug 14–15, Goa) — 184 people are going so far.",
    "**Neha** recognised the onboarding crew for shipping early — your team got 2 kudos.",
  ],
  forYou: "Aarav tagged your team on the new search ship, and Arjun hit 3 years today.",
};

/* Right-rail context */
export const whosNew: Person[] = [
  { name: "Dev Patel", role: "Design · joined Mon", img: AV(3) },
  { name: "Anita Rao", role: "Engineering · joined Mon", img: AV(10) },
  { name: "Sara Mehta", role: "Support · joined last wk", img: AV(7) },
];

export const trendingTopics = [
  { tag: "#wellbeing", posts: 9, blurb: "Campaign kickoff & perk vote" },
  { tag: "#offsite", posts: 7, blurb: "Summer offsite is back" },
  { tag: "#shipit", posts: 5, blurb: "Search is 40% faster" },
  { tag: "#kudos", posts: 23, blurb: "Recognition is up 18% this week" },
];

export const VALUE_TONE: Record<string, BadgeTone> = {
  Ownership: "brand",
  Craft: "info",
  Grit: "warning",
  "Customer-first": "success",
};
