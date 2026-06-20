import * as React from 'react';

/** Mirrors the Figma `Checkbox` component set (State × Size) — bound to the same checkbox/* tokens. */
export type CheckboxSize = 'sm' | 'md';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: CheckboxSize;
  /** Mixed state — visually a dash, sets `input.indeterminate`. */
  indeterminate?: boolean;
  error?: boolean;
}

const BOX: Record<CheckboxSize, string> = { sm: 'h-4 w-4', md: 'h-[18px] w-[18px]' };
const TICK: Record<CheckboxSize, string> = { sm: 'h-2.5 w-2.5', md: 'h-3 w-3' };
const LABEL: Record<CheckboxSize, string> = { sm: 'text-sm', md: 'text-sm' };

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, size = 'md', indeterminate, error, disabled, className = '', id, ...rest },
  ref,
) {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);
  React.useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      // state is driven by `group-has-[…]` so it reaches the nested box + icons (peer-* would only reach siblings)
      className={[
        'group inline-flex items-start gap-2.5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <span className="relative inline-flex shrink-0 items-center justify-center" style={{ marginTop: '1px' }}>
        <input
          ref={innerRef}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error || undefined}
          className="absolute inset-0 h-full w-full cursor-[inherit] opacity-0"
          {...rest}
        />
        <span
          className={[
            'grid place-items-center rounded-[6px] border bg-[var(--checkbox-bg)] transition-colors',
            'duration-[var(--duration-fast)]',
            error ? 'border-[var(--checkbox-border-error)]' : 'border-[var(--checkbox-border)]',
            'group-has-[:checked]:border-[var(--checkbox-border-checked)] group-has-[:checked]:bg-[var(--checkbox-bg-checked)]',
            'group-has-[:indeterminate]:border-[var(--checkbox-border-checked)] group-has-[:indeterminate]:bg-[var(--checkbox-bg-checked)]',
            'group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-[var(--checkbox-focus-ring)] group-has-[:focus-visible]:ring-offset-1 group-has-[:focus-visible]:ring-offset-[var(--card)]',
            'group-has-[:disabled]:border-[var(--checkbox-border)] group-has-[:disabled]:bg-[var(--checkbox-bg-disabled)]',
            BOX[size],
          ].join(' ')}
          aria-hidden
        >
          {/* check — visible only when checked (hidden while indeterminate) */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--checkbox-check)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={['[grid-area:1/1] opacity-0 group-has-[:checked]:opacity-100 group-has-[:indeterminate]:opacity-0', TICK[size]].join(' ')}
          >
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
          {/* dash — visible only when indeterminate */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--checkbox-check)"
            strokeWidth="2.25"
            strokeLinecap="round"
            className={['[grid-area:1/1] opacity-0 group-has-[:indeterminate]:opacity-100', TICK[size]].join(' ')}
          >
            <path d="M4 8h8" />
          </svg>
        </span>
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5 leading-tight">
          {label && (
            <span className={['font-medium text-[var(--checkbox-label)] group-has-[:disabled]:text-[var(--checkbox-label-disabled)]', LABEL[size]].join(' ')}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-[var(--checkbox-description)] group-has-[:disabled]:text-[var(--checkbox-label-disabled)]">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
