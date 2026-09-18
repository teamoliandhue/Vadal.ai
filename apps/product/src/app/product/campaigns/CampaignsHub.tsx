"use client";
/* CAMPAIGNS — plan what goes out, see where it's up to, learn what worked
   (Engage · Campaigns v3, spec 047).

   Three views instead of one long page, because they're three different jobs:
   · Overview — what's running and what needs you, each campaign with its own
     timeline of sends;
   · Planner — six weeks on one timeline, and the messages each team gets per
     week against the weekly limit;
   · Results — lift split into the campaign's own and what moved anyway, the
     channels that reached people, and the lessons.
   Templates moved into "New campaign", where you actually choose one. */
import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@vadal/design-system";
import { FATIGUE_LIMIT_PER_WEEK } from "@/lib/ai/engines/timing";
import { addDays, collisions, objectives, type Campaign } from "@/lib/campaigns";
import { CampaignBuilder, type CampaignSeed } from "./CampaignBuilder";
import { CampaignDrawer } from "./CampaignDrawer";
import { Overview } from "./Overview";
import { Planner } from "./Planner";
import { Results } from "./Results";
import { TODAY, useCampaigns } from "./parts";

type View = "overview" | "planner" | "results";
const VIEWS: { id: View; label: string }[] = [{ id: "overview", label: "Overview" }, { id: "planner", label: "Planner" }, { id: "results", label: "Results" }];

export function CampaignsHub() {
  const s = useCampaigns();
  const [view, setView] = React.useState<View>("overview");
  const [focus, setFocus] = React.useState<{ week: string; team: string } | undefined>();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [builder, setBuilder] = React.useState<CampaignSeed>(null);

  const open = openId ? s.all.find((c) => c.id === openId) ?? null : null;
  const clash = s.isAdmin ? collisions(s.all, FATIGUE_LIMIT_PER_WEEK)[0] : undefined;
  const running = s.visible.filter((c) => c.status === "live").length;
  const nextWeek = addDays(TODAY, 7);
  const sendsSoon = s.visible
    .filter((c) => c.status === "live" || c.status === "scheduled")
    .reduce((n, c) => n + c.steps.filter((x) => x.date && !x.done && x.date >= TODAY && x.date < nextWeek).length, 0);
  const needs = (clash ? 1 : 0) + s.visible.filter((c) => c.status === "paused" && s.canEdit(c)).length;

  const rerun = (c: Campaign) => {
    const lessons = c.lessons ?? [];
    setOpenId(null);
    setBuilder({
      name: `${c.name} — again`, objective: c.objective, audience: c.audience,
      steps: [...c.steps.map((x) => x.label), ...lessons.flatMap((l) => (l.addStep ? [l.addStep] : []))],
      channels: [...new Set([...c.channels, ...lessons.flatMap((l) => (l.addChannel ? [l.addChannel] : []))])],
    });
  };

  if (!s.ready) return <div className="py-10" aria-busy="true" />;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Engage</p>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Campaigns</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            <span><span className="font-semibold text-ink">{running}</span> running{s.teamScoped ? ` for ${s.team}` : ""}</span>
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{sendsSoon}</span> send{sendsSoon === 1 ? "" : "s"} in the next 7 days</span>
            {s.isAdmin && (
              <>
                <span aria-hidden className="text-faint">·</span>
                {needs ? <span className="font-semibold text-[var(--warning)]">{needs} thing{needs === 1 ? "" : "s"} need{needs === 1 ? "s" : ""} you</span> : <span>nothing needs you</span>}
              </>
            )}
          </p>
        </div>
        <Button variant="brand" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setBuilder({ name: "", objective: objectives[0].key, fresh: true })}>New campaign</Button>
      </header>

      <nav aria-label="Campaign views" className="flex items-center gap-1 border-b border-line">
        {VIEWS.map((v) => {
          const on = view === v.id;
          return (
            <button key={v.id} onClick={() => setView(v.id)} aria-current={on ? "page" : undefined}
              className={`-mb-px min-h-[44px] border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "overview" && (
        <Overview s={s} onOpen={setOpenId} onBuild={setBuilder}
          onPlanner={(week) => { setFocus(week && clash ? { week, team: clash.team } : undefined); setView("planner"); }} />
      )}
      {view === "planner" && <Planner key={focus?.week ?? "now"} s={s} focus={focus} onOpen={setOpenId} />}
      {view === "results" && <Results s={s} onOpen={setOpenId} onRerun={rerun} />}

      <CampaignDrawer c={open} s={s} onClose={() => setOpenId(null)} onRerun={rerun} />
      <CampaignBuilder seed={builder} existing={s.all} onClose={() => setBuilder(null)} onLaunch={(c) => { s.add(c); setView("overview"); }} />
    </div>
  );
}
