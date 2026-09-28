import type { Metadata, Viewport } from "next";

/* Three voices, strict roles (§4). Self-hosted rather than loaded from
   Google — the site is served to a German audience and the fonts are part of
   the build, not a third-party request. */
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/caveat/700.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Abhishek Singh — UX Designer, Hamburg",
  description:
    "UX designer in Hamburg with 3+ years across event tech, Web3, and marketplaces. Structure first, then speed, then story.",
};

/* Safari paints its tab bar and the iPhone status bar in this colour, so
   the browser's own chrome is the same paper the page is. One value: the site
   has no dark scheme. The paper token lives in globals.css; this is the one
   place it has to be repeated, because the tag is written before any
   stylesheet is. */
export const viewport: Viewport = {
  themeColor: "#f7f5f1", // token-exempt: --color-paper
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* components/MotionFlag.tsx writes data-motion onto this element from a
       blocking script, before React ever reaches it. */
    <html lang="en" suppressHydrationWarning>
      {/* And this one is for other people's scripts. Extensions that bind a
          keyboard shortcut mark the body to say so — ColorZilla writes
          `cz-shortcut-listen`, and it is not the only one — and they do it
          before React hydrates, so React finds an attribute the server never
          sent and reports a mismatch on every page load. The server output is
          bare `<body>`; verified against a clean browser profile, which raises
          no hydration error on any route.

          It suppresses this element only. React does not inherit the flag down
          the tree, so a real mismatch anywhere inside still reports normally —
          which is the whole reason this sits on `<body>` and not higher. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
