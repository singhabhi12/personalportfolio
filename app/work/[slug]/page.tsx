import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageFrame from "@/components/PageFrame";
import { caseSections, caseStudies, projects, type CaseBlock } from "@/lib/content";
import { caseFigureManifest } from "@/lib/generated/case-figures";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.filter((p) => p.hasCaseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Abhishek Singh`,
    description: caseStudies[slug]?.lead ?? project.outcome,
  };
}

/* One block of a written section. Bullets carry an optional bolded run-in,
   which is the shape the source document writes its stronger points in. */
function Block({ block, slug }: { block: CaseBlock; slug: string }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "quote":
      return <blockquote className="case-quote">{block.text}</blockquote>;
    case "figure": {
      /* Same rule as the hero: only what has been through the pipeline is
         drawn. A row that loses an image simply gets narrower, and a figure
         that loses all of them leaves no gap in the prose. */
      const images = block.images
        .map((image) => ({ ...image, asset: caseFigureManifest[`${slug}/${image.name}`] }))
        .filter((image) => image.asset);
      if (images.length === 0) return null;
      const row = images.length > 1;
      const share = row ? images.length : 1;
      /* Each screen in a row gets its share of the column. token-exempt: media
         conditions, same as @media — CSS vars don't apply. */
      const sizes = `(max-width: 820px) ${Math.floor(92 / share)}vw, ${Math.floor(720 / share)}px`;
      const shots = images.map(({ name, alt, asset }) => (
        <img
          key={name}
          src={asset.src}
          srcSet={asset.srcSet}
          sizes={sizes}
          alt={alt}
          width={asset.width}
          height={asset.height}
          loading="lazy"
        />
      ));
      return (
        <figure className="case-figure">
          {row ? <div className="case-figure-row">{shots}</div> : shots}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
    case "list":
    case "steps": {
      const items = block.items.map((item, index) => (
        <li key={index}>
          {item.lead && <strong>{item.lead}</strong>}
          {item.lead ? ` — ${item.text}` : item.text}
        </li>
      ));
      return block.kind === "steps" ? (
        <ol className="case-list case-list--numbered">{items}</ol>
      ) : (
        <ul className="case-list">{items}</ul>
      );
    }
  }
}

/* Case study: the nav capsule persists, the desk metaphor does not (§8).
   One 720px reading column, images in 12px frames, dividers in --color-line.
   No widget cards, no gradient, no Caveat. */
export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug && p.hasCaseStudy);
  if (!project) notFound();

  const study = caseStudies[slug];

  /* Only a real cover gets a hero: a hatch placeholder over finished prose
     reads as a broken image rather than as work still to be shot. The drawer
     keeps its placeholder, where the layout needs something in the slot. */
  const hasShot = Boolean(project.srcSet);

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects.slice(index + 1).find((p) => p.hasCaseStudy) ?? projects.find((p) => p.hasCaseStudy && p.slug !== slug);

  return (
    <PageFrame active="work">
      <article className="case">
        {/* data-sweep: the rule runs the way the arrow points. */}
        <Link className="micro-label case-back link-sweep" data-sweep="reverse" href="/work">
          ← Back to work
        </Link>

        <h1 className="case-title">{project.title}</h1>
        <p className="case-outcome">{study?.lead ?? project.outcome}</p>

        <div className="case-meta">
          <span className="micro-label">{project.role}</span>
          <span className="micro-label">{project.timeline}</span>
          <span className="micro-label">{project.team}</span>
        </div>

        {hasShot && (
          <figure className="case-figure">
            <img
              src={project.image}
              srcSet={project.srcSet}
              /* token-exempt: media conditions, same as @media — CSS vars don't apply */
              sizes="(max-width: 820px) 92vw, 720px"
              alt={`${project.title} — product screenshot`}
              width={project.width}
              height={project.height}
            />
          </figure>
        )}

        {/* What the page cannot show, and why — said before anyone wonders
            where the screenshots went. */}
        {study?.note && <p className="case-note">{study.note}</p>}

        {study
          ? study.sections.map((section) => (
              <section className="case-section" key={section.label}>
                <h2 className="widget-label">{section.label}</h2>
                {section.blocks.map((block, index) => (
                  <Block block={block} slug={slug} key={index} />
                ))}
              </section>
            ))
          : caseSections.map((section) => (
              <section className="case-section" key={section.label}>
                <h2 className="widget-label">{section.label}</h2>
                <p className="about-placeholder">
                  <span className="ph-mark">◍ placeholder</span> — {section.placeholder}
                </p>
              </section>
            ))}

        <div className="case-divider" />

        {next && (
          <nav className="case-next">
            <p className="micro-label">Next</p>
            <Link className="link-sweep" href={`/work/${next.slug}`}>
              {next.title}{" "}
              <span className="link-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </nav>
        )}
      </article>
    </PageFrame>
  );
}
