"""Deterministic, model-free image quality checks."""

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageFilter, ImageStat, UnidentifiedImageError


@dataclass(frozen=True)
class QualityThresholds:
    """Thresholds used to decide whether an image is suitable for analysis."""

    minimum_width: int = 640
    minimum_height: int = 400
    minimum_brightness: float = 45.0
    maximum_brightness: float = 220.0
    minimum_contrast: float = 20.0
    minimum_sharpness: float = 100.0
    glare_luminance: int = 245
    maximum_glare_ratio: float = 0.08


@dataclass(frozen=True)
class QualityMeasurements:
    width: int
    height: int
    brightness: float
    contrast: float
    sharpness: float
    glare_ratio: float


@dataclass(frozen=True)
class QualityResult:
    passed: bool
    score: float
    reasons: list[str]
    measurements: QualityMeasurements


DEFAULT_THRESHOLDS = QualityThresholds()


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def _brightness_score(brightness: float, thresholds: QualityThresholds) -> float:
    if thresholds.minimum_brightness <= brightness <= thresholds.maximum_brightness:
        return 1.0
    if brightness < thresholds.minimum_brightness:
        return _clamp(brightness / thresholds.minimum_brightness)
    return _clamp((255.0 - brightness) / (255.0 - thresholds.maximum_brightness))


def assess_image_quality(
    image_path: str | Path,
    thresholds: QualityThresholds = DEFAULT_THRESHOLDS,
) -> QualityResult:
    """Measure resolution, exposure, contrast, blur, and glare for an image.

    The function reads a local image and performs no network or model calls. It
    raises ``ValueError`` for files that Pillow cannot decode so callers do not
    accidentally treat an invalid upload as a low-quality identity document.
    """

    try:
        with Image.open(image_path) as source:
            source.load()
            grayscale = source.convert("L")
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as error:
        raise ValueError("image could not be decoded") from error

    width, height = grayscale.size
    statistics = ImageStat.Stat(grayscale)
    brightness = float(statistics.mean[0])
    contrast = float(statistics.stddev[0])
    edges = grayscale.filter(ImageFilter.FIND_EDGES)
    # FIND_EDGES treats the outside of the image as black. Exclude that
    # artificial border so a uniformly coloured image cannot appear sharp.
    if width > 2 and height > 2:
        edges = edges.crop((1, 1, width - 1, height - 1))
    sharpness = float(ImageStat.Stat(edges).var[0])
    histogram = grayscale.histogram()
    glare_pixels = sum(histogram[thresholds.glare_luminance :])
    glare_ratio = glare_pixels / (width * height)

    reasons: list[str] = []
    if width < thresholds.minimum_width or height < thresholds.minimum_height:
        reasons.append("resolution_too_low")
    if brightness < thresholds.minimum_brightness:
        reasons.append("image_too_dark")
    elif brightness > thresholds.maximum_brightness:
        reasons.append("image_too_bright")
    if contrast < thresholds.minimum_contrast:
        reasons.append("contrast_too_low")
    if sharpness < thresholds.minimum_sharpness:
        reasons.append("image_too_blurry")
    if glare_ratio > thresholds.maximum_glare_ratio:
        reasons.append("excessive_glare")

    component_scores = (
        min(width / thresholds.minimum_width, height / thresholds.minimum_height, 1.0),
        _brightness_score(brightness, thresholds),
        _clamp(contrast / thresholds.minimum_contrast),
        _clamp(sharpness / thresholds.minimum_sharpness),
        _clamp(1.0 - glare_ratio / thresholds.maximum_glare_ratio),
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
        passed=not reasons,
        score=round(sum(component_scores) / len(component_scores), 3),
        reasons=reasons,
        measurements=measurements,
    )
