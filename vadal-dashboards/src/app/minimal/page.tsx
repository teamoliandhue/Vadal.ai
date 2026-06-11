import Image from "next/image";
import {
  Activity,
  Bell,
  BookOpen,
  ChevronDown,
  Home,
  MessageSquare,
  Radio,
  Search,
  Sparkles,
  Star,
  Users,
  BarChart2,
  Rss,
  Heart,
  Settings,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
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
import { MinimalThemeToggle } from "./minimal-chrome";

/* ── tiny helpers ───────────────────────────────────────────────── */

function Lbl({ children }: { children: React.ReactNode }) {
  return <p className="mn-label">{children}</p>;
}

function Divider() {
  return <div className="mn-divider" />;
}

function MnCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mn-card ${className}`}>{children}</div>;
}

/* thin ring — minimal aesthetic: stroke 2.5px, accent colour only */
function MinRing({ score }: { score: number }) {
  const size = 116;
  const stroke = 2.5;
  const r = (size - stroke) / 2 - 5;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--mn-border-mid)"
          strokeWidth={stroke}
        />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--mn-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${c} ${c})`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${circ}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[36px] font-extralight tabular-nums leading-none"
          style={{ color: "var(--mn-ink)", letterSpacing: "-0.03em" }}
        >
          {score}
        </span>
        <span
          className="mt-0.5 text-[9px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--mn-faint)" }}
        >
          score
        </span>
      </div>
    </div>
  );
}

/* delta chip */
function Delta({
  value,
  tone,
}: {
  value: string;
  tone: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "good"
      ? "var(--mn-good)"
      : tone === "bad"
        ? "var(--mn-bad)"
        : "var(--mn-muted)";
  const Icon =
    tone === "good" ? TrendingUp : tone === "bad" ? TrendingDown : Minus;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold"
      style={{ color }}
    >
      <Icon size={11} strokeWidth={2.2} />
      {value.replace(/[▲▼]/, "").trim()}
    </span>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

const NAV: {
  section: string;
  items: {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    badge?: number;
    badgeTone?: "score";
  }[];
}[] = [
  {
    section: "TRACK",
    items: [
      { icon: Home, label: "Home" },
      { icon: Activity, label: "Pulse", active: true },
      { icon: BarChart2, label: "Analytics" },
    ],
  },
  {
    section: "SURVEYS",
    items: [
      { icon: BookOpen, label: "Surveys", badge: 3 },
      { icon: MessageSquare, label: "Sentiment" },
      { icon: Radio, label: "Always-on listening" },
    ],
  },
  {
    section: "CULTURE",
    items: [
      { icon: Star, label: "Recognition" },
      { icon: Rss, label: "Campaigns" },
      { icon: Rss, label: "Feed" },
    ],
  },
  {
    section: "PEOPLE",
    items: [
      { icon: Users, label: "Manager hub", badge: 5 },
      { icon: Heart, label: "Health", badge: 82, badgeTone: "score" as const },
    ],
  },
];

function Sidebar() {
  return (
    <aside
      className="flex h-screen w-[220px] flex-none flex-col overflow-hidden"
      style={{
        background: "var(--mn-bg)",
        borderRight: "1px solid var(--mn-border-mid)",
      }}
    >
      {/* logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg"
          style={{ background: "var(--mn-surface)" }}
        >
          <Image
            src={org.logo}
            alt={org.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div>
          <p
            className="text-[13px] font-semibold lowercase leading-none tracking-tight"
            style={{ color: "var(--mn-ink)" }}
          >
            {org.name}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: "var(--mn-faint)" }}>
            {org.workspace}
          </p>
        </div>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className="ml-auto"
          style={{ color: "var(--mn-faint)" }}
        />
      </div>

      <Divider />

      {/* AI briefing CTA */}
      <div className="px-4 py-3">
        <button
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium transition"
          style={{
            background: "var(--mn-surface)",
            color: "var(--mn-ink)",
          }}
        >
          <Sparkles size={13} style={{ color: "var(--mn-accent)" }} />
          Today&apos;s AI briefing
          <ArrowRight size={11} className="ml-auto" style={{ color: "var(--mn-faint)" }} />
        </button>
      </div>

      <Divider />

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <p
              className="mb-1 px-2 text-[9.5px] font-semibold tracking-[0.14em]"
              style={{ color: "var(--mn-faint)" }}
            >
              {group.section}
            </p>
            {group.items.map((item) => (
              <button
                key={item.label}
                className="mn-nav-item w-full"
                data-active={item.active ? "true" : "false"}
              >
                <item.icon size={14} strokeWidth={1.8} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badgeTone === "score" ? (
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "var(--mn-accent)" }}
                  >
                    {item.badge}
                  </span>
                ) : item.badge ? (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold"
                    style={{
                      background: "var(--mn-border-mid)",
                      color: "var(--mn-muted)",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <Divider />

      {/* user */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <Image
          src={org.userImg}
          alt={org.user}
          width={30}
          height={30}
          className="rounded-full object-cover"
        />
        <div className="min-w-0">
          <p
            className="text-[12px] font-medium leading-none"
            style={{ color: "var(--mn-ink)" }}
          >
            {org.user}
          </p>
          <p
            className="mt-0.5 truncate text-[10px]"
            style={{ color: "var(--mn-faint)" }}
          >
            People lead
          </p>
        </div>
        <Settings
          size={13}
          strokeWidth={1.8}
          className="ml-auto"
          style={{ color: "var(--mn-faint)" }}
        />
      </div>
    </aside>
  );
}

/* ── TopBar ──────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <header
      className="flex h-[52px] flex-none items-center gap-4 px-8"
      style={{ borderBottom: "1px solid var(--mn-border-mid)" }}
    >
      {/* breadcrumb tabs */}
      <div className="flex items-center gap-0.5">
        <button
          className="px-3 py-1.5 text-[13px] transition"
          style={{ color: "var(--mn-muted)" }}
        >
          People intelligence
        </button>
        <span style={{ color: "var(--mn-border-mid)" }}>/</span>
        <button
          className="px-3 py-1.5 text-[13px] font-semibold"
          style={{ color: "var(--mn-ink)" }}
        >
          Pulse
        </button>
      </div>

      {/* search */}
      <div
        className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition"
        style={{
          background: "var(--mn-surface)",
          color: "var(--mn-muted)",
          maxWidth: 340,
        }}
      >
        <Search size={13} strokeWidth={1.8} />
        <span>Search people, teams, insights…</span>
        <kbd
          className="ml-auto rounded px-1 text-[10px]"
          style={{ background: "var(--mn-border-mid)" }}
        >
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* AI button */}
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition"
          style={{
            background: "var(--mn-surface)",
            color: "var(--mn-ink)",
          }}
        >
          <Sparkles size={13} style={{ color: "var(--mn-accent)" }} />
          Intelligence
        </button>

        <MinimalThemeToggle />

        {/* bell */}
        <button
          className="relative grid h-8 w-8 place-items-center rounded-lg transition"
          style={{ color: "var(--mn-muted)" }}
        >
          <Bell size={15} strokeWidth={1.8} />
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--mn-bad)" }}
          />
        </button>

        <Image
          src={org.userImg}
          alt={org.user}
          width={30}
          height={30}
          className="ml-1 rounded-full object-cover"
          style={{ outline: "1.5px solid var(--mn-border-mid)" }}
        />
      </div>
    </header>
  );
}

/* ── Hero ────────────────────────────────────────────────────────── */

const PERIODS = ["7 days", "30 days", "Quarter", "Year"];

function Hero() {
  return (
    <div className="px-8 pb-6 pt-8">
      <div className="flex items-start gap-12 justify-between">
        <div className="flex-1">
          <p className="mn-label">
            {org.date} · {org.headcount.toLocaleString()} people
          </p>
          <h1
            className="mt-3 text-[38px] font-extralight leading-[1.12] tracking-tight"
            style={{ color: "var(--mn-ink)", letterSpacing: "-0.03em" }}
          >
            Your <span style={{ color: "var(--mn-accent)" }}>people</span>,
            <br />
            at a glance.
          </h1>
          <p
            className="mt-2.5 max-w-[420px] text-[13.5px] leading-relaxed"
            style={{ color: "var(--mn-muted)" }}
          >
            Engagement is up 4 points and you&apos;re beating the industry
            benchmark — but three people need you this week.
          </p>
        </div>

        {/* right column: health metric + period picker */}
        <div className="flex flex-col gap-4">
          {/* health feature card */}
          <div
            className="rounded-xl border px-5 py-4"
            style={{ borderColor: "var(--mn-border-mid)", background: "var(--mn-surface)" }}
          >
            <Lbl>Workforce health</Lbl>
            <div className="mt-3 flex items-end gap-4">
              <div>
                <p
                  className="text-[32px] font-extralight tabular-nums leading-none"
                  style={{ color: "var(--mn-ink)", letterSpacing: "-0.025em" }}
                >
                  {health.score}
                </p>
                <p className="mt-1 text-[10px]" style={{ color: "var(--mn-faint)" }}>
                  top 25%
                </p>
              </div>
              <Sparkline
                values={engagementTrend.series.slice(-7)}
                color="var(--mn-accent)"
                id="hero-spark"
                height={48}
                className="w-24"
              />
            </div>
          </div>

          {/* period picker */}
          <div
            className="flex items-center gap-0.5 rounded-xl p-1"
            style={{ background: "var(--mn-surface)" }}
          >
            {PERIODS.map((p) => (
              <button key={p} className="mn-pill" data-active={p === "30 days" ? "true" : "false"}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI briefing strip */}
      <div
        className="mt-5 flex items-center gap-4 rounded-xl px-4 py-3"
        style={{ background: "var(--mn-surface)", border: "1px solid var(--mn-border-mid)" }}
      >
        <Sparkles size={14} style={{ color: "var(--mn-accent)", flexShrink: 0 }} />
        <div className="flex min-w-0 flex-1 items-center gap-6">
          {aiBriefing.map((b, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-[12px]"
              style={{ color: "var(--mn-muted)" }}
            >
              <span
                className="h-1.5 w-1.5 flex-none rounded-full"
                style={{ background: b.dot }}
              />
              <span style={{ color: "var(--mn-ink)", fontWeight: 500 }}>
                {b.text}
              </span>
              <span className="hidden sm:inline">— {b.sub}</span>
            </span>
          ))}
        </div>
        <span
          className="flex-none text-[11px] font-semibold"
          style={{ color: "var(--mn-accent)" }}
        >
          {briefingImpact.value}
        </span>
      </div>
    </div>
  );
}

/* ── KPI Strip ───────────────────────────────────────────────────── */

const SPARK_COLORS = ["#fca5a5", "#86efac", "#fca5a5", "#a99df9"];
const DELTA_TONES = ["bad", "good", "bad", "good"] as const;

function KpiStrip() {
  return (
    <div
      className="mx-8 overflow-hidden rounded-xl"
      style={{ border: "1px solid var(--mn-border-mid)" }}
    >
      <div className="grid grid-cols-4" style={{ borderColor: "var(--mn-border-mid)" }}>
        {signals.map((s, i) => (
          <div
            key={s.title}
            className="px-5 py-4"
            style={i > 0 ? { borderLeft: "1px solid var(--mn-border-mid)" } : {}}
          >
            <Lbl>{s.title}</Lbl>
            <p
              className="mt-2 text-[28px] font-light tabular-nums leading-none"
              style={{ color: "var(--mn-ink)", letterSpacing: "-0.025em" }}
            >
              {s.value}
            </p>
            <div className="mt-1.5 flex items-center justify-between">
              <Delta value={s.delta} tone={DELTA_TONES[i]} />
              <Sparkline
                values={[...s.spark]}
                color={SPARK_COLORS[i]}
                id={`kpi-${i}`}
                height={28}
                className="w-14 opacity-80"
              />
            </div>
            <p
              className="mt-1.5 text-[10.5px] leading-tight"
              style={{ color: "var(--mn-faint)" }}
            >
              {s.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Workforce Health Card ───────────────────────────────────────── */

function HealthCard() {
  return (
    <MnCard className="overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Workforce health</Lbl>
        <div className="flex items-center gap-2">
          <Delta value="4 pts" tone="good" />
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "var(--mn-surface)", color: "var(--mn-muted)" }}
          >
            benchmark +7
          </span>
        </div>
      </div>
      <Divider />

      {/* body */}
      <div className="flex gap-6 px-5 py-5">
        <MinRing score={health.score} />
        <div className="flex-1 space-y-3.5">
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--mn-muted)" }}
          >
            {health.narrative}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
            {health.drivers.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 flex-none rounded-full"
                  style={{
                    background:
                      d.tone === "good"
                        ? "var(--mn-good)"
                        : d.tone === "bad"
                          ? "var(--mn-bad)"
                          : "var(--mn-faint)",
                  }}
                />
                <span
                  className="text-[12px]"
                  style={{ color: "var(--mn-ink)" }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MnCard>
  );
}

/* ── Trend Chart Card ────────────────────────────────────────────── */

function TrendCard() {
  return (
    <MnCard className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Engagement over time</Lbl>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--mn-muted)" }}>
            <span className="h-2 w-4 rounded-sm" style={{ background: "var(--mn-accent)", opacity: 0.7 }} />
            You
          </span>
          <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--mn-muted)" }}>
            <span className="h-px w-4 border-t-2 border-dashed" style={{ borderColor: "var(--mn-faint)" }} />
            Benchmark
          </span>
          <button className="text-[11px] font-medium" style={{ color: "var(--mn-accent)" }}>
            Export ↗
          </button>
        </div>
      </div>
      <Divider />
      <div className="flex flex-1 flex-col justify-center px-5 pb-2 pt-4">
        <TrendChart
          series={[...engagementTrend.series]}
          benchmark={[...engagementTrend.benchmark]}
          color="var(--mn-accent)"
          height={180}
          id="mn-trend"
        />
        <div className="mt-2 flex justify-between">
          {engagementTrend.months.map((m) => (
            <span key={m} className="text-[9.5px]" style={{ color: "var(--mn-faint)" }}>
              {m}
            </span>
          ))}
        </div>
      </div>
      <Divider />
      <div className="px-5 py-3">
        <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--mn-muted)" }}>
          {engagementTrend.insight}
        </p>
      </div>
    </MnCard>
  );
}

/* ── Flight Risk Card ────────────────────────────────────────────── */

function RiskCard() {
  return (
    <MnCard className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Flight risk</Lbl>
        <span
          className="tabular-nums text-[11px] font-semibold"
          style={{ color: "var(--mn-bad)" }}
        >
          {flightRisks.length} employees
        </span>
      </div>
      <Divider />
      <div className="flex flex-1 flex-col">
        {flightRisks.map((r, i) => (
          <div
            key={r.name}
            className="mn-row flex flex-1 items-center gap-3 px-5 py-3"
            style={i > 0 ? { borderTop: "1px solid var(--mn-border)" } : {}}
          >
            <div className="relative shrink-0">
              <Image
                src={r.img}
                alt={r.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
                style={{ outline: "1.5px solid var(--mn-border-mid)" }}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white"
                style={{
                  background: r.level === "High" ? "var(--mn-bad)" : "var(--mn-warn)",
                }}
              >
                {r.level === "High" ? "H" : "M"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-none" style={{ color: "var(--mn-ink)" }}>
                {r.name}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-tight" style={{ color: "var(--mn-muted)" }}>
                {r.team} · {r.driver}
              </p>
            </div>
            <span
              className="flex-none text-[11px] font-semibold tabular-nums"
              style={{ color: r.level === "High" ? "var(--mn-bad)" : "var(--mn-warn)" }}
            >
              {r.confidence}
            </span>
          </div>
        ))}
      </div>
    </MnCard>
  );
}

/* ── Action Queue Card ───────────────────────────────────────────── */

const DUE_STYLE: Record<string, { color: string }> = {
  Today: { color: "var(--mn-bad)" },
  Tomorrow: { color: "var(--mn-warn)" },
  "This week": { color: "var(--mn-muted)" },
};

function ActionCard() {
  const pct = actionProgress.pct;
  return (
    <MnCard className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Action queue</Lbl>
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          {actionProgress.closed}/{actionProgress.total} closed
        </span>
      </div>
      {/* progress bar */}
      <div className="px-5 pb-3">
        <div
          className="h-[3px] overflow-hidden rounded-full"
          style={{ background: "var(--mn-border-mid)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: "var(--mn-accent)" }}
          />
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-[10px]" style={{ color: "var(--mn-faint)" }}>
            {pct}% resolved · avg {actionProgress.avgDays}d
          </span>
        </div>
      </div>
      <Divider />
      <div className="flex flex-1 flex-col">
        {actionQueue.map((a, i) => (
          <div
            key={a.title}
            className="mn-row flex flex-1 items-start gap-3 px-5 py-3"
            style={i > 0 ? { borderTop: "1px solid var(--mn-border)" } : {}}
          >
            <span
              className="mt-0.5 flex flex-none items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{
                background:
                  a.tone === "urgent"
                    ? "var(--mn-bad)"
                    : a.tone === "warn"
                      ? "var(--mn-warn)"
                      : "var(--mn-faint)",
                width: 18,
                height: 18,
              }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-snug" style={{ color: "var(--mn-ink)" }}>
                {a.title}
              </p>
              <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--mn-muted)" }}>
                {a.context}
              </p>
            </div>
            <span
              className="flex-none text-[10.5px] font-semibold"
              style={{ color: DUE_STYLE[a.due]?.color ?? "var(--mn-muted)" }}
            >
              {a.due}
            </span>
          </div>
        ))}
      </div>
    </MnCard>
  );
}

/* ── Employee Voice Card ─────────────────────────────────────────── */

function VoiceCard() {
  const total = voice.mood.reduce((s, m) => s + m.pct, 0);
  return (
    <MnCard className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Employee voice</Lbl>
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          {voice.comments.toLocaleString()} comments
        </span>
      </div>
      <Divider />

      {/* sentiment bar */}
      <div className="px-5 py-4">
        <div className="flex h-1.5 overflow-hidden rounded-full">
          {voice.mood.map((m) => (
            <div
              key={m.label}
              style={{ width: `${(m.pct / total) * 100}%`, background: m.color }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex gap-4">
          {voice.mood.map((m) => (
            <span key={m.label} className="flex items-center gap-1 text-[10.5px]" style={{ color: "var(--mn-muted)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
              {m.pct}% {m.label}
            </span>
          ))}
        </div>
      </div>
      <Divider />

      {/* themes */}
      <div className="flex flex-1 flex-col">
        {voice.themes.map((t, i) => {
          const max = Math.max(...voice.themes.map((x) => x.mentions));
          const tone =
            t.tone === "good"
              ? "var(--mn-good)"
              : t.tone === "bad"
                ? "var(--mn-bad)"
                : t.tone === "purple"
                  ? "var(--mn-accent)"
                  : "var(--mn-warn)";
          return (
            <div
              key={t.name}
              className="mn-row flex flex-1 items-center gap-3 px-5 py-2.5"
              style={i > 0 ? { borderTop: "1px solid var(--mn-border)" } : {}}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium" style={{ color: "var(--mn-ink)" }}>
                  {t.name}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="mn-meter flex-1">
                    <span
                      style={{ width: `${(t.mentions / max) * 100}%`, background: tone, opacity: 0.7 }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums" style={{ color: "var(--mn-faint)" }}>
                    {t.mentions}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: tone }}>
                {t.tag}
              </span>
            </div>
          );
        })}
      </div>

      <Divider />
      {/* pull quote */}
      <div className="px-5 py-4">
        <div className="border-l-2 pl-3" style={{ borderColor: "var(--mn-accent)" }}>
          <p
            className="text-[12px] italic leading-relaxed"
            style={{ color: "var(--mn-ink)" }}
          >
            &ldquo;{voice.quote.text}&rdquo;
          </p>
          <p className="mt-1.5 text-[10px]" style={{ color: "var(--mn-faint)" }}>
            {voice.quote.meta}
          </p>
        </div>
      </div>
    </MnCard>
  );
}

/* ── Campaign Card ───────────────────────────────────────────────── */

function CampaignCard() {
  const weakest = campaigns.reduce((a, b) =>
    b.participation < a.participation ? b : a,
  );
  return (
    <MnCard className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Campaign effectiveness</Lbl>
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          {campaigns.length} active
        </span>
      </div>
      <Divider />

      <div className="flex flex-1 flex-col">
        {campaigns.map((c, i) => (
          <div
            key={c.name}
            className="mn-row flex flex-1 flex-col justify-center px-5 py-3"
            style={i > 0 ? { borderTop: "1px solid var(--mn-border)" } : {}}
          >
            <div className="flex items-baseline justify-between">
              <p className="text-[12px] font-medium" style={{ color: "var(--mn-ink)" }}>
                {c.name}
              </p>
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                style={{ background: "var(--mn-surface)", color: "var(--mn-good)" }}
              >
                {c.lift}
              </span>
            </div>
            {/* funnel: reach track + participation fill */}
            <div className="mt-2 flex items-center gap-2.5">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--mn-border-mid)" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${c.reach}%`, background: "var(--mn-faint)", opacity: 0.55 }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${c.participation}%`, background: "var(--mn-accent)" }}
                />
              </div>
              <span className="text-[10.5px] tabular-nums" style={{ color: "var(--mn-muted)" }}>
                <span style={{ color: "var(--mn-accent)", fontWeight: 600 }}>{c.participation}%</span>
                <span style={{ color: "var(--mn-faint)" }}> / {c.reach}%</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <Divider />
      <div className="flex items-center gap-1.5 px-5 py-3">
        <span className="text-[10px]" style={{ color: "var(--mn-faint)" }}>
          Participation / reach ·
        </span>
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          weakest{" "}
          <span style={{ color: "var(--mn-ink)", fontWeight: 500 }}>{weakest.name}</span>
        </span>
      </div>
    </MnCard>
  );
}

/* ── Recognition Card ────────────────────────────────────────────── */

function RecognitionCard() {
  return (
    <MnCard className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Recognition</Lbl>
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          {recognitionBoard.coverage}% coverage
        </span>
      </div>
      <Divider />

      {/* hero stat */}
      <div className="flex items-end justify-between px-5 py-5">
        <div>
          <p
            className="text-[36px] font-extralight tabular-nums leading-none"
            style={{ color: "var(--mn-ink)", letterSpacing: "-0.03em" }}
          >
            {recognitionBoard.total.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--mn-muted)" }}>
            recognitions this period
          </p>
        </div>
        <div className="text-right">
          <p className="mn-label">Top value</p>
          <p className="mt-1 text-[13px] font-semibold" style={{ color: "var(--mn-accent)" }}>
            {recognitionBoard.topValue}
          </p>
        </div>
      </div>
      <Divider />

      {/* leaders */}
      <div className="px-5 pb-1 pt-3">
        <p className="mn-label">Top recognizers</p>
      </div>
      <div className="flex flex-1 flex-col px-2">
        {recognitionBoard.leaders.map((l, i) => {
          const max = Math.max(...recognitionBoard.leaders.map((x) => x.given));
          return (
            <div
              key={l.name}
              className="mn-row flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5"
            >
              <span className="mn-rank">{i + 1}</span>
              <Image
                src={l.img}
                alt={l.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
                style={{ outline: "1.5px solid var(--mn-border-mid)" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium leading-none" style={{ color: "var(--mn-ink)" }}>
                  {l.name}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="mn-meter w-16">
                    <span style={{ width: `${(l.given / max) * 100}%`, background: l.hue, opacity: 0.75 }} />
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--mn-faint)" }}>
                    {l.team}
                  </span>
                </div>
              </div>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--mn-ink)" }}>
                {l.given}
              </span>
            </div>
          );
        })}
      </div>

      <Divider />
      {/* coverage meter footer */}
      <div className="px-5 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
            People recognized
          </span>
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--mn-ink)" }}>
            {recognitionBoard.coverage}%
          </span>
        </div>
        <div className="mn-meter mt-2">
          <span style={{ width: `${recognitionBoard.coverage}%`, background: "var(--mn-accent)" }} />
        </div>
      </div>
    </MnCard>
  );
}

/* ── Departments Card ────────────────────────────────────────────── */

function DeptCard() {
  const max = Math.max(...departments.map((d) => d.score));
  const avg = Math.round(
    departments.reduce((s, d) => s + d.score, 0) / departments.length,
  );
  return (
    <MnCard className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Lbl>Engagement by department</Lbl>
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          {departments.length} teams
        </span>
      </div>
      <Divider />
      <div className="flex flex-1 flex-col px-2 py-1">
        {[...departments]
          .sort((a, b) => b.score - a.score)
          .map((d, i) => (
            <div
              key={d.name}
              className="mn-row flex flex-1 items-center gap-3 rounded-lg px-3"
            >
              <span
                className="w-3 shrink-0 text-right text-[9.5px] font-semibold tabular-nums"
                style={{ color: "var(--mn-faint)" }}
              >
                {i + 1}
              </span>
              <span className="w-[72px] shrink-0 text-[11.5px]" style={{ color: "var(--mn-ink)" }}>
                {d.name}
              </span>
              <div className="mn-meter flex-1">
                <span
                  className="transition-all duration-700"
                  style={{
                    width: `${(d.score / max) * 100}%`,
                    background:
                      d.score >= 78
                        ? "var(--mn-good)"
                        : d.score >= 68
                          ? "var(--mn-accent)"
                          : "var(--mn-bad)",
                    opacity: 0.8,
                  }}
                />
              </div>
              <span
                className="w-6 text-right text-[11.5px] font-semibold tabular-nums"
                style={{ color: "var(--mn-ink)" }}
              >
                {d.score}
              </span>
            </div>
          ))}
      </div>
      <Divider />
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[11px]" style={{ color: "var(--mn-muted)" }}>
          Company average
        </span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--mn-ink)" }}>
          {avg}
        </span>
      </div>
    </MnCard>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function MinimalPage() {
  return (
    <div className="minimal-root flex h-screen overflow-hidden">
      <Sidebar />

      <main
        className="flex flex-1 flex-col overflow-hidden"
        style={{ background: "var(--mn-bg)" }}
      >
        <TopBar />

        <div className="flex-1 overflow-y-auto">
          <Hero />
          <KpiStrip />

          {/* Main grid */}
          <div className="grid grid-cols-5 gap-4 px-8 pt-4">
            {/* left 3/5 */}
            <div className="col-span-3 flex flex-col gap-4">
              <HealthCard />
              <TrendCard />
            </div>
            {/* right 2/5 */}
            <div className="col-span-2 flex flex-col gap-4">
              <RiskCard />
              <ActionCard />
            </div>
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-4 gap-4 px-8 pb-12 pt-4">
            <VoiceCard />
            <CampaignCard />
            <RecognitionCard />
            <DeptCard />
          </div>
        </div>
      </main>
    </div>
  );
}
