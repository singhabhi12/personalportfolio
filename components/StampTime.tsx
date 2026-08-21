import { stamp } from "@/lib/content";

/* Isolated so Phase 2 can make it live without touching the footer.
   To activate: add "use client", swap the static `stamp.time` for a
   `useEffect` that formats `Europe/Berlin` on an interval, and render the
   static value as the SSR fallback so nothing shifts on hydration. */
export default function StampTime() {
  return (
    <span data-stamp-time>
      {stamp.place} {stamp.time}
    </span>
  );
}
