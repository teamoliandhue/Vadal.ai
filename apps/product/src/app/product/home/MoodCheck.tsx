"use client";
/* The daily ritual (Notion Home spec §2.2) — lives inside the hero band. Card-less.
   Default → selected (+ optional why) → confirmed. Neutral surfaces, violet accent. */
import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@vadal/design-system";
import { moods, me } from "@/lib/data";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function MoodCheck() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [done, setDone] = React.useState(false);

  if (done) {
    const mood = moods.find((m) => m.label === selected);
    return (
      <div>
        <Eyebrow>Daily check-in</Eyebrow>
        <div className="mt-3 flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-vgreen-soft text-vgreen">
            <Check className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight">
              Logged — feeling {mood?.emoji} {selected?.toLowerCase()}
            </p>
            <p className="mt-0.5 text-[14px] text-faint">
              Private to you · {me.streak + 1}-day streak ·{" "}
              <button onClick={() => { setDone(false); setSelected(null); setNote(""); }} className="font-semibold text-[var(--purple)] hover:underline">
                Change
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>How are you feeling today?</Eyebrow>
      <div className="mt-3 flex gap-2">
        {moods.map((m) => {
          const on = selected === m.label;
          return (
            <button
              key={m.label}
              onClick={() => setSelected(m.label)}
              aria-pressed={on}
              title={m.label}
              className={`group flex flex-1 flex-col items-center gap-1 rounded-2xl border py-3 transition hover:-translate-y-0.5 ${
                on ? "border-transparent bg-soft" : "border-line hover:bg-soft"
              }`}
              style={on ? { boxShadow: `inset 0 0 0 1.5px ${m.color}` } : undefined}
            >
              <span className="text-[24px] leading-none transition group-hover:scale-110">{m.emoji}</span>
              <span className="text-[14px] font-semibold" style={{ color: on ? m.color : "var(--faint)" }}>{m.label}</span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a line on why (optional)…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14px] outline-none transition focus:border-[var(--purple)]"
          />
          <Button variant="brand" onClick={() => setDone(true)}>Log</Button>
        </div>
      ) : (
        <p className="mt-3 text-[14px] text-faint">Takes 5 seconds — private to you, helps us fix things early.</p>
      )}
    </div>
  );
}
