import { quotes } from "@/lib/content";

/* Plain band on paper, not a card — it sits directly under the Work grid and a
   card here would read as cards-within-cards against six project cards above.
   No avatars, no quotation glyphs (§7). */
export default function KindWords() {
  return (
    <section className="section section--reading" id="words">
      <h2 className="section-title">Kind words</h2>
      <div className="quotes">
        {quotes.map((quote) => (
          <figure key={quote.attribution}>
            <blockquote className="quote-text">{quote.text}</blockquote>
            <figcaption className="quote-attribution">{quote.attribution}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
