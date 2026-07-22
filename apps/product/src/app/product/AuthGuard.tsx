"use client";
/* Route guard for the product shell — no session → /auth. Renders nothing
   until the (local) session check completes to avoid flashing protected UI.
   Reacts to sign-out via the vadal:session event. */
import * as React from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      const s = getSession();
      if (!s) router.replace("/auth");
      else if (!s.onboarded) router.replace("/auth/onboarding");
      else setOk(true);
    };
    check();
    window.addEventListener("vadal:session", check);
    return () => window.removeEventListener("vadal:session", check);
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
