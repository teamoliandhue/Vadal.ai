"use client";
/* Mood Check — the daily ritual (Notion Home spec §2.2). Default → selected (+ optional why) → confirmed. */
import * as React from "react";
import { Check, Flame, Sparkles } from "lucide-react";
import { Button } from "@vadal/design-system";
import { moods, me } from "@/lib/data";

export function MoodCheck() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [done, setDone] = React.useState(false);

  if (done) {
    const mood = moods.find((m) => m.label === selected);
    return (
      <div className="card-lift rise rise-1 mt-7 rounded-3xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-vgreen-soft text-vgreen">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-[15px] font-bold tracking-tight">
                Logged — feeling {mood?.emoji} {selected?.toLowerCase()}
              </h3>
              <p className="mt-0.5 text-[12px] text-faint">Thanks, {me.name}. Private to you — it helps us spot what to fix, early.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-[#fdf6e9] px-3 py-1.5 text-[12.5px] font-semibold ring-1 ring-[#f5e5c2] dark:bg-white/[0.05] dark:ring-white/10">
              <Flame className="h-3.5 w-3.5 text-[#f2884d]" /> {me.streak + 1}-day streak
            </span>
            <button
              onClick={() => { setDone(false); setSelected(null); setNote(""); }}
              className="text-[12px] font-semibold text-[#7c6cf0] transition hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-lift rise rise-1 mt-7 rounded-3xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight">How are you feeling today?</h3>
          <p className="mt-0.5 text-[12px] text-faint">Your daily check-in — private, takes 5 seconds</p>
        </div>
        <div className="flex gap-2.5">
          {moods.map((m) => {
            const on = selected === m.label;
            return (
              <button
                key={m.label}
                onClick={() => setSelected(m.label)}
                aria-pressed={on}
                className={`group flex flex-col items-center gap-1 rounded-2xl border px-4 py-2.5 transition hover:-translate-y-0.5 ${
                  on ? "border-transparent" : "border-line hover:shadow-[0_8px_20px_-10px_rgba(20,20,25,0.25)]"
                }`}
                style={on ? { background: `${m.color}1f`, boxShadow: `0 0 0 2px ${m.color}` } : undefined}
              >
                <span className="text-[22px] leading-none transition group-hover:scale-110">{m.emoji}</span>
                <span className="text-[11px] font-semibold" style={{ color: m.color }}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {selected ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a line on why (optional)…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-soft px-4 py-2.5 text-[12.5px] outline-none transition focus:border-[#8b7cf8]"
          />
          <Button variant="brand" onClick={() => setDone(true)}>Log check-in</Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-soft px-4 py-2.5 text-[12px] text-muted">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#e89b3c]" />
          Pick a mood and add a line on <span className="px-1 italic">why</span> — it helps us spot what to fix, early.
        </div>
      )}
    </div>
  );
}
