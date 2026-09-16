# Abhishek Singh — Case Studies

---

## Kolsetu (Elba) – Designing Trust into an Agentic Voice AI Platform

Elba is an agentic Voice AI platform for regulated enterprises in insurance, healthcare, and financial services. As the sole designer, I owned end-to-end product UX: self-serve onboarding, no-code automation setup, workflow configuration dashboards, and the conversation design patterns for an interface that has almost no visual affordances.

**Date:** September 2025 – January 2026
**Role:** Product Designer (sole designer)
**Company:** Kolsetu GmbH, Hamburg

> **Note on visuals:** This case study contains no product screenshots, dashboard captures, or client-facing work samples. All Elba interface work, customer deployments, and internal documentation remain under NDA. What follows describes the problem space, my process, and the outcomes only. I am happy to walk through the thinking in more depth in conversation, within the limits of that agreement.

### Overview

Elba is a multi-channel agentic AI platform. A single configured agent can answer a phone call, hold a WhatsApp voice conversation, respond in web chat, and follow up over SMS or email. On the operations side it books and reschedules appointments, runs bulk outbound campaigns, reads from a customer knowledge base, and triggers post-call automations. Behind it sits a workflow builder and an admin dashboard covering user management, workflow management, deployments, call history, and daily reporting.

I joined as the only designer on the team. There was no design partner, no established system, and no research backlog to inherit. Everything from problem framing to developer handoff sat with me, which meant the job was as much about deciding what not to design as it was about shipping screens.

### Problem Space & Research Insights

Voice AI is a design problem disguised as an engineering problem. Two distinct user groups collided in the same product.

The first group is the buyer and operator: an operations lead or practice manager at a regulated business who has to configure an AI agent that will speak to their customers unsupervised. These are not technical users. They are, however, accountable for what the agent says. Compliance is not a nice-to-have in insurance or healthcare, and ambiguity in an interface translates directly into risk the customer will not accept.

The second group is the end caller, who never sees an interface at all. They hear a voice. Every affordance a screen normally provides, hierarchy, undo, progress, and error recovery, has to be carried by the conversation itself.

Working directly with early customers and internal stakeholders during rollout, the recurring themes were consistent:

- Operators would not go live until they could clearly see what the agent would and would not do
- Setup complexity, not model quality, was the real barrier to activation
- Callers abandoned when the agent failed silently, but tolerated failure that was acknowledged and redirected
- Enterprise buyers evaluated the configuration dashboard as a proxy for whether the underlying system was trustworthy

### UX Approach & Design Execution

The strategic decision was to treat onboarding as the product surface that mattered most. A voice agent that works perfectly but never gets configured has zero value.

Design solutions:

- **Staged self-serve onboarding:** I translated enterprise onboarding into four discrete stages, so operators could see where they were, what was left, and what each step committed them to. Setup was validated as prototypes before development, covering signup, guided configuration, and the go-live journey.
- **No-code workflow configuration:** Complex automation logic was reframed into a configuration experience non-technical operators could complete without engineering support, reducing manual setup effort.
- **Conversation and fallback design:** I designed discoverability patterns for what the agent can do, confidence signals for when it is unsure, and fallback recovery states for when it fails. The principle was that a graceful handoff beats a confident wrong answer, particularly in regulated contexts.
- **Trust-focused interface states:** Multi-step processes were designed to always show system status, what had been saved, and what would happen next, because in this domain uncertainty reads as risk.
- **Design system mapped to code:** I architected a scalable Figma system with reusable components, WCAG-aligned patterns, and design tokens mapped one to one to the React and Tailwind implementation. Onboarding stages were handed off as production-ready component specs with prop-based APIs rather than static screens.

Beyond product, I contributed to the go-to-market motion during early rollout, producing client-facing marketing collateral, a product booklet for prospects, LinkedIn campaign material, webinar assets, and email marketing to support initial customer traction.

### Outcome & Reflection

Impact:

- Design-to-development velocity improved by roughly 30 percent after the design system and token mapping landed, driven by component reviews and handoff documentation adopted across engineering
- Self-serve onboarding reduced the manual effort required for customers to launch automation workflows
- The platform went live with real customers in the Hamburg market during my time on the team
- Design standards, patterns, and handoff documentation were established from zero and adopted by the product team

Reflection:

Elba taught me how to design for an interface you cannot see. Voice removes almost every convention a product designer leans on, so the work becomes about expectation setting, confidence signalling, and recovery rather than layout. It also taught me the difference between designing for a user and designing for an accountable user. In regulated industries, the person configuring the system is putting their own professional judgment on the line, and the interface has to earn that. Working as the only designer sharpened my prioritisation more than any process could. With no team to absorb overflow, the only viable strategy was to be ruthless about which problems actually blocked activation.

---

## Substrac – From Passive Spend to Active Control

Substrac is a mobile subscription management product that finds recurring charges scattered across a user's email, makes their real cost visible, and turns that visibility into a decision. It was my MA thesis project: a full research to prototype cycle covering literature review, primary research, competitor analysis, information architecture, prototyping, and evaluation.

**Date:** April 2026
**Role:** Sole Designer & Researcher (MA Thesis)
**Company:** MA User Experience Design, BSBI Hamburg / University for the Creative Arts

### Overview

Substrac started as a subscription tracker and finished as a decision support system. That shift is the whole story of the project.

I owned every part of it: framing the research question, running interviews and a survey, reviewing the behavioural finance literature, benchmarking competitors, modelling the information architecture, designing the full screen set and design system, and specifying the email ingestion pipeline, data model, and privacy controls that would make the concept technically real. The work was supervised by Professor Hessam Mosharraf and submitted with distinction.

### Problem Space & Research Insights

Subscriptions run in the background. Users cannot easily reconstruct what a payment covers, how much they are paying, or when a period ends. Even digitally confident users have to combine email confirmations, banking app entries, and app store pages across personal accounts, work accounts, family plans, multiple payment methods, and sometimes multiple currencies. The result is an administrative chore rather than financial discipline.

I framed the enquiry around one primary research question:

> How can a unified visualisation and decision experience for subscription data improve financial clarity and reduce passive recurring spend for digitally active users?

Supporting questions covered how people currently discover and interpret fragmented recurring charges, how AI-assisted email detection can identify subscriptions while preserving trust and user autonomy, which interaction patterns actually reduce cognitive load in a subscription dashboard, and how the product could offer real options without nudging people manipulatively.

Research methods:

- **Literature review** across subscription behaviour and behavioural finance, cognitive load and financial visualisation, the subscription lifecycle of habit, fit and friction, biases at the money to interface boundary, and personal informatics
- **Semi-structured interviews** with thematic analysis
- **Online survey** across four assessment points: subscription footprint, current tracking behaviours, attitudes and pain signals, and product demand and trust
- **Diary snippets** capturing real review moments
- **Competitor and pattern analysis**, benchmarking Chargeback for concierge-style cancellation and speed framing, Subo for privacy-first tracking and calm UI, and YNAB as the prime competitor for behaviour change through planning

Key insights:

- The barrier is not finding numbers. Subscriptions stay invisible because auto-renewal, fragmented billing cycles, and low-salience monthly charges hide them inside ordinary life
- Action requires three things at once: awareness, confidence, and the right moment. Most products deliver only the first
- One interview participant managing more than 20 personal and 30 business subscriptions, already using YNAB, reported 90 to 95 percent confidence in his monthly payments. His problems were time, trial enforcement, and unexpected system behaviour, not awareness. Expert users hit a different wall than novices
- The audience was broader than assumed. Alongside students and early-career professionals on constrained budgets and freelancers who accumulate per-project tool stacks, senior citizens emerged as a group with hidden subscriptions and genuine uncertainty about what is still active

### UX Approach & Design Execution

Five turning points shaped the product:

1. **Expanding the ideal user profile** to include senior citizens, which changed clarity and language requirements throughout
2. **Treating the literature review as product logic**, not academic decoration, so behavioural findings drove feature decisions
3. **Shifting from tracking to decision support** after qualitative synthesis showed centralisation alone does not change behaviour
4. **Validating priorities through survey signals** rather than designer intuition
5. **Reshaping the information architecture** after lo-fi wireframe feedback

The IA settled into three top-level areas:

- **Overview:** real-time monthly and yearly spend, active subscription count, and the evaluation moments that matter, including upcoming renewals, trial expiries, and price changes
- **Subscriptions:** a searchable database filtered by category, frequency, and status, separating trial from active and work from personal
- **Insights:** patterns over time that support reflection and maintain the review habit

Core flows were designed end to end: trust-first onboarding and email connection, the first scan and its initial value delivery, the routine dashboard check-in, subscription detail and decision-making, management through both automatic and manual paths, and ongoing trust and data management.

Design principles:

- **Progressive disclosure** to keep cognitive load low while preserving depth
- **Decision-oriented, not browse-oriented.** Every surface ends in a real option: keep, downgrade, cancel, pause, or set a reminder
- **Non-manipulative by design.** Options are presented without dark patterns, with data access, privacy, and user autonomy treated as design constraints rather than legal footnotes
- **Visual hierarchy and storytelling** to turn raw financial data into something a person can actually read

Execution covered the full screen set, including splash and getting started, email connection, permission granting, profile creation, the scanning state, the dashboard, the subscription list with category filters, add and edit flows for both paid and trial apps, subscription detail, manual category-based entry, and profile and settings. I built the supporting design system with a defined colour palette and reusable UI components, and specified the technical foundation: email ingestion and subscription extraction, the data model, privacy-by-design and security controls, a performance and scaling strategy, and a future roadmap with explicit boundaries.

### Outcome & Reflection

Outcome:

- Submitted as an MA thesis and graded with distinction
- Delivered as a complete research to prototype package, including a product requirements document, survey results, and an APA bibliography supporting every product decision
- Evaluation criteria were defined in behavioural rather than aesthetic terms: reduction in active subscriptions, realised cost savings, cancellation success rate, decision time, and sustained monthly review habit

Reflection:

Substrac forced me to hold research and product craft in the same hand. The most useful lesson was that I was solving the wrong problem for the first third of the project. Building a beautiful subscription list would have satisfied the brief and changed nothing. The moment the product became about decisions rather than data, every design question got easier to answer. Defining success as measurable behaviour change, and then having to defend that definition academically, is a discipline I now bring to commercial work.

---

## Stampp – Turning a Camera Roll into a Collectible Archive

Stampp is an iOS app that turns personal photos into vintage illustrated postage stamps, organised into trip and theme albums. I designed the full product and design system, specified a two-stage AI generation pipeline, and ran the design to code handoff solo.

**Date:** 2026
**Role:** Product Designer & Solo Builder
**Company:** Personal

### Overview

Stampp takes a photo you shot, engraves it in a single ink, and composes it into a finished postage stamp with period-accurate borders, typography, and postmarks. Those stamps collect into albums, so a trip to Kyoto becomes a series rather than a folder of unsorted images.

I owned the product end to end: the concept and positioning, the full design system, every screen, the AI pipeline specification, and the developer handoff. The build was done solo, vibe-coding with Claude.

### Problem Space & Product Insights

The starting point was a technique, not a product, and that was the problem. An AI ink engraving of a photo is a lovely one-off. It is also a photo filter, and photo filters have a short half-life. People try one, share one, and never open the app again.

The reframe came from asking what makes people return. Filters do not have a retention loop. Collections do. Passport stamps, philately, and trading cards all work on the same mechanic: a thing you own becomes more meaningful because of the set it belongs to and the gap in that set.

That produced the core insights the product is built on:

- **The album is the unit of value, not the stamp.** A single stamp is a nice image. Four stamps titled "Kyoto, November" is an artefact
- **The album page is the social share unit.** People do not share a filter output twice, but they will share a completed set
- **Proof of presence gives a stamp weight.** A stamp tied to where and when you actually were is closer to a passport mark than to an Instagram post
- **AI latency is a design problem.** Generation takes up to two minutes, which is an eternity in mobile UX and cannot be hidden behind a spinner and hope

### UX Approach & Design Execution

The design language is drawn directly from postal ephemera rather than app conventions. Warm paper cream backgrounds, a serif wordmark against uppercase letterpress labels, perforated dotted dividers used as a repeated structural motif, and paper grain across surfaces. Four ink families, Terracotta, Forest, Indigo, and Sepia, act as both an aesthetic choice and an organising system: each collection carries an ink badge, so ink becomes a visual index rather than decoration.

The screen set covers the full loop:

- **Entry:** Sign In and Sign Up
- **Home:** a collections grid showing each album's cover stamp, ink badge, and stamp count, plus a persistent New Collection card so starting a set is never more than one tap away. A Stamp Passport variant presents the collection as a single postcard artefact
- **Create, Upload:** camera or library entry, framed with the line "Frame what caught your eye" to set an intentional, compositional tone rather than a casual snapshot one
- **Create, Configure:** ink family selection, frame theme selection from series such as the Japanese Imperial Archive and the Explorer's Passport, each described by its actual references like Meiji-era postal aesthetics or colonial cartography, and stamp metadata covering subject, series, location, and year
- **Create, Generating:** an honest wait state that says what the system is doing and states plainly that it may take up to two minutes
- **Create, Result:** the finished stamp, a save-to-collection picker, and a Try Again path
- **Stamps Gallery:** every stamp across all collections with subject and location
- **Collection Detail:** the album view with ink treatment and stamp count
- **Stamp Detail:** full provenance including subject, series, location, year, ink, and frame, with download and share actions
- **Profile:** archive stats covering collections and total stamps

Key design decisions:

- **Metadata as narrative.** Subject, series, location, and year are not admin fields, they are what turns an image into a catalogued object with provenance. The detail screen is deliberately structured like a philatelic record
- **A confirmation step between pipeline stages.** The two-stage generation pipeline moves from photo to single-ink engraving, then composites that engraving into a themed stamp. Keeping a confirmation after stage one prevents wasted generation calls and gives the user a checkpoint instead of a black box
- **Theme packs as configuration, not code.** Each frame theme is a prompt config, so adding a new one is a config change rather than a rebuild. Any ink family can combine with any theme pack
- **Create as the centre of gravity.** The circular Create action sits in the middle of the bottom navigation, elevated above the flat icons on either side

Technical specification and handoff:

- Two-stage GPT Image 2 pipeline with stage one and stage two kept as separate swappable prompt functions
- IndexedDB storage for v1 with no auth, keeping the first version shippable
- A single responsive codebase rather than separate native and web builds
- The native `capture="environment"` file input pattern instead of a custom camera UI
- A CLAUDE.md developer handoff document containing the data model, API contract, prompt builder functions with hex values, screen inventory with mobile and desktop deltas, and eleven numbered build milestones, alongside a master build plan

### Outcome & Reflection

Outcome:

- Shipped as a working iOS app, designed and built solo
- A complete design system spanning typographic pairings, four ink families, and paper and perforation motifs, applied consistently across the full screen set
- A generation architecture that supports new theme packs without engineering work
- A documented handoff that made a solo design to code build tractable

Reflection:

Stampp is the project where I learned that positioning is a design decision. The screens barely changed when the product went from photo filter to collecting game, but the reason to open the app changed completely, and that reframe came from questioning my own concept rather than polishing it. It also taught me a lot about designing around AI constraints instead of pretending they do not exist. A two-minute generation is not something you hide, it is something you narrate. Building it end to end, from Figma through to shipped code, closed the loop between what I specify and what actually survives implementation.

---

## Jobtrac – Building a Job Search Command Center

AI-powered job tracker that generates tailored resumes and cover letters, scores ATS compatibility, and syncs Gmail for automatic status updates.

**Date:** February 2025 – Present
**Role:** Full-Stack Vibe Coder & Product Designer
**Company:** Personal

### Overview

Jobtrac is a full-stack job application management platform I designed and built to streamline the chaotic process of job hunting. The app addresses three critical pain points: tracking applications across multiple platforms, creating tailored application documents, and staying on top of email responses.

I was responsible for the entire product lifecycle: research, architecture, UI/UX design, and implementation — from database schema design to AI prompt engineering for ATS-optimized document generation.

### Problem Space & Research Insights

Job searching is fundamentally broken. Candidates juggle spreadsheets, multiple job boards, and endless email threads — leading to missed deadlines, generic applications, and lost opportunities in a sea of browser tabs.

To validate the problem, I analyzed:

- **Personal experience:** Tracked my own job search across 50+ applications
- **Industry research:** ATS (Applicant Tracking System) parsing behavior from Textkernel, DaXtra, and major European platforms
- **User pain points:** Common complaints from job seekers about tracking and document tailoring

Key insights:

- **70%+ of resumes** are filtered out by ATS before reaching human reviewers
- Job seekers **apply to 20-50+ roles** on average, making tracking nearly impossible
- **Recruiter Boolean searches** (not hidden scores) determine shortlisting — keyword optimization is critical
- Email responses (rejections, interview invites) get **buried in inboxes**, leaving status updates manual

### UX Approach & Design Execution

To address these challenges, I mapped distinct user journeys across the job search lifecycle:

1. **Onboarding** → Set target role keywords to personalize the experience
2. **Job tracking** → Add, filter, and move opportunities through pipeline stages
3. **Document generation** → AI-tailored resumes and cover letters per role
4. **Email sync** → Automatic detection and linking of job-related emails

Design Solutions:

- **Dashboard with pipeline visibility:** Filter by status (Yet to Apply, Applied, Interview, Offer, Rejected), platform (LinkedIn, StepStone, Indeed), and full-text search
- **ATS scoring engine:** Real-time resume compatibility scoring based on reverse-engineered ATS parsing research (Greenhouse, Workday, SAP SuccessFactors)
- **AI document generation:** OpenAI-powered cover letters and resume suggestions tailored to each job description with keyword injection
- **Gmail integration:** OAuth-secured read-only sync with intelligent email classification (interview invites, rejections, assessments)
- **One-click export:** DOCX download for maximum ATS compatibility

Technical Execution:

- Built on **Next.js 16 App Router** with Server Actions for seamless form handling
- **Prisma ORM + PostgreSQL (Neon)** for type-safe data modeling with serverless pooling
- **Auth.js (NextAuth v5)** with Google OAuth and encrypted token storage
- **OpenAI Responses API** with structured outputs (JSON schema) for reliable AI generation
- **800+ lines of ATS optimization rules** derived from research on European ATS platforms
- **Zod validation** across all user inputs and AI outputs

### Outcome & Reflection

Impact:

- **ATS scoring** provides immediate, actionable feedback (format, keywords, section headings)
- **Document generation** reduces application prep time from hours to minutes
- **Gmail sync** automatically updates job status based on email signals — no manual tracking required
- **Structured resume editor** ensures consistent formatting that parses correctly across all major ATS

Technical achievements:

- Production-ready authentication with GDPR-compliant OAuth token handling
- End-to-end type safety from database to UI
- Daily usage quotas to manage API costs with optional unlimited tier
- Comprehensive test coverage for AI classification and email linking

Reflection:

Jobtrac sharpened my ability to build complex, multi-system applications that balance AI capabilities with practical UX needs. I learned how to translate dense technical research (ATS parsing behavior, EU AI Act compliance) into user-facing features that feel simple. The project reinforced that the best AI integrations don't replace user agency — they amplify it with real-time feedback and intelligent defaults.

---

## Evmet – Designing a Conference Experience Platform

Evmet is a live event management platform built to streamline operations for organizers and enhance real-time engagement for attendees and exhibitors. I was responsible for designing the full product suite: an admin dashboard for internal use, and a companion app for attendees to track schedules, complete tasks, and earn XP through engagement.

**Date:** February, 2025
**Role:** Product & Brand Designer
**Company:** Truts

### Overview

Evmet is a live event management platform built to streamline operations for organizers and enhance real-time engagement for attendees and exhibitors. I was responsible for designing the full product suite: an admin dashboard for internal use, and a companion app for attendees to track schedules, complete tasks, and earn XP through engagement.

### Problem Discovery & Research

As conferences moved to hybrid and tech-focused formats, traditional coordination tools became bottlenecks. Organizers juggled WhatsApp groups, spreadsheets, and email threads — leading to inefficient booth assignment, delayed updates, and poor attendee experience.

To validate the problem, I conducted interviews with:

- 4 event organizers
- 3 exhibitors from startup expos
- 6 past attendees from tech events

Key insights:

- Organizers lost time on manual booth management
- Exhibitors lacked tools to track leads or real-time interest
- Attendees missed important updates due to poor communication systems

### UX Strategy & Design Execution

To address these challenges, I mapped three distinct user journeys:

1. **Organizers** → Needed admin-level control for booth assignments and analytics
2. **Exhibitors** → Needed visibility on setup, leads, and traffic
3. **Attendees** → Needed a smooth, engaging way to view the agenda, complete tasks, and receive updates

Design Solutions:

- Visual booth mapping for organizers
- XP-based task system for attendees (via mobile app)
- Notification hub and dynamic agenda for all users
- Shared design system and component library for both web and mobile

Execution:

- Built detailed wireflows for each user
- Prototyped interactive mockups using Figma
- Validated key journeys with stakeholder feedback
- Handed off designs to developers with full documentation and interactive specs

### Results & Reflection

Impact:

- Successfully piloted at a regional tech conference
- Over 70% of attendees used the XP task system
- 40% reduction in manual coordination time reported by organizers
- Exhibitors praised the clarity and professionalism of their digital booth experience

Reflection:

Evmet sharpened my ability to manage multi-user systems with diverging needs. I learned how to reduce friction at both strategic (event planning) and micro (task-level interaction) levels. It also reinforced the importance of fast feedback loops in fast-moving environments like live events — and how smart UX can turn chaos into clarity.

---

## Truts – Scaling a Multi-Product Web3 Platform

Truts is a Web3-native community platform used by over 100K users to discover, contribute to, and earn from decentralized organizations. I led the design of seven interconnected products — from Missions to Dashboard — building systems that scale across communities and devices.

**Date:** July, 2024
**Role:** Product & Brand Designer
**Company:** Truts

### Overview

Truts is a Web3-native community platform designed to help users discover, engage with, and earn from DAOs and decentralized projects. As the sole designer, I led the UX and UI strategy across seven interconnected modules, serving over 100,000 users. My goal was to unify fragmented product features into a cohesive, scalable experience — adaptable across communities, devices, and Web3 user types.

### Problem Discovery & Research

As Truts scaled, the platform lacked a centralized UX system. Each feature — from missions to NFT rewards — was being developed in silos, causing major usability gaps. New users, after connecting their wallets, often dropped off due to unclear navigation or lack of feedback. Community managers needed better tools to manage XP systems, while mobile-first users struggled with desktop-centric flows.

To validate and understand these problems, I conducted qualitative interviews with

- Core contributors from 10+ DAOs
- Power users and community managers
- Wallet-connected newcomers with limited Web3 experience

Key insights:

- First-time users were unsure "what to do next" after wallet connect
- Admins lacked data views for managing tasks and XP assignments
- Mobile use was dominant, but tools weren't optimized responsively

### UX Strategy & Design Execution

To resolve these gaps, I designed a modular product ecosystem with seven core sub-products:

- **Missions:** Task-based reward system
- **Communities:** DAO-specific landing + onboarding
- **Profiles:** NFT + XP tracking
- **Dashboard:** Admin analytics for community leads
- **Offerings:** Claimable perks
- **Academy:** Education and earning hub

Each sub-product shared a unified navigation system, visual identity, and design components.

Execution Steps:

- Created low-to-high fidelity wireframes in Figma for all modules
- Designed scalable user flows (wallet connect → task → claim)
- Developed and maintained a reusable Figma component system
- Collaborated with developers through Notion-based documentation, interaction videos, and real-time syncs
- Conducted usability testing via Maze, iterating based on feedback from interns and early users

### Results & Reflection

Results:

- Truts scaled to 100K+ users across 40+ DAO communities
- Onboarding drop-offs decreased significantly with flow restructuring
- Reusable components reduced design-dev turnaround by ~30%
- Documentation was used to onboard 3 international design interns and new devs

Reflection:

Truts gave me full ownership over a multi-product Web3 ecosystem. I learned to balance complexity with clarity, and experimentation with system logic. It pushed me to think at scale — not just in design, but in how people interact, earn, and navigate across decentralized experiences.

---

## Dehidden – Crafting Web3 Campaign UX for Global Brands

Dehidden is a Web3 campaign studio that builds NFT-driven experiences for global brands like Polygon Studios, Coinbase, Mercedes, and Bacardi. I was responsible for designing mobile-first UX flows and branded visuals that connected physical experiences — like festivals, campus tours, and QR activations — with real-time blockchain rewards.

**Date:** June 2022
**Role:** Visual & Interaction Designer
**Company:** Dehidden

### Overview

Dehidden is a Web3 campaign studio that builds NFT-driven experiences for global brands like Polygon Studios, Coinbase, Mercedes, and Bacardi. I was responsible for designing mobile-first UX flows and branded visuals that connected physical experiences — like festivals, campus tours, and QR activations — with real-time blockchain rewards.

I worked across multiple high-pressure campaigns where every interaction had to be simple, trust-building, and visually on-brand.

### Problem Space & User Insights

Each campaign came with unique brand objectives — but the UX challenges repeated:

- How do we onboard non-crypto users seamlessly?
- How do we build trust in Web3 processes through design?
- How do we balance aesthetics and performance in tight timelines?

To solve this, I collaborated directly with brand stakeholders and conducted:

- Quick user interviews with attendees and community managers
- Competitive UX scans of past phygital and NFT drops
- Technical syncs with devs to understand wallet logic and claim mechanics

Insights:

- 90%+ of traffic came from mobile + QR scans
- First-time users preferred claim flows without needing a wallet upfront
- Visually clear, fast feedback screens reduced drop-offs drastically

### UX Strategy & Execution

I led the design of interaction flows and modular systems for campaigns including:

- **Let It Snow (Polygon):** QR-to-mint flow from snow globe installations
- **Coinbase Campus:** NFT rewards for student onboarding tasks
- **NH7 Bacardi:** Wristband-activated NFT art claims during live events

My approach:

- Designed responsive, 3–5 second flows with brand-aligned visuals
- Created illustration-based onboarding for wallet connect and mint confirmations
- Built component libraries for states like "Claimed," "Mint Failed," and "Mint In Progress"
- Worked hands-on with devs to ensure smart contract and UI behavior were synced

### Outcome & Reflection

Impact:

- Over 50,000 NFTs claimed across campaigns
- 45% reduction in abandonment after onboarding improvements
- Campaigns featured on-stage and online by Coinbase, Polygon, and Bacardi
- Helped establish a visual language for Web3 that felt welcoming, not intimidating

Reflection:

Dehidden taught me how to blend emotional storytelling with technical clarity. These projects sharpened my speed, adaptability, and design communication under rapid timelines — all while maintaining brand precision and user empathy.

---

## Build Up – Rethinking Blue-Collar Hiring in Local Communities

Build Up is a concept UX project focused on solving a very real, local problem: how to connect homeowners and small businesses with verified blue-collar workers (like plumbers and electricians) — quickly, simply, and without technical barriers. I designed a lightweight, mobile-first experience built for accessibility, visual clarity, and low-tech usability.

**Date:** July 2023
**Role:** Personal Project
**Company:** Portfolio

### Overview

Build Up is a concept UX project focused on solving a very real, local problem: how to connect homeowners and small businesses with verified blue-collar workers (like plumbers and electricians) — quickly, simply, and without technical barriers. I designed a lightweight, mobile-first experience built for accessibility, visual clarity, and low-tech usability.

### Problem Space & Research Insights

In the absence of formal platforms, most blue-collar hiring happens through:

- WhatsApp groups
- Posters
- Personal referrals

This creates friction: no verified reviews, no skills transparency, and high reliance on trust or urgency. Many workers are tech-aware but not app-literate.

To understand these dynamics, I spoke with:

- 5 homeowners and shop owners
- 3 contractors (electrician, painter, plumber)
- 2 NGO workers supporting urban labor networks

Key insights:

- Hiring is driven by urgency ("my bathroom's leaking")
- Workers often don't use email or websites, but **do** use smartphones
- A platform must earn **trust visually**, not through text or ratings alone

### UX Approach & Design Execution

I designed two focused user flows:

Client side:

- Input issue (with urgency tag)
- View basic, verified worker profiles
- Direct booking + in-app chat

Worker side:

- One-screen profile creation
- Nearby job notifications
- Accept/decline in one tap

Design Principles:

- Visual-first with icons and minimal text
- No login required to explore
- Language-aware UX with simple buttons and confirmations

Execution:

- Mapped task flows in Miro
- Created low-to-high fidelity wireframes in Figma
- Built interactive prototypes
- Ran Maze tests + verbal feedback sessions with 4 participants

### Outcome & Reflection

Results:

- 80% of test users found the system simple and fast
- One local contractor understood the full flow in under 2 minutes
- Positive response to "no login" and icon-based navigation
- Proved the power of visual UX for tech-averse user groups

Reflection:

Build Up challenged me to go beyond polish and think deeply about empathy, literacy, and access. It was a powerful reminder that great UX isn't just smooth — it's **inclusive, human-first, and constraint-aware**. This project strengthened my confidence in designing for underserved and non-digital-native audiences.

---

## Chip Count – Visualizing Poker Tournaments in Real Time

Chip Count is a personal concept project designed to bring real-time visibility to professional poker tournaments. The platform allows spectators and commentators to track chip stacks, eliminations, and player rankings live — without relying on delayed video streams. My focus was to create a clear, glanceable, and fast interface that visualizes critical game moments for poker fans and analysts.

**Date:** November 2024
**Role:** Product Designer
**Company:** Personal

### Overview

Chip Count is a personal concept project designed to bring real-time visibility to professional poker tournaments. The platform allows spectators and commentators to track chip stacks, eliminations, and player rankings live — without relying on delayed video streams. My focus was to create a clear, glanceable, and fast interface that visualizes critical game moments for poker fans and analysts.

### Problem Space & Research Insights

Poker broadcasts often suffer from delay, poor UX, or no interface at all — forcing fans to rely on memory or cluttered spreadsheets. Casual spectators want clarity. Analysts want speed.

To understand the best UX patterns for live data, I benchmarked:

- **Cricbuzz** – for cricket score clarity
- **LiveScore** – for stat layering
- **Chess.com** – for tournament dashboards

I also mapped a typical poker game structure and identified pain points:

- Tables shift frequently; players come and go
- All-ins and bust-outs are key emotional moments
- No platform shows dynamic chip changes clearly or fast enough

### UX Approach & Design Execution

To solve this, I designed 3 core modules:

1. **Leaderboard View:** Live-ranked players, chip counts, dynamic sort with chip swing highlights
2. **Table View:** Visual map of seated players, blind positions, and stack indicators
3. **Elimination Feed:** Chronological list of bust-outs, with opponent, table, and bracket filters

Design Principles:

- Dark UI for data density and contrast
- Glanceability for key stats in <5 seconds
- Minimal clicks, adaptable for mobile/tablet

Execution Steps:

- Wireframed leaderboard, table layout, and event feed
- Built an interactive prototype in Figma simulating chip swings
- Used arrow indicators (🟢▲ gain, 🔴▼ bust-out) and animated data cards
- Designed hover interactions and data overlays for desktop users

### Outcome & Reflection

Outcome:

- Prototype tested with casual fans and poker content creators
- Users could identify top 5 players in **under 10 seconds**
- Described as "clearer than most tournament streams"
- One user: "I'd keep this open during every stream."

Reflection:

Chip Count pushed me to design for **live data under pressure**. It combined real-time logic, dashboard UX, and data-driven visuals in a compact, accessible interface. This project sharpened my skills in clarity-first information design — and I hope to pitch it someday to real tournament broadcasters.
