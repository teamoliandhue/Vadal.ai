/* Wallet — your points, how you earned them, and your badges (Kudos › Wallet). */
import { Shell } from "../../shell";
import { Wallet } from "./Wallet";

export default function WalletPage() {
  return (
    <Shell active="Kudos" breadcrumb="Wallet">
      <Wallet />
    </Shell>
  );
}
