"use client";
/* The daily ritual (Notion Home spec §2.2) — lives inside the hero band. Card-less.
   Default → selected (+ optional why) → confirmed. Persists today's check-in + toasts. */
import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { moods, me } from "@/lib/data";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

export function MoodCheck({ firstTime = false }: { firstTime?: boolean }) {
  const [logged, setLogged] = usePersistentState<{ mood: string } | null>("vadal:mood", null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const streak = (firstTime ? 0 : me.streak) + 1;

  /* Open Vadal to talk it through — the conversational follow-up (Amber-style). */
  function talkItThrough(mood: string, why?: string) {
    ask(`I'm feeling ${mood.toLowerCase()} today${why ? ` — ${why}` : ""}.`);
  }

  function log(talk = false) {
    if (!selected) return;
    setLogged({ mood: selected });
    const m = moods.find((x) => x.label === selected);
    if (talk) talkItThrough(selected, note.trim() || undefined);
    else toast(`Mood logged ${m?.emoji ?? ""} — ${streak}-day streak`);
  }

  if (logged) {
    const mood = moods.find((m) => m.label === logged.mood);
    return (
      <div>
        <Eyebrow>Daily check-in</Eyebrow>
        <div className="mt-3 flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-vgreen-soft text-vgreen">
            <Check className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight">
              Logged — feeling {mood?.emoji} {logged.mood.toLowerCase()}
            </p>
            <p className="mt-0.5 text-[14px] text-faint">
              Private to you · {me.streak + 1}-day streak ·{" "}
              <button onClick={() => { setLogged(null); setSelected(null); setNote(""); }} className="font-semibold text-[var(--purple)] hover:underline">
                Change
              </button>
            </p>
            <button onClick={() => talkItThrough(logged.mood)} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Want to talk about it? →
            </button>
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
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a line on why (optional)…"
            className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14px] outline-none transition focus:border-[var(--purple)]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="brand" onClick={() => log(false)}>Log</Button>
            <Button variant="secondary" leadingIcon={<SparkMark size={14} tone="solid" />} onClick={() => log(true)}>Talk it through</Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[14px] text-faint">Takes 5 seconds — private to you. Tap a mood, then log it or talk it through with Vadal.</p>
      )}
    </div>
  );
}
