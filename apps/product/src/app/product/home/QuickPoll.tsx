"use client";
/* Quick Poll — lightweight pulse vote (Notion Home spec §2.7). Unvoted → voted (reveals results). */
import * as React from "react";
import { Check } from "lucide-react";
import { poll } from "@/lib/data";

export function QuickPoll() {
  const [voted, setVoted] = React.useState<string | null>(null);
  const max = Math.max(...poll.options.map((o) => o.pct));
  const votes = poll.votes + (voted ? 1 : 0);

  return (
    <div className="card-lift rounded-3xl border border-line bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold tracking-tight">Quick poll</h3>
        <span className="text-[10.5px] text-faint">{votes.toLocaleString()} votes</span>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-snug">{poll.q}</p>
      <div className="mt-3 space-y-2.5">
        {poll.options.map((o) => {
          const on = voted === o.label;
          if (!voted) {
            return (
              <button
                key={o.label}
                onClick={() => setVoted(o.label)}
                className="block w-full rounded-xl border border-line px-3.5 py-2.5 text-left text-[12.5px] font-medium transition hover:border-[#8b7cf8] hover:bg-soft"
              >
                {o.label}
              </button>
            );
          }
          return (
            <div key={o.label} className="block w-full text-left">
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1 font-medium">
                  {o.label}
                  {on && <Check className="h-3.5 w-3.5 text-[#8b7cf8]" />}
                </span>
                <span className="font-bold text-muted">{o.pct}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-soft">
                <span
                  className="block h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${(o.pct / max) * 100}%`, background: on ? "linear-gradient(90deg,#8b7cf8,#ef7faf)" : "#cdd0d8" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {voted && <p className="mt-3 text-[11px] text-faint">Thanks for voting — results update live.</p>}
    </div>
  );
}
