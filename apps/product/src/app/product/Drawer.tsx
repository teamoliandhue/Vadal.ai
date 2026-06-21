"use client";
/* Reusable right-side drawer — backdrop + slide-in panel, Escape/backdrop to
   close. Accessible modal: focus moves into the panel on open, Tab is trapped
   inside, body scroll is locked, and focus returns to the trigger on close.
   Used for drill-downs across the product (Listen sections, Pulse, Feed). */
import * as React from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [show, setShow] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) { setShow(false); return; }
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // scroll-lock the page behind

    const id = requestAnimationFrame(() => {
      setShow(true);
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel)?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      // trap focus within the panel
      const panel = panelRef.current;
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      else if (!panel.contains(active as Node)) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.(); // return focus to the trigger
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} aria-hidden />
      <div ref={panelRef} tabIndex={-1} className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-line bg-card shadow-[0_0_60px_-12px_rgba(20,20,40,0.4)] outline-none transition-transform duration-300 ${show ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink"><X className="h-4 w-4" /></button>
        <div className="flex-1 overflow-y-auto p-7">{children}</div>
      </div>
    </div>
  );
}
