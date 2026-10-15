/* Instagram — the six squares on the home page's @mehunabhi card.

   Server-only: this reads a token out of the environment, so nothing here can
   be imported from a client component. components/Desk.tsx is a server
   component and calls `recentPosts()` directly; the only thing that reaches
   the browser is the shape in `Post`.

   Unlike the weather next door this does not need a route handler. Six posts
   that change a few times a year are perfectly right frozen into the page for
   an hour, so the fetch below carries `revalidate` and the home page stays
   prerendered HTML that Vercel regenerates behind the visitor. The weather
   could not do that — a reading frozen into static HTML is wrong within the
   hour — which is why that one goes through app/api/weather and the client,
   and this one does not.

   The ring around the portrait, at the foot of this file, is the exception
   that proves it. A story lives a day, but what the ring claims is that there
   is one *now*, and an hour-old page cannot make that claim: it would be up
   to an hour late putting the ring on and an hour late taking it off again.
   So that one goes the weather way — app/api/instagram/story, read by
   components/StoryRing.tsx once the page has loaded — and home stays
   prerendered for its hour with the one live thing on it fetched beside it.

   Two things about this API are worth knowing before changing any of it.

   The first is that oEmbed cannot do this job. The documented
   /instagram_oembed endpoint takes one post URL and hands back one
   Instagram-rendered <blockquote> plus their embed.js; it has no listing of
   any kind, and a profile URL is refused outright ("does not refer to an
   embeddable media", error_subcode 2207047) even though the docs name
   instagram.com/{username} as an accepted format. Since November 2025 it does
   not even return thumbnail_url any more. Listing an account's own posts is
   only possible as the account, which is what this file does.

   The second is that media_url is a signed Instagram CDN URL. It expires, and
   it expires sooner than some of the places this data ends up — a page held
   for an hour, a CDN holding that page, a visitor's back button. So the URL
   never reaches the browser: `src` points at app/api/instagram/image/<id>,
   which resolves the fresh CDN URL server-side on each request and streams
   the bytes back. That indirection is the whole reason that route exists.

   Captions are not available on this login path at all — Instagram lists
   `caption` as "Available for Instagram API with Facebook Login only" — so
   there is nothing here to write into an alt attribute. The tiles stay
   alt="" and the link around each one says the date instead, which is true
   rather than invented. See the card in components/Desk.tsx.

   With INSTAGRAM_ACCESS_TOKEN unset — or with Instagram refusing — every
   function here answers null and the card renders exactly what it did before
   this file existed: the six local originals from lib/content's
   `photography.squares`, each opening the gallery. */

const HOST = "https://graph.instagram.com";

/** Overridable, because a Graph version is eventually retired and that should
    not need a code change. */
const VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v25.0";

/** How long the listing is held before Instagram is asked again. An hour is
    far finer than a portfolio account posts. */
export const REVALIDATE_SECONDS = 3600;

/** How many squares the card has room for — three columns, two rows
    (app/globals.css, ".insta-grid"). Asking for more would be downloaded and
    thrown away. */
export const SQUARES = 6;

/** The side, in pixels, that app/api/instagram/image resizes a square to —
    and so the width and height the <img> can state. The tile is drawn 120px
    wide at most, so this is the 2× a retina screen wants and nothing beyond
    it. Instagram serves the original otherwise: one of these arrived as a
    4536×8064 JPEG of 4.7MB, to be drawn in a 120px box. */
export const SQUARE = 320;

/** What the square is a picture of. A video shows its thumbnail and an album
    its first frame, so all three render identically; the kind is kept so the
    link's label can say which it is. */
export type PostKind = "image" | "video" | "album";

export interface Post {
  /** Instagram's own media id — also the last segment of `src`. */
  id: string;
  kind: PostKind;
  /** The post on instagram.com, from Instagram rather than built by hand. */
  permalink: string;
  /** Our own proxy, not the CDN: see the note about expiry above. */
  src: string;
  /** "12 March 2026" — what the link says, since there is no caption. */
  taken: string;
  /** The raw ISO 8601 stamp, for a caller that wants to read it its own way. */
  timestamp: string;
}

/* Exactly the fields the card uses. `caption` is deliberately absent: this
   login path does not serve it. `shortcode` is not asked for either — the
   permalink already carries it, and a URL Instagram wrote is a safer thing to
   link to than one assembled from a code. */
const FIELDS = "id,media_type,media_url,thumbnail_url,permalink,timestamp";

interface Media {
  id?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
}

/** Instagram's three media types, in the words this file uses. */
const KINDS: Record<string, PostKind> = {
  IMAGE: "image",
  VIDEO: "video",
  CAROUSEL_ALBUM: "album",
};

/* The date on the link. en-GB because the site is in English and "12 March
   2026" reads better under a photograph than "March 12, 2026"; UTC so the
   build machine's timezone cannot change what the page says. */
const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** The picture for a square. A video has no media_url worth showing — that is
    the video file — so it shows the thumbnail Instagram made; an album's
    media_url is its first frame. Either can be missing: Instagram omits
    media_url when the post contains copyrighted material, which is most Reels
    with music on them. */
const pictureOf = (item: Media): string | undefined =>
  item.media_type === "VIDEO"
    ? item.thumbnail_url ?? item.media_url
    : item.media_url ?? item.thumbnail_url;

/* One edge of the account, asked for once and then held. Both the squares and
   the ring come through here; they differ in the edge, the fields and how long
   the answer is good for, and in nothing else — including the part where a
   refusal is a console line and a null rather than a throw, because every
   caller in this file has something true to render without Instagram.

   The token goes in the query string because that is the way Instagram
   documents it. It is a secret, so nothing here ever logs the URL.

   Next's fetch cache is what makes the listing one request: `recentPosts` on a
   page render and `sourceFor` on every image the page then asks for all land
   on the same cached response, so a visitor costs one call to Instagram an
   hour rather than seven. */
async function ask(
  edge: string,
  fields: string,
  limit: number,
  revalidate: number
): Promise<Media[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.warn(
      "instagram: no INSTAGRAM_ACCESS_TOKEN in this environment, so the home " +
        "card keeps the local squares from lib/content and the portrait wears " +
        "no ring — see .env.example to show the account's real posts."
    );
    return null;
  }

  const url =
    `${HOST}/${VERSION}/me/${edge}` +
    `?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    /* Instagram says why in the body, and the why matters: code 190 is an
       expired token, which is a thing someone has to go and fix rather than a
       blip. Read as text so a non-JSON error page cannot throw in here. */
    const detail = await response.text().catch(() => "");
    console.error(
      `instagram: Graph answered ${response.status} to /me/${edge} — ${detail.slice(0, 300)}`
    );
    return null;
  }

  const body = (await response.json()) as { data?: Media[] };
  return Array.isArray(body.data) ? body.data : null;
}

const listing = () => ask("media", FIELDS, SQUARES, REVALIDATE_SECONDS);

/** The most recent posts on the account, newest first — Instagram's own order.
    Null in an environment with no token, and when Instagram refused; the
    caller renders the local squares either way. A post with no picture is
    dropped rather than left as a hole in the grid. */
export async function recentPosts(): Promise<Post[] | null> {
  const items = await listing();
  if (!items) return null;

  const posts = items.flatMap<Post>((item) => {
    const picture = pictureOf(item);
    if (!item.id || !item.permalink || !picture) return [];
    const stamp = item.timestamp ?? "";
    const when = stamp ? new Date(stamp) : null;
    return [
      {
        id: item.id,
        kind: KINDS[item.media_type ?? ""] ?? "image",
        permalink: item.permalink,
        src: `/api/instagram/image/${encodeURIComponent(item.id)}`,
        taken: when && !Number.isNaN(when.valueOf()) ? date.format(when) : "",
        timestamp: stamp,
      },
    ];
  });

  /* An account that answered but has nothing showable is the same as no
     account as far as the card is concerned: six local squares beat an empty
     grid. */
  return posts.length ? posts.slice(0, SQUARES) : null;
}

/** The live CDN URL behind one square, for app/api/instagram/image to stream.

    Resolved from the same cached listing rather than by id, which means an id
    that is not in the listing gets nothing back — so that route cannot be
    talked into fetching an arbitrary URL on someone's behalf. */
export async function sourceFor(id: string): Promise<string | null> {
  const items = await listing();
  if (!items) return null;
  const item = items.find((candidate) => candidate.id === id);
  return (item && pictureOf(item)) ?? null;
}

/* ---- The ring, and what is behind it ----

   Instagram puts a ring around an avatar when that account has something live,
   and opens the reel when it is tapped. The portrait on home does both: the
   ring is components/StoryRing.tsx, the reel is components/StoryViewer.tsx,
   and what follows is everything either of them knows.

   The pictures come down the same way the squares do and for the same reason —
   through a route of our own, never a CDN URL in the page — which is the whole
   of app/api/instagram/story/[id]. Read the note at the top of this file about
   signatures expiring; a story's are no different, and it has a day to live. */

/** How long an answer about live stories is held — by lib's fetch cache and,
    through app/api/instagram/story, by the CDN. Not a number about the story
    going out of date: a story lasts a day. It is a number about what the ring
    is for. A ring that appears five minutes after the story does still reads
    as live; one that appears fifty does not say anything at all. It also puts
    a ceiling of twelve calls an hour on Instagram however many people visit. */
export const STORY_REVALIDATE_SECONDS = 300;

/** A high-enough limit that `count` is the true number rather than this
    ceiling. Nobody on this account posts fifty stories in a day, and if they
    ever do, the reel shows fifty and the ring is right anyway. */
const STORIES = 50;

/** The width a story is served at — Instagram's own, and about twice what the
    overlay draws on a laptop. What arrives is bigger: the frame behind the one
    live story as this was written is a 1206×2144 JPEG of 473KB, which is a
    heavy thing to put in front of someone who tapped a 56px circle. */
export const STORY_WIDTH = 1080;

/** One frame of the reel. */
export interface StoryFrame {
  /** Instagram's media id — also the last segment of `src` and `video`. */
  id: string;
  /** The picture: the still for an image story, the poster frame for a video.
      Our own route, never the CDN. */
  src: string;
  /** The video file, when Instagram served one — see `videoOf` below for why
      that is a "when" rather than a given. Undefined on a still, and on every
      video whose soundtrack Instagram will not hand over, where `src` is all
      there is and the frame is held like a photograph. */
  video?: string;
  /** This frame on instagram.com: the way out to the real reel, with the
      sound and the video Instagram keeps for itself. */
  permalink: string;
  /** ISO 8601. The overlay turns it into "2h" in the visitor's own clock,
      which is why it goes over as the raw stamp. */
  timestamp: string;
}

/** What is live on the account right now. */
export interface LiveStory {
  /** The reel, oldest first — Instagram's own order, which is the order it
      plays in. */
  frames: StoryFrame[];
  /** Where "open on Instagram" goes: the first frame, so Instagram opens the
      reel where its own avatar would, at the start rather than the end. */
  permalink: string;
}

/* The picture and, where there is one, the video. `caption` is absent for the
   same reason it is absent from the squares, and `media_product_type` is not
   asked for because this edge only ever serves stories. */
const STORY_FIELDS = "id,media_type,media_url,thumbnail_url,permalink,timestamp";

/** The video file behind a story, when there is one to have.

    Instagram withholds `media_url` on media that carries someone else's
    copyright, which in practice means anything with a song on it: of the six
    most recent posts on this account, four videos came back without it, and so
    did the story this was written against. There is no way round that and no
    point pretending otherwise — the overlay shows the poster frame and holds
    it, and the link to Instagram is on screen for anyone who wants the rest. */
const videoOf = (item: Media): string | undefined =>
  item.media_type === "VIDEO" ? item.media_url : undefined;

/** The account's live stories, or null when there are none — which is most
    hours of most days, and is also what an environment with no token and a
    refusal from Instagram both answer. The portrait wears no ring for any of
    the three, so the caller has one case to render rather than three.

    There is no 24-hour arithmetic here on purpose: this edge only ever serves
    stories that have not expired, so everything in the list is live by
    definition, and doing the subtraction ourselves could only produce a ring
    that disagrees with Instagram about the minute. */
export async function liveStory(): Promise<LiveStory | null> {
  const items = await stories();
  if (!items) return null;

  const frames = items.flatMap<StoryFrame>((item) => {
    /* A frame with no picture is a gap in the reel and a blank screen for
       whoever taps into it; a frame with no permalink has no way out to
       Instagram. Neither is worth showing, so neither is counted. */
    if (!item.id || !item.permalink || !pictureOf(item)) return [];
    const id = encodeURIComponent(item.id);
    return [
      {
        id: item.id,
        src: `/api/instagram/story/${id}`,
        ...(videoOf(item) ? { video: `/api/instagram/story/${id}?video=1` } : {}),
        permalink: item.permalink,
        timestamp: item.timestamp ?? "",
      },
    ];
  });

  return frames.length ? { frames, permalink: frames[0].permalink } : null;
}

/* The listing behind the ring, held for STORY_REVALIDATE_SECONDS. Kept
   separate from the media listing above because the two are good for very
   different lengths of time, and shared between `liveStory` and the route that
   streams a frame so that a reel of six costs one call to Instagram rather
   than seven — the same arrangement, and the same reason, as the squares. */
const stories = () => ask("stories", STORY_FIELDS, STORIES, STORY_REVALIDATE_SECONDS);

/** The live CDN URL behind one frame, for app/api/instagram/story/[id] to
    stream — the picture, or the video when one was asked for and exists.

    Resolved out of the same cached listing rather than by id, exactly as
    `sourceFor` is, so that route cannot be talked into fetching a URL of
    someone else's choosing either. */
export async function storySourceFor(
  id: string,
  want: "picture" | "video"
): Promise<string | null> {
  const items = await stories();
  if (!items) return null;
  const item = items.find((candidate) => candidate.id === id);
  if (!item) return null;
  return (want === "video" ? videoOf(item) : pictureOf(item)) ?? null;
}
