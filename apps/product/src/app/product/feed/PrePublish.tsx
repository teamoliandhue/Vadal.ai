"use client";
/* The soft rejection — what the author sees when the pre-publish check has
   something to say. It speaks about how the post might land, shows the exact
   words or details it means, and always leaves the author a way forward:
   take a suggestion, edit, send it to a person, or (for a nudge) post anyway. */
import * as React from "react";
import Link from "next/link";
import { ImageOff, ShieldCheck } from "lucide-react";
import { Badge, Button } from "@vadal/design-system";
import type { PostCheck } from "@/lib/ai/engines/moderation";

export function CheckPanel({
  check, onEdit, onPostAnyway, onSendForReview, onRemoveDetails, onCalmer, onOtherPhoto,
}: {
  check: PostCheck;
  onEdit: () => void;
  onPostAnyway: () => void;
  onSendForReview: () => void;
  onRemoveDetails: () => void;
  onCalmer: () => void;
  onOtherPhoto: () => void;
}) {
  const hold = check.verdict === "hold";
  const photo = check.findings.some((f) => f.kind === "photo");
  const words = check.findings.filter((f) => f.match);
  const btn = "min-h-[44px] lg:min-h-0";

  return (
    <div role="alert" className="ai-pop rounded-2xl border border-[var(--ai-border)] bg-[var(--ai-surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-[18px] w-[18px] text-[var(--ai-accent)]" />
        <span className="text-[14px] font-bold text-ink">{check.title}</span>
        {hold && <Badge tone="warning" size="sm">Needs a person</Badge>}
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{check.body}</p>

      {words.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-faint">{check.findings.every((f) => f.kind === "personal-data") ? "Found" : "The words"}</span>
          {words.map((f, i) => (
            <span key={i} className="rounded-md bg-card px-2 py-0.5 font-mono text-[12px] text-ink ring-1 ring-[var(--ai-border)]">{f.match}</span>
          ))}
        </div>
      )}

      {check.safety && (
        <p className="mt-2.5 rounded-xl bg-card px-3 py-2 text-[13px] leading-snug text-ink ring-1 ring-[var(--ai-border)]">
          If this is about a hazard, you can also{" "}
          <Link href="/product/cases" className="font-semibold text-[var(--purple)] hover:underline">raise it privately in Flow</Link>
          {" "}— it goes straight to the people who can fix it.
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {check.redacted && <Button variant="brand" size="sm" className={btn} onClick={onRemoveDetails}>Take the details out</Button>}
        {check.calmer && <Button variant="brand" size="sm" className={btn} onClick={onCalmer}>Suggest a calmer version</Button>}
        {photo && <Button variant="brand" size="sm" className={btn} leadingIcon={<ImageOff className="h-3.5 w-3.5" />} onClick={onOtherPhoto}>Use another photo</Button>}
        <Button variant="secondary" size="sm" className={btn} onClick={onEdit}>Edit post</Button>
        {hold
          ? <Button variant="tertiary" size="sm" className={btn} onClick={onSendForReview}>Send for review</Button>
          : <Button variant="tertiary" size="sm" className={btn} onClick={onPostAnyway}>Post anyway</Button>}
      </div>
    </div>
  );
}
