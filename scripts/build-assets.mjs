#!/usr/bin/env node
/**
 * B4 — asset pipeline for product screenshots, the portrait, and tool icons.
 *
 *   raw/projects/<slug>.png        →  public/projects/<slug>-{800,1600}.webp + .jpg
 *   raw/cases/<slug>/<name>.png    →  public/cases/<slug>/<name>-{…}.webp + .jpg
 *   raw/portrait/portrait.jpg      →  public/portrait-{400,800}.webp + .jpg
 *   raw/tools/<name>.svg|png       →  public/tools/<name>.svg|png (copied as-is)
 *
 * Writes lib/generated/assets.ts, which lib/content.ts merges over the
 * placeholder entries by slug, and lib/generated/case-figures.ts, which the
 * case studies look their inline figures up in by "<slug>/<name>". Drop files
 * in /raw and run `npm run assets` — no component code changes.
 *
 * Aspect ratios are never altered; width is the only constraint and sources
 * are never upscaled.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { bytes, emitVariants, listSources, slugOf, verifyClean, writeManifest } from "./lib/images.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RAW = join(ROOT, "raw");
const PUBLIC = join(ROOT, "public");

const PROJECT_WIDTHS = [800, 1600];
const PORTRAIT_WIDTHS = [400, 800];
/* A phone screen sits three to a row in the reading column, so it needs a
   third of the width a full-bleed figure does. Sized by orientation rather
   than by folder: the same case mixes both. */
const FIGURE_WIDTHS = { landscape: [800, 1600], portrait: [480, 960] };

const manifest = {};
const figures = {};
const produced = [];
let sourceBytes = 0;
let outputBytes = 0;

async function processGroup(rawDir, outDir, publicPrefix, widths, options = {}) {
  const sources = listSources(rawDir);
  for (const source of sources) {
    const slug = slugOf(source);
    sourceBytes += statSync(source).size;

    const { natural, written, fallback, fallbackSize } = await emitVariants(
      source,
      outDir,
      slug,
      widths,
      options
    );

    outputBytes += written.reduce((sum, w) => sum + w.size, 0) + fallbackSize;
    produced.push(...written.map((w) => w.file), fallback);

    manifest[slug] = {
      src: `${publicPrefix}/${basename(fallback)}`,
      srcSet: written
        .map((w) => `${publicPrefix}/${basename(w.file)} ${w.width}w`)
        .join(", "),
      width: natural.width,
      height: natural.height,
    };

    console.log(
      `  ${slug.padEnd(20)} ${natural.width}×${natural.height}  ` +
        `${written.map((w) => w.width + "w").join(" ")} + jpg`
    );
  }
  return sources.length;
}

console.log("\nProject screenshots");
const projectCount = await processGroup(
  join(RAW, "projects"),
  join(PUBLIC, "projects"),
  "/projects",
  PROJECT_WIDTHS
);
if (projectCount === 0) console.log("  (none — drop files in raw/projects/)");

/* Inline figures, one folder per case study. The key is "<slug>/<name>" so the
   name only has to be unique within its own case. */
console.log("\nCase figures");
const casesRaw = join(RAW, "cases");
let figureCount = 0;
if (existsSync(casesRaw)) {
  for (const slug of readdirSync(casesRaw).filter((d) => statSync(join(casesRaw, d)).isDirectory()).sort()) {
    for (const source of listSources(join(casesRaw, slug))) {
      const name = slugOf(source);
      sourceBytes += statSync(source).size;
      const { width, height } = await sharp(source).metadata();
      const { natural, written, fallback, fallbackSize } = await emitVariants(
        source,
        join(PUBLIC, "cases", slug),
        name,
        height > width ? FIGURE_WIDTHS.portrait : FIGURE_WIDTHS.landscape
      );
      outputBytes += written.reduce((sum, w) => sum + w.size, 0) + fallbackSize;
      produced.push(...written.map((w) => w.file), fallback);
      figures[`${slug}/${name}`] = {
        src: `/cases/${slug}/${basename(fallback)}`,
        srcSet: written.map((w) => `/cases/${slug}/${basename(w.file)} ${w.width}w`).join(", "),
        width: natural.width,
        height: natural.height,
      };
      figureCount++;
      console.log(
        `  ${`${slug}/${name}`.padEnd(40)} ${natural.width}×${natural.height}  ` +
          `${written.map((w) => w.width + "w").join(" ")} + jpg`
      );
    }
  }
}
if (figureCount === 0) console.log("  (none — drop files in raw/cases/<slug>/)");

/* The portrait is black-and-white by design (§4), so the grey is baked in here
   rather than left to the CSS filter — no colour channels on the wire. */
console.log("\nPortrait");
const portraitCount = await processGroup(
  join(RAW, "portrait"),
  PUBLIC,
  "",
  PORTRAIT_WIDTHS,
  { grayscale: true }
);
if (portraitCount === 0) console.log("  (none — drop a file in raw/portrait/)");

/* Tool icons are vendor marks, so the artwork is never redrawn or recoloured.
   An SVG is copied verbatim — re-rasterising a brand SVG is both worse-looking
   and a trademark problem. A PNG is only fitted to TOOL_PNG px (README: 88, i.e.
   2× the 44px slot): vendors ship app icons at 1024, and shipping that for a
   44px tile wastes ~100KB. Scaling down inside the same aspect ratio is not a
   distortion of the mark, and it drops any metadata the source carried. */
const TOOL_PNG = 88;
console.log("\nTool icons");
let toolCount = 0;
const toolsRaw = join(RAW, "tools");
if (existsSync(toolsRaw)) {
  mkdirSync(join(PUBLIC, "tools"), { recursive: true });
  /* Skip "vscode 2.svg" — iCloud (this repo lives on a synced Desktop) forks a
     numbered copy when a file is rewritten mid-sync. They are never referenced
     by content.ts, so copying them just ships dead bytes. */
  const isSyncDuplicate = (f) => / \d+\.(svg|png)$/i.test(f);
  for (const file of readdirSync(toolsRaw).filter((f) => /\.(svg|png)$/i.test(f) && !isSyncDuplicate(f))) {
    const out = join(PUBLIC, "tools", file.toLowerCase());
    if (/\.svg$/i.test(file)) {
      copyFileSync(join(toolsRaw, file), out);
      console.log(`  ${file} → public/tools/${file.toLowerCase()} (verbatim)`);
    } else {
      const { width } = await sharp(join(toolsRaw, file)).metadata();
      await sharp(join(toolsRaw, file))
        .resize(TOOL_PNG, TOOL_PNG, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(out);
      produced.push(out);
      console.log(`  ${file} → public/tools/${file.toLowerCase()} (${width}px → ${TOOL_PNG}px)`);
    }
    toolCount++;
  }
}
if (toolCount === 0) console.log("  (none — see README, 'Sourcing app icons')");

if (produced.length > 0) {
  const { problems, exiftoolAvailable } = await verifyClean(produced);
  console.log(
    `\nEXIF check: ${produced.length} files, ` +
      `exiftool ${exiftoolAvailable ? "present" : "not installed (sharp check only)"}`
  );
  if (problems.length > 0) {
    console.error("\n✗ metadata survived processing:\n" + problems.join("\n"));
    process.exit(1);
  }
  console.log("✓ no EXIF/XMP/IPTC in any output");
}

writeManifest(
  join(ROOT, "lib", "generated", "assets.ts"),
  "assetManifest",
  "{\n  src: string;\n  srcSet: string;\n  width: number;\n  height: number;\n}",
  manifest
);

writeManifest(
  join(ROOT, "lib", "generated", "case-figures.ts"),
  "caseFigureManifest",
  "{\n  src: string;\n  srcSet: string;\n  width: number;\n  height: number;\n}",
  figures
);

console.log(
  `\nWeight: sources ${bytes(sourceBytes)} → outputs ${bytes(outputBytes)}` +
    (sourceBytes ? ` (${Math.round((outputBytes / sourceBytes) * 100)}%)` : "")
);
console.log(`Manifest: lib/generated/assets.ts (${Object.keys(manifest).length} entries)`);
console.log(`Manifest: lib/generated/case-figures.ts (${Object.keys(figures).length} entries)\n`);
