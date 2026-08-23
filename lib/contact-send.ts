/* Where a finished letter goes.

   The site is a static export (`output: "export"` in next.config.ts) — there is
   no server here to receive a POST, so the letter leaves by one of two doors:

   1. A form endpoint, if NEXT_PUBLIC_CONTACT_ENDPOINT names one. Any service
      that accepts a JSON POST and answers 2xx will do.
   2. Otherwise the visitor's own mail client, prefilled.

   Same progressive-enhancement shape the Places widget uses for its MapKit
   token: set the variable and the better path switches itself on, leave it
   unset and the page still works. */

import { contact, identity } from "./content";

export const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "";

export interface LetterDraft {
  name: string;
  email: string;
  message: string;
}

export type LetterField = keyof LetterDraft;

export const emptyDraft: LetterDraft = { name: "", email: "", message: "" };

/* Deliberately loose. This is a name-and-address line on a letter, not an
   identity check — the only mistake worth catching is the one that makes a
   reply impossible, and anything stricter starts rejecting real addresses. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function validate(draft: LetterDraft): Partial<Record<LetterField, string>> {
  const errors: Partial<Record<LetterField, string>> = {};
  if (!draft.message.trim()) errors.message = contact.errors.message;
  if (!draft.name.trim()) errors.name = contact.errors.name;
  if (!draft.email.trim()) errors.email = contact.errors.email;
  else if (!looksLikeEmail(draft.email)) errors.email = contact.errors.emailShape;
  return errors;
}

export const firstError = (errors: Partial<Record<LetterField, string>>): LetterField | null =>
  (["message", "name", "email"] as const).find((field) => errors[field]) ?? null;

export function mailtoHref(draft: LetterDraft): string {
  const subject = `A letter from ${draft.name.trim()}`;
  const body = `${draft.message.trim()}\n\n— ${draft.name.trim()}\n${draft.email.trim()}`;
  return `mailto:${identity.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* The endpoint path only. The mail-client path is not here on purpose: handing
   off to a mail client has to happen inside the click that asked for it, or the
   browser treats it as an unsolicited navigation and blocks it — so
   ContactStudio does that one synchronously and this never sees it. */
export async function postLetter(draft: LetterDraft, signal?: AbortSignal): Promise<boolean> {
  if (!contactEndpoint) return false;
  try {
    const response = await fetch(contactEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: draft.name.trim(),
        email: draft.email.trim(),
        message: draft.message.trim(),
      }),
      signal,
    });
    return response.ok;
  } catch {
    return false;
  }
}
