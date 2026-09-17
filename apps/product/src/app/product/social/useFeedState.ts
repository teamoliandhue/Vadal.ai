"use client";
/* Everything a person has done to posts — reactions, votes, bookmarks, comments,
   RSVPs and their own posts — persisted, and the function that folds it into a
   seed item for display.

   It used to live inside FeedHub. It moved out when communities arrived: a
   post you reacted to in a community room is the same post in the company
   stream, so both screens have to read and write one store. */
import * as React from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import type { Comment, FeedItem, ReactionEmoji } from "@/lib/feed";
import { useMe } from "../useSession";
import { toast } from "../Toaster";
import type { DisplayItem } from "./parts";

export function useFeedState() {
  const me = useMe();
  const [mine, setMine] = usePersistentState<FeedItem[]>("vadal:feed2-mine", []);
  const [reacts, setReacts] = usePersistentState<Record<string, ReactionEmoji>>("vadal:feed2-reacts", {});
  const [votes, setVotes] = usePersistentState<Record<string, string>>("vadal:feed2-votes", {});
  const [bookmarks, setBookmarks] = usePersistentState<string[]>("vadal:feed2-bookmarks", []);
  const [myComments, setMyComments] = usePersistentState<Record<string, Comment[]>>("vadal:feed2-comments", {});
  const [going, setGoing] = usePersistentState<string[]>("vadal:feed2-going", []);
  const [likedC, setLikedC] = usePersistentState<string[]>("vadal:feed2-likedc", []);
  const [acks, setAcks] = usePersistentState<Record<string, string>>("vadal:feed2-acks", {});
  const [accepted, setAccepted] = usePersistentState<Record<string, string>>("vadal:feed2-answers", {});

  const toDisplay = React.useCallback((it: FeedItem): DisplayItem => {
    const myReaction = reacts[it.id];
    const reactions = { ...it.reactions };
    if (myReaction) reactions[myReaction] = (reactions[myReaction] ?? 0) + 1;
    const comments = [...it.comments, ...(myComments[it.id] ?? [])].map((cm) => ({
      ...cm, likes: cm.likes + (likedC.includes(cm.id) ? 1 : 0),
    }));
    return {
      ...it, reactions, myReaction,
      myVote: votes[it.id],
      bookmarked: bookmarks.includes(it.id),
      going: going.includes(it.id),
      comments,
      commentCount: comments.length,
      ackedOn: acks[it.id],
      acceptedId: accepted[it.id] ?? it.question?.acceptedId,
    };
  }, [reacts, votes, bookmarks, myComments, going, likedC, acks, accepted]);

  const react = (id: string, e: ReactionEmoji) =>
    setReacts((p) => { const n = { ...p }; if (n[id] === e) delete n[id]; else n[id] = e; return n; });
  const bookmark = (id: string) =>
    setBookmarks((p) => { const on = p.includes(id); if (!on) toast("Saved to bookmarks 🔖"); return on ? p.filter((x) => x !== id) : [...p, id]; });
  const vote = (id: string, optionId: string) =>
    setVotes((p) => (p[id] ? p : { ...p, [id]: optionId }));
  const rsvp = (id: string) =>
    setGoing((p) => { const on = p.includes(id); if (!on) toast("You're going 🎉"); return on ? p.filter((x) => x !== id) : [...p, id]; });
  const likeComment = (cid: string) =>
    setLikedC((p) => (p.includes(cid) ? p.filter((x) => x !== cid) : [...p, cid]));
  const addComment = (id: string, text: string) => {
    const cm: Comment = { id: `c-${Date.now()}`, author: { name: me.fullName, role: "You", img: me.img }, text, time: "now", likes: 0 };
    setMyComments((p) => ({ ...p, [id]: [...(p[id] ?? []), cm] }));
  };
  const addMine = (item: FeedItem) => setMine((m) => [item, ...m]);
  /* Must-read: confirming is a record, so it can't be un-confirmed from the feed. */
  const acknowledge = (id: string) => {
    setAcks((p) => (p[id] ? p : { ...p, [id]: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }));
    toast("Confirmed — thanks for reading it");
  };
  /* Only the person who asked can choose the answer; the screen enforces who sees the button. */
  const acceptAnswer = (postId: string, commentId: string) =>
    setAccepted((p) => { const n = { ...p }; if (n[postId] === commentId) delete n[postId]; else n[postId] = commentId; return n; });
  /* the link is real now that a post has a page of its own */
  const share = (id: string) => {
    const url = `${window.location.origin}/product/social/post/${id}`;
    navigator.clipboard?.writeText(url).then(() => toast("Post link copied ✓"), () => toast("Could not copy — the link is in the address bar of the full view"));
    if (!navigator.clipboard) toast("Open the full view to copy its link");
  };
  const menu = (label: string) => toast(label === "Report" ? "Reported — thank you" : `${label} ✓`);

  return { mine, toDisplay, react, bookmark, vote, rsvp, likeComment, addComment, addMine, share, menu, acknowledge, acceptAnswer };
}

/* Shared ordering helpers. */
export function score(it: FeedItem) {
  const reacts = Object.values(it.reactions).reduce((s, n) => s + (n ?? 0), 0);
  return reacts + it.comments.length * 3 + it.views / 200;
}
/* relative "2h"/"1d"/"28m"/"now" → minutes ago, for the Recent sort */
export function timeMins(t: string): number {
  if (t === "now") return 0;
  const m = /^(\d+)\s*([mhd])$/.exec(t);
  if (!m) return 1e9;
  const n = +m[1];
  return m[2] === "m" ? n : m[2] === "h" ? n * 60 : n * 1440;
}
