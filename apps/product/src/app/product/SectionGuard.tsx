"use client";
/* Route-level access check.

   The audit found that typing a URL reached any section regardless of role — an
   employee could open Admin Settings, and read confidential HR cases including a
   harassment report, on a screen that promises restricted visibility.

   This guard sits inside the shell chrome rather than redirecting, for two
   reasons: a silent bounce to Home leaves people convinced they clicked wrong,
   and keeping the nav on screen means the way out is already visible. It names
   the role required, so the message is actionable rather than a dead end.

   Enforcement is client-side until the Phase 1 backend lands — see lib/access. */
import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@vadal/design-system";
import { canAccess, minRoleFor, ROLE_ARTICLE } from "@/lib/access";
import { useViewAs } from "./useViewAs";

export function SectionGuard({ section, children }: { section: string; children: React.ReactNode }) {
  const [role, , meta] = useViewAs();

  // Wait for the session to load rather than flashing a denial at everyone.
  if (!meta.ready) return null;
  if (canAccess(role, section)) return <>{children}</>;

  const needed = minRoleFor(section);
  const viewingDown = meta.sessionRole && role !== meta.sessionRole;

  return (
    <div className="rise mx-auto flex max-w-lg flex-col items-center py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-soft text-faint">
        <Lock className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h1 className="mt-5 text-[22px] font-bold tracking-tight">{section} is restricted</h1>
      <p className="mt-2 text-[16px] leading-relaxed text-muted">
        {viewingDown ? (
          <>
            You’re previewing the product as {ROLE_ARTICLE[role]}. {section} is only available to{" "}
            {needed ? ROLE_ARTICLE[needed] : "an admin"} and above — switch “Viewing as” back on Home to
            return to your own access.
          </>
        ) : (
          <>
            {section} holds information limited to {needed ? ROLE_ARTICLE[needed] : "an admin"} and above.
            If you need it for your work, your workspace admin can change your role.
          </>
        )}
      </p>
      <Link href="/product/home" className="mt-6">
        <Button variant="brand">Back to Home</Button>
      </Link>
    </div>
  );
}
