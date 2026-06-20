import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  FolderKanban,
  Gauge,
  HeartHandshake,
  House,
  Megaphone,
  Newspaper,
  Radio,
  Search,
  Settings,
  Smile,
  Sparkles,
  Trophy,
  UsersRound,
  Flame,
  FileText,
  Heart,
  MessageCircle,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { ArcGauge, Sparkline, TrendChart } from "@/components/charts";
import {
  actionProgress,
  actionQueue,
  aiBriefing,
  briefingImpact,
  businessImpact,
  campaigns,
  departments,
  engagementTrend,
  flightRisks,
  health,
  org,
  recognitionBoard,
  voice,
  attrition,
  managers,
  managerSummary,
  experience,
  feed,
  gamification,
  knowledge,
  aiUsage,
  impact,
} from "@/lib/data";
import { PeriodPills } from "./period-pills";
import { ThemeToggle } from "./theme-toggle";

/* ════════════════════════ page ════════════════════════ */

export default function LumenDashboard() {
  return (
    <div className="lumen flex min-h-screen bg-canvas text-ink">
      <Rail />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="canvas-glow" aria-hidden />
        <TopBar />
        <main className="relative mx-auto w-full max-w-[1240px] flex-1 px-10 pb-28 pt-10">
          <Hero />
          <Ticker />
          {/* Row A — health + trend */}
          <section className="rise rise-2 mt-8 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <HealthCard className="xl:col-span-4" />
            <TrendCard className="xl:col-span-8" />
          </section>
          {/* Row B — briefing + voice + actions */}
          <section className="rise rise-3 mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-12">
            <BriefingCard className="xl:col-span-4" />
            <VoiceCard className="xl:col-span-4" />
            <ActionQueueCard className="xl:col-span-4" />
          </section>
          {/* Row C — risks + campaigns */}
          <section className="rise rise-4 mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <RisksCard className="xl:col-span-7" />
            <CampaignsCard className="xl:col-span-5" />
          </section>
          {/* Row D — recognition + departments/impact */}
          <section className="rise rise-5 mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <RecognitionCard className="xl:col-span-5" />
            <DepartmentsCard className="xl:col-span-7" />
          </section>
          {/* Row E — manager effectiveness + attrition intelligence */}
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <ManagerEffectivenessCard className="xl:col-span-7" />
            <AttritionCard className="xl:col-span-5" />
          </section>
          {/* Row F — employee feed (content layer) + AI assistant usage */}
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <FeedCard className="xl:col-span-7" />
            <AiUsageCard className="xl:col-span-5" />
          </section>
          {/* Row G — gamification + knowledge hub */}
          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <GamificationCard className="xl:col-span-5" />
            <KnowledgeHubCard className="xl:col-span-7" />
          </section>
          {/* Row H — business impact correlation */}
          <section className="mt-5">
            <BusinessImpactCard />
          </section>
        </main>
      </div>
      <AiDock />
    </div>
  );
}

/* ════════════════════════ identity ════════════════════════ */

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="lmL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6b26b" />
          <stop offset="0.5" stopColor="#f08fb5" />
          <stop offset="1" stopColor="#8b7cf8" />
        </linearGradient>
        <linearGradient id="lmR" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#8b7cf8" />
          <stop offset="1" stopColor="#f08fb5" />
        </linearGradient>
      </defs>
      <g transform="rotate(-24 47 60)">
        <rect x="29" y="20" width="36" height="80" rx="17" fill="url(#lmL)" />
      </g>
      <g transform="rotate(24 73 60)">
        <rect x="55" y="20" width="36" height="80" rx="17" fill="url(#lmR)" fillOpacity="0.92" />
      </g>
    </svg>
  );
}

/* warm gradient text — hero accent + leaderboard #1 */
const warmGrad = {
  backgroundImage: "linear-gradient(100deg, #f6a14b 0%, #ef7faf 55%, #8b7cf8 110%)",
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  color: "transparent",
};

/* branded AI affordance — one consistent gradient CTA */
function AiButton({
  children,
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <button
      className={`btn-ai group flex items-center gap-3 rounded-full font-semibold ${
        size === "lg" ? "py-2 pl-5 pr-2 text-[14px]" : "px-4 py-2 text-[14px]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ════════════════════════ rail (dark charcoal — both themes) ════════════════════════ */

type RailItem = { label: string; icon: LucideIcon; active?: boolean; count?: string; href?: string };

const RAIL: RailItem[][] = [
  [
    { label: "Home", icon: House, href: "/product/home" },
    { label: "Pulse", icon: Gauge, active: true },
    { label: "Analytics", icon: BarChart3 },
  ],
  [
    { label: "Surveys", icon: ClipboardList, count: "3" },
    { label: "Sentiment", icon: Smile },
    { label: "Always-on listening", icon: Radio },
  ],
  [
    { label: "Recognition", icon: HeartHandshake },
    { label: "Campaigns", icon: Megaphone },
    { label: "Feed", icon: Newspaper },
  ],
  [
    { label: "Manager hub", icon: UsersRound, count: "5" },
    { label: "Cases", icon: FolderKanban },
    { label: "Knowledge", icon: BookOpen },
  ],
];

function Rail() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-line bg-card px-3.5 py-5 text-ink transition-colors lg:flex dark:border-transparent dark:bg-[#101015] dark:text-[#d6d6de] dark:shadow-[1px_0_0_rgba(255,255,255,0.05)]">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Mark className="h-7 w-7" />
        <span className="text-[16px] font-bold tracking-tight text-ink dark:text-white">
          vadal<span className="text-[#7c6cf0] dark:text-[#a99df9]">.ai</span>
        </span>
      </Link>

      <button className="mt-5 flex w-full items-center gap-2.5 rounded-xl bg-card p-2.5 text-left ring-1 ring-line shadow-[0_2px_6px_rgba(26,27,31,0.05)] transition hover:bg-soft dark:bg-white/[0.04] dark:shadow-none dark:ring-white/[0.07] dark:hover:bg-white/[0.08]">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-line dark:ring-white/10">
          <Image
            src={org.logo}
            alt={org.name}
            width={32}
            height={32}
            className="h-full w-full object-contain p-[3px]"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold lowercase text-ink dark:text-white">
            {org.name}
          </span>
          <span className="block truncate text-[14px] text-faint dark:text-[#85858f]">
            {org.headcount.toLocaleString()} people
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-faint dark:text-[#85858f]" />
      </button>

      {/* signature warm highlight row */}
      <button className="mt-4 flex w-full items-center gap-2.5 rounded-xl bg-[#fdf6e9] px-2.5 py-2.5 text-left ring-1 ring-[#f5e5c2] transition hover:bg-[#fbefd9] dark:bg-transparent dark:ring-0 dark:hover:bg-white/[0.06]">
        <Sparkles className="h-[17px] w-[17px] text-[#dd9026] dark:text-[#f5b86b]" strokeWidth={2} />
        <span className="flex-1 text-[14px] font-semibold text-[#a06a14] dark:text-[#f5cb9b]">
          Today&apos;s AI briefing
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[#dd9026] dark:text-[#f5b86b]" />
      </button>

      <nav className="mt-1 flex-1 overflow-y-auto">
        {RAIL.map((group, gi) => (
          <div
            key={gi}
            className={gi > 0 ? "mt-2 border-t border-line pt-2 dark:border-white/[0.06]" : ""}
          >
            {group.map((it) => (
              <a
                key={it.label}
                href={it.href ?? "#"}
                className={`group mb-0.5 flex items-center gap-2.5 rounded-[10px] px-2.5 py-[8.5px] text-[14px] transition ${
                  it.active
                    ? "bg-soft font-semibold text-ink dark:bg-white/[0.09] dark:text-white"
                    : "font-medium text-muted hover:bg-soft hover:text-ink dark:text-[#aaaab4] dark:hover:bg-white/[0.05] dark:hover:text-white"
                }`}
              >
                <it.icon
                  className={`h-[16px] w-[16px] shrink-0 ${
                    it.active
                      ? "text-ink dark:text-white"
                      : "text-faint group-hover:text-muted dark:text-[#6e6e7a] dark:group-hover:text-[#c9c9d2]"
                  }`}
                  strokeWidth={it.active ? 2.2 : 1.8}
                />
                <span className="flex-1">{it.label}</span>
                {it.count && (
                  <span className="rounded-md bg-soft px-1.5 py-0.5 text-[12px] font-bold text-muted dark:bg-white/[0.1] dark:text-[#d6d6de]">
                    {it.count}
                  </span>
                )}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {/* wallet-style health row */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-soft px-2.5 py-2.5 ring-1 ring-line dark:bg-white/[0.04] dark:ring-white/[0.07]">
        <Gauge className="h-[16px] w-[16px] text-vgreen dark:text-[#9be3b8]" strokeWidth={2} />
        <span className="flex-1 text-[14px] font-medium text-muted dark:text-[#aaaab4]">
          Health
        </span>
        <span className="text-[14px] font-bold text-ink dark:text-white">{health.score}</span>
        <span className="text-[14px] font-semibold text-vgreen dark:text-[#9be3b8]">
          ▲{health.delta}
        </span>
      </div>
      <a
        href="#"
        className="mt-1.5 flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[14px] font-medium text-muted transition hover:bg-soft hover:text-ink dark:text-[#aaaab4] dark:hover:bg-white/[0.05] dark:hover:text-white"
      >
        <Settings className="h-[16px] w-[16px] text-faint dark:text-[#6e6e7a]" strokeWidth={1.8} />
        Settings
      </a>
    </aside>
  );
}

/* ════════════════════════ top bar ════════════════════════ */

function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-card/85 px-10 py-3 backdrop-blur-md transition-colors">
      <span className="text-[14px] font-medium text-faint">
        People intelligence <span className="mx-1.5 text-line">/</span>
        <span className="font-semibold text-ink">Pulse</span>
      </span>
      <div className="flex-1" />
      <button className="hidden w-72 items-center gap-2 rounded-full border border-line bg-soft px-3.5 py-2 text-left text-[14px] text-faint transition hover:border-faint/40 md:flex">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1">Search people, teams, insights</span>
        <kbd className="text-[14px] font-semibold text-faint">⌘K</kbd>
      </button>
      <button className="flex items-center gap-1.5 rounded-full border border-[#f3d9a8] bg-card px-3.5 py-2 text-[14px] font-semibold transition hover:shadow-[0_4px_16px_rgba(245,184,107,0.3)] dark:border-[#5a4a26]">
        <Sparkles className="h-3.5 w-3.5 text-[#e89b3c]" />
        Intelligence
      </button>
      <ThemeToggle />
      <button className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-soft">
        <Bell className="h-[16px] w-[16px]" strokeWidth={1.9} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ef7faf]" />
      </button>
      <Image
        src={org.userImg}
        alt={org.user}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover ring-2 ring-card"
      />
    </header>
  );
}

/* ════════════════════════ hero ════════════════════════ */

function Hero() {
  return (
    <div className="rise flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="text-[14px] font-semibold tracking-[0.18em] text-faint">
          {org.date.toUpperCase()} · {org.headcount.toLocaleString()} PEOPLE
        </div>
        <h1 className="mt-3 text-[42px] font-bold leading-[1.05] tracking-[-0.02em]">
          Your <span style={warmGrad}>people</span>, at a glance.
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          {`Engagement is up ${health.delta} points and you're beating the industry benchmark — but three people need you this week.`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-6">
        <AiButton size="lg">
          <Sparkles className="ml-1 h-4 w-4" />
          Open AI briefing
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#1a1b1f] transition group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </AiButton>
        <PeriodPills />
      </div>
    </div>
  );
}

/* ════════════════════════ metric ticker ════════════════════════ */

const TICKER = [
  { label: "Engagement", value: "82", delta: "▲ 4", good: true, spark: [64, 67, 70, 72, 75, 78, 82] },
  { label: "Sentiment", value: "+38", delta: "▲ 6", good: true, spark: [20, 26, 28, 31, 34, 36, 38] },
  { label: "Participation", value: "74%", delta: "▼ 3", good: false, spark: [82, 80, 78, 77, 75, 74, 74] },
  { label: "At-risk", value: "312", delta: "▲ 18", good: false, spark: [262, 275, 284, 295, 303, 308, 312] },
  { label: "Recognitions", value: "2,840", delta: "▲ 12%", good: true, spark: [14, 17, 21, 25, 29, 33, 38] },
];

function Ticker() {
  return (
    <div className="card-elev rise rise-1 mt-9 grid grid-cols-2 divide-line overflow-hidden rounded-2xl border border-line bg-card transition-colors sm:grid-cols-3 xl:grid-cols-5 xl:divide-x">
      {TICKER.map((t, i) => (
        <button
          key={t.label}
          className="flex items-center gap-3.5 px-5 py-4 text-left transition hover:bg-soft"
        >
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-faint">{t.label}</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold tracking-tight">{t.value}</span>
              <span className={`text-[14px] font-semibold ${t.good ? "text-vgreen" : "text-vred"}`}>
                {t.delta}
              </span>
            </div>
          </div>
          <div className="w-16 shrink-0">
            <Sparkline
              values={t.spark}
              color={t.good ? "#8b7cf8" : "#e0708a"}
              height={30}
              id={`tick-${i}`}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════ Row A ════════════════════════ */

function HealthCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col items-center rounded-3xl border border-line bg-card p-7 text-center ${className}`}>
      <ArcGauge score={health.score} />
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full bg-vgreen-soft px-2.5 py-1 text-[14px] font-semibold text-vgreen">
          ▲ {health.delta} pts
        </span>
        <span className="rounded-full bg-soft px-2.5 py-1 text-[14px] font-semibold text-muted">
          benchmark +{health.benchmarkDelta}
        </span>
      </div>
      <p className="mt-4 text-[14px] leading-relaxed text-muted">
        {health.narrative}
      </p>
      <div className="mt-auto w-full pt-5">
        <button className="w-full rounded-full border border-line bg-card py-2.5 text-[14px] font-semibold transition hover:bg-soft">
          Why this score →
        </button>
      </div>
    </div>
  );
}

function TrendCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Engagement over time</h3>
          <p className="mt-0.5 text-[14px] text-faint">12 months · vs industry benchmark</p>
        </div>
        <div className="flex items-center gap-4 text-[14px] font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#8b7cf8]" /> You
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-[var(--bench)]" /> Benchmark
          </span>
          <button className="flex items-center gap-1 rounded-full bg-soft px-3 py-1.5 font-semibold text-ink transition hover:bg-line">
            Export <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="mt-5">
        <TrendChart
          series={[...engagementTrend.series]}
          benchmark={[...engagementTrend.benchmark]}
          color="#8b7cf8"
          id="lumen-trend"
          height={196}
        />
      </div>
      <div className="mt-2 flex justify-between text-[14px] text-faint">
        {engagementTrend.months.map((m, i) => (
          <span key={m} className={i === engagementTrend.months.length - 1 ? "font-bold text-ink" : ""}>
            {m}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream px-4 py-3 ring-1 ring-cream-ring">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e89b3c]" />
        <p className="text-[14px] font-medium leading-relaxed text-cream-ink">
          {engagementTrend.insight}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════ Row B ════════════════════════ */

function BriefingCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift relative flex flex-col overflow-hidden rounded-3xl bg-[#141419] p-7 text-white dark:ring-1 dark:ring-white/[0.08] ${className}`}>
      {/* aurora halo */}
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-60 blur-2xl"
        style={{ background: "radial-gradient(circle, #ef7faf 0%, #8b7cf8 60%, transparent 75%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full opacity-35 blur-2xl"
        style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-[16px] font-bold tracking-tight">Needs your attention</h3>
        </div>
        <ul className="mt-4">
          {aiBriefing.map((b) => (
            <li key={b.text}>
              <button className="group/row -mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/[0.06]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: b.dot }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-zinc-200">{b.text}</span>
                  <span className="block text-[14px] text-zinc-500">{b.sub}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition group-hover/row:translate-x-0.5 group-hover/row:text-zinc-300" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.05] px-3.5 py-2.5 ring-1 ring-white/[0.07]">
          <span className="text-[14px] text-zinc-400">{briefingImpact.label}</span>
          <span className="text-[14px] font-bold text-[#fda4af]">{briefingImpact.value}</span>
        </div>
      </div>
      <div className="relative mt-auto pt-5">
        {/* waveform */}
        <div className="mb-3 flex h-7 items-end gap-[3px] px-1 opacity-80" aria-hidden>
          {[5, 9, 14, 20, 12, 24, 17, 26, 10, 22, 15, 27, 19, 8, 23, 13, 25, 16, 9, 18, 11, 21, 7, 14, 6].map(
            (h, i) => (
              <span
                key={i}
                className="w-[3px] flex-1 rounded-full bg-gradient-to-t from-[#818cf8] to-[#f472b6]"
                style={{ height: `${h}px`, opacity: i < 7 ? 1 : 0.35 }}
              />
            ),
          )}
        </div>
        <button className="group flex w-full items-center justify-between rounded-full bg-white py-2 pl-6 pr-2 text-[14px] font-semibold text-[#1a1b1f] transition hover:bg-zinc-100">
          Play the 2-min briefing
          <span className="btn-ai grid h-7 w-7 place-items-center rounded-full transition group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </span>
        </button>
      </div>
    </div>
  );
}

const TONE_COLOR: Record<string, string> = {
  bad: "var(--red)",
  good: "var(--green)",
  warn: "var(--amber)",
  purple: "var(--purple)",
};

function VoiceCard({ className = "" }: { className?: string }) {
  const maxMentions = Math.max(...voice.themes.map((t) => t.mentions));
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold tracking-tight">Employee voice</h3>
        <span className="text-[14px] font-medium text-faint">
          {voice.comments.toLocaleString()} comments
        </span>
      </div>
      <div className="mt-4 flex h-2.5 w-full gap-1 overflow-hidden">
        {voice.mood.map((m) => (
          <span
            key={m.label}
            className="h-full rounded-full"
            style={{ width: `${m.pct}%`, background: m.color }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex gap-3.5">
        {voice.mood.map((m) => (
          <span key={m.label} className="flex items-center gap-1.5 text-[14px] font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
            {m.label} {m.pct}%
          </span>
        ))}
      </div>
      <ul className="mt-5 space-y-3.5">
        {voice.themes.map((t) => (
          <li key={t.name} className="group">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold">{t.name}</div>
                <div className="text-[14px] text-faint">{t.mentions} mentions</div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[14px] font-semibold ${
                  t.tone === "bad"
                    ? "bg-vred-soft text-vred"
                    : t.tone === "good"
                      ? "bg-vgreen-soft text-vgreen"
                      : t.tone === "warn"
                        ? "bg-vamber-soft text-vamber"
                        : "bg-lav text-vpurple"
                }`}
              >
                {t.tag}
              </span>
            </div>
            <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-soft">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${(t.mentions / maxMentions) * 100}%`,
                  background: TONE_COLOR[t.tone] ?? "var(--purple)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <figure className="mt-5 flex-1 rounded-2xl border border-cream-ring bg-cream px-4 py-3.5">
        <blockquote className="text-[14px] font-medium italic leading-relaxed text-cream-ink">
          <span className="mr-0.5 font-serif text-[16px] not-italic leading-none">“</span>
          {voice.quote.text}
        </blockquote>
        <figcaption className="mt-1.5 text-[14px] font-medium text-faint">
          {voice.quote.meta}
        </figcaption>
      </figure>
      <a href="#" className="mt-4 text-[14px] font-semibold text-vpurple hover:underline">
        Explore all themes →
      </a>
    </div>
  );
}

function ActionQueueCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold tracking-tight">Action queue</h3>
        <span className="flex items-center gap-1 text-[14px] font-medium text-faint">
          <CalendarCheck className="h-3.5 w-3.5" /> {actionProgress.closed}/{actionProgress.total} closed
        </span>
      </div>
      <div className="mt-3.5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft">
          <span
            className="block h-full rounded-full bg-vgreen transition-[width] duration-500"
            style={{ width: `${actionProgress.pct}%` }}
          />
        </div>
        <span className="text-[14px] font-semibold text-muted">{actionProgress.pct}% closure</span>
      </div>
      <p className="mt-1.5 text-[14px] text-faint">
        Avg {actionProgress.avgDays} days to close
      </p>
      <ul className="mt-4 flex-1 space-y-1">
        {actionQueue.map((a, i) => (
          <li
            key={a.title}
            className="group -mx-2 flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-soft"
          >
            <span
              className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[12px] font-bold ${
                a.tone === "urgent"
                  ? "bg-vred-soft text-vred"
                  : a.tone === "warn"
                    ? "bg-vamber-soft text-vamber"
                    : "bg-soft text-muted"
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold leading-snug">{a.title}</div>
              <div className="mt-0.5 text-[14px] text-faint">{a.context}</div>
            </div>
            <span
              className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-bold tracking-wide ${
                a.due === "Today"
                  ? "bg-vred-soft text-vred"
                  : a.due === "Tomorrow"
                    ? "bg-vamber-soft text-vamber"
                    : "bg-soft text-faint"
              }`}
            >
              {a.due.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
      <button className="mt-3 w-full rounded-full border border-line py-2.5 text-[14px] font-semibold transition hover:bg-soft">
        Open manager hub →
      </button>
    </div>
  );
}

/* ════════════════════════ Row C ════════════════════════ */

function RisksCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[16px] font-bold tracking-tight">Attrition radar</h3>
        <AiButton>
          <Sparkles className="h-3.5 w-3.5" /> Recommend actions
        </AiButton>
      </div>
      {/* pipeline tabs */}
      <div className="mt-4 flex items-center gap-1 text-[14px]">
        {[
          { label: "At-risk", n: "312", active: true },
          { label: "Watching", n: "96" },
          { label: "Actioned", n: "31" },
          { label: "Saved", n: "12" },
        ].map((t, i, arr) => (
          <span key={t.label} className="flex items-center">
            <button
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                t.active ? "bg-soft text-ink" : "text-faint hover:text-ink"
              }`}
            >
              {t.label} <span className="ml-1 text-[14px] text-faint">{t.n}</span>
            </button>
            {i < arr.length - 1 && <span className="mx-0.5 text-line">›</span>}
          </span>
        ))}
      </div>
      <ul className="mt-2 divide-y divide-line/60">
        {flightRisks.map((r) => (
          <li key={r.name} className="group flex cursor-pointer items-center gap-3.5 py-3.5">
            <Image
              src={r.img}
              alt={r.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-card"
              style={{ boxShadow: `0 0 0 3px ${r.hue}22` }}
            />
            <div className="w-30 shrink-0">
              <div className="text-[14px] font-semibold">{r.name}</div>
              <div className="text-[14px] text-faint">{r.team}</div>
            </div>
            <div className="min-w-0 flex-1 truncate text-[14px] text-muted">{r.driver}</div>
            <div className="w-16 shrink-0">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-soft">
                <div
                  className={`h-full rounded-full ${r.level === "High" ? "bg-vred" : "bg-vamber"}`}
                  style={{ width: r.confidence }}
                />
              </div>
              <div className="mt-1 text-center text-[14px] font-bold text-muted">
                {r.confidence}
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-line transition group-hover:text-ink" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CampaignsCard({ className = "" }: { className?: string }) {
  const weakestCampaign = campaigns.reduce((a, b) =>
    a.participation / a.reach <= b.participation / b.reach ? a : b,
  );
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold tracking-tight">Campaign effectiveness</h3>
        <button className="text-[14px] font-semibold text-vpurple hover:underline">
          New →
        </button>
      </div>
      <ul className="mt-5 space-y-5">
        {campaigns.map((c) => {
          const engaged = Math.round((c.participation / c.reach) * 100);
          return (
            <li key={c.name}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-[14px] font-semibold">{c.name}</span>
                  <span className="shrink-0 text-[14px] text-faint">{c.audience}</span>
                </div>
                <span className="shrink-0 rounded-full bg-vgreen-soft px-2 py-0.5 text-[14px] font-bold text-vgreen">
                  {c.lift} lift
                </span>
              </div>
              {/* layered funnel: participation nested inside reach */}
              <div className="relative mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-soft">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                  style={{ width: `${c.reach}%`, background: "rgba(139,124,248,0.32)" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                  style={{ width: `${c.participation}%`, background: "#f08fb5" }}
                />
              </div>
              <div className="mt-2 flex items-center gap-3.5 text-[14px]">
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(139,124,248,0.6)" }} />
                  Reach <span className="font-bold text-ink">{c.reach}%</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#f08fb5" }} />
                  Participation <span className="font-bold text-ink">{c.participation}%</span>
                </span>
                <span className="ml-auto shrink-0 font-semibold text-faint">
                  {engaged}% engaged
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-4 text-[14px] text-muted">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-vamber" />
        <span>
          <span className="font-semibold text-ink">{weakestCampaign.name}</span> lags — only{" "}
          {Math.round((weakestCampaign.participation / weakestCampaign.reach) * 100)}% of those reached
          engaged.
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════ Row D ════════════════════════ */

function RecognitionCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold tracking-tight">Recognition</h3>
        <Trophy className="h-4 w-4 text-[#e89b3c]" />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[30px] font-bold tracking-tight">
          {recognitionBoard.total.toLocaleString()}
        </span>
        <span className="text-[14px] text-muted">
          sent · {recognitionBoard.coverage}% coverage ·{" "}
          <span className="font-semibold text-ink">{recognitionBoard.topValue}</span> leads
        </span>
      </div>
      <div className="mt-5 text-[14px] font-semibold tracking-[0.14em] text-faint">
        TOP APPRECIATORS
      </div>
      <ul className="mb-5 mt-4 space-y-4">
        {recognitionBoard.leaders.map((l, i) => (
          <li key={l.name} className="flex items-center gap-3">
            <span className="w-4 text-[14px] font-bold text-faint">{i + 1}</span>
            <Image
              src={l.img}
              alt={l.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-card"
              style={{ boxShadow: "0 0 0 3.5px " + l.hue + "33" }}
            />
            <div className="flex-1">
              <div className="text-[14px] font-semibold" style={i === 0 ? warmGrad : undefined}>
                {l.name}
              </div>
              <div className="text-[14px] text-faint">{l.team}</div>
            </div>
            <span className="text-[14px] font-bold">{l.given}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-start gap-2 rounded-2xl bg-vamber-soft px-4 py-3.5">
        <span className="text-[14px]">⚠️</span>
        <p className="text-[14px] font-medium leading-relaxed text-[#8a6210] dark:text-[#e3c27e]">
          Low-recognition zones: Plant Ops, Night shift, Finance — nudge those managers.
        </p>
      </div>
    </div>
  );
}

const HEAT_TIERS = [
  { min: 80, cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" },
  { min: 72, cls: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" },
  { min: 65, cls: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" },
  { min: 0, cls: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300" },
];
const heatClass = (score: number) =>
  HEAT_TIERS.find((t) => score >= t.min)!.cls;

function DepartmentsCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold tracking-tight">Engagement by department</h3>
        <span className="text-[14px] font-medium text-faint">tap to drill down</span>
      </div>
      <div className="mt-5 grid flex-1 auto-rows-fr grid-cols-2 gap-2.5 sm:grid-cols-5">
        {departments.map((d) => (
          <button
            key={d.name}
            className={`flex flex-col justify-center rounded-2xl px-3 py-3.5 text-left transition hover:scale-[1.03] ${heatClass(d.score)}`}
          >
            <div className="text-[19px] font-bold tracking-tight">{d.score}</div>
            <div className="mt-0.5 truncate text-[14px] font-medium opacity-85">{d.name}</div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5">
        <ImpactStat value={businessImpact.attritionCorr} label="engagement ↔ attrition" />
        <ImpactStat value={businessImpact.productivityCorr} label="↔ productivity" />
        <ImpactStat value={businessImpact.attritionCost} label="cost of attrition / yr" />
        <p className="min-w-0 flex-1 text-[14px] font-medium leading-relaxed text-muted">
          <Sparkles className="mr-1 inline h-3 w-3 text-[#e89b3c]" />
          {businessImpact.insight}
        </p>
      </div>
    </div>
  );
}

function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[22px] font-bold tracking-tight">{value}</div>
      <div className="text-[14px] text-faint">{label}</div>
    </div>
  );
}

/* ════════════════════════ AI dock ════════════════════════ */

function AiDock() {
  return (
    <button className="fixed bottom-5 right-6 z-30 flex items-center gap-2.5 rounded-full border border-line bg-card py-2.5 pl-3 pr-4 shadow-[0_10px_34px_rgba(20,20,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(139,124,248,0.32)] dark:shadow-[0_10px_34px_rgba(0,0,0,0.5)]">
      <span className="ai-aura grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-left">
        <span className="flex items-center gap-1 text-[14px] font-semibold">
          Vadal
          <span className="rounded-[4px] border border-line px-1 text-[12px] font-bold text-muted">
            AI
          </span>
        </span>
        <span className="block text-[14px] text-faint">
          What are you looking for today?
        </span>
      </span>
    </button>
  );
}

/* ════════════════════════ shared mini stat ════════════════════════ */

function MiniStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-soft px-3 py-3">
      <div className="text-[19px] font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-[14px] leading-tight text-faint">{label}</div>
    </div>
  );
}

/* ════════════════════════ Row E — manager effectiveness ════════════════════════ */

const GRADE_COLOR: Record<string, string> = {
  A: "var(--green)",
  B: "var(--purple)",
  C: "var(--amber)",
  D: "var(--red)",
};

function ManagerEffectivenessCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Manager effectiveness</h3>
          <p className="mt-0.5 text-[14px] text-faint">Which leaders are driving engagement</p>
        </div>
        <span className="rounded-full bg-soft px-2.5 py-1 text-[14px] font-semibold text-muted">Index {managerSummary.index}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStat value={managerSummary.index} label="Effectiveness index" />
        <MiniStat value={`${managerSummary.closureRate}%`} label="Action closure" />
        <MiniStat value={managerSummary.withActions} label="Need actions" />
      </div>
      <div className="mt-5">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-2 pb-1 text-[14px] font-semibold uppercase tracking-wide text-faint">
          <span>Manager</span>
          <span className="w-12 text-right">Score</span>
          <span className="w-14 text-right">Closure</span>
          <span className="w-12 text-right">At-risk</span>
        </div>
        {managers.map((m) => (
          <div key={m.name} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-soft">
            <div className="flex min-w-0 items-center gap-2.5">
              <Image src={m.img} alt={m.name} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold">{m.name}</div>
                <div className="truncate text-[14px] text-faint">{m.team}</div>
              </div>
            </div>
            <span className="flex w-12 items-center justify-end gap-1.5">
              <span className="text-[14px] font-bold">{m.score}</span>
              <span className="grid h-4 w-4 place-items-center rounded text-[12px] font-bold text-white" style={{ background: GRADE_COLOR[m.grade] }}>{m.grade}</span>
            </span>
            <span className="w-14 text-right text-[14px] font-semibold text-muted">{m.closure}%</span>
            <span className={`w-12 text-right text-[14px] font-bold ${m.atRisk >= 5 ? "text-vred" : "text-muted"}`}>{m.atRisk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttritionCard({ className = "" }: { className?: string }) {
  const total = attrition.segmentation.reduce((s, x) => s + x.count, 0);
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Attrition intelligence</h3>
          <p className="mt-0.5 text-[14px] text-faint">Who might leave, and why</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-vred-soft px-2.5 py-1 text-[14px] font-bold text-vred">
          <TrendingUp className="h-3 w-3" /> {attrition.predicted} predicted
        </span>
      </div>
      <div className="mt-5">
        <div className="flex h-2.5 w-full gap-1 overflow-hidden">
          {attrition.segmentation.map((s) => (
            <span key={s.level} className="h-full rounded-full" style={{ width: `${(s.count / total) * 100}%`, background: s.color }} />
          ))}
        </div>
        <div className="mt-2.5 flex justify-between">
          {attrition.segmentation.map((s) => (
            <span key={s.level} className="flex items-center gap-1.5 text-[14px] font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {s.level} {s.count}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="text-[14px] font-semibold uppercase tracking-wide text-faint">Key risk drivers</div>
        {attrition.drivers.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-medium">{d.label}</span>
              <span className="font-bold text-muted">{d.pct}%</span>
            </div>
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-soft">
              <span className="block h-full rounded-full" style={{ width: `${d.pct}%`, background: "var(--purple)" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="text-[14px] text-faint">Flight-risk · last 6 mo</span>
        <div className="w-28">
          <Sparkline values={[...attrition.flightTrend]} color="#e0708a" height={28} id="attr-trend" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ Row F — feed + AI usage ════════════════════════ */

function FeedCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Employee feed</h3>
          <p className="mt-0.5 text-[14px] text-faint">News · recognition · leadership</p>
        </div>
        <div className="flex items-center gap-3.5 text-[14px] font-medium text-muted">
          <span><b className="text-ink">{experience.dau}</b> DAU</span>
          <span><b className="text-ink">{experience.views}</b> views</span>
          <span><b className="text-ink">{experience.reactions}</b> reactions</span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {feed.map((p) => (
          <div key={p.text} className="rounded-2xl border border-line p-4">
            <div className="flex items-center gap-2.5">
              <Image src={p.img} alt={p.author} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[14px]">
                  <span className="font-semibold">{p.author}</span>
                  <span className="truncate text-faint">{p.role}</span>
                </div>
                <div className="text-[14px] text-faint">{p.time} ago</div>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide" style={{ background: `${p.accent}1f`, color: p.accent }}>{p.kind}</span>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{p.text}</p>
            <div className="mt-2.5 flex items-center gap-4 text-[14px] text-faint">
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {p.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 flex items-center justify-center gap-2 rounded-full border border-line py-2.5 text-[14px] font-semibold transition hover:bg-soft">
        <MessageCircle className="h-4 w-4" /> Create post · Report issue · Suggest idea
      </button>
    </div>
  );
}

function AiUsageCard({ className = "" }: { className?: string }) {
  const maxTopic = Math.max(...aiUsage.topics.map((t) => t.pct));
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Ask HR · AI</h3>
          <p className="text-[14px] text-faint">What people ask the assistant</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniStat value={aiUsage.questions} label="Questions / month" />
        <MiniStat value={`${aiUsage.resolved}%`} label="Self-resolved" />
      </div>
      <div className="mt-5 space-y-2.5">
        {aiUsage.topics.map((t) => (
          <div key={t.topic}>
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-medium">{t.topic}</span>
              <span className="font-bold text-muted">{t.pct}%</span>
            </div>
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-soft">
              <span className="block h-full rounded-full" style={{ width: `${(t.pct / maxTopic) * 100}%`, background: "linear-gradient(90deg,#818cf8,#f472b6)" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream px-4 py-3 ring-1 ring-cream-ring">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e89b3c]" />
        <p className="text-[14px] font-medium leading-relaxed text-cream-ink">{aiUsage.signal}</p>
      </div>
    </div>
  );
}

/* ════════════════════════ Row G — gamification + knowledge ════════════════════════ */

function GamificationCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift flex flex-col rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Gamification</h3>
          <p className="mt-0.5 text-[14px] text-faint">Behavioral participation · {gamification.points} pts</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-[14px] font-semibold text-muted">
          <Flame className="h-3 w-3 text-[#f2884d]" /> {gamification.streaks.toLocaleString()}
        </span>
      </div>
      <div className="mt-5 space-y-2">
        {gamification.leaders.map((l, i) => (
          <div key={l.name} className="flex items-center gap-3 rounded-xl bg-soft px-3 py-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: l.medal }}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">{l.name}</div>
              <div className="text-[14px] text-faint">{l.team}</div>
            </div>
            <span className="text-[14px] font-bold">{l.points.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {gamification.badges.map((b) => (
          <div key={b.name} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-[14px]">
            <span className="truncate font-medium text-muted">{b.name}</span>
            <span className="font-bold">{b.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-vamber-soft px-3 py-2.5 text-[14px] font-semibold text-vamber">
        <AlertTriangle className="h-3.5 w-3.5" /> Participation drop · {gamification.drop}
      </div>
    </div>
  );
}

function KnowledgeHubCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card-lift rounded-3xl border border-line bg-card p-7 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Knowledge hub</h3>
          <p className="mt-0.5 text-[14px] text-faint">Self-service & smart search</p>
        </div>
        <div className="flex items-center gap-3.5 text-[14px] font-medium text-muted">
          <span><b className="text-ink">{knowledge.views}</b> views</span>
          <span><b className="text-ink">{knowledge.searchSuccess}%</b> search success</span>
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="text-[14px] font-semibold uppercase tracking-wide text-faint">Top queries</div>
          <ul className="mt-2.5 space-y-2.5">
            {knowledge.topQueries.map((q) => (
              <li key={q.q} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-[14px]">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-faint" />
                  <span className="truncate">{q.q}</span>
                </span>
                <span className="text-[14px] font-semibold text-muted">{q.n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[14px] font-semibold uppercase tracking-wide text-faint">Content gaps</div>
          <ul className="mt-2.5 space-y-2">
            {knowledge.gaps.map((g) => (
              <li key={g} className="flex items-center gap-2 rounded-xl bg-vred-soft px-3 py-2 text-[14px] font-medium text-vred">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ Row H — business impact ════════════════════════ */

function BusinessImpactCard() {
  return (
    <div className="card-elev rounded-3xl border border-line bg-card p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight">Business impact correlation</h3>
          <p className="mt-0.5 text-[14px] text-faint">Is engagement driving outcomes? — the strategic differentiator</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-vgreen-soft px-2.5 py-1 text-[14px] font-bold text-vgreen">
          <TrendingUp className="h-3 w-3" /> ROI {impact.roi}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        <ImpactStat value={impact.attritionCorr} label="↔ attrition" />
        <ImpactStat value={impact.productivityCorr} label="↔ productivity" />
        <ImpactStat value={impact.revenueCorr} label="↔ revenue" />
        <ImpactStat value={impact.attritionCost} label="cost of attrition / yr" />
        <ImpactStat value={impact.roi} label="ROI of programs" />
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold tracking-tight text-vgreen">{impact.topVsBottom.top}</span>
            <span className="text-[14px] text-faint">vs</span>
            <span className="text-[22px] font-bold tracking-tight text-vred">{impact.topVsBottom.bottom}</span>
          </div>
          <div className="text-[14px] text-faint">top vs bottom quartile output</div>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream px-4 py-3 ring-1 ring-cream-ring">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e89b3c]" />
        <p className="text-[14px] font-medium leading-relaxed text-cream-ink">{impact.insight}</p>
      </div>
    </div>
  );
}
