"use client";
/* Social has two rooms — the company stream and the communities people choose.
   One strip at the top of both, so neither is a place you have to find. */
import Link from "next/link";

const TABS = [
  { id: "feed", label: "Feed", href: "/product/feed" },
  { id: "groups", label: "Communities", href: "/product/feed/groups" },
] as const;

export function SocialTabs({ active, count }: { active: "feed" | "groups"; count?: number }) {
  return (
    <nav aria-label="Social" className="flex items-center gap-1 border-b border-line">
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`relative -mb-px flex min-h-[44px] items-center gap-1.5 border-b-2 px-3 text-[14px] font-semibold transition lg:min-h-[40px] ${
              on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.id === "groups" && count ? (
              <span className="rounded-full bg-soft px-1.5 py-0.5 text-[12px] font-semibold text-muted">{count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
