"use client";
/* Trust — security and compliance (Platform · admins).

   Written for the person answering a security questionnaire and for the HR
   admin who has to explain the product to a works council:
   · the posture, in four facts;
   · compliance, stated as it actually is — controls that exist in the
     product, and audits that are planned, not implied;
   · who can see what, generated from the same access rules the product
     enforces (lib/access), so the table cannot drift from reality;
   · an audit log and the data requests queue. */
import * as React from "react";
import { Check, Download, Lock, Minus, ShieldCheck, Users } from "lucide-react";
import { Badge, Button } from "@vadal/design-system";
import { SECTION_ACCESS, canAccess, scopeFor } from "@/lib/access";
import type { Role } from "@/lib/auth";
import { AI_SAFEGUARDS, AUDIT_LOG, DATA_REQUESTS, FRAMEWORKS, POSTURE, REQUEST_SLA_DAYS, type AuditEvent } from "@/lib/platform";
import { usePersistentState } from "@/lib/usePersistentState";
import { NAV } from "../nav-model";
import { toast } from "../Toaster";

const ROLES: { role: Role; label: string }[] = [
  { role: "employee", label: "Employee" }, { role: "manager", label: "Manager" }, { role: "admin", label: "HR admin" },
];
const KINDS: AuditEvent["kind"][] = ["Access", "Data", "Settings", "AI", "Moderation"];
/** Sections whose data is narrowed to a manager's own team (the screens that call useScope, plus Manager hub, which only ever holds direct reports). */
const TEAM_SCOPED = new Set(["Insight", "Sentiment", "Campaigns", "Onboard", "Manager hub"]);

export function TrustHub() {
  const [kind, setKind] = React.useState<AuditEvent["kind"] | "All">("All");
  const [closed, setClosed] = usePersistentState<string[]>("vadal:trust-requests-done", []);

  const sections = [...NAV.flatMap((g) => g.items.map((i) => i.label)), "Settings"].filter((s) => s in SECTION_ACCESS);
  const events = AUDIT_LOG.filter((e) => kind === "All" || e.kind === kind);

  const download = () => {
    const rows = [["When", "Who", "Type", "What"], ...events.map((e) => [e.when, e.who, e.kind, e.what])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "vadal-audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${events.length} events`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Platform</p>
        <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Trust</h1>
        <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-muted">
          How employee data is protected, who can see what, and a record of every sensitive action.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {POSTURE.map((p) => (
          <div key={p.label} className="card-lift rounded-[22px] border border-line bg-card p-4 sm:p-5">
            <p className="text-[13px] text-muted">{p.label}</p>
            <p className="mt-1 text-[18px] font-bold leading-tight tracking-tight">{p.value}</p>
            <p className="mt-1 text-[12px] text-faint">{p.note}</p>
          </div>
        ))}
      </div>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="comp-h">
        <h2 id="comp-h" className="text-[18px] font-bold tracking-tight">Compliance</h2>
        <p className="mt-1 text-[14px] text-muted">What the product does today, and what is planned — nothing here is a certificate we don&rsquo;t hold.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FRAMEWORKS.map((f) => (
            <div key={f.name} className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-ink">{f.name}</p>
                <Badge tone={f.status === "Controls built" ? "success" : "neutral"} size="sm">{f.status}</Badge>
              </div>
              <ul className="mt-2 space-y-1 text-[13px] text-muted">
                {f.what.map((w) => <li key={w} className="flex gap-2"><Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-faint" />{w}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-faint">Audit dates are confirmed by Vadal&rsquo;s security team before they&rsquo;re shared with anyone outside your company.</p>
      </section>

      <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="access-h">
        <h2 id="access-h" className="flex items-center gap-2 text-[18px] font-bold tracking-tight"><Users className="h-5 w-5" /> Who can see what</h2>
        <p className="mt-1 text-[14px] text-muted">Generated from the access rules the product enforces, so it can&rsquo;t fall out of date.</p>
        <div className="-mx-2 mt-4 overflow-x-auto px-2">
          <table className="w-full min-w-[480px] text-[13px]">
            <caption className="sr-only">Sections each role can open</caption>
            <thead>
              <tr className="text-left text-faint">
                <th scope="col" className="pb-2 font-medium">Section</th>
                {ROLES.map((r) => <th key={r.role} scope="col" className="pb-2 text-center font-medium">{r.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s} className="border-t border-line">
                  <th scope="row" className="py-2 pr-3 text-left font-medium text-ink">{s}</th>
                  {ROLES.map((r) => {
                    const can = canAccess(r.role, s);
                    const own = can && TEAM_SCOPED.has(s) && scopeFor(r.role, s) === "own-team";
                    return (
                      <td key={r.role} className="py-2 text-center">
                        {!can ? <Minus className="mx-auto h-4 w-4 text-faint" aria-label="No access" />
                          : own ? <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] font-semibold text-muted">Own team</span>
                          : <Check className="mx-auto h-4 w-4 text-[var(--success)]" aria-label="Access" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[12px] text-faint"><Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" /> Anywhere results are shown, fewer than 5 responses are hidden — for every role, including admins.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="audit-h">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="audit-h" className="text-[18px] font-bold tracking-tight">Audit log</h2>
              <p className="mt-1 text-[13px] text-faint">Kept 12 months · can&rsquo;t be edited or deleted from the product</p>
            </div>
            <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-0" leadingIcon={<Download className="h-4 w-4" />} onClick={download}>Download CSV</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
            {(["All", ...KINDS] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`min-h-[44px] rounded-full px-3 text-[13px] font-semibold transition lg:min-h-[30px] ${kind === k ? "bg-[var(--purple)] text-white" : "bg-soft text-muted hover:text-ink"}`}>{k}</button>
            ))}
          </div>
          <ul className="mt-3 flex flex-col divide-y divide-[var(--line)]">
            {events.map((e) => (
              <li key={e.id} className="grid gap-x-3 py-2.5 text-[13px] sm:grid-cols-[112px_1fr]">
                <span className="text-faint">{e.when}</span>
                <span className="min-w-0"><span className="font-semibold text-ink">{e.who}</span> <span className="text-muted">— {e.what}</span> <span className="text-faint">· {e.kind}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-6">
          <section className="card-lift rounded-[26px] border border-line bg-card p-6" aria-labelledby="dsr-h">
            <h2 id="dsr-h" className="text-[16px] font-bold tracking-tight">Data requests</h2>
            <p className="mt-1 text-[13px] text-faint">Answered within {REQUEST_SLA_DAYS} days</p>
            <ul className="mt-3 flex flex-col gap-3">
              {DATA_REQUESTS.map((r) => {
                const done = r.status === "Done" || closed.includes(r.id);
                return (
                  <li key={r.id} className="rounded-2xl bg-soft p-3.5 text-[13px]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-ink">{r.kind}</span>
                      <Badge tone={done ? "success" : r.daysLeft <= 7 ? "warning" : "neutral"} size="sm">{done ? "Done" : `${r.daysLeft} days left`}</Badge>
                    </div>
                    <p className="mt-0.5 text-muted">{r.who} · received {r.received}</p>
                    {!done && (
                      <button onClick={() => { setClosed((c) => [...c, r.id]); toast(`${r.kind} request marked done — logged in the audit log`); }} className="mt-1 min-h-[44px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
                        Mark done
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card-lift rounded-[26px] border border-line bg-card p-6" aria-labelledby="ai-h">
            <h2 id="ai-h" className="flex items-center gap-2 text-[16px] font-bold tracking-tight"><ShieldCheck className="h-4 w-4" /> What the AI is held to</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {AI_SAFEGUARDS.map((g) => (
                <li key={g.rule} className="text-[13px]">
                  <p className="flex gap-2 text-ink"><Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--success)]" />{g.rule}</p>
                  <p className="pl-5 text-faint">{g.where}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
