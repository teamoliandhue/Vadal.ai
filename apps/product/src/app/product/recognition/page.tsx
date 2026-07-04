import { Shell } from "../shell";
import { RecognitionHub } from "./RecognitionHub";

export default function RecognitionPage() {
  return (
    <Shell active="Recognition" breadcrumb="Recognition">
      <RecognitionHub />
    </Shell>
  );
}
