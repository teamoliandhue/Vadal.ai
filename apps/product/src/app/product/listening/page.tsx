import { Shell } from "../shell";
import { ListeningHub } from "./ListeningHub";

export default function ListeningPage() {
  return (
    <Shell active="Always-on listening" breadcrumb="Always-on listening">
      <ListeningHub />
    </Shell>
  );
}
