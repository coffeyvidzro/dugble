"""Contracts for deterministic image-quality analysis."""

from dataclasses import dataclass
from math import isfinite

ANALYZER_VERSION = "quality-v1"


@dataclass(frozen=True)
class QualityThresholds:
    """Provisional thresholds used to assess suitability for analysis."""

    minimum_width: int = 640
    minimum_height: int = 400
    minimum_brightness: float = 45.0
    maximum_brightness: float = 220.0
    minimum_contrast: float = 20.0
    minimum_sharpness: float = 100.0
    glare_luminance: int = 245
    maximum_glare_ratio: float = 0.08

    def __post_init__(self) -> None:
        numeric_values = (
            self.minimum_brightness,
            self.maximum_brightness,
            self.minimum_contrast,
            self.minimum_sharpness,
            self.maximum_glare_ratio,
        )
        if self.minimum_width <= 0 or self.minimum_height <= 0:
            raise ValueError("minimum dimensions must be positive")
        if not all(isfinite(value) for value in numeric_values):
            raise ValueError("quality thresholds must be finite")
        if not 0 <= self.minimum_brightness < self.maximum_brightness <= 255:
            raise ValueError("brightness thresholds must be ordered within 0..255")
        if self.minimum_contrast <= 0 or self.minimum_sharpness <= 0:
            raise ValueError("contrast and sharpness thresholds must be positive")
        if not 0 <= self.glare_luminance <= 255:
            raise ValueError("glare luminance must be within 0..255")
        if not 0 < self.maximum_glare_ratio <= 1:
            raise ValueError("maximum glare ratio must be within 0..1")


@dataclass(frozen=True)
class QualityMeasurements:
    width: int
    height: int
    brightness: float
    contrast: float
    sharpness: float
    glare_ratio: float


@dataclass(frozen=True)
class QualityCheckResult:
    passed: bool
    score: float
    measurements: dict[str, int | float]
    thresholds: dict[str, int | float]


@dataclass(frozen=True)
class QualityResult:
    meets_quality_thresholds: bool
    score: float
    reasons: list[str]
    measurements: QualityMeasurements
    checks: dict[str, QualityCheckResult]
    analyzer_version: str = ANALYZER_VERSION

    @property
    def passed(self) -> bool:
        """Compatibility alias; this is not an identity approval decision."""

        return self.meets_quality_thresholds


DEFAULT_THRESHOLDS = QualityThresholds()
