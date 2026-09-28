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
  /** Responsive sources, emitted by the photo pipeline. */
  srcSet?: string;
  /** Inlined ~20px blurred placeholder so tiles don't pop in. */
  lqip?: string;
}

/* Ordered for the eye, not alphabetically: orientations and cities alternate so
   the masonry never stacks four portraits of the same skyline, and the Life
   tile — which walks this list in order — keeps changing subject. */
const manifest: Omit<Photo, "src" | "width" | "height">[] = [
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
