/* Your first 90 days — a joiner's own journey (Nudge · For you).
   Open to everyone: a joiner sees their own, anyone else sees a preview. */
import { Shell } from "../../shell";
import { Journey } from "./Journey";

export default function JourneyPage() {
  return (
    <Shell active="For you" breadcrumb="Your first 90 days">
      <Journey />
    </Shell>
  );
}
