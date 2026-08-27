import PageFrame from "@/components/PageFrame";
import Desk from "@/components/Desk";

/* Home: the desk, and nothing after it. Everything past the hero lives on its
   own route — Work, Life, Contact.

   The Kind Words section used to sit under the desk and print both quotes in
   full. It came out when the desk's own quote card started cycling all of them:
   the same two testimonials, twice on one page, with the card reduced to a
   preview of the section below it.

   Experience lives in the manifesto column, de-carded, per the approved shell. */
export default function Home() {
  return (
    <PageFrame active="home">
      <Desk />
    </PageFrame>
  );
}
