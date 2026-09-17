"use client";
/* Give recognition — opens in the shared Drawer (Kudos v2, spec 045).

   Pick one person or a whole crew, choose what kind of thanks it is and the
   value it lives, write the note (or let Nudge word it), and decide whether
   the company sees it. "Share to the company feed" is real now: the kudos
   appears in Social under #wins. You can't pick yourself. */
import * as React from "react";
import { Search, Sparkles, X } from "lucide-react";
import { Avatar, Button, SparkMark, Switch } from "@vadal/design-system";
import type { FeedItem } from "@/lib/feed";
import { EARN_RULES } from "@/lib/points";
import { CARD_STYLES, values, teammates, draftLines, type CardStyle, type Kudos, type Person } from "@/lib/recognize";
import { didAction } from "@/lib/tour";
import { usePoints } from "../usePointsMode";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { useMe } from "../useSession";

/* Fixed and published (lib/points): the same for every value — a value is not worth more than another. */
const GIVE = EARN_RULES.find((r) => r.source === "kudos-given")!.points;
const GET = EARN_RULES.find((r) => r.source === "kudos-received")!.points;
const MAX_PEOPLE = 8;
const FEED_KEY = "vadal:feed2-mine";

/* Social reads its own posts from this key on mount — write the kudos there. */
function shareToSocial(item: FeedItem) {
  try {
    const cur = JSON.parse(localStorage.getItem(FEED_KEY) ?? "[]") as FeedItem[];
    localStorage.setItem(FEED_KEY, JSON.stringify([item, ...cur]));
  } catch { /* storage unavailable — the kudos still lands on the wall */ }
}

export function GiveRecognition({
  open, seedTo, onClose, onGive,
}: {
  open: boolean;
  seedTo?: Person | null;
  onClose: () => void;
  onGive: (k: Kudos) => void;
}) {
  const points = usePoints();
  const me = useMe();
  const [people, setPeople] = React.useState<Person[]>([]);
  const [query, setQuery] = React.useState("");
  const [value, setValue] = React.useState<string>(values[0].name);
  const [style, setStyle] = React.useState<CardStyle>("thanks");
  const [message, setMessage] = React.useState("");
  const [pub, setPub] = React.useState(true);
  const [thinking, setThinking] = React.useState(false);

  // (re)seed each open
  React.useEffect(() => {
    if (!open) return;
    setPeople(seedTo ? [seedTo] : []);
    setQuery("");
    setValue(values[0].name);
    setStyle(seedTo?.name.endsWith("crew") ? "teamwin" : "thanks");
    setMessage("");
    setPub(true);
  }, [open, seedTo]);

  const matches = query.trim()
    ? teammates
      .filter((p) => p.name !== me.fullName && !people.some((x) => x.name === p.name))
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.team.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
    : [];

  const firstNames = people.map((p) => p.name.split(" ")[0]);
  const who = firstNames.length <= 1 ? firstNames[0] ?? "they" : `${firstNames.slice(0, -1).join(", ")} and ${firstNames.at(-1)}`;

  function draft() {
    if (!people.length) { toast("Pick someone first", "info"); return; }
    setThinking(true);
    window.setTimeout(() => {
      const lines = draftLines[value] ?? draftLines.Ownership;
      const line = lines[(message.length + people.length) % lines.length].replace("{x}", "the launch this week");
      setMessage(`${who} ${line}`);
      setThinking(false);
      toast("Nudge drafted a note — make it yours");
    }, 600);
  }

  const valid = people.length > 0 && message.trim().length > 0;

  function send() {
    if (!valid) return;
    const id = `k-${Date.now()}`;
    const k: Kudos = {
      id,
      from: { name: me.fullName, team: me.team, img: me.img },
      to: people[0],
      also: people.slice(1),
      style,
      value,
      message: message.trim(),
      time: "Just now",
      reactions: 0,
      points: GET,
    };
    onGive(k);
    if (pub) {
      shareToSocial({
        id: `me-${id}`, type: "kudos", channel: "wins", time: "now", text: message.trim(),
        author: { name: me.fullName, role: `${me.title} · You`, img: me.img },
        kudos: { to: people.map((p) => ({ name: p.name, role: p.team, img: p.img })), values: [value] },
        reactions: {}, reactedBy: [], comments: [], views: 1,
      });
    }
    didAction("kudos");
    toast(`Recognition sent to ${who} 🎉${pub ? " · it's in Social under #wins" : ""}`);
    onClose();
  }

  const active = values.find((v) => v.name === value)!;

  return (
    <Drawer open={open} title="Give recognition" onClose={onClose}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Give recognition</p>
      <h2 className="mt-1.5 pr-10 text-[20px] font-bold tracking-tight">Catch someone doing it right</h2>

      {/* recipients */}
      <div className="mt-5">
        <span className="text-[13px] font-semibold text-ink">To</span>
        {people.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {people.map((p) => (
              <li key={p.name} className="flex items-center gap-1.5 rounded-full border border-line bg-soft py-1 pl-1 pr-1">
                <Avatar src={p.img} name={p.name} size="sm" />
                <span className="text-[13px] font-semibold text-ink">{p.name}</span>
                <button onClick={() => setPeople((x) => x.filter((y) => y.name !== p.name))} aria-label={`Remove ${p.name}`} className="grid h-11 w-11 place-items-center rounded-full text-faint hover:text-ink lg:h-7 lg:w-7"><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
        {people.length < MAX_PEOPLE && (
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              autoFocus={!seedTo}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search a teammate"
              placeholder={people.length ? "Add someone else — recognise the whole crew" : "Search a teammate or a team…"}
              className="min-h-[44px] w-full rounded-xl border border-line bg-card pl-9 pr-3 text-[16px] outline-none transition focus:border-[var(--purple)] lg:text-[14px]"
            />
            {matches.length > 0 && (
              <ul className="mt-1.5 overflow-hidden rounded-xl border border-line bg-card shadow-sm">
                {matches.map((p) => (
                  <li key={p.name}>
                    <button onClick={() => { setPeople((x) => [...x, p]); setQuery(""); }} className="flex min-h-[44px] w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-soft">
                      <Avatar src={p.img} name={p.name} size="sm" />
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{p.name}</span><span className="block text-[12px] text-faint">{p.team}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* kind of thanks */}
      <div className="mt-5">
        <span className="text-[13px] font-semibold text-ink">Kind of thanks</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {CARD_STYLES.map((c) => {
            const on = c.id === style;
            return (
              <button
                key={c.id}
                onClick={() => setStyle(c.id)}
                aria-pressed={on}
                className={`flex min-h-[52px] items-center gap-2.5 rounded-2xl border px-3 text-left text-[13px] font-semibold transition ${on ? "text-ink" : "border-line text-muted hover:text-ink"}`}
                style={on ? { borderColor: c.tint, background: `color-mix(in srgb, ${c.tint} 12%, transparent)` } : undefined}
              >
                <span aria-hidden className="text-[20px]">{c.emoji}</span> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* value */}
      <div className="mt-5">
        <span className="text-[13px] font-semibold text-ink">The value it lives</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => {
            const on = v.name === value;
            return (
              <button
                key={v.name}
                onClick={() => setValue(v.name)}
                aria-pressed={on}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "text-ink" : "border-line text-muted hover:text-ink"}`}
                style={on ? { borderColor: v.color, background: `color-mix(in srgb, ${v.color} 14%, transparent)` } : undefined}
              >
                <span aria-hidden>{v.emoji}</span> {v.name}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[12px] text-faint">{active.blurb}</p>
      </div>

      {/* message */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">Note</span>
          <button onClick={draft} disabled={thinking} className="flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80 disabled:opacity-60 lg:min-h-0">
            <Sparkles className={`h-3.5 w-3.5 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Help me word it"}
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          aria-label="Note"
          placeholder="Say what they did and why it mattered…"
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-[16px] leading-relaxed outline-none transition focus:border-[var(--purple)] lg:text-[14px]"
        />
      </div>

      {/* visibility */}
      <div className="mt-4 rounded-xl border border-line px-3.5 py-3">
        <Switch
          checked={pub}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPub(e.target.checked)}
          label="Share to the company feed"
          description={pub ? "It appears in Social under #wins, where everyone can celebrate it" : `Private — only ${who} will see it`}
        />
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-[calc(1.5rem+env(safe-area-inset-bottom))] mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line bg-card px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:-mx-7 md:-mb-7 md:px-7 md:pb-4">
        <span className="text-[12px] text-faint">{points ? <>You get <span className="font-semibold text-muted">+{GIVE}</span> · {people.length > 1 ? "each of them" : who} gets <span className="font-semibold text-muted">+{GET}</span></> : "Counts toward their Top recogniser badge"}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" disabled={!valid} leadingIcon={<SparkMark size={14} tone="solid" />} onClick={send}>Send recognition</Button>
        </div>
      </div>
    </Drawer>
  );
}
