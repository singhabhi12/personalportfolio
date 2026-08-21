import type { ReactNode } from "react";

/* The base every desk object extends: white, 24px radius, 24px padding,
   whisper shadow, tracked label header (§7). Card styling is declared here and
   in the `.widget` rule — never re-declared per component. */
export default function WidgetCard({
  label,
  glyph,
  size = "md",
  as: Tag = "div",
  className,
  children,
}: {
  label?: string;
  /** One glyph from the §9 budget, rendered decoratively after the label. */
  glyph?: string;
  size?: "md" | "lg";
  as?: "div" | "section" | "article" | "figure";
  className?: string;
  children: ReactNode;
}) {
  const classes = ["widget", size === "lg" && "widget--lg", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes}>
      {label && (
        <p className="widget-label">
          {label}
          {glyph && (
            <>
              {" "}
              <span aria-hidden="true">{glyph}</span>
            </>
          )}
        </p>
      )}
      {children}
    </Tag>
  );
}
