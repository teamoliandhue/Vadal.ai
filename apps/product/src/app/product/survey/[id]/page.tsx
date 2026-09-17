/* A survey, from the respondent's side — one question at a time. Open to
   everyone; the section key is Home so the chrome is the person's own space. */
import { Shell } from "../../shell";
import { Respond } from "./Respond";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell active="Home" breadcrumb="Survey">
      <Respond id={id} />
    </Shell>
  );
}
