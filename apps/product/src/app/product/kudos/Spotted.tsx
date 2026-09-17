"use client";
/* Nudge spotted — kudos-spotting (brief · Connect: "surfaces moments worth
   recognising and prompts the manager").

   Two things, from two engines:
   · Moments — recent wins in Social that no kudos has followed yet, found by
     tagging posts (tagPost) rather than by anyone flagging them.
   · Dips — teams whose recognition has fallen below their OWN usual level
     (scanAnomalies over each team's history). Managers and up only: it is about
     teams, and it comes with the drafted action the brief asks for. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { Avatar, Button, SparkMark } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import { scanAnomalies } from "@/lib/ai/engines/signals";
import { tagPost } from "@/lib/ai/engines/text";
import { feedItems } from "@/lib/feed";
import { recognitionHistory, type Person } from "@/lib/recognize";
import { useViewAs } from "../useViewAs";
import { toast } from "../Toaster";

const SEVERITY = { urgent: "var(--danger)", concern: "var(--warning)", watch: "var(--muted)" } as const;

export function Spotted({ onRecognise }: { onRecognise: (p: Person) => void }) {
  const [role] = useViewAs();
  const isManager = canAccess(role, "Manager hub");

  const moments = React.useMemo(() => feedItems
    /* anniversaries and birthdays are celebrations, handled below the wall — this is for work */
    .filter((p) => p.type === "post" || p.type === "announcement")
    .map((p) => ({ p, topics: tagPost(p.text).topics }))
    .filter(({ p, topics }) => topics.includes("milestone") || /\b(shipped|days|over target|faster)\b/i.test(p.text))
    .filter(({ p }) => !/^(Vadal|People Team)$/.test(p.author.name) && p.author.role !== "CEO")
    .slice(0, 3), []);

  const dips = React.useMemo(() => scanAnomalies(recognitionHistory()).slice(0, 3), []);

  /* A post about a crew's win credits the crew, not the person who posted it. */
  const who = (p: (typeof feedItems)[number]): Person => {
    const team = p.author.role.split("·").pop()!.trim();
    return /\bcrew\b/i.test(p.text)
      ? { name: `${team} crew`, team, img: p.author.img }
      : { name: p.author.name, team, img: p.author.img };
  };

  return (
    <section className="rounded-[26px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <SparkMark size={18} tone="gradient" state="idle" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--ai-accent)]">Nudge spotted</p>
      </div>
      <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Worth a thank-you</h2>

      <div className={`mt-4 grid gap-6 ${isManager && dips.length ? "lg:grid-cols-2" : ""}`}>
        <div>
          <p className="text-[13px] font-semibold text-ink">Wins nobody has recognised yet</p>
          <ul className="mt-2 flex flex-col gap-2">
            {moments.map(({ p }) => {
              const person = who(p);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-[var(--ai-border)]">
                  <Avatar src={person.img} name={person.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">{person.name}</p>
                    <p className="line-clamp-2 text-[12px] leading-snug text-muted">{p.text.replace(/\*\*/g, "")}</p>
                  </div>
                  <Button variant="brand" size="sm" className="min-h-[44px] shrink-0 lg:min-h-0" onClick={() => onRecognise(person)}>Recognise</Button>
                </li>
              );
            })}
          </ul>
        </div>

        {isManager && dips.length > 0 && (
          <div>
            <p className="text-[13px] font-semibold text-ink">Teams below their own usual level</p>
            <ul className="mt-2 flex flex-col gap-2">
              {dips.map((d) => (
                <li key={d.team} className="rounded-2xl bg-card p-3.5 ring-1 ring-[var(--ai-border)]">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" style={{ color: SEVERITY[d.severity] }} />
                    <span className="text-[14px] font-semibold text-ink">{d.team}</span>
                    <span className="ml-auto text-[12px] tabular-nums text-muted">{d.current}% · usually {d.expected}%</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-muted">{d.explanation}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" onClick={() => toast(`Asked ${d.team}'s managers: “${d.suggestedAction.title}” 📣`)}>Prompt their managers</Button>
                    <Link href="/product/managers" className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">Manager hub <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
