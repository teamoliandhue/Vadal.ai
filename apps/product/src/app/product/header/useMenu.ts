"use client";
/* Shared dropdown behaviour for the header menus — outside-click + Escape dismiss.
   Returns the open state, a setter, and a ref to spread on the menu wrapper
   (trigger + panel) so clicks inside don't close it. */
import * as React from "react";

export function useMenu<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}
