"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { listening } from "@/lib/content";
import { isStill } from "@/lib/motion";

/* The record. Cover art on the label, the vinyl pressed in the cover's own
   colours, and the 30-second preview Apple attaches to the song.

   Rest a pointer on it and it spins up and plays; take the pointer away and it
   winds down and stops. That is the whole control, with two honest fallbacks:
   a browser will not let a page make sound until the visitor has clicked or
   typed on it, so if the hover's play() is refused the disc stays still and a
   click starts it; and on a phone there is no hover, so a tap toggles it.

   The rotation is driven by hand, frame by frame, rather than a CSS
   animation: a turntable does not go from still to 33⅓ in one frame, and the
   velocity easing here is what makes the spin-up and the wind-down read as a
   platter with some mass. Written straight to the element, not through React
   state — sixty renders a second for one transform is not what state is for.

   Under `prefers-reduced-motion` it still turns, on the argument the letter
   fold makes in app/globals.css: this is not decoration in the corner of the
   eye, it is the thing the pointer asked for, it stops the moment the pointer
   leaves, and a record that plays without turning is broken, not calm.
   `?motion=still` holds it still — the sound still plays. */

const RPM = 100 / 3;
const TARGET = (RPM * 360) / 60; /* degrees per second */
/* Fractions of the remaining gap closed per second: fast up, slower down. */
const SPIN_UP = 6;
const WIND_DOWN = 2.4;

/* How loud the record is, as a fraction of the element's full volume, and
   how long it takes to get there and back.

   Apple's previews are the release master, and a modern master is pressed
   hard: this one sits around −6 LUFS with under a decibel of range and long
   runs at 0 dBFS. At full volume through a laptop's speakers the bass drives
   them past what they can do and the sound tears. Half volume is a record
   playing on a desk — and a clip that arrives with a hover should arrive
   quietly anyway. Fading in and out is the same courtesy, and it hides the
   click a hard start or stop would make.

   iOS ignores media volume from a page, so there the clip plays at whatever
   the phone is set to; the fades are simply skipped. */
const LEVEL = 0.5;
const FADE_IN_MS = 500;
const FADE_OUT_MS = 350;

export default function VinylDisc({
  src,
  artwork,
  artworkSet,
  background,
  swirl,
  title,
}: {
  src: string | null;
  artwork: string;
  artworkSet: string;
  /** Hex colours from the catalog, without the `#`. */
  background: string;
  swirl: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const plate = useRef<HTMLSpanElement>(null);
  const motion = useRef({ angle: 0, velocity: 0, target: 0, frame: 0, last: 0 });
  /* Set when a hover's play() was refused, so the click knows to start. */
  const refused = useRef(false);
  /* The fade in flight, so a new one cancels it rather than fighting it. */
  const fade = useRef(0);

  /* Walk the volume to `to` over `ms`, then call `then`. Cancels any fade
     already running; a hover that leaves mid-fade-in starts fading out from
     wherever the level had got to. */
  const fadeTo = (to: number, ms: number, then?: () => void) => {
    const element = audio.current;
    if (!element) return;
    cancelAnimationFrame(fade.current);
    const from = element.volume;
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - began) / ms, 1);
      element.volume = from + (to - from) * t;
      if (t < 1) fade.current = requestAnimationFrame(step);
      else {
        fade.current = 0;
        then?.();
      }
    };
    fade.current = requestAnimationFrame(step);
  };

  const tick = (now: number) => {
    const m = motion.current;
    /* The first frame's timestamp can sit at or before the performance.now()
       that started the loop, so dt is clamped at zero — and the loop is kept
       alive by the target, not the velocity, or a zero first step would end
       it before it had begun. */
    const dt = Math.min(Math.max(now - m.last, 0) / 1000, 0.1);
    m.last = now;
    const rate = m.target > m.velocity ? SPIN_UP : WIND_DOWN;
    m.velocity += (m.target - m.velocity) * Math.min(rate * dt, 1);
    if (m.target === 0 && m.velocity < 2) m.velocity = 0;
    m.angle = (m.angle + m.velocity * dt) % 360;
    if (plate.current) plate.current.style.transform = `rotate(${m.angle}deg)`;
    m.frame = m.velocity > 0 || m.target > 0 ? requestAnimationFrame(tick) : 0;
  };

  const spin = (on: boolean) => {
    const m = motion.current;
    m.target = on && !isStill() ? TARGET : 0;
    if (!m.frame && m.target > 0) {
      m.last = performance.now();
      m.frame = requestAnimationFrame(tick);
    }
  };

  const player = () => {
    if (!audio.current && src) {
      const element = new Audio(src);
      element.preload = "none";
      element.addEventListener("play", () => setPlaying(true));
      element.addEventListener("pause", () => setPlaying(false));
      element.addEventListener("ended", () => {
        element.currentTime = 0;
        setPlaying(false);
      });
      audio.current = element;
    }
    return audio.current;
  };

  /** True if sound is now going; false if the browser wants a gesture first. */
  const start = async () => {
    const element = player();
    if (!element) return false;
    cancelAnimationFrame(fade.current);
    if (element.paused) element.volume = 0;
    try {
      await element.play();
      refused.current = false;
      fadeTo(LEVEL, FADE_IN_MS);
      return true;
    } catch {
      refused.current = true;
      return false;
    }
  };
  /* Fade, then pause — unless the element is already paused (the clip ended,
     the tab was hidden), in which case there is nothing to fade. `now` skips
     the fade for the unmount, where there is no next frame to fade in. */
  const stop = (now = false) => {
    const element = audio.current;
    if (!element || element.paused) return;
    if (now) {
      cancelAnimationFrame(fade.current);
      element.pause();
      return;
    }
    fadeTo(0, FADE_OUT_MS, () => element.pause());
  };

  /* The disc follows the sound, not the pointer: it turns while the clip is
     going and winds down when it stops, whichever of the four ways it stopped. */
  useEffect(() => {
    spin(playing);
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onVisibility = () => document.hidden && stop();
    document.addEventListener("visibilitychange", onVisibility);
    const m = motion.current;
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop(true);
      if (m.frame) cancelAnimationFrame(m.frame);
    };
  }, []);

  const onEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    void start();
  };
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    stop();
  };
  /* A tap, a keyboard press, or the click that a refused hover was waiting
     for. A mouse that is already hearing the clip and clicks anyway gets the
     toggle a pressed button promises. */
  const onClick = () => {
    const element = audio.current;
    const going = element && !element.paused && element.volume > 0 && !refused.current;
    if (going) stop();
    else void start();
  };

  const { play, stop: stopLabel, seconds } = listening.preview;
  /* token-exempt: the cover's own colours, read from the catalog */
  const colours = {
    "--disc-bg": `#${background}`,
    "--disc-swirl": `#${swirl}`,
  } as CSSProperties;

  return (
    <button
      type="button"
      className="vinyl"
      style={colours}
      data-playing={playing || undefined}
      disabled={!src}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onClick}
      aria-pressed={playing}
      aria-label={
        src
          ? playing
            ? `${stopLabel} preview of ${title}`
            : `${play} ${seconds} seconds of ${title}`
          : `${title} — ${listening.noPreview}`
      }
    >
      <span className="vinyl-plate" ref={plate} aria-hidden="true">
        <span className="vinyl-grooves" />
        <img
          className="vinyl-label"
          src={artwork}
          srcSet={artworkSet}
          /* token-exempt: media condition, same as @media — CSS vars don't apply */
          sizes="72px"
          alt=""
          width={72}
          height={72}
          decoding="async"
          draggable={false}
        />
        <span className="vinyl-spindle" />
      </span>
      <span className="vinyl-sheen" aria-hidden="true" />
    </button>
  );
}
