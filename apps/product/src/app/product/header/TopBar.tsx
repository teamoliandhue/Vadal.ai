"use client";
/* The product top bar — breadcrumb · search (⌘K) · Intelligence · theme · notifications · account.
   Each interactive cluster is its own client component; the command palette is mounted once here. */
import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { CommandPalette } from "./CommandPalette";
import { IntelligenceMenu } from "./IntelligenceMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu } from "./ProfileMenu";

function openSearch() {
  window.dispatchEvent(new CustomEvent("vadal:search-open"));
}

export function TopBar({ domain, breadcrumb }: { domain: string; breadcrumb: string }) {
  return (
    /* Tighter gutters and gaps below sm rather than dropping a control. The
       theme toggle is the only theme control in the app, so hiding it on a
       phone would strand the setting entirely — 46px of spacing is the cheaper
       thing to give up, and it is enough for the breadcrumb to read. */
    <header className="sticky top-0 z-30 flex items-center gap-1.5 border-b border-line bg-card/85 px-4 py-3 backdrop-blur-md transition-colors sm:gap-3 sm:px-10">
      {/* min-w-0 + truncate so the breadcrumb is what gives way when the bar is
          tight. Without it the controls were crushed instead — the theme toggle
          rendered 0px wide on a 375px screen, and the bar still overflowed. */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-baseline text-[14px] font-medium text-faint">
        <Link href="/product" className="truncate transition-colors hover:text-ink max-sm:hidden">{domain}</Link>
        <span className="mx-1.5 text-line max-sm:hidden">/</span>
        <span className="truncate font-semibold text-ink">{breadcrumb}</span>
      </nav>

      <div className="min-w-0 flex-1" />

      {/* search */}
      <button
        onClick={openSearch}
        className="hidden w-72 items-center gap-2 rounded-full border border-line bg-soft px-3.5 py-2 text-left text-[14px] text-faint transition hover:border-faint/40 md:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1">Search people, teams, insights</span>
        <kbd className="text-[12px] font-semibold text-faint">⌘K</kbd>
      </button>
      {/* compact search on small screens */}
      <button
        onClick={openSearch}
        aria-label="Search"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-soft md:hidden"
      >
        <Search className="h-[16px] w-[16px]" strokeWidth={1.9} />
      </button>

      <IntelligenceMenu />
      <ThemeToggle />
      <NotificationsMenu />
      <ProfileMenu />

      <CommandPalette />
    </header>
  );
}
