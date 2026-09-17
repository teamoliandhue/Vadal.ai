"use client";
/* A joiner's first 90 days.

   Three things, in the order a joiner needs them:
   · the setup assistant — it opens with what it already knows from the org
     chart and asks two light questions a session instead of a form
     (engines/onboarding: openingTurn → nextTurn → applyAnswer → completeOnboarding);
   · the journey — what's due, by when, and whose job each item is. Most of
     week one belongs to someone else, and saying so takes pressure off;
   · the people — manager, buddy, People partner.

   Someone who isn't a joiner sees Dev Patel's journey as a preview, and nothing
   they answer is saved — a preview must never write someone else's profile. */
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Eye, Languages } from "lucide-react";
import { Avatar, Badge, Button, SparkMark } from "@vadal/design-system";
import { applyAnswer, completeOnboarding, nextTurn, openingTurn, type OnboardingStep } from "@/lib/ai/engines/onboarding";
import { emptyProfile, inferFromContext, type PersonProfile } from "@/lib/ai/engines/personalize";
import { LANGUAGES } from "@/lib/ai/engines/text";
import { TRANSLATE_LANGS } from "@/lib/ai/engines/translate";
import { DIRECTORY } from "@/lib/auth";
import {
  ANSWER_CHOICES, DONE_BY_OTHERS, JOINED, JOURNEY, JOURNEY_ITEMS, OWNER_LABEL, phaseFor, type JourneyItem,
} from "@/lib/lifecycle";
import { usePersistentState } from "@/lib/usePersistentState";
import { toast } from "../../Toaster";
import { useSession } from "../../useSession";
import { useViewAs } from "../../useViewAs";
import { readOnboarding, writeOnboarding, type OnboardingAnswers } from "../../useProfile";
import { useTranslatePref } from "../../social/Translate";

const DEMO_JOINER = "dev@oliandhue.com";
const HOME_LABEL: Record<string, string> = {
  checkin: "Check-in", myday: "My day", calendar: "Calendar", recognition: "Kudos", feed: "Social",
  learning: "Learning", wellbeing: "Wellbeing", team: "Team", announcements: "Announcements",
};
const EMPTY: OnboardingAnswers = { known: [], language: "English", interests: {}, answers: {} };

export function Journey() {
  const { session, ready } = useSession();
  const [role] = useViewAs();
  if (!ready || !session) return <div className="mx-auto w-full max-w-[1120px] py-10" aria-busy="true" />;

  const own = Boolean(JOINED[session.email]);
  const email = own ? session.email : DEMO_JOINER;
  const who = own
    ? { name: session.name, team: session.team, title: session.title, profile: session.profile }
    : { name: DIRECTORY[DEMO_JOINER].name, team: DIRECTORY[DEMO_JOINER].team, title: DIRECTORY[DEMO_JOINER].title, profile: DIRECTORY[DEMO_JOINER].profile };
  const joined = JOINED[email];
  const base = emptyProfile(email, own ? role : "employee", who.team, who.title, who.profile);

  return <JourneyView key={email} email={email} preview={!own} who={who} joined={joined} base={base} />;
}

function JourneyView({ email, preview, who, joined, base }: {
  email: string; preview: boolean;
  who: { name: string; team: string; title: string };
  joined: (typeof JOINED)[string];
  base: PersonProfile;
}) {
  const first = who.name.split(" ")[0];
  const day = joined.day;
  const phase = phaseFor(day);
  const [ticked, setTicked] = usePersistentState<string[]>(preview ? "vadal:onboard-checklist-preview" : `vadal:onboard-checklist:${email}`, []);
  const [surveysDone] = usePersistentState<string[]>("vadal:surveys-done", []);
  const [answers, setAnswers] = React.useState<OnboardingAnswers>(() => (preview ? null : readOnboarding(email)) ?? EMPTY);

  const auto = new Set<string>([...DONE_BY_OTHERS]);
  if (answers.known.length >= 2) auto.add("setup");
  if (!preview && surveysDone.includes("onboarding")) auto.add("day7");
  const isDone = (i: JourneyItem) => auto.has(i.id) || ticked.includes(i.id);
  const dueNow = JOURNEY_ITEMS.filter((i) => i.due <= Math.max(day, 7));
  const doneNow = dueNow.filter(isDone).length;

  const toggle = (i: JourneyItem) => {
    const on = !ticked.includes(i.id);
    setTicked((t) => (on ? [...t, i.id] : t.filter((x) => x !== i.id)));
    if (on) toast(`Done — ${i.title.replace(/^./, (c) => c.toLowerCase())}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      {preview && (
        <p className="rise flex items-start gap-2 rounded-2xl border border-dashed border-line bg-soft px-4 py-3 text-[14px] text-muted">
          <Eye className="mt-[2px] h-4 w-4 shrink-0" />
          <span>Preview — this is {who.name}&rsquo;s journey, as they see it on day {day}. Anything you answer here isn&rsquo;t saved.</span>
        </p>
      )}

      <header className="rise">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">
          <SparkMark size={14} tone="gradient" state="idle" /> Your first 90 days
        </p>
        <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Day {day}, {first}. You&rsquo;re in {phase.label.toLowerCase()}.</h1>
        <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-muted">
          {`${who.title} on ${who.team} · started ${joined.startDate}. ${doneNow} of ${dueNow.length} things for this stretch are done — most of what’s left in week one is yours, and none of it is a test.`}
        </p>
        <Track day={day} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <SetupAssistant email={email} preview={preview} base={base} answers={answers} setAnswers={setAnswers} who={who} joined={joined} />

          <section className="card-lift rounded-[26px] border border-line bg-card p-6 sm:p-7" aria-labelledby="journey-h">
            <h2 id="journey-h" className="text-[18px] font-bold tracking-tight">Your journey</h2>
            <p className="mt-1 text-[14px] text-muted">Each item says whose it is. Tick yours off as you go — your manager sees progress, never a score.</p>
            <div className="mt-4 flex flex-col divide-y divide-[var(--line)]">
              {JOURNEY.map((p) => {
                const current = p.id === phase.id;
                const past = p.to < day;
                const done = p.items.filter(isDone).length;
                return (
                  <details key={p.id} open={current || (past && done < p.items.length)} className="group py-3 first:pt-0 last:pb-0">
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold ${done === p.items.length ? "bg-[var(--success)] text-white" : current ? "bg-[var(--purple)] text-white" : "bg-soft text-faint"}`}>
                        {done === p.items.length ? <Check className="h-4 w-4" /> : `${done}`}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-ink">{p.label}{current && <span className="ml-2 align-middle"><Badge tone="brand" size="sm">Now</Badge></span>}</span>
                        <span className="block text-[13px] text-faint">{p.from <= 0 ? "Before you started" : `Days ${p.from}–${p.to}`} · {done} of {p.items.length} done</span>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-faint transition group-open:rotate-180" />
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1.5 pl-0 sm:pl-10">
                      {p.items.map((i) => {
                        const d = isDone(i);
                        const mine = i.owner === "you" && !auto.has(i.id);
                        const late = !d && i.due < day;
                        return (
                          <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-2 py-1.5 hover:bg-soft">
                            {mine ? (
                              <button
                                onClick={() => toggle(i)} aria-pressed={d} aria-label={`${d ? "Untick" : "Tick off"}: ${i.title}`}
                                className="grid h-11 w-11 shrink-0 place-items-center lg:h-8 lg:w-8"
                              >
                                <span className={`grid h-5 w-5 place-items-center rounded-md border-2 transition ${d ? "border-[var(--success)] bg-[var(--success)] text-white" : "border-line"}`}>{d && <Check className="h-3.5 w-3.5" />}</span>
                              </button>
                            ) : (
                              <span className="grid h-11 w-11 shrink-0 place-items-center lg:h-8 lg:w-8" aria-hidden>
                                <span className={`grid h-5 w-5 place-items-center rounded-full ${d ? "bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-[var(--success)]" : "border-2 border-dashed border-line"}`}>{d && <Check className="h-3.5 w-3.5" />}</span>
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className={`block text-[14px] ${d ? "text-muted line-through decoration-[var(--faint)]" : "text-ink"}`}>{i.title}</span>
                              <span className="block text-[12px] text-faint">
                                {OWNER_LABEL[i.owner]}{i.owner !== "you" && !d ? " is on it" : ""} · {i.due <= 0 ? "before day one" : `by day ${i.due}`}{late ? " · a little behind — no rush" : ""}
                                {auto.has(i.id) && i.owner === "you" ? " · ticked automatically" : ""}
                              </span>
                            </span>
                            {i.href && !d && (
                              <Link href={i.href} className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0">
                                {i.id.startsWith("day") ? (i.due > day ? "Preview" : "Answer") : "Open"} <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <People joined={joined} preview={preview} />
          <section className="card-lift rounded-[26px] border border-line bg-card p-6">
            <h2 className="text-[16px] font-bold tracking-tight">Coming up</h2>
            <ul className="mt-3 flex flex-col gap-3 text-[14px]">
              <li>
                <p className="font-semibold text-ink">Day 7 check-in · Monday</p>
                <p className="mt-0.5 text-muted">Two questions if all&rsquo;s well, five if it isn&rsquo;t. People reads it; {joined.manager.split(" ")[0]} sees a summary, not your words.</p>
              </li>
              <li>
                <p className="font-semibold text-ink">Agree 30-60-90 goals · by day 14</p>
                <p className="mt-0.5 text-muted">{joined.manager.split(" ")[0]} will bring a draft. Bring one thing you want to learn.</p>
              </li>
              <li>
                <p className="font-semibold text-ink">“Welcome to Oli&amp;Hue” · 25 min</p>
                <p className="mt-0.5 text-muted">Four short parts — do them on any break, in any order.</p>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* The 90-day track — where today sits, and the three check-ins. */
function Track({ day }: { day: number }) {
  const pct = (d: number) => `${(Math.min(Math.max(d, 0), 90) / 90) * 100}%`;
  return (
    <div className="mt-5 max-w-[720px]" role="img" aria-label={`Day ${day} of 90. Check-ins on day 7, day 30 and day 90.`}>
      <div className="relative h-2 rounded-full bg-soft">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple)]" style={{ width: pct(day) }} />
        {[7, 30, 90].map((m) => (
          <span key={m} className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card ${m <= day ? "bg-[var(--purple)]" : "bg-[var(--line)]"}`} style={{ left: pct(m) }} />
        ))}
      </div>
      <div className="relative mt-2 h-4 text-[12px] text-faint">
        <span className="absolute left-0">Day 1</span>
        <span className="absolute hidden -translate-x-1/2 whitespace-nowrap md:inline" style={{ left: pct(7) }}>Day 7</span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pct(30) }}>Day 30</span>
        <span className="absolute right-0">Day 90</span>
      </div>
    </div>
  );
}

function People({ joined, preview }: { joined: (typeof JOINED)[string]; preview: boolean }) {
  const people = [
    { name: joined.manager, img: joined.managerImg, what: "Your manager", why: "Goals, priorities, anything blocking you", cta: "Ask for time" },
    { name: joined.buddy, img: joined.buddyImg, what: "Your buddy", why: "The questions you’d rather not ask your manager", cta: "Say hi" },
    { name: "Priya Sharma", img: "/avatars/user-8.svg", what: "People partner", why: "Payroll, policies, and anything that feels off", cta: "Ask a question" },
  ];
  return (
    <section className="card-lift rounded-[26px] border border-line bg-card p-6">
      <h2 className="text-[16px] font-bold tracking-tight">Your people</h2>
      <ul className="mt-3 flex flex-col gap-4">
        {people.map((p) => (
          <li key={p.name} className="flex items-start gap-3">
            <Avatar src={p.img} name={p.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink">{p.name}</p>
              <p className="text-[12px] text-faint">{p.what}</p>
              <p className="mt-0.5 text-[13px] text-muted">{p.why}</p>
              <button
                onClick={() => toast(preview ? "Preview — nothing was sent" : `${p.name.split(" ")[0]} will see your note in Vadal`)}
                className="mt-1 min-h-[44px] rounded-full text-[13px] font-semibold text-[var(--purple)] hover:underline lg:min-h-0"
              >
                {p.cta}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── the setup assistant ─────────────────────────────────────── */

type Turn = { step: OnboardingStep; answer?: string };
const PER_SESSION = 2;

function SetupAssistant({ email, preview, base, answers, setAnswers, who, joined }: {
  email: string; preview: boolean; base: PersonProfile;
  answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void;
  who: { name: string; team: string; title: string };
  joined: (typeof JOINED)[string];
}) {
  const [, setTranslate] = useTranslatePref();
  const [askedNow, setAskedNow] = React.useState(0);
  const [log, setLog] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");

  const profile: PersonProfile = React.useMemo(() => {
    const inferred = inferFromContext(base);
    return {
      ...base, ...inferred,
      known: answers.known, language: answers.language,
      interests: { ...(inferred.interests ?? {}), ...answers.interests },
    };
  }, [base, answers]);

  const opening = answers.known.length === 0;
  const turn: OnboardingStep | null = opening ? openingTurn(profile) : askedNow >= PER_SESSION ? null : nextTurn(profile);
  const allKnown = !opening && nextTurn(profile) === null;
  const outcome = !opening ? completeOnboarding(profile) : null;

  const answer = (value: string) => {
    if (!turn?.ask) return;
    const key = turn.ask.key;
    const next = applyAnswer(profile, key, value);
    const told: OnboardingAnswers = {
      known: next.known,
      language: next.language,
      interests: key === "interests" && value ? { ...answers.interests, [value.toLowerCase()]: 0.9 } : answers.interests,
      answers: { ...answers.answers, [key]: value },
    };
    setLog((l) => [...l, { step: turn, answer: value || "Skipped" }]);
    setAnswers(told);
    setAskedNow((n) => n + 1);
    setDraft("");
    if (!preview) {
      writeOnboarding(email, told);
      if (key === "language") {
        const lang = TRANSLATE_LANGS.find((l) => l.label === value);
        if (lang) setTranslate({ lang: lang.code, auto: true });
      }
    }
  };

  const choices = turn?.ask
    ? turn.ask.kind === "language" ? [...LANGUAGES] : turn.ask.choices ?? ANSWER_CHOICES[turn.ask.key]
    : undefined;

  return (
    <section className="rise rounded-[26px] border border-[var(--ai-border)] bg-[var(--ai-surface)] p-6 sm:p-7" aria-labelledby="setup-h">
      <div className="flex items-center justify-between gap-3">
        <h2 id="setup-h" className="flex items-center gap-2 text-[18px] font-bold tracking-tight">
          <SparkMark size={18} tone="gradient" state={turn ? "idle" : "still"} /> Set Vadal up your way
        </h2>
        <span className="shrink-0 text-[13px] tabular-nums text-muted">{answers.known.length} of 6</span>
      </div>

      {/* What it already knows — never asked. */}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
        {[who.title, who.team, `Manager · ${joined.manager}`, `Buddy · ${joined.buddy}`, base.surface === "frontline" ? "Frontline" : "Desk-based"].map((k) => (
          <span key={k} className="rounded-full border border-[var(--ai-border)] bg-card px-2.5 py-1 text-muted">{k}</span>
        ))}
        <span className="px-1 py-1 text-faint">from the org chart — not asked</span>
      </div>

      <ol className="mt-4 flex flex-col gap-3" aria-live="polite">
        {log.map((t, i) => (
          <li key={i} className="flex flex-col gap-2">
            {t.step.say && <Bubble>{t.step.say}</Bubble>}
            {t.step.ask && <Bubble>{t.step.ask.prompt}</Bubble>}
            <p className="self-end rounded-2xl rounded-br-md bg-[var(--purple)] px-3.5 py-2 text-[14px] text-white">{t.answer}</p>
          </li>
        ))}
        {turn && (
          <li className="flex flex-col gap-2">
            {turn.say && <Bubble>{turn.say}</Bubble>}
            {turn.ask && <Bubble>{turn.ask.prompt}</Bubble>}
            {turn.unlocks && <p className="pl-1 text-[12px] text-faint">Why it helps: {turn.unlocks}</p>}
          </li>
        )}
      </ol>

      {turn?.ask && (
        <div className="mt-3">
          {choices ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label={turn.ask.prompt}>
              {choices.map((c) => (
                <button key={c} onClick={() => answer(c)} className="min-h-[44px] rounded-full border border-line bg-card px-4 text-[14px] font-medium text-ink transition hover:border-[var(--purple)] lg:min-h-[38px]">
                  {turn.ask?.kind === "language" && c !== "English" && <Languages className="mr-1.5 inline h-3.5 w-3.5 text-faint" />}{c}
                </button>
              ))}
            </div>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) answer(draft.trim()); }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={turn.ask.prompt} placeholder="A few words is plenty" className="min-h-[44px] min-w-0 flex-1 rounded-full border border-line bg-card px-4 text-[14px] outline-none focus:border-[var(--purple)]" />
              <Button type="submit" variant="brand" size="sm" className="min-h-[44px] lg:min-h-0">Send</Button>
            </form>
          )}
          {!opening && (
            <button onClick={() => answer("")} className="mt-2 min-h-[44px] rounded-full px-1 text-[13px] font-semibold text-muted hover:text-ink lg:min-h-0">
              Skip — don&rsquo;t ask me this
            </button>
          )}
        </div>
      )}

      {!turn && outcome && (
        <div className="mt-4 rounded-2xl border border-[var(--ai-border)] bg-card p-4">
          <p className="text-[14px] leading-relaxed text-ink">{outcome.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] text-faint">Home starts with</span>
            {outcome.homeOrder.slice(0, 4).map((h, i) => (
              <span key={h} className="rounded-full bg-soft px-2.5 py-1 text-[12px] font-medium text-ink">{i + 1}. {HOME_LABEL[h] ?? h}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href="/product/home" className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--purple)] px-4 text-[14px] font-semibold text-white hover:opacity-90 lg:min-h-[38px]">
              See my Home <ArrowRight className="h-4 w-4" />
            </Link>
            {!allKnown && (
              <button onClick={() => setAskedNow(0)} className="min-h-[44px] rounded-full px-3 text-[14px] font-semibold text-muted hover:bg-soft hover:text-ink lg:min-h-[38px]">
                Ask me the next one now
              </button>
            )}
          </div>
          {!allKnown && <p className="mt-2 text-[12px] text-faint">That&rsquo;s enough for today. I&rsquo;ll ask the next question another day.</p>}
        </div>
      )}
    </section>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[560px] self-start rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 text-[14px] leading-relaxed text-ink shadow-[0_1px_0_var(--line)]">{children}</p>;
}
