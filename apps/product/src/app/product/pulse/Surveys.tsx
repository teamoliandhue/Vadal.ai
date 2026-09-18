"use client";
/* Surveys — every survey, and the ones that run on their own (Pulse v2, spec 049).
   A row is the whole target: it opens the survey's details, where the send
   plan and the way to its results live. */
import * as React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@vadal/design-system";
import { daysBetween, fmtDate, resultFor, type PulseStatus, type PulseSurvey } from "@/lib/pulse";
import { Drawer } from "../Drawer";
import { Programmes, SmartSend } from "./Programmes";
import { ResponseBar, StatusPill, pct, type PulseState } from "./parts";

const FILTERS: { key: "all" | PulseStatus; label: string }[] = [
  { key: "all", label: "All" }, { key: "live", label: "Live" }, { key: "scheduled", label: "Scheduled" }, { key: "closed", label: "Closed" },
];

export function when(x: PulseSurvey, today: string) {
  if (x.status === "scheduled") return `Opens ${fmtDate(x.opens, true)}`;
  if (!x.closes) return "Rolling";
  if (x.status === "closed") return `Closed ${fmtDate(x.closes)}`;
  const left = daysBetween(today, x.closes);
  return left <= 0 ? "Closes today" : `Closes ${fmtDate(x.closes, true)}`;
}

export function Surveys({ s, onOpen }: { s: PulseState; onOpen: (id: string) => void }) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("all");
  const rows = s.surveys.filter((x) => filter === "all" || x.status === filter);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="all-h" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="all-h" className="text-[18px] font-bold tracking-tight">All surveys</h2>
          <div role="group" aria-label="Filter by status" className="flex rounded-full border border-line bg-soft p-1">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                className={`min-h-[44px] rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[34px] ${filter === f.key ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>
                {f.label} <span className="tabular-nums text-faint">{f.key === "all" ? s.surveys.length : s.surveys.filter((x) => x.status === f.key).length}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="overflow-hidden rounded-[24px] border border-line bg-card">
          <li className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_110px_minmax(0,1fr)_minmax(0,0.9fr)_24px] gap-4 border-b border-line px-5 py-3 text-[12px] font-semibold text-faint lg:grid" aria-hidden>
            <span>Survey</span><span>Audience</span><span>Status</span><span>Answered</span><span>When</span><span />
          </li>
          {rows.map((x) => {
            const rate = pct(x.responses, x.sent);
            return (
              <li key={x.id} className="border-b border-line last:border-b-0">
                <button onClick={() => onOpen(x.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition hover:bg-soft lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_110px_minmax(0,1fr)_minmax(0,0.9fr)_24px]">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-ink">{x.name}</span>
                    <span className="block text-[13px] text-faint">{x.kind}{x.mine ? " · launched by you" : ""}<span className="lg:hidden"> · {x.audience}</span></span>
                  </span>
                  <span className="justify-self-end lg:hidden"><StatusPill status={x.status} /></span>
                  <span className="hidden truncate text-[14px] text-muted lg:block">{x.audience}</span>
                  <span className="hidden lg:block"><StatusPill status={x.status} /></span>
                  <span className="col-span-2 flex items-center gap-3 lg:col-span-1">
                    {x.status === "scheduled" ? <span className="text-[14px] text-faint">{x.sent.toLocaleString("en-US")} invited</span> : (
                      <>
                        <span className="w-24 shrink-0"><ResponseBar rate={rate} /></span>
                        <span className="text-[14px] font-semibold tabular-nums">{rate}%</span>
                        <span className="text-[13px] text-faint lg:hidden">· {when(x, s.today)}</span>
                      </>
                    )}
                  </span>
                  <span className="hidden text-[14px] text-muted lg:block">{when(x, s.today)}</span>
                  <ChevronRight className="hidden h-4 w-4 text-faint lg:block" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Programmes />
    </div>
  );
}

export function SurveyDrawer({ x, onClose, onResults }: { x: PulseSurvey | null; onClose: () => void; onResults: (id: string) => void }) {
  const rate = x ? pct(x.responses, x.sent) : 0;
  const hasResult = x ? !!resultFor(x.id) : false;
  return (
    <Drawer open={!!x} title={x?.name} onClose={onClose} footer={x && hasResult ? (
      <Button variant="brand" size="sm" className="min-h-[44px] w-full lg:min-h-0" trailingIcon={<ArrowRight className="h-4 w-4" />} onClick={() => { onResults(x.id); onClose(); }}>
        {x.status === "live" ? "See the early read" : "See results"}
      </Button>
    ) : undefined}>
      {x && (
        <>
          <div className="flex flex-wrap items-center gap-2 pr-12"><StatusPill status={x.status} /><span className="text-[13px] text-faint">{x.kind} · {x.audience}</span></div>
          <h2 className="mt-2 pr-12 text-[22px] font-bold leading-tight tracking-tight">{x.name}</h2>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Opens", fmtDate(x.opens, true)],
              ["Closes", x.closes ? fmtDate(x.closes, true) : "Rolling"],
              ["Invited", x.sent.toLocaleString("en-US")],
              ["Answered", x.status === "scheduled" ? "—" : `${rate}% · ${x.responses.toLocaleString("en-US")}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line p-3">
                <dt className="text-[13px] text-faint">{k}</dt>
                <dd className="mt-0.5 text-[16px] font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {x.status === "live" && (
            <div className="mt-4">
              <ResponseBar rate={rate} projected={x.projected} />
              {x.projected != null && <p className="mt-1.5 text-[13px] text-muted">On pace for about {x.projected}% by {fmtDate(x.closes!, true)}.</p>}
            </div>
          )}

          {!hasResult && x.status !== "scheduled" && (
            <p className="mt-5 rounded-2xl bg-soft p-4 text-[14px] leading-relaxed text-muted">
              {x.id === "exit" ? "Every leaver is asked, and again 60 days later. What they say is read as themes in Sentiment, so no single leaver can be picked out." : "Results appear here once enough people have answered to keep everyone anonymous."}
            </p>
          )}

          {x.status !== "closed" && <div className="mt-6 border-t border-line pt-5"><SmartSend /></div>}
        </>
      )}
    </Drawer>
  );
}
