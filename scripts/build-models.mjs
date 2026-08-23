#!/usr/bin/env node
/**
 * The contact studio's two props, cut down for the web.
 *
 * Source is the untracked `3d Model/` folder — Sketchfab downloads that ship
 * every format at once. Only `.glb` is a browser format: `.usdz` is Apple's AR
 * Quick Look container and `.fbx` is an authoring interchange file, so both are
 * ignored here.
 *
 * The downloads are unusable as-is — the mailbox is 59MB, and 58.9MB of that is
 * three 4K PNG texture maps wrapped around 1,854 triangles. Every one of those
 * maps is thrown away: §7 gives this site one warm palette and the props are
 * recoloured to it at runtime (see lib/desk-scene.ts), so a photographic
 * basecolour of somebody's blue American mailbox is not just weight, it is the
 * wrong colour. What survives is geometry, the material *names* that let the
 * runtime tell a key from a ribbon, and the node names the choreography drives.
 *
 * Also emitted: lib/generated/models.ts, carrying each model's measured bounds
 * and the platen anchor the letter is posted to. Measuring at build time is
 * what lets the scene place the sheet without a magic number in the component.
 *
 * Run with `npm run models`. Output lands in public/models/.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, getBounds, meshopt, prune, simplify, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = join(ROOT, "public", "models");
const GEN_DIR = join(ROOT, "lib", "generated");

/* `paperNode` names the mesh the letter is fed from. It is deleted, not hidden:
   the sheet in the platen is a DOM element in the same 3D space (a real
   <textarea> — see components/ContactStudio.tsx), and two sheets in one roller
   is one sheet too many. Its bounds are measured before it goes, which is where
   the platen anchor comes from. */
const MODELS = [
  {
    key: "typewriter",
    /* The 6.1MB export, not the 9.1MB one beside it: identical geometry
       (103,297 triangles, vertex for vertex), only the texture encoding
       differs — and the textures are the part being discarded. */
    src: "3d Model/Type writer/typewriter (1).glb",
    out: "typewriter.glb",
    paperNode: "Neri_Royal_typewriter_Paper_0",
    simplify: 0.4,
  },
  {
    key: "letterbox",
    src: "3d Model/Letterbox/us_mailbox.glb",
    out: "letterbox.glb",
    paperNode: null,
    /* 1,854 triangles already — nothing to take out. */
    simplify: 0,
  },
];

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;

const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const round = (n) => Number(n.toFixed(4));
const vec = (v) => `[${v.map(round).join(", ")}]`;
const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

/** Every texture slot on every material, cut. prune() then collects the images. */
function stripTextures(document) {
  for (const material of document.getRoot().listMaterials()) {
    material
      .setBaseColorTexture(null)
      .setMetallicRoughnessTexture(null)
      .setNormalTexture(null)
      .setOcclusionTexture(null)
      .setEmissiveTexture(null);
  }
}

const entries = [];

for (const model of MODELS) {
  const srcPath = join(ROOT, model.src);
  const document = await io.read(srcPath);
  const root = document.getRoot();

  /* Measured before the paper mesh is removed and before quantize() rewrites
     positions, so the anchor is in the same units the runtime sees. */
  const paper = model.paperNode
    ? root.listNodes().find((node) => node.getName() === model.paperNode)
    : null;
  const paperBounds = paper ? getBounds(paper) : null;
  if (model.paperNode && !paper) {
    throw new Error(`${model.key}: no node named "${model.paperNode}" — the source model changed.`);
  }
  paper?.dispose();

  stripTextures(document);
  await document.transform(
    dedup(),
    /* Keeps the named materials even once nothing textures them — the runtime
       maps those names to palette roles, so an unused-looking material here is
       load-bearing there. */
    prune({ keepAttributes: false, keepLeaves: false, propertyTypes: ["Texture", "Accessor", "Mesh", "Node", "Skin", "Animation"] }),
    weld(),
    /* The typewriter arrives at 103K triangles — a film-set asset. It is shown
       at roughly a third of the viewport with no close-up, so most of that
       detail never reaches a pixel. `error` is a fraction of the model's own
       size, so the ratio is a floor the simplifier stops at rather than a
       target it must hit: silhouette survives, interior density does not. */
    ...(model.simplify
      ? [simplify({ simplifier: MeshoptSimplifier, ratio: model.simplify, error: 0.001 })]
      : []),
    /* Positions to 14 bits (sub-millimetre at this size), then the whole
       buffer meshopt-compressed. three decodes both natively — quantization
       needs no decoder at all, and EXT_meshopt_compression needs the 25KB
       wasm decoder that ships inside three itself. */
    meshopt({ encoder: MeshoptEncoder, level: "high" })
  );

  const sceneBounds = getBounds(root.listScenes()[0]);

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, model.out);
  writeFileSync(outPath, await io.writeBinary(document));

  entries.push({
    key: model.key,
    file: `/models/${model.out}`,
    bounds: sceneBounds,
    paperBounds,
    materials: root.listMaterials().map((m) => m.getName()),
  });

  const before = statSync(srcPath).size;
  const after = statSync(outPath).size;
  console.log(
    `  ${model.key.padEnd(10)} ${kb(before).padStart(7)} → ${kb(after).padStart(6)}  (${(100 - (after / before) * 100).toFixed(1)}% smaller)`
  );
}

const body = `/* Generated by scripts/build-models.mjs — do not edit.
   Bounds are in the model's own units, measured after the props were stripped
   of their textures and before the scene rescales them. */

export interface ModelBounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface ModelEntry {
  file: string;
  bounds: ModelBounds;
  /** Where the sheet sits in the platen. Typewriter only. */
  paperBounds: ModelBounds | null;
  /** Material names the palette maps onto — see lib/desk-scene.ts. */
  materials: string[];
}

export const models: Record<string, ModelEntry> = {
${entries
  .map(
    (e) => `  ${e.key}: {
    file: "${e.file}",
    bounds: { min: ${vec(e.bounds.min)}, max: ${vec(e.bounds.max)} },
    paperBounds: ${e.paperBounds ? `{ min: ${vec(e.paperBounds.min)}, max: ${vec(e.paperBounds.max)} }` : "null"},
    materials: [${e.materials.map((m) => JSON.stringify(m)).join(", ")}],
  },`
  )
  .join("\n")}
};
`;

mkdirSync(GEN_DIR, { recursive: true });
writeFileSync(join(GEN_DIR, "models.ts"), body);
console.log(`✓ models: ${entries.length} written to public/models/, bounds to lib/generated/models.ts`);
