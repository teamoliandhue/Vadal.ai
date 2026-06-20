import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Gauge,
  HeartHandshake,
  House,
  Megaphone,
  Newspaper,
  Radio,
  Search,
  Settings,
  Smile,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Sidebar, NavGroup, NavItem, WorkspaceSwitcher, AIBriefing, Health } from "@vadal/design-system";
import { org, health } from "@/lib/data";
import { ThemeToggle } from "./theme-toggle";
import { AiDock } from "./ai-dock";

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

function TopBar({ domain, breadcrumb }: { domain: string; breadcrumb: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-card/85 px-6 py-3 backdrop-blur-md transition-colors sm:px-10">
      <span className="text-[14px] font-medium text-faint">
        {domain} <span className="mx-1.5 text-line">/</span>
        <span className="font-semibold text-ink">{breadcrumb}</span>
      </span>
      <div className="flex-1" />
      <button className="hidden w-72 items-center gap-2 rounded-full border border-line bg-soft px-3.5 py-2 text-left text-[14px] text-faint transition hover:border-faint/40 md:flex">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1">Search people, teams, insights</span>
        <kbd className="text-[12px] font-semibold text-faint">⌘K</kbd>
      </button>
      <button className="flex items-center gap-1.5 rounded-full border border-[#f3d9a8] bg-card px-3.5 py-2 text-[14px] font-semibold transition hover:shadow-[0_4px_16px_rgba(245,184,107,0.3)] dark:border-[#5a4a26]">
        <Sparkles className="h-3.5 w-3.5 text-[#e89b3c]" />
        Intelligence
      </button>
      <ThemeToggle />
      <button className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-soft">
        <Bell className="h-[16px] w-[16px]" strokeWidth={1.9} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ef7faf]" />
      </button>
      <Image src={org.userImg} alt={org.user} width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-card" />
    </header>
  );
}

// AiDock lives in ./ai-dock (client) — a functional chat dock opened from anywhere via the `vadal:ask` event.
