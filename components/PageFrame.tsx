import type { ReactNode } from "react";
import MotionFlag from "./MotionFlag";
import NavCapsule, { type NavKey } from "./NavCapsule";
import StampTime from "./StampTime";
import Weather from "./Weather";
import { stamp, whisper } from "@/lib/content";

/* Shared page shell: floating nav capsule, corner whisper, footer stamp.
   Cards never touch the viewport edge — the frame's padding guarantees it. */
export default function PageFrame({
  active,
  bare = false,
  bento = false,
  children,
}: {
  active: NavKey;
  /** No whisper and no stamp, only the capsule: for a page that is one
      screen of its own and has no corner or foot to spare. Home is — on a
      laptop the capsule floats over its photograph rather than taking a row
      (see "Home" in app/globals.css). */
  bare?: boolean;
  /** Lay the route out on the site's bento: the wide frame, the tight gutter,
      and cards in tracks ("The bento" in app/globals.css). Everything but the
      case study and the gallery takes it; /contact takes the gutter and keeps
      its own one-screen stage. */
  bento?: boolean;
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
      <div className="frame" data-page={active} data-bento={bento || undefined}>
        {/* Phase 2 cursor-play hook. Harmless static text until then — the
            pointer is what makes it read as the cursor's own aside. */}
        {!bare && (
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
        )}

        <NavCapsule active={active} />

        <main id="main">{children}</main>

        {!bare && (
          <footer className="stamp">
            <div>
              <StampTime /> · <Weather fallback={stamp.weather} credit />
            </div>
            <div>{stamp.copyright}</div>
          </footer>
        )}
      </div>
    </div>
  );
}
