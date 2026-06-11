"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  X,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   VADAL.AI — the design-foundation deck
   6 full-screen snap slides, light only.
   01 Cover · 02 Branding Identities (sealed cards → /branding/[id]) ·
   03 Design styles · 04 Positioning (clickable, image-led) ·
   05 Our Ideal Recommendation · 06 Next steps
   ════════════════════════════════════════════════════════════════════ */

/* ── brand marks ──────────────────────────────────────────────────── */

function VadalMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="vmL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="vmR" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="0.5" stopColor="#c084fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <g transform="rotate(-24 47 60)">
        <rect x="29" y="20" width="36" height="80" rx="17" fill="url(#vmL)" />
      </g>
      <g transform="rotate(24 73 60)">
        <rect x="55" y="20" width="36" height="80" rx="17" fill="url(#vmR)" fillOpacity="0.92" />
      </g>
    </svg>
  );
}


/* ── content ──────────────────────────────────────────────────────── */

type Direction = {
  num: string;
  name: string;
  promise: string;
  img: string;
  plain: string; // the whole idea in everyday words
  picture: string; // instant-decode comparison
  whyBullets: string[]; // short reasons to bet on it
  risk: string; // the honest trade-off
  taglines: string[];
  palette: string[];
  maps: string;
  mapsSlug: string;
  recommended?: boolean;
};

const DIRECTIONS: Direction[] = [
  {
    num: "01",
    name: "The quiet authority",
    promise: "People intelligence you can take to the board",
    img: "/deck/territory-01.jpg",
    plain:
      "Make Vadal feel like a serious, financial-grade tool — so calm and precise that a CHRO can put it on the boardroom screen without a second thought.",
    picture: "Feels like Mercury or a private bank. Not a fun HR app with confetti.",
    whyBullets: [
      "The person who pays — the CHRO — has to defend people decisions to a board. This brand makes them look credible in that room.",
      "Every competitor sounds friendly and playful. Nobody sounds authoritative. That seat is empty.",
      "Enterprise deals are signed on trust, and calm is what trust looks like.",
    ],
    risk: "Played too cold it can feel distant — the employee-facing side would need its warmth from somewhere else.",
    taglines: ["Know your people. Early.", "People decisions, decision-grade."],
    palette: ["#171B2C", "#5266EB", "#8DA2FF", "#F6F6F4", "#1E9E6A"],
    maps: "Fintech calm",
    mapsSlug: "fintech",
  },
  {
    num: "02",
    name: "The human pulse",
    promise: "Keeping companies human at scale",
    img: "/deck/territory-02.jpg",
    plain:
      "Make Vadal feel warm and human — a brand that cares about people first, and proves it with AI that notices when someone is struggling before they burn out or quit.",
    picture: "Headspace or Airbnb warmth — applied to the workplace.",
    whyBullets: [
      "Engagement is about feelings before it is about numbers. A warm brand is what makes employees actually open up.",
      "It gives the AI a heart: “we notice early, so you can care early.”",
      "Warmth is memorable in a category full of cold dashboards.",
    ],
    risk: "The warm-wellness look is crowded (Culture Amp, Lattice). This only stands out if the AI-prediction story stays front and centre.",
    taglines: ["The heartbeat of your workplace.", "Listen at scale. Act in time."],
    palette: ["#2E2436", "#F2705B", "#F6A14B", "#FBF7EF", "#33B28A"],
    maps: "Lumen",
    mapsSlug: "lumen",
    recommended: true,
  },
  {
    num: "03",
    name: "The daily ritual",
    promise: "The people app teams actually open",
    img: "/deck/territory-03.jpg",
    plain:
      "Make Vadal feel like a consumer app people open every day — streaks, missions, recognition, small wins — so engagement becomes a habit instead of an annual survey.",
    picture: "Duolingo energy, inside a work tool.",
    whyBullets: [
      "Engagement data is only as good as participation — and participation is a habit problem, not a survey problem.",
      "A majority-Gen-Z workforce expects app-grade fun. Meet them where they already are.",
      "Daily opens keep the data alive, which keeps the AI sharp.",
    ],
    risk: "Too playful can scare the enterprise buyer. This works as the employee face of the brand — not the boardroom face.",
    taglines: ["Engagement, daily.", "Work, but make it a streak."],
    palette: ["#0D0D0F", "#F2F2F4", "#5D63E1", "#EFD24A", "#E8584C"],
    maps: "GenAlpha",
    mapsSlug: "genalpha",
  },
];

/* ── branding identities — sealed cards → /branding/[id] case studies ── */

const IDENTITY_CARDS = [
  { id: "1", num: "01", teaser: "A flag planted, an eye open — why the symbol exists and the colour logic behind it." },
  { id: "2", num: "02", teaser: "The organization as a living loop — a different geometry for the same conviction." },
  { id: "3", num: "03", teaser: "One figure, woven from many strands — culture as what overlaps between people." },
  { id: "4", num: "04", teaser: "Four directions bending toward one spark — insight drawn in negative space." },
  { id: "5", num: "05", teaser: "Three people, one huddle — belonging you can draw at any size." },
];

type Style = {
  slug: string;
  name: string;
  refs: string;
  feel: string;
};

const STYLES: Style[] = [
  { slug: "fintech", name: "Fintech calm", refs: "Mercury · Ramp · Brex", feel: "Banking-grade calm. Density that feels expensive." },
  { slug: "genalpha", name: "GenAlpha", refs: "Cal AI · Duolingo", feel: "Huge numbers, rings, streaks and missions." },
  { slug: "lumen", name: "Lumen", refs: "Stripe Press · Linear", feel: "Editorial, charcoal rail, warm gradients." },
  { slug: "glass", name: "Glassmorphism", refs: "Apple iOS 26", feel: "Frosted glass over an animated mesh." },
  { slug: "minimal", name: "Minimal", refs: "Vercel · Notion", feel: "Monochrome, type-led, ruthless whitespace." },
  { slug: "volt", name: "Volt", refs: "Mission control · ops rooms", feel: "Volt-lime signals on near-black. Red heat for risk." },
  { slug: "ticker", name: "Ticker", refs: "Bloomberg · trading desks", feel: "Engagement traded like a stock. Amber tape, dot-matrix heat." },
];

/* ── deck plumbing ────────────────────────────────────────────────── */

const SLIDE_LABELS = [
  "Cover",
  "Branding Identities",
  "Design styles",
  "Positioning",
  "Our Ideal Recommendation",
  "Next steps",
];
const TOTAL = SLIDE_LABELS.length;

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative h-screen w-full flex-none snap-start overflow-hidden ${className}`}
      style={{ background: "var(--st-canvas)" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col justify-center px-8 pb-24 pt-20 sm:px-14">
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p className="st-eyebrow" style={accent ? { color: "var(--st-accent)" } : undefined}>
      {children}
    </p>
  );
}

/* territory image with graceful fallback until the Gemini render lands */
function TerritoryImage({ d, className = "" }: { d: Direction; className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // the 404 can fire before hydration attaches onError — re-check on mount
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) {
      requestAnimationFrame(() => setFailed(true));
    }
  }, []);

  if (failed) {
    return (
      <div
        className={`grid place-items-center ${className}`}
        style={{ background: `linear-gradient(135deg, ${d.palette[0]} 0%, ${d.palette[1]} 100%)` }}
      >
        <span className="st-eyebrow rounded-full px-3 py-1.5" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.85)" }}>
          Visual {d.num} — drop {d.img.split("/").pop()}
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={d.img} alt={d.name} className={`object-cover ${className}`} onError={() => setFailed(true)} />
  );
}

/* ── slide components ─────────────────────────────────────────────── */

function BrandingSlide() {
  return (
    <Slide>
      <div className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>Branding</Eyebrow>
          <h2 className="st-display mt-4 text-[clamp(2rem,4.4vw,3.6rem)]">
            Branding{" "}
            <span style={{ color: "var(--st-accent)" }}>Identities.</span>
          </h2>
        </div>
        <p className="hidden max-w-[250px] text-[13px] leading-relaxed md:block" style={{ color: "var(--st-muted)" }}>
          Five symbol systems for Vadal. The marks stay sealed here — open a
          case study to see the symbol, the reasoning and the colours.
        </p>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {IDENTITY_CARDS.map((c) => (
          <Link
            key={c.id}
            href={`/branding/${c.id}`}
            className="st-card group relative flex min-h-[218px] flex-col justify-between overflow-hidden p-6"
          >
            <span
              className="st-bignum pointer-events-none absolute -right-3 -top-8 text-[130px] leading-none"
              style={{ color: "var(--st-line)", opacity: 0.55 }}
            >
              {c.num}
            </span>
            <div className="relative">
              <Eyebrow accent>Brand case study</Eyebrow>
              <h3 className="st-display mt-2 text-[21px]">
                Brand Identity {c.num}
              </h3>
              <p className="st-serif-it mt-2.5 max-w-sm text-[14.5px] leading-snug" style={{ color: "var(--st-muted)" }}>
                {c.teaser}
              </p>
            </div>
            <span className="relative mt-5 inline-flex items-center gap-2 text-[12.5px] font-semibold" style={{ color: "var(--st-ink)" }}>
              Open the case study
              <span
                className="grid h-8 w-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1"
                style={{ background: "var(--st-accent)", color: "#fff" }}
              >
                <ArrowRight size={13} />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Slide>
  );
}


/* ── our ideal recommendation — links to /recommendation ──────────── */

/* miniature Lumen — editorial light, charcoal rail, warm gradient */
function LumenMini() {
  return (
    <div className="flex overflow-hidden rounded-xl" style={{ background: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}>
      <div className="w-[38px] flex-none py-2.5" style={{ background: "#241f1b" }}>
        <div className="mx-auto h-6 w-6 rounded-md" style={{ background: "linear-gradient(135deg,#f2705b,#f6a14b)" }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="mx-auto mt-2 h-1 w-4 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }} />
        ))}
      </div>
      <div className="flex-1 p-3">
        <div className="rounded-lg p-2.5" style={{ background: "linear-gradient(120deg,#fdeae6,#fdf3e3)", border: "1px solid #eadfd2" }}>
          <p className="text-[7px] font-semibold" style={{ color: "#6d645c" }}>Workforce health</p>
          <p className="text-[16px] font-bold tabular-nums" style={{ color: "#241f1b" }}>
            82<span className="text-[8px]" style={{ color: "#a89e94" }}>/100</span>
          </p>
          <svg viewBox="0 0 160 26" className="mt-1 block w-full" aria-hidden>
            <path d="M0 22 C 20 20, 36 16, 56 17 S 96 11, 120 8 L 160 5" fill="none" stroke="#f2705b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { l: "Mood today", v: "Warm", c: "#f6a14b" },
            { l: "Recognitions", v: "2,840", c: "#33b28a" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg px-2 py-1.5" style={{ border: "1px solid #eadfd2" }}>
              <p className="text-[6.5px] font-semibold" style={{ color: "#a89e94" }}>{s.l}</p>
              <p className="text-[9.5px] font-bold" style={{ color: "#241f1b" }}>
                {s.v} <span style={{ color: s.c }}>●</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationSlide() {
  return (
    <Slide>
      <div className="flex flex-col items-center text-center">
        <Eyebrow accent>Our ideal recommendation</Eyebrow>
        <h2 className="st-display mt-4 text-[clamp(2rem,4.6vw,3.8rem)]">
          When everything <span style={{ color: "var(--st-accent)" }}>clicks.</span>
        </h2>
        <p className="st-serif-it mt-3 max-w-lg text-[17px]" style={{ color: "var(--st-muted)" }}>
          One positioning, one mark, one design style — chosen because they
          were already telling the same story.
        </p>

        {/* the clickable card → /recommendation */}
        <Link
          href="/recommendation"
          className="group relative mt-8 w-full max-w-[880px] overflow-hidden rounded-[28px] text-left transition-transform duration-300 hover:scale-[1.01]"
          style={{
            background:
              "radial-gradient(90% 80% at 85% -20%, rgba(242,112,91,0.4) 0%, transparent 60%), radial-gradient(60% 50% at 0% 110%, rgba(246,161,75,0.3) 0%, transparent 55%), linear-gradient(165deg, #2c2521 0%, #16120f 60%)",
            boxShadow: "0 30px 60px -30px rgba(44,37,33,0.6)",
          }}
        >
          <div className="grid items-center gap-6 p-8 sm:grid-cols-[1.15fr_1fr] sm:p-10">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.22em]" style={{ color: "#f6a14b" }}>
                Positioning · Identity · Design style
              </p>
              <div className="mt-5 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/branding/logo-5.svg" alt="The Huddle mark" className="h-[58px] w-auto" />
                <span className="text-[34px] font-bold tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
                  vadal
                </span>
              </div>
              <p className="mt-5 text-[20px] leading-snug text-white" style={{ fontFamily: "var(--font-serif), serif" }}>
                The human pulse, wearing the <em style={{ color: "#f6a14b" }}>Huddle</em> mark,
                <br className="hidden sm:block" /> designed in <em style={{ color: "#f6a14b" }}>Lumen.</em>
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-white">
                Read the full recommendation
                <span className="grid h-9 w-9 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1" style={{ background: "#f2705b" }}>
                  <ArrowRight size={14} />
                </span>
              </span>
            </div>
            <div className="hidden sm:block">
              <LumenMini />
              <p className="mt-2 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                Lumen — live build
              </p>
            </div>
          </div>
        </Link>
      </div>
    </Slide>
  );
}

/* ── the deck ─────────────────────────────────────────────────────── */

export default function Journey() {
  const deckRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [openDir, setOpenDir] = useState<Direction | null>(null);

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const onScroll = () => setSlide(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    deckRef.current?.scrollTo({ top: i * (deckRef.current?.clientHeight ?? 0), behavior: "smooth" });
  };

  return (
    <div className="studio-root relative h-screen overflow-hidden">
      {/* ── chrome ─────────────────────────────────────────────── */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[64px] w-full max-w-[1280px] items-center justify-between px-8 sm:px-14">
          <button onClick={() => go(0)} className="pointer-events-auto flex items-center gap-2.5">
            <VadalMark className="h-6 w-6" />
            <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--st-ink)" }}>
              vadal<span style={{ color: "var(--st-accent)" }}>.ai</span>
            </span>
          </button>
          <span className="st-eyebrow">Design foundation — June 2026</span>
        </div>
      </header>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto flex h-[76px] w-full max-w-[1280px] items-center justify-between px-8 sm:px-14">
          <div className="st-bignum flex items-baseline gap-1 text-[15px]" style={{ color: "var(--st-ink)" }}>
            <span>{String(slide + 1).padStart(2, "0")}</span>
            <span style={{ color: "var(--st-faint)" }}>/ {String(TOTAL).padStart(2, "0")}</span>
            <span className="ml-4 hidden text-[12px] font-medium sm:inline" style={{ color: "var(--st-faint)" }}>
              {SLIDE_LABELS[slide]}
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => go(Math.max(0, slide - 1))}
              aria-label="Previous slide"
              disabled={slide === 0}
              className="grid h-11 w-11 place-items-center rounded-full transition hover:scale-105 disabled:opacity-30"
              style={{ border: "1px solid var(--st-line)", color: "var(--st-ink)", background: "rgba(251,250,246,0.7)" }}
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => go(Math.min(TOTAL - 1, slide + 1))}
              aria-label="Next slide"
              disabled={slide === TOTAL - 1}
              className="grid h-11 w-11 place-items-center rounded-full transition hover:scale-105 disabled:opacity-30"
              style={{ background: "var(--st-accent)", color: "#fff" }}
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </div>
        <div className="h-[3px] w-full" style={{ background: "var(--st-line)" }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${((slide + 1) / TOTAL) * 100}%`, background: "var(--st-accent)" }}
          />
        </div>
      </footer>

      {/* dot rail */}
      <nav className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
        {SLIDE_LABELS.map((l, i) => (
          <button key={l} onClick={() => go(i)} aria-label={l} className="group relative grid place-items-center">
            <span
              className="block h-2 w-2 rounded-full transition-all duration-300"
              style={{ background: i === slide ? "var(--st-accent)" : "#cfc8ba", transform: i === slide ? "scale(1.4)" : "none" }}
            />
            <span
              className="pointer-events-none absolute right-5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: "var(--st-ink)", color: "var(--st-paper)" }}
            >
              {l}
            </span>
          </button>
        ))}
      </nav>

      {/* ── positioning detail overlay ─────────────────────────── */}
      {openDir && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center p-6"
          style={{ background: "rgba(24,23,28,0.45)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpenDir(null)}
        >
          <div
            className="relative grid max-h-[86vh] w-full max-w-[980px] gap-0 overflow-hidden rounded-[28px] lg:grid-cols-[380px_1fr]"
            style={{ background: "var(--st-paper)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <TerritoryImage d={openDir} className="h-48 w-full lg:h-full" />
            <div className="overflow-y-auto p-8 lg:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow accent>Territory {openDir.num}{openDir.recommended ? " — our lead" : ""}</Eyebrow>
                  <h3 className="st-display mt-2 text-[30px]">{openDir.name}</h3>
                  <p className="st-serif-it mt-1 text-[17px]" style={{ color: "var(--st-accent)" }}>
                    {openDir.promise}
                  </p>
                </div>
                <button
                  onClick={() => setOpenDir(null)}
                  aria-label="Close"
                  className="grid h-10 w-10 flex-none place-items-center rounded-full transition hover:scale-105"
                  style={{ border: "1px solid var(--st-line)", color: "var(--st-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* in plain words */}
              <p className="st-eyebrow mt-6" style={{ color: "var(--st-faint)" }}>In plain words</p>
              <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--st-ink)" }}>
                {openDir.plain}
              </p>

              {/* picture it */}
              <div className="mt-4 rounded-2xl p-4" style={{ background: "var(--st-accent-soft)" }}>
                <p className="st-eyebrow" style={{ color: "var(--st-accent)" }}>Picture it</p>
                <p className="st-serif-it mt-1.5 text-[16px] leading-snug" style={{ color: "var(--st-ink)" }}>
                  {openDir.picture}
                </p>
              </div>

              {/* why we'd bet on it */}
              <p className="st-eyebrow mt-5" style={{ color: "var(--st-faint)" }}>Why we&apos;d bet on it</p>
              <ul className="mt-2 space-y-2">
                {openDir.whyBullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--st-muted)" }}>
                    <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--st-accent)" }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* the honest risk */}
              <p className="mt-4 border-l-2 pl-3 text-[12.5px] leading-relaxed" style={{ borderColor: "var(--st-line)", color: "var(--st-faint)" }}>
                <span className="font-semibold" style={{ color: "var(--st-muted)" }}>The honest risk: </span>
                {openDir.risk}
              </p>

              {/* how it sounds */}
              <p className="st-eyebrow mt-5" style={{ color: "var(--st-faint)" }}>How it sounds</p>
              <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1.5">
                {openDir.taglines.map((t) => (
                  <p key={t} className="text-[13px] font-medium" style={{ color: "var(--st-ink)" }}>— “{t}”</p>
                ))}
              </div>

              {/* how it looks */}
              <p className="st-eyebrow mt-5" style={{ color: "var(--st-faint)" }}>How it looks</p>
              <div className="mt-2 flex gap-1.5">
                {openDir.palette.map((c) => (
                  <div key={c} className="h-8 flex-1 rounded-lg" style={{ background: c, border: "1px solid var(--st-line)" }} />
                ))}
              </div>
              <p className="mt-2.5 text-[12px]" style={{ color: "var(--st-faint)" }}>
                See it as a working product — the{" "}
                <Link href={`/${openDir.mapsSlug}`} className="font-semibold underline-offset-2 hover:underline" style={{ color: "var(--st-muted)" }}>
                  {openDir.maps} dashboard
                </Link>{" "}
                is this territory, built.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── slides ─────────────────────────────────────────────── */}
      <div ref={deckRef} className="h-screen snap-y snap-mandatory overflow-y-auto">
        {/* 01 · COVER — minimal */}
        <Slide>
          <div className="flex flex-col items-center text-center">
            <VadalMark className="h-12 w-12" />
            <p className="st-eyebrow mt-8" style={{ color: "var(--st-accent)" }}>
              Oli&amp;Hue × Vadal.ai
            </p>
            <h1 className="st-display mt-5 max-w-4xl text-[clamp(2.8rem,7.5vw,6.4rem)]">
              Setting the{" "}
              <span style={{ color: "var(--st-accent)" }}>design foundation</span>
              <br />
              for Vadal.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed" style={{ color: "var(--st-muted)" }}>
              Positioning · Brand identity · Product design
            </p>
            <button onClick={() => go(1)} className="st-pill st-pill-ink mt-9">
              Start <ArrowDown size={16} />
            </button>
          </div>
        </Slide>

        {/* 02 · BRANDING IDENTITIES */}
        <BrandingSlide />

        {/* 03 · DESIGN STYLES */}
        <Slide>
          <div className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>The product</Eyebrow>
              <h2 className="st-display mt-4 text-[clamp(2rem,4.4vw,3.6rem)]">
                Let&apos;s select a{" "}
                <span style={{ color: "var(--st-accent)" }}>design style</span>{" "}
                for our brand.
              </h2>
            </div>
            <p className="hidden max-w-[240px] text-[13px] leading-relaxed md:block" style={{ color: "var(--st-muted)" }}>
              The same dashboard, five design languages — every one a live,
              working build.
            </p>
          </div>

          <div className="mt-9 border-t" style={{ borderColor: "var(--st-line)" }}>
            {STYLES.map((s, i) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group flex items-center gap-5 border-b py-[18px]"
                style={{ borderColor: "var(--st-line)" }}
              >
                <span className="st-bignum w-9 flex-none text-[14px]" style={{ color: "var(--st-faint)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="st-display flex-none text-[clamp(1.4rem,3vw,2.1rem)] transition-transform duration-300 group-hover:translate-x-1">
                  {s.name}
                </h3>
                <span className="hidden flex-1 truncate text-right text-[12.5px] md:block" style={{ color: "var(--st-muted)" }}>
                  {s.feel} <span style={{ color: "var(--st-faint)" }}>· {s.refs}</span>
                </span>
                <span
                  className="grid h-10 w-10 flex-none place-items-center rounded-full transition-all duration-300 group-hover:scale-105"
                  style={{ border: "1px solid var(--st-line)", color: "var(--st-muted)" }}
                >
                  <ArrowUpRight size={15} />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-5 text-[12.5px]" style={{ color: "var(--st-faint)" }}>
            Each row opens the live dashboard — come back with the browser back button.
          </p>
        </Slide>

        {/* 04 · POSITIONING — image-led, clickable */}
        <Slide>
          <div className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Brand positioning</Eyebrow>
              <h2 className="st-display mt-4 text-[clamp(2rem,4.4vw,3.6rem)]">
                Three territories Vadal could{" "}
                <span style={{ color: "var(--st-accent)" }}>own.</span>
              </h2>
            </div>
            <p className="hidden max-w-[230px] text-[13px] leading-relaxed md:block" style={{ color: "var(--st-muted)" }}>
              Open a territory to read the thinking behind it.
            </p>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {DIRECTIONS.map((d) => (
              <button
                key={d.num}
                onClick={() => setOpenDir(d)}
                className="st-card group flex flex-col overflow-hidden text-left"
              >
                <div className="relative h-[190px] w-full overflow-hidden">
                  <TerritoryImage d={d} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                  {d.recommended && (
                    <span
                      className="absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(251,250,246,0.9)", color: "var(--st-accent)" }}
                    >
                      Our lead
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="st-display text-[20px]">{d.name}</h3>
                    <span className="st-bignum text-[13px]" style={{ color: "var(--st-faint)" }}>{d.num}</span>
                  </div>
                  <p className="st-serif-it mt-1 text-[15px]" style={{ color: "var(--st-accent)" }}>{d.promise}</p>
                  <p className="mt-2 text-[12.5px] leading-snug" style={{ color: "var(--st-muted)" }}>{d.picture}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--st-muted)" }}>
                    Why this positioning{" "}
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Slide>

        {/* 05 · OUR IDEAL RECOMMENDATION */}
        <RecommendationSlide />

        {/* 06 · NEXT STEPS */}
        <Slide>
          <Eyebrow>Where we&apos;d start</Eyebrow>
          <h2 className="st-display mt-6 text-[clamp(2.8rem,8.5vw,7rem)]">
            Pick the lead.
            <br />
            We&apos;ll build the{" "}
            <span style={{ color: "var(--st-accent)" }}>rest.</span>
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", t: "Pick the lead territory", d: "The human pulse is our vote — warmth is what makes people open up." },
              { n: "02", t: "Develop one brand sheet", d: "Logo, imagery, voice, do/don't from the chosen mark." },
              { n: "03", t: "Pressure-test on the build", d: "Lock the palette against the live dashboards." },
            ].map((s) => (
              <div key={s.n} className="border-t pt-4" style={{ borderColor: "var(--st-line)" }}>
                <span className="st-bignum text-[14px]" style={{ color: "var(--st-faint)" }}>{s.n}</span>
                <p className="st-display mt-2 text-[18px]">{s.t}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--st-muted)" }}>{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link href="/recommendation" className="st-pill st-pill-ink">
              Read the full recommendation <ArrowUpRight size={17} />
            </Link>
            <button onClick={() => go(0)} className="st-pill st-pill-ghost">
              Restart the deck
            </button>
            <span className="ml-auto hidden text-[12.5px] sm:block" style={{ color: "var(--st-faint)" }}>
              Prepared by Oli&amp;Hue · 2026
            </span>
          </div>
        </Slide>
      </div>
    </div>
  );
}
