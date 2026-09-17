"use client";
/* A single post in the feed stream. Composes the shared parts, adds a "..." menu
   (pin / mute / report) and a top-comment preview, and exposes the actions the
   FeedHub wires to state. The whole body is clickable to open the detail Drawer. */
import * as React from "react";
import { MoreHorizontal, Pin, BellOff, Flag } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import type { ReactionEmoji } from "@/lib/feed";
import { EngagementBar, PostHeader, type DisplayItem } from "./parts";
import { PostBlocks, PostKicker, QuickReply } from "./PostBlocks";
import { PostText } from "./Translate";

function PostMenu({ onAction }: { onAction: (label: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const items = [
    { label: "Pin to top", icon: Pin },
    { label: "Mute this channel", icon: BellOff },
    { label: "Report", icon: Flag },
  ];
  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Post options"
        className="grid h-11 w-11 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink lg:h-8 lg:w-8"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => { setOpen(false); onAction(it.label); }}
              className="flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] text-ink transition hover:bg-soft lg:min-h-0"
            >
              <it.icon className="h-4 w-4 text-faint" /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PostCard({
  item, onReact, onBookmark, onVote, onGoing, onOpen, onShare, onMenu, onAck, onComment,
}: {
  item: DisplayItem;
  onReact: (e: ReactionEmoji) => void;
  onBookmark: () => void;
  onVote: (optionId: string) => void;
  onGoing: () => void;
  onOpen: () => void;
  onShare: () => void;
  onMenu: (label: string) => void;
  onAck?: () => void;
  onComment?: (text: string) => void;
}) {
  // A question's answer is shown in its own block, so it isn't repeated as the top comment.
  const topComment = item.type === "question" ? undefined : item.comments[item.comments.length - 1]?.time === "now" ? item.comments[item.comments.length - 1] : item.comments[0];
  return (
    <article
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`Open post by ${item.author.name}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className={`group card-lift cursor-pointer rounded-[22px] border bg-card p-5 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--purple)] sm:p-6 ${
        item.pinned ? "border-[var(--purple)]/35 ring-1 ring-[var(--purple)]/15" : "border-line"
      }`}
    >
      <PostKicker item={item} />
      <PostHeader item={item} trailing={<PostMenu onAction={onMenu} />} />

      {item.text && <PostText id={item.id} text={item.text} />}

      <PostBlocks item={item} actions={{ onVote, onGoing, onAck, onOpen, onComment }} />

      <div onClick={(e) => e.stopPropagation()}>
        <EngagementBar item={item} onReact={onReact} onComment={onOpen} onBookmark={onBookmark} onShare={onShare} />
      </div>

      {topComment && (
        <button onClick={onOpen} className="mt-2.5 flex min-h-[44px] w-full items-start gap-2 rounded-xl px-1 py-1 text-left transition hover:bg-soft/60">
          <Avatar src={topComment.author.img} name={topComment.author.name} size="sm" />
          <p className="text-[13px] leading-snug text-muted">
            <span className="font-semibold text-ink">{topComment.author.name}</span> {topComment.text}
          </p>
        </button>
      )}
      {item.commentCount > 1 && item.type !== "question" && (
        <button onClick={onOpen} className="mt-1.5 inline-flex min-h-[44px] items-center pl-1 text-[13px] font-semibold text-[var(--purple)] transition hover:underline lg:min-h-0">
          View all {item.commentCount} comments
        </button>
      )}
      {onComment && !(item.type === "question" && item.acceptedId) && <QuickReply onComment={onComment} label={item.type === "question" ? "Write an answer…" : undefined} />}
    </article>
  );
}
