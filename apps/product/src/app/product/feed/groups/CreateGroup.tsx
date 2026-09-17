"use client";
/* Make a community. Two decisions up front — what kind of room it is, and
   whether anyone can walk in — then a name and a line about it. It saves as a
   draft, so the room can be set up before anyone is invited; publishing is what
   puts it on the hub. Nudge will write the description from the name. */
import * as React from "react";
import { Globe2, Lock, Sparkles } from "lucide-react";
import { Button } from "@vadal/design-system";
import { EMOJI_CHOICES, type Group, type GroupKind, type GroupPrivacy } from "@/lib/groups";
import { Drawer } from "../../Drawer";
import { useMe } from "../../useSession";

const KINDS: { id: GroupKind; label: string; hint: string }[] = [
  { id: "project", label: "Project", hint: "A room around a piece of work. It wraps up when the work does." },
  { id: "interest", label: "Interest", hint: "A standing circle around something people share." },
];

function draftFor(kind: GroupKind, name: string) {
  const n = name.trim() || (kind === "project" ? "this project" : "this");
  return kind === "project"
    ? `The room for ${n} — updates, demos and decisions in one place, so nobody has to ask twice. The tasks stay in the tracker; this is where we talk about the work.`
    : `For everyone into ${n.charAt(0).toLowerCase()}${n.slice(1)}. Share what you are up to, ask the beginner question, and find people to do it with. All levels welcome.`;
}

export function CreateGroup({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (g: Group) => void }) {
  const me = useMe();
  const [kind, setKind] = React.useState<GroupKind>("project");
  const [privacy, setPrivacy] = React.useState<GroupPrivacy>("open");
  const [emoji, setEmoji] = React.useState(EMOJI_CHOICES[0]);
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [wraps, setWraps] = React.useState("");
  const [thinking, setThinking] = React.useState(false);

  const reset = () => { setKind("project"); setPrivacy("open"); setEmoji(EMOJI_CHOICES[0]); setName(""); setDesc(""); setWraps(""); };
  const close = () => { reset(); onClose(); };
  const valid = name.trim().length >= 3 && desc.trim().length >= 10;

  function draft() {
    setThinking(true);
    window.setTimeout(() => { setDesc(draftFor(kind, name)); setThinking(false); }, 650);
  }

  function save(status: Group["status"]) {
    if (!valid) return;
    const text = desc.trim();
    onCreate({
      id: `mine-${Date.now()}`,
      kind, privacy, status, emoji,
      name: name.trim(),
      desc: text.length > 110 ? `${text.slice(0, 107).trimEnd()}…` : text,
      about: text,
      owner: { name: me.fullName, role: me.title, img: me.img },
      members: 1,
      roster: [{ name: me.fullName, role: me.title, img: me.img }],
      tags: [],
      postsThisWeek: 0,
      activity: status === "draft" ? "Not published yet" : "New",
      wraps: kind === "project" && wraps.trim() ? wraps.trim() : undefined,
      mine: true,
    });
    close();
  }

  const field = "w-full rounded-xl border border-line bg-transparent px-3.5 py-2.5 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-[var(--purple)] focus:ring-4 focus:ring-[var(--purple)]/10";
  const label = "text-[12px] font-semibold uppercase tracking-[0.14em] text-faint";

  return (
    <Drawer open={open} title="New community" onClose={close}>
      <div className="space-y-6">
        <header>
          <h2 className="text-[22px] font-bold tracking-tight text-ink">New community</h2>
          <p className="mt-1 text-[14px] text-muted">Set it up as a draft, publish when it is ready for people.</p>
        </header>

        <div className="space-y-2">
          <p className={label}>What kind of room?</p>
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                aria-pressed={kind === k.id}
                className={`rounded-2xl border p-3.5 text-left transition ${kind === k.id ? "border-[var(--purple)] bg-[var(--lav)]" : "border-line hover:bg-soft"}`}
              >
                <span className={`block text-[14px] font-semibold ${kind === k.id ? "text-[var(--purple)]" : "text-ink"}`}>{k.label}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">{k.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="cg-name" className={label}>Name</label>
          <div className="flex items-center gap-2">
            <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl border border-line text-[22px]" aria-hidden>{emoji}</span>
            <input id="cg-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={kind === "project" ? "Checkout redesign" : "Cycling to work"} className={field} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1" role="group" aria-label="Icon">
            {EMOJI_CHOICES.map((e) => (
              <button key={e} onClick={() => setEmoji(e)} aria-label={`Icon ${e}`} aria-pressed={emoji === e} className={`grid h-11 w-11 place-items-center rounded-lg text-[18px] transition lg:h-9 lg:w-9 ${emoji === e ? "bg-[var(--lav)] ring-1 ring-[var(--purple)]" : "hover:bg-soft"}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="cg-desc" className={label}>What is it for?</label>
            <button onClick={draft} disabled={thinking} className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:bg-[var(--ai-surface)] disabled:opacity-60 lg:min-h-[32px]">
              <Sparkles className={`h-4 w-4 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Draft with Nudge"}
            </button>
          </div>
          <textarea id="cg-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Who is it for, and what happens here?" className={`${field} resize-none leading-relaxed`} />
        </div>

        {kind === "project" && (
          <div className="space-y-2">
            <label htmlFor="cg-wraps" className={label}>When does it wrap? <span className="normal-case tracking-normal text-faint">· optional</span></label>
            <input id="cg-wraps" value={wraps} onChange={(e) => setWraps(e.target.value)} placeholder="Wraps in November" className={field} />
          </div>
        )}

        <div className="space-y-2">
          <p className={label}>Who can join?</p>
          <div className="space-y-2">
            {([
              { id: "open", icon: Globe2, title: "Anyone at the company", hint: "People join in one tap." },
              { id: "request", icon: Lock, title: "People ask to join", hint: "You approve each request." },
            ] as const).map((o) => (
              <button
                key={o.id}
                onClick={() => setPrivacy(o.id)}
                aria-pressed={privacy === o.id}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${privacy === o.id ? "border-[var(--purple)] bg-[var(--lav)]" : "border-line hover:bg-soft"}`}
              >
                <o.icon className={`h-[18px] w-[18px] shrink-0 ${privacy === o.id ? "text-[var(--purple)]" : "text-faint"}`} />
                <span>
                  <span className="block text-[14px] font-semibold text-ink">{o.title}</span>
                  <span className="block text-[12px] text-muted">{o.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
          <Button variant="secondary" size="md" disabled={!valid} onClick={() => save("draft")}>Save draft</Button>
          <Button variant="brand" size="md" disabled={!valid} onClick={() => save("published")}>Publish</Button>
        </div>
      </div>
    </Drawer>
  );
}
