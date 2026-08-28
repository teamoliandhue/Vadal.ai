/**
 * Retrieval over the org's own knowledge base.
 *
 * This is genuinely working code with no model involved — scoring, passage
 * selection and citation come out of the documents themselves. That matters for
 * two reasons: it is useful today, and when a real model arrives it is handed
 * these passages as its only permitted source rather than being trusted to
 * remember policy.
 *
 * The brief is unambiguous about why: the policy assistant "should only answer
 * from the org's own uploaded/approved documents (retrieval-grounded), never
 * from general knowledge, to avoid confidently wrong answers about pay, leave
 * or safety policy."
 */
import { articles, answers, type Article } from "@/lib/knowledge";
import type { Citation } from "./types";

/** Words carrying no retrieval signal — dropped before scoring. */
const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "for", "is", "are", "was",
  "were", "be", "been", "do", "does", "did", "how", "what", "when", "where", "who", "why", "which",
  "can", "could", "should", "would", "my", "me", "i", "you", "your", "we", "our", "it", "its",
  "that", "this", "these", "those", "with", "from", "at", "by", "as", "about", "get", "got", "have",
  "has", "many", "much", "much", "there", "any", "all", "so", "just", "am", "will",
]);

function terms(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function articleText(a: Article): string {
  const body = a.sections
    .map((s) => [s.heading, s.text, ...(s.bullets ?? [])].filter(Boolean).join(" "))
    .join(" ");
  return `${a.title} ${a.excerpt} ${body}`.toLowerCase();
}

/** Every sentence in an article, kept whole so a citation quotes real prose. */
function sentences(a: Article): string[] {
  const out: string[] = [];
  for (const s of a.sections) {
    if (s.text) out.push(...s.text.split(/(?<=[.!?])\s+/));
    for (const b of s.bullets ?? []) out.push(b);
  }
  return out.map((s) => s.trim()).filter((s) => s.length > 20);
}

/**
 * Curated keywords must match whole words — but tolerate ordinary inflection.
 *
 * Two failures, one function. A plain substring match let "pto" hit inside
 * "crypto", so "our crypto trading allowance" confidently returned the leave
 * policy. Anchoring both ends then broke the opposite way: "leave" no longer
 * matched "leaves", and the correct leave answer started refusing itself.
 *
 * So: anchor the START of the word, and allow a common English suffix at the
 * end. "crypto" still cannot match "pto" (the preceding "y" blocks it), while
 * "leaves", "claimed" and "posting" all resolve to their keyword.
 */
export function matchesKeyword(query: string, keyword: string): boolean {
  const esc = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}(s|es|d|ed|ing)?([^a-z0-9]|$)`, "i").test(query.toLowerCase());
}

/**
 * Below this, we treat the retrieval as a miss and say we do not know.
 *
 * Refusing is a feature. A confidently wrong answer about leave, pay or safety
 * is the failure mode this whole pillar exists to avoid, and it is much more
 * expensive than an unanswered question.
 */
export const GROUNDING_FLOOR = 3;

export type Passage = {
  article: Article;
  score: number;
  /** The single best-matching sentence — what the citation shows. */
  snippet: string;
};

/**
 * Score articles against the query.
 *
 * Deliberately simple and explainable: term frequency with a title boost and a
 * bonus for curated keyword sets. A real embedding index replaces this behind
 * the same signature; nothing above it needs to change.
 */
export function retrieve(query: string, limit = 3): Passage[] {
  const ts = terms(query);
  if (!ts.length) return [];

  // Curated keyword sets are the strongest signal we have — treat a hit as a
  // strong prior on that article rather than ignoring the editorial work.
  const curated = new Set<string>();
  for (const a of answers) {
    if (a.keywords.some((k) => matchesKeyword(query, k))) a.sources.forEach((s) => curated.add(s));
  }

  const scored: Passage[] = [];
  for (const a of articles) {
    const hay = articleText(a);
    const title = a.title.toLowerCase();
    let score = 0;
    for (const t of ts) {
      if (!hay.includes(t)) continue;
      score += 1;
      if (title.includes(t)) score += 2; // a title match is worth more than a body match
    }
    if (curated.has(a.id)) score += 5;
    if (score <= 0) continue;

    // Pick the sentence that carries the most query terms — that is the passage
    // a person can check the claim against.
    let snippet = a.excerpt;
    let best = -1;
    for (const s of sentences(a)) {
      const low = s.toLowerCase();
      const hits = ts.reduce((n, t) => n + (low.includes(t) ? 1 : 0), 0);
      if (hits > best) { best = hits; snippet = s; }
    }
    scored.push({ article: a, score, snippet });
  }

  scored.sort((x, y) => y.score - x.score);
  if (!scored.length) return scored;
  // Only cite documents that are actually close to the best match. Without this
  // a stray common word ("paid") drags an unrelated policy into the sources,
  // which makes every citation less trustworthy.
  const top = scored[0].score;
  return scored.filter((p) => p.score >= Math.max(GROUNDING_FLOOR, top * 0.6)).slice(0, limit);
}

export function toCitations(passages: Passage[]): Citation[] {
  return passages.map((p) => ({
    id: p.article.id,
    title: p.article.title,
    href: `/product/knowledge?doc=${p.article.id}`,
    snippet: p.snippet,
  }));
}

export function isGrounded(passages: Passage[]): boolean {
  return passages.length > 0 && passages[0].score >= GROUNDING_FLOOR;
}
