/* Apple Music — the catalog lookup behind the Listening card.

   Server-only, and build-time only: the card is a server component on a
   statically rendered page, so this runs once during `next build`, the result
   is frozen into the HTML, and the browser never sees a token or the key.
   Nothing here can be imported from a client component (it reads the file
   system and Node's crypto).

   There are two ways to the same song, and the lookup takes whichever it can:

   1. The MusicKit catalog, which needs a developer token — an ES256 JWT this
      file signs with a private key from the Apple Developer portal. Three env
      vars name it (see .env.example), and locally the key can instead sit in
      the project root as AuthKey_<KEY_ID>.p8. This is the richer reading: it
      is the only one that carries Apple's own colours for the cover, which is
      what the vinyl is pressed in.

   2. The iTunes Search endpoint, which needs nothing at all — no key, no
      token, no account. Same songs, same preview files, same cover; no
      colours.

   The second exists because .gitignore keeps both the .p8 and .env.local out
   of the repo, so a deployment that has not had APPLE_MUSIC_PRIVATE_KEY
   pasted into its environment signs no token — and before this fallback that
   meant a record with no preview attached, which is a record that does not
   play. Catalog reads need no user token either way. */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { listening } from "./content";

const API = "https://api.music.apple.com/v1/catalog";
const SEARCH = "https://itunes.apple.com/search";

/* In case the song is not sold in the storefront the link should open in. */
const STOREFRONTS = [listening.storefront, "in", "us"];

/* The artwork is served at whatever size is asked for; these fill the card's
   square at 1× and 2× and a little over, with the smallest as the fallback. */
export const ARTWORK_SIZES = [176, 352, 528] as const;

export interface NowPlaying {
  title: string;
  artist: string;
  url: string;
  /** Artwork URL template with `{w}` and `{h}` still in it. */
  artwork: string;
  /** Apple's own reading of the cover — its ground and the four colours it
      picks for text over it — as hex without the `#`. The disc is pressed in
      these: the ground for the vinyl, the last text colour for the swirl.
      Empty from the keyless path, which does not carry them; the card then
      falls back to lib/content's blank disc. */
  artworkBackground: string;
  artworkColors: string[];
  /** 30-second AAC preview, when the label allows one. */
  preview: string | null;
}

interface CatalogSong {
  attributes: {
    name: string;
    artistName: string;
    url: string;
    artwork?: {
      url: string;
      bgColor?: string;
      textColor1?: string;
      textColor2?: string;
      textColor3?: string;
      textColor4?: string;
    };
    previews?: { url: string }[];
  };
}

/* The iTunes Search endpoint's shape. Every field is optional on purpose:
   it answers for films and podcasts too, and those rows have none of them. */
interface StoreSong {
  trackName?: string;
  artistName?: string;
  trackViewUrl?: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

const base64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64url");

/** The key, from the env var or the .p8 in the project root. Null if neither. */
async function privateKey(keyId: string): Promise<string | null> {
  const fromEnv = process.env.APPLE_MUSIC_PRIVATE_KEY;
  if (fromEnv) return fromEnv.replace(/\\n/g, "\n");
  try {
    return await readFile(`AuthKey_${keyId}.p8`, "utf8");
  } catch {
    return null;
  }
}

/* Apple accepts tokens up to six months old; one hour is plenty for a build.
   `ieee-p1363` makes Node emit the raw r‖s signature JWTs use rather than the
   DER wrapping it defaults to. */
async function developerToken(): Promise<string | null> {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  if (!teamId || !keyId) return null;
  const key = await privateKey(keyId);
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claims = base64url(
    JSON.stringify({ iss: teamId, iat: now, exp: now + 60 * 60 })
  );
  const signature = createSign("SHA256")
    .update(`${header}.${claims}`)
    .sign({ key, dsaEncoding: "ieee-p1363" });
  return `${header}.${claims}.${base64url(signature)}`;
}

/* Either search ranks remixes, instrumentals and DJ mixes under the original
   but not always below it, so the first hit whose artist line starts with the
   artist named in content wins; otherwise the first hit at all. */
function pickSong<T>(songs: T[], artistOf: (song: T) => string): T | null {
  const wanted = listening.artist.toLowerCase();
  return (
    songs.find((song) => artistOf(song).toLowerCase().startsWith(wanted)) ??
    songs[0] ??
    null
  );
}

const term = () =>
  encodeURIComponent(`${listening.title} ${listening.artist}`);

/* ── The catalog: needs the key, and is the only path with the colours ── */

async function fromCatalog(
  storefront: string,
  token: string
): Promise<NowPlaying | null> {
  const response = await fetch(
    `${API}/${storefront}/search?term=${term()}&types=songs&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    console.error(`listening: catalog ${storefront} answered ${response.status}`);
    return null;
  }
  const body = (await response.json()) as {
    results?: { songs?: { data?: CatalogSong[] } };
  };
  const song = pickSong(
    body.results?.songs?.data ?? [],
    (candidate) => candidate.attributes.artistName
  );
  if (!song) return null;

  const { attributes } = song;
  return {
    title: attributes.name,
    artist: attributes.artistName,
    url: attributes.url,
    artwork: attributes.artwork?.url ?? "",
    artworkBackground: attributes.artwork?.bgColor ?? "",
    artworkColors: [
      attributes.artwork?.textColor1,
      attributes.artwork?.textColor2,
      attributes.artwork?.textColor3,
      attributes.artwork?.textColor4,
    ].filter((c): c is string => !!c),
    preview: attributes.previews?.[0]?.url ?? null,
  };
}

/* ── The store: needs nothing, and is what keeps the record playable ── */

/* `artworkUrl100` is one rendition of the cover rather than a template — the
   size lives in the last path segment — so putting `{w}` and `{h}` back there
   hands `artworkAt` the same kind of string the catalog gives. */
const artworkTemplate = (url: string) =>
  url.replace(/\/\d+x\d+[a-z-]*\.(jpg|png)$/i, "/{w}x{h}bb.jpg");

async function fromStore(country: string): Promise<NowPlaying | null> {
  const response = await fetch(
    `${SEARCH}?term=${term()}&media=music&entity=song&limit=5&country=${country}`
  );
  if (!response.ok) {
    console.error(`listening: search ${country} answered ${response.status}`);
    return null;
  }
  const body = (await response.json()) as { results?: StoreSong[] };
  const song = pickSong(
    body.results ?? [],
    (candidate) => candidate.artistName ?? ""
  );
  /* A row with no link is a row this card cannot use. */
  if (!song?.trackName || !song.trackViewUrl) return null;

  return {
    title: song.trackName,
    artist: song.artistName ?? listening.artist,
    url: song.trackViewUrl,
    artwork: song.artworkUrl100 ? artworkTemplate(song.artworkUrl100) : "",
    artworkBackground: "",
    artworkColors: [],
    preview: song.previewUrl ?? null,
  };
}

/** The song in lib/content, as Apple knows it — the catalog first, for its
    colours, then the keyless store. Null only if neither answered, in which
    case the card still shows the title and artist, just without the rest. */
export async function nowPlaying(): Promise<NowPlaying | null> {
  const token = await developerToken().catch((error) => {
    console.error("listening: could not sign a developer token", error);
    return null;
  });

  if (token) {
    for (const storefront of STOREFRONTS) {
      const song = await fromCatalog(storefront, token).catch(() => null);
      if (song) return song;
    }
    console.warn("listening: not in the catalog; trying iTunes Search");
  } else {
    console.warn(
      "listening: no MusicKit key in this environment, so the disc will be " +
        "pressed in lib/content's colours rather than the cover's — set " +
        "APPLE_MUSIC_PRIVATE_KEY to get Apple's. Falling back to iTunes Search."
    );
  }

  for (const country of STOREFRONTS) {
    const song = await fromStore(country).catch(() => null);
    if (song) return song;
  }

  console.warn("listening: song not found in any storefront; card shows text only");
  return null;
}

/** One size out of the catalog's `{w}x{h}` template. */
export const artworkAt = (template: string, size: number) =>
  template.replace("{w}", String(size)).replace("{h}", String(size));
