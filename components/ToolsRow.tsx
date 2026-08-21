import { tools } from "@/lib/content";

/* Real app icons at native colors — a sanctioned multicolor moment (§7).
   They sit on a white dock, the way running apps sit in a tray. At rest it is
   icons and nothing else: the ring and the name only arrive under the cursor.

   `direction` picks the tray's axis — a row on the desk, a standing strip
   beside the gallery tile. Below 860px the column lies back down, where a
   full-width vertical strip would be a very tall thin nothing. */
export default function ToolsRow({
  direction = "row",
}: {
  direction?: "row" | "column";
}) {
  return (
    <div className="dock" data-direction={direction}>
      {tools.map((tool) => (
        <span key={tool.name} className="dock-slot">
          <img
            className="tool-icon"
            src={tool.icon}
            alt={tool.name}
            width={44}
            height={44}
          />
          <span className="tool-tip" aria-hidden="true">
            {tool.name}
          </span>
        </span>
      ))}
    </div>
  );
}
