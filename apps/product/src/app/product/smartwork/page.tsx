import { Shell } from "../shell";
import { SmartWorkHub } from "./SmartWorkHub";

export default function SmartWorkPage() {
  return (
    <Shell active="SmartWork" breadcrumb="SmartWork">
      <SmartWorkHub />
    </Shell>
  );
}
