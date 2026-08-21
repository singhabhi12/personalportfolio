import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery — Abhishek Singh",
  description:
    "Photographs from Hamburg and elsewhere. Soft masonry at natural aspect ratios, opening into a lightbox.",
};

/* The gallery on its own route. It used to be an anchor at the foot of /life;
   it is a page now, and the Life tile links here.

   Nav stays Home · Work · Life · Contact, so Life carries the active state
   while a visitor is here — the gallery is part of Life, not a fifth section. */
export default function GalleryPage() {
  return (
    <PageFrame active="life">
      <Gallery />
    </PageFrame>
  );
}
