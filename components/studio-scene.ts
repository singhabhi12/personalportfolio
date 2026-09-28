/* The WebGL half of the contact studio: two props, three lights, one shadow.

   Everything this module does is described by lib/desk-scene.ts — placement,
   finishes, camera, the anchors the letter is hung from. What lives here is
   only the three.js that carries it out, which is why this file names no colour
   and no position of its own.

   Loaded by dynamic import, so three.js and the two models are a chunk that
   only /contact ever fetches, and only after the form beneath it is already
   usable. */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { models } from "@/lib/generated/models";
import {
  DEFAULT_FINISH,
  FINISHES,
  KEYS,
  LENS,
  LID,
  LIGHTS,
  MATERIAL_FINISH,
  type FinishName,
  type Placement,
  type Stage,
  type Vec3,
} from "@/lib/desk-scene";

/* Same trick PlacesMap uses: the palette is read back out of the stylesheet at
   runtime rather than restated here, so §7's tokens stay the one source of
   colour even for surfaces that are lit rather than painted. */
const cssToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const tokenColor = (name: string) => new THREE.Color().setStyle(cssToken(name));

/** Where a world point lands on the canvas, and how big a scene unit is there. */
export interface Projection {
  x: number;
  y: number;
  /** Pixels per scene unit at that point's depth. */
  unit: number;
}

/** Everything the props react to. All of it decays back to 0 on its own. */
export interface StudioState {
  /** A keystroke, 1 at the moment of the strike. Nudges the machine. */
  clack: number;
  /** The box taking a letter: a signed impulse that rocks and settles it. */
  recoil: number;
  /** The box lighting up as it swallows one, 0–1. */
  receive: number;
  /** The lid: 0 shut, 1 fully open. */
  flap: number;
  /** Keystrokes since the page loaded. The scene only reads the *difference*
      from the last frame, so it needs no notion of which key or what letter —
      it counts how many caps to strike and picks them itself. */
  strikes: number;
}

export interface Studio {
  /** `dt` is the loop's own frame time, in ms — the scene keeps no clock of its
      own, so everything that decays here decays on the same one the
      choreography runs on. */
  render(state: StudioState, dt: number): void;
  project(point: Vec3): Projection;
  /** Canvas size in CSS pixels — the letter is positioned in the same space. */
  readonly size: { width: number; height: number };
  dispose(): void;
}

/** True when this browser can give us a context worth building a scene in. */
export function supportsWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

function finishFor(materialName: string): FinishName {
  return MATERIAL_FINISH[materialName] ?? DEFAULT_FINISH;
}

/** One MeshStandardMaterial per finish, shared by every mesh that wears it. */
function buildFinishes() {
  const built = {} as Record<FinishName, THREE.MeshStandardMaterial>;
  for (const [name, finish] of Object.entries(FINISHES)) {
    built[name as FinishName] = new THREE.MeshStandardMaterial({
      color: tokenColor(finish.token),
      roughness: finish.roughness,
      metalness: finish.metalness,
    });
  }
  return built;
}

/* Fitted, not scaled: the two downloads arrive at unrelated sizes, so each is
   measured, resized to the width or height lib/desk-scene.ts asks for, and set
   down with its base on the ground and its footprint centred on its mark. The
   group is what gets placed and turned, so the fit never has to know about the
   rotation and the rotation never has to undo the fit. */
function placeProp(source: THREE.Object3D, place: Placement) {
  const box = new THREE.Box3().setFromObject(source);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const scale = place.size / (place.fit === "width" ? size.x : size.y);

  source.scale.setScalar(scale);
  source.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);

  const group = new THREE.Group();
  group.add(source);
  group.position.set(...place.position);
  group.rotation.y = place.turn * Math.PI * 2;
  return group;
}

/* Connected components of a mesh, as lists of triangle numbers.

   Vertices are first merged by position, because the pieces of this model are
   only joined *geometrically* — a corner shared by two triangles is two
   vertices with two normals, and walking the index buffer alone would report
   every smooth-shaded face as its own island. Merge first and the walk finds
   the seven small parts that make up the lid and the one large one that does
   not, which is the whole point of doing this. */
function islands(geometry: THREE.BufferGeometry): number[][] {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = position.count;
  const triangles = index ? index.count / 3 : count / 3;
  const vertex = (t: number, corner: number) =>
    index ? index.getX(t * 3 + corner) : t * 3 + corner;

  const parent = new Int32Array(count);
  for (let i = 0; i < count; i++) parent[i] = i;
  const find = (i: number) => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]];
    return i;
  };
  const join = (a: number, b: number) => {
    a = find(a);
    b = find(b);
    if (a !== b) parent[b] = a;
  };

  /* Sub-millimetre at this model's scale, and coarse enough that two corners
     meant to be the same corner survive the export's rounding as one. */
  const grid = 1e4;
  const seen = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const key = `${Math.round(position.getX(i) * grid)},${Math.round(position.getY(i) * grid)},${Math.round(position.getZ(i) * grid)}`;
    const first = seen.get(key);
    if (first === undefined) seen.set(key, i);
    else join(first, i);
  }
  for (let t = 0; t < triangles; t++) {
    join(vertex(t, 0), vertex(t, 1));
    join(vertex(t, 1), vertex(t, 2));
  }

  const groups = new Map<number, number[]>();
  for (let t = 0; t < triangles; t++) {
    const root = find(vertex(t, 0));
    const group = groups.get(root);
    if (group) group.push(t);
    else groups.set(root, [t]);
  }
  return [...groups.values()];
}

/* The models are shipped quantized — positions are 16-bit integers read back
   through a scale on the node above them (see scripts/build-models.mjs, which
   is where the download stops being 59MB). three renders that natively and it
   costs nothing to draw, but it cannot be *written*: baking a transform into a
   normalized short attribute puts every coordinate back through the same
   [-1, 1] range it came out of, and the model arrives crushed into a unit cube.

   So the one prop that gets taken apart is widened to plain floats first. It is
   1,508 vertices, once, and only the box is ever rebuilt this way. */
function widen(geometry: THREE.BufferGeometry) {
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    if (!attribute.normalized) continue;
    const wide = new Float32Array(attribute.count * attribute.itemSize);
    for (let i = 0; i < attribute.count; i++) {
      for (let item = 0; item < attribute.itemSize; item++) {
        wide[i * attribute.itemSize + item] = attribute.getComponent(i, item);
      }
    }
    geometry.setAttribute(name, new THREE.BufferAttribute(wide, attribute.itemSize));
  }
}

/** One island's bounding box, so it can be asked how high off the ground it is. */
function islandBox(geometry: THREE.BufferGeometry, triangles: number[]) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const box = new THREE.Box3();
  const point = new THREE.Vector3();
  for (const t of triangles) {
    for (let corner = 0; corner < 3; corner++) {
      const i = index ? index.getX(t * 3 + corner) : t * 3 + corner;
      box.expandByPoint(point.fromBufferAttribute(position, i));
    }
  }
  return box;
}

/** The vertices an island touches, each one once. */
function islandVertices(geometry: THREE.BufferGeometry, triangles: number[]): number[] {
  const index = geometry.getIndex();
  const seen = new Set<number>();
  for (const t of triangles) {
    for (let corner = 0; corner < 3; corner++) {
      seen.add(index ? index.getX(t * 3 + corner) : t * 3 + corner);
    }
  }
  return [...seen];
}

/** A keyboard that can be typed on: one struck cap springing back at a time. */
interface Keyboard {
  /** Strike `count` caps, chosen at random. */
  strike(count: number): void;
  /** Let everything that is down come back up, `dt` milliseconds' worth. */
  settle(dt: number): void;
}

/* Fifty-three keys out of one mesh.

   The caps are moved by writing their vertices rather than by being cut into
   fifty-three meshes on fifty-three pivots — which was the first version, and
   cost fifty-three draw calls to animate perhaps four caps at a time. Here the
   geometry stays one object and one draw call, and a strike rewrites the forty
   vertices of a single cap. The whole position buffer is 25KB, so re-uploading
   it costs less than the bookkeeping of avoiding it, and it is only re-uploaded
   while something is actually moving.

   `down` is the machine's own down, found by pulling world -Y back through the
   mesh's transform. Nothing here is baked, so the caps stay in the frame the
   rest of the typewriter is in and the fit can still resize all of it. */
function buildKeyboard(mesh: THREE.Mesh): Keyboard | null {
  const geometry = mesh.geometry;
  widen(geometry);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const caps = islands(geometry).map((island) => islandVertices(geometry, island));
  if (caps.length < 2) return null;

  mesh.updateWorldMatrix(true, false);
  const down = new THREE.Vector3(0, -1, 0).transformDirection(
    new THREE.Matrix4().copy(mesh.matrixWorld).invert()
  );

  /* One travel for every cap, taken from the middle of the range rather than
     from each cap's own height: the space bar and the two shift keys are a
     different shape, and a key that sinks in proportion to its own size reads
     as a keyboard made of different mechanisms. */
  const point = new THREE.Vector3();
  const heights = caps.map((cap) => {
    let low = Infinity;
    let high = -Infinity;
    for (const vertex of cap) {
      const along = point.fromBufferAttribute(position, vertex).dot(down);
      if (along < low) low = along;
      if (along > high) high = along;
    }
    return high - low;
  });
  const travel = KEYS.travel * [...heights].sort((a, b) => a - b)[heights.length >> 1];

  const array = position.array as Float32Array;
  const rest = new Float32Array(array);
  const pressed = new Float32Array(caps.length);
  let moving = false;

  return {
    strike(count) {
      for (let n = 0; n < count; n++) {
        /* A cap already on its way down is a poor choice — it would restart
           halfway through its own return and read as a stutter rather than as
           a second keystroke. Two more tries is enough at fifty-three keys and
           bounded, which a while loop would not be. */
        let cap = Math.floor(Math.random() * caps.length);
        for (let retry = 0; retry < 2 && pressed[cap] > 0.5; retry++) {
          cap = Math.floor(Math.random() * caps.length);
        }
        pressed[cap] = 1;
        moving = true;
      }
    },

    settle(dt) {
      if (!moving) return;
      let stillMoving = false;
      for (let cap = 0; cap < caps.length; cap++) {
        if (pressed[cap] <= 0) continue;
        pressed[cap] *= Math.exp(-dt / KEYS.release);
        /* Cut it off rather than let it approach zero forever, and take the
           frame that does so to write the cap back to its exact rest position —
           otherwise the keyboard ends the day a hair below where it started. */
        if (pressed[cap] < 0.002) pressed[cap] = 0;
        else stillMoving = true;
        const dip = pressed[cap] * travel;
        for (const vertex of caps[cap]) {
          array[vertex * 3] = rest[vertex * 3] + down.x * dip;
          array[vertex * 3 + 1] = rest[vertex * 3 + 1] + down.y * dip;
          array[vertex * 3 + 2] = rest[vertex * 3 + 2] + down.z * dip;
        }
      }
      position.needsUpdate = true;
      moving = stillMoving;
    },
  };
}

/* Takes the lid off the box.

   The model is flattened first — every node transform baked into one geometry —
   so that the islands, the height test and the hinge are all measured in the
   same upright space lib/desk-scene.ts describes, rather than in whatever frame
   a chain of ±90° Sketchfab rotations happens to leave behind.

   Body and lid then share one set of vertex attributes and differ only in their
   index buffers, which is why the lid is hinged by moving a *group* rather than
   by translating the geometry: there is only one copy of the geometry to move,
   and the body is using it. Returns the pivot to turn, or null if the model
   ever arrives without a lid to find — in which case the box simply does not
   open, which is a duller scene and not a broken one. */
function liftLid(root: THREE.Object3D): THREE.Group | null {
  root.updateWorldMatrix(true, true);

  const meshes: THREE.Mesh[] = [];
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) meshes.push(object);
  });
  if (meshes.length !== 1) return null;

  const mesh = meshes[0];
  const geometry = mesh.geometry.clone();
  widen(geometry);
  geometry.applyMatrix4(mesh.matrixWorld);
  mesh.geometry.dispose();

  geometry.computeBoundingBox();
  const whole = geometry.boundingBox!;
  const floats = whole.min.y + (whole.max.y - whole.min.y) * LID.above;

  const lidTriangles: number[] = [];
  const bodyTriangles: number[] = [];
  for (const island of islands(geometry)) {
    (islandBox(geometry, island).min.y >= floats ? lidTriangles : bodyTriangles).push(...island);
  }
  if (!lidTriangles.length || !bodyTriangles.length) return null;

  const index = geometry.getIndex();
  const corners = (triangles: number[]) => {
    const out = new Uint32Array(triangles.length * 3);
    triangles.forEach((t, n) => {
      for (let corner = 0; corner < 3; corner++) {
        out[n * 3 + corner] = index ? index.getX(t * 3 + corner) : t * 3 + corner;
      }
    });
    return out;
  };

  const part = (triangles: number[]) => {
    const cut = new THREE.BufferGeometry();
    for (const name of Object.keys(geometry.attributes)) {
      cut.setAttribute(name, geometry.getAttribute(name));
    }
    cut.setIndex(new THREE.BufferAttribute(corners(triangles), 1));
    return new THREE.Mesh(cut, mesh.material);
  };

  const body = part(bodyTriangles);
  const lid = part(lidTriangles);
  for (const piece of [body, lid]) {
    piece.castShadow = true;
    piece.receiveShadow = true;
  }

  const lidBox = islandBox(geometry, lidTriangles);
  const hinge = new THREE.Vector3(
    0,
    THREE.MathUtils.lerp(lidBox.min.y, lidBox.max.y, LID.hinge.y),
    THREE.MathUtils.lerp(lidBox.min.z, lidBox.max.z, LID.hinge.z)
  );

  const pivot = new THREE.Group();
  pivot.position.copy(hinge);
  lid.position.copy(hinge).negate();
  pivot.add(lid);

  root.clear();
  root.add(body, pivot);
  return pivot;
}

/** Builds the scene as `stage` describes it — see STAGES in lib/desk-scene.ts. */
export async function createStudio(canvas: HTMLCanvasElement, stage: Stage): Promise<Studio> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    /* The page's own paper is the background. A cleared colour here would put a
       second, subtly different cream behind the props. */
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(LENS.fov, 1, LENS.near, LENS.far);
  const view = stage.view;
  const target = new THREE.Vector3(...view.target);
  const direction = new THREE.Vector3(...view.direction).normalize();

  /* A procedural soft-box, generated once and thrown away. Two directional
     lights alone leave the ink body reading as flat charcoal and the coral box
     as a coral silhouette; an environment is what puts a rolled highlight on
     the platen knobs and a gradient down the side of the box. It costs one
     render at startup and no download at all — the room is geometry, not an
     HDR file. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;
  pmrem.dispose();

  /* Lights */
  const key = new THREE.DirectionalLight(tokenColor(LIGHTS.key.token), LIGHTS.key.intensity);
  key.position.set(...LIGHTS.key.position);
  key.castShadow = true;
  key.shadow.mapSize.set(LIGHTS.shadow.mapSize, LIGHTS.shadow.mapSize);
  key.shadow.radius = LIGHTS.shadow.radius;
  key.shadow.bias = LIGHTS.shadow.bias;
  const area = LIGHTS.shadow.area;
  Object.assign(key.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far: 12 });
  key.shadow.camera.updateProjectionMatrix();
  scene.add(key);

  const fill = new THREE.DirectionalLight(tokenColor(LIGHTS.fill.token), LIGHTS.fill.intensity);
  fill.position.set(...LIGHTS.fill.position);
  scene.add(fill);

  scene.add(
    new THREE.HemisphereLight(
      tokenColor(LIGHTS.bounce.sky),
      tokenColor(LIGHTS.bounce.ground),
      LIGHTS.bounce.intensity
    )
  );

  /* The desk. Invisible except where something stands on it — a ShadowMaterial
     draws the shadow and nothing else, so the props sit on the page's own paper
     rather than on a plane the size of a table. */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2),
    new THREE.ShadowMaterial({ color: tokenColor("--color-body"), opacity: LIGHTS.shadow.opacity })
  );
  ground.receiveShadow = true;
  scene.add(ground);

  /* Props */
  const finishes = buildFinishes();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

  const [typewriterGltf, letterboxGltf] = await Promise.all([
    loader.loadAsync(models.typewriter.file),
    loader.loadAsync(models.letterbox.file),
  ]);

  const dressed: THREE.Object3D[] = [];
  /* Caught on the way past, because this is the last moment the download's own
     material names are still attached to anything. */
  let keycaps: THREE.Mesh | null = null;
  for (const gltf of [typewriterGltf, letterboxGltf]) {
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const source = object.material as THREE.Material;
      if (source.name === KEYS.material) keycaps = object;
      object.material = finishes[finishFor(source.name)];
      source.dispose();
    });
    dressed.push(gltf.scene);
  }
  const keyboard = keycaps ? buildKeyboard(keycaps) : null;

  /* Before the fit, so the lid is measured and hinged in the model's own
     upright space and the fit then carries the pivot along with everything
     else — placeProp only ever touches the group it wraps. */
  const lidPivot = liftLid(letterboxGltf.scene);

  const typewriter = placeProp(typewriterGltf.scene, stage.props.typewriter);
  const letterbox = placeProp(letterboxGltf.scene, stage.props.letterbox);
  scene.add(typewriter, letterbox);

  const typewriterRest = typewriter.position.y;
  const letterboxRest = letterbox.position.y;
  /* Only the box glows, and only while it is taking a letter, so the emissive
     is put on a clone rather than on the shared accent finish — the ribbon on
     the typewriter wears the same colour and should not light up with it. */
  const boxFinish = finishes.accent.clone();
  boxFinish.emissive = tokenColor("--color-accent");
  boxFinish.emissiveIntensity = 0;
  letterboxGltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) object.material = boxFinish;
  });

  /* Sizing. The stage can be any shape; the composition was framed for the
     slab `view.frame` names, so anything narrower than that opens the vertical
     angle rather than letting the box slide out of frame, and anything wider
     just shows more desk. */
  const size = { width: 0, height: 0 };

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    if (width === size.width && height === size.height) return;
    size.width = width;
    size.height = height;

    const aspect = width / height;
    camera.aspect = aspect;

    /* Solve for the distance at which the framed slab fits — vertically and
       horizontally — and stand the camera there along its fixed direction. The
       lens never changes, so neither does the perspective. */
    const half = Math.tan((LENS.fov * Math.PI) / 360);
    const distance = Math.max(
      view.frame.height / 2 / half,
      view.frame.width / 2 / (half * aspect)
    );
    camera.position.copy(direction).multiplyScalar(distance).add(target);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    renderer.setSize(width, height, false);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const scratch = new THREE.Vector3();
  /* Keystrokes already answered. The state carries a running total rather than
     a flag, so a frame that arrives late finds two strikes waiting and plays
     both, instead of silently dropping one. */
  let struck = 0;

  return {
    size,

    render(state, dt) {
      resize();
      /* The machine answers a keystroke the way a real one does: it drops a
         fraction of a millimetre and comes back. Small enough that it is felt
         rather than seen — at any larger amplitude, typing a paragraph turns
         into a paragraph of shaking. */
      typewriter.position.y = typewriterRest - state.clack * 0.004;
      typewriter.rotation.z = state.clack * 0.0016;

      /* And a key goes down under the finger that caused it. The body's nudge
         above is what the machine does; this is what the typist does, and it is
         the half that makes the other half read as a keystroke rather than as a
         wobble. */
      if (keyboard) {
        if (state.strikes > struck) keyboard.strike(state.strikes - struck);
        struck = state.strikes;
        keyboard.settle(dt);
      }

      /* The box takes the weight: it rocks back on its base, drops a little,
         and lights from within for as long as it is swallowing. Everything the
         letter cannot say once it has stopped being drawn is said here. */
      letterbox.rotation.x = state.recoil * 0.095;
      letterbox.position.y = letterboxRest - Math.abs(state.recoil) * 0.014;
      boxFinish.emissiveIntensity = state.receive * 0.5;

      /* And the lid turns on its hinge. The pivot lives inside the fitted
         model, so this is a rotation about the model's own X — which the
         group's Y turn then carries round with the rest of the box, exactly as
         a hinge bolted to a box does. */
      if (lidPivot) lidPivot.rotation.x = state.flap * LID.swing * Math.PI * 2;

      renderer.render(scene, camera);
    },

    project(point) {
      scratch.set(...point);
      /* View-space depth, not distance to the camera: the perspective divide
         only ever uses z, so distance would make the sheet swell as it moved to
         the side of frame. */
      const depth = -scratch.clone().applyMatrix4(camera.matrixWorldInverse).z;
      scratch.project(camera);
      return {
        x: (scratch.x * 0.5 + 0.5) * size.width,
        y: (-scratch.y * 0.5 + 0.5) * size.height,
        unit: size.height / (2 * Math.tan((camera.fov * Math.PI) / 360) * depth),
      };
    },

    dispose() {
      observer.disconnect();
      for (const material of [...Object.values(finishes), boxFinish, ground.material as THREE.Material]) {
        material.dispose();
      }
      ground.geometry.dispose();
      for (const root of dressed) {
        root.traverse((object) => {
          if (object instanceof THREE.Mesh) object.geometry.dispose();
        });
      }
      renderer.dispose();
    },
  };
}
