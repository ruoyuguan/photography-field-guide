"""Generate the Photography Field Guide raster brand assets with Pillow."""

from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
AMBER = "#FBBF24"
DARK = "#171717"
LIGHT = "#FAFAF9"
MUTED = "#A8A29E"


def aperture(draw: ImageDraw.ImageDraw, cx: float, cy: float, radius: float, color: str) -> None:
    """Draw a six-blade aperture mark made from radial line segments."""
    width = max(2, round(radius * 0.085))
    draw.ellipse(
        (cx - radius, cy - radius, cx + radius, cy + radius),
        outline=color,
        width=width,
    )
    for index in range(6):
        angle = index * pi / 3 - pi / 2
        outer = (cx + radius * cos(angle), cy + radius * sin(angle))
        inner = (
            cx + radius * 0.36 * cos(angle + pi / 3),
            cy + radius * 0.36 * sin(angle + pi / 3),
        )
        next_outer = (
            cx + radius * cos(angle + pi / 3),
            cy + radius * sin(angle + pi / 3),
        )
        draw.line((outer, inner, next_outer), fill=color, width=width, joint="curve")
    center_radius = radius * 0.09
    draw.ellipse(
        (cx - center_radius, cy - center_radius, cx + center_radius, cy + center_radius),
        fill=color,
    )


def icon(size: int = 512, maskable: bool = False) -> Image.Image:
    scale = 4
    canvas = Image.new("RGB", (size * scale, size * scale), DARK)
    draw = ImageDraw.Draw(canvas)
    margin = 0 if maskable else size * 0.055 * scale
    draw.rounded_rectangle(
        (margin, margin, size * scale - margin, size * scale - margin),
        radius=size * (0 if maskable else 0.21) * scale,
        fill=DARK,
    )
    radius = size * (0.22 if maskable else 0.27) * scale
    aperture(draw, size * scale / 2, size * scale / 2, radius, AMBER)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)


def social() -> Image.Image:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), DARK)
    draw = ImageDraw.Draw(image)

    # A restrained sensor-frame motif keeps the graphic recognisable at small sizes.
    draw.rounded_rectangle((770, 90, 1110, 540), radius=28, outline="#3F3F46", width=3)
    draw.rectangle((807, 134, 1073, 496), outline=AMBER, width=4)
    draw.rectangle((861, 195, 1019, 435), outline="#38BDF8", width=4)
    aperture(draw, 940, 315, 74, "#FAFAF9")

    draw.text((80, 82), "PHOTOGRAPHY", font=font(28, True), fill=AMBER)
    draw.text((80, 148), "Field Guide", font=font(88, True), fill=LIGHT)
    draw.text((84, 270), "Understand your camera.", font=font(38), fill=LIGHT)
    draw.text((84, 324), "See the light.", font=font(38), fill=LIGHT)
    draw.line((84, 410, 226, 410), fill=AMBER, width=5)
    draw.text((84, 452), "Sensor formats  /  Focal length  /  Exposure", font=font(24), fill=MUTED)
    draw.text((84, 506), "ENGLISH + CHINESE", font=font(20), fill=MUTED)
    return image


def main() -> None:
    image_dir = ROOT / "src" / "images"
    public_dir = ROOT / "public"
    public_dir.mkdir(exist_ok=True)

    icon().save(image_dir / "icon.png", optimize=True)
    icon(maskable=True).save(image_dir / "icon-maskable.png", optimize=True)
    card = social()
    card.save(image_dir / "social.png", optimize=True)
    card.save(public_dir / "social.webp", "WEBP", quality=88, method=6)
    print("Generated icon.png, icon-maskable.png, social.png, and social.webp")


if __name__ == "__main__":
    main()
