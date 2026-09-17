"use client";
/* Social has two rooms — the company stream and the communities people choose.
   One strip at the top of both, so neither is a place you have to find. */
import Link from "next/link";
import { canModerate } from "@/lib/posting";
import { useViewAs } from "../useViewAs";
import { useModeration } from "./useModeration";

const TABS = [
  { id: "feed", label: "Feed", href: "/product/social" },
  { id: "groups", label: "Communities", href: "/product/social/groups" },
  { id: "review", label: "Review", href: "/product/social/review" },
] as const;

/* Review is the moderator's tab — admins only, per lib/access. */
export function SocialTabs({ active, count }: { active: "feed" | "groups" | "review"; count?: number }) {
  const [role] = useViewAs();
  const { pending } = useModeration();
  const tabs = TABS.filter((t) => t.id !== "review" || canModerate(role));
  return (
    <nav aria-label="Social" className="flex items-center gap-1 border-b border-line">
      {tabs.map((t) => {
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
            {t.id === "review" && pending.length > 0 ? (
              <span className="rounded-full bg-[var(--warning)]/15 px-1.5 py-0.5 text-[12px] font-semibold text-[var(--warning)]">{pending.length}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
