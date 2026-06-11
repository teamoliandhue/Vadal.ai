import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Why Fintech calm — Vadal.ai case study",
  description:
    "The case for Fintech calm as Vadal's lead design style: the buyer, the references, and the principles.",
};

/* ── the case study — why Fintech calm fits Vadal ─────────────────── */

const PRINCIPLES = [
  {
    n: "01",
    t: "Warm-gray canvas, floating white cards",
    d: "The interface recedes; the numbers come forward. Density that feels expensive, never crowded.",
  },
  {
    n: "02",
    t: "One brand colour, used sparingly",
    d: "Periwinkle #5266EB carries every action and accent. Restraint is what reads as confidence.",
  },
  {
    n: "03",
    t: "Numbers set like a bank statement",
    d: "Tabular figures, superscript decimals, quiet labels. Data you'd take to a board without reformatting.",
  },
  {
    n: "04",
    t: "Red is reserved for genuine risk",
    d: "Attrition alerts and flight-risk only. When this interface turns red, it means something.",
  },
];

const REASONS = [
  {
    t: "It matches who signs the contract",
    d: "Vadal is bought by CHROs and people leaders making crore-level, board-level decisions. They already trust this register — it is the language of Mercury, Ramp and Brex, tools built for people who own money and risk.",
  },
  {
    t: "Calm is the differentiator",
    d: "Every HR competitor shouts — bright illustration, confetti, gamified everything. A banking-grade surface positions Vadal as the intelligence layer, not another engagement toy.",
  },
  {
    t: "It survives daily use",
    d: "Leaders open this dashboard every morning. Calm density, soft shadows and restrained colour don't fatigue — the design stays out of the way of the decision.",
  },
  {
    t: "It pairs with an employee register",
    d: "Fintech calm leads for the buyer; GenAlpha's energy serves the workforce surface. One spine — periwinkle accents, near-black ink, warm neutrals — two registers of the same brand.",
  },
];

export default function FintechCaseStudy() {
  return (
    <main className="studio-root min-h-screen">
      {/* nav */}
      <header className="mx-auto flex h-[68px] w-full max-w-[1080px] items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: "var(--st-muted)" }}>
          <ArrowLeft size={15} /> Back to the deck
        </Link>
        <span className="st-eyebrow">Case study — design style</span>
      </header>

      <article className="mx-auto w-full max-w-[1080px] px-6 pb-28 sm:px-10">
        {/* hero */}
        <div className="pt-16 sm:pt-24">
          <p className="st-eyebrow" style={{ color: "var(--st-accent)" }}>Our pick · 01</p>
          <h1 className="st-display mt-5 max-w-3xl text-[clamp(2.6rem,7vw,5.4rem)]">
            Why{" "}
            <span style={{ color: "var(--st-accent)" }}>Fintech calm</span>{" "}
            fits Vadal.
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed" style={{ color: "var(--st-muted)" }}>
            Banking-grade calm for the person who signs the contract. Borrowed
            from the products CFOs and founders already trust — Mercury, Ramp,
            Brex — and rebuilt for people intelligence.
          </p>
        </div>

        {/* dashboard motif strip */}
        <div
          className="mt-14 flex items-end gap-3 rounded-[28px] px-10 pt-12"
          style={{ background: "#F6F6F4", border: "1px solid var(--st-line)" }}
          aria-hidden
        >
          {[44, 68, 56, 88, 72, 104, 92, 124].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-lg"
              style={{ height: h, background: i === 7 ? "#5266EB" : "#dcdce4" }}
            />
          ))}
        </div>

        {/* the case */}
        <section className="mt-20">
          <p className="st-eyebrow">The case</p>
          <div className="mt-6 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {REASONS.map((r) => (
              <div key={r.t}>
                <h2 className="st-display text-[20px]">{r.t}</h2>
                <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--st-muted)" }}>
                  {r.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* principles */}
        <section className="mt-20">
          <p className="st-eyebrow">The principles</p>
          <div className="mt-6 border-t" style={{ borderColor: "var(--st-line)" }}>
            {PRINCIPLES.map((p) => (
              <div
                key={p.n}
                className="grid gap-2 border-b py-6 sm:grid-cols-[60px_1fr_1.2fr] sm:items-baseline"
                style={{ borderColor: "var(--st-line)" }}
              >
                <span className="st-bignum text-[14px]" style={{ color: "var(--st-faint)" }}>{p.n}</span>
                <h3 className="st-display text-[19px]">{p.t}</h3>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--st-muted)" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center">
          <h2 className="st-display text-[clamp(2rem,5vw,3.6rem)]">
            See it{" "}
            <span style={{ color: "var(--st-accent)" }}>live.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--st-muted)" }}>
            The full Vadal dashboard, built in this style — workforce health,
            attrition, voice, recognition and impact.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/fintech" className="st-pill st-pill-ink">
              Explore the style <ArrowUpRight size={16} />
            </Link>
            <Link href="/" className="st-pill st-pill-ghost">
              Back to the deck
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
