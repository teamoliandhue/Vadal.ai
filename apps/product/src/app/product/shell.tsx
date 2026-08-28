import { AiDock } from "./ai-dock";
import { TopBar } from "./header/TopBar";
import { Toaster } from "./Toaster";
import { Rail } from "./Rail";
import { MobileNav } from "./MobileNav";
import { SelectionAI } from "./SelectionAI";
import { BrandProvider } from "./BrandProvider";
import { AuthGuard } from "./AuthGuard";
import { SectionGuard } from "./SectionGuard";

/* ════════════════════════ shared product shell ════════════════════════
   The Lumen app chrome — sidebar rail (./Rail, client) on desktop, a bottom
   tab bar + sheet (./MobileNav) below lg, top bar, AI dock — used by every
   product page. `active` highlights the current nav item, labels the bar, and
   is the key the access model gates on (see lib/access). `breadcrumb` labels
   the bar.

   Two guards, deliberately separate:
   - AuthGuard  — are you signed in and onboarded at all
   - SectionGuard — may this role open this section (inside the chrome, so the
     way out stays visible instead of a silent redirect) */

/* left-hand domain label per section (top-bar breadcrumb root) */
const DOMAIN: Record<string, string> = {
  Home: "My space", Feed: "My space", Pulse: "People intelligence", Analytics: "People intelligence",
  Surveys: "Listening", Sentiment: "Listening", "Always-on listening": "Listening",
  Recognition: "Engage", Campaigns: "Engage",
  "Manager hub": "Operations", Cases: "Operations", Knowledge: "Workspace", Settings: "Account",
};

export function Shell({
  active,
  breadcrumb,
  children,
}: {
  active: string;
  breadcrumb: string;
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
    <div className="lumen flex min-h-screen bg-canvas text-ink" data-ds>
      <BrandProvider />
      <Rail active={active} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="canvas-glow" aria-hidden />
        <TopBar domain={DOMAIN[active] ?? "Workspace"} breadcrumb={breadcrumb} />
        {/* pb clears the mobile tab bar (56px + safe area) and the AI dock */}
        <main className="relative mx-auto w-full max-w-[1240px] flex-1 px-6 pb-[calc(104px+env(safe-area-inset-bottom))] pt-8 sm:px-10 sm:pt-10 lg:pb-28">
          <SectionGuard section={active}>{children}</SectionGuard>
        </main>
      </div>
      <AiDock />
      <MobileNav active={active} />
      <SelectionAI />
      <Toaster />
    </div>
    </AuthGuard>
  );
}

// Rail lives in ./Rail (client) — workspace switcher + menu · AI briefing · nav · Health. Desktop only.
// MobileNav lives in ./MobileNav (client) — bottom tab bar + full-nav sheet. Below lg only.
// TopBar lives in ./header/TopBar (client) — breadcrumb · search (⌘K) · Intelligence · theme · notifications · account.
// AiDock lives in ./ai-dock (client) — a functional chat dock opened from anywhere via the `vadal:ask` event.
