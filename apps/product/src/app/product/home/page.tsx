/* ════════════════════════════════════════════════════════════════════
   HOME — the employee daily workspace (route /product/home).
   "The morning ritual": merged greeting + mood hero with a focal "Up next",
   a focus/feed bento, neutral surfaces + violet accent, narrative metrics,
   a live AI moment, and real states (loading · first-time · empty).
   First-time/new-joiner preview: /product/home?view=new
   ════════════════════════════════════════════════════════════════════ */

import { ArrowRight, Award, Clock, Gift, Heart, Trophy } from "lucide-react";
import { Avatar, Badge, Button, Trend } from "@vadal/design-system";
import { Sparkline } from "@/components/charts";
import { Shell } from "../shell";
import { org, me, myRecognition, communities, myDay, engagementTrend } from "@/lib/data";
import { MoodCheck } from "./MoodCheck";
import { MyDay } from "./MyDay";
import { QuickPoll } from "./QuickPoll";
import { Feed } from "./Feed";
import { AskAi } from "./AskAi";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const firstTime = (await searchParams)?.view === "new";
  return (
    <Shell active="Home" breadcrumb="Home">
      <RitualHero firstTime={firstTime} />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <MyDay className="xl:col-span-7" empty={firstTime} />
        <YouCard className="xl:col-span-5" firstTime={firstTime} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Feed className="xl:col-span-7" empty={firstTime} />
        <div className="flex flex-col gap-6 xl:col-span-5">
          <AskAi />
          <QuickPoll className="card-lift" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <RecognitionCard className="xl:col-span-6" firstTime={firstTime} />
        <CommunitiesCard className="xl:col-span-6" />
      </div>
    </Shell>
  );
}

/* ── 1 · Ritual hero — greeting + mood, with a focal "Up next" ── */
function RitualHero({ firstTime }: { firstTime: boolean }) {
  const greeting = greetingFor(new Date().getHours());
  const upNext = myDay.find((t) => t.tag === "Meeting") ?? myDay[0];
  return (
    <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.25fr_0.85fr] lg:items-start lg:gap-12">
        <div>
          <Eyebrow>{org.date}</Eyebrow>
          <h1 className="mt-3 text-[clamp(30px,4.4vw,46px)] font-bold leading-[1.03] tracking-[-0.025em]">
            {firstTime ? "Welcome" : greeting}, <span className="text-[var(--purple)]">{me.name}</span> <span aria-hidden>👋</span>
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            {firstTime ? (
              <>Let’s set up your day — start with a quick mood check-in. We’ll fill the rest as you go.</>
            ) : (
              <>You’ve got <b className="font-semibold text-ink">{myDay.length} things</b> today, and you’re on a <b className="font-semibold text-ink">{me.streak}-day</b> streak. 🔥</>
            )}
          </p>
        </div>
        <div className="lg:border-l lg:border-line lg:pl-12">
          <MoodCheck />
        </div>
      </div>
      {!firstTime && (
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line bg-soft px-7 py-4 sm:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--lav)] text-[var(--purple)]">
              <Clock className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <Eyebrow>Up next</Eyebrow>
              <p className="truncate text-[13.5px] font-semibold">
                {upNext.title} <span className="font-normal text-faint">· {upNext.meta}</span>
              </p>
            </div>
          </div>
          <Button variant="brand" size="sm">{upNext.action}</Button>
        </div>
      )}
    </header>
  );
}

/* ── 2 · You — personal panel with a narrative engagement trend ── */
function YouCard({ className = "", firstTime = false }: { className?: string; firstTime?: boolean }) {
  const stats: [React.ReactNode, string][] = firstTime
    ? [["0", "Points"], ["0", "Day streak"], ["—", "Team rank"]]
    : [[me.points.toLocaleString(), "Points"], [me.streak, "Day streak"], [`#${me.rank}`, "Team rank"]];
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg,var(--purple),#a99df9)" }}>
          <span className="rounded-full ring-2 ring-card">
            <Avatar src={me.img} name={me.name} size="lg" />
          </span>
        </span>
        <div>
          <h3 className="text-[15px] font-bold tracking-tight">{me.name}</h3>
          <p className="text-[11.5px] text-faint">{me.role}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-line">
        {stats.map(([value, label]) => (
          <div key={label} className="px-2 text-center first:pl-0 last:pr-0">
            <div className="text-[22px] font-bold tracking-tight">{value}</div>
            <div className="mt-0.5 text-[10.5px] text-faint">{label}</div>
          </div>
        ))}
      </div>

      {firstTime ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-4 text-center">
          <p className="text-[12.5px] font-semibold">Your engagement insights appear after your first week 📈</p>
          <p className="mt-1 text-[11.5px] text-faint">Check in daily and recognise teammates to get started.</p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <Eyebrow>Your engagement</Eyebrow>
            <span className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold tracking-tight">82</span>
              <Trend direction="up" value="4" />
            </span>
          </div>
          <Sparkline values={engagementTrend.series} color="#6d5df0" id="you-eng" height={42} className="mt-2.5" />
          <p className="mt-1 text-[11.5px] leading-snug text-faint">Trending up since recognition picked up — keep your 1:1s on track.</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-soft p-4">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold">
          <Award className="h-4 w-4 text-[var(--purple)]" /> {firstTime ? "Earn points to unlock badges" : `${me.nextBadge.left} more to “${me.nextBadge.name}”`}
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: firstTime ? "4%" : "66%" }} />
        </div>
      </div>

      <Button variant="tertiary" leadingIcon={<Trophy className="h-4 w-4 text-[var(--purple)]" />} className="mt-auto w-full">
        View leaderboard
      </Button>
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
          <p className="text-[13px] font-semibold">No kudos yet</p>
          <p className="text-[12px] text-faint">Give recognition first — it usually comes back around.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {myRecognition.map((r) => (
            <li key={r.from} className="rounded-2xl border border-line p-4">
              <div className="flex items-center gap-2.5">
                <Avatar src={r.img} name={r.from} size="sm" />
                <span className="text-[12.5px] font-semibold">{r.from}</span>
                <Badge tone="brand" variant="soft" size="sm">{r.value}</Badge>
                <span className="ml-auto text-[10.5px] text-faint">{r.time}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
      <Button variant="tertiary" leadingIcon={<Gift className="h-4 w-4 text-[var(--purple)]" />} className="mt-auto w-full">
        Recognise a teammate
      </Button>
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
        <button className="flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] transition hover:gap-1.5">
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {communities.map((c) => (
          <button key={c.name} className="flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left transition hover:bg-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[15px] font-bold text-white" style={{ background: c.color }}>{c.name[0]}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{c.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-faint">
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
