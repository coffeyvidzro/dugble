from pathlib import Path

import pytest
from PIL import Image, ImageDraw, ImageFilter

from app.quality import assess_image_quality


@pytest.fixture
def detailed_image(tmp_path: Path) -> Path:
    path = tmp_path / "synthetic-card.png"
    image = Image.new("L", (800, 500), 80)
    draw = ImageDraw.Draw(image)
    for x in range(0, image.width, 20):
        draw.rectangle((x, 0, x + 9, image.height), fill=180)
    image.save(path)
    return path


def test_detailed_well_exposed_image_passes(detailed_image: Path) -> None:
    result = assess_image_quality(detailed_image)

    assert result.passed
    assert result.reasons == []
    assert result.score == 1.0
    assert result.measurements.width == 800
    assert result.measurements.height == 500


def test_small_dark_flat_image_reports_each_problem(tmp_path: Path) -> None:
    path = tmp_path / "poor.png"
    Image.new("L", (320, 200), 10).save(path)

    result = assess_image_quality(path)

    assert not result.passed
    assert result.reasons == [
        "resolution_too_low",
        "image_too_dark",
        "contrast_too_low",
        "image_too_blurry",
    ]
    assert 0.0 <= result.score < 1.0


def test_blurred_image_is_rejected(detailed_image: Path, tmp_path: Path) -> None:
    path = tmp_path / "blurred.png"
    with Image.open(detailed_image) as image:
        image.filter(ImageFilter.GaussianBlur(radius=12)).save(path)

    result = assess_image_quality(path)

    assert "image_too_blurry" in result.reasons


def test_large_white_region_is_reported_as_glare(tmp_path: Path) -> None:
    path = tmp_path / "glare.png"
    image = Image.new("L", (800, 500), 80)
    ImageDraw.Draw(image).rectangle((0, 0, 399, 499), fill=255)
    image.save(path)

    result = assess_image_quality(path)

    assert "excessive_glare" in result.reasons
    assert result.measurements.glare_ratio == pytest.approx(0.5)


def test_invalid_image_has_safe_error(tmp_path: Path) -> None:
    path = tmp_path / "not-an-image.txt"
    path.write_text("private identity data must not be echoed")

    with pytest.raises(ValueError, match="image could not be decoded"):
        assess_image_quality(path)
