"use client";
/* Kudos has up to three rooms: the wall, your wallet, and rewards. With points
   off the wallet is "Badges" — same place, no numbers. */
import Link from "next/link";
import { usePoints } from "../usePointsMode";

export function KudosTabs({ active }: { active: "kudos" | "wallet" | "rewards" }) {
  const points = usePoints();
  const tabs = [
    { id: "kudos", label: "Kudos", href: "/product/kudos" },
    { id: "wallet", label: points ? "Wallet" : "Badges", href: "/product/kudos/wallet" },
    { id: "rewards", label: "Rewards", href: "/product/kudos/rewards" },
  ] as const;
  return (
    <nav aria-label="Kudos" className="flex items-center gap-1 border-b border-line">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px flex min-h-[44px] items-center border-b-2 px-3 text-[14px] font-semibold transition lg:min-h-[40px] ${on ? "border-[var(--purple)] text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
