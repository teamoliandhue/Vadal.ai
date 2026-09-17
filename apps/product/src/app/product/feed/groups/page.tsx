/* Communities — the rooms under Social (My space › Social › Communities). */
import { Shell } from "../../shell";
import { GroupsHub } from "./GroupsHub";

export default function GroupsPage() {
  return (
    <Shell active="Social" breadcrumb="Communities">
      <GroupsHub />
    </Shell>
  );
}
