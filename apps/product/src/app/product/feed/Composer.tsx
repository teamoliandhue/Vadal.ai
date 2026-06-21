"use client";
/* Rich feed composer. Collapsed it's a single pill; on focus it expands into a
   full editor with a channel picker, four modes (Text / Photo / Poll / Kudos),
   and a "Draft with Vadal" AI assist. Emits a fully-formed FeedItem to the hub. */
import * as React from "react";
import { BarChart3, ChevronDown, Award, ImageIcon, Sparkles, X } from "lucide-react";
import { Avatar, Badge, Button } from "@vadal/design-system";
import { me } from "@/lib/data";
import { channels, type FeedItem, type Person } from "@/lib/feed";
import { toast } from "../Toaster";

type Mode = "text" | "photo" | "poll" | "kudos";

const ART = ["/feed/art-confetti.svg", "/feed/art-wellbeing.svg", "/feed/art-ship.svg", "/feed/art-offsite.svg"];
const ROSTER: Person[] = [
  { name: "Aarav S.", role: "Engineering", img: "/avatars/user-2.svg" },
  { name: "Neha R.", role: "Design", img: "/avatars/user-5.svg" },
  { name: "Meera Pillai", role: "Support", img: "/avatars/user-7.svg" },
  { name: "Dev Patel", role: "Design", img: "/avatars/user-3.svg" },
  { name: "Rahul Verma", role: "Sales", img: "/avatars/user-1.svg" },
];
const VALUES = ["Ownership", "Craft", "Grit", "Customer-first"];
const AI_DRAFTS = [
  "Quick win to share — we cut our release checklist from 40 minutes to 12 by automating the smoke tests. Happy to walk anyone through it. 🚀",
  "Reminder that no-meeting Wednesday is tomorrow. Protect your focus blocks and ship something you're proud of. 💜",
  "Grateful for this team this week — calm under pressure, generous with help. Tag someone who made your week easier. 🙌",
];

export function Composer({ onPost }: { onPost: (item: FeedItem) => void }) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("text");
  const [text, setText] = React.useState("");
  const [channel, setChannel] = React.useState(channels[0].id);
  const [chOpen, setChOpen] = React.useState(false);
  const [art, setArt] = React.useState(0);
  const [pollOpts, setPollOpts] = React.useState(["", ""]);
  const [recips, setRecips] = React.useState<Person[]>([]);
  const [values, setValues] = React.useState<string[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const draftIx = React.useRef(0);
  const ch = channels.find((c) => c.id === channel)!;

  function reset() {
    setOpen(false); setMode("text"); setText(""); setChannel(channels[0].id);
    setPollOpts(["", ""]); setRecips([]); setValues([]); setArt(0);
  }

  const validPoll = mode === "poll" && pollOpts.filter((o) => o.trim()).length >= 2;
  const validKudos = mode === "kudos" && recips.length > 0;
  const canPost = text.trim().length > 0 && (mode === "text" || mode === "photo" || validPoll || validKudos);

  function draftWithVadal() {
    setThinking(true);
    setMode((m) => (m === "poll" || m === "kudos" ? "text" : m));
    window.setTimeout(() => {
      setText(AI_DRAFTS[draftIx.current % AI_DRAFTS.length]);
      draftIx.current += 1;
      setThinking(false);
      toast("Vadal drafted a post — edit and send ✨");
    }, 700);
  }

  function submit() {
    if (!canPost) return;
    const base: FeedItem = {
      id: `me-${Date.now()}`,
      type: mode === "poll" ? "poll" : mode === "kudos" ? "kudos" : "post",
      author: { name: me.fullName, role: `${me.title} · You`, img: me.img },
      channel,
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
    onPost(base);
    toast(mode === "kudos" ? "Kudos sent 🏆" : "Posted to the feed 🎉");
    reset();
  }

  const tabs: { id: Mode; label: string; icon: typeof ImageIcon }[] = [
    { id: "photo", label: "Photo", icon: ImageIcon },
    { id: "poll", label: "Poll", icon: BarChart3 },
    { id: "kudos", label: "Kudos", icon: Award },
  ];

  return (
    <section className="rounded-[22px] border border-line bg-card p-4 transition focus-within:border-[var(--purple)]/40 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar src={me.img} name={me.fullName} size="md" />
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex-1 rounded-full bg-soft px-4 py-2.5 text-left text-[14px] text-faint transition hover:bg-[var(--lav)]"
          >
            Share something with the company…
          </button>
        ) : (
          <ChannelPicker ch={ch} open={chOpen} setOpen={setChOpen} onSelect={(id) => { setChannel(id); setChOpen(false); }} />
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
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={mode === "kudos" ? "Say what they did well…" : "What's on your mind?"}
            className="w-full resize-none rounded-xl bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-faint"
          />

          {mode === "photo" && (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ART[art]} alt="attachment preview" className="aspect-[5/2] w-full object-cover" />
              <button onClick={() => setArt((a) => (a + 1) % ART.length)} className="absolute bottom-2 right-2 rounded-full bg-black/55 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-black/70">
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
              <button
                onClick={draftWithVadal}
                disabled={thinking}
                className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:bg-[var(--ai-surface)] disabled:opacity-60"
              >
                <Sparkles className={`h-4 w-4 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Draft with Vadal"}
              </button>
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
  ch, open, setOpen, onSelect,
}: {
  ch: (typeof channels)[number];
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (id: string) => void;
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
          {channels.map((c) => (
            <button key={c.id} onClick={() => onSelect(c.id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-soft">
              <span className="text-[16px]" aria-hidden>{c.emoji}</span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-ink">{c.name}</span>
                <span className="block truncate text-[12px] text-faint">{c.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
