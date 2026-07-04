"use client";
/* Daily hooks (Home §6) — optional widgets that give people a reason to open the
   app every day (health/steps, learning, visitor passes…). Connected ones show a
   live stat; the rest can be turned on. Persists which hooks are enabled. */
import * as React from "react";
import { Plus } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
import { homeHooks } from "@/lib/data";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function HooksCard() {
  const [on, setOn] = usePersistentState<Record<string, boolean>>("vadal:home-hooks", Object.fromEntries(homeHooks.map((h) => [h.key, h.connected])));
  const connect = (key: string, label: string) => { setOn((s) => ({ ...s, [key]: true })); toast(`${label} connected — you'll see it here daily ✓`); };

  return (
    <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div><Eyebrow>Your rituals</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Daily hooks</h2></div>
        <span className="text-[12px] text-faint">{Object.values(on).filter(Boolean).length} on</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {homeHooks.map((h) => {
          const active = on[h.key];
          return (
            <div key={h.key} className={`flex items-start gap-3 rounded-2xl border p-3.5 ${active ? "border-line bg-soft/40" : "border-dashed border-line"}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[18px]" aria-hidden>{h.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold">{h.label}</div>
                {active ? (
                  <div className="mt-0.5 text-[12px] font-medium text-[var(--purple)]">{h.stat}</div>
                ) : (
                  <>
                    <div className="mt-0.5 line-clamp-2 text-[12px] text-faint">{h.desc}</div>
                    <button onClick={() => connect(h.key, h.label)} className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] hover:underline"><Plus className="h-3 w-3" /> Connect</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
