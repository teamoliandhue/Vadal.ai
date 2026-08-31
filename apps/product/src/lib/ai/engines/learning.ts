/**
 * Learning engine — Pillar 6, Grow.
 *
 * Implements, from the brief:
 *  · "AI content generation assist — turns an existing PDF/SOP/training deck
 *     into a bite-sized course with quiz questions drafted automatically for
 *     author review"
 *  · "Personalised path recommendations based on role, recent Pulse feedback
 *     (e.g. a team flags 'equipment training' as a gap), and incident/safety
 *     data where relevant"
 *  · "Adaptive quizzing — question difficulty and review frequency adjust to
 *     what each learner has actually retained (spaced repetition), not a fixed
 *     course order"
 *  · "AI tutor for in-the-moment questions while completing a module, answering
 *     only from that module's source content"
 *
 * The brief calls course-from-document "the single highest-leverage AI feature
 * in this pillar" and requires "a mandatory human-review step before any
 * auto-generated course goes live, especially for safety-critical content" —
 * so generated courses are born in `draft` and safety-critical ones cannot be
 * published without a named reviewer.
 */
import { readability, simplify } from "./text";

export type Module = {
  id: string;
  title: string;
  /** Kept under a few minutes, per the brief. */
  minutes: number;
  body: string;
  /** Verbatim source lines, so a reviewer can check every claim. */
  source: string[];
};

export type QuizQuestion = {
  id: string;
  moduleId: string;
  text: string;
  options: string[];
  answer: number;
  difficulty: 1 | 2 | 3;
  /** The sentence the question was drawn from. */
  source: string;
};

export type Course = {
  id: string;
  title: string;
  modules: Module[];
  quiz: QuizQuestion[];
  totalMinutes: number;
  status: "draft" | "in-review" | "live";
  safetyCritical: boolean;
  /** Set only when a human has signed off. */
  reviewedBy?: string;
  warnings: string[];
};

const SAFETY_MARKERS = /\b(ppe|hazard|lockout|tagout|safety|injur|evacuat|fire|chemical|forklift|electrical|confined space|first aid)\b/i;

/**
 * Turn raw document text into a micro-course.
 *
 * Splits on headings where the document has them, and on paragraph density where
 * it does not — because an SOP pasted from a PDF rarely has clean structure.
 */
export function generateCourse(raw: string, title = "Untitled course"): Course {
  const text = raw.replace(/\r/g, "").trim();
  const safetyCritical = SAFETY_MARKERS.test(text);

  const blocks = splitIntoBlocks(text);
  const modules: Module[] = blocks.map((b, i) => {
    const body = simplify(b.body, "simple");
    return {
      id: `m${i + 1}`,
      title: b.heading || deriveHeading(b.body, i),
      minutes: Math.max(1, Math.round(b.body.split(/\s+/).length / 180)),
      body,
      source: b.body.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20),
    };
  });

  const quiz = modules.flatMap((m) => draftQuestions(m));
  const warnings: string[] = [];
  if (safetyCritical) warnings.push("Safety-critical content — a named human reviewer must sign off before this goes live.");
  if (modules.some((m) => readability(m.body).grade > 9)) warnings.push("Some modules still read above grade 9 — consider simplifying further for frontline learners.");
  if (quiz.length < modules.length) warnings.push("Not every module produced a usable question — review and add your own.");

  return {
    id: `c-${Date.now()}`,
    title,
    modules,
    quiz,
    totalMinutes: modules.reduce((n, m) => n + m.minutes, 0),
    status: "draft", // never live on generation — the brief's mandatory review step
    safetyCritical,
    warnings,
  };
}

function splitIntoBlocks(text: string): { heading?: string; body: string }[] {
  const lines = text.split("\n").map((l) => l.trim());
  const blocks: { heading?: string; body: string }[] = [];
  let heading: string | undefined;
  let buf: string[] = [];

  const flush = () => {
    const body = buf.join(" ").trim();
    if (body) blocks.push({ heading, body });
    buf = [];
  };

  for (const line of lines) {
    if (!line) continue;
    // A heading: short, no terminal punctuation, or numbered/markdown style.
    const isHeading = /^(#{1,4}\s+|\d+[.)]\s+[A-Z])/.test(line) || (line.length < 60 && !/[.!?]$/.test(line) && /^[A-Z]/.test(line));
    if (isHeading) {
      flush();
      heading = line.replace(/^#{1,4}\s+|^\d+[.)]\s+/, "").trim();
    } else {
      buf.push(line);
      // Keep modules short — the brief caps them "at a few minutes".
      if (buf.join(" ").split(/\s+/).length > 220) { flush(); heading = undefined; }
    }
  }
  flush();
  return blocks.length ? blocks : [{ body: text }];
}

function deriveHeading(body: string, i: number): string {
  const first = body.split(/(?<=[.!?])\s/)[0] ?? `Part ${i + 1}`;
  return first.split(/\s+/).slice(0, 7).join(" ").replace(/[.,;:]$/, "");
}

/**
 * Draft quiz questions from a module.
 *
 * Targets sentences carrying a checkable fact — a number, a "must", a duration —
 * because those are the ones worth testing and the ones a generator can build a
 * defensible distractor set for.
 */
function draftQuestions(m: Module): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const s of m.source) {
    if (out.length >= 2) break;

    const numMatch = s.match(/\b(\d{1,4})\b/);
    if (numMatch) {
      const n = Number(numMatch[1]);
      const distractors = [...new Set([n + 2, Math.max(0, n - 2), n * 2])].filter((d) => d !== n).slice(0, 3);
      const options = shuffleStable([String(n), ...distractors.map(String)], s);
      out.push({
        id: `${m.id}q${out.length + 1}`,
        moduleId: m.id,
        text: s.replace(numMatch[1], "____").trim(),
        options,
        answer: options.indexOf(String(n)),
        difficulty: 1,
        source: s,
      });
      continue;
    }

    if (/\b(must|always|never|required|mandatory)\b/i.test(s)) {
      const options = ["True", "False"];
      out.push({
        id: `${m.id}q${out.length + 1}`,
        moduleId: m.id,
        text: `True or false: ${s.replace(/\.$/, "")}`,
        options,
        answer: 0,
        difficulty: 2,
        source: s,
      });
    }
  }
  return out;
}

function shuffleStable(items: string[], seed: string): string[] {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** The brief's mandatory review step, enforced rather than documented. */
export function publishCourse(course: Course, reviewer: string): Course {
  if (!reviewer) throw new Error("A named reviewer is required to publish a generated course.");
  return { ...course, status: "live", reviewedBy: reviewer };
}

/* ── adaptive quizzing (spaced repetition) ─────────────────────── */

export type Retention = { questionId: string; correct: number; wrong: number; lastSeenDaysAgo: number };

/**
 * What to review next.
 *
 * Standard spaced repetition: a question you keep getting wrong comes back
 * sooner, one you have mastered recedes. The brief's phrasing — "adjust to what
 * each learner has actually retained ... not a fixed course order" — is exactly
 * this, and it needs no model.
 */
export function nextReview(history: Retention[], take = 5): Retention[] {
  return [...history]
    .map((r) => {
      const attempts = r.correct + r.wrong;
      const accuracy = attempts ? r.correct / attempts : 0;
      const interval = Math.max(1, Math.round(2 ** r.correct)); // 1, 2, 4, 8, 16 days
      const overdue = r.lastSeenDaysAgo - interval;
      return { r, priority: overdue + (1 - accuracy) * 4 };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, take)
    .map((x) => x.r);
}

/** Difficulty for the next question, from recent accuracy. */
export function nextDifficulty(recent: boolean[]): 1 | 2 | 3 {
  const acc = recent.length ? recent.filter(Boolean).length / recent.length : 0.5;
  return acc > 0.85 ? 3 : acc > 0.6 ? 2 : 1;
}

/* ── path recommendations ──────────────────────────────────────── */

export type LearningPath = { id: string; title: string; forRoles: string[]; topics: string[]; minutes: number };

export type RecommendationContext = {
  role: string;
  team: string;
  /** Themes surfaced by Pulse for this team, worst first. */
  pulseThemes: string[];
  /** Safety or quality incidents logged for this team. */
  incidents?: string[];
  completed: string[];
};

export type Recommendation = { path: LearningPath; score: number; because: string };

/**
 * Recommend learning paths.
 *
 * The brief's example is the design: "a team flags 'equipment training' as a gap"
 * in Pulse and Grow responds. So a Pulse theme is the strongest signal here,
 * ahead of role — the whole point is that listening drives learning.
 */
export function recommendPaths(paths: LearningPath[], ctx: RecommendationContext, take = 3): Recommendation[] {
  return paths
    .filter((p) => !ctx.completed.includes(p.id))
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];

      const themeHit = p.topics.filter((t) => ctx.pulseThemes.includes(t));
      if (themeHit.length) {
        score += themeHit.length * 5;
        reasons.push(`your team flagged ${themeHit.join(" and ")} in a recent check-in`);
      }
      if (ctx.incidents?.some((i) => p.topics.some((t) => i.toLowerCase().includes(t)))) {
        score += 6;
        reasons.push("a recent incident on your team touched this");
      }
      if (p.forRoles.includes(ctx.role)) { score += 2; reasons.push(`it's built for your role`); }
      if (p.minutes <= 10) score += 1;

      return { path: p, score, because: reasons.length ? `Suggested because ${reasons.join(", and ")}.` : "A good general fit for your role." };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
}

/* ── AI tutor ──────────────────────────────────────────────────── */

export type TutorAnswer = { answer: string; source?: string; grounded: boolean };

/**
 * Answer a learner's question **only from that module's content**.
 *
 * The brief's constraint — "answering only from that module's source content" —
 * is the whole safety story for this feature. A tutor that reaches for general
 * knowledge will confidently invent a lockout procedure.
 */
export function tutor(question: string, module: Module): TutorAnswer {
  const terms = question.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  let best: { s: string; hits: number } | null = null;
  for (const s of module.source) {
    const low = s.toLowerCase();
    const hits = terms.reduce((n, t) => n + (low.includes(t) ? 1 : 0), 0);
    if (!best || hits > best.hits) best = { s, hits };
  }
  if (!best || best.hits < 2) {
    return {
      answer: `That isn't covered in “${module.title}”. I only answer from this module, so I'd rather point you to your trainer than guess.`,
      grounded: false,
    };
  }
  return { answer: best.s, source: best.s, grounded: true };
}

/* ── the review queue, as something a person can act on ───────────
   nextReview() ranks correctly and returns raw Retention records, so the screen
   rendered what it was given: "lockout-2 — 0 right, 2 wrong, last seen 4d ago".
   An internal key, a pair of counters and an interval, shown to the one person
   who cannot do anything with any of it.

   Ranking is not the same as explaining. This says WHY a thing is coming back —
   and the two reasons are genuinely different, so they should not look alike:
   something you keep getting wrong is a gap, something you have not seen in
   three weeks is just fade. */

export type ReviewItem<T extends Retention = Retention> = {
  item: T;
  /** "shaky" — got it wrong more than right. "fading" — known once, going. */
  reason: "shaky" | "fading";
  /** Plain sentence for the learner. Never mentions intervals or accuracy. */
  why: string;
  /** How overdue against its own interval, in days. Sorts the queue. */
  overdueBy: number;
};

export function reviewQueue<T extends Retention>(history: T[], take = 3): ReviewItem<T>[] {
  return nextReview(history, take).map((r) => {
    const attempts = r.correct + r.wrong;
    const interval = Math.max(1, Math.round(2 ** r.correct));
    const overdueBy = r.lastSeenDaysAgo - interval;
    const shaky = r.wrong > r.correct;

    return {
      item: r as T,
      reason: shaky ? "shaky" : "fading",
      why: shaky
        ? attempts === r.wrong
          ? "You haven't got this one right yet."
          : `You've missed this ${r.wrong} of ${attempts} times.`
        : `You knew this ${r.lastSeenDaysAgo} days ago. This is about when it starts to go.`,
      overdueBy,
    };
  });
}

/**
 * Minutes of published material in a path.
 *
 * LearningPath.minutes is a planning figure entered when the path is created,
 * and the library rendered it beside a live count of published courses — so a
 * path with nothing in it read "0 courses · 48 min total", which is not a thing
 * that can be true. Count what exists.
 */
export function pathMinutes(courses: { path: string; minutes: number }[], pathId: string): number {
  return courses.filter((c) => c.path === pathId).reduce((n, c) => n + c.minutes, 0);
}

/* ── "I've got a few minutes" ──────────────────────────────────────
   This pillar's whole promise is in its headline — "five minutes is enough" —
   and nothing on the screen let anyone act on it. The claim was a sentence,
   not a control.

   Answering it properly means working at LESSON granularity, not course. A
   12-minute course is useless to someone with four minutes; the next 4-minute
   lesson of that same course is exactly what they want, and the data to offer
   it was already there. */

export type FitCandidate = {
  courseId: string;
  courseTitle: string;
  /** The specific lesson to do — not the whole course. */
  lessonTitle: string;
  minutes: number;
  kind: "video" | "read" | "quiz";
  /** Where this sits in the course, for "lesson 2 of 3". */
  index: number;
  total: number;
  /** Ranks it: overdue mandatory beats an optional first lesson. */
  priority: number;
  why: string;
};

type FitCourse = {
  id: string; title: string; minutes: number; progress: number;
  mandatory?: boolean; dueIn?: number;
  lessons: { id: string; title: string; minutes: number; kind: "video" | "read" | "quiz" }[];
};

/**
 * What can actually be finished in the time available.
 *
 * Returns the NEXT unfinished lesson of each course that fits, ranked so an
 * overdue mandatory lesson comes before an optional one. Never returns a lesson
 * that does not fit — offering something someone cannot finish is how "five
 * minutes is enough" stops being true.
 */
export function whatFitsIn(minutes: number, courses: FitCourse[], completedIds: string[] = []): FitCandidate[] {
  return courses
    .filter((c) => !completedIds.includes(c.id))
    .map((c) => {
      const doneCount = Math.round((c.progress / 100) * c.lessons.length);
      const lesson = c.lessons[doneCount];
      if (!lesson || lesson.minutes > minutes) return null;

      const overdue = c.dueIn !== undefined && c.dueIn < 0;
      const priority =
        (overdue ? 100 : 0) +
        (c.mandatory ? 40 : 0) +
        (c.progress > 0 ? 20 : 0) + // finishing beats starting
        (minutes - lesson.minutes === 0 ? 5 : 0); // an exact fit is satisfying

      const why = overdue
        ? "Overdue, and this is the next piece of it"
        : c.progress > 0
          ? `Picks up where you stopped — lesson ${doneCount + 1} of ${c.lessons.length}`
          : c.mandatory
            ? "Mandatory, and this is the first piece"
            : "Fits the time you have";

      return {
        courseId: c.id, courseTitle: c.title,
        lessonTitle: lesson.title, minutes: lesson.minutes, kind: lesson.kind,
        index: doneCount + 1, total: c.lessons.length,
        priority, why,
      } satisfies FitCandidate;
    })
    .filter((x): x is FitCandidate => x !== null)
    .sort((a, b) => b.priority - a.priority || b.minutes - a.minutes);
}
