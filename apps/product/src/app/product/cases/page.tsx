import { Shell } from "../shell";
import { CasesHub } from "./CasesHub";

export default function CasesPage() {
  return (
    <Shell active="Flow" breadcrumb="Flow">
      <CasesHub />
    </Shell>
  );
}
