import { Shell } from "../shell";
import { CasesHub } from "./CasesHub";

export default function CasesPage() {
  return (
    <Shell active="Cases" breadcrumb="Cases">
      <CasesHub />
    </Shell>
  );
}
