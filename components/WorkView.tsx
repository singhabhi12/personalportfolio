"use client";

import { useEffect, useState } from "react";
import WorkCards from "./WorkCards";
import WorkFolders from "./WorkFolders";
import { work } from "@/lib/content";

type View = "folders" | "cards";

/* Remembered per browser, as a convenience rather than a setting: nothing
   reads it back but this page, and it is fine for it to come back empty. */
const STORAGE_KEY = "work-view";

const readStored = (): View | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "cards" || stored === "folders" ? stored : null;
  } catch {
    return null;
  }
};

/* /work, two ways. The drawer is the page's own idea and the way it lands,
   with six of the nine filed in it; the cards are the plainer view, all nine
   on the table at once. One button, floating bottom right, and the choice
   sticks.

   The section and its h1 live here rather than in either view, so the route
   is named the same whichever is showing. In the drawer the heading is off
   the page — the front folder carries the headline — and in the cards it is
   the headline, since nothing else on the page says it. */
export default function WorkView() {
  const [view, setView] = useState<View>("folders");
  /* Whether the visitor has switched at all. The drawer plays its opening
     beat once, on arrival; a switch back to it is not an arrival. */
  const [switched, setSwitched] = useState(false);

  /* Server and first client render agree on the drawer; the remembered
     choice lands a frame later, before the drawer has done more than sit
     shut. */
  useEffect(() => {
    const stored = readStored();
    if (stored && stored !== "folders") {
      setView(stored);
      setSwitched(true);
    }
  }, []);

  const choose = (next: View) => {
    setView(next);
    setSwitched(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Private window, blocked storage: the switch still works for the visit. */
    }
  };

  const cards = view === "cards";
  const other: View = cards ? "folders" : "cards";

  return (
    <section className="section" id="work">
      {cards ? (
        <div className="work-head">
          <h1 className="work-title">
            {work.headline.cards}
            <span className="work-title-sub">{work.headlineSub}</span>
          </h1>
          <p className="work-line">{work.line}</p>
        </div>
      ) : (
        /* Off the page rather than out of it. The design does not want a
           heading over the drawer — but a route with no h1 has no name in a
           screen reader's outline and none in a search result either, so
           the words stay and only the type goes. */
        <h1 className="sr-only">Work</h1>
      )}

      {cards ? <WorkCards /> : <WorkFolders settled={switched} />}

      {/* The switch. Floats in the corner rather than sitting in the page, so
          it is in the same place at the top of the drawer and at the foot of
          the ninth card. It shows the view it would take you to. */}
      <button
        type="button"
        className="view-fab"
        aria-label={work.switchTo[other]}
        title={work.switchTo[other]}
        onClick={() => choose(other)}
      >
        {cards ? <FolderIcon /> : <CardsIcon />}
      </button>
    </section>
  );
}

/* Two marks, drawn in the current ink at a 20px grid. Line icons, one
   weight, no fill — the same hand as the nav's dot and the drawer's arrow. */
function FolderIcon() {
  return (
    <svg className="view-fab-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h3.6l1.8 2H16a1.5 1.5 0 0 1 1.5 1.5V15A1.5 1.5 0 0 1 16 16.5H4A1.5 1.5 0 0 1 2.5 15z" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg className="view-fab-icon" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}
