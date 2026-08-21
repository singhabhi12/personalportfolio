# Abhishek Singh — Portfolio Design Source of Truth

> A designer's desk in morning light. Warm paper canvas, soft white cards that float like objects on a workspace, quiet geometric type — and one coral spark of personality. The site should feel like visiting Abhishek's studio, not reading his CV.

**Version:** 2.0 · August 2026 — direction: **Personal Desk** (Marco structural spine + Jackie Hu warmth layer)
**Scope:** Phase 1 — layout, typography, color, spacing, components, content structure. Interactive cosmetics (cursors, collage objects, sounds, motion) are reserved as Phase 2 hooks (§11); Phase 1 must be complete without them.
**Derived from:** marco.fyi and jackiehu.design (primary), danielwhite.uk, rinkitadhana.com, danielsun.space, tanmaym.com, dzrgo.com, portorocha.com/pollen, ryanstephen.co, rachelhow.com/cursors + 5 detailed style-reference files + audit of the current site (abhidesignportfolio.framer.website).

---

## 1. Design Philosophy — The Five Laws

Every future decision gets tested against these.

1. **A workspace, not a website.** The page is a desk: a warm paper canvas on which white cards sit like real objects — a project, a note, a photo, a tool. Cards are soft (18px radius), lightly lifted (whisper shadows), and never touch the page edge. (Source: Marco's widget stack, Jackie's desk collage.)
2. **Show the real thing.** Real product screenshots, real app icons, real photos, real quotes from real people. No abstract illustration, no decorative graphics, no mockup theater. The tools and the work carry all the color. (Source: Marco's "show the real tools", dzrgo's raw captures.)
3. **Neutral canvas, chromatic punctuation.** 95% of the page is warm neutral. Color appears only as tiny functional punctuation — a status dot, an accent border, a tag — plus **at most one** warm gradient/feature card per page. That single warm hit earns the rest staying quiet. (Source: Marco's Ember dot + one coral card rule.)
4. **Type whispers, tracking talks.** UI text stays small (12–16px) at weights 400–600. Character comes from the tracking curve — micro-labels tracked wide like printed stationery, headings tightened — and from one handwritten aside per section maximum. (Source: Marco's inverse tracking, Daniel Sun's Caveat notes.)
5. **Personality is scheduled, not scattered.** The warmth (script accents, desk objects, "currently cooking", the cursor pill) appears at planned moments — one per viewport. Between those moments the system is disciplined and modern. Jackie's playfulness on Marco's grid. (Source: both, plus dzrgo as the restraint counterweight.)

**Personality in one sentence:** a Hamburg UX designer's desk — structured and shipping-focused, but you can tell a human sits here.

---

## 2. Direction vs. Current Site

**Keep from abhidesignportfolio.framer.website:** the black-and-white portrait (it gains warmth against the paper canvas); the "Available Now" status signal (it becomes Marco's red-dot pattern); the project set and their one-line outcome descriptions; testimonials and contact as sections; the general two-column instinct.

**Change:** the cool gray-white canvas becomes warm Linen paper; the heavy identity sidebar becomes a **floating pill nav** + an intro manifesto column (identity moves into the content, not a rail); gray card plates with big drop shadows become white cards with 18px radius and whisper shadows (≤3px blur); the oversized hero paragraph becomes a stacked manifesto of short declarative lines; the floating pill sub-nav bottom-left is deleted (the top nav capsule does that job); scroll-fade reveals are deleted (motion is Phase 2); "Made in Framer" chrome gone.

**Explicitly rejected for this direction** (recorded so v3 doesn't relitigate): the dzrgo/Porto Rocha hairline-gallery system (v1 of this doc — too austere for the chosen personality); Daniel Sun's 246px condensed hero (identity here is conversational, not monumental); pure-white #ffffff canvas (the warmth lives in the paper).

---

## 3. Layout System

### Page shell
- **Floating pill nav**, top center: white capsule, fully rounded (radius 100px+), whisper shadow, ~48px tall. Contains 4 text links — Work · About · Play · Contact — in 14px/500. The **active item gets a 6px coral dot** to its left; the dot is the only color in the nav. No logo in the nav; the name lives in the hero. (Marco's capsule; Daniel Sun validates nav-as-floating-object.)
- **Two-column desk** below, max-width 1200px, centered:
  - **Left column (~40%) — the manifesto.** Text sits directly on the paper canvas, no card. Name + role first, then a vertical stack of short declarative statements. Sticky on desktop so the voice follows the visitor.
  - **Right column (~60%) — the desk stack.** A vertical/masonry stack of white widget cards of varying heights: featured project cards, a "currently cooking" card, a tools row, a photo or artifact card, a kind-words card. 24px gap between cards.
- **Full-width Work section** below the desk (project case studies need more room than the widget column allows — see §8).
- **Corner whisper:** a small muted "look around…" prompt in the top-right, 12px tracked label — the hook where Phase 2 cursor play attaches. Harmless static text until then. (Marco.)
- **Mobile:** single column — manifesto first, then the card stack, then work. Nav capsule stays floating.

### Rhythm
- Card gap 24px; card padding 24px; section gap 64–96px; element gap 8px.
- Cards never touch the viewport edge — minimum 24px outer margin.
- Density: compact inside cards, generous between sections. A desk is full but not cluttered.

---

## 4. Typography

Three voices, strict roles. (Substitute stack per Marco's file — free-font equivalents of Graphik/Neue Montreal.)

| Token | Face | Size | Weight | LH | Tracking | Use |
|---|---|---|---|---|---|---|
| `--text-display` | Inter | 40px | 600 | 1.2 | -0.015em | Name in the manifesto header; one per page |
| `--text-manifesto` | Inter | 16px | 400 | 1.65 | +0.005em | The declarative statement stack |
| `--text-card-title` | Inter | 16px | 600 | 1.35 | 0 | Card and project titles |
| `--text-body` | Inter | 14px | 400 | 1.5 | +0.005em | Descriptions, quotes, running copy |
| `--text-label` | Inter Tight | 12px | 500 | 1.25 | **+0.06em** | Card headers, tags, metadata — the tracked-stationery voice |
| `--text-micro` | Inter Tight | 10px | 500 | 1.2 | **+0.1em** | Timestamps, footnote labels |
| `--text-script` | Caveat | 18–24px | 700 | 1.1 | -0.02em | Handwritten asides only — an arrow note, "from 2021 til today", a margin comment. Max one per section, never for real content |

Rules:
- **The inverse tracking curve is the signature:** the smaller the text, the wider the tracking (+0.06 → +0.1em); headings tighten. Never one tracking value across the scale. (Marco's core move.)
- Weights 400/500/600. 600 is for titles only — body emphasis uses color, not bold.
- Inter with `"ss01", "cv11"` enabled. Stack: `'Inter', ui-sans-serif, system-ui, sans-serif`; labels: `'Inter Tight', 'Inter', sans-serif`; script: `'Caveat', cursive`.
- Manifesto statements: one sentence per line, blank-line rhythm, sentence case, no periods needed. Asterisk-prefixed footnote allowed at stack bottom in `--text-label` (Marco's `* Less, but better.` pattern).
- Optional: section headers may carry a single trailing glyph — Work ▶, Play ⁕, About ⌘ (Jackie's move). Use the same four glyphs forever; never decorate anything else.

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
| `--color-line` | `#e8e5df` | Hairline borders inside cards (dividers, input underlines). |
| `--color-accent` | `#ff5c39` | Coral — the personality color. Status dot in nav, link hover, tag borders, the cursor pill (Phase 2). Punctuation-sized uses only. |
| `--gradient-feature` | `linear-gradient(16deg, #ff4d79, #ff8040 85%)` | The one warm feature card per page (currently-cooking or the contact card — pick one). White text on it. (Marco's Coral Pulse.) |
| `--color-status` | `#e92f48` | The 6px active-nav dot. (Marco's Ember.) |

Rules:
- **One gradient surface per page, ever.** If contact gets it, currently-cooking doesn't. (Marco's hard rule.)
- Pastel tag chips (soft pink/yellow/green/blue at ~10% saturation) are permitted in exactly one place: a skills/interests swatch row. Nowhere else. (Marco's color-swatch row.)
- Native app icons and project screenshots keep their real colors untouched — they are the page's multicolor moments. (Law 2.)
- Semantic red/green only inside form validation, caption-sized.
- Dark mode: not in Phase 1. The paper metaphor is a daylight metaphor.

---

## 6. Spacing, Radius, Elevation

- **Base unit 4px.** Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96.
- **Radius vocabulary (three values, strictly assigned):**
  - `18px` — all cards and widgets (the soft-furniture feel; sharp corners break it — Marco).
  - `12px` — images and screenshots *inside* cards, inputs.
  - `100px` — every interactive element: buttons, tag chips, the nav capsule. Pills all the way down.
- **Elevation — shadows whisper, never announce (≤3px blur):**
  - Cards: `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10)`
  - Images in cards: `0 1px 2px rgba(0,0,0,0.25)`
  - The gradient card may carry a blush-tinted shadow (`rgba(248,193,200,~0.5)` offset) — the one expressive shadow. (Marco's Rose Glow.)
  - Nothing deeper. No hover-grow shadows in Phase 1.

---

## 7. Components

**Manifesto Column** — No card. "Abhishek" in `--text-display` ink; below, "UX Designer — Hamburg" in `--text-label` muted, tracked. Then the statement stack in `--text-manifesto`: 5–7 lines in his voice ("i design for messy problems." / "structure first, then speed, then story." …). Footnote at bottom in `--text-label` with asterisk. One Caveat aside allowed (e.g. a small "that's me →" pointing at the portrait).

**Nav Capsule** — As §3. Active = coral dot + ink text; inactive = muted text. Hover = muted → ink. No underlines, no fills.

**Widget Card (base)** — White, 18px radius, 24px padding, whisper shadow. Header: `--text-label` tracked muted, optionally prefixed by a 4px coral dot. Content below with 14px gap. Every desk object extends this.

**Featured Project Card** — Widget card containing: screenshot at 12px radius (real UI, natural ratio), title in `--text-card-title`, one outcome line in `--text-body` muted ("Led UX for 7 products used by 100K+ Web3 users."). Whole card is the link; hover = title → coral. No "view project" buttons.

**Currently Cooking Card** — Jackie's energy, Marco's frame: header "CURRENTLY COOKING ☺" tracked, one or two lines about the in-progress thing, a small tool/app icon inline. This card may be the page's gradient card — if so, white text and no other gradient anywhere.

**Tools Row** — Horizontal row of 40–44px real app icons (Figma, Framer, Notion, …) at 8px radius, 8px gaps, inside a widget card labeled "DESK". Icons keep native colors — this is a sanctioned multicolor moment.

**Profile / Portrait Card** — B&W portrait in a white card, or polaroid-style with a Caveat caption. One personal photo object max on the home page (Daniel White's polaroids inform the treatment, not the quantity).

**Kind Words Card(s)** — Quote in `--text-body` ink, attribution in `--text-label` muted ("Raj Karia — Founder, Truts"). Short quotes only. As stacked widget cards or a two-column band in the full-width zone.

**Experience Card** — Year-indexed rows inside one widget card: year in muted left, role + company in ink, place right-aligned muted, 1px `--color-line` separators, 12px vertical padding. No logos, no chevrons. (Daniel White's table, dressed in Marco's card.)

**Tag Chip** — 100px radius, 1px coral border, transparent fill, `--text-label` coral text, 6px 12px padding. For project categories. Pastel-filled variant only in the skills swatch row.

**Contact Block** — Header "LET'S COLLABORATE" tracked; one warm line; then either the gradient card with a white pill button ("Book an intro call" — Rinkit's dual-CTA simplified to one), or a plain card with underlined-input form: labels `--text-label`, inputs with `--color-line` bottom borders only, one ink pill button.

**Footer Stamp** — Small line on the paper, no card: `HAM 09:12 · warm, good day for shipping` in `--text-micro` tracked muted, plus © line. The quiet live-data signature (dzrgo/Daniel White). Phase 2 makes it real.

---

## 8. Page Structure (top to bottom)

1. **Nav capsule** (floating, persistent).
2. **The Desk** — two-column hero zone: manifesto left (sticky), right stack of ~4 widget cards: Currently Cooking, one Featured Project, Portrait, Tools Row. This zone must fit the "visiting the studio" first impression in one viewport-and-a-half.
3. **Work ▶** — full-width section: section header + 2-column grid of Featured Project Cards (4–6 total, curated hard: Application HQ, Evmet, Truts, Dehidden, Build Up, Chip Count — cut any with weak imagery). 24px gutters.
4. **Experience** — one Experience Card, full column width (~720px).
5. **Kind Words** — 4–6 short quotes.
6. **Play ⁕ (optional)** — small grid for experiments/side quests (tanmaym's section model). Only if there's real content; an empty playground is worse than none.
7. **Contact** — as §7. This or Currently Cooking carries the page's one gradient.
8. **Footer stamp.**

Case-study pages: nav capsule persists; content is a single 720px column of text with full-width images in 12px-radius frames, section dividers in `--color-line`. The desk metaphor stays on the home page — case studies are calm reading.

---

## 9. Imagery Rules

- Screenshots are evidence: real UI, tight crops, natural ratios, 12px radius inside cards. No angled device mockups, no gradient backdrops behind shots.
- App icons: native, untouched, colorful — the sanctioned color moments.
- Photography: candid and personal (the B&W portrait; optionally one desk/city photo as a card). Polaroid treatment (white frame + Caveat caption) allowed on exactly one photo object.
- No illustration system, no 3D, no stock icons. Interface glyphs are thin, monochrome, text-sized. The four section glyphs (▶ ⁕ ⌘ ☺) are the entire decorative-glyph budget.

---

## 10. Do's and Don'ts

### Do
- Put every piece of content in a white 18px-radius card on the paper canvas — or directly on the paper as manifesto text. Those are the only two homes.
- Track micro-labels wide (+0.06em minimum) so small text reads as printed stationery.
- Keep chromatic color to punctuation: one dot, one border, one gradient card per page.
- Use 100px pills for every interactive element — buttons, chips, the nav.
- Show real tools, real screenshots, real icons in their real colors.
- Write outcome lines with numbers ("100K+ users", "7 products").
- Give every card a tracked label header — cards are labeled objects on a desk.
- Protect the scarcity of warmth: one script aside, one photo object, one gradient per page.

### Don't
- Don't use a cool or pure-white page background — the paper is the personality's foundation.
- Don't use sharp corners (0–4px) on any card, or fill buttons with flat chromatic color — outlined/pill vocabulary only, except the single ink button and the gradient card's white pill.
- Don't let shadows exceed 3px blur, ever.
- Don't set body text in pure black or bold — ink is #1f1f1f, emphasis is color-shift.
- Don't break the two-column desk with full-width text in the hero zone.
- Don't use Caveat for anything longer than one line, or twice in one section.
- Don't add scroll-reveal animations, parallax, or autoplay in Phase 1.
- Don't let the pastel swatch row's colors leak anywhere else in the UI.

---

## 11. Phase 2 — Interactive Cosmetics (reserved hooks, do not build yet)

Budget: **max 3 cosmetic systems** site-wide (this direction earns one more than v1's austerity). Priority order:

1. **Cursor presence** — the coral "Abhishek" cursor-chat pill (Jackie's multiplayer cursor moment), or at minimum custom cursor states over project cards (rachelhow's collection is the taxonomy reference). The "look around…" corner whisper is the existing hook.
2. **Live footer stamp** — real Hamburg time + a rotating one-liner.
3. **Desk objects** — 2–3 subtle collage artifacts around the hero (a Mac folder, an AirDrop toast, a sticker — Jackie's vocabulary) that respond to hover. Static and decorative until then; must never overlap content.
4. **Hover-play media** in project cards (static → short silent clip).
5. **One interaction sound** max, ~2kb, on one control (Daniel White's philosophy) — lowest priority.

Rules: everything degrades to a complete static page; motion timing 150–250ms ease-out, dry not bouncy; nothing moves without pointer intent; mobile gets the static version.

---

## Appendix A — Per-Site Notes (what each reference contributes to v2)

| Site | Take | Leave |
|---|---|---|
| **Marco (marco.fyi)** | THE structural spine: linen canvas, manifesto-left + widget-stack-right, pill nav with Ember dot, 18px cards + whisper shadows, inverse tracking curve, one-gradient-card rule, "show the real tools", app icon row, "look around…" hook | His six typefaces (we run two + script); Twitter-embed widgets; the 40px display stays modest |
| **Jackie Hu** | THE warmth layer: desk-collage sensibility (Phase 2 objects), section glyphs, "currently cooking", cursor-chat pill, script accent for identity moments, playful-but-curated tone | Monospace body (conflicts with Inter voice); full collage hero (our objects are garnish, not the hero); her cream tint (we sit slightly cooler at #f7f5f1) |
| **Daniel White** | Year-indexed experience table; short kind-words format; polaroid photo treatment; live time-and-place stamp; ~2kb sound philosophy; "details you only notice when missing" ethos | Founder/product framing of the work list |
| **Rinkit Adhana** | Section order sanity (profile → proof → work → words → contact); "Book an intro call" CTA pattern; expandable-experience restraint | Blueprint dashed grid; view counters, sponsors, newsletter |
| **Daniel Sun** | Caveat-as-human-signature rules (one per section, never content); nav-as-floating-object validation; discontinuous scale as a concept | The 246px condensed hero; the yellow beam |
| **Tanmay Makode** | The Play/Experiments section model; 2-col work grid rhythm; 3-sentence bio discipline | Loading-placeholder grayness; centered-well layout (we're two-column) |
| **dzrgo** | The restraint counterweight: caption discipline, screenshots-as-evidence, ≤one human moment per view — keeps the desk from becoming a toybox | The hairline-gallery system itself (v1 direction, rejected for v2); 0px image radius |
| **Porto Rocha (/pollen)** | Live date/time in chrome; accent-reserved-for-interaction discipline; project index card anatomy (icon + name + one-liner) | The agency rail + monograph flatness (rejected for v2) |
| **Ryan Stephen** | Section air (~96px); bare-text-link hover behavior | Total chrome-lessness (v2 is card-based by design) |
| **Rachel How (/cursors)** | Cursor taxonomy for Phase 2; two-tone heading idea (ink phrase + muted continuation) for section intros | Paper grain texture; blog IA |

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
  --section-gap: 96px;

  /* Shape */
  --radius-card: 18px;
  --radius-image: 12px;
  --radius-pill: 100px;
}
```

---

*How to use this file: paste into Claude project instructions as the design constitution. Anything generated must comply with §1's Five Laws and the token tables. §2's "explicitly rejected" list prevents relitigating old directions; Appendix A explains provenance; §11 gates everything interactive.*
