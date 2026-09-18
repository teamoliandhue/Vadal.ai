"use client";
/* PULSE — ask, read, and change something (Listen · Pulse v2, spec 049).

   The first build was six admin tools stacked on one page: counts, a table,
   the automatic surveys, a send plan, templates, and one thin results card.
   It helped send surveys and stopped there. Now three views, for three jobs:
   · Overview — what needs you: teams falling behind on a live survey, fixes
     that are late, an early read that's worth a look; the live surveys; and
     what we promised last time.
   · Surveys  — every survey, and the ones that run on their own.
   · Results  — the answer spread, what moves engagement, the same answers by
     team, the comments — and a "Commit to a fix" beside every weak spot.
   A follow-up ends with "You said, we did" on Social, because people answer
   the next survey when they saw the last one change something. */
import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@vadal/design-system";
import { daysBetween, type FollowUp } from "@/lib/pulse";
import { CommitDrawer, DoneDrawer, type CommitSeed } from "./FollowUps";
import { Overview } from "./Overview";
import { Results } from "./Results";
import { SurveyBuilder, type BuilderSeed } from "./SurveyBuilder";
import { SurveyDrawer, Surveys } from "./Surveys";
import { Eyebrow, pct, usePulse } from "./parts";

type View = "overview" | "surveys" | "results";
const VIEWS: { id: View; label: string }[] = [{ id: "overview", label: "Overview" }, { id: "surveys", label: "Surveys" }, { id: "results", label: "Results" }];

export function SurveysHub() {
  const s = usePulse();
  const [view, setView] = React.useState<View>("overview");
  const [resultId, setResultId] = React.useState("q3");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [builder, setBuilder] = React.useState<BuilderSeed>(null);
  const [commit, setCommit] = React.useState<CommitSeed>(null);
  const [done, setDone] = React.useState<FollowUp | null>(null);

  const top = React.useRef<HTMLDivElement>(null);
  const go = (v: View) => { setView(v); top.current?.scrollIntoView({ block: "start" }); };
  const toResults = (id: string) => { setResultId(id); go("results"); };

  if (!s.ready) return <div className="py-10" aria-busy="true" />;

  const live = s.surveys.filter((x) => x.status === "live");
  const main = live.find((x) => x.byTeam) ?? live[0];
  const open = s.followUps.filter((f) => f.status !== "done");
  const dueSoon = open.filter((f) => daysBetween(s.today, f.due) <= 7).length;

  return (
    <div ref={top} className="mx-auto flex w-full max-w-[1180px] scroll-mt-6 flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Listen</Eyebrow>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">Pulse</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            <span><span className="font-semibold text-ink">{live.length}</span> live</span>
            {main && (
              <>
                <span aria-hidden className="text-faint">·</span>
                <span><span className="font-semibold text-ink">{pct(main.responses, main.sent)}%</span> have answered {main.name}</span>
              </>
            )}
            <span aria-hidden className="text-faint">·</span>
            <span><span className="font-semibold text-ink">{open.length}</span> follow-up{open.length === 1 ? "" : "s"} open{dueSoon ? `, ${dueSoon} due this week` : ""}</span>
          </p>
        </div>
        <Button variant="brand" className="min-h-[44px] lg:min-h-0" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setBuilder({ name: "", cadence: "One-time", fresh: true })}>New survey</Button>
      </header>

      <nav aria-label="Pulse views" className="flex items-center gap-1 border-b border-line">
        {VIEWS.map((v) => {
          const on = view === v.id;
          return (
            <button key={v.id} onClick={() => go(v.id)} aria-current={on ? "page" : undefined}
              className={`-mb-px min-h-[44px] border-b-2 px-3.5 text-[14px] font-semibold transition lg:min-h-[42px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "overview" && (
        <Overview s={s} onResults={toResults} onOpen={setOpenId} onDone={setDone} onSurveys={() => go("surveys")}
          onCommit={() => setCommit({ surveyId: resultId, topic: "growth" })} />
      )}
      {view === "surveys" && <Surveys s={s} onOpen={setOpenId} />}
      {view === "results" && <Results s={s} surveyId={resultId} setSurveyId={setResultId} onCommit={setCommit} onDone={setDone} />}

      <SurveyDrawer x={openId ? s.surveys.find((x) => x.id === openId) ?? null : null} onClose={() => setOpenId(null)} onResults={toResults} />
      <CommitDrawer key={commit ? `${commit.surveyId}-${commit.topic}-${commit.audience ?? ""}` : "closed"} seed={commit} s={s} onClose={() => setCommit(null)} />
      <DoneDrawer key={done?.id ?? "closed"} f={done} s={s} onClose={() => setDone(null)} />
      <SurveyBuilder key={builder ? `${builder.key ?? "blank"}-${builder.name}` : "closed"} seed={builder} onClose={() => setBuilder(null)} onLaunch={(x) => { s.launch(x); go("overview"); }} />
    </div>
  );
}
