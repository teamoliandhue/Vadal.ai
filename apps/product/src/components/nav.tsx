"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark, IRIS_PICK } from "./mark";

/* Top nav for the product app. Links to what we have:
   Dashboard → home · DS Doc → the brand case study · Assets → downloads ·
   Project Doc → positioning PDF · Journey → the Stage 1 deck (deployed). */
const ITEMS = [
  { label: "Dashboard", href: "/", kind: "route" as const },
  { label: "DS Doc", href: "/pick", kind: "route" as const },
  { label: "Assets", href: "/assets", kind: "route" as const },
  { label: "Project Doc", href: "/Vadal-Brand-Positioning.pdf", kind: "file" as const },
  { label: "Journey", href: "https://vadal-dashboards.vercel.app", kind: "external" as const },
];

function ExtIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function Nav() {
  const path = usePathname();
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
          {ITEMS.map((it) => {
            const active = it.kind === "route" && (it.href === "/" ? path === "/" : path.startsWith(it.href));
            const cls = `whitespace-nowrap rounded-full px-3 py-1.5 font-grotesk text-[13.5px] font-medium transition-colors ${
              active ? "bg-[#efeaff] text-[#5b4bd6]" : "text-muted hover:bg-soft hover:text-ink"
            }`;
            if (it.kind === "route") {
              return (
                <Link key={it.label} href={it.href} className={cls}>
                  {it.label}
                </Link>
              );
            }
            return (
              <a key={it.label} href={it.href} target="_blank" rel="noopener noreferrer" className={`${cls} inline-flex items-center gap-1`}>
                {it.label}
                <ExtIcon />
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
