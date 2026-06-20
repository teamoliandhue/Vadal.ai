"use client";
/* My Day — the personal action hub (Notion Home spec §2.3). Complete-in-place → empty ("all caught up"). */
import * as React from "react";
import { PartyPopper } from "lucide-react";
import { Badge, type BadgeTone } from "@vadal/design-system";
import { myDay } from "@/lib/data";

const TAG_TONE: Record<string, BadgeTone> = {
  Survey: "brand",
  Meeting: "success",
  Recognition: "warning",
  Learning: "info",
};

export function MyDay({ className = "" }: { className?: string }) {
  const [doneIdx, setDoneIdx] = React.useState<number[]>([]);
  const remaining = myDay.filter((_, i) => !doneIdx.includes(i));

  return (
    <div className={`card-lift rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15.5px] font-bold tracking-tight">Your day</h3>
          <p className="mt-0.5 text-[12px] text-faint">What matters for you today</p>
        </div>
        <span className="text-[11px] font-medium text-faint">
          {remaining.length} {remaining.length === 1 ? "thing" : "things"}
        </span>
      </div>

      {remaining.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <PartyPopper className="h-7 w-7 text-[#33b28a]" />
          <p className="text-[13px] font-semibold">You’re all caught up 🎉</p>
          <p className="text-[11.5px] text-faint">Nothing left for today. Enjoy it.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {myDay.map((t, i) =>
            doneIdx.includes(i) ? null : (
              <li key={t.title} className="flex items-center gap-3.5 rounded-2xl border border-line p-3.5 transition hover:bg-soft">
                <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: t.accent }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{t.title}</div>
                  <div className="text-[11px] text-faint">{t.meta}</div>
                </div>
                <span className="hidden sm:inline">
                  <Badge tone={TAG_TONE[t.tag] ?? "neutral"} variant="soft" size="sm">{t.tag}</Badge>
                </span>
                <button
                  onClick={() => setDoneIdx((d) => [...d, i])}
                  className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold transition hover:bg-card hover:shadow-sm"
                >
                  {t.action}
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
