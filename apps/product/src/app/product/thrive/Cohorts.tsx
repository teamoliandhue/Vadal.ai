"use client";
/* ══════════════════ the fair-cohort leaderboard ══════════════════
   The logic here is the best thing on the page and it was rendered as four
   boxes of small grey numbers with the argument in a footnote underneath:
   "a warehouse picker walks 18,000 steps doing their job; a designer walking
   8,000 has tried much harder."

   That argument is a SHAPE, and writing it out while drawing something else is
   the wrong way round. Every person is a bar now, and — the one decision that
   matters — every bar is scaled against the same maximum across all groups
   rather than within its own. So the on-site bars run long, the desk bars run
   short, and why you cannot put them in one ranking is visible in half a second
   without reading anything.

   Scaling per group would have looked tidier and destroyed the entire point. */
import * as React from "react";
import { SparkMark } from "@vadal/design-system";
import { Badge } from "@vadal/design-system";
import type { Cohort } from "@/lib/ai/engines/wellbeing";
import { Card, Eyebrow } from "./parts";

const nameOf = (email: string) => email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase());

export function Cohorts({ cohorts, myCohort, myEmail }: { cohorts: Cohort[]; myCohort?: Cohort; myEmail?: string }) {
  /* One scale for everyone. This is the whole argument. */
  const globalMax = Math.max(...cohorts.flatMap((c) => c.members.map((m) => m.avgDailySteps)));

  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
        <Eyebrow>Your leaderboard group</Eyebrow>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{(myCohort ?? cohorts[0])?.basis}</p>

      <div className="mt-5 flex flex-col gap-5">
        {cohorts.map((co) => {
          const isMine = co === myCohort;
          return (
            <div key={co.name}>
              <div className="flex items-center gap-2">
                <p className={`text-[13px] font-semibold ${isMine ? "text-ink" : "text-muted"}`}>{co.name}</p>
                {isMine && <Badge tone="brand" variant="soft" size="sm">You</Badge>}
                <span className="ml-auto text-[12px] text-faint">{co.members.length} people</span>
              </div>

              <ul className="mt-2 flex flex-col gap-1">
                {[...co.members]
                  .sort((a, b) => b.avgDailySteps - a.avgDailySteps)
                  .map((m, i) => {
                    const isMe = m.email === myEmail;
                    const pct = (m.avgDailySteps / globalMax) * 100;
                    return (
                      <li key={m.email} className={`flex items-center gap-2.5 rounded-lg py-0.5 ${isMe ? "-mx-1.5 bg-soft px-1.5" : ""}`}>
                        <span className="w-3 shrink-0 text-[12px] font-semibold tabular-nums text-faint">{i + 1}</span>

                        <span className="w-[104px] shrink-0 truncate text-[13px]">
                          <span className={isMe ? "font-semibold" : ""}>{isMe ? "You" : nameOf(m.email)}</span>
                          <span className="block truncate text-[11px] leading-tight text-faint">{m.role}</span>
                        </span>

                        {/* the bar — scaled against everyone, not against this group */}
                        <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-soft">
                          <span
                            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                            style={{
                              width: `${pct}%`,
                              background: isMine
                                ? "var(--client-brand, var(--purple))"
                                : "color-mix(in srgb, var(--muted) 34%, transparent)",
                            }}
                          />
                        </span>

                        <span className="w-[46px] shrink-0 text-right text-[12px] font-semibold tabular-nums text-muted">
                          {(m.avgDailySteps / 1000).toFixed(1)}k
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-snug text-faint">
        Every bar is drawn to the same scale, which is why the groups look so different — and why
        ranking them together would make effort invisible. A picker walks 18,000 steps doing their
        job. A designer walking 8,000 has tried much harder.
      </p>
    </Card>
  );
}
