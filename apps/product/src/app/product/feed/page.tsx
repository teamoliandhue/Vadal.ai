/* Company feed — the full feed section (reached from Home's "View all updates"). */
import { Shell } from "../shell";
import { Feed } from "../home/Feed";

export default function FeedPage() {
  return (
    <Shell active="Feed" breadcrumb="Feed">
      <div className="mx-auto w-full max-w-[720px]">
        <Feed />
      </div>
    </Shell>
  );
}
