/* The Signal mark, parametric — exact client vector (direction-1 colorways).
   Shared by the directions showcase (home) and each case study. */

const P_FLAG_BODY =
  "M157.67 162.607L148.372 158.566C141.571 155.593 141.571 146.18 148.372 143.224L157.67 139.182C174.121 132.085 187.315 119.079 194.647 102.731C195.218 101.447 194.278 100 192.873 100H117.385C107.44 100 102.468 100 100.612 103.228C98.7561 106.456 101.257 110.753 106.259 119.348L164.986 220.256C169.93 228.751 172.402 232.998 176.1 233C179.799 233.002 182.276 228.758 187.23 220.269L194.122 208.459C195.096 206.79 195.583 205.956 195.806 205.063C196.004 204.269 196.048 203.444 195.937 202.633C195.813 201.722 195.419 200.839 194.631 199.075C187.305 182.724 174.118 169.712 157.67 162.607Z";
const P_FLAG_TIP =
  "M237.823 100H222.584C221.533 100 220.831 101.082 221.259 102.041C223.961 108.048 227.453 113.601 231.604 118.575C234.361 121.879 235.739 123.531 237.971 123.974C239.049 124.187 240.505 124.062 241.531 123.668C243.655 122.852 244.882 120.732 247.335 116.49C250.803 110.493 252.538 107.495 252 105.053C251.716 103.758 251.037 102.582 250.059 101.687C248.214 100 244.751 100 237.823 100Z";
const P_STAR =
  "M184.555 154.188L188.241 155.79C194.761 158.607 199.989 163.765 202.893 170.247L205.101 175.19C205.377 175.79 205.819 176.298 206.374 176.654C206.93 177.01 207.576 177.199 208.236 177.199C208.897 177.199 209.543 177.01 210.098 176.654C210.654 176.298 211.096 175.79 211.372 175.19L213.45 170.521C216.436 163.876 221.858 158.629 228.597 155.862L232.576 154.214C233.192 153.972 233.722 153.55 234.095 153.003C234.468 152.456 234.667 151.809 234.667 151.147C234.667 150.485 234.468 149.838 234.095 149.291C233.722 148.744 233.192 148.322 232.576 148.08L228.604 146.432C221.863 143.668 216.439 138.423 213.45 131.779L211.366 127.104C211.089 126.506 210.647 126 210.092 125.645C209.537 125.29 208.892 125.102 208.233 125.102C207.574 125.102 206.929 125.29 206.374 125.645C205.819 126 205.377 126.506 205.101 127.104L202.9 132.053C199.993 138.534 194.762 143.69 188.241 146.504L184.555 148.106C181.859 149.278 181.859 153.009 184.555 154.188Z";

export type Stop = { c: string; o: number };

export function Mark({
  id,
  from,
  to,
  stops,
  star,
  size = 96,
  flagOpacity = 1,
}: {
  id: string;
  from?: string;
  to?: string;
  stops?: Stop[];
  star: string;
  size?: number;
  flagOpacity?: number;
}) {
  const gstops: Stop[] = stops ?? [
    { c: from ?? "#0069EB", o: 0 },
    { c: to ?? "#029BEB", o: 1 },
  ];
  return (
    <svg width={size} height={size} viewBox="92 92 169 149" fill="none" aria-hidden>
      <defs>
        <linearGradient
          id={`fg-${id}`}
          x1="99.9999"
          y1="102.883"
          x2="217.601"
          y2="170.78"
          gradientUnits="userSpaceOnUse"
        >
          {gstops.map((s, i) => (
            <stop key={i} offset={s.o} stopColor={s.c} />
          ))}
        </linearGradient>
      </defs>
      <path d={P_FLAG_BODY} fill={`url(#fg-${id})`} fillOpacity={flagOpacity} />
      <path d={P_FLAG_TIP} fill={`url(#fg-${id})`} fillOpacity={flagOpacity} />
      <path d={P_STAR} fill={star} />
    </svg>
  );
}

/* Oli&Hue's pick — the recommended identity (Iris colour · Quiet Clarity type).
   Exact values from the established lockup SVGs. */
export const IRIS_PICK = {
  stops: [{ c: "#AB6FFF", o: 0 }, { c: "#4C54E3", o: 1 }] as Stop[],
  star: "#FFB14E",
  flagOpacity: 0.8,
  ink: "#0D0B16",
  surface: "#F6F7F9",
  css: "linear-gradient(135deg,#AB6FFF,#4C54E3)",
};

export const FLAG = {
  light: { from: "#0069EB", to: "#029BEB" },
  dark: { from: "#007DFF", to: "#16AFFF" },
};

export const PICK = { name: "Signal Apricot", light: "#FF9E6B", dark: "#FFC49A" };

export type Star = {
  key: string;
  name: string;
  light: string;
  dark: string;
  meaning: string;
  verdict: string;
};

export const STARS: Star[] = [
  {
    key: "apricot",
    name: "Soft Apricot",
    light: "#EBC89E",
    dark: "#FFDCB2",
    meaning:
      "Human connection, warmth, emotion. The colour of skin and morning light — it reads as care, not code.",
    verdict: "On-brand — it speaks Human pulse. Our pick (refined).",
  },
  {
    key: "gold",
    name: "Gold",
    light: "#F5B72E",
    dark: "#FFC24D",
    meaning:
      "Recognition, insight, value. The spark of an idea; the kudos pop. Premium and optimistic.",
    verdict: "Strong, but leans reward over humanity. Best as a secondary accent.",
  },
  {
    key: "green",
    name: "Green",
    light: "#00D579",
    dark: "#00E98D",
    meaning: "Growth, momentum, wellbeing — things getting better. Alive and positive.",
    verdict: "Reads as a status light (“all good”) and clashes with UI semantics.",
  },
  {
    key: "red",
    name: "Signal Red",
    light: "#FB4B43",
    dark: "#FF5A50",
    meaning:
      "The urgent human moment — attention, now. The flight-risk alert, the thing you must see.",
    verdict: "Too hot as the everyday mark. Reserve it for real in-product alerts.",
  },
];

/* ── Direction 2 — the gradient spectrum ──────────────────────────────
   Where Direction 1 is one calm blue + a variable spark, Direction 2 is
   expressive: the whole mark is a gradient. Each one runs warm↔cool —
   human feeling flowing into intelligence — and is named for its mood.
   All gradients are analogous (no muddy mid-tones), so they stay clean. */

export type Grad = {
  key: string;
  name: string;
  tag: string;
  meaning: string;
  light: { stops: Stop[]; star: string };
  dark: { stops: Stop[]; star: string };
};

export const COLOR2: Grad[] = [
  {
    key: "iris",
    name: "Iris",
    tag: "Intelligence",
    meaning:
      "Violet is the colour of the mind — of AI, focus and imagination. It flows into indigo for depth, and a warm amber spark keeps the intelligence human. Builds on your violet.",
    light: { stops: [{ c: "#A472FF", o: 0 }, { c: "#6A5CF0", o: 0.55 }, { c: "#4B53D9", o: 1 }], star: "#FFB14E" },
    dark: { stops: [{ c: "#B98CFF", o: 0 }, { c: "#7C6CF5", o: 0.55 }, { c: "#5B63E8", o: 1 }], star: "#FFC24D" },
  },
  {
    key: "daybreak",
    name: "Daybreak",
    tag: "Daily ritual",
    meaning:
      "A sunrise — amber into coral — for the app people open every morning. Optimistic, warm, human; the cool violet spark is the quiet intelligence inside the warmth. Builds on your yellow.",
    light: { stops: [{ c: "#FFC53D", o: 0 }, { c: "#FF8A4C", o: 0.55 }, { c: "#FF6B6B", o: 1 }], star: "#7C5CF8" },
    dark: { stops: [{ c: "#FFD15C", o: 0 }, { c: "#FF9A5C", o: 0.55 }, { c: "#FF7B7B", o: 1 }], star: "#9D8CFF" },
  },
  {
    key: "aurora",
    name: "Aurora",
    tag: "Clarity",
    meaning:
      "Teal to blue to violet — a cool, brilliant sweep that reads as signal and insight in motion. The warm coral spark is the one person it all resolves to.",
    light: { stops: [{ c: "#23D7BE", o: 0 }, { c: "#3B9EFF", o: 0.5 }, { c: "#7C5CF8", o: 1 }], star: "#FF8A5B" },
    dark: { stops: [{ c: "#3DEBD0", o: 0 }, { c: "#52ACFF", o: 0.5 }, { c: "#9270FF", o: 1 }], star: "#FF9D6B" },
  },
  {
    key: "bloom",
    name: "Bloom",
    tag: "Human pulse",
    meaning:
      "Rose into violet — vivid and emotional, the heartbeat of engagement made visible. The bright teal spark is the clear read on all that feeling.",
    light: { stops: [{ c: "#FF5CA8", o: 0 }, { c: "#A45CF8", o: 1 }], star: "#2FE0C8" },
    dark: { stops: [{ c: "#FF77B8", o: 0 }, { c: "#B574FF", o: 1 }], star: "#45EBD4" },
  },
];
