import type { Metadata } from "next";
import PageFrame from "@/components/PageFrame";
import Gomoku from "@/components/Gomoku";
import { fun } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fun — Abhishek Singh",
  description:
    "Gomoku. Five in a row against something that reads the board one move out. No account, no clock, no uploads.",
};

/* Fun: the one page that hands the desk over. Everything else here shows you
   something; this gives you a board and gets out of the way.

   The head is static text and stays on the server. Only the board is a client
   component, which is the whole of what this route ships. */
export default function FunPage() {
  return (
    <PageFrame active="fun">
      <div className="fun">
        {/* The same head /contact opens with: a label, then one line in the
            lead face. Pages built the same way should open the same way. */}
        <header className="fun-head">
          <p className="widget-label">{fun.label}</p>
          <h1 className="fun-line">{fun.line}</h1>
          <p className="fun-note">{fun.note}</p>
        </header>

        <Gomoku />
      </div>
    </PageFrame>
  );
}
