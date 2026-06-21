"use client";
/* Shared building blocks for the Feed — post header, media, type-specific blocks
   (kudos / poll / event / milestone), the multi-emoji reaction picker, and the
   engagement bar. Composed by both the stream PostCard and the post-detail Drawer. */
import * as React from "react";
import { Bookmark, MessageCircle, Pin, Share2, Smile } from "lucide-react";
import { Avatar, Badge } from "@vadal/design-system";
import {
  REACTION_SET, VALUE_TONE, channelMap,
  type Channel, type FeedItem, type PollOption, type ReactionEmoji,
} from "@/lib/feed";

/* The runtime shape the UI renders — base seed merged with my interactions. */
export type DisplayItem = FeedItem & {
  myReaction?: ReactionEmoji;
  myVote?: string;
  bookmarked: boolean;
  going?: boolean;
  commentCount: number;
};

/* **bold** → <strong>. Keeps the seed text human to author. */
export function renderRich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
}

export function nfmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;
}

function ChannelChip({ channel }: { channel?: Channel }) {
  if (!channel) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-muted">
      <span aria-hidden>{channel.emoji}</span> {channel.name}
    </span>
  );
}

export function PostHeader({ item, trailing }: { item: DisplayItem; trailing?: React.ReactNode }) {
  const channel = channelMap[item.channel];
  return (
    <div className="flex items-start gap-3">
      <Avatar src={item.author.img} name={item.author.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[14px] font-semibold text-ink">{item.author.name}</span>
          <span className="text-[12px] text-faint">{item.author.role}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-faint">
          <span>{item.time === "now" ? "just now" : `${item.time} ago`}</span>
          <span aria-hidden>·</span>
          <ChannelChip channel={channel} />
        </div>
      </div>
      {trailing}
    </div>
  );
}

export function PostMedia({ media }: { media: NonNullable<FeedItem["media"]> }) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-line">
      <div className="aspect-[5/2] w-full overflow-hidden bg-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.src} alt={media.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
    </div>
  );
}

export function KudosBlock({ kudos }: { kudos: NonNullable<FeedItem["kudos"]> }) {
  return (
    <div className="mt-3 rounded-2xl border border-[var(--success-border,transparent)] bg-[var(--lav)] p-3.5 ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-[18px] ring-1 ring-line" aria-hidden>🏆</span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Recognition</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {kudos.to.map((p) => (
                  <span key={p.name} className="rounded-full ring-2 ring-[var(--lav)]"><Avatar src={p.img} name={p.name} size="sm" /></span>
                ))}
              </div>
              <span className="text-[14px] font-semibold text-ink">
                {kudos.to.map((p) => p.name.split(" ")[0]).join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {kudos.values.map((v) => (
          <Badge key={v} tone={VALUE_TONE[v] ?? "neutral"} variant="soft" size="sm">{v}</Badge>
        ))}
      </div>
    </div>
  );
}

export function PollBlock({
  poll, myVote, onVote,
}: { poll: NonNullable<FeedItem["poll"]>; myVote?: string; onVote: (id: string) => void }) {
  const extra = myVote ? 1 : 0;
  const total = poll.options.reduce((s: number, o: PollOption) => s + o.votes, 0) + extra;
  const voted = !!myVote;
  return (
    <div className="mt-3 space-y-2">
      {poll.options.map((o) => {
        const votes = o.votes + (myVote === o.id ? 1 : 0);
        const pct = total ? Math.round((votes / total) * 100) : 0;
        const mine = myVote === o.id;
        return (
          <button
            key={o.id}
            onClick={() => !voted && onVote(o.id)}
            disabled={voted}
            className={`relative w-full overflow-hidden rounded-xl border px-3.5 py-2.5 text-left transition ${
              voted ? "cursor-default border-line" : "border-line hover:border-[var(--purple)] hover:bg-soft"
            } ${mine ? "border-[var(--purple)]" : ""}`}
          >
            {voted && (
              <span
                className={`absolute inset-y-0 left-0 transition-[width] duration-700 ease-out ${mine ? "bg-[var(--lav)]" : "bg-soft"}`}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            )}
            <span className="relative flex items-center justify-between gap-3">
              <span className={`text-[14px] ${mine ? "font-semibold text-ink" : "text-ink/90"}`}>
                {mine && <span className="mr-1 text-[var(--purple)]">✓</span>}{o.label}
              </span>
              {voted && <span className="text-[12px] font-semibold tabular-nums text-muted">{pct}%</span>}
            </span>
          </button>
        );
      })}
      <p className="pt-0.5 text-[12px] text-faint">
        {nfmt(total)} votes{voted ? "" : " · tap to vote"} · closes in {poll.closesIn}
      </p>
    </div>
  );
}

export function EventBlock({
  event, going, onGoing,
}: { event: NonNullable<FeedItem["event"]>; going?: boolean; onGoing: () => void }) {
  const count = event.goingCount + (going ? 1 : 0);
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card/60 p-3.5">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--lav)] text-center leading-none ring-1 ring-line">
          <span className="text-[11px] font-bold uppercase text-[var(--purple)]">{event.when.split(" ")[0]}</span>
          <span className="text-[15px] font-bold text-ink">{event.when.replace(/^[A-Za-z]+ /, "")}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">{event.title}</p>
          <p className="text-[12px] text-faint">{event.where} · {nfmt(count)} going</p>
          <div className="mt-1 flex -space-x-2">
            {event.going.map((src, i) => (
              <span key={i} className="rounded-full ring-2 ring-card"><Avatar src={src} name="" size="sm" /></span>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onGoing}
        className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition ${
          going ? "bg-[var(--purple)] text-white" : "bg-ink text-[var(--card)] hover:opacity-90"
        }`}
      >
        {going ? "Going ✓" : "I'm in"}
      </button>
    </div>
  );
}

export function MilestoneBlock({ milestone }: { milestone: NonNullable<FeedItem["milestone"]> }) {
  return (
    <div className="mt-3 flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[var(--lav)] to-transparent p-4">
      <span className="text-[30px] leading-none" aria-hidden>{milestone.emoji}</span>
      <p className="text-[15px] font-semibold text-ink">{milestone.headline}</p>
    </div>
  );
}

/* ── Reaction picker ──────────────────────────────────────────────── */
export function ReactionPicker({ onPick, onClose }: { onPick: (e: ReactionEmoji) => void; onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="ai-pop absolute bottom-full left-0 z-20 mb-2 flex items-center gap-0.5 rounded-full border border-line bg-card p-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]"
    >
      {REACTION_SET.map((e) => (
        <button
          key={e}
          onClick={() => onPick(e)}
          className="grid h-9 w-9 place-items-center rounded-full text-[20px] transition hover:-translate-y-0.5 hover:scale-125 hover:bg-soft"
          aria-label={`React ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

/* ── Engagement bar ───────────────────────────────────────────────── */
export function EngagementBar({
  item, onReact, onComment, onBookmark, onShare,
}: {
  item: DisplayItem;
  onReact: (e: ReactionEmoji) => void;
  onComment: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  const [pick, setPick] = React.useState(false);
  const entries = Object.entries(item.reactions) as [ReactionEmoji, number][];
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const topEmojis = [...entries].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e);

  return (
    <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2.5">
      <div className="flex items-center gap-1">
        {/* reactions summary / trigger */}
        <div className="relative">
          {pick && <ReactionPicker onPick={(e) => { onReact(e); setPick(false); }} onClose={() => setPick(false)} />}
          {total > 0 ? (
            <button
              onClick={() => setPick((p) => !p)}
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-2.5 text-[13px] font-semibold transition hover:bg-soft ${
                item.myReaction ? "text-[var(--purple)]" : "text-muted"
              }`}
            >
              <span className="flex -space-x-1.5 text-[15px]">
                {topEmojis.map((e) => (
                  <span key={e} className="grid h-6 w-6 place-items-center rounded-full bg-card ring-1 ring-line">{e}</span>
                ))}
              </span>
              <span className="tabular-nums">{nfmt(total)}</span>
            </button>
          ) : (
            <button
              onClick={() => setPick((p) => !p)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-[var(--purple)]"
            >
              <Smile className="h-4 w-4" /> React
            </button>
          )}
        </div>
        <button onClick={onComment} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-ink">
          <MessageCircle className="h-4 w-4" /> {item.commentCount > 0 ? nfmt(item.commentCount) : "Comment"}
        </button>
        <button onClick={onShare} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-ink">
          <Share2 className="h-4 w-4" /> <span className="max-sm:hidden">Share</span>
        </button>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-faint">
        <span className="tabular-nums max-sm:hidden">{nfmt(item.views)} views</span>
        <button
          onClick={onBookmark}
          aria-pressed={item.bookmarked}
          className={`grid h-8 w-8 place-items-center rounded-full transition hover:bg-soft ${item.bookmarked ? "text-[var(--purple)]" : "text-faint hover:text-ink"}`}
        >
          <Bookmark className="h-4 w-4" fill={item.bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

export function PinnedTag() {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--purple)]">
      <Pin className="h-3 w-3" /> Pinned
    </div>
  );
}
