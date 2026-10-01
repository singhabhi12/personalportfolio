/* Single source of truth for all site copy.
   Edit here — never in components.

   Gallery photos live in lib/gallery.ts, travel data in lib/places.ts, and the
   written case studies in lib/case-studies.ts (all three carry weight of their
   own); they are re-exported here so components have one import surface. */

export * from "./gallery";
export * from "./places";
export * from "./case-studies";

import { assetManifest } from "./generated/assets";

export const identity = {
  firstName: "Abhishek",
  name: "Abhishek Singh",
  role: "UX Designer — Hamburg",
  email: "abhiiiishek.1204@gmail.com",
  linkedin: "https://www.linkedin.com/in/abhishek-singh-7b5300198/",
  cv: "https://drive.google.com/file/d/1tb9bNpAES6i9-qGWQHPL0JBlmSoPgz9S/view?usp=sharing",
  intro: "https://cal.com/",
};

/* The manifesto: short declarative lines, sentence case, no periods needed.
   Bare on the paper, never in a card. */
export const manifesto = [
  "I design for messy problems — structure first, then speed, then story.",
  "Three years across event tech, Web3, and marketplaces. 100K+ people have used what I shipped.",
  "I'd rather ship it than debate it. Based in Hamburg, looking for the next team.",
];

/* Asterisk-prefixed footnote at the stack bottom (§4). */
export const manifestoFootnote = "* Less talking, more shipping.";

export const whisper = "morning. look around…";

/* The home page's one gradient card. Carries the availability signal. */
export const cooking = {
  label: "Currently cooking ☺",
  headline: "Building Stampp — an iOS app that turns your photos into collectible postage stamps.",
  sub: "Also open to UX & product roles. Hamburg or remote.",
};

export interface Role {
  years: string;
  role: string;
  field: string;
}

export const experience: Role[] = [
  { years: "2025–26", role: "Product Designer — Kolsetu", field: "Voice AI" },
  { years: "2024–25", role: "Product Designer — Evmet", field: "Event tech" },
  { years: "2022–24", role: "UX/UI Designer — Truts", field: "Web3" },
  { years: "2021–22", role: "Design Intern — Dehidden", field: "NFT" },
];

export interface Project {
  slug: string;
  /* Unused since /work became a drawer: the folder's tab numbers itself from
     its place in the list, and the page inside it carries the timeline instead.
     Kept because the case studies are still to be written and a case number is
     the sort of thing they will want — but nothing reads it today. */
  caseLabel: string;
  title: string;
  outcome: string;
  tag?: string;
  image: string;
  width: number;
  height: number;
  /** Responsive sources, emitted by the asset pipeline. */
  srcSet?: string;
  /** Phase 2 slot: a short silent clip. Had one consumer — the hover on the old
      /work card's screenshot — and the drawer took it, so this is inert whether
      it is set or not until something new opts into it. */
  hoverMedia?: string;
  /** Set false for projects that stay tiles with no detail page (see C1). */
  hasCaseStudy: boolean;
  role: string;
  timeline: string;
  team: string;
}

/* Reverse-chronological, which is also the order casestudies.md keeps them in.
   The drawer numbers folders from this list, so the order here is the order on
   /work — and `featured` below deliberately does not take the top of it. */
const projectSources: Project[] = [
  {
    slug: "substrac",
    caseLabel: "Case 01",
    title: "Substrac",
    outcome: "MA thesis turning passive subscription spend into active control.",
    tag: "Thesis",
    image: "/projects/substrac.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Sole Designer & Researcher",
    timeline: "2026",
    team: "Solo · MA thesis",
  },
  {
    slug: "stampp",
    caseLabel: "Case 02",
    title: "Stampp",
    outcome: "iOS app that turns your photos into collectible postage stamps.",
    tag: "iOS",
    image: "/projects/stampp.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Product Designer & Solo Builder",
    timeline: "2026",
    team: "Solo",
  },
  {
    slug: "kolsetu",
    caseLabel: "Case 03",
    title: "Kolsetu",
    outcome: "Sole designer on a Voice AI platform for regulated enterprises.",
    tag: "Voice AI",
    image: "/projects/kolsetu.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Product Designer (sole designer)",
    timeline: "2025–2026",
    team: "Kolsetu GmbH · Hamburg",
  },
  {
    slug: "jobtrac",
    caseLabel: "Case 04",
    title: "Jobtrac",
    outcome: "AI job tracker that tailors documents, scores ATS compatibility, and reads the inbox for status.",
    image: "/projects/jobtrac.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Product Designer & Full-Stack Builder",
    timeline: "2025–present",
    team: "Solo",
  },
  {
    slug: "evmet",
    caseLabel: "Case 05",
    title: "Evmet",
    outcome: "End-to-end UX for a live event management platform, web and mobile.",
    image: "/projects/evmet.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Product Designer",
    timeline: "2024–2025",
    team: "Remote · Event tech",
  },
  {
    slug: "truts",
    caseLabel: "Case 06",
    title: "Truts",
    outcome: "Led UX for 7 products used by 100K+ Web3 users.",
    tag: "Web3",
    image: "/projects/truts.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "UX/UI Designer",
    timeline: "2022–2024",
    team: "Remote · Web3",
  },
  {
    slug: "dehidden",
    caseLabel: "Case 07",
    title: "Dehidden",
    outcome: "Mobile-first NFT campaign UX shipped for Coinbase, Bacardi, and Polygon.",
    tag: "NFT",
    image: "/projects/dehidden.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Visual & Interaction Design Intern",
    timeline: "2021–2022",
    team: "Remote · NFT",
  },
  {
    slug: "build-up",
    caseLabel: "Case 08",
    title: "Build Up",
    outcome: "Marketplace concept connecting homeowners with local contractors.",
    image: "/projects/build-up.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Self-directed concept",
    timeline: "2023",
    team: "Solo",
  },
  {
    slug: "chip-count",
    caseLabel: "Case 09",
    title: "Chip Count",
    outcome: "Real-time chip tracking concept for live poker tournaments.",
    image: "/projects/chip-count.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Self-directed concept",
    timeline: "2024",
    team: "Solo",
  },
];

/* Real screenshots, once `npm run assets` has run, override the placeholder
   entry for their slug. Components never change; only this merge does. */
export const projects: Project[] = projectSources.map((project) => {
  const asset = assetManifest[project.slug];
  return asset ? { ...project, image: asset.src, srcSet: asset.srcSet, width: asset.width, height: asset.height } : project;
});

/* Which of the nine the drawer files, and in what order. The drawer is the
   page's opening beat and six folders is what it was drawn at, so it takes a
   selection: the current builds first, then the jobs, newest to oldest. The
   cards view is where all nine stay on the table. Order here is the order of
   the tabs; a slug that is not in `projects` is simply not filed. */
const filedSlugs = ["stampp", "kolsetu", "jobtrac", "substrac", "truts", "dehidden"];

export const filed: Project[] = filedSlugs
  .map((slug) => projects.find((p) => p.slug === slug))
  .filter((p): p is Project => p !== undefined);

/* /work is a drawer. Six manila folders tucked one behind the next, and at the
   front the folder the set is filed behind — which is the only copy the page
   needs that is not a project, everything else on it being the projects
   themselves.

   The headline is split in two because the front folder sets it as two lines
   and a line break is a typographic decision, not a string. The drawer and
   the cards each count what they show, so the number is set per view. */
export const work = {
  headline: { folders: "Six cases.", cards: "Nine cases." },
  headlineSub: "Problem, trade-offs, outcome.",
  line: "Voice AI, event tech, Web3, and the things I build on my own time — three years of it, and 100K+ people using what shipped.",

  /* The tab is the folder's whole affordance, so it says what a real one would:
     a number and a name. The number is the folder's place in the drawer, not
     the case number printed inside it — they agree today and the drawer should
     keep reading correctly on the day they stop. */
  tabSeparator: "·",

  /* The drawer has five states and three of them are reachable by hand, so
     three of them need words. Written on the front folder, in the script face,
     the way the reference annotates it. */
  tap: "tap the folder!",
  tapShut: "put them back",

  /* On an expanded folder. The card face is a button, so it has to say which
     way it goes — and the case study is a second, quieter step out of it. */
  close: "Close",
  readCase: "Read the case study",

  /* Two ways in: six filed in the drawer, or all nine laid out as cards for
     anyone who would rather see everything at once. One floating button
     switches between them, and it is named for where it goes, not where you
     are — the icon on it is the other view too. */
  switchTo: { folders: "Show as folders", cards: "Show as cards" },
};

export const portrait = (() => {
  const asset = assetManifest["portrait"];
  const base = {
    image: "/portrait.svg",
    alt: "Abhishek Singh, black-and-white portrait",
    width: 800,
    height: 1000,
    caption: "that's me",
    srcSet: undefined as string | undefined,
  };
  return asset
    ? { ...base, image: asset.src, srcSet: asset.srcSet, width: asset.width, height: asset.height }
    : base;
})();

export const projectHref = (project: Project) =>
  project.hasCaseStudy ? `/work/${project.slug}` : "#";

/* The featured project on the desk. Not `projects[0]`: the drawer's order is
   editorial, and the desk puts one project at full width, so which one is a
   separate editorial call — pinned by slug here. Falls back to the first
   project with a screenshot if the slug ever goes away. */
export const featured =
  projects.find((p) => p.slug === "stampp") ?? projects.find((p) => p.srcSet) ?? projects[0];

/* The manifesto card's headline, composed in three parts — <name> <verb>
   <subject> — so the weight mix (bold name, plain verb, underlined subject) is
   copy rather than markup. The subject is a live link to what it names. */
/* What is being built right now. Kept separate from `featured` — they agree
   today, but the desk's showcase and the thing on the bench will drift apart
   again. */
const current = projects.find((p) => p.slug === "stampp") ?? featured;

export const headline = {
  verb: "is building",
  subject: current.title,
  href: projectHref(current),
};

/* Case study scaffolding, kept as the fallback. All nine cases are written in
   lib/case-studies.ts and the page prefers those; a project added to `projects`
   before its copy exists renders this instead — a visible placeholder, never
   prose pretending to be finished. */
export interface CaseSection {
  label: string;
  placeholder: string;
  figure?: boolean;
}

export const caseSections: CaseSection[] = [
  {
    label: "The problem",
    placeholder: "The actual problem and who had it. Name the user and the stakes.",
  },
  {
    label: "What was broken",
    placeholder: "What the old experience did wrong, with specifics — screens, steps, numbers.",
    figure: true,
  },
  {
    label: "What I did",
    placeholder: "Process, the decisions you made, and the trade-offs each one cost you.",
    figure: true,
  },
  {
    label: "What I got wrong",
    placeholder: "The call you'd redo. This section is why hiring managers trust the rest.",
  },
  {
    label: "The outcome",
    placeholder: "Results with numbers where you have them, and honest scope where you don't.",
  },
];

export interface Quote {
  text: string;
  attribution: string;
}

export const quotes: Quote[] = [
  {
    text: "Extremely inquisitive and hard-working. His association with us was very fruitful.",
    attribution: "— Ramees, Co-Founder, Dehidden",
  },
  {
    text: "Abhishek's work with us was exceptional. His insights greatly enriched our team.",
    attribution: "— Raj Karia, Founder, Truts",
  },
];

export interface Tool {
  name: string;
  icon: string;
}

export const tools: Tool[] = [
  { name: "Figma", icon: "/tools/figma.svg" },
  { name: "Claude", icon: "/tools/claude.svg" },
  { name: "VS Code", icon: "/tools/vscode.png" },
  { name: "Xcode", icon: "/tools/xcode.png" },
  { name: "Notion", icon: "/tools/notion.svg" },
  { name: "Lightroom", icon: "/tools/lightroom.svg" },
  { name: "ChatGPT", icon: "/tools/chatgpt.svg" },
];

/* The desk shows the four that are open every day; the strip on /life carries
   the whole tray. Named, not sliced, so reordering the list cannot change what
   sits on the desk. */
export const deskTools: Tool[] = ["Figma", "Claude", "VS Code", "Xcode"].map(
  (name) => tools.find((tool) => tool.name === name)!
);

/* What is on right now. Title and artist by hand; everything else the card
   shows — the artwork, the album, the year, the Apple Music link, the 30s
   preview — is looked up in the Apple Music catalog at build time by
   lib/listening.ts. Change the song here and rebuild.

   `storefront` picks the catalog the link opens in: "de" for a desk in
   Hamburg. A song missing from that storefront is still found — the lookup
   tries "in" and "us" after it. */
export const listening = {
  label: "Listening",
  title: "Winning Speech",
  artist: "Karan Aujla",
  storefront: "de",
  /* The record's accessible name, in its two states. */
  preview: { play: "Play", stop: "Stop", seconds: 30 },
  noPreview: "no preview available",
  /* Where the title goes; the arrow on it is the tell. */
  link: "open in Apple Music",
  /* The script aside under the artist: the one hint that the record is the
     control. Pointer devices read the first, phones the second. */
  hint: { hover: "↳ hover the record to listen", tap: "↳ tap the record to listen" },
  /* What the record is pressed in when the catalog gave no colours: plain
     black vinyl with a smoke-grey swirl. Hex without the `#`, the way the
     catalog gives its own. */
  blankDisc: { background: "1f1f1f", swirl: "8a877f" },
} as const;

/* The contact page is a writing desk: a typewriter you type into, the sheet it
   feeds, and the letterbox the sheet is posted to. Every string the studio can
   show lives here — including the ones only a failed send ever reveals. */
export const contact = {
  label: "Let's collaborate",
  line: "A project, a role, or an idea worth building — I'd like to hear it.",
  cta: "Book an intro call",

  /* Printed on the sheet itself, above the salutation. */
  dateline: "Hamburg",
  salutation: "Dear Abhishek,",
  placeholder:
    "A project, a role, or an idea worth building. Tell me what it is and what you need from me.",

  fields: {
    name: { label: "From", placeholder: "your name" },
    email: { label: "Reply to", placeholder: "you@somewhere.com" },
    message: { label: "Your letter", srOnly: "Write your message" },
  },

  /* The composer: on a phone, tapping the sheet lifts it clear of the page
     and darkens everything behind it, so the letter and the keyboard are the
     only two things on the screen. The way out is a tap anywhere off the
     paper, and the scrim that catches that tap is the only thing on this page
     a screen reader would otherwise find unlabelled. */
  compose: { close: "Done writing" },

  send: "Seal and send",
  sending: "Posting…",

  /* The button before the letter is finished.

     A sheet of paper has no labelled fields, so the button carries the
     instructions instead: it names the next blank rather than offering to send
     an empty letter, and pressing it puts the cursor there. Only once the
     letter is actually finished does it become "Seal and send" — by which
     point that is the only thing left to do. */
  prompts: {
    message: "Typed your message?",
    sign: "Add your name and email",
  },

  /* Caption-sized, under the blank that earned them. */
  errors: {
    message: "Write something first",
    name: "Needs a name",
    email: "Needs a reply address",
    emailShape: "That address looks wrong",
  },

  /* The stage is decorative — the form beneath it does the work — so both props
     are labelled for screen readers and nothing else. */
  sceneAlt:
    "A typewriter with a sheet in the platen, and a letterbox standing beside it.",

  delivered: {
    label: "Posted",
    line: "It's in the box. I read everything, and reply to most of it.",
    /* The same news, where there was no box. A phone draws no letterbox —
       the letter is folded into a paper plane and thrown instead, see PLANE
       in lib/desk-scene.ts — and telling someone their letter is in a box
       they have just watched it fly past is the one line that would give the
       whole apparatus away. */
    flown: "It's in the air. I read everything, and reply to most of it.",
    again: "Write another",
  },

  /* Shown when there is no form endpoint configured, so the box was the end of
     the animation and not the end of the journey. Offered rather than taken:
     opening a mail client is the visitor's decision, and doing it for them
     throws a window over the send they were watching. */
  handoff: {
    label: "Sealed",
    line: "The last step is your mail app, with the letter already written.",
    open: "Open it in your mail app",
    again: "Write another",
  },

  /* Shown when the form endpoint turned the letter down. The letter is never
     lost: it comes back out of the box with every word still in it. */
  failed: {
    label: "Didn't post",
    line: "The letter came back. Send it the plain way instead —",
    retry: "Try again",
  },

  /* Under the ink button: the way out for anyone who would rather not type
     into a typewriter. */
  aside: "or just email me",
};

/* The Canvas: the one page that gives the desk back to the visitor. Sheet,
   pens, and a wall to pin the results to. Everything the page can say lives
   here — including the states only an empty wall or a full one ever show. */
export const canvas = {
  label: "The Canvas",
  /* One line in the lead face, the way /contact opens. Not "seven pens": a
     phone is offered four, and copy that contradicts the toolbar in front of
     it is worse than copy that undercounts. Where a drawing goes is explained
     by the wall and the privacy note, not by a second sentence here. */
  line: "A sheet, a handful of pens, and nobody watching.",

  /* What a phone gets instead.

     The Canvas is the one page on this site that cannot be made smaller and
     still be itself: seven pens and a sheet you can draw on need a surface
     and a hand, and on a phone the toolbar takes a third of the screen before
     a single mark is made. Saying so plainly is better than handing someone a
     cramped version of a thing that was meant to be generous — and the page
     still exists, so a link to it from a phone lands somewhere that explains
     itself rather than on a 404. */
  handheld: {
    label: "Come back on a laptop",
    line: "The Canvas needs a bigger sheet than a phone has — seven pens, a surface, and room to be careless with it.",
    back: "See the work instead",
  },

  /* The sheet is decorative to a screen reader; the buttons under it do the
     work, so it gets a name and nothing else. */
  surfaceLabel: "Drawing surface",

  pin: "Pin to the wall",
  /* The pin button's own receipt, for a second and a half. */
  pinned: "Pinned ✓",
  download: "Download PNG",
  /* Base filename for the export; Drawesome adds the extension. */
  downloadName: "canvas",

  /* The wall under the sheet. */
  wall: {
    label: "The wall",
    empty: "Nothing pinned yet. The wall fills up as you draw.",
    open: "Put back on the sheet",
    remove: "Take down",
    /* Shown once the wall is at WALL_MAX and the oldest is being dropped. */
    full: "The wall holds twelve. Pinning a thirteenth takes the oldest down.",

    /* Putting a pin back overwrites the sheet and its undo history, so an
       unpinned drawing gets asked about first. */
    confirm: "There's something on the sheet that isn't pinned.",
    replace: "Replace it",
    keep: "Keep drawing",
  },

  /* Nothing here leaves the browser, and a visitor should not have to guess
     that from the word "save". */
  privacy: "Pinned drawings live in this browser only — nothing is uploaded.",

  /* Drawesome is doing the actual drawing. Credit belongs on the page, not in
     a comment nobody reads. */
  credit: {
    lead: "Pens, ink, and toolbar by",
    name: "Drawesome",
    href: "https://github.com/benjitaylor/drawesome",
    author: "Benji Taylor",
    authorHref: "https://benji.org/drawesome",
    licence: "MIT",
  },
};

export const stamp = {
  /* Phase 2 makes the time live; see components/StampTime.tsx. */
  place: "HAM",
  time: "09:12",
  weather: "warm, good day for shipping",
  copyright: `© ${new Date().getFullYear()} Abhishek Singh`,
};

/* About page. Whole page under 400 words (§7).
   Prose is built from runs so a section can mix finished copy with the
   placeholders the design still marks as unwritten. Nothing here is invented
   biography — `hint` and `placeholder` are Abhishek's to fill in. */
export type Run =
  | { t: "text"; v: string }
  | { t: "link"; v: string; href: string }
  | { t: "hint"; v: string };

export interface AboutSection {
  label: string;
  /** Whole section still unwritten — renders as a dashed placeholder block. */
  placeholder?: string;
  runs?: Run[];
  aside?: string;
}

export const aboutSections: AboutSection[] = [
  {
    label: "Where I'm from",
    runs: [
      {
        t: "text",
        v: "I was born in Rewa in central India, but moved to Mumbai at one and grew up there. A master's in UX design brought me to Hamburg, and I stayed. Somewhere in between, I stretched a tight student budget across 11 countries, and I'm proud of that.",
      },
    ],
  },
  {
    label: "What I used to do",
    runs: [
      {
        t: "text",
        v: "I trained as a computer scientist before I found design. Building software taught me to think in systems and structure first, and that's still the lens I bring to every product.",
      },
    ],
  },
  {
    label: "What I do now",
    runs: [
      { t: "text", v: "Product and UX designer. Most recently the sole designer on " },
      { t: "link", v: "Elba", href: "/work/kolsetu" },
      { t: "text", v: ", a voice AI platform at Kolsetu, before that shaping product at " },
      { t: "link", v: "Evmet", href: "/work/evmet" },
      { t: "text", v: ", " },
      { t: "link", v: "Truts", href: "/work/truts" },
      { t: "text", v: ", and " },
      { t: "link", v: "Dehidden", href: "/work/dehidden" },
      { t: "text", v: " across event tech, Web3, and NFTs. On the side I build my own things, like " },
      { t: "link", v: "Jobtrac", href: "/work/jobtrac" },
      {
        t: "text",
        v: ", a SaaS tool for job seekers, and Stampp, an iOS app that turns your photos into collectible stamps. Structure first, then speed, then story.",
      },
    ],
  },
  {
    label: "Where I'm at now",
    runs: [
      {
        t: "text",
        v: "Based in Hamburg. Off the clock I'm usually taking photos, building Lego, or playing something on PC or PlayStation.",
      },
    ],
    aside: "↳ still learning German",
  },
  {
    label: "What I'm looking for",
    runs: [
      {
        t: "text",
        v: "A full-time Product or UX design role on a team that ships. Mid to senior, ideally SaaS or product work, in Hamburg or remote within Germany. I hold EU work authorization.",
      },
    ],
  },
];

export const about = {
  heading: "What I'm about.",
  glyph: "⌘",
  sections: aboutSections,
};
