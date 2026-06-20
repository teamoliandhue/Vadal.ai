"use client";
/* Quick Poll (Notion Home spec §2.7) — unvoted → voted (reveals results). Neutral + violet. */
import * as React from "react";
import { Check } from "lucide-react";
import { poll } from "@/lib/data";

export function QuickPoll({ className = "" }: { className?: string }) {
  const [voted, setVoted] = React.useState<string | null>(null);
  const max = Math.max(...poll.options.map((o) => o.pct));
  const votes = poll.votes + (voted ? 1 : 0);

  return (
    <section className={`rounded-[26px] border border-line bg-card p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Pulse poll</p>
          <h3 className="mt-1.5 text-[16px] font-bold leading-snug tracking-tight">{poll.q}</h3>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {poll.options.map((o) => {
          const on = voted === o.label;
          if (!voted) {
            return (
              <button
                key={o.label}
                onClick={() => setVoted(o.label)}
                className="block w-full rounded-xl border border-line px-3.5 py-2.5 text-left text-[14px] font-medium transition hover:border-[var(--purple)] hover:bg-soft"
              >
                {o.label}
              </button>
            );
          }
          return (
            <div key={o.label} className="relative overflow-hidden rounded-xl border border-line px-3.5 py-2.5">
              <span
                className="absolute inset-y-0 left-0 rounded-xl transition-[width] duration-500"
                style={{ width: `${(o.pct / max) * 100}%`, background: on ? "var(--lav)" : "var(--soft)" }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between text-[14px]">
                <span className="flex items-center gap-1.5 font-medium">
                  {on && <Check className="h-3.5 w-3.5 text-[var(--purple)]" />}
                  {o.label}
                </span>
                <span className={`font-bold ${on ? "text-[var(--purple)]" : "text-muted"}`}>{o.pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-faint">
        {votes.toLocaleString()} votes{voted ? " · thanks for voting" : ""}
      </p>
    </section>
  );
}
