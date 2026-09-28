import { projects, projectHref } from "@/lib/content";

/* All nine as cards, laid flat in two columns — the full list, where the
   drawer files a selection of six. For anyone who would rather see them all
   at once than one at a time. The
   whole card is the link; hover moves the title to the accent, the way the
   desk's featured card does. No "view project" buttons.

   Reads only what the drawer reads — the same screenshot, at the same
   responsive widths — so a project that gets its shot gets it here too. */
export default function WorkCards() {
  return (
    <div className="work-grid">
      {projects.map((project, index) => (
        <a className="work-card" key={project.slug} href={projectHref(project)}>
          <img
            className="shot"
            src={project.image}
            srcSet={project.srcSet}
            /* Half the grid, less its gutter. token-exempt: media conditions,
               same as @media — CSS vars don't apply. */
            sizes="(max-width: 820px) 92vw, 540px"
            alt={`${project.title} — product screenshot`}
            width={project.width}
            height={project.height}
            loading={index < 2 ? "eager" : "lazy"}
          />

          <span className="work-card-head">
            <span className="card-title">{project.title}</span>
            {project.tag && <span className="tag-chip">{project.tag}</span>}
          </span>
          <span className="card-outcome">{project.outcome}</span>
          <span className="work-card-meta micro-label">
            {project.timeline} · {project.team}
          </span>
        </a>
      ))}
    </div>
  );
}
