import { AiDock } from "./ai-dock";
import { TopBar } from "./header/TopBar";
import { Toaster } from "./Toaster";
import { Rail } from "./Rail";
import { SelectionAI } from "./SelectionAI";
import { BrandProvider } from "./BrandProvider";

/* ════════════════════════ shared product shell ════════════════════════
   The Lumen app chrome — sidebar rail (./Rail, client), top bar, AI dock —
   used by every product page. `active` highlights the current nav item;
   `breadcrumb` labels the bar. */

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
    <div className="lumen flex min-h-screen bg-canvas text-ink" data-ds>
      <BrandProvider />
      <Rail active={active} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="canvas-glow" aria-hidden />
        <TopBar domain={DOMAIN[active] ?? "Workspace"} breadcrumb={breadcrumb} />
        <main className="relative mx-auto w-full max-w-[1240px] flex-1 px-6 pb-28 pt-8 sm:px-10 sm:pt-10">
          {children}
        </main>
      </div>
      <AiDock />
      <SelectionAI />
      <Toaster />
    </div>
  );
}

// Rail lives in ./Rail (client) — Signal logo · workspace switcher + menu · AI briefing · nav · Health.
// TopBar lives in ./header/TopBar (client) — breadcrumb · search (⌘K) · Intelligence · theme · notifications · account.
// AiDock lives in ./ai-dock (client) — a functional chat dock opened from anywhere via the `vadal:ask` event.
