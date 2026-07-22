/**
 * Auth & onboarding model (route /auth).
 *
 * The approach (from docs/strategy + the 23 Jun call + auth research):
 * - Multi-tenant and DOMAIN-ANCHORED: every client workspace registers verified
 *   company email domain(s). Sign-in starts with your work email; the domain
 *   routes you to your workspace and its configured method.
 * - COMPANY MAIL ONLY: personal providers (gmail/yahoo/…) are hard-blocked with
 *   a clear message — there is no self-serve tenant creation, every user belongs
 *   to a company workspace, so a work address is a structural requirement.
 * - Passwordless: SSO (Okta/Azure AD/Google Workspace) preferred for enterprise
 *   tenants; 6-digit email OTP as the universal fallback (works for deskless
 *   workers on shared/mobile devices where magic links break). No passwords.
 * - Provisioning: HRMS/SCIM sync or admin invite; unknown people on a verified
 *   domain are JIT-provisioned as Employees pending admin confirmation.
 *
 * Demo implementation: everything is local (no backend). The OTP is shown on
 * screen, the "directory" is seeded, and the session lives in localStorage.
 */

export type Role = "employee" | "manager" | "admin" | "superadmin";

export const ROLE_LABEL: Record<Role, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "HR / Workspace admin",
  superadmin: "Vadal super admin",
};

/** Personal / disposable providers — never accepted (company mail only). */
export const PERSONAL_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.in", "outlook.com", "hotmail.com",
  "live.com", "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com",
  "rediffmail.com", "zoho.com", "mail.com", "gmx.com", "yandex.com",
];

export type Tenant = {
  slug: string;
  name: string;
  logo: string;
  domains: string[];
  /** Which sign-in methods this workspace has configured. */
  sso?: { provider: string };
  otp: boolean;
};

/** Registered client workspaces (demo: one tenant + Vadal itself). */
export const TENANTS: Tenant[] = [
  {
    slug: "oliandhue",
    name: "oliandhue",
    logo: "/brand/oliandhue-icon.svg",
    domains: ["oliandhue.com"],
    sso: { provider: "Okta" },
    otp: true,
  },
  {
    slug: "vadal",
    name: "Vadal (internal)",
    logo: "/brand/signal-mark.svg",
    domains: ["vadal.ai"],
    sso: { provider: "Google Workspace" },
    otp: true,
  },
];

/** Seeded directory — known people and their roles (normally HRMS/SCIM). */
export const DIRECTORY: Record<string, { name: string; role: Role; img: string; team: string }> = {
  "priya@oliandhue.com": { name: "Priya Sharma", role: "admin", img: "/avatars/user-8.svg", team: "People" },
  "anita@oliandhue.com": { name: "Anita Desai", role: "manager", img: "/avatars/user-5.svg", team: "Design" },
  "aarav@oliandhue.com": { name: "Aarav Sharma", role: "employee", img: "/avatars/user-2.svg", team: "Engineering" },
  "pradeep@oliandhue.com": { name: "Pradeep Kumar", role: "admin", img: "/avatars/user-6.svg", team: "Leadership" },
  "ops@vadal.ai": { name: "Vadal Ops", role: "superadmin", img: "/avatars/user-3.svg", team: "Vadal" },
};

/** Quick demo personas surfaced on the sign-in screen. */
export const DEMO_PERSONAS: { email: string; label: string }[] = [
  { email: "aarav@oliandhue.com", label: "Employee" },
  { email: "anita@oliandhue.com", label: "Manager" },
  { email: "priya@oliandhue.com", label: "HR admin" },
  { email: "ops@vadal.ai", label: "Vadal super admin" },
];

export type EmailCheck =
  | { ok: true; tenant: Tenant; email: string }
  | { ok: false; reason: "invalid" | "personal" | "unknown-domain"; domain?: string };

export function checkEmail(raw: string): EmailCheck {
  const email = raw.trim().toLowerCase();
  const m = email.match(/^[^\s@]+@([^\s@]+\.[^\s@]{2,})$/);
  if (!m) return { ok: false, reason: "invalid" };
  const domain = m[1];
  if (PERSONAL_DOMAINS.includes(domain)) return { ok: false, reason: "personal", domain };
  const tenant = TENANTS.find((t) => t.domains.includes(domain));
  if (!tenant) return { ok: false, reason: "unknown-domain", domain };
  return { ok: true, tenant, email };
}

export type Session = {
  email: string;
  name: string;
  role: Role;
  tenant: string; // slug
  img: string;
  team: string;
  onboarded: boolean;
  method: "sso" | "otp";
};

const SESSION_KEY = "vadal:session";

export function getSession(): Session | null {
  if (typeof localStorage === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null"); } catch { return null; }
}

export function setSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
    // keep the product's role scoping (view-as) in lock-step with the session
    if (s) localStorage.setItem("vadal:view-as", JSON.stringify(s.role === "superadmin" ? "admin" : s.role));
    window.dispatchEvent(new Event("vadal:viewas"));
    window.dispatchEvent(new Event("vadal:session"));
  } catch { /* ignore */ }
}

/** Build a session for a verified email (JIT-provision unknown people as Employees). */
export function sessionFor(email: string, tenant: Tenant, method: "sso" | "otp"): Session {
  const known = DIRECTORY[email];
  const onboardKey = `vadal:onboarded:${email}`;
  let onboarded = false;
  try { onboarded = localStorage.getItem(onboardKey) === "1"; } catch { /* ignore */ }
  return {
    email,
    name: known?.name ?? email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    role: known?.role ?? "employee",
    tenant: tenant.slug,
    img: known?.img ?? "/avatars/user-1.svg",
    team: known?.team ?? "New joiner",
    onboarded,
    method,
  };
}

export function markOnboarded(email: string) {
  try { localStorage.setItem(`vadal:onboarded:${email}`, "1"); } catch { /* ignore */ }
  const s = getSession();
  if (s && s.email === email) setSession({ ...s, onboarded: true });
}

/** Demo OTP: derive a stable 6-digit code per email (shown on screen in demo). */
export function demoOtp(email: string): string {
  let h = 7;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return String(100000 + (h % 900000));
}
