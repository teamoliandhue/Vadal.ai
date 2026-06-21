/* Hand-rolled SVG chart primitives — no chart library, full visual control. */

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
}: {
  series: number[];
  benchmark?: number[];
  color?: string;
  benchColor?: string;
  height?: number;
  className?: string;
  id?: string;
}) {
  const W = 800;
  // scale both series against the union so they share an axis
  const all = benchmark ? [...series, ...benchmark] : series;
  const scale = { min: Math.min(...all), max: Math.max(...all) };
  const m = smoothPath(series, W, height, 8, scale);
  const b = benchmark ? smoothPath(benchmark, W, height, 8, scale) : null;
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
  );
}

export function Sparkline({
  values,
  color,
  height = 56,
  id,
  className = "",
}: {
  values: number[];
  color: string;
  height?: number;
  id: string;
  className?: string;
}) {
  const W = 300;
  const m = smoothPath(values, W, height, 5);
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
