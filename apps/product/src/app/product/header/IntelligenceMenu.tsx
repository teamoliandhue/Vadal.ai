"use client";
/* Header · Intelligence — Aurora trigger → today's AI insights popover.
   Surfaces the org briefing (flight-risk, engagement, manager actions) + impact. */
import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { aiBriefing, briefingImpact } from "@/lib/data";
import { useMenu } from "./useMenu";

export function IntelligenceMenu() {
  const { open, setOpen, ref } = useMenu();

  function openAssistant() {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q: "Walk me through today's intelligence briefing" } }));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[14px] font-semibold ring-1 ring-[var(--ai-border)] transition hover:shadow-[0_4px_16px_rgba(124,92,248,0.28)] aria-expanded:shadow-[0_4px_16px_rgba(124,92,248,0.28)]"
      >
        <SparkMark size={14} />
        Intelligence
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-40 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-card shadow-[0_4px_12px_-2px_rgba(10,10,12,0.12),0_18px_44px_-10px_rgba(10,10,12,0.22)] dark:border-white/10"
        >
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3 dark:border-white/10">
            <span className="ai-grad grid h-8 w-8 place-items-center rounded-full"><SparkMark size={18} tone="solid" /></span>
            <div className="flex-1">
              <div className="text-[14px] font-bold tracking-tight">Today’s intelligence</div>
              <div className="text-[12px] text-faint">{aiBriefing.length} new insights for your org</div>
            </div>
          </div>

          <ul className="p-2">
            {aiBriefing.map((b) => (
              <li key={b.text}>
                <button onClick={() => setOpen(false)} className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-soft">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.dot }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold leading-snug">{b.text}</span>
                    <span className="mt-0.5 block text-[12px] text-faint">{b.sub}</span>
                  </span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mx-2 mb-2 rounded-xl bg-soft px-3 py-2.5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{briefingImpact.label}</div>
            <div className="mt-0.5 text-[14px] font-bold text-[#dc4a44]">{briefingImpact.value}</div>
          </div>

          <button
            onClick={openAssistant}
            className="flex w-full items-center justify-center gap-1.5 border-t border-line py-3 text-[14px] font-semibold text-[var(--purple)] transition hover:bg-soft dark:border-white/10"
          >
            <SparkMark size={14} /> Open assistant
          </button>
        </div>
      )}
    </div>
  );
}
