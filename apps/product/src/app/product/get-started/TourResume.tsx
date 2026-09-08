"use client";
/* Home's two duties to the tour.

   1. The first visit lands on it. Someone who has never seen the tour — a new
      joiner, an investor opening the demo — reaches Home and is taken to Get
      Started instead. Once. After that Home is Home; "Start over" on the tour
      does not bring the redirect back.
   2. A resume line while it is unfinished. One row under the greeting: how far
      you are, and a way back. Hidden when everything is explored, or when the
      person hides it themselves. */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { SparkMark } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { tourFor, TOUR_SEEN_KEY, TOUR_DISMISSED_KEY } from "@/lib/tour";
import { useViewAs } from "../useViewAs";
import { useTourProgress } from "../useTourProgress";

export function TourResume() {
  const router = useRouter();
  const [role] = useViewAs();
  const { explored, hydrated } = useTourProgress();
  const [seen, , seenHydrated] = usePersistentState<boolean>(TOUR_SEEN_KEY, false);
  const [dismissed, setDismissed, dismissedHydrated] = usePersistentState<boolean>(TOUR_DISMISSED_KEY, false);

  const ready = hydrated && seenHydrated && dismissedHydrated;
  const firstVisit = ready && seen !== true && explored.length === 0;

  React.useEffect(() => {
    if (firstVisit) router.replace("/product/get-started");
  }, [firstVisit, router]);

  if (!ready || firstVisit || dismissed === true) return null;
  const steps = tourFor(role);
  const done = steps.filter((s) => explored.includes(s.id)).length;
  if (done >= steps.length) return null;

  return (
    <div className="rise mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] py-2 pl-3 pr-2">
      <span className="ai-grad grid h-7 w-7 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold">
          {done === 0 ? "Take the tour of what Vadal does" : `Continue the tour · ${done} of ${steps.length} explored`}
        </p>
        <div className="mt-1 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-line">
          <span className="ai-grad block h-full rounded-full" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
      </div>
      <Link href="/product/get-started" className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold text-[var(--ai-accent)] transition hover:gap-2 lg:min-h-[36px]">
        {done === 0 ? "Start" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Hide the tour reminder" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-faint transition hover:bg-card hover:text-ink lg:h-9 lg:w-9">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
