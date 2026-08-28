/**
 * The tool registry — what the Copilot is allowed to actually do.
 *
 * The brief's closing instruction is that every "Agentic" bullet becomes its own
 * ticket "requiring an explicit human-confirmation step in its design — so AI
 * scope, and the guardrails around it, don't get silently dropped once core CRUD
 * functionality is working."
 *
 * So confirmation and undo are properties of the registry, not of each feature.
 * A tool that reaches other people MUST require confirmation, and a confirming
 * tool MUST be undoable — `assertRegistryIsSafe()` fails the build-time import
 * if either is violated, which is cheaper than discovering it in a demo.
 *
 * Definitions live here (shared with the server, which proposes calls).
 * Execution lives client-side in app/product/ai-exec.ts, because in this build
 * the "database" is localStorage — and because the correct architecture is the
 * same either way: the model proposes, the confirmed client acts.
 */
import type { Role } from "@/lib/auth";
import { canAccess } from "@/lib/access";

export type ToolDef = {
  name: string;
  title: string;
  /** Which product section governs it — the person must be able to reach it. */
  section: string;
  /** True when the action reaches another person or leaves the app. */
  reachesOthers: boolean;
  requiresConfirmation: boolean;
  undoable: boolean;
  /** One plain sentence describing what will happen, given the args. */
  summarise: (args: Record<string, unknown>) => string;
  /** The field-by-field preview shown before confirming. */
  preview: (args: Record<string, unknown>) => { label: string; value: string }[];
};

export const TOOLS: Record<string, ToolDef> = {
  launch_pulse_survey: {
    name: "launch_pulse_survey",
    title: "Launch a quick pulse",
    // Pulse, not Surveys. The brief's own example is a MANAGER asking the
    // Copilot to "launch a quick pulse to Line 2" — while "configure survey
    // templates" is admin-only. Governing this tool by Surveys conflated the
    // two and silently disabled the brief's flagship agentic behaviour.
    section: "Pulse",
    reachesOthers: true,
    requiresConfirmation: true,
    undoable: true,
    summarise: (a) =>
      `Send a ${(a.questions as string[])?.length ?? 3}-question pulse survey to ${a.audience} and collect responses for ${a.duration ?? "3 days"}.`,
    preview: (a) => [
      { label: "Audience", value: String(a.audience ?? "—") },
      { label: "Topic", value: String(a.topic ?? "—") },
      { label: "Questions", value: ((a.questions as string[]) ?? []).map((q, i) => `${i + 1}. ${q}`).join("\n") },
      { label: "Open for", value: String(a.duration ?? "3 days") },
    ],
  },

  give_recognition: {
    name: "give_recognition",
    title: "Send recognition",
    section: "Recognition",
    reachesOthers: true,
    requiresConfirmation: true,
    undoable: true,
    summarise: (a) => `Post recognition for ${a.to} to the team feed.`,
    preview: (a) => [
      { label: "To", value: String(a.to ?? "—") },
      { label: "Value", value: String(a.value ?? "—") },
      { label: "Message", value: String(a.message ?? "—") },
    ],
  },

  log_mood: {
    name: "log_mood",
    title: "Log your check-in",
    section: "Home",
    // Private to the person, so it may run without a confirmation card — but it
    // is still undoable, because a mislogged mood is a wrong data point.
    reachesOthers: false,
    requiresConfirmation: true,
    undoable: true,
    summarise: (a) => `Record today's check-in as "${a.mood}".`,
    preview: (a) => [
      { label: "Mood", value: String(a.mood ?? "—") },
      { label: "Note", value: String(a.note ?? "—") },
    ],
  },
};

/**
 * Which tools this person may be offered.
 *
 * Access is re-checked here as well as in the UI: the Copilot must never propose
 * an action the person could not perform themselves, or confirmation becomes a
 * way around the permission model rather than a check on it.
 */
export function toolsFor(role: Role | null | undefined): ToolDef[] {
  if (!role) return [];
  return Object.values(TOOLS).filter((t) => canAccess(role, t.section));
}

/** Invariants the registry must satisfy. Throws at import time if violated. */
export function assertRegistryIsSafe(): void {
  for (const t of Object.values(TOOLS)) {
    if (t.reachesOthers && !t.requiresConfirmation) {
      throw new Error(`Tool "${t.name}" reaches other people but does not require confirmation.`);
    }
    if (t.requiresConfirmation && !t.undoable) {
      throw new Error(`Tool "${t.name}" requires confirmation but offers no undo.`);
    }
  }
}

assertRegistryIsSafe();
