"use client";
/* Route error boundary for every /product section. Next renders this in place of
   the page when a render/runtime error escapes — a graceful, recoverable fallback
   instead of a blank screen. The app chrome (rail/topbar) stays mounted. */
import * as React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    // surface to the console for debugging; a real app would log to telemetry
    console.error("Section error:", error);
  }, [error]);
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-[26px] border border-line bg-card p-10 text-center shadow-[0_18px_42px_-26px_rgba(20,20,40,0.22)]">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--lav)] text-[var(--purple)]">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="text-[18px] font-bold tracking-tight text-ink">This section hit a snag</h2>
        <p className="text-[14px] leading-relaxed text-muted">
          Something went wrong rendering this view. Your data is safe — try again, or head back to Home.
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <button onClick={reset} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-[var(--card)] transition hover:opacity-90">
            <RotateCw className="h-4 w-4" /> Try again
          </button>
          <a href="/product/home" className="rounded-full px-4 py-2 text-[14px] font-semibold text-muted ring-1 ring-line transition hover:bg-soft">Go to Home</a>
        </div>
      </div>
    </div>
  );
}
