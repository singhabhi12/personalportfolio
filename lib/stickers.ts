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
  /** Where it lies in the pile along the foot of the page, before anyone has
      touched it: x as a fraction of the layer's width, y as a fraction of the
      pile band's height (app/globals.css, "The pile"). Nine stickers tipped
      out in two loose rows — they overlap, they are not square to anything,
      and not one of them is on a card, which is the point. The page reads as
      its own cards until a visitor drags one up onto them.

      Measured off the band rather than off the layer, so the pile stays at
      the foot whatever the cards above it do: the grid is a different height
      at every width, and a fraction of the whole layer would walk up into the
      prose as it re-flowed.

      They used to rest scattered over the cards in an arrangement Abhishek
      dragged by hand; that one is in git, up to the commit before this. */
  pile: [x: number, y: number];
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
    pile: [0.09, 0.38],
    pocket: [0.13, 0.38],
    note: "Eight-year-old me begged for this. Grown-up me has no time. Valorant, sometimes.",
  },
  {
    id: "airpods",
    size: [640, 552],
    width: 140,
    tilt: -12,
    pile: [0.41, 0.66],
    pocket: [0.38, 0.28],
    note: "The best thing Apple has made. Yes, I know the laptop is listening.",
  },
  {
    id: "headphones",
    size: [441, 640],
    width: 150,
    tilt: -7,
    pile: [0.3, 0.38],
    pocket: [0.64, 0.38],
    note: "Headphones are an accessory. Also earmuffs. Winter-approved.",
  },
  {
    id: "iphone",
    size: [347, 640],
    width: 95,
    tilt: 7,
    pile: [0.82, 0.66],
    pocket: [0.9, 0.32],
    note: "Photos, bossing AI agents around from the sofa, and calls home.",
  },
  {
    id: "redbull",
    size: [270, 612],
    width: 80,
    tilt: 12,
    pile: [0.19, 0.66],
    pocket: [0.25, 0.72],
    note: "No wings so far. Does keep me awake long enough to ship.",
  },
  {
    id: "ipad",
    size: [479, 640],
    width: 130,
    tilt: -9,
    pile: [0.73, 0.38],
    pocket: [0.52, 0.74],
    note: "Bought to complete the ecosystem. Now it does chess and Netflix. Mostly Netflix.",
  },
  {
    id: "macbook",
    size: [640, 465],
    width: 180,
    tilt: -6,
    pile: [0.52, 0.38],
    pocket: [0.78, 0.72],
    note: "My love. If this dies, so do I. Metaphorically. Mostly.",
  },
  {
    /* The ninth, and the one spot on the desk nobody dragged it to: the gap
       the macbook leaves above the AirPods, which is the only hole in the
       arrangement wide enough to take a sphere. Held off the record to its
       right on purpose — the disc is a control, and a sticker over its left
       edge takes the hover that plays the preview. */
    id: "homepod",
    size: [640, 616],
    width: 115,
    tilt: 9,
    pile: [0.62, 0.66],
    pocket: [0.92, 0.74],
    note: "Another piece of the Apple ecosystem. Minds the lights and the plugs, and plays something easy while I work.",
  },
  {
    id: "me",
    size: [595, 640],
    width: 120,
    tilt: 6,
    pile: [0.91, 0.38],
    pocket: [0.1, 0.74],
    note: "That's me. The outfit is AI. The face, sadly, is not.",
  },
];

export const stickerSrc = (id: string) => `/stickers/${id}.webp`;
