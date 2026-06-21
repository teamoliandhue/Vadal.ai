"use client";
/* The Feed section orchestrator. Holds all interaction state (reactions, votes,
   bookmarks, comments, RSVPs, my posts) — persisted to localStorage — derives the
   display items, filters by channel, sorts by Trending/Recent, and renders the
   stream + composer + right rail + post-detail drawer. */
import * as React from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  feedItems, type Comment, type FeedItem, type ReactionEmoji,
} from "@/lib/feed";
import { me } from "@/lib/data";
import { Composer } from "./Composer";
import { PostCard } from "./PostCard";
import { PostDrawer } from "./PostDrawer";
import { RightRail } from "./RightRail";
import { type DisplayItem } from "./parts";
import { toast } from "../Toaster";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
type Sort = "trending" | "recent";

function score(it: FeedItem) {
  const reacts = Object.values(it.reactions).reduce((s, n) => s + (n ?? 0), 0);
  return reacts + it.comments.length * 3 + it.views / 200;
}

export function FeedHub() {
  const [mine, setMine] = usePersistentState<FeedItem[]>("vadal:feed2-mine", []);
  const [reacts, setReacts] = usePersistentState<Record<string, ReactionEmoji>>("vadal:feed2-reacts", {});
  const [votes, setVotes] = usePersistentState<Record<string, string>>("vadal:feed2-votes", {});
  const [bookmarks, setBookmarks] = usePersistentState<string[]>("vadal:feed2-bookmarks", []);
  const [myComments, setMyComments] = usePersistentState<Record<string, Comment[]>>("vadal:feed2-comments", {});
  const [going, setGoing] = usePersistentState<string[]>("vadal:feed2-going", []);
  const [likedC, setLikedC] = usePersistentState<string[]>("vadal:feed2-likedc", []);

  const [channel, setChannel] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<Sort>("trending");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const topRef = React.useRef<HTMLDivElement>(null);

  // Simulated "new posts arrived" pill (a live feed feels alive).
  React.useEffect(() => {
    const t = window.setTimeout(() => setShowNew(true), 7000);
    return () => window.clearTimeout(t);
  }, []);

  const toDisplay = React.useCallback((it: FeedItem): DisplayItem => {
    const myReaction = reacts[it.id];
    const reactions = { ...it.reactions };
    if (myReaction) reactions[myReaction] = (reactions[myReaction] ?? 0) + 1;
    const comments = [...it.comments, ...(myComments[it.id] ?? [])].map((cm) => ({
      ...cm, likes: cm.likes + (likedC.includes(cm.id) ? 1 : 0),
    }));
    return {
      ...it, reactions, myReaction,
      myVote: votes[it.id],
      bookmarked: bookmarks.includes(it.id),
      going: going.includes(it.id),
      comments,
      commentCount: comments.length,
    };
  }, [reacts, votes, bookmarks, myComments, going, likedC]);

  const all = React.useMemo(() => [...mine, ...feedItems].map(toDisplay), [mine, toDisplay]);

  const stream = React.useMemo(() => {
    const filtered = channel ? all.filter((it) => it.channel === channel) : all;
    const pinned = filtered.filter((it) => it.pinned);
    const rest = filtered.filter((it) => !it.pinned);
    rest.sort((a, b) => (sort === "trending" ? score(b) - score(a) : 0)); // recent = source order (mine first)
    return [...pinned, ...rest];
  }, [all, channel, sort]);

  const openItem = openId ? all.find((it) => it.id === openId) ?? null : null;

  /* ── handlers ─────────────────────────────────────────────────── */
  const react = (id: string, e: ReactionEmoji) =>
    setReacts((p) => { const n = { ...p }; if (n[id] === e) delete n[id]; else n[id] = e; return n; });
  const bookmark = (id: string) =>
    setBookmarks((p) => { const on = p.includes(id); if (!on) toast("Saved to bookmarks 🔖"); return on ? p.filter((x) => x !== id) : [...p, id]; });
  const vote = (id: string, optionId: string) =>
    setVotes((p) => (p[id] ? p : { ...p, [id]: optionId }));
  const rsvp = (id: string) =>
    setGoing((p) => { const on = p.includes(id); if (!on) toast("You're going 🎉"); return on ? p.filter((x) => x !== id) : [...p, id]; });
  const likeComment = (cid: string) =>
    setLikedC((p) => (p.includes(cid) ? p.filter((x) => x !== cid) : [...p, cid]));
  const addComment = (id: string, text: string) => {
    const cm: Comment = { id: `c-${Date.now()}`, author: { name: me.fullName, role: "You", img: me.img }, text, time: "now", likes: 0 };
    setMyComments((p) => ({ ...p, [id]: [...(p[id] ?? []), cm] }));
  };
  const share = () => toast("Post link copied ✓");
  const menu = (label: string) => toast(label === "Report" ? "Reported — thank you" : `${label} ✓`);
  const addPost = (item: FeedItem) => { setMine((m) => [item, ...m]); setChannel(null); setSort("recent"); };

  const refresh = () => { setShowNew(false); setSort("recent"); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div ref={topRef} className="mx-auto flex w-full max-w-[1100px] justify-center gap-6">
      {/* main column */}
      <div className="w-full max-w-[640px] space-y-4">
        {/* header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-ink">Feed</h1>
            <p className="text-[14px] text-muted">What&apos;s happening across oliandhue.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => ask("Catch me up on the company feed — what did I miss and what needs my attention?")}
              className="flex items-center gap-1.5 rounded-full bg-[var(--ai-surface)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)] transition hover:opacity-90 xl:hidden"
            >
              <Sparkles className="h-4 w-4" /> Catch me up
            </button>
            <div className="flex rounded-full bg-soft p-0.5 text-[13px] font-semibold">
              {(["trending", "recent"] as Sort[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-full px-3 py-1.5 capitalize transition ${sort === s ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </header>

        <Composer onPost={addPost} />

        {/* new posts pill */}
        {showNew && (
          <div className="flex justify-center">
            <button onClick={refresh} className="ai-pop flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-[var(--card)] shadow-lg transition hover:opacity-90">
              <ArrowUp className="h-3.5 w-3.5" /> 3 new posts
            </button>
          </div>
        )}

        {/* active channel banner */}
        {channel && (
          <div className="flex items-center justify-between rounded-xl bg-[var(--lav)] px-4 py-2 text-[13px]">
            <span className="font-semibold text-[var(--purple)]">Filtered to this channel</span>
            <button onClick={() => setChannel(null)} className="font-semibold text-muted hover:text-ink">Clear</button>
          </div>
        )}

        {/* stream */}
        {stream.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line py-16 text-center">
            <SparkMark size={28} tone="gradient" state="idle" />
            <p className="text-[15px] font-semibold text-ink">Nothing in this channel yet</p>
            <p className="text-[14px] text-faint">Be the first to post — or clear the filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stream.map((it) => (
              <PostCard
                key={it.id}
                item={it}
                onReact={(e) => react(it.id, e)}
                onBookmark={() => bookmark(it.id)}
                onVote={(o) => vote(it.id, o)}
                onGoing={() => rsvp(it.id)}
                onOpen={() => setOpenId(it.id)}
                onShare={share}
                onMenu={menu}
              />
            ))}
          </div>
        )}
      </div>

      <RightRail activeChannel={channel} onPickChannel={setChannel} />

      <PostDrawer
        item={openItem}
        onClose={() => setOpenId(null)}
        onReact={(e) => openItem && react(openItem.id, e)}
        onBookmark={() => openItem && bookmark(openItem.id)}
        onVote={(o) => openItem && vote(openItem.id, o)}
        onGoing={() => openItem && rsvp(openItem.id)}
        onShare={share}
        onComment={(t) => openItem && addComment(openItem.id, t)}
        onLikeComment={likeComment}
      />
    </div>
  );
}
