# Translation — provider evaluation and decision

*Roadmap v3 · 17 Sep 2026 · prices re-check before any client quote*

## Decision

- **Sarvam Translate for Indian languages, Google Cloud Translation for everything else.** Routed by
  language, so each provider does what it's best at.
- **Billed as a paid add-on** (Settings → Translation). When it's off, every translate control disappears.
  Employees are never offered something the workspace hasn't bought.
- **Summaries in Indian languages ship first**, then Social, surveys and iLearn.
- **A native speaker reviews the first hundred translations** before a language goes to everyone. Safety
  instructions and policies are always reviewed before a translation is shown as final.
- **Only claim "100+ languages" on the website** once Google is live for non-Indian languages.

## Prices (from each provider's own page, 17 Sep 2026)

| Provider | Published price | Per million characters | Free | Coverage |
|---|---|---|---|---|
| Sarvam Translate | ₹20 per 10,000 characters | ₹2,000 | ₹100 of one-off credits | 22 Indian languages |
| Google Cloud Translation (NMT) | $20 per million characters | ≈ ₹1,760 at ₹88/$ | First 500,000 characters a month | Most major world languages |

Sources: [Sarvam pricing](https://docs.sarvam.ai/api-reference-docs/pricing) ·
[Google Cloud Translation pricing](https://cloud.google.com/translate/pricing).

## What it costs to run

We translate each item once per language, cache it, and reuse it for every reader. So cost depends on
**how much is written and how many languages are in use**, not on headcount or how often people read.

Per language, per month, for the demo tenant (12,480 people). Every figure here can be changed in the
Settings panel:

| Content | Characters | Assumption |
|---|---|---|
| Posts | 524,300 | 0.12 posts a person × 350 characters |
| Comments, when opened | 262,080 | half a comment a person × 120 characters × 35% opened in another language |
| Surveys | 14,400 | 12 surveys × 1,200 characters |
| Lessons | 150,000 | 10 new lessons × 15,000 characters |
| Summaries | 90,000 | 30 documents × 3,000 characters |
| **Per language** | **≈ 1.04M** | |

With three languages besides English (≈ 3.1M characters):

- **All on Sarvam:** ≈ ₹6,245 a month (₹0.50 a person)
- **All on Google:** ≈ ₹4,615 a month (₹0.37 a person), after the free 500,000

Both providers cost under a rupee a person a month at this size. **The choice comes down to quality,
not price.** That's why we recommend the Indian-language specialist for Indian languages, and a blind
review by native speakers on our own content before it's final. Writing summaries also needs a language
model, which is billed separately under AI & guardrails.

## What's built

- **Settings → Translation:** add-on switch; where it appears (summaries · Social · surveys · iLearn);
  provider for Indian languages; live cost estimate with the assumptions visible; language status.
- **Social:** Translate under posts, only when the add-on and the Social switch are both on.
- **Surveys:** answer in English or हिन्दी. Answers are stored against the English question and choice,
  so results stay comparable. Surveys without a translation say it's coming with the provider.
- **iLearn:** practice questions in हिन्दी, with the same answer index.
- **Knowledge:** *Summary in हिन्दी* on the most-read policies, marked as a reading aid.
  The policy text is what applies.

The seeded Hindi is demo content and still needs a native speaker's review.

## Still to do when a provider is contracted

1. Replace `fromProvider` in `src/lib/ai/engines/translate.ts` with the routed call (Sarvam / Google).
2. Add a translation cache keyed by content hash + language.
3. Add a review queue for policy and safety content before a translation shows as final.
4. Put a usage meter against the estimate in Settings.
