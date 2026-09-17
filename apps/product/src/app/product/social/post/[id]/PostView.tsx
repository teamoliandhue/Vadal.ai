"use client";
/* The full view of one post. The stream shows a post among others and the
   drawer gives it a quick look; this gives it the page — larger type, the whole
   conversation with room to read it, Nudge's read of the thread, and what else
   is being said in the same place. It is also what a shared link opens. */
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Link2, Lock } from "lucide-react";
import { Avatar, SparkMark } from "@vadal/design-system";
import { analyseSentiment } from "@/lib/ai/engines/text";
import { channelMap, feedItems, freshItems, type FeedItem } from "@/lib/feed";
import { groupPosts } from "@/lib/groups";
import {
  EngagementBar, EventBlock, KudosBlock, MilestoneBlock, PinnedTag, PollBlock,
  PostHeader, PostMedia, nfmt, type DisplayItem,
} from "../../parts";
import { CommentBox, CommentList } from "../../Thread";
import { PostText } from "../../Translate";
import { useFeedState } from "../../useFeedState";
import { useGroups } from "../../groups/useGroups";
import { useModeration } from "../../useModeration";
import { PANE, SPLIT } from "../../../panes";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

/* Nudge's read of a thread: how it feels and the comment people agreed with
   most. Computed from the comments themselves — no comments, no summary. */
function readThread(item: DisplayItem) {
  if (item.comments.length < 2) return null;
  const scores = item.comments.map((c) => analyseSentiment(c.text).score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const mood = avg > 0.05 ? "mostly positive" : avg < -0.05 ? "some concern in the replies" : "an even-toned thread";
  const top = [...item.comments].sort((a, b) => b.likes - a.likes)[0];
  return { mood, top, people: new Set(item.comments.map((c) => c.author.name)).size };
}

export function PostView({ id }: { id: string }) {
  const feed = useFeedState();
  const g = useGroups();
  const mod = useModeration();

  const source: FeedItem | undefined = React.useMemo(
    () => (mod.removed.has(id) ? undefined : [...feed.mine, ...mod.approved, ...freshItems, ...feedItems, ...groupPosts].find((p) => p.id === id)),
    [feed.mine, id, mod.approved, mod.removed],
  );
  const item = source ? feed.toDisplay(source) : null;

  if (!item) {
    /* a post I wrote is only known once localStorage has been read */
    if (!g.hydrated) return <div className="mx-auto w-full max-w-[1100px] py-10" aria-busy="true" />;
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-2 py-24 text-center">
        <SparkMark size={28} tone="gradient" state="idle" />
        <h1 className="text-[18px] font-bold text-ink">This post is not here</h1>
        <p className="text-[14px] text-muted">It may have been removed, or written on another device.</p>
        <Link href="/product/social" className="mt-3 text-[14px] font-semibold text-[var(--purple)] hover:underline">Back to the feed</Link>
      </div>
    );
  }

  const room = item.group ? g.byId[item.group.id] : undefined;
  const back = item.group ? { href: `/product/social/groups/${item.group.id}`, label: item.group.name } : { href: "/product/social", label: "Feed" };

  /* a closed community's post stays closed, link or no link */
  if (room && room.privacy === "request" && !g.isMember(room.id)) {
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-2 py-24 text-center">
        <Lock className="h-6 w-6 text-faint" />
        <h1 className="text-[18px] font-bold text-ink">This post is for members of {room.name}</h1>
        <p className="text-[14px] text-muted">Ask to join and {room.owner.name.split(" ")[0]} will let you in.</p>
        <Link href={back.href} className="mt-3 text-[14px] font-semibold text-[var(--purple)] hover:underline">Open {room.name}</Link>
      </div>
    );
  }

  const thread = readThread(item);
  const place = item.group ? `${item.group.emoji} ${item.group.name}` : channelMap[item.channel]?.name ?? "the feed";
  const more = [...feedItems, ...groupPosts]
    .filter((p) => p.id !== item.id && (item.group ? p.group?.id === item.group.id : !p.group && p.channel === item.channel))
    .slice(0, 4);
  const reactions = Object.values(item.reactions).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <div className={`${SPLIT} mx-auto max-w-[1100px] justify-center`}>
      <div tabIndex={0} aria-label="Post" className={`${PANE} w-full max-w-[680px] space-y-4`}>
        <Link href={back.href} className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-muted transition hover:text-ink lg:min-h-0">
          <ArrowLeft className="h-4 w-4" /> {back.label}
        </Link>

        <article className={`rounded-[22px] border bg-card p-5 sm:p-7 ${item.pinned ? "border-[var(--purple)]/35 ring-1 ring-[var(--purple)]/15" : "border-line"}`}>
          {item.pinned && <PinnedTag />}
          <PostHeader item={item} />
          {item.text && <PostText id={item.id} text={item.text} size="lg" />}

          {item.type === "kudos" && item.kudos && <KudosBlock kudos={item.kudos} />}
          {item.type === "poll" && item.poll && <PollBlock poll={item.poll} myVote={item.myVote} onVote={(o) => feed.vote(item.id, o)} />}
          {item.type === "event" && item.event && <EventBlock event={item.event} going={item.going} onGoing={() => feed.rsvp(item.id)} />}
          {item.type === "milestone" && item.milestone && <MilestoneBlock milestone={item.milestone} />}
          {item.media && <PostMedia media={item.media} />}

          <EngagementBar
            item={item}
            onReact={(e) => feed.react(item.id, e)}
            onComment={() => document.getElementById("post-comment")?.querySelector("textarea")?.focus()}
            onBookmark={() => feed.bookmark(item.id)}
            onShare={() => feed.share(item.id)}
          />
        </article>

        {/* Nudge's read of the thread */}
        {thread && (
          <section className="rounded-[22px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-5">
            <div className="flex items-center gap-2">
              <SparkMark size={18} tone="gradient" state="idle" />
              <h2 className="text-[15px] font-bold text-ink">The thread, in short</h2>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/90">
              {thread.people} {thread.people === 1 ? "person has" : "people have"} replied — {thread.mood}.
              {thread.top.likes > 0 && <> The reply most people agreed with is {thread.top.author.name.split(" ")[0]}&apos;s: “{thread.top.text}”</>}
            </p>
            <button
              onClick={() => ask(`Summarise the replies to ${item.author.name}'s post in ${place} and tell me if anything needs an answer.`)}
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)] transition hover:bg-[var(--ai-surface)] lg:min-h-[36px]"
            >
              <SparkMark size={14} tone="gradient" /> Ask Nudge what needs an answer
            </button>
          </section>
        )}

        {/* the conversation */}
        <section className="rounded-[22px] border border-line bg-card p-5 sm:p-7">
          <CommentList item={item} onLikeComment={feed.likeComment} />
          <div id="post-comment" className={item.commentCount > 0 ? "mt-5 border-t border-line pt-5" : "mt-4"}>
            <CommentBox key={item.id} postId={item.id} onComment={(t) => feed.addComment(item.id, t)} />
          </div>
        </section>
      </div>

      <aside tabIndex={0} aria-label="About this post" className={`hidden w-[320px] shrink-0 xl:block ${PANE}`}>
        <div className="space-y-4">
          <section className="rounded-[22px] border border-line bg-card p-5">
            <div className="flex items-center gap-3">
              <Avatar src={item.author.img} name={item.author.name} size="md" />
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-ink">{item.author.name}</div>
                <div className="truncate text-[12px] text-faint">{item.author.role}</div>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { n: nfmt(item.views), l: "views" },
                { n: `${item.commentCount}`, l: "comments" },
                { n: nfmt(reactions), l: "reactions" },
              ].map((s) => (
                <li key={s.l} className="rounded-xl bg-soft py-2.5">
                  <div className="text-[16px] font-bold tabular-nums text-ink">{s.n}</div>
                  <div className="text-[12px] text-faint">{s.l}</div>
                </li>
              ))}
            </ul>
            <button onClick={() => feed.share(item.id)} className="mt-3 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-[var(--purple)] ring-1 ring-line transition hover:bg-soft">
              <Link2 className="h-4 w-4" /> Copy link to this post
            </button>
          </section>

          {more.length > 0 && (
            <section className="rounded-[22px] border border-line bg-card p-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">More from {place}</h3>
              <div className="mt-2 space-y-0.5">
                {more.map((p) => (
                  <Link key={p.id} href={`/product/social/post/${p.id}`} className="-mx-2 flex items-start gap-2.5 rounded-xl px-2 py-2 transition hover:bg-soft">
                    <Avatar src={p.author.img} name={p.author.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink">{p.author.name} <span className="font-normal text-faint">· {p.time}</span></span>
                      <span className="line-clamp-2 block text-[13px] leading-snug text-muted">{p.text.replace(/\*\*/g, "")}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
