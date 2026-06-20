import * as React from 'react';

/** Mirrors the Figma `AI briefing` set (State Default/Hover/Pressed/Focus + Title/Subtitle/New) — the brand/violet
 *  AI call-to-action in the sidebar, bound to ai-briefing/* tokens. */
export interface AIBriefingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  subtitle?: string;
  /** Shows the unread notification dot on the spark chip. */
  isNew?: boolean;
}

const Spark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.3c.5 4.8 2.4 6.7 7.2 7.2-4.8.5-6.7 2.4-7.2 7.2-.5-4.8-2.4-6.7-7.2-7.2C9.6 9 11.5 7.1 12 2.3Z" />
  </svg>
);

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3.5 12h15.5" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const AIBriefing = React.forwardRef<HTMLButtonElement, AIBriefingProps>(function AIBriefing(
  { title = "Today's AI briefing", subtitle = '3 new insights', isNew = true, className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={[
        'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left outline-none',
        'bg-[var(--ai-briefing-bg)] ring-1 ring-[var(--ai-briefing-border)]',
        'transition-[box-shadow,transform] duration-[var(--duration-base)]',
        'hover:shadow-[0_8px_22px_-8px_rgba(124,92,248,0.45)]',
        'active:translate-y-px',
        'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        className,
      ].join(' ')}
      {...rest}
    >
      <span className="relative grid size-7 shrink-0 place-items-center rounded-lg text-[var(--ai-briefing-spark)] [background-image:linear-gradient(135deg,var(--grad-from),var(--grad-via),var(--grad-to))]">
        <Spark />
        {isNew && (
          <span
            className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--ai-briefing-dot)] ring-2 ring-[var(--ai-briefing-bg)]"
            aria-label="unread"
            role="img"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--ai-briefing-title)]">{title}</span>
        {subtitle && <span className="block truncate text-[12px] text-[var(--ai-briefing-subtitle)]">{subtitle}</span>}
      </span>
      <span className="text-[var(--ai-briefing-arrow)] transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5">
        <Arrow />
      </span>
    </button>
  );
});
