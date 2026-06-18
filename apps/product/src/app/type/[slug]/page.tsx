/* ════════════════════════════════════════════════════════════════════
   TYPOGRAPHY DIRECTION — one stunning, per-direction-themed template,
   driven by lib/type-directions.ts. "Why it fits Vadal.ai" leads.
   Logo identity = Iris (per brief); each page is themed by its accent.
   ════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mark, COLOR2 } from "@/components/mark";
import { TYPE_DIRECTIONS, getDirection } from "@/lib/type-directions";

const iris = COLOR2[0];
const FLOW_DARK = "linear-gradient(90deg,#B98CFF,#7C6CF5,#5B63E8,#7C6CF5,#B98CFF)";

export function generateStaticParams() {
  return TYPE_DIRECTIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getDirection((await params).slug);
  return d
    ? { title: `Vadal.ai — Typography ${d.num} · ${d.name}`, description: d.idea }
    : { title: "Vadal.ai — Typography" };
}

const WEIGHTS = [
  { w: 400, label: "Regular" },
  { w: 500, label: "Medium" },
  { w: 600, label: "Semibold" },
  { w: 700, label: "Bold" },
];

export default async function TypeDirectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDirection(slug);
  if (!d) notFound();

  const i = TYPE_DIRECTIONS.findIndex((x) => x.slug === d.slug);
  const prev = TYPE_DIRECTIONS[(i - 1 + TYPE_DIRECTIONS.length) % TYPE_DIRECTIONS.length];
  const next = TYPE_DIRECTIONS[(i + 1) % TYPE_DIRECTIONS.length];
  const fontFor = (on: "display" | "text" | "data") =>
    on === "display" ? d.display : on === "data" ? d.data ?? d.text : d.text;

  return (
    <main className="overflow-x-clip pb-px">
      {/* hero */}
      <div className="mx-auto max-w-[1180px] px-6 pt-12 sm:px-10 sm:pt-16">
        <Link href="/" className="inline-flex items-center gap-2 font-grotesk text-[13px] font-medium text-faint transition-colors hover:text-ink">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          All directions
        </Link>
        <p className="mt-10 font-grotesk text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: d.accent }}>
          Typography · Direction {d.num}
        </p>
        <h1
          className="mt-5 text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.98] tracking-[-0.03em]"
          style={{ fontFamily: d.display, fontWeight: d.displaySerif ? 500 : 600 }}
        >
          {d.name}.
        </h1>
        <p className="mt-6 max-w-[30ch] font-grotesk text-[clamp(1.2rem,2.4vw,1.7rem)] font-medium leading-snug tracking-[-0.01em] text-ink">
          {d.idea}
        </p>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-muted">{d.lede}</p>
      </div>

      {/* full-bleed wordmark hero */}
      <section className="relative left-1/2 mt-14 w-screen -translate-x-1/2" style={{ background: "radial-gradient(120% 120% at 50% -10%, #15131f, #0a0a10 65%)" }}>
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-6 px-6 py-24 sm:py-32">
          <Mark id="h" stops={iris.dark.stops} star={iris.dark.star} size={100} />
          <span className="gradient-flow text-[clamp(3.2rem,11vw,9rem)] leading-none tracking-[-0.03em]" style={{ backgroundImage: FLOW_DARK, fontFamily: d.display, fontWeight: d.displaySerif ? 500 : 700 }}>
            Vadal.ai
          </span>
        </div>
      </section>

      {/* ── WHY IT FITS (the priority) ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2" style={{ background: d.accentSoft }}>
        <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: d.accent }}>
            <span className="h-2 w-2 rounded-full" style={{ background: d.accent }} />
            Why it fits Vadal.ai
          </span>
          <p className="mt-7 max-w-[24ch] font-grotesk text-[clamp(1.8rem,4.6vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.02em]">
            {d.why.lead}
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl sm:grid-cols-3" style={{ background: "rgba(0,0,0,0.06)" }}>
            {d.why.points.map((pt, n) => (
              <div key={pt.h} className="bg-white p-7">
                <div className="font-grotesk text-[13px] font-semibold tabular-nums" style={{ color: d.accent }}>
                  {String(n + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-grotesk text-[17px] font-semibold tracking-tight">{pt.h}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{pt.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the typeface — giant specimen of the face, in the face */}
      <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
        <p className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">The logotype face</p>
        <h2 className="mt-5 text-[clamp(2.6rem,9vw,7rem)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: d.display, fontWeight: d.displaySerif ? 400 : 500 }}>
          {d.typeface.name}
        </h2>
        <p className="mt-4 font-grotesk text-[13px] uppercase tracking-[0.16em] text-faint">{d.typeface.meta}</p>

        {/* weights */}
        <div className="mt-12 grid gap-5 sm:grid-cols-4">
          {WEIGHTS.map((wt) => (
            <div key={wt.w} className="border-t border-line pt-4">
              <div className="text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-ink" style={{ fontFamily: d.display, fontWeight: wt.w }}>Vadal</div>
              <div className="mt-3 font-grotesk text-[12px] text-faint">{wt.label} · {wt.w}</div>
            </div>
          ))}
        </div>
      </div>

      {/* character specimen (full-bleed dark) */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-line bg-[#0b0d12]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 sm:py-24" style={{ fontFamily: d.display }}>
          <div className="space-y-5 text-white">
            <p className="text-[clamp(1.3rem,4.6vw,3.4rem)] font-medium leading-tight tracking-[-0.01em]">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            <p className="text-[clamp(1.3rem,4.6vw,3.4rem)] leading-tight tracking-[-0.01em] text-white/75" style={{ fontStyle: d.displaySerif ? "italic" : "normal" }}>abcdefghijklmnopqrstuvwxyz</p>
            <p className="text-[clamp(1.3rem,4.6vw,3.4rem)] font-medium leading-tight tracking-[-0.01em]" style={{ color: d.accent }}>0 1 2 3 4 5 6 7 8 9&nbsp;&nbsp;&amp; . , % → ·</p>
          </div>
        </div>
      </section>

      {/* type scale */}
      <div className="mx-auto max-w-[1180px] px-6 pt-24 sm:px-10 sm:pt-32">
        <h2 className="text-[clamp(1.8rem,4vw,3rem)] tracking-[-0.02em]" style={{ fontFamily: d.display, fontWeight: d.displaySerif ? 500 : 700 }}>The scale</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {d.scale.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:gap-10">
              <div className="flex w-[150px] shrink-0 items-baseline gap-3">
                <span className="font-grotesk text-[14px] font-semibold">{s.label}</span>
                <span className="font-grotesk text-[12px] text-faint">{s.px}px</span>
              </div>
              <p
                className="min-w-0 flex-1 leading-tight tracking-[-0.005em] text-ink"
                style={{ fontFamily: fontFor(s.on), fontSize: `clamp(18px, ${s.px / 16}vw + 6px, ${s.px}px)`, fontWeight: s.on === "data" ? 500 : s.italic ? 400 : 500, fontStyle: s.italic ? "italic" : "normal" }}
              >
                {s.sample}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* in context (themed band) */}
      <section className="relative left-1/2 mt-28 w-screen -translate-x-1/2" style={{ background: `linear-gradient(180deg, ${d.accentSoft}, #fff)` }}>
        <div className="mx-auto max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
          <p className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: d.accent }}>{d.inContext.eyebrow}</p>
          <h3 className="mt-6 max-w-[18ch] text-[clamp(2rem,5.2vw,3.8rem)] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: d.display, fontWeight: d.displaySerif ? 400 : 700 }}>
            {d.inContext.headline}
            {d.inContext.italicWord && <span style={{ fontStyle: "italic" }}> {d.inContext.italicWord}</span>}
          </h3>
          <p className="mt-6 max-w-[58ch] text-[18px] leading-relaxed text-[#3c3d46]" style={{ fontFamily: d.text }}>{d.inContext.body}</p>
          {d.inContext.metric && (
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-line bg-white px-6 py-4">
              <span className="text-[30px] font-medium text-ink" style={{ fontFamily: d.data ?? d.display }}>{d.inContext.metric}</span>
              <span className="text-[13px] leading-tight text-muted" style={{ fontFamily: d.text }}>{d.inContext.metricLabel}</span>
            </div>
          )}
          <p className="mt-10 font-grotesk text-[13px] text-faint">{d.bestWith}</p>
        </div>
      </section>

      {/* prev / next */}
      <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-10">
        <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
          <Link href={`/type/${prev.slug}`} className="group flex items-center gap-3 text-left">
            <span className="font-grotesk text-[20px] text-faint transition-colors group-hover:text-ink">←</span>
            <span>
              <span className="block font-grotesk text-[11px] uppercase tracking-[0.14em] text-faint">Direction {prev.num}</span>
              <span className="block font-grotesk text-[14px] font-semibold">{prev.name}</span>
            </span>
          </Link>
          <Link href={`/type/${next.slug}`} className="group flex items-center gap-3 text-right">
            <span>
              <span className="block font-grotesk text-[11px] uppercase tracking-[0.14em] text-faint">Direction {next.num}</span>
              <span className="block font-grotesk text-[14px] font-semibold">{next.name}</span>
            </span>
            <span className="font-grotesk text-[20px] text-faint transition-colors group-hover:text-ink">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
