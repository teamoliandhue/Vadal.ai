/* Marketplace — what points are spent on (Kudos › Marketplace).
   The route keeps its /rewards path: it is linked from the digest, the tour and
   the marketing site, and a working link is worth more than a tidy one. */
import { Shell } from "../../shell";
import { Marketplace } from "./Marketplace";

export default function MarketplacePage() {
  return (
    <Shell active="Kudos" breadcrumb="Marketplace">
      <Marketplace />
    </Shell>
  );
}
