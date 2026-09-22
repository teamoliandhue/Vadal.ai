"use client";
/* Home's view layer.

   This is a client component for one specific reason: the first-run preview is
   driven by ?view=new, and awaiting the server-side `searchParams` promise made
   the segment dynamic — against this route's loading.tsx boundary that hydrated
   to a blank tree, so Home silently rendered nothing. Reading the query with
   useSearchParams here fixes it and keeps the preview working. The greeting is
   still computed on the server and passed in, so there is no hydration mismatch
   on the one string that depends on the clock. (Same defect and same fix as
   /product/analytics.) */
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Award, Check, Clock, Gift, Heart, Trophy } from "lucide-react";
import { Avatar, Badge, Button, Trend } from "@vadal/design-system";
import { Sparkline } from "@/components/charts";
import { me, myRecognition, communities, engagementTrend, myCalendar } from "@/lib/data";
import { BADGES, MY_RECOGNITION } from "@/lib/points";
import { useWallet } from "../kudos/useWallet";
import { usePoints } from "../usePointsMode";
import { MoodCheck } from "./MoodCheck";
import { MyDay } from "./MyDay";
import { TourResume } from "../get-started/TourResume";
import { QuickPoll } from "./QuickPoll";
import { Feed } from "./Feed";
import { AskAi } from "./AskAi";
import { HomeBrandLayer, VadalBadge } from "./HomeBrandLayer";
import { CalendarCard } from "./CalendarCard";
import { HooksCard } from "./HooksCard";
import { ViewAsSwitch, ManagerSnapshot } from "./HomeRole";
import { MyFirstName, MyIdentityHeader } from "./Identity";
import { WidgetBoard, type WidgetDef } from "./WidgetBoard";
import { LastWeekWidget, WeekAheadWidget, WhatsNewWidget, YesterdayWidget } from "./Digest";
import type { Role } from "@/lib/auth";
import { orderHome, type HomeSection } from "@/lib/ai/engines/personalize";
import { useProfile } from "../useProfile";
import { useViewAs } from "../useViewAs";
import { usePersistentState } from "@/lib/usePersistentState";
import { canAccess } from "@/lib/access";
import { waitingFor, waitingNote } from "@/lib/home";

const MGR: Role[] = ["manager", "admin", "superadmin"];

/* Home opens on the digest (read-only except the check-in above). Everything
   else is in the library, one tap from "Customise".

   The default ORDER is the person's, from orderHome() over their profile: a
   line operator on a shared phone gets announcements (What's new) first, a
   manager gets their team first, someone who checked in "Struggling" is not
   greeted with a numbers tile. The person's own arrangement, once they make
   one, always wins. */
const SECTION_TO_WIDGET: Partial<Record<HomeSection, string>> = {
  team: "manager", announcements: "whatsnew", myday: "ahead", calendar: "ahead", feed: "yesterday", recognition: "lastweek",
};
function defaultLayoutFor(sections: HomeSection[]) {
  /* Learning has no widget of its own — Daily hooks carries today's lesson. It
     joins the default board only when the profile puts learning in its first
     three (a joiner told the setup assistant they want it), so nobody else's
     Home changes. */
  const learningFirst = sections.slice(0, 3).includes("learning");
  const order = [...new Set(sections.map((s) => (s === "learning" && learningFirst ? "hooks" : SECTION_TO_WIDGET[s])).filter((x): x is string => Boolean(x)))];
  for (const id of ["yesterday", "ahead", "lastweek", "whatsnew"]) if (!order.includes(id)) order.push(id);
  /* The first widget leads the left column (it is also first on a phone);
     the numbers and news widgets otherwise sit on the right. */
  const [lead, ...rest] = order;
  const sideways = (id: string) => id === "lastweek" || id === "whatsnew";
  return { left: [lead, ...rest.filter((id) => !sideways(id))], right: rest.filter(sideways) };
}

function widgetsFor(firstTime: boolean): Record<string, WidgetDef> {
  return {
    yesterday: { title: "Yesterday", emoji: "🌙", desc: "What happened while you were away — kudos, your communities, milestones.", render: () => <YesterdayWidget /> },
    ahead: { title: "Your week ahead", emoji: "🗓️", desc: "Meetings, deadlines and events for the next seven days.", render: () => <WeekAheadWidget /> },
    lastweek: { title: "Last week", emoji: "📈", desc: "Your week in short: check-ins, kudos, learning, your team's pulse.", render: () => <LastWeekWidget /> },
    whatsnew: { title: "What's new", emoji: "✨", desc: "Policies, campaigns, new communities and what's new in Vadal.", render: () => <WhatsNewWidget /> },
    manager: { title: "Team snapshot", emoji: "👥", desc: "Your team's health and who needs you this week.", roles: MGR, render: () => <ManagerSnapshot /> },
    myday: { title: "My day", emoji: "✅", desc: "Today's to-dos, which you can tick off here.", render: () => <MyDay empty={firstTime} /> },
    calendar: { title: "Today's calendar", emoji: "📅", desc: "Your meetings today, from your calendar.", render: () => <CalendarCard /> },
    you: { title: "You", emoji: "🏅", desc: "Your streak, badges and engagement trend.", render: () => <YouCard firstTime={firstTime} /> },
    hooks: { title: "Daily hooks", emoji: "⌚", desc: "Steps, daily learning and visitor passes.", render: () => <HooksCard /> },
    poll: { title: "Quick poll", emoji: "🗳️", desc: "The one-question poll of the day.", render: () => <QuickPoll className="card-lift" firstTime={firstTime} /> },
    kudos: { title: "Kudos", emoji: "💜", desc: "Recognition you received, and a way to give some.", render: () => <RecognitionCard firstTime={firstTime} /> },
    communities: { title: "Communities", emoji: "🏃", desc: "The rooms you're in and what's active.", render: () => <CommunitiesCard /> },
    ask: { title: "Ask Nudge", emoji: "💬", desc: "Ask anything about work, policy or your team.", render: () => <AskAi /> },
    feed: { title: "Social feed", emoji: "📰", desc: "The latest from the company feed.", render: () => <Feed empty={firstTime} showMore /> },
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

/** Home counts the work once. The hero and the list read the same rows, and the
    same "Not now" dismissals, so they cannot disagree the way the greeting and
    the check-in streak used to. */
function useWaiting(firstTime = false) {
  const [role] = useViewAs();
  const [done, setDone] = usePersistentState<string[]>("vadal:home-waiting-done", []);
  /* A joiner on day one owes nobody a compliance refresher. The first-run Home
     shows the empty state and fills as the week starts. */
  const items = firstTime ? [] : waitingFor(role, done).filter((w) => canAccess(role, w.section));
  return { items, dismiss: (id: string) => setDone((d) => [...d, id]) };
}

export function HomeContent({ greeting, today }: { greeting: string; today: string }) {
  // Home §1–7: client-brand band, conversational mood, calendar, hooks, view-as role.
  const firstTime = useSearchParams().get("view") === "new";
  const profile = useProfile();
  /* One copy of the list, shared: two useWaiting() calls would keep two copies
     of the dismissals and disagree the moment someone pressed "Not now". */
  const waiting = useWaiting(firstTime);
  return (
    <>
      <RitualHero firstTime={firstTime} greeting={greeting} today={today} waiting={waiting.items.length} />
      {/* What used to be nine product tiles with a number on each. The sidebar
          already lists the modules; this is the work. */}
      <WaitingOnYou firstTime={firstTime} waiting={waiting} />
      <TourResume />
      <WidgetBoard widgets={widgetsFor(firstTime)} defaults={defaultLayoutFor(orderHome(profile))} />
    </>
  );
}

/* ── Waiting on you — the short list, straight under the greeting ── */
function WaitingOnYou({ firstTime, waiting }: { firstTime: boolean; waiting: ReturnType<typeof useWaiting> }) {
  const { items, dismiss } = waiting;

  return (
    <section aria-labelledby="waiting-h" className="mt-6 card-lift relative overflow-hidden rounded-[26px] border border-line bg-card p-6 sm:p-7">
      <span aria-hidden className="ai-grad absolute inset-x-0 top-0 h-[2px] opacity-70" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow>Waiting on you</Eyebrow>
          <h2 id="waiting-h" className="mt-1.5 text-[18px] font-bold tracking-tight">{items.length === 0 ? "Nothing is waiting" : `${items.length} to finish`}</h2>
        </div>
        <Link href="/product/for-you" className="flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-[var(--purple)] transition hover:gap-1.5 lg:min-h-0">
          For you <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-8 text-center">
          <Check className="h-6 w-6 text-faint" aria-hidden />
          <p className="text-[15px] font-semibold text-ink">{firstTime ? "Nothing yet" : "All clear"}</p>
          <p className="max-w-[420px] text-[14px] leading-relaxed text-muted">
            {firstTime ? "Things you need to finish will land here as your first week starts." : "Nothing is yours to finish today. The rest of Home is news, not work."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {items.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-1 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink">
                  {w.title}
                  {w.late && <Badge tone="warning" size="sm">Overdue</Badge>}
                </p>
                <p className="mt-0.5 text-[13px] text-faint">{w.meta}{w.takes ? ` · ${w.takes}` : ""}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={w.href}>
                  <Button variant="secondary" size="sm" className="min-h-[44px] lg:min-h-[36px]">{w.action}</Button>
                </Link>
                <button
                  onClick={() => dismiss(w.id)}
                  className="min-h-[44px] rounded-full px-3 text-[13px] font-semibold text-muted transition hover:bg-soft hover:text-ink lg:min-h-[36px]"
                >
                  Not now
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[13px] text-faint">{waitingNote}</p>
    </section>
  );
}

/* ── 1 · Ritual hero — greeting + mood, with a focal "Up next" ── */
function RitualHero({ firstTime, greeting, today, waiting }: { firstTime: boolean; greeting: string; today: string; waiting: number }) {
  const upNext = myCalendar.find((e) => e.now) ?? myCalendar.find((e) => e.prep) ?? myCalendar[0];
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)]">
      <HomeBrandLayer />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-7 pt-5 sm:px-9">
        <ViewAsSwitch />
        <VadalBadge />
      </div>
      <div className="relative grid gap-8 px-7 pb-7 pt-4 sm:px-9 sm:pb-9 lg:grid-cols-[1.25fr_0.85fr] lg:items-start lg:gap-12">
        <div>
          <Eyebrow>{today}</Eyebrow>
          <h1 className="mt-3 text-[clamp(30px,4.4vw,46px)] font-bold leading-[1.03] tracking-[-0.025em]">
            {firstTime ? "Welcome" : greeting}, <MyFirstName /> <span aria-hidden>👋</span>
          </h1>
          {/* The streak lives in the check-in card, and only there — the two of
              them disagreed by a day for as long as both printed it. */}
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">
            {firstTime ? (
              <>Let’s set up your day — start with a quick mood check-in. We’ll fill the rest as you go.</>
            ) : (
              waiting === 0
                ? <>Nothing is waiting on you today. The rest of Home is news, not work.</>
                : <><b className="font-semibold text-ink">{waiting} thing{waiting === 1 ? "" : "s"}</b> {waiting === 1 ? "is" : "are"} waiting on you today. Nothing else here needs doing.</>
            )}
          </p>
          {!firstTime && (
            <Link href="/product/for-you" className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[var(--purple)] transition hover:gap-2 lg:min-h-0">
              See the whole day in For you <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="lg:border-l lg:border-line lg:pl-12">
          <MoodCheck firstTime={firstTime} />
        </div>
      </div>
      {!firstTime && (
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line bg-soft px-7 py-4 sm:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--lav)] text-[var(--purple)]">
              <Clock className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Eyebrow>Up next</Eyebrow>
                <span className="flex items-center gap-1 text-[12px] font-medium text-faint"><span aria-hidden>📅</span> Google Calendar</span>
              </div>
              <p className="truncate text-[14px] font-semibold">
                {upNext.title} <span className="font-normal text-faint">· {upNext.time} · {upNext.with}</span>
              </p>
            </div>
          </div>
          <Button variant="brand" size="sm" className="min-h-[44px] lg:min-h-0">{upNext.now ? "Join" : upNext.prep ? "Prep" : "View"}</Button>
        </div>
      )}
    </header>
  );
}

/* ── 2 · You — personal panel with a narrative engagement trend ── */
function YouCard({ className = "", firstTime = false }: { className?: string; firstTime?: boolean }) {
  const es = engagementTrend.series;
  const engScore = es[es.length - 1];
  const engDelta = engScore - es[es.length - 4];
  /* With points off there is no balance or rank to show — recognition and badges carry it. */
  const points = usePoints();
  const { balance } = useWallet();
  const stats: [React.ReactNode, string][] = firstTime
    ? [["0", points ? "Points" : "Kudos"], ["0", "Day streak"], ["0", "Badges"]]
    : points
      ? [[balance.toLocaleString(), "Points"], [me.streak, "Day streak"], [BADGES.filter((b) => b.earned).length, "Badges"]]
      : [[MY_RECOGNITION.received30d, "Kudos · 30d"], [me.streak, "Day streak"], [BADGES.filter((b) => b.earned).length, "Badges"]];
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <MyIdentityHeader />

      <div className="mt-6 grid grid-cols-3 divide-x divide-line">
        {stats.map(([value, label]) => (
          <div key={label} className="px-2 text-center first:pl-0 last:pr-0">
            <div className="text-[22px] font-bold tracking-tight">{value}</div>
            <div className="mt-0.5 text-[12px] text-faint">{label}</div>
          </div>
        ))}
      </div>

      {firstTime ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-4 text-center">
          <p className="text-[14px] font-semibold">Your engagement insights appear after your first week 📈</p>
          <p className="mt-1 text-[14px] text-faint">Check in daily and recognise teammates to get started.</p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <Eyebrow>Your engagement</Eyebrow>
            <span className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold tracking-tight">{engScore}</span>
              <Trend direction={engDelta >= 0 ? "up" : "down"} value={String(Math.abs(engDelta))} />
            </span>
          </div>
          <Sparkline values={engagementTrend.series} benchmark={engagementTrend.benchmark} color="#6d5df0" id="you-eng" height={42} className="mt-2.5" />
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-faint">
            <span className="flex items-center gap-1.5"><span className="h-[2px] w-4 rounded-full bg-[#6d5df0]" /> You</span>
            <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-faint" /> Benchmark</span>
          </div>
          <p className="mt-2 text-[14px] leading-snug text-faint">{engagementTrend.insight}</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-soft p-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold">
          <Award className="h-4 w-4 text-[var(--purple)]" /> {firstTime ? "Check in and recognise teammates to earn badges" : `${me.nextBadge.left} more to “${me.nextBadge.name}”`}
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: firstTime ? "4%" : "66%" }} />
        </div>
      </div>

      <Link href="/product/kudos/wallet" className="mt-auto block">
        <Button variant="tertiary" leadingIcon={<Trophy className="h-4 w-4 text-[var(--purple)]" />} className="min-h-[44px] w-full lg:min-h-0">
          {points ? "Your wallet" : "Your badges"}
        </Button>
      </Link>
    </section>
  );
}

/* ── 3 · Recognition ── */
function RecognitionCard({ className = "", firstTime = false }: { className?: string; firstTime?: boolean }) {
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Kudos</Eyebrow>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Recognition for you</h2>
        </div>
        <Heart className="h-4 w-4 text-[var(--purple)]" />
      </div>
      {firstTime ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Gift className="h-7 w-7 text-[var(--purple)]" />
          <p className="text-[14px] font-semibold">No kudos yet</p>
          <p className="text-[14px] text-faint">Give recognition first — it usually comes back around.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {myRecognition.map((r) => (
            <li key={r.from} className="rounded-2xl border border-line p-4">
              <div className="flex items-center gap-2.5">
                <Avatar src={r.img} name={r.from} size="sm" />
                <span className="text-[14px] font-semibold">{r.from}</span>
                <Badge tone="brand" variant="soft" size="sm">{r.value}</Badge>
                <span className="ml-auto text-[12px] text-faint">{r.time}</span>
              </div>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/product/kudos" className="mt-auto block">
        <Button variant="tertiary" leadingIcon={<Gift className="h-4 w-4 text-[var(--purple)]" />} className="w-full">
          Recognise a teammate
        </Button>
      </Link>
    </section>
  );
}

/* ── 4 · Communities ── */
function CommunitiesCard({ className = "" }: { className?: string }) {
  return (
    <section className={`card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Belong</Eyebrow>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Your communities</h2>
        </div>
        <button className="flex items-center gap-1 text-[14px] font-semibold text-[var(--purple)] transition hover:gap-1.5">
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {communities.map((c) => (
          <button key={c.name} className="flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left transition hover:bg-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[16px] font-bold text-white" style={{ background: c.color }}>{c.name[0]}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">{c.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-faint">
                <span>{c.members} members</span>
                {c.fresh > 0 && <span className="font-semibold text-[var(--purple)]">· {c.fresh} new</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
