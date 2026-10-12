"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GALLERY_ROTATE_MS } from "@/lib/gallery";

export interface HeroSlide {
  key: string;
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  focus: string;
  lqip?: string;
  alt: string;
  title: string;
  /** "iPhone 17 Pro · 100mm · f/2.8 …", or null for a photo without one. */
  shot: string | null;
}

/* The big frame in the middle of home: the photographs, one at a time, with
   the caption set in a pill on the picture and the dots in the corner — the
   reference's hero, carrying @whatabhisaw instead of an event photo.

   The same mechanics as the Life tile (components/GalleryPreview.tsx): only
   the showing, leaving and next slides are mounted, the next one staged at
   zero opacity so it is decoded before its turn, and a hidden tab stops the
   clock. Under reduced motion the dissolve keeps its time (.gp-shot in the
   reduced-motion block) — the rotation is the content, not decoration.

   The pointer over the frame holds it, so a caption can be read. The dots are
   real buttons: a visitor can go straight to a photograph. */
export default function HeroCarousel({ slides, label }: { slides: HeroSlide[]; label: string }) {
  const [slide, setSlide] = useState({ showing: 0, leaving: -1 });
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || held) return;
    const tick = () =>
      setSlide(({ showing }) => ({ showing: (showing + 1) % slides.length, leaving: showing }));
    let timer = window.setInterval(tick, GALLERY_ROTATE_MS);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(tick, GALLERY_ROTATE_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slides.length, held]);

  const go = (index: number) =>
    setSlide(({ showing }) => (index === showing ? { showing, leaving: -1 } : { showing: index, leaving: showing }));

  /* One photograph per city is nineteen of them, not eight: past ten the dot
     row is set tighter and the caption gives it more room, and on a phone the
     row moves to the opposite corner rather than meeting the caption in the
     same one (app/globals.css, "The hero: photographs"). */
  const dense = slides.length > 10;

  const next = (slide.showing + 1) % slides.length;
  const mounted = Array.from(new Set([slide.leaving, slide.showing, next].filter((i) => i >= 0)));
  const current = slides[slide.showing];

  return (
    <div
      className="hc"
      data-dense={dense ? "true" : undefined}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <Link className="hc-frame" href="/gallery" aria-label={`${current.alt} — open the gallery`}>
        {mounted.map((i) => {
          const photo = slides[i];
          return (
            <img
              key={photo.key}
              className="gp-shot"
              data-role={i === slide.showing ? "showing" : i === slide.leaving ? "leaving" : "staged"}
              src={photo.src}
              srcSet={photo.srcSet}
              /* token-exempt: media conditions, same as @media — CSS vars don't apply */
              sizes="(max-width: 1000px) 100vw, 50vw"
              alt=""
              width={photo.width}
              height={photo.height}
              decoding="async"
              /* token-exempt: focal point and LQIP data URI from the photo manifest */
              style={{
                objectPosition: photo.focus,
                ...(photo.lqip ? { backgroundImage: `url(${photo.lqip})` } : {}),
              }}
            />
          );
        })}
      </Link>

      {/* Outside the link so it is not read twice; it says which photograph,
          and the first one is the photo of the week. */}
      <p className="hc-caption" aria-live="polite">
        {slide.showing === 0 && <span className="hc-week">{label}</span>}
        <span className="hc-title">{current.title}</span>
        {current.shot && <span className="hc-shot">{current.shot}</span>}
      </p>

      <div className="hc-dots" role="group" aria-label="Photographs">
        {slides.map((photo, i) => (
          <button
            key={photo.key}
            type="button"
            className="hc-dot"
            aria-label={`Photograph ${i + 1} of ${slides.length}`}
            aria-current={i === slide.showing ? "true" : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
