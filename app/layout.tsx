import type { Metadata } from "next";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* components/MotionFlag.tsx writes data-motion onto this element from a
       blocking script, before React ever reaches it. */
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
