/* ════════════════════════════════════════════════════════════════════
   Six typography directions — each a different way of THINKING about the
   Vadal product. The "why it fits Vadal.ai" is the priority of each.
   Fonts are loaded in app/layout.tsx; here we reference their CSS vars.
   ════════════════════════════════════════════════════════════════════ */

export type TypeDir = {
  slug: string;
  num: string;
  name: string;
  idea: string; // the way of thinking about the product
  lede: string; // hero sub
  display: string; // css var for the display/logotype face
  displaySerif?: boolean;
  text: string; // css var for the text/UI face
  data?: string; // css var for the data/figures face (optional)
  accent: string; // signature accent hex (mark stays Iris; this themes the page)
  accentSoft: string;
  typeface: { name: string; meta: string; pairing: string };
  why: { lead: string; points: { h: string; p: string }[] };
  scale: { label: string; px: number; on: "display" | "text" | "data"; italic?: boolean; sample: string }[];
  inContext: { eyebrow: string; headline: string; italicWord?: string; body: string; metric?: string; metricLabel?: string };
  bestWith: string; // which colour gradient pairs best
};

const G = {
  grotesk: "var(--font-grotesk)",
  inter: "var(--font-inter)",
  fraunces: "var(--font-fraunces)",
  jakarta: "var(--font-jakarta)",
  geist: "var(--font-geist)",
  mono: "var(--font-mono)",
  bricolage: "var(--font-bricolage)",
  hanken: "var(--font-hanken)",
};

export const TYPE_DIRECTIONS: TypeDir[] = [
  {
    slug: "geometric-signal",
    num: "01",
    name: "Geometric Signal",
    idea: "Vadal as a precision intelligence instrument.",
    lede: "Space Grotesk’s angular cuts echo the V mark; Inter keeps the dense product legible; Geist Mono gives every number the air of an instrument.",
    display: G.grotesk,
    text: G.inter,
    data: G.mono,
    accent: "#5d63e1",
    accentSoft: "#eef0ff",
    typeface: { name: "Space Grotesk", meta: "Florian Karsten · geometric grotesque · variable", pairing: "Space Grotesk · Inter · Geist Mono" },
    why: {
      lead: "Space Grotesk makes Vadal read like an instrument, not an app.",
      points: [
        { h: "It rhymes with the mark", p: "Straight terminals and circular bowls echo the flag’s geometry, so wordmark and mark read as one object — engineered, deliberate." },
        { h: "Decision-grade, not cold", p: "Geometric enough to feel precise in a boardroom, with just enough quirk to stay human — the exact register a CHRO needs to defend a number." },
        { h: "Numbers that hold their line", p: "Even, tabular-friendly figures suit a product where “82 / 100” shows up on every screen and has to line up cleanly." },
      ],
    },
    scale: [
      { label: "Display", px: 64, on: "display", sample: "Know your people. Early." },
      { label: "Headline", px: 40, on: "display", sample: "People intelligence, decision-grade" },
      { label: "Title", px: 24, on: "display", sample: "Workforce health snapshot" },
      { label: "Body", px: 17, on: "text", sample: "Vadal turns thousands of human signals into one clear read — and the action to take next." },
      { label: "Data", px: 20, on: "data", sample: "92.4%  ·  4,182  ·  +6.1" },
    ],
    inContext: { eyebrow: "In context", headline: "Know your people. Early.", body: "Vadal reads thousands of quiet signals and resolves them to one clear answer — for one person, this week.", metric: "92.4%", metricLabel: "flight-risk confidence · A. Mehta" },
    bestWith: "Pairs with the Aurora gradient — cool, precise, in motion.",
  },
  {
    slug: "humanist-editorial",
    num: "02",
    name: "Humanist Editorial",
    idea: "Vadal as the brand that gives the people-side of work a voice.",
    lede: "A serif wordmark is a quiet act of confidence in a category of identical sans logos — and the truest way to say a brand about people has a heart.",
    display: G.fraunces,
    displaySerif: true,
    text: G.jakarta,
    accent: "#7c5cf8",
    accentSoft: "#efeaff",
    typeface: { name: "Fraunces", meta: "Undercase Type · old-style serif · variable (soft / wonk)", pairing: "Fraunces · Plus Jakarta Sans" },
    why: {
      lead: "A serif says, out loud, that this is a brand about people.",
      points: [
        { h: "Unmistakable in a sea of sans", p: "Every competitor’s logo is a neutral sans. A warm serif wordmark is instantly recognisable and reads premium before a word is processed." },
        { h: "Gravitas and warmth at once", p: "Old-style serifs carry authority (trust the board needs) and warmth (the Human pulse) in the same shapes — the brand’s exact duality." },
        { h: "A voice for the human moments", p: "Recognition, a check-in, a hard truth said gently — a serif gives those moments the weight a cold dashboard never could." },
      ],
    },
    scale: [
      { label: "Display", px: 68, on: "display", sample: "The heartbeat of work" },
      { label: "Editorial", px: 44, on: "display", italic: true, sample: "being heard, at scale" },
      { label: "Title", px: 24, on: "text", sample: "Employee voice & sentiment" },
      { label: "Body", px: 17, on: "text", sample: "Vadal listens to how people really feel, and helps you act on it before it’s too late." },
      { label: "Caption", px: 13, on: "text", sample: "Updated 2 minutes ago · 4,182 voices" },
    ],
    inContext: { eyebrow: "In context", headline: "The brand that feels like", italicWord: "being heard.", body: "A serif headline gives the human moments the warmth they deserve, while the sans underneath keeps the product calm and easy to live in." },
    bestWith: "Pairs with the Daybreak gradient — the warmest, most human lockup.",
  },
  {
    slug: "data-instrument",
    num: "03",
    name: "Data Instrument",
    idea: "Vadal as engineered, auditable truth — the AI you can trust the maths of.",
    lede: "Monospace is the typography of evidence. It makes the intelligence feel measured, exact, and accountable — not a black box.",
    display: G.geist,
    text: G.geist,
    data: G.mono,
    accent: "#0ea5a0",
    accentSoft: "#e3f7f5",
    typeface: { name: "Geist + Geist Mono", meta: "Vercel · neutral grotesque + monospace", pairing: "Geist · Geist Mono" },
    why: {
      lead: "Monospace says: this number is exact, and you can see how we got it.",
      points: [
        { h: "The AI shows its receipts", p: "Confidence scores, signal counts, timestamps in mono read as measured and verifiable — the antidote to “black-box AI” doubt that stalls enterprise deals." },
        { h: "Built, not decorated", p: "Geist reads as genuinely well-engineered software — the credibility that survives an IT and security review, not just a marketing page." },
        { h: "Tables that breathe", p: "Even widths and tabular figures keep dense heatmaps and reports aligned and calm at any zoom." },
      ],
    },
    scale: [
      { label: "Display", px: 60, on: "display", sample: "Score → Insight → Action" },
      { label: "Mono", px: 40, on: "data", sample: "engagement = 82.4" },
      { label: "Title", px: 24, on: "display", sample: "Attrition & risk intelligence" },
      { label: "Body", px: 17, on: "text", sample: "Every figure traces back to the signals behind it — open any number to see the maths." },
      { label: "Data", px: 20, on: "data", sample: "0.924  ·  n=4,182  ·  p<0.01" },
    ],
    inContext: { eyebrow: "In context", headline: "Every number, accountable.", body: "Hover any metric and Vadal shows the model, the inputs and the confidence — intelligence you can audit, not just believe.", metric: "0.924", metricLabel: "model confidence · n = 4,182" },
    bestWith: "Pairs with the Iris gradient — premium, technical, intelligent.",
  },
  {
    slug: "daily-companion",
    num: "04",
    name: "Daily Companion",
    idea: "Vadal as the friendly habit people open every morning.",
    lede: "Engagement data is only as good as participation — and participation is a habit. The type has to feel like an app you actually want to open.",
    display: G.jakarta,
    text: G.jakarta,
    accent: "#ff7a4d",
    accentSoft: "#fff0e9",
    typeface: { name: "Plus Jakarta Sans", meta: "Tokotype · humanist geometric sans · variable", pairing: "Plus Jakarta Sans" },
    why: {
      lead: "Jakarta is the face of an app you’re glad to see each morning.",
      points: [
        { h: "Approachable lowers the barrier", p: "Soft, open curves feel friendly, so employees actually engage daily — and daily participation is the fuel the whole intelligence layer runs on." },
        { h: "Native to a Gen-Z workforce", p: "It speaks the visual language of the consumer apps people already love, meeting them where their attention already is." },
        { h: "Friendly, still professional", p: "Warm without being childish — clean enough to carry the leadership surface as well as the daily one." },
      ],
    },
    scale: [
      { label: "Display", px: 62, on: "display", sample: "Your day at work" },
      { label: "Headline", px: 38, on: "display", sample: "3-day streak — keep it going" },
      { label: "Title", px: 24, on: "display", sample: "Today’s check-in" },
      { label: "Body", px: 17, on: "text", sample: "A few taps a day keeps your team’s pulse alive — and your voice in the room." },
      { label: "Caption", px: 13, on: "text", sample: "2 missions left · +40 XP today" },
    ],
    inContext: { eyebrow: "In context", headline: "The people app teams actually open.", body: "Streaks, recognition, a 20-second check-in — small, warm moments that turn engagement from a yearly survey into a daily habit.", metric: "3-day", metricLabel: "streak · 2 missions left" },
    bestWith: "Pairs with the Daybreak gradient — the daily-ritual lockup.",
  },
  {
    slug: "modern-voice",
    num: "05",
    name: "Modern Voice",
    idea: "Vadal as a living, opinionated workplace voice — a publication, not a portal.",
    lede: "Vadal’s missing layer is content and communication. The type should sound like it has something to say, not just numbers to show.",
    display: G.bricolage,
    text: G.inter,
    accent: "#e0458c",
    accentSoft: "#fdeaf3",
    typeface: { name: "Bricolage Grotesque", meta: "Mathieu Triay · contemporary grotesque · variable (opsz)", pairing: "Bricolage Grotesque · Inter" },
    why: {
      lead: "Bricolage gives Vadal an editorial point of view.",
      points: [
        { h: "Character with full clarity", p: "A contemporary grotesque with real personality — Vadal sounds authored and current, not like another neutral SaaS template." },
        { h: "Made for the content layer", p: "Feeds, leadership messages and stories need a voice. Editorial type makes the communication layer — Vadal’s biggest gap — feel written, not generated." },
        { h: "Unmistakably 2026", p: "Distinct and ownable, so the brand reads as ahead of the category instead of blending into it." },
      ],
    },
    scale: [
      { label: "Display", px: 64, on: "display", sample: "What your people are saying" },
      { label: "Headline", px: 40, on: "display", sample: "This week at the company" },
      { label: "Title", px: 24, on: "display", sample: "From the leadership desk" },
      { label: "Body", px: 17, on: "text", sample: "A workplace feed worth reading — leadership notes, recognition and the stories behind the numbers." },
      { label: "Caption", px: 13, on: "text", sample: "Posted 9:00 AM · 312 reactions" },
    ],
    inContext: { eyebrow: "In context", headline: "A workplace worth reading.", body: "When the brand has a voice, the feed feels authored — leadership messages, recognition and culture read like a publication people open by choice.", metric: "312", metricLabel: "reactions · this morning" },
    bestWith: "Pairs with the Bloom gradient — expressive and alive.",
  },
  {
    slug: "quiet-clarity",
    num: "06",
    name: "Quiet Clarity",
    idea: "Vadal as calm, legible trust — the platform that gets out of the way.",
    lede: "The most enterprise-safe direction: a humanist grotesque that reads as confidence you don’t even notice.",
    display: G.hanken,
    text: G.hanken,
    accent: "#3f6b5e",
    accentSoft: "#e7f1ed",
    typeface: { name: "Hanken Grotesk", meta: "Hanken Design Co. · humanist grotesque · variable", pairing: "Hanken Grotesk (one family, every role)" },
    why: {
      lead: "Hanken Grotesk is confidence you don’t notice — pure legibility.",
      points: [
        { h: "Banking-calm, with a human edge", p: "The neutral, trustworthy register the CHRO reads as “serious software,” warmed by humanist proportions so it never feels cold or corporate." },
        { h: "Built for density at scale", p: "Superb at small sizes and long reading — exactly what a workforce-wide tool full of tables, surveys and reports demands." },
        { h: "One family, every role", p: "Display, UI and data all live gracefully in a single variable family — the lowest-risk system to ship across a whole enterprise." },
      ],
    },
    scale: [
      { label: "Display", px: 62, on: "display", sample: "Clear by default" },
      { label: "Headline", px: 38, on: "display", sample: "Workforce health, at a glance" },
      { label: "Title", px: 24, on: "display", sample: "Engagement overview" },
      { label: "Body", px: 17, on: "text", sample: "Everything legible, nothing shouting — the interface stays calm so the insight stands out." },
      { label: "Caption", px: 13, on: "text", sample: "Updated 2 minutes ago · all teams" },
    ],
    inContext: { eyebrow: "In context", headline: "Clarity that gets out of the way.", body: "No flourish, no friction — Hanken keeps every screen quiet and readable, so the only thing that stands out is the answer.", metric: "100%", metricLabel: "legible at every size" },
    bestWith: "Pairs with the constant-blue (Colour 01) — calm, trustworthy, classic.",
  },
];

export const getDirection = (slug: string) => TYPE_DIRECTIONS.find((d) => d.slug === slug);
