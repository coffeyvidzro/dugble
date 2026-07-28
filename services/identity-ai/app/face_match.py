"""Compatibility exports for the face comparison pipeline."""

from app.contracts.face import FaceComparisonEvidence
from app.face.service import FaceComparisonService

__all__ = ["FaceComparisonEvidence", "FaceComparisonService"]
