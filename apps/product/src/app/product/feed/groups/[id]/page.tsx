/* One community. The id may belong to a room the person made, which lives in
   their browser — so the server cannot 404 it; the client resolves it and shows
   its own not-found state. */
import { Shell } from "../../../shell";
import { GroupPage } from "./GroupPage";

export default async function GroupRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell active="Social" breadcrumb="Communities" pane="split">
      <GroupPage id={id} />
    </Shell>
  );
}
