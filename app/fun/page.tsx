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
    <PageFrame active="fun" bento>
      <div className="fun">
        {/* The head card every bento page opens with: the label and a quiet
            fact about the thing, then one line in the lead face. */}
        <header className="hcard fun-head">
          <p className="hcard-head">
            <span>{fun.label}</span>
            <span>{fun.size}</span>
          </p>
          <h1 className="fun-line">{fun.line}</h1>
          <p className="fun-note">{fun.note}</p>
        </header>

        <Gomoku />
      </div>
    </PageFrame>
  );
}
