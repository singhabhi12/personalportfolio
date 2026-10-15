import { projects, projectHref } from "@/lib/content";

/* All nine as cards, on the house grid — the full list, where the drawer files
   a selection of six. For anyone who would rather see them all at once than
   one at a time, and the only view a phone is offered at all (see
   components/WorkView.tsx).

   The card is the home page's product card, nine times: the case number and
   the year on the head line, the shot in a tinted recess under it, then the
   name and the line about it on the card's own white. Nothing here is a shape
   home does not already use — which is the whole point of the view. The old
   version drew the stage on bare paper with no card around it; the stage
   survived into the card, because a product shot wants a sweep to sit on.

   Reads only what the drawer reads — the same screenshot, at the same
   responsive widths — so a project that gets its shot gets it here too. */
export default function WorkCards() {
  return (
    <>
      {projects.map((project, index) => (
        <a className="hcard work-card" key={project.slug} href={projectHref(project)}>
          <span className="hcard-head">
            <span>{project.caseLabel}</span>
            <span>{project.timeline}</span>
          </span>

          <span className="work-stage">
            <img
              className="work-shot"
              src={project.image}
              srcSet={project.srcSet}
              /* A quarter of the grid, less its gutter. token-exempt: media
                 conditions, same as @media — CSS vars don't apply. */
              sizes="(max-width: 680px) 92vw, (max-width: 1360px) 33vw, 25vw"
              alt={`${project.title} — product screenshot`}
              width={project.width}
              height={project.height}
              loading={index < 4 ? "eager" : "lazy"}
            />
          </span>

          <span className="card-title">{project.title}</span>
          <span className="work-card-desc">{project.outcome}</span>

          {/* The facts of the thing — who with — and the tag if it carries
              one, held to the card's bottom edge so a row lands level. */}
          <span className="work-card-foot">
            <span className="work-stage-caption">{project.team}</span>
            {project.tag && <span className="tag-chip">{project.tag}</span>}
          </span>
        </a>
      ))}
    </>
  );
}
