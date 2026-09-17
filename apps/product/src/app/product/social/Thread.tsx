"use client";
/* The conversation under a post — every comment and the box to add one. Shared
   by the quick-look drawer and the full view, so a comment behaves the same in
   both and "Suggest a reply" is one feature, not two. */
import * as React from "react";
import { Heart, Send, Sparkles } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import type { Comment } from "@/lib/feed";
import { useMe } from "../useSession";
import type { DisplayItem } from "./parts";

const REPLY_SUGGESTIONS = [
  "Love this — congrats to everyone involved! 🙌",
  "This is exactly the kind of momentum we needed. 👏",
  "Thanks for sharing — counting me in.",
];

export function CommentList({ item, onLikeComment }: { item: DisplayItem; onLikeComment: (id: string) => void }) {
  return (
    <div className="space-y-4">
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
              <button onClick={() => onLikeComment(cm.id)} className="flex min-h-[44px] items-center gap-1 font-semibold transition hover:text-[var(--purple)] lg:min-h-0">
                <Heart className="h-3 w-3" /> {cm.likes > 0 ? cm.likes : "Like"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentBox({ postId, onComment }: { postId: string; onComment: (text: string) => void }) {
  const me = useMe();
  const [draft, setDraft] = React.useState("");
  const ix = React.useRef(0);
  /* a different post is a different conversation — reset by remount, see callers' key */
  void postId;

  function send() {
    const t = draft.trim();
    if (!t) return;
    onComment(t);
    setDraft("");
  }

  return (
    <div className="flex items-end gap-2.5">
      <Avatar src={me.img} name={me.fullName} size="sm" />
      <div className="flex-1 rounded-2xl border border-line px-3 py-2 transition focus-within:border-[var(--purple)]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
          rows={1}
          aria-label="Write a comment"
          placeholder="Write a comment…"
          className="w-full resize-none bg-transparent text-[16px] outline-none placeholder:text-faint lg:text-[14px]"
        />
        <div className="mt-1 flex items-center justify-between">
          <button
            onClick={() => { setDraft(REPLY_SUGGESTIONS[ix.current % REPLY_SUGGESTIONS.length]); ix.current += 1; }}
            className="flex min-h-[44px] items-center gap-1 text-[12px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80 lg:min-h-0"
          >
            <Sparkles className="h-3.5 w-3.5" /> Suggest a reply
          </button>
        </div>
      </div>
      <button
        onClick={send}
        disabled={!draft.trim()}
        aria-label="Send comment"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition hover:opacity-90 disabled:opacity-40 lg:h-10 lg:w-10"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
