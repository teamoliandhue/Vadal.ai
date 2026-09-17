import { Shell } from "../shell";
import { LinkHub } from "./LinkHub";

export default function LinkPage() {
  return (
    <Shell active="Link" breadcrumb="Link">
      <LinkHub />
    </Shell>
  );
}
