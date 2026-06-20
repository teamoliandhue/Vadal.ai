import * as React from 'react';

/** Mirrors the Figma `Workspace menu` component — the popover opened by the WorkspaceSwitcher.
 *  Single-workspace model: identity header + grouped MenuItem rows (passed as children), bound to workspace/* tokens.
 *  Omit `name` to drop the identity header — useful when the menu is anchored directly under a
 *  WorkspaceSwitcher that already shows the workspace (avoids repeating it). */
export interface WorkspaceMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  name?: string;
  meta?: string;
  /** MenuItem rows + dividers. */
  children: React.ReactNode;
}

/** A hairline divider for separating menu groups. */
export function WorkspaceMenuDivider() {
  return <div role="separator" className="my-1 h-px bg-[var(--workspace-menu-border)]" />;
}

export const WorkspaceMenu = React.forwardRef<HTMLDivElement, WorkspaceMenuProps>(function WorkspaceMenu(
  { logo, name, meta, children, className = '', ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="menu"
      className={[
        'w-[268px] rounded-2xl p-2',
        'bg-[var(--workspace-menu-bg)] ring-1 ring-[var(--workspace-menu-border)]',
        'shadow-[0_4px_12px_-2px_rgba(10,10,12,0.12),0_12px_32px_-8px_rgba(10,10,12,0.16)]',
        className,
      ].join(' ')}
      {...rest}
    >
      {name && (
        <>
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--card)] ring-1 ring-[var(--workspace-menu-border)]">
              {logo}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold lowercase text-[var(--workspace-menu-header-label)]">{name}</span>
              <span className="block truncate text-[12px] text-[var(--workspace-menu-header-meta)]">{meta}</span>
            </span>
          </div>
          <WorkspaceMenuDivider />
        </>
      )}
      {children}
    </div>
  );
});
