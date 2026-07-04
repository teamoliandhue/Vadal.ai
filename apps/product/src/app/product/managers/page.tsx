import { Shell } from "../shell";
import { ManagerHub } from "./ManagerHub";

export default function ManagersPage() {
  return (
    <Shell active="Manager hub" breadcrumb="Manager hub">
      <ManagerHub />
    </Shell>
  );
}
