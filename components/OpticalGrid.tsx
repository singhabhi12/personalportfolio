"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/content";
import { isStill } from "@/lib/motion";

/* The optical grid — the gallery as a strip of photographs drifting past a
   lens.

   The layout is the Figma prototype's "3×3 Optical Grid" scene, taken over
   number for number: three columns of 400×476 cells on a 16px gap with a 32px
   corner, rolling upward at 80px a second on a loop that closes on itself.
   What the prototype added on top of the flat scroll is a lens: the middle
   row sits flat and the rows above and below it fan out toward the edges of
   the stage, the way a grid looks through a wide glass. The prototype stood
   the strip in a wide 2196-unit stage; here it is stretched to the screen
   with only a sliver of paper either side.

   A lens bends the rectangles themselves, which no CSS transform can do — so
   the grid is a texture and the stage is one WebGL quad whose fragment shader
   looks up each screen pixel through the distortion. The whole loop is laid
   out once in an atlas texture; scrolling is a single uniform, so a frame
   costs nothing but the draw. The cells are painted into the atlas one at a
   time as their photographs arrive, the LQIP first so nothing pops in.

   The stage is the viewport: the route has no frame. Pointer work mirrors
   the shader's maths in JS: the same lens, run for the one pixel under the
   cursor, says which photograph it is over — asked again every frame, since
   the strip moves under a cursor that does not. Scroll wheel and drag move
   the strip; a click opens the lightbox. The drift pauses while the cursor is
   on a photograph, since a target that moves under the cursor is a target
   that gets missed, and carries on while it is over paper or a gap.
   `?motion=still` holds it still altogether — it keeps rolling under
   `prefers-reduced-motion`, on the same argument the record and the Life
   tile make: it is the page's one subject, and it stops the moment it is
   looked at.

   No WebGL, and the caller falls back to the masonry. */

const SCENE = {
  cell: 400,
  cellHeight: 476,
  gap: 16,
  radius: 32,
  cols: 3,
  /** Scene px per second. */
  speed: 80,
} as const;

/** The strip's width: three cells and two gaps. */
const TRACK = SCENE.cols * SCENE.cell + (SCENE.cols - 1) * SCENE.gap;
/** One row's pitch. */
const ROW = SCENE.cellHeight + SCENE.gap;

/* How hard the lens bends. Zero is the flat scroll; this much fans the top
   row out by roughly a seventh of its width, which is what the prototype
   shows. Tuned by eye against the screenshot. */
const LENS = 0.07;

/* How much of the screen the strip spans at its widest — the top and bottom
   of the outer columns, where the lens fans it out furthest. Sized there so
   the outer photographs are always whole, with the middle row narrower and
   paper either side. The lens magnifies the sides more the wider the screen,
   so the margin that gives this is worked out from the lens and the aspect
   at each resize (see `sceneWidthFor`) rather than fixed. */
const FILL = 0.86;

/* The scene width that puts the strip's corners at FILL of the screen. The
   corner that lands at (aspect·FILL, 1) on screen was looked up at
   `aspect·FILL·bend` in the source, with the bend taken at that corner;
   solve that for the paper either side of the strip. */
function sceneWidthFor(width: number, height: number): number {
  const aspect = width / Math.max(1, height);
  const edge = aspect * FILL;
  const bend = Math.max(0.2, 1 - LENS * (edge * edge + 1));
  const fraction = Math.min(0.99, FILL * bend);
  const margin = (TRACK / 2) * ((1 - fraction) / fraction);
  return TRACK + 2 * margin;
}

/* iOS caps a canvas at 16M pixels and a texture is a canvas's worth of
   memory; staying under this keeps the atlas well inside both. */
const TEXEL_BUDGET = 12_000_000;

/** Pointer travel below this is a click, not a drag. */
const DRAG_THRESHOLD = 5;

/** Fraction of the gap to the target speed closed per second. */
const DRIFT_EASE = 5;

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/* Every screen pixel is pushed toward the centre by the lens before it is
   looked up in the strip — so the strip's edges, where the push is weakest
   relative to the centre, spread outward. The atlas holds the loop in pages
   side by side, rows top to bottom; anything outside the strip, and the
   transparent gaps between cells, come out as paper. */
const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_display;
uniform float u_sceneWidth;
uniform float u_track;
uniform float u_offset;
uniform float u_loop;
uniform float u_pageHeight;
uniform float u_lens;
uniform float u_texScale;
uniform vec2 u_texSize;
uniform vec3 u_paper;
uniform sampler2D u_tex;

void main() {
  vec2 frag = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 centre = u_res * 0.5;
  vec2 p = (frag - centre) / centre.y;
  float bend = 1.0 - u_lens * dot(p, p);
  vec2 src = centre + p * centre.y * bend;
  float sx = src.x / u_display - (u_sceneWidth - u_track) * 0.5;
  float sy = src.y / u_display + u_offset;
  if (sx < 0.0 || sx >= u_track) {
    gl_FragColor = vec4(u_paper, 1.0);
    return;
  }
  float ty = mod(sy, u_loop);
  float page = floor(ty / u_pageHeight);
  float ly = ty - page * u_pageHeight;
  vec2 uv = vec2(page * u_track + sx, ly) * u_texScale / u_texSize;
  vec4 t = texture2D(u_tex, uv);
  gl_FragColor = vec4(u_paper * (1.0 - t.a) + t.rgb, 1.0);
}
`;

interface Atlas {
  /** Texture px per scene px. */
  scale: number;
  rowsPerPage: number;
  pages: number;
  width: number;
  height: number;
}

/* The loop is too tall for one texture, so it is cut into pages laid side by
   side. Start from the sharpest scale the screen could use and step down
   until the atlas fits the GPU's limit and the memory budget. Pages break on
   row pitch, so a page boundary always falls in a gap and bilinear sampling
   never bleeds one row into another. */
function planAtlas(rows: number, wanted: number, maxTexture: number): Atlas | null {
  for (let scale = wanted; scale >= 0.4; scale -= 0.05) {
    const rowsPerPage = Math.floor(maxTexture / (ROW * scale));
    if (rowsPerPage < 1) continue;
    const pages = Math.ceil(rows / rowsPerPage);
    const width = Math.ceil(pages * TRACK * scale) + 2;
    const height = Math.ceil(Math.min(rows, rowsPerPage) * ROW * scale) + 2;
    if (width <= maxTexture && width * height <= TEXEL_BUDGET) {
      return { scale, rowsPerPage, pages, width, height };
    }
  }
  return null;
}

/** The smallest source in a srcset that still covers `width` px. */
function pickSource(photo: Photo, width: number): string {
  if (!photo.srcSet) return photo.src;
  const candidates = photo.srcSet
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .map(([url, descriptor]) => ({ url, width: parseFloat(descriptor) }))
    .filter((c) => c.url && Number.isFinite(c.width))
    .sort((a, b) => a.width - b.width);
  const fit = candidates.find((c) => c.width >= width);
  return fit?.url ?? candidates.at(-1)?.url ?? photo.src;
}

/** `object-position` as two fractions. */
function parseFocus(focus: string): [number, number] {
  const [x = "50%", y = "50%"] = focus.split(/\s+/);
  return [parseFloat(x) / 100 || 0.5, parseFloat(y) / 100 || 0.5];
}

/* A CSS colour token, resolved through the browser: the computed string is
   what a 2D context will take as a fill, and the channels are what the shader
   takes as a uniform. Neither the long form nor the hex is written here, so
   the token cannot drift from the stylesheet. */
function readColour(name: string): { css: string; rgb: [number, number, number] } {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.append(probe);
  const css = getComputedStyle(probe).color;
  probe.remove();
  const channels = css.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
  const rgb: [number, number, number] =
    channels && channels.length >= 3
      ? [channels[0] / 255, channels[1] / 255, channels[2] / 255]
      : [1, 1, 1];
  return { css, rgb };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function OpticalGrid({
  photos,
  onOpen,
  onFallback,
}: {
  photos: Photo[];
  /** A photograph was clicked, by index. */
  onOpen: (index: number) => void;
  /** The stage could not be built here; the caller shows the masonry. */
  onFallback: () => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [cursor, setCursor] = useState<"cell" | "drag" | null>(null);

  /* Read through refs inside the effect: the stage is built once per
     manifest, and a parent re-rendering with a fresh callback must not tear
     it down and load every photograph again. */
  const onOpenRef = useRef(onOpen);
  const onFallbackRef = useRef(onFallback);
  onOpenRef.current = onOpen;
  onFallbackRef.current = onFallback;

  /* Cells past the last photograph, in a final row that isn't full, show the
     first photographs again — a loop with a hole in it is a loop that shows
     its seam. */
  const rows = Math.max(1, Math.ceil(photos.length / SCENE.cols));
  const cellCount = rows * SCENE.cols;
  const loop = rows * ROW;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || photos.length === 0) return;

    const gl =
      canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false }) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) {
      onFallbackRef.current();
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      onFallbackRef.current();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onFallbackRef.current();
      return;
    }
    gl.useProgram(program);

    /* One triangle that covers the clip space; the shader does the rest. */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      res: u("u_res"),
      display: u("u_display"),
      sceneWidth: u("u_sceneWidth"),
      track: u("u_track"),
      offset: u("u_offset"),
      loop: u("u_loop"),
      pageHeight: u("u_pageHeight"),
      lens: u("u_lens"),
      texScale: u("u_texScale"),
      texSize: u("u_texSize"),
      paper: u("u_paper"),
      tex: u("u_tex"),
    };

    /* The atlas, sized for this screen. Sharpness follows the pixel ratio,
       with a little headroom for the lens magnifying the edges. */
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const first = stage.getBoundingClientRect();
    const firstScene = sceneWidthFor(first.width || TRACK, first.height || TRACK);
    const wanted = Math.min(2, Math.max(0.6, (((first.width || TRACK) * dpr) / firstScene) * 1.2));
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const atlas = planAtlas(rows, wanted, maxTexture);
    if (!atlas) {
      onFallbackRef.current();
      return;
    }

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    gl.uniform1i(uniforms.tex, 0);
    gl.uniform1f(uniforms.track, TRACK);
    gl.uniform1f(uniforms.loop, loop);
    gl.uniform1f(uniforms.pageHeight, atlas.rowsPerPage * ROW);
    gl.uniform1f(uniforms.lens, LENS);
    gl.uniform1f(uniforms.texScale, atlas.scale);
    gl.uniform2f(uniforms.texSize, atlas.width, atlas.height);
    gl.uniform3f(uniforms.paper, ...readColour("--color-paper").rgb);
    const placeholder = readColour("--color-line").css;

    /* One scratch canvas the size of a cell; each photograph is composed on
       it and copied into its slot in the atlas. */
    const cellWidth = Math.round(SCENE.cell * atlas.scale);
    const cellHeight = Math.round(SCENE.cellHeight * atlas.scale);
    const scratch = document.createElement("canvas");
    scratch.width = cellWidth;
    scratch.height = cellHeight;
    const ctx = scratch.getContext("2d");
    if (!ctx) {
      onFallbackRef.current();
      return;
    }

    let disposed = false;
    let dirty = true;

    const paintCell = (index: number, image: HTMLImageElement | null, focus: string) => {
      if (disposed) return;
      const row = Math.floor(index / SCENE.cols);
      const col = index % SCENE.cols;
      const page = Math.floor(row / atlas.rowsPerPage);
      const rowInPage = row - page * atlas.rowsPerPage;
      const x = Math.round((page * TRACK + col * (SCENE.cell + SCENE.gap)) * atlas.scale);
      const y = Math.round(rowInPage * ROW * atlas.scale);

      ctx.clearRect(0, 0, cellWidth, cellHeight);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, cellWidth, cellHeight, SCENE.radius * atlas.scale);
      ctx.clip();
      if (image) {
        const iw = image.naturalWidth;
        const ih = image.naturalHeight;
        const cover = Math.max(cellWidth / iw, cellHeight / ih);
        const dw = iw * cover;
        const dh = ih * cover;
        const [fx, fy] = parseFocus(focus);
        ctx.drawImage(image, (cellWidth - dw) * fx, (cellHeight - dh) * fy, dw, dh);
      } else {
        ctx.fillStyle = placeholder;
        ctx.fillRect(0, 0, cellWidth, cellHeight);
      }
      ctx.restore();

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, scratch);
      dirty = true;
    };

    /* Placeholders first, then the LQIPs, then the photographs — in strip
       order, so what is on screen first is what arrives first. */
    const loaders: HTMLImageElement[] = [];
    for (let index = 0; index < cellCount; index++) {
      const photo = photos[index % photos.length];
      paintCell(index, null, photo.focus);

      const load = (src: string, then: (img: HTMLImageElement) => void) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => then(img);
        img.src = src;
        loaders.push(img);
      };

      if (photo.lqip) load(photo.lqip, (img) => paintCell(index, img, photo.focus));
      const needed = Math.max(cellWidth, cellHeight * (photo.width / photo.height));
      load(pickSource(photo, needed), (img) => paintCell(index, img, photo.focus));
    }

    /* Layout: the canvas follows the stage in device pixels; `display` is
       canvas px per scene px and is what the pointer maths needs too. */
    const view = { left: 0, top: 0, cssWidth: 0, cssHeight: 0, width: 0, height: 0, sceneWidth: firstScene };
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      view.left = rect.left;
      view.top = rect.top;
      view.cssWidth = rect.width;
      view.cssHeight = rect.height;
      view.width = Math.max(1, Math.round(rect.width * dpr));
      view.height = Math.max(1, Math.round(rect.height * dpr));
      view.sceneWidth = sceneWidthFor(rect.width, rect.height);
      canvas.width = view.width;
      canvas.height = view.height;
      gl.viewport(0, 0, view.width, view.height);
      gl.uniform2f(uniforms.res, view.width, view.height);
      gl.uniform1f(uniforms.display, view.width / view.sceneWidth);
      gl.uniform1f(uniforms.sceneWidth, view.sceneWidth);
      dirty = true;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    /* Motion. `offset` is how far the strip has rolled, in scene px; the
       drift eases in and out rather than switching, so a pointer arriving
       reads as the strip settling, not stopping dead. */
    const motion = {
      offset: 0,
      velocity: 0,
      still: isStill(),
      hovering: false,
      dragging: false,
      last: performance.now(),
      frame: 0,
    };

    /* Where the pointer last was, so each frame can ask what is under it. */
    const pointer = { x: 0, y: 0, inside: false, mouse: false };
    let lastHit: number | null = null;

    /* The shader's lens, run backwards for one pointer: which cell is under
       this CSS-pixel point? Kept in step with FRAGMENT above. */
    const hit = (clientX: number, clientY: number): number | null => {
      const cx = view.cssWidth / 2;
      const cy = view.cssHeight / 2;
      if (cy === 0) return null;
      const px = (clientX - view.left - cx) / cy;
      const py = (clientY - view.top - cy) / cy;
      const bend = 1 - LENS * (px * px + py * py);
      const srcX = cx + px * cy * bend;
      const srcY = cy + py * cy * bend;
      const display = view.cssWidth / view.sceneWidth;
      const sx = srcX / display - (view.sceneWidth - TRACK) / 2;
      const sy = srcY / display + motion.offset;
      if (sx < 0 || sx >= TRACK) return null;
      const col = Math.floor(sx / (SCENE.cell + SCENE.gap));
      if (sx - col * (SCENE.cell + SCENE.gap) >= SCENE.cell) return null;
      const ty = ((sy % loop) + loop) % loop;
      const row = Math.floor(ty / ROW);
      if (ty - row * ROW >= SCENE.cellHeight) return null;
      return (row * SCENE.cols + col) % photos.length;
    };

    /* What is under the pointer right now — a photograph, or paper. Only a
       photograph holds the drift, and only a mouse: a finger is not resting
       anywhere. Writes to React only when the answer changes. */
    const syncHover = () => {
      const index = pointer.inside && !drag.moved ? hit(pointer.x, pointer.y) : null;
      motion.hovering = pointer.mouse && index !== null;
      if (index !== lastHit) {
        lastHit = index;
        setHovered(index);
        if (!drag.moved) setCursor(index === null ? null : "cell");
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - motion.last) / 1000, 0.1);
      motion.last = now;
      syncHover();
      const target = motion.still || motion.hovering || motion.dragging ? 0 : SCENE.speed;
      motion.velocity += (target - motion.velocity) * Math.min(1, DRIFT_EASE * dt);
      if (Math.abs(motion.velocity) < 0.5) motion.velocity = 0;
      if (motion.velocity !== 0) {
        motion.offset = (motion.offset + motion.velocity * dt) % loop;
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        gl.uniform1f(uniforms.offset, motion.offset);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      motion.frame = requestAnimationFrame(tick);
    };
    motion.frame = requestAnimationFrame(tick);

    /* Pointer. A drag rolls the strip by exactly what the pointer travelled;
       under the threshold it is a click, and the cell under it opens. */
    const drag = { active: false, id: -1, startY: 0, lastY: 0, moved: false };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.cssHeight : 1;
      motion.offset = (motion.offset + (event.deltaY * lines) / (view.cssWidth / view.sceneWidth)) % loop;
      dirty = true;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.active = true;
      drag.id = event.pointerId;
      drag.startY = drag.lastY = event.clientY;
      drag.moved = false;
      motion.dragging = true;
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.inside = true;
      pointer.mouse = event.pointerType === "mouse";
      if (drag.active && event.pointerId === drag.id) {
        const dy = event.clientY - drag.lastY;
        drag.lastY = event.clientY;
        if (!drag.moved && Math.abs(event.clientY - drag.startY) > DRAG_THRESHOLD) {
          drag.moved = true;
          canvas.setPointerCapture(drag.id);
          setCursor("drag");
        }
        if (drag.moved) {
          motion.offset = (motion.offset - dy / (view.cssWidth / view.sceneWidth)) % loop;
          dirty = true;
        }
      }
    };
    const endDrag = (event: PointerEvent) => {
      if (!drag.active || event.pointerId !== drag.id) return;
      const wasDrag = drag.moved;
      drag.active = false;
      drag.moved = false;
      motion.dragging = false;
      if (canvas.hasPointerCapture(drag.id)) canvas.releasePointerCapture(drag.id);
      const index = hit(event.clientX, event.clientY);
      setCursor(index === null ? null : "cell");
      if (!wasDrag && event.type === "pointerup" && index !== null) onOpenRef.current(index);
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(motion.frame);
      observer.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      for (const img of loaders) {
        img.onload = null;
        img.src = "";
      }
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [photos, rows, cellCount, loop]);

  const current = hovered === null ? null : photos[hovered];

  return (
    <div className="optical">
      <div className="optical-stage" ref={stageRef} data-cursor={cursor ?? undefined}>
        <canvas className="optical-canvas" ref={canvasRef} aria-hidden="true" />
      </div>
      {/* The hovered photograph's title, over the stage's foot. Nothing when
          nothing is under the pointer: the strip has no chrome. */}
      <p className="optical-caption" data-live={current ? "true" : undefined} aria-live="polite">
        {current?.title}
      </p>
    </div>
  );
}

/** Whether the stage can be drawn here at all. Cheap; asked once before the
    grid mounts so the masonry can be chosen without a flash. */
export function supportsOpticalGrid(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}
