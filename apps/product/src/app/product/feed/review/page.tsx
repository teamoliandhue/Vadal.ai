/* Review — the moderator's queue under Social (admins only). */
import { Shell } from "../../shell";
import { ReviewQueue } from "./ReviewQueue";

export default function ReviewPage() {
  return (
    <Shell active="Social" breadcrumb="Review" pane="split">
      <ReviewQueue />
    </Shell>
  );
}
