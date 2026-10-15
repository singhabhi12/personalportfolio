/* One frame of the reel, streamed — the story overlay's pictures and, when
   Instagram serves one, its video.

   This is app/api/instagram/image's twin and exists for the same single
   reason: `media_url` and `thumbnail_url` are signed CDN URLs that expire.
   They expire sooner than the page that would carry them, and a story is a
   thing someone might open an hour after the page was built. So nothing in
   the page is ever a CDN URL — it is /api/instagram/story/<media id>, and
   this resolves the live one at the moment the browser asks.

   The id is not trusted. lib/instagram's `storySourceFor` only answers for an
   id that is in the account's own live stories, so this cannot be pointed at
   a URL of someone else's choosing — and a story that has expired stops
   resolving the moment Instagram stops listing it.

   What the twin does differently is the size. A square is drawn 120px wide
   and is resized to 320 on the way through; a story fills the screen, so it
   is resized to STORY_WIDTH and no further. The video is not touched at all:
   it is passed through as it arrives, because re-encoding a video in a route
   handler is a different kind of project. Instagram's are short and small,
   and the overlay is the only thing that asks for one. */

import sharp from "sharp";
import {
  STORY_REVALIDATE_SECONDS,
  STORY_WIDTH,
  storySourceFor,
} from "@/lib/instagram";

/** What a frame may be. Instagram's CDN serves JPEG for the stills and MP4
    for the videos; anything else is not a story this route should pass on. */
const PICTURE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "application/octet-stream"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const want = new URL(request.url).searchParams.has("video") ? "video" : "picture";

  const source = await storySourceFor(id, want).catch((error) => {
    console.error("instagram: could not resolve a story frame", error);
    return null;
  });

  /* No token, Instagram refusing, an id this account does not have, a story
     that has expired since the page was loaded, or a video Instagram will not
     serve: all the same answer, because telling them apart would tell a
     caller which ids exist. The overlay reads a failed picture as a frame it
     cannot show and says so. */
  if (!source) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const upstream = await fetch(source, {
    next: { revalidate: STORY_REVALIDATE_SECONDS },
  }).catch((error) => {
    console.error("instagram: the CDN did not answer for a story frame", error);
    return null;
  });

  if (!upstream?.ok || !upstream.body) {
    /* Usually a signature that went stale between the listing and now. The
       next listing fixes it, so this is not cached. */
    console.error(`instagram: the CDN answered ${upstream?.status ?? "nothing"}`);
    return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  const type = upstream.headers.get("content-type") ?? "";
  const allowed = want === "video" ? VIDEO_TYPES : PICTURE_TYPES;
  if (!allowed.some((kind) => type.startsWith(kind))) {
    console.error(`instagram: the CDN served ${type || "no content type"} for a story`);
    return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  /* A story's bytes never change, and the id stops resolving the moment the
     story expires — so this can be held as long as the squares are, and the
     holding is what keeps a second viewing free. */
  const headers = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };

  /* The video goes out as it came in. No range handling: these are a few
     megabytes and fifteen seconds, so a browser that wants to scrub has
     already got the whole thing. */
  if (want === "video") {
    return new Response(upstream.body, {
      headers: { ...headers, "Content-Type": type },
    });
  }

  const original = Buffer.from(await upstream.arrayBuffer());

  const frame = await sharp(original)
    /* Height is whatever the story's own shape makes it — 9:16 for almost all
       of them, but not something to insist on, and never upscaled past what
       Instagram sent. */
    .resize({ width: STORY_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
    .catch((error) => {
      /* A picture sharp cannot read is still a picture the browser might: a
         heavy frame beats a blank one, so the original goes out instead. */
      console.error("instagram: could not resize a story frame", error);
      return null;
    });

  return frame
    ? new Response(new Uint8Array(frame), {
        headers: { ...headers, "Content-Type": "image/webp" },
      })
    : new Response(new Uint8Array(original), {
        headers: { ...headers, "Content-Type": type },
      });
}
