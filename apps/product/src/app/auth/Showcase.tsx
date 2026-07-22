"use client";
/* Auth/onboarding showcase panel (Fireflies-pattern, Vadal theme) — the right
   half of the split screen. A fixed dark canvas (same surface as the Ask-Vadal
   card) with a fine grid, an Aurora glow, floating REAL product-UI cards
   (recreated with the actual DS components so they're crisp and always in sync)
   and a customer quote. `variant` picks which product moment is shown, so each
   onboarding step can showcase the surface it's setting up. */
import * as React from "react";
import { CalendarClock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, SparkMark } from "@vadal/design-system";

export type ShowcaseVariant = "pulse" | "ai" | "recognition" | "manager" | "branding" | "privacy";

/* tiny sparkline (same construction as ManagerHub's) */
function Spark({ data, color, w = 96, h = 30 }: { data: number[]; color: string; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden className="overflow-visible">
      <polyline points={pts} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / span) * (h - 4) - 2} r={2.5} fill={color} />
    </svg>
  );
}

function Card({ className = "", children, float = 0 }: { className?: string; children: React.ReactNode; float?: number }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#1b1b22] p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] ${className}`}
      style={{ animation: `authFloat 7s ease-in-out ${float}s infinite alternate` }}
    >
      {children}
    </div>
  );
}

/* ── the floating product moments ─────────────────────────────── */

function PulseCards() {
  return (
    <>
      <Card className="w-[240px]" float={0}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Org health</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[34px] font-bold leading-none tracking-tight text-white">82</span>
          <span className="flex items-center gap-0.5 text-[12px] font-bold text-emerald-400"><TrendingUp className="h-3.5 w-3.5" /> 4</span>
        </div>
        <div className="mt-2"><Spark data={[64, 66, 68, 71, 73, 75, 78, 82]} color="#8b7cf8" w={170} /></div>
        <p className="mt-2 text-[11px] text-zinc-500">Top 25% of GCC benchmarks</p>
      </Card>
      <Card className="ml-auto w-[250px] mt-3" float={0.9}>
        <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#8b7cf8]" /><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Vadal insight</span></div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">Recognition is lifting engagement <b className="text-white">+0.71 correlated</b> — workload in Plant Ops is holding it back.</p>
      </Card>
    </>
  );
}

function AiCards() {
  return (
    <>
      <Card className="ml-auto w-[230px]" float={0}>
        <div className="rounded-xl bg-[#6d5df0] px-3 py-2 text-[12.5px] leading-relaxed text-white">How many paid leaves do I have left?</div>
      </Card>
      <Card className="w-[266px] -mt-2" float={0.8}>
        <div className="flex items-center gap-1.5"><span className="ai-grad grid h-5 w-5 place-items-center rounded-full"><SparkMark size={11} tone="solid" /></span><span className="text-[11px] font-bold text-white">Vadal AI</span></div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">You have <b className="text-white">14 paid days</b> left this year. Want me to start a request?</p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-full bg-[#6d5df0] px-2.5 py-1 text-[10.5px] font-semibold text-white">Start leave request</span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-semibold text-zinc-300 ring-1 ring-white/10">View balance</span>
        </div>
      </Card>
    </>
  );
}

function RecognitionCards() {
  return (
    <>
      <Card className="w-[264px]" float={0}>
        <div className="flex items-center gap-2">
          <Avatar src="/avatars/user-8.svg" name="Priya Sharma" size="sm" />
          <p className="text-[12px] text-zinc-400"><b className="font-semibold text-white">Anita</b> recognised <b className="font-semibold text-white">Priya</b></p>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#6d5df0]/20 px-2 py-0.5 text-[10.5px] font-semibold text-[#a99df9]">🎯 Ownership</span>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">Brilliant work on the onboarding flow — clean, and shipped a day early.</p>
        <p className="mt-2 text-[11px] text-zinc-500">❤️ 24 · +50 pts</p>
      </Card>
      <Card className="ml-auto w-[190px] -mt-4" float={1.1}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Your streak</p>
        <p className="mt-1 text-[24px] font-bold leading-none text-white">12 days 🔥</p>
        <p className="mt-1.5 text-[11px] text-zinc-500">#7 on your team · 4,180 pts</p>
      </Card>
    </>
  );
}

function ManagerCards() {
  return (
    <>
      <Card className="w-[256px]" float={0}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Your team today</p>
        <div className="mt-2 flex items-center gap-3">
          <Avatar src="/avatars/user-1.svg" name="Rohan Mehta" size="sm" />
          <div className="min-w-0 flex-1"><p className="text-[12.5px] font-semibold text-white">Rohan Mehta</p><p className="text-[10.5px] text-zinc-500">Senior Designer</p></div>
          <div className="flex items-center gap-1"><span className="text-[15px] font-bold text-rose-400">58</span><TrendingDown className="h-3.5 w-3.5 text-rose-400" /></div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-400"><CalendarClock className="h-3 w-3 text-amber-400" /> 1:1 overdue · 6 weeks — AI prep ready</div>
      </Card>
      <Card className="ml-auto w-[236px] -mt-3" float={0.9}>
        <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#8b7cf8]" /><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Coaching</span></div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">A 20-minute check-in this week is your single highest-impact action.</p>
      </Card>
    </>
  );
}

function BrandingCards() {
  return (
    <>
      <Card className="w-[264px]" float={0}>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/oliandhue-icon.svg" alt="" className="h-6 w-6 rounded-md" />
          <span className="text-[12px] font-semibold text-white">oliandhue</span>
          <span className="ml-auto flex gap-1">{["#5D63E1", "#12B981", "#F59E0B"].map((c) => <span key={c} className="h-4 w-4 rounded-md ring-1 ring-white/10" style={{ background: c }} />)}</span>
        </div>
        <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(93,99,225,0.14)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Tuesday, 9 June</p>
          <p className="mt-0.5 text-[15px] font-bold text-white">Good morning, <span className="text-[#8b8ffb]">Priya</span> 👋</p>
        </div>
      </Card>
      <Card className="ml-auto w-[210px] -mt-3" float={1}>
        <p className="text-[12px] leading-relaxed text-zinc-300">Your logo, your colour — Vadal steps back so it feels like <b className="text-white">your</b> product.</p>
      </Card>
    </>
  );
}

function PrivacyCards() {
  return (
    <>
      <Card className="w-[250px]" float={0}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Confidential by design</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-zinc-300">
          <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Anonymity threshold · 5</li>
          <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Check-ins private to each person</li>
          <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> AI scoped to your workspace</li>
        </ul>
      </Card>
      <Card className="ml-auto w-[220px] -mt-3" float={0.9}>
        <p className="text-[12px] leading-relaxed text-zinc-300">Data stays in your region · SOC 2 · no individual is ever singled out.</p>
      </Card>
    </>
  );
}

const VARIANTS: Record<ShowcaseVariant, { node: React.ReactNode; caption: string }> = {
  pulse: { node: <PulseCards />, caption: "Live pulse of the whole company — with the why, not just the score." },
  ai: { node: <AiCards />, caption: "Answers and actions in one place — HR that feels instant." },
  recognition: { node: <RecognitionCards />, caption: "Appreciation that flows daily — and shows up in the numbers." },
  manager: { node: <ManagerCards />, caption: "Managers see who needs them, with AI prep for every 1:1." },
  branding: { node: <BrandingCards />, caption: "White-label ready — your people see your brand, not ours." },
  privacy: { node: <PrivacyCards />, caption: "Built for trust from the first sign-in." },
};

export function Showcase({ variant = "pulse" }: { variant?: ShowcaseVariant }) {
  const v = VARIANTS[variant];
  return (
    <div className="relative hidden h-full min-h-screen flex-col justify-between overflow-hidden bg-[#141419] p-10 lg:flex">
      {/* fine grid + aurora */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "44px 44px" }} aria-hidden />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, #818cf8 0%, #2dd4bf 65%, transparent 75%)" }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, #6d5df0, transparent 70%)" }} aria-hidden />

      {/* product moment */}
      <div className="relative mx-auto flex w-full max-w-[340px] flex-1 flex-col justify-center gap-0">
        {v.node}
        <p className="mt-7 text-center text-[13.5px] leading-relaxed text-zinc-400">{v.caption}</p>
      </div>

      {/* testimonial — the Fireflies-style social proof */}
      <div className="relative mx-auto w-full max-w-[360px]">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/oliandhue-icon.svg" alt="oliandhue" className="h-4.5 w-4.5 rounded" style={{ height: 18, width: 18 }} />
          <span className="text-[12px] font-semibold text-zinc-300">oliandhue</span>
        </div>
        <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-300">&ldquo;The first tool our people open every morning — and the first time engagement moved the business numbers.&rdquo;</p>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar src="/avatars/user-6.svg" name="Pradeep Kumar" size="sm" />
          <div><p className="text-[12px] font-semibold text-white">Pradeep Kumar</p><p className="text-[11px] text-zinc-500">CEO, oliandhue</p></div>
        </div>
      </div>

      <style>{`@keyframes authFloat { from { transform: translateY(0); } to { transform: translateY(-8px); } }`}</style>
    </div>
  );
}
