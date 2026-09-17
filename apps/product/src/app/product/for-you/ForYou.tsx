"use client";
/* For you — the first thing Nudge tailors, and the reason it has a place in
   the rail. A short list of next actions, each with the reason Nudge picked
   it. Nothing here is urgent and none of it is a task list: "Not today" hides
   an item until tomorrow, and the page is allowed to be empty.

   Every suggestion is derived from something the product already knows —
   today's check-in, the tour, learning in progress, a moment worth sharing,
   the review queue — and gated by what this person can open. */
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpenCheck, ClipboardList, Compass, HeartHandshake, HeartPulse, Share2, ShieldCheck,
  Smile, UsersRound, type LucideIcon,
} from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { canAccess } from "@/lib/access";
import type { Role } from "@/lib/auth";
import { TOUR_DISMISSED_KEY, tourFor } from "@/lib/tour";
import { usePersistentState } from "@/lib/usePersistentState";
import { useTourProgress } from "../useTourProgress";
import { useViewAs } from "../useViewAs";
import { useMe } from "../useSession";
import { useModeration } from "../social/useModeration";
import { toast } from "../Toaster";

type Suggestion = {
  id: string;
  section: string;
  icon: LucideIcon;
  title: string;
  why: string;
  cta: string;
  href: string;
  /** Minutes it takes — shown so "later" is a real choice. */
  minutes?: number;
};

const today = () => new Date().toISOString().slice(0, 10);

function build(role: Role, state: {
  checkedIn: boolean; pulseDone: boolean; tourLeft: number; tourDismissed: boolean; learningDone: boolean; pendingReview: number; pendingSafety: boolean; managerDone: number;
}): Suggestion[] {
  const out: Suggestion[] = [];
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
  if (!state.learningDone) out.push({
    id: "learning", section: "iLearn", icon: BookOpenCheck, title: "Finish “Giving feedback” — two minutes left", minutes: 2,
    why: "You stopped at the last quiz. Finishing today keeps your five-day streak.",
    cta: "Continue", href: "/product/ilearn",
  });
  out.push({
    id: "amplify", section: "Amplify", icon: Share2, title: "Your onboarding win is worth sharing",
    why: "Cutting onboarding from nine days to four is the kind of post people outside the company read. Nudge has drafted it in your voice.",
    cta: "See the draft", href: "/product/amplify",
  });
  out.push({
    id: "challenge", section: "iThrive", icon: HeartPulse, title: "Day 4 of the Monsoon 10K",
    why: "You're 1,200 steps short of today's goal — about a twelve-minute walk.",
    cta: "Open iThrive", href: "/product/ithrive",
  });
  out.push({
    id: "community", section: "Social", icon: UsersRound, title: "Join Book circle", minutes: 1,
    why: "Three people on your team are in it, and October's vote closes Friday.",
    cta: "Take a look", href: "/product/social/groups/book-circle",
  });
  if (state.tourLeft > 0 && !state.tourDismissed) out.push({
    id: "tour", section: "Get Started", icon: Compass, title: `${state.tourLeft} parts of Vadal you haven't tried`,
    why: "The product tour shows each one working on your own workspace, and ticks itself off as you use them.",
    cta: "Continue the tour", href: "/product/get-started",
  });
  return out.filter((s) => canAccess(role, s.section));
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
  const { pending } = useModeration();

  if (!meta.ready || !hydrated) return <div className="mx-auto w-full max-w-[760px] py-10" aria-busy="true" />;

  const all = build(role, {
    checkedIn: Boolean(mood),
    pulseDone: surveysDone.includes("september-pulse"),
    tourLeft: tourFor(role).filter((s) => !explored.includes(s.id)).length,
    tourDismissed: tourDismissed === true,
    learningDone: growDone.length >= 3,
    pendingReview: pending.length,
    pendingSafety: pending.some((q) => q.safety),
    managerDone: mgrDone.length,
  });
  const visible = all.filter((s) => hidden[s.id] !== today());
  const quick = visible.filter((s) => (s.minutes ?? 99) <= 2).length;

  const notToday = (s: Suggestion) => {
    setHidden((h) => ({ ...h, [s.id]: today() }));
    toast("Hidden until tomorrow");
  };

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <header className="rise">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">
          <SparkMark size={14} tone="gradient" state="idle" /> Nudge
        </p>
        <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">For you, {me.name}</h1>
        <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted">
          {visible.length === 0
            ? "Nothing needs you right now."
            : `${visible.length} ${visible.length === 1 ? "thing" : "things"} worth your time today${quick ? ` — ${quick} of them take a minute or two` : ""}. None of it is urgent.`}
        </p>
      </header>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
          <SparkMark size={32} tone="gradient" state="idle" />
          <p className="text-[16px] font-semibold text-ink">You&apos;re all caught up</p>
          <p className="max-w-[360px] text-[14px] text-faint">Nudge will add something here when there&apos;s a reason to. Hidden suggestions come back tomorrow.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((s, i) => (
            <li key={s.id} className="rise card-lift rounded-[22px] border border-line bg-card p-5 sm:p-6" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--lav)] text-[var(--purple)]">
                  <s.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h2 className="text-[16px] font-bold leading-snug tracking-tight text-ink">{s.title}</h2>
                    {s.minutes && <span className="text-[12px] text-faint">{s.minutes} min</span>}
                  </div>
                  <p className="mt-1.5 flex gap-2 text-[14px] leading-relaxed text-muted">
                    <SparkMark size={14} tone="gradient" state="still" className="mt-[3px] shrink-0" />
                    <span>{s.why}</span>
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <Link href={s.href} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--purple)] px-4 text-[14px] font-semibold text-white transition hover:opacity-90 lg:min-h-[38px]">
                      {s.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button onClick={() => notToday(s)} className="min-h-[44px] rounded-full px-3 text-[14px] font-semibold text-muted transition hover:bg-soft hover:text-ink lg:min-h-[38px]">
                      Not today
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
