# 041 · Translation — the paid add-on

**Status:** built in code · Settings → **Translation** (admins) · Social · survey respondent ·
iLearn practice · Knowledge article drawer · source: roadmap v3 · full evaluation in `docs/TRANSLATION.md`

---

## 1 · Settings → Translation

New tab between *Recognition & points* and *Integrations* (languages icon).

- **Header:** *Translation* + **Paid add-on** badge (brand) · *People read and answer in their own language.
  Billed as an add-on — the price is in your order form.*
- **Add-on switch** (bordered row): *Translation add-on* · *Off removes every translate control, so nobody
  is offered something the workspace hasn't turned on.* Toasts on change.
- **WHERE IT APPEARS:** four switch rows. The first label reads *Summaries in Indian languages · ships
  first*, then *Social posts and comments*, *Surveys and pulses*, *iLearn lessons and quizzes*, each with a
  one-line description. Dimmed to 50% and not interactive while the add-on is off.
- **INDIAN LANGUAGES GO TO:** two selectable cards, 2 columns from `sm`. Selected = `--purple` border
  + `--lav` fill.
  - *Sarvam Translate* + **Recommended** (success) · *Built for Indian languages — the ones most frontline
    teams read.* · *₹20 per 10,000 characters* · faint *₹100 of one-off credits for new accounts · 22 Indian
    languages*
  - *Google Cloud Translation* · *Broad coverage beyond India, for global teams and partners.* · *$20 per
    million characters (NMT)* · faint *First 500,000 characters a month free · Most major world languages*
  - Under the cards: *Everything that isn't an Indian language goes to Google Cloud Translation.
    Translations are made once per item and language, then reused for every reader.*
- **What it costs to run, a month** (bordered box, gradient spark):
  - Two sliders side by side: *Languages in use besides English* (1–7, default 3) · *Comments opened in
    another language* (5–80%, default 35%).
  - Three `--soft` stat tiles: *Characters translated 3.1M* (*1.0M per language*) · *All on Sarvam ₹6,245*
    (*₹0.50 a person a month*) · *All on Google ₹4,615* (*₹0.37 a person a month*).
  - Disclosure *The assumptions behind this* → a table of five lines (Posts, Comments when opened,
    Surveys, Lessons, Summaries), each with its assumption in faint text and characters on the right.
    Then a note on headcount, the ₹88/$ rate, and summaries being billed under AI.
  - Recommendation sentence, which is computed and changes to *at most ₹X* above a rupee a person.
  - Faint line: *Prices checked 17 Sep 2026 —* two external links (44px on touch).
- **LANGUAGES:** a bordered list: languages icon · native name · English name · on the right, **Demo content ·
  review pending** (warning) for Hindi, **With the provider** (neutral) for the rest. Footer: *Safety
  instructions and policies are reviewed by a native speaker before a translation is shown as final.*

## 2 · Where people see it

When the add-on or that surface is off, **the control is gone**. There's no upsell and no disabled button.

- **Social:** the existing *Translate · हिन्दी* row (spec 026) now obeys the switch. "Always translate"
  stops showing translations too.
- **Survey respondent:** under the privacy line, a segmented control **English · 🌐 हिन्दी** (44px on
  touch). In Hindi, the question shows in Hindi with the English in faint text below it. Moods, scale
  labels, choices, *आगे* and *छोड़ें* are all translated. Surveys that don't have a translation yet show a
  faint line instead: *Hindi for this survey arrives with the translation provider.*
- **iLearn · Adaptive practice:** a right-aligned Aurora text button **🌐 हिन्दी** / **English** in the card
  header. It translates the question, the options and the *स्रोत से:* explanation.
- **Knowledge article drawer:** under the staleness note, an Aurora text button **🌐 Summary in हिन्दी** →
  an Aurora box with the summary and a faint line: *Summarised in Hindi by Nudge · a reading aid — the
  policy below is what applies.* Articles without a summary get a dashed note.
