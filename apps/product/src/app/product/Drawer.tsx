"use client";
/* Reusable drawer — backdrop + slide-in panel, Escape/backdrop to close.
   On a phone it is a bottom sheet (mobile pass, spec 043): it rises from the
   bottom where a thumb already is, has a grab bar you can pull down to close,
   and a 44px close button. From md up it is the right-side panel. Accessible modal: focus moves into the panel on open, Tab is trapped
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
  footer,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Actions pinned under the scrolling content — always at the bottom edge,
   *  never floating over fields, on a phone above the home indicator. */
  footer?: React.ReactNode;
}) {
  const [show, setShow] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);
  const pull = React.useRef<number | null>(null);

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
      <div
        ref={panelRef} tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[28px] border-t border-line bg-card shadow-[0_0_60px_-12px_rgba(20,20,40,0.4)] outline-none transition-transform duration-300 md:inset-x-auto md:bottom-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-[440px] md:rounded-none md:border-l md:border-t-0 ${
          show ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        {/* Grab bar — pull it down to close. Phone only. */}
        <div
          className="flex h-6 shrink-0 touch-none items-center justify-center md:hidden"
          onPointerDown={(e) => { pull.current = e.clientY; }}
          onPointerUp={(e) => { if (pull.current !== null && e.clientY - pull.current > 60) onClose(); pull.current = null; }}
          aria-hidden
        >
          <span className="h-1.5 w-10 rounded-full bg-[var(--line)]" />
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink md:right-4 md:top-4 md:h-8 md:w-8"><X className="h-4 w-4" /></button>
        <div className={`flex-1 overflow-y-auto px-6 pt-2 md:p-7 ${footer ? "pb-6" : "pb-[calc(1.5rem+env(safe-area-inset-bottom))]"}`}>{children}</div>
        {footer && <div className="shrink-0 border-t border-line bg-card px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-7 md:pb-4">{footer}</div>}
      </div>
    </div>
  );
}
