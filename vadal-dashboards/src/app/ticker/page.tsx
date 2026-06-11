import {
  Bell,
  Clock,
  Mail,
  Search,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { org, voice, recognitionBoard } from "@/lib/data";
import { TickerThemeToggle } from "./ticker-chrome";

/* ── primitives ─────────────────────────────────────────────────── */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`tk-card ${className}`}>{children}</div>;
}

function Trend({ dir, children }: { dir: "up" | "down"; children: React.ReactNode }) {
  const Icon = dir === "up" ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-medium"
      style={{ color: dir === "up" ? "var(--tk-good)" : "var(--tk-bad)" }}
    >
      <Icon size={12} strokeWidth={2.2} />
      <span style={{ color: "var(--tk-muted)" }}>{children}</span>
    </span>
  );
}

/* ── top nav ────────────────────────────────────────────────────── */

const NAV_LINKS = ["Listening", "Recognition", "Communication", "Analytics", "Manager Hub"];

function TopNav() {
  return (
    <header className="flex items-center justify-center gap-1 px-8 pt-7">
      <button className="tk-nav-active">Dashboard</button>
      {NAV_LINKS.map((l) => (
        <button key={l} className="tk-nav">
          {l}
        </button>
      ))}
      <div className="ml-10 flex items-center gap-2">
        <button className="tk-icon-btn">
          <Search size={14} strokeWidth={1.8} />
        </button>
        <button className="tk-icon-btn">
          <Clock size={14} strokeWidth={1.8} />
        </button>
        <button className="tk-icon-btn">
          <Send size={14} strokeWidth={1.8} />
        </button>
        <button className="tk-icon-btn">
          <Mail size={14} strokeWidth={1.8} />
        </button>
        <button className="tk-icon-btn">
          <Bell size={14} strokeWidth={1.8} />
        </button>
        <TickerThemeToggle />
        <span
          className="grid h-10 w-10 place-items-center rounded-full text-[14px] font-bold"
          style={{ background: "var(--tk-accent)", color: "#1a1a17" }}
        >
          {org.user[0]}
        </span>
      </div>
    </header>
  );
}

/* ── hero: greeting + headline stats ────────────────────────────── */

const PERIODS = ["1H", "1D", "1W", "1M", "1Y"];

const HEADLINE = [
  { value: "82", suffix: "/100", label: "Engagement", dir: "up", delta: "4.00" },
  { value: "74.5", suffix: "%", label: "Participation", dir: "down", delta: "2.33%" },
  { value: "38", suffix: "+", label: "eNPS Sentiment", dir: "up", delta: "12" },
] as const;

function Hero() {
  return (
    <div className="flex items-end justify-between px-12 pt-10">
      <div>
        <h1 className="tk-num text-[38px]" style={{ color: "var(--tk-ink)" }}>
          <span className="text-[20px]" style={{ color: "var(--tk-muted)" }}>
            Hi{" "}
          </span>
          {org.user} ,
        </h1>
        <div className="mt-5 flex items-center gap-2">
          <span className="text-[12px]" style={{ color: "var(--tk-muted)" }}>
            Time period :
          </span>
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: "var(--tk-card)" }}>
            {PERIODS.map((p) => (
              <button key={p} className="tk-period" data-active={p === "1D" ? "true" : "false"}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-14">
        {HEADLINE.map((s) => (
          <div key={s.label}>
            <p className="tk-num text-[50px]" style={{ color: "var(--tk-ink)" }}>
              {s.value}
              <span className="text-[28px]" style={{ color: "var(--tk-faint)" }}>
                {s.suffix}
              </span>
            </p>
            <p className="mt-2 text-[12px]" style={{ color: "var(--tk-muted)" }}>
              {s.label}
            </p>
            <div className="mt-1.5">
              <Trend dir={s.dir}>{s.delta}</Trend>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 self-start pt-2">
        <span className="text-[12px]" style={{ color: "var(--tk-muted)" }}>
          Updated at :
        </span>
        <span className="tk-soft-pill">9:00 AM 10/06/26</span>
      </div>
    </div>
  );
}

/* ── the tape chart ─────────────────────────────────────────────── */

const N = 200;
/* deterministic waves — engagement (amber) and participation (gray) */
const ENG = Array.from({ length: N }, (_, i) => {
  const t = i / N;
  return (
    44 +
    18 * t +
    9 * Math.sin(i * 0.16 + 1.2) +
    5 * Math.sin(i * 0.43 + 0.4) +
    3 * Math.sin(i * 0.91)
  );
});
const PART = Array.from({ length: N }, (_, i) => {
  const t = i / N;
  return (
    58 +
    14 * Math.sin(i * 0.09 + 2.4) +
    8 * Math.sin(i * 0.31 + 1.1) -
    16 * t +
    4 * Math.sin(i * 0.71 + 3)
  );
});
const BARS = Array.from({ length: N }, (_, i) =>
  52 + 26 * Math.abs(Math.sin(i * 0.83 + 0.7)) + 18 * Math.abs(Math.sin(i * 0.29 + 2.1)),
);

function wavePath(values: number[], w: number, h: number) {
  const max = 100;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - (v / max) * h]);
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  return d;
}

const HOURS = [
  "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM",
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

function TapeChart() {
  const W = 1340;
  const H = 255;
  const brushX0 = W * (5 / 12);
  const brushX1 = W * (7 / 12);
  return (
    <div className="px-12 pt-8">
      <div className="relative">
        {/* y labels */}
        <div
          className="absolute -left-7 flex h-full flex-col justify-between py-0.5 text-right text-[9px]"
          style={{ color: "var(--tk-faint)", width: 22 }}
        >
          {[100, 80, 60, 40, 20, 0].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
          {/* micro-bars */}
          {BARS.map((b, i) => (
            <rect
              key={i}
              x={(i / (N - 1)) * (W - 2)}
              y={H - (b / 100) * H}
              width={1}
              height={(b / 100) * H}
              fill="var(--tk-bar)"
            />
          ))}
          {/* mid gridline */}
          <rect x={0} y={H / 2} width={W} height={1} fill="var(--tk-grid)" />
          {/* brushed range */}
          <rect x={brushX0} y={0} width={brushX1 - brushX0} height={H} fill="var(--tk-brush)" />
          <rect x={brushX0} y={0} width={1.5} height={H} fill="var(--tk-accent-deep)" opacity={0.5} />
          <rect x={brushX1} y={0} width={1.5} height={H} fill="var(--tk-accent-deep)" opacity={0.5} />
          {/* participation — gray */}
          <path
            d={wavePath(PART, W, H)}
            fill="none"
            stroke="var(--tk-line-gray)"
            strokeWidth={1.6}
            vectorEffect="non-scaling-stroke"
          />
          {/* engagement — amber tape */}
          <path
            d={wavePath(ENG, W, H)}
            fill="none"
            stroke="var(--tk-accent)"
            strokeWidth={2.2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="draw-animate"
          />
        </svg>

        {/* legend */}
        <div
          className="absolute bottom-4 right-2 flex items-center gap-1 rounded-full p-1"
          style={{ background: "var(--tk-canvas)" }}
        >
          <button className="tk-legend" data-active="true">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#1a1a17" }} />
            Engagement
          </button>
          <button className="tk-legend">Participation</button>
          <button className="tk-legend">Benchmark</button>
        </div>
      </div>

      {/* scrubber */}
      <div className="relative mt-5 h-[16px] rounded-full" style={{ background: "var(--tk-card)" }}>
        <div
          className="absolute inset-y-0 rounded-full"
          style={{ left: "41.6%", width: "16.7%", background: "var(--tk-track)" }}
        />
        <span
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ left: "41.6%", background: "var(--tk-ink)" }}
        />
        <span
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
          style={{ left: "58.3%", background: "var(--tk-ink)" }}
        />
      </div>

      {/* time axis */}
      <div className="mt-2 flex justify-between text-[9.5px]" style={{ color: "var(--tk-faint)" }}>
        {HOURS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  );
}

/* ── section heading ────────────────────────────────────────────── */

function SectionHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="tk-h2">{title}</h2>
        <p className="tk-sub mt-1.5">{sub}</p>
      </div>
      {right}
    </div>
  );
}

/* ── mood distribution (segmented half-arc) ─────────────────────── */

const MOOD_SEGMENTS = [
  { label: "Low", pct: 12, color: "var(--tk-line-gray)" },
  { label: "Good", pct: 22, color: "var(--tk-muted)" },
  { label: "Okay", pct: 26, color: "var(--tk-ink)" },
  { label: "Great", pct: 22, color: "var(--tk-accent)" },
  { label: "Poor", pct: 6, color: "var(--tk-track)" },
] as const;

function MoodArc() {
  const W = 380;
  const stroke = 13;
  const r = (W - stroke) / 2 - 4;
  const c = W / 2;
  const halfCirc = Math.PI * r;
  const total = MOOD_SEGMENTS.reduce((s, m) => s + m.pct, 0);
  const gap = 6;
  const arcs = MOOD_SEGMENTS.reduce<
    { label: string; color: string; start: number; len: number }[]
  >((acc, m) => {
    const prev = acc[acc.length - 1];
    const start = prev ? prev.start + prev.len + gap : 0;
    const len = (m.pct / total) * (halfCirc - gap * MOOD_SEGMENTS.length);
    return [...acc, { label: m.label, color: m.color, start, len }];
  }, []);
  const H = W / 2 + stroke;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
      {arcs.map((a) => (
        <path
          key={a.label}
          d={`M ${stroke / 2 + 4} ${c} A ${r} ${r} 0 0 1 ${W - stroke / 2 - 4} ${c}`}
          fill="none"
          stroke={a.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${a.len} ${halfCirc}`}
          strokeDashoffset={-a.start}
        />
      ))}
    </svg>
  );
}

function MoodStat({ label, pct, dot }: { label: string; pct: number; dot: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--tk-muted)" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
        {label}
      </p>
      <p className="tk-num mt-1 text-[17px]" style={{ color: "var(--tk-ink)" }}>
        {pct}%
      </p>
    </div>
  );
}

function MoodCard() {
  return (
    <Card className="relative flex flex-col overflow-hidden px-6 pb-0 pt-5">
      <p className="text-[14px] font-medium" style={{ color: "var(--tk-ink)" }}>
        Mood distribution · this week
      </p>

      <div className="mt-3 flex items-start justify-between">
        <MoodStat label="Good" pct={22} dot="var(--tk-muted)" />
        <div className="text-center">
          <p className="tk-num text-[26px]" style={{ color: "var(--tk-ink)" }}>
            22%
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[12px]" style={{ color: "var(--tk-muted)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tk-accent)" }} />
            Great
          </p>
        </div>
        <MoodStat label="Okay" pct={26} dot="var(--tk-faint)" />
      </div>
      <div className="mt-1 flex items-start justify-between">
        <MoodStat label="Low" pct={12} dot="var(--tk-line-gray)" />
        <MoodStat label="Poor" pct={6} dot="var(--tk-track)" />
      </div>

      <div className="relative mx-auto -mb-7 mt-1 w-[82%]">
        <MoodArc />
        <div className="absolute inset-x-0 bottom-8 text-center">
          <p className="tk-num text-[40px]" style={{ color: "var(--tk-ink)" }}>
            {voice.comments.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[12px]" style={{ color: "var(--tk-muted)" }}>
            Responses
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ── AI-clustered themes (slider rows) ──────────────────────────── */

const THEMES = [
  { label: "Workload", pct: 72 },
  { label: "Career growth", pct: 46 },
  { label: "Manager support", pct: 40 },
  { label: "Pay and Benefits", pct: 80 },
] as const;

function ThemesCard() {
  return (
    <Card className="flex flex-col px-7 pb-7 pt-5">
      <p className="text-[14px] font-medium" style={{ color: "var(--tk-ink)" }}>
        AI-clustered themes
      </p>
      <div className="flex flex-1 flex-col justify-evenly pt-2">
        {THEMES.map((t) => (
          <div key={t.label}>
            <div className="mb-2 flex items-baseline justify-end gap-2" style={{ paddingRight: `${94 - t.pct}%` }}>
              <span className="text-[11px]" style={{ color: "var(--tk-muted)" }}>
                {t.label}
              </span>
              <span className="tk-num text-[19px]" style={{ color: "var(--tk-ink)" }}>
                {t.pct}%
              </span>
              <TrendingDown size={11} style={{ color: "var(--tk-bad)" }} />
            </div>
            <div className="tk-slider">
              <i style={{ width: `${t.pct}%` }} />
              <b style={{ left: `${t.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── manager effectiveness (dot-matrix heat) ────────────────────── */

type Heat = "good" | "bad" | "warn";
const HEAT_COLOR: Record<Heat, string> = {
  good: "var(--tk-good-dot)",
  bad: "var(--tk-bad)",
  warn: "var(--tk-accent)",
};
const MANAGERS: { name: string; cells: Heat[] }[] = [
  { name: "Priya S.", cells: ["good", "bad", "good", "warn"] },
  { name: "Arun K.", cells: ["warn", "good", "good", "warn"] },
  { name: "Neha R.", cells: ["good", "bad", "good", "good"] },
  { name: "Anjali R", cells: ["warn", "good", "warn", "good"] },
  { name: "Sara M.", cells: ["good", "bad", "bad", "warn"] },
];

function DotBlock({ tone }: { tone: Heat }) {
  const cols = 12;
  const rows = 7;
  return (
    <svg viewBox={`0 0 ${cols * 6} ${rows * 6}`} className="block h-auto w-full" aria-hidden>
      {Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => (
          <circle key={`${x}-${y}`} cx={x * 6 + 3} cy={y * 6 + 3} r={1.8} fill={HEAT_COLOR[tone]} />
        )),
      )}
    </svg>
  );
}

function ManagerCard() {
  const cols = ["1:1s", "Recog", "Growth", "Sent."];
  return (
    <Card className="flex flex-col px-6 pb-6 pt-5">
      <div
        className="grid items-center gap-x-2 text-[11px]"
        style={{ gridTemplateColumns: "76px repeat(4, 1fr)", color: "var(--tk-muted)" }}
      >
        <span>Managers</span>
        {cols.map((c) => (
          <span key={c} className="text-center">
            {c}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-1 flex-col justify-between gap-2">
        {MANAGERS.map((m) => (
          <div
            key={m.name}
            className="grid items-center gap-x-2"
            style={{ gridTemplateColumns: "76px repeat(4, 1fr)" }}
          >
            <span className="text-[11.5px]" style={{ color: "var(--tk-muted)" }}>
              {m.name}
            </span>
            {m.cells.map((c, i) => (
              <DotBlock key={i} tone={c} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── attrition gauge + risk table ───────────────────────────────── */

function AttritionGauge() {
  /* circle bleeds off the left edge; the orange arc hugs the card's right
     side. Drawn in a fixed viewBox that scales with the card so the arc
     can never run through the text. */
  const VW = 200;
  const VH = 300;
  const r = 150;
  const cx = -16;
  const cy = VH / 2;
  const circ = 2 * Math.PI * r;
  const sweep = circ * 0.34;
  return (
    <Card className="relative flex flex-col justify-center overflow-hidden px-6 py-6">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="tk-attr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--tk-accent)" />
            <stop offset="1" stopColor="var(--tk-bad)" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--tk-track)" strokeWidth={1} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#tk-attr)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${sweep} ${circ}`}
          transform={`rotate(-55 ${cx} ${cy})`}
        />
      </svg>
      <div className="relative w-[68%] min-w-0">
        <p className="tk-num text-[24px]" style={{ color: "var(--tk-ink)" }}>
          34
          <span style={{ color: "var(--tk-faint)" }}>/100</span>
        </p>
        <span
          className="mt-2 block h-2 w-2 rounded-full"
          style={{ background: "var(--tk-accent)" }}
        />
        <p className="mt-2 text-[11.5px]" style={{ color: "var(--tk-muted)" }}>
          Org attrition risk
        </p>
        <p
          className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[9.5px] font-semibold"
          style={{ background: "var(--tk-bad-soft)", color: "var(--tk-bad)" }}
        >
          ▲ 3 vs last mo
        </p>
      </div>
    </Card>
  );
}

const RISK_TONE: Record<string, { color: string; bg: string; label: string }> = {
  High: { color: "var(--tk-bad)", bg: "var(--tk-bad-soft)", label: "High" },
  Med: { color: "var(--tk-warn)", bg: "var(--tk-warn-soft)", label: "Mid" },
  Low: { color: "var(--tk-good)", bg: "var(--tk-good-soft)", label: "Low" },
};

const RISK_ROWS = [
  { name: "A. Mehta", dept: "Engineering", level: "High", conf: "92", driver: "Manager" },
  { name: "R. Iyer", dept: "Sales", level: "High", conf: "88", driver: "Workload" },
  { name: "S. Khan", dept: "Finance", level: "Med", conf: "81", driver: "Pay" },
  { name: "P. Nair", dept: "Support", level: "Med", conf: "74", driver: "Growth" },
  { name: "L. Rao", dept: "Plant ops", level: "Low", conf: "64", driver: "Manager" },
] as const;

function RiskTable() {
  return (
    <Card className="flex flex-col px-7 pb-4 pt-5">
      <div
        className="grid items-center px-3 pb-2 text-[11px]"
        style={{ gridTemplateColumns: "1.2fr 1.2fr 0.9fr 0.6fr 1fr", color: "var(--tk-muted)" }}
      >
        <span>Employee</span>
        <span>Dept</span>
        <span>Risk</span>
        <span>Conf</span>
        <span>Top driver</span>
      </div>
      <div className="flex flex-1 flex-col">
        {RISK_ROWS.map((r) => {
          const tone = RISK_TONE[r.level];
          return (
            <div
              key={`${r.name}-${r.dept}`}
              className="grid flex-1 items-center rounded-xl px-3 py-2 text-[12px] transition-colors hover:bg-[rgba(127,127,127,0.06)]"
              style={{
                gridTemplateColumns: "1.2fr 1.2fr 0.9fr 0.6fr 1fr",
                borderTop: "1px solid var(--tk-grid)",
              }}
            >
              <span style={{ color: "var(--tk-ink)" }}>{r.name}</span>
              <span style={{ color: "var(--tk-muted)" }}>{r.dept}</span>
              <span>
                <span className="tk-risk" style={{ background: tone.bg, color: tone.color }}>
                  {tone.label}
                </span>
              </span>
              <span className="tabular-nums" style={{ color: "var(--tk-ink)" }}>
                {r.conf}
                <span style={{ color: "var(--tk-faint)" }}>%</span>
              </span>
              <span style={{ color: "var(--tk-muted)" }}>{r.driver}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── recognition waffle + peer/manager split ────────────────────── */

function Waffle({ pct, cols = 18, rows = 7, color }: { pct: number; cols?: number; rows?: number; color: string }) {
  const total = cols * rows;
  const filled = Math.round((pct / 100) * total);
  return (
    <svg viewBox={`0 0 ${cols * 9} ${rows * 9}`} className="block h-auto w-full" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        return (
          <circle
            key={i}
            cx={x * 9 + 4.5}
            cy={y * 9 + 4.5}
            r={2.6}
            fill={i < filled ? color : "var(--tk-track)"}
          />
        );
      })}
    </svg>
  );
}

function RecognitionsCard() {
  return (
    <Card className="flex flex-col px-7 pb-6 pt-5">
      <p className="text-[14px] font-medium" style={{ color: "var(--tk-ink)" }}>
        Recognitions
      </p>
      <p className="mt-4 text-[12px]" style={{ color: "var(--tk-muted)" }}>
        Total recognitions
      </p>
      <p className="tk-num mt-2 text-[52px]" style={{ color: "var(--tk-ink)" }}>
        {recognitionBoard.total.toLocaleString()}
      </p>
      <div className="mt-3">
        <Trend dir="up">12%</Trend>
      </div>

      <div className="mt-auto">
        <div className="mb-1.5 flex justify-end">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: "var(--tk-accent)", color: "#1a1a17" }}
          >
            {recognitionBoard.coverage} %
          </span>
        </div>
        <div className="w-[72%]">
          <Waffle pct={recognitionBoard.coverage} color="var(--tk-accent)" />
        </div>
      </div>
    </Card>
  );
}

function SplitCard() {
  return (
    <Card className="flex flex-col px-7 pb-6 pt-5">
      <p className="text-[14px] font-medium" style={{ color: "var(--tk-ink)" }}>
        Peer vs manager split
      </p>
      <div className="flex flex-1 flex-col justify-center">
        <p className="tk-num text-[44px]" style={{ color: "var(--tk-ink)" }}>
          58<span style={{ color: "var(--tk-faint)" }}> / </span>42
        </p>
        <div className="mt-5 flex h-[10px] gap-1 overflow-hidden rounded-full">
          <span className="rounded-full" style={{ width: "58%", background: "var(--tk-accent)" }} />
          <span className="rounded-full" style={{ width: "42%", background: "var(--tk-ink)" }} />
        </div>
        <div className="mt-3 flex gap-5 text-[11.5px]" style={{ color: "var(--tk-muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tk-accent)" }} />
            Peer-to-peer 58%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tk-ink)" }} />
            Manager-led 42%
          </span>
        </div>
        <p className="mt-5 text-[11.5px] leading-relaxed" style={{ color: "var(--tk-muted)" }}>
          Peer recognition keeps gaining share — up 6 pts this quarter, the healthiest mix since tracking began.
        </p>
      </div>
    </Card>
  );
}

/* ── page ───────────────────────────────────────────────────────── */

export default function TickerPage() {
  return (
    <div className="ticker-root min-h-screen pb-14">
      <TopNav />
      <Hero />
      <TapeChart />

      {/* voice + manager effectiveness */}
      <div className="grid grid-cols-[2fr_1fr] gap-10 px-12 pt-12">
        <SectionHead
          title="Employee Voice & Sentiment"
          sub={`Mood mix + AI-clustered themes · ${voice.comments.toLocaleString()} responses`}
          right={<span className="tk-alert">! 2 escalations</span>}
        />
        <SectionHead
          title="Manager Effectiveness"
          sub="Index 0–100 · 2 managers lagging"
          right={
            <span className="tk-soft-pill">
              L
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--tk-good-dot)" }} />
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--tk-accent)" }} />
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--tk-bad)" }} />
              H
            </span>
          }
        />
      </div>
      <div className="grid grid-cols-3 gap-6 px-12 pt-5">
        <MoodCard />
        <ThemesCard />
        <ManagerCard />
      </div>

      {/* attrition + recognition */}
      <div className="grid grid-cols-2 gap-10 px-12 pt-12">
        <SectionHead
          title="Attrition & Risk Intelligence"
          sub="Predictive risk model · top flight risks today"
          right={<span className="tk-soft-pill">Predictive</span>}
        />
        <SectionHead
          title="Recognition & Culture Index"
          sub="Recognitions, coverage & themes · this quarter"
        />
      </div>
      <div className="grid grid-cols-[0.55fr_1.45fr_1fr_1fr] gap-6 px-12 pt-5">
        <AttritionGauge />
        <RiskTable />
        <RecognitionsCard />
        <SplitCard />
      </div>
    </div>
  );
}
