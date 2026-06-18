/* ════════════════════════════════════════════════════════════════════
   OLI&HUE'S PICK — the recommended Vadal identity.
   Iris (colour) × Quiet Clarity (Hanken Grotesk type). A full brand
   case study / mini-guidelines: lockup, anatomy, clear space, sizing,
   variations, app icon, colour, type, misuse, in-context. The page is
   itself set in Hanken — it demonstrates the pick.
   Lockup spacing is the established SVG (public/brand/lockup-*.svg).
   ════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import Link from "next/link";
import { Mark, IRIS_PICK } from "@/components/mark";

export const metadata: Metadata = {
  title: "Vadal.ai — Oli&Hue’s pick · Iris × Quiet Clarity",
  description: "The recommended Vadal identity: the Iris gradient mark and the Hanken Grotesk wordmark — a full brand case study.",
};

const H = "var(--font-hanken)";
const P = IRIS_PICK;

function PickMark({ id, size, flag = true }: { id: string; size: number; flag?: boolean }) {
  return <Mark id={id} stops={P.stops} star={P.star} flagOpacity={flag ? P.flagOpacity : P.flagOpacity} size={size} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint" style={{ fontFamily: H }}>{children}</p>;
}

const COLOURS = [
  { name: "Iris violet", hex: "#AB6FFF", role: "Gradient start — intelligence, imagination", bg: "#AB6FFF", ink: "#fff" },
  { name: "Iris indigo", hex: "#4C54E3", role: "Gradient end — depth, trust", bg: "#4C54E3", ink: "#fff" },
  { name: "Spark amber", hex: "#FFB14E", role: "The AI moment — warmth, held in reserve", bg: "#FFB14E", ink: "#3a2a08" },
  { name: "Ink", hex: "#0D0B16", role: "Wordmark & type on light", bg: "#0D0B16", ink: "#fff" },
  { name: "Surface", hex: "#F6F7F9", role: "Light canvas", bg: "#F6F7F9", ink: "#0D0B16" },
];

const WEIGHTS = [
  { w: 400, label: "Regular" },
  { w: 500, label: "Medium" },
  { w: 600, label: "Semibold" },
  { w: 700, label: "Bold" },
];

const SCALE = [
  { label: "Display", px: 56, w: 700, sample: "Know your people" },
  { label: "Heading", px: 32, w: 600, sample: "Workforce health, at a glance" },
  { label: "Body", px: 17, w: 400, sample: "Everything legible, nothing shouting — so the only thing that stands out is the answer." },
  { label: "Caption", px: 13, w: 500, sample: "Updated 2 minutes ago · all teams" },
];

const DONTS = [
  "Don’t stretch or distort the mark",
  "Don’t recolour the flag or the spark",
  "Don’t change the mark-to-wordmark gap",
  "Don’t place it on a busy or low-contrast background",
];

export default function Pick() {
  return (
    <main className="overflow-x-clip pb-px" style={{ fontFamily: H, color: "#1a1a22" }}>
      {/* hero */}
      <div className="mx-auto max-w-[1180px] px-6 pt-12 sm:px-10 sm:pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-faint transition-colors hover:text-ink" style={{ fontFamily: H }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          All directions
        </Link>
        <div className="mt-10 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ background: "#efeaff", color: "#5b4bd6" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: "#7c5cf8" }} />
          Oli&amp;Hue’s pick · the recommended identity
        </div>
        <h1 className="mt-6 text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.03em]">
          Iris{" "}
          <span style={{ background: P.css, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>×</span>{" "}
          Quiet Clarity.
        </h1>
        <p className="mt-6 max-w-[62ch] text-[19px] leading-relaxed text-muted">
          One identity that holds the brand’s whole promise: the <b>Iris</b> mark carries the
          intelligence with a spark of warmth, and <b>Hanken Grotesk</b> gives it a calm, legible
          voice you trust without noticing. Here’s the system, end to end.
        </p>
      </div>

      {/* primary lockup — full-bleed dark, the established SVG */}
      <section className="relative left-1/2 mt-14 w-screen -translate-x-1/2" style={{ background: P.ink }}>
        <div className="mx-auto flex max-w-[1180px] items-center justify-center px-6 py-24 sm:py-32">
          <img src="/brand/lockup-dark.svg" alt="Vadal.ai primary lockup" className="w-full max-w-[620px]" />
        </div>
      </section>

      {/* rationale */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-28">
        <SectionLabel>Why this is the one</SectionLabel>
        <p className="mt-6 max-w-[24ch] text-[clamp(1.8rem,4.4vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
          The intelligence and the humanity, in one calm object.
        </p>
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-card p-8">
            <div className="mb-5 h-11 w-11 rounded-2xl" style={{ background: P.css }} />
            <h3 className="text-[20px] font-semibold tracking-tight">Iris carries the mind</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              Violet into indigo is the colour of intelligence and imagination — premium, modern,
              unmistakably AI — while the amber spark keeps a note of human warmth held in reserve.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-8">
            <div className="mb-5 flex h-11 items-center text-[28px] font-semibold" style={{ fontFamily: H }}>Aa</div>
            <h3 className="text-[20px] font-semibold tracking-tight">Quiet Clarity carries the trust</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              Hanken Grotesk reads as confidence you don’t notice — banking-calm and humane,
              flawless at small sizes, one family for every role across a whole enterprise.
            </p>
          </div>
        </div>
      </div>

      {/* the mark — anatomy */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-line" style={{ background: P.surface }}>
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 py-20 sm:px-10 sm:py-28 md:grid-cols-[440px_1fr]">
          <div className="flex items-center justify-center rounded-3xl bg-white p-10" style={{ border: "1px solid #e8eaef" }}>
            <PickMark id="anatomy" size={300} />
          </div>
          <div>
            <SectionLabel>The mark</SectionLabel>
            <h2 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.02em]">A flag, planted — with a spark.</h2>
            <div className="mt-8 space-y-6">
              {[
                ["The flag", "A V planted like a flag — Vadal arriving with intent. The brand’s stake in the ground for how the organisation should feel to work in."],
                ["The gradient", "Violet → indigo flows through the flag: a signal arriving and becoming decision-grade. Intelligence you can trust."],
                ["The spark", "A four-point star in amber — the AI moment, the instant thousands of signals become one clear, human insight. Held in reserve, never decoration."],
              ].map(([h, p], i) => (
                <div key={h} className="flex gap-4">
                  <span className="mt-1 text-[13px] font-semibold tabular-nums" style={{ color: "#7c5cf8" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[17px] font-semibold">{h}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* clear space + minimum size */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <SectionLabel>Clear space</SectionLabel>
            <h2 className="mt-5 text-[26px] font-bold tracking-tight">Give it room to breathe</h2>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-muted">
              Keep clear space equal to <b>x</b> — the height of the spark — on every side. The
              supplied lockup already carries this margin; never crowd it tighter.
            </p>
            <div className="mt-7 rounded-3xl p-6" style={{ background: P.surface, border: "1px solid #e8eaef" }}>
              <div className="relative rounded-xl bg-white" style={{ border: "1px dashed #c9b8ff", padding: "26px" }}>
                <img src="/brand/lockup-light.svg" alt="Lockup clear space" className="w-full" />
                <span className="absolute left-2 top-2 text-[11px] font-semibold" style={{ color: "#7c5cf8" }}>x</span>
                <span className="absolute right-2 bottom-2 text-[11px] font-semibold" style={{ color: "#7c5cf8" }}>x</span>
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>Minimum size</SectionLabel>
            <h2 className="mt-5 text-[26px] font-bold tracking-tight">Legible at any scale</h2>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-muted">
              Below these sizes, switch from the full lockup to the mark alone. The mark holds
              down to a 16px favicon.
            </p>
            <div className="mt-7 space-y-4">
              <div className="flex items-center justify-between gap-6 rounded-2xl border border-line bg-card px-6 py-5">
                <img src="/brand/lockup-light.svg" alt="" style={{ width: 180 }} />
                <span className="text-[13px] text-muted">Lockup · min <b className="text-ink">140px</b> wide</span>
              </div>
              <div className="flex items-center gap-6 rounded-2xl border border-line bg-card px-6 py-5">
                <PickMark id="min1" size={48} />
                <PickMark id="min2" size={32} />
                <PickMark id="min3" size={20} />
                <span className="text-[13px] text-muted">Mark · down to <b className="text-ink">16px</b> (favicon)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* variations */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-line bg-[#fafafb]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Logo variations</SectionLabel>
          <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-[-0.02em]">One system, every surface</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {/* lockup */}
            <Tile label="Primary lockup · light"><img src="/brand/lockup-light.svg" alt="" className="w-full max-w-[260px]" /></Tile>
            <Tile dark label="Primary lockup · dark"><img src="/brand/lockup-dark.svg" alt="" className="w-full max-w-[260px]" /></Tile>
            <Tile label="Mark only"><PickMark id="v-mark" size={96} /></Tile>
            <Tile dark label="Mark · dark"><PickMark id="v-mark-d" size={96} /></Tile>
            <Tile label="Wordmark only"><span className="text-[34px] font-medium tracking-[-0.01em]" style={{ fontFamily: H, color: P.ink }}>Vadal.ai</span></Tile>
            <Tile dark label="Wordmark · dark"><span className="text-[34px] font-medium tracking-[-0.01em]" style={{ fontFamily: H, color: "#fff" }}>Vadal.ai</span></Tile>
          </div>
        </div>
      </section>

      {/* app icon */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-28">
        <SectionLabel>App icon &amp; favicon</SectionLabel>
        <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-[-0.02em]">The mark, standing alone</h2>
        <div className="mt-10 flex flex-wrap items-end gap-6">
          <Figure caption="App icon · dark">
            <div className="flex h-[132px] w-[132px] items-center justify-center" style={{ background: P.ink, borderRadius: 30 }}><PickMark id="ic1" size={80} /></div>
          </Figure>
          <Figure caption="App icon · light">
            <div className="flex h-[132px] w-[132px] items-center justify-center" style={{ background: "#fff", borderRadius: 30, border: "1px solid #ececf1" }}><PickMark id="ic2" size={80} /></div>
          </Figure>
          <Figure caption="Avatar">
            <div className="flex h-[96px] w-[96px] items-center justify-center" style={{ background: P.ink, borderRadius: "50%" }}><PickMark id="ic3" size={56} /></div>
          </Figure>
          <Figure caption="Favicon · 32 / 16">
            <div className="flex items-end gap-4">
              <div className="flex h-12 w-12 items-center justify-center" style={{ background: P.ink, borderRadius: 9 }}><PickMark id="fv1" size={30} /></div>
              <div className="flex h-7 w-7 items-center justify-center" style={{ background: P.ink, borderRadius: 5 }}><PickMark id="fv2" size={18} /></div>
            </div>
          </Figure>
        </div>
      </div>

      {/* colour */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-line bg-[#fafafb]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Colour — Iris</SectionLabel>
          <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-[-0.02em]">A gradient that means something</h2>
          <div className="mt-8 h-28 rounded-3xl" style={{ background: P.css }} />
          <div className="mt-2 flex justify-between text-[13px] font-medium text-muted">
            <span>#AB6FFF&nbsp; Iris violet</span>
            <span>Iris indigo&nbsp; #4C54E3</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLOURS.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="flex h-24 items-end p-3" style={{ background: c.bg }}>
                  <span className="text-[12px] font-semibold" style={{ color: c.ink }}>{c.hex}</span>
                </div>
                <div className="p-4">
                  <div className="text-[14px] font-semibold">{c.name}</div>
                  <div className="mt-1 text-[12px] leading-snug text-muted">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* typography */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-28">
        <SectionLabel>Typography — Quiet Clarity</SectionLabel>
        <h2 className="mt-5 text-[clamp(2.4rem,7vw,5rem)] font-medium tracking-[-0.02em]">Hanken Grotesk</h2>
        <p className="mt-3 text-[13px] uppercase tracking-[0.16em] text-faint">Hanken Design Co. · humanist grotesque · one family, every role</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-4">
          {WEIGHTS.map((wt) => (
            <div key={wt.w} className="border-t border-line pt-4">
              <div className="text-[clamp(1.8rem,4vw,2.6rem)] leading-none" style={{ fontFamily: H, fontWeight: wt.w }}>Vadal</div>
              <div className="mt-3 text-[12px] text-faint">{wt.label} · {wt.w}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {SCALE.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-10">
              <div className="flex w-[130px] shrink-0 items-baseline gap-3">
                <span className="text-[14px] font-semibold">{s.label}</span>
                <span className="text-[12px] text-faint">{s.px}px</span>
              </div>
              <p className="min-w-0 flex-1 leading-tight" style={{ fontFamily: H, fontSize: `clamp(18px, ${s.px / 16}vw + 6px, ${s.px}px)`, fontWeight: s.w }}>{s.sample}</p>
            </div>
          ))}
        </div>
      </div>

      {/* misuse */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-line bg-[#fafafb]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Misuse</SectionLabel>
          <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-[-0.02em]">Protect the mark</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Dont label={DONTS[0]}><div style={{ transform: "scaleX(1.5)" }}><PickMark id="d1" size={64} /></div></Dont>
            <Dont label={DONTS[1]}><Mark id="d2" stops={[{ c: "#22c55e", o: 0 }, { c: "#16a34a", o: 1 }]} star="#ec4899" size={64} /></Dont>
            <Dont label={DONTS[2]}><div className="flex items-center gap-0.5"><PickMark id="d3" size={46} /><span className="text-[20px] font-medium" style={{ fontFamily: H }}>Vadal.ai</span></div></Dont>
            <Dont label={DONTS[3]} busy><PickMark id="d4" size={64} /></Dont>
          </div>
        </div>
      </section>

      {/* in context */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-28">
        <SectionLabel>In context</SectionLabel>
        <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold tracking-[-0.02em]">The identity, applied</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {/* app */}
          <div className="overflow-hidden rounded-3xl border border-line bg-card">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #ececf1" }}>
              <div className="flex items-center gap-2.5"><PickMark id="app1" size={26} /><span className="text-[15px] font-semibold" style={{ fontFamily: H }}>Vadal.ai</span></div>
              <div className="h-7 w-7 rounded-full" style={{ background: P.surface }} />
            </div>
            <div className="p-5">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-faint">Workforce health</div>
              <div className="mt-1 text-[40px] font-bold leading-none" style={{ fontFamily: H }}>82<span className="text-[18px] text-faint">/100</span></div>
              <div className="mt-4 h-2 w-full rounded-full" style={{ background: P.surface }}><div className="h-2 rounded-full" style={{ width: "82%", background: P.css }} /></div>
              <div className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fff5e9" }}>
                <span className="h-2 w-2 rounded-full" style={{ background: P.star }} />
                <span className="text-[12.5px]" style={{ fontFamily: H }}>AI noticed a dip in the Sales team</span>
              </div>
            </div>
          </div>
          {/* business card */}
          <div className="flex items-center justify-center rounded-3xl p-7" style={{ background: P.surface, border: "1px solid #e8eaef" }}>
            <div className="flex aspect-[1.75] w-full max-w-[300px] flex-col justify-between rounded-2xl p-6" style={{ background: P.ink }}>
              <PickMark id="bc" size={40} />
              <div style={{ fontFamily: H }}>
                <div className="text-[15px] font-semibold text-white">Pradeep Kumar</div>
                <div className="text-[12px] text-white/55">Founder · Vadal.ai</div>
              </div>
            </div>
          </div>
          {/* signage */}
          <div className="flex flex-col items-center justify-center gap-5 rounded-3xl p-7" style={{ background: P.css }}>
            <div className="flex h-[120px] w-full items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
              <span className="text-[34px] font-semibold text-white" style={{ fontFamily: H }}>Vadal.ai</span>
            </div>
            <span className="text-[12px] text-white/80" style={{ fontFamily: H }}>Signage · gradient panel</span>
          </div>
        </div>
      </div>

      {/* closing */}
      <section className="relative left-1/2 w-screen -translate-x-1/2" style={{ background: P.ink }}>
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center sm:py-32">
          <PickMark id="close" size={84} />
          <h2 className="mx-auto mt-8 max-w-[20ch] text-[clamp(1.8rem,4.4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            Iris × Quiet Clarity — the identity we’d ship.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[16px] leading-relaxed text-white/60" style={{ fontFamily: H }}>
            Intelligent and human in the mark, calm and trustworthy in the type. One system, ready
            for the product, the deck and the door.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-10">
        <div className="border-t border-line pt-6 text-[12.5px] text-faint" style={{ fontFamily: H }}>
          Oli&amp;Hue’s pick · Iris × Quiet Clarity — source lockups in <code>brand/logo/pick/</code>.
        </div>
      </div>
    </main>
  );
}

/* ── small building blocks ── */

function Tile({ label, dark, children }: { label: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="flex h-[150px] items-center justify-center p-6" style={{ background: dark ? IRIS_PICK.ink : "#fff" }}>{children}</div>
      <div className="bg-card px-4 py-3 text-[12.5px] text-muted" style={{ fontFamily: "var(--font-hanken)" }}>{label}</div>
    </div>
  );
}

function Figure({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="text-[12px] text-faint" style={{ fontFamily: "var(--font-hanken)" }}>{caption}</span>
    </div>
  );
}

function Dont({ label, busy, children }: { label: string; busy?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="relative flex h-[150px] items-center justify-center overflow-hidden rounded-2xl border border-line"
        style={busy ? { background: "conic-gradient(from 0deg,#f43f5e,#f59e0b,#22c55e,#3b82f6,#f43f5e)" } : { background: "#fff" }}
      >
        {children}
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#ffe4e4] text-[13px] font-bold text-[#d4322d]">✗</span>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-muted" style={{ fontFamily: "var(--font-hanken)" }}>{label}</p>
    </div>
  );
}
