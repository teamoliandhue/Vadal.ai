"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark, IRIS_PICK } from "./mark";

/* Top nav for the product app's brand pages.
   Dashboard → the project dashboard (the hub, where design system, assets,
   docs and the journey live). DS Doc / Assets / Project Doc are not built
   yet — shown greyed with a "Soon" tag. Journey lives in the dashboard.
   Hidden on /product (the full-screen Lumen dashboard has its own chrome)
   and on /auth (sign-in/onboarding are a clean, chrome-free canvas). */
const DASHBOARD_URL = "https://vadal-hub-kappa.vercel.app";
const SOON = ["DS Doc", "Assets", "Project Doc"];

export function Nav() {
  const path = usePathname();
  if (path?.startsWith("/product") || path?.startsWith("/auth")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Mark id="nav" stops={IRIS_PICK.stops} star={IRIS_PICK.star} flagOpacity={IRIS_PICK.flagOpacity} size={26} />
          <span className="font-grotesk text-[15px] font-semibold tracking-tight">
            vadal<span style={{ color: "#7c5cf8" }}>.ai</span>
          </span>
        </Link>
        <nav className="-mr-1 flex items-center gap-0.5 overflow-x-auto sm:gap-1">
          <a
            href={DASHBOARD_URL}
            className="whitespace-nowrap rounded-full bg-[#efeaff] px-3.5 py-1.5 font-grotesk text-[13.5px] font-semibold text-[#5b4bd6] transition-colors hover:bg-[#e4dcff]"
          >
            Dashboard
          </a>
          {SOON.map((label) => (
            <span
              key={label}
              aria-disabled="true"
              className="inline-flex cursor-default items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-grotesk text-[13.5px] font-medium text-faint/70"
            >
              {label}
              <span className="rounded-full bg-soft px-1.5 py-[3px] text-[9.5px] font-semibold uppercase tracking-wide text-faint">Soon</span>
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
