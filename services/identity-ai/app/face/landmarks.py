"""Landmark and head-pose boundary for the future MediaPipe adapter."""

from collections.abc import Iterable
from typing import Protocol

from PIL import Image

from app.contracts.liveness import PoseObservation


class FaceLandmarkTracker(Protocol):
    @property
    def model_version(self) -> str: ...

    def observe(self, frames: Iterable[Image.Image]) -> tuple[PoseObservation, ...]: ...
