import { Shell } from "../shell";
import { LaunchHub } from "./LaunchHub";

export default function LaunchPage() {
  return (
    <Shell active="Launch" breadcrumb="Launch">
      <LaunchHub />
    </Shell>
  );
}
