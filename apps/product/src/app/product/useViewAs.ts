"use client";
/* Shared "View as" role state (Home §5).

   The founders asked for this: an admin previewing what a manager or an employee
   actually sees. It is a genuine feature — but it may only ever scope DOWN.

   Previously the switch wrote straight to localStorage with no ceiling, so any
   signed-in employee could set themselves to "admin" and the whole product
   obeyed. Now the session role is a hard ceiling: the options list is trimmed to
   what you are allowed to be, and effectiveRole() re-caps the stored value on
   every read, so a stale or hand-edited key cannot raise anyone's privileges. */
import * as React from "react";
import type { Role } from "@/lib/auth";
import { ROLE_RANK, effectiveRole, scopeFor, type DataScope } from "@/lib/access";
import { useSession } from "./useSession";

export type ViewRole = "employee" | "manager" | "admin";
export const VIEW_ROLES: { key: ViewRole; label: string }[] = [
  { key: "employee", label: "Employee" },
  { key: "manager", label: "Manager" },
  { key: "admin", label: "Admin" },
];

const KEY = "vadal:view-as";
const read = (): ViewRole => {
  if (typeof localStorage === "undefined") return "employee";
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? '"employee"') as ViewRole) || "employee";
  } catch {
    return "employee";
  }
};

/**
 * [effective role, set, meta]
 *
 * `role` is already capped by the session — consumers can trust it directly and
 * never need to re-check. `meta.options` is the switch's allowed choices, and
 * `meta.canSwitch` is false for a plain employee (there is nothing below them to
 * preview, so the control hides entirely rather than showing one dead option).
 */
export function useViewAs() {
  const { session, ready } = useSession();
  const [stored, setStored] = React.useState<ViewRole>("employee");

  React.useEffect(() => {
    setStored(read());
    const on = () => setStored(read());
    window.addEventListener("vadal:viewas", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("vadal:viewas", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const sessionRole: Role | null = session?.role ?? null;
  const role = effectiveRole(sessionRole, stored) as Role;

  const options = React.useMemo(
    () => (sessionRole ? VIEW_ROLES.filter((r) => ROLE_RANK[r.key] <= ROLE_RANK[sessionRole]) : []),
    [sessionRole],
  );

  const update = React.useCallback(
    (r: ViewRole) => {
      // Refuse anything above the ceiling rather than silently storing it.
      if (sessionRole && ROLE_RANK[r] > ROLE_RANK[sessionRole]) return;
      try {
        localStorage.setItem(KEY, JSON.stringify(r));
      } catch {
        /* ignore */
      }
      setStored(r);
      if (typeof window !== "undefined") window.dispatchEvent(new Event("vadal:viewas"));
    },
    [sessionRole],
  );

  const meta = React.useMemo(
    () => ({ options, sessionRole, canSwitch: options.length > 1, ready }),
    [options, sessionRole, ready],
  );

  return [role, update, meta] as const;
}

/**
 * How much of a section the current person may see.
 *
 * Access answers "can you open it" (SectionGuard); this answers "how much of it
 * do you get" — the brief's "Own team" column. A manager on Pulse, Sentiment,
 * Manager hub or Campaigns is limited to their own team.
 */
export function useScope(section: string) {
  const [role, , meta] = useViewAs();
  const { session } = useSession();
  const scope: DataScope = scopeFor(role, section);
  return {
    scope,
    /** The team a manager is pinned to; null for admins and for scope "all". */
    team: scope === "own-team" ? session?.team ?? null : null,
    role,
    ready: meta.ready,
  } as const;
}
