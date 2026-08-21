import PageFrame from "@/components/PageFrame";
import Desk from "@/components/Desk";
import KindWords from "@/components/KindWords";

/* Home: the desk, then Kind Words. Everything past the hero now lives on its
   own route — Work, Life, Contact.
   Experience lives in the manifesto column, de-carded, per the approved shell. */
export default function Home() {
  return (
    <PageFrame active="home">
      <Desk />
      <KindWords />
    </PageFrame>
  );
}
