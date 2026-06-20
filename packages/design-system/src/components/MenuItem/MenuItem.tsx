import * as React from 'react';

/** Mirrors the Figma `Menu item` set (State Default/Hover, swappable icon + Label), bound to menu/* tokens.
 *  Renders a <button> by default; pass `href` to render an <a>. */
export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  /** Render as a link instead of a button. */
  href?: string;
}

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { icon, label, href, className = '', ...rest },
  ref,
) {
  const cls = [
    'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium outline-none',
    'text-[var(--menu-item-label)] transition-colors duration-[var(--duration-fast)]',
    'hover:bg-[var(--menu-item-bg-hover)] focus-visible:bg-[var(--menu-item-bg-hover)]',
    className,
  ].join(' ');
  const inner = (
    <>
      {icon && (
        <span className="grid size-5 shrink-0 place-items-center text-[var(--menu-item-icon)]" aria-hidden>
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref} type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
});
