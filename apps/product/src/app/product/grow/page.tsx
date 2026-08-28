import { Shell } from "../shell";
import { GrowHub } from "./GrowHub";

export default function GrowPage() {
  return (
    <Shell active="Grow" breadcrumb="Grow">
      <GrowHub />
    </Shell>
  );
}
