"""Evidence contracts for face-specific biometric capture quality."""

from dataclasses import dataclass
from math import isfinite


@dataclass(frozen=True)
class BiometricQualityMeasurement:
    name: str
    score: float

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("biometric quality measurement name must not be empty")
        if not isfinite(self.score) or not 0 <= self.score <= 1:
            raise ValueError("biometric quality score must be within 0..1")


@dataclass(frozen=True)
class BiometricQualityEvidence:
    suitable_for_analysis: bool
    measurements: tuple[BiometricQualityMeasurement, ...]
    reasons: tuple[str, ...]
    analyzer_version: str

    def __post_init__(self) -> None:
        if not self.measurements:
            raise ValueError("biometric quality evidence must contain measurements")
        if not self.analyzer_version.strip():
            raise ValueError("biometric quality analyzer version must not be empty")
        names = tuple(measurement.name for measurement in self.measurements)
        if len(set(names)) != len(names):
            raise ValueError("biometric quality measurements must not contain duplicates")
        if self.suitable_for_analysis != (not self.reasons):
            raise ValueError("biometric suitability must agree with its reasons")
