"use client";

import { useEffect, useState } from "react";
import { quotes } from "@/lib/content";
import { isStill } from "@/lib/motion";

/* The desk's quote card, cycling through every kind word on a four-second beat.

   All the quotes are in the markup from the first paint, stacked in one grid
   cell and cross-faded between. That is what keeps the card the height of the
   longest of them and stops it resizing mid-rotation — not a nicety here, since
   the tools panel below tucks under this card by a negative margin and would be
   shoved about every four seconds by a card that grew and shrank.

   On reduced motion the rotation still happens and the cross-fade does not: the
   global block in app/globals.css flattens the transition, so a quote swaps
   rather than dissolves. The rotation is the thing that was asked for; the
   dissolve is the decoration, and the decoration is what gets dropped.

   Note what this is, though, against the argument written at STILL_FLAG in
   lib/desk-scene.ts: that one turns on the send being "not a loop, not something
   that happens while you are trying to read", and this is both. So it is given
   the two ways out that a loop owes a reader — a pointer resting on the card
   stops it, and `?motion=still` stops it for the whole visit. */

/* Long enough to read a two-line quote, short enough that someone who glances
   away and back has probably seen a different one. */
const INTERVAL = 4000;

export default function DeskQuote() {
  const [index, setIndex] = useState(0);
  /* A pointer resting on the card means someone is reading it, so the rotation
     waits — and starts its four seconds over when they leave, rather than
     flipping the moment the cursor clears the edge. */
  const [held, setHeld] = useState(false);

  useEffect(() => {
    /* One quote is not a carousel, and a held or stilled card is not rotating. */
    if (quotes.length < 2 || held || isStill()) return;

    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % quotes.length),
      INTERVAL
    );
    return () => window.clearInterval(id);
  }, [held]);

  return (
    <div
      className="desk-quote"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      <p className="micro-label">Kind words</p>

      <div className="quote-deck">
        {quotes.map((quote, position) => (
          <figure
            className="quote-leaf"
            key={quote.attribution}
            data-current={position === index ? "" : undefined}
            /* The faded-out quotes are still on the page and still have their
               opacity — only this keeps them out of the screen reader's way. */
            aria-hidden={position !== index || undefined}
          >
            <blockquote className="quote-text">{quote.text}</blockquote>
            <figcaption className="quote-attribution">{quote.attribution}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
