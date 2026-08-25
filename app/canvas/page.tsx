import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import CanvasStudio from "@/components/CanvasStudio";

export const metadata: Metadata = {
  title: "The Canvas — Abhishek Singh",
  description:
    "A sheet, a handful of pens, and nobody watching. Draw something, pin it to the wall, or take it home as a PNG.",
};

/* The Canvas: the desk handed over to whoever is looking at it. Drawing is
   Drawesome (MIT); the wall around it is ours. */
export default function CanvasPage() {
  return (
    <PageFrame active="canvas">
      <CanvasStudio />
    </PageFrame>
  );
}
