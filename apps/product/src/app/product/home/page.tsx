/* ════════════════════════════════════════════════════════════════════
   HOME — the employee daily workspace (route /product/home).
   "The morning ritual": a merged greeting + mood hero with a focal "Up next"
   action, a focus/feed bento, restrained neutral surfaces with violet as the
   single accent, narrative metrics, one premium AI moment.
   Built to the Notion Home spec; reusable bits use @vadal/design-system.
   ════════════════════════════════════════════════════════════════════ */

import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Gift,
  Heart,
  MessageSquare,
  Plane,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Avatar, Badge, Button, Trend, type BadgeTone } from "@vadal/design-system";
import { Sparkline } from "@/components/charts";
import { Shell } from "../shell";
import { org, me, myRecognition, communities, feed, myDay, engagementTrend } from "@/lib/data";
import { MoodCheck } from "./MoodCheck";
import { MyDay } from "./MyDay";
import { QuickPoll } from "./QuickPoll";

const FEED_TONE: Record<string, BadgeTone> = { Leadership: "brand", Recognition: "neutral", Announcement: "neutral" };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  return (
    <Shell active="Home" breadcrumb="Home">
      <RitualHero />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <MyDay className="xl:col-span-7" />
        <YouCard className="xl:col-span-5" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <FeedCard className="xl:col-span-7" />
        <div className="flex flex-col gap-6 xl:col-span-5">
          <AskAiCard />
          <QuickPoll className="card-lift" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <RecognitionCard className="xl:col-span-6" />
        <CommunitiesCard className="xl:col-span-6" />
      </div>
    </Shell>
  );
}

/* ── 1 · Ritual hero — greeting + mood, with a focal "Up next" action ── */
function RitualHero() {
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
            {greeting}, <span className="text-[var(--purple)]">{me.name}</span> <span aria-hidden>👋</span>
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            You’ve got <b className="font-semibold text-ink">{myDay.length} things</b> today, and you’re on a{" "}
            <b className="font-semibold text-ink">{me.streak}-day</b> streak. 🔥
          </p>
        </div>
        <div className="lg:border-l lg:border-line lg:pl-12">
          <MoodCheck />
        </div>
      </div>
      {/* Focal "Up next" — the single most time-sensitive action */}
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
    </header>
  );
}

/* ── 2 · You — personal panel with a narrative engagement trend ── */
function YouCard({ className = "" }: { className?: string }) {
  const stats: [React.ReactNode, string][] = [
    [me.points.toLocaleString(), "Points"],
    [me.streak, "Day streak"],
    [`#${me.rank}`, "Team rank"],
  ];
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

      {/* narrative metric — not a bare number */}
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

      <div className="mt-4 rounded-2xl bg-soft p-4">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold">
          <Award className="h-4 w-4 text-[var(--purple)]" /> {me.nextBadge.left} more to “{me.nextBadge.name}”
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: "66%" }} />
        </div>
      </div>

      <Button variant="tertiary" leadingIcon={<Trophy className="h-4 w-4 text-[var(--purple)]" />} className="mt-auto w-full">
        View leaderboard
      </Button>
    </section>
  );
}

/* ── 3 · Feed — what's happening (with composer) ── */
function FeedCard({ className = "" }: { className?: string }) {
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Company feed</Eyebrow>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">What’s happening</h2>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line px-3.5 py-2.5">
        <Avatar src={me.img} name={me.name} size="sm" />
        <span className="flex-1 text-[12.5px] text-faint">Share an update with your team…</span>
        <Button variant="tertiary" size="sm">Post</Button>
      </div>

      <div className="mt-5 space-y-5">
        {feed.map((p) => (
          <article key={p.text} className="group">
            <div className="flex items-center gap-2.5">
              <Avatar src={p.img} name={p.author} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12.5px]">
                  <span className="font-semibold">{p.author}</span>
                  <span className="truncate text-faint">{p.role}</span>
                </div>
                <div className="text-[10.5px] text-faint">{p.time} ago</div>
              </div>
              <Badge tone={FEED_TONE[p.kind] ?? "neutral"} variant="soft" size="sm">{p.kind}</Badge>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink/85">{p.text}</p>
            <div className="mt-2.5 flex items-center gap-5 text-[11.5px] text-faint">
              <button className="flex items-center gap-1.5 transition hover:text-[var(--purple)]"><Heart className="h-3.5 w-3.5" /> {p.likes}</button>
              <button className="flex items-center gap-1.5 transition hover:text-ink"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── 4 · Ask Vadal — the premium AI moment (the one dark element) ── */
const QUICK = [
  { label: "Apply leave", icon: Plane },
  { label: "Give kudos", icon: Gift },
  { label: "Knowledge", icon: BookOpen },
  { label: "Directory", icon: Users },
];

function AskAiCard() {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-[26px] bg-[#141419] p-6 text-white shadow-[0_18px_44px_-22px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/[0.08]">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full opacity-55 blur-2xl"
        style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 70%, transparent 78%)" }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-[15px] font-bold tracking-tight">Ask Vadal</h3>
          <span className="rounded-[5px] border border-white/15 px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide text-zinc-300">AI</span>
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
          Leave balance, policies, “who owns payroll?” — instant answers, routed to a human when needed.
        </p>
        <button className="mt-4 flex w-full items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2.5 text-left text-[12.5px] text-zinc-400 ring-1 ring-white/[0.08] transition hover:bg-white/[0.12]">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Ask HR or Ask Company…</span>
          <kbd className="text-[10px] font-semibold text-zinc-500">⌘K</kbd>
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUICK.map((q) => (
            <button key={q.label} className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-[11.5px] font-medium text-zinc-300 ring-1 ring-white/[0.06] transition hover:bg-white/[0.1]">
              <q.icon className="h-3.5 w-3.5" /> {q.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 5 · Recognition ── */
function RecognitionCard({ className = "" }: { className?: string }) {
  return (
    <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Kudos</Eyebrow>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-tight">Recognition for you</h2>
        </div>
        <Heart className="h-4 w-4 text-[var(--purple)]" />
      </div>
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
      <Button variant="tertiary" leadingIcon={<Gift className="h-4 w-4 text-[var(--purple)]" />} className="mt-auto w-full">
        Recognise a teammate
      </Button>
    </section>
  );
}

/* ── 6 · Communities ── */
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
