"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { LiveStory } from "@/lib/instagram";
import StoryViewer from "./StoryViewer";

/* The ring Instagram draws around an avatar when something is live, around the
   portrait on home — and the reel it opens (components/StoryViewer.tsx). The
   circle inside it is still rendered on the server by components/Desk.tsx and
   handed here as children, so what this adds to the client is the question of
   whether there is a story, and the overlay once someone asks to see it.

   Asked after the page rather than built into it: the page is held for an hour
   and this answer is good for five minutes (app/api/instagram/story says why).
   Which means the first paint is always the ringless portrait and the ring
   arrives a moment behind it — so it dissolves in rather than appearing
   between two frames. Opacity only, nothing travelling, which is why the
   reduced-motion block in app/globals.css lets it keep its time.

   With nothing live — most hours of most days, and every environment without
   a token — this is the plain span the portrait has always sat in, and the
   page is the page it was before this file existed. */

export default function StoryRing({ children }: { children: ReactNode }) {
  const [story, setStory] = useState<LiveStory | null>(null);
  const [open, setOpen] = useState(false);
  const ringRef = useRef<HTMLButtonElement | null>(null);

  /* Closing the reel puts focus back on the ring that opened it, the way the
     gallery's lightbox hands it back to the tile — otherwise a keyboard is
     returned to the top of the document and has to walk the whole page again.
     After the overlay has gone, so there is something to focus. */
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => ringRef.current?.focus());
  }, []);

  useEffect(() => {
    let live = true;
    fetch("/api/instagram/story")
      .then((response) => (response.ok ? (response.json() as Promise<LiveStory | null>) : null))
      .catch(() => null)
      .then((answer) => {
        if (live) setStory(answer?.frames?.length ? answer : null);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!story) return <span className="profile-portrait">{children}</span>;

  const count = story.frames.length;

  return (
    <>
      <button
        ref={ringRef}
        className="profile-portrait profile-portrait--live"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        /* The ring is the only thing saying this is now a control, and a ring
           is not something a screen reader can see. The count is the one fact
           worth saying out loud; the time is not, because the reel says it
           per frame and in the visitor's own clock. */
        aria-label={
          count === 1
            ? "A story is live — open it"
            : `${count} stories are live — open them`
        }
      >
        {children}
      </button>
      {open && <StoryViewer story={story} onClose={close} />}
    </>
  );
}
