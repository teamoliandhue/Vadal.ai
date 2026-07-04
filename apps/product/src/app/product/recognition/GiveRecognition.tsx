"use client";
/* Give recognition — opens in the shared Drawer. Pick a teammate, tag a company
   value, write a note (or let Vadal draft it), choose whether it's public to the
   feed, and send. Emits a Kudos the hub prepends to the wall (demo-only). */
import * as React from "react";
import { Search, Sparkles } from "lucide-react";
import { Avatar, Button, SparkMark, Switch } from "@vadal/design-system";
import { Drawer } from "../Drawer";
import { toast } from "../Toaster";
import { me } from "@/lib/data";
import { values, teammates, draftLines, type Kudos, type Person } from "@/lib/recognize";

const POINTS: Record<string, number> = { Ownership: 50, Collaboration: 40, Innovation: 40, "Customer focus": 40 };
let kid = 100;

export function GiveRecognition({
  open,
  seedTo,
  onClose,
  onGive,
}: {
  open: boolean;
  seedTo?: Person | null;
  onClose: () => void;
  onGive: (k: Kudos) => void;
}) {
  const [to, setTo] = React.useState<Person | null>(null);
  const [query, setQuery] = React.useState("");
  const [value, setValue] = React.useState<string>(values[0].name);
  const [message, setMessage] = React.useState("");
  const [pub, setPub] = React.useState(true);
  const [thinking, setThinking] = React.useState(false);

  // (re)seed each open
  React.useEffect(() => {
    if (!open) return;
    setTo(seedTo ?? null);
    setQuery("");
    setValue(values[0].name);
    setMessage("");
    setPub(true);
  }, [open, seedTo]);

  const matches = query.trim()
    ? teammates.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.team.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  function draft() {
    if (!to) { toast("Pick a teammate first", "info"); return; }
    setThinking(true);
    window.setTimeout(() => {
      const lines = draftLines[value] ?? draftLines.Ownership;
      const line = lines[kid % lines.length].replace("{x}", "the launch this week");
      setMessage(`${to.name.split(" ")[0]} ${line}`);
      setThinking(false);
      toast("Vadal drafted a note ✨");
    }, 600);
  }

  const valid = !!to && message.trim().length > 0;

  function send() {
    if (!valid || !to) return;
    const k: Kudos = {
      id: `k${kid++}`,
      from: { name: me.fullName, team: me.team, img: me.img },
      to,
      value,
      message: message.trim(),
      time: "Just now",
      reactions: 0,
      points: POINTS[value] ?? 40,
    };
    onGive(k);
    toast(`Recognition sent to ${to.name.split(" ")[0]} 🎉${pub ? " · shared to the feed" : ""}`);
    onClose();
  }

  const active = values.find((v) => v.name === value)!;

  return (
    <Drawer open={open} title="Give recognition" onClose={onClose}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Give recognition</p>
      <h2 className="mt-1.5 text-[20px] font-bold tracking-tight">Catch someone doing it right</h2>

      {/* recipient */}
      <div className="mt-5">
        <span className="text-[12px] font-semibold text-faint">To</span>
        {to ? (
          <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-line bg-soft px-3 py-2.5">
            <Avatar src={to.img} name={to.name} size="md" />
            <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">{to.name}</div><div className="text-[12px] text-faint">{to.team}</div></div>
            <button onClick={() => setTo(null)} className="text-[12px] font-semibold text-[var(--purple)] hover:underline">Change</button>
          </div>
        ) : (
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a teammate…"
              className="w-full rounded-xl border border-line bg-card py-2.5 pl-9 pr-3 text-[14px] outline-none transition focus:border-[var(--purple)]"
            />
            {matches.length > 0 && (
              <ul className="mt-1.5 overflow-hidden rounded-xl border border-line bg-card shadow-sm">
                {matches.map((p) => (
                  <li key={p.name}>
                    <button onClick={() => { setTo(p); setQuery(""); }} className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-soft">
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

      {/* value */}
      <div className="mt-5">
        <span className="text-[12px] font-semibold text-faint">For living a value</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => {
            const on = v.name === value;
            return (
              <button
                key={v.name}
                onClick={() => setValue(v.name)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${on ? "text-ink" : "border-line text-muted hover:text-ink"}`}
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
          <span className="text-[12px] font-semibold text-faint">Note</span>
          <button onClick={draft} disabled={thinking} className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:opacity-80 disabled:opacity-60">
            <Sparkles className={`h-3.5 w-3.5 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Drafting…" : "Help me word it"}
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Say what they did and why it mattered…"
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14px] leading-relaxed outline-none transition focus:border-[var(--purple)]"
        />
      </div>

      {/* visibility */}
      <div className="mt-4 rounded-xl border border-line px-3.5 py-3">
        <Switch
          checked={pub}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPub(e.target.checked)}
          label="Share to the company feed"
          description={pub ? "Everyone can celebrate it" : "Private — only they'll see it"}
        />
      </div>

      <div className="sticky bottom-0 -mx-7 -mb-7 mt-6 flex items-center justify-between gap-2 border-t border-line bg-card px-7 py-4">
        <span className="text-[12px] text-faint">Worth <span className="font-semibold text-muted">+{POINTS[value] ?? 40} pts</span></span>
        <div className="flex items-center gap-2">
          <Button variant="tertiary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" disabled={!valid} leadingIcon={<SparkMark size={14} tone="solid" />} onClick={send}>Send recognition</Button>
        </div>
      </div>
    </Drawer>
  );
}
