import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  HeartPulse,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Our recommendation — Vadal.ai design foundation",
};

/* ── pieces ─────────────────────────────────────────────────────── */

function HuddleMark({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/branding/logo-5.svg" alt="The Huddle mark" className={className} />
  );
}

/* heartbeat line — drawn on load */
function PulseLine() {
  return (
    <svg viewBox="0 0 560 140" className="block w-full" aria-hidden>
      <path
        d="M0 78 H150 L172 78 L190 30 L212 116 L232 54 L248 78 H320 L338 78 L352 50 L368 96 L382 70 L394 78 H560"
        fill="none"
        stroke="var(--rc-coral)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="reco-draw"
      />
      <circle cx="212" cy="116" r="6" fill="var(--rc-amber)" className="reco-beat" />
    </svg>
  );
}

/* miniature Lumen — editorial light, charcoal rail, warm gradient */
function LumenMini() {
  return (
    <div className="reco-card flex overflow-hidden !rounded-2xl">
      <div className="w-[44px] flex-none py-3" style={{ background: "#241f1b" }}>
        <div className="mx-auto h-7 w-7 rounded-lg" style={{ background: "linear-gradient(135deg,#f2705b,#f6a14b)" }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mx-auto mt-2.5 h-1.5 w-5 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }} />
        ))}
      </div>
      <div className="flex-1 p-4">
        <div
          className="rounded-xl p-3.5"
          style={{ background: "linear-gradient(120deg, #fdeae6 0%, #fdf3e3 100%)", border: "1px solid var(--rc-line)" }}
        >
          <p className="text-[8px] font-semibold" style={{ color: "var(--rc-muted)" }}>Workforce health</p>
          <p className="reco-display mt-0.5 text-[22px]" style={{ color: "var(--rc-ink)" }}>
            82<span className="text-[11px]" style={{ color: "var(--rc-faint)" }}>/100</span>
          </p>
          <svg viewBox="0 0 200 36" className="mt-1.5 block w-full" aria-hidden>
            <path d="M0 30 C 25 28, 45 22, 70 23 S 120 16, 150 12 L 200 7" fill="none" stroke="var(--rc-coral)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0 24 C 35 23, 70 21, 105 20 S 170 19, 200 18" fill="none" stroke="var(--rc-line)" strokeWidth="1.6" strokeDasharray="3 4" />
          </svg>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {[
            { l: "Mood today", v: "Warm", c: "var(--rc-amber)" },
            { l: "Recognitions", v: "2,840", c: "var(--rc-green)" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl px-3 py-2" style={{ border: "1px solid var(--rc-line)" }}>
              <p className="text-[7.5px] font-semibold" style={{ color: "var(--rc-faint)" }}>{s.l}</p>
              <p className="text-[12px] font-bold" style={{ color: "var(--rc-ink)" }}>
                {s.v} <span style={{ color: s.c }}>●</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chapter({
  num,
  kicker,
  title,
  titleAccent,
  lede,
  points,
  visual,
  flip = false,
}: {
  num: string;
  kicker: string;
  title: string;
  titleAccent: string;
  lede: string;
  points: { icon: React.ElementType; t: string; d: string }[];
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="relative mx-auto mt-28 w-full max-w-[1080px] px-6">
      <span
        className="reco-display pointer-events-none absolute -top-16 select-none text-[170px] opacity-[0.06]"
        style={{ [flip ? "right" : "left"]: 0 } as React.CSSProperties}
      >
        {num}
      </span>
      <div className={`relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] ${flip ? "lg:[direction:rtl]" : ""}`}>
        <div className="lg:[direction:ltr]">
          <p className="reco-eyebrow" style={{ color: "var(--rc-coral)" }}>{kicker}</p>
          <h2 className="reco-display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
            {title} <span className="reco-serif" style={{ color: "var(--rc-coral)" }}>{titleAccent}</span>
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed" style={{ color: "var(--rc-muted)" }}>
            {lede}
          </p>
          <div className="mt-7 space-y-5">
            {points.map((p) => (
              <div key={p.t} className="flex gap-4">
                <span
                  className="grid h-10 w-10 flex-none place-items-center rounded-full"
                  style={{ background: "var(--rc-coral-soft)", color: "var(--rc-coral)" }}
                >
                  <p.icon size={17} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: "var(--rc-ink)" }}>{p.t}</p>
                  <p className="mt-1 max-w-lg text-[14px] leading-relaxed" style={{ color: "var(--rc-muted)" }}>{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:[direction:ltr]">{visual}</div>
      </div>
    </section>
  );
}

/* ── page ───────────────────────────────────────────────────────── */

export default function RecommendationPage() {
  return (
    <div className="reco-root min-h-screen overflow-x-clip">
      {/* chrome */}
      <header className="mx-auto flex h-[72px] w-full max-w-[1080px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-[13.5px] font-semibold transition-opacity hover:opacity-70">
          <ArrowLeft size={15} /> Back to the deck
        </Link>
        <span className="reco-eyebrow hidden sm:block" style={{ color: "var(--rc-faint)" }}>
          Oli&amp;Hue × Vadal — June 2026
        </span>
      </header>

      {/* ── hero ── */}
      <section className="mx-auto flex w-full max-w-[1080px] flex-col items-center px-6 pt-14 text-center">
        <p className="reco-rise reco-eyebrow" style={{ color: "var(--rc-coral)" }}>
          Our recommendation
        </p>
        <div className="reco-rise reco-rise-1 reco-float mt-10">
          <HuddleMark className="h-[150px] w-auto sm:h-[180px]" />
        </div>
        <h1 className="reco-display reco-rise reco-rise-2 mt-10 max-w-4xl text-[clamp(2.6rem,6.4vw,5.2rem)]">
          The brand that feels like{" "}
          <span className="reco-serif" style={{ color: "var(--rc-coral)" }}>being heard.</span>
        </h1>
        <p className="reco-rise reco-rise-3 mt-7 max-w-2xl text-[17px] leading-relaxed" style={{ color: "var(--rc-muted)" }}>
          After three positionings, five identities and seven live design styles, one
          combination kept choosing itself:{" "}
          <strong style={{ color: "var(--rc-ink)" }}>The human pulse</strong> positioning, wearing the{" "}
          <strong style={{ color: "var(--rc-ink)" }}>Huddle</strong> mark, designed in{" "}
          <strong style={{ color: "var(--rc-ink)" }}>Lumen</strong>. Here is the thinking — in plain words.
        </p>
        <div className="reco-rise reco-rise-3 mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#why" className="reco-pill reco-pill-coral">
            Why this is the one <ArrowDown size={15} />
          </a>
          <Link href="/lumen" className="reco-pill reco-pill-ghost">
            Skip to the live build <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── the pick in ten seconds ── */}
      <section id="why" className="mx-auto mt-24 w-full max-w-[1080px] scroll-mt-10 px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              k: "01 · The positioning",
              t: "The human pulse",
              d: "Vadal cares about people first — and proves it with AI that notices someone struggling before they burn out or quit.",
              href: "/", label: "From the territories",
            },
            {
              k: "02 · The identity",
              t: "“Huddle”",
              d: "Three people, three colours, one huddle. Nobody bigger, nobody outside the circle — belonging you can draw.",
              href: "/branding/5", label: "Read the case study",
            },
            {
              k: "03 · The design",
              t: "Lumen",
              d: "Editorial warmth — charcoal calm with morning-light gradients. Feels handcrafted, reads like a story, lives as a working build.",
              href: "/lumen", label: "Open the live dashboard",
            },
          ].map((c, i) => (
            <Link key={c.t} href={c.href} className={`reco-card group p-7 transition-transform duration-300 hover:-translate-y-1 reco-rise reco-rise-${i + 1}`}>
              <p className="reco-eyebrow" style={{ color: "var(--rc-faint)" }}>{c.k}</p>
              <p className="reco-display mt-3 text-[26px]">{c.t}</p>
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--rc-muted)" }}>{c.d}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: "var(--rc-coral)" }}>
                {c.label}
                <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── chapter 1 · positioning ── */}
      <Chapter
        num="01"
        kicker="Why this positioning"
        title="Engagement is a feeling"
        titleAccent="before it is a number."
        lede="Vadal's hardest problem isn't analytics — it's getting twelve thousand people to tell the truth about how work feels. People don't open up to dashboards. They open up to something that feels human. The human pulse makes that the whole brand."
        points={[
          {
            icon: HeartPulse,
            t: "Honesty is the raw material",
            d: "Every Vadal feature — sentiment, attrition prediction, recognition — runs on people speaking freely. A warm brand isn't decoration; it's what makes the data real.",
          },
          {
            icon: Sparkles,
            t: "It gives the AI a heart",
            d: "“We notice early, so you can care early.” The same prediction engine, told as an act of care instead of surveillance — that's the difference between adoption and resistance.",
          },
          {
            icon: Eye,
            t: "The risk, answered",
            d: "Yes, the warm-wellness category is crowded. That's exactly why the identity and design style below matter — they make warmth look premium, not soft.",
          },
        ]}
        visual={
          <div className="reco-card p-8">
            <p className="reco-eyebrow" style={{ color: "var(--rc-faint)" }}>The heartbeat of your workplace</p>
            <div className="mt-6">
              <PulseLine />
            </div>
            <p className="reco-serif mt-6 text-[19px] leading-snug" style={{ color: "var(--rc-ink)" }}>
              “Listen at scale. Act in time.”
            </p>
          </div>
        }
      />

      {/* ── chapter 2 · identity ── */}
      <Chapter
        num="02"
        flip
        kicker="Why this mark"
        title="The only logo that is"
        titleAccent="literally people."
        lede="Of the five identities we drew, four are clever metaphors. Huddle is the only one where you see people — three figures leaning toward each other, seen from across the room. For a people-first positioning, the mark shouldn't need explaining. This one doesn't."
        points={[
          {
            icon: Users,
            t: "No hierarchy, drawn",
            d: "Nobody is bigger, nobody is centred, and the smallest figure is already inside the circle. That's Vadal's 58/42 peer-led recognition culture in one glance.",
          },
          {
            icon: Layers,
            t: "Three colours, one language",
            d: "Trust blue, energy orange, growth green — the exact semantic palette the product already uses for leaders, recognition and wellbeing. Brand and UI speak as one.",
          },
          {
            icon: Eye,
            t: "Honest at every size",
            d: "A dot and a soft triangle survive a favicon, an app icon, a lanyard. The warmth doesn't degrade when the mark gets small — most human logos do.",
          },
        ]}
        visual={
          <div className="grid gap-4">
            <div
              className="reco-card grid place-items-center p-10"
              style={{ background: "linear-gradient(150deg, #fff 30%, #fdf3e3 100%)" }}
            >
              <HuddleMark className="reco-float h-36 w-auto" />
            </div>
            <div className="flex items-center justify-center gap-3">
              {[
                { c: "#4D67F3", l: "trust" },
                { c: "#FF9C30", l: "energy" },
                { c: "#00A165", l: "growth" },
              ].map((s) => (
                <span key={s.l} className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold" style={{ background: "var(--rc-card)", border: "1px solid var(--rc-line)", color: "var(--rc-muted)" }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} />
                  {s.l}
                </span>
              ))}
            </div>
          </div>
        }
      />

      {/* ── chapter 3 · design ── */}
      <Chapter
        num="03"
        kicker="Why this design style"
        title="Warmth that still wins"
        titleAccent="the boardroom."
        lede="Lumen is the editorial style — charcoal rail, morning-light gradients, type that reads like a well-set book. It's how the human pulse avoids the wellness-app trap: warm like a letter, composed like an annual report. Stripe Press energy, not SaaS template."
        points={[
          {
            icon: Layers,
            t: "Credibility and warmth in one surface",
            d: "The charcoal anchors it for the CHRO who signs; the gradients keep it human for the employee who opens it daily. One style serves both rooms.",
          },
          {
            icon: HeartPulse,
            t: "Stories, not just scores",
            d: "Lumen's reading-first layout gives sentiment quotes, themes and nudges room to breathe — fitting a brand whose product is listening.",
          },
          {
            icon: Sparkles,
            t: "It already exists",
            d: "Lumen isn't a moodboard. It's a working build with light and dark modes, live now — one click away from this page.",
          },
        ]}
        visual={
          <div>
            <LumenMini />
            <Link href="/lumen" className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-bold" style={{ color: "var(--rc-coral)" }}>
              Open Lumen live <ArrowUpRight size={14} />
            </Link>
          </div>
        }
      />

      {/* ── why it locks together ── */}
      <section className="mx-auto mt-28 w-full max-w-[1080px] px-6">
        <div className="reco-band rounded-[32px] p-10 sm:p-14">
          <p className="reco-eyebrow" style={{ color: "var(--rc-amber)" }}>Why the three lock together</p>
          <h2 className="reco-display mt-4 max-w-2xl text-[clamp(1.9rem,3.8vw,3rem)] text-white">
            One promise, told three ways —{" "}
            <span className="reco-serif" style={{ color: "var(--rc-amber)" }}>never out of tune.</span>
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {[
              {
                t: "The same sentence everywhere",
                d: "The positioning says people first. The mark is people. The design style gives people room to be read. Whichever surface a buyer or employee touches first, they hear one sentence.",
              },
              {
                t: "Warmth, made premium",
                d: "Human-pulse brands usually look soft. Huddle's geometry is disciplined and Lumen is editorial — together they make warmth feel expensive, which is what separates Vadal from the wellness crowd.",
              },
              {
                t: "Colour speaks one language",
                d: "Huddle's blue, orange and green are the product's own semantics — leadership, recognition, growth. Lumen's coral-and-amber light warms the same family. No retrofitting, no translation layer.",
              },
              {
                t: "Nothing here is hypothetical",
                d: "The positioning is written, the mark is drawn, the dashboard is deployed. Every claim on this page is one click from proof — which is itself very Vadal: don't tell people, show them.",
              },
            ].map((p) => (
              <div key={p.t} className="border-t pt-5" style={{ borderColor: "rgba(247,241,232,0.18)" }}>
                <p className="text-[16px] font-bold text-white">{p.t}</p>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgba(247,241,232,0.66)" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── closing ── */}
      <section className="mx-auto flex w-full max-w-[1080px] flex-col items-center px-6 pb-24 pt-24 text-center">
        <h2 className="reco-display max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">
          Don&apos;t take our word for it —{" "}
          <span className="reco-serif" style={{ color: "var(--rc-coral)" }}>click it.</span>
        </h2>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/lumen" className="reco-pill reco-pill-coral">
            Open the Lumen build <ArrowUpRight size={15} />
          </Link>
          <Link href="/branding/5" className="reco-pill reco-pill-dark">
            The Huddle case study <ArrowUpRight size={15} />
          </Link>
          <Link href="/" className="reco-pill reco-pill-ghost">
            Back to the deck
          </Link>
        </div>
        <p className="mt-12 text-[12.5px]" style={{ color: "var(--rc-faint)" }}>
          Prepared with conviction by Oli&amp;Hue · June 2026
        </p>
      </section>
    </div>
  );
}
