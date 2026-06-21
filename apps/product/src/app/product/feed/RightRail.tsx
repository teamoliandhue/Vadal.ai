"use client";
/* Feed context rail — the AI "Catch me up" digest (Aurora), channel switcher,
   celebrations, trending topics and new joiners. Sticky on wide screens. */
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Avatar, SparkMark } from "@vadal/design-system";
import { celebrations } from "@/lib/data";
import { channels, feedDigest, trendingTopics, whosNew } from "@/lib/feed";
import { renderRich } from "./parts";
import { toast } from "../Toaster";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

export function RightRail({
  activeChannel, onPickChannel,
}: { activeChannel: string | null; onPickChannel: (id: string | null) => void }) {
  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-6 space-y-4">
        {/* AI catch-me-up */}
        <section className="overflow-hidden rounded-[22px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-5">
          <div className="flex items-center gap-2">
            <SparkMark size={20} tone="gradient" state="idle" />
            <h3 className="text-[15px] font-bold text-ink">Catch me up</h3>
            <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-[12px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)]">{feedDigest.newPosts} new</span>
          </div>
          <p className="mt-2 text-[13px] text-muted">Here's what you missed since {feedDigest.since}.</p>
          <ul className="mt-3 space-y-2.5">
            {feedDigest.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-snug text-ink/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ai-grad" aria-hidden />
                <span>{renderRich(h)}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => ask("Catch me up on the company feed — what did I miss and what needs my attention?")}
            className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-card py-2 text-[13px] font-semibold text-[var(--ai-accent)] ring-1 ring-[var(--ai-border)] transition hover:bg-[var(--ai-surface)]"
          >
            <SparkMark size={14} tone="gradient" /> Ask Vadal for the full digest
          </button>
        </section>

        {/* Channels */}
        <section className="rounded-[22px] border border-line bg-card p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Channels</h3>
          <div className="mt-2.5 space-y-0.5">
            <ChannelRow active={activeChannel === null} onClick={() => onPickChannel(null)} emoji="🏠" name="All channels" meta="Everything" />
            {channels.map((c) => (
              <ChannelRow
                key={c.id}
                active={activeChannel === c.id}
                onClick={() => onPickChannel(c.id)}
                emoji={c.emoji}
                name={c.name}
                meta={`${c.posts} this week`}
              />
            ))}
          </div>
        </section>

        {/* Celebrations */}
        <section className="rounded-[22px] border border-line bg-card p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">🎉 Celebrations</h3>
          <div className="mt-3 space-y-3">
            {celebrations.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5">
                <span className="relative shrink-0">
                  <Avatar src={c.img} name={c.name} size="sm" />
                  <span className="absolute -bottom-1.5 -right-1.5 text-[13px] leading-none">{c.emoji}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-ink">{c.name}</div>
                  <div className="truncate text-[12px] text-faint">{c.type} · {c.detail}</div>
                </div>
                <button onClick={() => toast(`Sent ${c.name.split(" ")[0]} a note 💜`)} className="shrink-0 rounded-full px-2.5 py-1 text-[13px] font-semibold text-[var(--purple)] ring-1 ring-line transition hover:bg-soft">Send</button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section className="rounded-[22px] border border-line bg-card p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Trending</h3>
          <div className="mt-2.5 space-y-2.5">
            {trendingTopics.map((t) => (
              <button key={t.tag} onClick={() => ask(`What's the story behind ${t.tag} on the feed?`)} className="block w-full text-left">
                <span className="text-[14px] font-semibold text-[var(--purple)]">{t.tag}</span>
                <span className="ml-2 text-[12px] text-faint">{t.posts} posts</span>
                <span className="block truncate text-[12px] text-muted">{t.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Who's new */}
        <section className="rounded-[22px] border border-line bg-card p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Say hi 👋</h3>
          <div className="mt-3 space-y-3">
            {whosNew.map((p) => (
              <div key={p.name} className="flex items-center gap-2.5">
                <Avatar src={p.img} name={p.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-ink">{p.name}</div>
                  <div className="truncate text-[12px] text-faint">{p.role}</div>
                </div>
                <button onClick={() => toast(`Welcomed ${p.name.split(" ")[0]} 👋`)} className="shrink-0 text-faint transition hover:text-[var(--purple)]"><ArrowRight className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function ChannelRow({ active, onClick, emoji, name, meta }: { active: boolean; onClick: () => void; emoji: string; name: string; meta: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${active ? "bg-[var(--lav)]" : "hover:bg-soft"}`}
    >
      <span className="text-[16px]" aria-hidden>{emoji}</span>
      <span className={`flex-1 truncate text-[14px] font-semibold ${active ? "text-[var(--purple)]" : "text-ink"}`}>{name}</span>
      <span className="text-[12px] text-faint">{meta}</span>
    </button>
  );
}
