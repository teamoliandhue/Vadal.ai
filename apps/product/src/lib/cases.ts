/**
 * Cases module data (route /product/cases · "Operations" group).
 * A confidential tracker for people issues — flight-risk follow-ups, burnout,
 * grievances, pay & growth, and ER cases. Each case has an owner, an SLA, a
 * source (often a Pulse risk), a status pipeline and an activity timeline.
 * Confidential by design: sensitive cases hide the subject. Seeded/demo data,
 * tied to the flight-risk & theme signals in lib/data.ts.
 */

export type CaseStatus = "Open" | "In progress" | "Escalated" | "Resolved";
export type Priority = "Urgent" | "High" | "Medium" | "Low";
export type CaseSource = "Pulse risk" | "Survey" | "Manager flag" | "Manual" | "Whistleblower";

export const statusOrder: CaseStatus[] = ["Open", "In progress", "Escalated", "Resolved"];

/** Case categories → chip emoji + colour. */
export const categories: Record<string, { label: string; emoji: string; color: string }> = {
  flight: { label: "Flight risk", emoji: "🚩", color: "var(--danger)" },
  burnout: { label: "Burnout", emoji: "🌿", color: "var(--warning)" },
  grievance: { label: "Grievance", emoji: "⚖️", color: "var(--purple)" },
  pay: { label: "Pay & growth", emoji: "📈", color: "var(--info)" },
  manager: { label: "Manager", emoji: "🤝", color: "var(--info)" },
  er: { label: "Harassment / ER", emoji: "🔒", color: "var(--danger)" },
  wellbeing: { label: "Wellbeing", emoji: "💙", color: "var(--success)" },
  role: { label: "Role clarity", emoji: "🧭", color: "var(--purple)" },
};

export type Owner = { name: string; role: string; img: string };
const OWN = {
  neha: { name: "Neha Rao", role: "HRBP · Design/Eng", img: "/avatars/user-5.svg" },
  meera: { name: "Meera Pillai", role: "HRBP · Ops", img: "/avatars/user-7.svg" },
  pradeep: { name: "Pradeep Kumar", role: "Head of People", img: "/avatars/user-6.svg" },
  priya: { name: "Priya Sharma", role: "People Partner", img: "/avatars/user-8.svg" },
} as const;

export type TimelineEntry = { when: string; text: string; who?: string };

export type Case = {
  id: string;
  title: string;
  category: string;
  subject: string; // person, or "Confidential"
  team: string;
  confidential: boolean;
  status: CaseStatus;
  priority: Priority;
  owner: Owner;
  source: CaseSource;
  opened: string;
  slaDays: number; // days to SLA; negative = breached
  timeline: TimelineEntry[];
  aiSummary: string;
};

export const cases: Case[] = [
  {
    id: "CASE-118", title: "Flight-risk follow-up", category: "flight", subject: "A. Mehta", team: "Sales · West",
    confidential: false, status: "In progress", priority: "Urgent", owner: OWN.neha, source: "Pulse risk",
    opened: "2 days ago", slaDays: 1,
    timeline: [
      { when: "2d ago", text: "Auto-opened from Pulse — flight-risk 92%, no 1:1 in 6 weeks.", who: "Vadal AI" },
      { when: "1d ago", text: "Assigned to Neha Rao; manager looped in.", who: "System" },
      { when: "4h ago", text: "Manager scheduled a 1:1 for tomorrow.", who: "R. Verma" },
    ],
    aiSummary: "Manager-relationship driver dominates (92% confidence). The scheduled 1:1 addresses the root cause — close after it happens and sentiment recovers.",
  },
  {
    id: "CASE-117", title: "Burnout signal — sustained overload", category: "burnout", subject: "R. Iyer", team: "Engineering",
    confidential: false, status: "Open", priority: "High", owner: OWN.neha, source: "Pulse risk",
    opened: "1 day ago", slaDays: 3,
    timeline: [
      { when: "1d ago", text: "Opened from rising burnout theme — 12 weekend commits flagged.", who: "Vadal AI" },
    ],
    aiSummary: "Workload is the driver, not engagement. Recommend a workload review with the EM before it converts to attrition — this profile matches two past exits.",
  },
  {
    id: "CASE-114", title: "Grievance — appraisal fairness", category: "grievance", subject: "Confidential", team: "Support",
    confidential: true, status: "Escalated", priority: "High", owner: OWN.pradeep, source: "Whistleblower",
    opened: "6 days ago", slaDays: -1,
    timeline: [
      { when: "6d ago", text: "Raised via confidential channel.", who: "Anonymous" },
      { when: "5d ago", text: "Acknowledged; assigned to Head of People.", who: "System" },
      { when: "2d ago", text: "Escalated — needs a fairness review of the cycle.", who: "P. Kumar" },
    ],
    aiSummary: "SLA breached by 1 day. Two similar open-text mentions in the last survey suggest a pattern in Support — consider a wider appraisal-process review.",
  },
  {
    id: "CASE-112", title: "Pay & growth concern", category: "pay", subject: "S. Khan", team: "Support",
    confidential: false, status: "In progress", priority: "Medium", owner: OWN.meera, source: "Survey",
    opened: "5 days ago", slaDays: 4,
    timeline: [
      { when: "5d ago", text: "Flagged twice in open-text; case created.", who: "Vadal AI" },
      { when: "3d ago", text: "Comp band review requested from Finance.", who: "M. Pillai" },
    ],
    aiSummary: "Pay & growth is the stated driver. A transparent band conversation resolves most cases like this — Finance review is the blocker.",
  },
  {
    id: "CASE-110", title: "Manager relationship — team friction", category: "manager", subject: "Plant Ops shift B", team: "Plant Ops",
    confidential: false, status: "Open", priority: "High", owner: OWN.meera, source: "Manager flag",
    opened: "3 days ago", slaDays: 2,
    timeline: [{ when: "3d ago", text: "Flagged by skip-level; multiple reports raised the same manager.", who: "K. Joshi" }],
    aiSummary: "Cluster signal — three reports name the same manager. Treat as a manager-capability case, not individual grievances.",
  },
  {
    id: "CASE-108", title: "Harassment report", category: "er", subject: "Confidential", team: "—",
    confidential: true, status: "Escalated", priority: "Urgent", owner: OWN.pradeep, source: "Whistleblower",
    opened: "8 days ago", slaDays: 0,
    timeline: [
      { when: "8d ago", text: "Reported via confidential ER channel.", who: "Anonymous" },
      { when: "7d ago", text: "Legal + People notified; investigation opened.", who: "System" },
    ],
    aiSummary: "Handled under the ER protocol — restricted visibility. AI analysis is disabled for this case type to protect confidentiality.",
  },
  {
    id: "CASE-103", title: "Wellbeing check-in — night shift", category: "wellbeing", subject: "Night shift", team: "Night shift",
    confidential: false, status: "Resolved", priority: "Low", owner: OWN.meera, source: "Pulse risk",
    opened: "3 weeks ago", slaDays: 0,
    timeline: [
      { when: "3w ago", text: "Opened after low participation + fatigue mentions.", who: "Vadal AI" },
      { when: "1w ago", text: "Shift-timing pilot agreed; case resolved.", who: "M. Pillai" },
    ],
    aiSummary: "Resolved — the shift-timing pilot lifted night-shift participation +9 pts. Worth templatising as a Campaign.",
  },
  {
    id: "CASE-101", title: "Role clarity follow-up", category: "role", subject: "P. Nair", team: "Plant Ops",
    confidential: false, status: "Resolved", priority: "Medium", owner: OWN.priya, source: "Survey",
    opened: "1 month ago", slaDays: 0,
    timeline: [
      { when: "1mo ago", text: "Role-clarity signal from survey.", who: "Vadal AI" },
      { when: "3w ago", text: "Manager redefined scope; goals reset.", who: "Priya S." },
    ],
    aiSummary: "Resolved — sentiment recovered 8 pts after the scope reset. Good example to share with other Plant Ops managers.",
  },
];

export const caseStats = { avgResolutionDays: 4.2 };

/** Untracked Pulse risks that could be opened as cases (the AI banner). */
export const pulseSuggested: { title: string; category: string; subject: string; team: string; priority: Priority }[] = [
  { title: "Flight-risk follow-up", category: "flight", subject: "T. Rao", team: "Sales · North", priority: "High" },
  { title: "Burnout signal", category: "burnout", subject: "Design pod", team: "Design", priority: "Medium" },
  { title: "Manager relationship", category: "manager", subject: "S. Kapoor", team: "Logistics", priority: "Medium" },
];
