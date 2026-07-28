"""Presentation-attack detector boundary for reviewed model adapters."""

from collections.abc import Sequence
from typing import Protocol

from PIL import Image

from app.contracts.presentation_attack import PresentationAttackEvidence


class PresentationAttackDetector(Protocol):
    @property
    def model_version(self) -> str: ...

    def analyze(self, frames: Sequence[Image.Image]) -> PresentationAttackEvidence: ...
