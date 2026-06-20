"use client";
/* Company feed (Notion Home spec §2.5) — composer posts + reaction toggle + empty state. */
import * as React from "react";
import { Heart, MessageSquare, Newspaper } from "lucide-react";
import { Avatar, Badge, Button, type BadgeTone } from "@vadal/design-system";
import { feed as seedFeed, me } from "@/lib/data";

const FEED_TONE: Record<string, BadgeTone> = {
  Leadership: "brand",
  Recognition: "neutral",
  Announcement: "neutral",
  Update: "neutral",
};

type Post = {
  kind: string;
  author: string;
  role: string;
  img: string;
  text: string;
  time: string;
  likes: number;
  comments: number;
  liked: boolean;
};

export function Feed({ className = "", empty = false }: { className?: string; empty?: boolean }) {
  const [posts, setPosts] = React.useState<Post[]>(() =>
    empty ? [] : seedFeed.map((p) => ({ ...p, liked: false })),
  );
  const [draft, setDraft] = React.useState("");

  function post() {
    const text = draft.trim();
    if (!text) return;
    setPosts((p) => [
      { kind: "Update", author: me.name, role: "You", img: me.img, text, time: "now", likes: 0, comments: 0, liked: false },
      ...p,
    ]);
    setDraft("");
  }

  function toggleLike(i: number) {
    setPosts((ps) => ps.map((p, idx) => (idx === i ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
  }

  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Company feed</p>
        <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What’s happening</h2>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); post(); }}
        className="mt-4 flex items-center gap-3 rounded-2xl border border-line px-3.5 py-2.5 transition focus-within:border-[var(--purple)]"
      >
        <Avatar src={me.img} name={me.name} size="sm" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share an update with your team…"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-faint"
        />
        <Button variant={draft.trim() ? "brand" : "tertiary"} size="sm" type="submit">Post</Button>
      </form>

      {posts.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Newspaper className="h-7 w-7 text-[var(--purple)]" />
          <p className="text-[13px] font-semibold">No posts yet</p>
          <p className="text-[12px] text-faint">Be the first to share something with your team.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {posts.map((p, i) => (
            <article key={`${p.author}-${i}`} className="group">
              <div className="flex items-center gap-2.5">
                <Avatar src={p.img} name={p.author} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <span className="font-semibold">{p.author}</span>
                    <span className="truncate text-faint">{p.role}</span>
                  </div>
                  <div className="text-[10.5px] text-faint">{p.time === "now" ? "just now" : `${p.time} ago`}</div>
                </div>
                <Badge tone={FEED_TONE[p.kind] ?? "neutral"} variant="soft" size="sm">{p.kind}</Badge>
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink/85">{p.text}</p>
              <div className="mt-2.5 flex items-center gap-5 text-[11.5px] text-faint">
                <button
                  onClick={() => toggleLike(i)}
                  aria-pressed={p.liked}
                  className={`flex items-center gap-1.5 transition ${p.liked ? "text-[var(--purple)]" : "hover:text-[var(--purple)]"}`}
                >
                  <Heart className="h-3.5 w-3.5" fill={p.liked ? "currentColor" : "none"} /> {p.likes}
                </button>
                <button className="flex items-center gap-1.5 transition hover:text-ink"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
