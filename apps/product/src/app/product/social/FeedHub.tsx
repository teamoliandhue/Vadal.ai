"use client";
/* The Feed section orchestrator. Holds all interaction state (reactions, votes,
   bookmarks, comments, RSVPs, my posts) — persisted to localStorage — derives the
   display items and renders the stream + composer + right rail + drawer.

   Views (Social v2, spec 044): For you · Latest · Popular · Must read ·
   Questions · Saved. Sorting and "what kind of post" used to be split between a
   segmented control and nothing at all — must-reads and questions had nowhere
   to be found, and bookmarks had no place to go back to. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, BadgeCheck, Info, Sparkles } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { feedItems, freshItems, type FeedItem } from "@/lib/feed";
import { groupPosts } from "@/lib/groups";
import { Composer } from "./Composer";
import { PostCard } from "./PostCard";
import { PostDrawer } from "./PostDrawer";
import { RightRail } from "./RightRail";
import { SocialTabs } from "./SocialTabs";
import { rankFeed } from "@/lib/ai/engines/personalize";
import { TOPIC_LABEL, tagPost } from "@/lib/ai/engines/text";
import { useProfile } from "../useProfile";
import { score, timeMins, useFeedState } from "./useFeedState";
import { useGroups } from "./groups/useGroups";
import { useModeration } from "./useModeration";
import { PendingPosts } from "./PendingPosts";
import { useMe } from "../useSession";
import { PANE, SPLIT } from "../panes";
import { toast } from "../Toaster";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
type View = "foryou" | "latest" | "popular" | "mustread" | "questions" | "saved";
const VIEWS: { id: View; label: string }[] = [
  { id: "foryou", label: "For you" }, { id: "latest", label: "Latest" }, { id: "popular", label: "Popular" },
  { id: "mustread", label: "Must read" }, { id: "questions", label: "Questions" }, { id: "saved", label: "Saved" },
];
const EMPTY: Record<View, [string, string]> = {
  foryou: ["Nothing here yet", "Be the first to post — or clear the filter."],
  latest: ["Nothing here yet", "Be the first to post — or clear the filter."],
  popular: ["Nothing here yet", "Be the first to post — or clear the filter."],
  mustread: ["Nothing to confirm", "When someone asks everyone to read something, it waits here until you've confirmed."],
  questions: ["No questions here", "Ask one from the box above — Nudge checks Knowledge before anyone has to answer."],
  saved: ["Nothing saved yet", "Tap the bookmark on any post to keep it here."],
};

const FRESH = freshItems;

export function FeedHub() {
  const { mine, toDisplay, react, bookmark, vote, rsvp, likeComment, addComment, addMine, share, menu, acknowledge, acceptAnswer } = useFeedState();
  const { mineList } = useGroups();
  const me = useMe();
  const mod = useModeration();
  const myRooms = React.useMemo(() => new Set(mineList.map((g) => g.id)), [mineList]);

  const [channel, setChannel] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>("foryou");
  const [topic, setTopic] = React.useState<string | null>(null);
  const profile = useProfile();
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
    /* held posts join the stream once approved; reported posts leave it once removed */
    return [...extra, ...mine, ...mod.approved, ...feedItems, ...groupPosts]
      .filter((it) => inMyRooms(it) && !mod.removed.has(it.id))
      .map(toDisplay);
  }, [extra, mine, toDisplay, myRooms, mod.approved, mod.removed]);
  const myQueue = mod.items.filter((q) => q.kind === "held" && !q.post.group && q.post.author.name === me.fullName && (q.status === "pending" || q.status === "returned"));

  /* Nudge tags every post (topic + sentiment) as it is read — the tags drive the
     topic filter and the For you ranking, and are never typed by anyone. */
  const tagged = React.useMemo(() => all.map((it) => ({ it, topics: tagPost(it.text ?? "").topics })), [all]);
  const topics = React.useMemo(() => {
    const n = new Map<string, number>();
    for (const t of tagged) for (const k of t.topics) n.set(k, (n.get(k) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  }, [tagged]);

  const counts = React.useMemo(() => ({
    mustread: all.filter((it) => it.ack && !it.ackedOn).length,
    questions: all.filter((it) => it.type === "question" && !it.acceptedId).length,
    saved: all.filter((it) => it.bookmarked).length,
  }), [all]);

  const stream = React.useMemo(() => {
    const byTopic = topic ? tagged.filter((t) => t.topics.includes(topic)).map((t) => t.it) : all;
    const byView = view === "mustread" ? byTopic.filter((it) => it.ack)
      : view === "questions" ? byTopic.filter((it) => it.type === "question")
      : view === "saved" ? byTopic.filter((it) => it.bookmarked)
      : byTopic;
    const filtered = channel ? byView.filter((it) => it.channel === channel) : byView;
    const byTime = (a: FeedItem, b: FeedItem) => timeMins(a.time) - timeMins(b.time);
    /* The two filtered views put what still needs you first. */
    if (view === "mustread") return [...filtered].sort((a, b) => Number(Boolean(a.ackedOn)) - Number(Boolean(b.ackedOn)) || byTime(a, b));
    if (view === "questions") return [...filtered].sort((a, b) => Number(Boolean(a.acceptedId)) - Number(Boolean(b.acceptedId)) || byTime(a, b));
    if (view === "saved") return [...filtered].sort(byTime);
    /* a pin inside a community is that room's pin, not the company's */
    const pinned = filtered.filter((it) => it.pinned && !it.group);
    const rest = filtered.filter((it) => !it.pinned || it.group).map((it) => (it.group ? { ...it, pinned: false } : it));
    if (view === "foryou") {
      const topicsOf = new Map(tagged.map((t) => [t.it.id, t.topics]));
      const ranked = rankFeed(
        rest.map((it) => ({
          ...it,
          topics: topicsOf.get(it.id) ?? [],
          team: it.group ? undefined : it.author.role.split("·").pop()?.trim(),
          ageHours: timeMins(it.time) / 60,
          companyWide: it.channel === "company" || it.type === "announcement",
          engagement: score(it),
        })),
        profile,
      );
      const ordered = ranked.map((r) => rest.find((x) => x.id === r.id)!);
      /* a must-read you haven't confirmed comes up under the pins */
      const due = ordered.filter((it) => it.ack && !it.ackedOn);
      return [...pinned, ...due, ...ordered.filter((it) => !(it.ack && !it.ackedOn))];
    }
    rest.sort((a, b) => (view === "popular" ? score(b) - score(a) : timeMins(a.time) - timeMins(b.time)));
    return [...pinned, ...rest];
  }, [all, channel, view, topic, tagged, profile]);

  const openItem = openId ? all.find((it) => it.id === openId) ?? null : null;

  const report = (it: FeedItem) =>
    toast(mod.report(it, me.fullName) ? "Reported — a moderator will look. It stays up until they decide." : "You've already reported this one");
  const addPost = (item: FeedItem) => { addMine(item); setChannel(null); setTopic(null); setView(item.type === "question" ? "questions" : "latest"); };

  const refresh = () => {
    setExtra(FRESH); setShowNew(false); setView("latest");
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
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">Social</h1>
            <p className="text-[14px] text-muted">What&apos;s happening across oliandhue.</p>
          </div>
          <button
            onClick={() => ask("Catch me up on the company feed — what did I miss and what needs my attention?")}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-[var(--ai-surface)] px-3.5 text-[13px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)] transition hover:opacity-90 xl:hidden"
          >
            <Sparkles className="h-4 w-4" /> Catch me up
          </button>
        </header>

        {/* views — one row, scrolls sideways on a phone rather than wrapping */}
        <nav aria-label="Feed views" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
          {VIEWS.map((v) => {
            const on = view === v.id;
            const n = v.id === "mustread" ? counts.mustread : v.id === "questions" ? counts.questions : v.id === "saved" ? counts.saved : 0;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                aria-pressed={on}
                className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[36px] ${on ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}
              >
                {v.label}
                {n > 0 && (
                  <span className={`min-w-[20px] rounded-full px-1.5 text-center text-[12px] tabular-nums ${on ? "bg-[var(--card)]/20" : v.id === "mustread" ? "bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]" : "bg-soft text-muted"}`}>{n}</span>
                )}
              </button>
            );
          })}
        </nav>

        <Composer onPost={addPost} />
        <PendingPosts items={myQueue} />

        {/* something only you can do, surfaced once, above the stream */}
        {view === "foryou" && counts.mustread > 0 && (
          <button
            onClick={() => setView("mustread")}
            className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 text-left transition hover:opacity-90"
            style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--warning) 26%, transparent)" }}
          >
            <BadgeCheck className="h-5 w-5 shrink-0 text-[var(--warning)]" />
            <span className="min-w-0 flex-1 text-[14px] text-ink">
              <span className="font-semibold">{counts.mustread} must-read {counts.mustread === 1 ? "post needs" : "posts need"} your confirmation</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
          </button>
        )}

        {/* your communities — the rail holds these from xl; below it they'd be unreachable */}
        {mineList.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] xl:hidden" aria-label="Your communities">
            {mineList.map((g) => (
              <Link key={g.id} href={`/product/social/groups/${g.id}`} className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-line bg-card py-1 pl-1.5 pr-3.5 text-[13px] font-semibold text-ink transition hover:border-[var(--purple)]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--lav)] text-[15px]" aria-hidden>{g.emoji}</span>
                {g.name}
                {g.status !== "draft" && g.postsThisWeek > 0 && <span className="text-[12px] font-normal text-faint">{g.postsThisWeek} new</span>}
              </Link>
            ))}
            <Link href="/product/social/groups" className="flex min-h-[44px] shrink-0 items-center rounded-full px-3.5 text-[13px] font-semibold text-[var(--purple)]">Browse all</Link>
          </div>
        )}

        {/* topics Nudge found in the posts — one line */}
        <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]" role="group" aria-label="Topics">
          <span
            className="flex shrink-0 items-center gap-1 pr-1 text-[12px] font-semibold text-faint"
            title={view === "foryou" ? "For you ranks posts by your team, what you react to and the rooms you're in. Company-wide moments always stay in." : "Nudge tags every post with its topics as it's read."}
          >
            <SparkMark size={12} tone="gradient" /> Topics {view === "foryou" && <Info className="h-3 w-3" aria-label="How For you is ranked" />}
          </span>
          {[null, ...topics].map((k) => (
            <button
              key={k ?? "all"}
              onClick={() => setTopic(k)}
              aria-pressed={topic === k}
              className={`min-h-[44px] shrink-0 rounded-full px-3 text-[13px] font-semibold transition lg:min-h-[30px] ${topic === k ? "bg-[var(--lav)] text-[var(--purple)]" : "text-muted hover:bg-soft hover:text-ink"}`}
            >
              {k ? TOPIC_LABEL[k] ?? k : "All topics"}
            </button>
          ))}
        </div>

        {/* new posts pill */}
        {showNew && (
          <div className="flex justify-center">
            <button onClick={refresh} className="ai-pop flex min-h-[44px] items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-[var(--card)] shadow-lg transition hover:opacity-90 lg:min-h-[36px]">
              <ArrowUp className="h-3.5 w-3.5" /> {FRESH.length} new posts
            </button>
          </div>
        )}

        {/* active channel banner */}
        {channel && (
          <div className="flex items-center justify-between rounded-xl bg-[var(--lav)] px-4 py-2 text-[13px]">
            <span className="font-semibold text-[var(--purple)]">Filtered to this channel</span>
            <button onClick={() => setChannel(null)} className="min-h-[44px] font-semibold text-muted hover:text-ink lg:min-h-0">Clear</button>
          </div>
        )}

        {/* stream */}
        {stream.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
            <SparkMark size={28} tone="gradient" state="idle" />
            <p className="text-[15px] font-semibold text-ink">{EMPTY[view][0]}</p>
            <p className="max-w-[360px] text-[14px] text-faint">{topic || channel ? "Nothing matches this filter — clear it to see more." : EMPTY[view][1]}</p>
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
                onMenu={(l) => (l === "Report" ? report(it) : menu(l))}
                onAck={() => acknowledge(it.id)}
                onComment={(t) => addComment(it.id, t)}
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
        onAck={() => openItem && acknowledge(openItem.id)}
        onAccept={(cid) => openItem && acceptAnswer(openItem.id, cid)}
      />
    </div>
  );
}
