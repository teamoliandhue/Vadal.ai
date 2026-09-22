import { Shell } from "../shell";
import { HelpHub } from "./HelpHub";

export default function ICarePage() {
  return (
    <Shell active="iCare" breadcrumb="iCare">
      <HelpHub />
    </Shell>
  );
}
