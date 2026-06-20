import * as React from 'react';

/** Mirrors the Figma `Radio` component set (State × Size) — bound to the same radio/* tokens. */
export type RadioSize = 'sm' | 'md';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: RadioSize;
  error?: boolean;
}

const BOX: Record<RadioSize, string> = { sm: 'h-4 w-4', md: 'h-[18px] w-[18px]' };
const DOT: Record<RadioSize, string> = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2' };
const LABEL: Record<RadioSize, string> = { sm: 'text-sm', md: 'text-sm' };

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, size = 'md', error, disabled, className = '', id, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      // state is driven by `group-has-[…]` so it reaches the nested ring + dot (peer-* would only reach siblings)
      className={[
        'group inline-flex items-start gap-2.5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <span className="relative inline-flex shrink-0 items-center justify-center" style={{ marginTop: '1px' }}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          disabled={disabled}
          aria-invalid={error || undefined}
          className="absolute inset-0 h-full w-full cursor-[inherit] opacity-0"
          {...rest}
        />
        <span
          className={[
            'flex items-center justify-center rounded-full border bg-[var(--radio-bg)] transition-colors',
            'duration-[var(--duration-fast)]',
            error ? 'border-[var(--radio-border-error)]' : 'border-[var(--radio-border)]',
            'group-has-[:checked]:border-[var(--radio-border-checked)]',
            'group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-[var(--radio-focus-ring)] group-has-[:focus-visible]:ring-offset-1 group-has-[:focus-visible]:ring-offset-[var(--card)]',
            'group-has-[:disabled]:border-[var(--radio-border)] group-has-[:disabled]:bg-[var(--radio-bg-disabled)]',
            BOX[size],
          ].join(' ')}
          aria-hidden
        >
          <span
            className={[
              'rounded-full bg-[var(--radio-dot)] opacity-0 transition-opacity duration-[var(--duration-fast)]',
              'group-has-[:checked]:opacity-100',
              DOT[size],
            ].join(' ')}
          />
        </span>
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5 leading-tight">
          {label && (
            <span className={['font-medium text-[var(--radio-label)] group-has-[:disabled]:text-[var(--radio-label-disabled)]', LABEL[size]].join(' ')}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-[var(--radio-description)] group-has-[:disabled]:text-[var(--radio-label-disabled)]">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
