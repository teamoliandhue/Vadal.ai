"use client";
/* Vadal AI dock — the immersive AI presence (Notion Home spec §2.10).
   Floating launcher → chat panel. Opens from anywhere via a `vadal:ask` window event
   (the Home "Ask Vadal" card dispatches it). Demo answers, no backend. */
import * as React from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

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

export function AiDock() {
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [val, setVal] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  const send = React.useCallback((q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setVal("");
    setTimeout(() => setMsgs((m) => [...m, { role: "ai", text: aiAnswer(q) }]), 550);
  }, []);

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

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs]);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_60px_-20px_rgba(20,20,40,0.45)] dark:border-white/10">
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3 dark:border-white/10">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]"><Sparkles className="h-4 w-4 text-white" /></span>
            <div className="flex-1">
              <div className="text-[13px] font-bold tracking-tight">Vadal AI</div>
              <div className="text-[10.5px] text-faint">Ask HR or Company</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-full text-faint transition hover:bg-soft"><X className="h-4 w-4" /></button>
          </div>
          <div ref={bodyRef} className="max-h-[340px] min-h-[170px] flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 ? (
              <>
                <p className="text-[12.5px] leading-relaxed text-muted">Hi Priya 👋 Ask me about leave, policies, payroll — or anything in your workspace.</p>
                <div className="flex flex-col gap-2 pt-1">
                  {SUGGESTED.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border border-line px-3 py-2 text-left text-[12px] transition hover:border-[var(--purple)] hover:bg-soft">{s}</button>
                  ))}
                </div>
              </>
            ) : (
              msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ${m.role === "user" ? "bg-[var(--purple)] text-white" : "bg-soft text-ink"}`}>{m.text}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(val); }} className="flex items-center gap-2 border-t border-line p-3 dark:border-white/10">
            <input ref={inputRef} value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ask anything…" className="min-w-0 flex-1 rounded-full border border-line bg-soft px-3.5 py-2 text-[12.5px] outline-none transition focus:border-[var(--purple)]" />
            <button type="submit" aria-label="Send" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition hover:opacity-90"><ArrowUp className="h-4 w-4" /></button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-6 z-30 flex items-center gap-2.5 rounded-full border border-line bg-card py-2.5 pl-3 pr-4 shadow-[0_10px_34px_rgba(20,20,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(139,124,248,0.32)] dark:border-white/10 dark:shadow-[0_10px_34px_rgba(0,0,0,0.5)]"
      >
        <span className="ai-aura grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]"><Sparkles className="h-4 w-4 text-white" /></span>
        <span className="text-left">
          <span className="flex items-center gap-1 text-[12.5px] font-semibold">Vadal <span className="rounded-[4px] border border-line px-1 text-[8.5px] font-bold text-muted dark:border-white/15">AI</span></span>
          <span className="block text-[10.5px] text-faint">What are you looking for today?</span>
        </span>
      </button>
    </>
  );
}
