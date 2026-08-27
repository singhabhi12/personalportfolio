/* Single source of truth for all site copy.
   Edit here — never in components.

   Gallery photos live in lib/gallery.ts and travel data in lib/places.ts
   (both carry logic of their own); they are re-exported here so components
   have one import surface. */

export * from "./gallery";
export * from "./places";

import { assetManifest } from "./generated/assets";

export const identity = {
  firstName: "Abhishek",
  name: "Abhishek Singh",
  role: "UX Designer — Hamburg",
  email: "kwebellkop.1204@gmail.com",
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
  headline: "Interviewing right now — open to UX & product roles.",
  sub: "Hamburg or remote.",
};

export interface Role {
  years: string;
  role: string;
  field: string;
}

export const experience: Role[] = [
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

const projectSources: Project[] = [
  {
    slug: "truts",
    caseLabel: "Case 01",
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
    slug: "application-hq",
    caseLabel: "Case 02",
    title: "Application HQ",
    outcome: "Web + mobile UX for live event ops: booth tracking and real-time attendee flow.",
    image: "/projects/application-hq.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Product Designer",
    timeline: "2024–2025",
    team: "Remote · Event tech",
  },
  {
    slug: "evmet",
    caseLabel: "Case 03",
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
    slug: "dehidden",
    caseLabel: "Case 04",
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
    caseLabel: "Case 05",
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
    caseLabel: "Case 06",
    title: "Chip Count",
    outcome: "Real-time chip tracking concept for live poker tournaments.",
    image: "/projects/chip-count.svg",
    width: 1600,
    height: 1000,
    hasCaseStudy: true,
    role: "Self-directed concept",
    timeline: "2023",
    team: "Solo",
  },
];

/* Real screenshots, once `npm run assets` has run, override the placeholder
   entry for their slug. Components never change; only this merge does. */
export const projects: Project[] = projectSources.map((project) => {
  const asset = assetManifest[project.slug];
  return asset ? { ...project, image: asset.src, srcSet: asset.srcSet, width: asset.width, height: asset.height } : project;
});

/* /work is a drawer. Six manila folders tucked one behind the next, and at the
   front the folder the whole set is filed behind — which is the only copy the
   page needs that is not a project, everything else on it being the projects
   themselves.

   The headline is split in two because the front folder sets it as two lines
   and a line break is a typographic decision, not a string. */
export const work = {
  headline: "Six cases.",
  headlineSub: "Problem, trade-offs, outcome.",
  line: "Event tech, Web3, and marketplaces — three years of it, and 100K+ people using what shipped.",

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

/* The featured project on the desk. */
export const featured = projects[0];

/* The manifesto card's headline, composed in three parts — <name> <verb>
   <subject> — so the weight mix (bold name, plain verb, underlined subject) is
   copy rather than markup. The subject is a live link to what it names. */
export const headline = {
  verb: "is designing",
  subject: featured.title,
  href: projectHref(featured),
};

/* Case study scaffolding. Real copy comes from the C1 interview — until then
   every section renders as a visible placeholder, never as finished prose. */
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
];

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
    placeholder:
      "2–3 sentences: India → Hamburg. Where I grew up, and the path that ended in Germany.",
  },
  {
    label: "What I used to do",
    placeholder:
      "The jobs before design. What you did first, and how it pointed you here.",
  },
  {
    label: "What I do now",
    runs: [
      { t: "text", v: "Product and UX designer. I've shaped product at " },
      { t: "link", v: "Evmet", href: "/work/evmet" },
      { t: "text", v: ", " },
      { t: "link", v: "Truts", href: "/work/truts" },
      { t: "text", v: ", and " },
      { t: "link", v: "Dehidden", href: "/work/dehidden" },
      { t: "text", v: " — event tech, Web3, and NFTs. Structure first, then speed, then story." },
    ],
  },
  {
    label: "Where I'm at now",
    runs: [
      { t: "text", v: "Based in Hamburg. When I'm not working " },
      { t: "hint", v: "[ placeholder: what you do — walks along the Elbe, photography, cooking ]" },
      { t: "text", v: "." },
    ],
    aside: "↳ still adjusting to the winters",
  },
  {
    label: "What I'm looking for",
    runs: [
      { t: "text", v: "A product or UX design role on a team that ships. " },
      { t: "hint", v: "[ placeholder: state the role plainly — seniority, product type, remote/Hamburg ]" },
    ],
  },
];

export const about = {
  heading: "What I'm about.",
  glyph: "⌘",
  sections: aboutSections,
};
