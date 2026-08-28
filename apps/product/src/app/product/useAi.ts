"use client";
/**
 * The Copilot's client runtime: send a question, consume the chunk stream, and
 * hold the conversation — including proposed tool calls awaiting confirmation.
 *
 * Confirmation and undo live here rather than in any one component, so every
 * surface that adopts the Copilot inherits them and none can quietly skip them.
 */
import * as React from "react";
import type { AiChunk, Citation, Grounding, ToolCall } from "@/lib/ai/types";
import { runTool, undoTool } from "./ai-exec";
import { useViewAs } from "./useViewAs";
import { useSession } from "./useSession";

export type AiMessage = {
  role: "user" | "assistant";
  text: string;
  done: boolean;
  citations?: Citation[];
  followups?: string[];
  tool?: ToolCall;
  grounding?: Grounding;
  error?: string;
};

export function useAi(surface = "copilot") {
  const [messages, setMessages] = React.useState<AiMessage[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const [step, setStep] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);

  const [role] = useViewAs();
  const { session } = useSession();
  // A team-scoped person can only ever act on their own team — passed to the
  // runtime so a proposal is scoped before it is ever shown, not rejected after.
  const team = role === "manager" ? session?.team ?? undefined : undefined;

  const patchLast = React.useCallback((fn: (m: AiMessage) => AiMessage) => {
    setMessages((all) => {
      const next = all.slice();
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "assistant") { next[i] = fn(next[i]); break; }
      }
      return next;
    });
  }, []);

  const send = React.useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q) return;

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      setMessages((all) => [...all, { role: "user", text: q, done: true }]);
      setThinking(true);
      setStep("");

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [...history, { role: "user", content: q }],
            surface,
            role,
            team,
          }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`AI request failed (${res.status})`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let started = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // NDJSON — a chunk boundary can split a line, so keep the remainder.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let chunk: AiChunk;
            try { chunk = JSON.parse(line) as AiChunk; } catch { continue; }

            if (chunk.type === "step") { setStep(chunk.text); continue; }

            // The first non-step chunk ends "thinking" and opens the bubble.
            if (!started) {
              started = true;
              setThinking(false);
              setStep("");
              setMessages((all) => [...all, { role: "assistant", text: "", done: false }]);
            }

            switch (chunk.type) {
              case "text":      patchLast((m) => ({ ...m, text: m.text + chunk.delta })); break;
              case "citations": patchLast((m) => ({ ...m, citations: chunk.citations })); break;
              case "followups": patchLast((m) => ({ ...m, followups: chunk.items })); break;
              case "tool":      patchLast((m) => ({ ...m, tool: chunk.call })); break;
              case "done":      patchLast((m) => ({ ...m, done: true, grounding: chunk.grounding })); break;
              case "error":     patchLast((m) => ({ ...m, done: true, error: chunk.message })); break;
            }
          }
        }
        patchLast((m) => ({ ...m, done: true }));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((all) => [
          ...all,
          { role: "assistant", text: "", done: true, error: "I couldn't reach the assistant just now. Try again in a moment." },
        ]);
      } finally {
        setThinking(false);
        setStep("");
      }
    },
    [messages, patchLast, role, surface, team],
  );

  /** Run a proposed tool. Only ever called from an explicit confirm. */
  const confirmTool = React.useCallback((call: ToolCall) => {
    setMessages((all) => all.map((m) => (m.tool?.id === call.id ? { ...m, tool: { ...call, state: "running" } } : m)));
    try {
      const result = runTool(call);
      setMessages((all) =>
        all.map((m) => (m.tool?.id === call.id ? { ...m, tool: { ...call, state: "done", result } } : m)),
      );
    } catch (err) {
      setMessages((all) =>
        all.map((m) =>
          m.tool?.id === call.id
            ? { ...m, tool: { ...call, state: "failed", result: { message: (err as Error).message } } }
            : m,
        ),
      );
    }
  }, []);

  const cancelTool = React.useCallback((call: ToolCall) => {
    setMessages((all) =>
      all.map((m) => (m.tool?.id === call.id ? { ...m, tool: { ...call, state: "cancelled" } } : m)),
    );
  }, []);

  const undo = React.useCallback((call: ToolCall) => {
    try {
      undoTool(call);
      setMessages((all) =>
        all.map((m) => (m.tool?.id === call.id ? { ...m, tool: { ...call, state: "undone" } } : m)),
      );
    } catch {
      /* leave the call as done — undo failing must not look like it worked */
    }
  }, []);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setThinking(false);
    setStep("");
  }, []);

  return { messages, thinking, step, send, confirmTool, cancelTool, undo, reset } as const;
}
