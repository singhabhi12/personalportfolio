#!/usr/bin/env node
/**
 * B1's hard rule, enforced.
 *
 * No hex colour, px literal, rgba(), or raw font stack may appear anywhere
 * except on a custom-property declaration. Tokens are declared once; every
 * rule consumes them. Run with `npm run lint:tokens`.
 *
 * Three things are legitimately exempt:
 *   - `@media` breakpoints — CSS variables do not work in media queries.
 *   - `font-family` whose value is entirely var() references.
 *   - Lines marked `/ * token-exempt * /` in components, for lengths computed
 *     from lib/content.ts data (natural image sizes, projected map coords).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const RULES = [
  { name: "hex colour", re: /#[0-9a-fA-F]{3,8}\b/ },
  { name: "px literal", re: /(?<![\w-])-?\d*\.?\d+px\b/ },
  { name: "rgba()", re: /\brgba?\(/ },
  {
    name: "raw font stack",
    // font-family whose value still holds something that is not a var() ref.
    re: /font-?[Ff]amily\s*:\s*(?![^;]*$)/,
    test: (line) => {
      const match = line.match(/font-?[Ff]amily\s*:\s*([^;}]+)/);
      if (!match) return false;
      return match[1].replace(/var\(--[\w-]+\)/g, "").replace(/[\s,'"]/g, "") !== "";
    },
  },
];

const isTokenDeclaration = (line) => /^\s*--[\w-]+\s*:/.test(line.trim());
const isAtRule = (line) => /^\s*@(media|supports|container)/.test(line);

/** Blank out block comments across the whole file so line numbers survive. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, (m, p) => p);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === "out") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(css|tsx|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

const violations = [];
const files = [
  ...walk(join(ROOT, "app")),
  ...walk(join(ROOT, "components")),
  ...walk(join(ROOT, "lib")),
];

for (const file of files) {
  const isCss = file.endsWith(".css");
  const source = readFileSync(file, "utf8");
  const stripped = stripComments(source).split("\n");
  const original = source.split("\n");

  stripped.forEach((line, index) => {
    if (!line.trim()) return;
    if (isCss && isTokenDeclaration(line)) return;
    if (isCss && isAtRule(line)) return;
    // An exemption marker counts on the line itself or in the comment above it.
    if (
      !isCss &&
      [original[index], original[index - 1], original[index - 2]].some((l) =>
        /token-exempt/.test(l ?? "")
      )
    ) {
      return;
    }

    for (const rule of RULES) {
      const hit = rule.test ? rule.test(line) : rule.re.test(line);
      if (hit) {
        violations.push({
          file: relative(ROOT, file),
          line: index + 1,
          rule: rule.name,
          text: original[index].trim().slice(0, 100),
        });
      }
    }
  });
}

if (violations.length === 0) {
  console.log("✓ tokens: no hex, px, rgba, or raw font stack outside :root declarations");
  process.exit(0);
}

console.error(`✗ tokens: ${violations.length} violation(s)\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${v.text}`);
}
process.exit(1);
