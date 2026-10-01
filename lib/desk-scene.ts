/* The contact studio's stage direction — everything the scene needs to know
   that is not a three.js call. Kept out of the component so the numbers can be
   read, argued with, and changed without scrolling past WebGL setup.

   Units: one scene unit is the typewriter's own width. The props arrive from
   Sketchfab at unrelated scales (the machine is ~0.9 units across, the mailbox
   ~4.8 tall), so nothing here uses a model's native size — each prop is fitted
   to a size this file names, and lib/generated/models.ts supplies the measured
   bounds that make the fit exact.

   No colour is written here either. §7 gives the site one palette in
   app/globals.css, and the props are recoloured from it at runtime — the roles
   below name a token, never a value. */

import { models } from "./generated/models";

/* ---------- Palette ---------- */

/** A surface finish. `token` is the CSS custom property its colour comes from. */
export interface Finish {
  token: string;
  roughness: number;
  metalness: number;
}

/* The props ship with photographic textures of a grey Royal typewriter and a
   blue American mailbox. Both are thrown away at build time (see
   scripts/build-models.mjs) and rebuilt here out of the site's own colours:
   ink for the machine, coral for the box it posts to. That is what makes the
   two objects read as this site's rather than as stock downloads. */
export const FINISHES = {
  /* The typewriter's body. Matte, barely metallic — enamelled steel, not chrome. */
  shell: { token: "--color-ink", roughness: 0.62, metalness: 0.08 },
  /* Panels that catch less light than the shell: the back, the underside. */
  shellSoft: { token: "--color-body", roughness: 0.7, metalness: 0.05 },
  /* Platen knobs, type bars, the return lever. The one polished finish. */
  metal: { token: "--color-muted", roughness: 0.28, metalness: 0.85 },
  /* Feet and platen — the only thing on the machine that absorbs light. */
  rubber: { token: "--color-body", roughness: 0.95, metalness: 0 },
  /* Keycaps, in the same white the site's cards are. */
  key: { token: "--color-card", roughness: 0.45, metalness: 0.02 },
  /* The inked ribbon and the maker's badge — coral, and the only coral on the
     machine. It is what ties the typewriter to the box it writes to. */
  accent: { token: "--color-accent", roughness: 0.5, metalness: 0.05 },
} satisfies Record<string, Finish>;

export type FinishName = keyof typeof FINISHES;

/* Material names come from the source models and are preserved by the build
   script for exactly this lookup. A name not listed here falls back to `shell`,
   so a re-exported model can never render an untinted grey object. */
export const MATERIAL_FINISH: Record<string, FinishName> = {
  Royal_typewriter_Plastic: "shell",
  Royal_typewriter_Metal_black: "shellSoft",
  Material_51: "shell",
  "17_-_Default": "shell",
  Metal_Chrome: "metal",
  Royal_typewriter_Measure: "metal",
  Royal_typewriter_Rubber: "rubber",
  Royal_typewriter_Buttons: "key",
  Royal_typewriter_Tape: "accent",
  Royal_typewriter_Label: "accent",
  Royal_typewriter_Paper: "key",
  /* The letterbox is one mesh with one material, so this single line is the
     whole of its colour: coral, entire. It is the destination and the only
     saturated mass in the composition — the send button, in object form. */
  mailbox: "accent",
};

export const DEFAULT_FINISH: FinishName = "shell";

/* The keyboard.

   The caps arrive as one welded mesh, which is the letterbox lid's problem
   again and takes the letterbox lid's answer: split it into the pieces that are
   genuinely joined to each other and each piece is one key. Fifty-three of them,
   including the space bar.

   Which cap carries which letter is not knowable and not needed. The download
   has no such labels — the type on the keys was painted into a 4K texture that
   scripts/build-models.mjs throws away — so a keystroke strikes a cap at
   random. At the size the machine sits on screen that is indistinguishable from
   someone touch-typing: what reads is that a key went down when a letter
   appeared, not which one. */
export const KEYS = {
  /** The mesh to take apart, named by the material the download gave it. */
  material: "Royal_typewriter_Buttons",
  /** How far a cap dips, as a fraction of the height of an average cap —
      measured off the model rather than named in scene units, so the fit is
      free to resize the machine without flattening the keys into the frame. */
  travel: 0.45,
  /** How quickly it springs back, in ms. A key is struck, not held: it is down
      within a frame and the return is the whole of the visible motion. Long
      enough that typing at speed keeps two or three caps in the air at once,
      which is what reads as typing — a single cap flicking alone reads as a
      glitch. */
  release: 120,
};

/* ---------- Stage ---------- */

export type Vec3 = [number, number, number];

/** How a prop is fitted to the stage: a target size, a place, and a turn. */
export interface Placement {
  /** Which of the model's own dimensions `size` refers to. */
  fit: "width" | "height";
  size: number;
  /** Where the model's footprint centre lands. Y is its base, so it sits on 0. */
  position: Vec3;
  /** Y rotation, in turns — 0.25 is a quarter turn. Turns, so nobody has to
      count radians to see that the box is angled a twelfth of the way round. */
  turn: number;
}

export const PROPS: Record<"typewriter" | "letterbox", Placement> = {
  /* Square to the viewer and right of centre: this is the object being used, so
     it faces the person using it, and it faces them *squarely* — `turn: 0` is
     load-bearing. The sheet standing in the platen is a DOM element with no
     Y rotation of its own (SHEET has a backward lean and nothing else), so any
     turn on the machine is a turn the paper cannot follow, and the two read as
     two objects photographed separately.

     Its size is set by the sheet, not the other way round: the sheet has to be
     a form someone can read and fill in, and it has to fit the platen between
     the paper guides — see the slot derivation below SHEET — so the machine is
     as large as it takes for its slot to hold a readable page. */
  typewriter: { fit: "width", size: 1.02, position: [0.4, 0, -0.02], turn: 0 },
  /* Turned a twentieth of a turn to the right so the lid faces the letter
     coming at it rather than the camera, and set back in Z so perspective keeps
     it the smaller object without having to shrink it into a toy. */
  letterbox: { fit: "height", size: 0.66, position: [-0.66, 0, -0.15], turn: 0.055 },
};

/* The box has to open, and it arrives as one welded mesh with one material and
   one node — there is no lid to find by name. So it is found by shape instead.

   Split the mesh into the pieces that are actually joined to each other and the
   answer falls out: one of them reaches the ground and is the box, and seven
   small ones float near the top and are the lid — the sloped plate, its two
   hinge pins, the brackets behind them, the rod between them, the handle. The
   test is `above`, and it is safe because the body is the only part of a
   mailbox that touches the ground. */
export const LID = {
  /** A piece belongs to the lid when its lowest point is above this fraction of
      the whole model's height. */
  above: 0.85,
  /** The hinge, as a point inside the lid's own bounds — 0 is that bound's
      minimum, 1 its maximum. Low and forward, because the plate is pinned along
      its front edge and swings its back edge up and over: the pins sit right
      about here, and rotating anywhere else makes the lid slide rather than
      turn. X is not named — the hinge is a line, and the line runs along X. */
  hinge: { y: 0.35, z: 0.9 },
  /** How far it swings, in turns of that hinge. Found by eye against the render
      rather than reasoned about: the box is a hand's width on screen and the
      lid is a lip on top of it, so anything less than this is a shrug. Past
      about a third of a turn it lies back on the box's own roof. */
  swing: 0.28,
};

/* A long lens, held a little above the desk. At 30° the machine keeps its
   straight edges straight — a wider angle bows them, which is the difference
   between a product photograph and a webcam.

   The camera is not placed, it is *fitted*. `frame` names the slab of world the
   shot has to contain — wide enough for the machine and the box, tall enough
   for the sheet at the moment before it folds — and the studio pulls the camera
   back along a fixed direction until that slab fits whatever shape the stage
   turns out to be. Framing by moving the camera rather than by widening the
   lens is what keeps the perspective identical on every screen: a phone gets
   the same photograph from further away, not a distorted one from the same
   spot. */
export const LENS = {
  fov: 30,
  near: 0.1,
  far: 40,
};

/** Where the lens stands and what it has to hold — the half of the camera
    that changes with the stage's shape. The lens itself never does. */
export interface View {
  /** Direction only — the distance is solved for. Height above the target sets
      how much of the desk top is seen. */
  direction: Vec3;
  target: Vec3;
  /** The slab of world the shot has to contain, in scene units. */
  frame: { width: number; height: number };
}

/* The wide view: a standing view, not a top-down.

   Tall enough to hold the sheet at `SHEET.visibleMax` — the moment the whole
   letter, signature and all, is standing clear of the roller. That is the
   highest anything in this scene ever reaches, so it is what sets the top
   edge; everything else fits underneath it. The width is the props and not
   much more: the machine and the box span about 1.75 units between them,
   and every unit of slack here is a unit the whole scene is drawn smaller
   by whenever the stage is squarer than this frame — the size the typed
   letter comes out on screen is decided right here. */
export const CAMERA: View = {
  direction: [0, 0.13, 1],
  target: [0, 0.53, 0],
  frame: { width: 2.0, height: 1.3 },
};

/* Two lights and a bounce. The key throws the one shadow in the scene; the fill
   opens the shadow side so the ink body never goes to black; the hemisphere
   picks up the paper the page is printed on and puts it back into the props. */
export const LIGHTS = {
  key: { position: [1.7, 3.1, 2.3] as Vec3, intensity: 2.4, token: "--color-card" },
  fill: { position: [-2.4, 1.1, 1.6] as Vec3, intensity: 0.5, token: "--color-card" },
  bounce: { sky: "--color-card", ground: "--color-line", intensity: 1.5 },
  shadow: { opacity: 0.16, mapSize: 2048, radius: 5, area: 2.6, bias: -0.0012 },
};

/* ---------- The sheet ---------- */

/* The letter is not in the WebGL scene. It is a real <form> — a real textarea,
   real focus, real spellcheck, text the browser renders at its own sharpness —
   parked in front of the canvas and moved by projecting these world anchors
   through the same camera every frame. Text baked into a WebGL texture would
   lose all of that and buy nothing back.

   The cost of that choice is that the sheet can never go behind anything: DOM
   is always in front of the canvas. So the part of it still inside the machine
   is not hidden, it is *clipped* — the studio cuts the sheet along the platen
   line, which is why paper appears to come out of the roller rather than to
   hover in front of it. */

/* Where paper actually comes out of this machine, and how wide it is.

   Measured, not styled. The source model shipped its own rolled sheet in the
   platen; scripts/build-models.mjs deletes that mesh — one roller holds one
   sheet, and ours is the DOM one — but records its bounds first, and those
   bounds are the one true answer to where the slot is. An eyeballed sheet is
   how the first version ended up a third wider than the platen that was
   supposedly feeding it, standing past the paper guides on both sides.

   Everything below is expressed against the machine's own placement, so it
   can be resized or moved — and on the tall stage it is moved — and the slot
   stays true. */
const measured = models.typewriter;
/* The build script throws if the source model ever loses its paper mesh, so
   this assertion records a guarantee rather than a hope. */
const paperMesh = measured.paperBounds!;
const span = measured.bounds;
const mid = (low: number, high: number) => (low + high) / 2;

/** The platen, for a machine fitted and placed as `place` says. */
function slotFor(place: Placement) {
  const fitted = place.size / (span.max[0] - span.min[0]);
  return {
    width: (paperMesh.max[0] - paperMesh.min[0]) * fitted,
    x:
      place.position[0] +
      (mid(paperMesh.min[0], paperMesh.max[0]) - mid(span.min[0], span.max[0])) * fitted,
    z:
      place.position[2] +
      (mid(paperMesh.min[2], paperMesh.max[2]) - mid(span.min[2], span.max[2])) * fitted,
    /* Where the sheet is cut, as a point up the rolled sheet's own height.

       Not the roller's crown — the *carriage line*: the top of the frame and
       paper fingers that stand around the platen. The DOM sheet cannot pass
       behind anything the canvas draws, so everywhere the machine's silhouette
       overlaps the paper's path the paper has to be clipped instead; cutting at
       the roller left the sheet lying over the carriage ends, paper printed on
       top of the machine that should be hiding it. The model's own rolled sheet
       stands to exactly this line, which is why 1.0 — its measured top — is the
       right cut. */
    lip: paperMesh.max[1] * fitted,
  };
}

/* The sheet's own size follows from the wide stage's machine. Both stages fit
   the machine to the same width, so the sheet is the same size on both — a
   Placement that changed `size` would change the paper with it, and the two
   would have to be sized here as a pair. */
const slot = slotFor(PROPS.typewriter);

/** The roller's lip — where the sheet stops being inside a machine placed
    as `place` says. */
export function platenFor(place: Placement): Vec3 {
  const at = slotFor(place);
  return [at.x, at.lip, at.z];
}

/* The CSS letter's aspect — --letter-scene-w / --letter-scene-h in
   app/globals.css, which the projection scales into the scene-unit box below.
   The two ratios have to agree or the paper is stretched. */
const LETTER_RATIO = 330 / 372;
const sheetHeight = slot.width / LETTER_RATIO;

export const SHEET = {
  /** The slot's own width — the sheet fills the platen exactly, guide to
      guide, because it is the sheet that platen feeds. */
  width: slot.width,
  height: sheetHeight,
  /** Where the sheet stands before anything has been typed. Only a fallback:
      the real figure is measured off the sheet itself the moment it is laid
      out (see `revealFor`), because what should be showing is exactly the top
      of the page down to the caret's first line — dateline, salutation, one
      blank line to type on. This is roughly what that measurement comes to,
      and it is what the scene uses for the frame or two before the
      measurement lands. */
  visibleAtRest: sheetHeight * 0.38,
  /** The ceiling. At this height the whole letter — signature blanks and all —
      is clear of the roller, and the top edge of the paper is just inside the
      top of the view's frame. Raising one without the other pushes paper out
      of the picture. Fractions of the sheet's own height, both of them, so the
      slot can change size without either climbing out of the composition. */
  visibleMax: sheetHeight * 0.95,
  /** Backward lean, in turns — paper in a roller leans away from you. Any more
      than this and the mono type starts losing its edges to the foreshortening.
      It straightens as the sheet is drawn out. */
  lean: -0.026,
  leanHeld: -0.008,
};

/** How far the sheet has to stand above the platen for the first `px` of it to
    be showing, where the sheet is `heightPx` tall on screen.

    This is the whole of the line-by-line reveal. The rise is measured from the
    top edge down, so "how much paper is out of the machine" and "how far down
    the page the writing has reached" are the same number in two units — feed
    the sheet up to meet the caret and the paper above the roller is only ever
    paper with something on it. A page that starts three quarters out is a form
    with a typewriter drawn behind it; this one is a page being typed. */
export function revealFor(px: number, heightPx: number): number {
  if (!heightPx) return SHEET.visibleAtRest;
  return Math.min(SHEET.height * (px / heightPx), SHEET.visibleMax);
}

/** Where the sheet's centre sits for a given `visible` height above `platen`.
    Its top edge is simply platen + visible, which is what the rise is measured
    in — how much paper is standing out of the machine. */
export function sheetCentre(visible: number, platen: Vec3): Vec3 {
  const [x, y, z] = platen;
  return [x, y - SHEET.height / 2 + visible, z];
}

/* The mouth of the box — under the lid, and behind it, not on it. The letter is
   aimed at a point well inside: it is on its way in, and an endpoint on the
   opening itself would have it arrive and stop, like a magnet on a fridge.
   Going *through* is also what makes the perspective do half the work of
   shrinking it to letter-slot size. */
export const SLOT: Vec3 = [-0.64, 0.57, -0.16];

/* The arc, as the two control points of a cubic bezier from platen to slot. The
   letter lifts before it travels: the first handle is almost straight up, so
   the letter reads as being carried across the desk rather than skimmed over it
   like a paper aeroplane. */
export const FLIGHT_HANDLES: [Vec3, Vec3] = [
  [0, 0.96, 0.3],
  [-0.5, 0.72, 0.04],
];

/* Where a finished letter is folded.

   Not "fed further out of the roller" — that was the first version, and it
   cost the composition a third of its height in headroom the sheet only
   used for half a second. A letter is not folded standing up in the machine
   anyway: it is drawn out and folded in front of it. So the sheet comes
   forward, toward the camera and toward the middle of the desk, which reads
   as a hand taking it and buys back every pixel of that headroom. */
export const HELD: Vec3 = [0.28, 0.52, 0.26];

/* The letter is ~0.53 units across and the box is 0.37. Something has to give
   between "a letter you can read" and "a letter that fits through a slot", and
   the honest answer is that it recedes: it turns to line up with the box's
   face, shrinks as it goes away from the camera, and the last of it is eaten
   from the leading edge as it crosses the lip.

   Eating the edge rather than fading the whole sheet is the difference between
   posting a letter and dissolving one. The box cannot occlude it — the letter
   is DOM and the box is canvas — so the clip stands in for the occlusion. */
export const ENTRY = {
  /** Size at the slot, before the swallow takes the rest. */
  shrink: 0.62,
  /** How far it banks into the arc on the way over. */
  bank: 7,
  /** How far it sinks while the slot takes it, in scene units — a little more
      than the folded band is tall, so the top edge follows the bottom in. */
  drop: 0.22,
};

/** Cubic bezier through `handles`. `t` runs 0 (platen) → 1 (slot). */
export function flightPoint(t: number, from: Vec3, to: Vec3, handles: [Vec3, Vec3]): Vec3 {
  const [c1, c2] = handles;
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * from[0] + b * c1[0] + c * c2[0] + d * to[0],
    a * from[1] + b * c1[1] + c * c2[1] + d * to[1],
    a * from[2] + b * c1[2] + c * c2[2] + d * to[2],
  ];
}

/* ---------- The stage ---------- */

/* One arrangement, and the screens wide enough to hold it.

   The desk is seen from a chair: the machine right of centre, the box to its
   left, the letter carried across between them. That needs width — the two
   props span 1.75 units, and squeezed into a phone the sheet comes out around
   a hundred pixels across, which nobody can type on.

   There was a second arrangement here once, a standing seat for a screen held
   upright, and it was the wrong answer to the right question. A phone that has
   to hold a typewriter, a letterbox, a sheet to type on *and* the button that
   sends it has room for none of them: the stage took most of a screen, the
   send button sat under the fold, and the letter — the only part of the page
   anyone came to use — was the smallest thing on it. So a phone gets the sheet
   and nothing else, and the letter leaves as a paper plane rather than into a
   box that is no longer drawn. See PLANE below, and the plane block in
   app/globals.css.

   `platen` is derived rather than written, and `turn` reads off the box's own
   turn, so neither can disagree with the placement it belongs to. */
export interface Stage {
  name: "wide";
  props: Record<"typewriter" | "letterbox", Placement>;
  view: View;
  /** The roller's lip — where the sheet stops being inside the machine. */
  platen: Vec3;
  /** Where the sheet is taken to be folded. */
  held: Vec3;
  /** The mouth of the box. */
  slot: Vec3;
  /** The two control points of the arc between them. */
  flight: [Vec3, Vec3];
  /** Turn, in degrees, that lines the sheet up with the box's front face. */
  turn: number;
}

const degrees = (turns: number) => turns * 360;

function stage(spec: Omit<Stage, "platen" | "turn">): Stage {
  return {
    ...spec,
    platen: platenFor(spec.props.typewriter),
    turn: degrees(spec.props.letterbox.turn),
  };
}

export const STAGES: Record<Stage["name"], Stage> = {
  wide: stage({
    name: "wide",
    props: PROPS,
    view: CAMERA,
    held: HELD,
    slot: SLOT,
    flight: FLIGHT_HANDLES,
  }),
};

/* ---------- Where the scene is worth building ---------- */

/* Width and height both matter, and for different reasons. Too narrow and the
   stage cannot hold both props *and* a readable sheet; too short and it can
   hold them but not within one screen, and the send would play half above the
   fold and half below it. The width is the same 820px call §11 already makes
   for the desk collage, and the height is not a guess: it is the fixed chrome
   on that page plus --studio-h-min, the shortest stage the sheet is still
   legible on. The pair has to match the fitted-layout guard in
   app/globals.css, or it would build a scene the stylesheet refuses to make
   room for.

   Under either threshold there is no scene at all: same form, same sheet, no
   props — and the phone layout in app/globals.css gives that sheet the screen
   the props used to take.

   B1 exempts @media breakpoints from the token rule because custom properties
   do not work in them; a matchMedia query is the same breakpoint by another
   route, so it takes the same exemption. */
export const SCENE_QUERIES: Record<Stage["name"], string> = {
  /* token-exempt */
  wide: "(min-width: 820px) and (min-height: 760px)",
};

/** The stage this window can hold, or null for the flat form. Browser-only. */
export function stageFor(): Stage | null {
  return window.matchMedia(SCENE_QUERIES.wide).matches ? STAGES.wide : null;
}

/* Where tapping the sheet opens the composer.

   Two conditions, and both are doing work. The screen has to be one with no
   desk on it — the complement of the query above, which is the same pair of
   numbers read the other way — because on the wide stage the sheet is already
   the largest thing on the screen and there is nothing to lift it away from.
   And the pointer has to be coarse, because the whole point of the composer
   is the half of the screen a keyboard takes: a laptop window dragged narrow
   has no keyboard to clear and would get a modal for no reason.

   It has to stay in step with the composer block in app/globals.css, which
   carries the same query — the stylesheet does the lifting and this decides
   whether to ask for it. Same @media exemption as SCENE_QUERIES. */
export const COMPOSE_QUERY =
  /* token-exempt */
  "(pointer: coarse) and (max-width: 819.98px), (pointer: coarse) and (max-height: 759.98px)";

/* The send plays for everyone.

   It used to be suppressed under `prefers-reduced-motion` and that was wrong
   here, for a reason particular to this page: the animation is not decoration
   laid over the content, it *is* the content. A contact page whose whole
   argument is "write a letter and post it" cannot make the letter blink out of
   existence for a large share of its visitors and still be the page. What those
   visitors got was the box opening onto nothing, which reads as a bug rather
   than as a courtesy — and reads that way to the person who set the preference
   most of all.

   What is left of the accommodation: it is one short, self-contained gesture
   that a person asked for by pressing a button, on an element a few hundred
   pixels across. It is not parallax, not a loop, not something that happens
   while you are trying to read. Everything else on the site still honours the
   preference — see the reduced-motion block in app/globals.css, which this page
   pokes exactly one hole in, for the fold.

   `?motion=still` is the way back to the quiet version for anyone who wants it,
   and the way to review that path on a machine that does not set the
   preference. It is the switch `?motion=full` used to be, pointing the other
   way. The desk's quote card reads the same switch, so it is declared in
   lib/motion.ts and re-exported here for everything that already imports it
   from this file. */
export { STILL_FLAG } from "./motion";

/* ---------- Choreography ---------- */

/* One send, as a storyboard rather than a list of durations — every number is
   milliseconds from the moment the button is pressed, so the overlaps can be
   read straight off the page.

   The overlaps are the point. The second fold starts before the first has
   finished; the letter is already moving while the last crease closes; the box
   starts to rock before the letter has fully disappeared into it. Played
   strictly in sequence the same beats read as a slideshow of states instead of
   one continuous gesture. */
export const MARKS = {
  /** The sheet feeds the rest of the way out of the roller. */
  feedStart: 0,
  feedEnd: 540,
  /** Bottom third up over the middle. */
  lowerStart: 480,
  lowerEnd: 880,
  /** Then top third down over both. */
  upperStart: 760,
  upperEnd: 1160,
  /** Platen to slot. */
  flightStart: 1080,
  flightEnd: 1900,
  /** The box opens for it. Early enough that the lid has finished swinging
      before the letter reaches it — a box that opens as the letter arrives is a
      box that was not expecting one. */
  flapAt: 1360,
  /** The last of the flight, over which the letter crosses the lip and stops
      being drawn. It cannot be occluded — it is DOM, and DOM is always in front
      of the canvas — so it goes in by shrinking into the opening and fading as
      it crosses, which is the moment the box is seen to take it. */
  swallowStart: 1680,
  /** The box's answer: it lights, rocks, and settles. */
  receiveStart: 1780,
  receiveEnd: 2200,
  recoilStart: 1800,
  recoilEnd: 2300,
  /** The panel below the stage changes over while the box is still settling. */
  deliveredAt: 2060,
};

/* The lid, on its own clock — milliseconds from the moment the box is told to
   expect a letter, not from the moment the button was pressed.

   Its own clock because it has to play in two different situations. At the end
   of a flight it is one beat in MARKS, cued at `flapAt`. With no flight to play
   it is the *whole* acknowledgement, cued the instant the button is pressed —
   and it has to be the same gesture both times, or reduced motion gets a
   different box from everyone else. Hanging it off MARKS would have tied it to
   a journey that, half the time, does not happen.

   It opens quickly and closes slowly: a lid is thrown open and falls shut. */
export const FLAP = {
  openStart: 0,
  openEnd: 260,
  /** Held open across the gap, which is where the letter goes in. */
  closeStart: 520,
  closeEnd: 880,
};

/* The quiet version, for `?motion=still`: no feed, no flight, no arc across the
   desk. The letter is sealed and gone where it stood.

   What it keeps is the lid, because nothing else in the send is an *answer* —
   the fold and the flight are the letter's, and with both dropped the box takes
   the letter without ever admitting it. So the box still opens and still shuts,
   and the panel below changes over while it is doing it. */
export const STILL_DURATION = 240;

/* ---------- The paper plane ---------- */

/* What the send is where there is no scene: every phone, and any desktop whose
   browser will not give the page a WebGL context.

   With no letterbox drawn there is nothing for a letter to be posted into, and
   "the sheet slides up and fades" — which is what used to happen here — is a
   form clearing itself, not a letter going anywhere. So the sheet is folded
   into the one thing a sheet of paper becomes when there is no box: a dart,
   which is then thrown.

   Three beats and a flight, each one a real fold rather than a dissolve:

     crease   the sheet folds in half down its middle, the writing going
              inside, the way you start any plane.
     dart     the halved sheet's nose is folded down and the silhouette
              becomes a dart. The paper stops being a letter here.
     bank     the dart turns to face where it is going and rocks back once,
              which is the wrist before a throw.
     flight   and it goes, to the corner of the screen.

   Milliseconds from the button press, and they overlap for the same reason the
   scene's do: played strictly one after another the same four beats read as
   four pictures rather than one gesture. The fold durations are --dur-fold's
   sibling in app/globals.css and the two have to stay in step — the numbers
   here are what the component switches the states on, and the stylesheet is
   what actually moves the paper. */
export const PLANE = {
  /** In half, down the middle. */
  creaseAt: 0,
  /** Nose down, wings out. */
  dartAt: 360,
  /** Turned toward the corner it is about to leave by, and rocked back. */
  bankAt: 700,
  /** Thrown. */
  flightAt: 900,
  flightEnd: 1900,
  /** The panel below changes over while the plane is still in the air — the
      same overlap the scene takes at MARKS.deliveredAt, and for the same
      reason: an acknowledgement that waits for the animation to finish reads
      as a page that was thinking about it. */
  deliveredAt: 1450,
};

/** Total length of a plane send. */
export const PLANE_DURATION = PLANE.flightEnd;

/* How far past the corner the plane is thrown, as a multiple of the sheet's
   own width.

   It is a smaller number than it looks like it should be, and deliberately.
   The plane is out of sight the moment it crosses the edge, so everything
   past that point is an animation nobody is watching — throw it far enough
   and the visible part of a one-second flight is the first quarter-second of
   it, which reads as the letter being snatched away rather than thrown. Just
   past the corner keeps nearly the whole arc on screen, and the fade at the
   end of `plane-away` is a safety net rather than the exit. */
export const PLANE_OVERSHOOT = 0.7;


/* Easing. `outCubic` for anything arriving, `inOutCubic` for anything that both
   leaves and arrives, `outBack` for the single moment that should overshoot —
   the sheet feeding out, which a real platen does. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutBack = (t: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/** Damped oscillation, for the box absorbing a letter. Settles to 0 at t = 1. */
export const decayBounce = (t: number) =>
  Math.sin(t * Math.PI * 3) * Math.pow(1 - t, 2.2);

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Progress of `now` through the beat that runs [start, end). */
export const beat = (now: number, start: number, end: number) =>
  clamp01((now - start) / (end - start));

/** Frame-rate independent approach: how far to move toward a target this frame. */
export const approach = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);
