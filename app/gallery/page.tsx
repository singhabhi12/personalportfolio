import type { Metadata } from "next";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import MotionFlag from "@/components/MotionFlag";

export const metadata: Metadata = {
  title: "Gallery — Abhishek Singh",
  description:
    "Photographs from Hamburg and elsewhere, as a strip rolling past a lens, opening into a lightbox.",
};

/* The gallery on its own route, and on its own screen. No frame: no nav
   capsule, no whisper, no stamp, no title — the strip is the whole viewport
   and the one control is the way back to Life, which is where the tile that
   leads here lives. MotionFlag comes along because PageFrame is what usually
   carries it, and `?motion=still` has to reach this route too. */
export default function GalleryPage() {
  return (
    <div className="gallery-screen">
      <MotionFlag />
      <Link className="gallery-back" href="/life">
        <span aria-hidden="true">←</span> Back
      </Link>
      <main id="main" className="gallery-main">
        <Gallery />
      </main>
    </div>
  );
}
