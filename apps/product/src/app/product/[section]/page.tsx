/* Catch-all for not-yet-built nav sections (analytics · surveys · sentiment ·
   listening · recognition · campaigns · managers · cases · knowledge · settings).
   Static siblings (home, feed) and /product (Pulse) take precedence. */
import { notFound } from "next/navigation";
import { Shell } from "../shell";
import { SectionStub } from "../SectionStub";
import { SECTIONS } from "../sections";

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
