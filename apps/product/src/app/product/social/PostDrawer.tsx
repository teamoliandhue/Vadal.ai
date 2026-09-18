"use client";
/* Post quick-look — opens in the shared right Drawer from the stream. The whole
   post, its reactions and the conversation, with a way through to the full
   view when the thread deserves the room. */
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import type { ReactionEmoji } from "@/lib/feed";
import { Drawer } from "../Drawer";
import { EngagementBar, PostHeader, type DisplayItem } from "./parts";
import { PostBlocks, PostKicker } from "./PostBlocks";
import { CommentBox, CommentList } from "./Thread";
import { PostText } from "./Translate";

export function PostDrawer({
  item, onClose, onReact, onBookmark, onVote, onGoing, onShare, onComment, onLikeComment, onAck, onAccept,
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
  onAck?: () => void;
  onAccept?: (commentId: string) => void;
}) {
  return (
    <Drawer open={!!item} title="Post" onClose={onClose} footer={item ? <CommentBox key={item.id} postId={item.id} onComment={onComment} /> : undefined}>
      {item && (
        <div className="space-y-1">
          <Link
            href={`/product/social/post/${item.id}`}
            className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-soft px-3 text-[13px] font-semibold text-muted transition hover:text-ink lg:min-h-[32px]"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Open full view
          </Link>
          <PostKicker item={item} />
          <PostHeader item={item} />
          {item.text && <PostText id={item.id} text={item.text} fold={false} />}

          <PostBlocks item={item} actions={{ onVote, onGoing, onAck, onComment }} />

          <EngagementBar item={item} onReact={onReact} onComment={() => {}} onBookmark={onBookmark} onShare={onShare} />

          <div className="mt-4"><CommentList item={item} onLikeComment={onLikeComment} onAccept={onAccept} /></div>
        </div>
      )}

    </Drawer>
  );
}
