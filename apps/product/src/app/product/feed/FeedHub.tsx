"use client";
/* The Feed section orchestrator. Holds all interaction state (reactions, votes,
   bookmarks, comments, RSVPs, my posts) — persisted to localStorage — derives the
   display items, filters by channel, sorts by Trending/Recent, and renders the
   stream + composer + right rail + post-detail drawer. */
import * as React from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { feedItems, freshItems, type FeedItem } from "@/lib/feed";
import { groupPosts } from "@/lib/groups";
import { Composer } from "./Composer";
import { PostCard } from "./PostCard";
import { PostDrawer } from "./PostDrawer";
import { RightRail } from "./RightRail";
import { SocialTabs } from "./SocialTabs";
import { score, timeMins, useFeedState } from "./useFeedState";
import { useGroups } from "./groups/useGroups";
import { PANE, SPLIT } from "../panes";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
type Sort = "trending" | "recent";

const FRESH = freshItems;

export function FeedHub() {
  const { mine, toDisplay, react, bookmark, vote, rsvp, likeComment, addComment, addMine, share, menu } = useFeedState();
  const { mineList } = useGroups();
  const myRooms = React.useMemo(() => new Set(mineList.map((g) => g.id)), [mineList]);

  const [channel, setChannel] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<Sort>("trending");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [extra, setExtra] = React.useState<FeedItem[]>([]); // posts the "new posts" pill delivers
  const topRef = React.useRef<HTMLDivElement>(null);

  // Simulated "new posts arrived" pill (a live feed feels alive).
  React.useEffect(() => {
    const t = window.setTimeout(() => setShowNew(true), 7000);
    return () => window.clearTimeout(t);
  }, []);

  /* The company stream, plus what was said in the rooms you are in. A post
     from a community you have not joined stays in that community. */
  const all = React.useMemo(() => {
    const inMyRooms = (it: FeedItem) => !it.group || myRooms.has(it.group.id);
    return [...extra, ...mine, ...feedItems, ...groupPosts].filter(inMyRooms).map(toDisplay);
  }, [extra, mine, toDisplay, myRooms]);

  const stream = React.useMemo(() => {
    const filtered = channel ? all.filter((it) => it.channel === channel) : all;
    /* a pin inside a community is that room's pin, not the company's */
    const pinned = filtered.filter((it) => it.pinned && !it.group);
    const rest = filtered.filter((it) => !it.pinned || it.group).map((it) => (it.group ? { ...it, pinned: false } : it));
    rest.sort((a, b) => (sort === "trending" ? score(b) - score(a) : timeMins(a.time) - timeMins(b.time)));
    return [...pinned, ...rest];
  }, [all, channel, sort]);

  const openItem = openId ? all.find((it) => it.id === openId) ?? null : null;

  const addPost = (item: FeedItem) => { addMine(item); setChannel(null); setSort("recent"); };

  const refresh = () => {
    setExtra(FRESH); setShowNew(false); setSort("recent");
    /* The stream is its own scroll region at xl and just part of the page
       below it, so ask the right thing to move. */
    const el = topRef.current;
    if (!el) return;
    if (getComputedStyle(el).overflowY === "auto") el.scrollTop = 0;
    else el.scrollIntoView({ block: "start" });
    /* Deliberately not a smooth glide. You pressed "2 new posts" to see the two
       new posts, and the list has just been re-sorted underneath you — sliding
       through 2,000px of reshuffling content is neither faster nor calmer than
       arriving. (It is also not honoured on a nested scroller everywhere.) */
  };

  return (
    /* Two scroll regions from xl up (see ../panes): the stream and the rail
       each keep their own place. Before this the rail rode along with the
       stream and then jammed against the top of the window, which put the
       bottom of the channel list permanently out of reach. */
    <div className={`${SPLIT} mx-auto max-w-[1100px] justify-center`}>
      {/* the stream */}
      <div ref={topRef} tabIndex={0} aria-label="Social" className={`${PANE} w-full max-w-[640px] space-y-4`}>
        <SocialTabs active="feed" count={mineList.length} />

        {/* header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-ink">Social</h1>
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
              <ArrowUp className="h-3.5 w-3.5" /> {FRESH.length} new posts
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
                onShare={() => share(it.id)}
                onMenu={menu}
              />
            ))}
          </div>
        )}
      </div>

      <RightRail activeChannel={channel} onPickChannel={setChannel} myGroups={mineList} />

      <PostDrawer
        item={openItem}
        onClose={() => setOpenId(null)}
        onReact={(e) => openItem && react(openItem.id, e)}
        onBookmark={() => openItem && bookmark(openItem.id)}
        onVote={(o) => openItem && vote(openItem.id, o)}
        onGoing={() => openItem && rsvp(openItem.id)}
        onShare={() => openItem && share(openItem.id)}
        onComment={(t) => openItem && addComment(openItem.id, t)}
        onLikeComment={likeComment}
      />
    </div>
  );
}
