"use client";
/* Auth/onboarding showcase panel (Fireflies-pattern, Vadal theme) — the right
   half of the split screen. A fixed dark canvas with a drifting grid, living
   Aurora glows, a Ken-Burns photographic backdrop of real workplace moments
   (generated for Vadal — office celebration + night-shift worker, the personas
   the product serves), floating REAL product-UI cards (recreated with the DS
   components) and a customer quote. `variant` picks the product moment, so each
   onboarding step showcases the surface it's setting up. All motion respects
   prefers-reduced-motion. */
import * as React from "react";
import { CalendarClock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, SparkMark } from "@vadal/design-system";

export type ShowcaseVariant = "pulse" | "ai" | "recognition" | "manager" | "branding" | "privacy";

/* Photographic moments (generated, in public/auth/) — office energy for the
   engagement stories, the night-shift colleague for the trust/deskless ones. */
const PHOTO: Record<ShowcaseVariant, { src: string; alt: string }> = {
  pulse: { src: "/auth/team-celebration.jpg", alt: "" },
  ai: { src: "/auth/team-celebration.jpg", alt: "" },
  recognition: { src: "/auth/team-celebration.jpg", alt: "" },
  branding: { src: "/auth/team-celebration.jpg", alt: "" },
  manager: { src: "/auth/nightshift-worker.jpg", alt: "" },
  privacy: { src: "/auth/nightshift-worker.jpg", alt: "" },
};

/* tiny sparkline (same construction as ManagerHub's) */
function Spark({ data, color, w = 96, h = 30 }: { data: number[]; color: string; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden className="overflow-visible">
      <polyline points={pts} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="spark-draw" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / span) * (h - 4) - 2} r={2.5} fill={color} />
    </svg>
  );
}

function Card({ className = "", children, order = 0 }: { className?: string; children: React.ReactNode; order?: number }) {
  return (
    <div
      className={`sc-card rounded-2xl border border-white/[0.08] bg-[#1b1b22]/95 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] backdrop-blur-sm ${className}`}
      style={{ ["--ord" as string]: order }}
    >
      {children}
    </div>
  );
}

/* ── the floating product moments ─────────────────────────────── */

function PulseCards() {
  return (
    <>
      <Card className="w-[240px]" order={0}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Org health</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[34px] font-bold leading-none tracking-tight text-white">82</span>
          <span className="flex items-center gap-0.5 text-[12px] font-bold text-emerald-400"><TrendingUp className="h-3.5 w-3.5" /> 4</span>
        </div>
        <div className="mt-2"><Spark data={[64, 66, 68, 71, 73, 75, 78, 82]} color="#8b7cf8" w={170} /></div>
        <p className="mt-2 text-[11px] text-zinc-500">Top 25% of GCC benchmarks</p>
      </Card>
      <Card className="ml-auto mt-3 w-[250px]" order={1}>
        <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#8b7cf8]" /><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Vadal insight</span></div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">Recognition is lifting engagement <b className="text-white">+0.71 correlated</b> — workload in Plant Ops is holding it back.</p>
      </Card>
    </>
  );
}

function AiCards() {
  return (
    <>
      <Card className="ml-auto w-[230px]" order={0}>
        <div className="rounded-xl bg-[#6d5df0] px-3 py-2 text-[12.5px] leading-relaxed text-white">How many paid leaves do I have left?</div>
      </Card>
      <Card className="mt-2 w-[266px]" order={1}>
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
      <Card className="w-[264px]" order={0}>
        <div className="flex items-center gap-2">
          <Avatar src="/avatars/user-8.svg" name="Priya Sharma" size="sm" />
          <p className="text-[12px] text-zinc-400"><b className="font-semibold text-white">Anita</b> recognised <b className="font-semibold text-white">Priya</b></p>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#6d5df0]/20 px-2 py-0.5 text-[10.5px] font-semibold text-[#a99df9]">🎯 Ownership</span>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">Brilliant work on the onboarding flow — clean, and shipped a day early.</p>
        <p className="mt-2 text-[11px] text-zinc-500">❤️ 24 · +50 pts</p>
      </Card>
      <Card className="ml-auto mt-2 w-[190px]" order={1}>
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
      <Card className="w-[256px]" order={0}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Your team today</p>
        <div className="mt-2 flex items-center gap-3">
          <Avatar src="/avatars/user-1.svg" name="Rohan Mehta" size="sm" />
          <div className="min-w-0 flex-1"><p className="text-[12.5px] font-semibold text-white">Rohan Mehta</p><p className="text-[10.5px] text-zinc-500">Senior Designer</p></div>
          <div className="flex items-center gap-1"><span className="text-[15px] font-bold text-rose-400">58</span><TrendingDown className="h-3.5 w-3.5 text-rose-400" /></div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-400"><CalendarClock className="h-3 w-3 text-amber-400" /> 1:1 overdue · 6 weeks — AI prep ready</div>
      </Card>
      <Card className="ml-auto mt-2 w-[236px]" order={1}>
        <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#8b7cf8]" /><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Coaching</span></div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-300">A 20-minute check-in this week is your single highest-impact action.</p>
      </Card>
    </>
  );
}

function BrandingCards() {
  return (
    <>
      <Card className="w-[264px]" order={0}>
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
      <Card className="ml-auto mt-2 w-[210px]" order={1}>
        <p className="text-[12px] leading-relaxed text-zinc-300">Your logo, your colour — Vadal steps back so it feels like <b className="text-white">your</b> product.</p>
      </Card>
    </>
  );
}

function PrivacyCards() {
  return (
    <>
      <Card className="w-[250px]" order={0}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Confidential by design</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-zinc-300">
          <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Anonymity threshold · 5</li>
          <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Check-ins private to each person</li>
          <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> AI scoped to your workspace</li>
        </ul>
      </Card>
      <Card className="ml-auto mt-2 w-[220px]" order={1}>
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
  const photo = PHOTO[variant];
  return (
    <div className="relative hidden h-full min-h-screen flex-col justify-between overflow-hidden bg-[#101014] p-10 lg:flex">
      {/* drifting grid */}
      <div className="sc-grid pointer-events-none absolute inset-0 opacity-[0.5]" aria-hidden />
      {/* living aurora */}
      <div className="sc-aurora-a pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full blur-3xl" aria-hidden />
      <div className="sc-aurora-b pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full blur-3xl" aria-hidden />

      {/* product moment: photo backdrop card + floating UI cards (remounts per variant → staggered entrance) */}
      <div key={variant} className="relative mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center">
        <div className="sc-photo relative -rotate-2 overflow-hidden rounded-[22px] border border-white/[0.08] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.alt} className="sc-kenburns h-[300px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101014]/85 via-[#101014]/20 to-transparent" aria-hidden />
        </div>
        <div className="relative z-10 -mt-24 px-2">
          {v.node}
        </div>
        <p className="sc-caption mt-6 text-center text-[13.5px] leading-relaxed text-zinc-400">{v.caption}</p>
      </div>

      {/* testimonial — the social-proof slot */}
      <div className="relative mx-auto w-full max-w-[360px]">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/oliandhue-icon.svg" alt="oliandhue" className="rounded" style={{ height: 18, width: 18 }} />
          <span className="text-[12px] font-semibold text-zinc-300">oliandhue</span>
        </div>
        <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-300">&ldquo;The first tool our people open every morning — and the first time engagement moved the business numbers.&rdquo;</p>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar src="/avatars/user-6.svg" name="Pradeep Kumar" size="sm" />
          <div><p className="text-[12px] font-semibold text-white">Pradeep Kumar</p><p className="text-[11px] text-zinc-500">CEO, oliandhue</p></div>
        </div>
      </div>

      <style>{`
        .sc-grid { background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 44px 44px; animation: scGridPan 60s linear infinite; }
        .sc-aurora-a { background: radial-gradient(circle, #818cf8 0%, #2dd4bf 65%, transparent 75%); opacity: .38; animation: scAuroraA 16s ease-in-out infinite alternate; }
        .sc-aurora-b { background: radial-gradient(circle, #6d5df0, transparent 70%); opacity: .24; animation: scAuroraB 20s ease-in-out infinite alternate; }
        .sc-photo { animation: scPhotoIn .7s cubic-bezier(.22,.9,.3,1) both; }
        .sc-kenburns { animation: scKenburns 26s ease-in-out infinite alternate; }
        .sc-card { animation: scCardIn .6s cubic-bezier(.22,.9,.3,1) both, scFloat 7s ease-in-out calc(.7s + var(--ord) * .9s) infinite alternate; animation-delay: calc(.18s + var(--ord) * .14s), calc(.9s + var(--ord) * .9s); }
        .sc-caption { animation: scCardIn .6s ease-out .5s both; }
        @keyframes scGridPan { from { background-position: 0 0; } to { background-position: 44px 88px; } }
        @keyframes scAuroraA { from { transform: translate(0,0) scale(1); } to { transform: translate(-46px,40px) scale(1.18); } }
        @keyframes scAuroraB { from { transform: translate(0,0) scale(1.05); } to { transform: translate(40px,-36px) scale(.92); } }
        @keyframes scPhotoIn { from { opacity: 0; transform: rotate(-2deg) translateY(22px) scale(.97); } to { opacity: 1; transform: rotate(-2deg) translateY(0) scale(1); } }
        @keyframes scKenburns { from { transform: scale(1.02) translate(0,0); } to { transform: scale(1.13) translate(-12px,-8px); } }
        @keyframes scCardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scFloat { from { transform: translateY(0); } to { transform: translateY(-8px); } }
        @media (prefers-reduced-motion: reduce) {
          .sc-grid, .sc-aurora-a, .sc-aurora-b, .sc-kenburns, .sc-card, .sc-photo, .sc-caption { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
