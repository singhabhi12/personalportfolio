"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";

/* Nav is Home · Work · Life · Fun · Contact. Each item is its own route —
   no home-page anchors. Life is the About page plus the photo gallery.

   Fun sits fourth rather than last: Contact is the one thing the site is
   asking for, so it keeps the end of the row.

   Every item is on the capsule at every width. Fun used to come off it below
   760px, back when it was a drawing page that needed a surface and a hand; a
   board game needs a thumb, so there is nothing left to withhold. */
const items = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "life", label: "Life", href: "/life" },
  { key: "fun", label: "Fun", href: "/fun" },
  { key: "contact", label: "Contact", href: "/contact" },
] as const;

export type NavKey = (typeof items)[number]["key"];

/* The capsule in Liquid Glass, after Apple's material (HIG → Materials, and
   WWDC25 "Meet Liquid Glass"). It is the one place on the site the material
   is used: Apple keeps Liquid Glass to the navigation layer that floats over
   content, and asks for it sparingly. The regular variant, because the
   capsule carries text. What each piece here answers to:

   - Lensing. Glass "bends and concentrates light" rather than scattering it,
     so the rim refracts what is behind it: an SVG displacement map, sized to
     the capsule, run as a backdrop filter. Only Chromium can run an SVG filter
     on a backdrop, so only Chromium gets it (`data-refract`); every other
     browser keeps the blur and the highlights, which are most of the look.
   - Specular highlights that move. The rim's light is a conic gradient whose
     angle follows the pointer, so light travels round the silhouette as the
     cursor moves — the web's stand-in for a phone being tilted.
   - The selection lens. The current page sits in a lens of thicker glass, and
     the lens glides to whatever the pointer or the keyboard is on, then back.
     Between pages it carries on from where the last page left it, so moving
     from Home to Work reads as one lens sliding along one bar.
   - Illuminating from within. A press lights the glass from under the finger
     and the glow spreads across the capsule; the capsule gives a little, like
     gel, and springs back.

   Reduced motion takes the elastic away and the light stops following the
   pointer; reduced transparency frosts the glass; more contrast makes it
   white with a drawn edge. All three are in app/globals.css. */

const LENS_MEMORY = "nav-lens";
/* How far the rim bends the background, in pixels at the very edge. */
const REFRACTION = 28;

/* Displacement channels, not colours: red carries the horizontal shift, green
   the vertical, and half of each is no shift at all. */
const CHANNEL = {
  x: "#f00", // token-exempt
  y: "#0f0", // token-exempt
  zero: "#000", // token-exempt
  rest: "#808000", // token-exempt
};

/** A displacement map for a pill of this size: neutral grey (no shift) in the
    body, ramping to full shift at the rim, so only the edge refracts. Red
    shifts horizontally and green vertically, both pointing inward, which is
    what a convex lens does to what is behind it. */
function lensMap(width: number, height: number) {
  const radius = height / 2;
  const rim = Math.max(6, Math.round(height * 0.22));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs>
<linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="${CHANNEL.x}"/><stop offset="1" stop-color="${CHANNEL.zero}"/></linearGradient>
<linearGradient id="y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${CHANNEL.y}"/><stop offset="1" stop-color="${CHANNEL.zero}"/></linearGradient>
<filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${rim / 2}"/></filter>
</defs>
<rect width="${width}" height="${height}" rx="${radius}" fill="${CHANNEL.zero}"/>
<rect width="${width}" height="${height}" rx="${radius}" fill="url(#x)"/>
<rect width="${width}" height="${height}" rx="${radius}" fill="url(#y)" style="mix-blend-mode:screen"/>
<rect x="${rim}" y="${rim}" width="${width - rim * 2}" height="${height - rim * 2}" rx="${radius - rim}" fill="${CHANNEL.rest}" filter="url(#b)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* Only Chromium runs an SVG filter on a backdrop. `userAgentData` is the
   cleanest tell: Chromium ships it and nobody else does. */
const canRefract = () => typeof navigator !== "undefined" && "userAgentData" in navigator;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Remembered between pages — wrapped, because storage can throw. */
function recall(): { x: number; w: number } | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(LENS_MEMORY) ?? "null");
    return saved && typeof saved.x === "number" && typeof saved.w === "number" ? saved : null;
  } catch {
    return null;
  }
}
function remember(rect: { x: number; w: number }) {
  try {
    sessionStorage.setItem(LENS_MEMORY, JSON.stringify(rect));
  } catch {
    /* Private window or blocked storage: the lens just starts in place. */
  }
}

export default function NavCapsule({ active }: { active: NavKey }) {
  const capsule = useRef<HTMLElement>(null);
  const [lensReady, setLensReady] = useState(false);
  const [map, setMap] = useState<{ width: number; height: number; href: string } | null>(null);

  /* Where a link sits in the capsule, as the lens wants it. */
  const rectOf = (link: Element | null) =>
    link instanceof HTMLElement && link.offsetWidth > 0
      ? { x: link.offsetLeft, w: link.offsetWidth }
      : null;

  const activeLink = () => capsule.current?.querySelector('[aria-current="page"]') ?? null;

  const moveLens = (rect: { x: number; w: number } | null) => {
    const el = capsule.current;
    if (!el || !rect) return;
    el.style.setProperty("--lens-x", `${rect.x}px`);
    el.style.setProperty("--lens-w", `${rect.w}px`);
  };

  /* Arrive: put the lens where the last page left it, then let it slide to
     this page's link. Layout effect, so the lens is placed before the first
     paint the visitor sees from this component. */
  useLayoutEffect(() => {
    const el = capsule.current;
    if (!el) return;
    const here = rectOf(activeLink());
    const before = recall();

    if (here && before && !reducedMotion() && (before.x !== here.x || before.w !== here.w)) {
      el.dataset.instant = "";
      moveLens(before);
      setLensReady(true);
      requestAnimationFrame(() => {
        delete el.dataset.instant;
        moveLens(here);
      });
    } else {
      moveLens(here);
      setLensReady(Boolean(here));
    }
    if (here) remember(here);
  }, [active]);

  /* Keep the lens and the lensing map true to the capsule's size: fonts land
     after first paint and change every link's width. */
  useEffect(() => {
    const el = capsule.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      moveLens(rectOf(activeLink()));
      const here = rectOf(activeLink());
      if (here) remember(here);
      if (canRefract()) {
        const width = Math.round(el.offsetWidth);
        const height = Math.round(el.offsetHeight);
        setMap((current) =>
          current && current.width === width && current.height === height
            ? current
            : { width, height, href: lensMap(width, height) }
        );
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* The light follows the pointer round the rim. Pointers only — a finger
     has no position until it is pressing — and not under reduced motion. */
  useEffect(() => {
    const el = capsule.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || reducedMotion()) return;

    let frame = 0;
    const onMove = (event: globalThis.PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        /* Conic gradients start at twelve o'clock; atan2 starts at three. */
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        el.style.setProperty("--lg-angle", `${angle.toFixed(1)}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  /* Light from within: the glow starts under the finger. */
  const press = (event: PointerEvent<HTMLElement>) => {
    const el = capsule.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--lg-glow-x", `${event.clientX - box.left}px`);
    el.style.setProperty("--lg-glow-y", `${event.clientY - box.top}px`);
    el.dataset.pressed = "";
  };
  const release = () => {
    if (capsule.current) delete capsule.current.dataset.pressed;
  };

  return (
    <div className="nav-wrap">
      <nav
        ref={capsule}
        className="nav-capsule"
        aria-label="Primary"
        data-lens={lensReady ? "" : undefined}
        data-refract={map ? "" : undefined}
        onPointerDown={press}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={(event) => {
          release();
          if (event.pointerType === "mouse") moveLens(rectOf(activeLink()));
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) moveLens(rectOf(activeLink()));
        }}
      >
        {map && (
          /* The lensing filter, sized to this capsule. Zero-size and hidden:
             it is referenced by the backdrop filter, never drawn. */
          <svg className="nav-glass-defs" width="0" height="0" aria-hidden="true" focusable="false">
            <filter
              id="nav-glass"
              x="0"
              y="0"
              width={map.width}
              height={map.height}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage href={map.href} x="0" y="0" width={map.width} height={map.height} result="map" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={REFRACTION}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </svg>
        )}

        <span className="nav-lens" aria-hidden="true" />

        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="nav-link"
              aria-current={isActive ? "page" : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") moveLens(rectOf(event.currentTarget));
              }}
              onFocus={(event) => moveLens(rectOf(event.currentTarget))}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
