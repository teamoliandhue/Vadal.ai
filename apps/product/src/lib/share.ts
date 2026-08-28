/**
 * Getting a caption out of Vadal and into a post.
 *
 * The gap this closes: we write the hard part — something a person will put
 * their own name to — and then hand them a clipboard. Copy, switch app, find
 * the post, paste, publish. Four steps in someone else's product, which is
 * exactly where corporate advocacy programmes die.
 *
 * None of this needs the platform APIs the brief flags as risky, and none of it
 * posts on anyone's behalf. Every path ends with the person pressing publish in
 * the platform's own composer.
 *
 * WHAT EACH PLATFORM ACTUALLY ALLOWS — worth stating, because the four are
 * usually treated as interchangeable and they are not:
 *
 *   Web Share API   the whole caption, straight into the OS share sheet. The
 *                   real answer on a phone, and this product is built for phones.
 *   X               pre-filled text via the intent URL. Genuinely works.
 *   LinkedIn        NO pre-filled text — they removed it. The best available is
 *                   to put the caption on the clipboard and open the composer.
 *   Facebook        no pre-filled text either; `quote` is deprecated.
 *   Instagram       cannot be posted to from a browser at all.
 *
 * Designing one "Copy caption" button for all four pretends they are the same.
 * These helpers let the UI tell the truth per platform instead.
 */
import type { Platform } from "./ai/engines/advocacy";

export type ShareRoute =
  /** OS share sheet — the caption travels with it. One tap. */
  | { kind: "web-share" }
  /** The platform accepts the caption in the URL. */
  | { kind: "intent"; url: string; label: string }
  /** Caption goes to the clipboard, then we open their composer. */
  | { kind: "copy-then-open"; url: string; label: string; because: string }
  /** No web path exists. Say so rather than opening something useless. */
  | { kind: "copy-only"; because: string };

/** True once the browser is known to support a share sheet. Client-only. */
export function canWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/**
 * How to get this caption onto this platform, on this device.
 *
 * `webShare` is passed in rather than read here so the caller can resolve it in
 * an effect — reading `navigator` during render would differ between server and
 * client and break hydration.
 */
export function routeFor(platform: Platform, caption: string, postUrl: string | undefined, webShare: boolean): ShareRoute {
  // The share sheet beats every platform-specific path when it exists: the
  // caption goes with it and the person picks the app they were going to use.
  if (webShare) return { kind: "web-share" };

  switch (platform) {
    case "X":
      return {
        kind: "intent",
        label: "Post on X",
        url: `https://x.com/intent/post?text=${encodeURIComponent(caption)}${postUrl ? `&url=${encodeURIComponent(postUrl)}` : ""}`,
      };

    case "LinkedIn":
      return {
        kind: "copy-then-open",
        label: "Copy & open LinkedIn",
        url: postUrl
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
          : "https://www.linkedin.com/feed/?shareActive=true",
        because: "LinkedIn doesn't accept a pre-written caption from another site, so it's on your clipboard — paste it when the composer opens.",
      };

    case "Facebook":
      return {
        kind: "copy-then-open",
        label: "Copy & open Facebook",
        url: postUrl
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
          : "https://www.facebook.com/",
        because: "Facebook stopped accepting pre-written captions from other sites, so it's on your clipboard — paste it when the composer opens.",
      };

    case "Instagram":
    default:
      return {
        kind: "copy-only",
        because: "Instagram can't be posted to from a browser. The caption is on your clipboard — it'll be there when you open the app.",
      };
  }
}

/** Open a share destination without handing the target window a reference back. */
export function openShare(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ── declining a pick ──────────────────────────────────────────────
   A one-way stream of asks with no way to say no is corrosive, and the
   decline is the most useful signal HR could collect: which posts do our
   own people not want their name on? Reasons are deliberately blunt and
   few — a long form would just stop anyone answering. */

export const DECLINE_REASONS = [
  { key: "not-mine", label: "Not my area" },
  { key: "too-corporate", label: "Reads too corporate" },
  { key: "not-now", label: "Not right now" },
  { key: "never", label: "I'd rather not share work posts at all" },
] as const;

export type DeclineReason = (typeof DECLINE_REASONS)[number]["key"];
