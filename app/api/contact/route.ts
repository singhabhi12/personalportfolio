/* The letterbox's back wall: where a posted letter actually goes.

   ContactStudio POSTs { name, email, message } here while the send animation
   plays. This turns it into an email to the address in lib/content and answers
   2xx when the mail service accepts it — anything else and the studio shows
   its "came back" panel, with the visitor's words intact and a mailto link as
   the plain way out.

   Delivery is Resend's REST API over fetch — one secret, no SDK. Reply-To is
   the visitor, so answering the mail is answering the visitor. */

import { identity } from "@/lib/content";
import { looksLikeEmail } from "@/lib/contact-send";

const RESEND_URL = "https://api.resend.com/emails";

/* Resend's own shared sender works without a domain of yours on file, for
   mail to the address that owns the API key — which is the whole use here.
   Verify a domain later and CONTACT_FROM swaps the sender without a deploy. */
const DEFAULT_FROM = "Portfolio <onboarding@resend.dev>";

/* Generous for a letter, tight enough that this is not a free relay. */
const LIMITS = { name: 200, email: 320, message: 10_000 } as const;

type Letter = { name: string; email: string; message: string };

function readLetter(body: unknown): Letter | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const pick = (key: keyof Letter) =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";
  const letter = { name: pick("name"), email: pick("email"), message: pick("message") };
  if (!letter.name || !letter.message || !looksLikeEmail(letter.email)) return null;
  if (
    letter.name.length > LIMITS.name ||
    letter.email.length > LIMITS.email ||
    letter.message.length > LIMITS.message
  )
    return null;
  return letter;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    /* Not the visitor's fault: say so in the log, let the studio fall back. */
    console.error("contact: RESEND_API_KEY is not set; letter not delivered");
    return Response.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }

  const letter = readLetter(await request.json().catch(() => null));
  if (!letter) return Response.json({ ok: false, reason: "invalid" }, { status: 400 });

  /* Same shape the mailto path writes, so a letter reads the same however it
     arrived. Plain text: a typewriter does not send HTML. */
  const text = `${letter.message}\n\n— ${letter.name}\n${letter.email}`;

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || DEFAULT_FROM,
      to: [identity.email],
      reply_to: letter.email,
      subject: `A letter from ${letter.name}`,
      text,
    }),
  }).catch(() => null);

  if (!response?.ok) {
    console.error("contact: delivery failed", response?.status, await response?.text());
    return Response.json({ ok: false, reason: "delivery" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
