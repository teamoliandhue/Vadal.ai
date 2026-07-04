"use client";
/* Shared "View as" role state (Home §5). The current user can view the product
   as an Employee, Manager or Admin — the call's actor model. Persisted to
   localStorage and broadcast via a vadal:viewas event so every consumer
   (ProfileMenu, the Home switch, ManagerSnapshot) stays in sync. */
import * as React from "react";

export type ViewRole = "employee" | "manager" | "admin";
export const VIEW_ROLES: { key: ViewRole; label: string }[] = [
  { key: "employee", label: "Employee" },
  { key: "manager", label: "Manager" },
  { key: "admin", label: "Admin" },
];

const KEY = "vadal:view-as";
const read = (): ViewRole => {
  if (typeof localStorage === "undefined") return "manager";
  try { return (JSON.parse(localStorage.getItem(KEY) ?? '"manager"') as ViewRole) || "manager"; } catch { return "manager"; }
};

export function useViewAs() {
  const [role, setRole] = React.useState<ViewRole>("manager");
  React.useEffect(() => {
    setRole(read());
    const on = () => setRole(read());
    window.addEventListener("vadal:viewas", on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener("vadal:viewas", on); window.removeEventListener("storage", on); };
  }, []);
  const update = React.useCallback((r: ViewRole) => {
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* ignore */ }
    setRole(r);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vadal:viewas"));
  }, []);
  return [role, update] as const;
}
