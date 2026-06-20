"use client";
/* The product sidebar rail (client) — composes the DS Sidebar from real,
   interactive parts: the Signal brand mark, a working WorkspaceSwitcher +
   WorkspaceMenu dropdown, an AI-briefing that opens the AI dock, a Health card
   that routes to Pulse, and the nav groups. `active` highlights the current item. */
import Link from "next/link";
import * as React from "react";
import {
  BarChart3, BookOpen, ClipboardList, FolderKanban, Gauge, HeartHandshake,
  House, LogOut, Megaphone, Newspaper, Radio, Repeat, Settings, Smile,
  UserPlus, UsersRound, type LucideIcon,
} from "lucide-react";
import {
  Sidebar, NavGroup, NavItem, WorkspaceSwitcher, WorkspaceMenu, WorkspaceMenuDivider,
  MenuItem, AIBriefing, Health,
} from "@vadal/design-system";
import { org, health } from "@/lib/data";
import { toast } from "./Toaster";

const ask = (q: string) => window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q } }));

type RailItem = { label: string; icon: LucideIcon; href?: string; count?: string };

const RAIL: RailItem[][] = [
  [
    { label: "Home", icon: House, href: "/product/home" },
    { label: "Pulse", icon: Gauge, href: "/product" },
    { label: "Analytics", icon: BarChart3, href: "/product/analytics" },
  ],
  [
    { label: "Surveys", icon: ClipboardList, count: "3", href: "/product/surveys" },
    { label: "Sentiment", icon: Smile, href: "/product/sentiment" },
    { label: "Always-on listening", icon: Radio, href: "/product/listening" },
  ],
  [
    { label: "Recognition", icon: HeartHandshake, href: "/product/recognition" },
    { label: "Campaigns", icon: Megaphone, href: "/product/campaigns" },
    { label: "Feed", icon: Newspaper, href: "/product/feed" },
  ],
  [
    { label: "Manager hub", icon: UsersRound, count: "5", href: "/product/managers" },
    { label: "Cases", icon: FolderKanban, href: "/product/cases" },
    { label: "Knowledge", icon: BookOpen, href: "/product/knowledge" },
  ],
];

export function Rail({ active }: { active: string }) {
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

  const meta = `${org.headcount.toLocaleString()} people`;
  // eslint-disable-next-line @next/next/no-img-element
  const wsLogo = <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />;

  return (
    <Sidebar
      className="max-lg:hidden"
      logo={
        <Link href="/product" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/signal-mark.svg" alt="Vadal" className="h-7 w-auto" />
          <span className="text-[16px] font-bold tracking-tight text-[var(--ink)]">
            vadal<span className="text-[var(--brand)]">.ai</span>
          </span>
        </Link>
      }
      workspace={
        <div ref={wsRef} className="relative">
          <WorkspaceSwitcher name={org.name} meta={meta} logo={wsLogo} open={wsOpen} onClick={() => setWsOpen((o) => !o)} />
          {wsOpen && (
            <div className="absolute inset-x-0 top-full z-50 mt-1.5">
              <WorkspaceMenu name={org.name} meta={meta} logo={wsLogo} className="w-full">
                <MenuItem icon={<Settings className="h-4 w-4" />} label="Workspace settings" href="/product/settings" />
                <MenuItem icon={<UserPlus className="h-4 w-4" />} label="Invite people" onClick={() => { setWsOpen(false); toast("Invite link copied ✓"); }} />
                <WorkspaceMenuDivider />
                <MenuItem icon={<Repeat className="h-4 w-4" />} label="Switch workspace" onClick={() => { setWsOpen(false); toast("Only oliandhue is connected in this demo"); }} />
                <MenuItem icon={<LogOut className="h-4 w-4" />} label="Sign out" onClick={() => { setWsOpen(false); toast("Signed out (demo)"); }} />
              </WorkspaceMenu>
            </div>
          )}
        </div>
      }
      briefing={<AIBriefing title="Today's AI briefing" subtitle="3 new insights" onClick={() => ask("Walk me through today's AI briefing.")} />}
      health={<Health value={health.score} label="Health" trend={{ direction: "up", value: String(health.delta) }} href="/product" />}
      footer={<NavItem icon={<Settings className="size-[18px]" strokeWidth={1.85} />} label="Settings" active={active === "Settings"} href="/product/settings" />}
    >
      {RAIL.map((group, gi) => (
        <NavGroup key={gi}>
          {group.map((it) => (
            <NavItem
              key={it.label}
              href={it.href ?? "#"}
              active={it.label === active}
              label={it.label}
              count={it.count}
              icon={<it.icon className="size-[18px]" strokeWidth={it.label === active ? 2.1 : 1.85} />}
            />
          ))}
        </NavGroup>
      ))}
    </Sidebar>
  );
}
