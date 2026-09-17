"use client";
/* Group cards — one card for a birthday, an anniversary or a first week,
   signed by everyone and delivered on the day (Kudos v2, spec 045).

   Better than twenty separate "happy birthday" posts: the person gets one
   thing they can keep, and the people signing can see who already has. The
   person it's for can't see the card until it's delivered. */
import * as React from "react";
import { Check, PenLine } from "lucide-react";
import { Avatar, Button } from "@vadal/design-system";
import { groupCards, type GroupCard } from "@/lib/recognize";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";

const SUGGEST: Record<string, string[]> = {
  "Work anniversary": ["Here's to the next one!", "Thank you for making work better.", "Couldn't imagine the team without you."],
  Birthday: ["Happy birthday! 🎂", "Have a brilliant day off from us.", "Hope it's a great one."],
  "New joiner": ["So glad you're here!", "Shout if you need anything.", "Welcome — lunch this week?"],
};

export function GroupCards({ meName, meImg, signed, onSign }: { meName: string; meImg: string; signed: Record<string, string>; onSign: (id: string, text: string) => void }) {
  const [open, setOpen] = React.useState<GroupCard | null>(null);
  // You don't sign your own card — and you don't see it before it's delivered.
  const cards = groupCards.filter((c) => c.for.name !== meName);
  if (!cards.length) return null;

  return (
    <section className="card-lift rounded-[26px] border border-line bg-card p-6" aria-labelledby="cards-h">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Moments</p>
      <h2 id="cards-h" className="mt-1.5 text-[18px] font-bold tracking-tight">Cards to sign</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {cards.map((c) => {
          const mine = signed[c.id];
          const count = c.signatures.length + (mine ? 1 : 0);
          return (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-soft p-3">
              <span className="relative shrink-0">
                <Avatar src={c.for.img} name={c.for.name} size="md" />
                <span aria-hidden className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-card text-[13px] ring-1 ring-line">{c.emoji}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">{c.for.name}</span>
                <span className="block truncate text-[12px] text-faint">{c.occasion} · {count} signed</span>
              </span>
              <Button
                variant={mine ? "tertiary" : "secondary"} size="sm" className="min-h-[44px] shrink-0 lg:min-h-0"
                leadingIcon={mine ? <Check className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
                onClick={() => setOpen(c)}
              >
                {mine ? "Signed" : "Sign"}
              </Button>
            </li>
          );
        })}
      </ul>

      <Drawer open={!!open} title={open ? `Card for ${open.for.name}` : "Card"} onClose={() => setOpen(null)}>
        {open && <SignSheet key={open.id} card={open} meName={meName} meImg={meImg} mine={signed[open.id]} onSign={(t) => { onSign(open.id, t); toast(`Signed — ${open.for.name.split(" ")[0]} gets the card ${open.delivers.toLowerCase()}`); setOpen(null); }} />}
      </Drawer>
    </section>
  );
}

function SignSheet({ card, meName, meImg, mine, onSign }: { card: GroupCard; meName: string; meImg: string; mine?: string; onSign: (text: string) => void }) {
  const [text, setText] = React.useState(mine ?? "");
  const all = [...card.signatures, ...(mine ? [{ from: { name: meName, team: "", img: meImg }, text: mine }] : [])];
  return (
    <div className="flex flex-col gap-5">
      {/* the card itself */}
      <div className="relative overflow-hidden rounded-[24px] border border-line p-6 text-center" style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--purple) 16%, var(--card)), var(--card) 70%)" }}>
        <span aria-hidden className="text-[44px] leading-none">{card.emoji}</span>
        <p className="mt-3 text-[22px] font-bold tracking-tight text-ink">{card.headline}</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-muted">
          <Avatar src={card.for.img} name={card.for.name} size="sm" /> {card.for.team} · delivered {card.delivers.toLowerCase()}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{all.length} signed</p>
        <ul className="mt-2 flex flex-col gap-2.5">
          {all.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Avatar src={s.from.img} name={s.from.name} size="sm" />
              <p className="min-w-0 rounded-2xl rounded-tl-md bg-soft px-3.5 py-2 text-[14px] leading-snug text-ink/90"><span className="font-semibold text-ink">{s.from.name === meName ? "You" : s.from.name}</span> {s.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="sign-text" className="text-[13px] font-semibold text-ink">{mine ? "Change your message" : "Add your message"}</label>
        <textarea
          id="sign-text" value={text} maxLength={140} rows={3} onChange={(e) => setText(e.target.value)}
          placeholder={`Write something ${card.for.name.split(" ")[0]} will want to keep…`}
          className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-card px-3.5 py-2.5 text-[16px] leading-relaxed outline-none focus:border-[var(--purple)] lg:text-[14px]"
        />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(SUGGEST[card.occasion] ?? []).map((s) => (
            <button key={s} onClick={() => setText(s)} className="min-h-[44px] rounded-full border border-line px-3 text-[13px] text-muted transition hover:border-[var(--purple)] hover:text-ink lg:min-h-[32px]">{s}</button>
          ))}
        </div>
      </div>

      <Button variant="brand" className="min-h-[44px] self-start lg:min-h-0" disabled={!text.trim()} leadingIcon={<PenLine className="h-4 w-4" />} onClick={() => onSign(text.trim())}>
        {mine ? "Update signature" : "Sign the card"}
      </Button>
    </div>
  );
}
