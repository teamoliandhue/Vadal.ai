import * as React from 'react';

/** Mirrors the Figma `Badge` component set (Tone × Variant × Size) — bound to the same badge/* tokens. */
export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeVariant = 'soft' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Leading status dot (inherits the label colour). Ignored when `icon` is set. */
  dot?: boolean;
  /** Leading icon, e.g. a 14px line glyph. */
  icon?: React.ReactNode;
}

// tone → label colour (shared by soft + outline) and the soft background
const LABEL: Record<BadgeTone, string> = {
  neutral: 'text-[var(--badge-neutral-label)]',
  brand: 'text-[var(--badge-brand-label)]',
  success: 'text-[var(--badge-success-label)]',
  warning: 'text-[var(--badge-warning-label)]',
  danger: 'text-[var(--badge-danger-label)]',
  info: 'text-[var(--badge-info-label)]',
};
const SOFT_BG: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--badge-neutral-bg)]',
  brand: 'bg-[var(--badge-brand-bg)]',
  success: 'bg-[var(--badge-success-bg)]',
  warning: 'bg-[var(--badge-warning-bg)]',
  danger: 'bg-[var(--badge-danger-bg)]',
  info: 'bg-[var(--badge-info-bg)]',
};

const SIZE: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[12px] gap-1',
  md: 'h-6 px-2.5 text-xs gap-1.5',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', variant = 'soft', size = 'md', dot, icon, className = '', children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center whitespace-nowrap rounded-full font-medium select-none',
        LABEL[tone],
        variant === 'soft'
          ? SOFT_BG[tone]
          : 'bg-transparent border border-[var(--badge-outline-border)]',
        SIZE[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {icon ? (
        <span className="inline-flex shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5" aria-hidden>
          {icon}
        </span>
      ) : dot ? (
        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      ) : null}
      {children}
    </span>
  );
});
