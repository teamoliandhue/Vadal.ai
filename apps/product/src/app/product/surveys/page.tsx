import { Shell } from "../shell";
import { SurveysHub } from "./SurveysHub";

export default function SurveysPage() {
  return (
    <Shell active="Surveys" breadcrumb="Surveys">
      <SurveysHub />
    </Shell>
  );
}
