/* Gallery photography manifest.

   Natural aspect ratios — never force-cropped (§9). Every caption is the
   photograph's own title, taken from what the file is called in Gallery/ —
   no year stamp under the picture, and no invented place names. Titles are
   hand-maintained here and never read from EXIF, so the metadata and the EXIF
   stripping in `npm run photos` can't fight each other.

   `srcSet`/`lqip` are filled in by scripts/build-photos.mjs from the originals
   in raw/gallery/, keyed on the slug of the filename. */

import { photoManifest } from "./generated/photos";

export interface Photo {
  /** Matches the filename in raw/gallery/ and the key in the generated manifest. */
  key: string;
  /** The caption, and the only thing shown under a photo: its title. */
  title: string;
  /**
   * Never displayed. `base` groups photos by city for the count line and the
   * map's per-city totals; `country` and `year` are provenance kept alongside
   * it — the year was read off the original's capture date by hand, once.
   */
  base: string;
  country: string;
  year: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  /**
   * Where the subject sits, as `object-position`. The masonry and the lightbox
   * never crop, so this is only read by the Life tile, which does fill a fixed
   * frame — it is what keeps the crop off the spire, the boat, or the face.
   * Read off each photograph by eye; `50% 50%` when the subject is centred.
   */
  focus: string;
  /**
   * How it was taken, printed under a photograph the way a contact sheet would.
   * Hand-copied off the original's EXIF before the pipeline strips it, like
   * `year` — focal length is the 35mm equivalent, so 24/48/100/200 read as
   * the lens the phone actually switched to. Only the photographs from the
   * iPhone 17 Pro carry one; older shots are left without rather than guessed.
   */
  shot?: { focal: string; aperture: string; shutter: string; iso: number };
  /** Responsive sources, emitted by the photo pipeline. */
  srcSet?: string;
  /** Inlined ~20px blurred placeholder so tiles don't pop in. */
  lqip?: string;
}

/* Ordered for the eye, not alphabetically: orientations and cities alternate so
   the masonry never stacks four portraits of the same skyline, and the Life
   tile — which walks this list in order — keeps changing subject. */
const manifest: Omit<Photo, "src" | "width" | "height">[] = [
  /* The Baltic run and the summer in Hamburg, 2026 — iPhone 17 Pro. Newest
     first, so the gallery and the Life tile both open on the latest work. */
  {
    key: "helsinki-beetle",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A cyclist in red passes a mint-green Volkswagen Beetle below a pale neoclassical façade",
    focus: "50% 70%",
    shot: { focal: "100mm", aperture: "f/2.8", shutter: "1/120", iso: 80 },
  },
  {
    key: "tallinn-nevsky",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "The black onion domes of the Alexander Nevsky cathedral over a screen of summer trees",
    focus: "50% 40%",
    shot: { focal: "100mm", aperture: "f/2.8", shutter: "1/440", iso: 50 },
  },
  {
    key: "riga-porsche",
    title: "Riga", base: "Riga", country: "LV", year: "2026",
    alt: "A black vintage Porsche parked on a cobbled street",
    focus: "50% 50%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/730", iso: 64 },
  },
  {
    key: "helsinki-red-cottage",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A red cottage on a rocky islet, open water in front of it under streaked cloud",
    focus: "50% 42%",
    shot: { focal: "24mm", aperture: "f/1.8", shutter: "1/2500", iso: 80 },
  },
  {
    key: "hamburg-orange-facade",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "A stepped orange façade climbing into a clear blue sky",
    focus: "50% 40%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/1070", iso: 80 },
  },
  {
    key: "helsinki-islet",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A red cottage among pines on a rocky islet under streaked evening cloud",
    focus: "45% 55%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/1800", iso: 64 },
  },
  {
    key: "riga-bunting",
    title: "Riga", base: "Riga", country: "LV", year: "2026",
    alt: "Strings of bunting over a narrow street, a green spire and an orange turret beyond",
    focus: "50% 45%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/720", iso: 16 },
  },
  {
    key: "vilnius-volga",
    title: "Vilnius", base: "Vilnius", country: "LT", year: "2026",
    alt: "A pale-blue vintage Volga parked under overhanging branches",
    focus: "55% 60%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/250", iso: 64 },
  },
  {
    key: "hamburg-alster-sail",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2025",
    alt: "A single sail crossing the Alster, the far bank in full autumn colour",
    focus: "50% 50%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/247", iso: 50 },
  },
  {
    key: "tallinn-skyline",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "Red roofs of the old town with a tall church spire and the sea behind",
    focus: "40% 55%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/3500", iso: 64 },
  },
  {
    key: "tallinn-roofs",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "Red tiled roofs and gables stepping down to a cobbled lane",
    focus: "50% 50%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/1150", iso: 64 },
  },
  {
    key: "hamburg-tall-ship",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "A three-masted tall ship with its sails set, moving through the harbour",
    focus: "50% 50%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/1000", iso: 20 },
  },
  {
    key: "helsinki-sunset",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A Ferris wheel and a domed cathedral in silhouette against an orange sunset",
    focus: "55% 55%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/120", iso: 50 },
  },
  {
    key: "vilnius-upper-castle",
    title: "Vilnius", base: "Vilnius", country: "LT", year: "2026",
    alt: "The red brick ruins of the upper castle on their green hill, a crane boom overhead",
    focus: "50% 42%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/900", iso: 16 },
  },
  {
    key: "hamburg-canal-dusk",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "A canal at dusk, moored boats and folded parasols along both banks",
    focus: "50% 55%",
    shot: { focal: "24mm", aperture: "f/1.8", shutter: "1/4739", iso: 64 },
  },
  {
    key: "tallinn-green-door",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "A green panelled door set into a rough limestone wall",
    focus: "50% 45%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/610", iso: 64 },
  },
  {
    key: "hamburg-atlantic-flags",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2025",
    alt: "The Hotel Atlantic's green roof and flags standing over autumn willows",
    focus: "50% 40%",
    shot: { focal: "100mm", aperture: "f/2.8", shutter: "1/506", iso: 50 },
  },
  {
    key: "riga-gables",
    title: "Riga", base: "Riga", country: "LV", year: "2026",
    alt: "Three old gabled houses side by side under a heavy, broken sky",
    focus: "50% 55%",
    shot: { focal: "24mm", aperture: "f/1.8", shutter: "1/6000", iso: 100 },
  },
  {
    key: "helsinki-tram-street",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A man crossing tram tracks between stucco façades, the wires low over the street",
    focus: "50% 52%",
    shot: { focal: "100mm", aperture: "f/2.8", shutter: "1/640", iso: 40 },
  },
  {
    key: "helsinki-cathedral-street",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A cobbled street between ochre buildings leading to a white cathedral dome",
    focus: "55% 50%",
    shot: { focal: "24mm", aperture: "f/1.8", shutter: "1/1800", iso: 64 },
  },
  {
    key: "hamburg-elbphilharmonie-bare-trees",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2025",
    alt: "The glass wave of the Elbphilharmonie above a line of bare trees",
    focus: "50% 34%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/516", iso: 40 },
  },
  {
    key: "vilnius-wooden-house",
    title: "Vilnius", base: "Vilnius", country: "LT", year: "2026",
    alt: "A wooden house with blue shutters behind a strip of grass",
    focus: "45% 55%",
    shot: { focal: "24mm", aperture: "f/1.8", shutter: "1/1100", iso: 64 },
  },
  {
    key: "helsinki-suomenlinna",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "The pale bell tower and green dome of the Suomenlinna church above a line of trees",
    focus: "50% 38%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/640", iso: 40 },
  },
  {
    key: "hamburg-green-spire",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "A verdigris church spire with clock faces against a pink evening sky",
    focus: "50% 45%",
    shot: { focal: "100mm", aperture: "f/2.8", shutter: "1/120", iso: 80 },
  },
  {
    key: "hamburg-tower-blossom",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "The television tower's rings seen through a spray of pink cherry blossom",
    focus: "50% 45%",
    shot: { focal: "100mm", aperture: "f/2.8", shutter: "1/121", iso: 64 },
  },
  {
    key: "tallinn-cafe",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "Two hot chocolates on a café table beside a window onto the street",
    focus: "45% 60%",
    shot: { focal: "14mm", aperture: "f/2.2", shutter: "1/50", iso: 200 },
  },
  {
    key: "riga-rooftops",
    title: "Riga", base: "Riga", country: "LV", year: "2026",
    alt: "Red rooftops of the old town under heaped white cloud",
    focus: "50% 60%",
    shot: { focal: "24mm", aperture: "f/1.8", shutter: "1/8000", iso: 64 },
  },
  {
    key: "helsinki-stairs",
    title: "Helsinki", base: "Helsinki", country: "FI", year: "2026",
    alt: "A steel staircase climbing a white wall between two ochre doors",
    focus: "55% 50%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/1000", iso: 16 },
  },
  {
    key: "tallinn-courtyard",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "Limestone walls and black slate roofs around a courtyard with a parasol",
    focus: "50% 50%",
    shot: { focal: "200mm", aperture: "f/2.8", shutter: "1/340", iso: 50 },
  },
  {
    key: "tallinn-square",
    title: "Tallinn", base: "Tallinn", country: "EE", year: "2026",
    alt: "Pastel gabled houses around a square under storm cloud",
    focus: "50% 55%",
    shot: { focal: "48mm", aperture: "f/1.8", shutter: "1/4600", iso: 64 },
  },
  {
    key: "aussenalster2",
    title: "Außenalster", base: "Hamburg", country: "DE", year: "2026",
    alt: "Sunset over the Alster, the Heinrich-Hertz tower standing behind a bridge",
    focus: "50% 46%",
  },
  {
    key: "cherry-blossoms-2025",
    title: "Cherry Blossoms", base: "Hamburg", country: "DE", year: "2026",
    alt: "Pink cherry blossom crowding a branch against a pale sky",
    focus: "50% 45%",
  },
  {
    key: "taj-mumbai",
    title: "Taj Mumbai", base: "Mumbai", country: "IN", year: "2026",
    alt: "The lit dome of the Taj Mahal Palace hotel at night",
    focus: "50% 46%",
  },
  {
    key: "blankanese2",
    title: "Blankenese", base: "Hamburg", country: "DE", year: "2026",
    alt: "Villas and a dark church spire on the Blankenese hillside",
    focus: "50% 60%",
  },
  {
    key: "alsterwinters",
    title: "Alster Winters", base: "Hamburg", country: "DE", year: "2026",
    alt: "Frost-covered trees along a snowbound Binnenalster",
    focus: "50% 45%",
  },
  {
    key: "bratislava-2025",
    title: "Bratislava", base: "Bratislava", country: "SK", year: "2025",
    alt: "An empty old-town street running toward Michael's Gate",
    focus: "50% 36%",
  },
  {
    key: "budapest-parliament",
    title: "Budapest", base: "Budapest", country: "HU", year: "2025",
    alt: "An empty road running to the dome and pinnacles of the parliament",
    focus: "50% 22%",
  },
  {
    key: "aurora-lights-pinneberg",
    title: "Aurora Lights Pinneberg", base: "Pinneberg", country: "DE", year: "2026",
    alt: "Green and red aurora over a quiet residential street",
    focus: "50% 34%",
  },
  {
    key: "alsterlake",
    title: "Alster Lake", base: "Hamburg", country: "DE", year: "2025",
    alt: "A single sailboat on the Alster in evening light",
    focus: "50% 58%",
  },
  {
    key: "bratislava-cumil",
    title: "Bratislava", base: "Bratislava", country: "SK", year: "2025",
    alt: "A bronze man leaning out of a manhole in the cobbles, a passer-by behind him",
    focus: "50% 38%",
  },
  {
    key: "jaipur",
    title: "Jaipur", base: "Jaipur", country: "IN", year: "2023",
    alt: "The pink honeycomb facade of the Hawa Mahal",
    focus: "50% 50%",
  },
  {
    key: "st-pauli",
    title: "St. Pauli", base: "Hamburg", country: "DE", year: "2026",
    alt: "St. Pauli rooftops and neon under a pink dusk sky",
    focus: "50% 42%",
  },
  {
    key: "heinrich-hertz-turm",
    title: "Heinrich-Hertz-Turm", base: "Hamburg", country: "DE", year: "2026",
    alt: "Hamburg's television tower seen through cherry blossom",
    focus: "32% 42%",
  },
  {
    key: "budapest-tram",
    title: "Budapest", base: "Budapest", country: "HU", year: "2025",
    alt: "A yellow tram on the embankment, the castle on its hill across the river",
    focus: "50% 42%",
  },
  {
    key: "prague",
    title: "Prague", base: "Prague", country: "CZ", year: "2025",
    alt: "Prague rooftops with the spires of the Týn church beyond",
    focus: "50% 50%",
  },
  {
    key: "aussenalster",
    title: "Außenalster", base: "Hamburg", country: "DE", year: "2026",
    alt: "Two ducks on the rippled surface of the Alster",
    focus: "48% 58%",
  },
  {
    key: "gateway-of-india",
    title: "Gateway of India", base: "Mumbai", country: "IN", year: "2026",
    alt: "The stone arch and turrets of the Gateway of India",
    focus: "55% 40%",
  },
  {
    key: "hamburg-2026",
    title: "Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "White houses stacked up the Blankenese slope above a metal roof",
    focus: "50% 42%",
  },
  {
    key: "budapest-boulevard",
    title: "Budapest", base: "Budapest", country: "HU", year: "2025",
    alt: "A yellow tram crossing a boulevard junction below ornate apartment blocks",
    focus: "50% 48%",
  },
  {
    key: "strasbourg",
    title: "Strasbourg", base: "Strasbourg", country: "FR", year: "2025",
    alt: "Half-timbered houses under red Christmas light",
    focus: "50% 45%",
  },
  {
    key: "pinnaupinneberg",
    title: "Pinnau Pinneberg", base: "Pinneberg", country: "DE", year: "2026",
    alt: "Clouds mirrored in still water at the edge of a wood",
    focus: "50% 50%",
  },
  {
    key: "cresentmoon",
    title: "Crescent Moon", base: "Hamburg", country: "DE", year: "2026",
    alt: "A thin crescent moon in a graded dusk sky",
    focus: "50% 46%",
  },
  {
    key: "budapest-2025",
    title: "Budapest", base: "Budapest", country: "HU", year: "2025",
    alt: "A crowded street leading to the dome of St. Stephen's Basilica",
    focus: "50% 40%",
  },
  {
    key: "elbphilharmonie-hamburg",
    title: "Elbphilharmonie Hamburg", base: "Hamburg", country: "DE", year: "2025",
    alt: "The glass wave of the Elbphilharmonie above the trees",
    focus: "50% 36%",
  },
  {
    key: "alsterlake2",
    title: "Alster Lake", base: "Hamburg", country: "DE", year: "2025",
    alt: "A runner on the Alster path, framed by bare winter trees",
    focus: "55% 75%",
  },
  {
    key: "flensburg",
    title: "Flensburg", base: "Flensburg", country: "DE", year: "2026",
    alt: "Flensburg harbour with the St. Jürgen spire on the hill above it",
    focus: "50% 40%",
  },
  {
    key: "amsterdam",
    title: "Amsterdam", base: "Amsterdam", country: "NL", year: "2024",
    alt: "A canal boat coming up the water between canal houses",
    focus: "50% 62%",
  },
  {
    key: "atlantichamburg",
    title: "Atlantic Hamburg", base: "Hamburg", country: "DE", year: "2025",
    alt: "The Hotel Atlantic's green roof over autumn trees",
    focus: "52% 46%",
  },
  {
    key: "st-peter-s-church2",
    title: "St. Peter's Church", base: "Hamburg", country: "DE", year: "2026",
    alt: "The copper spire of St. Petri against a winter sky",
    focus: "48% 38%",
  },
  {
    key: "marine-driave-mumbai",
    title: "Marine Drive Mumbai", base: "Mumbai", country: "IN", year: "2026",
    alt: "Two fishermen working a small boat off Marine Drive",
    focus: "55% 46%",
  },
  {
    key: "dammtor",
    title: "Dammtor", base: "Hamburg", country: "DE", year: "2025",
    alt: "A carved stone dormer catching low autumn sun",
    focus: "50% 42%",
  },
  {
    key: "schwerin",
    title: "Schwerin", base: "Schwerin", country: "DE", year: "2025",
    alt: "Turrets and a gilded figure on Schwerin Castle",
    focus: "45% 42%",
  },
  {
    key: "the-perseids-meteor-shower-2026",
    title: "The Perseids Meteor Shower", base: "Hamburg", country: "DE", year: "2026",
    alt: "A field of stars above a black treeline",
    focus: "50% 45%",
  },
  {
    key: "blankanese",
    title: "Blankenese", base: "Hamburg", country: "DE", year: "2026",
    alt: "The red-and-white lighthouse standing above garden parasols",
    focus: "50% 55%",
  },
  {
    key: "hafen-city",
    title: "Hafen City", base: "Hamburg", country: "DE", year: "2025",
    alt: "HafenCity office blocks behind the raised U-Bahn track",
    focus: "50% 46%",
  },
  {
    key: "vienna-cathedral",
    title: "Vienna Cathedral", base: "Vienna", country: "AT", year: "2025",
    alt: "A frescoed baroque ceiling inside a church in Vienna",
    focus: "50% 50%",
  },
  {
    key: "pinnaupinneberg2",
    title: "Pinnau Pinneberg", base: "Pinneberg", country: "DE", year: "2026",
    alt: "A path beside the Pinnau running out through evening fields",
    focus: "50% 55%",
  },
  {
    key: "berlin",
    title: "Berlin", base: "Berlin", country: "DE", year: "2024",
    alt: "The sphere of the Berlin television tower against grey sky",
    focus: "50% 50%",
  },
  {
    key: "solar-eclipse-hamburg-2026",
    title: "Solar Eclipse Hamburg", base: "Hamburg", country: "DE", year: "2026",
    alt: "The partly eclipsed sun setting over the Alster",
    focus: "50% 42%",
  },
  {
    key: "strawberry-picking",
    title: "Strawberry Picking", base: "Pinneberg", country: "DE", year: "2026",
    alt: "A just-picked strawberry held over the punnet",
    focus: "52% 50%",
  },
  {
    key: "landungsbrucken",
    title: "Landungsbrücken", base: "Hamburg", country: "DE", year: "2025",
    alt: "The Landungsbrücken lettering above autumn scrub",
    focus: "50% 50%",
  },
  {
    key: "budapest-2025-2",
    title: "Budapest", base: "Budapest", country: "HU", year: "2025",
    alt: "The obelisk on Szabadság tér behind a bed of red flowers",
    focus: "48% 48%",
  },
  {
    key: "st-peter-s-church",
    title: "St. Peter's Church", base: "Hamburg", country: "DE", year: "2026",
    alt: "St. Petri's spire seen between snow-loaded branches",
    focus: "50% 40%",
  },
  {
    key: "berlin2",
    title: "Berlin", base: "Berlin", country: "DE", year: "2024",
    alt: "The green spire of the Marienkirche through bare branches",
    focus: "48% 45%",
  },
  {
    key: "pinneberg",
    title: "Pinneberg", base: "Pinneberg", country: "DE", year: "2025",
    alt: "A petrol station on the edge of town at dusk",
    focus: "50% 60%",
  },
  {
    key: "strasbourg-2",
    title: "Strasbourg", base: "Strasbourg", country: "FR", year: "2025",
    alt: "A lantern-topped tower silhouetted against cloud",
    focus: "52% 45%",
  },
];

/* src, srcSet, natural dimensions and the LQIP all come from the pipeline.
   A key with no processed original is dropped rather than rendered broken —
   run `npm run photos` after adding one to raw/gallery/. */
export const photos: Photo[] = manifest.flatMap((photo) => {
  const asset = photoManifest[photo.key];
  return asset ? [{ ...photo, ...asset }] : [];
});

/** The phone every `shot` was taken on. */
export const SHOT_DEVICE = "iPhone 17 Pro";

/** "iPhone 17 Pro · 100mm · f/2.8 · 1/120s · ISO 80", or null for a photo without one. */
export function shotLine(photo: Pick<Photo, "shot">): string | null {
  const { shot } = photo;
  if (!shot) return null;
  return [SHOT_DEVICE, shot.focal, shot.aperture, `${shot.shutter}s`, `ISO ${shot.iso}`].join(" · ");
}

export const photoByKey = (key: string) => photos.find((photo) => photo.key === key);

/** How long the Life tile holds each photograph before crossfading, in ms. */
export const GALLERY_ROTATE_MS = 4000;

/* Derived so the counts can never drift from the manifest. */
export const photoCount = photos.length;
export const photoCities = Array.from(new Set(photos.map((p) => p.base)));
export const galleryCountLabel = `${photoCount} photos · ${photoCities.length} cities`;

/** Cities ordered by how many photos they carry — used for short captions. */
export const topPhotoCities = [...photoCities].sort(
  (a, b) =>
    photos.filter((p) => p.base === b).length - photos.filter((p) => p.base === a).length
);
