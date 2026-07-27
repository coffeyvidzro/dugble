"""Render fictional document captures for quality evaluation.

Every visible value is a synthetic placeholder. No source image or field is
derived from a real identity document or person.
"""

from __future__ import annotations

import argparse
import json
from io import BytesIO
from pathlib import Path
from typing import Any, Sequence

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

WIDTH, HEIGHT = 1000, 630
DEFAULT_MANIFEST = Path(__file__).parents[1] / "tests/fixtures/quality/manifest.json"


def _card(side: str) -> Image.Image:
    if side not in {"front", "back"}:
        raise ValueError(f"unsupported synthetic document side: {side}")
    image = Image.new("RGB", (WIDTH, HEIGHT), (225, 238, 226))
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        shade = 210 + (y % 35)
        draw.line((0, y, WIDTH, y), fill=(shade, min(250, shade + 10), 220))
    draw.rounded_rectangle(
        (18, 18, WIDTH - 18, HEIGHT - 18), 28, outline=(20, 80, 55), width=8
    )
    draw.rectangle((40, 45, WIDTH - 40, 135), fill=(35, 105, 70))
    draw.text((70, 72), f"SYNTHETIC ID - {side.upper()}", fill="white", stroke_width=1)

    if side == "front":
        draw.rectangle(
            (65, 175, 325, 510), fill=(155, 180, 165), outline=(30, 70, 50), width=4
        )
        draw.ellipse((120, 205, 270, 355), fill=(95, 125, 110))
        draw.rectangle((105, 355, 285, 485), fill=(95, 125, 110))
        fields = ["NAME: SAMPLE PERSON", "DOB: YYYY-MM-DD", "ID: SYN-000-000-0"]
        for index, field in enumerate(fields):
            y = 205 + index * 90
            draw.text((370, y), field, fill=(20, 45, 35), stroke_width=1)
            draw.line((370, y + 35, 900, y + 35), fill=(55, 95, 75), width=3)
    else:
        draw.rectangle(
            (70, 185, 930, 310), fill=(245, 245, 235), outline=(35, 75, 55), width=4
        )
        for index in range(10):
            x = 95 + index * 78
            draw.rectangle((x, 205, x + 35, 290), fill=(40 + index * 10, 70, 55))
        draw.text(
            (80, 365),
            "SYNTHETIC MACHINE READABLE AREA",
            fill=(20, 45, 35),
            stroke_width=1,
        )
        draw.text(
            (80, 425),
            "SYNID<SAMPLE<PERSON<<<<<<<<<<<<",
            fill=(20, 45, 35),
            stroke_width=1,
        )
        draw.text(
            (80, 475),
            "0000000000SYN0000000<<<<<<<<<<",
            fill=(20, 45, 35),
            stroke_width=1,
        )
    return image


def _jpeg_round_trip(
    image: Image.Image, *, quality: int, exif: Image.Exif | None = None
) -> Image.Image:
    encoded = BytesIO()
    image.save(encoded, format="JPEG", quality=quality, exif=exif or Image.Exif())
    encoded.seek(0)
    with Image.open(encoded) as decoded:
        decoded.load()
        return decoded.copy()


def render_fixture(fixture: dict[str, Any]) -> Image.Image:
    """Render one manifest fixture entirely in memory."""

    image = _card(fixture["side"])
    degradation = fixture["degradation"]
    if degradation == "none":
        return image
    if degradation == "downsample":
        return image.resize((400, 252))
    if degradation == "underexposure":
        return ImageEnhance.Brightness(image).enhance(0.16)
    if degradation == "overexposure":
        return Image.blend(image, Image.new("RGB", image.size, "white"), 0.88)
    if degradation == "gaussian_blur":
        return image.filter(ImageFilter.GaussianBlur(12))
    if degradation == "local_glare":
        ImageDraw.Draw(image).ellipse((300, 100, 850, 560), fill="white")
        return image
    if degradation == "jpeg_quality_8":
        return _jpeg_round_trip(image, quality=8)
    if degradation == "exif_orientation":
        exif = Image.Exif()
        exif[274] = 6
        return _jpeg_round_trip(image.rotate(90, expand=True), quality=90, exif=exif)
    raise ValueError(f"unsupported synthetic degradation: {degradation}")


def export_fixtures(manifest_path: Path, output_dir: Path) -> None:
    """Optionally export generated previews outside the tracked fixture set."""

    manifest = json.loads(manifest_path.read_text())
    output_dir.mkdir(parents=True, exist_ok=True)
    for fixture in manifest["fixtures"]:
        render_fixture(fixture).save(output_dir / f"{fixture['id']}.png")


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args(argv)
    export_fixtures(args.manifest, args.output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
