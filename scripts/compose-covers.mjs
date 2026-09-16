#!/usr/bin/env node
/**
 * Composes a 16:10 cover for the projects that have no landscape shot of
 * their own, and writes it to raw/projects/<slug>.png, which `npm run assets`
 * then treats like any other cover — so this runs first.
 *
 * Two kinds. An app that only exists on a phone gets three of its screens
 * from raw/cases/<slug>/ on the drawer's paper tint, set the way the reading
 * column sets a figure: rounded, with a soft shadow, the middle one a step
 * forward. Nothing here is a device frame — the screen is the artefact, not
 * the phone. And a project whose work cannot be shown gets its mark from
 * raw/marks/<slug>.svg, centred on white — the same cover Dehidden and Chip
 * Count have, so an NDA reads as a logo card rather than as a missing image.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RAW = join(ROOT, "raw");

const W = 4800;
const H = 3000;
const SHEET = "#efece6";
/* Middle screen at this height; the outer two step down and back. */
const TALL = 2360;
const DROP = 140;
const GAP = 150;

const covers = {
  substrac: ["subscriptions", "dashboard", "insights"],
  stampp: ["collections", "passport", "result"],
};

/* Marks, and how much of the sheet's width each takes. A wordmark is wide
   and short, so it sits at under half the width to keep clear air around it. */
const marks = {
  kolsetu: 0.42,
};

const rounded = (w, h, r) =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);

async function screen(file, height) {
  const meta = await sharp(file).metadata();
  const width = Math.round((meta.width / meta.height) * height);
  const radius = Math.round(height * 0.055);
  const image = await sharp(file)
    .resize({ width, height })
    .composite([{ input: rounded(width, height, radius), blend: "dest-in" }])
    .png()
    .toBuffer();
  /* A shadow is the same rounded shape, black at low alpha, blurred, and set a
     little lower than the screen it belongs to. */
  const pad = Math.round(height * 0.06);
  const shadow = await sharp({
    create: { width: width + pad * 2, height: height + pad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: rounded(width, height, radius), top: pad, left: pad }])
    .png()
    .toBuffer();
  const blurred = await sharp(shadow)
    .blur(pad / 2)
    .linear(1, 0)
    .ensureAlpha(0.22)
    .png()
    .toBuffer();
  return { image, width, height, shadow: blurred, pad };
}

for (const [slug, share] of Object.entries(marks)) {
  const file = join(RAW, "marks", `${slug}.svg`);
  if (!existsSync(file)) {
    console.log(`  ${slug}: skipped — missing ${file}`);
    continue;
  }
  /* Rasterised at the width it will sit at, so the vector is never scaled
     after the fact. */
  const mark = await sharp(file, { density: 600 }).resize({ width: Math.round(W * share) }).png().toBuffer();
  const { width, height } = await sharp(mark).metadata();
  const out = join(RAW, "projects", `${slug}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite([{ input: mark, left: Math.round((W - width) / 2), top: Math.round((H - height) / 2) }])
    .png()
    .toFile(out);
  console.log(`  ${slug}: mark on white → raw/projects/${slug}.png`);
}

for (const [slug, names] of Object.entries(covers)) {
  const files = names.map((n) => join(RAW, "cases", slug, `${n}.png`));
  const missing = files.filter((f) => !existsSync(f));
  if (missing.length) {
    console.log(`  ${slug}: skipped — missing ${missing.join(", ")}`);
    continue;
  }
  const screens = await Promise.all(files.map((f, i) => screen(f, i === 1 ? TALL : TALL - DROP)));
  const total = screens.reduce((sum, s) => sum + s.width, 0) + GAP * (screens.length - 1);
  let x = Math.round((W - total) / 2);
  const layers = [];
  for (const s of screens) {
    const top = Math.round((H - s.height) / 2);
    layers.push({ input: s.shadow, left: x - s.pad, top: top - s.pad + Math.round(s.pad * 0.6) });
    layers.push({ input: s.image, left: x, top });
    x += s.width + GAP;
  }
  const out = join(RAW, "projects", `${slug}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: SHEET } })
    .composite(layers)
    .png()
    .toFile(out);
  console.log(`  ${slug}: ${names.join(" · ")} → raw/projects/${slug}.png`);
}
