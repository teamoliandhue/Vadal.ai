"use client";
/* The client-branding layer for the Home greeting band (Home §1) — the call's
   #1 ask. Tints the band with the customer's brand colour, drops their logo in
   as an opaque backdrop, and shows a "Powered by Vadal" mark that disappears
   when the workspace is white-labelled. Reads the same saved settings as the
   Branding panel and updates live. */
import { org } from "@/lib/data";
import { useBrand } from "../useBrand";

/* Decorative band tint + client logo watermark — sits behind the greeting. */
export function HomeBrandLayer() {
  const { color, band } = useBrand();
  const c = color ?? "var(--purple)";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]" aria-hidden>
      {band && <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${c} 10%, transparent), transparent)` }} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={org.logo} alt="" className="absolute -bottom-8 right-8 h-40 w-40 select-none opacity-[0.05]" />
    </div>
  );
}

/* "Powered by Vadal" — hidden when the workspace is white-labelled. */
export function VadalBadge({ className = "" }: { className?: string }) {
  const { white } = useBrand();
  if (white) return null;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium text-faint ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/signal-mark.svg" alt="" className="h-3 w-3 opacity-80" /> Powered by Vadal
    </span>
  );
}
