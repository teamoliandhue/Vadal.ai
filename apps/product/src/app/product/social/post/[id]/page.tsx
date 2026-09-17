/* A post on its own page — the full view. The id may be a post the person wrote
   (kept in their browser), so the client resolves it and owns the not-found. */
import { Shell } from "../../../shell";
import { PostView } from "./PostView";

export default async function PostRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell active="Social" breadcrumb="Post" pane="split">
      <PostView id={id} />
    </Shell>
  );
}
