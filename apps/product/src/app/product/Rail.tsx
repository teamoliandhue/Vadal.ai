"use client";
/* The product sidebar rail (client) — composes the DS Sidebar from real,
   interactive parts: a working WorkspaceSwitcher + WorkspaceMenu dropdown (the
   top-of-sidebar identity), an AI-briefing that opens the AI dock, a Health card
   that routes to Pulse, and the nav groups. `active` highlights the current item.
   The Vadal wordmark is intentionally not shown here (client decision).

   Nav comes from ./nav-model filtered by the effective role, so people are never
   shown a destination they cannot open. Desktop only — MobileNav takes over
   below lg. */
import * as React from "react";
import { LogOut, Repeat, Settings, UserPlus } from "lucide-react";
import {
  Sidebar, NavGroup, NavItem, WorkspaceSwitcher, WorkspaceMenu, WorkspaceMenuDivider,
  MenuItem, AIBriefing, Health,
} from "@vadal/design-system";
import { org, health } from "@/lib/data";
import { canAccess } from "@/lib/access";
import { navFor } from "./nav-model";
import { useViewAs } from "./useViewAs";
import { toast } from "./Toaster";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

export function Rail({ active }: { active: string }) {
  const [role, , meta] = useViewAs();
  const [wsOpen, setWsOpen] = React.useState(false);
  const wsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!wsOpen) return;
    const onDown = (e: MouseEvent) => { if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setWsOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [wsOpen]);

  const wsMeta = `${org.headcount.toLocaleString()} people`;
  const groups = navFor(role);
  const canSettings = canAccess(role, "Settings");
  // eslint-disable-next-line @next/next/no-img-element
  const wsLogo = <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />;

  // Render nothing until the session resolves — a flash of the full admin nav
  // followed by it collapsing is worse than a beat of empty rail.
  if (!meta.ready) return <div className="w-[264px] shrink-0 border-r border-line max-lg:hidden" aria-hidden />;

  return (
    <Sidebar
      className="max-lg:hidden"
      /* Vadal wordmark intentionally omitted (client decision) — the workspace
         switcher below is the top-of-sidebar identity. */
      workspace={
        <div ref={wsRef} className="relative">
          <WorkspaceSwitcher name={org.name} meta={wsMeta} logo={wsLogo} open={wsOpen} onClick={() => setWsOpen((o) => !o)} />
          {wsOpen && (
            <div className="absolute inset-x-0 top-full z-50 mt-1.5">
              {/* No identity header here — the switcher above already shows it (avoids the repeat). */}
              <WorkspaceMenu className="w-full">
                {canSettings && (
                  <>
                    <MenuItem icon={<Settings className="h-4 w-4" />} label="Workspace settings" href="/product/settings" />
                    <MenuItem icon={<UserPlus className="h-4 w-4" />} label="Invite people" onClick={() => { setWsOpen(false); toast("Invite link copied ✓"); }} />
                    <WorkspaceMenuDivider />
                  </>
                )}
                <MenuItem icon={<Repeat className="h-4 w-4" />} label="Switch workspace" onClick={() => { setWsOpen(false); toast("Only oliandhue is connected in this demo"); }} />
                <MenuItem icon={<LogOut className="h-4 w-4" />} label="Sign out" onClick={() => { setWsOpen(false); toast("Signed out (demo)"); }} />
              </WorkspaceMenu>
            </div>
          )}
        </div>
      }
      briefing={<AIBriefing title="Today's AI briefing" subtitle="3 new insights" onClick={() => ask("Walk me through today's AI briefing.")} />}
      health={canAccess(role, "Pulse") ? <Health value={health.score} label="Health" trend={{ direction: "up", value: String(health.delta) }} href="/product" /> : undefined}
      footer={canSettings ? <NavItem icon={<Settings className="size-[18px]" strokeWidth={1.85} />} label="Settings" active={active === "Settings"} href="/product/settings" /> : undefined}
    >
      {groups.map((group) => (
        <NavGroup key={group.label} label={group.label}>
          {group.items.map((it) => (
            <NavItem
              key={it.label}
              href={it.href}
              active={it.label === active}
              label={it.label}
              tag={it.soon ? "Soon" : undefined}
              icon={<it.icon className="size-[18px]" strokeWidth={it.label === active ? 2.1 : 1.85} />}
            />
          ))}
        </NavGroup>
      ))}
    </Sidebar>
  );
}
