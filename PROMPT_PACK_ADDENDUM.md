# Addendum — About page, Gallery, and the Travel Map widget

**Based on live inspection of marco.fyi/about and abhidesignportfolio.framer.website/gallery, 17 Aug 2026**
Add these to PROMPT_PACK.md. Numbering continues from the main pack.

---

## What I actually found (inspect notes — read before prompting)

### Marco's About page — the real numbers

Measured from the live DOM, not eyeballed:

| Property | Marco's actual value | Your constitution says |
|---|---|---|
| Page canvas | `#ffffff` pure white | `#f7f5f1` warm paper |
| Card surface | `#f7f7f9` (light cool gray) | `#ffffff` white |
| Card radius | **32px** | 18px |
| Card padding | 32px (large tile) / 24px (small tiles) | 24px |
| Card shadow | **none at all** | whisper shadow ≤3px |
| Grid gap | **16px** | 24px |
| Layout | 672px left tile + 2 × 328px right column = 1360px | 1200px, 40/60 split |

**Your constitution inverted Marco's figure/ground.** He puts *gray cards on white*; v2.0 specifies *white cards on warm paper*. Both are legitimate — but the 32px radius and the total absence of shadow are a bigger part of why his site feels soft than the color choice is. At 18px with a shadow, you'll get a tighter, more "dashboard" read.

→ **Decide now:** keep 18px (your doc), or move cards to 24–32px to actually land the soft-furniture feel. I'd go 24px as the compromise — noticeably softer than 18, less bubbly than 32. Whatever you pick, change it in the constitution rather than per-prompt.

### Marco's About content structure

Left tile is prose under tracked micro-labels, in this order:
`WHERE I'M FROM` → `WHAT I USED TO DO` → `WHAT I DO NOW` → `WHERE I'M AT NOW` → `WHAT I'M LOOKING FOR`

That last one is the move worth stealing: it turns an About page into a soft job-search signal without a single desperate word. Right column is four 328px square tiles (Twitter, Music, Photos, Podcast) plus one full-width iMessage tile.

### The Photos widget — what it actually does

Hovering the photo card reveals a floating white pill tab bar at the bottom with four icon tabs: **grid (All) · map-pin (Places) · heart (Favorites) · paw (Dog)**. Clicking a tab swaps the photo behind it. A white indicator pill slides to the active tab.

**Important:** the map-pin tab is *not a map*. It shows another photo under a map-pin icon. So the widget you're describing — an actual map of cities visited — is an **extension of Marco's idea, not a copy of it**. Good; it means you're not cloning him.

### Your existing gallery — already better than you think

`/gallery` is a 3-column grid, 422×382 tiles, 24px radius, `object-fit: cover`, captioned **city + year**, click opens a dark lightbox with the caption bottom-aligned. 15 photos.

The captions already contain your travel data:

| City | Country | Years |
|---|---|---|
| Schwerin | Germany | 2025 (×3) |
| Berlin | Germany | 2021, 2024 (×4) |
| Hamburg | Germany | 2025 |
| Halstenbek | Germany | 2025 |
| Amsterdam | Netherlands | 2024 |
| Jaipur | India | 2023 |

**Two things you should know:**

1. **Three photos on your live site are still captioned with Framer template placeholders** — "ZetaSync" (2024), "EtherLink" (2022), "PulseSync" (2024). Those are fake SaaS product names sitting where city names should be. Fix on the current site today; it's a two-minute edit and it's visible to anyone browsing.

2. **The map will look sparse.** Six cities, four of them within ~300km of each other in northern Germany. On a world map that's one dense cluster, one dot in Amsterdam, one in India — mostly empty ocean. Honest options, best first:
   - **Europe-framed map** with an off-map "Jaipur ↗" marker in the corner. The cluster becomes the point rather than the problem.
   - **Skip the map, ship a places list** — city, country, year, photo count. Reads as honest rather than as an empty travel brag.
   - **World map anyway** — only if you're planning to add more travel soon and want the frame to grow into.

   Pick before prompting; the three produce very different widgets.

---

# NEW DESIGN PROMPTS

Insert these into Part A of the pack.

---

### A9 · About page — layout and prose

```
Build the About page for the Personal Desk portfolio. Reference: marco.fyi/about, but adapted
to my constitution's tokens — do not copy his gray-on-white; use white cards on #f7f5f1 paper.

LAYOUT: nav capsule persists (active dot on "About"). Below it, two columns at 1200px max:
  - LEFT (~55%): one large widget card, 32px padding, containing the prose
  - RIGHT (~45%): a stack of square widget cards, 24px padding, in a 2-up grid where they fit

LEFT CARD — heading "What I'm about." in --text-display. Then prose sections, each opened by a
tracked --text-label header in muted, with 1–2 short paragraphs in --text-body under it:

  WHERE I'M FROM — [placeholder: 2–3 sentences, India → Hamburg]
  WHAT I USED TO DO — [placeholder: the jobs before design]
  WHAT I DO NOW — Product/UX designer. Evmet, Truts, Dehidden. Link company names inline
    with a thin ↗ glyph, ink text, coral on hover.
  WHERE I'M AT NOW — Hamburg. What I do when I'm not working.
  WHAT I'M LOOKING FOR — the role I want, stated plainly.

  Mark every placeholder clearly — I'll write the real copy.

RIGHT STACK — three widget cards:
  1. PLACES — the travel map widget (spec'd separately in A10)
  2. GALLERY — a preview tile linking to the full photo gallery (spec'd in A11)
  3. DESK — the tools row, same component as the home page

Constraints: no gradient on this page — the home page's Currently Cooking card holds the
site's one gradient. At most one Caveat aside in the whole left card. Shadows ≤3px.
```

---

### A10 · The Places / travel map widget

Replace the bracketed choice on line 3 with the framing you picked above.

```
Design a "PLACES" widget card showing the cities I've been to. This is a square widget card
(same base: white, 24px padding, tracked label header, whisper shadow).

MAP: a flat, monochrome [Europe-framed / world] map as an inline SVG — simplified country
outlines only, no borders between regions, no labels, no terrain, no tiles. Landmass in
--color-line #e8e5df on the white card. This must be a static SVG asset: no Mapbox, no Leaflet,
no tile server, no API key, no JS map library. The constitution forbids an illustration system
and reserves color for punctuation — a real map widget would smuggle in an entire foreign
visual language.

MARKERS: one 6px coral #ff5c39 dot per city. Where cities cluster (Hamburg, Halstenbek,
Schwerin, Berlin are all within ~300km), do not overlap them into a blob — either scale the
frame so they separate, or collapse the cluster into one dot with a count.

Cities: Hamburg, Halstenbek, Schwerin, Berlin (Germany) · Amsterdam (Netherlands) ·
Jaipur (India).

CARD CONTENT below the map:
  - Header: "PLACES ⁕" in --text-label tracked
  - A count line in --text-body: "6 cities · 3 countries"
  - The city list in --text-micro tracked, muted, comma-separated

INTERACTION (Phase 1 = static): hovering a dot shows the city name and year as a small
tooltip. That's the whole interaction. No panning, no zooming, no clustering animation.
Mobile gets the static map with the list below it and no hover.

Show me two versions: one with the map as the card's hero and the list as a footnote, and one
with the list as the hero and the map as a small inset. I want to see which survives having
only six dots.
```

---

### A11 · Gallery — grid + lightbox

```
Design the photo gallery page and its home/about preview tile.

GALLERY PAGE:
  - Nav capsule persists. Section header "Gallery ⁕" in --text-label tracked.
  - 3-column grid, 24px gutters, max-width 1200px. Tiles at natural aspect ratios in a soft
    masonry — do NOT force every photo to a fixed ratio and crop it. My current site crops
    everything to 422×382 with object-fit: cover and it flattens the photos.
  - Each tile: photo at 12px radius inside the card treatment, caption below as
    city (ink, --text-body) left and year (muted, --text-micro tracked) right-aligned.
  - Whole tile is clickable. Hover = caption city shifts to coral. No zoom, no shadow growth.

LIGHTBOX (click a photo):
  - Full-screen scrim, warm dark — NOT pure black. Something like #1f1f1f at 92% so it reads
    as the ink token dimmed rather than a generic modal.
  - Photo centered, 12px radius, max 90vh, never upscaled past its natural size.
  - Caption bottom-left: city in white, year in muted white, --text-label tracked.
  - Close: a 32px pill button top-right, not top-center. Escape key closes. Left/right arrow
    keys move between photos. Clicking the scrim closes.
  - Focus must be trapped in the lightbox while open and returned to the triggering tile
    on close.

PREVIEW TILE (for the About page and optionally the home desk):
  - A square widget card labeled "GALLERY ⁕" showing a 2×2 crop grid of four recent photos
    at 8px radius, with "15 photos · Hamburg, Berlin, Amsterdam, Jaipur" in --text-micro below.
  - Whole card links to /gallery.

Real photos: I'll supply them. Use clearly-marked placeholders with the real city/year captions
so the layout is tested against actual caption lengths.
```

---

### A12 · Optional — the Apple Photos tab metaphor

Only if you want Marco's specific interaction. It's charming but it's a second cosmetic system, and §11 budgets three total for the whole site.

```
Alternative treatment for the gallery preview tile: an Apple Photos-style widget.

On hover, a floating white pill bar (100px radius, whisper shadow) fades in over the bottom of
the photo with 3–4 monochrome icon tabs. Clicking a tab swaps the photo behind it. A white
indicator pill slides under the active tab, 200ms ease-out.

Tabs: All (grid icon) · Places (map-pin) · Hamburg (home) — thin monochrome glyphs at text size,
per the constitution's imagery rules.

Two constraints the reference version violates and I don't want to inherit:
1. Marco's "Places" tab shows a photo, not a map. If I include a Places tab it must show the
   actual PLACES map widget, or it shouldn't be a map pin.
2. It must be keyboard-operable — real tab semantics (role="tablist"), not hover-only.

Tell me honestly whether this earns one of my three Phase 2 cosmetic slots, given I've already
reserved cursor presence and the live footer stamp.
```

---

# NEW CODE PROMPTS

Insert into Part B.

---

### B6 · Gallery, lightbox, and the map

```
Implement three things from the approved design:

1. GALLERY PAGE at app/gallery/page.tsx, statically exported. Photos come from
   lib/gallery.ts as a typed array: { src, width, height, city, country, year, alt }.
   Masonry via CSS columns or grid-auto-rows — natural aspect ratios, no forced cropping.

2. LIGHTBOX as a client component. Requirements, all of them:
   - Escape closes, arrow keys navigate, scrim click closes
   - Focus trapped while open, returned to the triggering tile on close
   - aria-modal, labelled by the photo caption
   - Body scroll locked while open, restored on close, no layout shift from the scrollbar
   - Preload the adjacent photo so arrow navigation doesn't flash
   - Respects prefers-reduced-motion

3. PLACES MAP as a pure inline SVG component. Coordinates come from lib/places.ts:
   { city, country, lat, lng, year, photoCount }. Project lat/lng to SVG space with a simple
   equirectangular or Mercator function written inline — no map library, no tile requests,
   no API key, nothing that phones home. The whole widget must work offline and add under
   10KB to the bundle.

   Cluster handling: if two cities project within 8px of each other, merge them into one dot
   with a count badge rather than overlapping.
```

---

### B7 · Photo pipeline

```
Extend the asset pipeline for gallery photos specifically:

- Source photos are phone/camera originals — likely 4–12MB each. Generate responsive WebP at
  400/800/1600px wide plus a JPG fallback, and emit srcset/sizes so a phone never downloads
  the 1600px version.
- Generate a tiny blurred placeholder (LQIP, ~20px wide, inlined as a data URL) for each photo
  so the grid doesn't pop in.
- STRIP ALL EXIF, including GPS coordinates. My photos are of places I live and visit — I do
  not want home coordinates embedded in files on a public site. Verify with exiftool after
  processing and fail the build if any GPS tag survives.
- Read city/year from a manifest I maintain by hand, NOT from EXIF, so the data and the
  stripping don't fight.
- Report total page weight for a 15-photo gallery before and after.
```

---

# NEW CONTENT PROMPT

Insert into Part C.

---

### C5 · About page copy

```
Help me write the About page. Interview me one question at a time — do not draft until you
have real material. Sections to fill:

  WHERE I'M FROM — where I grew up, what my parents did, what that was actually like
  WHAT I USED TO DO — jobs and detours before design
  WHAT I DO NOW — the work, in plain language, no adjectives
  WHERE I'M AT NOW — Hamburg, and what I do outside work (photography, the walking, the travel)
  WHAT I'M LOOKING FOR — the role I want, stated directly

Rules: specific over general — "my dad drove a delivery route for eleven years" beats "my family
valued hard work." No inspirational-designer voice. It should read like I'm telling someone this
over a coffee, not writing a personal brand statement. Keep the whole page under 400 words.

Then run it through my abhishek-writing-voice skill.

One caution: WHAT I'M LOOKING FOR is doing real work for me right now since I'm job hunting.
Make it specific enough to be useful to a hiring manager — role, team type, location — without
sounding like I'll take anything.
```

---

## Fix on the live site today

Three gallery captions still read "ZetaSync", "EtherLink", and "PulseSync" — Framer template placeholders where city names should be. They're public right now.
