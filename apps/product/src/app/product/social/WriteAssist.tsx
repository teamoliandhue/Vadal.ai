"use client";
/* Write with Nudge — the composer's writing assist.

   It proposes; it never overwrites. Pick what you want done to the draft and
   the suggestion appears under it, with a line on what changed and how it now
   reads. "Use this" swaps it in (and can be undone); "Discard" leaves your
   words alone. With nothing typed yet it offers starting points instead. */
import * as React from "react";
import { Sparkles, Undo2 } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { REWRITE_LABEL, composePost, readability, rewrite, type RewriteMode } from "@/lib/ai/engines/text";

export type Suggestion = { label: string; text: string; note: string; grade: number; changed: boolean; mode?: RewriteMode };

const STARTERS: { label: string; text: string }[] = [
  { label: "Share a win", text: "Quick win to share — we cut our release checklist from 40 minutes to 12 by automating the smoke tests. Happy to walk anyone through it. 🚀" },
  { label: "A reminder", text: "Reminder that no-meeting Wednesday is tomorrow. Protect your focus blocks and ship something you're proud of. 💜" },
  { label: "Thank the team", text: "Grateful for this team this week — calm under pressure, generous with help. Tag someone who made your week easier. 🙌" },
];
const MODES: RewriteMode[] = ["polish", "shorter", "friendlier", "professional", "simpler"];

function suggest(text: string, mode: RewriteMode | "notes"): Suggestion {
  if (mode === "notes") {
    const out = composePost(text);
    return { label: "Turn my notes into a post", text: out, note: "Fragments joined into sentences, fillers removed.", grade: readability(out).grade, changed: out !== text.trim() };
  }
  const r = rewrite(text, mode);
  return { label: REWRITE_LABEL[mode], text: r.text, note: r.note, grade: r.grade, changed: r.changed, mode };
}

export function AssistMenu({ text, onSuggest }: { text: string; onSuggest: (s: Suggestion) => void }) {
  const [open, setOpen] = React.useState(false);
  const [thinking, setThinking] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const has = text.trim().length > 0;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  /* a beat of "thinking" so the suggestion arrives rather than blinks in */
  const run = (make: () => Suggestion) => {
    setOpen(false); setThinking(true);
    window.setTimeout(() => { onSuggest(make()); setThinking(false); }, 550);
  };
  const row = "flex min-h-[44px] w-full items-center px-3 text-left text-[14px] text-ink transition hover:bg-[var(--ai-surface)] lg:min-h-[38px]";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={thinking}
        aria-haspopup="menu"
        aria-expanded={open}
        className="ml-1 flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-[var(--ai-accent)] transition hover:bg-[var(--ai-surface)] disabled:opacity-60 lg:min-h-[34px]"
      >
        <Sparkles className={`h-4 w-4 ${thinking ? "ai-breathe" : ""}`} /> {thinking ? "Writing…" : "Write with Nudge"}
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full left-0 z-20 mb-1 w-64 overflow-hidden rounded-xl border border-[var(--ai-border)] bg-card py-1 shadow-[0_12px_30px_-10px_rgba(20,20,40,0.3)]">
          <p className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{has ? "Improve my draft" : "Start me off"}</p>
          {has ? (
            <>
              <button role="menuitem" className={row} onClick={() => run(() => suggest(text, "notes"))}>Turn my notes into a post</button>
              {MODES.map((m) => (
                <button key={m} role="menuitem" className={row} onClick={() => run(() => suggest(text, m))}>{REWRITE_LABEL[m]}</button>
              ))}
            </>
          ) : (
            STARTERS.map((s) => (
              <button key={s.label} role="menuitem" className={row} onClick={() => run(() => ({ label: s.label, text: s.text, note: "A starting point — make it yours before you post.", grade: readability(s.text).grade, changed: true }))}>{s.label}</button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function AssistSuggestion({
  s, original, onUse, onDiscard, onRetone,
}: {
  s: Suggestion; original: string; onUse: () => void; onDiscard: () => void; onRetone: (m: RewriteMode) => void;
}) {
  return (
    <div role="status" className="ai-pop rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-3.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <SparkMark size={16} tone="gradient" state="idle" />
        <span className="text-[13px] font-bold text-ink">Nudge · {s.label}</span>
        <span className="text-[12px] text-muted">{s.note}</span>
      </div>
      {s.changed && <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">{s.text}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {s.changed && <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onUse}>Use this</Button>}
        <Button variant="tertiary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={onDiscard}>{s.changed ? "Discard" : "OK"}</Button>
        {s.changed && <span className="ml-auto text-[12px] text-faint">Reads at grade {Math.round(s.grade)}</span>}
      </div>
      {original.trim() && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[var(--ai-border)] pt-2.5">
          <span className="text-[12px] text-faint">Try instead</span>
          {MODES.filter((m) => m !== s.mode).map((m) => (
            <button key={m} onClick={() => onRetone(m)} className="min-h-[44px] rounded-full bg-card px-2.5 text-[12px] font-semibold text-muted ring-1 ring-[var(--ai-border)] transition hover:text-[var(--ai-accent)] lg:min-h-[28px]">{REWRITE_LABEL[m]}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function UndoAssist({ onUndo }: { onUndo: () => void }) {
  return (
    <button onClick={onUndo} className="flex min-h-[44px] items-center gap-1.5 text-[12px] font-semibold text-muted transition hover:text-ink lg:min-h-[28px]">
      <Undo2 className="h-3.5 w-3.5" /> Undo Nudge&apos;s edit
    </button>
  );
}

export { suggest };
