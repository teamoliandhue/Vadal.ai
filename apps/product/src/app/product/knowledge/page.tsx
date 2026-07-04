import { Shell } from "../shell";
import { KnowledgeHub } from "./KnowledgeHub";

export default function KnowledgePage() {
  return (
    <Shell active="Knowledge" breadcrumb="Knowledge">
      <KnowledgeHub />
    </Shell>
  );
}
