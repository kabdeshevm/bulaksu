from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / "assets" / "products"

LARGE_SRC = Path(r"C:\Users\adna3\Downloads\WhatsApp Image 2026-07-02 at 17.03.14.jpeg")
PET_SRC = Path(r"C:\Users\adna3\Downloads\WhatsApp Image 2026-07-02 at 17.03.13.jpeg")


def flood_remove_white_background(image: Image.Image, threshold: int = 34) -> Image.Image:
    rgba = image.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[:, :, :3].astype(np.int16)
    height, width = arr.shape[:2]

    visited = np.zeros((height, width), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    edge_points = []
    for x in range(width):
        edge_points.append((x, 0))
        edge_points.append((x, height - 1))
    for y in range(height):
        edge_points.append((0, y))
        edge_points.append((width - 1, y))

    def is_background(x: int, y: int) -> bool:
        pixel = rgb[y, x]
        return int(np.abs(pixel - np.array([255, 255, 255])).max()) <= threshold

    for x, y in edge_points:
        if not visited[y, x] and is_background(x, y):
            visited[y, x] = True
            q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < width and 0 <= ny < height and not visited[ny, nx] and is_background(nx, ny):
                visited[ny, nx] = True
                q.append((nx, ny))

    alpha = arr[:, :, 3]
    alpha[visited] = 0

    mask = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(0.7))
    rgba.putalpha(mask)
    return rgba


def process_large_bottle() -> None:
    source = Image.open(LARGE_SRC).convert("RGB")
    crop = source.crop((105, 420, 638, 1135))
    cutout = flood_remove_white_background(crop)
    cutout.thumbnail((500, 720), Image.Resampling.LANCZOS)
    cutout.save(PRODUCTS / "bottle-189-cutout.png")


def process_pet_bottles() -> None:
    source = Image.open(PET_SRC).convert("RGB")
    photo = source.crop((88, 500, 652, 1278)).convert("RGB")
    ImageDraw.Draw(photo).rectangle((0, 606, 42, 700), fill=(236, 240, 239))
    photo = photo.filter(ImageFilter.UnsharpMask(radius=1.2, percent=90, threshold=4))
    photo.thumbnail((560, 730), Image.Resampling.LANCZOS)
    photo.save(PRODUCTS / "pet-bottles-photo.png")


if __name__ == "__main__":
    PRODUCTS.mkdir(parents=True, exist_ok=True)
    process_large_bottle()
    process_pet_bottles()
