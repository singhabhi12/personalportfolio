/* Gomoku — the whole of /fun.

   A 15×15 board, five in a row, and something on the other side of it that
   will not let you win by accident.

   Two halves live here. The rules — where a stone may go and what finishes a
   game — are a dozen lines and not interesting. The opponent is the rest, and
   it is worth saying plainly what it is: a one-move look-ahead that scores
   every square it could play by the shape it would make, and scores the same
   square again for the shape it would deny. No tree, no search, no clock.

   That sounds thin and is not. Almost everything that matters in gomoku is
   visible one move out — a four that must be answered, a three with both ends
   open that becomes one, two of those crossing on the same square. A player
   that sees all of them at once, on every square, and weighs its own against
   its opponent's, plays a real game: it will take a win it is handed, it will
   not walk past a four, and it punishes a careless third stone. What it cannot
   do is build a trap four moves deep, which is also the line between an
   opponent worth a minute and one nobody beats. That line is on purpose.

   The stronger version of this is a search, and a search needs a time budget,
   a worker thread so the page does not freeze while it thinks, and an answer
   to what happens on the oldest phone that will ever open this. None of that
   is free, and an opponent nobody can beat is not a better toy. */

/** 15×15 — a gomoku board, not a go board. */
export const SIZE = 15;
export const CELLS = SIZE * SIZE;

/** How many in a row. Freestyle: six also wins, it is not an overline fault. */
export const RUN = 5;

export type Stone = 1 | 2;
export const BLACK: Stone = 1;
export const WHITE: Stone = 2;

/** The board, one byte a square: 0 empty, else a stone. */
export type Grid = Uint8Array;

export const other = (stone: Stone): Stone =>
  stone === BLACK ? WHITE : BLACK;

export const newGrid = (): Grid => new Uint8Array(CELLS);

export const CENTRE = ((SIZE - 1) / 2) * SIZE + (SIZE - 1) / 2;

/** Where the nine marked intersections are, as a goban has them at 4-8-12. */
export const STARS = [3, 7, 11];

/* The four axes. The other four are these walked backwards, which every scan
   below does for itself. */
const AXES = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const;

const column = (at: number) => at % SIZE;
const row = (at: number) => Math.floor(at / SIZE);
const inside = (x: number, y: number) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;

/** "H8" — the square, the way a game record would write it. */
export function coordinate(at: number): string {
  return `${String.fromCharCode(65 + column(at))}${SIZE - row(at)}`;
}

/** Nothing left to play. */
export function full(grid: Grid): boolean {
  return grid.every((cell) => cell !== 0);
}

/**
 * The run the stone at `at` completes, or null.
 *
 * Only ever asked about the square just played, which is why it walks out
 * from one stone rather than scanning the board.
 */
export function winningRun(grid: Grid, at: number): number[] | null {
  const stone = grid[at];
  if (!stone) return null;
  const x0 = column(at);
  const y0 = row(at);

  for (const [dx, dy] of AXES) {
    const run = [at];
    for (const way of [1, -1]) {
      for (let step = 1; step < SIZE; step += 1) {
        const x = x0 + dx * step * way;
        const y = y0 + dy * step * way;
        if (!inside(x, y)) break;
        const i = y * SIZE + x;
        if (grid[i] !== stone) break;
        run.push(i);
      }
    }
    if (run.length >= RUN) return run.sort((a, b) => a - b);
  }
  return null;
}

/* ---------- The opponent ---------- */

/* What each shape is worth. The gaps between the tiers are the whole strategy,
   so they are set deliberately rather than by feel:

   - FIVE and OPEN_FOUR are won positions and sit far above everything, so no
     sum of lesser threats can ever outbid taking the win.
   - A FOUR is forcing — it has to be answered this move — and is therefore
     worth more than an OPEN_THREE, which only has to be answered eventually.
     Without that gap the player would stop to block a three while holding a
     four, which is a move thrown away.
   - Two OPEN_THREEs crossing on one square add up to a FOUR, which is right:
     a double three is as good as forcing, because only one of the two can be
     answered.
   - Closed shapes are worth an order of magnitude less than open ones. A three
     with a wall at one end is a tenth of a three with neither. */
const FIVE = 10_000_000;
const OPEN_FOUR = 1_000_000;
const FOUR = 10_000;
const OPEN_THREE = 5_000;
const BROKEN_THREE = 4_000;
const THREE = 400;
const OPEN_TWO = 300;
const TWO = 40;
const ONE = 5;

/* Blocking is worth a shade more than building. Both players move once a turn,
   so an even trade of threats loses the race: make an open three while your
   opponent makes one, and they are the one holding the open four. A tenth over
   parity is enough to break every tie towards the block without making the
   player so timid it never builds anything. */
const DEFENCE = 1.1;

/* How far from an existing stone a square has to be before it is not worth
   looking at. Two is the real answer: a square three away cannot touch any
   shape on the board this move or next. */
const REACH = 2;

/* How far either side of a square the shape around it is read. Five, so an
   open four pressed against the board's edge is still seen as one — at four
   the far end falls outside the window and it reads as merely a four. */
const SPAN = 5;

/* The alphabet the shapes are written in: the square itself and its own
   stones, the empty squares that could still become them, and everything that
   stops a run — an opposing stone and the edge of the board, which are the
   same thing to a line of five. */
const MINE = "o";
const FREE = ".";
const SHUT = "x";

/**
 * The line through `at` along one axis, as seen by `stone` if it played there.
 *
 * Eleven characters with the square under consideration in the middle, already
 * written as `MINE` — the question is always "what if I played here", so the
 * stone is assumed down before the shape is read.
 */
function shapeAlong(
  grid: Grid,
  at: number,
  dx: number,
  dy: number,
  stone: Stone
): string {
  const x0 = column(at);
  const y0 = row(at);
  let shape = "";
  for (let step = -SPAN; step <= SPAN; step += 1) {
    if (step === 0) {
      shape += MINE;
      continue;
    }
    const x = x0 + dx * step;
    const y = y0 + dy * step;
    if (!inside(x, y)) {
      shape += SHUT;
      continue;
    }
    const cell = grid[y * SIZE + x];
    shape += cell === 0 ? FREE : cell === stone ? MINE : SHUT;
  }
  return shape;
}

/* Whether five can still be made along this line at all. A run boxed in on
   both sides is not a small threat, it is no threat — and a player that does
   not know the difference spends its stones extending shapes that are already
   dead. The square sits at SPAN; any five-wide window covering it with nothing
   shut in it means there is still a game on this line. */
function alive(shape: string): boolean {
  for (let start = SPAN - RUN + 1; start <= SPAN; start += 1) {
    if (!shape.slice(start, start + RUN).includes(SHUT)) return true;
  }
  return false;
}

/* Written as literals rather than built from RUN: these are shapes, and a
   shape is clearer drawn than described. */
const SHAPES: [RegExp, number][] = [
  [/ooooo/, FIVE],
  [/\.oooo\./, OPEN_FOUR],
  [/oooo\.|\.oooo|o\.ooo|oo\.oo|ooo\.o/, FOUR],
  [/\.ooo\./, OPEN_THREE],
  [/\.o\.oo\.|\.oo\.o\./, BROKEN_THREE],
  [/ooo|oo\.o|o\.oo/, THREE],
  [/\.oo\.|\.o\.o\./, OPEN_TWO],
  [/oo/, TWO],
];

/** What playing `at` is worth to `stone`, summed over the four axes. */
export function weigh(grid: Grid, at: number, stone: Stone): number {
  let total = 0;
  for (const [dx, dy] of AXES) {
    const shape = shapeAlong(grid, at, dx, dy, stone);
    if (!alive(shape)) continue;
    const hit = SHAPES.find(([pattern]) => pattern.test(shape));
    total += hit ? hit[1] : ONE;
  }
  return total;
}

/** Every empty square within REACH of a stone — or the middle, on move one. */
export function playable(grid: Grid): number[] {
  const near: number[] = [];
  let bare = true;

  for (let i = 0; i < CELLS; i += 1) {
    if (grid[i] === 0) continue;
    bare = false;
    break;
  }
  if (bare) return [CENTRE];

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const i = y * SIZE + x;
      if (grid[i] !== 0) continue;
      let touches = false;
      for (let dy = -REACH; dy <= REACH && !touches; dy += 1) {
        for (let dx = -REACH; dx <= REACH; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (!inside(nx, ny)) continue;
          if (grid[ny * SIZE + nx] !== 0) {
            touches = true;
            break;
          }
        }
      }
      if (touches) near.push(i);
    }
  }
  return near;
}

/* Everything else being equal, towards the middle: a stone near the centre has
   four live axes through it and a stone in the corner has barely one. Only
   ever a tiebreak — it is an integer, and it is compared after the score. */
function pull(at: number): number {
  const middle = (SIZE - 1) / 2;
  return -(Math.abs(column(at) - middle) + Math.abs(row(at) - middle));
}

/**
 * Where `stone` plays next.
 *
 * The two forced cases are taken out first, not because the weighing would get
 * them wrong — FIVE outranks everything, so it would not — but because they
 * are the two moves that must be exactly right, and a rule is easier to trust
 * than a sum. Everything after that is the weighing, with ties broken towards
 * the middle and then thrown: two games from the same opening should not be
 * the same game.
 */
export function reply(grid: Grid, stone: Stone): number {
  const foe = other(stone);
  const moves = playable(grid);
  if (moves.length === 0) return -1;

  for (const at of moves) {
    if (weigh(grid, at, stone) >= FIVE) return at;
  }
  for (const at of moves) {
    if (weigh(grid, at, foe) >= FIVE) return at;
  }

  let bestScore = -Infinity;
  let bestPull = -Infinity;
  let shortlist: number[] = [];

  for (const at of moves) {
    const score = weigh(grid, at, stone) + weigh(grid, at, foe) * DEFENCE;
    const towards = pull(at);
    if (score > bestScore || (score === bestScore && towards > bestPull)) {
      bestScore = score;
      bestPull = towards;
      shortlist = [at];
    } else if (score === bestScore && towards === bestPull) {
      shortlist.push(at);
    }
  }

  return shortlist[Math.floor(Math.random() * shortlist.length)];
}

/* ---------- The record ---------- */

/* In this browser, for this browser, and said out loud on the page rather than
   implied by the word "record". Versioned, so a change to the shape orphans an
   old tally instead of crashing on it.

   The key still says `canvas` because the page did when the key was written,
   and renaming it would quietly reset the record of everyone who already has
   one. A storage key is a name nobody reads; a lost tally is something someone
   notices. The version is for shape changes, not for renames. */
const KEY = "canvas.gomoku.v1";

export interface Tally {
  won: number;
  lost: number;
  drawn: number;
}

export const NO_GAMES: Tally = { won: 0, lost: 0, drawn: 0 };

export const played = (tally: Tally): number =>
  tally.won + tally.lost + tally.drawn;

const isBrowser = () => typeof window !== "undefined";
const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;

/** The tally, or an empty one. Never throws: a corrupt store reads as nought. */
export function readTally(): Tally {
  if (!isBrowser()) return NO_GAMES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return NO_GAMES;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return NO_GAMES;
    const stored = parsed as Partial<Tally>;
    return {
      won: count(stored.won),
      lost: count(stored.lost),
      drawn: count(stored.drawn),
    };
  } catch {
    return NO_GAMES;
  }
}

/** Write the tally back, and hand back what was stored. */
export function writeTally(tally: Tally): Tally {
  if (!isBrowser()) return tally;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tally));
  } catch {
    /* A private window, or storage switched off. The tally is just not kept. */
  }
  return tally;
}
