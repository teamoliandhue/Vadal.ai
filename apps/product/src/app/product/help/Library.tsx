"use client";
/* ══════════════════════ the library ══════════════════════
   Six perfectly good resources existed and were invisible. matchResources()
   only ever fires off the back of a conversation, so the only way to reach any
   of them was to type something first — which excludes exactly the person most
   likely to be on this page: the one who is not ready to talk to anybody,
   including a machine.

   So the library browses. Buckets are named the way someone would describe
   their own week ("Not sleeping", "Burnt out"), never as conditions. */
import * as React from "react";
import { BookOpen, ClipboardList, Wind } from "lucide-react";
import { BUCKETS, resourcesIn, type Resource, type ResourceBucket } from "@/lib/ai/engines/support";
import { Card, Eyebrow } from "./parts";
import { toast } from "../Toaster";

const KIND: Record<Resource["kind"], { icon: React.ElementType; label: string }> = {
  exercise: { icon: Wind, label: "Exercise" },
  guide: { icon: BookOpen, label: "Guide" },
  script: { icon: ClipboardList, label: "What to say" },
};

export function Library() {
  const [bucket, setBucket] = React.useState<ResourceBucket | null>(null);
  const shown = bucket ? resourcesIn(bucket) : BUCKETS.flatMap((b) => resourcesIn(b.key));

  return (
    <Card>
      <Eyebrow>No talking required</Eyebrow>
      <h3 className="mt-1.5 text-[16px] font-bold tracking-tight">Things you can just read</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">
        Short, practical, and yours alone — nobody is told you opened any of these.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setBucket(null)}
          aria-pressed={bucket === null}
          className={`min-h-[44px] rounded-full border px-3.5 text-[14px] font-medium transition lg:min-h-[38px] ${
            bucket === null ? "border-transparent bg-soft text-ink" : "border-line text-muted hover:text-ink"
          }`}
        >
          Everything
        </button>
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBucket(b.key === bucket ? null : b.key)}
            aria-pressed={bucket === b.key}
            className={`min-h-[44px] rounded-full border px-3.5 text-[14px] font-medium transition lg:min-h-[38px] ${
              bucket === b.key ? "border-transparent bg-soft text-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col">
        {shown.map((r) => {
          const K = KIND[r.kind];
          const Icon = K.icon;
          return (
            <li key={r.id} className="border-t border-line first:border-t-0">
              <button
                onClick={() => toast(`Opening “${r.title}”`)}
                className="group flex min-h-[56px] w-full items-center gap-3 py-2.5 text-left"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-[var(--purple)]">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.85} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium leading-snug transition group-hover:text-[var(--purple)]">{r.title}</span>
                  <span className="mt-0.5 block text-[12px] text-faint">{K.label} · {r.minutes} min</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
