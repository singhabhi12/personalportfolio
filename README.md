# Abhishek Singh — Portfolio

Next.js site implementing the **Personal Desk** direction from the Claude
Design project, per `PORTFOLIO_DESIGN_SOURCE_OF_TRUTH_v2.1.md`.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (deployed on Vercel)
npm run lint:tokens  # fails if any hex / px / rgba / font stack escapes :root
npm run assets       # raw/ screenshots + case figures + portrait + icons → public/
npm run covers       # a 16:10 cover from three phone screens, or from a mark on white
npm run photos       # raw/gallery photos → responsive WebP, LQIP, EXIF stripped
npm run placeholders # regenerate the hatch placeholders
```

Every page prerenders to static HTML; the one piece that needs a server is
`app/api/contact`, the letterbox behind the contact page — see
[The letterbox](#the-letterbox-resend) below. That is why `next.config.ts` no
longer sets `output: "export"`.

## Structure

```
app/
  globals.css        every design token + every component style
  layout.tsx         self-hosted fonts (Inter, Inter Tight, Caveat), metadata
  page.tsx           home — Desk + Kind Words
  work/page.tsx      work — the project grid
  life/page.tsx      life — prose card + widget stack
  gallery/page.tsx   gallery — the photo masonry, its own route
  contact/page.tsx   contact — the collaborate card
  work/[slug]/       case studies, statically generated from lib/content.ts
components/
  PageFrame          nav capsule, corner whisper, footer stamp
  WidgetCard         the base every desk object extends — never restyle a card
  Desk               manifesto column + the collage of desk objects
  WorkGrid           2-column project cards
  KindWords          testimonial band
  Gallery            photo masonry + keyboard-operable lightbox (/gallery)
  PlacesWidget       the live map, then the count line and city list
  PlacesMap          MapKit JS map (client) — needs JavaScript
  GalleryPreview     framed photo tile, whole gallery on a 4s beat (Life)
  ListeningWidget    the song on now, as a record on the desk (Life)
  VinylDisc          the record: cover on the label, hover to play (client)
  StampTime          isolated so Phase 2 can make it live
  ToolsRow, Contact, NavCapsule
lib/
  content.ts         all copy — edit here, never in JSX
  case-studies.ts    the nine written cases, typed as blocks (casestudies.md
                     is the long-form source they are cut from)
  gallery.ts         photo manifest (city/year by hand, never from EXIF)
  places.ts          travel data + the lat/lng projection and clustering
  maps.ts            MapKit token, pins, and the computed map region
  listening.ts       Apple Music developer token + the catalog lookup (build)
  generated/         written by the pipelines; do not edit
scripts/
  check-tokens.mjs   the token rule, enforced
  build-assets.mjs   screenshots, case figures, portrait, tool icons
  compose-covers.mjs a cover from three phone screens or a mark, for projects with no landscape shot
  build-photos.mjs   gallery photos
```

## Rules the code enforces

- **No hex, px, rgba, or font stack outside a `:root` declaration.** Every rule
  consumes tokens. `npm run lint:tokens` fails the build otherwise. Media-query
  breakpoints and `sizes` attributes are exempt — CSS variables don't work
  there — and a handful of data-driven inline styles are marked `token-exempt`.
- Content lives in a white 24px-radius card on the paper, or bare on the paper.
  Those are the only two homes.
- **One gradient surface per page.** Home spends it on Currently Cooking, so
  Contact gets a plain card. About and case studies have none.
- Shadows never exceed 3px blur.
- Every interactive element is a 100px pill. The ink button in Contact is the
  only filled button on the site.
- **§10's "no map library" no longer holds on the About page.** The Places
  card is MapKit JS now; the inline-SVG sketch that used to stand in for it was
  removed deliberately. `lib/places.ts` still projects real lat/lng and merges
  cities within 8px into one dot — `GalleryPreview` draws that SVG for its map
  tab, and the live map takes its pins and region from the same data. The rule
  still holds everywhere else. See **The live map** below.
- Gallery photos keep natural aspect ratios and **the photo pipeline fails the
  build if any GPS tag survives.** The Life tile is the one frame that fills
  rather than fits, and it crops around each photo's own `focus` point from
  `lib/gallery.ts` — never the default centre. Captions are the photograph's
  title and nothing else: no year stamp, no invented place name.

## Swapping in real assets

Drop files in `raw/`, run one command, change no component code. The pipelines
write `lib/generated/*.ts`, which the data layer merges over the hand-written
entries by key. A screenshot or icon without a real file keeps its placeholder;
a gallery key without one is dropped rather than rendered broken.

| What | Where it goes | Command | Key must match |
|---|---|---|---|
| Project screenshots | `raw/projects/<slug>.png` | `npm run assets` | `slug` in `lib/content.ts` |
| Case-study figures | `raw/cases/<slug>/<name>.png` | `npm run assets` | `name` in a `figure` block in `lib/case-studies.ts` |
| Portrait | `raw/portrait/portrait.jpg` | `npm run assets` | — |
| Tool icons | `raw/tools/<name>.svg` | `npm run assets` | `tools[].icon` in `lib/content.ts` |
| Gallery photos | `raw/gallery/<key>.jpg` | `npm run photos` | `key` in `lib/gallery.ts` |

`raw/` is gitignored — originals are inputs, not artefacts.

Outputs: WebP at 800/1600 for screenshots and landscape figures (480/960 for
phone screens, which sit three abreast), 400/800/1600 for photos, plus a JPG
fallback and (for photos) a ~20px blurred LQIP inlined as a data URI. A source
narrower than the largest target also gets a variant at its own width, so a
768px original does not cap out at 400w and go soft. Aspect ratios are never
altered and sources are never upscaled.

### Sourcing app icons

A vendor's own brand/press kit is the cleanest source. `@lobehub/icons-static-svg`
is the fallback where it carries the mark — it is a third-party pack, so its MIT
licence covers LobeHub's code and not the trademarks themselves. That was a
deliberate call, not an oversight; press kits remain preferable where the effort
is worth it. The pack is an AI/LLM brand collection and covers only some tools.

| Tool | Current source | Format |
|---|---|---|
| Figma | `@lobehub/icons-static-svg` (`figma-color`) | SVG |
| Claude | `@lobehub/icons-static-svg` (`claude-color`) | SVG |
| VS Code | supplied by hand into `raw/tools/` | PNG 88px |
| Xcode | supplied by hand into `raw/tools/` — Apple's app icon, see note | PNG 88px |
| Notion | `@lobehub/icons-static-svg` (`notion`, `currentColor` → black) | SVG |
| Lightroom | supplied by hand into `raw/tools/` — Adobe's app icon via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Adobe_Photoshop_Lightroom_CC_logo.svg) (PD-textlogo; trademark still Adobe's) | SVG |
| ChatGPT | `@lobehub/icons-static-svg` (`openai`, `currentColor` → black) | SVG |

`npm run assets` copies an SVG verbatim but fits a PNG to 88px (2× the 44px
slot), since vendor app icons ship at 316–1024px and would otherwise cost ~100KB
each for a 44px tile. Scaling within the same aspect ratio does not distort the
mark, and it strips any metadata the source carried.

> **Xcode**: this is Apple's actual app-bundle icon. Apple's trademark guidelines
> restrict reuse of app icons more tightly than a wordmark — this was a deliberate
> choice, not an oversight. Swap for the Xcode wordmark if that ever needs to be
> tightened up.

`npm run tool-icons` stages what the pack has into `raw/tools/`; `npm run assets`
copies `raw/tools/` into `public/tools/`. For a press-kit mark, drop the SVG into
`raw/tools/<name>.svg` by hand and run `npm run assets` — a file there beats both
the pack and the placeholder, and `npm run placeholders` skips any tool that has
one.

Save as SVG (crisp at 44px, ~1KB each). Use PNG at 88×88 only if a vendor
offers no SVG. Keep native colours — recolouring or distorting a mark usually
breaks the brand terms, and §5 sanctions these as the page's colour moment.
Displaying a mark to identify the tool you use is nominative fair use; do not
imply endorsement.

`npm run assets` copies these verbatim rather than re-encoding them —
re-rasterising a brand SVG looks worse and is a trademark problem.

### EXIF and GPS

`npm run photos` strips all metadata (sharp does not copy it forward) and then
verifies: it reads every output back and fails if an EXIF, XMP, or IPTC block
survived. Install exiftool for the stronger check that names GPS tags:

```bash
brew install exiftool
```

City and year come from `lib/gallery.ts` by hand, never from EXIF, so the
metadata and the stripping can't fight each other.

## The live map (MapKit JS)

The Places card is a real Apple map. It loads on every visit to `/life`, so
MapKit JS is on the critical path for that page and every visitor reaches
Apple's CDN.

**There is no fallback.** With `NEXT_PUBLIC_MAPKIT_TOKEN` unset, expired, or
rejected, the card shows "The map didn't load." and nothing else — the map area
stays empty. The card also needs JavaScript to show anything at all. Both were
deliberate calls when the sketch was removed; restoring a no-JS fallback means
putting the inline SVG back.

**Setup** (needs a paid Apple Developer Program membership):

1. Apple Developer → Certificates, Identifiers & Profiles → **Maps Tokens**.
2. Create a token and bind it to your deployed domain. MapKit JS 6 issues
   static domain-bound tokens directly, so there is no `.p8` private key to
   store and nothing to sign at runtime — so there is no token endpoint to run.
3. Put it in `.env.local` (see `.env.example`):

   ```bash
   NEXT_PUBLIC_MAPKIT_TOKEN=eyJ…
   ```

4. `npm run build`. Next inlines the value at build time, so the token is
   frozen into the bundle — rebuild after rotating it.

**The token is not a secret.** `NEXT_PUBLIC_*` ships to the browser and MapKit
sends it to Apple from the client regardless. The origin binding you set in
step 2 is what stops another site spending your quota — free tier is 250,000
map views and 25,000 service calls per day, per membership.

**What it renders.** `mutedStandard` in a forced light scheme (the site has no
dark mode), points of interest off, no compass, scale, or map-type control,
rotation disabled — as close to §7's flat monochrome as a real map gets. Pins
are `MarkerAnnotation`s coloured from `--color-accent`, read out of the
stylesheet at runtime so the coral is never forked into JS. They carry
`clusteringIdentifier`, so MapKit merges Hamburg and Halstenbek the same way
`clusterPlaces` merges their dots. Region and pins both derive from
`lib/places.ts` — add a city there and the live map reframes itself.

If Apple rejects the token or the quota is spent, the card shows "The map
didn't load." rather than an empty box; that failure arrives as a MapKit
`error` event well after `load()` resolves, which is why `PlacesMap` listens
for one instead of relying on a rejected promise.

## The song on (Apple Music)

The Listening card on `/life` is one song, named by hand in `lib/content.ts`
(`listening.title` and `listening.artist`). Everything else it shows — the
cover, the colours the record is pressed in, the link into Apple Music and
the 30-second preview — comes from the Apple Music catalog, looked up **once, at build
time**, by `lib/listening.ts`. The page stays static; no visitor waits on
Apple, and nothing about the key reaches the browser.

**Setup** (needs a paid Apple Developer Program membership):

1. Apple Developer → Certificates, Identifiers & Profiles → **Keys** → new key
   with **MusicKit** enabled. Download the `.p8` — Apple offers it once.
2. Put the `.p8` in the project root as `AuthKey_<KEY_ID>.p8` (`.gitignore`
   keeps it out of the repo), and set the two identifiers in `.env.local`:

   ```bash
   APPLE_MUSIC_TEAM_ID=XXXXXXXXXX   # Membership page
   APPLE_MUSIC_KEY_ID=YYYYYYYYYY    # from the file name
   ```

3. On Vercel, where the file is not, paste the file's contents into
   `APPLE_MUSIC_PRIVATE_KEY` alongside the two IDs.
4. `npm run build`. The lookup runs during the build — change the song in
   `lib/content.ts` and rebuild to change the card.

The build signs a short-lived ES256 developer token from the key with Node's
own `crypto` — no SDK — and searches the catalog for `"<title> <artist>"`,
taking the first hit whose artist line starts with the artist named (so the
original comes before the instrumental and the DJ mix). It searches the
storefront in `listening.storefront` first, then `in` and `us`, so a song
missing from one store is still found.

**With no key, or with Apple unreachable at build**, the card shows the title
and artist and a blank square where the cover would be. The build logs a
warning and carries on; it never fails over this.

**The record.** The disc is pressed in the cover's own colours — Apple's
`bgColor` for the vinyl, the last of its `textColor`s for the marbling — with
the cover on the label. Rest a pointer on it and it spins up and plays the
preview; take the pointer away and it winds down and stops. Browsers refuse
sound until the visitor has clicked or typed on the page, so a hover that is
refused leaves the disc still and a click starts it; on a phone a tap
toggles it. The clip is not fetched until one of those happens, and it stops
on its own when it ends or when the tab is hidden.

The spin is driven frame by frame in `VinylDisc` rather than by a CSS
animation, which is what gives it a spin-up and a wind-down. It plays under
`prefers-reduced-motion` on the letter fold's argument (it is the thing the
pointer asked for, and it stops the moment the pointer leaves); `?motion=still`
holds the disc still while the sound still plays.

## The letterbox (Resend)

A letter posted on `/contact` is sent to `app/api/contact/route.ts`, which
turns it into an email to `identity.email` in `lib/content.ts` through
[Resend](https://resend.com)'s REST API — one `fetch`, no SDK. The visitor's
address goes in `Reply-To`, so answering the mail is answering them.

**Setup:**

1. Sign up at Resend with the same address as `identity.email` and create an
   API key (**API Keys → Create**, sending access is enough).
2. Put it in `.env.local` for local testing, and in Vercel under
   **Settings → Environment Variables** for the deploy:

   ```bash
   RESEND_API_KEY=re_…
   ```

   It is a real secret: server-only, never `NEXT_PUBLIC_`.
3. No domain is needed to start. Resend's shared `onboarding@resend.dev`
   sender delivers to the address that owns the key, and nowhere else — which
   is exactly the one address this route ever writes to. Once you verify a
   domain there, set `CONTACT_FROM="Portfolio <letters@yourdomain>"` and the
   mail stops looking like it came from Resend.

**Without the key** the route answers 503 and the studio shows "Didn't post"
with the letter intact and a `mailto:` link, so nothing is lost — but that is
the fallback, not the feature. `NEXT_PUBLIC_CONTACT_ENDPOINT` can still point
the client at some other JSON endpoint (Formspree, a Worker), or be set to the
empty string to skip the wire and hand the letter to the visitor's mail app.

## Placeholders still to replace

- All images in `public/` are generated hatch placeholders.
- Two About sections (`Where I'm from`, `What I used to do`) and two inline
  hints render as visible placeholder blocks — see `aboutSections` in
  `lib/content.ts`.
- Every project has a real cover. Three are composed by `npm run covers`
  before `npm run assets` runs: Substrac and Stampp from three of their phone
  screens in `raw/cases/`, and Kolsetu from its mark in `raw/marks/` on white,
  because the interface itself is under NDA.
- Set `hasCaseStudy: false` on any project that should stay a tile with no
  detail page; its card link falls back to `#` and no route is generated.

## Phase 2 (not built)

Budget is three cosmetic systems site-wide. Phase 1 blocks none of them, and
`npm run build` renders every page fully without JavaScript — the gallery grid,
places dots, case studies, and the preview tile's first tab are all in the
served HTML.

| Item | Hook that exists | What would change |
|---|---|---|
| Cursor presence | `[data-whisper]` corner whisper | Add a client component listening on the frame; the whisper becomes its trigger. No layout change. |
| Live footer stamp | `components/StampTime.tsx` | Add `"use client"`, format `Europe/Berlin` on an interval, keep the static value as the SSR fallback so nothing shifts on hydration. |
| Hover-play media | `.shot-frame` + `hoverMedia?` on `Project` | Set `hoverMedia` on a project; the `<video>` already renders and is suppressed under `prefers-reduced-motion`. No restructuring. |
| Desk objects | `.collage` children are independently positioned | Add siblings with their own transforms; they must not overlap text. |
| Interaction sound | — | Not scaffolded. |

**Already spent:** `GalleryPreview`'s hover tab bar (A12) consumes one slot.
Swap it for a plain preview tile to reclaim it.
