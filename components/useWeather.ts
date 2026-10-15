"use client";

import { useEffect, useState } from "react";
import type { Reading } from "@/lib/weather";

/* The reading from app/api/weather, shared by everything on the page that
   shows weather — the footer line, and the sky behind the location card.

   Three of these can mount at once and they must not ask three times, so the
   promise is the cache: the first mount starts the request, the rest wait on
   the same one. Module-level, so it lives as long as the tab does and a
   client-side route change reuses it rather than refetching. */
let pending: Promise<Reading | null> | null = null;

const read = () =>
  (pending ??= fetch("/api/weather")
    .then((response) => (response.ok ? (response.json() as Promise<Reading>) : null))
    .catch(() => null));

/** Null until the reading lands, and for good in an environment with no
    WeatherKit key — every caller has to render something either way. */
export function useWeather(): Reading | null {
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    let live = true;
    read().then((answer) => {
      if (live) setReading(answer);
    });
    return () => {
      live = false;
    };
  }, []);

  return reading;
}
