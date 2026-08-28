"use client";
/**
 * Tool execution — the only place an agentic action actually happens.
 *
 * The model proposes; this runs, and only after the person confirmed. Every
 * executor returns an undo token, and every tool here has a working `undo`,
 * because the brief requires agentic actions to be "undoable-by-default".
 *
 * Effects are written to the same localStorage keys the product's own surfaces
 * read (`vadal:surveys-mine`, `vadal:recognition-given`, `vadal:mood`), so a
 * confirmed action really does show up in Surveys or Recognition — an agentic
 * action that only prints a success message is theatre.
 */
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
    // Surfaces already mounted need to notice — usePersistentState listens on
    // its own key, and the storage event does not fire in the writing tab.
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    /* ignore */
  }
}

const EXEC: Record<string, (args: Record<string, unknown>) => ExecResult> = {
  launch_pulse_survey(args) {
    const key = "vadal:surveys-mine";
    const audience = String(args.audience ?? "All teams");
    const topic = String(args.topic ?? "check-in");
    const id = `ai-${Date.now()}`;
    const survey = {
      __id: id,
      name: `Quick pulse · ${topic}`,
      type: "Pulse",
      audience,
      status: "live" as const,
      responseRate: 0,
      responses: 0,
      sent: 0,
      when: `Closes in ${String(args.duration ?? "3 days")}`,
    };
    write(key, [survey, ...read<unknown[]>(key, [])]);
    // Deliberately does NOT say "see it in Surveys": a manager may launch a
    // pulse (a Pulse capability) but cannot open Surveys (admin configuration).
    // Pointing someone at a screen they will be refused from is worse than not
    // pointing at all. Where a manager reads their own pulse results is an open
    // gap — see figma-requirement/006.
    return { message: `Pulse sent to ${audience}. Responses start arriving today.`, undoToken: id };
  },

  give_recognition(args) {
    const key = "vadal:recognition-given";
    const id = `ai-${Date.now()}`;
    const kudos = {
      __id: id,
      to: String(args.to ?? ""),
      value: String(args.value ?? "Ownership"),
      message: String(args.message ?? ""),
      when: "now",
    };
    write(key, [kudos, ...read<unknown[]>(key, [])]);
    return { message: `Recognition posted for ${kudos.to}.`, undoToken: id };
  },

  log_mood(args) {
    const key = "vadal:mood";
    const previous = localStorage.getItem(key);
    write(key, String(args.mood ?? ""));
    return { message: "Check-in logged — private to you.", undoToken: previous ?? "__none__" };
  },
};

const UNDO: Record<string, (token: string) => void> = {
  launch_pulse_survey(token) {
    const key = "vadal:surveys-mine";
    write(key, read<{ __id?: string }[]>(key, []).filter((s) => s.__id !== token));
  },
  give_recognition(token) {
    const key = "vadal:recognition-given";
    write(key, read<{ __id?: string }[]>(key, []).filter((k) => k.__id !== token));
  },
  log_mood(token) {
    const key = "vadal:mood";
    if (token === "__none__") localStorage.removeItem(key);
    else {
      try { localStorage.setItem(key, token); } catch { /* ignore */ }
    }
    window.dispatchEvent(new StorageEvent("storage", { key }));
  },
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
