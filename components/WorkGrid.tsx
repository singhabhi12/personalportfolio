import { projects, projectHref } from "@/lib/content";

/* Full-width 2-column grid of featured project cards. The whole card is the
   link; hover moves the title to coral. No "view project" buttons (§7).

   This is the whole of /work, so the title is the page's h1. */
export default function WorkGrid() {
  return (
    <section className="section" id="work">
      <h1 className="section-title">
        Work <span className="glyph" aria-hidden="true">▶</span>
      </h1>

      <div className="work-grid">
        {projects.map((project) => (
          <a className="work-card" key={project.slug} href={projectHref(project)}>
            <div className="work-card-head">
              <span className="micro-label">{project.caseLabel}</span>
              {project.tag && <span className="tag-chip">{project.tag}</span>}
            </div>

            {/* Phase 2 accepts a silent clip in this frame without restructuring. */}
            <div className="shot-frame">
              <img
                className="shot"
                src={project.image}
                alt={`${project.title} — product screenshot`}
                width={project.width}
                height={project.height}
              />
              {project.hoverMedia && (
                <video
                  className="hover-media"
                  src={project.hoverMedia}
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                />
              )}
            </div>

            <p className="card-title">{project.title}</p>
            <p className="card-outcome">{project.outcome}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
