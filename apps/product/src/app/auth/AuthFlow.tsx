"use client";
/* Sign-in (route /auth) — work-email-first, passwordless, multi-tenant.
   Step 1: enter your COMPANY email. Personal providers are blocked with a clear
   message; unknown domains get a "workspace not found → talk to us" path.
   Step 2: the domain routes to the workspace → continue with its SSO, or a
   6-digit email code (demo shows the code inline). New users then go through
   role-based onboarding; returning users land on Home.
   Layout: Fireflies-pattern split screen — form column left, dark Showcase
   panel (real product-UI moments + testimonial) right. */
import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, KeyRound, Lock, Mail } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import {
  checkEmail, demoOtp, DEMO_PERSONAS, sessionFor, setSession, type Tenant,
} from "@/lib/auth";
import { Showcase, type ShowcaseVariant } from "./Showcase";

type Step = "email" | "method" | "otp";
const STEP_SHOWCASE: Record<Step, ShowcaseVariant> = { email: "pulse", method: "ai", otp: "privacy" };

export function AuthFlow() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [error, setError] = React.useState<React.ReactNode>(null);
  const [code, setCode] = React.useState<string[]>(Array(6).fill(""));
  const [busy, setBusy] = React.useState(false);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  function submitEmail(value: string) {
    const res = checkEmail(value);
    setError(null);
    if (!res.ok) {
      if (res.reason === "invalid") setError("That doesn't look like an email address.");
      else if (res.reason === "personal")
        setError(<>Vadal is for teams — <b>personal addresses like @{res.domain} can&rsquo;t sign in</b>. Use your company email instead.</>);
      else
        setError(<><b>No workspace found for @{res.domain}.</b> If your company uses Vadal, check the address — or <a className="font-semibold text-[var(--purple)] underline" href="https://vadal.ai" target="_blank" rel="noreferrer">talk to us</a> about bringing Vadal to your team.</>);
      return;
    }
    setEmail(res.email);
    setTenant(res.tenant);
    setStep("method");
  }

  function finish(method: "sso" | "otp") {
    if (!tenant) return;
    setBusy(true);
    const s = sessionFor(email, tenant, method);
    window.setTimeout(() => {
      setSession(s);
      router.push(s.onboarded ? "/product/home" : "/auth/onboarding");
    }, 650);
  }

  function submitOtp() {
    const entered = code.join("");
    if (entered.length < 6) return;
    if (entered !== demoOtp(email)) {
      setError("That code doesn't match — check the code and try again.");
      setCode(Array(6).fill(""));
      otpRefs.current[0]?.focus();
      return;
    }
    setError(null);
    finish("otp");
  }

  function typeOtp(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    setCode((c) => { const n = [...c]; n[i] = d; return n; });
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  }

  return (
    <div className="lumen grid min-h-screen bg-canvas text-ink lg:grid-cols-2" data-ds>
      {/* ── LEFT · the form column ── */}
      <div className="relative flex min-h-screen flex-col overflow-hidden px-6 py-8 sm:px-12">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--purple), transparent 70%)" }} aria-hidden />

        {/* brand — top-left, Fireflies-style */}
        <div className="relative flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/signal-mark.svg" alt="Vadal" className="h-7 w-auto" />
          <span className="text-[15px] font-bold tracking-tight">vadal<span className="text-[var(--brand)]">.ai</span></span>
        </div>

        <div className="relative mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
        <div key={step} className="af-step">
          {step === "email" && (
            <>
              <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">The pulse of your company, daily.</h1>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">Sign in with your <b className="font-semibold text-ink">company email</b> — it routes you to the right workspace.</p>
              <form className="mt-5" onSubmit={(e) => { e.preventDefault(); submitEmail(email); }}>
                <label className="block">
                  <span className="text-[12px] font-semibold text-faint">Work email</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 focus-within:border-[var(--purple)]">
                    <Mail className="h-4 w-4 shrink-0 text-faint" />
                    <input
                      autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-faint"
                    />
                  </div>
                </label>
                {error && <p className="mt-2.5 rounded-xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">{error}</p>}
                <Button type="submit" variant="brand" className="mt-4 w-full" trailingIcon={<ArrowRight className="h-4 w-4" />}>Continue</Button>
              </form>

              {/* demo personas — one tap per actor */}
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Demo · sign in as</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DEMO_PERSONAS.map((p) => (
                    <button key={p.email} onClick={() => submitEmail(p.email)} className="rounded-xl border border-line px-3 py-2 text-left transition hover:border-[var(--purple)] hover:bg-soft">
                      <span className="block text-[13px] font-semibold">{p.label}</span>
                      <span className="block truncate text-[11px] text-faint">{p.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === "method" && tenant && (
            <>
              <button onClick={() => { setStep("email"); setError(null); }} className="flex items-center gap-1 text-[13px] font-semibold text-faint transition hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
              <div className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tenant.logo} alt="" className="h-10 w-10 rounded-xl object-contain" />
                <div><h1 className="text-[20px] font-bold tracking-tight">{tenant.name}</h1><p className="text-[13px] text-faint">{email}</p></div>
              </div>
              <div className="mt-5 flex flex-col gap-2.5">
                {tenant.sso && (
                  <Button variant="brand" className="w-full" loading={busy} leadingIcon={<Lock className="h-4 w-4" />} onClick={() => finish("sso")}>
                    Continue with {tenant.sso.provider} SSO
                  </Button>
                )}
                {tenant.otp && (
                  <Button variant={tenant.sso ? "secondary" : "brand"} className="w-full" leadingIcon={<KeyRound className="h-4 w-4" />} onClick={() => { setStep("otp"); setError(null); setCode(Array(6).fill("")); }}>
                    Email me a sign-in code
                  </Button>
                )}
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-faint">No passwords on Vadal — your company&rsquo;s single sign-on or a one-time code keeps access safe and simple.</p>
            </>
          )}

          {step === "otp" && tenant && (
            <>
              <button onClick={() => setStep("method")} className="flex items-center gap-1 text-[13px] font-semibold text-faint transition hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
              <h1 className="mt-4 text-[20px] font-bold tracking-tight">Check your inbox</h1>
              <p className="mt-1.5 text-[14px] text-muted">We sent a 6-digit code to <b className="font-semibold text-ink">{email}</b>. It expires in 10 minutes.</p>
              <div className="mt-5 flex justify-between gap-2">
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    value={d}
                    autoFocus={i === 0}
                    inputMode="numeric"
                    onChange={(e) => typeOtp(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !code[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
                    className={`h-13 w-12 rounded-xl border border-line bg-card text-center text-[20px] font-bold outline-none transition focus:border-[var(--purple)] ${d ? "af-otp-filled" : ""}`}
                    style={{ height: 52 }}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
              {error && <p className="mt-2.5 rounded-xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-2.5 text-[13px] text-ink">{error}</p>}
              {/* demo affordance — the "email" */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-soft px-3.5 py-2.5 text-[13px] text-muted">
                <Mail className="h-3.5 w-3.5 shrink-0" /> Demo inbox: your code is <b className="font-bold tracking-widest text-ink">{demoOtp(email)}</b>
              </div>
              <Button variant="brand" className="mt-4 w-full" loading={busy} disabled={code.join("").length < 6} onClick={submitOtp}>Verify &amp; sign in</Button>
              <button onClick={() => setCode(Array(6).fill(""))} className="mt-3 w-full text-center text-[13px] font-semibold text-[var(--purple)] hover:underline">Resend code</button>
            </>
          )}
        </div>
        </div>

        {/* trust footer — bottom of the form column */}
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[12px] text-faint">
            <Building2 className="h-3.5 w-3.5" /> Company workspaces only · SOC 2 · Data stays in your region
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-faint/80">
            Powered by <SparkMark size={11} /> Vadal
          </p>
        </div>
      </div>

      {/* ── RIGHT · the product showcase ── */}
      <Showcase variant={STEP_SHOWCASE[step]} />

      <style>{`
        .af-step { animation: afStepIn .42s cubic-bezier(.22,.9,.3,1) both; }
        .af-otp-filled { border-color: var(--purple); animation: afOtpPop .22s cubic-bezier(.34,1.56,.64,1); }
        @keyframes afStepIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes afOtpPop { 0% { transform: scale(1); } 55% { transform: scale(1.09); } 100% { transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) { .af-step, .af-otp-filled { animation: none !important; } }
      `}</style>
    </div>
  );
}
