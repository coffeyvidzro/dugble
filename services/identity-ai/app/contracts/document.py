"""Domain contracts for organization-controlled document enrollment evidence."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import isfinite

from app.contracts.quality import QualityResult


class DocumentSide(StrEnum):
    FRONT = "front"
    BACK = "back"


@dataclass(frozen=True)
class DocumentPoint:
    x: float
    y: float

    def __post_init__(self) -> None:
        if not isfinite(self.x) or not isfinite(self.y):
            raise ValueError("document point coordinates must be finite")


@dataclass(frozen=True)
class DocumentDetection:
    corners: tuple[DocumentPoint, DocumentPoint, DocumentPoint, DocumentPoint]
    confidence: float

    def __post_init__(self) -> None:
        if len(self.corners) != 4 or len(set(self.corners)) != 4:
            raise ValueError("document detection must contain four unique corners")
        doubled_area = abs(
            sum(
                point.x * next_point.y - next_point.x * point.y
                for point, next_point in zip(
                    self.corners,
                    self.corners[1:] + self.corners[:1],
                    strict=True,
                )
            )
        )
        if doubled_area == 0:
            raise ValueError("document corners must enclose a non-zero area")
        if not isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise ValueError("document confidence must be within 0..1")


@dataclass(frozen=True)
class OCRLine:
    text: str
    confidence: float

    def __post_init__(self) -> None:
        if not self.text.strip():
            raise ValueError("OCR text must not be empty")
        if not isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise ValueError("OCR confidence must be within 0..1")


@dataclass(frozen=True)
class ExtractedField:
    name: str
    raw_value: str
    normalized_value: str
    confidence: float

    def __post_init__(self) -> None:
        if not self.name.strip() or not self.raw_value.strip() or not self.normalized_value.strip():
            raise ValueError("extracted field values must not be empty")
        if not isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise ValueError("field confidence must be within 0..1")


@dataclass(frozen=True)
class DocumentSideEvidence:
    side: DocumentSide
    quality: QualityResult
    detection_confidence: float
    fields: tuple[ExtractedField, ...]
    missing_required_fields: tuple[str, ...]
    reasons: tuple[str, ...]
    detector_version: str
    preprocessor_version: str
    ocr_model_version: str
    parser_version: str

    def __post_init__(self) -> None:
        if not isfinite(self.detection_confidence) or not 0 <= self.detection_confidence <= 1:
            raise ValueError("document confidence must be within 0..1")
        versions = (
            self.detector_version,
            self.preprocessor_version,
            self.ocr_model_version,
            self.parser_version,
        )
        if not all(version.strip() for version in versions):
            raise ValueError("document component versions must not be empty")
        field_names = tuple(field.name for field in self.fields)
        if len(set(field_names)) != len(field_names):
            raise ValueError("document fields must not contain duplicates")


@dataclass(frozen=True)
class DocumentEnrollmentEvidence:
    verification_id: str
    sides: tuple[DocumentSideEvidence, ...]

    def __post_init__(self) -> None:
        if not self.verification_id.strip():
            raise ValueError("verification ID must not be empty")
        if not self.sides:
            raise ValueError("document enrollment must contain side evidence")
        side_names = tuple(side.side for side in self.sides)
        if len(set(side_names)) != len(side_names):
            raise ValueError("document enrollment must not repeat a side")
