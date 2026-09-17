"use client";
/* Health leaderboards — walking, running, swimming (roadmap v2).

   Three rules, all visible on the card:
   · Opt-in. Off by default, using the same consent pattern as the wellbeing
     check: a stored value that is not literally true means "no". Until you opt
     in you still see your own place — privately — and nobody else sees you.
   · Role-aware. Walking uses fair cohorts, so a shift's steps never compete
     with a desk worker's walk. Running and swimming aren't anyone's job.
   · Never points. Ranked by the activity itself, in both points modes. */
import * as React from "react";
import { Footprints, Lock, Waves, Zap } from "lucide-react";
import { Badge, Switch } from "@vadal/design-system";
import type { Cohort } from "@/lib/ai/engines/wellbeing";
import { leaderboardOptIn, runningBoard, swimmingBoard, type BoardEntry } from "@/lib/thrive";
import { usePersistentState } from "@/lib/usePersistentState";
import { Cohorts } from "./Cohorts";
import { Card, Eyebrow } from "./parts";
import { toast } from "../Toaster";

type Sport = "walking" | "running" | "swimming";
const SPORTS: { id: Sport; label: string; icon: typeof Footprints; unit: string; basis: string }[] = [
  { id: "walking", label: "Walking", icon: Footprints, unit: "steps a day", basis: "Grouped with people whose work moves them about as much as yours does." },
  { id: "running", label: "Running", icon: Zap, unit: "km this week", basis: "Everyone together — running isn't part of anyone's job." },
  { id: "swimming", label: "Swimming", icon: Waves, unit: "m this week", basis: "Everyone together, metres swum this week." },
];

function Board({ rows, me, meIn, fmt }: { rows: BoardEntry[]; me?: string; meIn: boolean; fmt: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => r.value));
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  return (
    <ul className="flex flex-col gap-1.5">
      {sorted.map((r, i) => {
        const isMe = r.email === me;
        const shown = isMe ? (meIn ? "You" : "You · only you see this") : r.optedIn ? r.name : "A colleague";
        return (
          <li key={r.email} className={`flex items-center gap-2.5 rounded-lg py-1 ${isMe ? "-mx-1.5 bg-soft px-1.5" : ""}`}>
            <span className="w-4 shrink-0 text-[12px] font-semibold tabular-nums text-faint">{i + 1}</span>
            <span className="w-[132px] shrink-0 truncate text-[13px]">
              <span className={isMe ? "font-semibold text-ink" : "text-ink"}>{shown}</span>
              <span className="block truncate text-[11px] leading-tight text-faint">{r.team}</span>
            </span>
            <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-soft">
              <span className="absolute inset-y-0 left-0 rounded-r-full" style={{ width: `${(r.value / max) * 100}%`, background: isMe ? "var(--client-brand, var(--purple))" : "color-mix(in srgb, var(--muted) 34%, transparent)" }} />
            </span>
            <span className="w-[54px] shrink-0 text-right text-[12px] font-semibold tabular-nums text-muted">{fmt(r.value)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Leaderboards({ cohorts, myCohort, myEmail }: { cohorts: Cohort[]; myCohort?: Cohort; myEmail?: string }) {
  const [sport, setSport] = React.useState<Sport>("walking");
  const [optRaw, setOpt] = usePersistentState<boolean>("vadal:leaderboard-consent", false);
  const optedIn = optRaw === true;
  const S = SPORTS.find((s) => s.id === sport)!;
  const isVisible = (email: string) => (email === myEmail ? optedIn : leaderboardOptIn[email] === true);

  const rows = (sport === "running" ? runningBoard : swimmingBoard).map((r) => (r.email === myEmail ? { ...r, optedIn } : r));
  const myPlace = sport === "walking" ? null : [...rows].sort((a, b) => b.value - a.value).findIndex((r) => r.email === myEmail) + 1;

  const seg = (on: boolean) => `flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition lg:min-h-[34px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>Leaderboards</Eyebrow>
          <p className="mt-1 text-[14px] text-muted">{S.basis}</p>
        </div>
        <div role="group" aria-label="Activity" className="flex rounded-full bg-soft p-1">
          {SPORTS.map((s) => (
            <button key={s.id} className={seg(sport === s.id)} aria-pressed={sport === s.id} onClick={() => setSport(s.id)}>
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-4 flex flex-wrap items-center gap-3 rounded-2xl p-3.5 ${optedIn ? "bg-soft" : "border border-dashed border-line"}`}>
        {!optedIn && <Lock className="h-4 w-4 shrink-0 text-faint" />}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink">{optedIn ? "You're on the leaderboards" : "You're not on the leaderboards"}</p>
          <p className="text-[12px] text-muted">
            {optedIn
              ? "Colleagues see your name and your numbers here. Turn it off any time — you disappear straight away."
              : myPlace ? `You'd be ${myPlace}${["st", "nd", "rd"][myPlace - 1] ?? "th"} in ${S.label.toLowerCase()}. Only you can see that.` : "Only you can see your place. Nobody sees your activity unless you opt in."}
          </p>
        </div>
        <Switch
          checked={optedIn}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOpt(e.target.checked); toast(e.target.checked ? "You're on the leaderboards" : "Removed from the leaderboards"); }}
          label="Show me"
        />
      </div>

      <div className="mt-5">
        {sport === "walking" ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[12px] text-faint">{S.unit} · grouped fairly</span>
              {myCohort && <Badge tone="brand" variant="soft" size="sm">{myCohort.name}</Badge>}
            </div>
            <Cohorts bare cohorts={cohorts} myCohort={myCohort} myEmail={myEmail} isVisible={isVisible} />
          </>
        ) : (
          <>
            <p className="mb-3 text-[12px] text-faint">{S.unit}</p>
            <Board rows={rows} me={myEmail} meIn={optedIn} fmt={(v) => (sport === "running" ? v.toFixed(1) : v.toLocaleString("en-US"))} />
          </>
        )}
      </div>

      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-snug text-faint">
        Ranked by the activity itself, never by points. People who haven&apos;t opted in appear as “a colleague”; their numbers count, their names don&apos;t show.
      </p>
    </Card>
  );
}
