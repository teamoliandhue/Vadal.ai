import { Shell } from "../shell";
import { HelpHub } from "./HelpHub";

export default function SupportPage() {
  return (
    <Shell active="Support" breadcrumb="Support">
      <HelpHub />
    </Shell>
  );
}
