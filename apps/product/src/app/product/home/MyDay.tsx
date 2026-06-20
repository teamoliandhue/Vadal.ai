"use client";
/* Your day — the focus list (Notion Home spec §2.3). Complete-in-place → empty state.
   Neutral surfaces, violet accent, completion circles + progress. */
import * as React from "react";
import { Check, PartyPopper } from "lucide-react";
import { Button } from "@vadal/design-system";
import { myDay } from "@/lib/data";

const DOT: Record<string, string> = {
  Survey: "#8b7cf8",
  Meeting: "#33b28a",
  Recognition: "#f2884d",
  Learning: "#e0708a",
};

export function MyDay({ className = "", empty = false }: { className?: string; empty?: boolean }) {
  const [doneIdx, setDoneIdx] = React.useState<number[]>([]);
  const items = empty ? [] : myDay;
  const remaining = items.filter((_, i) => !doneIdx.includes(i));
  const total = items.length;
  const done = total - remaining.length;

  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Today</p>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Your day</h2>
        </div>
        <span className="text-[11.5px] font-medium text-faint">{total > 0 ? `${done}/${total} done` : "Nothing today"}</span>
      </div>
      {total > 0 && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-soft">
          <span className="block h-full rounded-full bg-[var(--purple)] transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      )}

      {remaining.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-14 text-center">
          <PartyPopper className="h-8 w-8 text-[var(--purple)]" />
          <p className="text-[14px] font-semibold">{empty ? "Your day is clear" : "You’re all caught up 🎉"}</p>
          <p className="text-[12px] text-faint">{empty ? "New tasks and nudges will land here." : "Nothing left for today. Enjoy it."}</p>
        </div>
      ) : (
        <ul className="mt-3 -mx-2">
          {myDay.map((t, i) =>
            doneIdx.includes(i) ? null : (
              <li key={t.title} className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-soft">
                <button
                  onClick={() => setDoneIdx((d) => [...d, i])}
                  aria-label={`Mark “${t.title}” done`}
                  className="grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-line text-transparent transition hover:border-[var(--purple)] hover:text-[var(--purple)]"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: DOT[t.tag] ?? "var(--faint)" }} />
                    <span className="truncate text-[13.5px] font-semibold">{t.title}</span>
                  </div>
                  <div className="mt-0.5 pl-3.5 text-[11.5px] text-faint">{t.meta} · {t.tag}</div>
                </div>
                <Button variant="tertiary" size="sm" onClick={() => setDoneIdx((d) => [...d, i])}>{t.action}</Button>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
