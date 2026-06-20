import * as React from 'react';

/** Mirrors the Figma `Sidebar` organism (264px rail) — composes Logo, WorkspaceSwitcher, AIBriefing,
 *  nav groups (NavItem), Health and a footer, bound to sidebar/* tokens. Pass each region as a slot. */
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand mark / logo lockup, top of the rail. */
  logo?: React.ReactNode;
  /** A <WorkspaceSwitcher />. */
  workspace?: React.ReactNode;
  /** An <AIBriefing />. */
  briefing?: React.ReactNode;
  /** A <Health /> card, pinned above the footer. */
  health?: React.ReactNode;
  /** Footer region (e.g. a Settings NavItem). */
  footer?: React.ReactNode;
  /** The nav body — NavGroup / NavItem children (scrolls). */
  children: React.ReactNode;
}

/** A spaced group of NavItems. Groups after the first get a hairline top divider. */
export function NavGroup({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['flex flex-col gap-0.5 py-2 first:pt-0', className].join(' ')} {...rest}>
      {children}
    </div>
  );
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { logo, workspace, briefing, health, footer, children, className = '', ...rest },
  ref,
) {
  return (
    <aside
      ref={ref}
      className={[
        'sticky top-0 flex h-screen w-[264px] shrink-0 flex-col gap-4 px-3.5 py-5',
        'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]',
        className,
      ].join(' ')}
      {...rest}
    >
      {logo && <div className="px-2">{logo}</div>}
      {workspace}
      {briefing}
      <nav className="-mx-1 flex-1 divide-y divide-[var(--sidebar-border)] overflow-y-auto px-1">{children}</nav>
      {health}
      {footer}
    </aside>
  );
});
