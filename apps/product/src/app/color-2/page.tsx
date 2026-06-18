/* ════════════════════════════════════════════════════════════════════
   DIRECTION 02 · COLOUR — brand case study (agency-style, image-led)
   Where Direction 1 keeps the flag blue and lets the spark speak,
   Direction 2 lets the WHOLE mark speak — a living gradient that runs
   warm↔cool: human feeling flowing into intelligence. Four moods.
   ════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import Link from "next/link";
import { Mark, COLOR2, type Grad } from "@/components/mark";

export const metadata: Metadata = {
  title: "Vadal.ai — Direction 02 · Colour",
  description:
    "A multi-colour gradient identity — the whole mark becomes a spectrum of meaning. A Stage 2 brand case study.",
};

const cssGrad = (stops: { c: string; o: number }[]) =>
  `linear-gradient(135deg, ${stops.map((s) => `${s.c} ${Math.round(s.o * 100)}%`).join(", ")})`;

function GradPlate({
  mode,
  grad,
  id,
  size = 196,
  h = "h-[300px] sm:h-[360px]",
}: {
  mode: "light" | "dark";
  grad: Grad;
  id: string;
  size?: number;
  h?: string;
}) {
  const g = grad[mode];
  return (
    <div
      className={`flex flex-1 items-center justify-center rounded-3xl ${h}`}
      style={{
        background: mode === "light" ? "#f4f6f9" : "#0b0d12",
        border: mode === "light" ? "1px solid #e8eaef" : "1px solid #181b22",
      }}
    >
      <Mark id={`${id}-${mode}`} stops={g.stops} star={g.star} size={size} />
    </div>
  );
}

const WHY = [
  {
    h: "Warm to cool is the brand",
    p: "Every gradient runs from a warm hue to a cool one — human feeling flowing into intelligence. That sweep is Vadal’s thesis in one image: Human pulse, read by AI.",
  },
  {
    h: "Many colours, the full range of feeling",
    p: "Engagement isn’t one mood. A multi-colour identity says the platform holds the whole spectrum of how people feel — not a single flat number.",
  },
  {
    h: "A gradient feels alive",
    p: "A flat logo sits still; a gradient moves and breathes. For an always-on, AI-native product, the mark should feel like a pulse, not a stamp.",
  },
];

const ROLES = [
  ["Iris", "Leadership & product — the premium, intelligent face."],
  ["Daybreak", "Employee-facing — the warm app you open every morning."],
  ["Aurora", "Data & insight moments — clarity in motion."],
  ["Bloom", "Recognition & culture — the brand at its most alive."],
];

export default function Direction2() {
  const hero = COLOR2[0]; // Iris

  return (
    <main className="overflow-x-clip pb-px">
      {/* ── hero ── */}
      <div className="mx-auto max-w-[1180px] px-6 pt-12 sm:px-10 sm:pt-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-grotesk text-[13px] font-medium text-faint transition-colors hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          All directions
        </Link>
        <p className="mt-10 font-grotesk text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7c5cf8]">
          Direction 02 · Colour
        </p>
        <h1 className="mt-5 max-w-[18ch] font-grotesk text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[0.97] tracking-[-0.035em]">
          One mark, a whole{" "}
          <span style={{ background: cssGrad(hero.light.stops), WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            spectrum
          </span>
          .
        </h1>
        <p className="mt-7 max-w-[60ch] text-[18px] leading-relaxed text-muted">
          Direction 1 keeps the flag blue and lets the spark speak. Direction 2 lets the entire
          mark speak — a living gradient where flag and star both carry colour, and each one is a mood.
        </p>
      </div>

      {/* ── big hero plate (full-bleed dark) ── */}
      <section
        className="relative left-1/2 mt-14 w-screen -translate-x-1/2"
        style={{ background: "radial-gradient(120% 120% at 50% -10%, #16131f, #0a0a10 65%)" }}
      >
        <div className="relative mx-auto flex max-w-[1180px] items-center justify-center px-6 py-24 sm:py-32">
          <div className="absolute h-[420px] w-[420px] rounded-full opacity-50 blur-[90px]" style={{ background: "radial-gradient(circle, rgba(140,92,248,0.5), transparent 65%)" }} />
          <div className="relative">
            <Mark id="hero" stops={hero.dark.stops} star={hero.dark.star} size={300} />
          </div>
        </div>
      </section>

      {/* ── concept ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
        <p className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">The idea</p>
        <p className="mt-6 max-w-[26ch] font-grotesk text-[clamp(1.8rem,4.4vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.02em]">
          Vadal isn’t one feeling. It’s a spectrum — and the mark can hold all of it.
        </p>
      </div>

      {/* ── why a spectrum ── */}
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10">
        <h2 className="max-w-[20ch] font-grotesk text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em]">
          Why a spectrum fits Vadal.ai
        </h2>
        <p className="mt-6 max-w-[64ch] text-[19px] leading-relaxed text-[#2c2d36]">
          The product turns thousands of human signals into intelligence. A gradient that travels
          from warm to cool puts that whole story in the logo — feeling on one end, clarity on the
          other, the journey between them visible at a glance.
        </p>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {WHY.map((r) => (
            <div key={r.h}>
              <div className="mb-5 h-12 w-12 rounded-2xl" style={{ background: cssGrad(COLOR2[2].light.stops) }} />
              <h3 className="font-grotesk text-[18px] font-semibold tracking-tight">{r.h}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{r.p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── four gradients ── */}
      <div className="mx-auto max-w-[1180px] px-6 pt-24 sm:px-10 sm:pt-32">
        <h2 className="max-w-[16ch] font-grotesk text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em]">
          Four gradients, four moods
        </h2>
        <p className="mt-6 max-w-[60ch] text-[18px] leading-relaxed text-muted">
          Each runs warm↔cool and stays analogous, so it’s always clean — never muddy. Iris and
          Daybreak grow straight out of your violet and yellow.
        </p>

        <div className="mt-16 space-y-24">
          {COLOR2.map((g, i) => (
            <div key={g.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="font-grotesk text-[14px] font-semibold tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-grotesk text-[clamp(1.6rem,3.4vw,2.5rem)] font-semibold tracking-[-0.01em]">{g.name}</h3>
                  <span
                    className="rounded-full px-3 py-1 font-grotesk text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                    style={{ background: cssGrad(g.light.stops) }}
                  >
                    {g.tag}
                  </span>
                </div>
              </div>
              <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-[#2c2d36]">{g.meaning}</p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <GradPlate mode="light" id={`g-${g.key}`} grad={g} size={210} />
                <GradPlate mode="dark" id={`g-${g.key}`} grad={g} size={210} />
              </div>

              {/* gradient + spark swatch */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="h-9 flex-1 min-w-[200px] rounded-lg" style={{ background: cssGrad(g.light.stops) }} />
                <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2">
                  <span className="h-5 w-5 rounded-md" style={{ background: g.light.star }} />
                  <span className="font-grotesk text-[12px] text-muted">spark {g.light.star}</span>
                </div>
              </div>
              <p className="mt-3 font-grotesk text-[12px] text-faint">
                {g.light.stops.map((s) => s.c).join("  →  ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── how to use it (full-bleed) ── */}
      <section className="relative left-1/2 mt-28 w-screen -translate-x-1/2" style={{ background: "linear-gradient(180deg,#faf9ff,#fff)" }}>
        <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#efeaff] px-3.5 py-1.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b4bd6]">
            <span className="h-2 w-2 rounded-full" style={{ background: "#7c5cf8" }} />
            How we’d use it
          </span>
          <h2 className="mt-6 max-w-[22ch] font-grotesk text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.025em]">
            Not one colour — a system with roles.
          </h2>
          <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-[#3c3d46]">
            Direction 2’s whole point is range, so we wouldn’t crown a single winner. We’d give each
            gradient a job — <b>Iris</b> leads as the premium, intelligent face, with <b>Daybreak</b>{" "}
            as its warm, human-facing counterpart. Together those two <i>are</i> the warm-to-cool brand;
            Aurora and Bloom are accents for the moments that call for them.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ROLES.map(([name, role], i) => (
              <div key={name} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
                <Mark id={`r-${i}`} stops={COLOR2[i].light.stops} star={COLOR2[i].light.star} size={52} />
                <div>
                  <div className="font-grotesk text-[15px] font-semibold">{name}</div>
                  <div className="text-[13px] leading-snug text-muted">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[12.5px] text-faint">
          <span>
            Direction 02 · colour — your flat starters in{" "}
            <code className="font-grotesk">brand/logo/color-direction-2/</code>; gradient system above.
          </span>
          <Link href="/" className="font-grotesk font-semibold text-[#7c5cf8]">
            ← All directions
          </Link>
        </div>
      </div>
    </main>
  );
}
