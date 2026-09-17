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
    };
  }, [reacts, votes, bookmarks, myComments, going, likedC]);

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
  const share = () => toast("Post link copied ✓");
  const menu = (label: string) => toast(label === "Report" ? "Reported — thank you" : `${label} ✓`);

  return { mine, toDisplay, react, bookmark, vote, rsvp, likeComment, addComment, addMine, share, menu };
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
