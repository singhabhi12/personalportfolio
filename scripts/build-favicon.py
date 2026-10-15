"""Cuts the portrait sticker down to a head and writes the site's app icons:
app/favicon.ico (16/32/48), app/icon.png and app/apple-icon.png. Next.js finds
all three by name (node_modules/next/dist/docs/.../metadata/app-icons.md) and
writes the <link> tags itself, so nothing imports them.

The face is the one on the Life page — public/stickers/me.webp, the same
die-cut sticker (scripts/build-stickers.py) — cropped to the head, because a
whole figure at 16px is a smudge. It is laid on paper rather than left
transparent: the jacket and the glasses are nearly black, and on a dark tab
bar a transparent icon is a man-shaped hole.

The .ico is written by hand, in the old BMP-payload form. Pillow's own writer
packs each size as a PNG, which is legal and which this Next cannot decode —
`next dev` 500s the whole route with "unable to decode image data" rather than
falling back, so the icon has to be the plain kind.

One-off: the results are committed.

    python3 scripts/build-favicon.py
"""
import struct
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "stickers" / "me.webp"
APP = ROOT / "app"

# Head and collar out of the 595 x 640 sticker, square: the hair touches the
# top edge and the shoulders run off the bottom, which is the crop a passport
# photo takes and the one that still reads as a person at 16px.
CROP = (85, 10, 525, 450)
PAPER = (247, 245, 241, 255)  # --color-paper
ICO = [16, 32, 48]
PNG = 512          # the tab and the search result
APPLE = 180        # the home screen


def dib(face: Image.Image, size: int) -> bytes:
    """One icon, as a DIB: a header claiming twice the height, the pixels
    bottom-up in BGRA, and the 1-bit AND mask under them — all zeroes here,
    since the face is opaque, but the mask's rows are still padded to four
    bytes and it is still what the header's second half is counting."""
    im = face.resize((size, size), Image.LANCZOS).convert("RGBA")
    rows = [im.crop((0, y, size, y + 1)).tobytes() for y in reversed(range(size))]
    bgra = b"".join(
        bytes([px[2], px[1], px[0], px[3]])
        for row in rows
        for px in zip(row[0::4], row[1::4], row[2::4], row[3::4])
    )
    header = struct.pack("<IiiHHIIiiII", 40, size, size * 2, 1, 32, 0, len(bgra), 0, 0, 0, 0)
    mask = b"\x00" * (((size + 31) // 32) * 4 * size)
    return header + bgra + mask


def ico(face: Image.Image, sizes: list[int]) -> bytes:
    images = [dib(face, s) for s in sizes]
    out = struct.pack("<HHH", 0, 1, len(sizes))
    offset = 6 + 16 * len(sizes)
    for size, data in zip(sizes, images):
        out += struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(data), offset)
        offset += len(data)
    return out + b"".join(images)


def head() -> Image.Image:
    sticker = Image.open(SRC).convert("RGBA").crop(CROP)
    ground = Image.new("RGBA", sticker.size, PAPER)
    return Image.alpha_composite(ground, sticker).convert("RGB")


if __name__ == "__main__":
    face = head()
    face.resize((PNG, PNG), Image.LANCZOS).save(APP / "icon.png")
    face.resize((APPLE, APPLE), Image.LANCZOS).save(APP / "apple-icon.png")
    (APP / "favicon.ico").write_bytes(ico(face, ICO))
    print(f"favicon.ico {ICO}  icon.png {PNG}  apple-icon.png {APPLE}")
