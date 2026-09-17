/* Alumni — leavers, who would come back, and what the business loses people to (Operations · People). */
import { Shell } from "../shell";
import { AlumniHub } from "./AlumniHub";

export default function AlumniPage() {
  return (
    <Shell active="Alumni" breadcrumb="Alumni">
      <AlumniHub />
    </Shell>
  );
}
