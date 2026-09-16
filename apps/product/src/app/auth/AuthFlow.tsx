"use client";
/* Sign-in (route /auth) — work-email-first, passwordless, multi-tenant.
   Step 1: enter your COMPANY email. Personal providers are blocked with a clear
   message; unknown domains get a "workspace not found → talk to us" path.
   Step 2: the domain routes to the workspace → continue with its SSO, or a
   6-digit email code (demo shows the code inline). New users then go through
   role-based onboarding; returning users land on Home.
   Layout: photos fill the screen, one after another — the whole workforce,
   one person at a time, each lit in the brand's own periwinkle — with the
   positioning line low on them; the form lives on a white
   panel that rides over the photo's right edge with 40px rounded corners
   (the Swiftt pattern). The panel carries almost nothing: wordmark, a
   welcome, one field, one button, the demo roles under a hairline. */
import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, KeyRound, Lock, Mail, Pause, Play } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import {
  checkEmail, demoOtp, DEMO_PERSONAS, sessionFor, setSession, type Tenant,
} from "@/lib/auth";

type Step = "email" | "method" | "otp";

/* The photos behind the panel — the whole workforce, one person at a time:
   different countries, different work, the same dark room and the same
   office. They cross-fade every few seconds with a slow settle;
   a pause control holds the frame; reduced motion shows the first, still. */
const SLIDES: { src: string; alt: string; focus: string }[] = [
  { src: "/auth/office-1.jpg", alt: "", focus: "50% 40%" },
  { src: "/auth/office-2.jpg", alt: "", focus: "50% 55%" },
  { src: "/auth/office-3.jpg", alt: "", focus: "50% 40%" },
  { src: "/auth/office-4.jpg", alt: "", focus: "50% 45%" },
  { src: "/auth/office-5.jpg", alt: "", focus: "50% 45%" },
  { src: "/auth/office-6.jpg", alt: "", focus: "50% 50%" },
];
const SLIDE_MS = 6500;

function Slides() {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (paused || SLIDES.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((k) => (k + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [i, paused]);
  return (
    <>
      {SLIDES.map((sl, k) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={sl.src}
          src={sl.src}
          alt={sl.alt}
          aria-hidden={k !== i}
          className={`af-slide absolute inset-0 h-full w-full object-cover ${k === i ? "is-on" : ""}`}
          style={{ objectPosition: sl.focus }}
        />
      ))}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 lg:right-6 lg:top-6">
        <span className="flex items-center gap-1" aria-hidden>
          {SLIDES.map((sl, k) => (
            <span key={sl.src} className={`h-1 rounded-full bg-white transition-all duration-500 ${k === i ? "w-5 opacity-90" : "w-1.5 opacity-40"}`} />
          ))}
        </span>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Play" : "Pause"}
          className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition hover:bg-black/45 lg:min-h-9 lg:min-w-9"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
      </div>
    </>
  );
}

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
    <div className="lumen relative min-h-screen bg-[#0a0a0c] text-ink" data-ds>
      {/* ── the photo: full-bleed, the panel rides over its right edge ── */}
      <div className="af-photo relative h-[46vh] min-h-[320px] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[60%]">
        <Slides />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.15)_0%,rgba(10,10,12,0)_35%,rgba(10,10,12,0.72)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 lg:px-14 lg:pb-14">
          <h2 className="af-line max-w-[15ch] text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.04] tracking-[-0.03em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
            Nine HR products.<br />One AI that acts.
          </h2>
          <p className="af-line mt-3 max-w-[40ch] text-[clamp(14px,1.1vw,16px)] leading-snug text-white/75 [animation-delay:120ms]">For the whole workforce — desk and frontline.</p>
          <span aria-hidden className="af-line mt-6 block h-px w-full max-w-[560px] bg-white/25 [animation-delay:240ms]" />
        </div>
      </div>

      {/* ── the panel ── */}
      <div className="af-panel relative -mt-8 flex min-h-[54vh] flex-col rounded-t-[32px] bg-card px-6 py-8 sm:px-12 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:min-h-0 lg:w-[42%] lg:rounded-none lg:rounded-l-[40px] lg:px-14 lg:py-10 xl:px-20">
        {/* brand — top-left of the panel */}
        <div className="relative flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/signal-mark.svg" alt="Vadal" className="h-7 w-auto" />
          <span className="text-[15px] font-bold tracking-tight">vadal<span className="text-[var(--brand)]">.ai</span></span>
        </div>

        <div className="relative mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
        <div key={step} className="af-step">
          {step === "email" && (
            <>
              <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-0.025em]">Welcome back</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">Sign in with your company email — it routes you to your workspace.</p>
              <form className="mt-5" onSubmit={(e) => { e.preventDefault(); submitEmail(email); }}>
                <label className="block">
                  <span className="text-[12px] font-semibold text-faint">Work email</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 transition focus-within:border-[var(--purple)] focus-within:ring-4 focus-within:ring-[color-mix(in_srgb,var(--purple)_12%,transparent)]">
                    <Mail className="h-4 w-4 shrink-0 text-faint" />
                    <input
                      autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-faint"
                    />
                  </div>
                </label>
                {error && <p className="mt-2.5 rounded-xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">{error}</p>}
                <Button type="submit" variant="brand" className="mt-4 min-h-[44px] w-full" trailingIcon={<ArrowRight className="h-4 w-4" />}>Continue</Button>
              </form>

              {/* demo personas — one tap per actor */}
              <div className="mt-7 border-t border-line pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Demo · sign in as</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DEMO_PERSONAS.map((p) => (
                    <button key={p.email} onClick={() => submitEmail(p.email)} title={p.email} className="min-h-[44px] rounded-full border border-line px-3 text-[12.5px] font-medium text-muted transition hover:border-[var(--purple)] hover:text-ink lg:min-h-[34px]">
                      {p.label}
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
                  <Button variant="brand" className="min-h-[44px] w-full" loading={busy} leadingIcon={<Lock className="h-4 w-4" />} onClick={() => finish("sso")}>
                    Continue with {tenant.sso.provider} SSO
                  </Button>
                )}
                {tenant.otp && (
                  <Button variant={tenant.sso ? "secondary" : "brand"} className="min-h-[44px] w-full" leadingIcon={<KeyRound className="h-4 w-4" />} onClick={() => { setStep("otp"); setError(null); setCode(Array(6).fill("")); }}>
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
              <Button variant="brand" className="mt-4 min-h-[44px] w-full" loading={busy} disabled={code.join("").length < 6} onClick={submitOtp}>Verify &amp; sign in</Button>
              <button onClick={() => setCode(Array(6).fill(""))} className="mt-3 min-h-[44px] w-full text-center text-[13px] font-semibold text-[var(--purple)] hover:underline">Resend code</button>
            </>
          )}
        </div>
        </div>

        {/* trust footer — bottom of the panel */}
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[12px] text-faint">
            <Building2 className="h-3.5 w-3.5" /> Company workspaces only · SOC 2 · Data stays in your region
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-faint/80">
            Powered by <SparkMark size={11} /> Vadal
          </p>
        </div>
      </div>

      <style>{`
        .af-step { animation: afStepIn .42s cubic-bezier(.22,.9,.3,1) both; }
        .af-slide { opacity: 0; transform: scale(1.06); transition: opacity 1.4s ease, transform 7.5s linear; will-change: opacity, transform; }
        .af-slide.is-on { opacity: 1; transform: scale(1); }
        .af-line { animation: afStepIn .7s cubic-bezier(.22,1,.36,1) both; animation-delay: .25s; }
        .af-panel { box-shadow: -24px 0 60px -30px rgba(0,0,0,.5); animation: afPanel .7s cubic-bezier(.22,1,.36,1) both; }
        @keyframes afPanel { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
        .af-otp-filled { border-color: var(--purple); animation: afOtpPop .22s cubic-bezier(.34,1.56,.64,1); }
        @keyframes afStepIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes afOtpPop { 0% { transform: scale(1); } 55% { transform: scale(1.09); } 100% { transform: scale(1); } }
        @media (max-width: 1023px) { .af-panel { animation-name: afStepIn; } }
        @media (prefers-reduced-motion: reduce) { .af-step, .af-otp-filled, .af-line, .af-panel { animation: none !important; } .af-slide { transition: none; transform: none; } }
      `}</style>
    </div>
  );
}
