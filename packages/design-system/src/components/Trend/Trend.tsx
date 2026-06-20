import * as React from 'react';

/** Mirrors the Figma `Trend` component set (Direction Up/Down/Flat) — a soft delta pill, bound to trend/* tokens. */
export type TrendDirection = 'up' | 'down' | 'flat';

export interface TrendProps extends React.HTMLAttributes<HTMLSpanElement> {
  direction?: TrendDirection;
  /** The delta value, e.g. "4" or "2.1%". */
  value: string;
}

const TONE: Record<TrendDirection, string> = {
  up: 'bg-[var(--trend-up-bg)] text-[var(--trend-up-label)]',
  down: 'bg-[var(--trend-down-bg)] text-[var(--trend-down-label)]',
  flat: 'bg-[var(--trend-flat-bg)] text-[var(--trend-flat-label)]',
};

const Glyph = ({ direction }: { direction: TrendDirection }) => {
  if (direction === 'up') return <span aria-hidden>▲</span>;
  if (direction === 'down') return <span aria-hidden>▼</span>;
  return <span aria-hidden>–</span>;
};

const LABEL: Record<TrendDirection, string> = { up: 'up', down: 'down', flat: 'flat' };

export const Trend = React.forwardRef<HTMLSpanElement, TrendProps>(function Trend(
  { direction = 'up', value, className = '', ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none',
        TONE[direction],
        className,
      ].join(' ')}
      {...rest}
    >
      <Glyph direction={direction} />
      <span>{value}</span>
      <span className="sr-only"> {LABEL[direction]}</span>
    </span>
  );
});
