"use client";
/* Shared furniture for Amplify. Pulled out when the pillar grew a second
   audience (comms running the programme) and a second direction (the person's
   own moments going out) — one file holding all of it stopped being readable. */
import * as React from "react";
import { PLATFORM_MARK } from "@/lib/amplify";
import type { Platform } from "@/lib/ai/engines/timing";
import type { Voice } from "@/lib/ai/engines/advocacy";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}

export const VOICES: { key: Voice; label: string }[] = [
  { key: "plain", label: "Plain" },
  { key: "warm", label: "Warm" },
  { key: "proud", label: "Proud" },
  { key: "technical", label: "Technical" },
];

export const ALL_PLATFORMS: Platform[] = ["LinkedIn", "X", "Instagram", "Facebook"];

/** Small platform mark — identity without imitating anyone's chrome. */
export function Mark({ platform, size = 22 }: { platform: Platform; size?: number }) {
  const m = PLATFORM_MARK[platform];
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-[7px] font-bold text-white"
      style={{ width: size, height: size, background: m.color, fontSize: size * 0.5, lineHeight: 1 }}
    >
      {m.label}
    </span>
  );
}

export function PlatformLine({ p, posted }: { p: Platform; posted: string }) {
  return (
    <span className="flex items-center gap-2 text-[12px] text-faint">
      <Mark platform={p} size={18} />
      <span className="font-semibold text-muted">{p}</span>
      <span aria-hidden>·</span>
      {posted}
    </span>
  );
}

/** Where a moment should go. Company posts already have a platform; a personal
 *  moment does not, and picking one is the first real decision the person makes. */
export function PlatformPicker({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-card p-1">
      {ALL_PLATFORMS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-pressed={value === p}
          aria-label={p}
          title={p}
          className={`grid min-h-[44px] min-w-[44px] place-items-center rounded-full transition lg:min-h-[32px] lg:min-w-[32px] ${
            value === p ? "bg-soft" : "opacity-45 hover:opacity-100"
          }`}
        >
          <Mark platform={p} size={18} />
        </button>
      ))}
    </div>
  );
}
