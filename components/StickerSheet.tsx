"use client";

import {
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { stickers, stickerSrc } from "@/lib/stickers";

/* The desk items, stuck to the Life page.

   Eight die-cut stickers laid over the cards — the controller beside the
   heading, the AirPods on a corner of the map, the rest over the photograph and
   hanging off the bottom edge. Each one can be picked up and put down anywhere
   on the page. Nothing happens when they move, and where they end up is
   forgotten on reload. The one thing a sticker has to say is on its back: hold
   it, and a line in the site's aside hand appears beside it (lib/stickers.ts);
   let go, and it is gone.

   Modelled on the sticker interaction in "Sticker animation/" (the frame pull
   of Tanmay M's reference): a resting sticker sits at a slight angle; the
   pointer over it lifts a corner, showing the paper on the back; picked up it
   scales a touch, its shadow deepens, and it leans into the direction it is
   being dragged; let go, it settles back to its angle.

   Where the pieces live:
   - The peel is CSS (`.sticker-face` / `.sticker-flap` in app/globals.css).
     The face is the image with its corner clipped off; the flap is the
     sticker's own silhouette, filled with paper, reflected across the fold
     line so the missing corner appears folded down onto the front. One
     registered property, --peel, drives both, so hover can transition it.
   - Position is a fraction of the sticker layer, not a pixel. The layer is the
     card grid on a wide screen and a short band above it on a phone, and a
     fraction lands somewhere sensible in either. A sticker that has never been
     moved has no --x/--y at all: the CSS falls back to its resting spot for
     the layout it is in (lib/stickers.ts), so the phone and the desk each get
     their own arrangement without a script deciding which one applies.
   - The lean is a number in degrees the CSS adds to the resting tilt. It
     follows the pointer's horizontal speed and decays to nothing once the
     pointer stops, so a sticker held still hangs straight.
   - The note is a sibling of the sticker, not a child: the sticker clips its
     overflow for the flap, and a caption inside it would be cut. It shares the
     sticker's position variables, so it follows the drag for free. Which side
     it sits on is decided once, at pickup, from where the sticker actually is
     — a sticker in the lower half of the layer (or hanging off it) gets its
     note above, so the page's bottom clip never takes the words.

   Pointer events, captured: one handler set serves mouse, pen and touch, and
   the capture keeps a fast drag attached when the pointer outruns the element.
   `touch-action: none` on the sticker is what stops a phone from scrolling
   instead. Nothing here is focusable — these are decoration that happens to
   move, and the layer is hidden from assistive technology. */

/* How far a sticker may be dragged past the layer's edge, as a fraction of
   the layer. Enough to hang over a card, not enough to lose one. */
const SLACK = 0.06;

/* Lean: degrees per pixel-per-millisecond of horizontal pointer speed, and
   the most it will ever lean. A brisk drag runs at one or two px/ms. */
const LEAN = 9;
const LEAN_MAX = 14;

/* How long after the pointer stops moving the lean lets go. */
const LEAN_REST_MS = 90;

type Spot = { x: number; y: number };

type Side = "above" | "below";

type Drag = {
  id: string;
  /* Pointer offset from the sticker's centre at pickup, so it does not jump
     to the cursor. */
  dx: number;
  dy: number;
  lastX: number;
  lastT: number;
};

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

export default function StickerSheet({ children }: { children: ReactNode }) {
  const layer = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const leanTimer = useRef(0);
  /* Ever-rising stack order: the last sticker touched is on top. */
  const top = useRef(0);

  const [spots, setSpots] = useState<Record<string, Spot>>({});
  const [order, setOrder] = useState<Record<string, number>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("below");
  const [lean, setLean] = useState(0);

  const pickUp = (event: PointerEvent<HTMLDivElement>, id: string) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = event.currentTarget;
    /* The bounding box of a rotated element is bigger than the element, but
       its centre is still the element's centre — which is all we need. */
    const box = el.getBoundingClientRect();
    drag.current = {
      id,
      dx: event.clientX - (box.left + box.width / 2),
      dy: event.clientY - (box.top + box.height / 2),
      lastX: event.clientX,
      lastT: event.timeStamp,
    };
    el.setPointerCapture(event.pointerId);
    const field = layer.current?.getBoundingClientRect();
    setSide(
      field && box.top + box.height / 2 > field.top + field.height / 2
        ? "above"
        : "below",
    );
    setHeld(id);
    setOrder((current) => ({ ...current, [id]: ++top.current }));
    event.preventDefault();
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || !layer.current) return;
    const field = layer.current.getBoundingClientRect();
    const x = (event.clientX - current.dx - field.left) / field.width;
    const y = (event.clientY - current.dy - field.top) / field.height;
    setSpots((all) => ({
      ...all,
      [current.id]: {
        x: clamp(x, -SLACK, 1 + SLACK),
        y: clamp(y, -SLACK, 1 + SLACK),
      },
    }));

    const dt = Math.max(1, event.timeStamp - current.lastT);
    const speed = (event.clientX - current.lastX) / dt;
    current.lastX = event.clientX;
    current.lastT = event.timeStamp;
    setLean(clamp(speed * LEAN, -LEAN_MAX, LEAN_MAX));
    window.clearTimeout(leanTimer.current);
    leanTimer.current = window.setTimeout(() => setLean(0), LEAN_REST_MS);
  };

  const putDown = () => {
    drag.current = null;
    window.clearTimeout(leanTimer.current);
    setHeld(null);
    setLean(0);
  };

  return (
    <div className="sticker-field">
      {children}

      <div className="stickers" ref={layer} aria-hidden="true">
        {stickers.map((sticker) => {
          const spot = spots[sticker.id];
          const isHeld = held === sticker.id;
          const style = {
            /* token-exempt: a natural width from lib/stickers.ts, the same way
               the desk sizes its photographs. */
            "--w": `${sticker.width}px`,
            "--tilt": sticker.tilt,
            "--dx": sticker.desk[0],
            "--dy": sticker.desk[1],
            "--px": sticker.pocket[0],
            "--py": sticker.pocket[1],
            "--z": order[sticker.id] ?? 0,
            "--lean": isHeld ? lean : 0,
            "--mask": `url(${stickerSrc(sticker.id)})`,
            /* Height over width, so the CSS can find the sticker's rendered
               height and set the note clear of its edge. */
            "--ratio": sticker.size[1] / sticker.size[0],
            ...(spot && { "--x": spot.x, "--y": spot.y }),
          } as CSSProperties;

          return (
            <Fragment key={sticker.id}>
              <div
                className="sticker"
                style={style}
                data-held={isHeld || undefined}
                onPointerDown={(event) => pickUp(event, sticker.id)}
                onPointerMove={move}
                onPointerUp={putDown}
                onPointerCancel={putDown}
              >
                <img
                  className="sticker-face"
                  src={stickerSrc(sticker.id)}
                  alt=""
                  width={sticker.size[0]}
                  height={sticker.size[1]}
                  draggable={false}
                  decoding="async"
                />
                <span className="sticker-flap" />
              </div>
              {isHeld && (
                <p className="sticker-note" style={style} data-side={side}>
                  {sticker.note}
                </p>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
