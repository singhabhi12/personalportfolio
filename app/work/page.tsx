import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import WorkView from "@/components/WorkView";

export const metadata: Metadata = {
  title: "Work — Abhishek Singh",
  description:
    "Selected product and UX work across voice AI, event tech, Web3, and marketplaces. Nine cases, each with the problem, the trade-offs, and the outcome.",
};

/* Work: six in the drawer, or all nine as cards — the visitor's choice. Each
   folder or card opens /work/[slug]. */
export default function Work() {
  return (
    <PageFrame active="work">
      <WorkView />
    </PageFrame>
  );
}
