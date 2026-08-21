/* Places — travel data and the projection that puts it on the map.
   No map library, no tile server, no API key, nothing that phones home (§10).
   The whole widget is inline SVG and adds no runtime dependencies. */

import { photos } from "./gallery";

export interface Place {
  city: string;
  country: string;
  lat: number;
  lng: number;
  year: string;
  photoCount: number;
}

/* Every city the gallery actually stands in, ordered Hamburg-outward — the
   travel line below is drawn between the first entry and the last, so Hamburg
   stays at one end of it and Jaipur at the other. Hamburg and Jaipur carry the
   year they became home rather than a visit; the rest carry the year of the
   photographs. */
const cities: Omit<Place, "photoCount">[] = [
  { city: "Hamburg", country: "DE", lat: 53.55, lng: 9.99, year: "2021" },
  { city: "Pinneberg", country: "DE", lat: 53.66, lng: 9.8, year: "2025" },
  { city: "Schwerin", country: "DE", lat: 53.63, lng: 11.42, year: "2025" },
  { city: "Flensburg", country: "DE", lat: 54.78, lng: 9.44, year: "2026" },
  { city: "Berlin", country: "DE", lat: 52.52, lng: 13.4, year: "2024" },
  { city: "Amsterdam", country: "NL", lat: 52.37, lng: 4.9, year: "2024" },
  { city: "Strasbourg", country: "FR", lat: 48.58, lng: 7.75, year: "2025" },
  { city: "Prague", country: "CZ", lat: 50.09, lng: 14.42, year: "2025" },
  { city: "Vienna", country: "AT", lat: 48.21, lng: 16.37, year: "2025" },
  { city: "Bratislava", country: "SK", lat: 48.15, lng: 17.11, year: "2025" },
  { city: "Budapest", country: "HU", lat: 47.5, lng: 19.04, year: "2025" },
  { city: "Mumbai", country: "IN", lat: 19.08, lng: 72.88, year: "2026" },
  { city: "Jaipur", country: "IN", lat: 26.91, lng: 75.79, year: "home" },
];

/* Counted from the gallery rather than written down twice, so a photo added to
   lib/gallery.ts can never leave a stale number on the map. */
export const places: Place[] = cities.map((city) => ({
  ...city,
  photoCount: photos.filter((photo) => photo.base === city.city).length,
}));

/* The map's coordinate space. The landmass path below is drawn in these units. */
export const MAP_WIDTH = 440;
export const MAP_HEIGHT = 300;

/* The window the map frames: western Europe through northern India. Chosen so
   the six cities spread across the frame instead of huddling in one corner. */
export const MAP_BOUNDS = { west: -15, east: 95, north: 66.5, south: 1.5 };

/**
 * Equirectangular projection — latitude and longitude map linearly onto the
 * viewBox. Accurate enough for a decorative outline at this scale, and it keeps
 * the whole thing to four lines of arithmetic.
 */
export function project(lat: number, lng: number): { x: number; y: number } {
  const { west, east, north, south } = MAP_BOUNDS;
  return {
    x: ((lng - west) / (east - west)) * MAP_WIDTH,
    y: ((north - lat) / (north - south)) * MAP_HEIGHT,
  };
}

export interface Dot {
  /** Position as a percentage of the viewBox, so CSS can place it directly. */
  left: number;
  top: number;
  label: string;
  cities: Place[];
}

/**
 * Merge cities that project within `threshold` units of each other into a
 * single dot carrying a count, rather than letting them overlap into a blob.
 * Threshold is in viewBox units, which are ~1:1 with rendered px at the card's
 * typical width.
 */
export function clusterPlaces(input: Place[], threshold: number): Dot[] {
  const clusters: { x: number; y: number; cities: Place[] }[] = [];

  for (const place of input) {
    const { x, y } = project(place.lat, place.lng);
    const near = clusters.find(
      (c) => Math.hypot(c.x - x, c.y - y) <= threshold
    );
    if (near) {
      near.cities.push(place);
      // Recentre on the cluster's mean position.
      const points = near.cities.map((c) => project(c.lat, c.lng));
      near.x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      near.y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    } else {
      clusters.push({ x, y, cities: [place] });
    }
  }

  return clusters.map((c) => {
    const countries = new Set(c.cities.map((city) => city.country));
    const label =
      c.cities.length === 1
        ? `${c.cities[0].city} · ${c.cities[0].year}`
        : countries.size === 1
          ? `${c.cities.length} cities · ${[...countries][0]}`
          : `${c.cities.length} cities`;
    return {
      left: (c.x / MAP_WIDTH) * 100,
      top: (c.y / MAP_HEIGHT) * 100,
      label,
      cities: c.cities,
    };
  });
}

/** §Appendix B: --map-cluster-threshold. */
export const CLUSTER_THRESHOLD = 8;

export const mapDots = clusterPlaces(places, CLUSTER_THRESHOLD);

export const placeCountries = Array.from(new Set(places.map((p) => p.country)));
export const placesCountLabel = `${places.length} cities · ${placeCountries.length} countries`;

/* Simplified Eurasia landmass. Outline only — no tiles, labels, terrain, or
   region borders. Drawn in the MAP_WIDTH × MAP_HEIGHT space above. */
export const mapPath =
  "M60,66 L96,50 L150,44 L215,42 L290,48 L360,54 L410,64 L416,96 L398,128 L392,150 L380,152 L376,150 L372,158 L370,178 L366,206 L360,214 L354,204 L350,182 L346,160 L338,152 L322,150 L300,166 L276,172 L252,166 L224,168 L200,160 L172,150 L146,140 L120,124 L98,112 L84,96 L94,84 L72,80 L62,74 Z";

/* The dashed travel line on the gallery preview, drawn between the two
   extremes of the route rather than hand-placed. */
export const travelLine = (() => {
  const from = project(places[0].lat, places[0].lng);
  const to = project(places[places.length - 1].lat, places[places.length - 1].lng);
  return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
})();
