/* Rewards — what points are spent on (Kudos › Rewards). */
import { Shell } from "../../shell";
import { Rewards } from "./Rewards";

export default function RewardsPage() {
  return (
    <Shell active="Kudos" breadcrumb="Rewards">
      <Rewards />
    </Shell>
  );
}
