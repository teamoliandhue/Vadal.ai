import { Shell } from "../shell";
import { TrustHub } from "./TrustHub";

export default function TrustPage() {
  return (
    <Shell active="Trust" breadcrumb="Trust">
      <TrustHub />
    </Shell>
  );
}
