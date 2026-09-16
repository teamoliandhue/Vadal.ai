import { Shell } from "../shell";
import { HelpHub } from "./HelpHub";

export default function HelpPage() {
  return (
    <Shell active="SmartWork" breadcrumb="SmartWork">
      <HelpHub />
    </Shell>
  );
}
