import Image from "next/image";
import {
  Activity,
  BarChart2,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  Home,
  MessageSquare,
  Plus,
  Radio,
  Rss,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  org,
  health,
  voice,
  actionQueue,
  campaigns,
  recognitionBoard,
  departments,
  flightRisks,
  signals,
  engagementTrend,
  actionProgress,
  briefingImpact,
  businessImpact,
} from "@/lib/data";
import { TrendChart } from "@/components/charts";
import { CountUp, GenAlphaThemeToggle } from "./genalpha-chrome";

/* ── primitives ─────────────────────────────────────────────────── */

const ACCENT = {
  red: { fg: "var(--ga-red)", bg: "var(--ga-red-soft)" },
  orange: { fg: "var(--ga-orange)", bg: "var(--ga-orange-soft)" },
  blue: { fg: "var(--ga-blue)", bg: "var(--ga-blue-soft)" },
  yellow: { fg: "var(--ga-yellow)", bg: "var(--ga-yellow-soft)" },
  green: { fg: "var(--ga-green)", bg: "var(--ga-green-soft)" },
  purple: { fg: "var(--ga-purple)", bg: "var(--ga-purple-soft)" },
} as const;
type Accent = keyof typeof ACCENT;

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`ga-card ${className}`}>{children}</div>;
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] font-bold tracking-tight" style={{ color: "var(--ga-ink)" }}>
      {children}
    </p>
  );
}

/* big bold black number + small gray label below (Cal AI "1505 / Calories left") */
function Stat({
  value,
  label,
  size = 30,
}: {
  value: string;
  label: string;
  size?: number;
}) {
  return (
    <div>
      <p
        className="tabular-nums"
        style={{ fontSize: size, fontWeight: 800, color: "var(--ga-ink)", lineHeight: 1, letterSpacing: "-0.025em" }}
      >
        <CountUp value={value} />
      </p>
      <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: "var(--ga-muted)" }}>
        {label}
      </p>
    </div>
  );
}

/* thin ring gauge — Cal AI macro ring (track gray, rounded cap, tiny icon center) */
function Ring({
  pct,
  color,
  size = 64,
  stroke = 7,
  children,
}: {
  pct: number;
  color: string;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2 - 1;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(pct, 100) / 100);
  return (
    <div className="ga-ring relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--gauge-track)" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${c} ${c})`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${circ}` }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center">{children}</div>
      )}
    </div>
  );
}

/* ── sidebar ────────────────────────────────────────────────────── */

const NAV = [
  { icon: Home, label: "Home" },
  { icon: Activity, label: "Pulse", active: true },
  { icon: BarChart2, label: "Analytics" },
  { icon: BookOpen, label: "Surveys", badge: 3 },
  { icon: MessageSquare, label: "Sentiment" },
  { icon: Radio, label: "Always-on" },
  { icon: Star, label: "Recognition" },
  { icon: Rss, label: "Campaigns" },
  { icon: Users, label: "Manager hub", badge: 5 },
  { icon: Heart, label: "Health" },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-[224px] flex-none flex-col overflow-hidden px-4">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-1 pb-5 pt-5">
        <div
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
          style={{ background: "var(--ga-card)", boxShadow: "0 1px 3px rgba(13,13,15,0.07)" }}
        >
          <Image src={org.logo} alt={org.name} width={26} height={26} className="object-contain" />
        </div>
        <div>
          <p className="text-[14px] font-extrabold lowercase leading-none tracking-tight" style={{ color: "var(--ga-ink)" }}>
            {org.name}
          </p>
          <p className="mt-0.5 text-[10px] font-medium" style={{ color: "var(--ga-faint)" }}>
            {org.workspace}
          </p>
        </div>
        <ChevronDown size={14} strokeWidth={2} className="ml-auto" style={{ color: "var(--ga-faint)" }} />
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto pt-1">
        {NAV.map((item) => (
          <button key={item.label} className="ga-nav-item w-full" data-active={item.active ? "true" : "false"}>
            <item.icon size={16} strokeWidth={2.1} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span
                className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: "var(--ga-soft)", color: "var(--ga-ink)" }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* streak card */}
      <div className="ga-card mb-4 flex items-center gap-3 px-4 py-3.5">
        <Flame size={20} strokeWidth={2.2} className="ga-flame" style={{ color: "var(--ga-orange)" }} />
        <div>
          <p className="text-[14px] font-extrabold leading-none tabular-nums" style={{ color: "var(--ga-ink)" }}>
            12-day streak
          </p>
          <p className="mt-1 text-[10.5px] font-medium leading-tight" style={{ color: "var(--ga-muted)" }}>
            You check on your people daily
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ── top bar ────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <header className="flex h-[64px] flex-none items-center gap-3 px-7">
      <div
        className="ga-pillbox flex w-[300px] items-center gap-2 !font-medium"
        style={{ color: "var(--ga-faint)" }}
      >
        <Search size={14} strokeWidth={2} />
        <span className="text-[12.5px]">Search anything…</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="ga-pillbox">
          <Flame size={13} strokeWidth={2.2} className="ga-flame" style={{ color: "var(--ga-orange)" }} />
          12
        </span>
        <span className="ga-pillbox">
          <Zap size={13} strokeWidth={2.2} fill="var(--ga-yellow)" style={{ color: "var(--ga-yellow)" }} />
          2,450
        </span>
        <GenAlphaThemeToggle />
        <button className="ga-pillbox relative flex h-[30px] w-[30px] items-center justify-center !p-0" style={{ color: "var(--ga-muted)" }}>
          <Bell size={15} strokeWidth={2} />
          <span
            className="ga-livedot !absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--ga-red)" }}
          />
        </button>
        <Image
          src={org.userImg}
          alt={org.user}
          width={36}
          height={36}
          className="rounded-full object-cover"
          style={{ boxShadow: "0 1px 3px rgba(13,13,15,0.15)" }}
        />
      </div>
    </header>
  );
}

/* ── week strip — Cal AI date row, check-ins as dashed rings ────── */

const WEEK = [
  { d: "W", n: 3, state: "done" },
  { d: "T", n: 4, state: "done" },
  { d: "F", n: 5, state: "done" },
  { d: "S", n: 6, state: "done" },
  { d: "S", n: 7, state: "done" },
  { d: "M", n: 8, state: "done" },
  { d: "T", n: 9, state: "today" },
] as const;

function WeekStrip() {
  return (
    <div className="flex items-center justify-between px-7 pb-5">
      <div className="flex items-center gap-5">
        {WEEK.map((w, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10.5px] font-bold" style={{ color: "var(--ga-faint)" }}>
              {w.d}
            </span>
            <span className="ga-day" data-state={w.state}>
              {w.n}
            </span>
          </div>
        ))}
        <p className="ml-2 text-[11.5px] font-medium" style={{ color: "var(--ga-faint)" }}>
          6 check-ins this week
        </p>
      </div>

      <div className="ga-pillbox !p-1">
        {["7 days", "30 days", "Quarter", "Year"].map((p) => (
          <button key={p} className="ga-pill" data-active={p === "30 days" ? "true" : "false"}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── live ticker — monochrome signal marquee ────────────────────── */

const TICKER: { text: string; dot: string }[] = [
  { text: "3 employees at high flight-risk — act this week", dot: "var(--ga-red)" },
  { text: "Engineering engagement −6 pts · burnout theme rising", dot: "var(--ga-orange)" },
  { text: "5 manager actions pending · 2 overdue 1:1s in Sales", dot: "var(--ga-blue)" },
  { text: "Recognitions ↑ 12% this month · Ownership leads", dot: "var(--ga-green)" },
  { text: "Participation lower in Plant Ops & Night shift", dot: "var(--ga-yellow)" },
  { text: `Predicted impact if unaddressed: ${briefingImpact.value}`, dot: "var(--ga-purple)" },
];

function Ticker() {
  const items = [...TICKER, ...TICKER]; // doubled for a seamless loop
  return (
    <div className="ga-ticker mx-7 mb-5">
      <div className="ga-ticker-track">
        {items.map((t, i) => (
          <span
            key={i}
            aria-hidden={i >= TICKER.length}
            className="flex items-center gap-2 text-[11.5px] font-semibold whitespace-nowrap"
            style={{ color: "var(--ga-muted)" }}
          >
            <span className="ga-livedot h-1.5 w-1.5 rounded-full" style={{ background: t.dot }} />
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── hero — Cal AI calories card: huge number left, brand ring right ── */

const DRIVER_DOTS: Record<string, string> = {
  good: "var(--ga-green)",
  bad: "var(--ga-red)",
  neutral: "var(--ga-purple)",
};

function HeroCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex flex-1 items-center justify-between gap-6 px-7 pt-6">
        <div className="min-w-0">
          <p
            className="tabular-nums"
            style={{ fontSize: 56, fontWeight: 800, color: "var(--ga-ink)", lineHeight: 1, letterSpacing: "-0.03em" }}
          >
            <CountUp value={String(health.score)} duration={1400} />
          </p>
          <p className="mt-2 text-[12.5px] font-medium" style={{ color: "var(--ga-muted)" }}>
            Workforce health · {health.percentile} of GCC
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="ga-chip">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ga-green)" }} />↑ {health.delta} pts
            </span>
            <span className="ga-chip">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ga-blue)" }} />
              benchmark +{health.benchmarkDelta}
            </span>
            {health.drivers.slice(0, 2).map((d) => (
              <span key={d.label} className="ga-chip">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: DRIVER_DOTS[d.tone] }} />
                {d.label}
              </span>
            ))}
          </div>
        </div>
        <Ring pct={health.score} color="var(--ga-brand)" size={132} stroke={11}>
          <span
            className="grid h-12 w-12 place-items-center rounded-full"
            style={{ background: "var(--ga-soft)" }}
          >
            <Activity size={20} strokeWidth={2.2} style={{ color: "var(--ga-ink)" }} />
          </span>
        </Ring>
      </div>

      {/* health score bar — Cal AI yellow */}
      <div className="mx-7 mb-6 mt-5 rounded-2xl px-5 py-4" style={{ background: "var(--ga-soft)" }}>
        <div className="flex items-baseline justify-between">
          <Title>Health score</Title>
          <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--ga-ink)" }}>
            {health.score}/100
          </span>
        </div>
        <div className="ga-meter mt-2.5" style={{ background: "var(--gauge-track)" }}>
          <span style={{ width: `${health.score}%`, background: "var(--ga-yellow)" }} />
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed" style={{ color: "var(--ga-muted)" }}>
          {health.narrative}
        </p>
      </div>
    </Card>
  );
}

/* ── today's missions ───────────────────────────────────────────── */

const MISSION_XP = [30, 20, 15, 15];

function MissionsCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Today&apos;s missions</Title>
        <span className="text-[11.5px] font-bold tabular-nums" style={{ color: "var(--ga-faint)" }}>
          {actionProgress.closed}/{actionProgress.total}
        </span>
      </div>

      <div className="px-5 pt-3.5">
        <div className="ga-meter">
          <span style={{ width: `${actionProgress.pct}%`, background: "var(--ga-brand)" }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        {actionQueue.map((a, i) => (
          <button
            key={a.title}
            className="flex flex-1 items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition hover:bg-[var(--ga-soft)]"
          >
            <span
              className="grid h-7 w-7 flex-none place-items-center rounded-full text-[11px] font-extrabold"
              style={{ border: "1.6px dashed var(--ga-faint)", color: "var(--ga-ink)" }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-bold leading-snug" style={{ color: "var(--ga-ink)" }}>
                {a.title}
              </span>
              <span className="mt-0.5 block truncate text-[10.5px]" style={{ color: "var(--ga-faint)" }}>
                {a.context} · {a.due}
              </span>
            </span>
            <span className="ga-chip">
              <Zap size={10} strokeWidth={2.2} fill="var(--ga-yellow)" style={{ color: "var(--ga-yellow)" }} />
              +{MISSION_XP[i]}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── macro row — Cal AI protein/carbs/fat ring cards ────────────── */

const MACROS: { accent: Accent; icon: React.ElementType; ring: number }[] = [
  { accent: "blue", icon: Users, ring: 74 },
  { accent: "orange", icon: Star, ring: 61 },
  { accent: "red", icon: Heart, ring: 2.5 },
  { accent: "green", icon: Trophy, ring: 78 },
];

function MacroRow() {
  return (
    <div className="grid grid-cols-4 gap-4 px-7 pt-4">
      {signals.map((s, i) => {
        const m = MACROS[i];
        return (
          <Card key={s.title} className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <Stat value={s.value} label={s.title} size={28} />
              <p className="mt-1.5 truncate text-[10px]" style={{ color: "var(--ga-faint)" }}>
                {s.note}
              </p>
            </div>
            <Ring pct={m.ring} color={ACCENT[m.accent].fg} size={62} stroke={7}>
              <span
                className="grid h-7 w-7 place-items-center rounded-full"
                style={{ background: ACCENT[m.accent].bg, color: ACCENT[m.accent].fg }}
              >
                <m.icon size={13} strokeWidth={2.2} />
              </span>
            </Ring>
          </Card>
        );
      })}
    </div>
  );
}

/* ── needs attention — "recently uploaded" rows ─────────────────── */

function RiskCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Needs attention</Title>
        <span className="ga-chip">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ga-red)" }} />
          {flightRisks.length} people
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        {flightRisks.map((r) => {
          const high = r.level === "High";
          return (
            <button
              key={r.name}
              className="flex flex-1 items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition hover:bg-[var(--ga-soft)]"
            >
              <Image src={r.img} alt={r.name} width={38} height={38} className="rounded-2xl object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold leading-none" style={{ color: "var(--ga-ink)" }}>
                  {r.name}
                </span>
                <span className="mt-1 block truncate text-[10.5px]" style={{ color: "var(--ga-faint)" }}>
                  {r.driver}
                </span>
              </span>
              <span className="flex-none text-right">
                <span
                  className="block text-[14px] font-extrabold tabular-nums"
                  style={{ color: high ? "var(--ga-red)" : "var(--ga-orange)" }}
                >
                  {r.confidence}
                </span>
                <span className="text-[9.5px] font-semibold" style={{ color: "var(--ga-faint)" }}>
                  {r.level.toLowerCase()} risk
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ── mood meter ─────────────────────────────────────────────────── */

const MOOD_EMOJI = ["😄", "😐", "😟"];
const MOOD_COLORS = ["var(--ga-green)", "var(--ga-yellow)", "var(--ga-red)"];
const THEME_ACCENT: Record<string, Accent> = { good: "green", bad: "red", warn: "orange", purple: "purple" };

function VoiceCard() {
  const total = voice.mood.reduce((s, m) => s + m.pct, 0);
  const maxMentions = Math.max(...voice.themes.map((t) => t.mentions));
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Mood meter</Title>
        <span className="text-[11.5px] font-bold tabular-nums" style={{ color: "var(--ga-faint)" }}>
          {voice.comments.toLocaleString()} comments
        </span>
      </div>

      <div className="px-5 pt-4">
        <div className="flex h-[8px] gap-1 overflow-hidden rounded-full">
          {voice.mood.map((m, i) => (
            <div
              key={m.label}
              className="rounded-full"
              style={{ width: `${(m.pct / total) * 100}%`, background: MOOD_COLORS[i] }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {voice.mood.map((m, i) => (
            <span key={m.label} className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--ga-muted)" }}>
              <span className="text-[13px]">{MOOD_EMOJI[i]}</span>
              {m.pct}%
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-1.5">
        {voice.themes.map((t) => (
          <div key={t.name} className="flex flex-1 items-center gap-3 rounded-2xl px-2.5 py-1.5">
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between">
                <span className="text-[12px] font-bold" style={{ color: "var(--ga-ink)" }}>
                  {t.name}
                </span>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: "var(--ga-faint)" }}>
                  {t.mentions}
                </span>
              </span>
              <span className="ga-meter mt-1.5 block">
                <span
                  style={{
                    width: `${(t.mentions / maxMentions) * 100}%`,
                    background: ACCENT[THEME_ACCENT[t.tone]].fg,
                    opacity: 0.85,
                  }}
                />
              </span>
            </span>
            <span className="ga-chip">{t.tag.replace("▲ ", "↑ ").replace("▼ ", "↓ ")}</span>
          </div>
        ))}
      </div>

      <div className="mx-5 mb-4 rounded-2xl px-4 py-3" style={{ background: "var(--ga-soft)" }}>
        <p className="text-[11.5px] italic leading-relaxed" style={{ color: "var(--ga-muted)" }}>
          &ldquo;{voice.quote.text}&rdquo;
        </p>
        <p className="mt-1 text-[9.5px] font-semibold" style={{ color: "var(--ga-faint)" }}>
          {voice.quote.meta}
        </p>
      </div>
    </Card>
  );
}

/* ── recognition leaders ────────────────────────────────────────── */

const MEDALS = ["🥇", "🥈", "🥉"];

function RecognitionCard() {
  const maxGiven = Math.max(...recognitionBoard.leaders.map((l) => l.given));
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Recognition leaders</Title>
        <span className="ga-chip">{recognitionBoard.topValue}</span>
      </div>

      <div className="flex items-end justify-between px-5 pt-4">
        <Stat value={recognitionBoard.total.toLocaleString()} label="recognitions sent" size={32} />
        <Ring pct={recognitionBoard.coverage} color="var(--ga-purple)" size={56} stroke={6.5}>
          <span className="text-[12px] font-extrabold tabular-nums" style={{ color: "var(--ga-ink)" }}>
            {recognitionBoard.coverage}
          </span>
        </Ring>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-4 pt-2">
        {recognitionBoard.leaders.map((l, i) => (
          <div
            key={l.name}
            className="flex flex-1 items-center gap-3 rounded-2xl px-2.5 py-2 transition hover:bg-[var(--ga-soft)]"
          >
            <span className="w-6 text-center text-[17px]">{MEDALS[i]}</span>
            <Image src={l.img} alt={l.name} width={32} height={32} className="rounded-full object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-bold leading-none" style={{ color: "var(--ga-ink)" }}>
                {l.name}
              </span>
              <span className="mt-1 block text-[10px]" style={{ color: "var(--ga-faint)" }}>
                {l.team}
              </span>
            </span>
            <span className="flex w-24 items-center gap-2">
              <span className="ga-meter flex-1">
                <span style={{ width: `${(l.given / maxGiven) * 100}%`, background: "var(--ga-brand)" }} />
              </span>
              <span className="text-[13px] font-extrabold tabular-nums" style={{ color: "var(--ga-ink)" }}>
                {l.given}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── team league ────────────────────────────────────────────────── */

function LeagueCard() {
  const sorted = [...departments].sort((a, b) => b.score - a.score);
  const max = sorted[0].score;
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Team league</Title>
        <span className="text-[11.5px] font-bold" style={{ color: "var(--ga-faint)" }}>
          {departments.length} teams
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        {sorted.map((d, i) => {
          const zone = i < 3 ? "promo" : i >= sorted.length - 2 ? "demo" : "mid";
          return (
            <div key={d.name}>
              {i === 3 && (
                <div className="flex items-center gap-2 px-2.5 py-1">
                  <span className="h-px flex-1" style={{ background: "var(--ga-line)" }} />
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider" style={{ color: "var(--ga-green)" }}>
                    promotion zone
                  </span>
                </div>
              )}
              {i === sorted.length - 2 && (
                <div className="flex items-center gap-2 px-2.5 py-1">
                  <span className="h-px flex-1" style={{ background: "var(--ga-line)" }} />
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider" style={{ color: "var(--ga-red)" }}>
                    needs a boost
                  </span>
                </div>
              )}
              <div className="flex flex-1 items-center gap-2.5 rounded-xl px-2.5 py-[5px]">
                <span
                  className="grid h-6 w-6 flex-none place-items-center rounded-full text-[10px] font-extrabold tabular-nums"
                  style={
                    zone === "promo"
                      ? { background: "var(--ga-brand)", color: "var(--ga-brand-contrast)" }
                      : { background: "var(--ga-soft)", color: zone === "demo" ? "var(--ga-red)" : "var(--ga-faint)" }
                  }
                >
                  {i + 1}
                </span>
                <span className="w-[74px] shrink-0 text-[11.5px] font-semibold" style={{ color: "var(--ga-ink)" }}>
                  {d.name}
                </span>
                <span className="ga-meter flex-1">
                  <span
                    style={{
                      width: `${(d.score / max) * 100}%`,
                      background:
                        zone === "promo" ? "var(--ga-brand)" : zone === "demo" ? "var(--ga-red)" : "var(--bench)",
                    }}
                  />
                </span>
                <span className="w-6 text-right text-[12px] font-extrabold tabular-nums" style={{ color: "var(--ga-ink)" }}>
                  {d.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── campaigns ──────────────────────────────────────────────────── */

function CampaignCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Campaigns</Title>
        <span className="text-[11.5px] font-bold" style={{ color: "var(--ga-faint)" }}>
          {campaigns.length} active
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        {campaigns.map((c) => (
          <div key={c.name} className="flex flex-1 flex-col justify-center rounded-2xl px-2.5 py-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[12.5px] font-bold" style={{ color: "var(--ga-ink)" }}>
                {c.name}
              </p>
              <span className="ga-chip">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ga-green)" }} />↑{" "}
                {c.lift.replace("+", "")} pts
              </span>
            </div>
            <p className="mt-0.5 text-[10px]" style={{ color: "var(--ga-faint)" }}>
              {c.audience}
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <div className="ga-meter flex-1">
                <span style={{ width: `${c.participation}%`, background: "var(--ga-brand)" }} />
              </div>
              <span className="text-[10.5px] font-bold tabular-nums" style={{ color: "var(--ga-muted)" }}>
                {c.participation}%<span style={{ color: "var(--ga-faint)", fontWeight: 500 }}> / {c.reach}%</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-5 mb-4 rounded-2xl px-4 py-3" style={{ background: "var(--ga-soft)" }}>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: "var(--ga-muted)" }}>
          <b style={{ color: "var(--ga-ink)", fontWeight: 700 }}>Night-shift pulse</b> needs a boost — try team
          champions in Plant Ops.
        </p>
      </div>
    </Card>
  );
}

/* ── progress (trend + wins + CTA) ──────────────────────────────── */

function ProgressCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Title>Goal progress</Title>
        <span className="ga-chip">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ga-green)" }} />
          {businessImpact.attritionCost} saved
        </span>
      </div>

      <div className="px-4 pt-4">
        <TrendChart
          series={[...engagementTrend.series]}
          benchmark={[...engagementTrend.benchmark]}
          color="var(--ga-brand)"
          height={120}
          id="ga-trend"
        />
      </div>
      <div className="flex justify-between px-5 pb-1 pt-1.5">
        {engagementTrend.months.filter((_, i) => i % 2 === 0).map((m) => (
          <span key={m} className="text-[9px] font-semibold" style={{ color: "var(--ga-faint)" }}>
            {m}
          </span>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 px-5 pt-3">
        <div className="rounded-2xl px-4 py-3" style={{ background: "var(--ga-soft)" }}>
          <p className="tabular-nums text-[17px] font-extrabold" style={{ color: "var(--ga-ink)" }}>
            {businessImpact.attritionCorr}
          </p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight" style={{ color: "var(--ga-faint)" }}>
            engagement ↔ attrition
          </p>
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ background: "var(--ga-soft)" }}>
          <p className="tabular-nums text-[17px] font-extrabold" style={{ color: "var(--ga-ink)" }}>
            {businessImpact.productivityCorr}
          </p>
          <p className="mt-0.5 text-[10px] font-medium leading-tight" style={{ color: "var(--ga-faint)" }}>
            engagement ↔ productivity
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        <button className="ga-btn w-full">
          <Sparkles size={13} strokeWidth={2.2} />
          Open AI briefing
          <ChevronRight size={13} strokeWidth={2.2} />
        </button>
        <p className="mt-2 text-center text-[10px] font-medium" style={{ color: "var(--ga-faint)" }}>
          {briefingImpact.label}: {briefingImpact.value}
        </p>
      </div>
    </Card>
  );
}

/* ── page ───────────────────────────────────────────────────────── */

export default function GenAlphaPage() {
  return (
    <div className="genalpha-root flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <div className="relative flex-1 overflow-y-auto pb-10">
          <div className="flex items-center justify-between px-7 pb-4 pt-2">
            <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--ga-ink)" }}>
              Pulse
            </h2>
            <p className="text-[11.5px] font-medium" style={{ color: "var(--ga-faint)" }}>
              {org.date} · {org.headcount.toLocaleString()} people
            </p>
          </div>

          <WeekStrip />

          <Ticker />

          {/* hero row */}
          <div className="rise rise-1 grid grid-cols-3 gap-4 px-7">
            <div className="col-span-2">
              <HeroCard />
            </div>
            <MissionsCard />
          </div>

          <div className="rise rise-2">
            <MacroRow />
          </div>

          {/* row C */}
          <div className="rise rise-3 grid grid-cols-3 gap-4 px-7 pt-4">
            <RiskCard />
            <VoiceCard />
            <RecognitionCard />
          </div>

          {/* row D */}
          <div className="rise rise-4 grid grid-cols-3 gap-4 px-7 pt-4">
            <LeagueCard />
            <CampaignCard />
            <ProgressCard />
          </div>
        </div>

        {/* floating action — Cal AI black + */}
        <button className="ga-fab fixed bottom-7 right-7 z-40" aria-label="New action">
          <Plus size={24} strokeWidth={2.4} />
        </button>
      </main>
    </div>
  );
}
