"use client";
/* Data-viz primitives — built to the dataviz method, not by taste.

   · Categorical colour comes from the validated --viz-1..4 slots, in order.
   · Thin marks: columns <= 24px with a 4px rounded data-end, square at the
     baseline; 2px lines; end dots r=4 with a 2px surface ring.
   · A 2px surface gap between stacked segments; hairline solid gridlines.
   · Text never wears the series colour — a swatch or line-key beside it does.
   · Hover is the default: a crosshair on lines, the column band on columns,
     both reachable by keyboard; the tooltip leads with the value.
   · Every chart has a table view, so nothing is gated behind hover or colour.

   Geometry is measured, not stretched: the SVG is drawn at the container's
   real width, so dots stay round and labels stay the size they were set. */
import * as React from "react";

export type Series = { key: string; label: string; color: string; values: number[] };

/* ── measuring ─────────────────────────────────────────────────── */
function useWidth<T extends HTMLElement>(fallback = 640) {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => { const n = Math.round(el.getBoundingClientRect().width); if (n > 0) setW(n); };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    window.addEventListener("resize", read);
    return () => { ro.disconnect(); window.removeEventListener("resize", read); };
  }, []);
  return [ref, w] as const;
}

/* clean ticks: 0 / 20 / 40 … */
function niceStep(range: number, count: number) {
  const raw = range / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}
function ticks(lo: number, hi: number, count = 4) {
  const step = niceStep(hi - lo, count);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const out: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}
const comma = (n: number) => n.toLocaleString("en-US");

/* ── furniture ─────────────────────────────────────────────────── */
export function Legend({ series, shape = "rect" }: { series: Pick<Series, "key" | "label" | "color">[]; shape?: "rect" | "line" }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5" aria-label="Legend">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5 text-[12px] text-muted">
          {shape === "rect"
            ? <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} aria-hidden />
            : <span className="h-[2px] w-3.5 rounded-full" style={{ background: s.color }} aria-hidden />}
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/** Chart / Table switch. The table is a real view, not a screen-reader afterthought. */
export function ViewToggle({ table, onChange, label }: { table: boolean; onChange: (t: boolean) => void; label: string }) {
  const b = (on: boolean) => `min-h-[44px] rounded-full px-3 text-[12px] font-semibold transition lg:min-h-[28px] ${on ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`;
  return (
    <div role="group" aria-label={`${label} view`} className="flex shrink-0 rounded-full bg-soft p-0.5">
      <button className={b(!table)} aria-pressed={!table} onClick={() => onChange(false)}>Chart</button>
      <button className={b(table)} aria-pressed={table} onClick={() => onChange(true)}>Table</button>
    </div>
  );
}

function DataTable({ caption, labels, series, format, total }: { caption: string; labels: string[]; series: Series[]; format: (v: number) => string; total?: boolean }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[360px] border-collapse text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-left text-[12px] text-faint">
            <th scope="col" className="px-1 pb-2 font-semibold">&nbsp;</th>
            {series.map((s) => (
              <th key={s.key} scope="col" className="px-1 pb-2 text-right font-semibold">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-[2px]" style={{ background: s.color }} aria-hidden />{s.label}</span>
              </th>
            ))}
            {total && <th scope="col" className="px-1 pb-2 text-right font-semibold">Total</th>}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l} className="border-t border-line">
              <th scope="row" className="px-1 py-2 text-left font-medium text-ink">{l}</th>
              {series.map((s) => <td key={s.key} className="px-1 py-2 text-right tabular-nums text-muted">{format(s.values[i])}</td>)}
              {total && <td className="px-1 py-2 text-right font-semibold tabular-nums text-ink">{format(series.reduce((n, s) => n + s.values[i], 0))}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tip({ x, w, title, rows, footer }: { x: number; w: number; title: string; rows: { color: string; label: string; value: string }[]; footer?: string }) {
  /* beside the mark, never on it — right if there is room, otherwise left */
  const TW = 188, GAP = 18;
  const left = x + GAP + TW <= w ? x + GAP : Math.max(0, x - GAP - TW);
  return (
    <div role="status" className="pointer-events-none absolute top-0 z-10 rounded-xl border border-line bg-card px-3 py-2.5 shadow-[0_12px_30px_-12px_rgba(20,20,40,0.35)]" style={{ left, width: TW }}>
      <p className="text-[12px] text-faint">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2">
            <span className="h-[2px] w-3 shrink-0 rounded-full" style={{ background: r.color }} aria-hidden />
            <span className="text-[14px] font-semibold tabular-nums text-ink">{r.value}</span>
            <span className="truncate text-[12px] text-muted">{r.label}</span>
          </li>
        ))}
      </ul>
      {footer && <p className="mt-1.5 border-t border-line pt-1.5 text-[12px] font-semibold text-ink">{footer}</p>}
    </div>
  );
}

/* ── stacked columns ──────────────────────────────────────────── */
export function StackedColumns({
  labels, series, height = 220, caption, format = comma, unit = "", table = false, tooltipTitle = (l) => l,
}: {
  labels: string[]; series: Series[]; height?: number; caption: string;
  format?: (v: number) => string; unit?: string; table?: boolean; tooltipTitle?: (label: string) => string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  if (table) return <DataTable caption={caption} labels={labels} series={series} format={format} total />;

  const n = labels.length;
  const totals = labels.map((_, i) => series.reduce((s, x) => s + x.values[i], 0));
  const yt = ticks(0, Math.max(...totals) * 1.08, 4);
  const yMax = yt[yt.length - 1];
  const M = { l: 36, r: 8, t: 18, b: 26 };
  const pw = Math.max(40, W - M.l - M.r), ph = height - M.t - M.b;
  const band = pw / n;
  const cw = Math.min(24, band * 0.56);
  const y = (v: number) => M.t + ph - (v / yMax) * ph;
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(pw / 52))));
  const GAP = 2;

  return (
    <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
      <svg width={W} height={height} role="img" aria-label={caption} className="block overflow-visible">
        {yt.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={M.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[var(--faint)] text-[12px] tabular-nums">{comma(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => {
          const cx = M.l + band * i + band / 2;
          let base = M.t + ph;
          const visible = series.filter((s) => s.values[i] > 0);
          const top = visible[visible.length - 1]?.key;
          const dim = hover !== null && hover !== i;
          return (
            <g key={l} style={{ opacity: dim ? 0.45 : 1, transition: "opacity 150ms" }}>
              {series.map((s) => {
                const v = s.values[i];
                if (v <= 0) return null;
                const h = (v / yMax) * ph;
                const isTop = s.key === top;
                const segH = Math.max(1, h - (isTop ? 0 : GAP));
                const x0 = cx - cw / 2, y0 = base - h + (isTop ? 0 : GAP);
                base -= h;
                const r = isTop ? Math.min(4, segH, cw / 2) : 0;
                const d = r
                  ? `M${x0},${y0 + segH} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + cw - r} Q${x0 + cw},${y0} ${x0 + cw},${y0 + r} V${y0 + segH} Z`
                  : `M${x0},${y0 + segH} V${y0} H${x0 + cw} V${y0 + segH} Z`;
                return <path key={s.key} d={d} fill={s.color} />;
              })}
              {(i % every === 0 || i === n - 1) && (
                <text x={cx} y={height - 6} textAnchor="middle" className="fill-[var(--faint)] text-[12px]">{l}</text>
              )}
              {/* the latest total, on its cap — the one number the chart is about */}
              {i === n - 1 && (
                <text x={cx} y={y(totals[i]) - 6} textAnchor="middle" className="fill-[var(--ink)] text-[12px] font-semibold tabular-nums">{format(totals[i])}{unit}</text>
              )}
              <rect
                x={M.l + band * i} y={M.t} width={band} height={ph} fill="transparent"
                tabIndex={0} role="button" aria-label={`${tooltipTitle(l)}: ${series.map((s) => `${s.label} ${format(s.values[i])}`).join(", ")}, total ${format(totals[i])}`}
                className="cursor-default outline-none focus-visible:stroke-[var(--purple)] focus-visible:stroke-2"
                onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <Tip
          x={M.l + band * hover + band / 2} w={W}
          title={tooltipTitle(labels[hover])}
          rows={[...series].reverse().map((s) => ({ color: s.color, label: s.label, value: `${format(s.values[hover])}${unit}` }))}
          footer={`${format(totals[hover])}${unit} in total`}
        />
      )}
    </div>
  );
}

/* ── lines ─────────────────────────────────────────────────────── */
export function LineChart({
  labels, series, height = 220, caption, domain, format = (v) => `${v}`, unit = "", table = false, tooltipTitle = (l) => l,
}: {
  labels: string[]; series: Series[]; height?: number; caption: string; domain?: [number, number];
  format?: (v: number) => string; unit?: string; table?: boolean; tooltipTitle?: (label: string) => string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [at, setAt] = React.useState<number | null>(null);
  if (table) return <DataTable caption={caption} labels={labels} series={series} format={(v) => `${format(v)}${unit}`} />;

  const n = labels.length;
  const all = series.flatMap((s) => s.values);
  const yt = ticks(domain ? domain[0] : Math.min(...all), domain ? domain[1] : Math.max(...all), 4);
  const lo = yt[0], hi = yt[yt.length - 1];
  const M = { l: 36, r: 48, t: 14, b: 26 };
  const pw = Math.max(40, W - M.l - M.r), ph = height - M.t - M.b;
  const x = (i: number) => M.l + (n === 1 ? pw / 2 : (pw * i) / (n - 1));
  const y = (v: number) => M.t + ph - ((v - lo) / (hi - lo)) * ph;
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(pw / 56))));
  const ends = series.map((s) => y(s.values[n - 1]));
  /* end labels only when they separate; converging lines fall back to legend + tooltip */
  const endLabels = ends.every((a, i) => ends.every((b, j) => i === j || Math.abs(a - b) >= 16));

  const pick = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const rel = clientX - r.left - M.l;
    setAt(Math.max(0, Math.min(n - 1, Math.round((rel / pw) * (n - 1)))));
  };

  return (
    <div
      ref={ref}
      className="relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]"
      tabIndex={0}
      role="group"
      aria-label={`${caption}. Use the left and right arrow keys to read each point.`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); setAt((a) => Math.min(n - 1, (a ?? -1) + 1)); }
        if (e.key === "ArrowLeft") { e.preventDefault(); setAt((a) => Math.max(0, (a ?? n) - 1)); }
        if (e.key === "Escape") setAt(null);
      }}
      onBlur={() => setAt(null)}
      onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
      onPointerLeave={() => setAt(null)}
    >
      <svg width={W} height={height} aria-hidden className="block overflow-visible">
        {yt.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={M.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[var(--faint)] text-[12px] tabular-nums">{t}{unit}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % every === 0 || i === n - 1) && (
          <text key={l} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-[var(--faint)] text-[12px]">{l}</text>
        ))}
        {at !== null && <line x1={x(at)} x2={x(at)} y1={M.t} y2={M.t + ph} stroke="var(--faint)" strokeWidth={1} />}
        {series.map((s) => (
          <path
            key={s.key}
            d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
            fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
          />
        ))}
        {series.map((s, k) => {
          const i = at ?? n - 1;
          return (
            <g key={s.key}>
              <circle cx={x(i)} cy={y(s.values[i])} r={4} fill={s.color} stroke="var(--card)" strokeWidth={2} />
              {at === null && endLabels && (
                <text x={x(n - 1) + 9} y={ends[k]} dy="0.32em" className="fill-[var(--ink)] text-[12px] font-semibold tabular-nums">{format(s.values[n - 1])}{unit}</text>
              )}
            </g>
          );
        })}
      </svg>
      {at !== null && (
        <Tip x={x(at)} w={W} title={tooltipTitle(labels[at])} rows={series.map((s) => ({ color: s.color, label: s.label, value: `${format(s.values[at])}${unit}` }))} />
      )}
    </div>
  );
}

/* ── one-series bars (horizontal, value at the tip) ─────────────── */
export function BarList({
  rows, max, format = (v) => `${v}`, unit = "", color = "var(--viz-1)", caption,
}: {
  rows: { label: string; value: number; note?: string }[]; max?: number; format?: (v: number) => string; unit?: string; color?: string; caption: string;
}) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5" aria-label={caption}>
      {rows.map((r) => (
        <li key={r.label} className="group">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate text-ink">{r.label}</span>
            {r.note && <span className="shrink-0 text-[12px] text-faint">{r.note}</span>}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="relative h-3 flex-1">
              <span
                className="absolute inset-y-0 left-0 rounded-r-[4px] transition-opacity group-hover:opacity-80"
                style={{ width: `${Math.max(1, (r.value / top) * 100)}%`, background: color }}
              />
            </span>
            <span className="w-11 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink">{format(r.value)}{unit}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
