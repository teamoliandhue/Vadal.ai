/* Company feed — the full feed section, reached from the sidebar (My space › Feed)
   and Home's "View all updates". A Contra-grade community feed on Vadal tokens. */
import { Shell } from "../shell";
import { FeedHub } from "./FeedHub";

export default function FeedPage() {
  return (
    <Shell active="Feed" breadcrumb="Feed">
      <FeedHub />
    </Shell>
  );
}
