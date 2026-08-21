#!/usr/bin/env node
/**
 * B7 — gallery photo pipeline.
 *
 *   raw/gallery/<key>.jpg  →  public/gallery/<key>-{400,800,1600}.webp + .jpg
 *
 * For each photo it emits responsive WebP, a JPG fallback, and a ~20px blurred
 * LQIP inlined as a data URI, then writes lib/generated/photos.ts. The `key`
 * must match an entry in lib/gallery.ts — city and year come from that
 * hand-maintained manifest and are never read from EXIF, so the metadata and
 * the stripping can't fight each other.
 *
 * THE BUILD FAILS IF ANY GPS TAG SURVIVES. These are pictures of where
 * Abhishek lives and walks; coordinates do not ship (§9).
 */
import { statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { basename } from "node:path";
import {
  bytes,
  emitVariants,
  listSources,
  makeLqip,
  slugOf,
  verifyClean,
  writeManifest,
} from "./lib/images.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RAW = join(ROOT, "raw", "gallery");
const OUT = join(ROOT, "public", "gallery");

/* A phone never downloads the 1600px file: `sizes` in Gallery.tsx caps the
   tile at ~90vw on small screens, so 400w wins there. */
const WIDTHS = [400, 800, 1600];

const sources = listSources(RAW);

if (sources.length === 0) {
  console.log("\nNo photos in raw/gallery/ — nothing to do.");
  console.log("Drop originals there named to match the `key` in lib/gallery.ts.\n");
  process.exit(0);
}

const manifest = {};
const produced = [];
let sourceBytes = 0;
let outputBytes = 0;
let galleryPayload = 0;

console.log(`\nProcessing ${sources.length} photos\n`);

for (const source of sources) {
  const key = slugOf(source);
  const sourceSize = statSync(source).size;
  sourceBytes += sourceSize;

  const { natural, written, fallback, fallbackSize } = await emitVariants(
    source,
    OUT,
    key,
    WIDTHS
  );
  const lqip = await makeLqip(source);

  outputBytes += written.reduce((sum, w) => sum + w.size, 0) + fallbackSize;
  produced.push(...written.map((w) => w.file), fallback);

  // What a 3-column desktop grid actually pulls: the 800w variant per tile.
  const grid = written.find((w) => w.width === 800) ?? written[written.length - 1];
  galleryPayload += grid.size;

  manifest[key] = {
    src: `/gallery/${basename(fallback)}`,
    srcSet: written.map((w) => `/gallery/${basename(w.file)} ${w.width}w`).join(", "),
    width: natural.width,
    height: natural.height,
    lqip,
  };

  console.log(
    `  ${key.padEnd(24)} ${String(natural.width).padStart(5)}×${String(natural.height).padEnd(5)} ` +
      `${bytes(sourceSize).padStart(8)} → ${bytes(grid.size).padStart(8)} (800w)`
  );
}

const { problems, exiftoolAvailable } = await verifyClean(produced);

console.log(
  `\nEXIF check: ${produced.length} files, ` +
    `exiftool ${exiftoolAvailable ? "present" : "NOT INSTALLED — sharp check only"}`
);
if (!exiftoolAvailable) {
  console.log("  Install for the stronger GPS check: brew install exiftool");
}
if (problems.length > 0) {
  console.error("\n✗ BUILD FAILED — metadata survived processing:\n");
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("✓ no EXIF, XMP, IPTC, or GPS in any output");

writeManifest(
  join(ROOT, "lib", "generated", "photos.ts"),
  "photoManifest",
  "{\n  src: string;\n  srcSet: string;\n  width: number;\n  height: number;\n  lqip: string;\n}",
  manifest
);

console.log(`\nPage weight for a ${sources.length}-photo gallery`);
console.log(`  originals               ${bytes(sourceBytes)}`);
console.log(`  all variants on disk    ${bytes(outputBytes)}`);
console.log(`  what the grid loads     ${bytes(galleryPayload)}  (800w per tile, lazy below the fold)`);
console.log(`\nManifest: lib/generated/photos.ts (${Object.keys(manifest).length} entries)\n`);
