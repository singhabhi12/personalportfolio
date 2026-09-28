"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Draw, type DrawHandle, type PenId, type Stroke } from "drawesome";
import "drawesome/styles.css";

import { canvas } from "@/lib/content";
import {
  newId,
  pinnedOn,
  readWall,
  thumbnail,
  toHex,
  writeWall,
  WALL_MAX,
  type Pinned,
} from "@/lib/canvas";

/* The Canvas ✎ — the desk, handed over.

   Every other page shows the visitor something. This one gives them the pens.
   The drawing itself is Drawesome (github.com/benjitaylor/drawesome, MIT) —
   seven pens with real ink behaviour and a toolbar that morphs rather than
   swaps panels. Credit sits at the foot of the page, in the markup, not in a
   comment: see `canvas.credit` in lib/content.ts.

   What this component owns is everything around the sheet: the wall the
   drawings are pinned to, the storage under it (lib/canvas.ts), and the two
   places a drawing can be lost — putting a pin back and starting over. Both
   ask first when the sheet has work on it that was never pinned. */

/* No fixed board. The surface takes the size of the element, which costs a
   pinned drawing its guarantee of being the same shape on every screen — and
   buys back the thing that matters more: one board unit is one screen pixel,
   so a size-6 pen draws a 6px mark and the brush ring is 6px across. Pinned at
   a fixed 1400-unit board scaled down to fit, that ring was a two-pixel speck
   with the real cursor hidden behind it, which is no cursor at all.

   Each pin carries the board it was drawn at (lib/canvas.ts), so a thumbnail
   still knows its own proportions. */

/* Retina-ish. A doodle is not worth a 4x file. */
const PNG_SCALE = 2;

/* How long the pin button holds its confirmation before going back to work. */
const CONFIRM_MS = 1600;

/* The toolbar is a fixed 633px wide with everything on it, and it is clipped
   by the surface it sits on — so below a tablet it cannot lie along the bottom
   of the sheet. It stands up as a rail instead, and a rail has to be short
   enough to stand in the stage, so the phone gets four pens.

   The bar wants 673px of sheet with its inset, and the frame takes 80px off
   the viewport before the sheet gets any — 753px, so a tablet held upright
   (768–834px) keeps the whole bar lying down, and only a phone stands it up.
   Kept in step with the `--canvas-stage-h` breakpoint in globals.css, which
   makes the table tall enough for the rail.

   token-exempt: a media query is a breakpoint, and B1 exempts those in CSS for
   the same reason it has to here — a custom property cannot be one. */
const RAIL_QUERY = "(max-width: 759.98px)";

/* Four that behave differently from each other — graphite, ballpoint, a broad
   marker, and a transparent highlighter. The other three are variations a
   phone has no room to offer. */
const RAIL_TOOLS: PenId[] = ["pencil", "pen", "marker", "highlighter"];

/* The hex field and eyedropper, off on a phone: picking an arbitrary colour on
   a small screen is fiddly enough that nobody does it, and the swatches are
   the point. */
const RAIL_CONTROLS = { custom: false };

/* Drawesome's own class on the wrapper its toolbar is dragged by — the one
   part of the stage a touch has to be allowed to reach as a tap. */
const TOOLBAR_CLASS = "Draw_toolbar";

export default function CanvasStudio() {
  const drawRef = useRef<DrawHandle | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  /* The wall is read on mount, never during render: the server has no
     localStorage, and a first paint that differs from the markup is a
     hydration error. Empty is the honest pre-hydration state. */
  const [wall, setWall] = useState<Pinned[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* Stroke count, not the strokes: the sheet's contents live in the surface,
     and copying them into React state on every mark would be a lot of garbage
     for a number that only enables two buttons. */
  const [strokeCount, setStrokeCount] = useState(0);

  /* Set while a drawing is on the sheet that has not been pinned. Pinning
     clears it; drawing again sets it. This is the only thing that decides
     whether a replace has to ask first. */
  const [dirty, setDirty] = useState(false);

  /* The pin waiting for a confirmed replace, and the id showing "Pinned". */
  const [pendingOpen, setPendingOpen] = useState<Pinned | null>(null);
  const [justPinned, setJustPinned] = useState(false);

  /* The paper colour, taken from the token rather than written twice. It has to
     be a real colour and not a `var()` — it is painted into the exported SVG,
     which travels away from this stylesheet. */
  const [sheet, setSheet] = useState("white");

  /* Whether the toolbar stands on its end. A breakpoint rather than a
     measurement: the bar's width is the library's business, and what this page
     has to decide is only whether there is room for it lying down. */
  const [rail, setRail] = useState(false);

  /* A finger on the sheet is a pen, never a scroll.

     Drawesome draws through pointer events and marks its surface
     `touch-action: none`, which is what a browser is supposed to need. iOS
     Safari needs more: it decides at `touchstart` whether the gesture is a
     scroll, a long-press callout or a pinch, and once it has, the pointer
     events stop arriving — a stroke ends after a centimetre, or never begins.
     Cancelling the touch events here, on the stage and not the surface, is
     what settles the question before Safari asks it. Non-passive on purpose:
     a passive listener cannot cancel anything, and React registers touch
     handlers passive. The bar is left alone: cancelling a touch also cancels
     the click it would have become, and the bar is made of buttons. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pen = (event: TouchEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(`.${TOOLBAR_CLASS}`)) return;
      if (event.cancelable) event.preventDefault();
    };
    stage.addEventListener("touchstart", pen, { passive: false });
    stage.addEventListener("touchmove", pen, { passive: false });
    return () => {
      stage.removeEventListener("touchstart", pen);
      stage.removeEventListener("touchmove", pen);
    };
  }, []);

  useLayoutEffect(() => {
    const query = window.matchMedia(RAIL_QUERY);
    const sync = () => setRail(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setWall(readWall());
    setHydrated(true);
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue("--canvas-sheet")
      .trim();
    // Through the browser's parser on the way in: see toHex — the short hex
    // the minifier emits is not a form Drawesome's light/dark check reads.
    if (token) setSheet(toHex(token));
  }, []);

  useEffect(() => {
    if (!justPinned) return;
    const timer = window.setTimeout(() => setJustPinned(false), CONFIRM_MS);
    return () => window.clearTimeout(timer);
  }, [justPinned]);

  const onChange = useCallback((strokes: Stroke[]) => {
    setStrokeCount(strokes.length);
    setDirty(strokes.length > 0);
    // A replace offer is stale the moment the sheet changes under it.
    setPendingOpen(null);
  }, []);

  const pin = useCallback(() => {
    const handle = drawRef.current;
    if (!handle) return;
    const strokes = handle.getStrokes();
    if (strokes.length === 0) return;

    const entry: Pinned = {
      id: newId(),
      at: Date.now(),
      board: handle.getSize(),
      strokes,
    };
    setWall((current) => writeWall([entry, ...current]));
    setDirty(false);
    setJustPinned(true);
  }, []);

  const download = useCallback(() => {
    void drawRef.current?.download(canvas.downloadName, "png", PNG_SCALE);
  }, []);

  /* Putting a pin back replaces the sheet *and* its undo history, so there is
     no taking it back — which is why an unpinned drawing gets a question
     first. A clean sheet has nothing to lose and skips it. */
  const open = useCallback(
    (entry: Pinned) => {
      if (dirty) {
        setPendingOpen(entry);
        return;
      }
      drawRef.current?.setStrokes(entry.strokes);
      setStrokeCount(entry.strokes.length);
      setDirty(false);
      setPendingOpen(null);
    },
    [dirty]
  );

  const confirmOpen = useCallback(() => {
    const entry = pendingOpen;
    if (!entry) return;
    drawRef.current?.setStrokes(entry.strokes);
    setStrokeCount(entry.strokes.length);
    setDirty(false);
    setPendingOpen(null);
  }, [pendingOpen]);

  const remove = useCallback((id: string) => {
    setWall((current) => writeWall(current.filter((entry) => entry.id !== id)));
  }, []);

  const empty = strokeCount === 0;

  return (
    <div className="canvas">
      {/* Same head as /contact, in the same classes: a label, then one line in
          the lead face. The pages are built the same way — one apparatus on
          one screen — so they open the same way too. */}
      <header className="canvas-head">
        <p className="widget-label">{canvas.label}</p>
        {/* No accent glyph. "Work ▶" and "Gallery ⁕" carry one because they are
            section titles in the display face; this is a lead, and the lead on
            /contact does not — a mark trailing a full stop reads as a stray. */}
        <h1 className="canvas-line">{canvas.line}</h1>
      </header>

      <div className="canvas-grid">
        <div className="canvas-desk">
          {/* The sheet, and nothing behind it: the board matches the element,
              so there is no letterboxed table around the paper — and, more to
              the point, one board unit is one screen pixel, which is what makes
              the brush ring the size of the mark it is about to leave. */}
          <div
            className="canvas-stage"
            ref={stageRef}
            role="group"
            aria-label={canvas.surfaceLabel}
          >
            <Draw
              ref={drawRef}
              background={sheet}
              onChange={onChange}
              look="studio"
              /* Not "auto": the page around it is cream paper in every OS
                 theme, and a bar that goes dark on its own would be the only
                 thing on the site answering to a setting nothing else here
                 reads. */
              theme="light"
              placement={rail ? "right" : "bottom"}
              align="center"
              depth="regular"
              tools={rail ? RAIL_TOOLS : undefined}
              controls={rail ? RAIL_CONTROLS : undefined}
              gauge
              draggable
              className="canvas-surface"
            />
          </div>

          <div className="canvas-foot">
            <button
              type="button"
              className="btn-ink"
              onClick={pin}
              disabled={empty}
              data-confirmed={justPinned ? "" : undefined}
            >
              {justPinned ? canvas.pinned : canvas.pin}
            </button>
            <button
              type="button"
              className="canvas-quiet"
              onClick={download}
              disabled={empty}
            >
              {canvas.download}
            </button>
            <p className="canvas-privacy">{canvas.privacy}</p>
          </div>
        </div>

        {/* The wall is its own column, not a section further down the page:
            what you have already made should be in sight while you draw the
            next one, and nothing here is worth a scroll to reach. */}
        <aside className="canvas-wall" aria-labelledby="canvas-wall-label">
          <h2 className="widget-label" id="canvas-wall-label">
            {canvas.wall.label}
          </h2>

          {/* One shared question rather than one per tile: it is the sheet
              being replaced, and there is only ever one sheet. */}
          {pendingOpen && (
            <div className="canvas-confirm" role="alert">
              <p>{canvas.wall.confirm}</p>
              <div className="canvas-confirm-row">
                <button
                  type="button"
                  className="canvas-quiet"
                  onClick={confirmOpen}
                >
                  {canvas.wall.replace}
                </button>
                <button
                  type="button"
                  className="canvas-quiet"
                  onClick={() => setPendingOpen(null)}
                >
                  {canvas.wall.keep}
                </button>
              </div>
            </div>
          )}

          {/* Before hydration the wall is unknown, not empty — saying "nothing
              pinned yet" to someone with a full wall would be a lie for a
              frame. */}
          {hydrated && wall.length === 0 && (
            <p className="canvas-empty">{canvas.wall.empty}</p>
          )}

          {wall.length > 0 && (
            <ul className="canvas-pins">
              {wall.map((entry) => (
                <li key={entry.id} className="canvas-pin">
                  <button
                    type="button"
                    className="pin-open"
                    onClick={() => open(entry)}
                    aria-label={`${canvas.wall.open} — ${pinnedOn(entry.at)}`}
                  >
                    <img
                      className="pin-shot"
                      src={thumbnail(entry, sheet)}
                      alt=""
                      width={entry.board.w}
                      height={entry.board.h}
                    />
                  </button>
                  <div className="pin-caption">
                    <span className="micro-label">{pinnedOn(entry.at)}</span>
                    <button
                      type="button"
                      className="pin-remove"
                      onClick={() => remove(entry.id)}
                    >
                      {canvas.wall.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {wall.length === WALL_MAX && (
            <p className="canvas-empty">{canvas.wall.full}</p>
          )}
        </aside>
      </div>

      {/* Credit, on the page. Drawesome is doing the hard part. */}
      <p className="canvas-credit">
        {canvas.credit.lead}{" "}
        <a href={canvas.credit.href} target="_blank" rel="noreferrer noopener">
          {canvas.credit.name}
        </a>{" "}
        —{" "}
        <a
          href={canvas.credit.authorHref}
          target="_blank"
          rel="noreferrer noopener"
        >
          {canvas.credit.author}
        </a>
        , {canvas.credit.licence}.
      </p>
    </div>
  );
}
