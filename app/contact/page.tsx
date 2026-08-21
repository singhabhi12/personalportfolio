import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact — Abhishek Singh",
  description:
    "A project, a role, or an idea worth building — book an intro call or send an email.",
};

/* Contact: the collaborate card for now. More lands here next. */
export default function ContactPage() {
  return (
    <PageFrame active="contact">
      <Contact />
    </PageFrame>
  );
}
