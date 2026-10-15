/* Whether the portrait is wearing a ring: what components/StoryRing.tsx asks
   for once the home page has loaded.

   The arrangement is app/api/weather's, for app/api/weather's reason. Home is
   prerendered and held for an hour, which is right for six photographs and
   wrong for a thing that is either live or not — baked into the page, the ring
   would be up to an hour late appearing and up to an hour late coming off. So
   the page stays static and the one live claim on it is fetched beside it.
   lib/instagram.ts holds the call for STORY_REVALIDATE_SECONDS and the same
   number goes out as `s-maxage`, so the CDN holds this answer for exactly as
   long as the data behind it is good for.

   Unlike the weather there is no 503 here, because there is nothing to report.
   "Nothing is live" is the normal answer — most hours of most days — and a
   missing token and a refusal from Instagram arrive as the same null and mean
   the same thing to the only caller: no ring. A 503 would dress up the usual
   case as a failure and give the browser a reason to make noise about it. */

import { liveStory, STORY_REVALIDATE_SECONDS } from "@/lib/instagram";

export async function GET() {
  const story = await liveStory().catch((error) => {
    console.error("instagram: the stories call failed", error);
    return null;
  });

  /* `null` when there is nothing live — a valid JSON document, and the same
     shape liveStory() answers in, so the client has one thing to check.

     The frames come with it rather than behind a second request: the reel is
     a handful of URLs and a timestamp each, and fetching them only once the
     ring is tapped would put a wait between the tap and the first frame. The
     pictures themselves are not here — those are URLs into the route next
     door, and the browser asks for them when the overlay opens. */
  return Response.json(story, {
    headers: {
      "Cache-Control":
        `public, s-maxage=${STORY_REVALIDATE_SECONDS}, ` +
        `stale-while-revalidate=${STORY_REVALIDATE_SECONDS}`,
    },
  });
}
