import { Shell } from "../shell";
import { FlowHub } from "./FlowHub";

export default function FlowPage() {
  return (
    <Shell active="Flow" breadcrumb="Flow">
      <FlowHub />
    </Shell>
  );
}
