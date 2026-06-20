"use client";
/* Lightweight toast system — fire from anywhere via `toast(message)`, which dispatches a
   `vadal:toast` window event. The <Toaster/> (mounted once in the shell) renders a
   bottom-centre stack that auto-dismisses. Neutral surface + violet/green accent. */
import * as React from "react";
import { Check, Info } from "lucide-react";

type Tone = "success" | "info";

export function toast(message: string, tone: Tone = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vadal:toast", { detail: { message, tone } }));
}

type T = { id: number; message: string; tone: Tone };

export function Toaster() {
  const [toasts, setToasts] = React.useState<T[]>([]);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    function onToast(e: Event) {
      const d = (e as CustomEvent).detail as { message: string; tone?: Tone };
      const id = idRef.current++;
      setToasts((t) => [...t, { id, message: d.message, tone: d.tone ?? "success" }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    }
    window.addEventListener("vadal:toast", onToast as EventListener);
    return () => window.removeEventListener("vadal:toast", onToast as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="toast-in pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2.5 text-[14px] font-medium shadow-[0_10px_34px_rgba(20,20,25,0.22)] dark:border-white/10 dark:shadow-[0_10px_34px_rgba(0,0,0,0.5)]"
        >
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
              t.tone === "success" ? "bg-vgreen-soft text-vgreen" : "bg-[var(--lav)] text-[var(--purple)]"
            }`}
          >
            {t.tone === "success" ? <Check className="h-3 w-3" strokeWidth={3} /> : <Info className="h-3.5 w-3.5" />}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
