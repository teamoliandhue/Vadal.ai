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
  Recognition: "Engage", Campaigns: "Engage", Amplify: "Engage",
  Thrive: "Wellbeing", "One-to-One Help": "Wellbeing", Grow: "Learn",
  "Manager hub": "Operations", Cases: "Operations", Knowledge: "Workspace", Settings: "Account",
};

export function Shell({
  active,
  breadcrumb,
  pane = "page",
  children,
}: {
  active: string;
  breadcrumb: string;
  /** "page" — one scroll region for the whole page (the default).
   *  "split" — the page owns its own panes (see ../panes). */
  pane?: "page" | "split";
  children: React.ReactNode;
}) {
  /* Below lg the document scrolls; from lg the chrome is fixed and the content
     scrolls in a pane underneath it. See ./panes for why. */
  const split = pane === "split";
  return (
    <AuthGuard>
    <div className="lumen flex min-h-dvh bg-canvas text-ink lg:h-dvh lg:min-h-0 lg:overflow-hidden" data-ds>
      <BrandProvider />
      <Rail active={active} />
      <div className="relative flex min-w-0 flex-1 flex-col lg:min-h-0">
        {/* Ambient wash at the head of the workspace. It sits in the chrome
            rather than the pane now, so it is a light source above the content
            instead of something you scroll out of the room. */}
        <div className="canvas-glow" aria-hidden />
        <TopBar domain={DOMAIN[active] ?? "Workspace"} breadcrumb={breadcrumb} />
        {/* pb clears the mobile tab bar (56px + safe area) and the AI dock.
            In split mode each pane carries its own vertical room instead. */}
        {/* tabIndex makes the scroll region reachable — without it Page Down,
            Space and the arrow keys have nothing to act on, because the
            document no longer scrolls. Clicking anywhere in the content focuses
            it too, so the keys work the moment anyone reaches for them. */}
        <div
          tabIndex={0}
          aria-label={breadcrumb}
          className={`pane relative min-h-0 flex-1 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--brand)] lg:overflow-y-auto ${split ? "xl:overflow-hidden" : ""}`}
        >
          <main
            className={[
              "mx-auto w-full max-w-[1240px] px-6 pb-[calc(104px+env(safe-area-inset-bottom))] pt-8 sm:px-10 sm:pt-10 lg:pb-28",
              split ? "flex flex-col xl:h-full xl:min-h-0 xl:pb-0 xl:pt-0" : "",
            ].join(" ")}
          >
            <SectionGuard section={active}>{children}</SectionGuard>
          </main>
        </div>
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
