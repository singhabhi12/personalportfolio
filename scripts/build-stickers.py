"""Cuts the desk items out of their product shots and turns each into a die-cut
sticker: the item, a rounded white border around its silhouette, and nothing
else. Output goes to public/stickers/<name>.webp with a transparent ground; the
drop shadow and the peel are the browser's job (see components/StickerSheet.tsx).

Python rather than Node because the cut-out needs a flood fill and morphology,
which OpenCV has and sharp does not. One-off: the results are committed.

    python3 scripts/build-stickers.py            # everything
    python3 scripts/build-stickers.py me         # just the named ones
"""
from pathlib import Path
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Sticker animation" / "on Desk items"
OUT = ROOT / "public" / "stickers"

# The portrait is not a product shot: a face on a studio backdrop that runs
# from grey at the corners to near-white behind the head, with skin that is
# often lighter than the corners. No single tolerance separates the two, so it
# is cut with GrabCut instead (see portrait_silhouette).
PORTRAIT = "portrait"

# name → (source file, tolerance for "this pixel is still the backdrop")
ITEMS = {
    "controller": ("043389ee-bfdc-57ab-a7a2-f1324eb6737a.avif", 14),
    "redbull": ("21624.jpg.avif", 24),
    "headphones": ("81D5DvVfSRL.jpg", 80),  # high: drops the soft ground shadow
    "iphone": ("MK914.jpeg", 24),
    "airpods": ("airpods-pro-2.png", None),  # already transparent
    "ipad": ("ipad-10th-gen-engraving-select-202212-silver-wifi_FMT_WHH.jpeg", 12),
    "macbook": ("refurb-mbp16-m3-max-pro-spaceblack-202402_AV4.jpeg", 24),
    "me": ("0A00CE9A-FF85-4DE2-B64F-77D54936BDCC.PNG", PORTRAIT),
}

MAX_SIDE = 640      # px on the longer side of the finished sticker
BORDER = 0.045      # white border, as a fraction of the item's longer side
PAD = 6             # transparent margin so the border is never clipped


def largest(fg: np.ndarray) -> np.ndarray:
    """Keep the biggest blob of a 0/255 mask; drop the specks."""
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
    if n > 2:
        keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        fg = np.where(lab == keep, 255, 0).astype(np.uint8)
    return fg


def portrait_silhouette(rgba: np.ndarray) -> np.ndarray:
    """0/255 mask of a person on a studio backdrop. The backdrop is the one
    thing in the frame with no grain at all, so GrabCut is seeded with 'light
    and flat, and touching the frame edge' as certain backdrop and 'darker than
    the shadows' as certain subject, and left to settle the skin's outline
    itself. The specular patches inside the glasses are light and flat too,
    but they do not reach the edge, so they stay."""
    rgb = rgba[..., :3]
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    mean = cv2.blur(gray, (11, 11))
    grain = np.sqrt(np.maximum(cv2.blur(gray * gray, (11, 11)) - mean * mean, 0))

    flat = ((gray > 140) & (grain < 4)).astype(np.uint8)
    flat = cv2.morphologyEx(flat, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    lab = cv2.connectedComponentsWithStats(flat)[1]
    at_edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    backdrop = np.isin(lab, list(at_edge))

    mask = np.full(gray.shape, cv2.GC_PR_FGD, np.uint8)
    mask[backdrop] = cv2.GC_BGD
    mask[gray < 60] = cv2.GC_FGD
    cv2.grabCut(np.ascontiguousarray(rgb), mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_MASK)
    fg = np.isin(mask, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8) * 255
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    return largest(fg)


def silhouette(rgba: np.ndarray, tol):
    """0/255 mask of the item. Uses the file's own alpha when it has one, else
    everything not reachable from the picture's edge across near-backdrop
    pixels — so a white product on a white ground survives as long as its
    outline is a shade darker than the paper."""
    if tol is None:
        return (rgba[..., 3] > 8).astype(np.uint8) * 255
    if tol is PORTRAIT:
        return portrait_silhouette(rgba)

    rgb = rgba[..., :3].astype(np.int16)
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(edge, axis=0)
    near = (np.abs(rgb - bg).max(axis=2) <= tol).astype(np.uint8)

    # Flood from every border pixel that looks like backdrop.
    h, w = near.shape
    reach = np.zeros((h + 2, w + 2), np.uint8)
    canvas = near.copy()
    seeds = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + \
            [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    for x, y in seeds:
        if canvas[y, x] == 1:
            cv2.floodFill(canvas, reach, (x, y), 2)
    fg = (canvas != 2).astype(np.uint8) * 255

    # Close pinholes (specular highlights that read as paper), drop specks.
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, k)
    return largest(fg)


# iPad 10th gen back, portrait: 248.6mm tall on 179.5mm wide.
IPAD_ASPECT = 248.6 / 179.5


def complete_ipad(im: Image.Image, tol) -> Image.Image:
    """Apple's hero crops the iPad at the bottom of the frame — only the top
    two thirds are in the file. The back is a flat silver gradient, so the
    missing part is drawn on: the last row continued at its own rate of
    darkening, with the bottom corners rounded to match the top ones."""
    rgba = np.array(im)
    mask = silhouette(rgba, tol)
    ys, xs = np.where(mask > 0)
    x0, x1, y0 = xs.min(), xs.max() + 1, ys.min()
    full_h = int(round((x1 - x0) * IPAD_ASPECT))
    missing = y0 + full_h - im.height
    if missing <= 0:
        return im

    # Corner radius, read off the top-left corner: how far down the outline
    # takes to reach the leftmost column.
    radius = int(np.argmax(mask[y0:, x0] > 0))

    edge = rgba[[0, -1], :, :3].reshape(-1, 3)
    bg = np.median(edge, axis=0)
    canvas = np.empty((im.height + missing, im.width, 4), np.uint8)
    canvas[..., :3] = bg
    canvas[..., 3] = 255
    canvas[: im.height] = rgba

    # Continue the gradient at the rate it darkened over its last 60px. One
    # slope for the whole width and a smoothed seed row: per-column, the grain
    # of the last row extrapolates into stripes.
    strip = rgba[-61:, x0:x1, :3].astype(float)
    slope = (strip[-1].mean(axis=0) - strip[0].mean(axis=0)) / 60
    seed = cv2.GaussianBlur(strip[-4:].mean(axis=0), (0, 0), 6)
    for i in range(missing):
        row = np.clip(seed + slope * (i + 1), 0, 255)
        canvas[im.height + i, x0:x1, :3] = row

    # Round off the bottom corners.
    yy, xx = np.mgrid[0:missing, 0:x1 - x0]
    yb = missing - 1 - yy
    r = radius
    left = (xx < r) & (yb < r) & ((xx - r) ** 2 + (yb - r) ** 2 > r * r)
    right = (xx >= x1 - x0 - r) & (yb < r) & ((xx - (x1 - x0 - r - 1)) ** 2 + (yb - r) ** 2 > r * r)
    corner = left | right
    canvas[im.height:, x0:x1][corner, :3] = bg
    return Image.fromarray(canvas)


def build(name: str, file: str, tol):
    im = Image.open(SRC / file).convert("RGBA")
    if name == "ipad":
        im = complete_ipad(im, tol)
    rgba = np.array(im)
    mask = silhouette(rgba, tol)

    ys, xs = np.where(mask > 0)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    long_side = max(y1 - y0, x1 - x0)
    r = max(10, int(round(long_side * BORDER)))
    margin = r + PAD

    # Work on the item's bounding box with room for the border.
    rgba = np.pad(rgba[y0:y1, x0:x1], ((margin, margin), (margin, margin), (0, 0)))
    mask = np.pad(mask[y0:y1, x0:x1], margin)

    # The die-cut: silhouette grown by r with a round kernel, then blurred and
    # re-thresholded so the outline is a smooth offset curve rather than a
    # pixel staircase.
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    cut = cv2.dilate(mask, k)
    cut = cv2.GaussianBlur(cut, (0, 0), r * 0.35)
    cut = ((cut > 127) * 255).astype(np.uint8)
    cut = cv2.GaussianBlur(cut, (0, 0), 1.0)  # anti-alias the edge

    # Soft edge on the item too, so it never sits on the white with a hard rim.
    item_a = cv2.GaussianBlur(mask, (0, 0), 0.8)
    if tol is None:
        item_a = np.minimum(item_a, rgba[..., 3])

    # Composite: white sticker stock, item on top.
    stock = np.zeros_like(rgba)
    stock[..., :3] = 255
    stock[..., 3] = cut
    item = rgba.copy()
    item[..., 3] = item_a
    out = Image.alpha_composite(Image.fromarray(stock), Image.fromarray(item))

    scale = MAX_SIDE / max(out.size)
    if scale < 1:
        out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
    out.save(OUT / f"{name}.webp", quality=92, method=6)
    out.save(OUT / f"{name}.png") if "--png" in sys.argv else None
    print(f"{name:12s} {out.width}x{out.height}  border {r}px")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    names = [a for a in sys.argv[1:] if not a.startswith("--")] or list(ITEMS)
    for name in names:
        build(name, *ITEMS[name])
