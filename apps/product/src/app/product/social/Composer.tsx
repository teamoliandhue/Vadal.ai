"use client";
/* Rich feed composer. Collapsed it's a single pill; on focus it expands into a
   full editor with a channel picker, four modes (Text / Photo / Poll / Kudos),
   and a "Draft with Vadal" AI assist. Emits a fully-formed FeedItem to the hub. */
import * as React from "react";
import Link from "next/link";
import { BarChart3, ChevronDown, Award, ImageIcon, Lock, X } from "lucide-react";
import { Avatar, Badge, Button } from "@vadal/design-system";
import { useMe } from "../useSession";
import { channels, type FeedItem, type GroupRef, type Person } from "@/lib/feed";
import { toast } from "../Toaster";
import { usePostingPolicy } from "../usePostingPolicy";
import { useViewAs } from "../useViewAs";
import { AUDIENCE_PHRASE, allowed } from "@/lib/posting";
import { checkPost, PHOTO_LABELS, type PostCheck } from "@/lib/ai/engines/moderation";
import { TOPIC_LABEL, readability, tagPost } from "@/lib/ai/engines/text";
import { moderation } from "./useModeration";
import { CheckPanel } from "./PrePublish";
import { AssistMenu, AssistSuggestion, UndoAssist, suggest, type Suggestion } from "./WriteAssist";

type Mode = "text" | "photo" | "poll" | "kudos";

/* Attachable images offered in the composer — real photography, same set the feed uses. */
const ART = ["/feed/wellbeing.jpg", "/feed/ship.jpg", "/feed/plant.jpg", "/feed/milestone.jpg", "/feed/coldbrew.jpg", "/feed/screen.jpg"];
const ROSTER: Person[] = [
  { name: "Aarav S.", role: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Neha R.", role: "Design", img: "/avatars/user-5.svg" },
  { name: "Meera Pillai", role: "Support", img: "/avatars/user-7.svg" },
  { name: "Dev Patel", role: "Design", img: "/avatars/user-3.svg" },
  { name: "Rahul Verma", role: "Sales", img: "/avatars/user-1.svg" },
];
const VALUES = ["Ownership", "Craft", "Grit", "Customer-first"];
/* `group` fixes where the post goes: inside a community there is no channel to
   pick, and the post carries the room it was made in. */
export function Composer({ onPost, group }: { onPost: (item: FeedItem) => void; group?: GroupRef }) {
  const me = useMe();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("text");
  const [text, setText] = React.useState("");
  const [channel, setChannel] = React.useState(channels[0].id);
  const [chOpen, setChOpen] = React.useState(false);
  const [art, setArt] = React.useState(0);
  const [pollOpts, setPollOpts] = React.useState(["", ""]);
  const [recips, setRecips] = React.useState<Person[]>([]);
  const [values, setValues] = React.useState<string[]>([]);
  const [sugg, setSugg] = React.useState<Suggestion | null>(null);
  const [before, setBefore] = React.useState<string | null>(null); // the draft as it was, for Undo
  const [check, setCheck] = React.useState<{ c: PostCheck; item: FeedItem } | null>(null);
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const [policy] = usePostingPolicy();
  const [role] = useViewAs();

  /* Posting rights. Inside a community, membership is the right; in the company
     feed the workspace's rules decide, and #company has its own. */
  const canFeed = allowed(policy.feed, role);
  const canChannel = (id: string) => canFeed && (id !== "company" || allowed(policy.announcements, role));
  const firstOpen = channels.find((c) => canChannel(c.id))?.id ?? channels[0].id;
  const effective = canChannel(channel) ? channel : firstOpen;
  const ch = channels.find((c) => c.id === effective)!;

  /* "Edit and post again" from a held or returned post lands here */
  React.useEffect(() => {
    const onCompose = (e: Event) => {
      const d = (e as CustomEvent<{ text: string; channel: string; groupId: string | null }>).detail;
      if ((d.groupId ?? null) !== (group?.id ?? null)) return;
      setOpen(true); setMode("text"); setText(d.text); if (d.channel) setChannel(d.channel);
      window.setTimeout(() => textRef.current?.focus(), 50);
    };
    window.addEventListener("vadal:compose", onCompose);
    return () => window.removeEventListener("vadal:compose", onCompose);
  }, [group?.id]);

  function reset() {
    setOpen(false); setMode("text"); setText(""); setChannel(channels[0].id);
    setPollOpts(["", ""]); setRecips([]); setValues([]); setArt(0); setSugg(null); setBefore(null); setCheck(null);
  }

  const validPoll = mode === "poll" && pollOpts.filter((o) => o.trim()).length >= 2;
  const validKudos = mode === "kudos" && recips.length > 0;
  const canPost = text.trim().length > 0 && (mode === "text" || mode === "photo" || validPoll || validKudos);

  const applySuggestion = () => {
    if (!sugg) return;
    setBefore(text); setText(sugg.text); setSugg(null);
  };

  function submit() {
    if (!canPost) return;
    const base: FeedItem = {
      id: `me-${Date.now()}`,
      type: mode === "poll" ? "poll" : mode === "kudos" ? "kudos" : "post",
      author: { name: me.fullName, role: `${me.title} · You`, img: me.img },
      channel: group ? "" : effective,
      ...(group ? { group } : {}),
      time: "now",
      text: text.trim(),
      reactions: {},
      reactedBy: [],
      comments: [],
      views: 1,
    };
    if (mode === "photo") base.media = { src: ART[art], alt: "Shared image" };
    if (mode === "poll") {
      base.poll = { closesIn: "3 days", options: pollOpts.filter((o) => o.trim()).map((label, i) => ({ id: `o${i}`, label: label.trim(), votes: 0 })) };
    }
    if (mode === "kudos") base.kudos = { to: recips, values: values.length ? values : ["Ownership"] };

    /* the pre-publish check — most posts pass straight through */
    const c = checkPost({ text: base.text, media: base.media }, policy);
    if (c.verdict === "publish") publish(base);
    else setCheck({ c, item: base });
  }

  function publish(item: FeedItem) {
    onPost(item);
    const tags = tagPost(item.text).topics.map((t) => TOPIC_LABEL[t] ?? t);
    toast(`${item.type === "kudos" ? "Kudos sent 🏆" : group ? `Posted to ${group.name} ${group.emoji}` : "Posted to the feed 🎉"}${tags.length ? ` · Nudge tagged it ${tags.slice(0, 2).join(", ")}` : ""}`);
    reset();
  }

  function sendForReview() {
    if (!check) return;
    moderation.hold(check.item, check.c.findings, check.c.safety);
    toast("Sent for review — it waits at the top of your feed until someone decides");
    reset();
  }

  const tabs: { id: Mode; label: string; icon: typeof ImageIcon }[] = [
    { id: "photo", label: "Photo", icon: ImageIcon },
    { id: "poll", label: "Poll", icon: BarChart3 },
    { id: "kudos", label: "Kudos", icon: Award },
  ];

  if (!group && !canFeed) {
    return (
      <section className="flex items-start gap-3 rounded-[22px] border border-dashed border-line bg-card p-4 sm:p-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-muted"><Lock className="h-4 w-4" /></span>
        <div>
          <p className="text-[14px] font-semibold text-ink">Posting to the company feed is open to {AUDIENCE_PHRASE[policy.feed]} here</p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">
            You can still react and comment, and post in your{" "}
            <Link href="/product/social/groups" className="font-semibold text-[var(--purple)] hover:underline">communities</Link>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[22px] border border-line bg-card p-4 transition focus-within:border-[var(--purple)]/40 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar src={me.img} name={me.fullName} size="md" />
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 truncate rounded-full bg-soft px-4 py-2.5 text-left text-[14px] text-faint transition hover:bg-[var(--lav)]"
          >
            {group ? `Post to ${group.name}…` : "Share something with the company…"}
          </button>
        ) : group ? (
          <span className="flex items-center gap-1.5 rounded-full bg-[var(--lav)] px-3 py-1.5 text-[13px] font-semibold text-[var(--purple)]">
            <span aria-hidden>{group.emoji}</span> {group.name}
          </span>
        ) : (
          <ChannelPicker ch={ch} open={chOpen} setOpen={setChOpen} can={canChannel} lockedTo={AUDIENCE_PHRASE[policy.announcements]} onSelect={(id) => { setChannel(id); setChOpen(false); setCheck(null); }} />
        )}
        {!open && (
          <div className="flex items-center gap-1 text-faint">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => { setOpen(true); setMode(t.id); }} aria-label={t.label} className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-soft hover:text-[var(--purple)]">
                <t.icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="ai-pop mt-3 space-y-3">
          <textarea
            autoFocus
            value={text}
            ref={textRef}
            onChange={(e) => { setText(e.target.value); setBefore(null); setCheck(null); }}
            rows={3}
            placeholder={mode === "kudos" ? "Say what they did well…" : "What's on your mind?"}
            /* Negative margin + equal padding: the text still lines up optically
               with the card's content edge, but the box extends 4px further out
               so a glyph with left side-bearing — Q, J, an italic f — cannot be
               clipped by the element edge. A bare field with zero padding looks
               fine until someone types the wrong first letter. */
            className="-mx-1 w-[calc(100%+0.5rem)] resize-none rounded-xl bg-transparent px-1 text-[16px] leading-relaxed text-ink outline-none placeholder:text-faint"
          />

          {sugg && (
            <AssistSuggestion
              s={sugg}
              original={text}
              onUse={applySuggestion}
              onDiscard={() => setSugg(null)}
              onRetone={(m) => setSugg(suggest(text, m))}
            />
          )}
          {check && (
            <CheckPanel
              check={check.c}
              onEdit={() => { setCheck(null); textRef.current?.focus(); }}
              onPostAnyway={() => publish(check.item)}
              onSendForReview={sendForReview}
              onRemoveDetails={() => { if (check.c.redacted) { setBefore(text); setText(check.c.redacted); } setCheck(null); }}
              onCalmer={() => {
                if (check.c.calmer) setSugg({ label: "A calmer version", text: check.c.calmer, note: "The same point, without the harsh words.", grade: readability(check.c.calmer).grade, changed: true });
                setCheck(null);
              }}
              onOtherPhoto={() => { setArt(Math.max(0, ART.findIndex((src) => !PHOTO_LABELS[src]?.risk))); setCheck(null); }}
            />
          )}
          {!sugg && before !== null && <UndoAssist onUndo={() => { setText(before); setBefore(null); }} />}

          {mode === "photo" && (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ART[art]} alt="attachment preview" className="aspect-[5/2] w-full object-cover" />
              <button onClick={() => { setArt((a) => (a + 1) % ART.length); setCheck(null); }} className="absolute bottom-2 right-2 rounded-full bg-black/55 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-black/70">
                Shuffle art
              </button>
            </div>
          )}

          {mode === "poll" && (
            <div className="space-y-2">
              {pollOpts.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={o}
                    onChange={(e) => setPollOpts((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-xl border border-line bg-transparent px-3 py-2 text-[14px] outline-none focus:border-[var(--purple)]"
                  />
                  {pollOpts.length > 2 && (
                    <button onClick={() => setPollOpts((p) => p.filter((_, j) => j !== i))} aria-label="Remove option" className="grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-soft hover:text-ink"><X className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
              {pollOpts.length < 4 && (
                <button onClick={() => setPollOpts((p) => [...p, ""])} className="text-[13px] font-semibold text-[var(--purple)] hover:underline">+ Add option</button>
              )}
            </div>
          )}

          {mode === "kudos" && (
            <div className="space-y-2.5 rounded-2xl bg-[var(--lav)] p-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Who are you recognising?</p>
              <div className="flex flex-wrap gap-1.5">
                {ROSTER.map((p) => {
                  const on = recips.some((r) => r.name === p.name);
                  return (
                    <button
                      key={p.name}
                      onClick={() => setRecips((r) => (on ? r.filter((x) => x.name !== p.name) : [...r, p]))}
                      className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-semibold ring-1 transition ${on ? "bg-[var(--purple)] text-white ring-transparent" : "bg-card text-ink ring-line hover:bg-soft"}`}
                    >
                      <Avatar src={p.img} name={p.name} size="sm" /> {p.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Tag a value</p>
              <div className="flex flex-wrap gap-1.5">
                {VALUES.map((v) => {
                  const on = values.includes(v);
                  return (
                    <button key={v} onClick={() => setValues((s) => (on ? s.filter((x) => x !== v) : [...s, v]))} className={on ? "" : "opacity-60 transition hover:opacity-100"}>
                      <Badge tone={on ? "brand" : "neutral"} variant={on ? "solid" : "soft"} size="sm">{v}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <div className="flex items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMode((m) => (m === t.id ? "text" : t.id))}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition ${mode === t.id ? "bg-[var(--lav)] text-[var(--purple)]" : "text-muted hover:bg-soft"}`}
                >
                  <t.icon className="h-4 w-4" /> <span className="max-sm:hidden">{t.label}</span>
                </button>
              ))}
              <AssistMenu text={text} onSuggest={setSugg} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="tertiary" size="sm" onClick={reset}>Cancel</Button>
              <Button variant="brand" size="sm" disabled={!canPost} onClick={submit}>
                {mode === "kudos" ? "Send kudos" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ChannelPicker({
  ch, open, setOpen, onSelect, can, lockedTo,
}: {
  ch: (typeof channels)[number];
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (id: string) => void;
  can: (id: string) => boolean;
  lockedTo: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-[var(--lav)]">
        <span aria-hidden>{ch.emoji}</span> {ch.name} <ChevronDown className="h-3.5 w-3.5 text-faint" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-60 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]">
          {channels.map((c) => {
            const ok = can(c.id);
            return (
              <button key={c.id} disabled={!ok} onClick={() => onSelect(c.id)} className="flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2 text-left transition enabled:hover:bg-soft disabled:cursor-not-allowed lg:min-h-0">
                <span className={`text-[16px] ${ok ? "" : "opacity-50"}`} aria-hidden>{c.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] font-semibold ${ok ? "text-ink" : "text-faint"}`}>{c.name}</span>
                  <span className="block truncate text-[12px] text-faint">{ok ? c.desc : `Posting here is for ${lockedTo}`}</span>
                </span>
                {!ok && <Lock className="h-3.5 w-3.5 shrink-0 text-faint" aria-label="Locked" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
