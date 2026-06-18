/* ════════════════════════════════════════════════════════════════════
   STAGE 2 — home (http://localhost:3001)
   The directions showcase: Colour (2 directions) and Typography (6 —
   each a different way of thinking about the product). Image-led.
   ════════════════════════════════════════════════════════════════════ */

import Link from "next/link";
import { Mark, FLAG, PICK, COLOR2 } from "@/components/mark";
import { TYPE_DIRECTIONS } from "@/lib/type-directions";

const iris = COLOR2[0];

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Card({
  href,
  num,
  name,
  blurb,
  plate,
  compact,
}: {
  href: string;
  num: string;
  name: string;
  blurb: string;
  plate: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[24px] border border-line bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_64px_-40px_rgba(20,30,80,0.5)]"
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-t-[24px] ${compact ? "h-[176px]" : "h-[240px] sm:h-[280px]"}`}
        style={{ background: "radial-gradient(120% 130% at 50% 0%, #14181f 0%, #0b0d12 62%)" }}
      >
        {plate}
        <span className="absolute left-6 top-5 font-grotesk text-[12px] font-semibold uppercase tracking-[0.2em] text-white/50">{num}</span>
      </div>
      <div className={`flex items-center justify-between gap-5 ${compact ? "px-5 py-4" : "px-6 py-5"}`}>
        <div>
          <h3 className={`font-grotesk font-semibold tracking-tight ${compact ? "text-[17px]" : "text-[19px]"}`}>{name}</h3>
          <p className={`mt-1 max-w-[46ch] leading-relaxed text-muted ${compact ? "text-[12.5px]" : "text-[13.5px]"}`}>{blurb}</p>
        </div>
        {!compact && (
          <span className="flex items-center gap-2 whitespace-nowrap font-grotesk text-[13.5px] font-semibold text-[#0a7ae0]">
            Open <Arrow />
          </span>
        )}
      </div>
    </Link>
  );
}

function Section({ label, count, cols = 2, children }: { label: string; count: string; cols?: 2 | 3; children: React.ReactNode }) {
  return (
    <section className="pb-4">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="font-grotesk text-[13px] font-semibold uppercase tracking-[0.2em] text-faint">{label}</h2>
        <span className="font-grotesk text-[12px] text-faint/70">{count}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className={`grid gap-6 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>{children}</div>
    </section>
  );
}

/* wordmark specimen — Iris mark + "Vadal.ai" set in a given typeface */
function WordPlate({ id, font, size = 44, fs = "clamp(1.5rem,2.6vw,2.1rem)" }: { id: string; font: string; size?: number; fs?: string }) {
  return (
    <div className="flex items-center gap-3 px-5">
      <Mark id={id} stops={iris.dark.stops} star={iris.dark.star} size={size} />
      <span className="font-medium leading-none tracking-[-0.02em] text-white" style={{ fontFamily: font, fontSize: fs }}>
        Vadal.ai
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 sm:px-10">
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-20">
        <p className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a7ae0]">Oli&amp;Hue × Vadal.ai</p>
        <h1 className="mt-5 max-w-[16ch] font-grotesk text-[clamp(2.6rem,7.5vw,5.2rem)] font-bold leading-[0.97] tracking-[-0.035em]">
          Brand directions.
        </h1>
        <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-muted">
          Two axes — colour and type. Each direction is a different way of thinking about the Vadal
          product. Open one to see the thinking.
        </p>
      </section>

      <div className="space-y-14 pb-24">
        <Section label="Colour" count="2 directions">
          <Card href="/color-1" num="Direction 01" name="The constant blue" blurb="Blue holds the trust; the AI star is the one thing that changes — and speaks." plate={<Mark id="c1" from={FLAG.dark.from} to={FLAG.dark.to} star={PICK.dark} size={150} />} />
          <Card href="/color-2" num="Direction 02" name="The gradient spectrum" blurb="A multi-colour identity — flag and spark both gradient, each one a mood." plate={<Mark id="c2" stops={iris.dark.stops} star={iris.dark.star} size={150} />} />
        </Section>

        <Section label="Typography" count="6 directions" cols={3}>
          {TYPE_DIRECTIONS.map((d) => (
            <Card
              key={d.slug}
              href={`/type/${d.slug}`}
              num={`Direction ${d.num}`}
              name={d.name}
              blurb={d.idea}
              compact
              plate={<WordPlate id={`t-${d.slug}`} font={d.display} />}
            />
          ))}
        </Section>

        {/* Oli&Hue's pick — the recommended synthesis */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="font-grotesk text-[13px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7c5cf8" }}>Oli&amp;Hue’s pick</h2>
            <span className="font-grotesk text-[12px] text-faint/70">the recommendation</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <Link
            href="/pick"
            className="group grid overflow-hidden rounded-[28px] border border-line bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(60,40,120,0.5)] md:grid-cols-2"
          >
            <div className="relative flex min-h-[260px] items-center justify-center p-10" style={{ background: "#0D0B16" }}>
              <div className="absolute h-[260px] w-[260px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, rgba(140,92,248,0.45), transparent 65%)" }} />
              <img src="/brand/lockup-dark.svg" alt="Vadal.ai lockup" className="relative w-full max-w-[360px] transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center gap-4 p-9 sm:p-11">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#efeaff] px-3 py-1 font-grotesk text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b4bd6]">
                <span className="h-2 w-2 rounded-full" style={{ background: "#FFB14E" }} />
                Recommended identity
              </span>
              <h3 className="font-grotesk text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-tight tracking-[-0.02em]">Iris × Quiet Clarity</h3>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted">
                The Iris gradient mark and the Hanken Grotesk wordmark — intelligence with warmth,
                set in a calm, trustworthy voice. The full brand case study.
              </p>
              <span className="mt-1 flex items-center gap-2 font-grotesk text-[14px] font-semibold text-[#7c5cf8]">
                View the case study <Arrow />
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
