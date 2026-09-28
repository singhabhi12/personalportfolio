"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { filed, projectHref, work } from "@/lib/content";
import { isStill } from "@/lib/motion";

/* /work is a drawer of folders, built to the five states in the Figma.

     1  shut     the drawer lands closed — one folder, with the pages inside it
                 showing as a white edge along the top
     2  open     a beat later it unfolds, and every folder is a readable page
     3  hover    a page lifts out of the stack a little, the way one does when
                 a hand is looking for it
     4  expand   the page it lands on opens wide, in place
     5  spines    "tap the folder" puts them all back to tabs

   All five are the same stack at different card heights. That is the whole
   mechanism: the folders never move, their pages grow and shrink, and every
   state above is one height and one opacity away from its neighbour. Height is
   what the reference animates too — a page coming out of a folder gets taller,
   it does not slide in from somewhere else.

   The drawer files six of the nine — `filed` in lib/content.ts picks which,
   and in what order; the cards view is where the rest are. `--i` is a folder's
   place in the drawer and `--n` how many there are. Between them they carry
   the fan, the tab's step, and the stagger, so a seventh folder is one slug
   added to that list and nothing here. */

type Phase = "shut" | "open" | "spines";

/* How long the drawer sits shut before it unfolds. Long enough to register as
   a closed folder, short enough that nobody waits for it. */
const HOLD_MS = 900;

/* `settled` is for arriving from the card view: the drawer landing shut and
   unfolding is the page's opening beat, and a switch back is not an arrival —
   so it comes up already open, the way it would under `?motion=still`. */
export default function WorkFolders({ settled = false }: { settled?: boolean }) {
  /* `?motion=still` gets the drawer already open — there is no version of this
     page that is only reachable through an animation. Read once, at mount,
     because it decides the first frame. */
  const [phase, setPhase] = useState<Phase>(settled ? "open" : "shut");
  const [expanded, setExpanded] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settled) return;
    if (isStill()) {
      setPhase("open");
      return;
    }
    const timer = setTimeout(() => setPhase("open"), HOLD_MS);
    return () => clearTimeout(timer);
  }, [settled]);

  /* Pressing the paper puts things away, one layer at a time: an open page
     closes before the drawer it is lying in, so it takes two presses to get from
     a page you are reading back to a drawer of tabs. Escape does the same, for
     anyone with no "outside" to press on.

     `click`, not `pointerdown`. A press is not a decision: on a phone every
     scroll begins with a pointerdown on the background, and dismissing on that
     collapses the drawer out from under a thumb that was only moving the page.
     A click needs the press and the release in the same place, which is exactly
     the difference between choosing to leave and passing through.

     Bound only while there is something to close, so a drawer already put away
     costs nothing. The listener is attached from an effect, which runs after the
     click that opened the page has finished propagating — so that click cannot
     close what it just opened. */
  useEffect(() => {
    if (expanded === null && phase !== "open") return;

    const dismiss = () => {
      if (expanded !== null) setExpanded(null);
      else setPhase("spines");
    };

    const onOutside = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && !drawerRef.current?.contains(target)) dismiss();
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("click", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [expanded, phase]);

  /* The front folder is the drawer's own handle: it puts the pages away, and
     takes them back out. Closing the drawer closes whatever was expanded with
     it — a page cannot be open inside a folder that is shut. */
  const toggleDrawer = () => {
    setExpanded(null);
    /* Anything that is not open, opens. Only an open drawer files itself away —
       otherwise the handle would send a drawer that is already shut further
       shut, which from the visitor's side is a button that does nothing. */
    setPhase((p) => (p === "open" ? "spines" : "open"));
  };

  /* Opening a page opens the drawer if it was shut, so the tabs in state 5 are
     live rather than decorative. One page at a time: this is a folder on a
     desk, not an accordion. */
  const togglePage = (slug: string) => {
    setPhase("open");
    setExpanded((current) => (current === slug ? null : slug));
  };

  /* No heading of its own: the section around it (WorkView) carries the h1,
     and the drawer is named by the headline on its front folder. */
  return (
    <div
      className="drawer"
      ref={drawerRef}
      data-phase={phase}
      /* `--n` is how many folders sit in front of the front folder. The
           stylesheet insets each one by its distance from the front, and it is
           set here so that number can never drift from the list. */
      style={{ "--n": filed.length } as CSSProperties}
    >
      {filed.map((project, index) => {
        const isOpen = expanded === project.slug;
        const number = String(index + 1).padStart(2, "0");

        return (
          <article
            className="folder"
            key={project.slug}
            data-open={isOpen || undefined}
            style={{ "--i": index } as CSSProperties}
          >
            <div className="folder-sheet">
              {/* The page face. A button, not a link: clicking a page opens
                    it here (state 4) rather than leaving the drawer. The case
                    study is a link inside, once it is open. */}
              <button
                type="button"
                className="folder-face"
                aria-expanded={isOpen}
                onClick={() => togglePage(project.slug)}
              >
                {/* Title alone. The number and the tag chip used to sit over
                    it; the number still prints on the folder's tab, and the
                    tag went with the timeline into the opened page. */}
                <span className="folder-lead">
                  <span className="card-title">{project.title}</span>
                </span>

                <span className="card-outcome">{project.outcome}</span>
              </button>

              {/* Only rendered once opened. It carries a screenshot, and a
                    closed folder should not be paying for six of them. */}
              {isOpen && (
                <div className="folder-detail">
                  <img
                    className="folder-shot"
                    src={project.image}
                    srcSet={project.srcSet}
                    /* The open page is the widest folder less its padding.
                         token-exempt: media conditions, same as @media. */
                    sizes="(max-width: 820px) 88vw, 520px"
                    alt={`${project.title} — product screenshot`}
                    width={project.width}
                    height={project.height}
                  />

                  <div className="folder-facts">
                    <dl className="folder-meta">
                      <div>
                        <dt className="micro-label">Role</dt>
                        <dd>{project.role}</dd>
                      </div>
                      <div>
                        <dt className="micro-label">When</dt>
                        <dd>{project.timeline}</dd>
                      </div>
                      <div>
                        <dt className="micro-label">Team</dt>
                        <dd>{project.team}</dd>
                      </div>
                    </dl>

                    <div className="folder-actions">
                      <a className="folder-read" href={projectHref(project)}>
                        {work.readCase} <span aria-hidden="true">→</span>
                      </a>
                      <button
                        type="button"
                        className="folder-close"
                        onClick={() => setExpanded(null)}
                      >
                        {work.close}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* After the page, not before it. The notch belongs to the folder
                  and the page passes behind it — which is painting order, and
                  painting order among positioned siblings is tree order.

                  A button, because with the drawer put away the notch is the
                  only part of a folder big enough to aim at — the page is a
                  seven-pixel edge. It is hidden from assistive tech and out of
                  the tab order on purpose: `.folder-face` above is the same
                  action as a real, reachable control, and this is the pointer
                  shortcut to it rather than a second thing to find. */}
            <button
              type="button"
              className="folder-tab"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => togglePage(project.slug)}
            >
              <span className="folder-tab-no">{number}</span>
              <span>{work.tabSeparator}</span>
              <span>{project.title}</span>
            </button>
          </article>
        );
      })}

      {/* The front of the drawer: the label the six are filed behind, and
          the handle that files them. */}
      <div className="folder folder--front" style={{ "--i": filed.length } as CSSProperties}>
        {/* Shape only. It is the folder's own notch, not a label for it — the
              drawer is already named by the headline underneath. */}
        <span className="folder-tab folder-tab--front" aria-hidden="true" />

        <div className="folder-front-copy">
          <p className="folder-headline">
            {work.headline.folders}
            <span className="folder-headline-sub">{work.headlineSub}</span>
          </p>
          <p className="folder-line">{work.line}</p>

          <button type="button" className="folder-tap" onClick={toggleDrawer}>
            <svg className="folder-tap-arrow" viewBox="0 0 34 26" aria-hidden="true">
              <path d="M2 3 C 10 2, 18 8, 24 17" />
              <path d="M2 3 L 10 5 M2 3 L 4 11" />
            </svg>
            {phase === "open" ? work.tapShut : work.tap}
          </button>
        </div>
      </div>
    </div>
  );
}
