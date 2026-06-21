"use client";
/* Post detail — opens in the shared right Drawer. Shows the full post, the whole
   reaction bar, every comment, and a comment composer with a "Suggest a reply"
   AI assist. Mirrors Contra's post-detail modal, on Vadal tokens. */
import * as React from "react";
import { Send, Sparkles, Heart } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { me } from "@/lib/data";
import type { Comment, ReactionEmoji } from "@/lib/feed";
import { Drawer } from "../Drawer";
import {
  EngagementBar, EventBlock, KudosBlock, MilestoneBlock, PinnedTag, PollBlock,
  PostHeader, PostMedia, renderRich, type DisplayItem,
} from "./parts";

const REPLY_SUGGESTIONS = [
  "Love this — congrats to everyone involved! 🙌",
  "This is exactly the kind of momentum we needed. 👏",
  "Thanks for sharing — counting me in.",
];

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
  const [draft, setDraft] = React.useState("");
  const ix = React.useRef(0);
  React.useEffect(() => { setDraft(""); }, [item?.id]);

  function send() {
    const t = draft.trim();
    if (!t) return;
    onComment(t);
    setDraft("");
  }

  return (
    <Drawer open={!!item} title="Post" onClose={onClose}>
      {item && (
        <div className="space-y-1">
          {item.pinned && <PinnedTag />}
          <PostHeader item={item} />
          {item.text && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{renderRich(item.text)}</p>}

          {item.type === "kudos" && item.kudos && <KudosBlock kudos={item.kudos} />}
          {item.type === "poll" && item.poll && <PollBlock poll={item.poll} myVote={item.myVote} onVote={onVote} />}
          {item.type === "event" && item.event && <EventBlock event={item.event} going={item.going} onGoing={onGoing} />}
          {item.type === "milestone" && item.milestone && <MilestoneBlock milestone={item.milestone} />}
          {item.media && <PostMedia media={item.media} />}

          <EngagementBar item={item} onReact={onReact} onComment={() => {}} onBookmark={onBookmark} onShare={onShare} />

          {/* comments */}
          <div className="mt-4 space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
              {item.commentCount > 0 ? `${item.commentCount} comments` : "No comments yet"}
            </p>
            {item.comments.map((cm: Comment) => (
              <div key={cm.id} className="flex items-start gap-2.5">
                <Avatar src={cm.author.img} name={cm.author.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-md bg-soft px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink">{cm.author.name}</span>
                      <span className="text-[12px] text-faint">{cm.author.role}</span>
                    </div>
                    <p className="mt-0.5 text-[14px] leading-snug text-ink/90">{cm.text}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 pl-1 text-[12px] text-faint">
                    <span>{cm.time === "now" ? "just now" : `${cm.time} ago`}</span>
                    <button
                      onClick={() => onLikeComment(cm.id)}
                      className="flex items-center gap-1 font-semibold transition hover:text-[var(--purple)]"
                    >
                      <Heart className="h-3 w-3" /> {cm.likes > 0 ? cm.likes : "Like"}
                    </button>
                    <button className="font-semibold transition hover:text-ink">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* composer pinned to bottom */}
      {item && (
        <div className="sticky bottom-0 -mx-7 -mb-7 mt-4 border-t border-line bg-card px-7 py-4">
          <div className="flex items-end gap-2.5">
            <Avatar src={me.img} name={me.fullName} size="sm" />
            <div className="flex-1 rounded-2xl border border-line px-3 py-2 transition focus-within:border-[var(--purple)]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
                rows={1}
                placeholder="Write a comment…"
                className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-faint"
              />
              <div className="mt-1 flex items-center justify-between">
                <button
                  onClick={() => { setDraft(REPLY_SUGGESTIONS[ix.current % REPLY_SUGGESTIONS.length]); ix.current += 1; }}
                  className="flex items-center gap-1 text-[12px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Suggest a reply
                </button>
              </div>
            </div>
            <button
              onClick={send}
              disabled={!draft.trim()}
              aria-label="Send comment"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
