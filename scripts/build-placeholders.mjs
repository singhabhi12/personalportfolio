import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/* Regenerates the hatch placeholders the design uses for unshot work.
   Real assets replace these via `npm run assets` / `npm run photos`; this
   script only exists so the placeholder set can be rebuilt or extended. */
const PUB = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/* The design's placeholder treatment: repeating-linear-gradient(45deg, A, A 10px, B 10px, B 20px) */
function hatch({ w, h, a, b, label, labelColor = "#8a877f", grayscale = false, fontSize }) {
  const period = Math.max(6, Math.round(w / 50)) * 2;
  const half = period / 2;
  const fs = fontSize ?? Math.max(11, Math.round(Math.min(w, h) / 26));
  const text = label
    ? `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${fs}" letter-spacing="${(fs * 0.04).toFixed(2)}" fill="${labelColor}">${label}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label ?? "placeholder"}">
  <defs>
    <pattern id="h" width="${period}" height="${period}" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="${period}" height="${period}" fill="${a}"/>
      <rect width="${half}" height="${period}" fill="${b}"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#h)"${grayscale ? ' filter="grayscale(1)"' : ""}/>
  ${text}
</svg>
`;
}

const write = (p, s) => {
  mkdirSync(join(PUB, p.split("/").slice(0, -1).join("/")), { recursive: true });
  writeFileSync(join(PUB, p), s);
};

/* ---- project screenshots (16:10) ---- */
const projects = [
  ["truts", "Truts"],
  ["application-hq", "Application HQ"],
  ["evmet", "Evmet"],
  ["dehidden", "Dehidden"],
  ["build-up", "Build Up"],
  ["chip-count", "Chip Count"],
];
for (const [slug, title] of projects) {
  write(`projects/${slug}.svg`, hatch({ w: 1600, h: 1000, a: "#efece6", b: "#e8e5df", label: `[ ${title} ]` }));
}

/* ---- portrait (B&W) ---- */
write("portrait.svg", hatch({ w: 800, h: 1000, a: "#ededed", b: "#e4e4e4", label: "[ B&amp;W portrait ]", labelColor: "#999999" }));

/* ---- gallery photos, natural ratios, varied paper tints ---- */
const gallery = [
  ["hamburg-2024", 900, 1200, "#efece6", "#e6e2db", "Hamburg · 2024"],
  ["speicherstadt-2024", 1400, 1050, "#ece9e2", "#e3dfd7", "Speicherstadt · 2024"],
  ["berlin-2023", 1100, 1100, "#eeeae3", "#e5e1d9", "Berlin · 2023"],
  ["amsterdam-2019", 1500, 1000, "#ebe7e0", "#e2ded6", "Amsterdam · 2019"],
  ["jaipur-2018", 1000, 1250, "#efeae2", "#e6e1d8", "Jaipur · 2018"],
  ["schwerin-2023", 900, 1200, "#ece8e1", "#e3ded6", "Schwerin · 2023"],
  ["halstenbek-2022", 1500, 1000, "#eeebe4", "#e5e1da", "Halstenbek · 2022"],
  ["alster-2025", 1100, 1100, "#edeae3", "#e4e0d8", "Alster · 2025"],
  ["berlin-2021", 1000, 1500, "#ece9e1", "#e3dfd6", "Berlin · 2021"],
];
for (const [slug, w, h, a, b, label] of gallery) {
  write(`gallery/${slug}.svg`, hatch({ w, h, a, b, label: `[ ${label} ]` }));
}

/* ---- tool icons ---- */
/* A real mark always wins — re-hatching over one would be a silent regression.
   Checked by content rather than by the presence of raw/tools/, because /raw is
   gitignored: on a fresh clone the only copy of a real mark is the one already
   committed under public/. Anything hatch() wrote carries the pattern marker. */
/* A real mark can arrive as either extension, and only hatch() writes the
   pattern marker — so any .png is by definition real, and a .svg is real unless
   it carries that marker.
   Both trees are checked, because each is the only copy in some situation: on a
   fresh clone /raw is gitignored and public/ holds the committed mark, while
   after a `rm -rf public/tools` rebuild only raw/ still has it. Checking public/
   alone re-hatches a dead .svg next to the real .png when this script runs
   before `npm run assets`. */
const RAW_TOOLS = join(dirname(fileURLToPath(import.meta.url)), "..", "raw", "tools");
const realAt = (dir, slug) =>
  existsSync(join(dir, `${slug}.png`)) ||
  (existsSync(join(dir, `${slug}.svg`)) &&
    !readFileSync(join(dir, `${slug}.svg`), "utf8").includes('<pattern id="h"'));
const hasRealMark = (slug) => realAt(join(PUB, "tools"), slug) || realAt(RAW_TOOLS, slug);
/* [label, slug] — mirrors `tools` in lib/content.ts; the slug is not always the
   lowercased label ("VS Code" → vscode). */
for (const [name, slug] of [
  ["Figma", "figma"],
  ["Claude", "claude"],
  ["VS Code", "vscode"],
  ["Xcode", "xcode"],
]) {
  if (hasRealMark(slug)) continue;
  write(`tools/${slug}.svg`, hatch({ w: 44, h: 44, a: "#efece6", b: "#e8e5df", label: name, fontSize: 8 }));
}

/* v1 leftovers — the Off Screen section no longer exists */
rmSync(join(PUB, "offscreen"), { recursive: true, force: true });

console.log("assets written");
