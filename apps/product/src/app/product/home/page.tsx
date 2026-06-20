/* ════════════════════════════════════════════════════════════════════
   HOME — the personalized employee daily workspace (route /product/home).
   The doc's headline shift: "HR dashboard → employee daily workspace".
   This is Priya's own view: greeting + mood check-in, her day, the feed,
   her recognition & progress, communities, and the AI assistant.
   Built to the Notion Home spec; reusable bits use @vadal/design-system.
   ════════════════════════════════════════════════════════════════════ */

import {
  ArrowRight,
  Award,
  BookOpen,
  Flame,
  Gift,
  Heart,
  MessageSquare,
  Plane,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Avatar, Badge, type BadgeTone } from "@vadal/design-system";
import { Shell } from "../shell";
import { org, me, myRecognition, communities, feed } from "@/lib/data";
import { MoodCheck } from "./MoodCheck";
import { MyDay } from "./MyDay";
import { QuickPoll } from "./QuickPoll";

const warmGrad = {
  backgroundImage: "linear-gradient(100deg, #f6a14b 0%, #ef7faf 55%, #8b7cf8 110%)",
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  color: "transparent",
};

const FEED_TONE: Record<string, BadgeTone> = {
  Leadership: "brand",
  Recognition: "success",
  Announcement: "warning",
};

export default function HomePage() {
  return (
    <Shell active="Home" breadcrumb="Home">
      <GreetingHero />
      <MoodCheck />
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <MyDay className="xl:col-span-8" />
        <MeCard className="xl:col-span-4" />
      </section>
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <FeedCard className="xl:col-span-8" />
        <div className="flex flex-col gap-5 xl:col-span-4">
          <AskHrCard />
          <QuickPoll />
        </div>
      </section>
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <RecognitionMeCard className="xl:col-span-5" />
        <CommunitiesCard className="xl:col-span-7" />
      </section>
    </Shell>
  );
}

function MiniStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-soft px-3 py-3 text-center">
      <div className="text-[19px] font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-[10.5px] leading-tight text-faint">{label}</div>
    </div>
  );
}

function GreetingHero() {
  return (
    <div className="rise flex flex-wrap items-end justify-between gap-5">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">{org.date}</div>
        <h1 className="mt-3 text-[clamp(28px,4vw,40px)] font-bold leading-[1.05] tracking-[-0.02em]">
          {me.greeting}, <span style={warmGrad}>{me.name}</span>.
        </h1>
        <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-muted">
          You’re on a <b className="text-ink">{me.streak}-day</b> streak. One survey and a 1:1 need you today.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-[#fdf6e9] px-4 py-2 ring-1 ring-[#f5e5c2] dark:bg-white/[0.05] dark:ring-white/10">
        <Flame className="h-4 w-4 text-[#f2884d]" />
        <span className="text-[14px] font-bold">{me.streak}</span>
        <span className="text-[11px] text-muted">day streak</span>
      </div>
    </div>
  );
}

function MeCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center gap-2.5">
        <Avatar src={me.img} name={me.name} size="lg" />
        <div>
          <h3 className="text-[14px] font-bold tracking-tight">{me.name}</h3>
          <p className="text-[11px] text-faint">{me.role}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStat value={me.points.toLocaleString()} label="Points" />
        <MiniStat value={me.streak} label="Day streak" />
        <MiniStat value={`#${me.rank}`} label="Team rank" />
      </div>
      <div className="mt-4 rounded-2xl bg-cream px-4 py-3.5 ring-1 ring-cream-ring">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 shrink-0 text-[#e89b3c]" />
          <span className="text-[12.5px] font-semibold text-cream-ink">{me.nextBadge.left} more to unlock “{me.nextBadge.name}”</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
          <span className="block h-full rounded-full" style={{ width: "66%", background: "linear-gradient(90deg,#f6a14b,#ef7faf)" }} />
        </div>
      </div>
      <button className="mt-auto flex items-center justify-center gap-2 rounded-full bg-soft py-2.5 text-[12.5px] font-semibold transition hover:bg-line">
        <Trophy className="h-4 w-4 text-[#e89b3c]" /> View leaderboard
      </button>
    </div>
  );
}

function FeedCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[15.5px] font-bold tracking-tight">What’s happening</h3>
        <span className="text-[11px] font-medium text-faint">Company feed</span>
      </div>
      <div className="mt-4 space-y-3">
        {feed.map((p) => (
          <div key={p.text} className="rounded-2xl border border-line p-4">
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
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">{p.text}</p>
            <div className="mt-2.5 flex items-center gap-4 text-[11px] text-faint">
              <button className="flex items-center gap-1 transition hover:text-[#ef7faf]"><Heart className="h-3.5 w-3.5" /> {p.likes}</button>
              <button className="flex items-center gap-1 transition hover:text-ink"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const QUICK = [
  { label: "Apply leave", icon: Plane },
  { label: "Give kudos", icon: Gift },
  { label: "Knowledge", icon: BookOpen },
  { label: "Directory", icon: Users },
];

function AskHrCard() {
  return (
    <div className="card-lift relative flex flex-col overflow-hidden rounded-3xl bg-[#141419] p-6 text-white dark:ring-1 dark:ring-white/[0.08]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full opacity-50 blur-2xl" style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 70%, transparent 78%)" }} aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-[15px] font-bold tracking-tight">Ask anything</h3>
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
          Leave balance, policies, “who owns payroll?” — the assistant answers, and routes you when it can’t.
        </p>
        <button className="mt-4 flex w-full items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2.5 text-left text-[12.5px] text-zinc-400 ring-1 ring-white/[0.08] transition hover:bg-white/[0.12]">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Ask HR or Ask Company…</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUICK.map((q) => (
            <button key={q.label} className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-[11.5px] font-medium text-zinc-300 ring-1 ring-white/[0.06] transition hover:bg-white/[0.1]">
              <q.icon className="h-3.5 w-3.5" /> {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecognitionMeCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[15.5px] font-bold tracking-tight">Recognition for you</h3>
        <Heart className="h-4 w-4 text-[#ef7faf]" />
      </div>
      <ul className="mt-4 space-y-3">
        {myRecognition.map((r) => (
          <li key={r.from} className="rounded-2xl bg-soft p-4">
            <div className="flex items-center gap-2.5">
              <Avatar src={r.img} name={r.from} size="sm" />
              <span className="text-[12.5px] font-semibold">{r.from}</span>
              <Badge tone="success" variant="soft" size="sm">{r.value}</Badge>
              <span className="ml-auto text-[10.5px] text-faint">{r.time}</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{r.text}</p>
          </li>
        ))}
      </ul>
      <button className="mt-auto flex items-center justify-center gap-2 rounded-full bg-soft py-2.5 text-[12.5px] font-semibold transition hover:bg-line">
        <Gift className="h-4 w-4 text-[#f2884d]" /> Recognise a teammate
      </button>
    </div>
  );
}

function CommunitiesCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15.5px] font-bold tracking-tight">Your communities</h3>
          <p className="mt-0.5 text-[12px] text-faint">Where your people connect</p>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-semibold text-[#7c6cf0]">
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {communities.map((c) => (
          <button key={c.name} className="flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left transition hover:bg-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[15px] font-bold text-white" style={{ background: c.color }}>{c.name[0]}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{c.name}</div>
              <div className="text-[11px] text-faint">{c.members} members</div>
            </div>
            {c.fresh > 0 && <Badge tone="brand" variant="soft" size="sm">{c.fresh} new</Badge>}
          </button>
        ))}
      </div>
    </div>
  );
}
