"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { VadalIcon1, VadalIcon2, VadalIcon3, VadalIcon4, VadalIcon5, type MarkColors } from "../marks";

/* ── content ────────────────────────────────────────────────────── */

const PERIWINKLE: MarkColors = { from: "#8DA2FF", to: "#5D63E1", accent: "#FB4B43" };

/* re-tint options offered on every study, after that study's originals */
const SHARED_EXPERIMENTS: ({ name: string } & MarkColors)[] = [
  { name: "Periwinkle signal", ...PERIWINKLE },
  { name: "Human pulse", from: "#F6A14B", to: "#F2705B", accent: "#33B28A" },
  { name: "Evergreen", from: "#5EEAD4", to: "#1E9E6A", accent: "#EFD24A" },
  { name: "Volt lime", from: "#E5FF8A", to: "#A8D911", accent: "#FF452E" },
  { name: "Ticker gold", from: "#FFE08A", to: "#F5C518", accent: "#FF452E" },
];

type ColorStory = { swatch: string[]; name: string; hex: string; why: string };

type Study = {
  num: string;
  codename: string;
  Icon: typeof VadalIcon1;
  lockup: string;
  /* marks 3–5 are standalone symbols — the wordmark is set in HTML */
  wordless?: boolean;
  original: MarkColors;
  tagline: string;
  symbolLede: string;
  anatomy: { part: string; reads: string }[];
  connections: { feature: string; how: string }[];
  colorStory: ColorStory[];
  /* photography mockups — signage first (rendered full-width) */
  mockups: { src: string; label: string }[];
};

const PERIWINKLE_STORY: ColorStory[] = [
  {
    swatch: ["#8DA2FF", "#5D63E1"],
    name: "Periwinkle, light to deep",
    hex: "#8DA2FF → #5D63E1",
    why: "Vadal's buyer is a CHRO defending workforce decisions to a board — the brand has to read banking-calm, not wellness-app. Periwinkle carries that fintech-grade trust. The gradient runs light to deep deliberately: a signal arriving faint and becoming decision-grade.",
  },
  {
    swatch: ["#FB4B43"],
    name: "Signal red",
    hex: "#FB4B43",
    why: "One warm interruption, reserved for the human moment — the flight-risk alert, the recognition pop, the AI insight. It's never decoration; scarcity is what keeps it meaningful, in the logo exactly as in the product.",
  },
  {
    swatch: ["#FFFFFF", "#0A0A0C"],
    name: "White on near-black",
    hex: "#FFFFFF on #0A0A0C",
    why: "The wordmark is set in white on near-black — the mission-control register of the leader surface. Calm authority by default, with colour spent only where meaning lives.",
  },
];

const STUDIES: Record<string, Study> = {
  "1": {
    num: "01",
    codename: "Signal",
    Icon: VadalIcon1,
    lockup: "/branding/logo-1.svg",
    original: PERIWINKLE,
    colorStory: PERIWINKLE_STORY,
    mockups: [
      { src: "/branding/mockups/1-1.jpg", label: "Storefront signage" },
      { src: "/branding/mockups/1-2.jpg", label: "App icon, in the wild" },
      { src: "/branding/mockups/1-3.jpg", label: "The business card" },
    ],
    tagline: "A flag planted, an eye open, a spark held in reserve.",
    symbolLede:
      "The mark is a V planted like a flag — Vadal arriving with intent. But it isn't solid: a lens-shaped aperture is carved through its heart, the open eye of a platform whose first job is to listen. From that aperture the form tapers to a single point, because every signal inside Vadal ends the same way — at one person, one conversation, one action.",
    anatomy: [
      {
        part: "The flag V",
        reads: "Vadal, and validation — a stake in the ground for how the organization should feel to work in.",
      },
      {
        part: "The aperture",
        reads: "Always-on listening. The eye stays open in the middle of everything the company does.",
      },
      {
        part: "The taper",
        reads: "Precision. Intelligence isn't a report — it narrows to the individual who needs attention this week.",
      },
      {
        part: "The spark",
        reads: "The AI moment, in signal red — the instant 4,000 comments become one clear insight. It's also the recognition pop employees feel.",
      },
    ],
    connections: [
      {
        feature: "Listening & surveys",
        how: "The carved aperture makes listening structural — remove it and the mark collapses. Same as the product: no listening, no intelligence.",
      },
      {
        feature: "Attrition & risk intelligence",
        how: "The taper to a point is the flight-risk model in geometry: thousands of signals resolving to A. Mehta, this week, 92% confidence.",
      },
      {
        feature: "Recognition & culture",
        how: "The detached spark floats free of the V — recognition isn't a feature bolted on, it's the energy the platform releases.",
      },
      {
        feature: "AI Assistant — Ask HR",
        how: "Four-point sparks are the visual language of AI across the product; the mark carries the same one, so brand and product speak one language.",
      },
    ],
  },
  "2": {
    num: "02",
    codename: "Orbit",
    Icon: VadalIcon2,
    lockup: "/branding/logo-2.svg",
    original: PERIWINKLE,
    colorStory: PERIWINKLE_STORY,
    mockups: [
      { src: "/branding/mockups/2-1.jpg", label: "Storefront signage" },
      { src: "/branding/mockups/2-2.jpg", label: "App icon, in the wild" },
      { src: "/branding/mockups/2-3.jpg", label: "The business card" },
    ],
    tagline: "The organization as a living loop — pulse in, action out.",
    symbolLede:
      "Here the organization is drawn as a circle — a continuous loop, because engagement isn't a quarterly event at Vadal, it's always on. Through the circle runs a line that is two things at once: a pulse wave (the heartbeat of the workforce) and a checkmark (the loop actually closing). And the ring doesn't quite seal at the lower left — an inlet stays open, because a listening system must never close itself off.",
    anatomy: [
      {
        part: "The circle",
        reads: "The org as a living system, and the always-on cadence — listening that never stops at survey season.",
      },
      {
        part: "The pulse-check line",
        reads: "Sentiment becoming action: a heartbeat on the way in, a checkmark on the way out.",
      },
      {
        part: "The open inlet",
        reads: "Humility built into the geometry — the system stays open to the next voice.",
      },
      {
        part: "The spark",
        reads: "The AI flare in signal red — insight igniting at the edge of the loop, where data meets a decision.",
      },
    ],
    connections: [
      {
        feature: "Employee voice & sentiment",
        how: "The wave through the circle is the mood line on the dashboard — the same pulse leaders watch every morning.",
      },
      {
        feature: "Action queue & SLA",
        how: "The wave resolves into a check: Vadal's core promise that signals get acted on, not archived. 92% SLA met lives in this stroke.",
      },
      {
        feature: "Manager Hub",
        how: "Closing loops is a manager behaviour Vadal coaches — the mark makes the closed loop the hero shape of the brand.",
      },
      {
        feature: "AI Assistant — Ask HR",
        how: "The same four-point spark as the product's AI affordances — one symbol system from logo to button.",
      },
    ],
  },
  "3": {
    num: "03",
    codename: "Weave",
    Icon: VadalIcon3,
    lockup: "/branding/logo-3.svg",
    wordless: true,
    original: { from: "#8DA2FF", to: "#5266EB", accent: "#00A165" },
    colorStory: [
      {
        swatch: ["#8DA2FF", "#5266EB"],
        name: "Trust blue",
        hex: "#8DA2FF → #5266EB",
        why: "The same periwinkle family the product wears — the thread of credibility that runs through every Vadal surface. Here it forms the figure itself: trust is the body of the brand.",
      },
      {
        swatch: ["#C5F2C9", "#00A165"],
        name: "Growth green",
        hex: "#C5F2C9 → #00A165",
        why: "Green is what the platform is for — people thriving. It wraps around the blue figure like support around a person, and it matches the product's semantic green for healthy scores.",
      },
      {
        swatch: ["#8DA2FF", "#C5F2C9"],
        name: "Translucent overlaps",
        hex: "blend, not opaque",
        why: "The strokes are deliberately see-through. Where voices cross, nothing is hidden — the overlaps deepen instead of covering. Honesty, drawn as a rendering choice.",
      },
    ],
    mockups: [
      { src: "/branding/mockups/3-3.jpg", label: "Storefront signage" },
      { src: "/branding/mockups/3-2.jpg", label: "App icon, light & dark" },
      { src: "/branding/mockups/3-1.jpg", label: "The business card" },
    ],
    tagline: "One figure, woven from many strands.",
    symbolLede:
      "Look once and it's a person — arms crossed over the heart, and where the head would be, Vadal's four-point AI spark. Look again and the person isn't drawn with an outline at all: they're woven from translucent strands that cross and deepen wherever they meet. That's the whole thesis of Vadal in one figure — an organization is thousands of individual strands, culture is what happens where they overlap, and intelligence sits right on top.",
    anatomy: [
      {
        part: "The figure",
        reads: "One employee, standing at the centre of everything — crowned by the same four-point spark the product uses for its AI moments.",
      },
      {
        part: "The strands",
        reads: "Individual voices. Each keeps its own colour and direction even while forming something bigger.",
      },
      {
        part: "The overlaps",
        reads: "Where strands cross, the colour deepens — exactly how Vadal's AI works: one comment is noise, a thousand overlapping ones are a signal.",
      },
      {
        part: "The embrace",
        reads: "The green arcs wrap the blue figure like arms — support that comes from the org around you, not from a dashboard.",
      },
    ],
    connections: [
      {
        feature: "Listening & surveys",
        how: "Every strand is a voice. The mark literally cannot exist without many of them — same as the intelligence.",
      },
      {
        feature: "AI-clustered themes",
        how: "Deepening overlaps are clustering, drawn: separate comments crossing into one visible theme.",
      },
      {
        feature: "Recognition & culture",
        how: "The green embrace is recognition's job in the product — the org visibly holding its people.",
      },
      {
        feature: "Workforce health",
        how: "The figure stands because the strands hold together. Pull voices out and the person falls apart — attrition, in geometry.",
      },
    ],
  },
  "4": {
    num: "04",
    codename: "Compass",
    Icon: VadalIcon4,
    lockup: "/branding/logo-4.svg",
    wordless: true,
    original: { from: "#CED1FF", to: "#343883", accent: "#FB4B43" },
    colorStory: [
      {
        swatch: ["#CED1FF", "#343883"],
        name: "Indigo depth",
        hex: "#CED1FF → #343883",
        why: "The deepest arc carries the deepest colour — the data underneath every decision. It anchors the whole mark the way the analytics layer anchors the platform.",
      },
      {
        swatch: ["#FB4B43"],
        name: "Signal red",
        hex: "#FB4B43",
        why: "Vadal's one interruption colour, here as a full quadrant: when something needs attention, it isn't a footnote — it bends the whole shape around it.",
      },
      {
        swatch: ["#FFF2B2", "#F5D119"],
        name: "Daylight yellow",
        hex: "#FFF2B2 → #F5D119",
        why: "Optimism and recognition — the mornings-side of the mark. Paired with the parchment quadrant it keeps the compass human, not clinical.",
      },
    ],
    mockups: [
      { src: "/branding/mockups/4-3.jpg", label: "Storefront signage" },
      { src: "/branding/mockups/4-2.jpg", label: "App icon, in the wild" },
      { src: "/branding/mockups/4-1.jpg", label: "Business card, dark" },
      { src: "/branding/mockups/4-4.jpg", label: "Business card, light" },
    ],
    tagline: "Four directions bending toward one spark.",
    symbolLede:
      "This mark is drawn by what it leaves out. Four curved quadrants — yellow, red, parchment, indigo — bend around an empty centre, and the emptiness has a shape: Vadal's four-point spark. Nothing paints the insight on; it appears where the parts meet. That's the honest description of what the AI does — intelligence emerging from the space between signals.",
    anatomy: [
      {
        part: "The negative-space spark",
        reads: "Insight isn't an overlay, it's what becomes visible when the surrounding pieces are arranged right. The AI moment, drawn as absence.",
      },
      {
        part: "Four quadrants",
        reads: "Listen, act, recognise, grow — the four motions of the platform, each with its own colour and weather.",
      },
      {
        part: "The bend",
        reads: "Straight grids are org charts. These arcs bend — structure flexing around people instead of people around structure.",
      },
      {
        part: "The corner ember",
        reads: "A small yellow arc escaping at the edge: the next signal already arriving. The compass never claims to be finished.",
      },
    ],
    connections: [
      {
        feature: "AI Assistant — Ask HR",
        how: "The spark at the centre is the product's AI glyph, found in negative space — the brand's cleverest handshake with the UI.",
      },
      {
        feature: "Analytics & insights",
        how: "Emergence is the analytics promise: no single survey shows the picture; the arrangement of all of them does.",
      },
      {
        feature: "Communication & campaigns",
        how: "Four directions radiating from one centre — one message, every audience, each in its own register.",
      },
      {
        feature: "Attrition & risk",
        how: "The red quadrant is risk given real estate: a quarter of the mark, never the whole story.",
      },
    ],
  },
  "5": {
    num: "05",
    codename: "Huddle",
    Icon: VadalIcon5,
    lockup: "/branding/logo-5.svg",
    wordless: true,
    original: { from: "#9AAAFF", to: "#4D67F3", accent: "#FF9C30" },
    colorStory: [
      {
        swatch: ["#9AAAFF", "#4D67F3"],
        name: "Trust blue",
        hex: "#9AAAFF → #4D67F3",
        why: "The leader register — the same blue family as the product's calm surfaces. One of the three people wears it; notably, not bigger than the others.",
      },
      {
        swatch: ["#FEDEBA", "#FF9C30"],
        name: "Energy orange",
        hex: "#FEDEBA → #FF9C30",
        why: "Warmth and momentum — the colour of recognition moments and small wins. It sits shoulder-to-shoulder with blue, not beneath it.",
      },
      {
        swatch: ["#C5F2C9", "#00A165"],
        name: "Growth green",
        hex: "#C5F2C9 → #00A165",
        why: "The smallest figure wears growth green — the newest person in the room, already in the huddle. No colour outranks another; that's the point.",
      },
    ],
    mockups: [
      { src: "/branding/mockups/5-3.jpg", label: "Storefront signage" },
      { src: "/branding/mockups/5-2.jpg", label: "App icon, in the wild" },
      { src: "/branding/mockups/5-1.jpg", label: "The business card" },
    ],
    tagline: "Three people, one huddle.",
    symbolLede:
      "The simplest of the five: three figures — a head, a body — leaning toward each other in three different colours. It's a team huddle seen from across the room. Nobody is larger, nobody is centred, and the small green figure is already inside the circle. If Vadal's promise is belonging you can measure, this is belonging you can draw.",
    anatomy: [
      {
        part: "The figures",
        reads: "People, reduced to the friendliest possible geometry — a dot and a soft triangle. Instantly human at any size.",
      },
      {
        part: "Three colours",
        reads: "Different roles, generations, functions — blue, orange, green, with no hierarchy of size or position.",
      },
      {
        part: "The lean",
        reads: "Each figure tilts toward the centre. Orientation is the message: attention pointed at each other, not at the org chart.",
      },
      {
        part: "The gap",
        reads: "The figures never touch. Belonging without uniformity — the space between people is respected, not erased.",
      },
    ],
    connections: [
      {
        feature: "Recognition & culture",
        how: "A huddle is what peer recognition builds — the 58/42 peer-to-manager split says most of Vadal's warmth flows sideways, like this mark.",
      },
      {
        feature: "Manager Hub",
        how: "The blue figure isn't above the others — exactly the manager posture the product coaches: in the huddle, not over it.",
      },
      {
        feature: "Employee feed",
        how: "Three colours, one cluster: the feed's job is making a 12,000-person company feel this small.",
      },
      {
        feature: "Listening & surveys",
        how: "The lean is participation. People answer when the brand looks like someone listening back.",
      },
    ],
  },
};

/* ── page ───────────────────────────────────────────────────────── */

export function BrandStudy({ id }: { id: string }) {
  const study = STUDIES[id];
  const ids = Object.keys(STUDIES);
  const other = ids[(ids.indexOf(id) + 1) % ids.length];
  const experiments = [
    { name: "Original colours", ...study.original },
    ...SHARED_EXPERIMENTS.filter((e) => e.from !== study.original.from),
  ];
  const [pi, setPi] = useState(0);
  const exp = experiments[pi];
  const { Icon } = study;
  const serif = { fontFamily: "var(--font-serif), serif" } as const;
  const grotesk = { fontFamily: "var(--font-grotesk), sans-serif" } as const;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0c", color: "#f4f3f0" }}>
      {/* chrome */}
      <header className="mx-auto flex h-[68px] w-full max-w-[1080px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{ color: "rgba(244,243,240,0.6)" }}
        >
          <ArrowLeft size={14} /> Back to the deck
        </Link>
        <Link
          href={`/branding/${other}`}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.16)" }}
        >
          Identity {STUDIES[other].num} — “{STUDIES[other].codename}” <ArrowRight size={13} />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1080px] px-6 pb-24">
        {/* hero */}
        <section className="pt-14 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "#8DA2FF" }}>
            Brand case study · Identity {study.num}
          </p>
          <div className="mt-10 flex items-center justify-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.lockup}
              alt={`vadal — identity ${study.num}`}
              className={study.wordless ? "h-[110px] w-auto sm:h-[130px]" : "h-[88px] w-auto sm:h-[110px]"}
            />
            {study.wordless && (
              <span className="text-[64px] font-bold tracking-tight text-white sm:text-[76px]" style={{ letterSpacing: "-0.04em" }}>
                vadal
              </span>
            )}
          </div>
          <p className="mx-auto mt-10 max-w-xl text-[22px] leading-snug" style={{ ...serif, color: "rgba(244,243,240,0.85)" }}>
            <em>“{study.tagline}”</em>
          </p>
        </section>

        {/* why this symbol */}
        <section className="mt-24 grid gap-10 lg:grid-cols-[340px_1fr]">
          <div>
            <h2 className="text-[30px] font-semibold tracking-tight" style={grotesk}>
              Why this <em style={{ ...serif, color: "#FB4B43" }}>symbol.</em>
            </h2>
            <div
              className="mt-7 grid aspect-square w-full max-w-[300px] place-items-center rounded-[28px]"
              style={{ background: "linear-gradient(165deg, #191731 0%, #0c0b14 60%)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {study.wordless ? (
                /* multi-colour originals — show the real vector untouched */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={study.lockup} alt="" className="h-40 w-auto max-w-[72%]" />
              ) : (
                <Icon {...study.original} id={`why-${id}`} className="h-36 w-auto max-w-[70%]" />
              )}
            </div>
          </div>
          <div>
            <p className="text-[16px] leading-relaxed" style={{ color: "rgba(244,243,240,0.78)" }}>
              {study.symbolLede}
            </p>
            <div className="mt-8 space-y-0">
              {study.anatomy.map((a) => (
                <div key={a.part} className="grid gap-1 border-t py-4 sm:grid-cols-[180px_1fr] sm:gap-6" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <p className="text-[14px] font-semibold" style={grotesk}>
                    {a.part}
                  </p>
                  <p className="text-[14px] leading-relaxed" style={{ color: "rgba(244,243,240,0.62)" }}>
                    {a.reads}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* connection to vadal */}
        <section className="mt-24">
          <h2 className="text-[30px] font-semibold tracking-tight" style={grotesk}>
            How it connects to <em style={{ ...serif, color: "#8DA2FF" }}>Vadal.</em>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {study.connections.map((c) => (
              <div key={c.feature} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#8DA2FF" }}>
                  {c.feature}
                </p>
                <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "rgba(244,243,240,0.72)" }}>
                  {c.how}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* why these colors */}
        <section className="mt-24">
          <h2 className="text-[30px] font-semibold tracking-tight" style={grotesk}>
            Why these <em style={{ ...serif, color: "#FB4B43" }}>colours.</em>
          </h2>
          <div className="mt-8 space-y-4">
            {study.colorStory.map((c) => (
              <div key={c.name} className="grid items-start gap-5 rounded-2xl p-5 sm:grid-cols-[140px_1fr]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <div className="flex h-12 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                    {c.swatch.map((s) => (
                      <span key={s} className="flex-1" style={{ background: s }} />
                    ))}
                  </div>
                  <p className="mt-2 text-[10.5px] font-semibold tabular-nums" style={{ color: "rgba(244,243,240,0.5)" }}>
                    {c.hex}
                  </p>
                </div>
                <div>
                  <p className="text-[14.5px] font-semibold" style={grotesk}>
                    {c.name}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "rgba(244,243,240,0.66)" }}>
                    {c.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* in the world — photography mockups */}
        <section className="mt-24">
          <h2 className="text-[30px] font-semibold tracking-tight" style={grotesk}>
            The mark, <em style={{ ...serif, color: "#8DA2FF" }}>in the world.</em>
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed" style={{ color: "rgba(244,243,240,0.55)" }}>
            A logo isn&apos;t chosen on a whiteboard — it&apos;s chosen on a building, a
            phone and a handshake. Here is “{study.codename}” doing all three.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {study.mockups.map((m, i) => (
              <figure
                key={m.src}
                className={`group overflow-hidden rounded-2xl ${i === 0 ? "sm:col-span-2" : ""}`}
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={`${study.codename} — ${m.label}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <figcaption
                  className="flex items-center justify-between px-4 py-3 text-[12px]"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(244,243,240,0.65)" }}
                >
                  {m.label}
                  <span style={{ color: "rgba(244,243,240,0.35)" }}>
                    {String(i + 1).padStart(2, "0")} / {String(study.mockups.length).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* colour experiments */}
        <section className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[30px] font-semibold tracking-tight" style={grotesk}>
              Experiment with <em style={{ ...serif, color: "#EFD24A" }}>colour.</em>
            </h2>
            <p className="max-w-[340px] text-[13px] leading-relaxed" style={{ color: "rgba(244,243,240,0.5)" }}>
              Tap an option — the mark re-tints live on dark, light and app-icon
              surfaces, so the call can be made in seconds.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {experiments.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPi(i)}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-semibold transition-all"
                style={
                  i === pi
                    ? { background: "#f4f3f0", color: "#0a0a0c" }
                    : { border: "1px solid rgba(255,255,255,0.16)", color: "rgba(244,243,240,0.7)" }
                }
              >
                <span className="flex gap-1">
                  {[p.from, p.to, p.accent].map((c) => (
                    <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </span>
                {p.name}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {/* dark plate */}
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl" style={{ background: "linear-gradient(165deg, #191731 0%, #0c0b14 60%)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon from={exp.from} to={exp.to} accent={exp.accent} id={`xd-${id}`} className="h-20 w-auto" />
              <p className="text-[11px]" style={{ color: "rgba(244,243,240,0.45)" }}>
                On dark
              </p>
            </div>
            {/* light plate */}
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl" style={{ background: "#f1eee7" }}>
              <Icon from={exp.from} to={exp.to} accent={exp.accent} id={`xl-${id}`} className="h-20 w-auto" />
              <p className="text-[11px]" style={{ color: "rgba(10,10,12,0.45)" }}>
                On light
              </p>
            </div>
            {/* app icon */}
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span
                className="grid h-[76px] w-[76px] place-items-center rounded-[20px]"
                style={{ background: `linear-gradient(150deg, ${exp.from}26 0%, #14131f 55%)`, border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <Icon from={exp.from} to={exp.to} accent={exp.accent} id={`xa-${id}`} className="h-11 w-auto" />
              </span>
              <p className="text-[11px]" style={{ color: "rgba(244,243,240,0.45)" }}>
                App icon
              </p>
            </div>
          </div>
          <p className="mt-4 text-[12px]" style={{ color: "rgba(244,243,240,0.4)" }}>
            Current pick: {exp.name} · {exp.from} → {exp.to}, accent {exp.accent}. “Original colours” is the drawn direction.
          </p>
        </section>

        {/* footer nav */}
        <section className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t pt-8" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Link href="/" className="flex items-center gap-2 text-[13.5px] font-medium" style={{ color: "rgba(244,243,240,0.6)" }}>
            <ArrowLeft size={14} /> Back to the deck
          </Link>
          <Link
            href={`/branding/${other}`}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold"
            style={{ background: "#5D63E1", color: "#fff" }}
          >
            Read Identity {STUDIES[other].num} — “{STUDIES[other].codename}” <ArrowRight size={14} />
          </Link>
        </section>
      </main>
    </div>
  );
}
