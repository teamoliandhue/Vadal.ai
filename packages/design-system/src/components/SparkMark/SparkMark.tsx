import * as React from 'react';

/** The Vadal AI mark — a four-point spark (the "spark held in reserve" from the
 *  Signal brand), filled with the Aurora gradient. Use it everywhere AI appears:
 *  the dock launcher/avatar, the sidebar briefing, the Intelligence trigger, and
 *  inline ("AI read"). Bound to the ai/* tokens, so it's theme-aware.
 *
 *  - tone:  'gradient' (default) · 'solid' (white, for use inside a gradient chip) · 'mono' (ai-accent)
 *  - state: 'still' (default) · 'idle' (breathe) · 'thinking' (spin) — see the ai-* keyframes. */
export interface SparkMarkProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  tone?: 'gradient' | 'solid' | 'mono';
  state?: 'still' | 'idle' | 'thinking';
}

export const SparkMark = React.forwardRef<SVGSVGElement, SparkMarkProps>(function SparkMark(
  { size = 24, tone = 'gradient', state = 'still', className = '', ...rest },
  ref,
) {
  const id = React.useId();
  const fill = tone === 'solid' ? 'var(--ai-on-grad)' : tone === 'mono' ? 'var(--ai-accent)' : `url(#sm-${id})`;
  const stateClass = state === 'idle' ? 'ai-breathe' : state === 'thinking' ? 'ai-think' : '';
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={[stateClass, className].filter(Boolean).join(' ')}
      style={{ transformOrigin: 'center' }}
      aria-hidden
      {...rest}
    >
      {tone === 'gradient' && (
        <defs>
          <linearGradient id={`sm-${id}`} x1="2.5" y1="3" x2="21.5" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--ai-grad-1)" />
            <stop offset="0.38" stopColor="var(--ai-grad-2)" />
            <stop offset="0.7" stopColor="var(--ai-grad-3)" />
            <stop offset="1" stopColor="var(--ai-grad-4)" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 1.4c.64 5.7 3.06 8.12 8.76 8.76C15.06 10.8 12.64 13.22 12 18.92c-.64-5.7-3.06-8.12-8.76-8.76C8.94 9.52 11.36 7.1 12 1.4Z"
        fill={fill}
      />
    </svg>
  );
});
