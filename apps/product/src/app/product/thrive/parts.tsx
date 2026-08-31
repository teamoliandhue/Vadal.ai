"use client";
/* Shared furniture for Thrive. */
import * as React from "react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

/**
 * The header for one half of the pillar.
 *
 * The brief asks for "physical health and financial health, SIDE BY SIDE" and
 * the page was making that claim with a two-column grid of identical cards —
 * which reads as eight things, not two halves. A titled half with its own
 * accent is the cheapest way to make the structure legible, and it gives the
 * eye something to land on between the hero and the detail.
 */
export function HalfHeader({
  icon, title, state, hue,
}: { icon: React.ReactNode; title: string; state: string; hue: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
        style={{ background: `color-mix(in srgb, ${hue} 12%, transparent)`, color: hue }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold leading-tight tracking-[-0.015em]">{title}</h2>
        <p className="mt-0.5 truncate text-[13px] text-muted">{state}</p>
      </div>
      <span className="ml-2 h-px flex-1" style={{ background: `linear-gradient(to right, color-mix(in srgb, ${hue} 26%, transparent), transparent)` }} aria-hidden />
    </div>
  );
}
