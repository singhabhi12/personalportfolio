/* The weather line's back wall: where the footer's reading comes from.

   components/Weather.tsx asks here once per page load and shows whatever
   comes back. The signing, the WeatherKit call and the words all live in
   lib/weather.ts; this only decides what a visitor's browser is told and for
   how long it may keep it.

   Apple is not called once per visit: the fetch inside lib/weather.ts is
   cached for REVALIDATE_SECONDS, and the same number goes out as `s-maxage`
   so the CDN holds the answer too. `stale-while-revalidate` lets a visitor
   have the last reading instantly while a new one is fetched behind them.

   With no key in this environment — or with Apple refusing — this answers 503
   and the line keeps lib/content's words. That is not the visitor's fault, so
   it is a server error rather than a 404, and it is not cached. */

import { currentWeather, REVALIDATE_SECONDS } from "@/lib/weather";

export async function GET() {
  const reading = await currentWeather().catch((error) => {
    console.error("weather: the reading failed", error);
    return null;
  });

  if (!reading) {
    return Response.json(
      { ok: false, reason: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(reading, {
    headers: {
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=3600`,
    },
  });
}
