import * as React from 'react';

/** Mirrors the Figma `Switch` component set (State × Size) — bound to the same switch/* tokens. */
export type SwitchSize = 'sm' | 'md';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: SwitchSize;
}

// track / thumb / thumb-travel per size (travel = track − thumb − 2·padding)
const TRACK: Record<SwitchSize, string> = { sm: 'h-5 w-9', md: 'h-6 w-11' };
const THUMB: Record<SwitchSize, string> = { sm: 'h-4 w-4', md: 'h-5 w-5' };
const TRAVEL: Record<SwitchSize, string> = { sm: 'group-has-[:checked]:translate-x-4', md: 'group-has-[:checked]:translate-x-5' };
const LABEL: Record<SwitchSize, string> = { sm: 'text-sm', md: 'text-sm' };

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, size = 'md', disabled, className = '', id, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={[
        'group inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <span className="relative inline-flex shrink-0 items-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-[inherit] opacity-0"
          {...rest}
        />
        <span
          className={[
            'flex items-center rounded-full p-0.5 transition-colors duration-[var(--duration-base)]',
            'bg-[var(--switch-track-off)] group-has-[:checked]:bg-[var(--switch-track-on)]',
            'group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-[var(--switch-focus-ring)] group-has-[:focus-visible]:ring-offset-2 group-has-[:focus-visible]:ring-offset-[var(--card)]',
            'group-has-[:disabled]:bg-[var(--switch-track-disabled)]',
            TRACK[size],
          ].join(' ')}
          aria-hidden
        >
          <span
            className={[
              'rounded-full bg-[var(--switch-thumb)] shadow-sm transition-transform duration-[var(--duration-base)] ease-[var(--easing-spring)]',
              'group-has-[:disabled]:bg-[var(--switch-thumb-disabled)]',
              THUMB[size],
              TRAVEL[size],
            ].join(' ')}
          />
        </span>
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5 leading-tight">
          {label && (
            <span className={['font-medium text-[var(--switch-label)] group-has-[:disabled]:opacity-60', LABEL[size]].join(' ')}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-[var(--switch-description)] group-has-[:disabled]:opacity-60">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});
