import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import PlacesWidget from "@/components/PlacesWidget";
import GalleryPreview from "@/components/GalleryPreview";
import ListeningWidget from "@/components/ListeningWidget";
import StickerSheet from "@/components/StickerSheet";
import ToolsRow from "@/components/ToolsRow";
import WidgetCard from "@/components/WidgetCard";
import { about, type Run } from "@/lib/content";

export const metadata: Metadata = {
  title: "Life — Abhishek Singh",
  description:
    "Where I'm from, what I do now, and what I'm looking for. A UX designer's desk in Hamburg.",
};

function Prose({ runs }: { runs: Run[] }) {
  return (
    <p className="about-body">
      {runs.map((run, index) => {
        if (run.t === "link") {
          return (
            <a className="about-link link-sweep" key={index} href={run.href}>
              {run.v}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          );
        }
        if (run.t === "hint") {
          return (
            <span className="about-hint" key={index}>
              {run.v}
            </span>
          );
        }
        return <span key={index}>{run.v}</span>;
      })}
    </p>
  );
}

/* Life: prose card left, widget stack right. The photos are their own route
   now — the gallery tile links out to /gallery.
   No gradient on this page (§5) — that budget is spent on the home desk.

   The desk items lie over the whole grid as stickers (StickerSheet), which is
   why the grid is wrapped rather than the cards: a sticker can be dragged from
   one column to the other, or off the edge of a card. */
export default function Life() {
  return (
    <PageFrame active="life">
      <StickerSheet>
        <div className="about-grid">
          <WidgetCard as="article" size="lg">
            <h1 className="about-heading">
              {about.heading}{" "}
              <span className="glyph" aria-hidden="true">
                {about.glyph}
              </span>
            </h1>

            {about.sections.map((section) => (
              <section className="about-section" key={section.label}>
                <h2 className="widget-label">{section.label}</h2>

                {section.placeholder ? (
                  <p className="about-placeholder">
                    <span className="ph-mark">◍ placeholder</span> —{" "}
                    {section.placeholder}
                  </p>
                ) : (
                  section.runs && <Prose runs={section.runs} />
                )}

                {section.aside && (
                  <p className="about-aside">{section.aside}</p>
                )}
              </section>
            ))}
          </WidgetCard>

          {/* Map across the top, then the gallery tile with the deck standing
            beside it, then the song on at the bottom. */}
          <div className="side-grid">
            <PlacesWidget />
            <GalleryPreview />
            <ToolsRow direction="column" />
            <ListeningWidget />
          </div>
        </div>
      </StickerSheet>
    </PageFrame>
  );
}
