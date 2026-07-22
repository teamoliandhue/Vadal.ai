"use client";
/* Onboarding (route /auth/onboarding) — role-branched first-run wizard.
   The session's role decides the track (the call's actor model):
   · Employee — confirm profile → pick communities → notifications → first
     check-in → meet Vadal AI. Lands on Home (employee view: own data only).
   · Manager — employee track condensed + confirm your team & 1:1 cadence.
     Lands on Home (manager view: + team scope).
   · Admin — workspace setup: branding → sign-in & domains → invite people →
     privacy & AI guardrails. Lands on Home (admin view: org-wide scope).
   Everything is demo-local; finishing marks the account onboarded. */
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Bell, Building2, Check, HeartHandshake, Lock, Mail,
  Palette, ShieldCheck, Sparkles, UserPlus, UserRound, Users,
} from "lucide-react";
import { Avatar, Button, SparkMark, Switch } from "@vadal/design-system";
import { getSession, markOnboarded, ROLE_LABEL, TENANTS, type Role, type Session } from "@/lib/auth";
import { communities, moods } from "@/lib/data";
import { reports, team } from "@/lib/manager";
import { brandSwatches } from "@/lib/settings";

const soft = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

type StepDef = { key: string; label: string };
const TRACKS: Record<Exclude<Role, "superadmin">, StepDef[]> = {
  employee: [
    { key: "profile", label: "You" },
    { key: "communities", label: "Belong" },
    { key: "notifications", label: "Stay in the loop" },
    { key: "checkin", label: "First check-in" },
    { key: "ai", label: "Meet Vadal" },
  ],
  manager: [
    { key: "profile", label: "You" },
    { key: "team", label: "Your team" },
    { key: "cadence", label: "1:1 rhythm" },
    { key: "notifications", label: "Stay in the loop" },
    { key: "ai", label: "Meet Vadal" },
  ],
  admin: [
    { key: "profile", label: "You" },
    { key: "branding", label: "Make it yours" },
    { key: "signin", label: "Sign-in & domains" },
    { key: "invite", label: "Bring your people" },
    { key: "guardrails", label: "Privacy & AI" },
  ],
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}

export function OnboardingFlow() {
  const router = useRouter();
  const [session, setSess] = React.useState<Session | null>(null);
  const [i, setI] = React.useState(0);
  // step-local demo state
  const [picked, setPicked] = React.useState<string[]>([]);
  const [notifs, setNotifs] = React.useState({ recognition: true, surveys: true, digest: true });
  const [mood, setMood] = React.useState<string | null>(null);
  const [cadence, setCadence] = React.useState("Weekly");
  const [brand, setBrand] = React.useState(brandSwatches[0]);
  const [invites, setInvites] = React.useState("");

  React.useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/auth"); return; }
    if (s.onboarded) { router.replace("/product/home"); return; }
    setSess(s);
  }, [router]);

  if (!session) return null;
  const role: Exclude<Role, "superadmin"> = session.role === "superadmin" ? "admin" : session.role;
  const steps = TRACKS[role];
  const step = steps[i];
  const tenant = TENANTS.find((t) => t.slug === session.tenant) ?? TENANTS[0];

  function next() {
    if (i < steps.length - 1) { setI(i + 1); return; }
    markOnboarded(session!.email);
    if (role === "admin" && brand) {
      try { localStorage.setItem("vadal:brand-color", JSON.stringify(brand)); window.dispatchEvent(new Event("vadal:brand")); } catch { /* ignore */ }
    }
    router.push("/product/home");
  }

  const toggleCommunity = (name: string) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  return (
    <div className="lumen relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10 text-ink" data-ds>
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full opacity-[0.10] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />

      <div className="relative w-full max-w-[520px]">
        {/* progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Eyebrow>{ROLE_LABEL[session.role]} · setup</Eyebrow>
            <span className="text-[12px] font-semibold tabular-nums text-faint">{i + 1} / {steps.length}</span>
          </div>
          <div className="mt-2.5 flex gap-1.5">
            {steps.map((s, k) => (
              <span key={s.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft">
                <span className="block h-full rounded-full bg-[var(--purple)] transition-all duration-500" style={{ width: k < i ? "100%" : k === i ? "50%" : "0%" }} />
              </span>
            ))}
          </div>
        </div>

        <div className="rise rounded-[26px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_24px_60px_-28px_rgba(20,20,40,0.28)] sm:p-8">
          {/* ── shared: profile ── */}
          {step.key === "profile" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Welcome to {tenant.name} on Vadal{session.name ? `, ${session.name.split(" ")[0]}` : ""} 👋</h1>
              <p className="mt-1.5 text-[14px] text-muted">We pulled this from your company directory — give it a quick check.</p>
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line p-4">
                <Avatar src={session.img} name={session.name} size="xl" />
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-bold">{session.name}</div>
                  <div className="text-[13px] text-faint">{session.email}</div>
                  <div className="mt-1 flex items-center gap-2 text-[12px]"><span className="rounded-full bg-soft px-2 py-0.5 font-semibold text-muted">{session.team}</span><span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: soft("var(--purple)"), color: "var(--purple)" }}>{ROLE_LABEL[session.role]}</span></div>
                </div>
                <Button variant="tertiary" size="sm" leadingIcon={<UserRound className="h-4 w-4" />}>Edit</Button>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-faint">Your role decides what you see: {role === "employee" ? "your own space, feed and surveys — never other people's data." : role === "manager" ? "everything an employee sees, plus your team's health, actions and approvals." : "org-wide analytics and full workspace configuration."}</p>
            </>
          )}

          {/* ── employee: communities ── */}
          {step.key === "communities" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Find your people</h1>
              <p className="mt-1.5 text-[14px] text-muted">Pick a few communities — they shape your feed.</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {communities.map((c) => {
                  const on = picked.includes(c.name);
                  return (
                    <button key={c.name} onClick={() => toggleCommunity(c.name)} className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${on ? "border-[var(--purple)] bg-[color-mix(in_srgb,var(--purple)_8%,transparent)]" : "border-line hover:bg-soft"}`}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[14px] font-bold text-white" style={{ background: c.color }}>{c.name[0]}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{c.name}</span><span className="block text-[11px] text-faint">{c.members} members</span></span>
                      {on && <Check className="h-4 w-4 shrink-0 text-[var(--purple)]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── manager: team confirm ── */}
          {step.key === "team" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Your team</h1>
              <p className="mt-1.5 text-[14px] text-muted">Synced from the org chart — these {team.size} people report to you. Their pulse rolls up to your Manager hub.</p>
              <ul className="mt-4 flex flex-col gap-2">
                {reports.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                    <Avatar src={r.img} name={r.name} size="sm" />
                    <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{r.name}</span><span className="block text-[11px] text-faint">{r.role}</span></span>
                    <Check className="h-4 w-4 text-[var(--success)]" />
                  </li>
                ))}
                <li className="rounded-xl border border-dashed border-line px-3 py-2.5 text-center text-[12px] text-faint">+ {reports.length - 4} more · <button className="font-semibold text-[var(--purple)] hover:underline">looks wrong? fix the mapping</button></li>
              </ul>
            </>
          )}

          {/* ── manager: cadence ── */}
          {step.key === "cadence" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Your 1:1 rhythm</h1>
              <p className="mt-1.5 text-[14px] text-muted">Vadal preps every 1:1 with AI talking points and nudges you when one slips.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Weekly", "Fortnightly", "Monthly"].map((c) => (
                  <button key={c} onClick={() => setCadence(c)} className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition ${cadence === c ? "border-[var(--purple)] bg-[color-mix(in_srgb,var(--purple)_12%,transparent)] text-ink" : "border-line text-muted hover:text-ink"}`}>{c}</button>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[var(--ai-surface)] p-3.5 ring-1 ring-[var(--ai-border)]">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ai-accent)]" />
                <p className="text-[13px] leading-relaxed text-muted">Heads-up: one of your reports hasn&rsquo;t had a 1:1 in 6 weeks. Your Manager hub has the full picture waiting.</p>
              </div>
            </>
          )}

          {/* ── shared: notifications ── */}
          {step.key === "notifications" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Stay in the loop</h1>
              <p className="mt-1.5 text-[14px] text-muted">Choose what reaches you. You can fine-tune per channel later.</p>
              <div className="mt-5 flex flex-col gap-3">
                <div className="rounded-2xl border border-line p-4"><Switch checked={notifs.recognition} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifs((n) => ({ ...n, recognition: e.target.checked }))} label="Recognition & mentions" description="When someone celebrates you or needs you." /></div>
                <div className="rounded-2xl border border-line p-4"><Switch checked={notifs.surveys} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifs((n) => ({ ...n, surveys: e.target.checked }))} label="Surveys & pulses" description="A nudge when your voice is needed — never spam." /></div>
                <div className="rounded-2xl border border-line p-4"><Switch checked={notifs.digest} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifs((n) => ({ ...n, digest: e.target.checked }))} label="Weekly digest" description={role === "manager" ? "Your team's week, summarised by Vadal AI." : "Your week on Vadal, summarised."} /></div>
              </div>
            </>
          )}

          {/* ── employee: first check-in ── */}
          {step.key === "checkin" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Your first check-in</h1>
              <p className="mt-1.5 text-[14px] text-muted">This is the daily ritual — 5 seconds, private to you, and it helps {tenant.name} fix things early.</p>
              <div className="mt-5 flex gap-2">
                {moods.map((m) => {
                  const on = mood === m.label;
                  return (
                    <button key={m.label} onClick={() => setMood(m.label)} className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border py-3.5 transition hover:-translate-y-0.5 ${on ? "border-transparent bg-soft" : "border-line hover:bg-soft"}`} style={on ? { boxShadow: `inset 0 0 0 1.5px ${m.color}` } : undefined}>
                      <span className="text-[26px] leading-none">{m.emoji}</span>
                      <span className="text-[13px] font-semibold" style={{ color: on ? m.color : "var(--faint)" }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-faint"><Lock className="h-3.5 w-3.5" /> Only you see your check-ins. Teams see anonymised trends, never individuals.</p>
            </>
          )}

          {/* ── admin: branding ── */}
          {step.key === "branding" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Make it {tenant.name}&rsquo;s</h1>
              <p className="mt-1.5 text-[14px] text-muted">Your logo and colour make Vadal feel like your own product. We auto-adjust shades that wouldn&rsquo;t stay readable.</p>
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tenant.logo} alt="" className="h-12 w-12 rounded-xl object-contain" />
                <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">Company logo</div><div className="text-[12px] text-faint">Pulled from your workspace — replace any time.</div></div>
                <Button variant="tertiary" size="sm" leadingIcon={<Palette className="h-4 w-4" />}>Replace</Button>
              </div>
              <div className="mt-3 rounded-2xl border border-line p-4">
                <div className="text-[14px] font-semibold">Brand colour</div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {brandSwatches.map((s) => (
                    <button key={s} onClick={() => setBrand(s)} aria-label={`Use ${s}`} className="grid h-9 w-9 place-items-center rounded-xl border border-line transition hover:scale-110" style={{ background: s }}>
                      {brand === s && <Check className="h-4 w-4 text-white mix-blend-difference" />}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl p-3" style={{ background: soft(brand, 12) }}>
                  <span className="text-[13px]">Good morning, <b className="font-bold" style={{ color: brand }}>Priya</b> — this is how your people will see it.</span>
                </div>
              </div>
            </>
          )}

          {/* ── admin: sign-in & domains ── */}
          {step.key === "signin" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Sign-in &amp; domains</h1>
              <p className="mt-1.5 text-[14px] text-muted">Only verified company addresses can enter your workspace — personal email can&rsquo;t sign in.</p>
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft"><Mail className="h-5 w-5 text-[var(--purple)]" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">Verified domains</div><div className="text-[12px] text-faint">@{tenant.domains.join(" · @")}</div></div>
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--success)]"><Check className="h-3.5 w-3.5" /> Verified</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft"><Lock className="h-5 w-5 text-[var(--purple)]" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">{tenant.sso?.provider ?? "SSO"}</div><div className="text-[12px] text-faint">Single sign-on for everyone on your domains.</div></div>
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--success)]"><Check className="h-3.5 w-3.5" /> Connected</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft"><ShieldCheck className="h-5 w-5 text-[var(--purple)]" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold">Email code fallback</div><div className="text-[12px] text-faint">6-digit codes for deskless teams without SSO seats.</div></div>
                  <Switch checked onChange={() => { /* demo */ }} aria-label="Email code fallback" />
                </div>
              </div>
            </>
          )}

          {/* ── admin: invite ── */}
          {step.key === "invite" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Bring your people</h1>
              <p className="mt-1.5 text-[14px] text-muted">Sync from your HRIS for roles and org structure — or paste emails to start small.</p>
              <div className="mt-5 flex flex-col gap-3">
                <button className="flex items-center gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-[var(--purple)] hover:bg-soft">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-[18px]" aria-hidden>🗂️</span>
                  <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">Connect HRIS (recommended)</span><span className="block text-[12px] text-faint">Darwinbox, Workday, BambooHR… roles, teams and managers sync automatically.</span></span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
                </button>
                <div className="rounded-2xl border border-line p-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold"><UserPlus className="h-4 w-4 text-[var(--purple)]" /> Or invite by email</div>
                  <textarea value={invites} onChange={(e) => setInvites(e.target.value)} rows={3} placeholder={"anita@" + tenant.domains[0] + ", rahul@" + tenant.domains[0] + "…"} className="mt-2.5 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-[13px] outline-none transition focus:border-[var(--purple)]" />
                  <p className="mt-1.5 text-[12px] text-faint">Everyone starts as an Employee — promote managers and admins in Settings → Members.</p>
                </div>
              </div>
            </>
          )}

          {/* ── admin: guardrails ── */}
          {step.key === "guardrails" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Privacy &amp; AI, set right</h1>
              <p className="mt-1.5 text-[14px] text-muted">Safe defaults — change them any time in Settings.</p>
              <ul className="mt-5 flex flex-col gap-3">
                {[
                  ["Anonymity threshold · 5", "No slice smaller than 5 responses is ever shown — individuals stay invisible."],
                  ["AI scoped to your workspace", "Vadal AI answers only from your company's context, and declines anything beyond it."],
                  ["Usage guardrails on", "Monthly token budget + per-user caps — no surprise bills."],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-3 rounded-2xl border border-line p-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: soft("var(--success)", 16) }}><Check className="h-4 w-4 text-[var(--success)]" /></span>
                    <span className="min-w-0"><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[13px] leading-relaxed text-muted">{d}</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ── shared: meet Vadal AI ── */}
          {step.key === "ai" && (
            <>
              <h1 className="text-[22px] font-bold tracking-tight">Meet Vadal</h1>
              <p className="mt-1.5 text-[14px] text-muted">Ask anything — leave balance, policies, {role === "manager" ? "your team's pulse, 1:1 prep" : "who owns payroll"} — and get answers with sources, routed to a human when needed.</p>
              <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
                <div className="flex items-center gap-2"><span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span><span className="text-[13px] font-bold">Vadal AI</span></div>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{role === "manager" ? "“Good morning! One of your reports needs attention today, and your 3pm 1:1 has AI prep ready. Want the briefing?”" : "“Hi! You have 18 paid leaves this year. Want me to walk you through how things work around here?”"}</p>
              </div>
              <p className="mt-3 text-[12px] text-faint">It lives in the bottom-right corner, everywhere in the product.</p>
            </>
          )}

          {/* footer nav */}
          <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
            {i > 0 ? (
              <Button variant="tertiary" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => setI(i - 1)}>Back</Button>
            ) : <span />}
            <Button variant="brand" onClick={next} trailingIcon={i === steps.length - 1 ? undefined : <ArrowRight className="h-4 w-4" />}>
              {i === steps.length - 1 ? (role === "admin" ? "Launch workspace 🚀" : "Take me home →") : "Continue"}
            </Button>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-faint">
          {role === "admin" ? <><Building2 className="h-3.5 w-3.5" /> Setting up {tenant.name} · you can revisit everything in Settings</> : role === "manager" ? <><Users className="h-3.5 w-3.5" /> Your team&rsquo;s data stays scoped to you and HR</> : <><HeartHandshake className="h-3.5 w-3.5" /> Your check-ins are private to you</>}
        </p>
      </div>
    </div>
  );
}
