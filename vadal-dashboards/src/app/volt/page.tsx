import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  Home,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Radio,
  Rss,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { org, health, voice, flightRisks, recognitionBoard } from "@/lib/data";
import { VoltThemeToggle } from "./volt-chrome";

/* ── primitives ─────────────────────────────────────────────────── */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`vt-card ${className}`}>{children}</div>;
}

function Delta({ dir, children }: { dir: "up" | "down"; children: React.ReactNode }) {
  const color = dir === "up" ? "var(--vt-accent-ink)" : "var(--vt-bad)";
  const Icon = dir === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold" style={{ color }}>
      <Icon size={12} strokeWidth={2.4} />
      {children}
    </span>
  );
}

/* thin SVG ring — the Actions & Nudges 64% gauge */
function Ring({ pct, size = 92, stroke = 7 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--vt-track)" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--vt-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * (pct / 100)} ${circ}`}
          transform={`rotate(-90 ${c} ${c})`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${circ}` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="vt-num text-[20px]" style={{ color: "var(--vt-accent-ink)" }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

/* mini bar cluster for the KPI stats (gray history + lit last bar) */
function MiniBars({ tone }: { tone: "good" | "bad" }) {
  const heights = [9, 13, 7, 15, 10, 17, 12, 26];
  return (
    <div className="flex items-end gap-[5px]" style={{ height: 28 }}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[5px] rounded-[2px]"
          style={{
            height: h,
            background:
              i === heights.length - 1
                ? tone === "good"
                  ? "var(--vt-accent)"
                  : "var(--vt-bad)"
                : "var(--vt-line)",
          }}
        />
      ))}
    </div>
  );
}

/* ── sidebar ────────────────────────────────────────────────────── */

const NAV: {
  section?: string;
  items: { icon: React.ElementType; label: string; active?: boolean }[];
}[] = [
  {
    items: [
      { icon: Home, label: "Home" },
      { icon: LayoutDashboard, label: "Executive Dashboard", active: true },
    ],
  },
  {
    section: "Engage",
    items: [
      { icon: Radio, label: "Listening & Surveys" },
      { icon: Star, label: "Recognition" },
      { icon: Megaphone, label: "Communication & Campaigns" },
      { icon: Rss, label: "Employee Feed" },
    ],
  },
  {
    section: "Act",
    items: [
      { icon: LineChart, label: "Analytics & Insights" },
      { icon: Users, label: "Manager Hub" },
      { icon: Briefcase, label: "Case Management" },
      { icon: BookOpen, label: "Knowledge Hub" },
    ],
  },
  {
    section: "System",
    items: [
      { icon: Sparkles, label: "AI Assistant — Ask HR" },
      { icon: Settings, label: "Settings" },
    ],
  },
];

function Sidebar() {
  return (
    <aside
      className="flex h-screen w-[246px] flex-none flex-col overflow-hidden px-4"
      style={{ background: "var(--vt-panel)", borderRight: "1px solid var(--vt-border)" }}
    >
      {/* brand */}
      <div
        className="flex items-center gap-2.5 px-1 pb-4 pt-5"
        style={{ borderBottom: "1px solid var(--vt-border)" }}
      >
        <div
          className="grid h-9 w-9 place-items-center overflow-hidden rounded-[12px]"
          style={{ background: "var(--vt-accent-soft)", border: "1px solid var(--vt-border)" }}
        >
          <Image src={org.logo} alt="Vadal.ai" width={24} height={24} className="object-contain" />
        </div>
        <p className="text-[15px] font-semibold" style={{ color: "var(--vt-ink)" }}>
          Vadal.ai
        </p>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto pt-4">
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.section && <p className="vt-section mb-2 px-3">{group.section}</p>}
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="vt-nav-item w-full"
                  data-active={item.active ? "true" : "false"}
                >
                  <item.icon size={15} strokeWidth={1.8} />
                  <span className="flex-1 truncate text-left">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* user */}
      <div
        className="mb-4 flex items-center gap-2.5 px-1 pt-3"
        style={{ borderTop: "1px solid var(--vt-border)" }}
      >
        <Image src={org.userImg} alt="Priya Sharma" width={34} height={34} className="rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold leading-none" style={{ color: "var(--vt-ink)" }}>
            Priya Sharma
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--vt-faint)" }}>
            HR Leader · GCC
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ── top bar ────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <header className="flex h-[76px] flex-none items-center gap-3 px-8">
      <h1
        className="text-[24px] font-bold tracking-tight"
        style={{ color: "var(--vt-ink)", letterSpacing: "-0.02em" }}
      >
        Executive Dashboard
      </h1>

      <div className="ml-auto flex items-center gap-2.5">
        <div
          className="flex w-[300px] items-center gap-2 rounded-full px-4 py-2.5 text-[12px]"
          style={{
            background: "var(--vt-panel)",
            border: "1px solid var(--vt-border)",
            color: "var(--vt-faint)",
          }}
        >
          <Search size={14} strokeWidth={1.8} />
          <span>Search people, teams, insights…</span>
        </div>
        <VoltThemeToggle />
        <button
          className="relative grid h-10 w-10 place-items-center rounded-full"
          style={{ background: "var(--vt-panel)", border: "1px solid var(--vt-border)", color: "var(--vt-muted)" }}
        >
          <Bell size={15} strokeWidth={1.8} />
          <span
            className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--vt-accent)" }}
          />
        </button>
        <Image
          src={org.userImg}
          alt="Priya Sharma"
          width={40}
          height={40}
          className="rounded-full object-cover"
          style={{ outline: "2px solid var(--vt-border)" }}
        />
      </div>
    </header>
  );
}

/* ── row 1: greeting + KPI strip ────────────────────────────────── */

function GreetingCard() {
  return (
    <Card className="vt-glow-green flex flex-col justify-center px-7 py-7">
      <h2 className="vt-num text-[32px]" style={{ color: "var(--vt-ink)", fontWeight: 600 }}>
        Hi {org.user},
      </h2>
      <p className="mt-2.5 text-[15px]" style={{ color: "var(--vt-muted)" }}>
        Welcome back to Vadal.ai
      </p>
      <div className="mt-5">
        <button className="vt-btn">
          <Sparkles size={15} strokeWidth={2} />
          Ask HR anything
        </button>
      </div>
    </Card>
  );
}

const KPIS = [
  { label: "Engagement", delta: "+4", dir: "up", value: "82", suffix: "/100", tone: "good" },
  { label: "Participation", delta: "2%", dir: "down", value: "74%", suffix: "", tone: "bad" },
  { label: "eNPS Sentiment", delta: "+6", dir: "up", value: "+38", suffix: "", tone: "good" },
] as const;

function KpiStrip() {
  return (
    <Card className="grid grid-cols-3 items-stretch px-2 py-6">
      {KPIS.map((k, i) => (
        <div
          key={k.label}
          className="flex flex-col justify-between px-6"
          style={i > 0 ? { borderLeft: "1px solid var(--vt-border)" } : undefined}
        >
          <div className="flex items-center gap-2">
            <p className="text-[13.5px]" style={{ color: "var(--vt-muted)" }}>
              {k.label}
            </p>
            <Delta dir={k.dir}>{k.delta}</Delta>
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="vt-num text-[40px]" style={{ color: "var(--vt-ink)" }}>
              {k.value}
              {k.suffix && (
                <span className="text-[17px]" style={{ color: "var(--vt-faint)" }}>
                  {" "}
                  {k.suffix}
                </span>
              )}
            </p>
            <MiniBars tone={k.tone} />
          </div>
        </div>
      ))}
    </Card>
  );
}

/* ── row 2: workforce health + sentiment chart ──────────────────── */

function HealthCard() {
  return (
    <Card className="vt-glow-red flex flex-col px-7 pb-6 pt-6">
      <p className="vt-label">Workforce Health Snapshot</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="vt-num text-[52px]" style={{ color: "var(--vt-ink)", fontWeight: 600 }}>
          {health.score}%
        </span>
        <ArrowUpRight size={26} strokeWidth={2.4} style={{ color: "var(--vt-accent-ink)" }} />
      </div>
      <p className="mt-1.5 text-[13px]" style={{ color: "var(--vt-muted)" }}>
        Increases 4.2% vs previous quarter
      </p>

      {/* voices — hatched orange bar */}
      <div className="mt-6 flex items-center gap-2">
        <div className="vt-hatch flex-1" />
        <span
          className="rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold"
          style={{ background: "var(--vt-panel)", border: "1px solid var(--vt-border)", color: "var(--vt-ink)" }}
        >
          9.2k voices
        </span>
      </div>

      {/* recognitions — solid lime pill bar */}
      <div className="mt-3 flex h-[30px] items-center justify-end rounded-full px-4" style={{ background: "var(--vt-accent)" }}>
        <span className="text-[11.5px] font-bold" style={{ color: "var(--vt-on-accent)" }}>
          2,840 given
        </span>
      </div>

      {/* footer stats */}
      <div className="mt-6 grid flex-1 grid-cols-3 items-end">
        {(
          [
            { label: "High-risk", value: "312", color: "var(--vt-orange)" },
            { label: "Recognitions", value: "2,840", color: "var(--vt-accent-ink)" },
            { label: "eNPS", value: "+38", color: "var(--vt-muted)" },
          ] as const
        ).map((s, i) => (
          <div key={s.label} className="px-1" style={i > 0 ? { borderLeft: "1px solid var(--vt-border)", paddingLeft: 18 } : undefined}>
            <p className="text-[12px] font-semibold" style={{ color: s.color }}>
              {s.label}
            </p>
            <p className="vt-num mt-2 text-[28px]" style={{ color: "var(--vt-ink)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* deterministic daily sentiment series — lime up / red down */
const SENTIMENT = Array.from({ length: 30 }, (_, i) => ({
  up: Math.round(380 + 400 * Math.abs(Math.sin(i * 1.31 + 0.9))),
  down: Math.round(160 + 420 * Math.abs(Math.sin(i * 1.97 + 2.2))),
}));

function SentimentChart() {
  const W = 740;
  const H = 300;
  const padL = 38;
  const padY = 14;
  const zero = H / 2;
  const max = 900;
  const step = (W - padL - 10) / SENTIMENT.length;
  const yScale = (zero - padY) / max;
  const yTicks = [900, 600, 300, 0, -300, -600, -900];
  const xTicks = [0, 5, 10, 15, 20, 25, 30];
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="block h-auto w-full" aria-hidden>
      {yTicks.map((t) => (
        <text
          key={t}
          x={padL - 8}
          y={zero - t * yScale + 3}
          textAnchor="end"
          fontSize={10}
          fill="var(--vt-faint)"
        >
          {t > 0 ? `+${t}` : t}
        </text>
      ))}
      {/* zero baseline dots */}
      {SENTIMENT.map((_, i) =>
        i % 6 === 3 ? (
          <circle key={i} cx={padL + i * step + step / 2} cy={zero} r={2.5} fill="var(--vt-line)" />
        ) : null,
      )}
      {SENTIMENT.map((d, i) => {
        const x = padL + i * step + step / 2 - 2.5;
        return (
          <g key={i}>
            <rect x={x} y={zero - d.up * yScale} width={5} rx={2.5} height={d.up * yScale} fill="var(--vt-accent)" />
            <rect x={x} y={zero + 4} width={5} rx={2.5} height={d.down * yScale} fill="var(--vt-bad)" />
          </g>
        );
      })}
      {xTicks.map((t) => (
        <text
          key={t}
          x={t === 0 ? padL : padL + (t - 0.5) * step}
          y={H + 16}
          fontSize={10}
          fill="var(--vt-faint)"
        >
          {t === 0 ? "0" : String(t).padStart(2, "0")}
        </text>
      ))}
    </svg>
  );
}

function SentimentCard() {
  return (
    <Card className="flex flex-col px-7 pb-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <p className="vt-label">Employee Sentiment</p>
          <p className="text-[12px]" style={{ color: "var(--vt-faint)" }}>
            December 2025
          </p>
        </div>
        <button className="vt-select">
          This Month
          <ChevronDown size={12} />
        </button>
      </div>
      <div className="mt-4 flex flex-1 items-center">
        <SentimentChart />
      </div>
    </Card>
  );
}

/* ── row 3: attrition + recognition index ───────────────────────── */

function AttritionCard() {
  return (
    <Card className="flex flex-col px-7 pb-4 pt-6">
      <p className="vt-label">Attrition &amp; Risk Intelligence</p>
      <p className="mt-1 text-[12px]" style={{ color: "var(--vt-faint)" }}>
        Top flight risks · next 90 days
      </p>

      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="vt-num text-[36px]" style={{ color: "var(--vt-bad)", fontWeight: 600 }}>
          312
        </span>
        <span className="text-[12.5px]" style={{ color: "var(--vt-muted)" }}>
          at high risk ·{" "}
          <span style={{ color: "var(--vt-bad)" }}>▲ 18</span>
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        {flightRisks.map((r) => (
          <button
            key={r.name}
            className="vt-row flex flex-1 items-center gap-3 px-2 py-2.5 text-left"
            style={{ borderTop: "1px solid var(--vt-border)" }}
          >
            <span
              className="grid h-8 w-8 flex-none place-items-center rounded-full text-[11px] font-bold"
              style={{ background: `${r.hue}26`, color: r.hue }}
            >
              {r.initials[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium leading-none" style={{ color: "var(--vt-ink)" }}>
                {r.name}
              </span>
              <span className="mt-1 block truncate text-[11px]" style={{ color: "var(--vt-faint)" }}>
                {r.team}
              </span>
            </span>
            <span
              className="vt-pill"
              style={
                r.level === "High"
                  ? { background: "var(--vt-bad-soft)", color: "var(--vt-bad)" }
                  : { background: "var(--vt-warn-soft)", color: "var(--vt-warn)" }
              }
            >
              {r.level}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

const THEMES = [
  { name: "Ownership", pct: 90 },
  { name: "Collaboration", pct: 70 },
  { name: "Innovation", pct: 50 },
  { name: "Customer-first", pct: 40 },
] as const;

function RecognitionCard() {
  return (
    <Card className="flex flex-col px-7 pb-6 pt-6">
      <p className="vt-label">Recognition &amp; Culture Index</p>
      <p className="mt-1 text-[12px]" style={{ color: "var(--vt-faint)" }}>
        Reinforcing the right behaviours
      </p>

      <div className="mt-5 grid flex-1 grid-cols-[1fr_1.4fr] gap-7">
        {/* stat stack */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="vt-num text-[34px]" style={{ color: "var(--vt-ink)" }}>
              {recognitionBoard.total.toLocaleString()}
            </p>
            <p className="mt-1 text-[12.5px]" style={{ color: "var(--vt-muted)" }}>
              Recognitions <Delta dir="up">+4</Delta>
            </p>
          </div>
          <div>
            <p className="vt-num text-[28px]" style={{ color: "var(--vt-ink)" }}>
              {recognitionBoard.coverage}%
            </p>
            <p className="mt-1 text-[12.5px]" style={{ color: "var(--vt-muted)" }}>
              Coverage <Delta dir="down">2%</Delta>
            </p>
          </div>
          <div>
            <p className="vt-num text-[28px]" style={{ color: "var(--vt-ink)" }}>
              58/42
            </p>
            <p className="mt-1 text-[12.5px]" style={{ color: "var(--vt-muted)" }}>
              Peer / Mgr <Delta dir="up">+6</Delta>
            </p>
          </div>
        </div>

        {/* themes */}
        <div className="flex flex-col justify-between" style={{ borderLeft: "1px solid var(--vt-border)", paddingLeft: 26 }}>
          <p className="text-[13px] font-medium" style={{ color: "var(--vt-ink)" }}>
            Recognition themes
          </p>
          {THEMES.map((t) => (
            <div key={t.name}>
              <p className="mb-1.5 text-[12px]" style={{ color: "var(--vt-muted)" }}>
                {t.name}
              </p>
              <div className="flex items-center gap-3">
                <div className="vt-meter flex-1">
                  <span style={{ width: `${t.pct}%`, background: "var(--vt-accent)" }} />
                </div>
                <span className="w-8 text-right text-[11px] tabular-nums" style={{ color: "var(--vt-muted)" }}>
                  {t.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ── row 4: voice + actions ─────────────────────────────────────── */

const VOICE_DOTS: Record<string, string> = {
  bad: "var(--vt-bad)",
  good: "var(--vt-accent)",
  purple: "var(--vt-faint)",
  warn: "var(--vt-warn)",
};

function VoiceCard() {
  const total = voice.mood.reduce((s, m) => s + m.pct, 0);
  const moodColors = ["var(--vt-accent)", "var(--vt-warn)", "var(--vt-bad)"];
  return (
    <Card className="flex flex-col px-7 pb-6 pt-6">
      <p className="vt-label">Employee Voice</p>
      <p className="mt-1 text-[12px]" style={{ color: "var(--vt-faint)" }}>
        AI-clustered · {voice.comments.toLocaleString()} comments
      </p>

      <div className="mt-5 flex h-[10px] gap-1 overflow-hidden rounded-full">
        {voice.mood.map((m, i) => (
          <div
            key={m.label}
            style={{ width: `${(m.pct / total) * 100}%`, background: moodColors[i], borderRadius: 99 }}
          />
        ))}
      </div>
      <p className="mt-2.5 text-[12px]" style={{ color: "var(--vt-muted)" }}>
        {voice.mood.map((m) => `${m.pct}% ${m.label.toLowerCase()}`).join(" · ")}
      </p>

      <div className="mt-4 flex flex-1 flex-wrap content-end gap-2">
        {voice.themes.map((t) => (
          <span key={t.name} className="vt-chip">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: VOICE_DOTS[t.tone] }} />
            {t.name}
            <span
              style={{
                color: t.tone === "bad" ? "var(--vt-bad)" : t.tone === "good" ? "var(--vt-accent-ink)" : "var(--vt-faint)",
                fontWeight: 600,
              }}
            >
              {t.tag}
            </span>
          </span>
        ))}
      </div>
    </Card>
  );
}

const NUDGE_STATS = [
  {
    value: "48",
    valueColor: "var(--vt-ink)",
    label: "recommended",
    sub: "avg +6 pts impact",
    subColor: "var(--vt-accent-ink)",
    bar: "var(--vt-accent)",
  },
  {
    value: "17",
    valueColor: "var(--vt-ink)",
    label: "pending",
    sub: "5 overdue · SLA risk",
    subColor: "var(--vt-bad)",
    bar: "var(--vt-bad)",
  },
  {
    value: "92%",
    valueColor: "var(--vt-ink)",
    label: "SLA met",
    sub: "on track this month",
    subColor: "var(--vt-muted)",
    bar: "var(--vt-line)",
  },
] as const;

function NudgesCard() {
  return (
    <Card className="flex flex-col px-7 pb-6 pt-6">
      <p className="vt-label">Actions &amp; Nudges</p>
      <p className="mt-1 text-[12px]" style={{ color: "var(--vt-faint)" }}>
        AI-recommended this quarter
      </p>

      <div className="mt-5 flex flex-1 items-center gap-7">
        <div className="flex items-center gap-4">
          <Ring pct={64} />
          <div>
            <p className="vt-num text-[32px]" style={{ color: "var(--vt-ink)" }}>
              48
            </p>
            <p className="mt-1 text-[11.5px]" style={{ color: "var(--vt-faint)" }}>
              recommended
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-5">
          {NUDGE_STATS.map((s) => (
            <div key={s.label} className="flex gap-3">
              <span className="w-[3px] self-stretch rounded-full" style={{ background: s.bar }} />
              <div>
                <p className="vt-num text-[24px]" style={{ color: s.valueColor }}>
                  {s.value}{" "}
                  <span className="text-[11px]" style={{ color: "var(--vt-faint)" }}>
                    {s.label}
                  </span>
                </p>
                <p className="mt-1.5 text-[11px] font-medium" style={{ color: s.subColor }}>
                  {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ── page ───────────────────────────────────────────────────────── */

export default function VoltPage() {
  return (
    <div className="volt-root flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="grid grid-cols-[390px_1fr] gap-4">
            <GreetingCard />
            <KpiStrip />
          </div>

          <div className="mt-4 grid grid-cols-[390px_1fr] gap-4">
            <HealthCard />
            <SentimentCard />
          </div>

          <div className="mt-4 grid grid-cols-[390px_1fr] gap-4">
            <AttritionCard />
            <RecognitionCard />
          </div>

          <div className="mt-4 grid grid-cols-[390px_1fr] gap-4">
            <VoiceCard />
            <NudgesCard />
          </div>
        </div>
      </main>
    </div>
  );
}
