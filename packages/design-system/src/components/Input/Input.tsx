import * as React from 'react';

/** Mirrors the Figma `Input` component set (State) — label · field box · helper, bound to input/* tokens. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  helper?: React.ReactNode;
  required?: boolean;
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, required, error, leadingIcon, trailingIcon, disabled, id, className = '', ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const helperId = helper ? `${inputId}-helper` : undefined;

  return (
    <div className={['flex w-full flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--input-label)] data-[disabled]:text-[var(--input-label-disabled)]" data-disabled={disabled || undefined}>
          {label}
          {required && <span className="ml-0.5 text-[var(--input-required)]">*</span>}
        </label>
      )}
      <div
        className={[
          'group flex h-11 items-center gap-2 rounded-[10px] px-3.5',
          'bg-[var(--input-bg)] transition-[box-shadow,background-color] duration-[var(--duration-fast)]',
          // border via inset ring so it doesn't shift layout
          error
            ? 'shadow-[inset_0_0_0_1px_var(--input-border-error)]'
            : 'shadow-[inset_0_0_0_1px_var(--input-border)] hover:shadow-[inset_0_0_0_1px_var(--input-border-hover)]',
          'focus-within:shadow-[inset_0_0_0_1.5px_var(--input-border-focus)] focus-within:outline focus-within:outline-[3px] focus-within:outline-[var(--input-focus-ring)]',
          disabled ? 'bg-[var(--input-bg-disabled)] cursor-not-allowed' : '',
        ].join(' ')}
      >
        {leadingIcon && <span className="shrink-0 text-[var(--input-icon)] [&_svg]:h-[18px] [&_svg]:w-[18px]" aria-hidden>{leadingIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={helperId}
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--input-value)] placeholder:text-[var(--input-placeholder)] outline-none disabled:cursor-not-allowed"
          {...rest}
        />
        {trailingIcon && <span className="shrink-0 text-[var(--input-icon)] [&_svg]:h-[18px] [&_svg]:w-[18px]" aria-hidden>{trailingIcon}</span>}
      </div>
      {helper && (
        <span id={helperId} className={['text-xs', error ? 'text-[var(--input-helper-error)]' : 'text-[var(--input-helper)]'].join(' ')}>
          {helper}
        </span>
      )}
    </div>
  );
});
