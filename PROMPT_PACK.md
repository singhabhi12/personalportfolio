# Portfolio v2 "Personal Desk" — Prompt Pack

**For:** Abhishek Singh · August 2026
**Workflow:** Claude Design (visual) → Claude Code (implementation) → non-frontend passes
**Constitution:** PORTFOLIO_DESIGN_SOURCE_OF_TRUTH v2.0, already in your project instructions

---

## ⚠️ Read this first — three decisions to make before prompting

The v2 doc has three genuine gaps. Decide them now, or Claude will decide them for you inconsistently across prompts.

**1. The nav has an "About" link but §8 has no About section.**
Nav is `Work · About · Play · Contact`; the page structure is Desk → Work → Experience → Kind Words → Play → Contact. The Desk *is* the about.
→ **Recommendation:** rename nav to `Work · Desk · Words · Contact`, or point "About" at the Desk anchor. Don't build an About section — it would duplicate the manifesto.

**2. Where does the one gradient card go?** Currently Cooking or Contact — the doc says pick one, never both.
→ **Recommendation: Currently Cooking.** It sits in the first viewport where Law 5's "scheduled warmth" does the most work, and it keeps Contact quiet and confident rather than SaaS-y. The trade: your CTA loses its loudest treatment. If you'd rather pull the eye at the bottom, flip it — just flip it *everywhere*, including the prompts below.

**3. "Available Now" needs a home.** §2 says it becomes the red-dot pattern, but §3 already spends the nav dot on the active-page indicator.
→ **Resolved by your Currently Cooking content:** the card is about job hunting in Germany, so it carries availability. No separate status pill anywhere. One signal, one place.

**Also worth knowing:** §7 writes the manifesto example in lowercase ("i design for messy problems.") while §4 rules say sentence case, no periods. The rule wins; the example is just flavor. Prompts below use sentence case.

---

# PART A — Claude Design prompts

Staged sequence. Run in order, review each output before moving on. Each prompt assumes the constitution is loaded (it's in your project instructions) — don't re-paste the whole thing, just reference it.

---

### A1 · Foundation: tokens + primitives

```
Using the Portfolio Design Source of Truth v2.0 in this project's instructions, build the
foundation layer of the design system — no page layout yet.

Produce these as component previews:
1. Color swatches — every token in §5 with its name, hex, and one-line role. Show the
   gradient-feature as a card-sized swatch, not a chip.
2. Type specimen — every row of the §4 table rendered at its real size, weight, line-height,
   and tracking, each labeled with its token name. Make the inverse tracking curve visually
   obvious: put --text-label and --text-micro directly under --text-display so the widening
   is legible at a glance.
3. Spacing + radius scale — the 4px scale as stacked bars; the three radii (18 / 12 / 100px)
   as three shapes side by side, labeled with what each is allowed to be used on.
4. Elevation — the two shadow tokens on white cards against the paper canvas, plus the
   blush-tinted gradient-card shadow. Nothing deeper than 3px blur.

Rules: paper canvas #f7f5f1 behind everything. Inter + Inter Tight + Caveat. Weights 400/500/600
only. Output as self-contained HTML previews with all tokens declared in a single :root block
I can copy verbatim into globals.css.
```

---

### A2 · Shell: nav capsule + page frame + corner whisper

```
Build the page shell for the Personal Desk portfolio, using the tokens from the foundation layer.

1. Nav capsule — white, fully rounded (100px), ~48px tall, whisper shadow, floating top-center,
   sits ON the paper canvas with clear air above it. Four links at 14px/500:
   Work · Desk · Words · Contact. Active item = 6px #e92f48 dot to its left + ink text.
   Inactive = muted #8a877f. Hover = muted → ink. No underlines, no fills, no logo.
   Show all three states (active / inactive / hover) as separate previews.
2. Page frame — 1200px max-width, centered, two-column split at 40% / 60% with a 24px gap.
   Minimum 24px outer margin so cards never touch the viewport edge. Show it as an empty
   wireframe with the columns tinted so I can see the proportions.
3. Corner whisper — "look around…" in --text-label tracked, muted, top-right of the page.
   Static text, no interaction. This is a Phase 2 hook only.

Do NOT build any content yet. I want to approve the frame before anything sits in it.
```

---

### A3 · The Desk (the first impression — spend the most time here)

This is the prompt that decides whether the redesign reads as new. Iterate on it.

```
Build "The Desk" — the two-column hero zone. This zone has to deliver the whole
"visiting Abhishek's studio" impression in one viewport-and-a-half.

LEFT COLUMN (~40%) — the manifesto. No card, text directly on paper. Sticky on desktop.
  - "Abhishek" in --text-display (40px/600, ink, -0.015em)
  - "UX Designer — Hamburg" in --text-label, muted, tracked +0.06em
  - Then this statement stack in --text-manifesto, one per line, blank-line rhythm,
    sentence case, no periods:
      I design for messy problems
      Structure first, then speed, then story
      Three years across event tech, Web3, and marketplaces
      100K+ people have used what I shipped
      I'd rather ship it than debate it
      Hamburg-based, looking for the next team
  - Footnote at the bottom: "* Less talking, more shipping." in --text-label
  - ONE Caveat aside allowed in this whole column — a small "that's me →" angled toward
    the portrait card. Use it once or not at all.

RIGHT COLUMN (~60%) — the desk stack. Four white widget cards, 18px radius, 24px padding,
whisper shadow, 24px gaps. Every card gets a tracked --text-label header.
  1. CURRENTLY COOKING ☺ — THIS IS THE PAGE'S ONE GRADIENT CARD.
     linear-gradient(16deg, #ff4d79, #ff8040 85%), white text, blush-tinted shadow.
     Content: two lines about job hunting in Germany — currently interviewing, open to
     UX/product roles, Hamburg or remote. This card carries the availability signal, so
     there is no separate "Available Now" pill anywhere on the page.
  2. Featured project — Truts. Screenshot at 12px radius, title in --text-card-title,
     outcome line "Led UX for 7 products used by 100K+ Web3 users." Whole card links.
  3. Portrait card — B&W portrait in a white card. This is the page's one photo object.
  4. DESK — tools row: 40–44px real app icons (Figma, Framer, Notion, Miro) at 8px radius,
     8px gaps, native colors untouched.

Hard constraints: exactly one gradient on this page. Exactly one Caveat aside in this zone.
Exactly one photo object. Shadows ≤3px blur. Cards never touch the viewport edge.
The 95% of this zone that isn't the gradient card must be warm neutral.

Use placeholder frames for the screenshot, portrait, and app icons — mark them clearly as
placeholders. I'll supply real assets.
```

**If the output feels like the old site:** the failure mode is the manifesto column reading as a sidebar. Follow up with:

```
The left column is reading as a CV sidebar, not a manifesto. Fix it: increase the line spacing
in the statement stack so each line lands as its own beat, drop any bio-paragraph feel, and make
sure the column sits on paper with no border, no background, and no visual container of any
kind. It should read like handwriting on the desk, not a rail.
```

---

### A4 · Work section

```
Build the full-width Work section below the Desk.

- Section header: "Work ▶" — the glyph is one of only four permitted on the entire site.
- 2-column grid of Featured Project Cards, 24px gutters, max-width 1200px.
- Card anatomy: white widget card (18px radius, 24px padding, whisper shadow) containing a
  screenshot at 12px radius at natural ratio, title in --text-card-title, one outcome line in
  --text-body muted. Optional: one Tag Chip per card (100px radius, 1px coral border,
  transparent fill, coral --text-label text).
- Whole card is the link. Hover = title shifts to coral #ff5c39. No "view project" buttons,
  no chevrons, no hover-grow shadows.

Six projects, outcome lines exactly as written:
  Truts — Led UX for 7 products used by 100K+ Web3 users.
  Application HQ — Web + mobile UX for live event ops: booth tracking and real-time attendee flow.
  Evmet — End-to-end UX for a live event management platform, web and mobile.
  Dehidden — Mobile-first NFT campaign UX shipped for Coinbase, Bacardi, and Polygon.
  Build Up — Marketplace concept connecting homeowners with local contractors.
  Chip Count — Real-time chip tracking concept for live poker tournaments.

No gradient in this section — the page's one gradient is already spent on Currently Cooking.
Placeholder screenshot frames, clearly marked.
```

---

### A5 · Experience + Kind Words

```
Build two sections, both max-width 720px, left-aligned to the same grid edge as everything else.

1. EXPERIENCE — one widget card containing year-indexed rows:
     2024–2025 | Product Designer — Evmet | Event tech · Remote
     2022–2024 | UX/UI Designer — Truts | Web3 · Remote
     2021–2022 | Visual & Interaction Design Intern — Dehidden | NFT · Remote
   Year muted left, role + company ink, meta right-aligned muted. 1px #e8e5df separators,
   12px vertical padding. No logos, no chevrons, no expand states.

2. KIND WORDS — two short quotes as a two-column band:
     "Extremely inquisitive and hard-working. His association with us was very fruitful."
       — Ramees, Co-Founder, Dehidden
     "Abhishek's work with us was exceptional. His insights greatly enriched our team."
       — Raj Karia, Founder, Truts
   Quote in --text-body ink, attribution in --text-label muted. No avatars, no quotation-mark
   glyphs, no cards-within-cards.

Show me both as stacked-widget-card and as plain-band-on-paper variants for Kind Words, so I
can see which sits better against the Work grid above it.
```

---

### A6 · Contact + footer stamp

```
Build the closing zone.

CONTACT — a plain white widget card (NOT the gradient card; the gradient is spent on
Currently Cooking).
  - Header "LET'S COLLABORATE" in --text-label, tracked, muted
  - One warm line: "A project, a role, or an idea worth building — I'd like to hear it."
  - One ink pill button (100px radius, #1f1f1f fill, white text): "Book an intro call"
  - Below it, email as a bare ink text link, hover → coral
  This is the only filled button on the entire site.

FOOTER STAMP — no card, sits directly on the paper:
  "HAM 09:12 · warm, good day for shipping" in --text-micro, tracked +0.1em, muted
  Plus "© 2026 Abhishek Singh" on its own line.
  Static text for now — Phase 2 makes the time live.
```

---

### A7 · Mobile

```
Adapt every zone built so far to mobile (390px). Single column throughout:
manifesto first, then the card stack, then Work, Experience, Kind Words, Contact, footer stamp.

- Nav capsule stays floating and centered — do not convert it to a hamburger or a drawer.
- Cards keep 18px radius and 24px padding but drop to full column width with a 24px outer margin.
- Manifesto loses its sticky behavior.
- The corner whisper is desktop-only; drop it.
- Work grid collapses to one column.

Show the full mobile page as one continuous preview so I can check the vertical rhythm.
```

---

### A8 · Self-critique pass (run this before you touch code)

```
Audit everything you've built against the Portfolio Design Source of Truth v2.0. For each
item, tell me PASS or FAIL with the specific element at fault:

1. Exactly one gradient surface on the page?
2. Every shadow ≤3px blur? Any hover-grow shadows?
3. Every card 18px radius, every image-in-card 12px, every interactive element 100px?
4. Any sharp corners (0–4px) on a card?
5. Page background warm #f7f5f1 — never pure white, never cool gray?
6. Is chromatic color limited to punctuation — one status dot, tag borders, hover states,
   the one gradient card? Any color leaking anywhere else?
7. Weights 400/500/600 only, 600 on titles only? Any bold body text?
8. Does the tracking curve actually invert — micro-labels ≥+0.06em, headings tightened?
9. Caveat used at most once per section, never for real content?
10. One photo object on the home page?
11. Do cards ever touch the viewport edge?
12. Is every card given a tracked label header?
13. Are the only decorative glyphs ▶ ⁕ ⌘ ☺?

Then answer this separately: does the page read as "a designer's desk in morning light,"
or does it read as a CV in cards? Be blunt. If it's the second, name the three changes
that would fix it.
```

---

# PART B — Claude Code prompts

Run after the design is approved. Each of these assumes you're in the project repo.

---

### B1 · Scaffold + token layer

```
Set up a Next.js portfolio site. Requirements:

- Next.js App Router, TypeScript, output: 'export' (fully static — deploys to Vercel/Netlify
  with no server), images.unoptimized: true
- No CSS framework. Plain CSS in app/globals.css. The design tokens from the Portfolio Design
  Source of Truth v2.0 Appendix B go in a single :root block, verbatim.
- Fonts: Inter (400/500/600), Inter Tight (500), Caveat (700) — self-hosted via @fontsource,
  NOT next/font/google. Enable "ss01" and "cv11" on Inter.
- Hard rule: no hex value, no px literal, and no font-family may appear anywhere outside that
  :root block. Every component consumes tokens only. I want to be able to grep for violations.
- All site copy lives in lib/content.ts as typed exports (Project[], Role[], Quote[], etc.).
  I edit copy there, never in JSX.

Set up the file structure and the token layer. No components yet.
```

---

### B2 · Implement the design

```
Implement the approved design from Claude Design as React components. Work zone by zone in
this order, and stop after each so I can review:

1. Shell — nav capsule (floating, 100px radius, whisper shadow), 1200px two-column page frame
   at 40/60, corner whisper
2. The Desk — manifesto column (sticky on desktop) + the four-card widget stack
3. Work — full-width 2-column Featured Project Card grid
4. Experience + Kind Words
5. Contact + footer stamp

Component rules:
- One base <WidgetCard> that every desk object extends — white, 18px radius, 24px padding,
  whisper shadow, tracked label header. Do not re-declare card styling per component.
- Everything is a server component except where the browser is genuinely required.
- Project screenshots: plain <img> with explicit width/height to prevent layout shift.
- Nav is anchor links, no scroll library, no smooth scroll (motion is Phase 2).
- No animation beyond `transition: color 150ms ease-out` on text links.
- Focus states: 2px coral outline, 2px offset — this is the one exception to
  color-shift-only states.

Match the approved design exactly. If anything in the design conflicts with the constitution's
token tables, stop and ask me rather than picking one.
```

---

### B3 · Case study page template

```
Add case study pages at app/work/[slug]/page.tsx, statically generated from lib/content.ts.

Per the constitution §8: the nav capsule persists, but the desk metaphor does NOT carry over —
case studies are calm reading. Single 720px column of text, full-width images in 12px-radius
frames, section dividers in --color-line. No widget cards, no gradient, no Caveat.

Build the template plus the routing and a "back to work" link. Use placeholder content —
I'll write the real case studies separately.
```

---

### B4 · Asset pipeline

```
Set up the image workflow so I can drop in real screenshots without touching component code.

- A script that takes raw screenshots from a /raw folder, converts to WebP with a JPG fallback,
  generates 1x/2x variants, strips EXIF, and writes the correct width/height into a manifest
  I can import in content.ts
- Preserve natural aspect ratios — never crop to a fixed ratio
- Real app icons for the tools row (Figma, Framer, Notion, Miro): tell me exactly where to
  source these legally and what format to save them in, then wire them up
- Document the swap procedure in the README: where files go, what to update, nothing else
```

---

### B5 · Phase 2 hooks (build later, scaffold now)

```
Don't build Phase 2 cosmetics, but make sure Phase 1 doesn't block them. Confirm and adjust:

- The "look around…" corner whisper exists as static markup with a stable selector
- The footer stamp's time is a single isolated component, ready to become live
- Project cards can accept a hover-media slot without restructuring
- Nothing in Phase 1 depends on JS to render correctly

Tell me what would need to change for each Phase 2 item, but change nothing yet.
```

---

# PART C — Non-frontend prompts

---

### C1 · Case study content (the actual substance)

This is the highest-leverage work in the whole project. Tiles get people interested; case studies get you hired.

```
Help me write the Truts case study. Interview me first — ask one question at a time, and don't
write anything until you have enough. I want to cover:

- The actual problem and who had it
- What was broken before, with specifics
- What I did — process, decisions, and the trade-offs I made
- What I got wrong and what I'd redo
- The outcome, with numbers where I have them

Structure it for a hiring manager who will skim: outcome first, then the story, then the
craft detail. 700–1000 words. Then run the draft through my abhishek-writing-voice skill so
it sounds like me and not like a case study template.
```

Repeat per project. Do Truts and Dehidden first — they have the strongest numbers and the real client names.

```
I have limited time. Look at my six projects and tell me which two deserve full case studies,
which two deserve a short 300-word treatment, and which two should stay as tiles with no
detail page at all. Judge by what a Hamburg product-design hiring manager would actually
care about, and say why for each.
```

---

### C2 · SEO, metadata, analytics

```
Set up discoverability and measurement for the portfolio:

1. Metadata: per-page title/description, canonical URLs, Open Graph and Twitter cards.
   Generate OG images from the project screenshots at 1200x630.
2. JSON-LD structured data: Person schema with my name, role, location (Hamburg), and
   sameAs links to LinkedIn.
3. sitemap.xml and robots.txt, generated at build.
4. Privacy-friendly analytics — Plausible or Umami, not Google Analytics. Set it up so it
   needs no cookie banner under GDPR, since I'm based in Germany. Tell me the cost.
5. A German-market check: should this site have a legal Impressum? I'm a private individual
   in Hamburg with a portfolio site, not selling anything. Tell me what the actual
   requirement is and flag that I should verify it myself.

Explain what each does before you build it.
```

---

### C3 · Deploy, domain, performance

```
Get the site live and fast.

1. Deployment: static export to Vercel, connected to a GitHub repo with preview deploys on
   branches. Walk me through it — I haven't done this before.
2. Custom domain: I want a personal domain. Suggest options based on my name, tell me where
   to buy for a German resident, and walk me through DNS.
3. Performance budget: sub-1s LCP on 4G, 100 Lighthouse performance score. Audit what I have,
   fix what's slow, and tell me what the actual bottleneck is rather than making
   generic optimizations.
4. Set up a GitHub Action that runs Lighthouse on every PR and fails if performance drops
   below 95 or accessibility below 100.
```

---

### C4 · Accessibility + QA

```
Run a full WCAG 2.1 AA audit on the built site, then fix what you find.

Pay particular attention to the places where this design system is inherently risky:
- Muted text #8a877f on paper #f7f5f1 — check the contrast ratio at every size it's used,
  especially --text-micro at 10px. Tell me the real number, and if it fails, propose the
  smallest token change that fixes it rather than redesigning around it.
- White text on the coral gradient card — check contrast at both ends of the gradient.
- States communicated by color shift alone — verify keyboard focus is always visible.
- The nav capsule's coral active dot — is active state conveyed to a screen reader, not
  just visually?

Then: keyboard-only navigation pass, screen reader pass, prefers-reduced-motion, and
responsive QA at 390 / 768 / 1024 / 1440 / 2560. Report findings by severity with the
specific fix for each. Don't silently change the design to pass — flag any conflict between
an accessibility fix and the constitution and let me decide.
```

---

## Suggested order

1. **A1 → A8** — get the design right, especially A3. Don't move on while the Desk still reads like a CV.
2. **B1 → B2** — implement. Review each zone.
3. **C1** — write case studies. Do this *while* you gather real screenshots; they inform each other.
4. **B3 → B4** — case study pages + real assets go in together.
5. **C2 → C4 → C3** — meta and accessibility before you point a domain at it.

**The thing that will actually make or break this:** real screenshots. The design system says the work carries all the color — until real product UI is in those cards, every version will look like a wireframe, and no amount of prompting fixes that.
