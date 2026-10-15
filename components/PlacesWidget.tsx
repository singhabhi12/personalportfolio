import WidgetCard from "./WidgetCard";
import PlacesMap from "./PlacesMap";
import { placesCountLabel } from "@/lib/content";

/* Places ◎ — the live Apple map (MapKit JS), then the count line beneath it.
   The city list that used to follow the count is gone: the map is the list.

   The strip it lives in is 3:1 at its shortest and grows from there: on Life
   this is the card that squares its track up with the others, and a map is the
   one thing on that track with no height of its own to lose (app/globals.css,
   "Life"). `.places` is the handle that rule reaches it by.

   This card no longer honours §10's "no map library" rule, and the inline-SVG
   sketch that used to stand in for one is gone. Two consequences worth knowing:
   the card needs JavaScript to show anything now, and if the token expires or
   Apple rejects it the map area falls back to a short message rather than a
   map. lib/places.ts still projects and clusters, so the data and the
   projection are untouched. */
export default function PlacesWidget() {
  return (
    <WidgetCard label="Places" glyph="◎" className="places">
      <PlacesMap />

      <p className="places-count">{placesCountLabel}</p>
    </WidgetCard>
  );
}
