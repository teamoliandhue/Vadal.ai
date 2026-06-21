"use client";
/* Reusable right-side drawer — backdrop + slide-in panel, Escape/backdrop to
   close. Used for drill-downs across the Listen sections (and beyond). */
import * as React from "react";
import { X } from "lucide-react";

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
  React.useEffect(() => {
    if (!open) { setShow(false); return; }
    const id = requestAnimationFrame(() => setShow(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(id); window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} aria-hidden />
      <div className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-line bg-card shadow-[0_0_60px_-12px_rgba(20,20,40,0.4)] transition-transform duration-300 ${show ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink"><X className="h-4 w-4" /></button>
        <div className="flex-1 overflow-y-auto p-7">{children}</div>
      </div>
    </div>
  );
}
