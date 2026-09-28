/* The things on the desk, as stickers on the Life page — and one of the
   person whose desk it is.

   Each is a product shot (or the portrait) cut out and given a white die-cut
   border by scripts/build-stickers.py; the browser adds the shadow, the peel
   and the drag (components/StickerSheet.tsx). The source shots live in
   "Sticker animation/on Desk items" and are inputs only. */

export interface Sticker {
  id: string;
  /** Natural size of the finished webp, so the box holds its shape before the
      file lands. */
  size: [width: number, height: number];
  /** Rendered width in CSS px on the two-column layout; the phone band scales
      it down. */
  width: number;
  /** Resting rotation, degrees. Stickers are never quite straight. */
  tilt: number;
  /** Where it sits on the two-column layout, as fractions of the sticker
      layer's width and height. Kept off the prose: corners of the cards, the
      gap beside the heading, over the photographs. */
  desk: [x: number, y: number];
  /** Where it sits in the one-column band above the page on a phone. Two rows
      of a loose sheet — the band is short, so they overlap on purpose. */
  pocket: [x: number, y: number];
  /** The line on the back, shown while the sticker is held. One or two short
      sentences in the site's aside voice: a joke, not a spec sheet. */
  note: string;
}

export const stickers: Sticker[] = [
  {
    id: "controller",
    size: [613, 429],
    width: 170,
    tilt: 8,
    desk: [0.45, -0.01],
    pocket: [0.13, 0.3],
    note: "Eight-year-old me begged for this. Grown-up me has no time. Valorant, sometimes.",
  },
  {
    id: "airpods",
    size: [640, 552],
    width: 140,
    tilt: -12,
    desk: [0.95, 0.03],
    pocket: [0.38, 0.28],
    note: "The best thing Apple has made. Yes, I know the laptop is listening.",
  },
  {
    id: "headphones",
    size: [441, 640],
    width: 150,
    tilt: -7,
    /* Over the gap between the columns, a little above the photo tile's
       bottom-left corner — that corner is the "View gallery" pill, and the
       link's only label has to be readable at rest. */
    desk: [0.52, 0.56],
    pocket: [0.64, 0.3],
    note: "Headphones are an accessory. Also earmuffs. Winter-approved.",
  },
  {
    id: "iphone",
    size: [347, 640],
    width: 95,
    tilt: 7,
    desk: [0.857, 0.61],
    pocket: [0.9, 0.32],
    note: "Photos, bossing AI agents around from the sofa, and calls home.",
  },
  {
    id: "redbull",
    size: [270, 612],
    width: 80,
    tilt: 12,
    /* Set down on the Listening card's top-right corner, under the deck and
       clear of the song's text and its two controls. */
    desk: [0.975, 0.82],
    pocket: [0.25, 0.72],
    note: "No wings so far. Does keep me awake long enough to ship.",
  },
  {
    id: "ipad",
    size: [479, 640],
    width: 130,
    tilt: -9,
    /* Hangs off the Listening card's bottom-right corner — only its top edge
       is on the card, and nothing sits under it there. */
    desk: [0.93, 1.09],
    pocket: [0.52, 0.74],
    note: "Bought to complete the ecosystem. Now it does chess and Netflix. Mostly Netflix.",
  },
  {
    id: "macbook",
    size: [640, 465],
    width: 180,
    tilt: -6,
    desk: [0.442, 1.03],
    pocket: [0.78, 0.72],
    note: "My love. If this dies, so do I. Metaphorically. Mostly.",
  },
  {
    id: "me",
    size: [595, 640],
    width: 120,
    tilt: 6,
    /* On the photograph's top-left corner, over the sky — the one place a
       whole face fits without covering prose or a control. Not the bottom
       edge: the page clips there, and a lid can lose its bottom half where a
       face cannot. */
    desk: [0.615, 0.31],
    pocket: [0.1, 0.74],
    note: "That's me. The outfit is AI. The face, sadly, is not.",
  },
];

export const stickerSrc = (id: string) => `/stickers/${id}.webp`;
