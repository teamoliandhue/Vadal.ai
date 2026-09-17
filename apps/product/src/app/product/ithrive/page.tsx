import { Shell } from "../shell";
import { ThriveHub } from "./ThriveHub";

export default function ThrivePage() {
  return (
    <Shell active="iThrive" breadcrumb="iThrive">
      <ThriveHub />
    </Shell>
  );
}
