"use client";

import { useWeather } from "./useWeather";

/* The weather itself, painted into the empty right-hand half of the location
   card — the part the dotted ground was holding on its own.

   Everything it does is in the stylesheet ("The sky" in app/globals.css): this
   only names the painting and whether the sun is up. Nothing until the reading
   lands, so the card is the card it has always been in the meantime, and in an
   environment with no WeatherKit key it stays that way. */
export default function WeatherSky() {
  const reading = useWeather();
  if (!reading) return null;

  return (
    <span
      className="sky"
      data-sky={reading.sky}
      /* Present only at night — `.sky[data-night]` is how the dark variants
         are selected, and an absent attribute is a day with no second value
         to keep in step. */
      data-night={reading.daylight ? undefined : ""}
      aria-hidden="true"
    />
  );
}
