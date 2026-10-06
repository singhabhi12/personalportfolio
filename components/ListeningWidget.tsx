import WidgetCard from "./WidgetCard";
import VinylDisc from "./VinylDisc";
import { listening } from "@/lib/content";
import { ARTWORK_SIZES, artworkAt, nowPlaying } from "@/lib/listening";

/* Listening — the song on right now, as a record on the desk: the disc hangs
   off the card's left edge, cover art on its label, and the words sit beside
   it. Hover the record and it plays (components/VinylDisc.tsx).

   A server component that runs at build (lib/listening.ts): the cover, its
   colours and the link are looked up once and frozen into the page, so no visitor
   waits on Apple and no token reaches the browser. A build with no MusicKit
   key still gets the cover, the link and the preview — those come from the
   keyless search — and only the cover's own colours are lost, so the record
   is pressed in lib/content's blank black instead. If Apple cannot be reached
   at all the card keeps the title and artist from lib/content and presses a
   blank-labelled record — never an empty card.

   The label is rendered here rather than by WidgetCard so it can sit beside
   the disc instead of above it; the card is a row, not a stack.

   No glyph after the label: §9's budget has one slot left and this does not
   spend it. */
export default async function ListeningWidget() {
  const song = await nowPlaying();
  const title = song?.title ?? listening.title;
  const artist = song?.artist ?? listening.artist;
  const artwork = song?.artwork || null;

  return (
    <WidgetCard className="listening">
      <div className="listening-row">
        <VinylDisc
          src={song?.preview ?? null}
          artwork={artwork ? artworkAt(artwork, ARTWORK_SIZES[0]) : ""}
          artworkSet={
            artwork
              ? ARTWORK_SIZES.map((size) => `${artworkAt(artwork, size)} ${size}w`).join(", ")
              : ""
          }
          background={song?.artworkBackground || listening.blankDisc.background}
          swirl={song?.artworkColors.at(-1) || listening.blankDisc.swirl}
          title={`${title} — ${artist}`}
        />

        <div className="listening-text">
          <p className="widget-label">{listening.label}</p>
          {song ? (
            <a
              className="listening-title about-link link-sweep"
              href={song.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} — ${listening.link}`}
            >
              {title}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ) : (
            <p className="listening-title">{title}</p>
          )}
          <p className="listening-artist">{artist}</p>
          {song?.preview && (
            <p className="about-aside listening-hint" aria-hidden="true">
              <span data-hint="hover">{listening.hint.hover}</span>
              <span data-hint="tap">{listening.hint.tap}</span>
            </p>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
