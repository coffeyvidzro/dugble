from io import BytesIO
from pathlib import Path

import pytest
from PIL import Image, ImageDraw, ImageFilter

from app.imaging import ImageDecodeError, ImageSizeError, decode_image
from app.quality import (
    ANALYZER_VERSION,
    QualityThresholds,
    assess_image,
    assess_image_quality,
)


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
    assert result.meets_quality_thresholds
    assert result.reasons == []
    assert result.score == 1.0
    assert result.analyzer_version == ANALYZER_VERSION
    assert result.measurements.width == 800
    assert result.measurements.height == 500
    assert set(result.checks) == {
        "resolution",
        "brightness",
        "contrast",
        "sharpness",
        "glare",
    }
    assert all(check.passed for check in result.checks.values())


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
    assert not result.checks["resolution"].passed
    assert result.checks["resolution"].measurements == {"width": 320, "height": 200}


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

    with pytest.raises(ImageDecodeError, match="image could not be decoded"):
        assess_image_quality(path)


def test_bytes_stream_and_decoded_image_have_same_result(detailed_image: Path) -> None:
    data = detailed_image.read_bytes()

    from_bytes = assess_image_quality(data)
    from_stream = assess_image_quality(BytesIO(data))
    with Image.open(BytesIO(data)) as image:
        from_image = assess_image(image)

    assert from_bytes == from_stream == from_image


def test_rgba_image_is_normalized_before_analysis() -> None:
    image = Image.new("RGBA", (800, 500), (100, 120, 140, 128))

    result = assess_image(image)

    assert result.measurements.width == 800
    assert result.checks["brightness"].passed


def test_exif_orientation_is_applied() -> None:
    image = Image.new("RGB", (20, 10), "navy")
    exif = Image.Exif()
    exif[274] = 6
    encoded = BytesIO()
    image.save(encoded, format="JPEG", exif=exif)

    decoded = decode_image(encoded.getvalue())

    assert decoded.size == (10, 20)


def test_encoded_byte_limit_is_enforced(detailed_image: Path) -> None:
    data = detailed_image.read_bytes()

    with pytest.raises(ImageSizeError, match="encoded image exceeds the size limit"):
        assess_image_quality(data, max_input_bytes=len(data) - 1)


def test_decoded_pixel_limit_is_enforced() -> None:
    image = Image.new("RGB", (11, 10), "black")

    with pytest.raises(ImageSizeError, match="decoded image exceeds the pixel limit"):
        assess_image(image, max_pixels=100)


def test_empty_and_truncated_inputs_have_safe_errors() -> None:
    with pytest.raises(ImageDecodeError, match="image is empty"):
        assess_image_quality(b"")
    with pytest.raises(ImageDecodeError, match="image could not be decoded"):
        assess_image_quality(b"\x89PNG\r\n\x1a\n")


@pytest.mark.parametrize(
    "brightness, expected",
    [(44, False), (45, True), (220, True), (221, False)],
)
def test_brightness_threshold_boundaries(brightness: int, expected: bool) -> None:
    image = Image.new("L", (640, 400), brightness)

    result = assess_image(image)

    assert result.checks["brightness"].passed is expected


@pytest.mark.parametrize(
    "overrides, message",
    [
        ({"minimum_width": 0}, "minimum dimensions must be positive"),
        (
            {"minimum_brightness": 220, "maximum_brightness": 45},
            "brightness thresholds must be ordered within 0..255",
        ),
        ({"minimum_contrast": 0}, "contrast and sharpness thresholds must be positive"),
        ({"glare_luminance": 256}, "glare luminance must be within 0..255"),
        ({"maximum_glare_ratio": 0}, "maximum glare ratio must be within 0..1"),
        ({"minimum_sharpness": float("nan")}, "quality thresholds must be finite"),
    ],
)
def test_invalid_thresholds_are_rejected(
    overrides: dict[str, float], message: str
) -> None:
    with pytest.raises(ValueError, match=message):
        QualityThresholds(**overrides)
