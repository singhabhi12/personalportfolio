/* Apple Music — the catalog lookup behind the Listening card.

   Server-only, and build-time only: the card is a server component on a
   statically rendered page, so this runs once during `next build`, the result
   is frozen into the HTML, and the browser never sees a token or the key.
   Nothing here can be imported from a client component (it reads the file
   system and Node's crypto).

   The developer token is an ES256 JWT signed with a MusicKit private key from
   the Apple Developer portal. Three env vars name it — see .env.example — and
   locally the key can instead sit in the project root as AuthKey_<KEY_ID>.p8,
   which .gitignore keeps out of the repo. Catalog reads need no user token. */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { listening } from "./content";

const API = "https://api.music.apple.com/v1/catalog";

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
      these: the ground for the vinyl, the last text colour for the swirl. */
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

/* The catalog search ranks remixes, instrumentals and DJ mixes under the
   original but not always below it, so the first hit whose artist line starts
   with the artist named in content wins; otherwise the first hit at all. */
function pickSong(songs: CatalogSong[]): CatalogSong | null {
  const wanted = listening.artist.toLowerCase();
  return (
    songs.find((song) =>
      song.attributes.artistName.toLowerCase().startsWith(wanted)
    ) ??
    songs[0] ??
    null
  );
}

async function searchStorefront(
  storefront: string,
  token: string
): Promise<CatalogSong | null> {
  const term = encodeURIComponent(`${listening.title} ${listening.artist}`);
  const response = await fetch(
    `${API}/${storefront}/search?term=${term}&types=songs&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    console.error(`listening: catalog ${storefront} answered ${response.status}`);
    return null;
  }
  const body = (await response.json()) as {
    results?: { songs?: { data?: CatalogSong[] } };
  };
  return pickSong(body.results?.songs?.data ?? []);
}

/** The song in lib/content, as the catalog knows it — or null, in which case
    the card still shows the title and artist, just without the rest. */
export async function nowPlaying(): Promise<NowPlaying | null> {
  const token = await developerToken().catch((error) => {
    console.error("listening: could not sign a developer token", error);
    return null;
  });
  if (!token) {
    console.warn("listening: Apple Music key not configured; card shows text only");
    return null;
  }

  for (const storefront of STOREFRONTS) {
    const song = await searchStorefront(storefront, token).catch(() => null);
    if (!song) continue;
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
  console.warn("listening: song not found in any storefront; card shows text only");
  return null;
}

/** One size out of the catalog's `{w}x{h}` template. */
export const artworkAt = (template: string, size: number) =>
  template.replace("{w}", String(size)).replace("{h}", String(size));
