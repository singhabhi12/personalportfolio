"use client";

import { weather as copy } from "@/lib/content";
import { useWeather } from "./useWeather";

/* The weather where Abhishek is, from Apple (app/api/weather). Rendered as the
   fallback on the server and swapped for the real reading on the client, so a
   static build never freezes yesterday's sky into the page and nothing shifts
   on hydration — the same arrangement as components/LocalTime.tsx.

   The reading is fetched once per page and shared (components/useWeather.ts);
   components/WeatherSky.tsx paints the location card from the same one. */

export default function Weather({
  /** What the line says until the reading lands, and if it never does. */
  fallback = "",
  /** Show the credit WeatherKit's terms ask for. The footer does; the card on
      home does not, because the footer of that page already carries it. */
  credit = false,
  /** Spoken before the reading, for a reading with no visible label beside it
      to explain what it is. Hidden from the page (.sr-only): an aria-label on
      a plain span is a name on a role that does not take one. */
  label,
  className,
}: {
  fallback?: string;
  credit?: boolean;
  label?: string;
  className?: string;
}) {
  const reading = useWeather();

  const classes = ["weather", className].filter(Boolean).join(" ");

  /* No reading: the fallback, and no credit — there is nothing of Apple's on
     the page to credit yet. With no fallback either the line is a space, so it
     holds its height and the card below it does not move when the sky lands
     (components/LocalTime.tsx does the same). */
  if (!reading) {
    return <span className={classes}>{fallback || " "}</span>;
  }

  return (
    <span className={classes}>
      {label && <span className="sr-only">{label}: </span>}
      {reading.label}
      {credit && (
        <>
          {" · "}
          <a
            className="weather-credit"
            href={copy.creditHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.credit}
          </a>
        </>
      )}
    </span>
  );
}
