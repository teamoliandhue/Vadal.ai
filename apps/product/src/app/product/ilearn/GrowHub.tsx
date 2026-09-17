"use client";
/* GROW — Pillar 6. "Learning that fits into a five-minute break, not a training day."

   Four AI features from the brief are live on this screen:
   · course generation from a pasted SOP, with quiz questions drafted for review
     — the brief calls this "the single highest-leverage AI feature in this pillar"
   · personalised path recommendations driven by Pulse themes and incident data,
     which is the listening→learning loop the whole platform is built around
   · adaptive quizzing with spaced repetition
   · a tutor that answers only from the module in front of you

   The mandatory human-review step is enforced, not described: a generated course
   is born a draft, and a safety-critical one needs a named reviewer to publish. */
import * as React from "react";
import { BookOpen, Check, Clock, FileText, GraduationCap, Lock, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { generateCourse, recommendPaths, reviewQueue, nextDifficulty, tutor, publishCourse, pathMinutes, type Course as GenCourse } from "@/lib/ai/engines/learning";
import { courses, learningDays, paths, sampleQuiz, retention, growStats, pulseThemes, incidents } from "@/lib/grow";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
import { Badges, ComplianceRecord, TeamProgress, TimeFit } from "./Rail";
import { useSession } from "../useSession";
import { toast } from "../Toaster";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">{children}</p>;
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`card-lift flex flex-col rounded-[26px] border border-line bg-card p-6 sm:p-7 ${className}`}>{children}</section>;
}
const STATUS_TONE: Record<string, BadgeTone> = { overdue: "danger", "in-progress": "warning", complete: "success", "not-started": "neutral" };

const SAMPLE_SOP = `Lockout Tagout Procedure
Before any maintenance, isolate the machine from all energy sources. Every worker must apply a personal lock. Locks are never removed by anyone other than the person who applied them.
Verification
After isolating, attempt a start to confirm the machine cannot run. Record the check in the log within 15 minutes.`;

export function GrowHub() {
  const [role] = useViewAs();
  const { session } = useSession();
  const canAuthor = canAccess(role, "Knowledge") && role !== "employee";

  const [tab, setTab] = React.useState<"mine" | "library" | "generate">("mine");
  const [done, setDone] = usePersistentState<string[]>("vadal:grow-done", []);

  const recommendations = React.useMemo(
    () => recommendPaths(paths, {
      role, team: session?.team ?? "Engineering",
      pulseThemes, incidents, completed: done,
    }, 3),
    [role, session?.team, done],
  );

  const mine = courses.filter((c) => c.status !== "complete" || done.includes(c.id));
  const overdue = courses.filter((c) => c.status === "overdue");

  return (
    <div className="flex flex-col gap-6">
      {/* hero */}
      <header className="rise relative overflow-hidden rounded-[28px] border border-line bg-card p-7 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_18px_42px_-26px_rgba(20,20,40,0.22)] sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(circle, var(--client-brand, var(--purple)), transparent 70%)" }} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Grow</Eyebrow>
            <h1 className="mt-2 text-[clamp(24px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.025em]">Five minutes is enough</h1>
            <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-muted">
              Short courses you can finish on a break. Nothing here takes a training day.
            </p>
          </div>
          {/* ══ the streak, shown ══
              growStats.streak was printed as the digit 5. It is the most
              motivating figure in a learning product and a streak is a PATTERN
              — you cannot see a pattern in a number. Seven days, height by
              minutes, so a light day still counts as a day. */}
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <div className="flex items-end gap-[3px]" style={{ height: 40 }}>
                {learningDays.map((d, i) => {
                  const max = Math.max(...learningDays.map((x) => x.minutes), 1);
                  const on = d.minutes > 0;
                  return (
                    <span key={i} className="flex h-full w-[9px] flex-col justify-end" title={`${d.day} · ${d.minutes} min`}>
                      <span
                        className="block w-full rounded-[2px] transition-[height] duration-500"
                        style={{
                          height: on ? `${Math.max(0.28, d.minutes / max) * 100}%` : "16%",
                          background: on ? "var(--client-brand, var(--purple))" : "var(--line)",
                        }}
                      />
                    </span>
                  );
                })}
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold leading-none tracking-tight tabular-nums">{growStats.streak}</span>
                <span className="text-[12px] text-faint">day streak</span>
              </div>
            </div>
            {[[`${growStats.completionRate}%`, "completed"], [`${growStats.medianMinutes} min`, "typical course"]].map(([v, l]) => (
              <div key={String(l)}>
                <div className="text-[22px] font-bold leading-none tracking-tight">{v}</div>
                <div className="mt-1.5 text-[12px] text-faint">{l}</div>
              </div>
            ))}
          </div>
        </div>
        {overdue.length > 0 && (
          <div className="relative mt-5 flex items-center gap-2.5 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--danger)_6%,transparent)] px-4 py-3">
            <TriangleAlert className="h-4 w-4 shrink-0" style={{ color: "var(--danger)" }} />
            <p className="text-[14px]">
              <b className="font-semibold">{overdue.length} mandatory course{overdue.length > 1 ? "s" : ""} overdue.</b>{" "}
              <span className="text-muted">{overdue.map((c) => c.title).join(", ")} — about {overdue.reduce((n, c) => n + c.minutes, 0)} minutes in total.</span>
            </p>
          </div>
        )}
      </header>

      {/* tabs */}
      <div className="-mx-2 flex flex-wrap gap-1 px-2">
        {([["mine", "Your learning"], ["library", "Library"], ...(canAuthor ? [["generate", "Create a course"]] : [])] as [string, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`min-h-[44px] rounded-full px-3.5 text-[14px] font-semibold transition lg:min-h-[36px] ${tab === k ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "mine" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
          <div className="flex flex-col gap-6 xl:col-span-7">
            <Card>
              <Eyebrow>Assigned to you</Eyebrow>
              <ul className="mt-4 flex flex-col gap-3">
                {mine.map((c) => {
                  const isDone = done.includes(c.id);
                  const overdue = !isDone && c.dueIn !== undefined && c.dueIn < 0;
                  /* Which lesson you are actually on. "3 lessons" and a bar told
                     you a course was 33% done and nothing about where you
                     stopped or what the next four minutes contains — which is
                     the only thing that decides whether you press Resume. */
                  const doneLessons = isDone ? c.lessons.length : Math.round((c.progress / 100) * c.lessons.length);
                  const next = isDone ? null : c.lessons[doneLessons] ?? null;

                  return (
                    <li
                      key={c.id}
                      className="rounded-2xl border p-4"
                      style={{
                        /* Overdue mandatory training should not look like a
                           7-minute optional read with a different badge. */
                        borderColor: overdue ? "color-mix(in srgb, var(--danger) 30%, transparent)" : "var(--line)",
                        background: overdue ? "color-mix(in srgb, var(--danger) 4%, transparent)" : undefined,
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[16px] font-semibold">{c.title}</span>
                        {c.mandatory && <Badge tone="brand" variant="soft" size="sm">Mandatory</Badge>}
                        {c.safetyCritical && <Badge tone="danger" variant="soft" size="sm">Safety-critical</Badge>}
                        <Badge tone={STATUS_TONE[isDone ? "complete" : c.status]} variant="soft" size="sm">
                          {isDone ? "Complete" : c.status.replace("-", " ")}
                        </Badge>
                        <span className="ml-auto flex items-center gap-1 text-[12px] text-faint"><Clock className="h-3 w-3" />{c.minutes} min</span>
                      </div>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{c.blurb}</p>

                      {/* the listening→learning loop, said out loud */}
                      {c.assignedBecause && (
                        <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-faint">
                          <SparkMark size={12} tone="solid" className="mt-[2px] shrink-0" /> {c.assignedBecause}
                        </p>
                      )}
                      {/* and the half that never explained itself. The Pulse
                          suggestions on this same screen say why they are there;
                          unexplained compulsory training reads as punishment. */}
                      {c.mandatoryBecause && !isDone && (
                        <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-snug text-faint">
                          <Lock className="mt-[2px] h-3 w-3 shrink-0" /> {c.mandatoryBecause}
                        </p>
                      )}

                      {/* lesson-level progress, not a percentage */}
                      <ol className="mt-3 flex items-center gap-1" aria-label={`${doneLessons} of ${c.lessons.length} lessons done`}>
                        {c.lessons.map((l, i) => (
                          <li
                            key={l.id}
                            title={`${l.title} · ${l.minutes} min`}
                            className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                            style={{
                              background:
                                i < doneLessons ? "var(--client-brand, var(--purple))"
                                : i === doneLessons && !isDone ? "color-mix(in srgb, var(--client-brand, var(--purple)) 32%, transparent)"
                                : "var(--line)",
                            }}
                          />
                        ))}
                      </ol>

                      <p className="mt-2 text-[12px] text-faint">
                        {isDone ? (
                          `All ${c.lessons.length} lessons done`
                        ) : next ? (
                          <>
                            {doneLessons} of {c.lessons.length} done · next: <span className="font-semibold text-muted">{next.title}</span>, {next.minutes} min
                          </>
                        ) : (
                          `${c.lessons.length} lessons`
                        )}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button size="sm" variant={isDone ? "tertiary" : "brand"} className="min-h-[44px] lg:min-h-0"
                          onClick={() => { setDone((d) => (d.includes(c.id) ? d : [...d, c.id])); toast(`“${c.title}” complete — ${growStats.streak + 1}-day streak 🔥`); }}>
                          {isDone ? "Done" : c.progress > 0 ? "Resume" : "Start"}
                        </Button>
                        {c.dueIn !== undefined && !isDone && (
                          <span className="text-[12px] font-semibold" style={{ color: overdue ? "var(--danger)" : "var(--faint)" }}>
                            {overdue ? `${Math.abs(c.dueIn)} days overdue` : `Due in ${c.dueIn} days`}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <AdaptiveQuiz />
          </div>

          <div className="flex flex-col gap-6 xl:col-span-5">
            {/* recommendations — Pulse themes drive them */}
            <Card>
              <div className="flex items-center gap-2">
                <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
                <Eyebrow>Suggested for you</Eyebrow>
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {recommendations.map((r) => (
                  <li key={r.path.id} className="rounded-2xl border border-line p-4">
                    <p className="text-[14px] font-semibold">{r.path.title}</p>
                    <p className="mt-1 text-[14px] leading-snug text-muted">{r.because}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button size="sm" variant="tertiary" className="min-h-[44px] lg:min-h-0" onClick={() => toast(`Enrolled in “${r.path.title}”`)}>Enrol</Button>
                      <span className="text-[12px] text-faint">{r.path.minutes} min</span>
                    </div>
                  </li>
                ))}
                {recommendations.length === 0 && <li className="text-[14px] text-faint">Nothing to suggest — you&apos;re on top of everything assigned.</li>}
              </ul>
              <p className="mt-3 text-[12px] leading-snug text-faint">
                Suggestions come from what your team said in Pulse and from incidents logged on your line — not from a generic role template.
              </p>
            </Card>

            {/* The pillar's headline promise, finally as a control. */}
            <TimeFit done={done} />

            <ComplianceRecord />

            <TeamProgress />

            <Badges />
          </div>
        </div>
      )}

      {tab === "library" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paths.map((p) => {
            const inPath = courses.filter((c) => c.path === p.id);
            return (
              <Card key={p.id}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-[var(--purple)]"><BookOpen className="h-5 w-5" strokeWidth={1.85} /></span>
                <h3 className="mt-3 text-[16px] font-bold tracking-tight">{p.title}</h3>
                {/* p.minutes is the figure entered when the path was planned;
                    printing it beside a live count produced "0 courses · 48 min
                    total", which cannot be true. Count what is published. */}
                <p className="mt-1 text-[14px] text-muted">
                  {inPath.length === 0
                    ? "Nothing published yet"
                    : `${inPath.length} course${inPath.length === 1 ? "" : "s"} · ${pathMinutes(courses, p.id)} min total`}
                </p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {inPath.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-[14px] text-muted">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${c.status === "complete" ? "text-[var(--success)]" : "text-faint opacity-40"}`} />
                      {c.title}
                    </li>
                  ))}
                  {inPath.length === 0 && (
                    <li className="text-[14px] leading-snug text-faint">
                      The path is planned — {p.minutes} min of material is scoped. Anyone with
                      authoring rights can build it from a document in one step.
                    </li>
                  )}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "generate" && canAuthor && <CourseGenerator />}
    </div>
  );
}

/* ── adaptive quizzing + the module-scoped tutor ───────────────── */
function AdaptiveQuiz() {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [tutorQ, setTutorQ] = React.useState("");
  const [tutorA, setTutorA] = React.useState<{ answer: string; grounded: boolean } | null>(null);

  const recent = sampleQuiz.filter((q) => q.id in answers).map((q) => answers[q.id] === q.answer);
  const difficulty = nextDifficulty(recent);
  const queue = reviewQueue(retention, 3);
  const question = sampleQuiz.find((q) => !(q.id in answers) && q.difficulty === difficulty) ?? sampleQuiz.find((q) => !(q.id in answers));

  const module = {
    id: "m1", title: "Equipment handling refresher", minutes: 4,
    body: "",
    source: sampleQuiz.map((q) => q.source),
  };

  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" /></span>
        <Eyebrow>Adaptive practice</Eyebrow>
        <Badge tone="info" variant="soft" size="sm">Difficulty {difficulty}/3</Badge>
      </div>

      {question ? (
        <div className="mt-4 rounded-2xl border border-line p-4">
          <p className="text-[16px] font-semibold leading-snug">{question.text}</p>
          <div className="mt-3 grid gap-2">
            {question.options.map((o, i) => {
              const answered = question.id in answers;
              const picked = answers[question.id] === i;
              const correct = i === question.answer;
              return (
                <button key={o} disabled={answered}
                  onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                  className={`min-h-[48px] rounded-xl border px-3.5 py-2.5 text-left text-[14px] transition ${
                    answered
                      ? correct ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_8%,transparent)] font-semibold"
                        : picked ? "border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)]" : "border-line opacity-50"
                      : "border-line hover:bg-soft"
                  }`}>
                  {o}
                </button>
              );
            })}
          </div>
          {question.id in answers && (
            <p className="mt-3 rounded-xl bg-soft p-3 text-[14px] leading-relaxed text-muted">
              <b className="font-semibold text-ink">From the source:</b> {question.source}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-[14px] text-faint">Nothing due right now — spaced repetition will bring these back when they&apos;re worth revisiting.</p>
      )}

      {/* ══ coming back to you ══
          This was rendering straight from the record: "lockout-2 — 0 right, 2
          wrong, last seen 4d ago". An internal key, two counters and an
          interval, shown to the one person who can do nothing with any of it.
          Spaced repetition is the most valuable mechanic in a learning product
          and it was shipped as a log line. */}
      <div className="mt-5 border-t border-line pt-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <Eyebrow>Coming back to you</Eyebrow>
          <span className="text-[12px] text-faint">
            {queue.length} {queue.length === 1 ? "thing" : "things"} worth a minute
          </span>
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {queue.map(({ item, reason, why }) => {
            const shaky = reason === "shaky";
            return (
              <li
                key={item.questionId}
                className="rounded-2xl border p-3.5"
                style={{
                  borderColor: shaky
                    ? "color-mix(in srgb, var(--danger) 26%, transparent)"
                    : "var(--line)",
                  background: shaky
                    ? "color-mix(in srgb, var(--danger) 5%, transparent)"
                    : undefined,
                }}
              >
                <div className="flex items-start gap-2.5">
                  {/* The two reasons are genuinely different and should not look
                      alike: a gap is not the same problem as fade. */}
                  <span
                    className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full"
                    style={{
                      background: shaky
                        ? "color-mix(in srgb, var(--danger) 14%, transparent)"
                        : "var(--soft)",
                      color: shaky ? "var(--danger)" : "var(--muted)",
                    }}
                  >
                    {shaky ? <RotateCcw className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug">{item.prompt}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted">{why}</p>
                    <p className="mt-1 text-[12px] text-faint">{item.course}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Button
          variant="secondary"
          className="mt-3 min-h-[44px] lg:min-h-0"
          leadingIcon={<RotateCcw className="h-3.5 w-3.5" />}
          onClick={() => toast(`${queue.length} questions queued — about ${queue.length} minutes`)}
        >
          Practise these {queue.length}
        </Button>
        <p className="mt-2.5 text-[12px] leading-snug text-faint">
          Chosen by what you have actually retained, not by course order — things you keep missing
          come back sooner, things you have got come back later.
        </p>
      </div>

      {/* tutor — answers only from this module */}
      <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
        <Eyebrow>Ask about this module</Eyebrow>
        <form onSubmit={(e) => { e.preventDefault(); setTutorA(tutor(tutorQ, module)); }} className="mt-2 flex items-center gap-2">
          <input value={tutorQ} onChange={(e) => setTutorQ(e.target.value)} placeholder="e.g. who can clear a fault code?"
            className="min-h-[44px] min-w-0 flex-1 rounded-full border border-line bg-card px-3.5 text-[14px] outline-none focus:border-[var(--ai-accent)]" />
          <Button type="submit" size="sm" variant="brand" className="min-h-[44px] lg:min-h-0">Ask</Button>
        </form>
        {tutorA && (
          <div className="mt-3">
            <p className="text-[14px] leading-relaxed">{tutorA.answer}</p>
            <p className="mt-1.5 text-[12px] text-faint">
              {tutorA.grounded ? "Answered from this module's source content only." : "Not in this module — I don't answer from anything else."}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ── course generation from a document ─────────────────────────── */
function CourseGenerator() {
  const [raw, setRaw] = React.useState(SAMPLE_SOP);
  const [title, setTitle] = React.useState("Lockout Tagout");
  const [course, setCourse] = React.useState<GenCourse | null>(null);
  const [reviewer, setReviewer] = React.useState("");
  const [working, setWorking] = React.useState(false);

  function generate() {
    setWorking(true);
    window.setTimeout(() => {
      setCourse(generateCourse(raw, title));
      setWorking(false);
    }, 700);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
      <Card className="xl:col-span-5">
        <div className="flex items-center gap-2">
          <span className="ai-grad grid h-7 w-7 place-items-center rounded-full"><SparkMark size={15} tone="solid" state={working ? "thinking" : "still"} /></span>
          <Eyebrow>Course from a document</Eyebrow>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Paste an SOP, a policy or training notes. You get modules, timings and draft quiz questions — every one traceable to the sentence it came from.
        </p>
        <label className="mt-4 block">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">Course title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 min-h-[40px] w-full rounded-xl border border-line bg-card px-3 text-[14px] outline-none focus:border-[var(--purple)]" />
        </label>
        <label className="mt-3 block flex-1">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">Source document</span>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={10}
            className="mt-1.5 w-full resize-y rounded-xl border border-line bg-card p-3 text-[14px] leading-relaxed outline-none focus:border-[var(--purple)]" />
        </label>
        <Button className="mt-4" variant="brand" onClick={generate} disabled={working || !raw.trim()}
          leadingIcon={<Sparkles className="h-4 w-4" />}>
          {working ? "Reading the document…" : "Generate course"}
        </Button>
      </Card>

      <Card className="xl:col-span-7">
        {!course ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-16 text-center">
            <GraduationCap className="h-7 w-7 text-faint" />
            <p className="text-[14px] font-semibold">Your draft course appears here</p>
            <p className="text-[14px] text-faint">Nothing is published automatically.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[18px] font-bold tracking-tight">{course.title}</h3>
              <Badge tone={course.status === "live" ? "success" : "warning"} variant="soft" size="sm">
                {course.status === "live" ? "Published" : "Draft"}
              </Badge>
              {course.safetyCritical && <Badge tone="danger" variant="soft" size="sm">Safety-critical</Badge>}
              <span className="ml-auto text-[12px] text-faint">{course.totalMinutes} min · {course.modules.length} modules · {course.quiz.length} questions</span>
            </div>

            {course.warnings.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {course.warnings.map((w) => (
                  <li key={w} className="flex items-start gap-2 rounded-xl bg-soft px-3 py-2 text-[14px] leading-snug text-muted">
                    <TriangleAlert className="mt-[3px] h-3.5 w-3.5 shrink-0" style={{ color: "var(--warning)" }} /> {w}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {course.modules.map((m) => (
                <div key={m.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-faint" />
                    <p className="text-[14px] font-semibold">{m.title}</p>
                    <span className="ml-auto text-[12px] text-faint">{m.minutes} min</span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{m.body}</p>
                </div>
              ))}
            </div>

            {course.quiz.length > 0 && (
              <div className="mt-4">
                <Eyebrow>Draft questions — review before publishing</Eyebrow>
                <ul className="mt-2 flex flex-col gap-2.5">
                  {course.quiz.map((q) => (
                    <li key={q.id} className="rounded-2xl bg-soft p-3.5">
                      <p className="text-[14px] font-semibold leading-snug">{q.text}</p>
                      <p className="mt-1.5 text-[12px] text-muted">{q.options.map((o, i) => `${i === q.answer ? "✓ " : ""}${o}`).join("  ·  ")}</p>
                      <p className="mt-1.5 text-[12px] leading-snug text-faint">Source: “{q.source}”</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* the mandatory review step — enforced by publishCourse() */}
            <div className="mt-5 rounded-2xl border border-line p-4">
              <Eyebrow>Human review</Eyebrow>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                {course.safetyCritical
                  ? "Safety-critical content cannot go live without a named reviewer. That is a rule in the code, not a reminder."
                  : "Generated courses stay in draft until a person signs off."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Reviewer's name"
                  className="min-h-[40px] min-w-[180px] flex-1 rounded-xl border border-line bg-card px-3 text-[14px] outline-none focus:border-[var(--purple)]" />
                <Button variant="brand" disabled={!reviewer.trim() || course.status === "live"}
                  onClick={() => {
                    try {
                      setCourse(publishCourse(course, reviewer.trim()));
                      toast(`“${course.title}” published — reviewed by ${reviewer.trim()}`);
                    } catch (e) { toast((e as Error).message, "info"); }
                  }}>
                  {course.status === "live" ? "Published" : "Publish"}
                </Button>
              </div>
              {course.reviewedBy && <p className="mt-2 text-[12px] text-faint">Reviewed and published by {course.reviewedBy}.</p>}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
