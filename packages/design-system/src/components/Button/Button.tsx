import * as React from 'react';

/** Mirrors the Figma `Button` component set (Type × State) — bound to the same button/* tokens. */
export type ButtonVariant = 'primary' | 'brand' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

// variant → token-driven classes (Tailwind arbitrary values reference the CSS vars from tokens.css)
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--button-primary-bg)] text-[var(--button-primary-label)] hover:bg-[var(--button-primary-bg-hover)] active:bg-[var(--button-primary-bg-active)]',
  brand: 'bg-[var(--button-brand-bg)] text-[var(--button-brand-label)] hover:bg-[var(--button-brand-bg-hover)] active:bg-[var(--button-brand-bg-active)]',
  secondary: 'bg-[var(--button-secondary-bg)] text-[var(--button-secondary-label)] hover:bg-[var(--button-secondary-bg-hover)]',
  tertiary: 'bg-[var(--button-tertiary-bg)] text-[var(--button-tertiary-label)] border border-[var(--button-tertiary-border)] hover:bg-[var(--button-tertiary-bg-hover)]',
  ghost: 'bg-transparent text-[var(--button-ghost-label)] hover:bg-[var(--button-ghost-bg-hover)]',
  destructive: 'bg-[var(--button-danger-bg)] text-[var(--button-danger-label)]',
  ai: 'text-white [background-image:linear-gradient(105deg,var(--grad-from),var(--grad-via),var(--grad-to))]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', leadingIcon, trailingIcon, loading, disabled, className = '', children, ...rest },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-full font-medium select-none',
        'transition-[background-color,box-shadow,transform] duration-[var(--duration-base)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus-ring)] focus-visible:ring-offset-0',
        'disabled:bg-[var(--button-disabled-bg)] disabled:text-[var(--button-disabled-content,var(--button-disabled-label))] disabled:cursor-not-allowed disabled:border-transparent',
        SIZE[size],
        VARIANT[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? <Spinner /> : leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
});

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
