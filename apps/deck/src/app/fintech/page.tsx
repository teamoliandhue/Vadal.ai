import Image from "next/image";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  BookOpen,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  FileBarChart,
  Heart,
  Home,
  MessageSquare,
  Radio,
  Rss,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
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
  aiBriefing,
  briefingImpact,
} from "@/lib/data";
import { TrendChart, Sparkline } from "@/components/charts";
import { FintechThemeToggle } from "./fintech-chrome";

/* ── primitives ─────────────────────────────────────────────────── */

function Lbl({ children }: { children: React.ReactNode }) {
  return <p className="ft-label">{children}</p>;
}

/* superscript number — the fintech signature ($1,992.04 style).
   Splits a value like "74%" into a large integer and a raised suffix. */
function SupNum({
  value,
  size = 30,
}: {
  value: string;
  size?: number;
}) {
  const m = value.match(/^([+−-]?[\d,.]+)(.*)$/);
  const num = m ? m[1] : value;
  const suffix = m ? m[2] : "";
  return (
    <span
      className="font-semibold tabular-nums"
      style={{ color: "var(--ft-ink)", fontSize: size, letterSpacing: "-0.02em", lineHeight: 1 }}
    >
      {num}
      {suffix && (
        <sup
          className="font-semibold"
          style={{ fontSize: size * 0.52, color: "var(--ft-muted)", verticalAlign: "super" }}
        >
          {suffix}
        </sup>
      )}
    </span>
  );
}

/* soft tinted delta chip */
function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "good" | "bad" | "warn" | "accent" | "neutral";
}) {
  const map = {
    good: { bg: "var(--ft-good-soft)", fg: "var(--ft-good)" },
    bad: { bg: "var(--ft-bad-soft)", fg: "var(--ft-bad)" },
    warn: { bg: "var(--ft-warn-soft)", fg: "var(--ft-warn)" },
    accent: { bg: "var(--ft-accent-soft)", fg: "var(--ft-accent-ink)" },
    neutral: { bg: "var(--ft-border)", fg: "var(--ft-muted)" },
  } as const;
  return (
    <span className="ft-chip" style={{ background: map[tone].bg, color: map[tone].fg }}>
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`ft-card ${className}`}>{children}</div>;
}

/* ── sidebar ────────────────────────────────────────────────────── */

const NAV: {
  section: string;
  items: { icon: React.ElementType; label: string; active?: boolean; badge?: number }[];
}[] = [
  {
    section: "Track",
    items: [
      { icon: Home, label: "Home" },
      { icon: Activity, label: "Pulse", active: true },
      { icon: BarChart2, label: "Analytics" },
    ],
  },
  {
    section: "Surveys",
    items: [
      { icon: BookOpen, label: "Surveys", badge: 3 },
      { icon: MessageSquare, label: "Sentiment" },
      { icon: Radio, label: "Always-on" },
    ],
  },
  {
    section: "Culture",
    items: [
      { icon: Star, label: "Recognition" },
      { icon: Rss, label: "Campaigns" },
    ],
  },
  {
    section: "People",
    items: [
      { icon: Users, label: "Manager hub", badge: 5 },
      { icon: Heart, label: "Health" },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-[218px] flex-none flex-col overflow-hidden px-3">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-5">
        <div
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px]"
          style={{ background: "var(--ft-card)", border: "1px solid var(--ft-border)" }}
        >
          <Image src={org.logo} alt={org.name} width={26} height={26} className="object-contain" />
        </div>
        <div>
          <p className="text-[13px] font-semibold lowercase leading-none" style={{ color: "var(--ft-ink)" }}>
            {org.name}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: "var(--ft-faint)" }}>
            {org.workspace}
          </p>
        </div>
        <ChevronDown size={13} className="ml-auto" style={{ color: "var(--ft-faint)" }} />
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto pt-1">
        {NAV.map((group) => (
          <div key={group.section} className="mb-5">
            <p
              className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--ft-faint)" }}
            >
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="ft-nav-item w-full"
                  data-active={item.active ? "true" : "false"}
                >
                  <item.icon size={14.5} strokeWidth={1.8} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold"
                      style={{ background: "var(--ft-accent-soft)", color: "var(--ft-accent-ink)" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* user */}
      <div
        className="mb-3 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5"
        style={{ background: "var(--ft-card)", border: "1px solid var(--ft-border)" }}
      >
        <Image src={org.userImg} alt={org.user} width={30} height={30} className="rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-[12px] font-medium leading-none" style={{ color: "var(--ft-ink)" }}>
            {org.user}
          </p>
          <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--ft-faint)" }}>
            People lead
          </p>
        </div>
        <Settings size={13} strokeWidth={1.8} className="ml-auto" style={{ color: "var(--ft-faint)" }} />
      </div>
    </aside>
  );
}

/* ── top bar ────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <header className="flex h-[58px] flex-none items-center gap-3 px-8">
      {/* search */}
      <div
        className="flex w-[320px] items-center gap-2 rounded-full px-4 py-2 text-[12.5px]"
        style={{
          background: "var(--ft-card)",
          border: "1px solid var(--ft-border)",
          color: "var(--ft-faint)",
        }}
      >
        <Search size={13.5} strokeWidth={1.8} />
        <span>Search people, teams, insights…</span>
        <kbd className="ml-auto text-[10px]" style={{ color: "var(--ft-faint)" }}>
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium"
          style={{ color: "var(--ft-muted)" }}
        >
          <Sparkles size={13} style={{ color: "var(--ft-accent)" }} />
          Intelligence
        </button>
        <FintechThemeToggle />
        <button
          className="relative grid h-9 w-9 place-items-center rounded-full"
          style={{ color: "var(--ft-muted)" }}
        >
          <Bell size={15} strokeWidth={1.8} />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--ft-accent)" }}
          />
        </button>
        <Image
          src={org.userImg}
          alt={org.user}
          width={32}
          height={32}
          className="ml-1 rounded-full object-cover"
          style={{ outline: "2px solid var(--ft-card)" }}
        />
      </div>
    </header>
  );
}

/* ── greeting + quick actions ───────────────────────────────────── */

const PERIODS = ["7 days", "30 days", "Quarter", "Year"];

function Greeting() {
  return (
    <div className="flex items-end justify-between px-8 pb-5 pt-4">
      <div>
        <p className="text-[12px]" style={{ color: "var(--ft-faint)" }}>
          {org.date} · {org.headcount.toLocaleString()} people
        </p>
        <h1
          className="mt-1 text-[26px] font-semibold tracking-tight"
          style={{ color: "var(--ft-ink)", letterSpacing: "-0.02em" }}
        >
          Good morning, {org.user}
        </h1>
        {/* quick actions — the Mercury Send/Request/Transfer row */}
        <div className="mt-4 flex items-center gap-2">
          <button className="ft-action" data-primary="true">
            <Sparkles size={13} />
            AI briefing
          </button>
          <button className="ft-action">
            <CalendarPlus size={13} style={{ color: "var(--ft-accent)" }} />
            Schedule 1:1
          </button>
          <button className="ft-action">
            <Star size={13} style={{ color: "var(--ft-accent)" }} />
            Recognize
          </button>
          <button className="ft-action">
            <FileBarChart size={13} style={{ color: "var(--ft-accent)" }} />
            New survey
          </button>
        </div>
      </div>

      {/* period picker */}
      <div
        className="flex items-center gap-0.5 rounded-full p-1"
        style={{ background: "var(--ft-border)" }}
      >
        {PERIODS.map((p) => (
          <button key={p} className="ft-pill" data-active={p === "30 days" ? "true" : "false"}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── hero: health "balance" card ────────────────────────────────── */

function HealthHero() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-start justify-between px-6 pt-5">
        <div>
          <Lbl>Workforce health</Lbl>
          <div className="mt-2 flex items-baseline gap-3">
            <span
              className="font-semibold tabular-nums"
              style={{ color: "var(--ft-ink)", fontSize: 44, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {health.score}
              <sup className="font-medium" style={{ fontSize: 20, color: "var(--ft-faint)" }}>
                /100
              </sup>
            </span>
            <Chip tone="good">
              <ArrowUpRight size={11} strokeWidth={2.4} />
              {health.delta} pts
            </Chip>
            <Chip tone="accent">benchmark +{health.benchmarkDelta}</Chip>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[11px]" style={{ color: "var(--ft-faint)" }}>
              GCC percentile
            </p>
            <p className="text-[14px] font-semibold" style={{ color: "var(--ft-ink)" }}>
              {health.percentile}
            </p>
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="mt-3 flex-1 px-2">
        <TrendChart
          series={[...engagementTrend.series]}
          benchmark={[...engagementTrend.benchmark]}
          color="var(--ft-accent)"
          height={170}
          id="ft-trend"
        />
      </div>
      <div className="flex justify-between px-6 pb-3 pt-1">
        {engagementTrend.months.map((m) => (
          <span key={m} className="text-[9.5px]" style={{ color: "var(--ft-faint)" }}>
            {m}
          </span>
        ))}
      </div>

      <div className="ft-divider" />
      <div className="flex items-center gap-2 px-6 py-3.5">
        <Sparkles size={12} style={{ color: "var(--ft-accent)", flexShrink: 0 }} />
        <p className="text-[12px]" style={{ color: "var(--ft-muted)" }}>
          {engagementTrend.insight}
        </p>
      </div>
    </Card>
  );
}

/* ── today panel (AI briefing) ──────────────────────────────────── */

const BRIEF_TONES = ["bad", "warn", "accent"] as const;

function TodayCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Today for you</Lbl>
        <Chip tone="accent">
          <Sparkles size={10} />
          AI
        </Chip>
      </div>

      <div className="flex flex-1 flex-col px-2 pt-2">
        {aiBriefing.map((b, i) => (
          <button
            key={b.text}
            className="ft-row flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left"
          >
            <span
              className="grid h-8 w-8 flex-none place-items-center rounded-full"
              style={{
                background:
                  BRIEF_TONES[i] === "bad"
                    ? "var(--ft-bad-soft)"
                    : BRIEF_TONES[i] === "warn"
                      ? "var(--ft-warn-soft)"
                      : "var(--ft-accent-soft)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    BRIEF_TONES[i] === "bad"
                      ? "var(--ft-bad)"
                      : BRIEF_TONES[i] === "warn"
                        ? "var(--ft-warn)"
                        : "var(--ft-accent)",
                }}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium leading-snug" style={{ color: "var(--ft-ink)" }}>
                {b.text}
              </span>
              <span className="mt-0.5 block text-[11px]" style={{ color: "var(--ft-faint)" }}>
                {b.sub}
              </span>
            </span>
            <ChevronRight size={14} className="flex-none" style={{ color: "var(--ft-faint)" }} />
          </button>
        ))}
      </div>

      <div className="ft-divider" />
      <div className="px-5 py-3.5">
        <p className="text-[11px]" style={{ color: "var(--ft-faint)" }}>
          {briefingImpact.label}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold tabular-nums" style={{ color: "var(--ft-bad)" }}>
          {briefingImpact.value}
        </p>
      </div>
    </Card>
  );
}

/* ── KPI cards ──────────────────────────────────────────────────── */

const KPI_TONES = ["bad", "good", "bad", "good"] as const;
const KPI_COLORS = ["#e58a83", "#4cbf92", "#e58a83", "#8b9cf8"];

function KpiRow() {
  return (
    <div className="grid grid-cols-4 gap-4 px-8 pt-4">
      {signals.map((s, i) => (
        <Card key={s.title} className="px-5 py-4">
          <div className="flex items-center justify-between">
            <Lbl>{s.title}</Lbl>
            <Chip tone={KPI_TONES[i]}>
              {KPI_TONES[i] === "good" ? (
                <ArrowUpRight size={10} strokeWidth={2.4} />
              ) : (
                <ArrowDownRight size={10} strokeWidth={2.4} />
              )}
              {s.delta.replace(/[▲▼]\s?/, "")}
            </Chip>
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-3">
            <SupNum value={s.value} size={28} />
            <Sparkline
              values={[...s.spark]}
              color={KPI_COLORS[i]}
              id={`ft-kpi-${i}`}
              height={30}
              className="w-16 opacity-90"
            />
          </div>
          <p className="mt-2 text-[10.5px] leading-tight" style={{ color: "var(--ft-faint)" }}>
            {s.note}
          </p>
        </Card>
      ))}
    </div>
  );
}

/* ── flight risk (transactions-style list) ──────────────────────── */

function RiskCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Flight risk</Lbl>
        <Chip tone="bad">{flightRisks.length} people</Chip>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-2">
        {flightRisks.map((r) => (
          <button key={r.name} className="ft-row flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left">
            <Image
              src={r.img}
              alt={r.name}
              width={32}
              height={32}
              className="rounded-full object-cover"
              style={{ outline: "2px solid var(--ft-border)" }}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium leading-none" style={{ color: "var(--ft-ink)" }}>
                {r.name}
              </span>
              <span className="mt-1 block truncate text-[10.5px]" style={{ color: "var(--ft-faint)" }}>
                {r.team} · {r.driver}
              </span>
            </span>
            <span className="flex-none text-right">
              <span
                className="block text-[13px] font-semibold tabular-nums"
                style={{ color: r.level === "High" ? "var(--ft-bad)" : "var(--ft-warn)" }}
              >
                {r.confidence}
              </span>
              <span className="text-[9.5px]" style={{ color: "var(--ft-faint)" }}>
                {r.level} risk
              </span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── action queue (bill-pay style) ──────────────────────────────── */

const DUE_TONE: Record<string, "bad" | "warn" | "neutral"> = {
  Today: "bad",
  Tomorrow: "warn",
  "This week": "neutral",
};

function ActionCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Action queue</Lbl>
        <span className="text-[11px] tabular-nums" style={{ color: "var(--ft-muted)" }}>
          {actionProgress.closed}/{actionProgress.total} closed
        </span>
      </div>
      <div className="px-5 pt-3">
        <div className="ft-meter">
          <span style={{ width: `${actionProgress.pct}%`, background: "var(--ft-accent)" }} />
        </div>
        <p className="mt-1.5 text-[10.5px]" style={{ color: "var(--ft-faint)" }}>
          {actionProgress.pct}% resolved · avg {actionProgress.avgDays} days
        </p>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-1.5">
        {actionQueue.map((a) => (
          <button key={a.title} className="ft-row flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left">
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium leading-snug" style={{ color: "var(--ft-ink)" }}>
                {a.title}
              </span>
              <span className="mt-0.5 block truncate text-[10.5px]" style={{ color: "var(--ft-faint)" }}>
                {a.context}
              </span>
            </span>
            <Chip tone={DUE_TONE[a.due] ?? "neutral"}>{a.due}</Chip>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── employee voice ─────────────────────────────────────────────── */

function VoiceCard() {
  const total = voice.mood.reduce((s, m) => s + m.pct, 0);
  const maxMentions = Math.max(...voice.themes.map((t) => t.mentions));
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Employee voice</Lbl>
        <span className="text-[11px] tabular-nums" style={{ color: "var(--ft-muted)" }}>
          {voice.comments.toLocaleString()} comments
        </span>
      </div>

      {/* sentiment split */}
      <div className="px-5 pt-4">
        <div className="flex h-[6px] gap-0.5 overflow-hidden rounded-full">
          {voice.mood.map((m) => (
            <div key={m.label} style={{ width: `${(m.pct / total) * 100}%`, background: m.color, borderRadius: 99 }} />
          ))}
        </div>
        <div className="mt-2 flex gap-3.5">
          {voice.mood.map((m) => (
            <span key={m.label} className="flex items-center gap-1 text-[10.5px]" style={{ color: "var(--ft-muted)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
              {m.pct}% {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* themes */}
      <div className="flex flex-1 flex-col px-2 pb-1 pt-2">
        {voice.themes.map((t) => {
          const tone =
            t.tone === "good" ? "good" : t.tone === "bad" ? "bad" : t.tone === "warn" ? "warn" : "accent";
          const barColor =
            tone === "good"
              ? "var(--ft-good)"
              : tone === "bad"
                ? "var(--ft-bad)"
                : tone === "warn"
                  ? "var(--ft-warn)"
                  : "var(--ft-accent)";
          return (
            <div key={t.name} className="ft-row flex flex-1 items-center gap-3 rounded-xl px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between">
                  <span className="text-[12px] font-medium" style={{ color: "var(--ft-ink)" }}>
                    {t.name}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: "var(--ft-faint)" }}>
                    {t.mentions}
                  </span>
                </span>
                <span className="ft-meter mt-1.5 block">
                  <span
                    style={{ width: `${(t.mentions / maxMentions) * 100}%`, background: barColor, opacity: 0.65 }}
                  />
                </span>
              </span>
              <Chip tone={tone}>{t.tag}</Chip>
            </div>
          );
        })}
      </div>

      <div className="ft-divider" />
      <div className="px-5 py-3.5">
        <p className="text-[11.5px] italic leading-relaxed" style={{ color: "var(--ft-muted)" }}>
          &ldquo;{voice.quote.text}&rdquo;
        </p>
        <p className="mt-1 text-[10px]" style={{ color: "var(--ft-faint)" }}>
          {voice.quote.meta}
        </p>
      </div>
    </Card>
  );
}

/* ── campaigns ──────────────────────────────────────────────────── */

function CampaignCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Campaign effectiveness</Lbl>
        <span className="text-[11px]" style={{ color: "var(--ft-muted)" }}>
          {campaigns.length} active
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-2">
        {campaigns.map((c) => (
          <div key={c.name} className="ft-row flex flex-1 flex-col justify-center rounded-xl px-3 py-2.5">
            <div className="flex items-baseline justify-between">
              <p className="text-[12.5px] font-medium" style={{ color: "var(--ft-ink)" }}>
                {c.name}
              </p>
              <Chip tone="good">
                <ArrowUpRight size={10} strokeWidth={2.4} />
                {c.lift.replace("+", "")}
              </Chip>
            </div>
            <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--ft-faint)" }}>
              {c.audience}
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <div className="relative h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--ft-border)" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${c.reach}%`, background: "var(--ft-accent-soft)" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${c.participation}%`, background: "var(--ft-accent)" }}
                />
              </div>
              <span className="text-[10.5px] tabular-nums" style={{ color: "var(--ft-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--ft-accent-ink)" }}>
                  {c.participation}%
                </span>
                <span style={{ color: "var(--ft-faint)" }}> / {c.reach}%</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="ft-divider" />
      <div className="px-5 py-3">
        <p className="text-[11px]" style={{ color: "var(--ft-faint)" }}>
          Participation / reach · weakest{" "}
          <span style={{ color: "var(--ft-ink)", fontWeight: 500 }}>
            {campaigns.reduce((a, b) => (b.participation < a.participation ? b : a)).name}
          </span>
        </p>
      </div>
    </Card>
  );
}

/* ── recognition ────────────────────────────────────────────────── */

function RecognitionCard() {
  const maxGiven = Math.max(...recognitionBoard.leaders.map((l) => l.given));
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Recognition</Lbl>
        <Chip tone="accent">{recognitionBoard.topValue}</Chip>
      </div>

      <div className="flex items-end justify-between px-5 pt-4">
        <div>
          <SupNum value={recognitionBoard.total.toLocaleString()} size={32} />
          <p className="mt-1 text-[10.5px]" style={{ color: "var(--ft-faint)" }}>
            recognitions this period
          </p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--ft-ink)" }}>
            {recognitionBoard.coverage}
            <sup className="text-[9px] font-medium" style={{ color: "var(--ft-faint)" }}>
              %
            </sup>
          </p>
          <p className="text-[10px]" style={{ color: "var(--ft-faint)" }}>
            coverage
          </p>
        </div>
      </div>
      <div className="px-5 pt-2.5">
        <div className="ft-meter">
          <span style={{ width: `${recognitionBoard.coverage}%`, background: "var(--ft-accent)" }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-2.5">
        {recognitionBoard.leaders.map((l) => (
          <div key={l.name} className="ft-row flex flex-1 items-center gap-3 rounded-xl px-3 py-2">
            <Image
              src={l.img}
              alt={l.name}
              width={28}
              height={28}
              className="rounded-full object-cover"
              style={{ outline: "2px solid var(--ft-border)" }}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium leading-none" style={{ color: "var(--ft-ink)" }}>
                {l.name}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className="ft-meter w-14">
                  <span style={{ width: `${(l.given / maxGiven) * 100}%`, background: l.hue, opacity: 0.8 }} />
                </span>
                <span className="text-[9.5px]" style={{ color: "var(--ft-faint)" }}>
                  {l.team}
                </span>
              </span>
            </span>
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--ft-ink)" }}>
              {l.given}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── departments (accounts-style list) ──────────────────────────── */

function DeptCard() {
  const max = Math.max(...departments.map((d) => d.score));
  const avg = Math.round(departments.reduce((s, d) => s + d.score, 0) / departments.length);
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <Lbl>Engagement by department</Lbl>
        <span className="text-[11px]" style={{ color: "var(--ft-muted)" }}>
          {departments.length} teams
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-2">
        {[...departments]
          .sort((a, b) => b.score - a.score)
          .map((d) => (
            <div key={d.name} className="ft-row flex flex-1 items-center gap-3 rounded-lg px-3">
              <span className="w-[74px] shrink-0 text-[11.5px]" style={{ color: "var(--ft-ink)" }}>
                {d.name}
              </span>
              <div className="ft-meter flex-1">
                <span
                  style={{
                    width: `${(d.score / max) * 100}%`,
                    background:
                      d.score >= 78 ? "var(--ft-good)" : d.score >= 68 ? "var(--ft-accent)" : "var(--ft-bad)",
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="w-6 text-right text-[11.5px] font-semibold tabular-nums" style={{ color: "var(--ft-ink)" }}>
                {d.score}
              </span>
            </div>
          ))}
      </div>
      <div className="ft-divider" />
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[11px]" style={{ color: "var(--ft-faint)" }}>
          Company average
        </span>
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--ft-ink)" }}>
          {avg}
        </span>
      </div>
    </Card>
  );
}

/* ── footer strip ───────────────────────────────────────────────── */

function ImpactStrip() {
  return (
    <div className="mx-8 mb-10 mt-4">
      <Card className="flex items-center gap-6 px-6 py-4">
        <Lbl>Business impact</Lbl>
        <div className="flex flex-1 items-center gap-8">
          <span className="text-[12px]" style={{ color: "var(--ft-muted)" }}>
            Engagement ↔ attrition{" "}
            <span className="font-semibold tabular-nums" style={{ color: "var(--ft-ink)" }}>
              −0.74
            </span>
          </span>
          <span className="text-[12px]" style={{ color: "var(--ft-muted)" }}>
            Productivity{" "}
            <span className="font-semibold tabular-nums" style={{ color: "var(--ft-ink)" }}>
              +0.61
            </span>
          </span>
          <span className="text-[12px]" style={{ color: "var(--ft-muted)" }}>
            Attrition cost saved{" "}
            <span className="font-semibold tabular-nums" style={{ color: "var(--ft-good)" }}>
              ₹4.2 Cr
            </span>
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[12px] font-medium"
          style={{ color: "var(--ft-accent-ink)" }}
        >
          Full report
          <ArrowRight size={12} />
        </button>
      </Card>
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────────── */

export default function FintechPage() {
  return (
    <div className="fintech-root flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-y-auto">
          <Greeting />

          {/* hero row */}
          <div className="grid grid-cols-3 gap-4 px-8">
            <div className="col-span-2">
              <HealthHero />
            </div>
            <TodayCard />
          </div>

          <KpiRow />

          {/* row C */}
          <div className="grid grid-cols-3 gap-4 px-8 pt-4">
            <RiskCard />
            <ActionCard />
            <VoiceCard />
          </div>

          {/* row D */}
          <div className="grid grid-cols-3 gap-4 px-8 pt-4">
            <CampaignCard />
            <RecognitionCard />
            <DeptCard />
          </div>

          <ImpactStrip />
        </div>
      </main>
    </div>
  );
}
