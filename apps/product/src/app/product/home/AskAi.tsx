"use client";
/* Ask Vadal (Notion Home spec §2.6) — the premium AI moment. Opens the AI dock
   (ai-dock.tsx) via a `vadal:ask` window event; quick actions ask a starter question. */
import { ArrowRight, BookOpen, Gift, Plane, Search, Sparkles, Users } from "lucide-react";

function ask(q?: string) {
  window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
}

const QUICK = [
  { label: "Apply leave", icon: Plane, q: "How do I apply for leave?" },
  { label: "Give kudos", icon: Gift, q: "Help me give kudos to a teammate" },
  { label: "Knowledge", icon: BookOpen, q: "Search the knowledge base" },
  { label: "Directory", icon: Users, q: "Find someone in the directory" },
];

export function AskAi() {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-[26px] bg-[#141419] p-6 text-white shadow-[0_18px_44px_-22px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/[0.08]">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full opacity-55 blur-2xl"
        style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 70%, transparent 78%)" }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-[16px] font-bold tracking-tight">Ask Vadal</h3>
          <span className="rounded-[5px] border border-white/15 px-1.5 py-0.5 text-[12px] font-bold tracking-wide text-zinc-300">AI</span>
        </div>
        <p className="mt-2.5 text-[16px] leading-relaxed text-zinc-400">
          Leave balance, policies, “who owns payroll?” — instant answers, routed to a human when needed.
        </p>
        <button
          onClick={() => ask()}
          className="mt-4 flex w-full items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2.5 text-left text-[14px] text-zinc-400 ring-1 ring-white/[0.08] transition hover:bg-white/[0.12]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Ask HR or Ask Company…</span>
          <kbd className="text-[12px] font-semibold text-zinc-500">⌘K</kbd>
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUICK.map((q) => (
            <button
              key={q.label}
              onClick={() => ask(q.q)}
              className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-[14px] font-medium text-zinc-300 ring-1 ring-white/[0.06] transition hover:bg-white/[0.1]"
            >
              <q.icon className="h-3.5 w-3.5" /> {q.label}
            </button>
          ))}
        </div>
        <button onClick={() => ask()} className="mt-3 flex items-center gap-1 text-[14px] font-semibold text-zinc-400 transition hover:text-white">
          Open assistant <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
