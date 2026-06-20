"use client";
/* Company feed (Notion Home spec §2.5) — the content layer.
   Filter tabs · celebrations (birthdays/anniversaries/joiners) · pinned posts ·
   media banners · composer · reactions. Neutral surfaces + violet accent. */
import * as React from "react";
import { Gift, Heart, ImageIcon, MessageSquare, Newspaper, Pin, Share2, BarChart3 } from "lucide-react";
import { Avatar, Badge, Button, type BadgeTone } from "@vadal/design-system";
import { feed as seedFeed, celebrations, me, type FeedPost } from "@/lib/data";

const FEED_TONE: Record<string, BadgeTone> = {
  Leadership: "brand",
  Recognition: "success",
  Announcement: "warning",
  Team: "neutral",
};

const TABS = ["All", "Leadership", "Recognition", "Announcement", "Team"] as const;
type Tab = (typeof TABS)[number];

type Post = FeedPost & { id: string; liked: boolean };

export function Feed({ className = "", empty = false }: { className?: string; empty?: boolean }) {
  const idRef = React.useRef(0);
  const [posts, setPosts] = React.useState<Post[]>(() =>
    empty ? [] : seedFeed.map((p, i) => ({ ...p, id: `seed-${i}`, liked: false })),
  );
  const [tab, setTab] = React.useState<Tab>("All");
  const [draft, setDraft] = React.useState("");

  function post() {
    const text = draft.trim();
    if (!text) return;
    setPosts((p) => [
      { id: `you-${idRef.current++}`, kind: "Team", author: me.name, role: "You", img: me.img, text, time: "now", likes: 0, comments: 0, liked: false },
      ...p,
    ]);
    setDraft("");
    setTab("All");
  }

  function toggleLike(id: string) {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));
  }

  const filtered = posts.filter((p) => tab === "All" || p.kind === tab);
  const ordered = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const showCelebrations = !empty && tab === "All" && celebrations.length > 0;

  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Company feed</p>
        <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What’s happening</h2>
      </div>

      {/* filter tabs */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
              tab === t ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* celebrations */}
      {showCelebrations && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">🎉 Celebrations</p>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {celebrations.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 rounded-2xl border border-line bg-[var(--lav)] p-2.5">
                <span className="relative shrink-0">
                  <Avatar src={c.img} name={c.name} size="sm" />
                  <span className="absolute -bottom-1.5 -right-1.5 text-[13px] leading-none">{c.emoji}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold">{c.name}</div>
                  <div className="truncate text-[10.5px] text-faint">{c.type} · {c.detail}</div>
                </div>
                <button className="shrink-0 rounded-full bg-card px-2.5 py-1 text-[10.5px] font-semibold text-[var(--purple)] ring-1 ring-line transition hover:bg-soft">Send</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); post(); }}
        className="mt-4 rounded-2xl border border-line p-2.5 transition focus-within:border-[var(--purple)]"
      >
        <div className="flex items-center gap-3">
          <Avatar src={me.img} name={me.name} size="sm" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share an update with your team…"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-faint"
          />
          <Button variant={draft.trim() ? "brand" : "tertiary"} size="sm" type="submit">Post</Button>
        </div>
        <div className="mt-2 flex items-center gap-1 pl-12 text-faint">
          {[ImageIcon, Gift, BarChart3].map((Icon, i) => (
            <span key={i} className="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-soft hover:text-[var(--purple)]"><Icon className="h-4 w-4" /></span>
          ))}
        </div>
      </form>

      {/* posts */}
      {ordered.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Newspaper className="h-7 w-7 text-[var(--purple)]" />
          <p className="text-[13px] font-semibold">{empty ? "No posts yet" : "Nothing here yet"}</p>
          <p className="text-[12px] text-faint">{empty ? "Be the first to share something with your team." : "Try another filter, or post an update."}</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {ordered.map((p) => (
            <article key={p.id} className="group">
              {p.pinned && (
                <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--purple)]">
                  <Pin className="h-3 w-3" /> Pinned
                </div>
              )}
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
              {p.banner && <div className="mt-3 h-32 w-full rounded-2xl" style={{ backgroundImage: p.banner }} aria-hidden />}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-5 text-[11.5px] text-faint">
                  <button onClick={() => toggleLike(p.id)} aria-pressed={p.liked} className={`flex items-center gap-1.5 transition ${p.liked ? "text-[var(--purple)]" : "hover:text-[var(--purple)]"}`}>
                    <Heart className="h-3.5 w-3.5" fill={p.liked ? "currentColor" : "none"} /> {p.likes}
                  </button>
                  <button className="flex items-center gap-1.5 transition hover:text-ink"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</button>
                  <button className="flex items-center gap-1.5 transition hover:text-ink"><Share2 className="h-3.5 w-3.5" /></button>
                </div>
                {p.likedBy && p.likedBy.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {p.likedBy.map((src, i) => (
                        <span key={i} className="rounded-full ring-2 ring-card"><Avatar src={src} name="" size="sm" /></span>
                      ))}
                    </div>
                    <span className="text-[10.5px] text-faint">+{Math.max(0, p.likes - p.likedBy.length)}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
