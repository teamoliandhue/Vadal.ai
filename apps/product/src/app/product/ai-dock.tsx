"use client";
/* Vadal AI dock — the Copilot's home surface.
   Floating launcher → chat panel. Opens from anywhere via a `vadal:ask` event.

   The engine now lives in ./useAi, which streams from /api/ai. That means this
   component renders four things it previously faked:
     · citations that point at real documents, with the passage they came from
     · a refusal when retrieval finds nothing — no confident guess about policy
     · proposed ACTIONS the person must confirm before anything happens
     · an undo on everything that did happen
   Swapping the demo provider for a live model changes none of this file. */
import * as React from "react";
import Link from "next/link";
import { ArrowUp, Check, FileText, RotateCcw, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import type { ToolCall } from "@/lib/ai/types";
import { toast } from "./Toaster";
import { useAi } from "./useAi";
import { useMe } from "./useSession";
import { useViewAs } from "./useViewAs";

/* A proactive nudge — the AI surfacing something unprompted, once per session. */
const PROACTIVE = { text: "Engineering engagement dropped 6 pts this week — worth a look.", q: "Why did Engineering engagement drop 6 points this week?" };

const SUGGESTED_EMPLOYEE = ["How many leaves do I get?", "What's our WFH policy?", "Am I covered for hospital bills?"];
const SUGGESTED_MANAGER = ["Launch a quick pulse for my team about workload", "How many leaves do I get?", "Give kudos to Anita"];

/* Lightweight rich text — **bold** + key numbers/currency in Aurora gradient. */
function renderRich(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return [<strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>];
    return part.split(/(₹[\d,.]+|\b\d[\d,.:]*%?\b)/g).map((t, j) =>
      /^(\d|₹)/.test(t)
        ? <span key={`${i}-${j}`} className="ai-text-grad">{t}</span>
        : <React.Fragment key={`${i}-${j}`}>{t}</React.Fragment>,
    );
  });
}

/* ── the confirmation card ────────────────────────────────────────
   Every agentic action stops here. It states exactly what will happen,
   shows the full payload before anything runs, and keeps an undo on
   screen afterwards. The brief calls this "undoable-by-default"; making
   it a component means no feature can ship without it. */
function ToolCard({
  call, onConfirm, onCancel, onUndo,
}: { call: ToolCall; onConfirm: () => void; onCancel: () => void; onUndo: () => void }) {
  if (call.state === "cancelled") {
    return <p className="text-[14px] text-faint">Cancelled — nothing was sent.</p>;
  }

  if (call.state === "done" || call.state === "undone") {
    const undone = call.state === "undone";
    return (
      <div className="flex items-center gap-2 rounded-xl bg-soft px-3 py-2">
        <Check className={`h-4 w-4 shrink-0 ${undone ? "text-faint" : "text-[var(--success)]"}`} />
        <span className={`flex-1 text-[14px] ${undone ? "text-faint line-through" : "text-ink"}`}>
          {call.result?.message ?? "Done."}
        </span>
        {!undone && call.undoable && (
          <button
            onClick={onUndo}
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold text-[var(--ai-accent)] transition hover:bg-[var(--ai-accent-soft)]"
          >
            <RotateCcw className="h-3 w-3" /> Undo
          </button>
        )}
      </div>
    );
  }

  if (call.state === "failed") {
    return <p className="text-[14px] text-[var(--danger)]">{call.result?.message ?? "That didn't work."}</p>;
  }

  const running = call.state === "running";
  return (
    <div className="w-full rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-3">
      <p className="text-[14px] font-bold tracking-tight">{call.title}</p>
      <p className="mt-1 text-[14px] leading-snug text-muted">{call.summary}</p>
      <dl className="mt-2.5 space-y-1.5 border-t border-[var(--ai-border)] pt-2.5">
        {call.preview.map((p) => (
          <div key={p.label} className="grid grid-cols-[84px_1fr] gap-2">
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-faint">{p.label}</dt>
            <dd className="whitespace-pre-line text-[14px] leading-snug text-ink">{p.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={running}
          className="rounded-full bg-[var(--purple)] px-3.5 py-1.5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Working…" : "Confirm & send"}
        </button>
        <button
          onClick={onCancel}
          disabled={running}
          className="rounded-full bg-soft px-3 py-1.5 text-[14px] font-semibold text-ink ring-1 ring-[var(--line)] transition hover:bg-[var(--card-hover)] disabled:opacity-50"
        >
          Cancel
        </button>
        <span className="ml-auto text-[12px] text-faint">You can undo this</span>
      </div>
    </div>
  );
}

export function AiDock() {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState("");
  const [feedback, setFeedback] = React.useState<Record<number, "up" | "down">>({});
  const [nudge, setNudge] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  const { messages, thinking, step, send, confirmTool, cancelTool, undo } = useAi("dock");
  const me = useMe();
  const [role] = useViewAs();
  const suggested = role === "employee" ? SUGGESTED_EMPLOYEE : SUGGESTED_MANAGER;

  function rate(i: number, dir: "up" | "down") {
    setFeedback((f) => ({ ...f, [i]: dir }));
    toast(dir === "up" ? "Thanks — glad that helped" : "Thanks — I'll keep improving");
  }

  function dismissNudge() {
    setNudge(false);
    try { sessionStorage.setItem("vadal:nudged", "1"); } catch { /* ignore */ }
  }
  function takeNudge() { dismissNudge(); setOpen(true); send(PROACTIVE.q); }

  React.useEffect(() => {
    function onAsk(e: Event) {
      const q = (e as CustomEvent).detail?.q as string | undefined;
      setOpen(true);
      if (q) send(q);
      else setTimeout(() => inputRef.current?.focus(), 60);
    }
    window.addEventListener("vadal:ask", onAsk as EventListener);
    return () => window.removeEventListener("vadal:ask", onAsk as EventListener);
  }, [send]);

  // proactive nudge — surface one insight ~5s after landing, once per session
  React.useEffect(() => {
    try { if (sessionStorage.getItem("vadal:nudged")) return; } catch { /* ignore */ }
    const t = window.setTimeout(() => setNudge(true), 5000);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, thinking]);

  const busy = thinking || messages.some((m) => m.role === "assistant" && !m.done);
  const last = messages[messages.length - 1];

  return (
    <>
      {open && (
        <div className={`ai-pop ai-glow-border fixed bottom-24 right-6 z-40 w-[372px] max-w-[calc(100vw-2rem)] rounded-[26px] p-[1.5px] max-lg:bottom-[104px] ${busy ? "is-busy" : ""}`}>
        <div className="flex flex-col overflow-hidden rounded-[24.5px] bg-card">
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3 dark:border-white/10">
            <span className="ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={18} tone="solid" state={busy ? "thinking" : "still"} /></span>
            <div className="flex-1">
              <div className="text-[14px] font-bold tracking-tight">Vadal AI</div>
              <div className="text-[14px] text-faint">{busy ? "Thinking…" : "Ask HR or Company"}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-full text-faint transition hover:bg-soft"><X className="h-4 w-4" /></button>
          </div>

          <div ref={bodyRef} className="max-h-[400px] min-h-[170px] flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.length === 0 ? (
              <>
                <p className="text-[16px] leading-relaxed text-muted">
                  Hi {me.ready ? me.name : "there"} 👋 Ask me about leave, policies or payroll — or tell me what you&apos;d like done.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  {suggested.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border border-line px-3 py-2 text-left text-[14px] transition hover:border-[var(--ai-accent)] hover:bg-soft">{s}</button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div className="ai-stream max-w-[82%] rounded-2xl bg-[var(--purple)] px-3 py-2 text-[16px] leading-relaxed text-white">{m.text}</div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-start gap-2">
                      <span className="ai-grad mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                        {m.error ? (
                          <div className="rounded-2xl bg-soft px-3 py-2 text-[14px] text-muted ring-1 ring-[var(--line)]">{m.error}</div>
                        ) : (
                          <div className={`ai-stream relative max-w-full overflow-hidden rounded-2xl bg-[var(--ai-surface)] px-3 py-2 text-[16px] leading-relaxed text-ink ring-1 ring-[var(--ai-border)] ${!m.done ? "ai-sheen" : ""}`}>
                            {renderRich(m.text)}
                            {!m.done && <span className="ai-caret" />}
                          </div>
                        )}

                        {/* an action the person must approve */}
                        {m.tool && (
                          <ToolCard
                            call={m.tool}
                            onConfirm={() => confirmTool(m.tool!)}
                            onCancel={() => cancelTool(m.tool!)}
                            onUndo={() => undo(m.tool!)}
                          />
                        )}

                        {/* real sources, with the passage the answer came from */}
                        {m.done && m.citations?.length ? (
                          <div className="flex w-full flex-col gap-1">
                            <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">Sources</span>
                            {m.citations.map((c) => (
                              <Link
                                key={c.id}
                                href={c.href}
                                onClick={() => setOpen(false)}
                                className="group rounded-xl bg-soft px-2.5 py-1.5 transition hover:bg-[var(--card-hover)]"
                              >
                                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                                  <FileText className="h-3 w-3 shrink-0 text-faint" />
                                  {c.title}
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-faint">“{c.snippet}”</span>
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {/* honest labelling — the brief requires it wherever a person sees AI output */}
                        {m.done && !m.error && (
                          <div className="flex w-full items-center gap-1">
                            <span className="text-[12px] text-faint">
                              {m.grounding === "grounded"
                                ? "AI-assisted · answered from your company's documents"
                                : m.grounding === "none"
                                  ? "AI-assisted · no source found"
                                  : "AI-assisted"}
                            </span>
                            <span className="ml-auto flex items-center gap-0.5">
                              <button onClick={() => rate(i, "up")} aria-label="Helpful" className={`grid h-6 w-6 place-items-center rounded-md transition hover:bg-soft ${feedback[i] === "up" ? "text-[var(--ai-accent)]" : "text-faint"}`}><ThumbsUp className="h-3.5 w-3.5" /></button>
                              <button onClick={() => rate(i, "down")} aria-label="Not helpful" className={`grid h-6 w-6 place-items-center rounded-md transition hover:bg-soft ${feedback[i] === "down" ? "text-[var(--ai-accent)]" : "text-faint"}`}><ThumbsDown className="h-3.5 w-3.5" /></button>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}

                {thinking && (
                  <div className="flex items-center gap-2">
                    <span className="ai-grad grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" state="thinking" /></span>
                    <span className="flex items-center gap-2 rounded-2xl bg-[var(--ai-surface)] px-3 py-2.5 ring-1 ring-[var(--ai-border)]" aria-label="Vadal is thinking">
                      <span className="text-[14px] text-muted">{step || "Thinking…"}</span>
                      <span className="flex items-center gap-1"><span className="ai-dot" /><span className="ai-dot" style={{ animationDelay: "0.16s" }} /><span className="ai-dot" style={{ animationDelay: "0.32s" }} /></span>
                    </span>
                  </div>
                )}

                {last?.role === "assistant" && last.done && last.followups?.length ? (
                  <div className="flex flex-wrap gap-1.5 pl-8">
                    {last.followups.map((f) => (
                      <button key={f} onClick={() => send(f)} className="rounded-full bg-[var(--ai-accent-soft)] px-2.5 py-1 text-[14px] font-medium text-[var(--ai-accent)] transition hover:brightness-95">{f}</button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(val); setVal(""); }} className="flex items-center gap-2 border-t border-line p-3 dark:border-white/10">
            <input ref={inputRef} value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ask anything…" className="min-w-0 flex-1 rounded-full border border-line bg-soft px-3.5 py-2 text-[14px] outline-none transition focus:border-[var(--ai-accent)]" />
            <button type="submit" aria-label="Send" disabled={busy} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition hover:opacity-90 disabled:opacity-45"><ArrowUp className="h-4 w-4" /></button>
          </form>
        </div>
        </div>
      )}

      {nudge && !open && (
        <div className="ai-pop ai-glow-border fixed bottom-[92px] right-6 z-30 w-[300px] max-w-[calc(100vw-2rem)] rounded-[20px] p-[1.5px] max-lg:bottom-[168px]">
          <div className="rounded-[18.5px] bg-card p-3">
            <div className="flex items-start gap-2.5">
              <span className="ai-grad grid h-7 w-7 shrink-0 place-items-center rounded-full"><SparkMark size={15} tone="solid" state="idle" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold leading-snug">{PROACTIVE.text}</div>
                <button onClick={takeNudge} className="mt-1.5 flex items-center gap-1 text-[14px] font-semibold text-[var(--ai-accent)] transition hover:gap-1.5">Look into it →</button>
              </div>
              <button onClick={dismissNudge} aria-label="Dismiss" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-faint transition hover:bg-soft"><X className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-6 z-30 flex items-center gap-2.5 rounded-full border border-line bg-card py-2.5 pl-3 pr-4 shadow-[0_10px_34px_rgba(20,20,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(139,124,248,0.32)] dark:border-white/10 dark:shadow-[0_10px_34px_rgba(0,0,0,0.5)] max-lg:bottom-[76px]"
      >
        <span className="ai-aura ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={18} tone="solid" state="idle" /></span>
        <span className="text-left">
          <span className="flex items-center gap-1 text-[14px] font-semibold">Vadal <span className="rounded-[4px] border border-line px-1 text-[12px] font-bold text-muted dark:border-white/15">AI</span></span>
          <span className="block text-[14px] text-faint">What are you looking for today?</span>
        </span>
      </button>
    </>
  );
}
