"""Landmark and head-pose pipeline boundary."""

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol, runtime_checkable

from PIL import Image

from app.contracts.liveness import PoseObservation


@dataclass(frozen=True)
class CapturedFrame:
    image: Image.Image
    captured_at: datetime

    def __post_init__(self) -> None:
        if not isinstance(self.image, Image.Image):
            raise TypeError("capture image must be a Pillow image")
        if self.captured_at.tzinfo is None or self.captured_at.utcoffset() is None:
            raise ValueError("capture timestamp must be timezone-aware")


@runtime_checkable
class FaceLandmarkTracker(Protocol):
    @property
    def model_version(self) -> str: ...

    def observe(self, frames: Iterable[CapturedFrame]) -> tuple[PoseObservation, ...]: ...
