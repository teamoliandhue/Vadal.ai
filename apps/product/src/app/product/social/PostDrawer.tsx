"use client";
/* Post quick-look — opens in the shared right Drawer from the stream. The whole
   post, its reactions and the conversation, with a way through to the full
   view when the thread deserves the room. */
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import type { ReactionEmoji } from "@/lib/feed";
import { Drawer } from "../Drawer";
import {
  EngagementBar, EventBlock, KudosBlock, MilestoneBlock, PinnedTag, PollBlock,
  PostHeader, PostMedia, type DisplayItem,
} from "./parts";
import { CommentBox, CommentList } from "./Thread";
import { PostText } from "./Translate";

export function PostDrawer({
  item, onClose, onReact, onBookmark, onVote, onGoing, onShare, onComment, onLikeComment,
}: {
  item: DisplayItem | null;
  onClose: () => void;
  onReact: (e: ReactionEmoji) => void;
  onBookmark: () => void;
  onVote: (optionId: string) => void;
  onGoing: () => void;
  onShare: () => void;
  onComment: (text: string) => void;
  onLikeComment: (commentId: string) => void;
}) {
  return (
    <Drawer open={!!item} title="Post" onClose={onClose}>
      {item && (
        <div className="space-y-1">
          <Link
            href={`/product/social/post/${item.id}`}
            className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-soft px-3 text-[13px] font-semibold text-muted transition hover:text-ink lg:min-h-[32px]"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Open full view
          </Link>
          {item.pinned && <PinnedTag />}
          <PostHeader item={item} />
          {item.text && <PostText id={item.id} text={item.text} />}

          {item.type === "kudos" && item.kudos && <KudosBlock kudos={item.kudos} />}
          {item.type === "poll" && item.poll && <PollBlock poll={item.poll} myVote={item.myVote} onVote={onVote} />}
          {item.type === "event" && item.event && <EventBlock event={item.event} going={item.going} onGoing={onGoing} />}
          {item.type === "milestone" && item.milestone && <MilestoneBlock milestone={item.milestone} />}
          {item.media && <PostMedia media={item.media} />}

          <EngagementBar item={item} onReact={onReact} onComment={() => {}} onBookmark={onBookmark} onShare={onShare} />

          <div className="mt-4"><CommentList item={item} onLikeComment={onLikeComment} /></div>
        </div>
      )}

      {/* composer pinned to bottom */}
      {item && (
        <div className="sticky bottom-0 -mx-7 -mb-7 mt-4 border-t border-line bg-card px-7 py-4">
          <CommentBox key={item.id} postId={item.id} onComment={onComment} />
        </div>
      )}
    </Drawer>
  );
}
