"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GALLERY_ROTATE_MS, photos } from "@/lib/content";

/* One photograph at a time, full width, in a white frame — now walking the
   whole gallery on a 4s beat. Still not a card and not a control surface: no
   header label, no count line, no tab bar, nothing sitting on the picture.
   Filtering belongs to the gallery this links to (§11), and the tile's only job
   is to be worth clicking.

   The frame is the one place on the site that does crop — the masonry and the
   lightbox show every photo whole (§9) — so each photo carries its own `focus`
   point and the crop is taken around the subject rather than the centre.

   It keeps its beat under `prefers-reduced-motion` rather than freezing on the
   first photograph — what that setting takes away is the dissolve, not the
   gallery: the stylesheet collapses the transition to nothing and each photo
   cuts straight to the next. Only a backgrounded tab stops the clock.

   Only three slides are ever mounted: the one showing, the one it replaced, and
   the next one, staged at zero opacity so it is decoded before its turn. */
export default function GalleryPreview() {
  /* `leaving` is carried rather than computed as `showing - 1`: on the very
     first paint there is nothing leaving yet, and computing it would mount the
     last photograph in the gallery — a whole image fetched to fade out of a
     frame it was never in. */
  const [slide, setSlide] = useState({ showing: 0, leaving: -1 });

  useEffect(() => {
    if (photos.length < 2) return;

    const tick = () =>
      setSlide(({ showing }) => ({
        showing: (showing + 1) % photos.length,
        leaving: showing,
      }));
    let timer = window.setInterval(tick, GALLERY_ROTATE_MS);

    /* A backgrounded tab still fires intervals, which would burn through the
       whole gallery — and its bandwidth — with nobody watching. */
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(tick, GALLERY_ROTATE_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* Leaving first so the arriving photograph fades in over it, and the next one
     last, staged at zero opacity so it is fetched and decoded before its turn. */
  const next = (slide.showing + 1) % photos.length;
  const mounted = Array.from(
    new Set([slide.leaving, slide.showing, next].filter((i) => i >= 0))
  );

  return (
    <div className="gp-tile">
      {/* A mouse convenience that duplicates the link below it, so assistive
          tech is offered the gallery once rather than twice. */}
      <Link className="gp-frame" href="/gallery" aria-hidden="true" tabIndex={-1}>
        <span className="gp-stack">
          {mounted.map((i) => {
            const photo = photos[i];
            return (
              <img
                key={photo.key}
                className="gp-shot"
                data-role={
                  i === slide.showing ? "showing" : i === slide.leaving ? "leaving" : "staged"
                }
                src={photo.src}
                srcSet={photo.srcSet}
                /* token-exempt: media conditions, same as @media — CSS vars don't apply */
                sizes="(max-width: 860px) 92vw, 30vw"
                alt=""
                width={photo.width}
                height={photo.height}
                decoding="async"
                /* token-exempt: focal point and LQIP data URI from the photo manifest */
                style={{
                  objectPosition: photo.focus,
                  ...(photo.lqip
                    ? { backgroundImage: `url(${photo.lqip})`, backgroundSize: "cover" }
                    : {}),
                }}
              />
            );
          })}
        </span>
      </Link>

      <Link className="gp-cta" href="/gallery">
        View gallery
      </Link>
    </div>
  );
}
