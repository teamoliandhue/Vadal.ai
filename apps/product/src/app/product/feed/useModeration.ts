"use client";
/* The review queue: posts held before publishing and posts people reported.

   One store for the whole product — the composer holds into it, the post menu
   reports into it, the Review tab decides on it, and the feed reads the
   decisions back (approved posts publish, removed posts disappear). Persisted in
   the browser; the demo has no server, so a hold made as an employee is there
   to review when you sign in as an admin. */
import * as React from "react";
import { feedItems, type FeedItem } from "@/lib/feed";
import { groupMap, refOf } from "@/lib/groups";
import { contextFor, type Finding } from "@/lib/ai/engines/moderation";

export type QueueStatus = "pending" | "approved" | "returned" | "kept" | "removed";

export type QueueItem = {
  id: string;
  kind: "held" | "reported";
  post: FeedItem;
  findings: Finding[];
  status: QueueStatus;
  /** When it arrived, relative ("25m", "now"). */
  at: string;
  /** Everyone who reported it (reported only). Moderators see how many, never who —
   *  a report that can be traced back is a report nobody makes twice. */
  reporters?: string[];
  /** Nudge's read of the context, for the moderator. */
  context?: string;
  /** Offer to raise it as a safety case in Flow. */
  safety?: boolean;
  /** The moderator's note back to the author. */
  note?: string;
  decidedBy?: string;
};

const AV = (n: number) => `/avatars/user-${n}.svg`;

const SEED: QueueItem[] = [
  {
    id: "q-safety", kind: "held", status: "pending", at: "25m", safety: true,
    post: {
      id: "held-safety", type: "post", channel: "", group: refOf(groupMap["frontline-tips"]), time: "25m",
      author: { name: "Ravi Prasad", role: "Line Operator · Plant Ops", img: AV(4) },
      text: "If night shift keeps leaving pallets in bay 4 someone is going to get hurt. Watch your back on the early shift.",
      reactions: {}, reactedBy: [], comments: [], views: 0,
    },
    findings: [{ kind: "threat", severity: "high", match: "watch your back", reason: "Possible threat or intimidation" }],
    context: "Reads as a warning about blocked bays rather than a threat to a person. It names a real hazard — worth raising as a safety case whatever you decide about the post.",
  },
  {
    id: "q-photo", kind: "held", status: "pending", at: "1h",
    post: {
      id: "held-photo", type: "post", channel: "wins", time: "1h",
      author: { name: "Meera Pillai", role: "Support", img: AV(7) },
      text: "Closed out the whole backlog today — 214 tickets! 🎉",
      media: { src: "/feed/screen.jpg", alt: "A laptop screen" },
      reactions: {}, reactedBy: [], comments: [], views: 0,
    },
    findings: [{ kind: "photo", severity: "high", reason: "Photo shows a screen with records on it — names or details may be readable" }],
    context: "The celebration is fine; the photo is the problem. Returning it with a note to use a different photo is usually all it needs.",
  },
  {
    id: "q-group", kind: "held", status: "pending", at: "3h",
    post: {
      id: "held-group", type: "post", channel: "random", time: "3h",
      author: { name: "Rahul Verma", role: "Sales", img: AV(1) },
      text: "Honestly women can't handle the night rota, we should stop putting them on it.",
      reactions: {}, reactedBy: [], comments: [], views: 0,
    },
    findings: [{ kind: "targeting", severity: "high", match: "women can't", reason: "Generalises about a group of people" }],
    context: "Generalises about colleagues by gender, and proposes treating them differently. Return it with a note; if it comes back in the same form, it belongs in Flow as a conduct case.",
  },
  {
    id: "q-report", kind: "reported", status: "pending", at: "40m", reporters: ["seed-colleague"],
    post: feedItems.find((p) => p.id === "f11")!,
    findings: [{ kind: "abuse", severity: "low", reason: "Reported for calling someone out" }],
    context: "Light-hearted and nobody is named. Most moderators keep posts like this up.",
  },
];

const KEY = "vadal:mod-queue-v1";
let items: QueueItem[] = SEED;
let loaded = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    items = raw ? (JSON.parse(raw) as QueueItem[]) : SEED;
  } catch { items = SEED; }
}
function write(next: QueueItem[]) {
  items = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  emit();
}
function subscribe(f: () => void) {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    read();
    window.addEventListener("storage", (e) => { if (e.key === KEY) { read(); emit(); } });
  }
  subs.add(f);
  return () => { subs.delete(f); };
}
const patch = (id: string, p: Partial<QueueItem>) => write(items.map((q) => (q.id === id ? { ...q, ...p } : q)));

export const moderation = {
  hold(post: FeedItem, findings: Finding[], safety: boolean) {
    /* "· You" is how the author sees their own name — not how anyone else does */
    const clean = { ...post, author: { ...post.author, role: post.author.role.replace(/\s*·\s*You$/, "") } };
    write([{ id: `q-${Date.now()}`, kind: "held", status: "pending", at: "now", post: clean, findings, safety, context: contextFor(findings, post.text, safety) }, ...items]);
  },
  /** One open report per post; more people reporting it adds to the count. False when this person already has. */
  report(post: FeedItem, reporter: string): boolean {
    const open = items.find((q) => q.kind === "reported" && q.post.id === post.id && q.status === "pending");
    if (open) {
      if (open.reporters?.includes(reporter)) return false;
      patch(open.id, { reporters: [...(open.reporters ?? []), reporter], at: "now" });
      return true;
    }
    write([{ id: `q-${Date.now()}`, kind: "reported", status: "pending", at: "now", post, reporters: [reporter], findings: [{ kind: "abuse", severity: "low", reason: "Reported by a colleague" }] }, ...items]);
    return true;
  },
  approve: (id: string, by: string) => patch(id, { status: "approved", decidedBy: by }),
  returnToAuthor: (id: string, note: string, by: string) => patch(id, { status: "returned", note, decidedBy: by }),
  keep: (id: string, by: string) => patch(id, { status: "kept", decidedBy: by }),
  remove: (id: string, note: string, by: string) => patch(id, { status: "removed", note, decidedBy: by }),
  /** The author takes it back — withdrawn before a decision, or dismissed after one. */
  drop: (id: string) => write(items.filter((q) => q.id !== id)),
};

export function useModeration() {
  const all = React.useSyncExternalStore(subscribe, () => items, () => SEED);
  return React.useMemo(() => {
    const approved = all.filter((q) => q.kind === "held" && q.status === "approved").map((q) => q.post);
    const removed = new Set(all.filter((q) => q.kind === "reported" && q.status === "removed").map((q) => q.post.id));
    const pending = all.filter((q) => q.status === "pending");
    return { items: all, approved, removed, pending, ...moderation };
  }, [all]);
}
