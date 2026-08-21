import { contact, identity } from "@/lib/content";

/* Plain card — the site's one gradient is spent on Currently Cooking.
   The ink pill is the only filled button on the site (§7).

   This is the whole of /contact, so the lead line carries the page's h1;
   `.contact-line` supplies every type token, so the tag swap is invisible. */
export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-card">
        <p className="widget-label">{contact.label}</p>
        <h1 className="contact-line">{contact.line}</h1>
        <a className="btn-ink" href={identity.intro}>
          {contact.cta}
        </a>
        <a className="contact-email" href={`mailto:${identity.email}`}>
          {identity.email}
        </a>
      </div>
    </section>
  );
}
