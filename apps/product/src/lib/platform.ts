/**
 * Link · Trust · Launch — the platform surfaces (roadmap v3).
 *
 * The founders' module names (spec 022): Link = Enterprise Integrations,
 * Trust = Security & Compliance, Launch = Implementation & Customer Success.
 * All three are for admins. Seeded for the demo tenant, which went live in
 * August 2025 and is now expanding to night shift and logistics.
 */

/* ── Link ────────────────────────────────────────────────────── */

export type LinkStatus = "connected" | "attention" | "available";
export type Direction = "in" | "out" | "both";
export type SyncRun = { when: string; ok: boolean; summary: string };

export type Integration = {
  id: string;
  name: string;
  emoji: string;
  category: "People data" | "Sign-in" | "Messaging" | "Calendar" | "Rewards" | "Data out";
  status: LinkStatus;
  direction: Direction;
  /** One line on what it's for in Vadal. */
  purpose: string;
  lastSync?: string;
  schedule?: string;
  /** What Vadal reads or sends. */
  shares: string[];
  /** What it never touches — the line a security review asks for first. */
  never?: string[];
  runs?: SyncRun[];
  issue?: string;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "darwinbox", name: "Darwinbox", emoji: "🗂️", category: "People data", status: "attention", direction: "in",
    purpose: "Who works here, their team, manager, site and start date — the org chart every other screen uses.",
    lastSync: "Today 07:10", schedule: "Nightly at 07:00 IST",
    shares: ["Name and work email", "Phone number (frontline sign-in)", "Team, manager and site", "Job title", "Start date and leaving date"],
    never: ["Salary or bank details", "Performance ratings", "Health or leave reasons", "Government IDs"],
    runs: [
      { when: "Today 07:10", ok: false, summary: "12,480 read · 14 changed · 2 joiners · 38 without a manager" },
      { when: "Yesterday 07:08", ok: true, summary: "12,478 read · 9 changed · 1 leaver" },
      { when: "Tue 07:09", ok: true, summary: "12,479 read · 22 changed · 3 joiners" },
      { when: "Mon 07:12", ok: true, summary: "12,476 read · 6 changed" },
    ],
    issue: "38 people have no manager in Darwinbox",
  },
  {
    id: "entra", name: "Microsoft Entra ID", emoji: "🔐", category: "Sign-in", status: "connected", direction: "both",
    purpose: "Single sign-on for desk teams, and SCIM so leavers lose access the day they leave.",
    lastSync: "Today 09:42", schedule: "SCIM, as changes happen",
    shares: ["Sign-in (SAML)", "Account created or removed (SCIM)", "Group membership for admin roles"],
    never: ["Passwords", "Mailbox content"],
    runs: [
      { when: "Today 09:42", ok: true, summary: "1 account removed (leaver)" },
      { when: "Today 08:15", ok: true, summary: "2 accounts created (joiners)" },
    ],
  },
  {
    id: "whatsapp", name: "WhatsApp Business", emoji: "💬", category: "Messaging", status: "attention", direction: "out",
    purpose: "Pulses, campaigns and sign-in codes for people without a work email.",
    lastSync: "Today 11:30", schedule: "As messages send",
    shares: ["Approved message templates", "One-time sign-in codes", "A link back into Vadal"],
    never: ["Survey answers", "Anything a person posts"],
    issue: "Template “pulse_reminder_hi” is waiting for Meta approval",
  },
  {
    id: "teams", name: "Microsoft Teams", emoji: "🟪", category: "Messaging", status: "connected", direction: "both",
    purpose: "Notifications and Nudge inside Teams for desk teams.",
    lastSync: "Today 11:52", schedule: "Live",
    shares: ["Notifications you've switched on", "Questions asked to Nudge from Teams"],
    never: ["Teams chats or channels"],
  },
  {
    id: "sms", name: "SMS gateway", emoji: "📱", category: "Messaging", status: "connected", direction: "out",
    purpose: "The fallback when a phone has no WhatsApp.",
    lastSync: "Today 10:05", schedule: "As messages send",
    shares: ["Short reminders with a link", "One-time sign-in codes"],
  },
  {
    id: "outlook", name: "Outlook calendar", emoji: "📅", category: "Calendar", status: "connected", direction: "in",
    purpose: "Meetings and 1:1s for My day and Up next.",
    lastSync: "Today 11:58", schedule: "Every 15 minutes",
    shares: ["Your own event titles and times"],
    never: ["Event descriptions or attachments", "Other people's calendars"],
  },
  {
    id: "advantage", name: "Rewards partner", emoji: "🎁", category: "Rewards", status: "connected", direction: "both",
    purpose: "The rewards catalogue in, redemptions out — fulfilment stays with the partner.",
    lastSync: "Today 06:00", schedule: "Catalogue daily · redemptions live",
    shares: ["Catalogue and stock", "Redemption: item, points, delivery address you enter"],
    never: ["Kudos messages", "Anything outside a redemption"],
  },
  {
    id: "slack", name: "Slack", emoji: "💼", category: "Messaging", status: "available", direction: "both",
    purpose: "Notifications and Nudge inside Slack, for teams that use it instead of Teams.",
    shares: ["Notifications you switch on", "Questions asked to Nudge from Slack"],
  },
  {
    id: "workday", name: "Workday", emoji: "🗂️", category: "People data", status: "available", direction: "in",
    purpose: "An alternative people-data source, for groups on Workday.",
    shares: ["The same fields as Darwinbox"],
  },
  {
    id: "powerbi", name: "Power BI", emoji: "📊", category: "Data out", status: "available", direction: "out",
    purpose: "Engagement and adoption figures in your own dashboards.",
    shares: ["Aggregates only, never below the anonymity threshold"],
    never: ["Individual answers", "Names next to scores"],
  },
];

export const LINK_ISSUES = [
  { id: "no-manager", tone: "warning" as const, title: "38 people have no manager in Darwinbox", why: "They don't appear in any manager's team view, and team-scoped pulses skip them. Fix it in Darwinbox and the next nightly sync picks it up.", action: "Open Darwinbox" },
  { id: "template", tone: "warning" as const, title: "A Hindi WhatsApp template is waiting for approval", why: "Night shift reminders go out in English until Meta approves “pulse_reminder_hi”. Approval usually takes a day or two.", action: "Open WhatsApp Business" },
  { id: "no-email", tone: "info" as const, title: "212 frontline people have no work email", why: "They sign in with a one-time code on WhatsApp or SMS. Nothing to fix unless they should have email.", action: "Open Darwinbox" },
];

export const API_KEYS = [
  { name: "Power BI export", scope: "Aggregates · read only", created: "Mar 2026", lastUsed: "2 days ago", last4: "9f2c" },
  { name: "Intranet news widget", scope: "Published posts · read only", created: "Nov 2025", lastUsed: "Today", last4: "41ab" },
];

export const WEBHOOKS = [
  { event: "leaver.recorded", target: "Exit interviews programme", status: "Delivering" },
  { event: "case.created", target: "https://servicedesk.oliandhue.com/hooks/vadal", status: "Delivering" },
];

/* ── Trust ───────────────────────────────────────────────────── */

export const POSTURE = [
  { label: "Where data lives", value: "India (Mumbai)", note: "Backups stay in the same region" },
  { label: "Sign-in", value: "SSO + one-time codes", note: "SSO for desk teams · codes for frontline" },
  { label: "Anonymity threshold", value: "5 people", note: "No slice shown below it, anywhere" },
  { label: "Retention", value: "24 months", note: "Then deleted, unless a case is open" },
];

export type Framework = { name: string; status: "Controls built" | "Audit planned"; what: string[] };
export const FRAMEWORKS: Framework[] = [
  { name: "India DPDP Act, 2023", status: "Controls built", what: ["Consent is a clear yes and can be withdrawn", "Export and deletion on request", "Data kept in India"] },
  { name: "GDPR", status: "Controls built", what: ["The same controls, for employees in the EU", "A record of every data request"] },
  { name: "SOC 2 Type II", status: "Audit planned", what: ["Controls mapped", "Auditor to be appointed"] },
  { name: "ISO/IEC 27001", status: "Audit planned", what: ["Controls mapped", "Certification body to be appointed"] },
];

export type AuditEvent = { id: string; when: string; who: string; kind: "Access" | "Data" | "Settings" | "AI" | "Moderation"; what: string };
export const AUDIT_LOG: AuditEvent[] = [
  { id: "a1", when: "Today 11:40", who: "Priya Sharma", kind: "Settings", what: "Turned on the Translation add-on" },
  { id: "a2", when: "Today 10:12", who: "Priya Sharma", kind: "Access", what: "Viewed the product as an employee" },
  { id: "a3", when: "Today 09:42", who: "Microsoft Entra ID", kind: "Access", what: "Removed access for a leaver (SCIM)" },
  { id: "a4", when: "Today 08:55", who: "Anita Desai", kind: "Moderation", what: "Approved a held post in Design community" },
  { id: "a5", when: "Yesterday 17:20", who: "Pradeep Kumar", kind: "Data", what: "Exported September pulse results (aggregates)" },
  { id: "a6", when: "Yesterday 15:02", who: "Nudge", kind: "AI", what: "Declined a question about an individual's survey answers" },
  { id: "a7", when: "Yesterday 12:30", who: "Priya Sharma", kind: "Data", what: "Changed rehire eligibility for one leaver" },
  { id: "a8", when: "Tue 16:45", who: "Priya Sharma", kind: "Settings", what: "Changed who can post in communities" },
  { id: "a9", when: "Tue 10:10", who: "Pradeep Kumar", kind: "Access", what: "Made Sunita Rao a manager" },
  { id: "a10", when: "Mon 14:22", who: "Priya Sharma", kind: "Data", what: "Completed a data export request" },
];

export type DataRequest = { id: string; who: string; kind: "Access" | "Correction" | "Deletion"; received: string; daysLeft: number; status: "Open" | "Done" };
export const DATA_REQUESTS: DataRequest[] = [
  { id: "r1", who: "Farhan Ali (left Jul 2026)", kind: "Deletion", received: "12 Sep", daysLeft: 25, status: "Open" },
  { id: "r2", who: "Aarav Sharma", kind: "Access", received: "15 Sep", daysLeft: 28, status: "Open" },
  { id: "r3", who: "Kavya Reddy", kind: "Correction", received: "2 Sep", daysLeft: 0, status: "Done" },
];
export const REQUEST_SLA_DAYS = 30;

/** What the AI in Vadal is held to — each one enforced somewhere in the product. */
export const AI_SAFEGUARDS = [
  { rule: "Answers only from this workspace", where: "Settings → AI & guardrails" },
  { rule: "Never shows sentiment below the anonymity threshold", where: "Insight · Sentiment" },
  { rule: "Nothing posts publicly without a person's tap", where: "Amplify" },
  { rule: "A generated safety course needs a named reviewer to publish", where: "iLearn" },
  { rule: "Wellbeing consent is only ever a clear yes", where: "iThrive · Onboard" },
];

/* ── Launch ──────────────────────────────────────────────────── */

export type StepStatus = "done" | "doing" | "next" | "blocked";
export type LaunchStep = { title: string; owner: "Vadal" | "Your IT" | "People team" | "Managers"; status: StepStatus; note?: string };
export type LaunchPhase = { id: string; name: string; when: string; goal: string; steps: LaunchStep[] };

export const LAUNCH_PHASES: LaunchPhase[] = [
  {
    id: "setup", name: "Set up", when: "Jul 2025", goal: "Sign-in, the org chart and the look of it",
    steps: [
      { title: "SSO and SCIM with Entra ID", owner: "Your IT", status: "done" },
      { title: "Nightly Darwinbox sync", owner: "Vadal", status: "done" },
      { title: "Branding, admins and posting rules", owner: "People team", status: "done" },
    ],
  },
  {
    id: "pilot", name: "Pilot", when: "Aug – Sep 2025", goal: "Two sites, 800 people, one pulse",
    steps: [
      { title: "Pune office and Line 2 live", owner: "People team", status: "done" },
      { title: "First pulse — 74% answered", owner: "People team", status: "done" },
      { title: "Pilot review and go decision", owner: "Vadal", status: "done" },
    ],
  },
  {
    id: "rollout", name: "Roll out", when: "Oct – Dec 2025", goal: "Every desk team, and Plant Ops on shared devices",
    steps: [
      { title: "All desk teams invited", owner: "People team", status: "done" },
      { title: "Shared devices on the Plant Ops floor", owner: "Your IT", status: "done" },
      { title: "18 manager training sessions", owner: "Vadal", status: "done" },
    ],
  },
  {
    id: "adopt", name: "Adopt", when: "Jan – Jun 2026", goal: "From opened to used every week",
    steps: [
      { title: "Kudos and points switched on", owner: "People team", status: "done" },
      { title: "Lifecycle programmes running", owner: "People team", status: "done" },
      { title: "Quarterly business reviews", owner: "Vadal", status: "done" },
    ],
  },
  {
    id: "expand", name: "Expand", when: "Jul – Oct 2026", goal: "Night shift and Logistics, in their language",
    steps: [
      { title: "Night shift and Logistics on WhatsApp", owner: "People team", status: "doing", note: "1,960 of 2,640 invited" },
      { title: "Hindi WhatsApp templates approved", owner: "Vadal", status: "blocked", note: "Waiting on Meta" },
      { title: "Night shift managers trained", owner: "Managers", status: "doing", note: "9 of 14" },
      { title: "Hindi reviewed by a native speaker", owner: "People team", status: "next", note: "First 100 translations" },
      { title: "Onboard and Alumni switched on", owner: "People team", status: "done" },
    ],
  },
];

export const LAUNCH_MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export const SUCCESS = {
  manager: { name: "Rohit Menon", role: "Customer success, Vadal", img: "/avatars/user-6.svg" },
  nextReview: "Thu 8 Oct · quarterly business review",
  requests: [
    { title: "Hindi template for pulse reminders", status: "With Meta", opened: "10 Sep" },
    { title: "Add Logistics depots as sites", status: "In progress", opened: "4 Sep" },
    { title: "Power BI export for leadership pack", status: "Done", opened: "20 Aug" },
  ],
  sessions: [
    { title: "Night shift managers — using Pulse results", when: "Tue 22 Sep, 22:30", seats: "5 of 12 booked" },
    { title: "People team — Onboard and Alumni", when: "Thu 24 Sep, 15:00", seats: "8 of 10 booked" },
  ],
};
