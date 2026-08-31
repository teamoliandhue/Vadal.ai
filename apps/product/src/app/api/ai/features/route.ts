/**
 * AI feature status — what the brief asks for, and what is actually wired.
 *
 * A build-time-verifiable answer to "are the AI features implemented?", rather
 * than a claim in a document. Every entry resolves to a real export or shows up
 * as missing.
 */
import { verifyFeatures } from "@/lib/ai/verify";
import { checkTriage } from "@/lib/ai/engines/support";
import { FEATURES } from "@/lib/ai/features";
import { providerStatus } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const detail = new URL(request.url).searchParams.get("detail") === "1";
  const v = verifyFeatures();
  /* Crisis matching is checked here rather than in a test file nobody runs. A
     miss is not a bug report — it is somebody who asked for help and got the
     work-from-home policy. It fails this endpoint like anything else. */
  const t = checkTriage();
  return Response.json(
    {
      provider: providerStatus(),
      ...v,
      triage: t,
      ...(detail ? { features: FEATURES } : {}),
    },
    { status: v.ok && t.ok ? 200 : 500 },
  );
}
