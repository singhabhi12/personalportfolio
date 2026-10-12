import { projects, projectHref } from "@/lib/content";

/* All nine as cards, laid flat in two columns — the full list, where the
   drawer files a selection of six. For anyone who would rather see them all
   at once than one at a time, and the only view a phone is offered at all
   (see components/WorkView.tsx).

   The card is not a card. There is no white panel under it and no shadow
   around it: what there is instead is a *stage* — a tinted recess with the
   cover floating in it, the way a product shot is photographed on a sweep
   rather than pasted onto a page. The name and the line about it sit outside
   that recess, on the page itself, because they are not part of the picture.

   Which is also why the stage is tinted rather than matched to the covers:
   the nine of them come in on three different grounds (white, warm grey, and
   one gradient), so there is no single colour that could make all nine
   dissolve into their frame. A recess they visibly sit *in* is honest about
   that and works for all of them.

   Reads only what the drawer reads — the same screenshot, at the same
   responsive widths — so a project that gets its shot gets it here too. */
export default function WorkCards() {
  return (
    <div className="work-grid">
      {projects.map((project, index) => (
        <a className="work-card" key={project.slug} href={projectHref(project)}>
          <span className="work-stage">
            <img
              className="work-shot"
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
            {/* The caption belongs to the picture, so it lives in the picture's
                frame: the facts of the thing — when, and who with — set small
                and quiet under the shot they describe. */}
            <span className="work-stage-foot">
              <span className="work-stage-caption">
                {project.timeline} · {project.team}
              </span>
              {project.tag && <span className="tag-chip">{project.tag}</span>}
            </span>
          </span>

          {/* And the project itself, out on the page. Name first and in ink,
              then what it was in one line — one rhythm, read left to right,
              with no box drawn around either. */}
          <span className="work-card-head">
            <span className="card-title">{project.title}</span>
            <span className="work-card-desc">{project.outcome}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
