import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageFrame from "@/components/PageFrame";
import { caseSections, projects } from "@/lib/content";

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
    description: project.outcome,
  };
}

/* Case study: the nav capsule persists, the desk metaphor does not (§8).
   One 720px reading column, images in 12px frames, dividers in --color-line.
   No widget cards, no gradient, no Caveat. */
export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug && p.hasCaseStudy);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects.slice(index + 1).find((p) => p.hasCaseStudy) ?? projects.find((p) => p.hasCaseStudy && p.slug !== slug);

  return (
    <PageFrame active="work">
      <article className="case">
        <Link className="micro-label case-back" href="/work">
          ← Back to work
        </Link>

        <h1 className="case-title">{project.title}</h1>
        <p className="case-outcome">{project.outcome}</p>

        <div className="case-meta">
          <span className="micro-label">{project.role}</span>
          <span className="micro-label">{project.timeline}</span>
          <span className="micro-label">{project.team}</span>
        </div>

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

        {caseSections.map((section) => (
          <section className="case-section" key={section.label}>
            <h2 className="widget-label">{section.label}</h2>
            <p className="about-placeholder">
              <span className="ph-mark">◍ placeholder</span> — {section.placeholder}
            </p>
            {section.figure && (
              <figure className="case-figure">
                <img
                  src={project.image}
                  srcSet={project.srcSet}
                  /* token-exempt: media conditions, same as @media — CSS vars don't apply */
                  sizes="(max-width: 820px) 92vw, 720px"
                  alt=""
                  width={project.width}
                  height={project.height}
                />
                <figcaption className="micro-label">
                  Placeholder — supporting image
                </figcaption>
              </figure>
            )}
          </section>
        ))}

        <div className="case-divider" />

        {next && (
          <nav className="case-next">
            <p className="micro-label">Next</p>
            <Link href={`/work/${next.slug}`}>{next.title} →</Link>
          </nav>
        )}
      </article>
    </PageFrame>
  );
}
