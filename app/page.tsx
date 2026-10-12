import PageFrame from "@/components/PageFrame";
import Desk from "@/components/Desk";

/* Home: one screen of cards (components/Desk.tsx). Everything past it lives
   on its own route — Work, Life, Canvas, Contact. `bare` drops the whisper
   and the stamp; the nav capsule stays, floating over the photograph. */
export default function Home() {
  return (
    <PageFrame active="home" bare>
      <Desk />
    </PageFrame>
  );
}
