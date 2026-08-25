/* The Canvas's one piece of logic: the wall.

   The site is a static export — there is no server to save a drawing to, and
   inventing one for a doodle would be the wrong trade. So the wall is
   `localStorage`: it belongs to the browser that drew on it, it survives a
   reload, and it never leaves the machine. The page says so out loud
   (`canvas.privacy` in lib/content.ts) rather than letting "save" imply an
   account.

   Strokes are stored, not pictures. A stroke list is an order of magnitude
   smaller than the SVG it renders to, and it is the only form that can be put
   back on the sheet and drawn on again. Thumbnails are rebuilt from it with
   the same serializer the export uses. */

import { toSvg, type Board, type Stroke } from "drawesome";

/** One drawing on the wall. */
export interface Pinned {
  id: string;
  /** Epoch ms — the wall reads newest first. */
  at: number;
  /** The surface it was drawn at, so the thumbnail keeps its proportions. */
  board: Board;
  strokes: Stroke[];
}

/* Versioned: a change to the stroke shape should orphan the old wall rather
   than crash on it. */
const KEY = "canvas.wall.v1";

/** How many drawings the wall holds before the oldest comes down. */
export const WALL_MAX = 12;

const isBrowser = () => typeof window !== "undefined";

/** A pinned entry, or null if the stored shape is not one. */
function parse(value: unknown): Pinned | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<Pinned>;
  if (typeof entry.id !== "string" || typeof entry.at !== "number") return null;
  if (!entry.board || !Array.isArray(entry.strokes)) return null;
  const { w, h } = entry.board;
  if (typeof w !== "number" || typeof h !== "number") return null;
  return { id: entry.id, at: entry.at, board: { w, h }, strokes: entry.strokes };
}

/** The wall, newest first. Never throws: a corrupt store reads as empty. */
export function readWall(): Pinned[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parse)
      .filter((entry): entry is Pinned => entry !== null)
      .sort((a, b) => b.at - a.at)
      .slice(0, WALL_MAX);
  } catch {
    return [];
  }
}

/**
 * Write the wall back, and return what was actually stored.
 *
 * A drawing is unbounded in size — someone can scribble for ten minutes — so a
 * full quota is a normal outcome here, not an error. Rather than dropping the
 * pin the visitor just made, the oldest ones come down until the rest fit.
 */
export function writeWall(entries: Pinned[]): Pinned[] {
  if (!isBrowser()) return entries;
  let kept = entries.slice(0, WALL_MAX);
  while (kept.length > 0) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(kept));
      return kept;
    } catch {
      kept = kept.slice(0, -1);
    }
  }
  // Even one drawing would not fit; leave the store as it was found.
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* A browser with storage switched off entirely. The wall is just not kept. */
  }
  return [];
}

/**
 * A CSS colour as `#rrggbb`, resolved by the browser.
 *
 * Drawesome decides whether the paper is light or dark before choosing a
 * cursor colour, and the check it uses only recognises six hex digits. The
 * token this page reads is authored as `#ffffff` but reaches the browser as
 * `#fff` — the CSS minifier shortens it — which failed that check and drew a
 * white ring on white paper, i.e. no cursor at all.
 *
 * Rather than hard-code the long form somewhere it can drift from the token,
 * the value goes through the browser's own parser: assign it, read it back as
 * `rgb()`, and write it out in the one form everything downstream accepts.
 * That also means the token can be named in any CSS colour syntax later
 * without this breaking again.
 */
export function toHex(value: string): string {
  if (!isBrowser()) return value;
  const probe = document.createElement("span");
  // An unrecognised colour leaves the property empty; nothing to resolve.
  probe.style.color = value;
  if (!probe.style.color) return value;

  probe.style.display = "none";
  document.body.append(probe);
  const computed = window.getComputedStyle(probe).color;
  probe.remove();

  const channels = computed.match(/\d+(?:\.\d+)?/g);
  if (!channels || channels.length < 3) return value;
  const hex = channels
    .slice(0, 3)
    .map((channel) => Math.round(Number(channel)).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

/** `crypto.randomUUID` where it exists, and something unique where it doesn't. */
export function newId(): string {
  if (isBrowser() && typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * The pinned drawing as an `<img>` source.
 *
 * Rebuilt from strokes with Drawesome's own serializer, so a thumbnail and an
 * export are the same picture — erasures included.
 */
export function thumbnail(entry: Pinned, background: string): string {
  const svg = toSvg(entry.strokes, entry.board.w, entry.board.h, background);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * "24 Aug", for the caption under a pin.
 *
 * Short month, not long: the caption shares a 124px row with the button that
 * takes the pin down, and "24 August" wraps that row onto two lines.
 * Locale-fixed to match the stamp.
 */
export function pinnedOn(at: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(at));
}
