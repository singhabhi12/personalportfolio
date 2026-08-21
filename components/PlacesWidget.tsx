import WidgetCard from "./WidgetCard";
import PlacesMap from "./PlacesMap";
import { places, placesCountLabel } from "@/lib/content";

/* Places ◎ — the live Apple map (MapKit JS), then the count line and the city
   list §7 fixes beneath it.

   This card no longer honours §10's "no map library" rule, and the inline-SVG
   sketch that used to stand in for one is gone. Two consequences worth knowing:
   the card needs JavaScript to show anything now, and if the token expires or
   Apple rejects it the map area falls back to a short message rather than a
   map. lib/places.ts still projects and clusters, so the data and the
   projection are untouched. */
export default function PlacesWidget() {
  return (
    <WidgetCard label="Places" glyph="◎" className="side-full">
      <PlacesMap />

      <p className="places-count">{placesCountLabel}</p>
      <p className="micro-label places-list">
        {places.map((place) => place.city).join(" · ")}
      </p>
    </WidgetCard>
  );
}
