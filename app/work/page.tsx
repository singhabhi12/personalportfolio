import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import WorkGrid from "@/components/WorkGrid";

export const metadata: Metadata = {
  title: "Work — Abhishek Singh",
  description:
    "Selected product and UX work across event tech, Web3, and marketplaces. Six cases, each with the problem, the trade-offs, and the outcome.",
};

/* Work: the project grid, and nothing else. Each card opens /work/[slug]. */
export default function Work() {
  return (
    <PageFrame active="work">
      <WorkGrid />
    </PageFrame>
  );
}
