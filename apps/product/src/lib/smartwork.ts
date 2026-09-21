/* SmartWork — the HR desk (Digital workplace, spec 051).

   The module the platform means by "SmartWork": HR Queries · Automated
   Resolution · Smart Escalation · Policy Answers. Not a wellbeing companion —
   that pillar kept its own home at /product/support.

   Three ideas the data has to carry, because they are what makes a help desk
   worth opening rather than emailing someone:

   · An answer is only trustworthy if it says where it came from. Every answer
     cites the policy it was read from and how old that policy is, and a stale
     document says so where it is read, not on someone's dashboard.
   · Most of what people ask for is not a question at all — it is a task
     ("send me my payslip", "I need a letter for my visa"). Those are done on
     the spot, with a receipt, and never become a ticket.
   · What cannot be answered goes to a person WITH the conversation attached,
     so nobody has to tell the story twice. That is the whole promise of
     "smart" escalation. */
import { answers, articles, isStale, type Answer } from "./knowledge";

/* ── what the desk can finish by itself ───────────────────────────
   Each one is a real end state — a file, a number, a change — not a form that
   goes into somebody's queue. `takes` is what it costs the person, not us. */
export type InstantAction = {
  id: string;
  label: string;
  hint: string;
  /** what the person ends up holding */
  result: string;
  takes: string;
  icon: "payslip" | "letter" | "leave" | "card" | "address" | "tax";
};

export const instantActions: InstantAction[] = [
  { id: "payslip", label: "Get my payslip", hint: "Any month, last 24", result: "Payslip · Aug 2026 · PDF", takes: "20 seconds", icon: "payslip" },
  { id: "letter", label: "Employment letter", hint: "For a visa, a bank or a landlord", result: "Employment letter · signed PDF", takes: "1 minute", icon: "letter" },
  { id: "leave", label: "Check my leave balance", hint: "Paid, sick and carry-over", result: "11.5 paid · 9 sick · 6 carried over", takes: "instant", icon: "leave" },
  { id: "card", label: "Insurance e-card", hint: "You and your dependants", result: "Mediclaim e-card · ₹5L floater", takes: "instant", icon: "card" },
  { id: "address", label: "Change my address", hint: "Payroll and insurance together", result: "Address updated in payroll and insurance", takes: "1 minute", icon: "address" },
  { id: "tax", label: "Tax declaration", hint: "Regime, proofs and the deadline", result: "Declaration open until 31 Dec", takes: "2 minutes", icon: "tax" },
];

/* ── the questions people actually type ──────────────────────────── */
export const commonQuestions = [
  "How many paid leaves do I have left?",
  "How do I claim back my internet bill?",
  "When does the appraisal cycle start?",
  "What is the work-from-home policy?",
  "How do I add my spouse to insurance?",
];

/* ── answering ────────────────────────────────────────────────────
   The same keyword match Knowledge uses, so the desk and the library can never
   disagree — with the source document, its age, and who is allowed to read it. */
export type Source = { id: string; title: string; updated: string; stale: boolean; restricted: boolean };
export type DeskAnswer = {
  text: string;
  sources: Source[];
  /** an instant action that finishes the job this answer describes */
  action?: InstantAction;
  confident: boolean;
};

const ACTION_FOR: Record<string, string> = {
  "leave-policy": "leave", reimburse: "payslip", insurance: "card", appraisal: "", wfh: "",
};

function score(q: string, a: Answer) {
  const s = q.toLowerCase();
  return a.keywords.reduce((n, k) => (s.includes(k.toLowerCase()) ? n + k.length : n), 0);
}

export function answerFor(q: string): DeskAnswer | null {
  if (q.trim().length < 3) return null;
  const ranked = answers.map((a) => ({ a, n: score(q, a) })).sort((x, y) => y.n - x.n);
  const best = ranked[0];
  if (!best || best.n === 0) return null;
  const sources: Source[] = best.a.sources.map((id) => {
    const art = articles.find((x) => x.id === id);
    return {
      id,
      title: art?.title ?? id,
      updated: art?.updated ?? "unknown",
      stale: art ? isStale(art) : false,
      restricted: Boolean(art?.audience?.length),
    };
  });
  const actionId = ACTION_FOR[best.a.sources[0]] ?? "";
  return {
    text: best.a.answer,
    sources,
    action: instantActions.find((x) => x.id === actionId),
    confident: best.n >= 6,
  };
}

/* ── what happens to a question ───────────────────────────────────
   "answered" is the desk's own answer, accepted by the person. "done" is a task
   it finished. "escalated" is a case with a person's name on it — and the
   conversation goes with it. */
export type RequestKind = "answered" | "done" | "escalated";
export type RequestStatus = "With HR" | "In progress" | "Resolved";
export type DeskRequest = {
  id: string;
  kind: RequestKind;
  question: string;
  /** the answer given, or what was produced */
  outcome: string;
  when: string;
  /** escalations only */
  caseId?: string;
  owner?: { name: string; img: string };
  status?: RequestStatus;
  dueInDays?: number;
  seenBy?: string;
};

export const seedRequests: DeskRequest[] = [
  {
    id: "r-1", kind: "escalated", question: "My August payslip shows the old HRA — I moved in June.",
    outcome: "Payroll is checking the arrears. Your conversation went with it, so you will not be asked again.",
    when: "2 days ago", caseId: "CASE-204", owner: { name: "Meera Pillai", img: "/avatars/user-7.svg" },
    status: "In progress", dueInDays: 1, seenBy: "Payroll",
  },
  {
    id: "r-2", kind: "done", question: "Employment letter for my visa appointment",
    outcome: "Employment letter · signed PDF · downloaded", when: "last week",
  },
  {
    id: "r-3", kind: "answered", question: "How many paid leaves carry into next year?",
    outcome: "Up to 6 unused paid leaves carry over; the rest lapse on 31 December.", when: "3 weeks ago",
  },
];

/* ── the desk, for the People team ────────────────────────────────
   Resolution rate is the number this module lives or dies by: the share of
   questions that never needed a person. The rest is what to fix next. */
export const desk = {
  asked30d: 1840,
  resolvedByDesk: 1416,       // answered or done without a human
  escalated: 424,
  medianAnswerSeconds: 8,
  medianEscalationDays: 1.4,
  breachedSla: 3,
  byTopic: [
    { topic: "Payroll & payslips", asked: 512, resolved: 78, escalated: 113 },
    { topic: "Leave & attendance", asked: 438, resolved: 91, escalated: 39 },
    { topic: "Insurance & claims", asked: 306, resolved: 64, escalated: 110 },
    { topic: "Appraisal & pay bands", asked: 244, resolved: 41, escalated: 144 },
    { topic: "IT & access", asked: 198, resolved: 83, escalated: 34 },
    { topic: "Policies & letters", asked: 142, resolved: 96, escalated: 6 },
  ],
  /** questions the desk could not answer from any document */
  gaps: [
    { q: "How long is paternity / parental leave?", asks: 38, why: "No document exists" },
    { q: "How does ESOP vesting work after I leave?", asks: 31, why: "No document exists" },
    { q: "What is the relocation allowance this year?", asks: 24, why: "Document is 2 years old" },
  ],
};

export const resolutionRate = Math.round((desk.resolvedByDesk / desk.asked30d) * 100);

/** Policies the desk is answering from that are past their review date. */
export const stalePolicies = articles
  .filter((a) => isStale(a))
  .map((a) => ({ id: a.id, title: a.title, updated: a.updated, months: a.updatedMonthsAgo }));

/* ── escalation ───────────────────────────────────────────────────
   A case in Flow's own shape, so an escalation from here is a case there —
   one queue, not two. */
/** Question → one of Flow's own categories, so escalations file correctly. */
export function caseCategoryFor(q: string) {
  const s = q.toLowerCase();
  if (/salary|payslip|hra|arrear|pay band|appraisal|promotion|increment/.test(s)) return "pay";
  if (/my manager|1:1|my lead/.test(s)) return "manager";
  if (/insurance|mediclaim|hospital|counsell|stress/.test(s)) return "wellbeing";
  if (/role clarity|team change|transfer/.test(s)) return "role";
  /* Anything else is a service request, not a people-risk case. */
  return "request";
}

export function caseTitleFor(q: string) {
  const t = q.trim().replace(/\s+/g, " ");
  return t.length <= 64 ? t : `${t.slice(0, 61)}…`;
}
