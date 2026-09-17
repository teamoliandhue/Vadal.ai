import { Shell } from "../shell";
import { RecognitionHub } from "./RecognitionHub";

export default function RecognitionPage() {
  return (
    <Shell active="Kudos" breadcrumb="Kudos">
      <RecognitionHub />
    </Shell>
  );
}
