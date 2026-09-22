/* Flow — cases, tasks, automations and SLA (Digital workplace, spec 055).

   Cases already existed (lib/cases). The other three capabilities the platform
   promises did not, and each one answers a question the case list cannot:

   · TASKS — a case is a conversation; the work inside it is a list of small
     jobs with owners and dates. Most of them are not cases at all: a joiner's
     laptop, a policy acknowledgement, a locker key.
   · AUTOMATIONS — the rules that open, route and chase work without anyone
     remembering to. Each one says what it did, how often, and — the part most
     products hide — what it is never allowed to do.
   · SLA — whether we keep the promise we make when we open something. Median
     against target, by category, and every breach with its reason.

   Deterministic demo data. */

/* ── tasks ───────────────────────────────────────────────────────── */
export type TaskStatus = "To do" | "Doing" | "Done";
export type TaskSource = "Case" | "Onboarding" | "Policy" | "Manual" | "Automation";

export type Task = {
  id: string;
  title: string;
  who: { name: string; img: string };
  team: string;
  due: string;          // human, relative
  overdue?: boolean;
  status: TaskStatus;
  source: TaskSource;
  /** the case this belongs to, when it came from one */
  caseId?: string;
  note?: string;
};

export const tasks: Task[] = [
  { id: "T-410", title: "Confirm the rota change with the night-shift leads", who: { name: "Meera Pillai", img: "/avatars/user-7.svg" }, team: "Plant Ops", due: "Today", status: "Doing", source: "Case", caseId: "CASE-118", note: "Blocked until the shift pattern is signed off." },
  { id: "T-411", title: "Laptop and access for Dev Patel", who: { name: "Rahul Verma", img: "/avatars/user-1.svg" }, team: "IT", due: "Tomorrow", status: "To do", source: "Onboarding", note: "Starts Monday — day one is the deadline that matters." },
  { id: "T-412", title: "Chase the payroll correction for August HRA", who: { name: "Meera Pillai", img: "/avatars/user-7.svg" }, team: "Payroll", due: "2 days late", overdue: true, status: "Doing", source: "Case", caseId: "CASE-204" },
  { id: "T-413", title: "Publish the updated relocation policy", who: { name: "Priya Sharma", img: "/avatars/user-8.svg" }, team: "People", due: "Fri", status: "To do", source: "Policy", note: "The desk is quoting a document two years old." },
  { id: "T-414", title: "Collect signed acknowledgements — safety refresher", who: { name: "Ravi Prasad", img: "/avatars/user-2.svg" }, team: "Plant Ops", due: "Next week", status: "To do", source: "Automation", note: "62 of 340 still outstanding." },
  { id: "T-415", title: "Book exit conversation with A. Mehta", who: { name: "Neha Rao", img: "/avatars/user-5.svg" }, team: "People", due: "Wed", status: "Done", source: "Case", caseId: "CASE-118" },
  { id: "T-416", title: "Locker and uniform for the September joiners", who: { name: "Ravi Prasad", img: "/avatars/user-2.svg" }, team: "Plant Ops", due: "Done", status: "Done", source: "Onboarding" },
];

/* ── automations ─────────────────────────────────────────────────── */
export type Automation = {
  id: string;
  when: string;
  then: string;
  on: boolean;
  runs30d: number;
  lastRun: string;
  /** what this rule is not allowed to do — stated, not implied */
  never: string;
};

export const automations: Automation[] = [
  {
    id: "au-risk", when: "Pulse flags a retention risk on a team", then: "Open a case and assign the team's HRBP",
    on: true, runs30d: 14, lastRun: "2 days ago",
    never: "Never names the people behind the signal — the case carries the team, not a list.",
  },
  {
    id: "au-desk", when: "SmartWork can't answer a question", then: "Open an HR request with the conversation attached",
    on: true, runs30d: 424, lastRun: "an hour ago",
    never: "Never closes the request itself. A person answers, always.",
  },
  {
    id: "au-sla", when: "A case is one day from its SLA", then: "Remind the owner, and their lead at breach",
    on: true, runs30d: 38, lastRun: "this morning",
    never: "Never reassigns the case on its own.",
  },
  {
    id: "au-joiner", when: "A joiner's start date is confirmed", then: "Create the day-one tasks for IT, Facilities and the manager",
    on: true, runs30d: 38, lastRun: "yesterday",
    never: "Never contacts the joiner before the manager has seen the plan.",
  },
  {
    id: "au-ack", when: "A policy is published as must-read", then: "Track acknowledgements and chase the ones outstanding",
    on: true, runs30d: 3, lastRun: "last week",
    never: "Never chases more than twice, and never after hours.",
  },
  {
    id: "au-close", when: "A case has been resolved for 14 days", then: "Archive it and keep the record",
    on: false, runs30d: 0, lastRun: "—",
    never: "Never deletes anything. Archiving is not deletion.",
  },
];

/* ── SLA ─────────────────────────────────────────────────────────── */
export type SlaRow = { category: string; target: number; median: number; onTime: number; closed: number; breaches: number };

export const sla: SlaRow[] = [
  { category: "HR request", target: 2, median: 1.2, onTime: 94, closed: 386, breaches: 23 },
  { category: "Pay & growth", target: 3, median: 2.6, onTime: 88, closed: 96, breaches: 11 },
  { category: "Manager", target: 5, median: 4.1, onTime: 91, closed: 44, breaches: 4 },
  { category: "Wellbeing", target: 2, median: 1.1, onTime: 97, closed: 38, breaches: 1 },
  { category: "Role clarity", target: 5, median: 6.8, onTime: 62, closed: 29, breaches: 11 },
  { category: "Grievance", target: 5, median: 5.4, onTime: 74, closed: 19, breaches: 5 },
  { category: "Harassment / ER", target: 1, median: 0.6, onTime: 100, closed: 7, breaches: 0 },
];

export type Breach = { id: string; title: string; category: string; owner: string; over: number; why: string };

export const breaches: Breach[] = [
  { id: "CASE-181", title: "Role change not reflected in the system", category: "Role clarity", owner: "Priya Sharma", over: 6, why: "Waiting on a decision from two teams; nobody owned the decision itself." },
  { id: "CASE-204", title: "August payslip shows the old HRA", category: "Pay & growth", owner: "Meera Pillai", over: 2, why: "Payroll run had closed; the correction moves to next month's arrears." },
  { id: "CASE-166", title: "Grievance — shift allocation", category: "Grievance", owner: "Neha Rao", over: 1, why: "Investigation needed a second interview, and the person was on leave." },
];

export const slaStats = {
  onTime: 89,           // % closed inside target, last 30 days
  onTimeDelta: 4,
  openNow: 12,
  dueToday: 3,
  medianDays: 1.8,
};
