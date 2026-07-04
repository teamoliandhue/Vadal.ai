"use client";
/* Role-aware Home (Home §5). A "Viewing as" switch lets the user see Home as an
   Employee, Manager or Admin (the call's actor model). When viewing as a manager
   or admin, a compact team snapshot appears above the personal cards and links
   into the Manager hub. Employee view hides it. */
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Users } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { useViewAs, VIEW_ROLES } from "../useViewAs";
import { team, reports } from "@/lib/manager";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function ViewAsSwitch() {
  const [role, setRole] = useViewAs();
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-medium text-faint">Viewing as</span>
      <div className="flex items-center gap-0.5 rounded-full border border-line bg-soft p-0.5">
        {VIEW_ROLES.map((r) => {
          const on = role === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
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

  const atRiskReports = reports.filter((r) => r.risk === "High" || r.risk === "Med").slice(0, 3);
  const stats: [string, string, string?][] = [
    ["Team health", String(team.health), `▲ ${team.healthDelta}`],
    ["1:1 completion", `${team.oneOnOneCompletion}%`],
    ["At-risk", `${team.atRisk}`, `${team.atRiskHigh} high`],
  ];

  return (
    <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--purple)_14%,transparent)] text-[var(--purple)]"><Users className="h-[18px] w-[18px]" /></span>
          <div><Eyebrow>Manager view · {team.name}</Eyebrow><h2 className="mt-0.5 text-[18px] font-bold tracking-tight">Your team today</h2></div>
        </div>
        <Link href="/product/managers" className="flex items-center gap-1 text-[13px] font-semibold text-[var(--purple)] transition hover:gap-1.5">Manager hub <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
        {stats.map(([label, val, delta]) => (
          <div key={label}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">{label}</div>
            <div className="mt-1 flex items-baseline gap-1.5"><span className="text-[22px] font-bold tracking-tight">{val}</span>{delta && <span className="text-[12px] font-bold text-faint">{delta}</span>}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-soft/40 p-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--warning)]" />
        <span className="text-[13px] text-muted">{atRiskReports.length} people need attention</span>
        <div className="ml-auto flex -space-x-2">
          {atRiskReports.map((r) => <Avatar key={r.id} src={r.img} name={r.name} size="sm" className="ring-2 ring-card" />)}
        </div>
      </div>
    </section>
  );
}
