"use client";
/* The author's side of the queue: a post waiting for a person, or one that came
   back with a note. Only the author sees these, at the top of wherever they
   posted — the post does not vanish into a queue with no trace. */
import { Clock3, CornerDownLeft, X } from "lucide-react";
import { Button } from "@vadal/design-system";
import { channelMap } from "@/lib/feed";
import { moderation, type QueueItem } from "./useModeration";
import { renderRich } from "./parts";

export function PendingPosts({ items }: { items: QueueItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      {items.map((q) => {
        const where = q.post.group ? `${q.post.group.emoji} ${q.post.group.name}` : channelMap[q.post.channel]?.name ?? "the feed";
        const returned = q.status === "returned";
        const again = () => {
          window.dispatchEvent(new CustomEvent("vadal:compose", { detail: { text: q.post.text, channel: q.post.channel, groupId: q.post.group?.id ?? null } }));
          moderation.drop(q.id);
        };
        return (
          <article key={q.id} className={`rounded-[22px] border border-dashed p-4 sm:p-5 ${returned ? "border-[var(--warning)]/50 bg-[var(--warning)]/5" : "border-line bg-card"}`}>
            <div className="flex items-start gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${returned ? "bg-[var(--warning)]/15 text-[var(--warning)]" : "bg-soft text-muted"}`}>
                {returned ? <CornerDownLeft className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink">{returned ? "Returned with a note" : "Waiting for a person to look at it"}</p>
                <p className="text-[12px] text-faint">Your post in {where} · only you can see this</p>
                <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{renderRich(q.post.text)}</p>
                {returned && q.note && (
                  <p className="mt-2.5 rounded-xl bg-card px-3 py-2 text-[13px] leading-snug text-ink ring-1 ring-line">
                    <span className="font-semibold">{q.decidedBy ?? "The People team"}:</span> {q.note}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {returned ? (
                    <>
                      <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" onClick={again}>Edit and post again</Button>
                      <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<X className="h-3.5 w-3.5" />} onClick={() => moderation.drop(q.id)}>Dismiss</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={again}>Edit instead</Button>
                      <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => moderation.drop(q.id)}>Withdraw</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
