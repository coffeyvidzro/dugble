"""Deterministic, model-free image quality checks."""

from PIL import Image, ImageFilter, ImageStat

from app.contracts.quality import (
    DEFAULT_THRESHOLDS,
    QualityCheckResult,
    QualityMeasurements,
    QualityResult,
    QualityThresholds,
)
from app.imaging.decoding import (
    DEFAULT_MAX_INPUT_BYTES,
    DEFAULT_MAX_PIXELS,
    ImageSource,
    decode_image,
    normalize_image,
)


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def _brightness_score(brightness: float, thresholds: QualityThresholds) -> float:
    if thresholds.minimum_brightness <= brightness <= thresholds.maximum_brightness:
        return 1.0
    if brightness < thresholds.minimum_brightness:
        return _clamp(brightness / thresholds.minimum_brightness)
    return _clamp((255.0 - brightness) / (255.0 - thresholds.maximum_brightness))


def _check(
    passed: bool,
    score: float,
    measurements: dict[str, int | float],
    thresholds: dict[str, int | float],
) -> QualityCheckResult:
    return QualityCheckResult(passed, round(_clamp(score), 3), measurements, thresholds)


def _assess_normalized_image(
    image: Image.Image,
    thresholds: QualityThresholds = DEFAULT_THRESHOLDS,
) -> QualityResult:
    """Analyze an already normalized RGB image."""

    grayscale = image.convert("L")
    width, height = grayscale.size
    statistics = ImageStat.Stat(grayscale)
    brightness = float(statistics.mean[0])
    contrast = float(statistics.stddev[0])
    edges = grayscale.filter(ImageFilter.FIND_EDGES)
    if width > 2 and height > 2:
        edges = edges.crop((1, 1, width - 1, height - 1))
    sharpness = float(ImageStat.Stat(edges).var[0])
    histogram = grayscale.histogram()
    glare_pixels = sum(histogram[thresholds.glare_luminance :])
    glare_ratio = glare_pixels / (width * height)

    resolution_passed = width >= thresholds.minimum_width and height >= thresholds.minimum_height
    brightness_passed = thresholds.minimum_brightness <= brightness <= thresholds.maximum_brightness
    contrast_passed = contrast >= thresholds.minimum_contrast
    sharpness_passed = sharpness >= thresholds.minimum_sharpness
    glare_passed = glare_ratio <= thresholds.maximum_glare_ratio
    checks = {
        "resolution": _check(
            resolution_passed,
            min(width / thresholds.minimum_width, height / thresholds.minimum_height),
            {"width": width, "height": height},
            {
                "minimum_width": thresholds.minimum_width,
                "minimum_height": thresholds.minimum_height,
            },
        ),
        "brightness": _check(
            brightness_passed,
            _brightness_score(brightness, thresholds),
            {"brightness": round(brightness, 3)},
            {
                "minimum_brightness": thresholds.minimum_brightness,
                "maximum_brightness": thresholds.maximum_brightness,
            },
        ),
        "contrast": _check(
            contrast_passed,
            contrast / thresholds.minimum_contrast,
            {"contrast": round(contrast, 3)},
            {"minimum_contrast": thresholds.minimum_contrast},
        ),
        "sharpness": _check(
            sharpness_passed,
            sharpness / thresholds.minimum_sharpness,
            {"sharpness": round(sharpness, 3)},
            {"minimum_sharpness": thresholds.minimum_sharpness},
        ),
        "glare": _check(
            glare_passed,
            1.0 - glare_ratio / thresholds.maximum_glare_ratio,
            {"glare_ratio": round(glare_ratio, 6)},
            {
                "glare_luminance": thresholds.glare_luminance,
                "maximum_glare_ratio": thresholds.maximum_glare_ratio,
            },
        ),
    }
    reason_by_check = {
        "resolution": "resolution_too_low",
        "contrast": "contrast_too_low",
        "sharpness": "image_too_blurry",
        "glare": "excessive_glare",
    }
    reasons = [reason_by_check[name] for name in reason_by_check if not checks[name].passed]
    if not brightness_passed:
        reasons.insert(
            1 if not resolution_passed else 0,
            "image_too_dark" if brightness < thresholds.minimum_brightness else "image_too_bright",
        )

    measurements = QualityMeasurements(
        width=width,
        height=height,
        brightness=round(brightness, 3),
        contrast=round(contrast, 3),
        sharpness=round(sharpness, 3),
        glare_ratio=round(glare_ratio, 6),
    )
    return QualityResult(
        meets_quality_thresholds=all(check.passed for check in checks.values()),
        score=round(sum(check.score for check in checks.values()) / len(checks), 3),
        reasons=reasons,
        measurements=measurements,
        checks=checks,
    )


def assess_image(
    image: Image.Image,
    thresholds: QualityThresholds = DEFAULT_THRESHOLDS,
    *,
    max_pixels: int = DEFAULT_MAX_PIXELS,
) -> QualityResult:
    """Analyze a decoded image without performing storage or network operations."""

    normalized = normalize_image(image, max_pixels=max_pixels)
    return _assess_normalized_image(normalized, thresholds)


def assess_image_quality(
    source: ImageSource | Image.Image,
    thresholds: QualityThresholds = DEFAULT_THRESHOLDS,
    *,
    max_input_bytes: int = DEFAULT_MAX_INPUT_BYTES,
    max_pixels: int = DEFAULT_MAX_PIXELS,
) -> QualityResult:
    """Decode and assess a path, byte sequence, stream, or Pillow image."""

    if isinstance(source, Image.Image):
        return assess_image(source, thresholds, max_pixels=max_pixels)
    image = decode_image(source, max_input_bytes=max_input_bytes, max_pixels=max_pixels)
    return _assess_normalized_image(image, thresholds)
