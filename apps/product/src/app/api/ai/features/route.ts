/**
 * AI feature status — what the brief asks for, and what is actually wired.
 *
 * A build-time-verifiable answer to "are the AI features implemented?", rather
 * than a claim in a document. Every entry resolves to a real export or shows up
 * as missing.
 */
import { verifyFeatures } from "@/lib/ai/verify";
import { FEATURES } from "@/lib/ai/features";
import { providerStatus } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const detail = new URL(request.url).searchParams.get("detail") === "1";
  const v = verifyFeatures();
  return Response.json(
    {
      provider: providerStatus(),
      ...v,
      ...(detail ? { features: FEATURES } : {}),
    },
    { status: v.ok ? 200 : 500 },
  );
}
