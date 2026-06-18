import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
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
import { org, health } from "@/lib/data";
import { ThemeToggle } from "./theme-toggle";

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
    <div className="lumen flex min-h-screen bg-canvas text-ink">
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
    { label: "Feed", icon: Newspaper },
  ],
  [
    { label: "Manager hub", icon: UsersRound, count: "5" },
    { label: "Cases", icon: FolderKanban },
    { label: "Knowledge", icon: BookOpen },
  ],
];

function Rail({ active }: { active: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-line bg-card px-3.5 py-5 text-ink transition-colors lg:flex dark:border-transparent dark:bg-[#101015] dark:text-[#d6d6de] dark:shadow-[1px_0_0_rgba(255,255,255,0.05)]">
      <Link href="/product" className="flex items-center gap-2.5 px-2">
        <Mark className="h-7 w-7" />
        <span className="text-[16px] font-bold tracking-tight text-ink dark:text-white">
          vadal<span className="text-[#7c6cf0] dark:text-[#a99df9]">.ai</span>
        </span>
      </Link>

      <button className="mt-5 flex w-full items-center gap-2.5 rounded-xl bg-card p-2.5 text-left ring-1 ring-line shadow-[0_2px_6px_rgba(26,27,31,0.05)] transition hover:bg-soft dark:bg-white/[0.04] dark:shadow-none dark:ring-white/[0.07] dark:hover:bg-white/[0.08]">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-line dark:ring-white/10">
          <Image src={org.logo} alt={org.name} width={32} height={32} className="h-full w-full object-contain p-[3px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold lowercase text-ink dark:text-white">{org.name}</span>
          <span className="block truncate text-[10.5px] text-faint dark:text-[#85858f]">{org.headcount.toLocaleString()} people</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-faint dark:text-[#85858f]" />
      </button>

      <button className="mt-4 flex w-full items-center gap-2.5 rounded-xl bg-[#fdf6e9] px-2.5 py-2.5 text-left ring-1 ring-[#f5e5c2] transition hover:bg-[#fbefd9] dark:bg-transparent dark:ring-0 dark:hover:bg-white/[0.06]">
        <Sparkles className="h-[17px] w-[17px] text-[#dd9026] dark:text-[#f5b86b]" strokeWidth={2} />
        <span className="flex-1 text-[13px] font-semibold text-[#a06a14] dark:text-[#f5cb9b]">Today&apos;s AI briefing</span>
        <ArrowRight className="h-3.5 w-3.5 text-[#dd9026] dark:text-[#f5b86b]" />
      </button>

      <nav className="mt-1 flex-1 overflow-y-auto">
        {RAIL.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-2 border-t border-line pt-2 dark:border-white/[0.06]" : ""}>
            {group.map((it) => {
              const isActive = it.label === active;
              const cls = `group mb-0.5 flex items-center gap-2.5 rounded-[10px] px-2.5 py-[8.5px] text-[13px] transition ${
                isActive
                  ? "bg-soft font-semibold text-ink dark:bg-white/[0.09] dark:text-white"
                  : "text-muted hover:bg-soft hover:text-ink dark:text-[#aaaab4] dark:hover:bg-white/[0.05] dark:hover:text-white"
              }`;
              const inner = (
                <>
                  <it.icon className={`h-[17px] w-[17px] ${isActive ? "text-ink dark:text-white" : "text-faint dark:text-[#6e6e7a]"}`} strokeWidth={isActive ? 2.1 : 1.8} />
                  <span className="flex-1">{it.label}</span>
                  {it.count && <span className="rounded-full bg-line px-1.5 py-0.5 text-[10px] font-semibold text-muted dark:bg-white/10 dark:text-[#aaaab4]">{it.count}</span>}
                </>
              );
              return it.href ? (
                <Link key={it.label} href={it.href} className={cls}>{inner}</Link>
              ) : (
                <a key={it.label} href="#" className={cls}>{inner}</a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-soft px-2.5 py-2.5 ring-1 ring-line dark:bg-white/[0.04] dark:ring-white/[0.07]">
        <Gauge className="h-[16px] w-[16px] text-vgreen dark:text-[#9be3b8]" strokeWidth={2} />
        <span className="flex-1 text-[12.5px] font-medium text-muted dark:text-[#aaaab4]">Health</span>
        <span className="text-[13px] font-bold text-ink dark:text-white">{health.score}</span>
        <span className="text-[10.5px] font-semibold text-vgreen dark:text-[#9be3b8]">▲{health.delta}</span>
      </div>
      <a href="#" className="mt-1.5 flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-muted transition hover:bg-soft hover:text-ink dark:text-[#aaaab4] dark:hover:bg-white/[0.05] dark:hover:text-white">
        <Settings className="h-[16px] w-[16px] text-faint dark:text-[#6e6e7a]" strokeWidth={1.8} />
        Settings
      </a>
    </aside>
  );
}

function TopBar({ domain, breadcrumb }: { domain: string; breadcrumb: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-card/85 px-6 py-3 backdrop-blur-md transition-colors sm:px-10">
      <span className="text-[12px] font-medium text-faint">
        {domain} <span className="mx-1.5 text-line">/</span>
        <span className="font-semibold text-ink">{breadcrumb}</span>
      </span>
      <div className="flex-1" />
      <button className="hidden w-72 items-center gap-2 rounded-full border border-line bg-soft px-3.5 py-2 text-left text-[12.5px] text-faint transition hover:border-faint/40 md:flex">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1">Search people, teams, insights</span>
        <kbd className="text-[10px] font-semibold text-faint">⌘K</kbd>
      </button>
      <button className="flex items-center gap-1.5 rounded-full border border-[#f3d9a8] bg-card px-3.5 py-2 text-[12px] font-semibold transition hover:shadow-[0_4px_16px_rgba(245,184,107,0.3)] dark:border-[#5a4a26]">
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

function AiDock() {
  return (
    <button className="fixed bottom-5 right-6 z-30 flex items-center gap-2.5 rounded-full border border-line bg-card py-2.5 pl-3 pr-4 shadow-[0_10px_34px_rgba(20,20,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(139,124,248,0.32)] dark:shadow-[0_10px_34px_rgba(0,0,0,0.5)]">
      <span className="ai-aura grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2dd4bf] via-[#818cf8] to-[#f472b6]">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-left">
        <span className="flex items-center gap-1 text-[12.5px] font-semibold">
          Vadal
          <span className="rounded-[4px] border border-line px-1 text-[8.5px] font-bold text-muted">AI</span>
        </span>
        <span className="block text-[10.5px] text-faint">What are you looking for today?</span>
      </span>
    </button>
  );
}
