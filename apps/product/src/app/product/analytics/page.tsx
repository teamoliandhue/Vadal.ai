/* Analytics — the free-slicing companion to Pulse. Pulse curates "what needs
   attention now"; Analytics answers "any metric, any cut."

   Deep-linked from Pulse via ?metric=&dim=&period=. Those are read on the CLIENT
   (useSearchParams in AnalyticsExplorer), not by awaiting the server-side
   `searchParams` promise: awaiting it here made the segment dynamic and, against
   this route's loading.tsx boundary, the page hydrated to a blank tree — the
   whole surface silently rendered nothing. The explorer is a client component
   that owns this state anyway, so reading the query where it is used is both the
   fix and the simpler shape. */
import { Suspense } from "react";
import { Shell } from "../shell";
import { AnalyticsExplorer } from "./AnalyticsExplorer";

export default function AnalyticsPage() {
  return (
    <Shell active="Analytics" breadcrumb="Analytics">
      {/* useSearchParams needs a Suspense boundary of its own */}
      <Suspense fallback={null}>
        <AnalyticsExplorer />
      </Suspense>
    </Shell>
  );
}
