"use client";
/* Review — posts held before they published, and posts people reported.

   The moderator decides; Nudge explains. Each item says plainly why it is here,
   quotes the phrase or names the photo, and gives Nudge's read of the context —
   the phrase that trips a threat check on a factory floor is usually a safety
   warning, and the moderator should see that before choosing.

   A held post can be approved (it publishes) or returned with a note (the
   author sees the note and can edit). A reported post can be kept up or
   removed. Nothing is decided silently. */
import * as React from "react";
import Link from "next/link";
import { Check, CornerDownLeft, EyeOff, Flag, FolderKanban, Lock, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { channelMap } from "@/lib/feed";
import { AUDIENCE_LABEL, SENSITIVITY_LABEL, canModerate } from "@/lib/posting";
import { PostMedia, renderRich } from "../parts";
import { SocialTabs } from "../SocialTabs";
import { useModeration, type QueueItem } from "../useModeration";
import { useGroups } from "../groups/useGroups";
import { PANE, SPLIT } from "../../panes";
import { toast } from "../../Toaster";
import { usePostingPolicy } from "../../usePostingPolicy";
import { useMe } from "../../useSession";
import { useViewAs } from "../../useViewAs";

type View = "open" | "decided";

const RETURN_NOTE: Record<string, string> = {
  threat: "Thanks for flagging this — the concern is real, but \"watch your back\" reads as a threat to the next shift. Could you post it as a safety reminder instead? I've also raised the bay issue in Flow.",
  targeting: "This talks about a whole group of colleagues at once, and it isn't something we'd publish. If there's a real problem with the night rota, tell me directly and we'll look at it.",
  photo: "Love the milestone — the photo shows a screen with records on it, though. Could you post it with a different photo?",
  abuse: "The point is fair, but a couple of the words will land harder than you mean. Could you soften them and post again?",
  "personal-data": "This includes someone's personal details. Could you take them out and post again?",
};

const OUTCOME: Record<QueueItem["status"], { label: string; icon: typeof Check; tone: string }> = {
  pending: { label: "Waiting", icon: Flag, tone: "text-muted" },
  approved: { label: "Approved and published", icon: Check, tone: "text-[var(--success)]" },
  returned: { label: "Returned to the author with a note", icon: CornerDownLeft, tone: "text-[var(--warning)]" },
  kept: { label: "Kept up", icon: Check, tone: "text-[var(--success)]" },
  removed: { label: "Removed from the feed", icon: EyeOff, tone: "text-[var(--danger)]" },
};

function ItemCard({ q, by }: { q: QueueItem; by: string }) {
  const mod = useModeration();
  const g = useGroups();
  const [writing, setWriting] = React.useState<"return" | "remove" | null>(null);
  const kind = q.findings[0]?.kind ?? "abuse";
  const [note, setNote] = React.useState("");
  const held = q.kind === "held";
  const where = q.post.group ? `${q.post.group.emoji} ${q.post.group.name}` : channelMap[q.post.channel]?.name ?? "the feed";
  const decided = q.status !== "pending";
  const out = OUTCOME[q.status];
  const btn = "min-h-[44px] lg:min-h-0";

  const openNote = (w: "return" | "remove") => {
    setWriting(w);
    setNote(w === "return" ? RETURN_NOTE[kind] ?? RETURN_NOTE.abuse : "This was removed because it was reported and doesn't fit our community guidelines.");
  };

  return (
    <article className="rounded-[22px] border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {held ? <Badge tone="warning" size="sm">Held before posting</Badge> : <Badge tone="danger" size="sm">Reported</Badge>}
        <span className="text-[12px] text-faint">{where} · {q.at === "now" ? "just now" : `${q.at} ago`}{q.reporters?.length ? ` · reported by ${q.reporters.length} ${q.reporters.length === 1 ? "person" : "people"}` : ""}</span>
        {q.post.group && g.byId[q.post.group.id]?.privacy === "request" && <Lock className="h-3.5 w-3.5 text-faint" aria-label="Closed community" />}
      </div>

      {/* the post, as it would appear */}
      <div className="mt-3 rounded-2xl border border-line p-4">
        <div className="flex items-center gap-2.5">
          <Avatar src={q.post.author.img} name={q.post.author.name} size="sm" />
          <span className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-[14px] font-semibold text-ink">{q.post.author.name}</span>
            <span className="truncate text-[12px] text-faint">{q.post.author.role}</span>
          </span>
        </div>
        <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{renderRich(q.post.text)}</p>
        {q.post.media && <PostMedia media={q.post.media} />}
      </div>

      {/* why it is here */}
      <div className="mt-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Why it&apos;s here</p>
        <ul className="mt-2 space-y-1.5">
          {q.findings.map((f, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 text-[14px] text-ink">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${f.severity === "high" ? "bg-[var(--warning)]" : "bg-[var(--faint)]"}`} aria-hidden />
              {f.reason}
              {f.match && <span className="rounded-md bg-soft px-2 py-0.5 font-mono text-[12px] text-ink">{f.match}</span>}
            </li>
          ))}
        </ul>
      </div>

      {q.context && (
        <div className="mt-3 flex gap-2.5 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] px-4 py-3">
          <SparkMark size={16} tone="gradient" state="idle" />
          <p className="text-[13px] leading-relaxed text-ink/90"><span className="font-semibold">Nudge&apos;s read · </span>{q.context}</p>
        </div>
      )}

      {/* the decision */}
      {decided ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <out.icon className={`h-4 w-4 ${out.tone}`} />
          <span className={`text-[14px] font-semibold ${out.tone}`}>{out.label}</span>
          {q.decidedBy && <span className="text-[13px] text-faint">· {q.decidedBy}</span>}
          {q.note && <p className="basis-full pt-1 text-[13px] leading-snug text-muted">“{q.note}”</p>}
        </div>
      ) : writing ? (
        <div className="mt-4 border-t border-line pt-4">
          <label htmlFor={`note-${q.id}`} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
            {writing === "return" ? `Note to ${q.post.author.name.split(" ")[0]}` : "Note to the author"}
          </label>
          <textarea
            id={`note-${q.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-line bg-transparent px-3.5 py-2.5 text-[16px] leading-relaxed text-ink outline-none focus:border-[var(--purple)] focus:ring-4 focus:ring-[var(--purple)]/10 lg:text-[14px]"
          />
          <p className="mt-1 text-[12px] text-faint">Written by Nudge for this post — edit it before it goes. The author sees it word for word.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="brand" size="sm" className={btn} disabled={note.trim().length < 5}
              onClick={() => {
                if (writing === "return") { mod.returnToAuthor(q.id, note.trim(), by); toast(`Returned to ${q.post.author.name.split(" ")[0]} with your note`); }
                else { mod.remove(q.id, note.trim(), by); toast("Removed from the feed"); }
              }}
            >
              {writing === "return" ? "Send it back" : "Remove and notify"}
            </Button>
            <Button variant="tertiary" size="sm" className={btn} onClick={() => setWriting(null)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          {held ? (
            <>
              <Button variant="brand" size="sm" className={btn} onClick={() => { mod.approve(q.id, by); toast("Approved — it's live in the feed"); }}>Approve and publish</Button>
              <Button variant="secondary" size="sm" className={btn} leadingIcon={<CornerDownLeft className="h-3.5 w-3.5" />} onClick={() => openNote("return")}>Return with a note</Button>
            </>
          ) : (
            <>
              <Button variant="brand" size="sm" className={btn} onClick={() => { mod.keep(q.id, by); toast("Kept up — the report is closed"); }}>Keep it up</Button>
              <Button variant="secondary" size="sm" className={btn} leadingIcon={<EyeOff className="h-3.5 w-3.5" />} onClick={() => openNote("remove")}>Remove post</Button>
            </>
          )}
          {q.safety && (
            <Link href="/product/cases" onClick={() => toast("Opening Flow — the post stays here until you decide")} className={`ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] hover:underline ${btn}`}>
              <FolderKanban className="h-4 w-4" /> Raise as a safety case
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

export function ReviewQueue() {
  const [role] = useViewAs();
  const me = useMe();
  const mod = useModeration();
  const [policy] = usePostingPolicy();
  const [view, setView] = React.useState<View>("open");

  if (!canModerate(role)) {
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-2 py-24 text-center">
        <Lock className="h-6 w-6 text-faint" />
        <h1 className="text-[18px] font-bold text-ink">Review is for moderators</h1>
        <p className="text-[14px] text-muted">The People team looks at held and reported posts here.</p>
        <Link href="/product/feed" className="mt-3 text-[14px] font-semibold text-[var(--purple)] hover:underline">Back to the feed</Link>
      </div>
    );
  }

  const open = mod.items.filter((q) => q.status === "pending");
  const decided = mod.items.filter((q) => q.status !== "pending");
  const list = view === "open" ? open : decided;
  const count = (s: QueueItem["status"]) => mod.items.filter((q) => q.status === s).length;
  const seg = (on: boolean) => `min-h-[44px] rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"}`;
  const toSettings = () => { try { window.localStorage.setItem("vadal:settings-tab", JSON.stringify("posting")); } catch { /* ignore */ } };

  return (
    <div className={`${SPLIT} mx-auto max-w-[1100px] justify-center`}>
      <div tabIndex={0} aria-label="Review" className={`${PANE} w-full max-w-[680px] space-y-4`}>
        <SocialTabs active="review" />
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-ink">Review</h1>
            <p className="text-[14px] text-muted">Posts held before they went out, and posts people reported. You decide.</p>
          </div>
          <div className="flex rounded-full bg-soft p-0.5" role="group" aria-label="Queue">
            <button className={seg(view === "open")} aria-pressed={view === "open"} onClick={() => setView("open")}>Needs a decision · {open.length}</button>
            <button className={seg(view === "decided")} aria-pressed={view === "decided"} onClick={() => setView("decided")}>Decided · {decided.length}</button>
          </div>
        </header>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
            <ShieldCheck className="h-7 w-7 text-[var(--success)]" />
            <p className="text-[15px] font-semibold text-ink">{view === "open" ? "Nothing waiting" : "Nothing decided yet"}</p>
            <p className="max-w-[340px] text-[14px] text-faint">{view === "open" ? "Held and reported posts land here. Everything else is already live." : "Decisions you make show here, with the note you sent."}</p>
          </div>
        ) : (
          <div className="space-y-4">{list.map((q) => <ItemCard key={q.id} q={q} by={me.fullName} />)}</div>
        )}
      </div>

      <aside tabIndex={0} aria-label="Moderation summary" className={`hidden w-[320px] shrink-0 xl:block ${PANE}`}>
        <div className="space-y-4">
          <section className="rounded-[22px] border border-line bg-card p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">So far</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {[
                { n: open.length, l: "waiting" },
                { n: count("approved") + count("kept"), l: "approved or kept" },
                { n: count("returned"), l: "returned" },
                { n: count("removed"), l: "removed" },
              ].map((s) => (
                <li key={s.l} className="rounded-xl bg-soft px-3 py-2.5">
                  <div className="text-[18px] font-bold tabular-nums text-ink">{s.n}</div>
                  <div className="text-[12px] text-faint">{s.l}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[22px] border border-line bg-card p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Your rules</h3>
            <dl className="mt-3 space-y-2 text-[13px]">
              {[
                ["Post in the feed", AUDIENCE_LABEL[policy.feed]],
                ["Post in #company", AUDIENCE_LABEL[policy.announcements]],
                ["Start communities", AUDIENCE_LABEL[policy.communities]],
                ["Share outside", AUDIENCE_LABEL[policy.share]],
                ["Sensitivity", SENSITIVITY_LABEL[policy.sensitivity].label],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/product/settings" onClick={toSettings} className="mt-4 flex min-h-[40px] items-center justify-center rounded-full text-[13px] font-semibold text-[var(--purple)] ring-1 ring-line transition hover:bg-soft">
              Change in Settings
            </Link>
          </section>
        </div>
      </aside>
    </div>
  );
}
