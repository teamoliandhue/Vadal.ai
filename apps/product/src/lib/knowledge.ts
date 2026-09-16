/**
 * Knowledge module data (route /product/knowledge).
 * The company brain: a searchable policy/HR library, an AI answer experience
 * that cites its sources, and AI-detected knowledge gaps from real questions.
 * Seeded/demo data — usage figures align with `knowledge`/`aiUsage` in lib/data.ts.
 */

export type Collection = { key: string; label: string; emoji: string; count: number };
export const collections: Collection[] = [
  { key: "leave", label: "Leave & time-off", emoji: "🌴", count: 8 },
  { key: "pay", label: "Payroll & benefits", emoji: "💰", count: 11 },
  { key: "policies", label: "Policies", emoji: "📋", count: 14 },
  { key: "it", label: "IT & tools", emoji: "💻", count: 9 },
  { key: "onboarding", label: "Onboarding", emoji: "🚀", count: 6 },
  { key: "wellbeing", label: "Wellbeing", emoji: "💙", count: 5 },
];

export type Section = { heading?: string; text?: string; bullets?: string[] };
export type Article = {
  id: string;
  title: string;
  collection: string;
  excerpt: string;
  updated: string;
  /** Months since the last edit. `updated` is prose; staleness needs a number. */
  updatedMonthsAgo: number;
  readMins: number;
  views: number;
  sections: Section[];
};

export const articles: Article[] = [
  {
    id: "leave-policy", title: "Leave policy & balances", collection: "leave",
    excerpt: "How many days you get, how to apply, and how carry-forward works.",
    updated: "Updated 3 weeks ago", updatedMonthsAgo: 1, readMins: 3, views: 4120,
    sections: [
      { text: "Every full-time employee gets 18 paid leaves a year, accruing at 1.5 days per month. Sick leave (12/year) and casual leave are tracked separately." },
      { heading: "Applying", text: "Apply from Home → Apply for leave, or just ask Vadal. Requests route to your manager for approval and reflect in your balance instantly." },
      { heading: "Carry-forward", bullets: ["Up to 6 unused paid leaves carry to the next year.", "Anything above 6 lapses on 31 December.", "Sick leave does not carry forward."] },
    ],
  },
  {
    id: "wfh", title: "Work-from-home guidelines", collection: "policies",
    excerpt: "Hybrid expectations, no-meeting days, and how to request full remote.",
    updated: "Updated 1 month ago", updatedMonthsAgo: 1, readMins: 2, views: 2240,
    sections: [
      { text: "We're hybrid: 3 days in-office (Tue–Thu), 2 flexible. Wednesdays are no-meeting days across the company." },
      { heading: "Full remote", text: "Request full-remote for a defined period via your manager; it's approved case-by-case based on role and team norms." },
    ],
  },
  {
    id: "reimburse", title: "Reimbursement process", collection: "pay",
    excerpt: "How to claim expenses, limits, and typical turnaround.",
    updated: "Updated 2 weeks ago", updatedMonthsAgo: 1, readMins: 2, views: 2860,
    sections: [
      { text: "Submit expenses within 30 days of spend with a receipt. Claims under ₹5,000 are auto-approved; above that needs manager sign-off." },
      { heading: "Turnaround", text: "Approved claims are paid with the next payroll run, typically within 7–10 working days." },
    ],
  },
  {
    id: "appraisal", title: "Appraisal cycle & timeline", collection: "policies",
    excerpt: "When reviews happen, how ratings work, and what to prepare.",
    updated: "Updated 5 days ago", updatedMonthsAgo: 0, readMins: 4, views: 1980,
    sections: [
      { text: "Appraisals run twice a year — a light mid-year check-in (June) and a full cycle (December) covering ratings, feedback and compensation." },
      { heading: "What to prepare", bullets: ["A short self-review of your goals and wins.", "Peer-feedback nominations (3–5 people).", "Any growth asks for the next cycle."] },
    ],
  },
  {
    id: "payslip", title: "Reading your payslip", collection: "pay",
    excerpt: "Understand earnings, deductions, and tax components.",
    updated: "Updated 2 months ago", updatedMonthsAgo: 2, readMins: 3, views: 1540,
    sections: [{ text: "Your payslip breaks into earnings (basic, HRA, allowances) and deductions (PF, professional tax, TDS). Download the PDF from Payroll → Payslips." }],
  },
  {
    id: "insurance", title: "Health insurance & claims", collection: "pay",
    excerpt: "Coverage, dependants, and how to raise a cashless or reimbursement claim.",
    updated: "Updated 3 weeks ago", updatedMonthsAgo: 1, readMins: 4, views: 2010,
    sections: [
      { text: "You and your dependants are covered up to ₹5L (family floater). Cashless works at network hospitals with your e-card." },
      { heading: "Claims", text: "For non-network care, pay and claim reimbursement within 15 days with bills. The People team can help if a claim is rejected." },
    ],
  },
  {
    id: "laptop", title: "Getting your laptop & tools", collection: "it",
    excerpt: "Device provisioning, software access, and support.",
    updated: "Updated 1 month ago", updatedMonthsAgo: 1, readMins: 2, views: 1120,
    sections: [{ text: "IT ships your laptop before day one. Access to core tools is provisioned via SSO — raise anything missing in #it-help or the IT portal." }],
  },
  {
    id: "onboarding-week1", title: "Your first week", collection: "onboarding",
    excerpt: "What to expect, who to meet, and your buddy.",
    updated: "Updated 2 weeks ago", updatedMonthsAgo: 1, readMins: 3, views: 890,
    sections: [
      { text: "Week one is about people and context, not output. You'll get a buddy, meet your team, and set up accounts." },
      { heading: "Checklist", bullets: ["Complete your profile and payroll details.", "Meet your buddy and manager 1:1.", "Skim the team's working agreements."] },
    ],
  },
  {
    id: "eap", title: "Wellbeing & EAP support", collection: "wellbeing",
    excerpt: "Confidential counselling, mental-health days, and resources.",
    updated: "Updated 1 month ago", updatedMonthsAgo: 1, readMins: 2, views: 760,
    sections: [{ text: "Our EAP offers free, confidential counselling (24/7 helpline). You also get 4 mental-health days a year, no questions asked — book them like any leave." }],
  },
  {
    id: "relocation", title: "Relocation policy", collection: "policies",
    excerpt: "Support when you move city for a role — allowances, notice and what is covered.",
    updated: "Updated 2 years ago", updatedMonthsAgo: 26, readMins: 3, views: 310,
    sections: [
      { text: "If you move city at the company's request, relocation support is agreed with your manager and People before you accept." },
      { heading: "What is covered", bullets: [
        "One-way travel for you and immediate family",
        "Packing and transport of household goods",
        "Up to 30 days of temporary accommodation",
      ] },
      { heading: "Notice", text: "Give at least six weeks' notice of the move date so the allowance can be arranged with payroll." },
    ],
  },
];

/** Canned AI answers keyed by trigger words; sources are article ids. */
export type Answer = { keywords: string[]; answer: string; sources: string[] };
export const answers: Answer[] = [
  { keywords: ["leave", "paid leave", "how many days", "holiday", "vacation", "pto", "time off"], sources: ["leave-policy"],
    answer: "You get **18 paid leaves a year**, accruing 1.5 days a month, plus 12 sick days tracked separately. Apply from Home → Apply for leave (or just ask me) and it routes to your manager. Up to 6 unused paid leaves carry into next year — the rest lapse on 31 December." },
  { keywords: ["reimburse", "expense", "claim expense", "spend"], sources: ["reimburse"],
    answer: "Submit expenses **within 30 days** with a receipt. Anything under ₹5,000 is auto-approved; above that needs manager sign-off. Approved claims are paid with the next payroll run, usually in 7–10 working days." },
  { keywords: ["wfh", "work from home", "remote", "hybrid", "office days"], sources: ["wfh"],
    answer: "We're **hybrid** — 3 days in-office (Tue–Thu) and 2 flexible, with **no-meeting Wednesdays**. Full-remote for a set period is approved case-by-case through your manager." },
  { keywords: ["appraisal", "review", "promotion", "rating", "performance"], sources: ["appraisal"],
    answer: "Appraisals run **twice a year** — a light mid-year check-in in June and a full cycle in December covering ratings, feedback and compensation. Come with a short self-review, 3–5 peer-feedback nominations, and your growth asks." },
  { keywords: ["insurance", "health", "medical", "hospital", "mediclaim"], sources: ["insurance"],
    answer: "You and your dependants are covered up to **₹5L (family floater)**. Cashless works at network hospitals with your e-card; otherwise pay and claim reimbursement within 15 days. The People team can help with rejected claims." },
  { keywords: ["laptop", "equipment", "device", "software", "access", "tools"], sources: ["laptop"],
    answer: "IT ships your **laptop before day one** and provisions core tools via SSO. Anything missing? Raise it in #it-help or the IT portal and they'll sort access quickly." },
  { keywords: ["wellbeing", "counselling", "mental health", "eap", "stress", "therapy"], sources: ["eap"],
    answer: "Our **EAP** gives you free, confidential counselling via a 24/7 helpline, plus **4 mental-health days a year** — book them like any other leave, no questions asked." },
];

export const suggestedQuestions = [
  "How many paid leaves do I have?",
  "How do I claim reimbursement?",
  "When is the appraisal cycle?",
  "What's the work-from-home policy?",
];

/** Most-asked questions surfaced on the hub. */
export const popular = [
  { q: "Leave policy", n: 412, id: "leave-policy" },
  { q: "Reimbursement process", n: 286, id: "reimburse" },
  { q: "WFH guidelines", n: 224, id: "wfh" },
  { q: "Appraisal cycle", n: 198, id: "appraisal" },
  { q: "Health insurance claims", n: 164, id: "insurance" },
];

/** AI-detected gaps — real questions the library can't answer well. */
export const gaps = [
  { q: "How long is paternity / parental leave?", asks: 38, reason: "No document exists" },
  { q: "What's the relocation policy?", asks: 24, reason: "Doc is 2 years out of date", articleId: "relocation" },
  { q: "How does ESOP / equity vesting work?", asks: 31, reason: "No document exists" },
];

/* ── freshness ─────────────────────────────────────────────────────
   The gaps card told the PEOPLE TEAM that the relocation doc was two years out
   of date. The person actually reading that doc was told "Updated 2 years ago"
   in 12px grey and left to draw their own conclusion — on a policy page, where
   acting on stale guidance has consequences. The warning belongs where the
   reading happens, not only on the dashboard about it. */

export const STALE_AFTER_MONTHS = 12;

export function isStale(a: { updatedMonthsAgo: number }): boolean {
  return a.updatedMonthsAgo >= STALE_AFTER_MONTHS;
}

/* ── when the answer is wrong ──────────────────────────────────────
   A thumbs-down on a knowledge base is the most valuable signal it can get, and
   it was a toast saying "logged". Nothing was logged, and "wrong" is four
   different problems with four different fixes — which one it is, is the whole
   content of the report. */

export const CORRECTION_REASONS = [
  { key: "outdated", label: "It's out of date", hint: "This changed and the article hasn't caught up" },
  { key: "incomplete", label: "It didn't answer my question", hint: "The answer is about something adjacent" },
  { key: "contradicts", label: "It contradicts what I was told", hint: "A manager or HR told me something different" },
  { key: "unclear", label: "I couldn't follow it", hint: "The wording or the steps are confusing" },
] as const;

export type CorrectionReason = (typeof CORRECTION_REASONS)[number]["key"];

/**
 * Who to ask when the base genuinely cannot help.
 *
 * The fallback copy already promised "I've logged the question so the People
 * team can add it" and then left the person with nothing to do. A knowledge
 * base that cannot answer should hand you to someone who can, exactly as the
 * support pillar does.
 */
export const whoToAsk = [
  { label: "Your manager", detail: "Anything about your own role, workload or team", href: "/product/home" },
  { label: "The People team", detail: "Pay, leave, policy and anything contractual", href: "/product/cases" },
  { label: "One-to-One Help", detail: "If it is personal, and you would rather it stayed private", href: "/product/help" },
];

export const usage = { questions: "6,240", resolved: 78, views: "18.4K", searchSuccess: 84 };

/** Simple matcher for the ask box — returns a canned answer or a fallback. */
export function findAnswer(query: string): { answer: string; sources: string[]; matched: boolean } {
  const q = query.toLowerCase();
  const hit = answers.find((a) => a.keywords.some((k) => q.includes(k)));
  if (hit) return { answer: hit.answer, sources: hit.sources, matched: true };
  // fallback: pick articles whose title/excerpt shares a word with the query
  const words = q.split(/\s+/).filter((w) => w.length > 3);
  const related = articles.filter((a) => words.some((w) => (a.title + " " + a.excerpt).toLowerCase().includes(w))).slice(0, 2);
  if (related.length) return { answer: "I couldn't find a single exact answer, but these articles look closest. Open one, or rephrase and I'll try again.", sources: related.map((a) => a.id), matched: false };
  return { answer: "I don't have a confident answer for that yet — it may be a gap in the knowledge base. I've logged the question so the People team can add it.", sources: [], matched: false };
}
