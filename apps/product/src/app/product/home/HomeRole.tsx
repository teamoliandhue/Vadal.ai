"use client";
/* Role-aware Home (Home §5). A "Viewing as" switch lets an admin or manager see
   the product as a less-privileged role — the call's actor model. It only ever
   scopes DOWN (useViewAs caps it against the session), so an employee sees no
   switch at all rather than a control that would grant them nothing.
   When viewing as a manager or admin, a compact team snapshot appears above the
   personal cards and links into the Manager hub. Employee view hides it. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, Users } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { useViewAs } from "../useViewAs";
import { team, reports } from "@/lib/manager";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function ViewAsSwitch() {
  const [role, setRole, meta] = useViewAs();
  // Nothing below an employee to preview — and offering a role they cannot have
  // was the escalation the audit found. Hide the control entirely.
  if (!meta.ready || !meta.canSwitch) return <span />;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-medium text-faint">Viewing as</span>
      <div className="flex items-center gap-0.5 rounded-full border border-line bg-soft p-0.5">
        {meta.options.map((r) => {
          // superadmin sessions sit above the switch's top option — treat Admin as on.
          const on = role === r.key || (role === "superadmin" && r.key === "admin");
          return (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              aria-pressed={on}
              className={`min-h-[44px] rounded-full px-2.5 py-1 text-[12px] font-semibold transition lg:min-h-[32px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ManagerSnapshot() {
  const [role] = useViewAs();
  if (role === "employee") return null;

  /* A 1:1 that has not happened is a fact both people know. What someone told
     their check-in is not, so it is not here — the same rule Manager hub,
     Insight and iThrive keep. */
  const owed = reports.filter((r) => r.overdue);
  const stats: [string, string, string?][] = [
    ["Team score", String(team.health), `▲ ${team.healthDelta}`],
    ["1:1s held", `${team.oneOnOneCompletion}%`],
    ["Kudos given", `${team.recognitionCoverage}%`],
  ];

  return (
    <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--purple)_14%,transparent)] text-[var(--purple)]"><Users className="h-[18px] w-[18px]" /></span>
          <div><Eyebrow>Manager view · {team.name}</Eyebrow><h2 className="mt-0.5 text-[18px] font-bold tracking-tight">Your team today</h2></div>
        </div>
        <Link href="/product/managers" className="flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-[var(--purple)] transition hover:gap-1.5 lg:min-h-0">Manager hub <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
        {stats.map(([label, val, delta]) => (
          <div key={label}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">{label}</div>
            <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[22px] font-bold tracking-tight">{val}</span>{delta && <span className="text-[12px] font-bold text-faint">{delta}</span>}</div>
          </div>
        ))}
      </div>

      {owed.length > 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-soft/40 p-3">
          <CalendarClock className="h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden />
          <span className="text-[13px] text-muted">{owed.length} 1:1{owed.length === 1 ? "" : "s"} overdue — {owed.map((r) => r.name.split(" ")[0]).join(" and ")}</span>
          <div className="ml-auto flex -space-x-2">
            {owed.slice(0, 3).map((r) => <Avatar key={r.id} src={r.img} name={r.name} size="sm" className="ring-2 ring-card" />)}
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-line bg-soft/40 p-3 text-[13px] text-muted">Every 1:1 is booked. Nothing is waiting on you here.</p>
      )}

      <p className="mt-3 text-[12px] text-faint">Your team&rsquo;s score, not anyone&rsquo;s answers. Individual check-ins stay private, including from you.</p>
    </section>
  );
}
