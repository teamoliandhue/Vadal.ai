"use client";
/* Hand-rolled SVG chart primitives — no chart library, full visual control.
   Client-only: the charts below carry their own hover state. Every consumer is
   already a client component, so this costs nothing. */
import * as React from "react";

function smoothPath(
  values: number[],
  w: number,
  h: number,
  pad = 6,
  scale?: { min: number; max: number },
) {
  const max = scale ? scale.max : Math.max(...values);
  const min = scale ? scale.min : Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - pad - ((v - min) / range) * (h - pad * 2),
  ]);
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return { d, last: pts[pts.length - 1] };
}

export function TrendChart({
  series,
  benchmark,
  color = "#6d5df0",
  benchColor = "#c9c9d4",
  height = 210,
  className = "",
  id = "trend",
  labels,
  seriesLabel = "This period",
  benchLabel = "Benchmark",
  caption,
}: {
  series: number[];
  benchmark?: number[];
  color?: string;
  benchColor?: string;
  height?: number;
  className?: string;
  id?: string;
  /** Period labels (one per point). When given, a visually-hidden data table is
   *  rendered so screen readers get the actual values, not just "a chart". */
  labels?: string[];
  seriesLabel?: string;
  benchLabel?: string;
  caption?: string;
}) {
  const W = 800;
  // scale both series against the union so they share an axis
  const all = benchmark ? [...series, ...benchmark] : series;
  const scale = { min: Math.min(...all), max: Math.max(...all) };
  const m = smoothPath(series, W, height, 8, scale);
  const b = benchmark ? smoothPath(benchmark, W, height, 8, scale) : null;
  return (
    <div className={className}>
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${m.d} L ${W} ${height} L 0 ${height} Z`} fill={`url(#${id}-fill)`} />
      {b && (
        <path
          d={b.d}
          fill="none"
          stroke={benchColor}
          strokeWidth="2"
          strokeDasharray="5 7"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path
        d={m.d}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="draw-animate"
      />
      <circle
        cx={m.last[0] - 3}
        cy={m.last[1] + 1}
        r="5.5"
        fill={color}
        stroke="var(--card, #fff)"
        strokeWidth="3"
      />
    </svg>
    {labels && (
      <table className="sr-only">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">{seriesLabel}</th>
            {benchmark && <th scope="col">{benchLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {labels.map((lab, i) => (
            <tr key={lab}>
              <th scope="row">{lab}</th>
              <td>{series[i]}</td>
              {benchmark && <td>{benchmark[i]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    )}
    </div>
  );
}

export function Sparkline({
  values,
  color,
  height = 56,
  id,
  className = "",
  benchmark,
}: {
  values: number[];
  color: string;
  height?: number;
  id: string;
  className?: string;
  /** Optional faint dashed reference line, drawn on a shared scale. */
  benchmark?: number[];
}) {
  const W = 300;
  const all = benchmark ? [...values, ...benchmark] : values;
  const scale = { min: Math.min(...all), max: Math.max(...all) };
  const m = smoothPath(values, W, height, 5, scale);
  const b = benchmark ? smoothPath(benchmark, W, height, 5, scale) : null;
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${m.d} L ${W} ${height} L 0 ${height} Z`} fill={`url(#${id}-fill)`} />
      {b && (
        <path
          d={b.d}
          fill="none"
          stroke="var(--faint)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path
        d={m.d}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ScoreRing({
  score,
  size = 148,
  stroke = 11,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2 - 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="0.4" stopColor="#818cf8" />
            <stop offset="0.7" stopColor="#c084fc" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#eeeef3" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${c} ${c})`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${circ}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-bold leading-none tracking-tight text-ink">
          {score}
        </span>
        <span className="mt-1 text-[12px] text-faint">of 100</span>
      </div>
    </div>
  );
}

/** Half-arc gauge with warm gradient — editorial score treatment. */
export function ArcGauge({
  score,
  width = 220,
  label = "workforce health",
}: {
  score: number;
  width?: number;
  label?: string;
}) {
  const stroke = 14;
  const r = (width - stroke) / 2;
  const c = width / 2;
  const halfCirc = Math.PI * r;
  const dash = halfCirc * (score / 100);
  const height = width / 2 + stroke / 2 + 4;
  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} aria-hidden>
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#f6b26b" />
            <stop offset="0.45" stopColor="#f08fb5" />
            <stop offset="1" stopColor="#8b7cf8" />
          </linearGradient>
        </defs>
        <path
          d={`M ${stroke / 2} ${c} A ${r} ${r} 0 0 1 ${width - stroke / 2} ${c}`}
          fill="none"
          stroke="var(--gauge-track, #efeff3)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${c} A ${r} ${r} 0 0 1 ${width - stroke / 2} ${c}`}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${halfCirc}`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${halfCirc}` }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-[44px] font-bold leading-none tracking-tight">
          {score}
        </span>
        <span className="mt-1 text-[12px] text-faint">{label}</span>
      </div>
    </div>
  );
}

/** Decorative gradient blob art (for the dark promo card). */
export function BlobArt({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <div
        className="animate-floaty absolute -right-10 top-1/2 h-48 w-36 -translate-y-1/2 rounded-[48%]"
        style={{
          background: "linear-gradient(135deg, #f472b6 0%, #7c3aed 100%)",
          transform: "translateY(-50%) rotate(-18deg)",
        }}
      />
      <div
        className="animate-floaty2 absolute -bottom-16 right-14 h-36 w-28 rounded-[48%] opacity-90"
        style={{
          background: "linear-gradient(315deg, #38bdf8 0%, #818cf8 100%)",
          transform: "rotate(14deg)",
        }}
      />
      <div
        className="animate-floaty absolute -bottom-10 -right-4 h-24 w-16 rounded-[48%] opacity-85"
        style={{
          background: "linear-gradient(45deg, #facc15 0%, #fb7185 100%)",
          transform: "rotate(-30deg)",
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Thrive charts.

   Form before colour, per the house method. Two jobs, two forms:

   · "am I hitting my goal" is a RATIO, not a series — a ring reads a
     ratio in one glance where a linear bar reads as a slot to fill.
   · "how has my week gone" is CHANGE OVER TIME with a target. That is
     an area with a reference line, not two-tone bars: the bars encoded
     above/below in colour alone, which is both less legible and less
     beautiful than simply drawing the line they are above or below.

   One series, so one hue and no legend — the heading names it. The goal
   is a dashed rule, so above/below is read from position rather than
   from colour, and today is the only labelled point.
   ══════════════════════════════════════════════════════════════════ */

/** Progress toward a goal, as a ratio. Brand gradient, draws in on mount. */
export function GoalRing({
  value,
  goal,
  size = 132,
  stroke = 10,
  label,
  format = (v: number) => String(v),
  id = "goal",
}: {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
  label?: string;
  format?: (v: number) => string;
  id?: string;
}) {
  const r = (size - stroke) / 2 - 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / goal));
  const dash = circ * pct;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id={`${id}-ring`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--client-brand, var(--brand))" stopOpacity="0.75" />
            <stop offset="1" stopColor="var(--brand-light)" />
          </linearGradient>
        </defs>
        {/* track sits at low opacity so the ring reads on both grounds */}
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke={`url(#${id}-ring)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${c} ${c})`}
          className="ring-animate"
          style={{ ["--ring-circ" as string]: `${circ}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">
          {format(value)}
        </span>
        {label && <span className="mt-1.5 text-[12px] text-faint">{label}</span>}
      </div>
    </div>
  );
}

/**
 * Seven days against a daily target.
 *
 * Area + reference line rather than bars: the goal line does the work the
 * two-tone bars were doing badly, and a filled curve carries a week's shape
 * far better than seven separate rectangles.
 */
export function DayArea({
  values,
  goal,
  labels,
  height = 96,
  unit = "",
  id = "week",
  className = "",
}: {
  values: number[];
  goal?: number;
  labels: string[];
  height?: number;
  unit?: string;
  id?: string;
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const w = 320;
  const padY = 14;
  const max = Math.max(...values, goal ?? 0) * 1.12;
  const min = 0;
  /* Inset the plot by 2% each side. The endpoint marker is centred on its
     point, so a series running to exactly 100% hangs half a marker outside the
     frame — and the curve looked cramped against both edges. */
  const INSET = 0.02;
  const x = (i: number) => (INSET + (i / (values.length - 1)) * (1 - INSET * 2)) * w;
  const y = (v: number) => padY + (1 - (v - min) / (max - min)) * (height - padY * 2);

  // Catmull–Rom → cubic bézier. A week has a shape; straight segments hide it.
  const path = values
    .map((v, i) => {
      if (i === 0) return `M ${x(0)} ${y(v)}`;
      const p0 = { x: x(i - 1), y: y(values[i - 1]) };
      const p1 = { x: x(i), y: y(v) };
      const cx = (p0.x + p1.x) / 2;
      return `C ${cx} ${p0.y} ${cx} ${p1.y} ${p1.x} ${p1.y}`;
    })
    .join(" ");
  const area = `${path} L ${x(values.length - 1)} ${height} L ${x(0)} ${height} Z`;
  const last = values.length - 1;
  const active = hover ?? last;

  const pctX = (INSET + (active / (values.length - 1)) * (1 - INSET * 2)) * 100;
  const pctY = ((y(values[active]) - 0) / height) * 100;

  return (
    <figure className={`m-0 ${className}`}>
      {/* The path is stretched to fill the width, which is fine for a curve and
          wrong for a circle — preserveAspectRatio="none" would turn the endpoint
          marker into an ellipse and clip it at the edge. So the marker lives in
          an HTML overlay positioned by percentage instead: always round, never
          cropped, at any width. */}
      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${w} ${height}`}
          width="100%"
          height={height}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Last ${values.length} days${unit ? `, ${unit}` : ""}`}
          className="block"
        >
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--client-brand, var(--brand))" stopOpacity="0.30" />
              <stop offset="1" stopColor="var(--client-brand, var(--brand))" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <path d={area} fill={`url(#${id}-fill)`} />

          {/* the target, as a rule — this is what replaces the two-tone bars */}
          {goal !== undefined && (
            <line
              x1={x(0)} x2={x(values.length - 1)} y1={y(goal)} y2={y(goal)}
              stroke="var(--faint)" strokeWidth="1" strokeDasharray="3 4" opacity="0.7"
              vectorEffect="non-scaling-stroke"
            />
          )}

          <path
            d={path}
            fill="none"
            stroke="var(--client-brand, var(--brand))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="draw-animate"
          />
        </svg>

        {/* endpoint marker — round at any width */}
        <span
          aria-hidden
          className="pointer-events-none absolute z-10 block h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] bg-card transition-[left,top] duration-200"
          style={{ left: `${pctX}%`, top: `${pctY}%`, borderColor: "var(--client-brand, var(--brand))" }}
        />

        {/* generous hit targets */}
        <div className="absolute inset-0 flex">
          {values.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${labels[i]}: ${values[i]} ${unit}`}
              className="h-full flex-1 cursor-default"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
            />
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        {labels.map((l, i) => (
          <span
            key={i}
            className={`flex-1 text-center text-[11px] tabular-nums transition-colors ${
              i === active ? "font-semibold text-ink" : "text-faint"
            }`}
          >
            {l}
          </span>
        ))}
      </div>

      <figcaption className="mt-1 text-[12px] text-faint tabular-nums">
        {values[active].toLocaleString()} {unit}
        {goal !== undefined && (
          <span className="text-faint"> · target {goal.toLocaleString()}</span>
        )}
      </figcaption>
    </figure>
  );
}
