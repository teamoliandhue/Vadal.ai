"use client";
/* One kudos on the wall (Kudos v2, spec 045).

   A card, not a log line: a tinted band says what kind of thanks it is and
   which value it lives, the people recognised lead, and the conversation that
   recognition deserves hangs underneath —
   · Celebrate — the one reaction that matters here;
   · Boosts — a short "me too" from anyone, shown as small notes;
   · Say thanks — the recipient's reply, once. */
import * as React from "react";
import { PartyPopper, Plus, Reply, Send } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { CARD_STYLES, values } from "@/lib/recognize";
import { toast } from "../Toaster";
import { recognises, type KudosView } from "./useKudosState";

const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const BOOST_MAX = 60;

export function KudosCard({ k, meName, points, onCelebrate, onBoost, onThanks }: {
  k: KudosView;
  meName: string;
  points: boolean;
  onCelebrate: () => void;
  onBoost: (text: string) => void;
  onThanks: (text: string) => void;
}) {
  const [boosting, setBoosting] = React.useState(false);
  const [replying, setReplying] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);

  const style = CARD_STYLES.find((s) => s.id === k.style) ?? CARD_STYLES[0];
  const value = values.find((v) => v.name === k.value);
  const people = [k.to, ...(k.also ?? [])];
  const forMe = recognises(k, meName);
  const fromMe = k.from.name === meName;
  const boosts = k.boosts ?? [];
  const shown = showAll ? boosts : boosts.slice(0, 2);
  const names = people.length === 1 ? people[0].name : people.length === 2 ? `${people[0].name} and ${people[1].name}` : `${people[0].name} and ${people.length - 1} others`;
  const iBoosted = boosts.some((b) => b.from.name === meName);

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    if (replying) { onThanks(t); toast(`Thanks sent to ${k.from.name.split(" ")[0]}`); }
    else { onBoost(t); toast("Boost added"); }
    setDraft(""); setBoosting(false); setReplying(false);
  };

  return (
    <article className="card-lift overflow-hidden rounded-[22px] border border-line bg-card">
      {/* what kind of thanks, and the value it lives */}
      <div className="flex items-center gap-2 px-5 py-2.5" style={{ background: soft(style.tint, 12) }}>
        <span aria-hidden className="text-[18px]">{style.emoji}</span>
        <span className="text-[13px] font-semibold text-ink">{style.label}</span>
        {value && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-0.5 text-[12px] font-semibold" style={{ color: value.color }}>
            <span aria-hidden>{value.emoji}</span> {value.name}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 -space-x-3">
            {people.slice(0, 3).map((p, i) => (
              <span key={p.name} className="rounded-full ring-2 ring-[var(--card)]" style={{ zIndex: 3 - i }}><Avatar src={p.img} name={p.name} size={i === 0 ? "lg" : "md"} /></span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-snug text-ink">
              {names}{forMe && <span className="ml-1.5 rounded-full bg-[var(--lav)] px-1.5 py-0.5 align-middle text-[11px] font-semibold text-[var(--purple)]">You</span>}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-faint">
              <span>from</span>
              <Avatar src={k.from.img} name={k.from.name} size="sm" />
              <span className="font-medium text-muted">{fromMe ? "you" : k.from.name}</span>
              {k.manager && <span className="rounded-full bg-soft px-1.5 py-0.5 text-[11px] font-semibold text-muted">Manager</span>}
              <span aria-hidden>·</span>
              <span>{/^\d/.test(k.time) ? `${k.time} ago` : k.time}</span>
            </p>
          </div>
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-ink/90">{k.message}</p>

        {k.thanks && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-soft px-3.5 py-2.5">
            <Reply className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
            <p className="text-[14px] leading-snug text-muted"><span className="font-semibold text-ink">{k.to.name.split(" ")[0]}</span> {k.thanks}</p>
          </div>
        )}

        {boosts.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Boosts">
            {shown.map((b, i) => (
              <li key={i} className="flex max-w-full items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-3">
                <Avatar src={b.from.img} name={b.from.name} size="sm" />
                <span className="truncate text-[13px] text-muted"><span className="font-semibold text-ink">{b.from.name === meName ? "You" : b.from.name.split(" ")[0]}</span> {b.text}</span>
              </li>
            ))}
            {boosts.length > 2 && !showAll && (
              <li><button onClick={() => setShowAll(true)} className="flex min-h-[44px] items-center rounded-full px-2.5 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-[32px]">+{boosts.length - 2} more</button></li>
            )}
          </ul>
        )}

        {(boosting || replying) && (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-3 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-full bg-soft pl-3.5 pr-2 focus-within:ring-2 focus-within:ring-[var(--purple)]/30">
              <input
                autoFocus
                value={draft}
                maxLength={replying ? 140 : BOOST_MAX}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={replying ? `Say thanks to ${k.from.name.split(" ")[0]}…` : "Add a short note — “Couldn't agree more”"}
                aria-label={replying ? "Say thanks" : "Add a boost"}
                className="min-h-[44px] min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-faint lg:min-h-[38px] lg:text-[14px]"
              />
              <span className="shrink-0 text-[12px] tabular-nums text-faint">{(replying ? 140 : BOOST_MAX) - draft.length}</span>
            </div>
            <button type="submit" disabled={!draft.trim()} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white disabled:opacity-40 lg:h-9 lg:w-9"><Send className="h-4 w-4" /></button>
            <button type="button" onClick={() => { setBoosting(false); setReplying(false); setDraft(""); }} className="min-h-[44px] px-1 text-[13px] font-semibold text-muted hover:text-ink lg:min-h-0">Cancel</button>
          </form>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2.5">
          <button
            onClick={onCelebrate}
            aria-pressed={k.celebrated}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition lg:min-h-[34px] ${k.celebrated ? "bg-[var(--lav)] text-[var(--purple)]" : "text-muted hover:bg-soft hover:text-ink"}`}
          >
            <PartyPopper className="h-4 w-4" /> {k.celebrated ? "Celebrated" : "Celebrate"} <span className="tabular-nums">{k.reactions}</span>
          </button>
          {!fromMe && !forMe && !iBoosted && (
            <button onClick={() => { setBoosting(true); setReplying(false); }} className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-ink lg:min-h-[34px]">
              <Plus className="h-4 w-4" /> Boost
            </button>
          )}
          {forMe && !k.thanks && (
            <button onClick={() => { setReplying(true); setBoosting(false); }} className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[var(--purple)] transition hover:bg-[var(--lav)] lg:min-h-[34px]">
              <Reply className="h-4 w-4" /> Say thanks
            </button>
          )}
          {points && <span className="ml-auto text-[12px] text-faint">+{k.points} pts{people.length > 1 ? " each" : ""}</span>}
        </div>
      </div>
    </article>
  );
}
