import { Shell } from "../shell";
import { HelpHub } from "./HelpHub";

export default function HelpPage() {
  return (
    <Shell active="One-to-One Help" breadcrumb="One-to-One Help">
      <HelpHub />
    </Shell>
  );
}
