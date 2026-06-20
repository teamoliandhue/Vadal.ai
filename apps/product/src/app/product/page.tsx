/* ════════════════════════════════════════════════════════════════════
   PULSE — the people-intelligence dashboard (route /product).
   Built to the Notion spec "Pulse — People intelligence": the org/team
   health + action surface for leaders & managers. Uses the shared Shell
   (Sidebar · Top bar · AI dock · Toaster), neutral + violet, the type
   floor, DS components, and the hand-rolled chart primitives.
   ════════════════════════════════════════════════════════════════════ */
import { Shell } from "./shell";
import { PulseDashboard } from "./pulse/PulseDashboard";

export default function PulsePage() {
  return (
    <Shell active="Pulse" breadcrumb="Pulse">
      <PulseDashboard />
    </Shell>
  );
}
