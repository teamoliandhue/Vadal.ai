/* ════════════════════════════════════════════════════════════════════
   COMMUNITIES — the group object under Social (route /product/feed/groups).

   Channels are topics the company defines; a community is a room people
   choose to be in. Two kinds:
     · project  — a room around a piece of work, with a beginning and an end.
                  It carries the conversation, not the tasks: this is where a
                  launch is talked about, never where it is tracked.
     · interest — a standing circle around something people share.

   A community is created as a draft, then published; people join (or ask to,
   when it is closed) and leave. Posts inside one are ordinary feed posts that
   carry a GroupRef, so members see them in the company stream too.
   Seeds are static and deterministic so the demo is stable.
   ════════════════════════════════════════════════════════════════════ */
import type { FeedItem, GroupRef, Person } from "./feed";

const AV = (n: number) => `/avatars/user-${n}.svg`;
const P = (name: string, role: string, n: number): Person => ({ name, role, img: AV(n) });

export type GroupKind = "project" | "interest";
export type GroupPrivacy = "open" | "request";
export type GroupStatus = "published" | "draft";

export type Group = {
  id: string;
  kind: GroupKind;
  name: string;
  emoji: string;
  /** One line for the card. */
  desc: string;
  /** A paragraph for the About tab. */
  about: string;
  owner: Person;
  /** Headcount, not the roster length — the roster is a sample. */
  members: number;
  roster: Person[];
  privacy: GroupPrivacy;
  status: GroupStatus;
  tags: string[];
  postsThisWeek: number;
  /** "Active today" · "Quiet this week" */
  activity: string;
  /** Project rooms close; interest circles do not. */
  wraps?: string;
  /** True for one the signed-in person made (lives in their browser). */
  mine?: boolean;
};

export const KIND_LABEL: Record<GroupKind, string> = { project: "Project", interest: "Interest" };

export const EMOJI_CHOICES = ["🚀", "🛠️", "📦", "🧭", "🏃", "📚", "🎧", "🌱", "🍳", "📷", "♟️", "🎨", "💬", "🧘", "🚲", "🌍"];

const ROSTER_A = [P("Aarav S.", "Engineering", 2), P("Neha R.", "Design", 5), P("Meera Pillai", "Support", 7), P("Dev Patel", "Design", 3), P("Rahul Verma", "Sales", 1), P("Anita Rao", "Engineering", 10)];
const ROSTER_B = [P("Sara Mehta", "Support", 7), P("Arjun K.", "Operations", 4), P("Priya", "Product Designer", 8), P("Kabir Shah", "Warehouse lead", 6), P("Ishaan B.", "Finance", 9), P("Anita Desai", "Engineering", 5)];

export const groups: Group[] = [
  {
    id: "search-revamp", kind: "project", name: "Search revamp", emoji: "🚀",
    desc: "The room for the new search — ships, demos and what we learned.",
    about: "Everyone building or affected by the new search. Demos on Thursdays, decisions written down here so nobody has to ask twice. Tasks live in the tracker; this is where we talk about the work.",
    owner: P("Aarav S.", "Engineering", 2), members: 28, roster: ROSTER_A, privacy: "open", status: "published",
    tags: ["engineering", "design", "launch"], postsThisWeek: 14, activity: "Active today", wraps: "Wraps in October",
  },
  {
    id: "blr-warehouse", kind: "project", name: "Bengaluru warehouse go-live", emoji: "📦",
    desc: "Floor leads and ops getting the new site ready, shift by shift.",
    about: "One room for the floor and the office. Shift handovers, photos of what is ready, what is blocked and who is on it. Written for a phone on a break.",
    owner: P("Kabir Shah", "Warehouse lead", 6), members: 64, roster: ROSTER_B, privacy: "open", status: "published",
    tags: ["frontline", "operations"], postsThisWeek: 22, activity: "Active today", wraps: "Go-live 3 November",
  },
  {
    id: "billing-v2", kind: "project", name: "Billing v2 rollout", emoji: "🛠️",
    desc: "Finance, support and engineering on the same page for the cutover.",
    about: "The cutover plan, the comms to customers and the support macros, in one place. Closed because it carries customer names.",
    owner: P("Ishaan B.", "Finance", 9), members: 17, roster: ROSTER_B, privacy: "request", status: "published",
    tags: ["finance", "support"], postsThisWeek: 6, activity: "Active this week", wraps: "Wraps in December",
  },
  {
    id: "onboarding-crew", kind: "project", name: "Onboarding crew", emoji: "🧭",
    desc: "Making a new joiner's first week feel like we expected them.",
    about: "People team, buddies and managers. We share what worked for the last cohort and fix what did not before the next one starts.",
    owner: P("Neha R.", "Design", 5), members: 21, roster: ROSTER_A, privacy: "open", status: "published",
    tags: ["people", "culture"], postsThisWeek: 5, activity: "Active this week",
  },
  {
    id: "runners", kind: "interest", name: "Runners club", emoji: "🏃",
    desc: "Saturday 6 a.m. by the lake, and everyone who would rather not run alone.",
    about: "All paces. Post your route, your excuse or your first 5k. Bengaluru runs on Saturdays; everyone else, tell us where you are and someone will turn up.",
    owner: P("Rahul Verma", "Sales", 1), members: 112, roster: ROSTER_A, privacy: "open", status: "published",
    tags: ["health", "outdoors"], postsThisWeek: 18, activity: "Active today",
  },
  {
    id: "book-circle", kind: "interest", name: "Book circle", emoji: "📚",
    desc: "One book a month, one honest conversation at the end of it.",
    about: "We vote on the book in the first week and meet in the last. Fiction and non-fiction take turns. Audiobooks count.",
    owner: P("Priya", "Product Designer", 8), members: 46, roster: ROSTER_B, privacy: "open", status: "published",
    tags: ["reading", "culture"], postsThisWeek: 7, activity: "Active this week",
  },
  {
    id: "women-in-tech", kind: "interest", name: "Women in tech", emoji: "🌱",
    desc: "Mentoring, sponsorship and a room to say the thing out loud.",
    about: "Monthly circles, a mentoring match every quarter and a standing thread for wins. Ask to join — the room stays small enough to be candid.",
    owner: P("Anita Rao", "Engineering", 10), members: 58, roster: ROSTER_B, privacy: "request", status: "published",
    tags: ["mentoring", "careers"], postsThisWeek: 9, activity: "Active today",
  },
  {
    id: "parents", kind: "interest", name: "Parents at oliandhue", emoji: "🧘",
    desc: "School runs, sick days and the policies nobody told you about.",
    about: "Practical and kind. The leave policies explained by people who have used them, a hand-me-down thread and no judgement about screen time.",
    owner: P("Meera Pillai", "Support", 7), members: 39, roster: ROSTER_A, privacy: "open", status: "published",
    tags: ["family", "benefits"], postsThisWeek: 4, activity: "Quiet this week",
  },
  {
    id: "frontline-tips", kind: "interest", name: "Floor tips", emoji: "💬",
    desc: "Short tips from the floor, by the people on it.",
    about: "A trick that saves ten minutes on a shift is worth sharing. Photos welcome, thirty seconds to read, nothing that needs a laptop.",
    owner: P("Kabir Shah", "Warehouse lead", 6), members: 87, roster: ROSTER_B, privacy: "open", status: "published",
    tags: ["frontline", "how-to"], postsThisWeek: 16, activity: "Active today",
  },
  {
    id: "photo-walk", kind: "interest", name: "Photo walks", emoji: "📷",
    desc: "Phones and cameras, one walk a month, best frame wins the wall.",
    about: "We pick a neighbourhood, walk for two hours and post the keepers. The winning frame goes on the office wall for the month.",
    owner: P("Dev Patel", "Design", 3), members: 33, roster: ROSTER_A, privacy: "open", status: "published",
    tags: ["creative", "outdoors"], postsThisWeek: 3, activity: "Quiet this week",
  },
];

export const groupMap: Record<string, Group> = Object.fromEntries(groups.map((g) => [g.id, g]));

/** The rooms the demo person is already in, so the section never opens empty. */
export const DEFAULT_JOINED = ["search-revamp", "runners"];

export const refOf = (g: Pick<Group, "id" | "name" | "emoji">): GroupRef => ({ id: g.id, name: g.name, emoji: g.emoji });

/** What Nudge suggests, and why — shown only for rooms the person is not in. */
export const SUGGESTED: { id: string; why: string }[] = [
  { id: "onboarding-crew", why: "You buddied two new joiners this quarter." },
  { id: "book-circle", why: "Three people on your team are members." },
  { id: "frontline-tips", why: "Your posts about handovers did well here." },
];

const gp = (
  id: string, g: Group, author: Person, time: string, text: string,
  extra: Partial<FeedItem> = {},
): FeedItem => ({
  id, type: "post", author, channel: "", group: refOf(g), time, text,
  reactions: {}, reactedBy: [], comments: [], views: 40, ...extra,
});

const G = groupMap;

export const groupPosts: FeedItem[] = [
  gp("g-sr-1", G["search-revamp"], P("Aarav S.", "Engineering", 2), "3h",
    "Thursday demo: typo tolerance is in. **\"recieve\"** now finds receive, and the p95 is still under 120ms. Recording in the thread.",
    { pinned: true, reactions: { "🔥": 18, "👏": 11 }, reactedBy: [AV(5), AV(3)], views: 210,
      comments: [{ id: "g-sr-1c", author: P("Neha R.", "Design", 5), text: "The empty state copy finally makes sense with this.", time: "2h", likes: 4 }] }),
  gp("g-sr-2", G["search-revamp"], P("Neha R.", "Design", 5), "1d",
    "Which result layout should we take to the beta group?",
    { type: "poll", poll: { closesIn: "2 days", options: [{ id: "a", label: "Compact list", votes: 9 }, { id: "b", label: "Cards with preview", votes: 14 }, { id: "c", label: "Let people switch", votes: 6 }] }, reactions: { "💡": 5 }, views: 160 }),
  gp("g-sr-3", G["search-revamp"], P("Anita Rao", "Engineering", 10), "2d",
    "Decision, written down so nobody has to ask twice: we index on write, not nightly. Trade-off and numbers in the doc.",
    { reactions: { "🙌": 9 }, views: 120 }),
  gp("g-run-1", G["runners"], P("Rahul Verma", "Sales", 1), "5h",
    "Saturday, 6 a.m., the lake gate. Two loops for the brave, one for the sensible. Chai after. ☕",
    { type: "event", event: { title: "Saturday lake run", when: "Sat · 6:00 AM", where: "Ulsoor Lake, main gate", goingCount: 23, going: [AV(1), AV(2), AV(7)] }, reactions: { "🙌": 14, "🔥": 6 }, reactedBy: [AV(2)], views: 190 }),
  gp("g-run-2", G["runners"], P("Meera Pillai", "Support", 7), "1d",
    "First 5k without stopping. Eight weeks ago I could not do one. Thank you to everyone who ran slow with me. 🎉",
    { media: { src: "/feed/milestone.jpg", alt: "Finish line" }, reactions: { "🎉": 41, "❤️": 22, "👏": 17 }, reactedBy: [AV(1), AV(5), AV(3)], views: 320,
      comments: [{ id: "g-run-2c", author: P("Rahul Verma", "Sales", 1), text: "You set the pace for the last loop. Proud of you.", time: "22h", likes: 8 }] }),
  gp("g-wh-1", G["blr-warehouse"], P("Kabir Shah", "Warehouse lead", 6), "2h",
    "Dock 3 racking is signed off. Night shift: aisle C is live from tonight, scanners are charged and labelled by bay.",
    { pinned: true, reactions: { "👏": 26, "🙌": 9 }, reactedBy: [AV(4), AV(6)], views: 280 }),
  gp("g-wh-2", G["blr-warehouse"], P("Arjun K.", "Operations", 4), "9h",
    "Handover tip that saved us twenty minutes: photograph the pallet map before you clock out. Next shift starts from the photo, not from memory.",
    { reactions: { "💡": 19, "👏": 7 }, views: 150 }),
  gp("g-bk-1", G["book-circle"], P("Priya", "Product Designer", 8), "1d",
    "October's book — vote closes Friday.",
    { type: "poll", poll: { closesIn: "3 days", options: [{ id: "a", label: "The Covenant of Water", votes: 12 }, { id: "b", label: "Four Thousand Weeks", votes: 17 }, { id: "c", label: "Tomorrow, and Tomorrow, and Tomorrow", votes: 9 }] }, reactions: { "❤️": 6 }, views: 110 }),
  gp("g-ft-1", G["frontline-tips"], P("Sara Mehta", "Support", 7), "6h",
    "If the scanner will not read a creased label, tilt it 30° and step back half a pace. Works nine times in ten.",
    { reactions: { "💡": 33, "🙌": 12 }, reactedBy: [AV(6)], views: 240 }),
  gp("g-ob-1", G["onboarding-crew"], P("Neha R.", "Design", 5), "2d",
    "Last cohort's feedback in one line: **the laptop was ready, the calendar was not.** We are pre-booking week-one 1:1s from now on.",
    { reactions: { "👏": 13 }, views: 95 }),
];
