/* ════════════════════════════════════════════════════════════════════
   DIRECTION 01 · COLOUR — brand case study (agency-style, image-led)
   Blue flag = the constant (trust). The four-point AI star = the variable
   that carries meaning. Argues blue, weighs four star colours, recommends.
   ════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import Link from "next/link";
import { Mark, FLAG, STARS, PICK } from "@/components/mark";

export const metadata: Metadata = {
  title: "Vadal.ai — Direction 01 · Colour",
  description:
    "Why the flag is blue, and which colour the AI star should carry. A Stage 2 brand case study.",
};

/* big display plate */
function Plate({
  mode,
  star,
  id,
  size = 188,
  h = "h-[300px] sm:h-[360px]",
}: {
  mode: "light" | "dark";
  star: string;
  id: string;
  size?: number;
  h?: string;
}) {
  const f = FLAG[mode];
  return (
    <div
      className={`flex flex-1 items-center justify-center rounded-3xl ${h}`}
      style={{
        background: mode === "light" ? "#f4f6f9" : "#0b0d12",
        border: mode === "light" ? "1px solid #e8eaef" : "1px solid #181b22",
      }}
    >
      <Mark id={`${id}-${mode}`} from={f.from} to={f.to} star={star} size={size} />
    </div>
  );
}

const BLUE_REASONS = [
  {
    h: "Trust is the category’s currency",
    p: "Engagement data is the most sensitive a company holds. People only open up to a brand that feels safe — and blue is the universal shorthand banks and healthcare reach for when they need to be believed.",
  },
  {
    h: "Built for the boardroom",
    p: "Vadal’s buyer is a CHRO defending workforce decisions to a board. Blue makes the tool read decision-grade — not a playful HR toy with confetti.",
  },
  {
    h: "The steady constant",
    p: "The flag never moves. It’s the reliable base the warm AI spark sits on — calm, competent, the stability you build a daily ritual on.",
  },
];

export default function Direction1() {
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
        <p className="mt-10 font-grotesk text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a7ae0]">
          Direction 01 · Colour
        </p>
        <h1 className="mt-5 max-w-[18ch] font-grotesk text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[0.97] tracking-[-0.035em]">
          Blue holds the trust. The spark carries the <span style={{ color: "#0a7ae0" }}>meaning</span>.
        </h1>
        <p className="mt-7 max-w-[60ch] text-[18px] leading-relaxed text-muted">
          The V flag is locked to blue — the constant. The four-point star is the AI, and it’s the
          one part of the mark allowed to change colour and speak.
        </p>
      </div>

      {/* ── big hero plate (full-bleed dark) ── */}
      <section
        className="relative left-1/2 mt-14 w-screen -translate-x-1/2"
        style={{ background: "radial-gradient(120% 120% at 50% -10%, #14181f, #0a0c10 65%)" }}
      >
        <div className="relative mx-auto flex max-w-[1180px] items-center justify-center px-6 py-24 sm:py-32">
          <div
            className="absolute h-[420px] w-[420px] rounded-full opacity-50 blur-[90px]"
            style={{ background: "radial-gradient(circle, rgba(0,125,255,0.45), transparent 65%)" }}
          />
          <div className="relative">
            <Mark id="hero" from={FLAG.dark.from} to={FLAG.dark.to} star={PICK.dark} size={300} />
          </div>
        </div>
      </section>

      {/* ── concept statement ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
        <p className="max-w-[20ch] font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          The idea
        </p>
        <p className="mt-6 max-w-[24ch] font-grotesk text-[clamp(1.8rem,4.4vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.02em]">
          The flag is fixed. The star is the one thing that moves — and it’s where the brand gets to be{" "}
          <span style={{ color: "#FF9E6B" }}>human</span>.
        </p>
      </div>

      {/* ── why blue ── */}
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10">
        <h2 className="font-grotesk text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em]">
          Why the flag is blue
        </h2>
        <p className="mt-6 max-w-[64ch] text-[19px] leading-relaxed text-[#2c2d36]">
          Blue is the colour institutions reach for when they need to be believed — calm, competent,
          stable. For a platform that turns people’s feelings into board-level decisions, that
          credibility has to arrive before a single word is read.
        </p>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {BLUE_REASONS.map((r) => (
            <div key={r.h}>
              <div className="mb-5 h-12 w-12 rounded-2xl" style={{ background: "linear-gradient(135deg,#0069EB,#029BEB)" }} />
              <h3 className="font-grotesk text-[18px] font-semibold tracking-tight">{r.h}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{r.p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── blue swatch showcase (full-bleed) ── */}
      <section className="relative left-1/2 mt-24 w-screen -translate-x-1/2 border-y border-line">
        <div className="mx-auto grid max-w-[1180px] gap-px sm:grid-cols-2" style={{ background: "var(--line)" }}>
          <div className="flex flex-col justify-between p-10 sm:p-14" style={{ background: "linear-gradient(140deg,#0069EB,#029BEB)" }}>
            <span className="font-grotesk text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">Flag blue · light</span>
            <span className="mt-16 font-grotesk text-[clamp(1.4rem,3vw,2.2rem)] font-medium text-white">#0069EB → #029BEB</span>
          </div>
          <div className="flex flex-col justify-between p-10 sm:p-14" style={{ background: "linear-gradient(140deg,#007DFF,#16AFFF)" }}>
            <span className="font-grotesk text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">Flag blue · dark (lifted)</span>
            <span className="mt-16 font-grotesk text-[clamp(1.4rem,3vw,2.2rem)] font-medium text-white">#007DFF → #16AFFF</span>
          </div>
        </div>
      </section>

      {/* ── the four star colours ── */}
      <div className="mx-auto max-w-[1180px] px-6 pt-24 sm:px-10 sm:pt-32">
        <h2 className="max-w-[16ch] font-grotesk text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em]">
          Four ways the star can speak
        </h2>
        <p className="mt-6 max-w-[60ch] text-[18px] leading-relaxed text-muted">
          Because the blue carries the trust, the star is free to carry meaning. Same mark, four
          messages.
        </p>

        <div className="mt-16 space-y-24">
          {STARS.map((s, i) => (
            <div key={s.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="font-grotesk text-[14px] font-semibold tabular-nums text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-grotesk text-[clamp(1.6rem,3.4vw,2.5rem)] font-semibold tracking-[-0.01em]">
                    {s.name}
                  </h3>
                  {s.key === "apricot" && (
                    <span className="rounded-full bg-[#fff0e4] px-3 py-1 font-grotesk text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b5602c]">
                      Our pick
                    </span>
                  )}
                </div>
                <span className="font-grotesk text-[13px] text-faint">
                  {s.light} · {s.dark}
                </span>
              </div>
              <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-[#2c2d36]">{s.meaning}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Plate mode="light" id={`c-${s.key}`} star={s.light} size={200} />
                <Plate mode="dark" id={`c-${s.key}`} star={s.dark} size={200} />
              </div>
              <p className="mt-5 text-[14px] leading-relaxed text-[#84776a]">{s.verdict}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── recommendation (full-bleed warm) ── */}
      <section
        className="relative left-1/2 mt-28 w-screen -translate-x-1/2"
        style={{ background: "linear-gradient(180deg,#fff7f0,#fffdfb)" }}
      >
        <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0e4] px-3.5 py-1.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b5602c]">
            <span className="h-2 w-2 rounded-full" style={{ background: PICK.light }} />
            Our recommendation
          </span>
          <h2 className="mt-6 max-w-[20ch] font-grotesk text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.025em]">
            Soft Apricot — the one human colour.
          </h2>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_minmax(320px,420px)] lg:items-start">
            <div className="space-y-5 text-[17px] leading-relaxed text-[#3c3d46]">
              <p>
                The star is the only part of the mark allowed to be human — so it should say the
                thing the whole brand is betting on. Of the four, apricot is the only colour that
                speaks <b>Human pulse</b>. Red reads as alarm, green as a status light, gold as a
                reward; <b>apricot reads as warmth, attention, care</b> — an AI that notices people
                gently and early. That’s Vadal in one colour.
              </p>
              <p>
                Against the cool blue flag it completes the duality the brand is built on:{" "}
                <b>blue is the system you can trust, apricot is the humanity inside it.</b> Warm
                against cool, the spark never disappears into the mark.
              </p>
              <p className="text-[#84776a]">
                One refinement: your soft peach glows on dark but washes out on light at small
                sizes. Deepen it a touch to <code className="text-[#3c3d46]">{PICK.light}</code> so
                the spark still registers as a 16px favicon. Keep <b>red strictly for in-product
                alerts</b> so it never loses its bite, and let <b>gold</b> be the recognition accent.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Plate mode="light" id="pick" star={PICK.light} size={150} h="h-[230px]" />
                <Plate mode="dark" id="pick" star={PICK.dark} size={150} h="h-[230px]" />
              </div>
              <div className="flex items-center justify-center gap-6 rounded-3xl border border-line bg-white py-6">
                <span className="font-grotesk text-[11px] uppercase tracking-[0.16em] text-faint">At 20px</span>
                <Mark id="sm-l" from={FLAG.light.from} to={FLAG.light.to} star={PICK.light} size={24} />
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#0b0d12" }}>
                  <Mark id="sm-d" from={FLAG.dark.from} to={FLAG.dark.to} star={PICK.dark} size={24} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[12.5px] text-faint">
          <span>
            Direction 01 · colour — source colorways in{" "}
            <code className="font-grotesk">brand/logo/color-direction-1/</code>. Final star pending sign-off.
          </span>
          <Link href="/" className="font-grotesk font-semibold text-[#0a7ae0]">
            ← All directions
          </Link>
        </div>
      </div>
    </main>
  );
}
