import * as React from 'react';

/** Mirrors the Figma `Nav item` set (State Default/Hover/Active + Label/Count + swappable icon),
 *  bound to nav/* tokens. Renders an <a>; wrap with your router's Link (passHref) for client nav. */
export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: React.ReactNode;
  label: string;
  /** Optional count pill (e.g. "3"). */
  count?: string | number;
  active?: boolean;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(function NavItem(
  { icon, label, count, active = false, className = '', ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] outline-none',
        'transition-colors duration-[var(--duration-fast)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        active
          ? 'bg-[var(--nav-item-bg-active)] font-semibold text-[var(--nav-item-label-active)]'
          : 'font-medium text-[var(--nav-item-label)] hover:bg-[var(--nav-item-bg-hover)] hover:text-[var(--nav-item-label-active)]',
        className,
      ].join(' ')}
      {...rest}
    >
      <span
        className={[
          'grid size-[18px] shrink-0 place-items-center',
          active ? 'text-[var(--nav-item-icon-active)]' : 'text-[var(--nav-item-icon)] group-hover:text-[var(--nav-item-icon-active)]',
        ].join(' ')}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count != null && (
        <span className="rounded-full bg-[var(--nav-count-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--nav-count-label)]">
          {count}
        </span>
      )}
    </a>
  );
});
