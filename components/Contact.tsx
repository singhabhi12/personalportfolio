import ContactStudio from "./ContactStudio";

/* /contact is a writing desk: a typewriter you type into, the sheet it feeds,
   and the box that sheet is posted to. All of it — form, scene, choreography —
   lives in ContactStudio; this file exists so the route keeps a plain section
   wrapper and the page file keeps its shape. */
export default function Contact() {
  return (
    <section className="contact" id="contact">
      <ContactStudio />
    </section>
  );
}
