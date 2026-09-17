"use client";
/* What a post IS, beyond its text — shared by the feed card, the quick-look
   drawer and the full view, so a must-read or a question behaves the same in
   all three (Social v2, spec 044).

   · Must read — people confirm they've read it by a date. The progress is
     org-wide, and whoever can post announcements can send one reminder to
     those who haven't confirmed yet.
   · Question — answered or not, said plainly. When it isn't answered yet,
     Nudge looks in Knowledge first, and failing that, names colleagues who
     posted about the same thing. */
import * as React from "react";
import Link from "next/link";
import { BadgeCheck, BellRing, BookOpen, CheckCircle2, HelpCircle, Megaphone, Pin, Send } from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import { canModerate } from "@/lib/posting";
import { articles, findAnswer } from "@/lib/knowledge";
import { feedItems, type ReactionEmoji } from "@/lib/feed";
import { useViewAs } from "../useViewAs";
import { useMe } from "../useSession";
import { toast } from "../Toaster";
import { EventBlock, KudosBlock, MilestoneBlock, PollBlock, PostMedia, nfmt, type DisplayItem } from "./parts";

export type PostActions = {
  onVote: (optionId: string) => void;
  onGoing: () => void;
  onAck?: () => void;
  onOpen?: () => void;
  onComment?: (text: string) => void;
  onReact?: (e: ReactionEmoji) => void;
};

/* The one-line label above a post: pinned, must read, question, announcement. */
export function PostKicker({ item }: { item: DisplayItem }) {
  const bits: { icon: typeof Pin; label: string; tone: string }[] = [];
  if (item.pinned) bits.push({ icon: Pin, label: "Pinned", tone: "text-[var(--purple)]" });
  if (item.ack) bits.push({ icon: BadgeCheck, label: "Must read", tone: item.ackedOn ? "text-[var(--success)]" : "text-[var(--warning)]" });
  else if (item.type === "announcement") bits.push({ icon: Megaphone, label: "Announcement", tone: "text-muted" });
  if (item.type === "question") bits.push({ icon: HelpCircle, label: item.acceptedId ? "Answered question" : "Question", tone: item.acceptedId ? "text-[var(--success)]" : "text-[var(--purple)]" });
  if (!bits.length) return null;
  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
      {bits.map((b) => (
        <span key={b.label} className={`flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide ${b.tone}`}>
          <b.icon className="h-3.5 w-3.5" /> {b.label}
        </span>
      ))}
    </div>
  );
}

/** Everything under the text: type blocks, media, must-read, question. */
export function PostBlocks({ item, actions }: { item: DisplayItem; actions: PostActions }) {
  return (
    <>
      {item.type === "kudos" && item.kudos && <KudosBlock kudos={item.kudos} />}
      {item.type === "poll" && item.poll && <PollBlock poll={item.poll} myVote={item.myVote} onVote={actions.onVote} />}
      {item.type === "event" && item.event && <EventBlock event={item.event} going={item.going} onGoing={actions.onGoing} />}
      {item.type === "milestone" && item.milestone && <MilestoneBlock milestone={item.milestone} />}
      {item.media && <PostMedia media={item.media} />}
      {item.ack && <MustReadBlock item={item} onAck={actions.onAck} />}
      {item.type === "question" && <QuestionBlock item={item} onOpen={actions.onOpen} onComment={actions.onComment} />}
    </>
  );
}

function MustReadBlock({ item, onAck }: { item: DisplayItem; onAck?: () => void }) {
  const [role] = useViewAs();
  const [reminded, setReminded] = React.useState(false);
  const ack = item.ack!;
  const confirmed = ack.confirmed + (item.ackedOn ? 1 : 0);
  const pct = Math.round((confirmed / ack.audience) * 100);
  const left = ack.audience - confirmed;
  const done = Boolean(item.ackedOn);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-3 rounded-2xl p-4"
      style={{ background: `color-mix(in srgb, var(--${done ? "success" : "warning"}) 9%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--${done ? "success" : "warning"}) 24%, transparent)` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">
            {done ? <>You confirmed on {item.ackedOn}</> : <>Please confirm you&rsquo;ve read this by {ack.by}</>}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">{confirmed.toLocaleString("en-IN")} of {ack.audience.toLocaleString("en-IN")} have confirmed · {pct}%</p>
        </div>
        {done ? (
          <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--success)]"><CheckCircle2 className="h-5 w-5" /> Read</span>
        ) : (
          onAck && <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<BadgeCheck className="h-4 w-4" />} onClick={onAck}>I&rsquo;ve read this</Button>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]" role="img" aria-label={`${pct}% have confirmed`}>
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: `var(--${done ? "success" : "warning"})` }} />
      </div>
      {canModerate(role) && left > 0 && (
        <button
          onClick={() => { setReminded(true); toast(`One reminder to ${left.toLocaleString("en-IN")} people — it goes out at 9:00, outside quiet hours`); }}
          disabled={reminded}
          className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline disabled:text-faint disabled:no-underline lg:min-h-[28px]"
        >
          <BellRing className="h-4 w-4" /> {reminded ? "Reminder scheduled" : `Remind the ${nfmt(left)} who haven't`}
        </button>
      )}
    </div>
  );
}

/* Words worth matching on — nothing short, nothing that every question has. */
const STOP = new Set(["about", "there", "their", "which", "would", "could", "should", "anyone", "someone", "where", "what", "does", "know", "people", "thing", "things", "really", "better", "write", "shift", "guides"]);
const words = (t: string) => t.toLowerCase().replace(/\*\*/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 4 && !STOP.has(w));

/** Colleagues who posted about the same thing — the people most likely to know. */
function whoMightKnow(item: DisplayItem) {
  const mine = new Set(words(item.text).map((w) => w.replace(/e?s$/, "")));
  return feedItems
    .filter((p) => p.id !== item.id && p.author.name !== item.author.name && p.type !== "question")
    .map((p) => ({ p, hit: words(p.text).map((w) => w.replace(/e?s$/, "")).find((w) => mine.has(w)) }))
    .filter((x) => x.hit)
    .slice(0, 2);
}

function QuestionBlock({ item, onOpen, onComment }: { item: DisplayItem; onOpen?: () => void; onComment?: (text: string) => void }) {
  const [role] = useViewAs();
  const me = useMe();
  const [shared, setShared] = React.useState(false);
  const answer = item.acceptedId ? item.comments.find((c) => c.id === item.acceptedId) : undefined;

  if (answer) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="mt-3 rounded-2xl bg-[color-mix(in_srgb,var(--success)_9%,transparent)] p-4 ring-1 ring-[color-mix(in_srgb,var(--success)_24%,transparent)]">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--success)]"><CheckCircle2 className="h-4 w-4" /> Answer, chosen by {item.author.name.split(" ")[0]}</p>
        <div className="mt-2 flex items-start gap-2.5">
          <Avatar src={answer.author.img} name={answer.author.name} size="sm" />
          <p className="min-w-0 text-[14px] leading-relaxed text-ink"><span className="font-semibold">{answer.author.name}</span> <span className="text-faint">· {answer.author.role}</span><br />{answer.text}</p>
        </div>
      </div>
    );
  }

  const kb = findAnswer(item.text, role);
  const article = kb.sources.map((id) => articles.find((a) => a.id === id)).find(Boolean);
  const experts = article ? [] : whoMightKnow(item);
  const plain = kb.answer.replace(/\*\*/g, "");
  const replies = item.commentCount;

  return (
    <div onClick={(e) => e.stopPropagation()} className="mt-3 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-4">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        <SparkMark size={14} tone="gradient" /> {article ? (kb.matched ? "Knowledge already answers this" : "Knowledge might help") : experts.length ? "People who might know" : "Not in Knowledge yet"}
      </p>
      {article && (
        <>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{kb.matched ? plain : article.excerpt}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/product/knowledge" className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-[28px]">
              <BookOpen className="h-4 w-4" /> {article.title}
            </Link>
            {onComment && kb.matched && (
              <button
                disabled={shared}
                onClick={() => { onComment(`From Knowledge — ${article.title}: ${plain}`); setShared(true); toast(`Shared as a reply — ${item.author.name.split(" ")[0]} can mark it as the answer`); }}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline disabled:text-faint disabled:no-underline lg:min-h-[28px]"
              >
                <Send className="h-4 w-4" /> {shared ? "Shared as a reply" : "Share as a reply"}
              </button>
            )}
          </div>
        </>
      )}
      {!article && experts.length > 0 && (
        <ul className="mt-2 space-y-2">
          {experts.map(({ p, hit }) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2.5">
              <Avatar src={p.author.img} name={p.author.name} size="sm" />
              <span className="min-w-0 flex-1 text-[13px] text-muted"><span className="font-semibold text-ink">{p.author.name}</span> posted about {hit} {p.time} ago</span>
              {onComment && p.author.name !== me.fullName && (
                <button
                  onClick={() => { onComment(`@${p.author.name} — you might know this one?`); toast(`Mentioned ${p.author.name.split(" ")[0]} in a reply`); }}
                  className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-[28px]"
                >
                  Ask {p.author.name.split(" ")[0]}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!article && experts.length === 0 && (
        <p className="mt-1.5 text-[13px] text-muted">Nudge has added it to the questions the People team answers in Knowledge.</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--ai-border)] pt-2.5">
        <span className="text-[13px] text-muted">{replies === 0 ? "No replies yet" : `${replies} ${replies === 1 ? "reply" : "replies"} · not answered yet`}</span>
        {onOpen && <button onClick={onOpen} className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-[28px]">{replies ? "See replies" : "Answer"}</button>}
      </div>
    </div>
  );
}

/* A comment box right under a post — the most common thing to do with a post
   should not need the post opened first. */
export function QuickReply({ onComment, label }: { onComment: (text: string) => void; label?: string }) {
  const me = useMe();
  const [draft, setDraft] = React.useState("");
  const send = () => { const t = draft.trim(); if (!t) return; onComment(t); setDraft(""); toast("Comment posted"); };
  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onSubmit={(e) => { e.preventDefault(); send(); }}
      className="mt-3 flex items-center gap-2.5"
    >
      <Avatar src={me.img} name={me.fullName} size="sm" />
      <div className="flex min-w-0 flex-1 items-center rounded-full bg-soft pl-3.5 pr-1 transition focus-within:ring-2 focus-within:ring-[var(--purple)]/30">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label={label ?? "Add a comment"}
          placeholder={label ?? "Add a comment…"}
          className="min-h-[44px] min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-faint lg:min-h-[38px] lg:text-[14px]"
        />
        {draft.trim() && (
          <button type="submit" aria-label="Post comment" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition hover:opacity-90 max-lg:h-10 max-lg:w-10">
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
