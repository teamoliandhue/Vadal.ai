/* Catch-all for not-yet-built nav sections. Every destination now has a real
   route, so SECTIONS is empty — and unknown paths must be a real 404.

   `notFound()` alone was not enough: /product has a loading.tsx, so the
   response streamed with a 200 before the page could say "not found".
   Declaring the known params and turning dynamicParams off makes the router
   answer 404 before anything renders. Add an entry to SECTIONS to stub a
   section; it becomes a static route here. */
import { notFound } from "next/navigation";
import { Shell } from "../shell";
import { SectionStub } from "../SectionStub";
import { SECTIONS } from "../sections";

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const meta = SECTIONS[section];
  if (!meta) notFound();
  const Icon = meta.Icon;
  return (
    <Shell active={meta.label} breadcrumb={meta.label}>
      <SectionStub
        icon={<Icon className="h-7 w-7" strokeWidth={1.8} />}
        title={meta.label}
        tagline={meta.tagline}
        bullets={meta.bullets}
        ask={meta.ask}
      />
    </Shell>
  );
}
