"""One-to-one facial comparison pipeline."""

from .landmarks import CapturedFrame
from .service import FaceComparisonService

__all__ = ["CapturedFrame", "FaceComparisonService"]
