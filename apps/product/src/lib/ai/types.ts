/**
 * The AI runtime contract.
 *
 * Everything the product's AI does flows through these types, regardless of who
 * produces the answer. That is the point: the model is one swappable piece at
 * the end, and the parts that actually make AI safe to ship — retrieval
 * grounding, citations, the AI-assisted label, tool confirmation and undo —
 * live in the runtime, where no individual feature can forget them.
 *
 * Today the `mock` provider answers. When an API key arrives the `anthropic`
 * provider answers instead and nothing else in the app changes.
 */

export type ChatRole = "user" | "assistant";

export type ChatMessage = { role: ChatRole; content: string };

/** A source the answer was grounded in. Never synthesised — always a real doc. */
export type Citation = {
  id: string;
  title: string;
  href: string;
  /** The passage actually used, so a reader can check the claim. */
  snippet: string;
};

/**
 * Where an answer came from, which decides how it is labelled to the user.
 * - `grounded`  — retrieved from the org's own approved documents
 * - `data`      — computed from the workspace's own data
 * - `model`     — the model's general knowledge (never allowed for policy answers)
 * - `none`      — we could not answer; say so rather than improvise
 */
export type Grounding = "grounded" | "data" | "model" | "none";

export type ToolState =
  | "proposed"   // the assistant wants to do this; waiting on the person
  | "running"
  | "done"
  | "undone"
  | "cancelled"
  | "failed";

/**
 * A proposed action.
 *
 * The brief is explicit that every agentic behaviour must sit behind "a clear,
 * undoable-by-default confirmation step for anything that leaves the app or
 * reaches another person". That rule is enforced here rather than per feature:
 * a tool with `requiresConfirmation` cannot run until the person confirms, and
 * the runtime refuses to register a confirming tool that has no undo path.
 */
export type ToolCall = {
  id: string;
  tool: string;
  /** Human-readable title for the confirmation card — "Launch a quick pulse". */
  title: string;
  /** One plain sentence: exactly what will happen, in the person's language. */
  summary: string;
  /** Field-by-field preview shown before confirming. */
  preview: { label: string; value: string }[];
  args: Record<string, unknown>;
  requiresConfirmation: boolean;
  undoable: boolean;
  state: ToolState;
  /** Filled once it has run — what changed, and what undo needs to reverse it. */
  result?: { message: string; undoToken?: string };
};

/** Streamed to the client as newline-delimited JSON. */
export type AiChunk =
  | { type: "step"; text: string }                    // visible reasoning trace
  | { type: "text"; delta: string }
  | { type: "citations"; citations: Citation[] }
  | { type: "tool"; call: ToolCall }
  | { type: "followups"; items: string[] }
  | { type: "done"; grounding: Grounding }
  | { type: "error"; message: string };

export type AiRequest = {
  messages: ChatMessage[];
  /** Which surface asked — decides which tools are offered and how strict grounding is. */
  surface?: string;
  /** Effective role, so the runtime never proposes an action the person cannot take. */
  role?: string;
  /** The team a scoped person is pinned to. */
  team?: string;
};

export interface AiProvider {
  readonly name: string;
  /** False when the provider cannot run — e.g. no API key configured. */
  readonly available: boolean;
  stream(req: AiRequest): AsyncGenerator<AiChunk>;
}
