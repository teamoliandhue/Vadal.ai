/* MY DAY — the employee daily workspace (route /product/myday).

   The morning ritual's body: what needs you today, your calendar, who you are
   here, your kudos and the feed. The greeting hero it used to sit under stays
   on Home; see ./MyDayContent for why the two were separated.

   First-time / new-joiner preview: /product/myday?view=new */
import { Suspense } from "react";
import { Shell } from "../shell";
import { MyDayContent } from "./MyDayContent";

export default function MyDayPage() {
  return (
    <Shell active="My day" breadcrumb="My day">
      {/* useSearchParams needs a Suspense boundary of its own */}
      <Suspense fallback={null}>
        <MyDayContent />
      </Suspense>
    </Shell>
  );
}
