"use client";
/* My requests — proof the desk did something (SmartWork, spec 051).

   Every help desk fails the same way: you ask, something happens, and you
   never hear again. So each row says which of the three things happened —
   answered, done, or handed to a person — and an escalation shows the name,
   the case it became and when it is due, because "we're looking into it" is
   what people stop believing. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Clock3, FileText, UserRound } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import type { DeskRequest } from "@/lib/smartwork";
import { Card, Eyebrow } from "./parts";

const KIND = {
  answered: { label: "Answered", color: "var(--purple)", Icon: FileText },
  done: { label: "Done for you", color: "var(--success)", Icon: Check },
  escalated: { label: "With a person", color: "var(--warning)", Icon: UserRound },
} as const;

export function Requests({ items, isAdmin }: { items: DeskRequest[]; isAdmin: boolean }) {
  if (items.length === 0) {
    return (
      <Card>
        <div className="py-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-soft text-[var(--purple)]"><BadgeCheck className="h-6 w-6" strokeWidth={1.8} /></span>
          <p className="mt-4 text-[17px] font-semibold">Nothing open</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[15px] leading-relaxed text-muted">Whatever you ask, and whatever the desk does about it, shows up here — with a name against it when a person is involved.</p>
        </div>
      </Card>
    );
  }

  const open = items.filter((r) => r.kind === "escalated" && r.status !== "Resolved");
  const rest = items.filter((r) => !open.includes(r));

  return (
    <div className="flex flex-col gap-6">
      {open.length > 0 && (
        <section aria-labelledby="open-h" className="flex flex-col gap-3">
          <h2 id="open-h" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">Waiting on someone</h2>
          {open.map((r) => <Row key={r.id} r={r} isAdmin={isAdmin} big />)}
        </section>
      )}

      <section aria-labelledby="all-h" className="flex flex-col gap-3">
        <h2 id="all-h" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">Everything else</h2>
        <ul className="overflow-hidden rounded-[24px] border border-line bg-card">
          {rest.map((r) => (
            <li key={r.id} className="border-b border-line px-5 py-4 last:border-b-0"><Row r={r} isAdmin={isAdmin} /></li>
          ))}
          {rest.length === 0 && <li className="px-5 py-6 text-[15px] text-muted">Nothing else yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function Row({ r, isAdmin, big = false }: { r: DeskRequest; isAdmin: boolean; big?: boolean }) {
  const k = KIND[r.kind];
  const body = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${k.color} 12%, transparent)`, color: k.color }}>
        <k.Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: k.color }}>{k.label}</p>
        <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{r.question}</p>
        <p className="mt-1 text-[14px] leading-snug text-muted">{r.outcome}</p>
        <p className="mt-1.5 text-[13px] text-faint">{r.when}{r.seenBy ? ` · seen by ${r.seenBy}` : ""}</p>
      </div>
      {r.kind === "escalated" && r.owner && (
        <div className="flex shrink-0 items-center gap-2.5 sm:flex-col sm:items-end">
          <span className="flex items-center gap-2">
            <Avatar src={r.owner.img} name={r.owner.name} size="sm" />
            <span className="text-[14px] font-medium text-ink">{r.owner.name}</span>
          </span>
          {r.dueInDays != null && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: r.dueInDays <= 0 ? "var(--danger)" : "var(--muted)" }}>
              <Clock3 className="h-3.5 w-3.5" />
              {r.dueInDays <= 0 ? "Overdue" : r.dueInDays === 1 ? "Due tomorrow" : `Due in ${r.dueInDays} days`}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!big) return body;
  return (
    <Card>
      {body}
      {r.caseId && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[13px] text-faint">Your conversation went with it — you will not be asked to explain it again. Reference {r.caseId}.</p>
          {isAdmin && (
            <Link href="/product/flow" className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
              Open in Flow <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}

export { Eyebrow };
