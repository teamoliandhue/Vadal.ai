"use client";
/* Answering a pulse — adaptive (engines/survey).

   One question at a time, and only the questions worth asking: someone having a
   good week answers two, someone struggling is asked what got in the way. The
   estimate of what's left is recomputed after every answer, so "about 2 more"
   is honest rather than a fixed 6-of-6 progress bar.

   Anonymity is said up front, in the terms it is enforced (5+ responses before a
   manager sees anything). Text answers are optional — Skip is always there. */
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Languages, Lock } from "lucide-react";
import { Button, SparkMark } from "@vadal/design-system";
import { nextQuestion, remainingCount, type Answers, type Question } from "@/lib/ai/engines/survey";
import { TRANSLATE_LANGS, surveyAvailable, surveyText } from "@/lib/ai/engines/translate";
import { EARN_RULES } from "@/lib/points";
import { SURVEYS } from "@/lib/programmes";
import { usePersistentState } from "@/lib/usePersistentState";
import { usePoints } from "../../usePointsMode";
import { toast } from "../../Toaster";
import { useTranslatePref } from "../../social/Translate";
import { useTranslates } from "../../useTranslationAddon";

const MOODS = [
  { v: 1, emoji: "😣", label: "Rough" }, { v: 2, emoji: "😕", label: "Not great" }, { v: 3, emoji: "😐", label: "Okay" },
  { v: 4, emoji: "🙂", label: "Good" }, { v: 5, emoji: "😄", label: "Great" },
];
const SCALE = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
const SCALE_Q = /\?$/;

export function Respond({ id }: { id: string }) {
  const survey = SURVEYS[id];
  const points = usePoints();
  const [answers, setAnswers] = React.useState<Answers>({});
  const [text, setText] = React.useState("");
  const [, setDone] = usePersistentState<string[]>("vadal:surveys-done", []);
  const [finished, setFinished] = React.useState(false);
  /* Answer in your language. What is stored is always the English question id
     and the English choice, so a Hindi answer and an English one count the same. */
  const translates = useTranslates("surveys");
  const [pref] = useTranslatePref();
  const [inLang, setInLang] = React.useState(false);

  if (!survey) {
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-2 py-24 text-center">
        <SparkMark size={28} tone="gradient" state="idle" />
        <h1 className="text-[18px] font-bold text-ink">This survey isn&apos;t open</h1>
        <p className="text-[14px] text-muted">It may have closed, or the link is for someone else.</p>
        <Link href="/product/home" className="mt-3 text-[14px] font-semibold text-[var(--purple)] hover:underline">Back to Home</Link>
      </div>
    );
  }

  const lang = TRANSLATE_LANGS.find((l) => l.code === pref.lang) ?? TRANSLATE_LANGS[0];
  const strings = [
    ...survey.bank.flatMap((x) => [x.text, ...(x.choices ?? [])]),
    ...MOODS.map((m) => m.label), ...SCALE, "Not at all", "A little", "Somewhat", "Mostly", "Completely", "Next", "Skip", "In your own words — optional",
  ];
  const available = translates && surveyAvailable(strings, lang.code);
  const reading = available && inLang;
  const t = (english: string) => (reading ? surveyText(english, lang.code).text : english);

  const q = finished ? null : nextQuestion(answers, survey.bank);
  const asked = Object.keys(answers).length;
  const left = q ? remainingCount(answers, survey.bank) : 0;
  const earn = EARN_RULES.find((r) => r.source === "survey")!.points;

  const answer = (question: Question, value: number | string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    setText("");
    if (!nextQuestion(next, survey.bank)) {
      setFinished(true);
      setDone((d) => (d.includes(id) ? d : [...d, id]));
      toast(points ? `Thanks — +${earn} points` : "Thanks — your answers are in");
    }
  };

  if (finished || (!q && asked > 0)) {
    return (
      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-6 py-6">
        <div className="rise rounded-[28px] border border-line bg-card p-8 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"><Check className="h-8 w-8" /></span>
          <h1 className="mt-4 text-[26px] font-bold tracking-tight">That&apos;s everything we needed</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {asked} {asked === 1 ? "question" : "questions"} — we only asked what your answers made worth asking.
            {points ? ` +${earn} points, the same for every survey and every answer.` : ""}
          </p>
          <div className="mt-6 rounded-2xl bg-soft p-4 text-left">
            <p className="text-[13px] font-semibold text-ink">What happens next</p>
            <ul className="mt-1.5 space-y-1 text-[14px] text-muted">
              <li>· Results for your team are shared once 5 or more people answer.</li>
              <li>· Your manager sees themes, never who said what.</li>
              <li>· You&apos;ll see what changed because of it in your Home digest.</li>
            </ul>
          </div>
          <Link href="/product/home" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--purple)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const isScale = q.kind === "scale";

  return (
    <div className="mx-auto flex w-full max-w-[620px] flex-col gap-5 py-4">
      <Link href="/product/home" className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink lg:min-h-0"><ArrowLeft className="h-4 w-4" /> Home</Link>

      <header>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{survey.name}{survey.closes !== "Preview" ? ` · closes ${survey.closes}` : " · preview"}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
          <Lock className="h-3.5 w-3.5" />
          {survey.anonymous ? "Anonymous. Your manager sees team results only when 5 or more people answer." : "Your answers go to the People team. Your manager sees a summary, not your words."}
        </p>
        {translates && (
          available ? (
            <div className="mt-3 flex w-fit rounded-full bg-soft p-1" role="group" aria-label="Answer in">
              <button onClick={() => setInLang(false)} aria-pressed={!reading} className={`min-h-[44px] rounded-full px-4 text-[13px] font-semibold lg:min-h-[32px] ${!reading ? "bg-card text-ink shadow-sm" : "text-muted"}`}>English</button>
              <button onClick={() => setInLang(true)} aria-pressed={reading} lang={lang.code} className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold lg:min-h-[32px] ${reading ? "bg-card text-ink shadow-sm" : "text-muted"}`}><Languages className="h-3.5 w-3.5" /> {lang.label}</button>
            </div>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-faint"><Languages className="h-3.5 w-3.5" /> {lang.english} for this survey arrives with the translation provider.</p>
          )
        )}
      </header>

      <section key={q.id} className="rise rounded-[28px] border border-line bg-card p-6 sm:p-8" aria-live="polite">
        <div className="flex items-center justify-between gap-3 text-[12px] text-faint">
          <span>Question {asked + 1}</span>
          <span>{left <= 1 ? "Probably the last one" : `About ${left - 1} more after this`}</span>
        </div>
        <h1 lang={reading ? lang.code : "en"} className="mt-3 text-[clamp(22px,3vw,28px)] font-bold leading-snug tracking-tight">{t(q.text)}</h1>
        {reading && <p className="mt-1 text-[13px] text-faint">{q.text}</p>}

        {q.kind === "mood" && (
          <div className="mt-6 grid grid-cols-5 gap-2" role="group" aria-label={q.text}>
            {MOODS.map((m) => (
              <button key={m.v} onClick={() => answer(q, m.v)} className="flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-soft/40 transition hover:border-[var(--purple)] hover:bg-[var(--lav)]">
                <span className="text-[30px]" aria-hidden>{m.emoji}</span>
                <span className="text-[12px] font-semibold text-muted">{t(m.label)}</span>
              </button>
            ))}
          </div>
        )}

        {isScale && (
          <div className="mt-6 grid gap-2 sm:grid-cols-5" role="group" aria-label={q.text}>
            {(SCALE_Q.test(q.text) ? ["Not at all", "A little", "Somewhat", "Mostly", "Completely"] : SCALE).map((label, i) => (
              <button key={label} onClick={() => answer(q, i + 1)} className="min-h-[52px] rounded-2xl border border-line bg-soft/40 px-2 text-[13px] font-semibold text-ink transition hover:border-[var(--purple)] hover:bg-[var(--lav)]">
                {t(label)}
              </button>
            ))}
          </div>
        )}

        {q.kind === "choice" && (
          <div className="mt-6 flex flex-col gap-2" role="group" aria-label={q.text}>
            {q.choices!.map((c) => (
              <button key={c} onClick={() => answer(q, c)} className="min-h-[52px] rounded-2xl border border-line bg-soft/40 px-4 text-left text-[15px] font-medium text-ink transition hover:border-[var(--purple)] hover:bg-[var(--lav)]">
                {t(c)}
              </button>
            ))}
          </div>
        )}

        {q.kind === "text" && (
          <div className="mt-6">
            <label htmlFor={`a-${q.id}`} className="sr-only">{q.text}</label>
            <textarea id={`a-${q.id}`} value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={t("In your own words — optional")}
              className="w-full resize-none rounded-2xl border border-line bg-transparent px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-[var(--purple)] focus:ring-4 focus:ring-[var(--purple)]/10" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="brand" size="md" disabled={!text.trim()} onClick={() => answer(q, text.trim())}>{t("Next")}</Button>
              <Button variant="tertiary" size="md" onClick={() => answer(q, "")}>{t("Skip")}</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
