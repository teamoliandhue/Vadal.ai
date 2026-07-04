/**
 * Settings module data (route /product/settings).
 * The admin/configuration surface: workspace, client branding & white-label,
 * roles & permissions, members, integrations (with the "full / selective / off"
 * model from the client call), notifications, data & privacy, and AI guardrails.
 * Seeded/demo data — reuses org + people from lib/data.ts where it makes sense.
 */

export const workspace = {
  name: "oliandhue",
  legalName: "Oli & Hue Pvt. Ltd.",
  subdomain: "oliandhue",
  logo: "/brand/oliandhue-icon.svg",
  plan: "Enterprise",
  seats: 12480,
  seatsUsed: 11840,
  timezone: "Asia/Kolkata (GMT+5:30)",
  locale: "English (India)",
  contact: "priya@oliandhue.com",
  founded: "2019",
};

/** Brand-color swatches offered in the branding picker. */
export const brandSwatches = ["#5D63E1", "#7C5CF8", "#0EA5E9", "#12B981", "#F59E0B", "#EF4444", "#EC4899", "#0F172A"];

/** Roles/actors, aligned to the client call: employee · manager · admin · super-admin. */
export const roles = ["Employee", "Manager", "Admin", "Super admin"] as const;
export type Role = (typeof roles)[number];

/** Capability → which roles hold it (drives the permissions matrix). */
export const capabilities: { label: string; group: string; roles: Role[] }[] = [
  { label: "View own workspace & feed", group: "Everyone", roles: ["Employee", "Manager", "Admin", "Super admin"] },
  { label: "Give recognition & post", group: "Everyone", roles: ["Employee", "Manager", "Admin", "Super admin"] },
  { label: "Respond to surveys", group: "Everyone", roles: ["Employee", "Manager", "Admin", "Super admin"] },
  { label: "See team analytics", group: "Manager", roles: ["Manager", "Admin", "Super admin"] },
  { label: "Approve leave & actions", group: "Manager", roles: ["Manager", "Admin", "Super admin"] },
  { label: "Launch surveys & campaigns", group: "Manager", roles: ["Manager", "Admin", "Super admin"] },
  { label: "See org-wide analytics", group: "Admin", roles: ["Admin", "Super admin"] },
  { label: "Manage members & roles", group: "Admin", roles: ["Admin", "Super admin"] },
  { label: "Configure branding & features", group: "Admin", roles: ["Admin", "Super admin"] },
  { label: "Manage integrations", group: "Admin", roles: ["Admin", "Super admin"] },
  { label: "Billing & data controls", group: "Super admin", roles: ["Super admin"] },
  { label: "Create client workspaces", group: "Super admin", roles: ["Super admin"] },
];

export type Member = { name: string; email: string; role: Role; team: string; img: string; status: "active" | "invited" };
export const members: Member[] = [
  { name: "Priya Sharma", email: "priya@oliandhue.com", role: "Admin", team: "Design", img: "/avatars/user-8.svg", status: "active" },
  { name: "Pradeep Kumar", email: "pradeep@oliandhue.com", role: "Super admin", team: "Leadership", img: "/avatars/user-6.svg", status: "active" },
  { name: "Anita Desai", email: "anita@oliandhue.com", role: "Manager", team: "Design", img: "/avatars/user-5.svg", status: "active" },
  { name: "Rahul Verma", email: "rahul@oliandhue.com", role: "Manager", team: "Sales · West", img: "/avatars/user-1.svg", status: "active" },
  { name: "Aarav Sharma", email: "aarav@oliandhue.com", role: "Employee", team: "Engineering", img: "/avatars/user-2.svg", status: "active" },
  { name: "Dev Patel", email: "dev@oliandhue.com", role: "Employee", team: "Design", img: "/avatars/user-3.svg", status: "invited" },
];

export type IntegrationMode = "Full" | "Selective" | "Off";
export type Integration = {
  key: string;
  name: string;
  desc: string;
  category: "HR & Payroll" | "Productivity" | "Wellbeing & hooks" | "Identity";
  emoji: string;
  connected: boolean;
  /** The client-call model: full data sync, selective/labelled, or disabled. */
  mode?: IntegrationMode;
};

export const integrations: Integration[] = [
  { key: "razorpayx", name: "RazorpayX Payroll", desc: "Attendance, payroll & leave balances.", category: "HR & Payroll", emoji: "💸", connected: true, mode: "Selective" },
  { key: "darwinbox", name: "Darwinbox HRIS", desc: "Core HR records & org structure.", category: "HR & Payroll", emoji: "🗂️", connected: false, mode: "Off" },
  { key: "gcal", name: "Google Calendar", desc: "Meetings & 1:1s surfaced on Home.", category: "Productivity", emoji: "📅", connected: true, mode: "Full" },
  { key: "slack", name: "Slack", desc: "Recognition & nudges pushed to channels.", category: "Productivity", emoji: "💬", connected: true, mode: "Full" },
  { key: "teams", name: "Microsoft Teams", desc: "Feed & notifications inside Teams.", category: "Productivity", emoji: "🟣", connected: false, mode: "Off" },
  { key: "fitbit", name: "Fitbit / Health", desc: "Opt-in wellbeing hook & streaks.", category: "Wellbeing & hooks", emoji: "⌚", connected: false, mode: "Off" },
  { key: "mygate", name: "MyGate Visitor", desc: "Visitor / guest management hook.", category: "Wellbeing & hooks", emoji: "🚪", connected: false, mode: "Off" },
  { key: "okta", name: "Okta SSO", desc: "SAML single sign-on & provisioning.", category: "Identity", emoji: "🔐", connected: true, mode: "Full" },
];

export type NotifChannel = { key: string; label: string; inApp: boolean; email: boolean; push: boolean };
export const notifCategories: NotifChannel[] = [
  { key: "recognition", label: "Recognition & kudos", inApp: true, email: true, push: true },
  { key: "mentions", label: "Mentions & comments", inApp: true, email: false, push: true },
  { key: "surveys", label: "Surveys & pulses", inApp: true, email: true, push: false },
  { key: "manager", label: "Manager actions & 1:1s", inApp: true, email: true, push: true },
  { key: "celebrations", label: "Birthdays & milestones", inApp: true, email: false, push: false },
  { key: "summary", label: "Weekly summary", inApp: false, email: true, push: false },
];

export const aiDefaults = {
  enabled: true,
  scopeToWorkspace: true, // "keep the whole context on the company side" — call note
  sentiment: true,
  monthlyBudget: 5, // million tokens
  perUserDailyCap: 40, // requests
};

export const privacyDefaults = {
  anonymityThreshold: 5, // min responses before a slice is shown
  retentionMonths: 24,
  regionLock: "India (Mumbai)",
};
