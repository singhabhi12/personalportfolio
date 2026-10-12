import Link from "next/link";
import {
  cooking,
  experience,
  featured,
  home,
  identity,
  photoByKey,
  photoCount,
  photography,
  portrait,
  projectHref,
  projects,
  shotLine,
  tools,
  type Photo,
} from "@/lib/content";
import DeskQuote from "./DeskQuote";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import LocalTime from "./LocalTime";

/* Home, after dannpetty.com: one screen of cards, in the site's own paper,
   white and gradient. Three tracks — the profile down the left, photographs
   in the middle, where-and-what down the right — and on a laptop the whole
   thing fits the viewport with nothing to scroll (app/globals.css, "Home").

   The order below is the reading order, and the order a phone stacks in. */

const byKey = (keys: string[]) =>
  keys.map(photoByKey).filter((photo): photo is Photo => Boolean(photo));

/* The frame's own crop wins over the photograph's where one is given: the
   hero is a letterbox, and lib/content.ts says why. */
const slides: HeroSlide[] = photography.hero.frames.flatMap((frame) => {
  const photo = photoByKey(frame.key);
  if (!photo) return [];
  return [
    {
      key: photo.key,
      src: photo.src,
      srcSet: photo.srcSet,
      width: photo.width,
      height: photo.height,
      focus: frame.focus ?? photo.focus,
      lqip: photo.lqip,
      alt: photo.alt,
      title: photo.title,
      shot: shotLine(photo),
    },
  ];
});

const squares = byKey(photography.squares);

const covers = home.covers
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project) => project?.srcSet);

const previously = experience.map((role) => role.role.split(" — ")[1]).filter(Boolean);

export default function Desk() {
  return (
    <div className="home">
      {/* ---- Left: who ---- */}
      <div className="home-col home-left">
        <section className="hcard profile" aria-label="About">
          <span className="profile-avatar">
            <img
              src={portrait.image}
              srcSet={portrait.srcSet}
              /* token-exempt: media conditions, same as @media — CSS vars don't apply */
              sizes="64px"
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
            />
          </span>
          <h1 className="profile-name">{identity.name}</h1>
          <p className="profile-role">
            {home.role} — building{" "}
            <Link className="profile-link" href={projectHref(featured)}>
              {featured.title}
            </Link>
            .
          </p>

          <div className="profile-body">
            {home.bio.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {previously.length > 0 && <p className="profile-previously">Previously {formatList(previously)}.</p>}
          </div>

          <div className="profile-body">
            <p>{home.explore.label}</p>
            <ul className="profile-links">
              {home.explore.links.map((link) => (
                <li key={link.href}>
                  <span aria-hidden="true">→ </span>
                  <Link className="profile-link" href={link.href}>
                    {link.label}
                  </Link>{" "}
                  <span className="profile-note">{link.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="profile-foot">
            <div className="profile-socials">
              <a className="social" href={identity.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.4c0-3.07-1.64-4.5-3.83-4.5-1.77 0-2.56.97-3 1.66V8.5H10.2c.05.97 0 11.5 0 11.5h3.4v-6.42c0-.34.02-.69.13-.93.27-.69.9-1.4 1.95-1.4 1.38 0 1.93 1.05 1.93 2.6V20h3.4l-.01-6.6Z" />
                </svg>
              </a>
              <a className="social" href={photography.href} target="_blank" rel="noopener noreferrer" aria-label={`Instagram — @${photography.handle}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.73 0 3.06.01 4.13.06 1 .05 1.54.21 1.9.35.48.19.82.41 1.18.77.36.36.58.7.77 1.18.14.36.3.9.35 1.9.05 1.07.06 1.4.06 4.14s-.01 3.06-.06 4.13c-.05 1-.21 1.54-.35 1.9-.19.48-.41.82-.77 1.18-.36.36-.7.58-1.18.77-.36.14-.9.3-1.9.35-1.07.05-1.4.06-4.13.06s-3.07-.01-4.14-.06c-1-.05-1.54-.21-1.9-.35a3.17 3.17 0 0 1-1.18-.77 3.17 3.17 0 0 1-.77-1.18c-.14-.36-.3-.9-.35-1.9C3.61 15.07 3.6 14.74 3.6 12s.01-3.07.06-4.14c.05-1 .21-1.54.35-1.9.19-.48.41-.82.77-1.18.36-.36.7-.58 1.18-.77.36-.14.9-.3 1.9-.35C8.93 3.61 9.27 3.6 12 3.6Z" />
                </svg>
              </a>
              <a className="social" href={identity.cv} target="_blank" rel="noopener noreferrer" aria-label="CV">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11ZM8 12h8v1.6H8V12Zm0 3.4h8V17H8v-1.6Z" />
                </svg>
              </a>
            </div>
            <a className="pill" href={`mailto:${identity.email}`}>
              {identity.email}
            </a>
          </div>
        </section>

        {/* The reference's to-do card, as a timeline. A short laptop drops it
            for the one-line "Previously" in the profile above. */}
        <section className="hcard exp-card" aria-label={home.experience.label}>
          <p className="hcard-head">
            <span>{home.experience.label}</span>
            <span>{home.experience.note}</span>
          </p>
          <ul className="exp-list">
            {experience.map((role) => {
              const [title, company] = role.role.split(" — ");
              return (
                <li key={role.role}>
                  <span className="exp-company">{company ?? title}</span>
                  <span className="exp-field">{role.field}</span>
                  <span className="exp-years">{role.years}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* The one gradient surface on this page. Carries the availability signal. */}
        <section className="hcard hcard--gradient" aria-label={cooking.label}>
          <p className="hcard-head">
            <span>{cooking.label}</span>
            <span>{new Date().getFullYear()}</span>
          </p>
          <p className="cooking-headline">{cooking.headline}</p>
          <p className="cooking-sub">{cooking.sub}</p>
        </section>
      </div>

      {/* ---- Middle: the photographs, and what sits under them ---- */}
      <div className="home-mid">
        {slides.length > 0 && <HeroCarousel slides={slides} label={photography.hero.label} />}

        <div className="home-col">
          <section className="hcard tools-card" aria-label={home.tools.label}>
            <p className="hcard-head">
              <span>{home.tools.label}</span>
              <span>{home.tools.note}</span>
            </p>
            <ul className="tool-chips">
              {tools.map((tool) => (
                <li key={tool.name} className="tool-chip" title={tool.name}>
                  <img src={tool.icon} alt={tool.name} width={34} height={34} />
                </li>
              ))}
            </ul>
          </section>

          <a className="hcard product" href={projectHref(featured)}>
            <span className="product-stage">
              <img
                src={featured.image}
                srcSet={featured.srcSet}
                /* token-exempt: media conditions, same as @media — CSS vars don't apply */
                sizes="(max-width: 1000px) 92vw, 340px"
                alt={`${featured.title} — product screenshot`}
                width={featured.width}
                height={featured.height}
              />
            </span>
            <span className="product-title">{featured.title}</span>
            <span className="product-line">{featured.outcome}</span>
            <span className="pill pill--ink">{home.featured.cta}</span>
          </a>
        </div>

        <div className="home-col">
          <section className="hcard insta" aria-labelledby="insta-handle">
            <p className="hcard-head">
              <a
                id="insta-handle"
                className="insta-handle"
                href={photography.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{photography.handle}
              </a>
              <span>{photoCount} photos</span>
            </p>
            <ul className="insta-grid">
              {squares.map((photo) => (
                <li key={photo.key}>
                  <Link className="insta-tile" href="/gallery" aria-label={`${photo.title} — open the gallery`}>
                    <img
                      src={photo.src}
                      srcSet={photo.srcSet}
                      /* token-exempt: media conditions, same as @media — CSS vars don't apply */
                      sizes="120px"
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      /* token-exempt: focal point and LQIP data URI from the photo manifest */
                      style={{
                        objectPosition: photo.focus,
                        ...(photo.lqip ? { backgroundImage: `url(${photo.lqip})` } : {}),
                      }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <a className="pill pill--ink" href={photography.href} target="_blank" rel="noopener noreferrer">
              {photography.follow} <span aria-hidden="true">↗</span>
            </a>
          </section>

          <DeskQuote />
        </div>
      </div>

      {/* ---- Right: where, and the work ---- */}
      <div className="home-col home-right">
        <section className="hcard location" aria-label="Location">
          <p className="location-city">{home.location.city}</p>
          <p className="location-from">{home.location.from}</p>
          <LocalTime timeZone={home.location.timeZone} />
        </section>

        {covers.map(
          (project) =>
            project && (
              <a key={project.slug} className="hcard cover" href={projectHref(project)}>
                <img
                  src={project.image}
                  srcSet={project.srcSet}
                  /* token-exempt: media conditions, same as @media — CSS vars don't apply */
                  sizes="(max-width: 1000px) 92vw, 340px"
                  alt={`${project.title} — product screenshot`}
                  width={project.width}
                  height={project.height}
                />
                <span className="cover-caption">
                  <span className="cover-title">{project.title}</span>
                  <span className="cover-line">{project.outcome}</span>
                </span>
              </a>
            )
        )}
      </div>
    </div>
  );
}

/* "A, B, C and D" — the way a sentence lists things. */
function formatList(items: string[]) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
