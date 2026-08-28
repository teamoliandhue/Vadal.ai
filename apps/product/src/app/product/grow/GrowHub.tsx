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
import { Award, BookOpen, Check, Clock, FileText, GraduationCap, Sparkles, TriangleAlert } from "lucide-react";
import { Badge, Button, SparkMark, type BadgeTone } from "@vadal/design-system";
import { usePersistentState } from "@/lib/usePersistentState";
import { generateCourse, recommendPaths, nextReview, nextDifficulty, tutor, publishCourse, type Course as GenCourse } from "@/lib/ai/engines/learning";
import { courses, paths, sampleQuiz, retention, growStats, pulseThemes, incidents } from "@/lib/grow";
import { canAccess } from "@/lib/access";
import { useViewAs } from "../useViewAs";
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
          <div className="flex items-center gap-5">
            {[[growStats.streak, "day streak"], [`${growStats.completionRate}%`, "completed"], [`${growStats.medianMinutes} min`, "typical course"]].map(([v, l]) => (
              <div key={String(l)} className="text-center">
                <div className="text-[22px] font-bold tracking-tight">{v}</div>
                <div className="mt-0.5 text-[12px] text-faint">{l}</div>
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
            className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition ${tab === k ? "bg-ink text-[var(--card)]" : "text-muted hover:bg-soft hover:text-ink"}`}>
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
                {mine.map((c) => (
                  <li key={c.id} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[16px] font-semibold">{c.title}</span>
                      {c.mandatory && <Badge tone="brand" variant="soft" size="sm">Mandatory</Badge>}
                      <Badge tone={STATUS_TONE[done.includes(c.id) ? "complete" : c.status]} variant="soft" size="sm">
                        {done.includes(c.id) ? "Complete" : c.status.replace("-", " ")}
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

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${done.includes(c.id) ? 100 : c.progress}%`, background: "var(--client-brand, var(--purple))" }} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant={done.includes(c.id) ? "tertiary" : "brand"}
                        onClick={() => { setDone((d) => (d.includes(c.id) ? d : [...d, c.id])); toast(`“${c.title}” complete — ${growStats.streak + 1}-day streak 🔥`); }}>
                        {done.includes(c.id) ? "Done" : c.progress > 0 ? "Resume" : "Start"}
                      </Button>
                      <span className="text-[12px] text-faint">{c.lessons.length} lessons</span>
                      {c.dueIn !== undefined && !done.includes(c.id) && (
                        <span className={`text-[12px] font-semibold ${c.dueIn < 0 ? "text-[var(--danger)]" : "text-faint"}`}>
                          {c.dueIn < 0 ? `${Math.abs(c.dueIn)} days overdue` : `Due in ${c.dueIn} days`}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
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
                      <Button size="sm" variant="tertiary" onClick={() => toast(`Enrolled in “${r.path.title}”`)}>Enrol</Button>
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

            <Card>
              <Eyebrow>Badges</Eyebrow>
              <div className="mt-3 flex flex-wrap gap-2">
                {growStats.badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[14px] font-semibold">
                    <Award className="h-3.5 w-3.5 text-[var(--purple)]" /> {b}
                  </span>
                ))}
              </div>
            </Card>
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
                <p className="mt-1 text-[14px] text-muted">{inPath.length} course{inPath.length === 1 ? "" : "s"} · {p.minutes} min total</p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {inPath.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-[14px] text-muted">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${c.status === "complete" ? "text-[var(--success)]" : "text-faint opacity-40"}`} />
                      {c.title}
                    </li>
                  ))}
                  {inPath.length === 0 && <li className="text-[14px] text-faint">Nothing published yet.</li>}
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
  const queue = nextReview(retention, 3);
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
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-[14px] transition ${
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

      <div className="mt-4">
        <Eyebrow>Coming back to you</Eyebrow>
        <ul className="mt-2 flex flex-col gap-1.5">
          {queue.map((r) => (
            <li key={r.questionId} className="flex items-center gap-2 text-[14px] text-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.wrong > r.correct ? "var(--danger)" : "var(--warning)" }} />
              {r.questionId} — {r.correct} right, {r.wrong} wrong, last seen {r.lastSeenDaysAgo}d ago
            </li>
          ))}
        </ul>
      </div>

      {/* tutor — answers only from this module */}
      <div className="mt-5 rounded-2xl bg-[var(--ai-surface)] p-4 ring-1 ring-[var(--ai-border)]">
        <Eyebrow>Ask about this module</Eyebrow>
        <form onSubmit={(e) => { e.preventDefault(); setTutorA(tutor(tutorQ, module)); }} className="mt-2 flex items-center gap-2">
          <input value={tutorQ} onChange={(e) => setTutorQ(e.target.value)} placeholder="e.g. who can clear a fault code?"
            className="min-h-[40px] min-w-0 flex-1 rounded-full border border-line bg-card px-3.5 text-[14px] outline-none focus:border-[var(--ai-accent)]" />
          <Button type="submit" size="sm" variant="brand">Ask</Button>
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
