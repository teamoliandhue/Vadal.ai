import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
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
  type LucideIcon,
} from "lucide-react";
import { Sparkline, TrendChart } from "@/components/charts";
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
} from "@/lib/data";
import { GlassBgPicker, GlassPeriodPills, GlassThemeToggle } from "./glass-chrome";

/* ════════════════════════ page ════════════════════════ */

export default function GlassDashboard() {
  return (
    <div className="glass-root">
      <div className="glass-mesh" aria-hidden>
        <div className="glass-mesh-blobs" />
      </div>

      <Rail />

      <div className="lg:pl-[92px]">
        <div className="mx-auto w-full max-w-[1320px] px-5 pb-28 pt-5 sm:px-7">
          <TopBar />
          <Hero />
          <KpiRow />

          {/* ── bento ── */}
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <ScoreCard className="xl:col-span-4" />
            <TrendCard className="xl:col-span-8" />

            <VoiceCard className="xl:col-span-4" />
            <ActionCard className="xl:col-span-4" />
            <BriefingCard className="xl:col-span-4" />

            <RisksCard className="xl:col-span-7" />
            <CampaignsCard className="xl:col-span-5" />

            <RecognitionCard className="xl:col-span-5" />
            <DepartmentsCard className="xl:col-span-7" />
          </div>
        </div>
      </div>

      <Dock />
    </div>
  );
}

/* ════════════════════════ chrome ════════════════════════ */

type RailItem = { label: string; icon: LucideIcon; active?: boolean; count?: string };
const RAIL: RailItem[][] = [
  [
    { label: "Home", icon: House },
    { label: "Pulse", icon: Gauge, active: true },
    { label: "Analytics", icon: BarChart3 },
  ],
  [
    { label: "Surveys", icon: ClipboardList, count: "3" },
    { label: "Sentiment", icon: Smile },
    { label: "Listening", icon: Radio },
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
    <aside className="glass-card fixed left-4 top-4 bottom-4 z-30 hidden w-16 flex-col items-center gap-1 rounded-[28px] py-4 lg:flex">
      <Link href="/" className="grid h-10 w-10 place-items-center" aria-label="Home">
        <Mark className="h-7 w-7" />
      </Link>
      <div className="my-2 h-px w-7 bg-[var(--gl-border-soft)]" />
      <nav className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto">
        {RAIL.flat().map((it) => (
          <a
            key={it.label}
            href="#"
            data-active={it.active ? "true" : "false"}
            title={it.label}
            className="glass-nav-item group relative grid h-10 w-10 place-items-center rounded-2xl"
          >
            <it.icon className="h-[18px] w-[18px]" strokeWidth={it.active ? 2.2 : 1.8} />
            {it.count && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#5b8cff] px-1 text-[8.5px] font-bold text-white">
                {it.count}
              </span>
            )}
            {/* hover label */}
            <span className="glass-card pointer-events-none absolute left-[52px] z-40 whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100">
              {it.label}
            </span>
          </a>
        ))}
      </nav>
      <div className="mt-2 flex flex-col items-center gap-1.5">
        <GlassThemeToggle />
        <a href="#" title="Settings" className="glass-nav-item grid h-10 w-10 place-items-center rounded-2xl">
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </a>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="glass-card flex items-center gap-3 rounded-3xl px-3 py-2.5">
      <button className="glass-soft flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-3 transition hover:brightness-105">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-[var(--gl-border-soft)]">
          <Image src={org.logo} alt={org.name} width={32} height={32} className="h-full w-full object-contain p-[3px]" />
        </span>
        <span className="text-left">
          <span className="block text-[12.5px] font-bold lowercase leading-tight">{org.name}</span>
          <span className="t-faint block text-[10px] leading-tight">{org.headcount.toLocaleString()} people</span>
        </span>
      </button>

      <button className="glass-soft hidden flex-1 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left text-[12.5px] md:flex">
        <Search className="t-faint h-4 w-4" />
        <span className="t-faint flex-1">Search people, teams, insights</span>
        <kbd className="t-faint text-[10px] font-semibold">⌘K</kbd>
      </button>
      <div className="flex-1 md:hidden" />

      <button className="glass-soft flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[12px] font-semibold transition hover:brightness-105">
        <Sparkles className="h-3.5 w-3.5 text-[#c084fc]" />
        Intelligence
      </button>
      <GlassBgPicker />
      <button className="glass-nav-item relative grid h-10 w-10 place-items-center rounded-2xl" aria-label="Notifications">
        <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#5b8cff]" />
      </button>
      <Image
        src={org.userImg}
        alt={org.user}
        width={40}
        height={40}
        className="h-10 w-10 rounded-2xl object-cover ring-1 ring-[var(--gl-border)]"
      />
    </header>
  );
}

function Hero() {
  return (
    <div className="rise mt-6 flex flex-wrap items-end justify-between gap-5 px-1">
      <div>
        <div className="t-faint text-[11px] font-semibold tracking-[0.18em]">
          {org.date.toUpperCase()} · {org.headcount.toLocaleString()} PEOPLE
        </div>
        <h1 className="mt-2.5 text-[40px] font-bold leading-[1.05] tracking-[-0.02em]">
          Your{" "}
          <span className="bg-gradient-to-r from-[#60a5fa] via-[#8b9cf8] to-[#c084fc] bg-clip-text text-transparent">
            people
          </span>
          , at a glance.
        </h1>
        <p className="t-muted mt-2.5 max-w-xl text-[14px] leading-relaxed">
          {`Engagement is up ${health.delta} points and you're beating the industry benchmark — but three people need you this week.`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-4">
        <button className="glass-cta group flex items-center gap-2 rounded-full py-2.5 pl-5 pr-2.5 text-[13px] font-semibold">
          <Sparkles className="h-4 w-4" />
          Open AI briefing
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/25 transition group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
        <GlassPeriodPills />
      </div>
    </div>
  );
}

const KPIS = [
  { label: "Engagement", value: "82", delta: "▲ 4", good: true, spark: [64, 67, 70, 72, 75, 78, 82], color: "#818cf8" },
  { label: "Sentiment", value: "+38", delta: "▲ 6", good: true, spark: [20, 26, 28, 31, 34, 36, 38], color: "#2dd4bf" },
  { label: "Participation", value: "74%", delta: "▼ 3", good: false, spark: [82, 80, 78, 77, 75, 74, 74], color: "#38bdf8" },
  { label: "At-risk", value: "312", delta: "▲ 18", good: false, spark: [262, 275, 284, 295, 303, 308, 312], color: "#fb7185" },
  { label: "Recognitions", value: "2,840", delta: "▲ 12%", good: true, spark: [14, 17, 21, 25, 29, 33, 38], color: "#c084fc" },
];

function KpiRow() {
  return (
    <div className="rise rise-1 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {KPIS.map((k) => (
        <div key={k.label} className="glass-card glass-card-hover overflow-hidden rounded-3xl p-4">
          <div className="t-faint text-[11px] font-medium">{k.label}</div>
          <div className="mt-1 flex items-end justify-between gap-2">
            <span className="text-[26px] font-bold leading-none tracking-tight">{k.value}</span>
            <span className={`text-[11px] font-bold ${k.good ? "text-emerald-500 dark:text-emerald-300" : "text-rose-500 dark:text-rose-300"}`}>
              {k.delta}
            </span>
          </div>
          <div className="mt-2 h-8 opacity-90">
            <Sparkline values={k.spark} color={k.color} id={`kpi-${k.label}`} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════ widgets ════════════════════════ */

function CardHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-bold tracking-tight">{title}</h3>
      {right}
    </div>
  );
}

function tonePill(tone: string) {
  if (tone === "bad") return "bg-rose-400/20 text-rose-600 dark:text-rose-300";
  if (tone === "good") return "bg-emerald-400/20 text-emerald-600 dark:text-emerald-300";
  if (tone === "warn") return "bg-amber-400/20 text-amber-600 dark:text-amber-300";
  return "bg-violet-400/20 text-violet-600 dark:text-violet-300";
}
const TONE_BAR: Record<string, string> = {
  bad: "#fb7185",
  good: "#34d399",
  warn: "#fbbf24",
  purple: "#a78bfa",
};

function ScoreCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover flex flex-col items-center rounded-[26px] p-7 text-center ${className}`}>
      <CardHead title="Workforce health" right={<span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">▲ {health.delta} pts</span>} />
      <div className="relative mt-3 grid place-items-center">
        <Ring score={health.score} />
      </div>
      <p className="t-muted mt-4 text-[12.5px] leading-relaxed">{health.narrative}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {health.drivers.map((d) => (
          <span key={d.label} className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${tonePill(d.tone)}`}>
            {d.label}
          </span>
        ))}
      </div>
      <button className="glass-soft mt-auto w-full rounded-full py-2.5 text-[12.5px] font-semibold transition hover:brightness-105">
        Why this score →
      </button>
    </div>
  );
}

/** glass score ring with the brand gradient */
function Ring({ score, size = 168, stroke = 13 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2 - 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="glRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="0.4" stopColor="#6d8bfa" />
            <stop offset="0.7" stopColor="#8b7cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--gl-track)" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="url(#glRing)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${c} ${c})`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${circ}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[42px] font-bold leading-none tracking-tight">{score}</span>
        <span className="t-faint mt-1 text-[11px]">benchmark +{health.benchmarkDelta}</span>
      </div>
    </div>
  );
}

function TrendCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover flex flex-col rounded-[26px] p-7 ${className}`}>
      <CardHead
        title="Engagement over time"
        right={
          <button className="glass-soft flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-semibold">
            Export <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        }
      />
      <div className="t-faint mt-0.5 text-[11.5px]">12 months · vs industry benchmark</div>
      <div className="relative mt-4 flex-1">
        <TrendChart series={engagementTrend.series} benchmark={engagementTrend.benchmark} color="#8b7cf8" id="gl-trend" height={196} />
        <div className="t-faint mt-1.5 flex justify-between text-[10px]">
          {engagementTrend.months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
      <div className="glass-soft mt-4 flex items-start gap-2 rounded-2xl px-4 py-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c084fc]" />
        <p className="t-muted text-[12px] font-medium leading-relaxed">{engagementTrend.insight}</p>
      </div>
    </div>
  );
}

function VoiceCard({ className = "" }: { className?: string }) {
  const maxMentions = Math.max(...voice.themes.map((t) => t.mentions));
  return (
    <div className={`glass-card glass-card-hover flex flex-col rounded-[26px] p-6 ${className}`}>
      <CardHead title="Employee voice" right={<span className="t-faint text-[11px] font-medium">{voice.comments.toLocaleString()} comments</span>} />
      <div className="mt-4 flex h-2.5 w-full gap-1 overflow-hidden">
        {voice.mood.map((m) => (
          <span key={m.label} className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
        ))}
      </div>
      <div className="mt-2.5 flex gap-3.5">
        {voice.mood.map((m) => (
          <span key={m.label} className="t-muted flex items-center gap-1.5 text-[10.5px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
            {m.label} {m.pct}%
          </span>
        ))}
      </div>
      <ul className="mt-5 space-y-3.5">
        {voice.themes.map((t) => (
          <li key={t.name}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-semibold">{t.name}</div>
                <div className="t-faint text-[10.5px]">{t.mentions} mentions</div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${tonePill(t.tone)}`}>{t.tag}</span>
            </div>
            <div className="gl-track mt-1.5 h-[3px] w-full overflow-hidden rounded-full">
              <span className="block h-full rounded-full" style={{ width: `${(t.mentions / maxMentions) * 100}%`, background: TONE_BAR[t.tone] ?? "#a78bfa" }} />
            </div>
          </li>
        ))}
      </ul>
      <figure className="glass-soft mt-5 flex-1 rounded-2xl px-4 py-3.5">
        <blockquote className="text-[12px] font-medium italic leading-relaxed">
          <span className="mr-0.5 text-[15px] not-italic">“</span>
          {voice.quote.text}
        </blockquote>
        <figcaption className="t-faint mt-1.5 text-[10px] font-medium">{voice.quote.meta}</figcaption>
      </figure>
    </div>
  );
}

function ActionCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover flex flex-col rounded-[26px] p-6 ${className}`}>
      <CardHead title="Action queue" right={<span className="t-faint flex items-center gap-1 text-[11px] font-medium"><CalendarCheck className="h-3.5 w-3.5" /> {actionProgress.closed}/{actionProgress.total} closed</span>} />
      <div className="mt-3.5 flex items-center gap-3">
        <div className="gl-track h-1.5 flex-1 overflow-hidden rounded-full">
          <span className="block h-full rounded-full bg-gradient-to-r from-[#34d399] to-[#2dd4bf]" style={{ width: `${actionProgress.pct}%` }} />
        </div>
        <span className="t-muted text-[10.5px] font-semibold">{actionProgress.pct}% closure</span>
      </div>
      <p className="t-faint mt-1.5 text-[10.5px]">Avg {actionProgress.avgDays} days to close</p>
      <ul className="mt-4 flex-1 space-y-1">
        {actionQueue.map((a, i) => (
          <li key={a.title} className="group -mx-2 flex cursor-pointer items-start gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-[var(--gl-surface-soft)]">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-lg text-[9px] font-bold ${a.tone === "urgent" ? "bg-rose-400/20 text-rose-600 dark:text-rose-300" : a.tone === "warn" ? "bg-amber-400/20 text-amber-600 dark:text-amber-300" : "gl-track t-muted"}`}>
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-semibold leading-snug">{a.title}</div>
              <div className="t-faint mt-0.5 text-[10.5px]">{a.context}</div>
            </div>
            <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${a.due === "Today" ? "bg-rose-400/20 text-rose-600 dark:text-rose-300" : a.due === "Tomorrow" ? "bg-amber-400/20 text-amber-600 dark:text-amber-300" : "gl-track t-faint"}`}>
              {a.due.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
      <button className="glass-soft mt-3 w-full rounded-full py-2.5 text-[12.5px] font-semibold transition hover:brightness-105">Open manager hub →</button>
    </div>
  );
}

function BriefingCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover relative flex flex-col overflow-hidden rounded-[26px] p-6 ${className}`}>
      {/* vivid wash for the AI card */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-[#3b82f6]/40 to-[#7c3aed]/40 blur-2xl" aria-hidden />
      <div className="relative flex items-center gap-2.5">
        <span className="ai-aura grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#60a5fa] via-[#818cf8] to-[#a78bfa]">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <h3 className="text-[15px] font-bold tracking-tight">Needs your attention</h3>
      </div>
      <ul className="relative mt-5 flex-1 space-y-3.5">
        {aiBriefing.map((b) => (
          <li key={b.text} className="group flex cursor-pointer items-start gap-2.5">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: b.dot }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-snug">{b.text}</div>
              <div className="t-faint mt-0.5 text-[11px]">{b.sub}</div>
            </div>
            <ArrowUpRight className="t-faint mt-0.5 h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100" />
          </li>
        ))}
      </ul>
      <div className="glass-soft relative mt-4 rounded-2xl px-4 py-3">
        <div className="t-faint text-[10.5px] font-medium">{briefingImpact.label}</div>
        <div className="mt-0.5 text-[13px] font-bold text-rose-500 dark:text-rose-300">{briefingImpact.value}</div>
      </div>
      <button className="glass-cta relative mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[12.5px] font-semibold">
        Play the 2-min briefing
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function RisksCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover rounded-[26px] p-7 ${className}`}>
      <CardHead title="Attrition radar" right={<button className="glass-cta flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold"><Sparkles className="h-3.5 w-3.5" /> Recommend actions</button>} />
      <div className="mt-4 flex items-center gap-1 text-[12px]">
        {[
          { label: "At-risk", n: "312", active: true },
          { label: "Watching", n: "96" },
          { label: "Actioned", n: "31" },
          { label: "Saved", n: "12" },
        ].map((t, i, arr) => (
          <span key={t.label} className="flex items-center">
            <button className={`rounded-full px-3 py-1.5 font-semibold transition ${t.active ? "glass-soft" : "t-faint hover:text-[color:var(--gl-text)]"}`}>
              {t.label} <span className="t-faint ml-1 text-[10.5px]">{t.n}</span>
            </button>
            {i < arr.length - 1 && <span className="t-faint mx-0.5">›</span>}
          </span>
        ))}
      </div>
      <ul className="mt-2 divide-y divide-[var(--gl-border-soft)]">
        {flightRisks.map((r) => (
          <li key={r.name} className="group flex cursor-pointer items-center gap-3.5 py-3.5">
            <Image src={r.img} alt={r.name} width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[var(--gl-border)]" style={{ boxShadow: `0 0 0 3px ${r.hue}22` }} />
            <div className="w-28 shrink-0">
              <div className="text-[13px] font-semibold">{r.name}</div>
              <div className="t-faint text-[10.5px]">{r.team}</div>
            </div>
            <div className="t-muted min-w-0 flex-1 truncate text-[12px]">{r.driver}</div>
            <div className="w-16 shrink-0">
              <div className="gl-track h-1.5 w-full overflow-hidden rounded-full">
                <div className={`h-full rounded-full ${r.level === "High" ? "bg-rose-400" : "bg-amber-400"}`} style={{ width: r.confidence }} />
              </div>
              <div className="t-muted mt-1 text-center text-[10px] font-bold">{r.confidence}</div>
            </div>
            <ArrowUpRight className="t-faint h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CampaignsCard({ className = "" }: { className?: string }) {
  const weakest = campaigns.reduce((a, b) => (a.participation / a.reach <= b.participation / b.reach ? a : b));
  return (
    <div className={`glass-card glass-card-hover flex flex-col rounded-[26px] p-7 ${className}`}>
      <CardHead title="Campaign effectiveness" right={<button className="text-[12px] font-semibold text-[var(--gl-accent)] hover:underline">New →</button>} />
      <ul className="mt-5 space-y-5">
        {campaigns.map((c) => {
          const engaged = Math.round((c.participation / c.reach) * 100);
          return (
            <li key={c.name}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-[13px] font-semibold">{c.name}</span>
                  <span className="t-faint shrink-0 text-[10.5px]">{c.audience}</span>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">{c.lift} lift</span>
              </div>
              <div className="gl-track relative mt-2.5 h-2.5 w-full overflow-hidden rounded-full">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${c.reach}%`, background: "rgba(129,140,248,0.4)" }} />
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${c.participation}%`, background: "#60a5fa" }} />
              </div>
              <div className="mt-2 flex items-center gap-3.5 text-[10.5px]">
                <span className="t-muted flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(129,140,248,0.8)" }} />
                  Reach <span className="font-bold">{c.reach}%</span>
                </span>
                <span className="t-muted flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#60a5fa" }} />
                  Participation <span className="font-bold">{c.participation}%</span>
                </span>
                <span className="t-faint ml-auto shrink-0 font-semibold">{engaged}% engaged</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto flex items-center gap-2 border-t border-[var(--gl-border-soft)] pt-4 text-[11px]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
        <span className="t-muted">
          <span className="font-semibold text-[var(--gl-text)]">{weakest.name}</span> lags — only {Math.round((weakest.participation / weakest.reach) * 100)}% of those reached engaged.
        </span>
      </div>
    </div>
  );
}

const HEAT = [
  { min: 80, cls: "bg-emerald-400/20 text-emerald-700 dark:text-emerald-200" },
  { min: 72, cls: "bg-violet-400/20 text-violet-700 dark:text-violet-200" },
  { min: 65, cls: "bg-amber-400/20 text-amber-700 dark:text-amber-200" },
  { min: 0, cls: "bg-rose-400/20 text-rose-700 dark:text-rose-200" },
];
const heat = (s: number) => HEAT.find((t) => s >= t.min)!.cls;

function DepartmentsCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover flex flex-col rounded-[26px] p-7 ${className}`}>
      <CardHead title="Engagement by department" right={<span className="t-faint text-[11px] font-medium">tap to drill down</span>} />
      <div className="mt-5 grid flex-1 auto-rows-fr grid-cols-2 gap-2.5 sm:grid-cols-5">
        {departments.map((d) => (
          <button key={d.name} className={`flex flex-col justify-center rounded-2xl px-3 py-3.5 text-left backdrop-blur-sm transition hover:scale-[1.04] ${heat(d.score)}`}>
            <div className="text-[19px] font-bold tracking-tight">{d.score}</div>
            <div className="mt-0.5 truncate text-[10.5px] font-medium opacity-85">{d.name}</div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--gl-border-soft)] pt-5">
        <ImpactStat value={businessImpact.attritionCorr} label="engagement ↔ attrition" />
        <ImpactStat value={businessImpact.productivityCorr} label="↔ productivity" />
        <ImpactStat value={businessImpact.attritionCost} label="cost of attrition / yr" />
        <p className="t-muted min-w-0 flex-1 text-[11.5px] font-medium leading-relaxed">
          <Sparkles className="mr-1 inline h-3 w-3 text-[#c084fc]" />
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
      <div className="t-faint text-[10.5px]">{label}</div>
    </div>
  );
}

const warmGrad = {
  backgroundImage: "linear-gradient(100deg, #60a5fa 0%, #8b9cf8 55%, #c084fc 110%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

function RecognitionCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card glass-card-hover flex flex-col rounded-[26px] p-7 ${className}`}>
      <CardHead title="Recognition" right={<Trophy className="h-4 w-4 text-[#e89b3c]" />} />
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[30px] font-bold tracking-tight">{recognitionBoard.total.toLocaleString()}</span>
        <span className="t-muted text-[12px]">
          sent · {recognitionBoard.coverage}% coverage · <span className="font-semibold text-[var(--gl-text)]">{recognitionBoard.topValue}</span> leads
        </span>
      </div>
      <div className="t-faint mt-5 text-[11px] font-semibold tracking-[0.14em]">TOP APPRECIATORS</div>
      <ul className="mb-5 mt-4 space-y-4">
        {recognitionBoard.leaders.map((l, i) => (
          <li key={l.name} className="flex items-center gap-3">
            <span className="t-faint w-4 text-[12px] font-bold">{i + 1}</span>
            <Image src={l.img} alt={l.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--gl-border)]" style={{ boxShadow: "0 0 0 3.5px " + l.hue + "33" }} />
            <div className="flex-1">
              <div className="text-[13px] font-semibold" style={i === 0 ? warmGrad : undefined}>{l.name}</div>
              <div className="t-faint text-[10.5px]">{l.team}</div>
            </div>
            <span className="text-[13px] font-bold">{l.given}</span>
          </li>
        ))}
      </ul>
      <div className="glass-soft mt-auto flex items-start gap-2 rounded-2xl px-4 py-3.5">
        <span className="text-[12px]">⚠️</span>
        <p className="text-[11.5px] font-medium leading-relaxed text-amber-700 dark:text-amber-200">
          Low-recognition zones: Plant Ops, Night shift, Finance — nudge those managers.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════ AI dock + mark ════════════════════════ */

function Dock() {
  return (
    <button className="glass-card fixed bottom-5 right-6 z-30 flex items-center gap-2.5 rounded-full py-2.5 pl-3 pr-4 transition hover:-translate-y-0.5">
      <span className="ai-aura grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#60a5fa] via-[#818cf8] to-[#a78bfa]">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-left">
        <span className="flex items-center gap-1 text-[12.5px] font-semibold">
          Vadal
          <span className="rounded-[4px] border border-[var(--gl-border-soft)] px-1 text-[8.5px] font-bold">AI</span>
        </span>
        <span className="t-faint block text-[10.5px]">What are you looking for today?</span>
      </span>
    </button>
  );
}

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="glmL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="glmR" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <g transform="rotate(-24 47 60)">
        <rect x="29" y="20" width="36" height="80" rx="17" fill="url(#glmL)" />
      </g>
      <g transform="rotate(24 73 60)">
        <rect x="55" y="20" width="36" height="80" rx="17" fill="url(#glmR)" fillOpacity="0.92" />
      </g>
    </svg>
  );
}
