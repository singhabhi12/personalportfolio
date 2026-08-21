import Link from "next/link";

/* Nav is Home · Work · Life · Contact. Each item is its own route — no
   home-page anchors. Life is the About page plus the photo gallery. */
const items = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "life", label: "Life", href: "/life" },
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
