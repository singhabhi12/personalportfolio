# Abhishek Singh — Portfolio Design Source of Truth

> A designer's desk in morning light. Warm paper canvas, soft white cards that float like objects on a workspace, quiet geometric type — and one coral spark of personality. The site should feel like visiting Abhishek's studio, not reading his CV.

**Version:** 2.1 · August 2026 — direction: **Personal Desk** (Marco structural spine + Jackie Hu warmth layer)
**Scope:** Phase 1 — layout, typography, color, spacing, components, content structure. Interactive cosmetics (cursors, collage objects, sounds, motion) are reserved as Phase 2 hooks (§11); Phase 1 must be complete without them.
**Derived from:** marco.fyi and jackiehu.design (primary), danielwhite.uk, rinkitadhana.com, danielsun.space, tanmaym.com, dzrgo.com, portorocha.com/pollen, ryanstephen.co, rachelhow.com/cursors + 5 detailed style-reference files + audit of the current site (abhidesignportfolio.framer.website).

**Changelog 2.0 → 2.1** (all decided, do not relitigate):
- Card radius **18px → 24px**, informed by live DOM measurement of marco.fyi (his tiles are 32px with zero shadow; 24px is the deliberate midpoint).
- **About page** added as a real second page (§3, §8) — previously the nav linked to nothing.
- **Play ⁕ is now the photo gallery**, with a lightbox. Not a separate /gallery page, not a new nav item.
- **Places widget** added (§7) — the travel map. Static SVG only; map libraries are now a named Don't.
- Glyph budget **4 → 6**, with the sixth held in reserve (§9).
- Gallery imagery rules added (§9): natural ratios, no forced crop, mandatory EXIF stripping.

---

## 1. Design Philosophy — The Five Laws

Every future decision gets tested against these.

1. **A workspace, not a website.** The page is a desk: a warm paper canvas on which white cards sit like real objects — a project, a note, a photo, a tool. Cards are soft (24px radius), lightly lifted (whisper shadows), and never touch the page edge. (Source: Marco's widget stack, Jackie's desk collage.)
2. **Show the real thing.** Real product screenshots, real app icons, real photos, real quotes from real people. No abstract illustration, no decorative graphics, no mockup theater. The tools and the work carry all the color. (Source: Marco's "show the real tools", dzrgo's raw captures.)
3. **Neutral canvas, chromatic punctuation.** 95% of the page is warm neutral. Color appears only as tiny functional punctuation — a status dot, an accent border, a tag — plus **at most one** warm gradient/feature card per page. That single warm hit earns the rest staying quiet. (Source: Marco's Ember dot + one coral card rule.)
4. **Type whispers, tracking talks.** UI text stays small (12–16px) at weights 400–600. Character comes from the tracking curve — micro-labels tracked wide like printed stationery, headings tightened — and from one handwritten aside per section maximum. (Source: Marco's inverse tracking, Daniel Sun's Caveat notes.)
5. **Personality is scheduled, not scattered.** The warmth (script accents, desk objects, "currently cooking", the cursor pill) appears at planned moments — one per viewport. Between those moments the system is disciplined and modern. Jackie's playfulness on Marco's grid. (Source: both, plus dzrgo as the restraint counterweight.)

**Personality in one sentence:** a Hamburg UX designer's desk — structured and shipping-focused, but you can tell a human sits here.

---

## 2. Direction vs. Current Site

**Keep from abhidesignportfolio.framer.website:** the black-and-white portrait (it gains warmth against the paper canvas); the "Available Now" status signal (it moves into the Currently Cooking card — see §7); the project set and their one-line outcome descriptions; testimonials and contact as sections; the general two-column instinct; **the photo gallery and its city + year captions** (it becomes the Play section — see §8).

**Change:** the cool gray-white canvas becomes warm Linen paper; the heavy identity sidebar becomes a **floating pill nav** + an intro manifesto column (identity moves into the content, not a rail); gray card plates with big drop shadows become white cards with 24px radius and whisper shadows (≤3px blur); the oversized hero paragraph becomes a stacked manifesto of short declarative lines; the floating pill sub-nav bottom-left is deleted (the top nav capsule does that job); scroll-fade reveals are deleted (motion is Phase 2); "Made in Framer" chrome gone; **gallery photos stop being force-cropped to a fixed 422×382 ratio** (see §9).

**Explicitly rejected for this direction** (recorded so v3 doesn't relitigate): the dzrgo/Porto Rocha hairline-gallery system (v1 of this doc — too austere for the chosen personality); Daniel Sun's 246px condensed hero (identity here is conversational, not monumental); pure-white #ffffff canvas (the warmth lives in the paper); **Marco's own gray-cards-on-white figure/ground** — we deliberately invert it to white-cards-on-paper.

---

## 3. Layout System

### Site map

Two real pages plus case studies. Nothing else.

- **Home** (`/`) — Desk, Work, Experience, Kind Words, Play, Contact
- **About** (`/about`) — prose + widget stack, including Places
- **Case studies** (`/work/[slug]`) — calm reading, no desk metaphor

Nav is `Work · About · Play · Contact`. Work and Play are home-page anchors; About is a page. There is no separate Gallery page and no Gallery nav item — Play *is* the gallery.

### Page shell (both pages)
- **Floating pill nav**, top center: white capsule, fully rounded (radius 100px+), whisper shadow, ~48px tall. Contains 4 text links in 14px/500. The **active item gets a 6px coral dot** to its left; the dot is the only color in the nav. No logo in the nav; the name lives in the hero. (Marco's capsule; Daniel Sun validates nav-as-floating-object.)
- **Corner whisper:** a small muted "look around…" prompt in the top-right, 12px tracked label — the hook where Phase 2 cursor play attaches. Harmless static text until then. Desktop only. (Marco.)
- **Cards never touch the viewport edge** — minimum 24px outer margin.

### Home shell
- **Two-column desk**, max-width 1200px, centered:
  - **Left column (~40%) — the manifesto.** Text sits directly on the paper canvas, no card. Name + role first, then a vertical stack of short declarative statements. Sticky on desktop so the voice follows the visitor.
  - **Right column (~60%) — the desk stack.** A vertical/masonry stack of white widget cards of varying heights: featured project cards, a "currently cooking" card, a tools row, a photo or artifact card, a kind-words card. 24px gap between cards.
- **Full-width Work section** below the desk (project case studies need more room than the widget column allows — see §8).
- **Mobile:** single column — manifesto first, then the card stack, then work. Nav capsule stays floating.

### About shell
- Two columns, max-width 1200px: **left ~55%** is one large widget card (32px padding) holding the prose; **right ~45%** is a stack of widget cards (24px padding) — Places, a gallery preview, the tools row.
- The manifesto does not repeat here. The home page says what he believes; About says where he's from.
- **Mobile:** prose card first, then the widget stack.

### Rhythm
- Card gap 24px; card padding 24px (32px for the About prose card); section gap 64–96px; element gap 8px.
- Density: compact inside cards, generous between sections. A desk is full but not cluttered.

---

## 4. Typography

Three voices, strict roles. (Substitute stack per Marco's file — free-font equivalents of Graphik/Neue Montreal.)

| Token | Face | Size | Weight | LH | Tracking | Use |
|---|---|---|---|---|---|---|
| `--text-display` | Inter | 40px | 600 | 1.2 | -0.015em | Name in the manifesto header; About page heading; one per page |
| `--text-manifesto` | Inter | 16px | 400 | 1.65 | +0.005em | The declarative statement stack |
| `--text-card-title` | Inter | 16px | 600 | 1.35 | 0 | Card and project titles |
| `--text-body` | Inter | 14px | 400 | 1.5 | +0.005em | Descriptions, quotes, About prose, running copy |
| `--text-label` | Inter Tight | 12px | 500 | 1.25 | **+0.06em** | Card headers, tags, metadata, About section headers — the tracked-stationery voice |
| `--text-micro` | Inter Tight | 10px | 500 | 1.2 | **+0.1em** | Timestamps, footnote labels, photo years, place lists |
| `--text-script` | Caveat | 18–24px | 700 | 1.1 | -0.02em | Handwritten asides only — an arrow note, "from 2021 til today", a margin comment. Max one per section, never for real content |

Rules:
- **The inverse tracking curve is the signature:** the smaller the text, the wider the tracking (+0.06 → +0.1em); headings tighten. Never one tracking value across the scale. (Marco's core move.)
- Weights 400/500/600. 600 is for titles only — body emphasis uses color, not bold.
- Inter with `"ss01", "cv11"` enabled. Stack: `'Inter', ui-sans-serif, system-ui, sans-serif`; labels: `'Inter Tight', 'Inter', sans-serif`; script: `'Caveat', cursive`.
- Manifesto statements: one sentence per line, blank-line rhythm, sentence case, no periods needed. Asterisk-prefixed footnote allowed at stack bottom in `--text-label` (Marco's `* Less, but better.` pattern).
- Section headers may carry a single trailing glyph from the budget in §9. Never decorate anything else.

---

## 5. Color Tokens

Warm neutral system + coral accent family. One gradient, rationed.

| Token | Value | Role |
|---|---|---|
| `--color-paper` | `#f7f5f1` | Page canvas — warm linen, the desk surface. Never pure white, never cool gray. |
| `--color-card` | `#ffffff` | All card surfaces. The only "elevated" value. |
| `--color-ink` | `#1f1f1f` | Headings, card titles, primary text. Near-black. |
| `--color-body` | `#4a4a46` | Manifesto and body text — warm dark gray. |
| `--color-muted` | `#8a877f` | Labels, metadata, captions, inactive nav — warm mid-gray. |
| `--color-line` | `#e8e5df` | Hairline borders inside cards (dividers, input underlines). Also the Places map landmass fill. |
| `--color-accent` | `#ff5c39` | Coral — the personality color. Link hover, tag borders, Places map dots, the cursor pill (Phase 2). Punctuation-sized uses only. |
| `--gradient-feature` | `linear-gradient(16deg, #ff4d79, #ff8040 85%)` | The one warm feature card per page. White text on it. (Marco's Coral Pulse.) |
| `--color-status` | `#e92f48` | The 6px active-nav dot. (Marco's Ember.) |
| `--color-scrim` | `rgba(31,31,31,0.92)` | The gallery lightbox backdrop. Ink dimmed, never pure black. |

Rules:
- **One gradient surface per page, ever.** On the home page it belongs to Currently Cooking; Contact therefore gets a plain card with the single ink pill button. The About page has no gradient at all.
- Pastel tag chips (soft pink/yellow/green/blue at ~10% saturation) are permitted in exactly one place: a skills/interests swatch row. Nowhere else. (Marco's color-swatch row.)
- Native app icons, project screenshots, and gallery photographs keep their real colors untouched — they are the page's multicolor moments. (Law 2.)
- Semantic red/green only inside form validation, caption-sized.
- Dark mode: not in Phase 1. The paper metaphor is a daylight metaphor. The lightbox scrim is the one dark surface on the site.

---

## 6. Spacing, Radius, Elevation

- **Base unit 4px.** Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96.
- **Radius vocabulary (three values, strictly assigned):**
  - `24px` — all cards and widgets. *(Changed from 18px in v2.1. Measured reference: marco.fyi tiles are 32px with no shadow at all; 24px is the deliberate midpoint between his softness and a tighter modern read. Sharp corners break the metaphor.)*
  - `12px` — images and screenshots *inside* cards, gallery photos, lightbox image, inputs.
  - `100px` — every interactive element: buttons, tag chips, the nav capsule, the lightbox close control. Pills all the way down.
- **Elevation — shadows whisper, never announce (≤3px blur):**
  - Cards: `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10)`
  - Images in cards: `0 1px 2px rgba(0,0,0,0.25)`
  - The gradient card may carry a blush-tinted shadow (`rgba(248,193,200,~0.5)` offset) — the one expressive shadow. (Marco's Rose Glow.)
  - Nothing deeper. No hover-grow shadows in Phase 1.

---

## 7. Components

**Manifesto Column** — No card. "Abhishek" in `--text-display` ink; below, "UX Designer — Hamburg" in `--text-label` muted, tracked. Then the statement stack in `--text-manifesto`: 5–7 lines in his voice. Footnote at bottom in `--text-label` with asterisk. One Caveat aside allowed.

**Nav Capsule** — As §3. Active = coral dot + ink text; inactive = muted text. Hover = muted → ink. No underlines, no fills.

**Widget Card (base)** — White, 24px radius, 24px padding, whisper shadow. Header: `--text-label` tracked muted, optionally prefixed by a 4px coral dot. Content below with 14px gap. Every desk object extends this — never re-declare card styling per component.

**Featured Project Card** — Widget card containing: screenshot at 12px radius (real UI, natural ratio), title in `--text-card-title`, one outcome line in `--text-body` muted ("Led UX for 7 products used by 100K+ Web3 users."). Whole card is the link; hover = title → coral. No "view project" buttons.

**Currently Cooking Card** — Header "CURRENTLY COOKING ☺" tracked, one or two lines about the in-progress thing. **This card carries the availability signal** — the old site's "Available Now" lives here, not as a separate pill. This is the home page's gradient card: white text, blush-tinted shadow, and no other gradient anywhere on the page.

**Tools Row** — Horizontal row of 40–44px real app icons (Figma, Framer, Notion, …) at 8px radius, 8px gaps, inside a widget card labeled "DESK". Icons keep native colors — a sanctioned multicolor moment.

**Profile / Portrait Card** — B&W portrait in a white card, or polaroid-style with a Caveat caption. One personal photo object max on the home page.

**Kind Words Card(s)** — Quote in `--text-body` ink, attribution in `--text-label` muted ("Raj Karia — Founder, Truts"). Short quotes only.

**Experience Card** — Year-indexed rows inside one widget card: year in muted left, role + company in ink, place right-aligned muted, 1px `--color-line` separators, 12px vertical padding. No logos, no chevrons.

**About Prose Card** — Large widget card, 32px padding. Heading in `--text-display`. Then prose sections, each opened by a tracked `--text-label` header in muted with 1–2 short paragraphs in `--text-body`: `WHERE I'M FROM` · `WHAT I USED TO DO` · `WHAT I DO NOW` · `WHERE I'M AT NOW` · `WHAT I'M LOOKING FOR`. Company names link inline with a thin ↗ glyph, ink text, coral on hover. Whole page under 400 words. (Marco's structure; the last section is the job-search signal that doesn't beg.)

**Places Widget** — Widget card labeled "PLACES ◎". Contains a flat monochrome map as **inline SVG only** — simplified outlines, landmass in `--color-line`, no tiles, no labels, no terrain, no borders between regions. One 6px `--color-accent` dot per city; cities projecting within 8px of each other merge into a single dot with a count. Below the map: a count line in `--text-body` ("6 cities · 3 countries") and the city list in `--text-micro` tracked muted. Hover on a dot reveals city + year as a small tooltip — that is the entire interaction. No panning, no zooming. Mobile: static map, list below, no hover.

**Photo Tile (Play section)** — Photo at 12px radius, natural aspect ratio in a soft masonry. Caption below: city in `--text-body` ink left, year in `--text-micro` tracked muted right. Whole tile clickable; hover = city shifts to coral. No zoom, no shadow growth.

**Lightbox** — Full-screen `--color-scrim`. Photo centered, 12px radius, max 90vh, never upscaled beyond natural size. Caption bottom-left: city in white, year in muted white at `--text-label` tracked. Close control is a 100px-radius pill, top-right. Escape closes, arrow keys navigate, scrim click closes. Focus trapped while open and returned to the triggering tile on close. This is Phase 1, not a cosmetic — it is how the gallery is read.

**Tag Chip** — 100px radius, 1px coral border, transparent fill, `--text-label` coral text, 6px 12px padding. Pastel-filled variant only in the skills swatch row.

**Contact Block** — Header "LET'S COLLABORATE" tracked; one warm line; a plain widget card with one ink pill button ("Book an intro call") and the email as a bare ink text link, coral on hover. The ink button is the only filled button on the entire site.

**Footer Stamp** — Small line on the paper, no card: `HAM 09:12 · warm, good day for shipping` in `--text-micro` tracked muted, plus © line. Phase 2 makes it real.

---

## 8. Page Structure

### Home (`/`)
1. **Nav capsule** (floating, persistent).
2. **The Desk** — two-column hero zone: manifesto left (sticky), right stack of ~4 widget cards: Currently Cooking (the gradient card), one Featured Project, Portrait, Tools Row. This zone must deliver the "visiting the studio" first impression in one viewport-and-a-half.
3. **Work ▶** — full-width: section header + 2-column grid of Featured Project Cards (4–6 total, curated hard: Application HQ, Evmet, Truts, Dehidden, Build Up, Chip Count — cut any with weak imagery). 24px gutters.
4. **Experience** — one Experience Card, ~720px.
5. **Kind Words** — 4–6 short quotes.
6. **Play ⁕** — **the photo gallery.** 3-column masonry of Photo Tiles at natural ratios, 24px gutters, opening into the Lightbox. Personal photography, captioned city + year. This is the site's human-interest section and it replaces the old separate /gallery page.
7. **Contact** — plain card, one ink pill button (the gradient is spent on Currently Cooking).
8. **Footer stamp.**

### About (`/about`)
1. Nav capsule (active dot on About).
2. Two columns: **About Prose Card** left; right stack of **Places Widget**, a gallery preview tile linking to the home Play section, and the Tools Row.
3. Footer stamp. No gradient on this page.

### Case studies (`/work/[slug]`)
Nav capsule persists; the desk metaphor does not. Single 720px column of text with full-width images in 12px-radius frames, section dividers in `--color-line`. Calm reading.

---

## 9. Imagery Rules

- Screenshots are evidence: real UI, tight crops, natural ratios, 12px radius inside cards. No angled device mockups, no gradient backdrops behind shots.
- App icons: native, untouched, colorful — the sanctioned color moments.
- **Gallery photography:** candid and personal. **Natural aspect ratios — never force-crop to a fixed tile size** (the old site cropped everything to 422×382 with `object-fit: cover` and flattened the photos). Every photo carries a real city and year caption; placeholder or template captions are a bug, not a style.
- **EXIF must be stripped from every published photo, GPS tags included.** These are pictures of where he lives and walks; coordinates do not ship. City/year metadata comes from a hand-maintained manifest, never from EXIF.
- The B&W portrait stays black and white. Polaroid treatment (white frame + Caveat caption) allowed on exactly one photo object.
- No illustration system, no 3D, no stock icons. Interface glyphs are thin, monochrome, text-sized.
- **Decorative glyph budget — six, five assigned, one reserved:**
  `▶` Work · `⁕` Play · `⌘` About · `☺` Currently Cooking · `◎` Places · *(one slot reserved)*.
  Assigning the sixth is a permanent commitment on the same terms as the others. Never decorate anything outside this list.

---

## 10. Do's and Don'ts

### Do
- Put every piece of content in a white 24px-radius card on the paper canvas — or directly on the paper as manifesto text. Those are the only two homes.
- Track micro-labels wide (+0.06em minimum) so small text reads as printed stationery.
- Keep chromatic color to punctuation: one dot, one border, one gradient card per page.
- Use 100px pills for every interactive element — buttons, chips, the nav, the lightbox close.
- Show real tools, real screenshots, real icons, real photographs in their real colors.
- Write outcome lines with numbers ("100K+ users", "7 products").
- Give every card a tracked label header — cards are labeled objects on a desk.
- Protect the scarcity of warmth: one script aside, one photo object, one gradient per page.
- Make the lightbox fully keyboard-operable — it is content, not decoration.

### Don't
- Don't use a cool or pure-white page background — the paper is the personality's foundation.
- Don't use sharp corners (0–4px) on any card, or fill buttons with flat chromatic color — outlined/pill vocabulary only, except the single ink button and the gradient card's white pill.
- Don't let shadows exceed 3px blur, ever.
- Don't set body text in pure black or bold — ink is #1f1f1f, emphasis is color-shift.
- Don't break the two-column desk with full-width text in the hero zone.
- Don't use Caveat for anything longer than one line, or twice in one section.
- Don't add scroll-reveal animations, parallax, or autoplay in Phase 1.
- Don't let the pastel swatch row's colors leak anywhere else in the UI.
- **Don't use a map library.** No Mapbox, Leaflet, Google Maps, tile server, or API key anywhere in this project. The Places map is a static inline SVG. A real map widget smuggles in an entire foreign visual system and violates Laws 1 and 3.
- **Don't force-crop gallery photos** to a uniform tile, and don't publish a photo with EXIF intact.
- Don't add a Gallery nav item or a separate gallery page — Play is the gallery.

---

## 11. Phase 2 — Interactive Cosmetics (reserved hooks, do not build yet)

Budget: **max 3 cosmetic systems** site-wide. Priority order:

1. **Cursor presence** — the coral "Abhishek" cursor-chat pill, or at minimum custom cursor states over project cards. The "look around…" corner whisper is the existing hook.
2. **Live footer stamp** — real Hamburg time + a rotating one-liner.
3. **Desk objects** — 2–3 subtle collage artifacts around the hero that respond to hover. Must never overlap content.
4. **Hover-play media** in project cards (static → short silent clip).
5. **One interaction sound** max, ~2kb, on one control — lowest priority.

Not cosmetics, and therefore Phase 1: the gallery lightbox, the Places hover tooltip, and all focus states.

An Apple-Photos-style hover tab bar on the gallery preview (Marco's pattern) would consume one of the three slots. Note that in his version the map-pin tab shows a photograph, not a map — if this is ever built, a map tab must open the actual Places widget or not carry a pin.

Rules: everything degrades to a complete static page; motion timing 150–250ms ease-out, dry not bouncy; nothing moves without pointer intent; mobile gets the static version.

---

## Appendix A — Per-Site Notes

| Site | Take | Leave |
|---|---|---|
| **Marco (marco.fyi)** | THE structural spine: linen canvas, manifesto-left + widget-stack-right, pill nav with Ember dot, soft cards + whisper shadows, inverse tracking curve, one-gradient-card rule, "show the real tools", app icon row, "look around…" hook, the About page's five tracked prose headers | His six typefaces (we run two + script); Twitter-embed widgets; his gray-on-white figure/ground; his 32px radius (we sit at 24px); his zero-shadow elevation |
| **Jackie Hu** | THE warmth layer: desk-collage sensibility (Phase 2 objects), section glyphs, "currently cooking", cursor-chat pill, script accent for identity moments | Monospace body; full collage hero; her cream tint (we sit slightly cooler at #f7f5f1) |
| **Daniel White** | Year-indexed experience table; short kind-words format; polaroid photo treatment; live time-and-place stamp; ~2kb sound philosophy | Founder/product framing of the work list |
| **Rinkit Adhana** | Section order sanity; "Book an intro call" CTA pattern; expandable-experience restraint | Blueprint dashed grid; view counters, sponsors, newsletter |
| **Daniel Sun** | Caveat-as-human-signature rules; nav-as-floating-object validation | The 246px condensed hero; the yellow beam |
| **Tanmay Makode** | The Play section model; 2-col work grid rhythm; 3-sentence bio discipline | Loading-placeholder grayness; centered-well layout |
| **dzrgo** | The restraint counterweight: caption discipline, screenshots-as-evidence, ≤one human moment per view | The hairline-gallery system (v1 direction, rejected); 0px image radius |
| **Porto Rocha (/pollen)** | Live date/time in chrome; accent-reserved-for-interaction discipline; project index card anatomy | The agency rail + monograph flatness |
| **Ryan Stephen** | Section air (~96px); bare-text-link hover behavior | Total chrome-lessness (v2 is card-based by design) |
| **Rachel How (/cursors)** | Cursor taxonomy for Phase 2; two-tone heading idea for section intros | Paper grain texture; blog IA |
| **Own site (Framer)** | The gallery itself and its city + year caption model — the travel data already exists there | Forced 422×382 crops; scroll-fade reveals; the separate /gallery route; leftover template captions |

**Measured reference data (marco.fyi/about, live DOM, Aug 2026):** canvas `#ffffff`; tiles `#f7f7f9`; radius 32px; padding 32px large / 24px small; box-shadow `none`; grid gap 16px; layout 672px + 2×328px = 1360px. Recorded so future sessions don't re-measure or assume our divergences were accidents.

## Appendix B — Token Quick Start

```css
:root {
  /* Color */
  --color-paper: #f7f5f1;
  --color-card: #ffffff;
  --color-ink: #1f1f1f;
  --color-body: #4a4a46;
  --color-muted: #8a877f;
  --color-line: #e8e5df;
  --color-accent: #ff5c39;
  --color-status: #e92f48;
  --color-scrim: rgba(31,31,31,0.92);
  --gradient-feature: linear-gradient(16deg, #ff4d79, #ff8040 85%);
  --shadow-card: 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10);
  --shadow-image: 0 1px 2px rgba(0,0,0,0.25);

  /* Type */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;       /* ss01, cv11 on */
  --font-label: 'Inter Tight', 'Inter', sans-serif;
  --font-script: 'Caveat', cursive;
  --text-display: 40px;   --leading-display: 1.2;  --tracking-display: -0.015em;
  --text-manifesto: 16px; --leading-manifesto: 1.65;
  --text-card-title: 16px;--leading-card-title: 1.35;
  --text-body: 14px;      --leading-body: 1.5;
  --text-label: 12px;     --leading-label: 1.25;   --tracking-label: 0.06em;
  --text-micro: 10px;     --leading-micro: 1.2;    --tracking-micro: 0.1em;
  --weight-regular: 400;  --weight-medium: 500;    --weight-semibold: 600;

  /* Space (4px base) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --space-16: 64px; --space-24: 96px;

  /* Layout */
  --page-max: 1200px;
  --reading-max: 720px;
  --card-gap: 24px;
  --card-padding: 24px;
  --card-padding-lg: 32px;   /* About prose card */
  --grid-gutter: 24px;       /* Work grid, Play masonry */
  --section-gap: 96px;

  /* Shape */
  --radius-card: 24px;       /* v2.1: was 18px */
  --radius-image: 12px;
  --radius-pill: 100px;
  --radius-icon: 8px;        /* app icons in the tools row */

  /* Places map */
  --map-land: var(--color-line);
  --map-dot: var(--color-accent);
  --map-dot-size: 6px;
  --map-cluster-threshold: 8px;
}
```

---

*How to use this file: paste into Claude project instructions as the design constitution. Anything generated must comply with §1's Five Laws and the token tables. §2's "explicitly rejected" list and the v2.1 changelog prevent relitigating settled directions; Appendix A explains provenance and records measured reference data; §11 gates everything interactive.*
