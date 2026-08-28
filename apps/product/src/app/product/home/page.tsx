/* ════════════════════════════════════════════════════════════════════
   HOME — the employee daily workspace (route /product/home).
   "The morning ritual": merged greeting + mood hero with a focal "Up next",
   a focus/feed bento, neutral surfaces + violet accent, narrative metrics,
   a live AI moment, and real states (loading · first-time · empty).
   First-time/new-joiner preview: /product/home?view=new

   The view lives in ./HomeContent (client) — see the note there for why the
   ?view=new query is read on the client rather than awaited here.
   ════════════════════════════════════════════════════════════════════ */

import { Suspense } from "react";
import { Shell } from "../shell";
import { HomeContent } from "./HomeContent";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  // Computed here so the clock is read once, on the server — a client-side
  // read would risk a hydration mismatch on the greeting.
  const greeting = greetingFor(new Date().getHours());
  return (
    <Shell active="Home" breadcrumb="Home">
      {/* useSearchParams needs a Suspense boundary of its own */}
      <Suspense fallback={null}>
        <HomeContent greeting={greeting} />
      </Suspense>
    </Shell>
  );
}
