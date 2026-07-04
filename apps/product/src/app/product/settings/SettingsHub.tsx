"use client";
/* SETTINGS — the admin/configuration surface. A left sub-nav switches between
   panels: Workspace, Branding (client white-label), Roles & permissions,
   Members, Integrations (full/selective/off model), Notifications, Data &
   privacy, and AI & guardrails. Same Lumen shell as the rest of the product.
   Seeded data (lib/settings). */
import * as React from "react";
import {
  Bell, Building2, Check, Lock, Palette, Plug, ShieldCheck, Sparkles, UserPlus, Users, type LucideIcon,
} from "lucide-react";
import { Avatar, Badge, Button, Switch, type BadgeTone } from "@vadal/design-system";
import { toast } from "../Toaster";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  workspace, roles, capabilities, members, integrations, notifCategories, aiDefaults, privacyDefaults,
  type IntegrationMode, type Role,
} from "@/lib/settings";
import { BrandingPanel } from "./BrandingPanel";

const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

type Tab = { key: string; label: string; icon: LucideIcon };
const TABS: Tab[] = [
  { key: "workspace", label: "Workspace", icon: Building2 },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "roles", label: "Roles & permissions", icon: ShieldCheck },
  { key: "members", label: "Members", icon: Users },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Data & privacy", icon: Lock },
  { key: "ai", label: "AI & guardrails", icon: Sparkles },
];

/* ── shared primitives ──────────────────────────────────────────── */
function PanelHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-line pb-4">
      <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-[14px] text-muted">{desc}</p>
    </div>
  );
}
function Field({ label, value, suffix, onChange }: { label: string; value: string; suffix?: string; onChange?: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-faint">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl border border-line bg-card focus-within:border-[var(--purple)]">
        <input value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full bg-transparent px-3.5 py-2.5 text-[14px] outline-none" />
        {suffix && <span className="whitespace-nowrap px-3 text-[13px] text-faint">{suffix}</span>}
      </div>
    </label>
  );
}
function SaveBar({ onSave, note }: { onSave: () => void; note?: string }) {
  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-2 border-t border-line bg-card px-6 py-4 sm:-mx-7 sm:px-7">
      <span className="text-[12px] text-faint">{note ?? "Changes apply to this workspace."}</span>
      <Button variant="brand" size="sm" onClick={onSave}>Save changes</Button>
    </div>
  );
}

/* ── panels ─────────────────────────────────────────────────────── */
function WorkspacePanel() {
  const [name, setName] = React.useState(workspace.name);
  const pct = Math.round((workspace.seatsUsed / workspace.seats) * 100);
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="Workspace" desc="Your organisation’s identity and defaults." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Workspace name" value={name} onChange={setName} />
        <Field label="Legal name" value={workspace.legalName} />
        <Field label="Workspace URL" value={workspace.subdomain} suffix=".vadal.ai" />
        <Field label="Primary contact" value={workspace.contact} />
        <Field label="Timezone" value={workspace.timezone} />
        <Field label="Locale" value={workspace.locale} />
      </div>
      <div className="rounded-2xl border border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><span className="text-[14px] font-semibold">{workspace.plan} plan</span><div className="text-[13px] text-muted">{workspace.seatsUsed.toLocaleString()} of {workspace.seats.toLocaleString()} seats used</div></div>
          <Button variant="secondary" size="sm" onClick={() => toast("Billing portal (demo)", "info")}>Manage plan</Button>
        </div>
        <span className="mt-3 block h-2 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-[var(--purple)]" style={{ width: `${pct}%` }} /></span>
      </div>
      <SaveBar onSave={() => toast("Workspace settings saved ✓")} />
    </div>
  );
}

function RolesPanel() {
  const groups = [...new Set(capabilities.map((c) => c.group))];
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="Roles & permissions" desc="Four actors, aligned to how the product is configured: employee, manager, admin and super admin." />
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="text-left text-[12px] uppercase tracking-wide text-faint">
              <th className="px-2 pb-2 font-semibold">Capability</th>
              {roles.map((r) => <th key={r} className="px-2 pb-2 text-center font-semibold">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g}>
                <tr><td colSpan={roles.length + 1} className="px-2 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--purple)]">{g}</td></tr>
                {capabilities.filter((c) => c.group === g).map((c) => (
                  <tr key={c.label} className="border-t border-line">
                    <td className="px-2 py-2.5 text-[14px]">{c.label}</td>
                    {roles.map((r) => (
                      <td key={r} className="px-2 py-2.5 text-center">
                        {c.roles.includes(r as Role) ? <Check className="mx-auto h-4 w-4 text-[var(--success)]" /> : <span className="text-faint">–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-muted">Managers see only their own team; admins see the whole org. Super admins can spin up new client workspaces.</p>
    </div>
  );
}

const ROLE_TONE: Record<Role, BadgeTone> = { Employee: "neutral", Manager: "info", Admin: "brand", "Super admin": "success" };
function MembersPanel() {
  const [rows, setRows] = React.useState(members);
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="Members" desc="People with access to this workspace and what they can do." />
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted">{rows.filter((m) => m.status === "active").length} active · {rows.filter((m) => m.status === "invited").length} invited</span>
        <Button variant="brand" size="sm" leadingIcon={<UserPlus className="h-4 w-4" />} onClick={() => toast("Invite link copied ✓")}>Invite people</Button>
      </div>
      <div className="flex flex-col divide-y divide-[var(--line)] rounded-2xl border border-line">
        {rows.map((m) => (
          <div key={m.email} className="flex flex-wrap items-center gap-3 p-3.5">
            <Avatar src={m.img} name={m.name} size="md" />
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[14px] font-semibold">{m.name}{m.status === "invited" && <Badge tone="warning" variant="soft" size="sm">Invited</Badge>}</div><div className="text-[12px] text-faint">{m.email} · {m.team}</div></div>
            <select
              value={m.role}
              onChange={(e) => setRows((rs) => rs.map((x) => (x.email === m.email ? { ...x, role: e.target.value as Role } : x)))}
              className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-[13px] font-semibold outline-none focus:border-[var(--purple)]"
            >
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="hidden sm:block"><Badge tone={ROLE_TONE[m.role]} variant="soft" size="sm">{m.role}</Badge></span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MODES: IntegrationMode[] = ["Full", "Selective", "Off"];
function IntegrationsPanel() {
  const [state, setState] = usePersistentState<Record<string, IntegrationMode>>("vadal:integration-modes", Object.fromEntries(integrations.map((i) => [i.key, i.mode ?? "Off"])));
  const cats = [...new Set(integrations.map((i) => i.category))];
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="Integrations" desc="Connect the tools you already use. Choose how much each one shares: full sync, selective (labelled), or off." />
      {cats.map((cat) => (
        <div key={cat} className="flex flex-col gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">{cat}</p>
          {integrations.filter((i) => i.category === cat).map((i) => {
            const mode = state[i.key] ?? "Off";
            return (
              <div key={i.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-[20px]" aria-hidden>{i.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[14px] font-semibold">{i.name}{i.connected && <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--success)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Connected</span>}</div>
                  <div className="text-[13px] text-muted">{i.desc}</div>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
                  {MODES.map((mo) => (
                    <button key={mo} onClick={() => { setState((s) => ({ ...s, [i.key]: mo })); }} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${mode === mo ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>{mo}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <p className="text-[13px] text-muted">Selective sharing pulls only the data you approve, with the source labelled. Anything set to Off stays disconnected.</p>
    </div>
  );
}

function NotificationsPanel() {
  const [rows, setRows] = usePersistentState("vadal:notif-prefs", notifCategories);
  const set = (key: string, ch: "inApp" | "email" | "push", v: boolean) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [ch]: v } : r)));
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="Notifications" desc="Choose how each kind of update reaches people. These are the workspace defaults." />
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-faint"><th className="px-2 pb-2 font-semibold">Category</th>{["In-app", "Email", "Push"].map((h) => <th key={h} className="px-2 pb-2 text-center font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-line">
                <td className="px-2 py-3 text-[14px] font-medium">{r.label}</td>
                {(["inApp", "email", "push"] as const).map((ch) => (
                  <td key={ch} className="px-2 py-3"><div className="flex justify-center"><Switch size="sm" checked={r[ch]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(r.key, ch, e.target.checked)} /></div></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrivacyPanel() {
  const [threshold, setThreshold] = React.useState(privacyDefaults.anonymityThreshold);
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="Data & privacy" desc="Confidential by design — control anonymity, retention and where data lives." />
      <div className="rounded-2xl border border-line p-4">
        <div className="text-[14px] font-semibold">Anonymity threshold</div>
        <div className="text-[13px] text-muted">Hide any slice with fewer than this many responses, so individuals can’t be identified.</div>
        <div className="mt-3 flex items-center gap-4">
          <input type="range" min={3} max={10} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="flex-1 accent-[var(--purple)]" />
          <span className="w-8 text-right text-[16px] font-bold tabular-nums">{threshold}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line p-4"><div className="text-[12px] text-faint">Data retention</div><div className="mt-1 text-[16px] font-bold">{privacyDefaults.retentionMonths} months</div></div>
        <div className="rounded-2xl border border-line p-4"><div className="text-[12px] text-faint">Data region</div><div className="mt-1 text-[16px] font-bold">{privacyDefaults.regionLock}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => toast("Export queued — you’ll get an email when it’s ready", "info")}>Export workspace data</Button>
        <Button variant="tertiary" size="sm" onClick={() => toast("Contact your success manager to action this", "info")}>Request deletion</Button>
      </div>
      <SaveBar onSave={() => toast("Privacy settings saved ✓")} note="Applies org-wide, effective immediately." />
    </div>
  );
}

function AIPanel() {
  const [enabled, setEnabled] = usePersistentState("vadal:ai-enabled", aiDefaults.enabled);
  const [scope, setScope] = usePersistentState("vadal:ai-scope", aiDefaults.scopeToWorkspace);
  const [sentiment, setSentiment] = usePersistentState("vadal:ai-sentiment", aiDefaults.sentiment);
  const [budget, setBudget] = React.useState(aiDefaults.monthlyBudget);
  const [cap, setCap] = React.useState(aiDefaults.perUserDailyCap);
  return (
    <div className="flex flex-col gap-6">
      <PanelHead title="AI & guardrails" desc="Vadal AI powers insights, drafting and sentiment. Keep it scoped and budgeted so usage stays safe." />
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-line p-4"><Switch checked={enabled} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnabled(e.target.checked)} label="Enable Vadal AI" description="Insights, chat, drafting and summaries across the product." /></div>
        <div className={`rounded-2xl border border-line p-4 transition ${enabled ? "" : "pointer-events-none opacity-50"}`}><Switch checked={scope} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScope(e.target.checked)} label="Scope answers to this workspace" description="The assistant only answers from company context and declines anything beyond it." /></div>
        <div className={`rounded-2xl border border-line p-4 transition ${enabled ? "" : "pointer-events-none opacity-50"}`}><Switch checked={sentiment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSentiment(e.target.checked)} label="Sentiment analysis" description="Read how people are feeling from voice and open-text — never shown below the anonymity threshold." /></div>
      </div>
      <div className={`flex flex-col gap-4 rounded-2xl border border-line p-4 transition ${enabled ? "" : "pointer-events-none opacity-50"}`}>
        <div className="text-[14px] font-semibold">Usage guardrails</div>
        <div>
          <div className="flex items-center justify-between text-[13px]"><span className="text-muted">Monthly token budget</span><span className="font-bold tabular-nums">{budget}M tokens</span></div>
          <input type="range" min={1} max={20} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-2 w-full accent-[var(--purple)]" />
        </div>
        <div>
          <div className="flex items-center justify-between text-[13px]"><span className="text-muted">Per-user daily cap</span><span className="font-bold tabular-nums">{cap} requests</span></div>
          <input type="range" min={10} max={100} step={5} value={cap} onChange={(e) => setCap(Number(e.target.value))} className="mt-2 w-full accent-[var(--purple)]" />
        </div>
        <p className="text-[13px] text-muted">Hard caps stop runaway usage — requests beyond the budget are declined rather than billed.</p>
      </div>
      <SaveBar onSave={() => toast("AI settings saved ✓")} />
    </div>
  );
}

const PANELS: Record<string, React.ReactNode> = {
  workspace: <WorkspacePanel />,
  branding: <BrandingPanel />,
  roles: <RolesPanel />,
  members: <MembersPanel />,
  integrations: <IntegrationsPanel />,
  notifications: <NotificationsPanel />,
  privacy: <PrivacyPanel />,
  ai: <AIPanel />,
};

export function SettingsHub() {
  const [tab, setTab] = usePersistentState<string>("vadal:settings-tab", "workspace");
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="rise">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">Admin</p>
        <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Settings</h1>
        <p className="mt-2 max-w-xl text-[14px] text-muted">Configure the workspace, branding, people, integrations and AI — everything an admin controls.</p>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[232px_1fr]">
        {/* sub-nav */}
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((t) => {
              const on = t.key === active.key;
              return (
                <li key={t.key} className="shrink-0">
                  <button onClick={() => setTab(t.key)} className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${on ? "bg-[var(--purple)]/12 text-ink ring-1 ring-[var(--purple)]/25" : "text-muted hover:bg-soft hover:text-ink"}`} style={on ? { background: soft("var(--purple)"), boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--purple) 24%, transparent)" } : undefined}>
                    <t.icon className={`h-[18px] w-[18px] shrink-0 ${on ? "text-[var(--purple)]" : ""}`} strokeWidth={on ? 2.1 : 1.85} /> {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* panel */}
        <section className="card-lift min-w-0 rounded-[26px] border border-line bg-card p-6 sm:p-7">
          {PANELS[active.key]}
        </section>
      </div>
    </div>
  );
}
