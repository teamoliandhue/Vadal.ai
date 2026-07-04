import { Shell } from "../shell";
import { CampaignsHub } from "./CampaignsHub";

export default function CampaignsPage() {
  return (
    <Shell active="Campaigns" breadcrumb="Campaigns">
      <CampaignsHub />
    </Shell>
  );
}
