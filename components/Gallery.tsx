"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { galleryCountLabel, photos } from "@/lib/content";

/* Gallery ⁕ — the photos. Soft masonry at natural aspect ratios, never
   force-cropped (§9), opening into the lightbox. Owns the /gallery route; it
   is no longer a section at the foot of /life.

   The lightbox is Phase 1, not a cosmetic: it is how the gallery is read.
   Escape closes, arrows navigate, scrim click closes, focus is trapped while
   open and returned to the triggering tile on close (§7). Body scroll locks
   without layout shift — `scrollbar-gutter: stable` on body reserves the
   gutter so removing the scrollbar moves nothing. */
export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = open !== null;

  const close = useCallback(() => {
    setOpen(null);
    const trigger = triggerRef.current;
    // Restore focus once the lightbox has unmounted.
    requestAnimationFrame(() => trigger?.focus());
  }, []);

  const step = useCallback((delta: number) => {
    setOpen((i) => (i === null ? i : (i + delta + photos.length) % photos.length));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  /* Warm the neighbours so arrow navigation doesn't flash a blank frame. */
  useEffect(() => {
    if (open === null) return;
    for (const delta of [1, -1]) {
      const neighbour = photos[(open + delta + photos.length) % photos.length];
      const preload = new Image();
      preload.src = neighbour.src;
      if (neighbour.srcSet) preload.srcset = neighbour.srcSet;
    }
  }, [open]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          close();
          break;
        case "ArrowRight":
          event.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          step(-1);
          break;
        case "Tab":
          // The close control is the only focusable thing in the dialog.
          event.preventDefault();
          closeRef.current?.focus();
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <section className="section" id="gallery">
        <div className="gallery-head">
          <h1 className="section-title">
            Gallery <span className="glyph" aria-hidden="true">⁕</span>
          </h1>
          <span className="micro-label">{galleryCountLabel}</span>
        </div>

        <div className="gmasonry">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              className="gtile"
              type="button"
              aria-haspopup="dialog"
              aria-label={`Open photo: ${photo.title}`}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setOpen(i);
              }}
            >
              <img
                className="shot"
                src={photo.src}
                srcSet={photo.srcSet}
                /* token-exempt: media conditions, same as @media — CSS vars don't apply */
                sizes="(max-width: 560px) 90vw, (max-width: 900px) 45vw, 30vw"
                alt=""
                width={photo.width}
                height={photo.height}
                loading="lazy"
                /* token-exempt: LQIP data URI emitted by the photo pipeline */
                style={photo.lqip ? { backgroundImage: `url(${photo.lqip})`, backgroundSize: "cover" } : undefined}
              />
              <span className="gcaption">
                <span className="gtitle">{photo.title}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={close}
        >
          <button
            ref={closeRef}
            className="lightbox-close"
            type="button"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <img
              className="lightbox-img"
              src={current.src}
              srcSet={current.srcSet}
              alt={current.alt}
              width={current.width}
              height={current.height}
              /* token-exempt: natural dimensions from the photo manifest.
                 Never upscaled beyond natural size; never taller than 90vh. */
              style={{
                maxWidth: `min(90vw, ${current.width}px)`,
                maxHeight: `min(90vh, ${current.height}px)`,
              }}
            />
            <div className="lightbox-caption">
              <span className="lightbox-title">{current.title}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
