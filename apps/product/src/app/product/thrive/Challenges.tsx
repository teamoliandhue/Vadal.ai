"use client";
/* ══════════════════════ challenges ══════════════════════
   Three bordered rectangles with a Join button, and for the one you had
   ALREADY JOINED it said "Joined" and nothing else.

   That is the defect: the substance of a challenge is the daily result, and a
   challenge with no progress on it is a signup form. So the one you are in is
   pulled out and given the space — a day-by-day strip, where you sit, and what
   it has actually changed. The ones you are not in stay compact, because
   browsing is a smaller job than doing.

   The three also looked identical, which made "Monsoon 10K" and "Ride to work"
   read as the same thing. Each kind carries its own hue and mark now. */
import * as React from "react";
import { Footprints, Mountain, Bike, Trophy, Users } from "lucide-react";
import { Button } from "@vadal/design-system";
import { StreakStrip } from "@/components/charts";
import { CHALLENGE_TONE, challengeProgress, challenges, type Challenge } from "@/lib/thrive";
import { Card, Eyebrow } from "./parts";
import { toast } from "../Toaster";

const KIND_ICON: Record<Challenge["kind"], React.ElementType> = {
  steps: Footprints,
  "active-minutes": Mountain,
  distance: Bike,
};

export function Challenges({
  joined, setJoined,
}: { joined: string[]; setJoined: (f: (j: string[]) => string[]) => void }) {
  const mine = challenges.find((c) => joined.includes(c.id));
  const rest = challenges.filter((c) => c !== mine);

  const toggle = (c: Challenge) => {
    const isIn = joined.includes(c.id);
    setJoined((j) => (isIn ? j.filter((x) => x !== c.id) : [...j, c.id]));
    toast(isIn ? `Left ${c.name}` : `Joined ${c.name} 🎉`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── the one you're actually in ── */}
      {mine && mine.id === challengeProgress.id && (
        <ActiveChallenge challenge={mine} onLeave={() => toggle(mine)} />
      )}

      {rest.length > 0 && (
        <Card>
          <Eyebrow>{mine ? "Also running" : "Challenges"}</Eyebrow>
          <ul className="mt-3.5 flex flex-col gap-2.5">
            {rest.map((c) => {
              const tone = CHALLENGE_TONE[c.kind];
              const Icon = KIND_ICON[c.kind];
              const isIn = joined.includes(c.id);
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-3.5 transition hover:bg-soft/50">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: `color-mix(in srgb, ${tone.hue} 12%, transparent)`, color: tone.hue }}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug">{c.name}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted">{c.blurb}</p>
                    <p className="mt-1 text-[12px] text-faint">
                      {c.participants.toLocaleString()} taking part · ends in {c.endsIn} days
                    </p>
                  </div>
                  <Button size="sm" variant={isIn ? "tertiary" : "secondary"} className="min-h-[44px] lg:min-h-0"
                    onClick={() => toggle(c)}>
                    {isIn ? "Joined" : "Join"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ActiveChallenge({ challenge, onLeave }: { challenge: Challenge; onLeave: () => void }) {
  const p = challengeProgress;
  const tone = CHALLENGE_TONE[challenge.kind];
  const Icon = KIND_ICON[challenge.kind];

  const played = p.days.length;
  const hits = p.days.filter((d) => d >= p.target).length;
  const avg = Math.round(p.days.reduce((a, b) => a + b, 0) / played);
  const lift = Math.round(((avg - p.baselineDaily) / p.baselineDaily) * 100);
  const left = p.totalDays - played;

  return (
    <section
      className="card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7"
      style={{ boxShadow: "0 1px 2px rgba(20,20,40,0.04), 0 18px 42px -26px rgba(20,20,40,0.22)" }}
    >
      {/* A hairline in the challenge's own hue — this card belongs to it. */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: tone.hue }} />

      <div className="flex flex-wrap items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${tone.hue} 13%, transparent)`, color: tone.hue }}
        >
          <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <Eyebrow>You&apos;re in this one</Eyebrow>
          <h3 className="mt-1 text-[19px] font-bold leading-tight tracking-[-0.015em]">{challenge.name}</h3>
        </div>
        <button
          onClick={onLeave}
          className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-faint transition hover:bg-soft hover:text-ink lg:min-h-[36px]"
        >
          Leave
        </button>
      </div>

      {/* The day-by-day shape — the thing a challenge actually is. */}
      <StreakStrip
        className="mt-5"
        values={p.days}
        target={p.target}
        totalDays={p.totalDays}
        hue={tone.hue}
      />

      {/* What it has changed, which is the reason to stay in it. Weight contrast
          rather than three equal numbers: the lift is the headline. */}
      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-line pt-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums" style={{ color: tone.hue }}>
              +{lift}%
            </span>
          </div>
          <p className="mt-1.5 max-w-[22ch] text-[13px] leading-snug text-muted">
            on your usual day since you joined — {avg.toLocaleString()} against {p.baselineDaily.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Trophy className="h-3.5 w-3.5 text-faint" />
          #{p.rank} of {challenge.participants.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Users className="h-3.5 w-3.5 text-faint" />
          {left} days left
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-snug text-muted">
        {hits > played / 2
          ? `You're clearing it more often than not. ${left} days to hold that.`
          : `The days you clear it are the days you walk somewhere. ${left} left to find a few more of them.`}
      </p>
    </section>
  );
}
