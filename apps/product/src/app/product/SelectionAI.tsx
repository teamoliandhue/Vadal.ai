"use client";
/* Ambient inline AI — select any text anywhere in the product and a floating
   Aurora pill appears (Explain · Draft · Summarise) that opens the dock with the
   selection as context. Mounted once in the Shell. Makes the whole app feel
   AI-native without touching every component. */
import * as React from "react";
import { SparkMark } from "@vadal/design-system";

type Sel = { x: number; y: number; text: string };

export function SelectionAI() {
  const [sel, setSel] = React.useState<Sel | null>(null);

  React.useEffect(() => {
    function read() {
      const s = window.getSelection();
      const text = s?.toString().trim() ?? "";
      if (!s || s.isCollapsed || text.length < 8 || text.length > 600) return setSel(null);
      // don't offer it inside inputs, the dock, the command palette, or our own pill
      const host = (s.anchorNode?.nodeType === 1 ? (s.anchorNode as Element) : s.anchorNode?.parentElement) ?? null;
      if (host?.closest('input, textarea, [contenteditable], [role="dialog"], .ai-glow-border, [data-selection-ai]')) return setSel(null);
      const r = s.getRangeAt(0).getBoundingClientRect();
      if (!r.width && !r.height) return setSel(null);
      setSel({ x: r.left + r.width / 2, y: r.top, text });
    }
    function onClear() { if (!window.getSelection()?.toString().trim()) setSel(null); }
    document.addEventListener("mouseup", read);
    document.addEventListener("selectionchange", onClear);
    return () => {
      document.removeEventListener("mouseup", read);
      document.removeEventListener("selectionchange", onClear);
    };
  }, []);

  if (!sel) return null;

  const ask = (verb: string) => {
    window.dispatchEvent(new CustomEvent("vadal:ask", { detail: { q: `${verb}: "${sel.text}"` } }));
    window.getSelection()?.removeAllRanges();
    setSel(null);
  };

  return (
    <div
      data-selection-ai
      className="ai-pop fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ left: sel.x, top: sel.y - 8 }}
      // keep the selection alive when pressing a button
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-0.5 rounded-full bg-card p-1 shadow-[0_10px_30px_-8px_rgba(20,20,40,0.4)] ring-1 ring-[var(--ai-border)] dark:ring-white/10">
        <span className="ai-grad ml-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"><SparkMark size={13} tone="solid" /></span>
        {(["Explain", "Draft", "Summarise"] as const).map((label) => (
          <button
            key={label}
            onClick={() => ask(label === "Draft" ? "Draft a reply to" : label)}
            className="rounded-full px-2.5 py-1 text-[14px] font-semibold text-ink transition hover:bg-soft"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
