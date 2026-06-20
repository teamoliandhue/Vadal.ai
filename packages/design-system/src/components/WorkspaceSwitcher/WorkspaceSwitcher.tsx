import * as React from 'react';

/** Mirrors the Figma `Workspace switcher` set (State Default/Hover/Pressed/Focus/Open), bound to workspace/* tokens.
 *  Tapping opens the WorkspaceMenu — drive the `open` state to flip the caret. */
export interface WorkspaceSwitcherProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Workspace logo/mark (image or node). */
  logo?: React.ReactNode;
  name: string;
  /** Secondary line, e.g. "12,480 people". */
  meta: string;
  /** Menu-open state — flips the caret. */
  open?: boolean;
}

const Caret = ({ open }: { open?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={['shrink-0 transition-transform duration-[var(--duration-base)]', open ? 'rotate-180' : ''].join(' ')}
    aria-hidden
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const WorkspaceSwitcher = React.forwardRef<HTMLButtonElement, WorkspaceSwitcherProps>(function WorkspaceSwitcher(
  { logo, name, meta, open, className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open || undefined}
      className={[
        'flex w-full items-center gap-3 rounded-xl p-3 text-left outline-none',
        'bg-[var(--workspace-bg)] ring-1 ring-[var(--workspace-border)]',
        'transition-colors duration-[var(--duration-fast)]',
        'hover:bg-[var(--workspace-bg-hover)] hover:ring-[var(--workspace-border-hover)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        className,
      ].join(' ')}
      {...rest}
    >
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--card)] ring-1 ring-[var(--workspace-border)]">
        {logo}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold lowercase text-[var(--workspace-name)]">{name}</span>
        <span className="block truncate text-[10.5px] text-[var(--workspace-meta)]">{meta}</span>
      </span>
      <span className="text-[var(--workspace-caret)]">
        <Caret open={open} />
      </span>
    </button>
  );
});
