"use client";
/* Today's calendar (Home §4) — synced from Google Calendar. Shows the day's
   events with a "now" marker; Vadal can prep the ones that need it (opens the
   AI dock) or you can join live meetings. Demo data (lib/data). */
import * as React from "react";
import { Calendar, Video } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { myCalendar } from "@/lib/data";
import { toast } from "../Toaster";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));
const KIND_COLOR: Record<string, string> = { Meeting: "var(--purple)", Review: "var(--info)", Team: "var(--success)" };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function CalendarCard() {
  return (
    <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div><Eyebrow>Today</Eyebrow><h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Your calendar</h2></div>
        <span className="flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted"><Calendar className="h-3.5 w-3.5" /> Google Calendar · <span className="text-[var(--success)]">Connected</span></span>
      </div>
      <ul className="mt-4 flex flex-col">
        {myCalendar.map((e) => {
          const c = KIND_COLOR[e.kind] ?? "var(--purple)";
          return (
            <li key={e.title} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
              <div className="w-12 shrink-0 text-[13px] font-semibold tabular-nums text-muted">{e.time}</div>
              <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: e.now ? c : `color-mix(in srgb, ${c} 45%, transparent)` }} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold">{e.title}</span>
                  {e.now && <span className="rounded-full bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--danger)]">Now</span>}
                </div>
                <div className="text-[12px] text-faint">{e.mins} min · {e.with}</div>
              </div>
              {e.now ? (
                <Button variant="brand" size="sm" leadingIcon={<Video className="h-3.5 w-3.5" />} onClick={() => toast("Joining Roadmap review…", "info")}>Join</Button>
              ) : e.prep ? (
                <Button variant="secondary" size="sm" leadingIcon={<SparkMark size={13} tone="solid" />} onClick={() => ask(`Help me prep for "${e.title}" at ${e.time} with ${e.with}.`)}>Prep</Button>
              ) : (
                <span className="text-[12px] text-faint">—</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
