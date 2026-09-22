/* Home — one clock, and the short list of things actually waiting on you
   (spec 062).

   Two things were wrong with Home rather than missing from it:

   · TWO CLOCKS. The hero printed a hard-coded "Tuesday, 9 June" while the week
     ahead listed dates in September, and the greeting claimed a 12-day streak
     next to a check-in card claiming 13. A daily ritual screen that cannot
     agree with itself about the day is not a ritual. Every date on Home now
     comes from one place — today — and is written by hand, never through ICU,
     which is what produced "Sept" elsewhere in this product.
   · A PRODUCT DIRECTORY WHERE THE WORK SHOULD BE. Nine marketing tiles sat
     directly under the greeting, each with a number nobody acts on, using the
     old pillar names (Broadcast, Managers). The sidebar already lists every
     module and Get Started already runs the tour. That space now carries the
     handful of things that are genuinely waiting on this person.

   Deterministic demo data; role-filtered, and every item names a section so it
   is never shown to someone who cannot open it. */

import type { Role } from "./auth";
import { reports } from "./manager";

const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Tuesday, 22 September" — by hand, so it never renders as "Sept". */
export function todayLong(now = new Date()) {
  return `${DAY_LONG[now.getDay()]}, ${now.getDate()} ${MONTH_LONG[now.getMonth()]}`;
}

/** The day n days from today, as the week-ahead strip writes it. */
export function dayFrom(n: number, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
  return {
    key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
    short: n === 0 ? "Today" : n === 1 ? "Tomorrow" : DAY_SHORT[d.getDay()],
    date: String(d.getDate()),
  };
}

/* ── waiting on you ──────────────────────────────────────────────── */
export type WaitingItem = {
  id: string;
  title: string;
  /** why it is here, in the fewest words that are still true */
  meta: string;
  /** how long it will take, when we honestly know */
  takes?: string;
  href: string;
  /** checked against access, so nothing links somewhere this person cannot open */
  section: string;
  action: string;
  roles?: Role[];
  /** past its date — shown with a word, never colour alone */
  late?: boolean;
};

const MGR: Role[] = ["manager", "admin", "superadmin"];
const ADM: Role[] = ["admin", "superadmin"];

const OWED = reports.filter((r) => r.overdue);

export const waitingOnYou: WaitingItem[] = [
  {
    id: "w-pulse", title: "September pulse", meta: "Closes Friday · six questions",
    takes: "2 min", href: "/product/survey/september-pulse", section: "Home", action: "Answer",
  },
  {
    id: "w-learn", title: "Compliance refresher", meta: "Due Friday · two parts left",
    takes: "12 min", href: "/product/ilearn", section: "iLearn", action: "Resume",
  },
  {
    id: "w-kudos", title: "Recognise a teammate", meta: "You haven't this week",
    href: "/product/kudos", section: "Kudos", action: "Give",
  },
  /* Built from the same rows Manager hub and the team snapshot read, so the
     three of them can never name different people. */
  {
    id: "w-1on1",
    title: `${OWED.length} 1:1${OWED.length === 1 ? "" : "s"} you owe`,
    meta: `${OWED.map((r) => r.name.split(" ")[0]).join(" and ")} · overdue`,
    href: "/product/managers", section: "Manager hub", action: "Plan", roles: MGR, late: true,
  },
  {
    id: "w-review", title: "Four posts waiting for review", meta: "One names a hazard in bay 4",
    href: "/product/social/review", section: "Settings", action: "Review", roles: ADM, late: true,
  },
];

/** The list this person actually sees — the hero and the card count the same rows. */
export function waitingFor(role: Role, done: string[] = []) {
  return waitingOnYou.filter((w) => (!w.roles || w.roles.includes(role)) && !done.includes(w.id));
}

/** Nothing here asks twice, and nothing here is a notification: it is work with a door. */
export const waitingNote =
  "Only things that are yours to finish. When there is nothing, this is empty rather than filled with news.";
