"use client";

import { useEffect } from "react";
import { STILL_FLAG, isStill } from "@/lib/motion";

/* Runs at parse time, ahead of the first paint.

   An effect alone is too late for anything that plays on arrival. The drawer on
   /work starts fanning the moment its folders are parsed, so a visitor who
   asked for the quiet version would watch it open halfway and then get cut off
   mid-slide when the effect finally landed — which is a worse answer than
   either version of the page. This is the same blocking-script trick a theme
   switch uses, and for the same reason.

   STILL_FLAG is interpolated rather than spelled out, so the script and
   lib/motion.ts cannot drift apart. Wrapped in try/catch because a blocking
   script that throws takes the parse with it, and nothing here is worth that. */
const BOOT = `try{if(new URLSearchParams(location.search).get('motion')===${JSON.stringify(
  STILL_FLAG
)})document.documentElement.dataset.motion=${JSON.stringify(STILL_FLAG)}}catch(e){}`;

/* Writes `?motion=still` onto the root element, where the CSS can see it.

   Renders in PageFrame, so the switch reaches every route rather than only the
   one that happens to mount a component reading it. The pieces that play under
   `prefers-reduced-motion` — the /contact fold, the desk caption, the /work
   drawer — close their holes in app/globals.css against this attribute; the
   contact send reads it back off the root when the button is pressed.

   The effect stays alongside the script: the nav is a set of next/link, so a
   move between routes is a client navigation the parser never sees again. */
export default function MotionFlag() {
  useEffect(() => {
    if (isStill()) document.documentElement.dataset.motion = STILL_FLAG;
  }, []);

  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
