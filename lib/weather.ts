/* Apple WeatherKit — the reading behind the weather line.

   Server-only: this reads the file system and Node's crypto, so nothing here
   can be imported from a client component. components/Weather.tsx takes the
   `Reading` type with `import type` (erased at compile time) and asks
   app/api/weather for the reading itself.

   Unlike the Apple Music lookup next door this cannot be a build-time read:
   weather frozen into static HTML is wrong within the hour. So the pages stay
   static, the route handler answers the reading, and the line fills in on the
   client the way the clock does. Apple is only actually asked once every
   REVALIDATE_SECONDS — the fetch below is cached, not the route — which keeps
   a busy day well inside WeatherKit's free monthly calls.

   The token is an ES256 JWT this file signs with a private key from the Apple
   Developer portal (Keys → a key with WeatherKit enabled). It names a service
   as well as the key: WeatherKit tokens carry <team>.<service> in the header
   and the service again as `sub`, where the service is an identifier from the
   portal with WeatherKit turned on. Four env vars name all of it (see
   .env.example), and locally the key can sit in the project root as
   AuthKey_<KEY_ID>.p8.

   With any of them missing the reading is null, the route says so, and both
   places that show weather keep what they showed before this file existed:
   lib/content's `stamp.weather` in the footer, and nothing on the location
   card. Nothing about the key ever reaches the browser. */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { home } from "./content";
import { places } from "./places";

const API = "https://weatherkit.apple.com/api/v1/weather";

/** How long a reading is held before Apple is asked again. Fifteen minutes is
    finer than Apple updates a current-conditions reading anyway. */
export const REVALIDATE_SECONDS = 900;

/** The nine skies the location card can be painted in — see "The sky" in
    app/globals.css. */
export type Sky =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "rain"
  | "sleet"
  | "snow"
  | "storm"
  | "wind";

export interface Reading {
  /** Whole degrees Celsius — the line says it the way a thermometer does. */
  tempC: number;
  /** Apple's own condition code, kept so a caller can read it its own way. */
  code: string;
  /** The line itself, e.g. "11° and overcast". */
  label: string;
  /** Which painting the card wears. */
  sky: Sky;
  /** Apple's own answer to whether the sun is up — not a clock reading, so it
      is right in a Hamburg December as well as at a June midnight. It picks
      the night variant of the clear, partly and cloudy skies. */
  daylight: boolean;
  /** When Apple read it (ISO 8601). */
  asOf: string;
}

/* The city the weather is read for, taken from the map rather than written
   down a second time: lib/places already holds Hamburg's coordinates. */
const city = places.find((place) => place.city === home.location.weatherCity) ?? places[0];

/* Apple's condition codes, in one table: the words the footer says, and the
   sky the card is painted in. One row per code, so a code can never have a
   phrase without a sky or the other way round.

   `phrase` has to read after "and" — so "thundery" rather than "thunderstorms"
   — and `sky` is one of the nine paintings in app/globals.css ("The sky").
   Nine rather than Apple's forty on purpose: the card wants the weather at a
   glance, and a drizzle and a downpour look the same through a window. */
const CONDITIONS: Record<string, { phrase: string; sky: Sky }> = {
  Clear: { phrase: "clear", sky: "clear" },
  MostlyClear: { phrase: "mostly clear", sky: "clear" },
  PartlyCloudy: { phrase: "partly cloudy", sky: "partly" },
  MostlyCloudy: { phrase: "mostly cloudy", sky: "cloudy" },
  Cloudy: { phrase: "overcast", sky: "cloudy" },
  Haze: { phrase: "hazy", sky: "fog" },
  Smoke: { phrase: "hazy", sky: "fog" },
  Dust: { phrase: "hazy", sky: "fog" },
  Fog: { phrase: "foggy", sky: "fog" },
  Breezy: { phrase: "breezy", sky: "wind" },
  Windy: { phrase: "windy", sky: "wind" },
  Drizzle: { phrase: "drizzling", sky: "rain" },
  FreezingDrizzle: { phrase: "freezing over", sky: "sleet" },
  FreezingRain: { phrase: "freezing over", sky: "sleet" },
  Rain: { phrase: "raining", sky: "rain" },
  HeavyRain: { phrase: "pouring", sky: "rain" },
  Showers: { phrase: "raining", sky: "rain" },
  ScatteredShowers: { phrase: "raining on and off", sky: "rain" },
  MixedRainfall: { phrase: "wet", sky: "rain" },
  Sleet: { phrase: "sleeting", sky: "sleet" },
  MixedRainAndSleet: { phrase: "sleeting", sky: "sleet" },
  MixedSnowAndSleet: { phrase: "sleeting", sky: "sleet" },
  MixedRainAndSnow: { phrase: "sleeting", sky: "sleet" },
  Hail: { phrase: "hailing", sky: "sleet" },
  Flurries: { phrase: "snowing", sky: "snow" },
  Snow: { phrase: "snowing", sky: "snow" },
  HeavySnow: { phrase: "deep in snow", sky: "snow" },
  SnowShowers: { phrase: "snowing", sky: "snow" },
  ScatteredSnowShowers: { phrase: "snowing on and off", sky: "snow" },
  BlowingSnow: { phrase: "snowing sideways", sky: "snow" },
  Blizzard: { phrase: "a blizzard", sky: "snow" },
  IsolatedThunderstorms: { phrase: "thundery", sky: "storm" },
  ScatteredThunderstorms: { phrase: "thundery", sky: "storm" },
  Thunderstorms: { phrase: "thundery", sky: "storm" },
  SevereThunderstorm: { phrase: "thundery", sky: "storm" },
  TropicalStorm: { phrase: "stormy", sky: "storm" },
  Hurricane: { phrase: "stormy", sky: "storm" },
  Tornado: { phrase: "stormy", sky: "storm" },
  Hot: { phrase: "hot", sky: "clear" },
  Frigid: { phrase: "freezing", sky: "clear" },
};

/** What a code the table does not know gets: the temperature on its own,
    under the sky that says least. */
const UNKNOWN = { phrase: "", sky: "cloudy" } as const;

/** "11° and overcast", or just "11°" when there are no words for the code. */
const line = (tempC: number, phrase: string) =>
  phrase ? `${tempC}° and ${phrase}` : `${tempC}°`;

const base64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64url");

/** The key, from the env var or the .p8 in the project root. Null if neither. */
async function privateKey(keyId: string): Promise<string | null> {
  const fromEnv = process.env.WEATHERKIT_PRIVATE_KEY;
  if (fromEnv) return fromEnv.replace(/\\n/g, "\n");
  try {
    return await readFile(`AuthKey_${keyId}.p8`, "utf8");
  } catch {
    return null;
  }
}

/* One hour: longer than a reading is kept, far shorter than Apple's limit.
   `ieee-p1363` makes Node emit the raw r‖s signature a JWT wants rather than
   the DER wrapping it defaults to — the same note as lib/listening.ts.

   The team is WeatherKit's own env var when it has one and the Apple Music
   team otherwise: the same developer account signs both, and one 10-character
   identifier written twice is one that can disagree with itself. */
async function weatherToken(): Promise<string | null> {
  const teamId = process.env.WEATHERKIT_TEAM_ID || process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.WEATHERKIT_KEY_ID;
  const serviceId = process.env.WEATHERKIT_SERVICE_ID;
  if (!teamId || !keyId || !serviceId) return null;
  const key = await privateKey(keyId);
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    JSON.stringify({ alg: "ES256", kid: keyId, id: `${teamId}.${serviceId}` })
  );
  const claims = base64url(
    JSON.stringify({ iss: teamId, iat: now, exp: now + 60 * 60, sub: serviceId })
  );
  const signature = createSign("SHA256")
    .update(`${header}.${claims}`)
    .sign({ key, dsaEncoding: "ieee-p1363" });
  return `${header}.${claims}.${base64url(signature)}`;
}

interface CurrentWeather {
  asOf?: string;
  conditionCode?: string;
  daylight?: boolean;
  temperature?: number;
}

/** The weather where Abhishek is, as Apple reads it. Null when this
    environment has no WeatherKit key, or when Apple did not answer — in both
    cases the line falls back to what it said before. */
export async function currentWeather(): Promise<Reading | null> {
  const token = await weatherToken().catch((error) => {
    console.error("weather: could not sign a WeatherKit token", error);
    return null;
  });
  if (!token) {
    console.warn(
      "weather: no WeatherKit key in this environment, so the footer keeps " +
        "lib/content's line — set WEATHERKIT_SERVICE_ID, WEATHERKIT_KEY_ID " +
        "and the private key to read the real sky."
    );
    return null;
  }

  const url =
    `${API}/en/${city.lat}/${city.lng}` +
    `?dataSets=currentWeather&timezone=${encodeURIComponent(home.location.timeZone)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    console.error(`weather: WeatherKit answered ${response.status}`);
    return null;
  }

  const body = (await response.json()) as { currentWeather?: CurrentWeather };
  const current = body.currentWeather;
  /* A reading with no temperature is not a reading this line can show. */
  if (typeof current?.temperature !== "number") return null;

  const tempC = Math.round(current.temperature);
  const code = current.conditionCode ?? "";
  const { phrase, sky } = CONDITIONS[code] ?? UNKNOWN;
  return {
    tempC,
    code,
    label: line(tempC, phrase),
    sky,
    /* Apple leaves `daylight` out at some latitudes; with no answer the card
       wears the day sky rather than going dark on a guess. */
    daylight: current.daylight ?? true,
    asOf: current.asOf ?? "",
  };
}
