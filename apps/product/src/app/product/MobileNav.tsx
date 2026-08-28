"use client";
/* Mobile navigation — the whole product below 1024px.

   Until now the sidebar was simply `max-lg:hidden`, so on a phone there was no
   navigation at all: you could reach Home and then nothing else. Roughly 70% of
   the people this product is bought to reach never sit at a desk, which made
   this the most consequential defect in the audit.

   Pattern: a bottom tab bar with four role-chosen destinations plus More, which
   opens a sheet holding the full nav, the workspace identity and sign-out.
   Bottom bar rather than a top hamburger because the reach zone on a large
   phone is the bottom third, and this is a one-handed, on-shift product.

   Touch targets are ≥44px, the bar clears the iOS home indicator via
   safe-area-inset, and the sheet animation is dropped under prefers-reduced-motion. */
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { Avatar } from "@vadal/design-system";
import { setSession } from "@/lib/auth";
import { canAccess } from "@/lib/access";
import { org } from "@/lib/data";
import { navFor, mobilePrimary } from "./nav-model";
import { useViewAs } from "./useViewAs";
import { useMe } from "./useSession";
import { toast } from "./Toaster";

export function MobileNav({ active }: { active: string }) {
  const [role, , meta] = useViewAs();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const me = useMe();

  // Close the sheet whenever navigation actually happens.
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    // Stop the page scrolling underneath the sheet.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!meta.ready) return null;

  const primary = mobilePrimary(role);
  const groups = navFor(role);
  const canSettings = canAccess(role, "Settings");

  function signOut() {
    setOpen(false);
    setSession(null);
    toast("Signed out — see you tomorrow 👋", "info");
    router.push("/auth");
  }

  return (
    <>
      {/* ── bottom tab bar ── */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-lg items-stretch">
          {primary.map((item) => {
            const on = item.label === active;
            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className="flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors"
                  style={on ? { color: "var(--client-brand, var(--purple))" } : undefined}
                >
                  <item.icon className="size-[22px]" strokeWidth={on ? 2.1 : 1.75} />
                  <span className={`text-[12px] leading-none ${on ? "font-semibold" : "font-medium text-faint"}`}>
                    {item.label === "Always-on listening" ? "Listening" : item.label}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className="flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-faint transition-colors"
            >
              <Menu className="size-[22px]" strokeWidth={1.75} />
              <span className="text-[12px] font-medium leading-none">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ── full-nav sheet ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="sheet-scrim absolute inset-0 bg-[rgba(10,10,12,0.45)] backdrop-blur-[2px]"
          />
          <div className="sheet-panel absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[26px] border-t border-line bg-card pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-card px-5 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={org.logo} alt="" className="h-9 w-9 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{org.name}</div>
                <div className="truncate text-[12px] text-faint">{me.fullName} · {me.title}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-faint transition hover:bg-soft hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 py-2">
              {groups.map((group) => (
                <div key={group.label} className="mb-1">
                  <p className="px-3 pb-1 pt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
                    {group.label}
                  </p>
                  <ul>
                    {group.items.map((item) => {
                      const on = item.label === active;
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            aria-current={on ? "page" : undefined}
                            className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[16px] transition-colors ${
                              on ? "bg-soft font-semibold" : "font-medium text-muted"
                            }`}
                            style={on ? { color: "var(--client-brand, var(--purple))" } : undefined}
                          >
                            <item.icon className="size-[20px] shrink-0" strokeWidth={on ? 2.1 : 1.8} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="my-2 h-px bg-line" />

              <ul>
                <li className="flex items-center gap-3 px-3 py-2">
                  <Avatar src={me.img} name={me.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold">{me.fullName}</div>
                    <div className="truncate text-[12px] text-faint">{me.email}</div>
                  </div>
                </li>
                {canSettings && (
                  <li>
                    <Link
                      href="/product/settings"
                      className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[16px] font-medium transition-colors ${
                        active === "Settings" ? "bg-soft font-semibold" : "text-muted"
                      }`}
                    >
                      <Settings className="size-[20px] shrink-0" strokeWidth={1.8} /> Settings
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-left text-[16px] font-medium text-[#dc4a44] transition-colors hover:bg-[#fbecec] dark:hover:bg-[#3a1d1d]"
                  >
                    <LogOut className="size-[20px] shrink-0" strokeWidth={1.8} /> Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
