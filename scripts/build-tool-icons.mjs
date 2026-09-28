#!/usr/bin/env node
/**
 * Stages real tool icons from `@lobehub/icons-static-svg` into raw/tools/.
 *
 *   node_modules/@lobehub/icons-static-svg/icons/<id>.svg  →  raw/tools/<name>.svg
 *
 * `npm run assets` then copies raw/tools/ into public/tools/ verbatim, which is
 * where lib/content.ts already points (`/tools/<name>.svg`). No component change.
 *
 * The pack is a third-party redistribution of trademarked marks rather than a
 * vendor press kit — see README, "Sourcing app icons". It is an AI/LLM brand
 * collection, so it only carries the tools that are AI companies; anything it
 * does not cover is listed at the end and still needs its vendor press kit.
 *
 * Marks are copied as drawn. The only edits are to make them render correctly
 * as a standalone `<img src>`: `currentColor` has no inherited colour in that
 * context, and `1em` sizing has no font to resolve against.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PACK = join(ROOT, "node_modules", "@lobehub", "icons-static-svg", "icons");
const RAW_TOOLS = join(ROOT, "raw", "tools");

const SIZE = 44; // --tool-size, and what the placeholders declared

/* Mirrors `tools` in lib/content.ts, in order.
   `slug`  — the filename content.ts points at; not always the lowercased name.
   `icon`  — file in the pack, preferring the native-colour variant (§7 wants
             the marks untouched and colourful).
   `color` — only for marks the pack draws with `fill="currentColor"`; this is
             the mark's own brand colour, not a recolour. */
const TOOLS = [
  { name: "Figma", slug: "figma", icon: "figma-color" },
  { name: "Claude", slug: "claude", icon: "claude-color" },
  { name: "VS Code", slug: "vscode", icon: null }, // not in the pack — AI/LLM brands only
  { name: "Xcode", slug: "xcode", icon: null },
  /* The pack draws the cube in currentColor; Notion's mark is black. */
  { name: "Notion", slug: "notion", icon: "notion", color: "#000000" },
  /* Adobe's app icon, from Wikimedia Commons (PD-textlogo) — supplied by hand. */
  { name: "Lightroom", slug: "lightroom", icon: null },
  /* The pack draws the knot in currentColor; OpenAI's mark is black. */
  { name: "ChatGPT", slug: "chatgpt", icon: "openai", color: "#000000" },
];

function stage(spec) {
  const source = join(PACK, `${spec.icon}.svg`);
  if (!existsSync(source)) return { ok: false, why: `${spec.icon}.svg not in pack` };

  let svg = readFileSync(source, "utf8");

  /* Give the mark a real intrinsic size: `1em` resolves to nothing useful when
     the file is loaded through <img> rather than inlined next to text. */
  svg = svg.replace(/\bwidth="1em"/, `width="${SIZE}"`).replace(/\bheight="1em"/, `height="${SIZE}"`);

  /* Resolve `currentColor` to the mark's own colour for the same reason. */
  if (spec.color) svg = svg.replaceAll("currentColor", spec.color);

  writeFileSync(join(RAW_TOOLS, `${spec.slug}.svg`), svg);
  return { ok: true, bytes: Buffer.byteLength(svg) };
}

if (!existsSync(PACK)) {
  console.error("✗ @lobehub/icons-static-svg not installed — run `npm install`");
  process.exit(1);
}
mkdirSync(RAW_TOOLS, { recursive: true });

console.log("Tool icons ← @lobehub/icons-static-svg");
const missing = [];
for (const spec of TOOLS) {
  if (!spec.icon) {
    missing.push(spec.name);
    continue;
  }
  const r = stage(spec);
  if (!r.ok) {
    missing.push(spec.name);
    console.log(`  ${spec.name}: ${r.why}`);
    continue;
  }
  console.log(`  ${spec.icon}.svg → raw/tools/${spec.slug}.svg (${r.bytes} B)`);
}

if (missing.length > 0) {
  console.log(
    `\n  ${missing.join(", ")} — not in the pack. Still on the hatch placeholder;\n` +
      `  source from the vendor press kit into raw/tools/ (see README).`
  );
}
console.log("\nNext: npm run assets");
