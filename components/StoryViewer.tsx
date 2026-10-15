"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { photography } from "@/lib/content";
import type { LiveStory } from "@/lib/instagram";

/* The reel, in front of the page: what opens when the ring around the
   portrait is tapped (components/StoryRing.tsx).

   It is Instagram's own viewer, in this site's paper and ink — segments along
   the top, one per frame, filling as the frame plays; a tap on the right for
   the next and on the left for the one before; press and hold to stop the
   clock. The scrim, the close control and the way focus is handled are
   components/Gallery.tsx's lightbox, because a modal on this site should not
   behave two different ways depending on which one a visitor opened.

   Two things about it are worth knowing.

   The first is that a frame is often a photograph of a video. Instagram
   withholds the video file on anything carrying someone else's copyright,
   which in practice is anything with a song on it — lib/instagram.ts has the
   count. When that happens there is a poster frame and nothing else, so the
   frame is held like a still and the link out to Instagram, which is on
   screen the whole time, is where the rest of it lives. Nothing here pretends
   otherwise.

   The second is the clock. A reel that advances on its own is a carousel, and
   a carousel that cannot be stopped is a WCAG failure (2.2.2) before it is a
   taste question — so it can always be held, and under prefers-reduced-motion
   it does not run at all: the segments become a position rather than a timer
   and the reel waits to be tapped through. That is the better reading of the
   preference anyway. Someone who has asked for less movement has not asked
   for a slideshow they cannot catch. */

/** Instagram's own five seconds, for a frame with no video to set the pace. */
const FRAME_SECONDS = 5;

/** Past this, a press is a hold rather than a tap, and letting go of it does
    not step the reel. Without the distinction every pause would advance on
    release, which is the opposite of what holding a frame is asking for. */
const HOLD_MS = 250;

/** "2h", in the visitor's clock rather than the server's — which is the whole
    reason the timestamp travels as an ISO string and is read here. */
const ago = (iso: string) => {
  const then = new Date(iso).valueOf();
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round(minutes / 60)}h`;
};

export default function StoryViewer({
  story,
  onClose,
}: {
  story: LiveStory;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  /* How far through the current frame, 0 to 1 — the width of the lit segment,
     and nothing else depends on it. */
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [failed, setFailed] = useState(false);
  /* Set on mount from the media query rather than read in CSS, because what
     the preference changes here is behaviour — whether there is a clock at
     all — and not the look of anything. */
  const [still, setStill] = useState(true);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const elapsed = useRef(0);
  const span = useRef(FRAME_SECONDS * 1000);
  const pressed = useRef(0);

  const frame = story.frames[index];
  const last = index === story.frames.length - 1;

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const next = useCallback(() => {
    /* The end of the reel is the end of the overlay, the way it is on
       Instagram when there is no next account to roll into. */
    if (index === story.frames.length - 1) onClose();
    else setIndex(index + 1);
  }, [index, story.frames.length, onClose]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  /* A tap steps the reel; a hold does not, however it ends. Both arrive as a
     click, so the only thing telling them apart is how long the press was —
     except from a keyboard, where Enter and Space arrive as a click with no
     pointer behind them at all (`detail` 0) and are always a step. */
  const tap = (step: () => void) => (event: { detail: number }) => {
    if (event.detail === 0 || performance.now() - pressed.current <= HOLD_MS) step();
  };

  /* Every frame starts from nothing: a fresh clock, a fresh span — a video
     replaces the span below once it knows its own length — and no failure
     carried over from the frame before. */
  useEffect(() => {
    elapsed.current = 0;
    span.current = FRAME_SECONDS * 1000;
    setProgress(0);
    setFailed(false);
  }, [index]);

  /* The clock. Counted in rather than animated in CSS, because the same
     number has to survive being held and resumed, and because a video's
     length is not known until the video says so. */
  useEffect(() => {
    if (still || held || failed) return;
    let raf = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current += now - previous;
      previous = now;
      const ratio = Math.min(1, elapsed.current / span.current);
      setProgress(ratio);
      if (ratio >= 1) {
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, held, still, failed, next]);

  /* A held reel holds its video too, or the sound carries on under a stopped
     clock and the two disagree about where the frame is. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (held || still) video.pause();
    else void video.play().catch(() => {});
  }, [held, still, index]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "ArrowRight":
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
          event.preventDefault();
          back();
          break;
        case "Tab": {
          /* Focus stays in the dialog. Unlike the gallery's lightbox there is
             more than one thing in here worth reaching — the way out to
             Instagram among them — so Tab cycles rather than being pinned. */
          const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
            "button, a[href]"
          );
          if (!focusable?.length) return;
          const list = Array.from(focusable);
          const at = list.indexOf(document.activeElement as HTMLElement);
          const to = event.shiftKey ? at - 1 : at + 1;
          event.preventDefault();
          list[(to + list.length) % list.length].focus();
          break;
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, next, back]);

  if (!frame) return null;

  const when = ago(frame.timestamp);

  return (
    <div
      ref={dialogRef}
      className="story"
      role="dialog"
      aria-modal="true"
      aria-label={`Stories from @${photography.handle}, ${index + 1} of ${story.frames.length}`}
      onClick={onClose}
    >
      <button ref={closeRef} className="lightbox-close" type="button" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div
        className="story-frame"
        onClick={(event) => event.stopPropagation()}
        /* Press and hold stops the clock, which is Instagram's gesture and
           WCAG 2.2.2's requirement at the same time. On a pointer that leaves
           the frame mid-press the hold is let go rather than stuck. */
        onPointerDown={() => {
          pressed.current = performance.now();
          setHeld(true);
        }}
        onPointerUp={() => setHeld(false)}
        onPointerLeave={() => setHeld(false)}
        onPointerCancel={() => setHeld(false)}
        data-held={held ? "" : undefined}
      >
        <div className="story-segments" aria-hidden="true">
          {story.frames.map((each, i) => (
            <span key={each.id} className="story-segment">
              <span
                className="story-segment-fill"
                /* token-exempt: the clock's own position, which is a number
                   and cannot be a token. With no clock running the frame in
                   hand is simply lit, so the row reads as a place in the reel
                   rather than a timer that has stopped. */
                style={{
                  scale: `${
                    i < index ? 1 : i === index ? (still ? 1 : progress) : 0
                  } 1`,
                }}
              />
            </span>
          ))}
        </div>

        <p className="story-when">
          {when && <span className="story-ago">{when}</span>}
          <a
            className="story-out"
            href={frame.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Open on Instagram <span aria-hidden="true">↗</span>
          </a>
        </p>

        {failed ? (
          /* A story that expired between the page loading and the ring being
             tapped, or a frame the CDN would not serve. Saying so beats a
             black rectangle, and the link above is still the way through. */
          <p className="story-gone">This story has gone. It may have expired while the page was open.</p>
        ) : frame.video ? (
          <video
            ref={videoRef}
            key={frame.video}
            className="story-media"
            src={frame.video}
            poster={frame.src}
            playsInline
            autoPlay
            /* Muted because a browser will refuse to play a reel with sound
               that it did not watch someone ask for, and a refused video is a
               frozen poster with a running clock. The sound is on Instagram,
               a tap away, and the link says so. */
            muted
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              if (Number.isFinite(length) && length > 0) span.current = length * 1000;
            }}
            onEnded={next}
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            key={frame.src}
            className="story-media"
            src={frame.src}
            alt=""
            onError={() => setFailed(true)}
          />
        )}

        {/* The tap zones, over the frame: Instagram's proportions, a third
            back and the rest forward. Real buttons rather than bare divs, so
            the reel is as navigable by keyboard and screen reader as it is by
            thumb — they carry the only labels either one gets. */}
        <button className="story-tap story-tap--back" type="button" onClick={tap(back)} aria-label="Previous story" />
        <button
          className="story-tap story-tap--next"
          type="button"
          onClick={tap(next)}
          aria-label={last ? "Close stories" : "Next story"}
        />
      </div>
    </div>
  );
}
