/* Shared image helpers for the asset and photo pipelines.
   sharp drops all metadata unless you explicitly ask for it back, so every
   output here is EXIF-free by construction. verifyClean() proves it. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

export const SOURCE_EXT = /\.(jpe?g|png|webp|tiff?|heic)$/i;

export const slugOf = (file) =>
  basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function listSources(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => SOURCE_EXT.test(f))
      .sort()
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

export const bytes = (n) =>
  n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;

/**
 * Emit WebP at each requested width plus one JPG fallback at the largest.
 * Natural aspect ratio is always preserved — width is the only constraint,
 * and sources smaller than a target width are never upscaled.
 *
 * `grayscale` bakes black-and-white into the output rather than leaving it to
 * a CSS filter: the colour channels are never shipped, and a grey JPEG/WebP
 * compresses substantially smaller than the colour original.
 */
export async function emitVariants(
  source,
  outDir,
  slug,
  widths,
  { quality = 82, grayscale = false } = {}
) {
  mkdirSync(outDir, { recursive: true });

  const input = sharp(source, { failOn: "none" });
  const meta = await input.metadata();
  // Respect the EXIF orientation flag before we discard the metadata.
  let rotated = sharp(source, { failOn: "none" }).rotate();
  if (grayscale) rotated = rotated.grayscale();
  const natural = { width: meta.width, height: meta.height };
  if (meta.orientation && meta.orientation >= 5) {
    natural.width = meta.height;
    natural.height = meta.width;
  }

  const usable = widths.filter((w) => w <= natural.width);
  /* A source narrower than the largest target would otherwise cap out at the
     next step down — a 768px original shipping as 400w and going soft the
     moment a tile is wider than that. Its own width is the honest ceiling:
     still never upscaled, but never thrown away either. */
  if (!usable.includes(natural.width) && natural.width < Math.max(...widths)) {
    usable.push(natural.width);
  }
  usable.sort((a, b) => a - b);

  const written = [];
  for (const width of usable) {
    const file = join(outDir, `${slug}-${width}.webp`);
    await rotated.clone().resize({ width }).webp({ quality }).toFile(file);
    written.push({ file, width, size: statSync(file).size });
  }

  const largest = usable[usable.length - 1];
  const fallback = join(outDir, `${slug}.jpg`);
  await rotated.clone().resize({ width: largest }).jpeg({ quality, mozjpeg: true }).toFile(fallback);

  return { natural, written, fallback, fallbackSize: statSync(fallback).size };
}

/** ~20px blurred WebP, inlined as a data URI so tiles never pop in. */
export async function makeLqip(source, width = 20) {
  const buffer = await sharp(source, { failOn: "none" })
    .rotate()
    .resize({ width })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

/**
 * Prove no EXIF survived. sharp's own metadata read catches EXIF/XMP/ICC
 * blocks; exiftool, when installed, is the stronger second opinion and is the
 * one that names GPS tags explicitly.
 */
export async function verifyClean(files) {
  const problems = [];

  for (const file of files) {
    const meta = await sharp(file).metadata();
    for (const field of ["exif", "xmp", "iptc"]) {
      if (meta[field]) problems.push(`${file}: ${field} block survived`);
    }
  }

  let exiftoolAvailable = true;
  try {
    execFileSync("exiftool", ["-ver"], { stdio: "ignore" });
  } catch {
    exiftoolAvailable = false;
  }

  if (exiftoolAvailable) {
    for (const file of files) {
      const out = execFileSync("exiftool", ["-gps:all", "-s", file], {
        encoding: "utf8",
      }).trim();
      if (out) problems.push(`${file}: GPS tags survived —\n${out}`);
    }
  }

  return { problems, exiftoolAvailable };
}

/** Write a typed TS module the app can import without tsconfig changes. */
export function writeManifest(path, exportName, typeBody, data) {
  const body = `/* GENERATED — do not edit. Run the matching npm script instead. */

export interface GeneratedAsset ${typeBody}

export const ${exportName}: Record<string, GeneratedAsset> = ${JSON.stringify(data, null, 2)};
`;
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, body);
}
