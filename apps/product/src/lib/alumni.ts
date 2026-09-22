/* Alumni — the two capabilities that had no screen, and the one that had a line
   (Talent intelligence, spec 057).

   The module the platform means by Alumni: Alumni Network · Exit Documents ·
   Boomerang Hiring · Employee Referrals. The network was built. The rest:

   · EXIT DOCUMENTS. The last thing a company does for someone is paperwork,
     and it is where goodwill is lost — a relieving letter that takes six weeks
     costs a boomerang hire and a Glassdoor review. Each document says who owns
     it, whether it issued by itself, and whether it is late. Documents that do
     not apply to a person are not counted against them: gratuity needs five
     years, notice-period recovery only exists if there was a shortfall.
   · BOOMERANG HIRING. "Nine rejoined this year" is a number, not a pipeline.
     An open role is matched to alumni who are eligible, in the network, and
     said they would come back — matched on their old team, never scored on
     their exit answers.
   · EMPLOYEE REFERRALS. Who referred whom, and what happened. A referral that
     nobody moved is the reason people stop referring, so the stage and its age
     are on the row.

   Deterministic demo data. */

import { LEAVERS, type Leaver } from "./lifecycle";

/* ── exit documents ───────────────────────────────────────────────── */
export type DocState = "Issued" | "Automatic" | "Waiting" | "Late";
export type DocOwner = "People" | "Payroll" | "Finance" | "IT" | "The leaver";

export type DocKey =
  | "relieving" | "experience" | "fnf" | "form16" | "pf" | "gratuity" | "property";

export const DOC_LABEL: Record<DocKey, string> = {
  relieving: "Relieving letter",
  experience: "Experience letter",
  fnf: "Full and final settlement",
  form16: "Form 16",
  pf: "PF transfer (UAN)",
  gratuity: "Gratuity",
  property: "Company property returned",
};

export const DOC_OWNER: Record<DocKey, DocOwner> = {
  relieving: "People", experience: "People", fnf: "Payroll", form16: "Finance",
  pf: "Payroll", gratuity: "Finance", property: "IT",
};

export type ExitDoc = { key: DocKey; state: DocState; note: string };

export type ExitPack = {
  leaverId: string;
  /** human, no ICU */
  lastDay: string;
  /** days since the last day */
  since: number;
  docs: ExitDoc[];
};

/** Everyone gets these; gratuity needs five years, property only if they held any. */
export const exitPacks: ExitPack[] = [
  {
    leaverId: "l1", lastDay: "5 Sep 2026", since: 17,
    docs: [
      { key: "relieving", state: "Issued", note: "Signed and emailed the day after his last day." },
      { key: "experience", state: "Issued", note: "Dates and title as they stand in the record." },
      { key: "fnf", state: "Automatic", note: "Calculated from the last payroll run; credited on the 30th." },
      { key: "form16", state: "Waiting", note: "Issues after the quarter closes. Nothing to chase." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited; transfer is his to claim." },
      { key: "property", state: "Issued", note: "Laptop and card returned on the last day." },
    ],
  },
  {
    leaverId: "l2", lastDay: "22 Aug 2026", since: 31,
    docs: [
      { key: "relieving", state: "Issued", note: "Issued on the last day." },
      { key: "experience", state: "Issued", note: "Issued on the last day." },
      { key: "fnf", state: "Late", note: "Held for a laptop that was already returned. Twelve days over — nobody owned the release." },
      { key: "form16", state: "Waiting", note: "Issues after the quarter closes." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited." },
      { key: "property", state: "Issued", note: "Returned by courier, logged by IT." },
    ],
  },
  {
    leaverId: "l3", lastDay: "14 Aug 2026", since: 39,
    docs: [
      { key: "relieving", state: "Issued", note: "Collected in person at the plant office." },
      { key: "experience", state: "Issued", note: "Printed and handed over, with a scan on file." },
      { key: "fnf", state: "Issued", note: "Settled with the August run." },
      { key: "form16", state: "Waiting", note: "Issues after the quarter closes." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited." },
      { key: "gratuity", state: "Issued", note: "Six years — paid with the settlement." },
      { key: "property", state: "Issued", note: "Uniform, locker key and access card." },
    ],
  },
  {
    leaverId: "l4", lastDay: "19 Jul 2026", since: 65,
    docs: [
      { key: "relieving", state: "Late", note: "Nobody signed off the notice shortfall, so nothing issued. Forty days." },
      { key: "experience", state: "Waiting", note: "Follows the relieving letter." },
      { key: "fnf", state: "Late", note: "Blocked on the same sign-off. He has asked twice." },
      { key: "form16", state: "Waiting", note: "Issues after the quarter closes." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited." },
      { key: "property", state: "Issued", note: "Scanner and vest returned." },
    ],
  },
  {
    leaverId: "l5", lastDay: "11 Jul 2026", since: 73,
    docs: [
      { key: "relieving", state: "Issued", note: "Issued on the last day." },
      { key: "experience", state: "Issued", note: "Issued on the last day." },
      { key: "fnf", state: "Issued", note: "Settled with the July run." },
      { key: "form16", state: "Issued", note: "Issued for the part year." },
      { key: "pf", state: "Automatic", note: "Transferred to her new employer's UAN." },
      { key: "property", state: "Issued", note: "Laptop returned." },
    ],
  },
  {
    leaverId: "l6", lastDay: "6 Jun 2026", since: 108,
    docs: [
      { key: "relieving", state: "Issued", note: "Issued a week after the last day." },
      { key: "experience", state: "Issued", note: "Issued a week after the last day." },
      { key: "fnf", state: "Issued", note: "Settled with the June run." },
      { key: "form16", state: "Issued", note: "Issued for the part year." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited." },
      { key: "property", state: "Waiting", note: "Fuel card not returned. One ask sent; we do not chase a leaver twice." },
    ],
  },
  {
    leaverId: "l7", lastDay: "27 Jun 2026", since: 87,
    docs: [
      { key: "relieving", state: "Issued", note: "Issued on the last day." },
      { key: "experience", state: "Issued", note: "Issued on the last day." },
      { key: "fnf", state: "Issued", note: "Settled with the June run." },
      { key: "form16", state: "Issued", note: "Issued for the part year." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited." },
      { key: "property", state: "Issued", note: "Laptop returned." },
    ],
  },
  {
    leaverId: "l8", lastDay: "16 May 2026", since: 129,
    docs: [
      { key: "relieving", state: "Issued", note: "Issued on the last day." },
      { key: "experience", state: "Issued", note: "Issued on the last day." },
      { key: "fnf", state: "Issued", note: "Settled with the May run." },
      { key: "form16", state: "Issued", note: "Issued for the part year." },
      { key: "pf", state: "Automatic", note: "UAN marked as exited." },
      { key: "gratuity", state: "Issued", note: "Five years — paid with the settlement." },
      { key: "property", state: "Issued", note: "Tool kit and access card." },
    ],
  },
];

export const packFor = (leaverId: string) => exitPacks.find((p) => p.leaverId === leaverId);

/** Everything that is settled — either a person did it or it happened by itself. */
export const settled = (d: ExitDoc) => d.state === "Issued" || d.state === "Automatic";

export const packDone = (p: ExitPack) => p.docs.every(settled);
export const packLate = (p: ExitPack) => p.docs.some((d) => d.state === "Late");

export const docStats = {
  /** leavers whose pack is complete */
  complete: exitPacks.filter(packDone).length,
  total: exitPacks.length,
  /** documents that issued without a person touching them */
  automaticPct: Math.round(
    (exitPacks.flatMap((p) => p.docs).filter((d) => d.state === "Automatic").length /
      exitPacks.flatMap((p) => p.docs).length) * 100,
  ),
  /** median days from last day to relieving letter, last 12 months */
  toRelievingDays: 2,
  relievingTarget: 3,
  /** how many are past their promise right now */
  late: exitPacks.flatMap((p) => p.docs).filter((d) => d.state === "Late").length,
};

/* ── boomerang hiring ─────────────────────────────────────────────── */
export type OpenRole = {
  id: string;
  title: string;
  team: string;
  posted: string;
  /** leaver ids we may show this role to — eligible, in the network, said yes or maybe */
  matches: string[];
};

export const openRoles: OpenRole[] = [
  { id: "r1", title: "Senior Engineer", team: "Engineering", posted: "6 days ago", matches: ["l1", "l7"] },
  { id: "r2", title: "Visual Designer", team: "Design", posted: "2 weeks ago", matches: ["l2"] },
  { id: "r3", title: "Support Lead", team: "Support", posted: "3 days ago", matches: ["l5"] },
  { id: "r4", title: "Shift Lead · nights", team: "Plant Ops", posted: "yesterday", matches: [] },
];

/** A role is only ever shown to someone who is eligible, in the network and said
    they would come back. Their reason for leaving plays no part in it. */
export function matchable(l: Leaver) {
  return l.inNetwork && l.rehire === "Eligible" && (l.wouldReturn === "Yes" || l.wouldReturn === "Maybe");
}

export const matchesFor = (r: OpenRole, leavers: Leaver[] = LEAVERS) =>
  r.matches.map((id) => leavers.find((l) => l.id === id)).filter((l): l is Leaver => !!l && matchable(l));

/* ── employee referrals ───────────────────────────────────────────── */
export type ReferralStage = "Applied" | "In interview" | "Offer" | "Hired" | "Not this time";

export type Referral = {
  id: string;
  candidate: string;
  role: string;
  team: string;
  /** who put the name forward */
  by: { name: string; img: string; alumni: boolean };
  stage: ReferralStage;
  /** days since the referral was made */
  age: number;
  /** days since anyone moved it */
  idle: number;
  note?: string;
};

export const referrals: Referral[] = [
  { id: "rf1", candidate: "Nikhil Menon", role: "Senior Engineer", team: "Engineering", by: { name: "Rohan Gupta", img: "/avatars/user-2.svg", alumni: true }, stage: "In interview", age: 12, idle: 2 },
  { id: "rf2", candidate: "Sana Qureshi", role: "Visual Designer", team: "Design", by: { name: "Anita Desai", img: "/avatars/user-5.svg", alumni: false }, stage: "Offer", age: 24, idle: 1 },
  { id: "rf3", candidate: "Pooja Nair", role: "Support Specialist", team: "Support", by: { name: "Divya Menon", img: "/avatars/user-8.svg", alumni: true }, stage: "Applied", age: 21, idle: 19, note: "Nineteen days without a look. This is how a referrer learns not to bother." },
  { id: "rf4", candidate: "Imran Shaikh", role: "Picker · nights", team: "Night shift", by: { name: "Manoj Patil", img: "/avatars/user-4.svg", alumni: false }, stage: "Hired", age: 44, idle: 0, note: "Started three weeks ago." },
  { id: "rf5", candidate: "Lakshmi Iyer", role: "QA Engineer", team: "Engineering", by: { name: "Ananya Bose", img: "/avatars/user-5.svg", alumni: true }, stage: "Applied", age: 9, idle: 4 },
  { id: "rf6", candidate: "Deepak Rane", role: "Dispatch Coordinator", team: "Logistics", by: { name: "Ritu Das", img: "/avatars/user-7.svg", alumni: false }, stage: "Not this time", age: 38, idle: 5, note: "Told, with a reason, the day the decision was made." },
];

export const STAGE_ORDER: ReferralStage[] = ["Applied", "In interview", "Offer", "Hired", "Not this time"];

export const referralStats = {
  open: referrals.filter((r) => r.stage !== "Hired" && r.stage !== "Not this time").length,
  hired: referrals.filter((r) => r.stage === "Hired").length,
  fromAlumni: referrals.filter((r) => r.by.alumni).length,
  /** referrals sitting untouched for more than two weeks */
  stalled: referrals.filter((r) => r.idle > 14 && r.stage !== "Hired" && r.stage !== "Not this time").length,
  /** share of hires last year that came from a referral */
  shareOfHires: 18,
};
