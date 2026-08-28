"use client";
/* Tells a manager, plainly, that they are looking at their team and not the org.

   Access has a visible failure mode — the restricted screen. Scope does not:
   numbers simply look smaller, and a manager comparing notes with an admin can
   reasonably conclude the product is broken. So scope is stated rather than
   implied, wherever it silently changes what the figures mean.

   Two shapes: a full notice for the top of a scoped surface, and an inline chip
   for a single card that stays org-wide inside an otherwise team-scoped view. */
import * as React from "react";
import { Users } from "lucide-react";

export function ScopeNotice({ team, what, className = "" }: { team: string; what: string; className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-2xl border border-line bg-soft px-4 py-3 ${className}`}
      role="status"
    >
      <Users className="mt-[2px] h-4 w-4 shrink-0 text-faint" strokeWidth={1.85} />
      <p className="text-[14px] leading-snug text-muted">
        Showing <b className="font-semibold text-ink">{team}</b> only — {what} across other teams is
        limited to HR admins.
      </p>
    </div>
  );
}

/** For a card whose figures stay org-wide inside a team-scoped page. */
export function OrgWideChip({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-faint">Org-wide</span>
  );
}
