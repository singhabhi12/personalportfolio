import type { ReactNode } from "react";
import MotionFlag from "./MotionFlag";
import NavCapsule, { type NavKey } from "./NavCapsule";
import StampTime from "./StampTime";
import { stamp, whisper } from "@/lib/content";

/* Shared page shell: floating nav capsule, corner whisper, footer stamp.
   Cards never touch the viewport edge — the frame's padding guarantees it. */
export default function PageFrame({
  active,
  children,
}: {
  active: NavKey;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <MotionFlag />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* `data-page` lets a route ask for a shell of its own without a second
          frame component. /contact is the one that does: it is a single
          composition rather than a stack of sections, and it has to fit the
          screen it is looked at on. */}
      <div className="frame" data-page={active}>
        {/* Phase 2 cursor-play hook. Harmless static text until then — the
            pointer is what makes it read as the cursor's own aside. */}
        <span className="whisper" data-whisper aria-hidden="true">
          <svg
            className="whisper-cursor"
            viewBox="0 0 12 14"
            width={11}
            height={13}
            focusable="false"
          >
            <path d="M1 1 L11 7.6 L6.2 8.3 L4.3 12.8 Z" fill="var(--color-muted)" />
          </svg>
          {whisper}
        </span>

        <NavCapsule active={active} />

        <main id="main">{children}</main>

        <footer className="stamp">
          <div>
            <StampTime /> · {stamp.weather}
          </div>
          <div>{stamp.copyright}</div>
        </footer>
      </div>
    </div>
  );
}
