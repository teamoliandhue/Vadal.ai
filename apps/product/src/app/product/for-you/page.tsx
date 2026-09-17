/* For you — what Nudge suggests is worth your time today (Nudge group). */
import { Shell } from "../shell";
import { ForYou } from "./ForYou";

export default function ForYouPage() {
  return (
    <Shell active="For you" breadcrumb="For you">
      <ForYou />
    </Shell>
  );
}
