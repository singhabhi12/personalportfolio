import Link from "next/link";

/* Nav is Home · Work · Life · Canvas · Contact. Each item is its own route —
   no home-page anchors. Life is the About page plus the photo gallery.

   Canvas sits fourth rather than last: Contact is the one thing the site is
   asking for, so it keeps the end of the row. */
const items = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "life", label: "Life", href: "/life" },
  /* Off the capsule on a phone. The Canvas needs a surface and a hand, and
     under 760px it is not offered at all — see the handheld block in
     components/CanvasStudio.tsx. The link is dropped rather than dimmed:
     `display: none` takes it out of the tab order and out of a screen
     reader's reading of the nav too, which "greyed out" would not. The route
     is still there and still answers, for anyone arriving on one. */
  { key: "canvas", label: "Canvas", href: "/canvas", handheld: false },
  { key: "contact", label: "Contact", href: "/contact" },
] as const;

export type NavKey = (typeof items)[number]["key"];

/* Active = 6px status dot + ink text. Inactive = muted. The dot is the only
   color in the nav. */
export default function NavCapsule({ active }: { active: NavKey }) {
  return (
    <div className="nav-wrap">
      <nav className="nav-capsule" aria-label="Primary">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="nav-link"
              data-handheld={"handheld" in item ? "off" : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && <span className="nav-dot" aria-hidden="true" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
