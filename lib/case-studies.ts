/* The written case studies, one entry per project slug.

   Source of truth is casestudies.md at the repo root — the long-form document
   Abhishek writes in. This file is that document arranged for the reading
   column: same facts, same claims, cut to the site's voice and typed so the
   page never has to parse prose.

   A project with no entry here still renders: `app/work/[slug]/page.tsx` falls
   back to `caseSections` in lib/content.ts, which is the visible placeholder
   scaffold. So adding the tenth project is one entry in `projects` and a
   later entry here, in either order. */

/** A bullet. `lead` is the bolded run-in the source sets on its stronger
    points; without one the item is a plain line. */
export interface CaseItem {
  lead?: string;
  text: string;
}

/** One image in a figure. `name` is the file under raw/cases/<slug>/, without
    its extension, and the alt is written per image because a row of three
    phone screens is three different screens. */
export interface CaseImage {
  name: string;
  alt: string;
}

/* Blocks rather than markdown: the copy carries no syntax, the page carries no
   parser, and a mis-typed asterisk can never reach the screen. */
export type CaseBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: CaseItem[] }
  /** Numbered, for the handful of places where sequence is the point. */
  | { kind: "steps"; items: CaseItem[] }
  /** A research question or a tester's words, set apart from the argument. */
  | { kind: "quote"; text: string }
  /** One landscape shot at the column's width, or two or three phone screens
      side by side. The page only draws the images the pipeline has produced,
      so a figure whose source is not shot yet costs nothing on screen. */
  | { kind: "figure"; images: CaseImage[]; caption?: string };

export interface CaseStudySection {
  label: string;
  blocks: CaseBlock[];
}

export interface CaseStudy {
  /** Sits under the title, in place of the tile's one-line outcome. */
  lead: string;
  /** Set apart above the first section. Today only Kolsetu has one: what is
      missing from the page, and why, said before anyone wonders. */
  note?: string;
  sections: CaseStudySection[];
}

export const caseStudies: Record<string, CaseStudy> = {
  /* ------------------------------------------------------------------ */
  kolsetu: {
    lead:
      "Elba, Kolsetu's agentic Voice AI platform for insurance, healthcare, and finance — where the interface has almost no visual affordances and the person configuring it is personally accountable for what it says.",
    note:
      "This case study contains no product screenshots, dashboard captures, or client-facing work samples. The Elba interface, its customer deployments, and the internal documentation are all under NDA. What follows is the problem space, the process, and the outcomes only. I'm happy to walk through the thinking in more depth in conversation, within the limits of that agreement.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Elba is a multi-channel agentic AI platform. A single configured agent answers a phone call, holds a WhatsApp voice conversation, replies in web chat, and follows up over SMS or email. On the operations side it books and reschedules appointments, runs bulk outbound campaigns, reads from a customer knowledge base, and triggers post-call automations. Behind all of it sits a workflow builder and an admin dashboard covering user management, workflow management, deployments, call history, and daily reporting.",
          },
          {
            kind: "p",
            text: "I joined as the only designer on the team. No design partner, no established system, no research backlog to inherit. Everything from problem framing to developer handoff sat with me, which made the job as much about deciding what not to design as about shipping screens.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "Voice AI is a design problem disguised as an engineering problem. Two distinct user groups collide inside the same product.",
          },
          {
            kind: "p",
            text: "The first is the buyer and operator: an operations lead or practice manager at a regulated business who has to configure an AI agent that will speak to their customers unsupervised. These are not technical users. They are, however, accountable for what the agent says. Compliance is not a nice-to-have in insurance or healthcare, and ambiguity in an interface translates directly into risk the customer will not accept.",
          },
          {
            kind: "p",
            text: "The second is the end caller, who never sees an interface at all. They hear a voice. Every affordance a screen normally provides — hierarchy, undo, progress, error recovery — has to be carried by the conversation itself.",
          },
          {
            kind: "p",
            text: "Working directly with early customers and internal stakeholders during rollout, the same themes kept surfacing:",
          },
          {
            kind: "list",
            items: [
              { text: "Operators would not go live until they could clearly see what the agent would and would not do" },
              { text: "Setup complexity, not model quality, was the real barrier to activation" },
              { text: "Callers abandoned when the agent failed silently, but tolerated failure that was acknowledged and redirected" },
              { text: "Enterprise buyers evaluated the configuration dashboard as a proxy for whether the underlying system was trustworthy" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          {
            kind: "p",
            text: "The strategic decision was to treat onboarding as the product surface that mattered most. A voice agent that works perfectly but never gets configured has zero value.",
          },
          {
            kind: "list",
            items: [
              {
                lead: "Staged self-serve onboarding",
                text: "Enterprise onboarding translated into four discrete stages, so operators could see where they were, what was left, and what each step committed them to. Validated as prototypes before development, covering signup, guided configuration, and the go-live journey.",
              },
              {
                lead: "No-code workflow configuration",
                text: "Complex automation logic reframed into a configuration experience non-technical operators could complete without engineering support, reducing manual setup effort.",
              },
              {
                lead: "Conversation and fallback design",
                text: "Discoverability patterns for what the agent can do, confidence signals for when it is unsure, and recovery states for when it fails. The principle: a graceful handoff beats a confident wrong answer, particularly in regulated contexts.",
              },
              {
                lead: "Trust-focused interface states",
                text: "Multi-step processes always show system status, what has been saved, and what happens next — because in this domain uncertainty reads as risk.",
              },
              {
                lead: "A design system mapped to code",
                text: "A scalable Figma system with reusable components, WCAG-aligned patterns, and design tokens mapped one to one to the React and Tailwind implementation. Onboarding stages were handed off as production-ready component specs with prop-based APIs rather than static screens.",
              },
            ],
          },
          {
            kind: "p",
            text: "Beyond product, I contributed to the go-to-market motion during early rollout: client-facing marketing collateral, a product booklet for prospects, LinkedIn campaign material, webinar assets, and email marketing to support initial customer traction.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Design-to-development velocity improved by roughly 30 percent after the design system and token mapping landed, driven by component reviews and handoff documentation adopted across engineering" },
              { text: "Self-serve onboarding reduced the manual effort required for customers to launch automation workflows" },
              { text: "The platform went live with real customers in the Hamburg market during my time on the team" },
              { text: "Design standards, patterns, and handoff documentation were established from zero and adopted by the product team" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Elba taught me how to design for an interface you cannot see. Voice removes almost every convention a product designer leans on, so the work becomes expectation setting, confidence signalling, and recovery rather than layout.",
          },
          {
            kind: "p",
            text: "It also taught me the difference between designing for a user and designing for an accountable user. In regulated industries the person configuring the system is putting their own professional judgment on the line, and the interface has to earn that.",
          },
          {
            kind: "p",
            text: "Working as the only designer sharpened my prioritisation more than any process could. With no team to absorb overflow, the only viable strategy was to be ruthless about which problems actually blocked activation.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  substrac: {
    lead:
      "An MA thesis that started as a subscription tracker and finished as a decision support system. That shift is the whole story of the project.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Substrac is a mobile subscription management product that finds recurring charges scattered across a user's email, makes their real cost visible, and turns that visibility into a decision.",
          },
          {
            kind: "p",
            text: "I owned every part of it: framing the research question, running interviews and a survey, reviewing the behavioural finance literature, benchmarking competitors, modelling the information architecture, designing the full screen set and design system, and specifying the email ingestion pipeline, data model, and privacy controls that would make the concept technically real. Supervised by Professor Hessam Mosharraf and submitted with distinction.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "Subscriptions run in the background. Users cannot easily reconstruct what a payment covers, how much they are paying, or when a period ends. Even digitally confident users have to combine email confirmations, banking app entries, and app store pages across personal accounts, work accounts, family plans, multiple payment methods, and sometimes multiple currencies. The result is an administrative chore rather than financial discipline.",
          },
          { kind: "p", text: "I framed the enquiry around one primary research question:" },
          {
            kind: "quote",
            text: "How can a unified visualisation and decision experience for subscription data improve financial clarity and reduce passive recurring spend for digitally active users?",
          },
          {
            kind: "p",
            text: "Supporting questions covered how people currently discover and interpret fragmented recurring charges, how AI-assisted email detection can identify subscriptions while preserving trust and user autonomy, which interaction patterns actually reduce cognitive load in a subscription dashboard, and how the product could offer real options without nudging people manipulatively.",
          },
          { kind: "p", text: "Methods:" },
          {
            kind: "list",
            items: [
              {
                lead: "Literature review",
                text: "Across subscription behaviour and behavioural finance, cognitive load and financial visualisation, the subscription lifecycle of habit, fit and friction, biases at the money-to-interface boundary, and personal informatics.",
              },
              { lead: "Semi-structured interviews", text: "With thematic analysis." },
              {
                lead: "Online survey",
                text: "Across four assessment points: subscription footprint, current tracking behaviours, attitudes and pain signals, and product demand and trust.",
              },
              { lead: "Diary snippets", text: "Capturing real review moments." },
              {
                lead: "Competitor and pattern analysis",
                text: "Benchmarking Chargeback for concierge-style cancellation and speed framing, Subo for privacy-first tracking and a calm UI, and YNAB as the prime competitor for behaviour change through planning.",
              },
            ],
          },
          { kind: "p", text: "What came back:" },
          {
            kind: "list",
            items: [
              { text: "The barrier is not finding numbers. Subscriptions stay invisible because auto-renewal, fragmented billing cycles, and low-salience monthly charges hide them inside ordinary life" },
              { text: "Action requires three things at once — awareness, confidence, and the right moment. Most products deliver only the first" },
              { text: "One interview participant managing more than 20 personal and 30 business subscriptions, already using YNAB, reported 90 to 95 percent confidence in his monthly payments. His problems were time, trial enforcement, and unexpected system behaviour, not awareness. Expert users hit a different wall than novices" },
              { text: "The audience was broader than assumed. Alongside students and early-career professionals on constrained budgets and freelancers who accumulate per-project tool stacks, senior citizens emerged as a group with hidden subscriptions and genuine uncertainty about what is still active" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          { kind: "p", text: "Five turning points shaped the product:" },
          {
            kind: "steps",
            items: [
              { lead: "Expanding the ideal user profile", text: "To include senior citizens, which changed clarity and language requirements throughout." },
              { lead: "Treating the literature review as product logic", text: "Not academic decoration, so behavioural findings drove feature decisions." },
              { lead: "Shifting from tracking to decision support", text: "After qualitative synthesis showed centralisation alone does not change behaviour." },
              { lead: "Validating priorities through survey signals", text: "Rather than designer intuition." },
              { lead: "Reshaping the information architecture", text: "After lo-fi wireframe feedback." },
            ],
          },
          { kind: "p", text: "The IA settled into three top-level areas:" },
          {
            kind: "list",
            items: [
              { lead: "Overview", text: "Real-time monthly and yearly spend, active subscription count, and the evaluation moments that matter — upcoming renewals, trial expiries, price changes." },
              { lead: "Subscriptions", text: "A searchable database filtered by category, frequency, and status, separating trial from active and work from personal." },
              { lead: "Insights", text: "Patterns over time that support reflection and maintain the review habit." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "dashboard", alt: "Substrac dashboard: monthly and yearly spend, active subscription count, up next renewals, and the subscription list" },
              { name: "subscriptions", alt: "Substrac subscriptions list with Netflix, Spotify, and Disney+, each with Manage and Remove" },
              { name: "insights", alt: "Substrac insights: monthly spend, active subscriptions, yearly spend, and a categorical spending chart" },
            ],
            caption: "The three areas as built: Overview, Subscriptions, Insights.",
          },
          {
            kind: "p",
            text: "Core flows were designed end to end: trust-first onboarding and email connection, the first scan and its initial value delivery, the routine dashboard check-in, subscription detail and decision-making, management through both automatic and manual paths, and ongoing trust and data management.",
          },
          {
            kind: "figure",
            images: [
              { name: "get-started", alt: "Substrac get started screen: Built for peace of mind, find, track, cancel, save" },
              { name: "grant-permissions", alt: "Substrac grant permissions screen asking to read subscription emails and send notifications, with a data-is-secure note" },
              { name: "analysing", alt: "Substrac analysing screen scanning the inbox, with the first find: Netflix for 9.99 a month" },
            ],
            caption: "Trust first: what the app is asking to read, why, and what it found.",
          },
          { kind: "p", text: "Design principles:" },
          {
            kind: "list",
            items: [
              { lead: "Progressive disclosure", text: "To keep cognitive load low while preserving depth." },
              { lead: "Decision-oriented, not browse-oriented", text: "Every surface ends in a real option: keep, downgrade, cancel, pause, or set a reminder." },
              { lead: "Non-manipulative by design", text: "Options are presented without dark patterns, with data access, privacy, and user autonomy treated as design constraints rather than legal footnotes." },
              { lead: "Visual hierarchy and storytelling", text: "To turn raw financial data into something a person can actually read." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "subscription-detail", alt: "Substrac subscription detail for Netflix: plan, price, status, next bill, category, and a reminder" },
              { name: "notification", alt: "An iPhone lock screen with a Substrac notification: Haven't watched Netflix in 30 days? Consider keeping your subscription" },
              { name: "explore-apps", alt: "Substrac explore apps screen listing Cursor, Claude, and Perplexity free trials to claim" },
            ],
            caption: "Every surface ends in a decision: a subscription's detail, a nudge on the lock screen, and Explore.",
          },
          {
            kind: "p",
            text: "Execution covered the full screen set — splash and getting started, email connection, permission granting, profile creation, the scanning state, the dashboard, the subscription list with category filters, add and edit flows for both paid and trial apps, subscription detail, manual category-based entry, and profile and settings. I built the supporting design system with a defined colour palette and reusable UI components, and specified the technical foundation: email ingestion and subscription extraction, the data model, privacy-by-design and security controls, a performance and scaling strategy, and a future roadmap with explicit boundaries.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Submitted as an MA thesis and graded with distinction" },
              { text: "Delivered as a complete research-to-prototype package, including a product requirements document, survey results, and an APA bibliography supporting every product decision" },
              { text: "Evaluation criteria were defined in behavioural rather than aesthetic terms: reduction in active subscriptions, realised cost savings, cancellation success rate, decision time, and sustained monthly review habit" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Substrac forced me to hold research and product craft in the same hand. The most useful lesson was that I was solving the wrong problem for the first third of the project. Building a beautiful subscription list would have satisfied the brief and changed nothing. The moment the product became about decisions rather than data, every design question got easier to answer.",
          },
          {
            kind: "p",
            text: "Defining success as measurable behaviour change, and then having to defend that definition academically, is a discipline I now bring to commercial work.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  stampp: {
    lead:
      "An iOS app that engraves your photos into vintage postage stamps — and then makes the album, not the stamp, the reason to come back.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Stampp takes a photo you shot, engraves it in a single ink, and composes it into a finished postage stamp with period-accurate borders, typography, and postmarks. Those stamps collect into albums, so a trip to Kyoto becomes a series rather than a folder of unsorted images.",
          },
          {
            kind: "p",
            text: "I owned the product end to end: the concept and positioning, the full design system, every screen, the AI pipeline specification, and the developer handoff. The build was done solo, vibe-coding with Claude.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "The starting point was a technique, not a product, and that was the problem. An AI ink engraving of a photo is a lovely one-off. It is also a photo filter, and photo filters have a short half-life. People try one, share one, and never open the app again.",
          },
          {
            kind: "p",
            text: "The reframe came from asking what makes people return. Filters do not have a retention loop. Collections do. Passport stamps, philately, and trading cards all work on the same mechanic: a thing you own becomes more meaningful because of the set it belongs to and the gap in that set.",
          },
          {
            kind: "list",
            items: [
              { lead: "The album is the unit of value, not the stamp", text: "A single stamp is a nice image. Four stamps titled “Kyoto, November” is an artefact." },
              { lead: "The album page is the social share unit", text: "People do not share a filter output twice, but they will share a completed set." },
              { lead: "Proof of presence gives a stamp weight", text: "A stamp tied to where and when you actually were is closer to a passport mark than to an Instagram post." },
              { lead: "AI latency is a design problem", text: "Generation takes up to two minutes, which is an eternity in mobile UX and cannot be hidden behind a spinner and hope." },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          {
            kind: "p",
            text: "The design language is drawn from postal ephemera rather than app conventions: warm paper-cream backgrounds, a serif wordmark against uppercase letterpress labels, perforated dotted dividers used as a repeated structural motif, and paper grain across surfaces. Four ink families — Terracotta, Forest, Indigo, and Sepia — act as both an aesthetic choice and an organising system, so each collection carries an ink badge and ink becomes a visual index rather than decoration.",
          },
          { kind: "p", text: "The screen set covers the full loop:" },
          {
            kind: "list",
            items: [
              { lead: "Entry", text: "Sign In and Sign Up." },
              { lead: "Home", text: "A collections grid showing each album's cover stamp, ink badge, and stamp count, plus a persistent New Collection card so starting a set is never more than one tap away. A Stamp Passport variant presents the collection as a single postcard artefact." },
              { lead: "Create, Upload", text: "Camera or library entry, framed with the line “Frame what caught your eye” to set an intentional, compositional tone rather than a casual snapshot one." },
              { lead: "Create, Configure", text: "Ink family selection, frame theme selection from series such as the Japanese Imperial Archive and the Explorer's Passport — each described by its actual references, Meiji-era postal aesthetics or colonial cartography — and stamp metadata covering subject, series, location, and year." },
              { lead: "Create, Generating", text: "An honest wait state that says what the system is doing and states plainly that it may take up to two minutes." },
              { lead: "Create, Result", text: "The finished stamp, a save-to-collection picker, and a Try Again path." },
              { lead: "Stamps Gallery and Collection Detail", text: "Every stamp across all collections with subject and location, and the album view with its ink treatment and stamp count." },
              { lead: "Stamp Detail", text: "Full provenance — subject, series, location, year, ink, and frame — with download and share actions." },
              { lead: "Profile", text: "Archive stats covering collections and total stamps." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "passport", alt: "Stampp Stamp Passport: a collection presented as a single postcard with six stamps" },
              { name: "collections", alt: "Stampp My Collections grid: All Stamps in terracotta, Holidays in sepia, and a New Collection card" },
              { name: "map", alt: "Stampp Stamps Map: stamps pinned across Europe where the photos were taken" },
            ],
            caption: "Home, three ways: the Stamp Passport, the collections grid, and the map.",
          },
          {
            kind: "figure",
            images: [
              { name: "capture", alt: "Stampp capture screen: Frame what caught your eye, with Take Photo and Choose from Library" },
              { name: "frame", alt: "Stampp frame screen: a photo of a road under a cloudy sky inside a 2:3 stamp frame" },
              { name: "ink-details", alt: "Stampp ink and details: four ink families, the Japanese Imperial Archive and Explorer's Passport themes, and stamp metadata" },
            ],
            caption: "Create: capture, frame, then ink, theme, and the metadata that gives the stamp its provenance.",
          },
          { kind: "p", text: "Key design decisions:" },
          {
            kind: "list",
            items: [
              { lead: "Metadata as narrative", text: "Subject, series, location, and year are not admin fields, they are what turns an image into a catalogued object with provenance. The detail screen is deliberately structured like a philatelic record." },
              { lead: "A confirmation step between pipeline stages", text: "The two-stage pipeline moves from photo to single-ink engraving, then composites that engraving into a themed stamp. Keeping a confirmation after stage one prevents wasted generation calls and gives the user a checkpoint instead of a black box." },
              { lead: "Theme packs as configuration, not code", text: "Each frame theme is a prompt config, so adding a new one is a config change rather than a rebuild. Any ink family can combine with any theme pack." },
              { lead: "Create as the centre of gravity", text: "The circular Create action sits in the middle of the bottom navigation, elevated above the flat icons on either side." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "generating", alt: "Stampp generating screen: Creating your stamp, AI is engraving your photo in your chosen ink, with a did-you-know about first day covers" },
              { name: "result", alt: "Stampp result: the finished Tallinn Airport stamp in terracotta, with Holidays, Home, and New Collection to save to" },
            ],
            caption: "The honest wait, and the finished stamp with its save-to-collection picker.",
          },
          { kind: "p", text: "Technical specification and handoff:" },
          {
            kind: "list",
            items: [
              { text: "A two-stage GPT Image 2 pipeline, with stage one and stage two kept as separate swappable prompt functions" },
              { text: "IndexedDB storage for v1 with no auth, keeping the first version shippable" },
              { text: "A single responsive codebase rather than separate native and web builds" },
              { text: "The native capture=\"environment\" file input pattern instead of a custom camera UI" },
              { text: "A CLAUDE.md developer handoff document containing the data model, API contract, prompt builder functions with their colour values, a screen inventory with mobile and desktop deltas, and eleven numbered build milestones, alongside a master build plan" },
            ],
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Shipped as a working iOS app, designed and built solo" },
              { text: "A complete design system spanning typographic pairings, four ink families, and paper and perforation motifs, applied consistently across the full screen set" },
              { text: "A generation architecture that supports new theme packs without engineering work" },
              { text: "A documented handoff that made a solo design-to-code build tractable" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Stampp is the project where I learned that positioning is a design decision. The screens barely changed when the product went from photo filter to collecting game, but the reason to open the app changed completely — and that reframe came from questioning my own concept rather than polishing it.",
          },
          {
            kind: "p",
            text: "It also taught me a lot about designing around AI constraints instead of pretending they do not exist. A two-minute generation is not something you hide, it is something you narrate.",
          },
          {
            kind: "p",
            text: "Building it end to end, from Figma through to shipped code, closed the loop between what I specify and what actually survives implementation.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  jobtrac: {
    lead:
      "A job search command center: AI-tailored resumes and cover letters, ATS scoring built on parser research, and Gmail sync that updates a status without being asked.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Jobtrac is a full-stack job application management platform I designed and built to streamline the chaotic process of job hunting. It addresses three critical pain points: tracking applications across multiple platforms, creating tailored application documents, and staying on top of email responses.",
          },
          {
            kind: "p",
            text: "I was responsible for the entire product lifecycle — research, architecture, UI/UX design, and implementation — from database schema design through to AI prompt engineering for ATS-optimised document generation.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "Job searching is fundamentally broken. Candidates juggle spreadsheets, multiple job boards, and endless email threads, which leads to missed deadlines, generic applications, and opportunities lost in a sea of browser tabs.",
          },
          {
            kind: "p",
            text: "To validate the problem I worked from three sources: my own job search, tracked across 50+ applications; industry research into ATS parsing behaviour from Textkernel, DaXtra, and major European platforms; and the complaints job seekers make repeatedly about tracking and document tailoring.",
          },
          {
            kind: "list",
            items: [
              { text: "More than 70 percent of resumes are filtered out by an ATS before reaching a human reviewer" },
              { text: "Job seekers apply to 20 to 50+ roles on average, which makes manual tracking nearly impossible" },
              { text: "Recruiter Boolean searches, not hidden scores, determine shortlisting — so keyword optimisation is the lever that matters" },
              { text: "Email responses, rejections and interview invites alike, get buried in inboxes, leaving every status update manual" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          {
            kind: "p",
            text: "I mapped four distinct journeys across the job search lifecycle: onboarding into target role keywords, tracking opportunities through pipeline stages, generating documents per role, and syncing email so that status looks after itself.",
          },
          {
            kind: "list",
            items: [
              { lead: "Dashboard with pipeline visibility", text: "Filter by status (Yet to Apply, Applied, Interview, Offer, Rejected), by platform (LinkedIn, StepStone, Indeed), and by full-text search." },
              { lead: "ATS scoring engine", text: "Real-time resume compatibility scoring based on reverse-engineered parsing research across Greenhouse, Workday, and SAP SuccessFactors." },
              { lead: "AI document generation", text: "Cover letters and resume suggestions tailored to each job description, with keyword injection." },
              { lead: "Gmail integration", text: "OAuth-secured read-only sync with intelligent email classification for interview invites, rejections, and assessments." },
              { lead: "One-click export", text: "DOCX download, for maximum ATS compatibility." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "dashboard", alt: "Jobtrac dashboard — 258 jobs in the pipeline, 45 yet to apply and 43 rejected, listed with company, fit score, platform, and status" },
            ],
            caption: "The dashboard: 258 jobs in the pipeline, each with a fit score, filtered by status and platform.",
          },
          {
            kind: "figure",
            images: [
              { name: "ats-analysis", alt: "ATS analysis for a Junior UX/UI Designer posting — 66.5 out of 100, a partial match, with required, preferred, and culture keyword counts and a gap report of 14 issues" },
            ],
            caption: "ATS analysis for one posting: the score, what it is made of, and a gap report that says which keyword to add where.",
          },
          { kind: "p", text: "Underneath it:" },
          {
            kind: "list",
            items: [
              { text: "Next.js 16 App Router with Server Actions for seamless form handling" },
              { text: "Prisma ORM and PostgreSQL on Neon, for type-safe data modelling with serverless pooling" },
              { text: "Auth.js (NextAuth v5) with Google OAuth and encrypted token storage" },
              { text: "The OpenAI Responses API with structured outputs (JSON schema) for reliable generation" },
              { text: "800+ lines of ATS optimisation rules derived from research on European ATS platforms" },
              { text: "Zod validation across every user input and AI output" },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "resume-suggestions", alt: "Resume Suggestions for a German job posting — the original summary and skill buckets beside a suggested rewrite in German, ATS 66 to 73" },
            ],
            caption: "Resume suggestions per job — original beside suggested, in the posting's language, applied without touching the master resume.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "ATS scoring provides immediate, actionable feedback on format, keywords, and section headings" },
              { text: "Document generation reduces application prep time from hours to minutes" },
              { text: "Gmail sync updates job status from email signals, with no manual tracking required" },
              { text: "A structured resume editor keeps formatting consistent enough to parse correctly across all the major ATS" },
              { text: "Production-ready authentication with GDPR-compliant OAuth token handling, end-to-end type safety from database to UI, daily usage quotas to manage API costs, and test coverage over AI classification and email linking" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Jobtrac sharpened my ability to build complex, multi-system applications that balance AI capability against practical UX needs. The hard part was translating dense technical research — ATS parsing behaviour, EU AI Act compliance — into user-facing features that feel simple.",
          },
          {
            kind: "p",
            text: "It reinforced that the best AI integrations don't replace user agency. They amplify it, with real-time feedback and intelligent defaults.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  evmet: {
    lead:
      "A live event management platform: an admin dashboard for organisers, and a companion app where attendees earn XP for turning up to the right things.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Evmet streamlines operations for organisers and sharpens real-time engagement for attendees and exhibitors. I was responsible for designing the full product suite: an admin dashboard for internal use, and a companion app for attendees to track schedules, complete tasks, and earn XP through engagement.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "As conferences moved to hybrid and tech-focused formats, traditional coordination tools became the bottleneck. Organisers were juggling WhatsApp groups, spreadsheets, and email threads, which led to inefficient booth assignment, delayed updates, and a poor attendee experience.",
          },
          {
            kind: "p",
            text: "To validate the problem I interviewed four event organisers, three exhibitors from startup expos, and six past attendees of tech events.",
          },
          {
            kind: "list",
            items: [
              { text: "Organisers lost time to manual booth management" },
              { text: "Exhibitors lacked tools to track leads or read real-time interest" },
              { text: "Attendees missed important updates because the communication system could not carry them" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          { kind: "p", text: "I mapped three user journeys with genuinely divergent needs:" },
          {
            kind: "steps",
            items: [
              { lead: "Organisers", text: "Needed admin-level control over booth assignments and analytics." },
              { lead: "Exhibitors", text: "Needed visibility on setup, leads, and traffic." },
              { lead: "Attendees", text: "Needed a smooth, engaging way to view the agenda, complete tasks, and receive updates." },
            ],
          },
          {
            kind: "list",
            items: [
              { text: "Visual booth mapping for organisers" },
              { text: "An XP-based task system for attendees, in the mobile app" },
              { text: "A notification hub and dynamic agenda shared by all three groups" },
              { text: "One design system and component library across web and mobile" },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "event-page", alt: "Evmet event page on web for ETH India, with a gradient cover, Interested and Going buttons, and date and venue" },
            ],
            caption: "The event page on web: one cover, two calls to action, and the details a visitor actually needs.",
          },
          {
            kind: "figure",
            images: [
              { name: "admin-dashboard", alt: "Evmet admin dashboard listing exhibitors with category, missions, offerings, and status toggles" },
            ],
            caption: "The organiser's side: exhibitors, missions, offerings, and awards in one admin dashboard.",
          },
          {
            kind: "p",
            text: "Execution: detailed wireflows for each user, interactive mockups prototyped in Figma, key journeys validated with stakeholder feedback, and handoff to developers with full documentation and interactive specs.",
          },
          {
            kind: "figure",
            images: [
              { name: "components", alt: "Evmet component library — event cards, agenda rows, status chips, city tags, and the icon set" },
            ],
            caption: "The shared component library across web and mobile: event cards, agenda rows, status chips, icons.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Piloted successfully at a regional tech conference" },
              { text: "Over 70 percent of attendees used the XP task system" },
              { text: "Organisers reported a 40 percent reduction in manual coordination time" },
              { text: "Exhibitors singled out the clarity and professionalism of their digital booth experience" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Evmet sharpened my ability to manage multi-user systems with diverging needs. I learned how to reduce friction at both the strategic level, event planning, and the micro level, a single task interaction.",
          },
          {
            kind: "p",
            text: "It also reinforced the importance of fast feedback loops in a fast-moving environment like a live event — and how much smart UX can turn chaos into clarity.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  truts: {
    lead:
      "Seven interconnected Web3 products, 100K+ users, one designer — and a UX system built so the features stopped being designed in silos.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Truts is a Web3-native community platform designed to help users discover, engage with, and earn from DAOs and decentralised projects. As the sole designer I led the UX and UI strategy across seven interconnected modules serving over 100,000 users. The goal was to unify fragmented product features into a cohesive, scalable experience, adaptable across communities, devices, and Web3 user types.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "As Truts scaled, the platform lacked a centralised UX system. Each feature, from missions to NFT rewards, was being developed in a silo, which caused major usability gaps. New users often dropped off after connecting their wallets because navigation and feedback were unclear. Community managers needed better tools to manage XP systems. Mobile-first users were struggling with desktop-centric flows.",
          },
          {
            kind: "p",
            text: "To understand these problems I ran qualitative interviews with core contributors from 10+ DAOs, with power users and community managers, and with wallet-connected newcomers who had limited Web3 experience.",
          },
          {
            kind: "list",
            items: [
              { text: "First-time users were unsure what to do next after wallet connect" },
              { text: "Admins lacked data views for managing tasks and XP assignments" },
              { text: "Mobile use was dominant, but the tools weren't optimised responsively" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          {
            kind: "p",
            text: "I designed a modular product ecosystem, each sub-product sharing one navigation system, visual identity, and component set:",
          },
          {
            kind: "list",
            items: [
              { lead: "Missions", text: "The task-based reward system." },
              { lead: "Communities", text: "DAO-specific landing and onboarding." },
              { lead: "Profiles", text: "NFT and XP tracking." },
              { lead: "Dashboard", text: "Admin analytics for community leads." },
              { lead: "Offerings", text: "Claimable perks." },
              { lead: "Academy", text: "The education and earning hub." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "mission-flow", alt: "Flow diagram breaking a Truts mission into steps: wallet or Gmail entry, success and XP, then Discord and Twitter connect" },
            ],
            caption: "A mission broken into steps, from wallet or Gmail entry through to connecting Discord and Twitter.",
          },
          { kind: "p", text: "Execution:" },
          {
            kind: "list",
            items: [
              { text: "Low-to-high fidelity wireframes in Figma for every module" },
              { text: "Scalable user flows, from wallet connect through task to claim" },
              { text: "A reusable Figma component system, built and maintained" },
              { text: "Developer collaboration through Notion-based documentation, interaction videos, and real-time syncs" },
              { text: "Usability testing via Maze, iterating on feedback from interns and early users" },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "wireframes", alt: "Low-fidelity wireframes for a Truts listing page and a detail page with a trending row" },
            ],
            caption: "Low-fidelity wireframes for the community listing and detail pages.",
          },
          {
            kind: "figure",
            images: [
              { name: "component-states", alt: "Button states, search bars, status cards, and selection bubbles from the Truts component system" },
            ],
            caption: "Button states, search bars, and selection bubbles from the component system.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Truts scaled to 100K+ users across 40+ DAO communities" },
              { text: "Onboarding drop-offs decreased significantly after the flow restructuring" },
              { text: "Reusable components reduced design-to-dev turnaround by roughly 30 percent" },
              { text: "The documentation was used to onboard three international design interns and new developers" },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "search-missions", alt: "Truts search dropdown showing communities and missions results over the Missions landing page" },
            ],
            caption: "One search across communities, user profiles, and missions.",
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Truts gave me full ownership over a multi-product Web3 ecosystem. I learned to balance complexity with clarity, and experimentation with system logic. It pushed me to think at scale — not just in design, but in how people interact, earn, and navigate across decentralised experiences.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  dehidden: {
    lead:
      "NFT campaign UX for Polygon, Coinbase, Mercedes, and Bacardi — designed mostly for someone standing at a festival with a phone and no wallet.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Dehidden is a Web3 campaign studio that builds NFT-driven experiences for global brands. I was responsible for designing mobile-first UX flows and branded visuals that connected physical experiences — festivals, campus tours, QR activations — with real-time blockchain rewards.",
          },
          {
            kind: "p",
            text: "I worked across multiple high-pressure campaigns where every interaction had to be simple, trust-building, and visually on-brand.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "Each campaign came with unique brand objectives, but the UX challenges repeated: how do we onboard non-crypto users seamlessly, how do we build trust in Web3 processes through design, and how do we balance aesthetics and performance on tight timelines.",
          },
          {
            kind: "p",
            text: "To solve this I collaborated directly with brand stakeholders, ran quick user interviews with attendees and community managers, made competitive UX scans of past phygital and NFT drops, and sat in technical syncs with developers to understand wallet logic and claim mechanics.",
          },
          {
            kind: "list",
            items: [
              { text: "Over 90 percent of traffic came from mobile and QR scans" },
              { text: "First-time users preferred claim flows that did not demand a wallet upfront" },
              { text: "Visually clear, fast feedback screens reduced drop-offs drastically" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          { kind: "p", text: "I led the design of interaction flows and modular systems for campaigns including:" },
          {
            kind: "list",
            items: [
              { lead: "Let It Snow (Polygon)", text: "A QR-to-mint flow from snow globe installations." },
              { lead: "Coinbase Campus", text: "NFT rewards for student onboarding tasks." },
              { lead: "NH7 Bacardi", text: "Wristband-activated NFT art claims during live events." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "polygon-studios-ethdenver", alt: "Let It Snow mobile screens for Polygon Studios at ETHDenver 2022: connect wallet, project details, and a minted exhibit" },
            ],
            caption: "Let It Snow at ETHDenver 2022: from the snow globe's QR code to a minted exhibit.",
          },
          {
            kind: "figure",
            images: [
              { name: "coinbase-polygon", alt: "Coinbase Wallet and Polygon campaign screens: connect your wallet, mint your NFT, and the FAQ" },
            ],
            caption: "Coinbase Wallet × Polygon: connect, mint, and the FAQ that answers where the NFT went.",
          },
          {
            kind: "figure",
            images: [
              { name: "edao-nh7", alt: "eDAO NH7 drop screens for Bacardi: registration, wallet setup, the tasks to claim, and the Voilà confirmation" },
            ],
            caption: "The eDAO NH7 drop: registration, wallet setup, the tasks, and the Voilà.",
          },
          { kind: "p", text: "The approach:" },
          {
            kind: "list",
            items: [
              { text: "Responsive three-to-five-second flows with brand-aligned visuals" },
              { text: "Illustration-based onboarding for wallet connect and mint confirmations" },
              { text: "Component libraries for the states that decide whether people trust the thing: Claimed, Mint Failed, Mint In Progress" },
              { text: "Hands-on work with developers, keeping smart contract behaviour and UI behaviour in sync" },
            ],
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Over 50,000 NFTs claimed across campaigns" },
              { text: "A 45 percent reduction in abandonment after the onboarding improvements" },
              { text: "Campaigns featured on-stage and online by Coinbase, Polygon, and Bacardi" },
              { text: "A visual language for Web3 that reads as welcoming rather than intimidating" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Dehidden taught me how to blend emotional storytelling with technical clarity. These projects sharpened my speed, adaptability, and design communication under rapid timelines, all while maintaining brand precision and user empathy.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  "build-up": {
    lead:
      "A concept for connecting homeowners with verified plumbers and electricians — designed for people who own a smartphone and have never used an app like this.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Build Up is a concept UX project focused on a very real, local problem: how to connect homeowners and small businesses with verified blue-collar workers quickly, simply, and without technical barriers. I designed a lightweight, mobile-first experience built for accessibility, visual clarity, and low-tech usability.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "In the absence of formal platforms, most blue-collar hiring happens through WhatsApp groups, posters, and personal referrals. That creates friction: no verified reviews, no skills transparency, and heavy reliance on trust or urgency. Many workers are tech-aware but not app-literate.",
          },
          {
            kind: "p",
            text: "To understand these dynamics I spoke with five homeowners and shop owners, three contractors (an electrician, a painter, a plumber), and two NGO workers supporting urban labour networks.",
          },
          {
            kind: "list",
            items: [
              { text: "Hiring is driven by urgency — “my bathroom's leaking”, not “let me research my options”" },
              { text: "Workers often don't use email or websites, but they do use smartphones" },
              { text: "A platform has to earn trust visually, not through text or ratings alone" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          { kind: "p", text: "I designed two focused user flows." },
          {
            kind: "list",
            items: [
              { lead: "Client side", text: "Input the issue with an urgency tag, view basic verified worker profiles, then book directly and chat in-app." },
              { lead: "Worker side", text: "One-screen profile creation, nearby job notifications, and accept or decline in a single tap." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "find-jobs", alt: "Three Build Up Find Jobs screens: search, a broadcast job on the map with approve and decline, and the job list" },
            ],
            caption: "Find Jobs: broadcast jobs on a map, approved or declined without leaving it.",
          },
          {
            kind: "figure",
            images: [
              { name: "job-details", alt: "Build Up job details screen: budget, experience, applicants, languages, a verified client, and an Apply button" },
            ],
            caption: "Job details: budget, experience, languages, a verified client, and one button.",
          },
          { kind: "p", text: "Design principles:" },
          {
            kind: "list",
            items: [
              { text: "Visual-first, with icons carrying the load and minimal text" },
              { text: "No login required to explore" },
              { text: "Language-aware UX, with simple buttons and explicit confirmations" },
            ],
          },
          {
            kind: "p",
            text: "Execution: task flows mapped in Miro, low-to-high fidelity wireframes in Figma, interactive prototypes, then Maze tests and verbal feedback sessions with four participants.",
          },
          {
            kind: "figure",
            images: [
              { name: "jobs-profile-messages", alt: "Build Up Your Jobs, Profile, and Messages screens for a worker" },
            ],
            caption: "The worker's side: sent proposals, a one-screen profile, and messages.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "80 percent of test users found the system simple and fast" },
              { text: "One local contractor understood the full flow in under two minutes" },
              { text: "A strong positive response to “no login” and icon-based navigation" },
              { text: "Evidence that visual UX carries tech-averse user groups further than copy does" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Build Up challenged me to go beyond polish and think deeply about empathy, literacy, and access. It was a powerful reminder that great UX isn't just smooth — it's inclusive, human-first, and constraint-aware. This project strengthened my confidence in designing for underserved and non-digital-native audiences.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  "chip-count": {
    lead:
      "Live poker without the broadcast delay: chip stacks, eliminations, and rankings you can read in under ten seconds.",
    sections: [
      {
        label: "Overview",
        blocks: [
          {
            kind: "p",
            text: "Chip Count is a personal concept project designed to bring real-time visibility to professional poker tournaments. It lets spectators and commentators track chip stacks, eliminations, and player rankings live, without relying on delayed video streams. My focus was a clear, glanceable, fast interface that visualises the critical moments of a game for fans and analysts.",
          },
        ],
      },
      {
        label: "The problem",
        blocks: [
          {
            kind: "p",
            text: "Poker broadcasts often suffer from delay, poor UX, or no interface at all, which forces fans to rely on memory or cluttered spreadsheets. Casual spectators want clarity. Analysts want speed.",
          },
          {
            kind: "p",
            text: "To understand the best UX patterns for live data I benchmarked Cricbuzz for score clarity, LiveScore for stat layering, and Chess.com for tournament dashboards, then mapped a typical poker game structure against where it breaks down.",
          },
          {
            kind: "list",
            items: [
              { text: "Tables shift frequently; players come and go" },
              { text: "All-ins and bust-outs are the key emotional moments, and the hardest to catch" },
              { text: "No platform shows dynamic chip changes clearly or fast enough" },
            ],
          },
        ],
      },
      {
        label: "What I did",
        blocks: [
          { kind: "p", text: "Three core modules:" },
          {
            kind: "steps",
            items: [
              { lead: "Leaderboard view", text: "Live-ranked players, chip counts, and dynamic sorting with chip-swing highlights." },
              { lead: "Table view", text: "A visual map of seated players, blind positions, and stack indicators." },
              { lead: "Elimination feed", text: "A chronological list of bust-outs, filterable by opponent, table, and bracket." },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "home-states", alt: "Two Chip Count home screens, total earnings tinted red at a loss and green at a profit, with active and recent games" },
            ],
            caption: "Home, in both moods: total earnings tinted by the sign, active games marked live.",
          },
          { kind: "p", text: "Design principles:" },
          {
            kind: "list",
            items: [
              { text: "Dark UI, for data density and contrast" },
              { text: "Glanceability — the key stats readable in under five seconds" },
              { text: "Minimal clicks, and adaptable to mobile and tablet" },
            ],
          },
          {
            kind: "figure",
            images: [
              { name: "profile-games", alt: "Chip Count profile: total winnings against buy-ins, best three games, and the last game played" },
            ],
            caption: "Profile: winnings against buy-ins, the best three games, and the last one played.",
          },
          {
            kind: "p",
            text: "Execution: wireframes for the leaderboard, table layout, and event feed; an interactive Figma prototype simulating chip swings; arrow indicators for gains and bust-outs on animated data cards; and hover interactions with data overlays for desktop users.",
          },
          {
            kind: "figure",
            images: [
              { name: "components", alt: "Chip Count component sheet: player rows, top-up and chip-out sheets, edit and delete dialogs, history, settlement chart, and add players" },
            ],
            caption: "The component set: player rows, top-up and chip-out sheets, history, settlement export.",
          },
        ],
      },
      {
        label: "The outcome",
        blocks: [
          {
            kind: "list",
            items: [
              { text: "Prototype tested with casual fans and poker content creators" },
              { text: "Users could identify the top five players in under ten seconds" },
              { text: "Described as “clearer than most tournament streams”" },
              { text: "One user: “I'd keep this open during every stream.”" },
            ],
          },
        ],
      },
      {
        label: "Reflection",
        blocks: [
          {
            kind: "p",
            text: "Chip Count pushed me to design for live data under pressure. It combined real-time logic, dashboard UX, and data-driven visuals in a compact, accessible interface, and sharpened my skills in clarity-first information design. I'd still like to pitch it to a real tournament broadcaster someday.",
          },
        ],
      },
    ],
  },
};
