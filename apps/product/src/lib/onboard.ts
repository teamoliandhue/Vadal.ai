/* Onboard — the two capabilities that had no screen (Talent intelligence, spec 056).

   The cohort view answered "how is the first 90 going". It could not answer
   the two questions that decide it:

   · BEFORE DAY ONE. Most onboarding fails in the fortnight nobody owns —
     between the signature and the start date, when the person has no company
     email, no laptop and no way to ask whether they should bring a passport.
     A preboarding row is therefore reachable on a personal channel, and shows
     what is ready and what is not.
   · THE ADMIN. Documents, accounts, a locker, a uniform. Every one of these is
     a small job somebody chases by hand unless something does it. So each item
     says who owns it, whether it happened by itself, and who it is waiting on
     — because "waiting on the joiner" and "waiting on us" are different
     failures with different fixes.

   Deterministic demo data. */

export type Ready = { laptop: boolean; accounts: boolean; buddy: boolean; welcome: boolean; docs: boolean };

export type PreStarter = {
  id: string;
  name: string;
  img: string;
  team: string;
  title: string;
  /** human date */
  starts: string;
  /** days from today */
  inDays: number;
  manager: string;
  /** how we can reach them before they have a company account */
  channel: string;
  /** they opened the welcome pack we sent */
  packOpened: boolean;
  ready: Ready;
  /** which of those apply to this role — a line operator needs no laptop */
  needs: (keyof Ready)[];
  /** what they still owe us */
  outstanding: string[];
};

export const preStarters: PreStarter[] = [
  {
    id: "p-anaya", name: "Anaya Kulkarni", img: "/avatars/user-5.svg", team: "Design", title: "Product Designer",
    starts: "Mon 28 Sep", inDays: 6, manager: "Anita Desai", channel: "WhatsApp", packOpened: true,
    ready: { laptop: true, accounts: true, buddy: true, welcome: true, docs: false },
    needs: ["laptop", "accounts", "buddy", "welcome", "docs"],
    outstanding: ["Bank details"],
  },
  {
    id: "p-vikram", name: "Vikram Shetty", img: "/avatars/user-4.svg", team: "Plant Ops", title: "Line Operator",
    starts: "Mon 28 Sep", inDays: 6, manager: "Vikram Joshi", channel: "WhatsApp", packOpened: true,
    ready: { laptop: false, accounts: false, buddy: false, welcome: true, docs: true },
    needs: ["buddy", "welcome", "docs"],
    outstanding: [],
  },
  {
    id: "p-fatima", name: "Fatima Ansari", img: "/avatars/user-8.svg", team: "Support", title: "Support Specialist",
    starts: "Wed 30 Sep", inDays: 8, manager: "Farah Khan", channel: "Personal email", packOpened: false,
    ready: { laptop: true, accounts: false, buddy: false, welcome: true, docs: false },
    needs: ["laptop", "accounts", "buddy", "welcome", "docs"],
    outstanding: ["Signed contract", "ID proof"],
  },
  {
    id: "p-joseph", name: "Joseph Mathew", img: "/avatars/user-6.svg", team: "Logistics", title: "Dispatch Coordinator",
    starts: "Mon 5 Oct", inDays: 13, manager: "Deepak Singh", channel: "WhatsApp", packOpened: true,
    ready: { laptop: false, accounts: false, buddy: true, welcome: true, docs: true },
    needs: ["buddy", "welcome", "docs"],
    outstanding: [],
  },
];

export const READY_LABEL: Record<keyof Ready, string> = {
  laptop: "Laptop", accounts: "Accounts", buddy: "Buddy", welcome: "Welcome note", docs: "Documents",
};

/* ── the admin, and who it is waiting on ─────────────────────────── */
export type AdminOwner = "IT" | "People" | "Facilities" | "Payroll" | "The joiner";
export type AdminState = "Done" | "Automatic" | "Waiting" | "Late";

export type AdminItem = {
  id: string;
  what: string;
  owner: AdminOwner;
  state: AdminState;
  who: string;          // the joiner it belongs to
  team: string;
  note: string;
};

export const adminItems: AdminItem[] = [
  { id: "a1", what: "Payroll record created", owner: "Payroll", state: "Automatic", who: "Anaya Kulkarni", team: "Design", note: "Created from the signed offer, the hour it was signed." },
  { id: "a2", what: "Bank details", owner: "The joiner", state: "Waiting", who: "Anaya Kulkarni", team: "Design", note: "Asked twice on WhatsApp. Third ask is blocked — we don't chase more than twice." },
  { id: "a3", what: "Laptop and accounts", owner: "IT", state: "Done", who: "Anaya Kulkarni", team: "Design", note: "Shipped to her home address, arriving Friday." },
  { id: "a4", what: "Signed contract", owner: "The joiner", state: "Late", who: "Fatima Ansari", team: "Support", note: "Sent to a personal email that has not been opened. Worth a call." },
  { id: "a5", what: "Locker and uniform", owner: "Facilities", state: "Waiting", who: "Vikram Shetty", team: "Plant Ops", note: "Raised as a task in Flow; due the day before he starts." },
  { id: "a6", what: "Shift and site access card", owner: "Facilities", state: "Waiting", who: "Vikram Shetty", team: "Plant Ops", note: "Night-shift access needs the plant manager's sign-off." },
  { id: "a7", what: "Statutory documents (PF, ESI)", owner: "People", state: "Automatic", who: "Joseph Mathew", team: "Logistics", note: "Pre-filled from the offer; he confirms on day one." },
  { id: "a8", what: "Buddy assigned", owner: "People", state: "Done", who: "Joseph Mathew", team: "Logistics", note: "Ritu Das — two years in Logistics." },
];

export const adminStats = {
  /** share of joiners who had everything on day one, last quarter */
  readyDayOne: 78,
  readyDelta: 12,
  /** admin steps that completed without a person touching them */
  automatic: 61,
  /** median days from signed offer to full access */
  toAccessDays: 3.4,
};
