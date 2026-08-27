/* The site's one motion switch.

   `?motion=still` opts a visit out of the two pieces that play regardless of
   `prefers-reduced-motion`: the letter fold on /contact, and the quote card's
   rotation on the desk. Each is a deliberate hole in the reduced-motion block
   in app/globals.css — this is the way back out of them, and the way to review
   the quiet path on a machine that does not set the preference.

   It lives in its own module because two features now read it, and one of them
   (lib/desk-scene.ts) carries the whole contact scene with it — the desk should
   not pull a typewriter into its bundle to learn one word. desk-scene re-exports
   it, so nothing that already imported it from there has to change. */
export const STILL_FLAG = "still";

/** Did this visit ask for the quiet version? Reads the URL, so browser-only. */
export const isStill = () =>
  new URLSearchParams(window.location.search).get("motion") === STILL_FLAG;
