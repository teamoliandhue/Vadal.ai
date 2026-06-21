"use client";
/* Vadal AI dock — the immersive AI presence (Notion "Vadal AI" doc, P1).
   Floating launcher → chat panel. Opens from anywhere via a `vadal:ask` window event.
   Streams answers token-by-token, shows a thinking state, suggests contextual
   follow-ups, and takes feedback. Demo answers, no backend. */
import * as React from "react";
import { ArrowUp, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { toast } from "./Toaster";

type Msg = { role: "user" | "ai"; text: string; done?: boolean; followups?: string[] };

const SUGGESTED = ["How many leaves do I have?", "When's my next 1:1?", "Reset my payslip access"];

function aiAnswer(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("leave") || s.includes("time off")) return "You have 14 paid-leave days left this year (3 pending approval). Want me to start a request?";
  if (s.includes("1:1") || s.includes("next") || s.includes("meeting")) return "Your next 1:1 is with Anita today at 3:00 PM — I've pinned the prep doc to Your day.";
  if (s.includes("payslip") || s.includes("payroll")) return "Payroll is owned by People Ops. I can raise a payslip-access ticket for you — shall I?";
  if (s.includes("kudos") || s.includes("recogni")) return "Open recognition? You haven't given kudos this week — Anita and Rahul are good shouts.";
  if (s.includes("knowledge") || s.includes("policy") || s.includes("polic")) return "Searching the knowledge base… top hits: Leave policy, Reimbursement, WFH guidelines.";
  if (s.includes("directory") || s.includes("who")) return "I can find anyone in the directory — tell me a name, team, or who owns a process.";
  return "Got it — I'll route this to the right place and follow up here. (Demo response.)";
}

function followups(q: string): string[] {
  const s = q.toLowerCase();
  if (s.includes("leave") || s.includes("time off")) return ["Start a leave request", "Show my leave history", "Who approves it?"];
  if (s.includes("1:1") || s.includes("meeting") || s.includes("next")) return ["Open the prep doc", "Reschedule it", "Last 1:1 notes"];
  if (s.includes("payslip") || s.includes("payroll")) return ["Raise the ticket", "When is payday?", "Update bank details"];
  if (s.includes("kudos") || s.includes("recogni")) return ["Give kudos to Anita", "See my recognition", "Which values?"];
  if (s.includes("knowledge") || s.includes("policy") || s.includes("polic")) return ["Open leave policy", "WFH guidelines", "Reimbursement steps"];
  return ["Tell me more", "Draft a message", "Who can help?"];
}

export function AiDock() {
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [val, setVal] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Record<number, "up" | "down">>({});
  const inputRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<number[]>([]);

  const send = React.useCallback((q: string) => {
    if (!q.trim()) return;
    timers.current.forEach((t) => window.clearInterval(t));
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setVal("");
    setThinking(true);
    setMsgs((m) => [...m, { role: "user", text: q }]);

    const full = aiAnswer(q);
    const fu = followups(q);
    const think = window.setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [...m, { role: "ai", text: "", done: false }]);
      const tokens = full.split(/(\s+)/);
      let i = 0;
      const stream = window.setInterval(() => {
        i += 1;
        setMsgs((m) => {
          const next = m.slice();
          const last = next[next.length - 1];
          if (last?.role === "ai") next[next.length - 1] = { ...last, text: tokens.slice(0, i).join("") };
          return next;
        });
        if (i >= tokens.length) {
          window.clearInterval(stream);
          setMsgs((m) => {
            const next = m.slice();
            const last = next[next.length - 1];
            if (last?.role === "ai") next[next.length - 1] = { ...last, done: true, followups: fu };
            return next;
          });
        }
      }, 26);
      timers.current.push(stream);
    }, 480);
    timers.current.push(think);
  }, []);

  function rate(i: number, dir: "up" | "down") {
    setFeedback((f) => ({ ...f, [i]: dir }));
    toast(dir === "up" ? "Thanks — glad that helped" : "Thanks — I'll keep improving");
  }

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => timers.current.forEach((t) => { window.clearInterval(t); window.clearTimeout(t); }), []);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, thinking]);

  const busy = thinking || msgs.some((m) => m.role === "ai" && m.done === false);
  const last = msgs[msgs.length - 1];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex w-[372px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_60px_-20px_rgba(20,20,40,0.45)] dark:border-white/10">
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3 dark:border-white/10">
            <span className="ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={18} tone="solid" state={busy ? "thinking" : "still"} /></span>
            <div className="flex-1">
              <div className="text-[14px] font-bold tracking-tight">Vadal AI</div>
              <div className="text-[14px] text-faint">{busy ? "Thinking…" : "Ask HR or Company"}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-full text-faint transition hover:bg-soft"><X className="h-4 w-4" /></button>
          </div>
          <div ref={bodyRef} className="max-h-[360px] min-h-[170px] flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.length === 0 ? (
              <>
                <p className="text-[16px] leading-relaxed text-muted">Hi Priya 👋 Ask me about leave, policies, payroll — or anything in your workspace.</p>
                <div className="flex flex-col gap-2 pt-1">
                  {SUGGESTED.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border border-line px-3 py-2 text-left text-[14px] transition hover:border-[var(--ai-accent)] hover:bg-soft">{s}</button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {msgs.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div className="ai-stream max-w-[82%] rounded-2xl bg-[var(--purple)] px-3 py-2 text-[16px] leading-relaxed text-white">{m.text}</div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-start gap-2">
                      <span className="ai-grad mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <div className="ai-stream max-w-full rounded-2xl bg-[var(--ai-surface)] px-3 py-2 text-[16px] leading-relaxed text-ink ring-1 ring-[var(--ai-border)]">
                          {m.text}
                          {!m.done && <span className="ai-caret" />}
                        </div>
                        {m.done && (
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => rate(i, "up")} aria-label="Helpful" className={`grid h-6 w-6 place-items-center rounded-md transition hover:bg-soft ${feedback[i] === "up" ? "text-[var(--ai-accent)]" : "text-faint"}`}><ThumbsUp className="h-3.5 w-3.5" /></button>
                            <button onClick={() => rate(i, "down")} aria-label="Not helpful" className={`grid h-6 w-6 place-items-center rounded-md transition hover:bg-soft ${feedback[i] === "down" ? "text-[var(--ai-accent)]" : "text-faint"}`}><ThumbsDown className="h-3.5 w-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
                {thinking && (
                  <div className="flex items-center gap-2">
                    <span className="ai-grad grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" state="thinking" /></span>
                    <span className="flex items-center gap-1 rounded-2xl bg-[var(--ai-surface)] px-3 py-3 ring-1 ring-[var(--ai-border)]" aria-label="Vadal is thinking">
                      <span className="ai-dot" /><span className="ai-dot" style={{ animationDelay: "0.16s" }} /><span className="ai-dot" style={{ animationDelay: "0.32s" }} />
                    </span>
                  </div>
                )}
                {last?.role === "ai" && last.done && last.followups?.length ? (
                  <div className="flex flex-wrap gap-1.5 pl-8">
                    {last.followups.map((f) => (
                      <button key={f} onClick={() => send(f)} className="rounded-full bg-[var(--ai-accent-soft)] px-2.5 py-1 text-[14px] font-medium text-[var(--ai-accent)] transition hover:brightness-95">{f}</button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(val); }} className="flex items-center gap-2 border-t border-line p-3 dark:border-white/10">
            <input ref={inputRef} value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ask anything…" className="min-w-0 flex-1 rounded-full border border-line bg-soft px-3.5 py-2 text-[14px] outline-none transition focus:border-[var(--ai-accent)]" />
            <button type="submit" aria-label="Send" disabled={busy} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition hover:opacity-90 disabled:opacity-45"><ArrowUp className="h-4 w-4" /></button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-6 z-30 flex items-center gap-2.5 rounded-full border border-line bg-card py-2.5 pl-3 pr-4 shadow-[0_10px_34px_rgba(20,20,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(139,124,248,0.32)] dark:border-white/10 dark:shadow-[0_10px_34px_rgba(0,0,0,0.5)]"
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
