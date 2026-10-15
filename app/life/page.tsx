import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import PlacesWidget from "@/components/PlacesWidget";
import GalleryPreview from "@/components/GalleryPreview";
import ListeningWidget from "@/components/ListeningWidget";
import StickerSheet from "@/components/StickerSheet";
import ToolsRow from "@/components/ToolsRow";
import { about, home, type AboutSection, type Run } from "@/lib/content";

export const metadata: Metadata = {
  title: "Life — Abhishek Singh",
  description:
    "Where I'm from, what I do now, and what I'm looking for. A UX designer's desk in Hamburg.",
};

/* Which card each section of the biography lands on. Named rather than
   indexed, so re-ordering lib/content.ts re-orders the page instead of
   shuffling it — and anything not named here falls into the work track
   rather than off the page, which is what makes adding a section safe.

   Three sections down the first track and two down the second, rather than
   two and three: the first track opens with the heading, so it carries a card
   and a half of chrome the second one does not, and the old split left it
   ending a third of a page above everything beside it. */
const LEAD = "Where I'm from";
const ME = ["What I used to do", "Where I'm at now"];
const WORK = ["What I do now"];
/* The one gradient surface on this page, as the availability card is on home:
   the section a visitor came to read if they came to hire. */
const FEATURED = "What I'm looking for";

const placed = new Set([LEAD, ...ME, ...WORK, FEATURED]);

const find = (label: string) => about.sections.find((section) => section.label === label);
const pick = (labels: string[]) =>
  labels.map(find).filter((section): section is AboutSection => Boolean(section));

const lead = find(LEAD);
const featured = find(FEATURED);
/* Everything lib/content.ts has that this file does not name. */
const unplaced = about.sections.filter((section) => !placed.has(section.label));

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

/* One section of the biography, one card — the head line naming it the way
   every card on this site names itself. The card's own surface is passed in,
   because the last of them is the gradient one. */
function AboutCard({
  section,
  className = "hcard",
}: {
  section: AboutSection;
  className?: string;
}) {
  return (
    <section className={className}>
      <p className="hcard-head">
        <span>{section.label}</span>
      </p>
      <Body section={section} />
    </section>
  );
}

function Body({ section }: { section: AboutSection }) {
  return (
    <>
      {section.placeholder ? (
        <p className="about-placeholder">
          <span className="ph-mark">◍ placeholder</span> — {section.placeholder}
        </p>
      ) : (
        section.runs && <Prose runs={section.runs} />
      )}
      {section.aside && <p className="about-aside">{section.aside}</p>}
    </>
  );
}

/* Life, on the house bento (app/globals.css, "The bento"). Four tracks, split
   by what they are for the way home's are: who I am down the left, the work
   beside it, what is live after that, and what I look at on the end. The one
   tall prose card this replaced held all five sections at once, which made the
   page a column of text with widgets parked next to it; a section to a card is
   the same words at the density the rest of the site reads at.

   Each track ends where the others do, which is a thing the track has to be
   built for rather than a thing the words happen to do: every one of them
   carries a card that can be any height, and that card takes whatever the
   fixed ones leave — the heading card here, the gradient in the work track,
   the map beside it, the photograph on the end (app/globals.css, "Life").
   Which is also why the biography splits three and two: with the heading on
   the first card, three sections and two are the even halves, and the slack
   each track hands its elastic card stays small enough to read as air.

   The desk items lie over the whole grid as stickers (StickerSheet), which is
   why the grid is wrapped rather than the cards: a sticker can be dragged from
   one column to the other, or off the edge of a card. */
export default function Life() {
  return (
    <PageFrame active="life" bento>
      <StickerSheet>
        <div className="life-bento">
          {/* ---- Left: who I am. The heading card holds the page's title and
                 the first section, and it is this track's elastic card: the
                 air it takes is air under a title, which is the one place on
                 the page where empty space reads as typography. ---- */}
          <div className="life-col">
            <section className="hcard life-lead">
              <h1 className="about-heading">
                {about.heading}{" "}
                <span className="glyph" aria-hidden="true">
                  {about.glyph}
                </span>
              </h1>
              {lead && (
                <>
                  <p className="hcard-head">
                    <span>{lead.label}</span>
                  </p>
                  <Body section={lead} />
                </>
              )}
            </section>

            {pick(ME).map((section) => (
              <AboutCard key={section.label} section={section} />
            ))}
          </div>

          {/* ---- Middle: the work, and what I want next ---- */}
          <div className="life-col">
            {[...pick(WORK), ...unplaced].map((section) => (
              <AboutCard key={section.label} section={section} />
            ))}

            {/* The one gradient surface on the page, as home's availability
                card is on home — and last, because it is the last thing the
                biography says. It is also this track's elastic card, which is
                the right one to be: the colour is the page's loudest thing and
                a visitor who came to hire is meant to land on it, so the room
                it takes is room it earns.

                A column is a contiguous slice of the reading order: on a phone
                the tracks stack in the order they are written, so a card moved
                for the sake of a tidier bottom edge on a laptop is a card that
                interrupts the story on a phone. Which is why the two tracks
                were re-split rather than re-ordered — the five sections still
                read from, used to, at now, do now, looking for, top to bottom
                and left to right. */}
            {featured && (
              <AboutCard section={featured} className="hcard hcard--gradient" />
            )}
          </div>

          {/* ---- Right: the two live cards — where I've been, and what is
                 playing. The map is this track's elastic card: it is a window
                 on a continent and a half, and it can be any height up to
                 about square without becoming a window on the sea. ---- */}
          <div className="life-col">
            <PlacesWidget />
            <ListeningWidget />
          </div>

          {/* ---- And what I look at, and what I work with. The photograph
                 takes this track's slack first and the deck takes what is left
                 over, because a photograph has a shape and this one is held to
                 it: the gallery is two parts 3:4 to one part 4:3, and a frame
                 that ran the whole height of the grid showed about a third of
                 a landscape picture (app/globals.css, "Squaring the tracks").
                 Near square, the crop is the same bite out of either. ---- */}
          <div className="life-col">
            <GalleryPreview />

            <section className="hcard tools-card" aria-label={home.tools.label}>
              <p className="hcard-head">
                <span>{home.tools.label}</span>
                <span>{home.tools.note}</span>
              </p>
              <ToolsRow />
            </section>
          </div>
        </div>
      </StickerSheet>
    </PageFrame>
  );
}
