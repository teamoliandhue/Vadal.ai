"use client";
/* For you — the first thing Nudge tailors, and the reason it has a place in
   the rail (spec 052).

   The first build was one column of eight identical cards, each shouting at
   the same volume, with no answer to the three questions people actually have
   about a personalised list:

   · What should I do FIRST? — there is a lead now, set apart, and the rest is
     grouped by what it costs you: a minute, a few, or when you have time.
   · WHY is this here? — every card already carried its reason; the rail now
     shows the signals underneath them, in plain words, so the list is
     explainable rather than magic.
   · Where did the thing I dismissed GO? — "Not today" used to make an item
     vanish with a toast. It now sits in the rail, with the day it comes back
     and a way to bring it back sooner. "Not useful" is a separate, permanent
     answer, because the two mean different things.

   Every suggestion is still derived from something the product already knows —
   today's check-in, the tour, learning in progress, a moment worth sharing,
   the review queue — and gated by what this person can open. Nothing here is
   urgent, and the page is allowed to be empty. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpenCheck, ClipboardList, Compass, HeartHandshake, HeartPulse, Lock, Share2, ShieldCheck,
  Smile, Sprout, UsersRound,
} from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import type { Role } from "@/lib/auth";
import { growStats } from "@/lib/grow";
import { JOINED } from "@/lib/lifecycle";
import { TOUR_DISMISSED_KEY, tourFor } from "@/lib/tour";
import { usePersistentState } from "@/lib/usePersistentState";
import { useTourProgress } from "../useTourProgress";
import { useViewAs } from "../useViewAs";
import { useMe } from "../useSession";
import { useModeration } from "../social/useModeration";
import { toast } from "../Toaster";
import { RailCard, SuggestionCard, type Suggestion } from "./parts";

const today = () => new Date().toISOString().slice(0, 10);

type State = {
  joinerDay: number | null; checkedIn: boolean; pulseDone: boolean; tourLeft: number; tourDismissed: boolean;
  learningDone: boolean; pendingReview: number; pendingSafety: boolean; managerDone: number;
};

function build(role: Role, state: State): Suggestion[] {
  const out: Suggestion[] = [];
  if (state.joinerDay !== null) out.push({
    id: "first-90", section: "For you", icon: Sprout, title: `Day ${state.joinerDay} of your first 90`, minutes: 1,
    why: "Two quick questions set Vadal up around you, and your journey shows what's due this week — and whose job each part is.",
    cta: "Open your journey", href: "/product/onboard/me",
  });
  if (!state.pulseDone) out.push({
    id: "answer-pulse", section: "Home", icon: ClipboardList, title: "Answer the September pulse", minutes: 2,
    why: "It adapts to you — a good week is two questions. It closes Friday and it's anonymous.",
    cta: "Answer it", href: "/product/survey/september-pulse",
  });
  if (!state.checkedIn) out.push({
    id: "checkin", section: "Home", icon: Smile, title: "Check in for today", minutes: 1,
    why: "It's the one thing that tells your manager how the week is really going — and it takes twenty seconds.",
    cta: "Check in", href: "/product/home",
  });
  if (canAccess(role, "Social") && state.pendingReview > 0 && canAccess(role, "Settings")) out.push({
    id: "review", section: "Settings", icon: ShieldCheck, title: `${state.pendingReview} ${state.pendingReview === 1 ? "post is" : "posts are"} waiting for review`,
    why: state.pendingSafety
      ? "One of them names a hazard on the floor — worth a look before the next shift starts."
      : "Their authors can't post them until someone decides, so the wait is theirs, not yours.",
    cta: "Open Review", href: "/product/social/review",
  });
  if (canAccess(role, "Manager hub") && state.managerDone < 2) out.push({
    id: "one-to-ones", section: "Manager hub", icon: UsersRound, title: "Two people haven't had a 1:1 in six weeks",
    why: "Both have a falling check-in trend. A 1:1 this week is the most useful thing on your list.",
    cta: "Plan the 1:1s", href: "/product/managers",
  });
  if (canAccess(role, "Pulse")) out.push({
    id: "pulse-wave", section: "Pulse", icon: ClipboardList, title: "The September pulse closes Friday — 71% have answered",
    why: "Night shift is at 48%. A reminder in their language usually adds fifteen points.",
    cta: "See who hasn't answered", href: "/product/pulse",
  });
  out.push({
    id: "kudos", section: "Kudos", icon: HeartHandshake, title: "Thank Neha for the onboarding flow", minutes: 1,
    why: "She shipped it early and three people on your team mentioned it this week. Nobody has said thanks yet.",
    cta: "Give kudos", href: "/product/kudos",
  });
  if (state.joinerDay !== null) out.push({
    id: "welcome-course", section: "iLearn", icon: BookOpenCheck, title: "Start “Welcome to Oli&Hue”", minutes: 6,
    why: "Four short parts on how the company works. Everyone does it in their first three weeks, a part at a time.",
    cta: "Start part one", href: "/product/ilearn",
  });
  // A joiner has no streak to keep, no win to share and no challenge underway.
  const joiner = state.joinerDay !== null;
  if (!joiner && !state.learningDone) out.push({
    id: "learning", section: "iLearn", icon: BookOpenCheck, title: "Finish “Giving feedback” — two minutes left", minutes: 2,
    why: "You stopped at the last quiz. Finishing today keeps your five-day streak.",
    cta: "Continue", href: "/product/ilearn",
  });
  if (!joiner) out.push({
    id: "amplify", section: "Amplify", icon: Share2, title: "Your onboarding win is worth sharing", minutes: 3,
    why: "Cutting onboarding from nine days to four is the kind of post people outside the company read. Nudge has drafted it in your voice.",
    cta: "See the draft", href: "/product/amplify",
  });
  if (!joiner) out.push({
    id: "challenge", section: "iThrive", icon: HeartPulse, title: "Day 4 of the Monsoon 10K", minutes: 1,
    why: "You're 1,200 steps short of today's goal — about a twelve-minute walk.",
    cta: "Open iThrive", href: "/product/ithrive",
  });
  out.push({
    id: "community", section: "Social", icon: UsersRound, title: "Join Book circle", minutes: 1,
    why: "Three people on your team are in it, and October's vote closes Friday.",
    cta: "Take a look", href: "/product/social/groups/book-circle",
  });
  if (state.tourLeft > 0 && !state.tourDismissed) out.push({
    id: "tour", section: "Get Started", icon: Compass, title: `${state.tourLeft} parts of Vadal you haven't tried`, minutes: 4,
    why: "The product tour shows each one working on your own workspace, and ticks itself off as you use them.",
    cta: "Continue the tour", href: "/product/get-started",
  });
  return out.filter((s) => canAccess(role, s.section));
}

/* The signals the list was built from, said out loud. A personalised page that
   cannot explain itself is a page people quietly stop trusting. */
function signals(state: State, streak: number): string[] {
  const out: string[] = [];
  out.push(state.checkedIn ? "You checked in today" : "You haven't checked in today");
  if (streak > 1) out.push(`${streak} days of check-ins in a row`);
  out.push(state.pulseDone ? "You answered the September pulse" : "The September pulse is still open to you");
  if (state.joinerDay !== null) out.push(`You're on day ${state.joinerDay} of your first 90`);
  else out.push(state.learningDone ? "Your learning is up to date" : `A course is ${growStats.streak > 0 ? "part-finished" : "waiting"} in iLearn`);
  if (state.tourLeft > 0) out.push(`${state.tourLeft} parts of the tour untouched`);
  return out.slice(0, 5);
}

export function ForYou() {
  const [role, , meta] = useViewAs();
  const me = useMe();
  const { explored, hydrated } = useTourProgress();
  const [mood] = usePersistentState<{ mood: string } | null>("vadal:mood", null);
  const [tourDismissed] = usePersistentState<boolean>(TOUR_DISMISSED_KEY, false);
  const [growDone] = usePersistentState<string[]>("vadal:grow-done", []);
  const [mgrDone] = usePersistentState<string[]>("vadal:mgr-actions-done", []);
  const [surveysDone] = usePersistentState<string[]>("vadal:surveys-done", []);
  const [hidden, setHidden] = usePersistentState<Record<string, string>>("vadal:for-you-hidden", {});
  const [never, setNever] = usePersistentState<string[]>("vadal:for-you-never", []);
  const [order, setOrder] = usePersistentState<"matters" | "quickest">("vadal:for-you-order", "matters");
  const { pending } = useModeration();

  if (!meta.ready || !hydrated) return <div className="mx-auto w-full max-w-[1180px] py-10" aria-busy="true" />;

  const state: State = {
    joinerDay: me.email && JOINED[me.email] ? JOINED[me.email].day : null,
    checkedIn: Boolean(mood),
    pulseDone: surveysDone.includes("september-pulse"),
    tourLeft: tourFor(role).filter((s) => !explored.includes(s.id)).length,
    tourDismissed: tourDismissed === true,
    learningDone: growDone.length >= 3,
    pendingReview: pending.length,
    pendingSafety: pending.some((q) => q.safety),
    managerDone: mgrDone.length,
  };

  const all = build(role, state).filter((s) => !never.includes(s.id));
  const sleeping = all.filter((s) => hidden[s.id] === today());
  const awake = all.filter((s) => hidden[s.id] !== today());
  const sorted = order === "quickest" ? [...awake].sort((a, b) => (a.minutes ?? 99) - (b.minutes ?? 99)) : awake;
  const [lead, ...rest] = sorted;
  const quick = awake.filter((s) => (s.minutes ?? 99) <= 2).length;
  const streak = me.streak + (mood ? 1 : 0);

  const GROUPS: { key: string; label: string; hint: string; has: (s: Suggestion) => boolean }[] = [
    { key: "minute", label: "Takes a minute", hint: "Two minutes or less, start to finish", has: (s) => (s.minutes ?? 99) <= 2 },
    { key: "few", label: "A few minutes", hint: "Worth sitting down for", has: (s) => (s.minutes ?? 99) > 2 && (s.minutes ?? 99) <= 6 },
    { key: "when", label: "When you have time", hint: "No hurry, and no reminder", has: (s) => (s.minutes ?? 99) > 6 },
  ];

  const later = (s: Suggestion) => {
    setHidden((h) => ({ ...h, [s.id]: today() }));
    toast("Back tomorrow — it's in “Not today” on the right");
  };
  const nope = (s: Suggestion) => {
    setNever((n) => [...n, s.id]);
    toast("Noted — Nudge won't suggest that again");
  };
  const wake = (s: Suggestion) => {
    setHidden((h) => { const next = { ...h }; delete next[s.id]; return next; });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">
            <SparkMark size={14} tone="gradient" state="idle" /> Nudge
          </p>
          <h1 className="mt-2 text-[clamp(28px,3.2vw,38px)] font-bold leading-[1.05] tracking-[-0.03em]">For you, {me.name}</h1>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
            {awake.length === 0 ? <span>Nothing needs you right now.</span> : (
              <>
                <span><span className="font-semibold text-ink">{awake.length}</span> {awake.length === 1 ? "thing" : "things"} worth your time</span>
                {quick > 0 && <><span aria-hidden className="text-faint">·</span><span><span className="font-semibold text-ink">{quick}</span> take a minute or two</span></>}
                <span aria-hidden className="text-faint">·</span><span>none of it is urgent</span>
              </>
            )}
          </p>
        </div>
        {awake.length > 1 && (
          <div role="group" aria-label="Order" className="flex rounded-full border border-line bg-soft p-1">
            {([["matters", "What matters"], ["quickest", "Quickest first"]] as const).map(([k, label]) => (
              <button key={k} onClick={() => setOrder(k)} aria-pressed={order === k}
                className={`min-h-[44px] rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[34px] ${order === k ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:items-start">
        {/* ── the list ── */}
        <div className="flex flex-col gap-6">
          {awake.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[24px] border border-dashed border-line px-6 py-16 text-center">
              <SparkMark size={32} tone="gradient" state="idle" />
              <p className="mt-2 text-[17px] font-semibold text-ink">You&apos;re all caught up</p>
              <p className="max-w-[380px] text-[15px] leading-relaxed text-faint">
                Nudge adds something here when there&apos;s a reason to. {sleeping.length > 0 ? "What you hid comes back tomorrow." : "Not before."}
              </p>
            </div>
          ) : (
            <>
              <SuggestionCard s={lead} lead onLater={later} onNever={nope} />

              {GROUPS.map((g) => {
                const items = rest.filter(g.has);
                if (items.length === 0) return null;
                return (
                  <section key={g.key} aria-labelledby={`g-${g.key}`} className="flex flex-col gap-3">
                    <div>
                      <h2 id={`g-${g.key}`} className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
                        {g.label}
                        <span className="rounded-full bg-soft px-1.5 py-px text-[11px] tracking-normal tabular-nums text-muted">{items.length}</span>
                      </h2>
                      <p className="mt-0.5 text-[13px] text-faint">{g.hint}</p>
                    </div>
                    {items.map((s) => <SuggestionCard key={s.id} s={s} onLater={later} onNever={nope} />)}
                  </section>
                );
              })}
            </>
          )}
        </div>

        {/* ── the rail ── */}
        <div className="flex flex-col gap-4 xl:sticky xl:top-4">
          <RailCard title="Your week" hint="Yours only — none of this is a score anyone else sees.">
            <ul className="flex flex-col divide-y divide-[var(--line)]">
              {[
                ["Check-in streak", streak > 0 ? `${streak} ${streak === 1 ? "day" : "days"}` : "Not yet this week"],
                ["September pulse", state.pulseDone ? "Answered" : "Still open"],
                ["Learning streak", `${growStats.streak} ${growStats.streak === 1 ? "day" : "days"}`],
                ["Tour", state.tourLeft === 0 ? "All explored" : `${state.tourLeft} left`],
              ].map(([k, v]) => (
                <li key={k} className="flex items-baseline justify-between gap-3 py-2.5">
                  <span className="text-[14px] text-muted">{k}</span>
                  <span className="text-[15px] font-semibold tabular-nums text-ink">{v}</span>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard title="Why these, today" hint="The signals this list was built from.">
            <ul className="flex flex-col gap-2">
              {signals(state, streak).map((s) => (
                <li key={s} className="flex gap-2 text-[14px] leading-snug text-muted">
                  <SparkMark size={12} tone="gradient" state="still" className="mt-[4px] shrink-0" />{s}
                </li>
              ))}
            </ul>
            <p className="mt-3.5 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-snug text-faint">
              <Lock className="mt-[2px] h-3.5 w-3.5 shrink-0" />
              Nudge only uses what you can already see. Your check-ins stay yours, and nothing here is sent to your manager.
            </p>
          </RailCard>

          {sleeping.length > 0 && (
            <RailCard title="Not today" hint="Back tomorrow, unless you want them sooner.">
              <ul className="flex flex-col divide-y divide-[var(--line)]">
                {sleeping.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 text-[14px] leading-snug text-muted">{s.title}</span>
                    <button onClick={() => wake(s)} className="min-h-[44px] shrink-0 rounded-full px-2.5 text-[14px] font-semibold text-[var(--purple)] transition hover:bg-soft lg:min-h-[36px]">Bring back</button>
                  </li>
                ))}
              </ul>
            </RailCard>
          )}

          {never.length > 0 && (
            <RailCard title="Muted" hint={`${never.length} ${never.length === 1 ? "suggestion" : "suggestions"} you told Nudge to stop making.`}>
              <button onClick={() => { setNever([]); toast("Unmuted — they can come back"); }}
                className="min-h-[44px] rounded-full border border-line px-3.5 text-[14px] font-semibold text-muted transition hover:border-[var(--purple)] hover:text-ink lg:min-h-[38px]">
                Unmute all
              </button>
            </RailCard>
          )}

          <RailCard title="Nothing here is a task list" hint="Vadal never counts what you skipped.">
            <Link href="/product/get-started" className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
              See what else Vadal does <ArrowRight className="h-4 w-4" />
            </Link>
          </RailCard>
        </div>
      </div>
    </div>
  );
}
