/**
 * Translation add-on (roadmap v3) — providers, cost model, surfaces.
 *
 * The cost decision the roadmap asked for, in numbers the admin can move:
 * translation is paid for per character sent to the provider, and a
 * translation is made once per item per language and cached. So the bill grows
 * with how much is WRITTEN and how many languages are in use — not with how many
 * people read it. That is why it is cheap, and why it can be a flat add-on.
 *
 * Prices are copied from each provider's own pricing page on 17 Sep 2026 and
 * must be re-checked before a quote goes to a client.
 */

export type ProviderId = "sarvam" | "google";

export type Provider = {
  id: ProviderId;
  name: string;
  /** What it is best at, in a line. */
  fit: string;
  /** Cost per million characters, in rupees, as billed. */
  perMillionInr: number;
  /** How the published price is stated, verbatim in shape. */
  published: string;
  free: string;
  freeMonthlyChars: number;
  languages: string;
  source: string;
};

/** Stated assumption for comparing a dollar price with a rupee one. */
export const INR_PER_USD = 88;

export const PROVIDERS: Provider[] = [
  {
    id: "sarvam", name: "Sarvam Translate",
    fit: "Built for Indian languages — the ones most frontline teams read.",
    perMillionInr: 2000,
    published: "₹20 per 10,000 characters",
    free: "₹100 of one-off credits for new accounts",
    freeMonthlyChars: 0,
    languages: "22 Indian languages",
    source: "https://docs.sarvam.ai/api-reference-docs/pricing",
  },
  {
    id: "google", name: "Google Cloud Translation",
    fit: "Broad coverage beyond India, for global teams and partners.",
    perMillionInr: 20 * INR_PER_USD,
    published: "$20 per million characters (NMT)",
    free: "First 500,000 characters a month free",
    freeMonthlyChars: 500_000,
    languages: "Most major world languages",
    source: "https://cloud.google.com/translate/pricing",
  },
];

export const PRICES_CHECKED = "17 Sep 2026";

export type SurfaceKey = "summaries" | "feed" | "surveys" | "learning";

export const SURFACES: { key: SurfaceKey; label: string; desc: string; first?: boolean }[] = [
  { key: "summaries", label: "Summaries in Indian languages", desc: "A short summary of a policy or long announcement, in the reader's language. The original stays what applies.", first: true },
  { key: "feed", label: "Social posts and comments", desc: "Translate under every post, and “always translate” for people who choose it." },
  { key: "surveys", label: "Surveys and pulses", desc: "People answer in their language; answers are stored against the English question so results stay comparable." },
  { key: "learning", label: "iLearn lessons and quizzes", desc: "Lessons and practice questions in the learner's language." },
];

/** A month of translated characters, per language in use. Each line is an assumption the panel shows. */
export function monthlyCharacters(opts: { headcount: number; languages: number; onDemandShare: number }) {
  const lines = [
    { label: "Posts", chars: Math.round(opts.headcount * 0.12) * 350, note: "0.12 posts a person a month × 350 characters" },
    { label: "Comments, when opened", chars: Math.round(opts.headcount * 0.5 * 120 * opts.onDemandShare), note: `half a comment a person × 120 characters × ${Math.round(opts.onDemandShare * 100)}% opened in another language` },
    { label: "Surveys", chars: 12 * 1200, note: "12 surveys × 1,200 characters" },
    { label: "Lessons", chars: 10 * 15000, note: "10 new lessons × 15,000 characters" },
    { label: "Summaries", chars: 30 * 3000, note: "30 documents × 3,000 characters read" },
  ];
  const perLanguage = lines.reduce((s, l) => s + l.chars, 0);
  return { lines, perLanguage, total: perLanguage * opts.languages };
}

export function monthlyCostInr(p: Provider, chars: number): number {
  return Math.round((Math.max(0, chars - p.freeMonthlyChars) / 1_000_000) * p.perMillionInr);
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
