/* One square on the home page's Instagram card, streamed.

   This route exists for one reason: Instagram's `media_url` is a signed CDN
   URL that expires. The home page is prerendered HTML held for an hour, the
   CDN holds that HTML too, and a visitor's back button can produce it days
   later — all of which outlive the signature. So the page never holds a CDN
   URL. It holds /api/instagram/image/<media id>, and this resolves the live
   URL at the moment the browser asks and hands back the bytes.

   The id is not trusted. lib/instagram's `sourceFor` only answers for an id
   that is actually in the account's own listing, so this cannot be pointed at
   a URL of someone else's choosing.

   Nothing here is cached by Next — route handlers are uncached by default —
   but the bytes of a given post do not change, so the answer carries a long
   `s-maxage` and Vercel's CDN does the holding. The listing underneath is
   cached by lib/instagram for the same hour, which is why six squares on a
   page cost one call to Instagram rather than six.

   The bytes are also resized on the way through, which is not a nicety: what
   Instagram hands back is the original. One of these squares arrived as a
   4536×8064 JPEG weighing 4.7MB — to be drawn 120px wide. Six of those is a
   home page that costs seven megabytes. Through sharp at SQUARE it is 33KB,
   which is the same order as the local originals this card falls back to
   (lib/gallery.ts builds those at three widths for the same reason).

   With no token, or an id the account does not have, the <img> simply fails
   to load and the tile shows the card's own paper. */

import sharp from "sharp";
import { REVALIDATE_SECONDS, SQUARE, sourceFor } from "@/lib/instagram";

/** What a square may be. Instagram's CDN serves JPEG and the occasional WebP
    or PNG; anything else is not a picture this route should be passing on. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const source = await sourceFor(id).catch((error) => {
    console.error("instagram: could not resolve a square's source", error);
    return null;
  });

  /* No token, Instagram refusing, or an id that is not this account's: all
     the same answer, because telling them apart would tell a caller which
     ids exist. */
  if (!source) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const upstream = await fetch(source, { next: { revalidate: REVALIDATE_SECONDS } }).catch(
    (error) => {
      console.error("instagram: the CDN did not answer", error);
      return null;
    }
  );

  if (!upstream?.ok || !upstream.body) {
    /* Usually a signature that went stale between the listing and now. The
       next hour's listing fixes it, so this is not cached. */
    console.error(`instagram: the CDN answered ${upstream?.status ?? "nothing"}`);
    return new Response(null, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const type = upstream.headers.get("content-type") ?? "";
  if (!IMAGE_TYPES.some((allowed) => type.startsWith(allowed))) {
    console.error(`instagram: the CDN served ${type || "no content type"}`);
    return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  /* A post's pixels never change, so this can be held far longer than the
     listing that found it — a day at the CDN, a week once it is stale. */
  const headers = {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  };

  const original = Buffer.from(await upstream.arrayBuffer());

  const square = await sharp(original)
    .resize(SQUARE, SQUARE, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer()
    .catch((error) => {
      /* A picture sharp cannot read is still a picture the browser might: a
         heavy tile beats an empty one, so the original goes out instead. */
      console.error("instagram: could not resize a square", error);
      return null;
    });

  return square
    ? new Response(new Uint8Array(square), {
        headers: { ...headers, "Content-Type": "image/webp" },
      })
    : new Response(new Uint8Array(original), {
        headers: { ...headers, "Content-Type": type },
      });
}
