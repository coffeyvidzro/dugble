"""Domain contracts for one-to-one facial comparison evidence."""

from __future__ import annotations

from dataclasses import dataclass
from math import isfinite


@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def __post_init__(self) -> None:
        if not isfinite(self.x) or not isfinite(self.y):
            raise ValueError("point coordinates must be finite")


@dataclass(frozen=True)
class BoundingBox:
    x: float
    y: float
    width: float
    height: float

    def __post_init__(self) -> None:
        if not all(isfinite(value) for value in (self.x, self.y, self.width, self.height)):
            raise ValueError("bounding box values must be finite")
        if self.width <= 0 or self.height <= 0:
            raise ValueError("bounding box dimensions must be positive")


@dataclass(frozen=True)
class FaceDetection:
    bounding_box: BoundingBox
    confidence: float
    landmarks: tuple[Point, ...]

    def __post_init__(self) -> None:
        if not isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise ValueError("face confidence must be within 0..1")


@dataclass(frozen=True)
class FaceEmbedding:
    values: tuple[float, ...]
    model_version: str

    def __post_init__(self) -> None:
        if not self.values:
            raise ValueError("face embedding must not be empty")
        if not all(isfinite(value) for value in self.values):
            raise ValueError("face embedding values must be finite")
        if not self.model_version.strip():
            raise ValueError("face embedding model version must not be empty")


@dataclass(frozen=True)
class FaceComparisonEvidence:
    similarity: float
    detector_version: str
    embedding_model_version: str

    def __post_init__(self) -> None:
        if not isfinite(self.similarity) or not -1 <= self.similarity <= 1:
            raise ValueError("face similarity must be within -1..1")
        if not self.detector_version.strip() or not self.embedding_model_version.strip():
            raise ValueError("face model versions must not be empty")
