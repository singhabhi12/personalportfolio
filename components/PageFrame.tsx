import type { ReactNode } from "react";
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
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="frame">
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
