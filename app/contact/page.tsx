import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact — Abhishek Singh",
  description:
    "A project, a role, or an idea worth building — write it on the typewriter and post it.",
};

/* Contact: the writing desk. Server-rendered form, scene layered over it. */
export default function ContactPage() {
  return (
    <PageFrame active="contact">
      <Contact />
    </PageFrame>
  );
}
