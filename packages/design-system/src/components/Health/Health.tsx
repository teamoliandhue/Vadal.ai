import * as React from 'react';
import { Trend, type TrendDirection } from '../Trend/Trend';

/** Mirrors the Figma `Health` set (State Default/Hover/Pressed/Focus + Value/Label + nested Trend) —
 *  the engagement-health stat card in the sidebar, bound to health/* tokens. */
export interface HealthProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string | number;
  label?: string;
  trend?: { direction?: TrendDirection; value: string };
}

const Pulse = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />
  </svg>
);

export const Health = React.forwardRef<HTMLButtonElement, HealthProps>(function Health(
  { value, label = 'Health', trend, className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={[
        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left outline-none',
        'bg-[var(--health-bg)] ring-1 ring-[var(--health-border)]',
        'transition-colors duration-[var(--duration-fast)]',
        'hover:bg-[var(--card-hover)] active:bg-[var(--soft)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        className,
      ].join(' ')}
      {...rest}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--health-chip-bg)] text-[var(--health-chip-icon)]" aria-hidden>
        <Pulse />
      </span>
      <span className="flex-1 text-[12.5px] font-medium text-[var(--health-label)]">{label}</span>
      <span className="text-[15px] font-bold text-[var(--health-value)]">{value}</span>
      {trend && <Trend direction={trend.direction} value={trend.value} />}
    </button>
  );
});
