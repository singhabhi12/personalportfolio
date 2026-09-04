/* A blocking inline script that React will render without complaining.

   React only executes a <script> when the HTML parser meets it; one produced by
   a client render is inert, so React warns in dev whenever a component returns
   a script tag — the warning cannot tell the SSR pass (where the tag is the
   whole point) from the client pass (where it does nothing). The type attribute
   is what separates them: `text/javascript` in the server output, so the parser
   runs it on a hard load, and `text/plain` on the client, so React sees an
   ordinary inert tag and stays quiet. suppressHydrationWarning covers the
   mismatch between the two, which is deliberate.

   This is the shape Next documents for the case — see
   node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
   Anything that has to run before the first paint needs a companion effect for
   client navigations, where no parser is involved; MotionFlag is the example. */
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
