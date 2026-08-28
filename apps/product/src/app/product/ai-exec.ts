"use client";
/**
 * Tool execution — the only place an agentic action actually happens.
 *
 * The model proposes; this runs, and only after the person confirmed. Every
 * executor returns an undo token and every tool has a working `undo`, because
 * the brief requires agentic actions to be "undoable-by-default".
 *
 * Effects write to the same localStorage keys the product's own surfaces read,
 * so a confirmed action really does show up — an agentic action that only prints
 * a success message is theatre. Where a pillar has no screen yet (Amplify,
 * Thrive, Grow, One-to-One Help) the effect is still recorded under its own key,
 * so the action is real and auditable the moment those screens exist.
 *
 * Two tools are BLOCKED by the brief itself and refuse to run: posting to a
 * personal social profile (needs a feasibility spike and per-employee OAuth) and
 * booking a counsellor (needs clinical and legal sign-off). They fail loudly at
 * the point of confirmation rather than pretending to succeed.
 */
import { TOOLS } from "@/lib/ai/tools";
import type { ToolCall } from "@/lib/ai/types";

type ExecResult = { message: string; undoToken?: string };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Surfaces already mounted need to notice — the storage event does not fire
    // in the tab that wrote it, so dispatch one ourselves.
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    /* ignore */
  }
}

/** Prepend to a list and return an undo token. */
function push(key: string, item: Record<string, unknown>): string {
  const id = `ai-${Date.now()}-${Math.round(performance.now())}`;
  write(key, [{ __id: id, ...item }, ...read<unknown[]>(key, [])]);
  return id;
}

function drop(key: string, token: string) {
  write(key, read<{ __id?: string }[]>(key, []).filter((x) => x.__id !== token));
}

const s = (v: unknown, f = "") => (v === undefined || v === null ? f : String(v));

/* Keys the product's own screens already read. */
const K = {
  surveys: "vadal:surveys-mine",
  recognition: "vadal:recognition-given",
  feedMine: "vadal:feed-mine",
  campaigns: "vadal:campaigns-mine",
  // Pillars without screens yet — recorded so nothing is faked.
  checkins: "vadal:checkins",
  thrive: "vadal:thrive-log",
  goals: "vadal:thrive-goals",
  bookings: "vadal:bookings",
  advocacy: "vadal:advocacy-queue",
  courses: "vadal:grow-courses",
  assignments: "vadal:grow-assignments",
  reminders: "vadal:reminders",
  scheduled: "vadal:scheduled-posts",
} as const;

const EXEC: Record<string, (a: Record<string, unknown>) => ExecResult> = {
  /* ── Pulse ────────────────────────────────────────────────── */
  launch_pulse_survey(a) {
    const audience = s(a.audience, "All teams");
    const token = push(K.surveys, {
      name: `Quick pulse · ${s(a.topic, "check-in")}`,
      type: "Pulse",
      audience,
      status: "live",
      responseRate: 0, responses: 0, sent: 0,
      when: `Closes in ${s(a.duration, "3 days")}`,
    });
    // Deliberately does not say "see it in Surveys": a manager may launch a
    // pulse but cannot open Surveys, and pointing someone at a screen they will
    // be refused from is worse than not pointing at all.
    return { message: `Pulse sent to ${audience}. Responses start arriving today.`, undoToken: token };
  },

  diagnose_anomaly(a) {
    const team = s(a.team, "the team");
    const token = push(K.surveys, {
      name: `Diagnostic · ${team}`,
      type: "Pulse", audience: team, status: "live",
      responseRate: 0, responses: 0, sent: 0, when: "Closes in 3 days",
    });
    return { message: `Diagnostic pulse sent to ${team}, anonymously.`, undoToken: token };
  },

  log_mood_entry(a) {
    const token = push(K.checkins, { mood: s(a.mood), themes: s(a.themes), quote: s(a.quote), when: "today" });
    return { message: "Check-in logged — private to you.", undoToken: token };
  },

  chase_survey(a) {
    const token = push(K.reminders, { kind: "survey", target: s(a.survey), count: s(a.count), channel: s(a.channel) });
    return { message: `Reminder queued for ${s(a.count, "the")} non-responders.`, undoToken: token };
  },

  /* ── Connect ──────────────────────────────────────────────── */
  give_recognition(a) {
    const token = push(K.recognition, { to: s(a.to), value: s(a.value), message: s(a.message), when: "now" });
    return { message: `Recognition posted for ${s(a.to)}.`, undoToken: token };
  },

  write_post(a) {
    const token = push(K.feedMine, {
      kind: "Team", author: "You", role: "You", img: "/avatars/user-2.svg",
      text: s(a.text), time: "now", likes: 0, comments: 0,
    });
    return { message: "Posted to the company feed.", undoToken: token };
  },

  schedule_milestone_post(a) {
    const token = push(K.scheduled, { person: s(a.person), milestone: s(a.milestone), when: s(a.when), text: s(a.text) });
    return { message: `Scheduled for ${s(a.when)}.`, undoToken: token };
  },

  /* ── Amplify ──────────────────────────────────────────────── */
  share_to_social() {
    // Blocked by the brief's own feasibility requirement — refuse rather than
    // report a success that did not happen.
    throw new Error(TOOLS.share_to_social.blockedReason!);
  },

  queue_for_advocacy(a) {
    const token = push(K.advocacy, { title: s(a.title), platforms: s(a.platforms), bestTime: s(a.bestTime) });
    return { message: "Advocacy card queued. Employees opt in individually.", undoToken: token };
  },

  /* ── Thrive ───────────────────────────────────────────────── */
  log_activity(a) {
    const token = push(K.thrive, { activity: s(a.activity), when: s(a.when, "Today") });
    return { message: "Logged to your week.", undoToken: token };
  },

  adjust_goal(a) {
    const key = K.goals;
    const previous = localStorage.getItem(key);
    write(key, { metric: s(a.metric), value: s(a.to), reason: s(a.reason) });
    // Undo restores the exact previous value, including "there wasn't one".
    return { message: `Goal moved to ${s(a.to)}.`, undoToken: previous ?? "__none__" };
  },

  book_benefit_call(a) {
    const token = push(K.bookings, { kind: "benefits", about: s(a.benefit), when: "Next available" });
    return { message: `Call requested about ${s(a.benefit)}.`, undoToken: token };
  },

  /* ── Broadcast ────────────────────────────────────────────── */
  draft_announcement(a) {
    const token = push(K.campaigns, {
      name: `Announcement · ${s(a.audience)}`,
      objective: "communication", audience: s(a.audience),
      // The brief: an AI-assisted draft "cannot send itself".
      status: "scheduled", text: s(a.text), approval: "pending",
    });
    return { message: "Queued for approval — it will not send until a person approves it.", undoToken: token };
  },

  chase_acknowledgement(a) {
    const token = push(K.reminders, { kind: "acknowledgement", target: s(a.message), count: s(a.count), channel: s(a.channel) });
    return { message: `Reminder queued for ${s(a.count, "the")} who haven't confirmed.`, undoToken: token };
  },

  /* ── Grow ─────────────────────────────────────────────────── */
  make_course(a) {
    const token = push(K.courses, {
      title: s(a.title), modules: s(a.modules), questions: s(a.questions),
      minutes: s(a.minutes), status: "draft",
    });
    return { message: `“${s(a.title)}” saved as a draft — it needs a named reviewer before it goes live.`, undoToken: token };
  },

  assign_learning(a) {
    const token = push(K.assignments, { path: s(a.path), audience: s(a.audience), because: s(a.because), note: s(a.note) });
    return { message: `Assigned to ${s(a.audience)}, with your note explaining why.`, undoToken: token };
  },

  /* ── One-to-One Help ──────────────────────────────────────── */
  book_counsellor() {
    // Hard blocker per the brief: clinical, legal and HR sign-off comes first.
    throw new Error(TOOLS.book_counsellor.blockedReason!);
  },
};

const UNDO: Record<string, (token: string) => void> = {
  launch_pulse_survey: (t) => drop(K.surveys, t),
  diagnose_anomaly: (t) => drop(K.surveys, t),
  log_mood_entry: (t) => drop(K.checkins, t),
  chase_survey: (t) => drop(K.reminders, t),
  give_recognition: (t) => drop(K.recognition, t),
  write_post: (t) => drop(K.feedMine, t),
  schedule_milestone_post: (t) => drop(K.scheduled, t),
  queue_for_advocacy: (t) => drop(K.advocacy, t),
  log_activity: (t) => drop(K.thrive, t),
  book_benefit_call: (t) => drop(K.bookings, t),
  draft_announcement: (t) => drop(K.campaigns, t),
  chase_acknowledgement: (t) => drop(K.reminders, t),
  make_course: (t) => drop(K.courses, t),
  assign_learning: (t) => drop(K.assignments, t),
  adjust_goal: (token) => {
    if (token === "__none__") localStorage.removeItem(K.goals);
    else {
      try { localStorage.setItem(K.goals, token); } catch { /* ignore */ }
    }
    window.dispatchEvent(new StorageEvent("storage", { key: K.goals }));
  },
  // share_to_social and book_counsellor never run, so they never need undoing.
};

export function runTool(call: ToolCall): ExecResult {
  const fn = EXEC[call.tool];
  if (!fn) throw new Error(`No executor registered for "${call.tool}".`);
  return fn(call.args);
}

export function undoTool(call: ToolCall): void {
  const fn = UNDO[call.tool];
  if (!fn || !call.result?.undoToken) throw new Error(`"${call.tool}" cannot be undone.`);
  fn(call.result.undoToken);
}

/**
 * Every confirming tool must have an executor and an undo.
 *
 * The registry already refuses a confirming tool with no undo *declared*; this
 * checks the undo actually exists in code. Run in development so the gap shows
 * up while writing the feature, not while demoing it.
 */
export function assertExecutorsComplete(): string[] {
  const problems: string[] = [];
  for (const t of Object.values(TOOLS)) {
    const blocked = Boolean(t.blockedReason);
    if (!EXEC[t.name]) problems.push(`${t.name}: no executor`);
    if (!blocked && t.undoable && !UNDO[t.name]) problems.push(`${t.name}: undoable but no undo implementation`);
  }
  return problems;
}

if (process.env.NODE_ENV !== "production") {
  const problems = assertExecutorsComplete();
  if (problems.length) console.error("[ai-exec] incomplete tools:", problems);
}
