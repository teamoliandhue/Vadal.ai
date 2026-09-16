import { Shell } from "../shell";
import { SurveysHub } from "./SurveysHub";

export default function SurveysPage() {
  return (
    <Shell active="Pulse" breadcrumb="Pulse">
      <SurveysHub />
    </Shell>
  );
}
