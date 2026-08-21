import Link from "next/link";
import {
  cooking,
  experience,
  featured,
  headline,
  identity,
  manifesto,
  manifestoFootnote,
  portrait,
  projectHref,
  quotes,
} from "@/lib/content";
import ToolsRow from "./ToolsRow";

/* The desk: the manifesto panel at left, arranged objects at right.
   The collage's rotations and negative margins are static layout, not motion —
   they flatten into a plain card stack below 820px. */

/* The footnote ships with its own marker so the copy reads whole in
   lib/content.ts; the panel paints that marker accent-red, so it is split off
   here rather than duplicated as a second field. */
const footnoteMark = manifestoFootnote.startsWith("*");
const footnoteText = manifestoFootnote.replace(/^\*\s*/, "");

export default function Desk() {
  const quote = quotes[0];

  return (
    <div className="desk-grid">
      {/* LEFT — the manifesto panel, sticky so the voice follows the visitor.
          Experience stays de-carded below it, bare on the paper. */}
      <div className="manifesto">
        <div className="panel manifesto-card">
          {/* Three weights in one line: the name, the plain verb between, and
              the subject as the only underline on the page. */}
          <h1 className="manifesto-headline">
            <span className="mh-name">{identity.firstName}</span>{" "}
            <span className="mh-verb">{headline.verb}</span>{" "}
            <Link className="mh-subject" href={headline.href}>
              {headline.subject}
            </Link>
            <span className="mh-stop">.</span>
          </h1>

          <div className="panel-rule" role="presentation" />

          <div className="manifesto-lines">
            {manifesto.map((line, index) => (
              <p key={line}>
                {line}
                {footnoteMark && index === manifesto.length - 1 && (
                  <sup className="marker" aria-hidden="true">
                    *
                  </sup>
                )}
              </p>
            ))}
          </div>

          <p className="manifesto-footnote">
            {footnoteMark && (
              <span className="marker" aria-hidden="true">
                *
              </span>
            )}{" "}
            {footnoteText}
          </p>
        </div>

        <section className="exp">
          <h2 className="micro-label exp-heading">Where I&rsquo;ve been</h2>
          {experience.map((role) => (
            <div className="exp-row" key={role.role}>
              <span className="exp-year">{role.years}</span>
              <span className="exp-role">{role.role}</span>
              <span className="exp-field">{role.field}</span>
            </div>
          ))}
        </section>
      </div>

      {/* RIGHT — the arranged desk */}
      <div className="collage">
        {/* The one photo object on this page, in a white frame with the gallery
            tile breaking out of its top-right corner. Black-and-white is baked
            into the asset by `npm run assets`; the CSS filter is belt-and-braces
            for a colour source dropped in without the pipeline. */}
        <figure className="desk-portrait">
          <div className="portrait-frame">
            <img
              className="shot"
              src={portrait.image}
              srcSet={portrait.srcSet}
              /* token-exempt: media conditions, same as @media — CSS vars don't apply */
              sizes="(max-width: 820px) 92vw, 440px"
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
            />
            <Link className="app-badge" href="/gallery" aria-label="See the gallery">
              <span aria-hidden="true">⁕</span>
            </Link>
          </div>
          <figcaption className="portrait-caption">{portrait.caption}</figcaption>
        </figure>

        {/* The one gradient surface on this page. Carries the availability signal. */}
        <div className="desk-cooking">
          <p className="widget-label">{cooking.label}</p>
          <p className="cooking-headline">{cooking.headline}</p>
          <p className="cooking-sub">{cooking.sub}</p>
        </div>

        <a className="desk-featured" href={projectHref(featured)}>
          <p className="widget-label">
            Featured project <span aria-hidden="true">▶</span>
          </p>
          <img
            className="shot"
            src={featured.image}
            alt={`${featured.title} — product screenshot`}
            width={featured.width}
            height={featured.height}
          />
          <p className="card-title">{featured.title}</p>
          <p className="card-outcome">{featured.outcome}</p>
        </a>

        <figure className="desk-quote">
          <p className="micro-label">Kind words</p>
          <blockquote className="quote-text">{quote.text}</blockquote>
          <figcaption className="quote-attribution">{quote.attribution}</figcaption>
        </figure>

        <div className="desk-tools">
          <p className="micro-label">On the desk</p>
          <ToolsRow />
        </div>
      </div>
    </div>
  );
}
