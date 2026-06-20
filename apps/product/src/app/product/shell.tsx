import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Gauge,
  HeartHandshake,
  House,
  Megaphone,
  Newspaper,
  Radio,
  Settings,
  Smile,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Sidebar, NavGroup, NavItem, WorkspaceSwitcher, AIBriefing, Health } from "@vadal/design-system";
import { org, health } from "@/lib/data";
import { AiDock } from "./ai-dock";
import { TopBar } from "./header/TopBar";
import { Toaster } from "./Toaster";

/* ════════════════════════ shared product shell ════════════════════════
   The Lumen app chrome — sidebar rail, top bar, AI dock — used by both
   Home (the employee daily workspace) and Pulse (people intelligence).
   `active` highlights the current nav item; `breadcrumb` labels the bar. */

export function Shell({
  active,
  breadcrumb,
  children,
}: {
  active: string;
  breadcrumb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lumen flex min-h-screen bg-canvas text-ink" data-ds>
      <Rail active={active} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="canvas-glow" aria-hidden />
        <TopBar domain={active === "Home" ? "My workspace" : "People intelligence"} breadcrumb={breadcrumb} />
        <main className="relative mx-auto w-full max-w-[1240px] flex-1 px-6 pb-28 pt-8 sm:px-10 sm:pt-10">
          {children}
        </main>
      </div>
      <AiDock />
      <Toaster />
    </div>
  );
}

/* ── identity mark ── */
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="shL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6b26b" />
          <stop offset="0.5" stopColor="#f08fb5" />
          <stop offset="1" stopColor="#8b7cf8" />
        </linearGradient>
        <linearGradient id="shR" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#8b7cf8" />
          <stop offset="1" stopColor="#f08fb5" />
        </linearGradient>
      </defs>
      <g transform="rotate(-24 47 60)">
        <rect x="29" y="20" width="36" height="80" rx="17" fill="url(#shL)" />
      </g>
      <g transform="rotate(24 73 60)">
        <rect x="55" y="20" width="36" height="80" rx="17" fill="url(#shR)" fillOpacity="0.92" />
      </g>
    </svg>
  );
}

type RailItem = { label: string; icon: LucideIcon; href?: string; count?: string };

const RAIL: RailItem[][] = [
  [
    { label: "Home", icon: House, href: "/product/home" },
    { label: "Pulse", icon: Gauge, href: "/product" },
    { label: "Analytics", icon: BarChart3 },
  ],
  [
    { label: "Surveys", icon: ClipboardList, count: "3" },
    { label: "Sentiment", icon: Smile },
    { label: "Always-on listening", icon: Radio },
  ],
  [
    { label: "Recognition", icon: HeartHandshake },
    { label: "Campaigns", icon: Megaphone },
    { label: "Feed", icon: Newspaper, href: "/product/feed" },
  ],
  [
    { label: "Manager hub", icon: UsersRound, count: "5" },
    { label: "Cases", icon: FolderKanban },
    { label: "Knowledge", icon: BookOpen },
  ],
];

function Rail({ active }: { active: string }) {
  return (
    <Sidebar
      className="max-lg:hidden"
      logo={
        <Link href="/product" className="flex items-center gap-2.5">
          <Mark className="h-7 w-7" />
          <span className="text-[16px] font-bold tracking-tight text-[var(--ink)]">
            vadal<span className="text-[var(--brand)]">.ai</span>
          </span>
        </Link>
      }
      workspace={
        <WorkspaceSwitcher
          name={org.name}
          meta={`${org.headcount.toLocaleString()} people`}
          logo={<Image src={org.logo} alt={org.name} width={32} height={32} className="h-full w-full object-contain p-[3px]" />}
        />
      }
      briefing={<AIBriefing title="Today's AI briefing" subtitle="3 new insights" />}
      health={<Health value={health.score} label="Health" trend={{ direction: "up", value: String(health.delta) }} />}
      footer={<NavItem icon={<Settings className="size-[18px]" strokeWidth={1.85} />} label="Settings" href="#" />}
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

// TopBar lives in ./header/TopBar (client) — breadcrumb · search (⌘K) · Intelligence · theme · notifications · account.
// AiDock lives in ./ai-dock (client) — a functional chat dock opened from anywhere via the `vadal:ask` event.
