"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { fun } from "@/lib/content";
import {
  BLACK,
  CELLS,
  CENTRE,
  NO_GAMES,
  SIZE,
  STARS,
  WHITE,
  coordinate,
  full,
  newGrid,
  played,
  readTally,
  reply,
  winningRun,
  writeTally,
  type Grid,
  type Stone,
  type Tally,
} from "@/lib/gomoku";

/* Gomoku — the board, as an object on the page.

   The rules and the opponent are in lib/gomoku.ts and know nothing about
   React. This file is the board as an object: wood, lines, nine marked points,
   and the two hundred and twenty-five places a stone can go.

   Two decisions worth naming, because neither is the obvious one.

   The intersections are real buttons rather than hit-testing on a canvas. A
   canvas board is fewer lines and is unreachable — no focus, no keys, nothing
   for a screen reader to read, which on the one page here that hands the desk
   over is the wrong saving. Two hundred and twenty-five buttons sound
   expensive and are not: they are empty until a stone lands in one.

   But two hundred and twenty-five tab stops would be an ordeal, so the board
   holds one. A roving tabindex, arrows to walk it, enter to play — which is
   what `role="grid"` promises and therefore what it has to do. An occupied
   square is `aria-disabled` rather than `disabled` for the same reason: a
   disabled button cannot be focused, and a board you cannot walk across once
   there are stones on it is a board you cannot read.

   The board and the record are two columns on a wide screen and one on a
   phone, which is the whole of the layout and lives in `.fun-grid`. */

/* The intersections are laid out as cells with a line through each cell's
   middle, which is where the half comes from — and why the wood showing
   outside the outermost lines is the board's own margin rather than a padding
   somebody has to keep in step with it. */
const STEP = 0.5;
const LINES = Array.from({ length: SIZE }, (_, i) => i);
const MARKED = STARS.flatMap((x) => STARS.map((y) => [x, y] as const));

/* How wide a marked point is, in board units, so it scales with the wood. */
const STAR_R = 0.11;

/* How long the machine takes to answer. The arithmetic is done inside a frame,
   and two stones landing at once reads as a glitch rather than a reply. Long
   enough to be a turn, short enough not to be a wait. */
const THINKING_MS = 420;

type Outcome = "playing" | "won" | "lost" | "drawn";

interface Game {
  grid: Grid;
  turn: Stone;
  /** The stone just played, which keeps a mark so the board can be read. */
  last: number | null;
  /** The five that finished it, if it is finished. */
  run: number[] | null;
  outcome: Outcome;
}

const opening = (): Game => ({
  grid: newGrid(),
  turn: BLACK,
  last: null,
  run: null,
  outcome: "playing",
});

/** The board after `stone` plays `at`. Rules only — no opinion about it. */
function place(game: Game, at: number, stone: Stone): Game {
  const grid = game.grid.slice();
  grid[at] = stone;
  const run = winningRun(grid, at);
  const outcome: Outcome = run
    ? stone === BLACK
      ? "won"
      : "lost"
    : full(grid)
      ? "drawn"
      : "playing";
  return {
    grid,
    turn: stone === BLACK ? WHITE : BLACK,
    last: at,
    run,
    outcome,
  };
}

export default function Gomoku() {
  const [game, setGame] = useState<Game>(opening);
  const boardRef = useRef<HTMLDivElement | null>(null);

  /* Where the keyboard is standing: the one square on the board that is in the
     tab order. */
  const [cursor, setCursor] = useState(CENTRE);

  /* Read on mount, never during render — the server has no localStorage, and a
     first paint that differs from the markup is a hydration error. */
  const [tally, setTally] = useState<Tally>(NO_GAMES);
  const [hydrated, setHydrated] = useState(false);

  /* A finished game is counted once. A ref rather than state because it has to
     be true the moment it is set rather than a render later, and nothing on
     the page is drawn from it. */
  const counted = useRef(false);

  useEffect(() => {
    setTally(readTally());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (game.outcome === "playing" || counted.current) return;
    counted.current = true;
    const finish = game.outcome;
    setTally((current) =>
      writeTally({
        won: current.won + (finish === "won" ? 1 : 0),
        lost: current.lost + (finish === "lost" ? 1 : 0),
        drawn: current.drawn + (finish === "drawn" ? 1 : 0),
      })
    );
  }, [game.outcome]);

  /* The machine's turn. The move is worked out inside the timer rather than
     before it, so a game started over mid-think is simply never answered: the
     cleanup takes the timer with it, and the new board is never asked. */
  useEffect(() => {
    if (game.outcome !== "playing" || game.turn !== WHITE) return;
    const timer = window.setTimeout(() => {
      const at = reply(game.grid, WHITE);
      if (at < 0) return;
      setGame((current) => place(current, at, WHITE));
    }, THINKING_MS);
    return () => window.clearTimeout(timer);
  }, [game]);

  const thinking = game.outcome === "playing" && game.turn === WHITE;
  const over = game.outcome !== "playing";

  const play = useCallback((at: number) => {
    setGame((current) => {
      if (current.outcome !== "playing") return current;
      if (current.turn !== BLACK) return current;
      if (current.grid[at] !== 0) return current;
      return place(current, at, BLACK);
    });
    setCursor(at);
  }, []);

  const again = useCallback(() => {
    counted.current = false;
    setGame(opening());
    setCursor(CENTRE);
  }, []);

  const forget = useCallback(() => setTally(writeTally(NO_GAMES)), []);

  /* Arrows walk the board, enter plays — the button's own click handles enter
     and space, so only the walking is here.

     The step is taken from the square that has focus rather than from the one
     the tab order is parked on. They are almost always the same square, and
     the exception is ordinary: clicking an occupied intersection focuses it
     without playing anything, and the next arrow key should set off from the
     square the visitor is looking at.

     The square is then focused directly rather than by waiting for the render
     that moves the tabindex — the button is already on the page, and a focus
     that lands a frame late is one the next keystroke can overtake. */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const steps: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -SIZE,
        ArrowDown: SIZE,
      };
      const step = steps[event.key];
      if (step === undefined) return;
      event.preventDefault();

      const held = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-square]"
      )?.dataset.square;
      const from = held === undefined ? cursor : Number(held);

      /* A row's ends are not joined: walking off the left edge stays where it
         is rather than reappearing on the right of the row above. */
      const x = from % SIZE;
      if (step === -1 && x === 0) return;
      if (step === 1 && x === SIZE - 1) return;
      const next = from + step;
      if (next < 0 || next >= CELLS) return;

      boardRef.current
        ?.querySelector<HTMLButtonElement>(`[data-square="${next}"]`)
        ?.focus();
      setCursor(next);
    },
    [cursor]
  );

  const words = fun;
  const status =
    game.outcome === "playing"
      ? thinking
        ? words.state.thinking
        : words.state.you
      : words.state[game.outcome];

  /* The stone in front of the status line is whoever the line is about: the
     side to move while there is a game, the winner once there is not, and
     nobody on a full board — a draw belongs to neither colour and a stone
     there would be naming one. */
  const says =
    game.outcome === "won"
      ? "black"
      : game.outcome === "lost"
        ? "white"
        : game.outcome === "drawn"
          ? null
          : thinking
            ? "white"
            : "black";

  return (
    <div className="fun-grid">
      <div className="gomoku-desk">
        <div className="gomoku-head">
          <p className="gomoku-state" data-over={over ? "" : undefined}>
            {says && (
              <span className="stone-mark" data-stone={says} aria-hidden="true" />
            )}
            {status}
          </p>
          <button type="button" className="gomoku-new" onClick={again}>
            {words.again}
          </button>
        </div>

        {/* The one place the game speaks. The line above says "Your turn"
            again once the machine has moved, which does not say what it
            played — so the spoken version says both. */}
        <p className="sr-only" aria-live="polite">
          {over
            ? status
            : thinking
              ? words.state.thinking
              : game.last !== null
                ? `${words.replied(coordinate(game.last))} ${words.state.you}`
                : words.state.you}
        </p>

        <div className="gomoku-stage">
          <div className="goban">
            <svg
              className="goban-lines"
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              aria-hidden="true"
            >
              {LINES.map((i) => (
                <line
                  key={`h${i}`}
                  x1={STEP}
                  y1={i + STEP}
                  x2={SIZE - STEP}
                  y2={i + STEP}
                />
              ))}
              {LINES.map((i) => (
                <line
                  key={`v${i}`}
                  x1={i + STEP}
                  y1={STEP}
                  x2={i + STEP}
                  y2={SIZE - STEP}
                />
              ))}
              {/* The outside edge, drawn heavier the way a cut board's is. */}
              <rect
                className="goban-edge"
                x={STEP}
                y={STEP}
                width={SIZE - 1}
                height={SIZE - 1}
              />
              {MARKED.map(([x, y]) => (
                <circle
                  key={`s${x}-${y}`}
                  className="goban-star"
                  cx={x + STEP}
                  cy={y + STEP}
                  r={STAR_R}
                />
              ))}
            </svg>

            <div
              className="goban-squares"
              ref={boardRef}
              role="grid"
              aria-label={words.boardLabel}
              onKeyDown={onKeyDown}
            >
              {LINES.map((y) => (
                <div className="goban-row" role="row" key={y}>
                  {LINES.map((x) => {
                    const at = y * SIZE + x;
                    const stone = game.grid[at];
                    const name = coordinate(at);
                    const shut = stone !== 0 || thinking || over;
                    return (
                      <div className="goban-cell" role="gridcell" key={x}>
                        <button
                          type="button"
                          className="goban-square"
                          data-square={at}
                          tabIndex={at === cursor ? 0 : -1}
                          aria-disabled={shut || undefined}
                          onClick={() => {
                            if (!shut) play(at);
                          }}
                          aria-label={
                            stone === 0
                              ? words.square(name)
                              : words.squareHeld(
                                  name,
                                  stone === BLACK
                                    ? words.legend.black
                                    : words.legend.white
                                )
                          }
                        >
                          {stone !== 0 && (
                            <span
                              className="stone"
                              data-stone={stone === BLACK ? "black" : "white"}
                              data-last={game.last === at ? "" : undefined}
                              data-won={game.run?.includes(at) ? "" : undefined}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="gomoku-legend">
          <span className="gomoku-side">
            <span className="stone-mark" data-stone="black" aria-hidden="true" />
            {words.legend.you} · {words.legend.black}
          </span>
          <span className="gomoku-side">
            <span className="stone-mark" data-stone="white" aria-hidden="true" />
            {words.legend.ai} · {words.legend.white}
          </span>
        </p>
      </div>

      {/* The record, in the wall's seat and the wall's dress: a tally, and
          nothing else. No streak, no rating, no encouragement. */}
      <aside
        className="gomoku-record"
        aria-labelledby="gomoku-record-label"
      >
        <h2 className="widget-label" id="gomoku-record-label">
          {words.record.label}
        </h2>

        {/* Before hydration the tally is unknown rather than nought, and
            "no games yet" said to someone with twenty behind them is a lie
            for a frame. */}
        {hydrated && (
          <>
            <dl className="tally">
              <div className="tally-figure">
                <dt className="micro-label">{words.record.won}</dt>
                <dd className="tally-count">{tally.won}</dd>
              </div>
              <div className="tally-figure">
                <dt className="micro-label">{words.record.lost}</dt>
                <dd className="tally-count">{tally.lost}</dd>
              </div>
              <div className="tally-figure">
                <dt className="micro-label">{words.record.drawn}</dt>
                <dd className="tally-count">{tally.drawn}</dd>
              </div>
            </dl>

            {played(tally) === 0 ? (
              <p className="gomoku-none">{words.record.none}</p>
            ) : (
              <button
                type="button"
                className="gomoku-forget"
                onClick={forget}
              >
                {words.record.forget}
              </button>
            )}
          </>
        )}

        {/* What is on the other side of the board. The panel has the room,
            and a page that hands a visitor an opponent should say what the
            opponent is rather than let the word "machine" do the work. */}
        <p className="gomoku-about">{words.record.about}</p>

        <p className="gomoku-privacy">{words.record.privacy}</p>
      </aside>
    </div>
  );
}
