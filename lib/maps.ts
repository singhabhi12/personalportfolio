/* MapKit JS — configuration and the data the live map draws.

   §10 says "don't use a map library", and the first paint still obeys it:
   the inline SVG in lib/places.ts is what the server sends, MapKit JS is
   fetched only after an explicit click, and the page renders whole with
   JavaScript off. Nothing phones home for a visitor who never opens it.

   The token is a static, domain-bound MapKit JS 6 token generated in the
   Apple Developer portal. There is no private key in this repo and no
   endpoint signing one, which is what lets the site stay `output: "export"`.
   MapKit tokens are public by design — they ship to the browser whatever you
   do — so the origin bound into the token, not secrecy, is what stops another
   site spending the quota. */

import { places } from "./places";

/* Inlined at build time by Next (see AGENTS.md → environment-variables).
   Written literally, not through a variable, or Next cannot substitute it. */
export const mapkitToken = process.env.NEXT_PUBLIC_MAPKIT_TOKEN ?? "";

/** With no token configured the widget stays exactly as it was: SVG, no button. */
export const mapsEnabled = mapkitToken.length > 0;

/** Only what the map draws. Search, directions, and Look Around stay unloaded. */
export const mapkitLibraries = ["map", "annotations"];

export interface MapPin {
  title: string;
  subtitle: string;
  country: string;
  lat: number;
  lng: number;
}

/* The same six places the SVG plots, phrased for a callout rather than a
   tooltip. Jaipur carries "home" instead of a year, so it reads as a word. */
export const mapPins: MapPin[] = places.map((place) => ({
  title: place.city,
  subtitle:
    place.year === "home"
      ? `${place.country} · home`
      : `${place.country} · ${place.year}`,
  country: place.country,
  lat: place.lat,
  lng: place.lng,
}));

/**
 * The label a merged balloon carries, matching what `clusterPlaces` writes on
 * the SVG's merged dots — "3 cities · DE" when they share a country, plain
 * "3 cities" when they don't. MapKit's own default is "Hamburg +4 more",
 * which picks an arbitrary member to speak for the rest.
 */
export const clusterLabel = (countries: string[]) => {
  const unique = [...new Set(countries)];
  return unique.length === 1
    ? `${countries.length} cities · ${unique[0]}`
    : `${countries.length} cities`;
};

/* How much air to leave around the outermost cities, and the smallest span
   the map may open at — without a floor, a single-city list would open zoomed
   to the rooftops. Degrees, not px; the token linter is not involved. */
const REGION_SLACK = 1.4;
const MIN_SPAN_DEGREES = 2;

/**
 * The bounding box of every place, as a MapKit region. Computed rather than
 * hand-tuned so adding a city to lib/places.ts reframes the map by itself —
 * the same property the SVG's projection has.
 */
export const mapRegion = (() => {
  const lats = places.map((place) => place.lat);
  const lngs = places.map((place) => place.lng);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);

  return {
    centerLat: (north + south) / 2,
    centerLng: (east + west) / 2,
    latitudeDelta: Math.max((north - south) * REGION_SLACK, MIN_SPAN_DEGREES),
    longitudeDelta: Math.max((east - west) * REGION_SLACK, MIN_SPAN_DEGREES),
  };
})();

/** Inset for showItems, so pin balloons are not clipped by the card's edge. */
export const MAP_INSET = 32;

/* Cities this close together share one balloon, the same way lib/places.ts
   merges dots — MapKit does the clustering itself once annotations opt in. */
export const CLUSTER_ID = "places";
