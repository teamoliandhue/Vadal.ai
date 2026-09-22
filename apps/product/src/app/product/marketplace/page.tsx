/* Marketplace — where points are spent (My space › Marketplace).

   Its own section rather than a tab inside Kudos: earning recognition and
   spending what it is worth are two different errands, and the second one is
   the employee's own. */
import { Shell } from "../shell";
import { Marketplace } from "./Marketplace";

export default function MarketplacePage() {
  return (
    <Shell active="Marketplace" breadcrumb="Marketplace">
      <Marketplace />
    </Shell>
  );
}
