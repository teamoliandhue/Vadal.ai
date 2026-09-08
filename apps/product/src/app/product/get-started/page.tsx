/* GET STARTED — the product tour (route /product/get-started).
   Under the Vadal.ai nav group. See ./GetStarted for the reasoning. */
import { Shell } from "../shell";
import { GetStarted } from "./GetStarted";

export default function GetStartedPage() {
  return (
    <Shell active="Get Started" breadcrumb="Get Started">
      <GetStarted />
    </Shell>
  );
}
